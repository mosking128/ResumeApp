import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  createId,
  type AppSettings,
  type ArchiveMeta,
  type ResumeDocument,
} from '@/domain/types';

export interface StoredBlob {
  id: string;
  mime: string;
  bytes: Blob;
}

interface ResumeDB extends DBSchema {
  archives: {
    key: string;
    value: ArchiveMeta;
    indexes: { 'by-updatedAt': number };
  };
  documents: {
    key: string;
    value: ResumeDocument;
    indexes: { 'by-archiveId': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  blobs: {
    key: string;
    value: StoredBlob;
  };
}

const DB_NAME = 'resume-app';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ResumeDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ResumeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ResumeDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('archives')) {
          const store = db.createObjectStore('archives', { keyPath: 'id' });
          store.createIndex('by-updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('by-archiveId', 'archiveId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('blobs') && oldVersion < 2) {
          db.createObjectStore('blobs', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function listArchives(): Promise<ArchiveMeta[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('archives', 'by-updatedAt');
  return all.reverse();
}

export async function getArchive(id: string): Promise<ArchiveMeta | null> {
  const db = await getDb();
  return (await db.get('archives', id)) ?? null;
}

export async function putArchive(meta: ArchiveMeta): Promise<void> {
  const db = await getDb();
  await db.put('archives', meta);
}

export async function deleteArchive(id: string): Promise<void> {
  const db = await getDb();
  const meta = await db.get('archives', id);
  if (meta) {
    await db.delete('documents', meta.documentId);
  }
  await db.delete('archives', id);
}

export async function getDocument(id: string): Promise<ResumeDocument | null> {
  const db = await getDb();
  const doc = await db.get('documents', id);
  if (!doc) return null;
  return migrateDocument(doc);
}

export async function putDocument(doc: ResumeDocument): Promise<void> {
  const db = await getDb();
  await db.put('documents', doc);
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const s = await db.get('settings', 'app');
  return s ?? { ...DEFAULT_SETTINGS };
}

export async function putSettings(s: AppSettings): Promise<void> {
  const db = await getDb();
  await db.put('settings', s, 'app');
}

export async function putBlob(blob: StoredBlob): Promise<void> {
  const db = await getDb();
  await db.put('blobs', blob);
}

export async function getBlob(id: string): Promise<StoredBlob | null> {
  const db = await getDb();
  return (await db.get('blobs', id)) ?? null;
}

export async function deleteBlob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('blobs', id);
}

export async function deleteArchiveCascade(id: string): Promise<void> {
  const meta = await getArchive(id);
  if (!meta) {
    const db = await getDb();
    await db.delete('archives', id);
    return;
  }
  const doc = await getDocument(meta.documentId);
  if (doc?.photoBlobId) {
    await deleteBlob(doc.photoBlobId);
  }
  const db = await getDb();
  await db.delete('documents', meta.documentId);
  await db.delete('archives', id);
}

export function migrateDocument(raw: ResumeDocument): ResumeDocument {
  const next = {
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    sections: raw.sections ?? [],
  } as ResumeDocument;
  if (!Array.isArray(next.pages) || next.pages.length === 0) {
    next.pages = [
      {
        id: createId(),
        columns: [{ id: createId(), widthRatio: 1, sectionIds: [] }],
      },
    ];
  }
  next.sections = next.sections.map((s) => migrateSection(s));
  const merged = mergeObjectiveIntoBasic(next);
  next.sections = merged.sections;
  next.pages = next.pages.map((page) => ({
    ...page,
    columns: page.columns.map((col) => ({
      ...col,
      sectionIds: col.sectionIds.filter((sid) =>
        next.sections.some((s) => s.id === sid),
      ),
    })),
  }));
  return next;
}

function mergeObjectiveIntoBasic(doc: ResumeDocument): ResumeDocument {
  const objective = doc.sections.find((s) => s.type === 'objective');
  if (!objective) return doc;
  const basic = doc.sections.find((s) => s.type === 'basic');
  const text = (objective.payload as { text?: string }).text ?? '';
  const sections = doc.sections.filter((s) => s.type !== 'objective');
  if (basic) {
    return {
      ...doc,
      sections: sections.map((s) =>
        s.id === basic.id
          ? {
              ...s,
              payload: {
                ...(s.payload as { name: string; intent: string; fields: { id: string; label: string; value: string }[] }),
                intent:
                  (s.payload as { intent?: string }).intent || text,
              },
            }
          : s,
      ),
    };
  }
  return { ...doc, sections };
}

function migrateSection(section: ResumeDocument['sections'][number]): ResumeDocument['sections'][number] {
  const s = section as unknown as { type: string; payload: unknown };
  if (s.type === 'basic' && s.payload && typeof s.payload === 'object' && !Array.isArray(s.payload)) {
    const p = s.payload as Record<string, unknown>;
    if (typeof p.intent !== 'string') {
      p.intent = '';
    }
    if (!Array.isArray(p.fields)) {
      const fields = [
        { id: createId(), label: '电话', value: String(p.phone ?? '') },
        { id: createId(), label: '邮箱', value: String(p.email ?? '') },
        { id: createId(), label: '城市', value: String(p.location ?? '') },
      ];
      if (p.website) {
        fields.push({ id: createId(), label: '网站', value: String(p.website) });
      }
      if (Array.isArray(p.extras)) {
        for (const e of p.extras as { label: string; value: string }[]) {
          fields.push({ id: createId(), label: e.label ?? '', value: e.value ?? '' });
        }
      }
      p.fields = fields;
      delete p.phone;
      delete p.email;
      delete p.location;
      delete p.website;
      delete p.extras;
    }
  }
  if (s.type === 'education' && Array.isArray(s.payload)) {
    s.payload = (s.payload as Record<string, unknown>[]).map((it) => {
      if (!Array.isArray(it.blocks)) {
        const blocks = [];
        if (it.description) {
          blocks.push({ id: createId(), label: '主修课程', body: String(it.description) });
        }
        if (blocks.length === 0) {
          blocks.push(
            { id: createId(), label: '主修课程', body: '' },
            { id: createId(), label: '奖项证书', body: '' },
          );
        }
        it.blocks = blocks;
        delete it.description;
      }
      return it;
    });
  }
  if (s.type === 'work' && Array.isArray(s.payload)) {
    s.payload = (s.payload as Record<string, unknown>[]).map((it) => {
      if (!Array.isArray(it.blocks)) {
        const highlights = Array.isArray(it.highlights) ? (it.highlights as string[]) : [];
        const body = highlights.filter(Boolean).join('\n');
        it.blocks = [
          { id: createId(), label: '工作职责', body },
          { id: createId(), label: '工作成果', body: '' },
        ];
        delete it.highlights;
      }
      return it;
    });
  }
  if (s.type === 'project' && Array.isArray(s.payload)) {
    s.payload = (s.payload as Record<string, unknown>[]).map((it) => {
      if (!Array.isArray(it.blocks)) {
        const highlights = Array.isArray(it.highlights) ? (it.highlights as string[]) : [];
        const body = highlights.filter(Boolean).join('\n');
        it.blocks = [
          { id: createId(), label: '项目内容', body },
          { id: createId(), label: '项目职责', body: '' },
          { id: createId(), label: '项目成果', body: '' },
        ];
        delete it.highlights;
      }
      return it;
    });
  }
  return section as ResumeDocument['sections'][number];
}

export async function initDefaultSettings(): Promise<AppSettings> {
  const db = await getDb();
  const existing = await db.get('settings', 'app');
  if (existing) return existing;
  const next = { ...DEFAULT_SETTINGS };
  await db.put('settings', next, 'app');
  return next;
}
