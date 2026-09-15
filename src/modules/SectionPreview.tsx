import { formatDateRange } from '@/domain/types';
import type { Section, TemplateSpec } from '@/domain/types';
import styles from './SectionPreview.module.css';

interface Props {
  section: Section;
  template: TemplateSpec;
  photoUrl?: string | null;
}

export function SectionPreview({ section, template, photoUrl }: Props) {
  const tid = template.id;
  const showTitle = section.type !== 'basic' && section.type !== 'objective';

  return (
    <div data-template={tid} className={styles.root}>
      {showTitle ? (
        <h3 className="rv-title">
          <span className="rv-title-text">{section.title}</span>
          <span className="rv-title-rule" aria-hidden />
        </h3>
      ) : null}
      {renderBody(section, photoUrl)}
    </div>
  );
}

function renderBlocks(blocks?: { id: string; label: string; body: string }[]) {
  if (!blocks?.length) return null;
  return (
    <div className="rv-blocks">
      {blocks
        .filter((b) => b.label || b.body)
        .map((b) => (
          <p key={b.id} className="rv-block">
            <span className="rv-desc-label">{b.label || '内容'}：</span>
            {b.body ? b.body : '…'}
          </p>
        ))}
    </div>
  );
}

function renderBody(section: Section, photoUrl?: string | null) {
  switch (section.type) {
    case 'basic': {
      const p = section.payload as {
        name: string;
        intent?: string;
        fields: { id: string; label: string; value: string }[];
      };
      const fields = (p.fields ?? []).filter((f) => f.label || f.value);
      const intent = (p.intent ?? '').trim();
      return (
        <div className={styles.basic}>
          <div className={styles.basicMain}>
            <div className={styles.name}>{p.name || '姓名'}</div>
            {intent ? (
              <div className={styles.intent}>
                <span className={styles.intentLabel}>求职意向：</span>
                <span className={styles.intentText}>{intent}</span>
              </div>
            ) : null}
            <div className={styles.contactGrid}>
              {fields.map((f) => (
                <span key={f.id} className="rv-contact">
                  <span className={styles.fieldLabel}>{f.label}</span>
                  <span className={styles.fieldSep}>：</span>
                  <span className={styles.fieldValue}>{f.value || '—'}</span>
                </span>
              ))}
            </div>
          </div>
          {photoUrl ? (
            <div className={`rv-photo ${styles.photoFilled}`}>
              <img src={photoUrl} alt="证件照" />
            </div>
          ) : (
            <div className="rv-photo" aria-hidden>
              <span>照片</span>
            </div>
          )}
        </div>
      );
    }
    case 'objective': {
      const p = section.payload as { text: string };
      return (
        <p className={styles.p}>
          <span className={styles.inlineLabel}>求职意向：</span>
          {p.text || '（填写目标岗位）'}
        </p>
      );
    }
    case 'summary': {
      const p = section.payload as { text: string };
      return <p className={styles.p}>{p.text || '（自我评价…）'}</p>;
    }
    case 'education': {
      const items = section.payload as {
        id: string;
        school: string;
        major: string;
        degree: string;
        gpaRank?: string;
        date: { start: null; end: null; isPresent?: boolean };
        blocks: { id: string; label: string; body: string }[];
      }[];
      return (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.entry}>
              <div className="rv-meta-row rv-meta-row-4">
                <span className="rv-meta-date">{formatDateRange(it.date) || '时间'}</span>
                <span className="rv-meta-org">{it.school || '学校'}</span>
                <span className="rv-meta-role">
                  {[it.major, it.degree].filter(Boolean).join('（') + (it.degree ? '）' : '') || '专业'}
                </span>
                <span className="rv-meta-extra">
                  {it.gpaRank ? `绩点排名：${it.gpaRank}` : '绩点排名'}
                </span>
              </div>
              {renderBlocks(it.blocks)}
            </div>
          ))}
        </div>
      );
    }
    case 'work': {
      const items = section.payload as {
        id: string;
        company: string;
        title: string;
        date: { start: null; end: null; isPresent?: boolean };
        blocks: { id: string; label: string; body: string }[];
      }[];
      return (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.entry}>
              <div className="rv-meta-row">
                <span className="rv-meta-date">{formatDateRange(it.date) || '时间'}</span>
                <span className="rv-meta-org">{it.company || '公司'}</span>
                <span className="rv-meta-role">{it.title || '职位'}</span>
              </div>
              {renderBlocks(it.blocks)}
            </div>
          ))}
        </div>
      );
    }
    case 'project': {
      const items = section.payload as {
        id: string;
        name: string;
        role: string;
        link?: string;
        date: { start: null; end: null; isPresent?: boolean };
        blocks: { id: string; label: string; body: string }[];
      }[];
      return (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.entry}>
              <div className="rv-meta-row">
                <span className="rv-meta-date">{formatDateRange(it.date) || '时间'}</span>
                <span className="rv-meta-org">{it.name || '项目'}</span>
                <span className="rv-meta-role">{it.role || '角色'}</span>
              </div>
              {it.link ? <p className={styles.desc}>链接：{it.link}</p> : null}
              {renderBlocks(it.blocks)}
            </div>
          ))}
        </div>
      );
    }
    case 'skills': {
      const items = section.payload as { id: string; name: string; level?: string }[];
      return (
        <ul className="rv-skill-list">
          {items
            .filter((s) => s.name)
            .map((s) => (
              <li key={s.id} className="rv-skill-item">
                {s.name}
                {s.level ? `（${s.level}）` : ''}
              </li>
            ))}
          {items.every((s) => !s.name) ? <li className="rv-skill-item">（添加技能…）</li> : null}
        </ul>
      );
    }
    case 'custom': {
      const items = section.payload as { id: string; title: string; body: string }[];
      return (
        <div className={styles.list}>
          {items.map((it) => (
            <div key={it.id} className={styles.entry}>
              {it.title ? <div className={styles.customTitle}>{it.title}</div> : null}
              {it.body ? <p className={styles.p}>{it.body}</p> : null}
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}
