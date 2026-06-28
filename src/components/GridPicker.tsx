import { useEffect, useState } from 'react';
import type { GridSpec } from '../types';

const MAX_COLS = 3;
const MAX_ROWS = 8;

const PRESETS: { label: string; grid: GridSpec }[] = [
  { label: '1×1', grid: { cols: 1, rows: 1 } },
  { label: '2×1', grid: { cols: 2, rows: 1 } },
  { label: '3×1', grid: { cols: 3, rows: 1 } },
  { label: '3×2', grid: { cols: 3, rows: 2 } },
  { label: '3×3', grid: { cols: 3, rows: 3 } },
  { label: '3×6', grid: { cols: 3, rows: 6 } },
  { label: '3×8', grid: { cols: 3, rows: 8 } },
];

function NumberInput({
  value,
  min,
  max,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const [local, setLocal] = useState(String(value));

  // Sync jika value berubah dari luar (misal preset diklik)
  useEffect(() => { setLocal(String(value)); }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocal(e.target.value);
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n)) onChange(n); // onChange di GridPicker akan clamp
  }

  function handleBlur() {
    const n = parseInt(local, 10);
    if (local === '' || isNaN(n)) setLocal(String(value)); // reset ke nilai valid
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={local}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}

interface Props {
  grid: GridSpec;
  onChange: (g: GridSpec) => void;
}

export function GridPicker({ grid, onChange }: Props) {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const setCol = (v: number) => onChange({ ...grid, cols: clamp(v, 1, MAX_COLS) });
  const setRow = (v: number) => onChange({ ...grid, rows: clamp(v, 1, MAX_ROWS) });

  const activeLabel = PRESETS.find(
    (p) => p.grid.cols === grid.cols && p.grid.rows === grid.rows,
  )?.label;

  const inputClass =
    'w-16 px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-line)] text-center';

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-muted)]">Ukuran Grid</p>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
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
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Kolom
          <NumberInput value={grid.cols} min={1} max={MAX_COLS} onChange={setCol} className={inputClass} />
          <span className="text-xs text-[var(--color-muted)]">maks {MAX_COLS}</span>
        </label>
        <span className="text-[var(--color-muted)]">×</span>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Baris
          <NumberInput value={grid.rows} min={1} max={MAX_ROWS} onChange={setRow} className={inputClass} />
          <span className="text-xs text-[var(--color-muted)]">maks {MAX_ROWS}</span>
        </label>
      </div>
    </div>
  );
}
