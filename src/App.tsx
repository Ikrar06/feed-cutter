import { useFeedCutter } from './hooks/useFeedCutter';
import { GridPicker } from './components/GridPicker';
import { TargetSizeBadge } from './components/TargetSizeBadge';
import { Dropzone } from './components/Dropzone';
import { downloadBlob } from './lib/download';

export default function App() {
  const { grid, setGrid, file, setFile, target, results, status, error, run } = useFeedCutter();

  const isCutting = status === 'cutting';
  const canCut = !!file && !isCutting;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Feed Cutter</h1>
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

          {error && (
            <p className="text-sm text-[var(--color-blade)]">{error}</p>
          )}
        </section>

        {results.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-semibold">
              Hasil — {results.length} potongan
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {results.map((r) => (
                <div
                  key={r.readingIndex}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden"
                >
                  <img
                    src={r.url}
                    alt={r.filename}
                    className="w-full object-cover aspect-[4/5]"
                  />
                  <div className="p-2 space-y-1">
                    <p className="text-xs text-[var(--color-muted)] truncate">{r.filename}</p>
                    <p className="text-xs font-semibold text-[var(--color-blade)]">
                      Upload ke-{r.uploadOrder}
                    </p>
                    <button
                      onClick={() => downloadBlob(r.blob, r.filename)}
                      className="w-full rounded text-xs py-1 bg-[var(--color-line)] hover:bg-[var(--color-muted)]/30 transition-colors"
                    >
                      Unduh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
