import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { TEMPLATES } from '@/domain/types';
import styles from './TopBar.module.css';

interface Props {
  pageCount: number;
  templateId: string;
  autosaveIntervalMs: number | null;
  scale: number;
  onTemplateChange: (id: string) => void;
  onAutosaveChange: (ms: number | null) => void;
  onScaleChange: (s: number) => void;
  onSave: () => void;
  onPrint: () => void;
  saveLabel: string;
}

const AUTOSAVE_OPTIONS: { label: string; value: number | null }[] = [
  { label: '15 秒', value: 15_000 },
  { label: '30 秒', value: 30_000 },
  { label: '60 秒', value: 60_000 },
  { label: '关闭', value: null },
];

export function TopBar({
  pageCount,
  templateId,
  autosaveIntervalMs,
  scale,
  onTemplateChange,
  onAutosaveChange,
  onScaleChange,
  onSave,
  onPrint,
  saveLabel,
}: Props) {
  return (
    <header className={`topbar ${styles.bar}`}>
      <div className={styles.left}>
        <div className={styles.brand} aria-hidden>
          <span className={styles.logo} />
          简历编辑器
        </div>
        <button
          type="button"
          className={styles.archiveBtn}
          onClick={() => toast('多档案存档：界面已就位，逻辑即将接入')}
        >
          我的简历
          <span className={styles.caret}>▾</span>
        </button>
        <span className={styles.badge} title="A4 页数">
          {pageCount} / 3 页
        </span>
      </div>

      <div className={styles.center}>
        <label className={styles.field}>
          <span>模板</span>
          <select
            value={templateId}
            onChange={(e) => onTemplateChange(e.target.value)}
            aria-label="选择模板"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>自动保存</span>
          <select
            value={autosaveIntervalMs === null ? 'off' : String(autosaveIntervalMs)}
            onChange={(e) => {
              const v = e.target.value;
              onAutosaveChange(v === 'off' ? null : Number(v));
            }}
            aria-label="自动保存间隔"
          >
            {AUTOSAVE_OPTIONS.map((o) => (
              <option key={o.label} value={o.value === null ? 'off' : String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>缩放</span>
          <select
            value={String(scale)}
            onChange={(e) => onScaleChange(Number(e.target.value))}
            aria-label="画布缩放"
          >
            {[0.75, 0.9, 1, 1.15, 1.25].map((s) => (
              <option key={s} value={s}>
                {Math.round(s * 100)}%
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.right}>
        <span className={styles.saveState}>{saveLabel}</span>
        <Button variant="ghost" onClick={onSave}>
          保存
        </Button>
        <Button variant="primary" onClick={onPrint}>
          导出 PDF
        </Button>
      </div>
    </header>
  );
}
