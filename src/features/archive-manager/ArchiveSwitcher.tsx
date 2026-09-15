import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { formatArchiveTime, type ArchiveMeta } from '@/domain/types';
import { useArchiveStore } from '@/stores/archiveStore';
import styles from './ArchiveSwitcher.module.css';

export function ArchiveSwitcher() {
  const list = useArchiveStore((s) => s.list);
  const currentId = useArchiveStore((s) => s.currentId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = list.find((a) => a.id === currentId) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const create = async () => {
    await useArchiveStore.getState().createArchive();
    toast('已创建新简历');
  };

  const switchTo = async (meta: ArchiveMeta) => {
    await useArchiveStore.getState().setCurrent(meta.id);
    setOpen(false);
  };

  const startRename = (meta: ArchiveMeta) => {
    setEditingId(meta.id);
    setEditingName(meta.name);
  };

  const commitRename = async () => {
    if (!editingId) return;
    await useArchiveStore.getState().renameArchive(editingId, editingName);
    setEditingId(null);
    toast('已重命名');
  };

  const duplicate = async (id: string) => {
    await useArchiveStore.getState().duplicateArchive(id);
    toast('已复制档案');
  };

  const remove = async () => {
    if (!confirmId) return;
    const name = list.find((a) => a.id === confirmId)?.name ?? '';
    await useArchiveStore.getState().removeArchive(confirmId);
    setConfirmId(null);
    toast(`已删除「${name}」`);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerLabel}>档案</span>
        <span className={styles.triggerName}>{current?.name ?? '加载中…'}</span>
        <span className={styles.caret}>▾</span>
      </button>

      {open ? (
        <div className={styles.menu} role="listbox" aria-label="简历档案">
          <div className={styles.menuHead}>
            <span>共 {list.length} 份</span>
            <Button variant="soft" onClick={create}>
              新建
            </Button>
          </div>
          <ul className={styles.list}>
            {list.map((meta) => {
              const selected = meta.id === currentId;
              const editing = editingId === meta.id;
              return (
                <li key={meta.id} className={`${styles.item} ${selected ? styles.selected : ''}`}>
                  {editing ? (
                    <div className={styles.editRow}>
                      <input
                        className={styles.input}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                      />
                      <Button variant="primary" onClick={() => void commitRename()}>
                        确定
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.itemMain}
                        onClick={() => void switchTo(meta)}
                      >
                        <span className={styles.itemName}>{meta.name}</span>
                        <span className={styles.itemMeta}>
                          {meta.templateId} · {formatArchiveTime(meta.updatedAt)}
                        </span>
                      </button>
                      <div className={styles.itemActions}>
                        <button type="button" onClick={() => startRename(meta)} title="重命名">
                          改名
                        </button>
                        <button type="button" onClick={() => void duplicate(meta.id)} title="复制">
                          复制
                        </button>
                        <button type="button" className={styles.danger} onClick={() => setConfirmId(meta.id)} title="删除">
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <Modal
        open={confirmId != null}
        title="删除档案"
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmId(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={() => void remove()}>
              删除
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          确定删除「{list.find((a) => a.id === confirmId)?.name ?? ''}」？该操作不可恢复。
        </p>
      </Modal>
    </div>
  );
}
