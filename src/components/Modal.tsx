import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ open, title, children, onClose, footer }: Props) {
  if (!open) return null;

  return (
    <div className={`modal-root ${styles.root}`} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>
          {footer ?? (
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
