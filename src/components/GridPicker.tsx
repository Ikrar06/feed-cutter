import { useEffect, useState } from 'react';
import type { CutMode, GridSpec } from '../types';

const MOSAIC_MAX_COLS = 3;
const CAROUSEL_MAX_COLS = 10; // batas Instagram
const MAX_ROWS = 8;

const MOSAIC_PRESETS: { label: string; grid: GridSpec }[] = [
  { label: '3×1', grid: { cols: 3, rows: 1 } },
  { label: '3×2', grid: { cols: 3, rows: 2 } },
  { label: '3×3', grid: { cols: 3, rows: 3 } },
  { label: '3×6', grid: { cols: 3, rows: 6 } },
  { label: '3×8', grid: { cols: 3, rows: 8 } },
];

const CAROUSEL_PRESETS: { label: string; grid: GridSpec }[] = [
  { label: '2 slide', grid: { cols: 2, rows: 1 } },
  { label: '3 slide', grid: { cols: 3, rows: 1 } },
  { label: '5 slide', grid: { cols: 5, rows: 1 } },
  { label: '10 slide', grid: { cols: 10, rows: 1 } },
];

function NumberInput({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => { setLocal(String(value)); }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocal(e.target.value);
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) onChange(n);
  }

  function handleBlur() {
    const n = parseInt(local, 10);
    if (local === '' || isNaN(n)) setLocal(String(value));
  }

  const btnClass =
    'w-7 h-7 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-line)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center rounded border border-[var(--color-line)] bg-[var(--color-bg)] overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={btnClass}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
        </svg>
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-8 text-center text-sm bg-transparent text-[var(--color-ink)] outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={btnClass}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

interface Props {
  grid: GridSpec;
  mode: CutMode;
  onChange: (g: GridSpec) => void;
}

export function GridPicker({ grid, mode, onChange }: Props) {
  const maxCols = mode === 'carousel' ? CAROUSEL_MAX_COLS : MOSAIC_MAX_COLS;
  const presets = mode === 'carousel' ? CAROUSEL_PRESETS : MOSAIC_PRESETS;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const setCol = (v: number) => onChange({ ...grid, cols: clamp(v, 1, maxCols) });
  const setRow = (v: number) => onChange({ ...grid, rows: clamp(v, 1, MAX_ROWS) });

  const activeLabel = presets.find(
    (p) => p.grid.cols === grid.cols && p.grid.rows === grid.rows,
  )?.label;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        {mode === 'carousel' ? 'Jumlah Slide' : 'Ukuran Grid'}
      </p>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.grid)}
            className={[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              activeLabel === p.label
                ? 'bg-[var(--color-blade)] text-white'
                : 'bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-muted)]',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {mode === 'carousel' ? (
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            Slide
            <NumberInput value={grid.cols} min={1} max={maxCols} onChange={setCol} />
            <span className="text-xs text-[var(--color-muted)]">maks {maxCols}</span>
          </label>
        ) : (
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            Baris
            <NumberInput value={grid.rows} min={1} max={MAX_ROWS} onChange={setRow} />
            <span className="text-xs text-[var(--color-muted)]">maks {MAX_ROWS}</span>
          </label>
        )}
      </div>
    </div>
  );
}
