import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/Button';
import { toast } from '@/components/Toast';
import {
  A4,
  MAX_PAGES,
  TEMPLATES,
  resolveTemplateId,
  type ResumeDocument,
  type ResumePage,
  type SectionType,
  type TemplateSpec,
} from '@/domain/types';
import { getAllowedAddTypes } from '@/domain/layout';
import { useArchiveStore } from '@/stores/archiveStore';
import { SortableSection } from './SortableSection';
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
  onAddSection: (type: SectionType) => void;
  overflowingPageId?: string | null;
  photoUrl?: string | null;
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

function getContentAreaHeight(template: TemplateSpec): number {
  const paddingTop = template.id === 'clean-navy' ? 28 : template.contentBox.paddingTop;
  return A4.height - paddingTop - template.contentBox.paddingBottom;
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
  overflowingPageId = null,
  photoUrl = null,
}: Props) {
  const template =
    TEMPLATES.find((t) => t.id === resolveTemplateId(templateId)) ?? TEMPLATES[0]!;
  const canAdd = pages.length < MAX_PAGES;
  const emptyDoc = { sections, pages } as ResumeDocument;
  const addable = getAllowedAddTypes(emptyDoc);
  const contentAreaHeight = getContentAreaHeight(template);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // 测量所有页
  useEffect(() => {
    let raf = 0;
    const nodes = document.querySelectorAll<HTMLElement>('[data-page-id] [data-measure-column]');
    const report = () => {
      const byPage = new Map<string, number[]>();
      nodes.forEach((el) => {
        const pageId = el.getAttribute('data-page-id-for') ?? '';
        if (!pageId) return;
        const list = byPage.get(pageId) ?? [];
        list.push(el.scrollHeight);
        byPage.set(pageId, list);
      });
      byPage.forEach((heights, pageId) => {
        useArchiveStore.getState().reportPageHeight(pageId, contentAreaHeight, heights);
      });
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(report);
    };

    const ro = new ResizeObserver(schedule);
    nodes.forEach((n) => ro.observe(n));
    const pageObserver = new ResizeObserver(schedule);
    document.querySelectorAll('[data-page-id]').forEach((p) => pageObserver.observe(p));
    schedule();
    const t = window.setTimeout(schedule, 0);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      ro.disconnect();
      pageObserver.disconnect();
    };
  }, [pages, sections, contentAreaHeight, scale]);

  const sectionById = useMemo(() => {
    const map = new Map(sections.map((s) => [s.id, s]));
    return map;
  }, [sections]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeData = active.data.current as { columnId?: string } | undefined;
    const overData = over.data.current as { columnId?: string } | undefined;

    const activeColumn = activeData?.columnId;
    const overColumn = overData?.columnId ?? activeColumn;
    if (!activeColumn || !overColumn) return;

    const doc = useArchiveStore.getState().doc;
    if (!doc) return;

    if (activeColumn === overColumn) {
      const col = doc.pages.flatMap((p) => p.columns).find((c) => c.id === activeColumn);
      if (!col) return;
      const ids = [...col.sectionIds];
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
      // arrayMove
      const [moved] = ids.splice(oldIndex, 1);
      if (moved == null) return;
      ids.splice(newIndex, 0, moved);
      useArchiveStore.getState().reorderSections(activeColumn, ids);
    } else {
      const overCol = doc.pages.flatMap((p) => p.columns).find((c) => c.id === overColumn);
      if (!overCol) return;
      let toIndex = overCol.sectionIds.length;
      if (overId !== 'empty-drop') {
        const idx = overCol.sectionIds.indexOf(overId);
        if (idx >= 0) toIndex = idx;
      }
      useArchiveStore.getState().transferSection(activeId, overColumn, toIndex);
      toast('已移动模块');
    }
  };

  return (
    <main className={styles.main}>
      <div className={`canvas-toolbar ${styles.toolbar}`}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarTitle}>A4 画布</span>
          <span className={styles.toolbarMeta}>
            {template.name} · 拖动 ⠿ 调整模块顺序
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setIsDragging(false)}
        >
          {/* 拖拽时去掉 scale，避免 dnd-kit 命中检测偏移 */}
          <div
            className={`canvas-stack ${styles.stack}`}
            style={{ transform: isDragging ? 'none' : `scale(${scale})` }}
          >
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
                      page.id === overflowingPageId ? styles.frameOverflow : '',
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
                            data-measure-column
                            data-page-id-for={page.id}
                          >
                            {col.sectionIds.length === 0 ? (
                              <SortableContext
                                items={[`empty-${col.id}`]}
                                strategy={verticalListSortingStrategy}
                              >
                                <div
                                  id={`empty-${col.id}`}
                                  data-column-id={col.id}
                                  data-type="empty-drop"
                                  className={styles.emptyCol}
                                >
                                  <span className={styles.emptyIcon} aria-hidden>
                                    ＋
                                  </span>
                                  <span>空白 A4</span>
                                  <span className={styles.emptyHint}>从上方按钮添加模块，或拖入模块调整顺序</span>
                                </div>
                              </SortableContext>
                            ) : (
                              <SortableContext
                                items={col.sectionIds}
                                strategy={verticalListSortingStrategy}
                              >
                                <div data-column-id={col.id} style={{ minHeight: 1 }}>
                                  {col.sectionIds.map((sid) => {
                                    const sec = sectionById.get(sid);
                                    if (!sec) return null;
                                    return (
                                      <SortableSection
                                        key={sid}
                                        section={sec}
                                        template={template}
                                        selected={selectedSectionId === sid}
                                        columnId={col.id}
                                        onSelect={onSelectSection}
                                        photoUrl={photoUrl}
                                      />
                                    );
                                  })}
                                </div>
                              </SortableContext>
                            )}
                          </div>
                        ))}
                      </div>
                      {page.id === overflowingPageId ? (
                        <div className={styles.truncateHint} aria-hidden>
                          ⋯ 已截断，下方内容见「是否加页」提示
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </main>
  );
}
