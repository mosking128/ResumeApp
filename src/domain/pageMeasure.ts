/** 页高检测纯逻辑（相对布局坐标系，不受画布 scale 影响） */
export const TOLERANCE_PX = 2;

export interface PageMeasureInput {
  /** A4 高度 - 上下边距 */
  contentAreaHeight: number;
  /** 各列内容实测高度（scrollHeight） */
  columnHeights: number[];
}

export interface PageMeasureResult {
  usedHeight: number;
  isOverflow: boolean;
  overflowPx: number;
}

export function measurePage(input: PageMeasureInput): PageMeasureResult {
  const usedHeight = input.columnHeights.length
    ? Math.max(...input.columnHeights)
    : 0;
  const overflowPx = usedHeight - input.contentAreaHeight;
  return {
    usedHeight,
    isOverflow: overflowPx > TOLERANCE_PX,
    overflowPx: Math.max(0, overflowPx),
  };
}

export function isWriteLocked(input: {
  overflowingPageId: string | null;
  inputLocked: boolean;
}): boolean {
  return input.inputLocked || input.overflowingPageId != null;
}
