import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import { SectionPreview } from '@/modules/SectionPreview';
import type { Section, TemplateSpec } from '@/domain/types';
import styles from './EditorCanvas.module.css';

interface Props {
  section: Section;
  template: TemplateSpec;
  selected: boolean;
  columnId: string;
  onSelect: (id: string) => void;
}

export function SortableSection({ section, template, selected, columnId, onSelect }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { columnId, type: 'section' },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-section-id={section.id}
      className={[
        styles.sectionBlock,
        selected ? styles.sectionSelected : '',
        isDragging ? styles.sectionDragging : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(section.id);
      }}
    >
      <div className={styles.sectionDragRow}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          className={styles.dragHandle}
          data-drag-handle
          aria-label={`拖动调整「${section.title}」位置`}
          title="按住拖动调整顺序"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <span className={styles.sectionTitleChip}>{section.title}</span>
      </div>
      <SectionPreview section={section} template={template} />
    </div>
  );
}
