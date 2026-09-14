/** A4 物理尺寸（CSS px，96dpi）；打印时用 mm 以避免多出一页 */
export const A4 = {
  width: 794,
  height: 1122,
} as const;

export const MAX_PAGES = 3;
export const MIN_PAGES = 1;

export type LayoutMode = 'single' | 'sidebar' | 'two-column';

export type SectionType =
  | 'basic'
  | 'objective'
  | 'summary'
  | 'education'
  | 'work'
  | 'project'
  | 'skills'
  | 'custom';

export interface LayoutColumn {
  id: string;
  widthRatio: number;
  sectionIds: string[];
}

export interface ResumePage {
  id: string;
  columns: LayoutColumn[];
}

export interface PageOverflowState {
  overflowingPageId: string | null;
  overflowPx: number;
  inputLocked: boolean;
  pendingAddPageAfterId: string | null;
}

export interface TemplateTokens {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  rule: string;
  headingFont: string;
  bodyFont: string;
  scale: number;
}

export interface ContentBox {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface TemplateSpec {
  id: string;
  name: string;
  description: string;
  layoutMode: LayoutMode;
  tokens: TemplateTokens;
  contentBox: ContentBox;
}

export const TEMPLATES: TemplateSpec[] = [
  {
    id: 'classic-single',
    name: '经典单栏',
    description: '衬线标题、规整分隔线，传统稳妥',
    layoutMode: 'single',
    tokens: {
      bg: '#ffffff',
      ink: '#1c1917',
      muted: '#57534e',
      accent: '#0f766e',
      rule: '#d6d3d1',
      headingFont: '"Songti SC", "SimSun", "Times New Roman", serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 1,
    },
    contentBox: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingLeft: 56,
      paddingRight: 56,
    },
  },
  {
    id: 'modern-sidebar',
    name: '现代侧栏',
    description: '左侧信息栏，主栏内容区',
    layoutMode: 'sidebar',
    tokens: {
      bg: '#ffffff',
      ink: '#1c1917',
      muted: '#57534e',
      accent: '#0f766e',
      rule: '#e7e5e4',
      headingFont: '"Segoe UI", "PingFang SC", sans-serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 1,
    },
    contentBox: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 40,
      paddingRight: 40,
    },
  },
  {
    id: 'compact-grid',
    name: '紧凑双栏',
    description: '高密度、细线，适合内容多的简历',
    layoutMode: 'two-column',
    tokens: {
      bg: '#ffffff',
      ink: '#292524',
      muted: '#78716c',
      accent: '#0f766e',
      rule: '#d6d3d1',
      headingFont: '"Segoe UI", "PingFang SC", sans-serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 0.95,
    },
    contentBox: {
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 36,
      paddingRight: 36,
    },
  },
];

export function createId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlankPage(templateId: string): ResumePage {
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]!;
  const ratios: number[] =
    template.layoutMode === 'single' ? [1] : template.layoutMode === 'sidebar' ? [0.68, 0.32] : [0.55, 0.45];

  return {
    id: createId(),
    columns: ratios.map((ratio) => ({
      id: createId(),
      widthRatio: ratio,
      sectionIds: [],
    })),
  };
}

export function createBlankDocument(templateId = 'classic-single') {
  const now = Date.now();
  return {
    id: createId(),
    archiveId: 'demo',
    schemaVersion: 2,
    templateId,
    pages: [createBlankPage(templateId)],
    createdAt: now,
    updatedAt: now,
  };
}
