import { useState } from 'react';
import type { CutConfig } from '../types';

interface Props {
  cfg: CutConfig;
  onCfgChange: (c: CutConfig) => void;
}

export function AdvancedPanel({ cfg, onCfgChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[var(--color-line)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
      >
        <span className="font-medium">Pengaturan lanjutan</span>
        <svg
          className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5 border-t border-[var(--color-line)]">
          <div className="space-y-3 pt-4">
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Konstanta piksel</p>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: 'postW',   label: 'Lebar post',    hint: 'px' },
                  { key: 'visible', label: 'Visible grid',  hint: 'px' },
                  { key: 'bleed',   label: 'Bleed / sisi',  hint: 'px' },
                ] as { key: keyof CutConfig; label: string; hint: string }[]
              ).map(({ key, label, hint }) => (
                <label key={key} className="space-y-1">
                  <span className="text-xs text-[var(--color-muted)]">{label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      value={cfg[key]}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!isNaN(n) && n > 0) onCfgChange({ ...cfg, [key]: n });
                      }}
                      className="w-full px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-line)] text-center text-sm"
                    />
                    <span className="text-xs text-[var(--color-muted)]">{hint}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Default Instagram: postW=1080, visible=1012, bleed=34. Ubah hanya jika IG mengubah spesifikasi grid-nya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
