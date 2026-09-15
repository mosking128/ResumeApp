import type { SectionType } from '@/domain/types';
import styles from './ModulePalette.module.css';

interface Props {
  disabled?: boolean;
  onAdd: (type: SectionType) => void;
}

const MODULES: {
  type: SectionType;
  label: string;
  desc: string;
  singleton?: boolean;
}[] = [
  { type: 'basic', label: '个人信息', desc: '姓名 / 求职意向 / 联系方式', singleton: true },
  { type: 'education', label: '教育经历', desc: '学校 / 专业 / 绩点' },
  { type: 'work', label: '工作经历', desc: '公司 / 职责 / 成果' },
  { type: 'project', label: '项目经历', desc: '内容 / 职责 / 成果' },
  { type: 'skills', label: '技能特长', desc: '标签列表' },
  { type: 'summary', label: '自我评价', desc: '多行文本', singleton: true },
  { type: 'custom', label: '自定义模块', desc: '自由标题 + 正文' },
];

export function ModulePalette({ disabled, onAdd }: Props) {
  return (
    <aside className={`palette ${styles.panel}`} aria-label="模块库">
      <div className={styles.head}>
        <h2 className={styles.title}>模块库</h2>
        <p className={styles.hint}>点击添加到第 1 页主栏</p>
      </div>
      <ul className={styles.list}>
        {MODULES.map((m) => (
          <li key={m.type}>
            <button
              type="button"
              className={styles.item}
              disabled={disabled}
              onClick={() => onAdd(m.type)}
            >
              <span className={styles.grip} aria-hidden>
                ⋮⋮
              </span>
              <span className={styles.meta}>
                <span className={styles.name}>{m.label}</span>
                <span className={styles.desc}>{m.desc}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <p>内容自动保存到本地。单例模块只能添加一次。</p>
      </div>
    </aside>
  );
}
