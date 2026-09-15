import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ToastStack, toast } from '@/components/Toast';
import { MAX_PAGES, type SectionType } from '@/domain/types';
import { TopBar } from '@/features/app-shell/TopBar';
import { useAutosave, useHydrateApp } from '@/features/autosave/useAutosave';
import { EditorCanvas } from '@/features/editor-canvas/EditorCanvas';
import { ModulePalette } from '@/features/module-palette/ModulePalette';
import { PropertyPanel } from '@/features/property-panel/PropertyPanel';
import { useArchiveStore } from '@/stores/archiveStore';
import { useSettingsStore } from '@/stores/settingsStore';
import styles from './App.module.css';

export default function App() {
  useHydrateApp();
  useAutosave();

  const hydrated = useArchiveStore((s) => s.hydrated);
  const dbError = useArchiveStore((s) => s.error);
  const doc = useArchiveStore((s) => s.doc);
  const dirty = useArchiveStore((s) => s.dirty);
  const saving = useArchiveStore((s) => s.saving);
  const lastSavedAt = useArchiveStore((s) => s.lastSavedAt);
  const scale = useArchiveStore((s) => s.scale);
  const selectedSectionId = useArchiveStore((s) => s.selectedSectionId);
  const autosaveIntervalMs = useSettingsStore((s) => s.settings.autosaveIntervalMs);

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [inputLocked, setInputLocked] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);

  const pages = doc?.pages ?? [];
  const sections = doc?.sections ?? [];
  const templateId = doc?.templateId ?? 'steady-classic';
  const pageCount = pages.length;

  useEffect(() => {
    if (!pages.length) return;
    if (!selectedPageId || !pages.some((p) => p.id === selectedPageId)) {
      setSelectedPageId(pages[0]!.id);
    }
  }, [pages, selectedPageId]);

  const saveLabel = useMemo(() => {
    if (dbError) return dbError;
    if (!hydrated) return '正在打开本地数据库…';
    if (saving) return '正在保存…';
    if (dirty) return '有未保存更改';
    if (lastSavedAt) {
      const d = new Date(lastSavedAt);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `已保存 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    return '已保存';
  }, [dbError, hydrated, saving, dirty, lastSavedAt]);

  const handleTemplateChange = useCallback((id: string) => {
    useArchiveStore.getState().setTemplateId(id);
    toast('已切换模板');
  }, []);

  const handleAutosaveChange = useCallback((ms: number | null) => {
    void useSettingsStore.getState().setAutosaveInterval(ms);
    toast(ms === null ? '已关闭自动保存' : `自动保存间隔：${ms / 1000}s`);
  }, []);

  const handleSave = useCallback(async () => {
    await useArchiveStore.getState().saveNow();
    const s = useArchiveStore.getState();
    toast(s.error ? `保存失败：${s.error}` : '已保存到本地');
  }, []);

  const handlePrint = useCallback(() => {
    window.requestAnimationFrame(() => window.print());
  }, []);

  const handleConfirmAddPage = useCallback(() => {
    if (pageCount < MAX_PAGES) useArchiveStore.getState().addPage();
    setOverflowOpen(false);
    setInputLocked(false);
  }, [pageCount]);

  const handleCancelOverflow = useCallback(() => {
    setOverflowOpen(false);
    setInputLocked(true);
    toast('已取消加页：写入已锁定（演示）');
  }, []);

  const handleToggleLockDemo = useCallback(() => {
    setInputLocked((locked) => {
      if (!locked) {
        setOverflowOpen(true);
        return true;
      }
      setOverflowOpen(false);
      return false;
    });
  }, []);

  if (!hydrated) {
    return (
      <div className={`app-shell ${styles.shell}`} style={{ placeItems: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>正在打开本地简历库…</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className={`app-shell ${styles.shell}`} style={{ placeItems: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2>无法打开本地数据库</h2>
          <p style={{ color: 'var(--muted)' }}>{dbError}</p>
          <Button variant="primary" onClick={() => void useArchiveStore.getState().hydrate()}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${styles.shell}`}>
      <TopBar
        pageCount={pageCount}
        templateId={templateId}
        autosaveIntervalMs={autosaveIntervalMs}
        scale={scale}
        saving={saving}
        onTemplateChange={handleTemplateChange}
        onAutosaveChange={handleAutosaveChange}
        onScaleChange={(s) => useArchiveStore.getState().setScale(s)}
        onSave={() => void handleSave()}
        onPrint={handlePrint}
        saveLabel={saveLabel}
      />

      <div className={styles.body}>
        <ModulePalette
          disabled={inputLocked}
          onAdd={(type: SectionType) => {
            useArchiveStore.getState().addSection(type);
            toast('已添加模块');
          }}
        />
        <EditorCanvas
          pages={pages}
          sections={sections}
          scale={scale}
          templateId={templateId}
          selectedPageId={selectedPageId}
          selectedSectionId={selectedSectionId}
          onSelectPage={setSelectedPageId}
          onSelectSection={(id) => useArchiveStore.getState().selectSection(id)}
          onAddPage={() => useArchiveStore.getState().addPage()}
          onRemovePage={(id) => useArchiveStore.getState().removePage(id)}
          onAddSection={(type) => useArchiveStore.getState().addSection(type)}
        />
        <PropertyPanel doc={doc} locked={inputLocked} onToggleLockDemo={handleToggleLockDemo} />
      </div>

      <Modal
        open={overflowOpen}
        title="内容超出 A4"
        onClose={handleCancelOverflow}
        footer={
          <>
            <Button variant="ghost" onClick={handleCancelOverflow}>
              取消
            </Button>
            <Button variant="primary" disabled={pageCount >= MAX_PAGES} onClick={handleConfirmAddPage}>
              加一页
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          是否新增一页继续编辑？不加页则无法继续写入，可先删减内容。
          {pageCount >= MAX_PAGES ? '（已达最大 3 页）' : ''}
        </p>
      </Modal>

      <ToastStack />
    </div>
  );
}
