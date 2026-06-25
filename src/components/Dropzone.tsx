import { useRef, useState } from 'react';
import type { DesignSize } from '../types';
import { validateSize } from '../lib/validate';

interface Props {
  target: DesignSize;
  onFile: (f: File | null) => void;
}

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

function readImageSize(file: File): Promise<DesignSize> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('Gagal membaca dimensi gambar.'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function Dropzone({ target, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [info, setInfo] = useState<{ filename: string; level: string; message: string } | null>(null);

  async function handleFile(file: File) {
    if (!ACCEPT.includes(file.type)) {
      setInfo({ filename: file.name, level: 'distort', message: 'Format tidak didukung. Gunakan PNG, JPG, atau WebP.' });
      onFile(null);
      return;
    }
    try {
      const size = await readImageSize(file);
      const v = validateSize(size, { cols: 0, rows: 0 }, { postW: 0, postH: 0, visible: 0, bleed: 0 });
      // validate against actual target
      const result = validateSize(size, { cols: 1, rows: 1 }, { postW: target.width, postH: target.height, visible: target.width, bleed: 0 });
      // re-validate properly: compare raw size vs target
      const exact = size.width === target.width && size.height === target.height;
      const ratioMatch = Math.abs(size.width / size.height - target.width / target.height) < 0.001;
      const level = exact ? 'ok' : ratioMatch ? 'scalable' : 'distort';
      const message = exact
        ? `Pas — ${size.width}×${size.height}px.`
        : ratioMatch
        ? `Rasio benar, ukuran beda. Bisa di-scale ke ${target.width}×${target.height}px.`
        : `Ukuran harus ${target.width}×${target.height}px. Punyamu ${size.width}×${size.height}px — hasilnya bisa gepeng.`;
      void result;
      void v;
      setInfo({ filename: file.name, level, message });
      onFile(file);
    } catch {
      setInfo({ filename: file.name, level: 'distort', message: 'Gagal membaca file gambar.' });
      onFile(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  const levelColor: Record<string, string> = {
    ok: 'text-emerald-400',
    scalable: 'text-amber-400',
    distort: 'text-[var(--color-blade)]',
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 cursor-pointer transition-colors',
          dragging
            ? 'border-[var(--color-blade)] bg-[var(--color-blade)]/5'
            : 'border-[var(--color-line)] hover:border-[var(--color-muted)]',
        ].join(' ')}
      >
        <svg className="h-8 w-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm text-[var(--color-muted)]">
          Tarik desainmu ke sini, atau <span className="text-[var(--color-ink)] underline">pilih file</span>
        </p>
        <p className="text-xs text-[var(--color-muted)]">PNG · JPG · WebP</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        className="hidden"
        onChange={onInputChange}
      />

      {info && (
        <div className={['text-sm', levelColor[info.level] ?? 'text-[var(--color-muted)]'].join(' ')}>
          <span className="font-medium">{info.filename}</span> — {info.message}
        </div>
      )}
    </div>
  );
}
