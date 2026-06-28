import { useEffect, useState } from 'react';
import { useFeedCutter } from './hooks/useFeedCutter';
import { GridPicker } from './components/GridPicker';
import { TargetSizeBadge } from './components/TargetSizeBadge';
import { Dropzone } from './components/Dropzone';
import { PreviewBoard } from './components/PreviewBoard';
import { ResultGrid } from './components/ResultGrid';
import { AdvancedPanel } from './components/AdvancedPanel';
import { HelpModal } from './components/HelpModal';

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

  const [helpOpen, setHelpOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  useEffect(() => {
    if (!file) { setPreviewUrl(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Tombol buku — fixed pojok kiri atas di desktop, pojok kanan bawah di mobile */}
      <button
        onClick={() => setHelpOpen(true)}
        aria-label="Cara kerja"
        className="fixed bottom-5 right-5 sm:bottom-auto sm:top-5 sm:right-auto sm:left-5 z-40 rounded-full p-2.5 bg-[var(--color-panel)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-muted)] transition-colors shadow-lg"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </button>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Feed <span className="text-[var(--color-blade)]">Cutter</span>
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Potong desain besar menjadi postingan Instagram 1080×1350 yang mulus di grid profil.
          </p>
        </header>

        {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 space-y-6">
          <GridPicker grid={grid} mode={mode} onChange={setGrid} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--color-muted)]">Target desain</p>
              <a
                href="https://www.figma.com/community/file/1653098192714197002"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 38 57" fill="currentColor">
                  <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
                  <path d="M0 47.5a9.5 9.5 0 0 1 9.5-9.5H19v9.5a9.5 9.5 0 1 1-19 0z"/>
                  <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
                  <path d="M0 9.5a9.5 9.5 0 0 0 9.5 9.5H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
                  <path d="M0 28.5a9.5 9.5 0 0 0 9.5 9.5H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
                </svg>
                Template Figma
              </a>
            </div>
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
