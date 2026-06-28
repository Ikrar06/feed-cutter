import type { TileResult } from '../types';
import { downloadBlob } from '../lib/download';

interface Props {
  result: TileResult;
}

export function TileCard({ result: r }: Props) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
      <div className="relative">
        <img
          src={r.url}
          alt={r.filename}
          className="w-full object-cover aspect-[4/5]"
        />
        <div
          className="absolute top-1.5 left-1.5 text-[10px] font-bold leading-none px-1.5 py-1 rounded"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
        >
          #{r.uploadOrder}
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        <p className="text-xs text-[var(--color-muted)] truncate">{r.filename}</p>
        <button
          onClick={() => downloadBlob(r.blob, r.filename)}
          className="w-full rounded text-xs py-1.5 bg-[var(--color-line)] hover:bg-[var(--color-muted)]/20 transition-colors"
        >
          Unduh
        </button>
      </div>
    </div>
  );
}
