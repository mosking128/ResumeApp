import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { A4, MAX_PAGES, TEMPLATES, type ResumePage, type TemplateSpec } from '@/domain/types';
import styles from './EditorCanvas.module.css';

interface Props {
  pages: ResumePage[];
  scale: number;
  templateId: string;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
}

function pageStyle(template: TemplateSpec): CSSProperties {
  const { tokens, contentBox } = template;
  return {
    width: A4.width,
    height: A4.height,
    background: tokens.bg,
    color: tokens.ink,
    fontFamily: tokens.bodyFont,
    paddingTop: contentBox.paddingTop,
    paddingBottom: contentBox.paddingBottom,
    paddingLeft: contentBox.paddingLeft,
    paddingRight: contentBox.paddingRight,
  } as CSSProperties;
}

function columnStyle(widthRatio: number): CSSProperties {
  return {
    flex: `0 0 ${widthRatio * 100}%`,
    maxWidth: `${widthRatio * 100}%`,
  };
}

export function EditorCanvas({
  pages,
  scale,
  templateId,
  selectedPageId,
  onSelectPage,
  onAddPage,
  onRemovePage,
}: Props) {
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]!;
  const canAdd = pages.length < MAX_PAGES;

  return (
    <main className={styles.main}>
      <div className={`canvas-toolbar ${styles.toolbar}`}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>A4 画布</span>
          <span className={styles.toolbarMeta}>
            {template.name} · {A4.width}×{A4.height}px · 模板边距 {template.contentBox.paddingTop}px
          </span>
        </div>
        <div className={styles.toolbarRight}>
          <Button
            variant="soft"
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd) return;
              onAddPage();
              toast('已添加空白页（页高闸门逻辑即将接入）');
            }}
          >
            加一页
          </Button>
          <Button variant="ghost" onClick={() => toast('页高检测与写入锁定将在 M3.5 接入')}>
            页高检测
          </Button>
        </div>
      </div>

      <div className={`canvas-viewport ${styles.viewport}`}>
        <div className={`canvas-stack ${styles.stack}`} style={{ transform: `scale(${scale})` }}>
          {pages.map((page, index) => {
            const selected = page.id === selectedPageId;
            return (
              <div key={page.id} className={styles.pageWrap}>
                <div className={`page-label ${styles.pageLabel}`}>
                  第 {index + 1} 页
                  {pages.length > 1 ? (
                    <button
                      type="button"
                      className={styles.removePage}
                      onClick={() => onRemovePage(page.id)}
                      aria-label={`删除第 ${index + 1} 页`}
                    >
                      删除
                    </button>
                  ) : null}
                </div>
                <div
                  className={[
                    'page-frame',
                    styles.frame,
                    selected ? styles.selected : '',
                    index < pages.length - 1 ? 'print-break-after' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectPage(page.id)}
                  role="group"
                  aria-label={`第 ${index + 1} 页 A4`}
                >
                  <div className={`page-inner ${styles.inner}`} style={pageStyle(template)} data-page-id={page.id}>
                    <div
                      className={styles.columns}
                      data-layout={template.layoutMode}
                      style={{ height: '100%' }}
                    >
                      {page.columns.map((col, colIndex) => (
                        <div
                          key={col.id}
                          className={styles.column}
                          style={columnStyle(col.widthRatio)}
                          data-column-index={colIndex}
                        >
                          {col.sectionIds.length === 0 ? (
                            <div className={styles.emptyCol}>
                              <span className={styles.emptyIcon} aria-hidden>
                                ＋
                              </span>
                              <span>空白 A4</span>
                              <span className={styles.emptyHint}>从左侧拖入模块，或等待内容编辑接入</span>
                            </div>
                          ) : (
                            col.sectionIds.map((sid) => (
                              <div key={sid} className={styles.sectionGhost}>
                                模块 {sid.slice(0, 4)}
                              </div>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
