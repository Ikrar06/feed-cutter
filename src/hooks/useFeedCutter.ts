import { useCallback, useEffect, useState } from 'react';
import type { GridSpec, CutMode, CutConfig, TileResult } from '../types';
import { DEFAULT_CONFIG } from '../lib/config';
import { planTiles, designSize } from '../lib/feedMath';
import { loadImage } from '../lib/loadImage';
import { cutTile } from '../lib/cutter';
import { tileFilename } from '../lib/naming';

export type Status = 'idle' | 'ready' | 'cutting' | 'done' | 'error';

export interface Offset { x: number; y: number }

function readNaturalSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

export function useFeedCutter() {
  const [grid, setGrid] = useState<GridSpec>({ cols: 3, rows: 1 });
  const [mode, setMode] = useState<CutMode>('mosaic');
  const [cfg, setCfgRaw] = useState<CutConfig>(DEFAULT_CONFIG);
  const [file, setFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [offset, setOffsetRaw] = useState<Offset>({ x: 0, y: 0 });
  const [results, setResults] = useState<TileResult[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const target = designSize(grid, cfg, mode);

  // Clamp offset so crop stays within image bounds
  const setOffset = useCallback((o: Offset) => {
    setOffsetRaw((prev) => {
      if (!imageSize) return o;
      const design = designSize(grid, cfg, mode);
      const maxX = Math.max(0, imageSize.width  - design.width);
      const maxY = Math.max(0, imageSize.height - design.height);
      const clamped = {
        x: Math.max(0, Math.min(o.x, maxX)),
        y: Math.max(0, Math.min(o.y, maxY)),
      };
      if (clamped.x === prev.x && clamped.y === prev.y) return prev;
      return clamped;
    });
  }, [imageSize, grid, cfg]);

  const clearResults = useCallback(() => {
    setResults((prev) => { prev.forEach((r) => URL.revokeObjectURL(r.url)); return []; });
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setStatus('cutting');
    setError(null);
    clearResults();
    try {
      const bitmap = await loadImage(file);
      const specs = planTiles(grid, mode, cfg);
      const out: TileResult[] = [];
      for (const spec of specs) {
        // Apply offset: shifts the crop window within the source image
        const shifted = { ...spec, sx: spec.sx + offset.x, sy: spec.sy + offset.y };
        const blob = await cutTile(bitmap, shifted, cfg);
        out.push({ ...spec, blob, url: URL.createObjectURL(blob), filename: tileFilename(spec, mode) });
      }
      bitmap.close?.();
      setResults(out);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      setStatus('error');
    }
  }, [file, grid, mode, cfg, offset, clearResults]);

  const handleFileChange = useCallback(async (f: File | null) => {
    setFile(f);
    clearResults();
    setOffsetRaw({ x: 0, y: 0 });
    setStatus(f ? 'ready' : 'idle');
    setError(null);
    if (f) {
      const size = await readNaturalSize(f);
      setImageSize(size);
    } else {
      setImageSize(null);
    }
  }, [clearResults]);

  const setCfg = useCallback((c: CutConfig) => {
    setCfgRaw(c);
    clearResults();
    setOffsetRaw({ x: 0, y: 0 });
  }, [clearResults]);

  useEffect(() => () => clearResults(), [clearResults]);

  return {
    grid, setGrid,
    mode, setMode,
    cfg, setCfg,
    file, setFile: handleFileChange,
    imageSize,
    offset, setOffset,
    target,
    results,
    status,
    error,
    run,
    clearResults,
  };
}
