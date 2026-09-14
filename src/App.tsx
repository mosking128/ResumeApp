import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ToastStack, toast } from '@/components/Toast';
import {
  MAX_PAGES,
  MIN_PAGES,
  createBlankDocument,
  createBlankPage,
} from '@/domain/types';
import { TopBar } from '@/features/app-shell/TopBar';
import { EditorCanvas } from '@/features/editor-canvas/EditorCanvas';
import { ModulePalette } from '@/features/module-palette/ModulePalette';
import { PropertyPanel } from '@/features/property-panel/PropertyPanel';
import styles from './App.module.css';

const initialDoc = createBlankDocument('classic-single');

export default function App() {
  const [templateId, setTemplateId] = useState(initialDoc.templateId);
  const [pages, setPages] = useState(initialDoc.pages);
  const [selectedPageId, setSelectedPageId] = useState(initialDoc.pages[0]!.id);
  const [scale, setScale] = useState(1);
  const [autosaveIntervalMs, setAutosaveIntervalMs] = useState<number | null>(30_000);
  const [inputLocked, setInputLocked] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState('空白文档 · 未持久化');

  const pageCount = pages.length;

  const handleTemplateChange = useCallback(
    (id: string) => {
      setTemplateId(id);
      toast('模板皮肤已切换（布局重排逻辑即将接入）');
    },
    [],
  );

  const handleAddPage = useCallback(() => {
    setPages((prev) => {
      if (prev.length >= MAX_PAGES) {
        toast('已达到最大 3 页');
        return prev;
      }
      const page = createBlankPage(templateId);
      return [...prev, page];
    });
  }, [templateId]);

  const handleRemovePage = useCallback((id: string) => {
    setPages((prev) => {
      if (prev.length <= MIN_PAGES) {
        toast('至少保留 1 页');
        return prev;
      }
      const next = prev.filter((p) => p.id !== id);
      setSelectedPageId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    setSaveLabel('已保存（内存）· 逻辑即将接入 IDB');
    toast('本地持久化将在 M1 接入，当前为 UI 闭环');
  }, []);

  const handlePrint = useCallback(() => {
    setSaveLabel('正在准备打印 / 另存为 PDF…');
    // 给浏览器一帧，便于用户看到状态
    window.requestAnimationFrame(() => {
      window.print();
      setSaveLabel('已调起打印对话框');
    });
  }, []);

  const handleConfirmAddPage = useCallback(() => {
    handleAddPage();
    setOverflowOpen(false);
    setInputLocked(false);
  }, [handleAddPage]);

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

  const saveStateText = useMemo(() => {
    if (inputLocked) return '写入已锁定 · 请加页或删减';
    if (autosaveIntervalMs === null) return `自动保存已关闭 · ${saveLabel}`;
    const sec = Math.round(autosaveIntervalMs / 1000);
    return `${sec}s 自动保存 · ${saveLabel}`;
  }, [autosaveIntervalMs, inputLocked, saveLabel]);

  return (
    <div className={`app-shell ${styles.shell}`}>
      <TopBar
        pageCount={pageCount}
        templateId={templateId}
        autosaveIntervalMs={autosaveIntervalMs}
        scale={scale}
        onTemplateChange={handleTemplateChange}
        onAutosaveChange={(ms) => {
          setAutosaveIntervalMs(ms);
          toast(ms === null ? '已关闭自动保存' : `自动保存间隔：${ms / 1000}s`);
        }}
        onScaleChange={setScale}
        onSave={handleSave}
        onPrint={handlePrint}
        saveLabel={saveStateText}
      />

      <div className={styles.body}>
        <ModulePalette />
        <EditorCanvas
          pages={pages}
          scale={scale}
          templateId={templateId}
          selectedPageId={selectedPageId}
          onSelectPage={setSelectedPageId}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
        />
        <PropertyPanel
          selectedPageId={selectedPageId}
          locked={inputLocked}
          onToggleLockDemo={handleToggleLockDemo}
        />
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
