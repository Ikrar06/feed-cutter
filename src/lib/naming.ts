import type { TileSpec, CutMode, GridSpec, DesignSize } from '../types';

export function tileFilename(t: TileSpec, mode: CutMode): string {
  if (mode === 'carousel') return `slide-${t.readingIndex + 1}.png`;
  const ord = String(t.uploadOrder).padStart(2, '0');
  return `upload-${ord}_r${t.row + 1}-c${t.col + 1}.png`;
}

export function buildManifest(
  tiles: TileSpec[],
  grid: GridSpec,
  design: DesignSize,
  mode: CutMode,
): string {
  const order = [...tiles].sort((a, b) => a.uploadOrder - b.uploadOrder);
  const lines = order.map((t) => `  ${t.uploadOrder}. r${t.row + 1}-c${t.col + 1}`);
  return [
    `Feed Cutter — ${grid.rows} baris × ${grid.cols} kolom`,
    `Ukuran desain: ${design.width} × ${design.height} px`,
    `Tiap potongan: 1080 × 1350 px`,
    ``,
    `Mode: ${mode.toUpperCase()}${mode === 'mosaic' ? ' (upload terbalik)' : ''}`,
    `Urutan upload:`,
    ...lines,
  ].join('\n');
}
