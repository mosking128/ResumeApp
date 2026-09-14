import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import styles from './PropertyPanel.module.css';

interface Props {
  selectedPageId: string | null;
  locked: boolean;
  onToggleLockDemo: () => void;
}

export function PropertyPanel({ selectedPageId, locked, onToggleLockDemo }: Props) {
  return (
    <aside className={`property-panel ${styles.panel}`} aria-label="属性面板">
      <div className={styles.section}>
        <h2 className={styles.title}>属性</h2>
        <p className={styles.sub}>
          {selectedPageId ? '当前页已选中（空白 A4）' : '点击画布选择页面'}
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>个人信息（占位）</h3>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>姓名</span>
            <input placeholder="张三" disabled={locked} readOnly={locked} />
          </label>
          <label className={styles.field}>
            <span>手机</span>
            <input placeholder="138 0000 0000" disabled={locked} readOnly={locked} />
          </label>
          <label className={styles.field}>
            <span>邮箱</span>
            <input placeholder="you@mail.com" disabled={locked} readOnly={locked} />
          </label>
          <label className={styles.field}>
            <span>城市</span>
            <input placeholder="上海" disabled={locked} readOnly={locked} />
          </label>
        </div>
        <Button
          variant="ghost"
          className={styles.blockBtn}
          onClick={() => toast('照片上传 / 裁剪 UI 将在 M5 接入')}
        >
          上传证件照…
        </Button>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>经历时间（占位）</h3>
        <div className={styles.dateRow}>
          <label className={styles.field}>
            <span>开始</span>
            <select disabled={locked} defaultValue="">
              <option value="" disabled>
                年-月
              </option>
              <option>2022.03</option>
              <option>2023.09</option>
              <option>2024.06</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>结束</span>
            <select disabled={locked} defaultValue="">
              <option value="" disabled>
                年-月
              </option>
              <option>至今</option>
              <option>2024.06</option>
              <option>2025.12</option>
            </select>
          </label>
        </div>
        <label className={styles.check}>
          <input type="checkbox" disabled={locked} />
          至今
        </label>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>布局操作（占位）</h3>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => toast('上移：排序逻辑即将接入')} disabled>
            上移
          </Button>
          <Button variant="ghost" onClick={() => toast('下移：排序逻辑即将接入')} disabled>
            下移
          </Button>
          <Button variant="ghost" onClick={() => toast('移除：布局逻辑即将接入')} disabled>
            移除模块
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>A4 溢出闸门（预览）</h3>
        <p className={styles.sub}>
          正式逻辑：超出内容区弹窗「是否加页」；取消则锁定写入。当前可切换演示锁。
        </p>
        <Button variant={locked ? 'danger' : 'soft'} className={styles.blockBtn} onClick={onToggleLockDemo}>
          {locked ? '解除写入锁（演示）' : '模拟写入锁（演示）'}
        </Button>
        {locked ? <p className={styles.warn}>写入已锁定：请加页或删减内容</p> : null}
      </div>
    </aside>
  );
}
