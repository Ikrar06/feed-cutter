import type { TileResult, GridSpec, CutMode } from '../types';
import { TileCard } from './TileCard';
import { downloadBlob } from '../lib/download';
import { bundleZip } from '../lib/zip';
import { buildManifest } from '../lib/naming';
import { designSize } from '../lib/feedMath';
import { DEFAULT_CONFIG } from '../lib/config';
import { useState } from 'react';

interface Props {
  results: TileResult[];
  grid: GridSpec;
  mode: CutMode;
}

export function ResultGrid({ results, grid, mode }: Props) {
  const [zipping, setZipping] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const design = designSize(grid, DEFAULT_CONFIG, mode);

  async function handleDownloadZip() {
    setZipping(true);
    try {
      const files = results.map((r) => ({ name: r.filename, blob: r.blob }));
      const manifest = buildManifest(results, grid, design, mode);
      const zip = await bundleZip(files, manifest);
      downloadBlob(zip, `feed-cutter-${grid.rows}x${grid.cols}.zip`);
    } finally {
      setZipping(false);
    }
  }

  // Download semua PNG satu per satu (sequential dengan delay kecil agar browser tidak block)
  async function handleDownloadAllPng() {
    setDownloading(true);
    try {
      const sorted = [...results].sort((a, b) => a.uploadOrder - b.uploadOrder);
      for (const r of sorted) {
        downloadBlob(r.blob, r.filename);
        await new Promise((res) => setTimeout(res, 150));
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Hasil — <span className="text-[var(--color-blade)]">{results.length} potongan</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadAllPng}
            disabled={downloading}
            className="rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--color-line)] hover:border-[var(--color-muted)] transition-colors disabled:opacity-50"
          >
            {downloading ? 'Mengunduh…' : `Unduh semua PNG`}
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={zipping}
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-[var(--color-blade)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {zipping ? 'Menyiapkan…' : 'Download ZIP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {results.map((r) => (
          <TileCard key={r.readingIndex} result={r} />
        ))}
      </div>
    </section>
  );
}
