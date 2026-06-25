import type { DesignSize } from '../types';

interface Props {
  target: DesignSize;
}

export function TargetSizeBadge({ target }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2">
      <span className="text-sm text-[var(--color-muted)]">Buat desain</span>
      <span className="font-mono text-base font-semibold text-[var(--color-ink)]">
        {target.width} × {target.height} px
      </span>
    </div>
  );
}
