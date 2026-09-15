import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import styles from './PhotoCropper.module.css';

export type CropAspect = 1 | 0.75;

interface Props {
  open: boolean;
  sourceUrl: string | null;
  aspect: CropAspect;
  onCancel: () => void;
  onConfirm: (
    blob: Blob,
    meta: { zoom: number; crop: { x: number; y: number }; aspect: CropAspect },
  ) => void;
}

const VIEW_W = 280;

export function PhotoCropper({ open, sourceUrl, aspect, onCancel, onConfirm }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  /** 图片中心相对裁剪框中心的偏移（视图像素） */
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const viewH = Math.max(1, Math.round(VIEW_W / aspect));
  const cover = natural.w ? Math.max(VIEW_W / natural.w, viewH / natural.h) : 1;
  const contain = natural.w ? Math.min(VIEW_W / natural.w, viewH / natural.h) : 0.2;
  const minZoom = Math.max(0.15, contain * 0.5);
  const maxZoom = Math.max(4, cover * 3);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setNatural({ w: 0, h: 0 });
    }
  }, [open]);

  /** 把偏移限制在裁剪框内不露出空白（尽量） */
  const clampOffset = useCallback(
    (ox: number, oy: number, z: number, natW: number, natH: number) => {
      const dw = natW * z;
      const dh = natH * z;
      const maxX = Math.max(0, (dw - VIEW_W) / 2);
      const maxY = Math.max(0, (dh - viewH) / 2);
      // 图比框小：只能居中附近轻微移动
      const minX = -Math.max(0, (VIEW_W - dw) / 2);
      const minY = -Math.max(0, (viewH - dh) / 2);
      return {
        x: Math.min(maxX, Math.max(minX, ox)),
        y: Math.min(maxY, Math.max(minY, oy)),
      };
    },
    [viewH],
  );

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const c = Math.max(VIEW_W / img.naturalWidth, viewH / img.naturalHeight);
    setZoom(c);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const ox = d.ox + (e.clientX - d.x);
    const oy = d.oy + (e.clientY - d.y);
    const next = clampOffset(ox, oy, zoom, natural.w, natural.h);
    setOffset(next);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!natural.w) return;
    e.preventDefault();
    const next = Math.min(maxZoom, Math.max(minZoom, zoom - e.deltaY * 0.0015));
    setZoom(next);
    setOffset((o) => clampOffset(o.x, o.y, next, natural.w, natural.h));
  };

  const handleConfirm = useCallback(() => {
    const img = imgRef.current;
    if (!img || !natural.w || !natural.h) return;

    const scale = zoom;
    const dispW = natural.w * scale;
    const dispH = natural.h * scale;

    // 视图：裁剪框中心 = (VIEW_W/2, viewH/2)
    // 图片中心在视图中的坐标 = 裁剪框中心 + offset
    const imgCx = VIEW_W / 2 + offset.x;
    const imgCy = viewH / 2 + offset.y;
    // 图片左上角在视图中的坐标
    const imgLeft = imgCx - dispW / 2;
    const imgTop = imgCy - dispH / 2;
    // 裁剪矩形在视图中是 (0,0,VIEW_W,viewH) → 映射到源图像素
    const sx = (-imgLeft) / scale;
    const sy = (-imgTop) / scale;
    const sw = VIEW_W / scale;
    const sh = viewH / scale;

    const sx2 = Math.max(0, Math.min(natural.w - 1, sx));
    const sy2 = Math.max(0, Math.min(natural.h - 1, sy));
    const sw2 = Math.max(1, Math.min(natural.w - sx2, sw));
    const sh2 = Math.max(1, Math.min(natural.h - sy2, sh));

    const canvas = document.createElement('canvas');
    const maxSide = 1024;
    const outScale = Math.min(1, maxSide / Math.max(sw2, sh2));
    canvas.width = Math.max(1, Math.round(sw2 * outScale));
    canvas.height = Math.max(1, Math.round(sh2 * outScale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, sx2, sy2, sw2, sh2, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast('导出照片失败');
          return;
        }
        onConfirm(blob, {
          zoom,
          crop: { x: Math.round(sx2), y: Math.round(sy2) },
          aspect,
        });
      },
      'image/jpeg',
      0.85,
    );
  }, [natural, offset, zoom, aspect, onConfirm]);

  if (!open || !sourceUrl) return null;

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: natural.w * zoom,
    height: natural.h * zoom,
    transform: `translate(${VIEW_W / 2 + offset.x - (natural.w * zoom) / 2}px, ${
      viewH / 2 + offset.y - (natural.h * zoom) / 2
    }px)`,
    cursor: 'grab',
    userSelect: 'none',
    pointerEvents: 'none',
  };

  return (
    <Modal
      open={open}
      title="裁剪证件照"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            确定
          </Button>
        </>
      }
    >
      <div className={styles.wrap}>
        <p className={styles.hint}>拖动调整位置；滚轮或滑块缩放（可缩小到完整放入框内）。</p>
        <div
          className={styles.viewport}
          style={{ width: VIEW_W, height: viewH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <img
            ref={imgRef}
            src={sourceUrl}
            alt="待裁剪照片"
            className={styles.img}
            draggable={false}
            onLoad={onImgLoad}
            style={imgStyle}
          />
          <div className={styles.frame} aria-hidden />
        </div>
        <label className={styles.zoomRow}>
          <span>缩放</span>
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={Math.min(maxZoom, Math.max(minZoom, zoom))}
            onChange={(e) => {
              const next = Number(e.target.value);
              setZoom(next);
              setOffset((o) => clampOffset(o.x, o.y, next, natural.w, natural.h));
            }}
          />
          <span>{zoom.toFixed(2)}×</span>
        </label>
        <div className={styles.aspectRow}>
          <span>当前比例：{aspect === 1 ? '1:1' : '3:4'}</span>
        </div>
      </div>
    </Modal>
  );
}
