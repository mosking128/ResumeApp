import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastItem = { id: string; text: string };

let seq = 0;
const listeners = new Set<(t: ToastItem[]) => void>();
let items: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l([...items]));
}

export function toast(text: string) {
  const id = `t-${++seq}`;
  items = [...items, { id, text }];
  emit();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 2600);
}

export function ToastStack() {
  const [list, setList] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setList);
    const onAppToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      if (text) toast(text);
    };
    window.addEventListener('app-toast', onAppToast);
    return () => {
      listeners.delete(setList);
      window.removeEventListener('app-toast', onAppToast);
    };
  }, []);

  if (!list.length) return null;

  return (
    <div className={`toast-stack ${styles.stack}`} aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={styles.toast}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
