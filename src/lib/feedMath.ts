import type { CutConfig, GridSpec, DesignSize, TileSpec, CutMode } from '../types';
import { DEFAULT_CONFIG, overlap, stepX, stepY } from './config';

export function designSize(
  grid: GridSpec,
  cfg: CutConfig = DEFAULT_CONFIG,
  mode: CutMode = 'mosaic',
): DesignSize {
  return {
    // carousel: tidak ada overlap, tiap slide penuh postW
    // mosaic:   ada overlap 68px antar kolom
    width: mode === 'carousel'
      ? grid.cols * cfg.postW
      : grid.cols * cfg.visible + overlap(cfg),
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
        // carousel: geser per 1080 (tidak ada overlap)
        // mosaic:   geser per 1012 (visible area)
        sx: mode === 'carousel' ? col * cfg.postW : col * stepX(cfg),
        sy: row * stepY(cfg),
        readingIndex,
        uploadOrder: mode === 'mosaic' ? total - readingIndex : readingIndex + 1,
      });
    }
  }
  return tiles;
}
