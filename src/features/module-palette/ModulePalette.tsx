import { toast } from '@/components/Toast';
import type { SectionType } from '@/domain/types';
import styles from './ModulePalette.module.css';

interface ModuleMeta {
  type: SectionType;
  label: string;
  desc: string;
  singleton?: boolean;
  alreadyAdded?: boolean;
}

const MODULES: ModuleMeta[] = [
  { type: 'basic', label: '个人信息', desc: '姓名 / 联系方式 / 照片', singleton: true, alreadyAdded: true },
  { type: 'objective', label: '求职意向', desc: '岗位 / 城市 / 到岗', singleton: true, alreadyAdded: true },
  { type: 'education', label: '教育经历', desc: '学校 / 专业 / 时间' },
  { type: 'work', label: '工作经历', desc: '公司 / 职位 / 要点' },
  { type: 'project', label: '项目经历', desc: '项目名 / 角色 / 链接' },
  { type: 'skills', label: '技能特长', desc: '标签列表' },
  { type: 'summary', label: '自我评价', desc: '多行文本' },
  { type: 'custom', label: '自定义模块', desc: '自由标题 + 正文' },
];

export function ModulePalette() {
  return (
    <aside className={`palette ${styles.panel}`} aria-label="模块库">
      <div className={styles.head}>
        <h2 className={styles.title}>模块库</h2>
        <p className={styles.hint}>拖到画布添加（交互即将接入）</p>
      </div>
      <ul className={styles.list}>
        {MODULES.map((m) => {
          const disabled = Boolean(m.singleton && m.alreadyAdded);
          return (
            <li key={m.type}>
              <button
                type="button"
                className={styles.item}
                disabled={disabled}
                title={disabled ? '该模块为单例且已存在' : '点击添加到当前页（即将接入）'}
                onClick={() => toast(`「${m.label}」拖拽与写入逻辑即将接入`)}
              >
                <span className={styles.grip} aria-hidden>
                  ⋮⋮
                </span>
                <span className={styles.meta}>
                  <span className={styles.name}>{m.label}</span>
                  <span className={styles.desc}>{m.desc}</span>
                </span>
                {disabled ? <span className={styles.tag}>已存在</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.footer}>
        <p>V1 支持模块级拖拽：整块上下移、跨列/跨页。</p>
      </div>
    </aside>
  );
}
