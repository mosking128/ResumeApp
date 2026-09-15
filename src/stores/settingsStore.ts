import { create } from 'zustand';
import { DEFAULT_SETTINGS, type AppSettings } from '@/domain/types';
import * as db from '@/storage/db';

interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAutosaveInterval: (ms: number | null) => Promise<void>;
  setDefaultTemplate: (id: string) => Promise<void>;
}

async function persist(settings: AppSettings): Promise<AppSettings> {
  await db.putSettings(settings);
  return settings;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,

  hydrate: async () => {
    const settings = await db.initDefaultSettings();
    set({ settings, hydrated: true });
  },

  setAutosaveInterval: async (ms) => {
    const settings = await persist({ ...get().settings, autosaveIntervalMs: ms });
    set({ settings });
  },

  setDefaultTemplate: async (id) => {
    const settings = await persist({ ...get().settings, defaultTemplateId: id });
    set({ settings });
  },
}));
