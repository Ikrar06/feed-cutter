import { useRef, useEffect, useState, useCallback } from 'react';
import type { CutConfig, GridSpec } from '../types';
import { DEFAULT_CONFIG } from '../lib/config';
import { designSize, planTiles } from '../lib/feedMath';
import type { Offset } from '../hooks/useFeedCutter';

interface Props {
  grid: GridSpec;
  cfg?: CutConfig;
  imageUrl?: string;
  mode?: 'mosaic' | 'carousel';
  offset?: Offset;
  onOffsetChange?: (o: Offset) => void;
}

export function PreviewBoard({
  grid,
  cfg = DEFAULT_CONFIG,
  imageUrl,
  mode = 'mosaic',
  offset = { x: 0, y: 0 },
  onOffsetChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setBoardWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const design = designSize(grid, cfg, mode);
  const tiles = planTiles(grid, mode, cfg);

  // --- drag-to-pan ---
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const getScale = useCallback(() => {
    // screen px per design px (based on one cell width)
    const cellWidth = boardWidth / grid.cols;
    return cellWidth / cfg.visible;
  }, [boardWidth, grid.cols, cfg.visible]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onOffsetChange || !imageUrl) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  }, [onOffsetChange, imageUrl, offset]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !onOffsetChange) return;
    const scale = getScale();
    const dx = (e.clientX - dragRef.current.startX) / scale;
    const dy = (e.clientY - dragRef.current.startY) / scale;
    onOffsetChange({ x: Math.round(dragRef.current.ox - dx), y: Math.round(dragRef.current.oy - dy) });
  }, [onOffsetChange, getScale]);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const isDraggable = !!onOffsetChange && !!imageUrl;

  return (
    <div ref={containerRef} className="w-full space-y-1">
      {boardWidth > 0 && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
              gap: '2px',
              width: boardWidth,
              cursor: isDraggable ? 'grab' : 'default',
              userSelect: 'none',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {tiles.map((tile) => {
              const visibleX = tile.sx + cfg.bleed + offset.x;
              const visibleY = tile.sy + offset.y;

              return (
                <div
                  key={tile.readingIndex}
                  className="relative overflow-hidden bg-[var(--color-line)]"
                  style={{ aspectRatio: `${cfg.visible} / ${cfg.postH}` }}
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt=""
                      draggable={false}
                      style={{
                        position: 'absolute',
                        width: `${(design.width / cfg.visible) * 100}%`,
                        height: 'auto',
                        left: `-${(visibleX / cfg.visible) * 100}%`,
                        top: `-${(visibleY / cfg.postH) * 100}%`,
                        maxWidth: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <div
                    className="absolute bottom-1 right-1 text-[10px] font-bold leading-none px-1.5 py-1 rounded"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                  >
                    {tile.uploadOrder}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offset indicator — hanya tampil kalau ada offset aktif */}
          {(offset.x !== 0 || offset.y !== 0) && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)]">
                Geser: {offset.x > 0 ? `+${offset.x}` : offset.x}px, {offset.y > 0 ? `+${offset.y}` : offset.y}px
              </span>
              <button
                onClick={() => onOffsetChange?.({ x: 0, y: 0 })}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                Reset
              </button>
            </div>
          )}

          {isDraggable && offset.x === 0 && offset.y === 0 && (
            <p className="text-xs text-[var(--color-muted)]">Drag preview untuk geser posisi crop</p>
          )}
        </>
      )}
    </div>
  );
}
