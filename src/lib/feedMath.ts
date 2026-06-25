import type { CutConfig, GridSpec, DesignSize, TileSpec, CutMode } from '../types';
import { DEFAULT_CONFIG, overlap, stepX, stepY } from './config';

export function designSize(grid: GridSpec, cfg: CutConfig = DEFAULT_CONFIG): DesignSize {
  return {
    width:  grid.cols * cfg.visible + overlap(cfg),
    height: grid.rows * cfg.postH,
  };
}

export function planTiles(
  grid: GridSpec,
  mode: CutMode = 'mosaic',
  cfg: CutConfig = DEFAULT_CONFIG,
): TileSpec[] {
  const total = grid.cols * grid.rows;
  const tiles: TileSpec[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const readingIndex = row * grid.cols + col;
      tiles.push({
        row,
        col,
        sx: col * stepX(cfg),
        sy: row * stepY(cfg),
        readingIndex,
        uploadOrder: mode === 'mosaic' ? total - readingIndex : readingIndex + 1,
      });
    }
  }
  return tiles;
}
