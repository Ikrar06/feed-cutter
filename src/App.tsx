import { useEffect, useState } from 'react';
import { useFeedCutter } from './hooks/useFeedCutter';
import { GridPicker } from './components/GridPicker';
import { TargetSizeBadge } from './components/TargetSizeBadge';
import { Dropzone } from './components/Dropzone';
import { PreviewBoard } from './components/PreviewBoard';
import { ResultGrid } from './components/ResultGrid';
import { AdvancedPanel } from './components/AdvancedPanel';

export default function App() {
  const {
    grid, setGrid,
    mode, setMode,
    cfg, setCfg,
    file, setFile,
    offset, setOffset,
    target,
    results,
    status,
    error,
    run,
  } = useFeedCutter();

  const isCutting = status === 'cutting';
  const canCut = !!file && !isCutting;

  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  useEffect(() => {
    if (!file) { setPreviewUrl(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Feed <span className="text-[var(--color-blade)]">Cutter</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Potong desain besar menjadi postingan Instagram 1080×1350 yang mulus di grid profil.
          </p>
        </header>

        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 space-y-6">
          <GridPicker grid={grid} onChange={setGrid} />

          <div>
            <p className="text-sm font-medium text-[var(--color-muted)] mb-2">Target desain</p>
            <TargetSizeBadge target={target} />
          </div>

          <Dropzone target={target} onFile={setFile} />

          <div>
            <p className="text-sm font-medium text-[var(--color-muted)] mb-2">
              {mode === 'carousel' ? 'Preview slides' : 'Preview feed'}
              <span className="text-xs font-normal text-[var(--color-muted)]">
                {' '}— angka = urutan upload
              </span>
            </p>
            <PreviewBoard
              grid={grid}
              cfg={cfg}
              imageUrl={previewUrl}
              mode={mode}
              offset={offset}
              onOffsetChange={setOffset}
            />
          </div>

          <button
            onClick={run}
            disabled={!canCut}
            className={[
              'w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              canCut
                ? 'bg-[var(--color-blade)] text-white hover:opacity-90'
                : 'bg-[var(--color-line)] text-[var(--color-muted)] cursor-not-allowed',
            ].join(' ')}
          >
            {isCutting
              ? `Memotong… (${grid.cols * grid.rows} potongan)`
              : `Potong ${grid.cols * grid.rows} bagian`}
          </button>

          {error && <p className="text-sm text-[var(--color-blade)]">{error}</p>}

          <AdvancedPanel
            mode={mode}
            onModeChange={setMode}
            cfg={cfg}
            onCfgChange={setCfg}
          />
        </section>

        {results.length > 0 && (
          <ResultGrid results={results} grid={grid} mode={mode} />
        )}
      </div>
    </div>
  );
}
