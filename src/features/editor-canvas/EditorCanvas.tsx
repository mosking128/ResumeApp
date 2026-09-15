import type { CSSProperties } from 'react';
import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import { SectionPreview } from '@/modules/SectionPreview';
import { A4, MAX_PAGES, TEMPLATES, resolveTemplateId, type ResumeDocument, type ResumePage, type TemplateSpec } from '@/domain/types';
import { getAllowedAddTypes } from '@/domain/layout';
import styles from './EditorCanvas.module.css';

interface Props {
  pages: ResumePage[];
  sections: ResumeDocument['sections'];
  scale: number;
  templateId: string;
  selectedPageId: string | null;
  selectedSectionId: string | null;
  onSelectPage: (id: string) => void;
  onSelectSection: (id: string) => void;
  onAddPage: () => void;
  onRemovePage: (id: string) => void;
  onAddSection: (type: import('@/domain/types').SectionType) => void;
}

function pageStyle(template: TemplateSpec): CSSProperties {
  const { tokens, contentBox } = template;
  const paddingTop = template.id === 'clean-navy' ? 28 : contentBox.paddingTop;
  return {
    width: A4.width,
    height: A4.height,
    background: tokens.bg,
    color: tokens.ink,
    fontFamily: tokens.bodyFont,
    fontSize: 13 * tokens.scale,
    paddingTop,
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
  sections,
  scale,
  templateId,
  selectedPageId,
  selectedSectionId,
  onSelectPage,
  onSelectSection,
  onAddPage,
  onRemovePage,
  onAddSection,
}: Props) {
  const template =
    TEMPLATES.find((t) => t.id === resolveTemplateId(templateId)) ?? TEMPLATES[0]!;
  const canAdd = pages.length < MAX_PAGES;
  const emptyDoc = { sections, pages } as ResumeDocument;
  const addable = getAllowedAddTypes(emptyDoc);

  return (
    <main className={styles.main}>
      <div className={`canvas-toolbar ${styles.toolbar}`}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>A4 画布</span>
          <span className={styles.toolbarMeta}>
            {template.name} · 选中后可在右侧编辑
          </span>
        </div>
        <div className={styles.toolbarRight}>
          {addable.slice(0, 3).map((t) => (
            <Button key={t} variant="soft" onClick={() => onAddSection(t)} disabled={selectedPageId == null}>
              + {t === 'work' ? '工作经历' : t === 'education' ? '教育经历' : t === 'project' ? '项目' : t}
            </Button>
          ))}
          <Button
            variant="ghost"
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd) return;
              onAddPage();
              toast('已添加空白页');
            }}
          >
            加一页
          </Button>
        </div>
      </div>

      <div className={`canvas-viewport ${styles.viewport}`}>
        <div className={`canvas-stack ${styles.stack}`} style={{ transform: `scale(${scale})` }}>
          {pages.map((page, index) => {
            const pageSelected = page.id === selectedPageId;
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
                    pageSelected ? styles.selected : '',
                    index < pages.length - 1 ? 'print-break-after' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectPage(page.id)}
                  role="group"
                  aria-label={`第 ${index + 1} 页 A4`}
                >
                  <div
                    className={`page-inner ${styles.inner} ${styles[`page_${template.id}`] ?? ''}`}
                    style={pageStyle(template)}
                    data-page-id={page.id}
                    data-template={template.id}
                  >
                    {template.id === 'steady-classic' ? (
                      <>
                        <div className={styles.steadyTop} aria-hidden />
                        <div className={styles.steadyTopMid} aria-hidden />
                        <div className={styles.steadyBottom} aria-hidden />
                      </>
                    ) : null}
                    {template.id === 'clean-navy' ? (
                      <header className={styles.pageBanner} aria-hidden>
                        <div className={styles.pageBannerTitle}>
                          <span>个人简历</span>
                          <em>Personal resume</em>
                        </div>
                      </header>
                    ) : null}
                    <div className={styles.columns} data-layout={template.layoutMode} style={{ height: '100%' }}>
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
                              <span className={styles.emptyHint}>从上方按钮添加模块，或使用左侧模块库</span>
                            </div>
                          ) : (
                            col.sectionIds.map((sid) => {
                              const sec = sections.find((s) => s.id === sid);
                              if (!sec) return null;
                              const selected = selectedSectionId === sid;
                              return (
                                <div
                                  key={sid}
                                  className={`${styles.sectionBlock} ${selected ? styles.sectionSelected : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSection(sid);
                                  }}
                                >
                                  <SectionPreview section={sec} template={template} />
                                </div>
                              );
                            })
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
