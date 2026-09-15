import { Button } from '@/components/Button';
import { DateRangeField } from '@/features/date-range-field/DateRangeField';
import { createBasicField, createContentBlock, createId } from '@/domain/types';
import type {
  ContentBlock,
  CustomItem,
  EducationItem,
  ObjectivePayload,
  ProjectItem,
  Section,
  SectionPayloadMap,
  SectionType,
  SkillItem,
  SummaryPayload,
  WorkItem,
} from '@/domain/types';
import styles from './SectionForms.module.css';

interface FormProps<T extends SectionType> {
  section: Section<T>;
  locked?: boolean;
  onPayload: (payload: SectionPayloadMap[T]) => void;
}

function ContentBlocksEditor({
  blocks,
  locked,
  onChange,
  defaultLabel = '自定义',
}: {
  blocks: ContentBlock[];
  locked?: boolean;
  onChange: (blocks: ContentBlock[]) => void;
  defaultLabel?: string;
}) {
  const update = (id: string, patch: Partial<ContentBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <div className={styles.blocks}>
      <div className={styles.blocksHead}>
        <span>内容板块</span>
        <Button
          variant="soft"
          disabled={locked}
          onClick={() => onChange([...blocks, createContentBlock(defaultLabel)])}
        >
          添加板块
        </Button>
      </div>
      {blocks.map((block, index) => (
        <div key={block.id} className={styles.blockCard}>
          <div className={styles.blockCardHead}>
            <strong>{block.label || `板块 ${index + 1}`}</strong>
            <button
              type="button"
              className={styles.remove}
              disabled={locked || blocks.length <= 1}
              onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}
            >
              删除板块
            </button>
          </div>
          <TextField
            label="标题"
            value={block.label}
            disabled={locked}
            placeholder={defaultLabel}
            onChange={(label) => update(block.id, { label })}
          />
          <TextField
            label="正文"
            value={block.body}
            disabled={locked}
            multiline
            onChange={(body) => update(block.id, { body })}
          />
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function BasicForm({ section, locked, onPayload }: FormProps<'basic'>) {
  const p = section.payload;
  const fields = p.fields ?? [];

  const updateField = (id: string, patch: Partial<{ label: string; value: string }>) =>
    onPayload({
      ...p,
      fields: fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });

  return (
    <div className={styles.stack}>
      <TextField label="姓名" value={p.name} disabled={locked} onChange={(name) => onPayload({ ...p, name })} />
      <TextField
        label="求职意向"
        value={p.intent ?? ''}
        disabled={locked}
        placeholder="如 市场专员 / 后端工程师"
        onChange={(intent) => onPayload({ ...p, intent })}
      />
      <div className={styles.blocks}>
        <div className={styles.blocksHead}>
          <span>信息字段</span>
          <Button
            variant="soft"
            disabled={locked}
            onClick={() =>
              onPayload({
                ...p,
                fields: [...fields, createBasicField('新字段')],
              })
            }
          >
            添加字段
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.blockCard}>
            <div className={styles.blockCardHead}>
              <strong>{field.label || `字段 ${index + 1}`}</strong>
              <button
                type="button"
                className={styles.remove}
                disabled={locked}
                onClick={() => onPayload({ ...p, fields: fields.filter((f) => f.id !== field.id) })}
              >
                删除字段
              </button>
            </div>
            <div className={styles.fieldPair}>
              <TextField
                label="标签"
                value={field.label}
                disabled={locked}
                placeholder="如 电话 / 邮箱 / GitHub"
                onChange={(label) => updateField(field.id, { label })}
              />
              <TextField
                label="内容"
                value={field.value}
                disabled={locked}
                onChange={(value) => updateField(field.id, { value })}
              />
            </div>
          </div>
        ))}
        {fields.length === 0 ? (
          <p className={styles.hint}>已清空字段，可点击「添加字段」自定义</p>
        ) : null}
      </div>
    </div>
  );
}

export function TextBlockForm({
  section,
  locked,
  onPayload,
}: FormProps<'summary' | 'objective'>) {
  const text = (section.payload as SummaryPayload | ObjectivePayload).text;
  return (
    <div className={styles.stack}>
      <TextField
        label="内容"
        value={text}
        disabled={locked}
        multiline
        placeholder="一两句话介绍…"
        onChange={(next) => onPayload({ text: next } as never)}
      />
    </div>
  );
}

export function EducationForm({ section, locked, onPayload }: FormProps<'education'>) {
  const items: EducationItem[] = section.payload;
  const update = (id: string, patch: Partial<EducationItem>) =>
    onPayload(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className={styles.stack}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHead}>
            <strong>第 {index + 1} 条</strong>
            <button
              type="button"
              disabled={locked || items.length <= 1}
              className={styles.remove}
              onClick={() => onPayload(items.filter((it) => it.id !== item.id))}
            >
              删除
            </button>
          </div>
          <TextField label="学校" value={item.school} disabled={locked} onChange={(school) => update(item.id, { school })} />
          <TextField label="专业" value={item.major} disabled={locked} onChange={(major) => update(item.id, { major })} />
          <TextField
            label="学历"
            value={item.degree}
            disabled={locked}
            placeholder="本科 / 硕士"
            onChange={(degree) => update(item.id, { degree })}
          />
          <TextField
            label="绩点排名"
            value={item.gpaRank ?? ''}
            disabled={locked}
            placeholder="如 3.8/4.0 或 专业前 5%"
            onChange={(gpaRank) => update(item.id, { gpaRank })}
          />
          <div className={styles.field}>
            <span>时间</span>
            <DateRangeField value={item.date} disabled={locked} onChange={(date) => update(item.id, { date })} />
          </div>
          <ContentBlocksEditor
            blocks={item.blocks}
            locked={locked}
            defaultLabel="主修课程"
            onChange={(blocks) => update(item.id, { blocks })}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={locked}
        onClick={() =>
          onPayload([
            ...items,
            {
              id: createId(),
              school: '',
              major: '',
              degree: '',
              gpaRank: '',
              date: { start: null, end: null, isPresent: false },
              blocks: [createContentBlock('主修课程'), createContentBlock('奖项证书')],
            },
          ])
        }
      >
        添加教育经历
      </Button>
    </div>
  );
}

export function WorkForm({ section, locked, onPayload }: FormProps<'work'>) {
  const items: WorkItem[] = section.payload;
  const update = (id: string, patch: Partial<WorkItem>) =>
    onPayload(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className={styles.stack}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHead}>
            <strong>第 {index + 1} 条</strong>
            <button
              type="button"
              disabled={locked || items.length <= 1}
              className={styles.remove}
              onClick={() => onPayload(items.filter((it) => it.id !== item.id))}
            >
              删除
            </button>
          </div>
          <TextField label="公司" value={item.company} disabled={locked} onChange={(company) => update(item.id, { company })} />
          <TextField label="职位" value={item.title} disabled={locked} onChange={(title) => update(item.id, { title })} />
          <div className={styles.field}>
            <span>时间</span>
            <DateRangeField value={item.date} disabled={locked} onChange={(date) => update(item.id, { date })} />
          </div>
          <ContentBlocksEditor
            blocks={item.blocks}
            locked={locked}
            defaultLabel="工作职责"
            onChange={(blocks) => update(item.id, { blocks })}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={locked}
        onClick={() =>
          onPayload([
            ...items,
            {
              id: createId(),
              company: '',
              title: '',
              date: { start: null, end: null, isPresent: false },
              blocks: [createContentBlock('工作职责'), createContentBlock('工作成果')],
            },
          ])
        }
      >
        添加工作经历
      </Button>
    </div>
  );
}

export function ProjectForm({ section, locked, onPayload }: FormProps<'project'>) {
  const items: ProjectItem[] = section.payload;
  const update = (id: string, patch: Partial<ProjectItem>) =>
    onPayload(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className={styles.stack}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHead}>
            <strong>第 {index + 1} 条</strong>
            <button
              type="button"
              disabled={locked || items.length <= 1}
              className={styles.remove}
              onClick={() => onPayload(items.filter((it) => it.id !== item.id))}
            >
              删除
            </button>
          </div>
          <TextField label="项目名" value={item.name} disabled={locked} onChange={(name) => update(item.id, { name })} />
          <TextField label="角色" value={item.role} disabled={locked} onChange={(role) => update(item.id, { role })} />
          <TextField label="链接" value={item.link ?? ''} disabled={locked} onChange={(link) => update(item.id, { link })} />
          <div className={styles.field}>
            <span>时间</span>
            <DateRangeField value={item.date} disabled={locked} onChange={(date) => update(item.id, { date })} />
          </div>
          <ContentBlocksEditor
            blocks={item.blocks}
            locked={locked}
            defaultLabel="项目内容"
            onChange={(blocks) => update(item.id, { blocks })}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={locked}
        onClick={() =>
          onPayload([
            ...items,
            {
              id: createId(),
              name: '',
              role: '',
              date: { start: null, end: null, isPresent: false },
              link: '',
              blocks: [
                createContentBlock('项目内容'),
                createContentBlock('项目职责'),
                createContentBlock('项目成果'),
              ],
            },
          ])
        }
      >
        添加项目
      </Button>
    </div>
  );
}

export function SkillsForm({ section, locked, onPayload }: FormProps<'skills'>) {
  const items: SkillItem[] = section.payload;
  const update = (id: string, patch: Partial<SkillItem>) =>
    onPayload(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className={styles.stack}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.inlineCard}>
          <input
            placeholder={`技能 ${index + 1}`}
            value={item.name}
            disabled={locked}
            onChange={(e) => update(item.id, { name: e.target.value })}
          />
          <input
            placeholder="级别"
            value={item.level ?? ''}
            disabled={locked}
            onChange={(e) => update(item.id, { level: e.target.value })}
          />
          <button
            type="button"
            className={styles.remove}
            disabled={locked || items.length <= 1}
            onClick={() => onPayload(items.filter((it) => it.id !== item.id))}
          >
            删
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={locked}
        onClick={() => onPayload([...items, { id: createId(), name: '', level: '' }])}
      >
        添加技能
      </Button>
    </div>
  );
}

export function CustomForm({ section, locked, onPayload }: FormProps<'custom'>) {
  const items: CustomItem[] = section.payload;
  const update = (id: string, patch: Partial<CustomItem>) =>
    onPayload(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className={styles.stack}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHead}>
            <strong>第 {index + 1} 条</strong>
            <button
              type="button"
              className={styles.remove}
              disabled={locked || items.length <= 1}
              onClick={() => onPayload(items.filter((it) => it.id !== item.id))}
            >
              删除
            </button>
          </div>
          <TextField label="标题" value={item.title} disabled={locked} onChange={(title) => update(item.id, { title })} />
          <TextField label="正文" value={item.body} disabled={locked} multiline onChange={(body) => update(item.id, { body })} />
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={locked}
        onClick={() => onPayload([...items, { id: createId(), title: '', body: '' }])}
      >
        添加内容
      </Button>
    </div>
  );
}

export function SectionFormSwitch({
  section,
  locked,
  onPayload,
}: {
  section: Section;
  locked?: boolean;
  onPayload: (payload: unknown) => void;
}) {
  // Narrowing via switch requires assertion: Section is distributed union
  const s = section as Section<SectionType> & { type: SectionType };
  switch (s.type) {
    case 'basic':
      return <BasicForm section={s as Section<'basic'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'objective':
    case 'summary':
      return <TextBlockForm section={s as Section<'summary'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'education':
      return <EducationForm section={s as Section<'education'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'work':
      return <WorkForm section={s as Section<'work'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'project':
      return <ProjectForm section={s as Section<'project'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'skills':
      return <SkillsForm section={s as Section<'skills'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    case 'custom':
      return <CustomForm section={s as Section<'custom'>} locked={locked} onPayload={(p) => onPayload(p)} />;
    default:
      return null;
  }
}
