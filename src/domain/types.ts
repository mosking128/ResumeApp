/** A4 物理尺寸（CSS px，96dpi）；打印时用 mm 以避免多出一页 */
export const A4 = {
  width: 794,
  height: 1122,
} as const;

export const MAX_PAGES = 3;
export const MIN_PAGES = 1;
export const SCHEMA_VERSION = 5;

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

export type MonthYear = { year: number; month: number };

export type DateRange = {
  start: MonthYear | null;
  end: MonthYear | null;
  isPresent?: boolean;
};

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

export interface BasicField {
  id: string;
  label: string;
  value: string;
}

export interface BasicInfo {
  /** 大标题姓名 */
  name: string;
  /** 求职意向（并入个人信息，不再单独成块） */
  intent: string;
  /** 联系方式等可增删字段 */
  fields: BasicField[];
}

export function createBasicField(label: string, value = ''): BasicField {
  return { id: createId(), label, value };
}

export function defaultBasicFields(): BasicField[] {
  return [
    createBasicField('电话', ''),
    createBasicField('邮箱', ''),
    createBasicField('城市', ''),
  ];
}

export interface ObjectivePayload {
  text: string;
}

export interface SummaryPayload {
  text: string;
}

export interface ContentBlock {
  id: string;
  /** 粗体前缀标题，如 项目内容 / 工作职责 / 主修课程 */
  label: string;
  body: string;
}

export function createContentBlock(label: string, body = ''): ContentBlock {
  return { id: createId(), label, body };
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  /** 如 3.8/4.0、专业前 5% */
  gpaRank?: string;
  date: DateRange;
  /** 默认：主修课程、奖项证书 */
  blocks: ContentBlock[];
}

export interface WorkItem {
  id: string;
  company: string;
  title: string;
  date: DateRange;
  /** 默认：工作职责、工作成果 */
  blocks: ContentBlock[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  date: DateRange;
  link?: string;
  /** 默认：项目内容、项目职责、项目成果 */
  blocks: ContentBlock[];
}

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
}

export interface CustomItem {
  id: string;
  title: string;
  body: string;
}

export type SectionPayloadMap = {
  basic: BasicInfo;
  objective: ObjectivePayload;
  summary: SummaryPayload;
  education: EducationItem[];
  work: WorkItem[];
  project: ProjectItem[];
  skills: SkillItem[];
  custom: CustomItem[];
};

export interface Section<T extends SectionType = SectionType> {
  id: string;
  type: T;
  title: string;
  payload: SectionPayloadMap[T];
}

export interface ResumeDocument {
  id: string;
  archiveId: string;
  schemaVersion: number;
  templateId: string;
  photoBlobId?: string;
  photoMeta?: {
    zoom: number;
    crop: { x: number; y: number };
    aspect: 1 | 0.75;
  };
  sections: Section[];
  pages: ResumePage[];
  createdAt: number;
  updatedAt: number;
}

export interface ArchiveMeta {
  id: string;
  name: string;
  documentId: string;
  templateId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  autosaveIntervalMs: number | null;
  defaultTemplateId: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autosaveIntervalMs: 30_000,
  defaultTemplateId: 'steady-classic',
};

export const TEMPLATES: TemplateSpec[] = [
  {
    id: 'steady-classic',
    name: '稳重单页',
    description: '藏青切角标题条，规整三栏信息行，稳妥商务',
    layoutMode: 'single',
    tokens: {
      bg: '#ffffff',
      ink: '#1f2a37',
      muted: '#5c6778',
      accent: '#4a5d7a',
      rule: '#c5cdd8',
      headingFont: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 1,
    },
    contentBox: {
      paddingTop: 40,
      paddingBottom: 48,
      paddingLeft: 48,
      paddingRight: 48,
    },
  },
  {
    id: 'clean-navy',
    name: '简约横幅',
    description: '深蓝横幅页头 + 斜切模块标签，信息密度高',
    layoutMode: 'single',
    tokens: {
      bg: '#ffffff',
      ink: '#1a2332',
      muted: '#5a6575',
      accent: '#1f3a5f',
      rule: '#e2e6eb',
      headingFont: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 1,
    },
    contentBox: {
      paddingTop: 0,
      paddingBottom: 36,
      paddingLeft: 44,
      paddingRight: 44,
    },
  },
  {
    id: 'minimal-black',
    name: '极简黑白',
    description: '无色块、细分割线与星号列表，高级克制',
    layoutMode: 'single',
    tokens: {
      bg: '#ffffff',
      ink: '#111111',
      muted: '#6b7280',
      accent: '#111111',
      rule: '#d1d5db',
      headingFont: '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
      bodyFont: '"PingFang SC", "Microsoft YaHei", sans-serif',
      scale: 1,
    },
    contentBox: {
      paddingTop: 44,
      paddingBottom: 44,
      paddingLeft: 52,
      paddingRight: 52,
    },
  },
];

/** 旧模板 ID 兼容映射 */
export function resolveTemplateId(id: string): string {
  if (id === 'classic-single' || id === 'steady-classic') return 'steady-classic';
  if (id === 'modern-sidebar' || id === 'clean-navy') return 'clean-navy';
  if (id === 'compact-grid' || id === 'minimal-black') return 'minimal-black';
  return TEMPLATES[0]!.id;
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlankPage(templateId: string): ResumePage {
  void templateId;
  return {
    id: createId(),
    columns: [
      {
        id: createId(),
        widthRatio: 1,
        sectionIds: [],
      },
    ],
  };
}

export function formatArchiveTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMonthYear(m: MonthYear | null): string {
  if (!m) return '';
  return `${m.year}.${String(m.month).padStart(2, '0')}`;
}

export function formatDateRange(r: DateRange): string {
  const start = formatMonthYear(r.start);
  const end = r.isPresent ? '至今' : formatMonthYear(r.end);
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export function emptyDateRange(): DateRange {
  return { start: null, end: null, isPresent: false };
}

export function createDefaultSection(type: SectionType): Section {
  const id = createId();
  switch (type) {
    case 'basic':
      return {
        id,
        type,
        title: '个人信息',
        payload: { name: '', intent: '', fields: defaultBasicFields() },
      };
    case 'objective':
      return { id, type, title: '求职意向', payload: { text: '' } };
    case 'summary':
      return { id, type, title: '自我评价', payload: { text: '' } };
    case 'education':
      return {
        id,
        type,
        title: '教育经历',
        payload: [
          {
            id: createId(),
            school: '',
            major: '',
            degree: '',
            gpaRank: '',
            date: emptyDateRange(),
            blocks: [createContentBlock('主修课程'), createContentBlock('奖项证书')],
          },
        ],
      };
    case 'work':
      return {
        id,
        type,
        title: '工作经历',
        payload: [
          {
            id: createId(),
            company: '',
            title: '',
            date: emptyDateRange(),
            blocks: [createContentBlock('工作职责'), createContentBlock('工作成果')],
          },
        ],
      };
    case 'project':
      return {
        id,
        type,
        title: '项目经历',
        payload: [
          {
            id: createId(),
            name: '',
            role: '',
            date: emptyDateRange(),
            link: '',
            blocks: [
              createContentBlock('项目内容'),
              createContentBlock('项目职责'),
              createContentBlock('项目成果'),
            ],
          },
        ],
      };
    case 'skills':
      return {
        id,
        type,
        title: '技能特长',
        payload: [{ id: createId(), name: '', level: '' }],
      };
    case 'custom':
      return {
        id,
        type,
        title: '自定义模块',
        payload: [{ id: createId(), title: '', body: '' }],
      };
  }
}

export function isSingletonSection(type: SectionType): boolean {
  return type === 'basic' || type === 'objective' || type === 'summary';
}

export function createBlankDocument(
  archiveId: string,
  templateId = 'steady-classic',
): ResumeDocument {
  const now = Date.now();
  const page = createBlankPage(templateId);
  const defaults: SectionType[] = ['basic', 'education', 'work', 'skills', 'summary'];
  const sections = defaults.map((t) => createDefaultSection(t));
  // 默认全部放进第一列，方便立刻填写
  const primary = page.columns[0]!;
  primary.sectionIds = sections.map((s) => s.id);

  return {
    id: createId(),
    archiveId,
    schemaVersion: SCHEMA_VERSION,
    templateId,
    sections,
    pages: [page],
    createdAt: now,
    updatedAt: now,
  };
}
