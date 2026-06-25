import type { GridSpec } from '../types';

const MAX_COLS = 6;
const MAX_ROWS = 3;

const PRESETS: { label: string; grid: GridSpec }[] = [
  { label: '1×2', grid: { cols: 2, rows: 1 } },
  { label: '1×3', grid: { cols: 3, rows: 1 } },
  { label: '2×3', grid: { cols: 3, rows: 2 } },
  { label: '3×3', grid: { cols: 3, rows: 3 } },
  { label: '1×6', grid: { cols: 6, rows: 1 } },
  { label: '2×6', grid: { cols: 6, rows: 2 } },
  { label: '3×6', grid: { cols: 6, rows: 3 } },
];

interface Props {
  grid: GridSpec;
  onChange: (g: GridSpec) => void;
}

export function GridPicker({ grid, onChange }: Props) {
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const setCol = (v: number) => onChange({ ...grid, cols: clamp(v, 1, MAX_COLS) });
  const setRow = (v: number) => onChange({ ...grid, rows: clamp(v, 1, MAX_ROWS) });

  const activePreset = PRESETS.find(
    (p) => p.grid.cols === grid.cols && p.grid.rows === grid.rows,
  );

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
              activePreset?.label === p.label
                ? 'bg-[var(--color-blade)] text-white'
                : 'bg-[var(--color-panel)] text-[var(--color-ink)] hover:bg-[var(--color-line)]',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Kolom
          <input
            type="number"
            min={1}
            max={MAX_COLS}
            value={grid.cols}
            onChange={(e) => setCol(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded bg-[var(--color-panel)] text-[var(--color-ink)] border border-[var(--color-line)] text-center"
          />
          <span className="text-xs text-[var(--color-muted)]">(maks {MAX_COLS})</span>
        </label>
        <span className="text-[var(--color-muted)]">×</span>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Baris
          <input
            type="number"
            min={1}
            max={MAX_ROWS}
            value={grid.rows}
            onChange={(e) => setRow(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded bg-[var(--color-panel)] text-[var(--color-ink)] border border-[var(--color-line)] text-center"
          />
          <span className="text-xs text-[var(--color-muted)]">(maks {MAX_ROWS})</span>
        </label>
      </div>
    </div>
  );
}
