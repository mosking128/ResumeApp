import { useEffect } from 'react';
import { useArchiveStore } from '@/stores/archiveStore';
import { useSettingsStore } from '@/stores/settingsStore';

/** 按设置间隔自动保存脏文档 */
export function useAutosave() {
  const dirty = useArchiveStore((s) => s.dirty);
  const updatedAt = useArchiveStore((s) => s.doc?.updatedAt ?? 0);
  const interval = useSettingsStore((s) => s.settings.autosaveIntervalMs);

  useEffect(() => {
    if (!dirty || interval == null) return;
    const timer = window.setTimeout(() => {
      void useArchiveStore.getState().saveNow();
    }, interval);
    return () => window.clearTimeout(timer);
  }, [dirty, interval, updatedAt]);

  useEffect(() => {
    const flush = () => {
      const state = useArchiveStore.getState();
      if (state.dirty) void state.saveNow();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}

export function useHydrateApp() {
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    void useArchiveStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!settingsHydrated) void useSettingsStore.getState().hydrate();
  }, [settingsHydrated]);
}
