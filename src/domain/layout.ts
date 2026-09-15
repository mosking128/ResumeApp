import type { ResumeDocument, ResumePage, Section, SectionType } from './types';

export function findSection(doc: ResumeDocument, sectionId: string): Section | null {
  return doc.sections.find((s) => s.id === sectionId) ?? null;
}

export function findSectionLocation(
  pages: ResumePage[],
  sectionId: string,
): { pageId: string; columnId: string; index: number } | null {
  for (const page of pages) {
    for (const col of page.columns) {
      const index = col.sectionIds.indexOf(sectionId);
      if (index >= 0) return { pageId: page.id, columnId: col.id, index };
    }
  }
  return null;
}

export function hasSectionType(doc: ResumeDocument, type: SectionType): boolean {
  return doc.sections.some((s) => s.type === type);
}

export function insertSectionId(
  pages: ResumePage[],
  pageId: string,
  columnId: string,
  sectionId: string,
  index?: number,
): ResumePage[] {
  return pages.map((page) => {
    if (page.id !== pageId) return page;
    return {
      ...page,
      columns: page.columns.map((col) => {
        if (col.id !== columnId) return col;
        const ids = col.sectionIds.filter((id) => id !== sectionId);
        const at = index == null ? ids.length : Math.max(0, Math.min(index, ids.length));
        ids.splice(at, 0, sectionId);
        return { ...col, sectionIds: ids };
      }),
    };
  });
}

export function removeSectionId(pages: ResumePage[], sectionId: string): ResumePage[] {
  return pages.map((page) => ({
    ...page,
    columns: page.columns.map((col) => ({
      ...col,
      sectionIds: col.sectionIds.filter((id) => id !== sectionId),
    })),
  }));
}

export function moveSectionInColumn(
  pages: ResumePage[],
  columnId: string,
  sectionId: string,
  toIndex: number,
): ResumePage[] {
  return pages.map((page) => ({
    ...page,
    columns: page.columns.map((col) => {
      if (col.id !== columnId) return col;
      const ids = [...col.sectionIds];
      const from = ids.indexOf(sectionId);
      if (from < 0) return col;
      ids.splice(from, 1);
      const at = Math.max(0, Math.min(toIndex, ids.length));
      ids.splice(at, 0, sectionId);
      return { ...col, sectionIds: ids };
    }),
  }));
}

export function getPrimaryColumnId(pages: ResumePage[]): string | null {
  return pages[0]?.columns[0]?.id ?? null;
}

export function getAllowedAddTypes(doc: ResumeDocument): SectionType[] {
  const all: SectionType[] = ['basic', 'education', 'work', 'project', 'skills', 'summary', 'custom'];
  return all.filter((t) => {
    if (!doc.sections.some((s) => s.type === t)) return true;
    if (t === 'custom') return true;
    return false;
  });
}
