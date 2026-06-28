import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export function HelpModal({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sheet — full-width bottom sheet di mobile, modal di desktop */}
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 space-y-6 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar — hanya di mobile */}
        <div className="sm:hidden mx-auto w-10 h-1 rounded-full bg-[var(--color-line)] -mt-1 mb-1" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Cara kerja Feed Cutter</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grid Instagram */}
        <section className="space-y-2">
          <h3 className="font-medium text-[var(--color-ink)]">Grid Instagram</h3>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Instagram menampilkan post di profil dalam grid 3 kolom. Setiap post berukuran{' '}
            <strong className="text-[var(--color-ink)]">1080×1350 px</strong>, tapi yang terlihat
            di grid hanya <strong className="text-[var(--color-ink)]">1012 px</strong> lebarnya —
            Instagram memotong <strong className="text-[var(--color-ink)]">34 px</strong> di kiri dan
            kanan (disebut <em>bleed</em>).
          </p>
          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] p-3 font-mono text-xs text-[var(--color-muted)] leading-5">
            <span className="text-[var(--color-ink)]">1080 px</span> (lebar post)<br />
            &nbsp;&nbsp;├─ <span className="text-[var(--color-blade)]">34 px</span> bleed kiri (tersembunyi)<br />
            &nbsp;&nbsp;├─ <span className="text-[var(--color-ink)]">1012 px</span> area terlihat<br />
            &nbsp;&nbsp;└─ <span className="text-[var(--color-blade)]">34 px</span> bleed kanan (tersembunyi)
          </div>
        </section>

        {/* Mosaic */}
        <section className="space-y-2">
          <h3 className="font-medium text-[var(--color-ink)]">
            Mode Mosaic
            <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">untuk feed seamless</span>
          </h3>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Di mode ini, desain besar dipotong agar tampil mulus di grid profil. Karena bleed kiri dan
            kanan dari dua post yang bersebelahan <em>saling tumpang tindih</em>, setiap kolom
            bergeser <strong className="text-[var(--color-ink)]">1012 px</strong> (bukan 1080).
          </p>
          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] p-3 font-mono text-xs text-[var(--color-muted)] leading-5">
            Overlap antar kolom&nbsp;&nbsp;= 34 + 34 = <span className="text-[var(--color-blade)]">68 px</span><br />
            Step horizontal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-[var(--color-ink)]">1012 px</span><br />
            Lebar desain 3 kolom = 3 × 1012 + 68 = <span className="text-[var(--color-ink)]">3104 px</span><br />
            Urutan upload&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-[var(--color-blade)]">terbalik</span> (kanan → kiri)
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Upload terbalik karena Instagram memposisikan post terbaru di ujung kiri grid.
          </p>
        </section>

        {/* Carousel */}
        <section className="space-y-2">
          <h3 className="font-medium text-[var(--color-ink)]">
            Mode Carousel
            <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">untuk album geser</span>
          </h3>
          <p className="text-[var(--color-muted)] leading-relaxed">
            Di mode carousel, setiap slide adalah satu post penuh <strong className="text-[var(--color-ink)]">1080×1350 px</strong>{' '}
            tanpa overlap — setiap slide berdiri sendiri. Jadi desain lebih lebar dan langkah antar slide{' '}
            <strong className="text-[var(--color-ink)]">1080 px</strong>.
          </p>
          <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] p-3 font-mono text-xs text-[var(--color-muted)] leading-5">
            Overlap&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-[var(--color-ink)]">0 px</span><br />
            Step horizontal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-[var(--color-ink)]">1080 px</span><br />
            Lebar desain 3 slide = 3 × 1080 = <span className="text-[var(--color-ink)]">3240 px</span><br />
            Urutan upload&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-[var(--color-ink)]">normal</span> (kiri → kanan)
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Di grid profil, hanya slide pertama yang muncul — 1012 px tengah dari slide itu yang terlihat.
          </p>
        </section>

        {/* Tabel perbandingan */}
        <section className="space-y-2">
          <h3 className="font-medium text-[var(--color-ink)]">Perbandingan cepat</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-[var(--color-muted)] border-b border-[var(--color-line)]">
                  <th className="text-left py-1.5 pr-3 font-medium">Hal</th>
                  <th className="text-left py-1.5 pr-3 font-medium">Mosaic</th>
                  <th className="text-left py-1.5 font-medium">Carousel</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-muted)]">
                {[
                  ['Tujuan', 'Feed seamless di grid profil', 'Album geser (swipe)'],
                  ['Overlap', '68 px', '0 px'],
                  ['Step kolom', '1012 px', '1080 px'],
                  ['Desain 3 kol', '3104 px', '3240 px'],
                  ['Upload order', 'Terbalik', 'Normal'],
                  ['Nama file', 'upload-01_r1-c3.png', 'slide-1.png'],
                ].map(([label, mosaic, carousel]) => (
                  <tr key={label} className="border-b border-[var(--color-line)]/50">
                    <td className="py-1.5 pr-3 text-[var(--color-ink)] font-medium">{label}</td>
                    <td className="py-1.5 pr-3">{mosaic}</td>
                    <td className="py-1.5">{carousel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <button
          onClick={onClose}
          className="w-full rounded-lg py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] border border-[var(--color-line)] transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
