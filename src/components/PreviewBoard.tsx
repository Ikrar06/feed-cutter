import { useRef, useEffect, useState } from 'react';
import type { CutConfig, GridSpec } from '../types';
import { DEFAULT_CONFIG } from '../lib/config';
import { designSize, planTiles } from '../lib/feedMath';

interface Props {
  grid: GridSpec;
  cfg?: CutConfig;
  imageUrl?: string;
  mode?: 'mosaic' | 'carousel';
}

export function PreviewBoard({
  grid,
  cfg = DEFAULT_CONFIG,
  imageUrl,
  mode = 'mosaic',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setBoardWidth(entries[0].contentRect.width);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const design = designSize(grid, cfg);
  const tiles = planTiles(grid, mode, cfg);

  return (
    <div ref={containerRef} className="w-full">
      {boardWidth > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gap: '2px', // jarak tipis antar potongan
            width: boardWidth,
          }}
        >
          {tiles.map((tile) => {
            // area yang benar-benar terlihat
            const visibleX = tile.sx + cfg.bleed;
            const visibleY = tile.sy;

            return (
              <div
                key={tile.readingIndex}
                className="relative overflow-hidden bg-black"
                style={{
                  aspectRatio: `${cfg.visible} / ${cfg.postH}`,
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    draggable={false}
                    style={{
                      position: 'absolute',

                      // memperbesar gambar agar seluruh desain tersedia
                      width: `${(design.width / cfg.visible) * 100}%`,
                      height: 'auto',

                      // menggeser gambar sesuai posisi potongan
                      left: `-${(visibleX / cfg.visible) * 100}%`,
                      top: `-${(visibleY / cfg.postH) * 100}%`,

                      maxWidth: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--color-line)]" />
                )}

                {/* Nomor urutan upload */}
                <div
                  className="absolute bottom-1 right-1 text-[10px] font-bold leading-none px-1.5 py-1"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                  }}
                >
                  {tile.uploadOrder}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}