import { useCallback, useEffect, useState } from 'react';
import type { GridSpec, CutMode, CutConfig, TileResult } from '../types';
import { DEFAULT_CONFIG } from '../lib/config';
import { planTiles, designSize } from '../lib/feedMath';
import { loadImage } from '../lib/loadImage';
import { cutTile } from '../lib/cutter';
import { tileFilename } from '../lib/naming';

export type Status = 'idle' | 'ready' | 'cutting' | 'done' | 'error';

export function useFeedCutter() {
  const [grid, setGrid] = useState<GridSpec>({ cols: 3, rows: 1 });
  const [mode, setMode] = useState<CutMode>('mosaic');
  const [cfg] = useState<CutConfig>(DEFAULT_CONFIG);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<TileResult[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const target = designSize(grid, cfg);

  const clearResults = useCallback(() => {
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
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
        const blob = await cutTile(bitmap, spec, cfg);
        out.push({
          ...spec,
          blob,
          url: URL.createObjectURL(blob),
          filename: tileFilename(spec, mode),
        });
      }
      bitmap.close?.();
      setResults(out);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      setStatus('error');
    }
  }, [file, grid, mode, cfg, clearResults]);

  const handleFileChange = useCallback((f: File | null) => {
    setFile(f);
    clearResults();
    setStatus(f ? 'ready' : 'idle');
    setError(null);
  }, [clearResults]);

  useEffect(() => () => clearResults(), [clearResults]);

  return {
    grid, setGrid,
    mode, setMode,
    cfg,
    file,
    setFile: handleFileChange,
    target,
    results,
    status,
    error,
    run,
    clearResults,
  };
}
