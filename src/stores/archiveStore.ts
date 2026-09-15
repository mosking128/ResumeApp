import { create } from 'zustand';
import {
  createBlankDocument,
  createBlankPage,
  createDefaultSection,
  createId,
  isSingletonSection,
  type ArchiveMeta,
  type ResumeDocument,
  type SectionType,
} from '@/domain/types';
import {
  findSectionLocation,
  getAllowedAddTypes,
  hasSectionType,
  moveSectionInColumn,
  removeSectionId,
} from '@/domain/layout';
import * as db from '@/storage/db';

function deepClone<T>(v: T): T {
  return structuredClone(v);
}

let hydrating = false;

interface ArchiveState {
  hydrated: boolean;
  error: string | null;
  list: ArchiveMeta[];
  currentId: string | null;
  doc: ResumeDocument | null;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  scale: number;
  selectedSectionId: string | null;

  hydrate: () => Promise<void>;
  createArchive: (name?: string) => Promise<void>;
  setCurrent: (id: string) => Promise<void>;
  renameArchive: (id: string, name: string) => Promise<void>;
  duplicateArchive: (id: string) => Promise<void>;
  removeArchive: (id: string) => Promise<void>;
  saveNow: () => Promise<void>;
  markDirty: () => void;
  updateDoc: (updater: (doc: ResumeDocument) => ResumeDocument) => void;
  setTemplateId: (templateId: string) => void;
  setScale: (scale: number) => void;
  addPage: () => void;
  removePage: (pageId: string) => void;
  getSavePayload: () => ResumeDocument | null;

  selectSection: (id: string | null) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  patchSectionPayload: (sectionId: string, payload: unknown) => void;
  moveSection: (sectionId: string, direction: -1 | 1) => void;
}

async function listAndPick(
  preferId?: string,
): Promise<{ list: ArchiveMeta[]; currentId: string | null }> {
  const list = await db.listArchives();
  if (list.length === 0) return { list, currentId: null };
  const found = preferId ? list.find((a) => a.id === preferId) : undefined;
  return { list, currentId: (found ?? list[0])!.id };
}

async function persistArchive(
  name: string,
  templateId = 'steady-classic',
): Promise<{ list: ArchiveMeta[]; currentId: string; doc: ResumeDocument }> {
  const archiveId = createId();
  const doc = createBlankDocument(archiveId, templateId);
  const meta: ArchiveMeta = {
    id: archiveId,
    name,
    documentId: doc.id,
    templateId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  await db.putDocument(doc);
  await db.putArchive(meta);
  const list = await db.listArchives();
  return { list, currentId: archiveId, doc };
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  hydrated: false,
  error: null,
  list: [],
  currentId: null,
  doc: null,
  dirty: false,
  saving: false,
  lastSavedAt: null,
  scale: 1,
  selectedSectionId: null,

  hydrate: async () => {
    if (get().hydrated || hydrating) return;
    hydrating = true;
    try {
      await db.initDefaultSettings();
      const { list, currentId } = await listAndPick();
      if (currentId) {
        const meta = list.find((a) => a.id === currentId)!;
        const doc = await db.getDocument(meta.documentId);
        if (!doc) throw new Error('档案文档缺失');
        set({ hydrated: true, list, currentId, doc, dirty: false, error: null });
        return;
      }
      const created = await persistArchive('未命名简历');
      set({
        hydrated: true,
        list: created.list,
        currentId: created.currentId,
        doc: created.doc,
        dirty: false,
        lastSavedAt: Date.now(),
        error: null,
      });
    } catch (e) {
      set({
        hydrated: true,
        error: e instanceof Error ? e.message : '无法打开本地数据库',
      });
    } finally {
      hydrating = false;
    }
  },

  createArchive: async (name) => {
    try {
      if (get().dirty) await get().saveNow();
      const label = name?.trim() || `简历 ${get().list.length + 1}`;
      const created = await persistArchive(label);
      set({
        list: created.list,
        currentId: created.currentId,
        doc: created.doc,
        dirty: false,
        lastSavedAt: Date.now(),
        error: null,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '创建失败' });
    }
  },

  setCurrent: async (id) => {
    if (get().currentId === id) return;
    if (get().dirty) await get().saveNow();
    const meta = get().list.find((a) => a.id === id);
    if (!meta) return;
    const doc = await db.getDocument(meta.documentId);
    set({
      currentId: id,
      doc,
      dirty: false,
      selectedSectionId: null,
      error: doc ? null : '档案文档缺失',
    });
  },

  renameArchive: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const meta = get().list.find((a) => a.id === id);
    if (!meta) return;
    const now = Date.now();
    const nextMeta: ArchiveMeta = { ...meta, name: trimmed, updatedAt: now };
    await db.putArchive(nextMeta);
    const list = await db.listArchives();
    if (get().currentId === id && get().doc) {
      const doc = { ...get().doc!, updatedAt: now };
      await db.putDocument(doc);
      set({ list, doc, dirty: false });
    } else {
      set({ list });
    }
  },

  duplicateArchive: async (id) => {
    const meta = get().list.find((a) => a.id === id);
    if (!meta) return;
    const src = await db.getDocument(meta.documentId);
    if (!src) return;
    const archiveId = createId();
    const now = Date.now();
    const doc: ResumeDocument = {
      ...deepClone(src),
      id: createId(),
      archiveId,
      createdAt: now,
      updatedAt: now,
    };
    const nextMeta: ArchiveMeta = {
      id: archiveId,
      name: `${meta.name} - 副本`,
      documentId: doc.id,
      templateId: doc.templateId,
      createdAt: now,
      updatedAt: now,
    };
    await db.putDocument(doc);
    await db.putArchive(nextMeta);
    const list = await db.listArchives();
    set({ list, currentId: archiveId, doc, dirty: false, lastSavedAt: now });
  },

  removeArchive: async (id) => {
    await db.deleteArchive(id);
    const { list, currentId } = await listAndPick();
    if (!currentId) {
      const created = await persistArchive('未命名简历');
      set({
        list: created.list,
        currentId: created.currentId,
        doc: created.doc,
        dirty: false,
      });
      return;
    }
    const meta = list.find((a) => a.id === currentId)!;
    const doc = await db.getDocument(meta.documentId);
    set({ list, currentId, doc, dirty: false });
  },

  saveNow: async () => {
    const { doc, currentId, list } = get();
    if (!doc || !currentId) return;
    set({ saving: true });
    try {
      const saved: ResumeDocument = { ...doc, updatedAt: Date.now() };
      await db.putDocument(saved);
      const meta = list.find((a) => a.id === currentId);
      if (meta) {
        await db.putArchive({
          ...meta,
          templateId: saved.templateId,
          updatedAt: saved.updatedAt,
        });
      }
      const nextList = await db.listArchives();
      set({
        doc: saved,
        dirty: false,
        saving: false,
        lastSavedAt: Date.now(),
        list: nextList,
        error: null,
      });
    } catch (e) {
      set({
        saving: false,
        error: e instanceof Error ? e.message : '保存失败',
      });
    }
  },

  markDirty: () => set({ dirty: true }),

  updateDoc: (updater) => {
    const { doc } = get();
    if (!doc) return;
    const next = { ...updater(doc), updatedAt: Date.now() };
    set({ doc: next, dirty: true });
  },

  setTemplateId: (templateId) => {
    get().updateDoc((doc) => ({
      ...doc,
      templateId,
      // 新模板均为单栏，合并所有 section 到第一页第一列
      pages: doc.pages.map((page, pageIndex) => {
        if (pageIndex > 0) return page;
        const allIds = doc.pages.flatMap((p) => p.columns.flatMap((c) => c.sectionIds));
        return {
          ...page,
          columns: [{ ...page.columns[0]!, widthRatio: 1, sectionIds: allIds }],
        };
      }).slice(0, 1),
    }));
  },

  setScale: (scale) => set({ scale }),

  addPage: () => {
    get().updateDoc((d) => ({
      ...d,
      pages: [...d.pages, createBlankPage(d.templateId)],
    }));
  },

  removePage: (pageId) => {
    const { doc } = get();
    if (!doc || doc.pages.length <= 1) return;
    get().updateDoc((d) => ({
      ...d,
      pages: d.pages.filter((p) => p.id !== pageId),
    }));
  },

  getSavePayload: () => get().doc,

  selectSection: (id) => set({ selectedSectionId: id }),

  addSection: (type) => {
    const { doc } = get();
    if (!doc) return;
    if (isSingletonSection(type) && hasSectionType(doc, type)) return;
    const section = createDefaultSection(type);
    const page = doc.pages[0]!;
    const columnId = page.columns[0]!.id;
    get().updateDoc((d) => ({
      ...d,
      sections: [...d.sections, section],
      pages: insertIntoPages(d.pages, page.id, columnId, section.id),
    }));
    set({ selectedSectionId: section.id });
  },

  removeSection: (sectionId) => {
    const { doc } = get();
    if (!doc) return;
    get().updateDoc((d) => ({
      ...d,
      sections: d.sections.filter((s) => s.id !== sectionId),
      pages: removeSectionId(d.pages, sectionId),
    }));
    if (get().selectedSectionId === sectionId) set({ selectedSectionId: null });
  },

  updateSectionTitle: (sectionId, title) => {
    get().updateDoc((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    }));
  },

  patchSectionPayload: (sectionId, payload) => {
    get().updateDoc((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sectionId ? ({ ...s, payload } as typeof s) : s,
      ),
    }));
  },

  moveSection: (sectionId, direction) => {
    const { doc } = get();
    if (!doc) return;
    const loc = findSectionLocation(doc.pages, sectionId);
    if (!loc) return;
    const nextIndex = loc.index + direction;
    if (nextIndex < 0) return;
    get().updateDoc((d) => ({
      ...d,
      pages: moveSectionInColumn(d.pages, loc.columnId, sectionId, nextIndex),
    }));
  },
}));

function insertIntoPages(
  pages: ResumeDocument['pages'],
  pageId: string,
  columnId: string,
  sectionId: string,
): ResumeDocument['pages'] {
  return pages.map((page) => {
    if (page.id !== pageId) return page;
    return {
      ...page,
      columns: page.columns.map((col) =>
        col.id === columnId
          ? { ...col, sectionIds: [...col.sectionIds, sectionId] }
          : col,
      ),
    };
  });
}

export function getAddableTypes(doc: ResumeDocument): SectionType[] {
  return getAllowedAddTypes(doc);
}

