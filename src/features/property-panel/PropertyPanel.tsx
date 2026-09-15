import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { SectionFormSwitch } from '@/modules/SectionForms';
import { getAllowedAddTypes } from '@/domain/layout';
import type { ResumeDocument, SectionType } from '@/domain/types';
import { useArchiveStore } from '@/stores/archiveStore';
import styles from './PropertyPanel.module.css';

interface Props {
  doc: ResumeDocument | null;
  locked: boolean;
}

const TYPE_LABEL: Record<SectionType, string> = {
  basic: '个人信息',
  objective: '求职意向',
  summary: '自我评价',
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skills: '技能特长',
  custom: '自定义',
};

export function PropertyPanel({ doc, locked }: Props) {
  const selectedSectionId = useArchiveStore((s) => s.selectedSectionId);
  const selectSection = useArchiveStore((s) => s.selectSection);
  const updateSectionTitle = useArchiveStore((s) => s.updateSectionTitle);
  const patchSectionPayload = useArchiveStore((s) => s.patchSectionPayload);
  const moveSection = useArchiveStore((s) => s.moveSection);
  const removeSection = useArchiveStore((s) => s.removeSection);
  const addSection = useArchiveStore((s) => s.addSection);

  const section = doc?.sections.find((s) => s.id === selectedSectionId) ?? null;
  const addable = doc ? getAllowedAddTypes(doc) : [];

  if (!doc) {
    return (
      <aside className={`property-panel ${styles.panel}`} aria-label="属性面板">
        <div className={styles.section}>
          <h2 className={styles.title}>属性</h2>
          <p className={styles.sub}>加载中…</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`property-panel ${styles.panel}`} aria-label="属性面板">
      <div className={styles.section}>
        <h2 className={styles.title}>属性</h2>
        <p className={styles.sub}>
          {section ? `正在编辑：${section.title || TYPE_LABEL[section.type]}` : '点击画布上的模块进行编辑'}
        </p>
      </div>

      {section ? (
        <div className={styles.section}>
          <label className={styles.field}>
            <span>模块标题</span>
            <input
              value={section.title}
              disabled={locked}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            />
          </label>
          <div style={{ height: 10 }} />
          <SectionFormSwitch
            section={section}
            locked={locked}
            onPayload={(payload) => patchSectionPayload(section.id, payload)}
          />
          <div className={styles.actions} style={{ marginTop: 12 }}>
            <Button variant="ghost" disabled={locked} onClick={() => moveSection(section.id, -1)}>
              上移
            </Button>
            <Button variant="ghost" disabled={locked} onClick={() => moveSection(section.id, 1)}>
              下移
            </Button>
            <Button
              variant="danger"
              disabled={locked || section.type === 'basic'}
              onClick={() => {
                removeSection(section.id);
                toast('已移除模块');
              }}
            >
              移除模块
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <h3 className={styles.heading}>添加模块</h3>
          <p className={styles.sub} style={{ marginBottom: 10 }}>
            已有 {doc.sections.length} 个模块；单例模块只能存在一份。
          </p>
          <div className={styles.actions}>
            {addable.map((t) => (
              <Button
                key={t}
                variant="soft"
                disabled={locked}
                onClick={() => {
                  addSection(t);
                  toast(`已添加「${TYPE_LABEL[t]}」`);
                }}
              >
                + {TYPE_LABEL[t]}
              </Button>
            ))}
            {addable.length === 0 ? (
              <p className={styles.sub}>所有内置模块已添加。自定义模块可重复添加（V1 未开放重复时为空）。</p>
            ) : null}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.heading}>A4 页高</h3>
        <p className={styles.sub}>
          内容超出时会提示「加一页」；也可继续编辑、删减内容使高度回落。
        </p>
        {locked ? (
          <p className={styles.warn}>内容超出 A4</p>
        ) : (
          <p className={styles.sub}>当前未溢出</p>
        )}
      </div>

      <div className={styles.section}>
        <Button
          variant="ghost"
          className={styles.blockBtn}
          onClick={() => selectSection(null)}
          disabled={!section}
        >
          取消选中
        </Button>
      </div>
    </aside>
  );
}
