# Feed Cutter — Panduan Build (React + TypeScript + Vercel)

> Panduan teknis lengkap untuk membangun & men-deploy tool pemotong feed Instagram seamless. Dokumen ini melengkapi `SPEC-feed-cutter.md` (yang berisi matematika & konsep). Fokus dokumen ini: **stack, struktur kode, kode inti yang presisi, dan deployment.**

---

## 0. Rekomendasi Stack (dan alasannya)

**Pilihan: Vite + React + TypeScript + Tailwind v4.**

| Kebutuhan app | Implikasi |
|---|---|
| Semua proses (decode, crop, zip) jalan di **browser** | Tidak butuh backend / API route / SSR |
| Tidak ada database, auth, atau data dinamis | Tidak butuh server runtime |
| Output = SPA statis | Cukup di-host sebagai file statis |

### Vite vs Next.js

| | **Vite (REKOMENDASI)** | Next.js |
|---|---|---|
| Cocok untuk | SPA murni client-side | App dengan SSR/API/route |
| Build | `dist/` statis, super cepat | Lebih berat, butuh runtime untuk fitur server |
| Deploy Vercel | Auto-detect, output statis | Auto-detect (buatan Vercel) |
| Untuk kasus ini | Pas — ringan, simpel | Overkill — tidak ada fitur server yang dipakai |

Karena tidak ada satu pun fitur server yang dibutuhkan, **Vite lebih tepat**: lebih ringan, build lebih cepat, dan deploy ke Vercel tetap mulus (Vercel mengenali Vite otomatis). Kalau Anda lebih nyaman dengan Next.js (App Router, semua komponen `"use client"`), tetap bisa — semua kode inti di §5 identik; hanya setup Tailwind yang lewat `@tailwindcss/postcss` bukan plugin Vite.

---

## 1. Tech Stack Final

| Lapisan | Pilihan | Versi target | Kenapa |
|---|---|---|---|
| Build tool | **Vite** | 6/7+ | Dev server instan, build statis untuk Vercel |
| UI | **React** | 19 | Komponen, familiar |
| Bahasa | **TypeScript** | 5+ | Tipe aman untuk logika piksel yang presisi |
| Styling | **Tailwind CSS v4** | 4.3+ | Setup nol-config via plugin Vite |
| Pemotongan | **Canvas API** (`drawImage`/`toBlob`) | native | Presisi piksel, lossless, tanpa lib |
| Decode gambar | **`createImageBitmap`** | native | Cepat, hormati orientasi EXIF |
| Bundling ZIP | **JSZip** | 3.10+ | Download semua sekaligus |
| Download | `Blob` + `URL.createObjectURL` | native | Tanpa library tambahan |
| Test (opsional) | **Vitest** | 2+ | Unit test fungsi matematika |
| Hosting | **Vercel** | — | Deploy dari Git, gratis untuk proyek ini |

**Prasyarat:** Node.js **20.19+** atau **22.12+** (syarat Vite terbaru). Cek dengan `node -v`.

---

## 2. Scaffold Proyek (perintah akurat)

```bash
# 1. Buat proyek Vite + React + TypeScript
npm create vite@latest feed-cutter -- --template react-ts
cd feed-cutter

# 2. Dependensi runtime
npm install jszip

# 3. Tailwind v4 (plugin Vite — tanpa tailwind.config.js / postcss.config.js)
npm install tailwindcss @tailwindcss/vite

# 4. Install sisanya & jalankan
npm install
npm run dev
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### `src/index.css` (satu baris import + design tokens v4)

```css
@import "tailwindcss";

/* Design tokens (CSS-first, khas Tailwind v4) — sesuaikan dengan brand Anda */
@theme {
  --color-bg:      #0E0F11;   /* workspace gelap */
  --color-panel:   #16181B;
  --color-line:    #2A2E33;   /* hairline */
  --color-ink:     #E8EAED;   /* teks utama */
  --color-muted:   #8A9099;   /* teks sekunder */
  --color-blade:   #FF453A;   /* aksen merah = zona overlap (nyambung dgn diagram) */
}
```

> **Catatan Tailwind v4:** tidak ada `tailwind.config.js`, tidak ada `@tailwind base/components/utilities`, tidak ada PostCSS/autoprefixer. Cukup `@import "tailwindcss";` dan token di blok `@theme`.

---

## 3. Struktur Folder

```
feed-cutter/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json                 # opsional (lihat §9)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts                # semua interface/tipe
    ├── lib/                     # ── LOGIKA INTI (pure, bisa di-unit-test) ──
    │   ├── config.ts           # konstanta CutConfig + turunannya
    │   ├── feedMath.ts         # designSize(), planTiles()
    │   ├── cutter.ts           # cutTile() — Canvas
    │   ├── loadImage.ts        # decode File → ImageBitmap
    │   ├── validate.ts         # validateSize()
    │   ├── naming.ts           # nama file + manifest.txt
    │   ├── zip.ts              # bundleZip()
    │   └── download.ts         # downloadBlob()
    ├── hooks/
    │   └── useFeedCutter.ts    # orkestrasi state app
    └── components/
        ├── GridPicker.tsx      # preset + input kolom/baris
        ├── TargetSizeBadge.tsx # "Buat desain 3104×1350"
        ├── Dropzone.tsx        # upload + drag-drop + validasi
        ├── PreviewBoard.tsx    # preview + bar overlap merah + seam
        ├── ResultGrid.tsx      # grid hasil
        ├── TileCard.tsx        # 1 potongan + label "Upload ke-N"
        └── AdvancedPanel.tsx   # toggle mode + konstanta configurable
```

Pemisahan **`lib/` (murni, tanpa React)** dari **`components/` (UI)** itu sengaja: logika presisi bisa diuji terpisah dan tidak tercampur kekhawatiran rendering.

---

## 4. Tipe Data (`src/types.ts`)

```ts
export interface CutConfig {
  postW: number;    // 1080
  postH: number;    // 1350
  visible: number;  // 1012
  bleed: number;    // 34
}

export interface GridSpec {
  cols: number;     // C
  rows: number;     // R
}

export interface DesignSize {
  width: number;
  height: number;
}

export type CutMode = 'mosaic' | 'carousel';
export type ExportFormat = 'png' | 'jpeg';

export interface TileSpec {
  row: number;
  col: number;
  sx: number;          // titik potong X di koordinat desain
  sy: number;          // titik potong Y di koordinat desain
  readingIndex: number; // 0-based, urut baca grid (kiri→kanan, atas→bawah)
  uploadOrder: number;  // 1-based, urut posting kronologis
}

export interface TileResult extends TileSpec {
  blob: Blob;
  url: string;          // object URL untuk preview & download
  filename: string;
}
```

---

## 5. Logika Inti (presisi — ini jantungnya)

### `src/lib/config.ts`

```ts
import type { CutConfig } from '../types';

export const DEFAULT_CONFIG: CutConfig = {
  postW: 1080,
  postH: 1350,
  visible: 1012,
  bleed: 34,
};

// turunan otomatis
export const overlap = (c: CutConfig) => c.bleed * 2; // 68
export const stepX   = (c: CutConfig) => c.visible;    // 1012  (geser horizontal)
export const stepY   = (c: CutConfig) => c.postH;      // 1350  (geser vertikal)
```

### `src/lib/feedMath.ts`

```ts
import type { CutConfig, GridSpec, DesignSize, TileSpec, CutMode } from '../types';
import { DEFAULT_CONFIG, overlap, stepX, stepY } from './config';

/** Ukuran desain target: lebar = C×visible + overlap, tinggi = R×postH */
export function designSize(grid: GridSpec, cfg: CutConfig = DEFAULT_CONFIG): DesignSize {
  return {
    width:  grid.cols * cfg.visible + overlap(cfg), // C×1012 + 68
    height: grid.rows * cfg.postH,                  // R×1350
  };
}

/** Rencana semua potongan: titik crop + urutan baca + urutan upload */
export function planTiles(
  grid: GridSpec,
  mode: CutMode = 'mosaic',
  cfg: CutConfig = DEFAULT_CONFIG,
): TileSpec[] {
  const total = grid.cols * grid.rows;
  const tiles: TileSpec[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const readingIndex = row * grid.cols + col;
      tiles.push({
        row, col,
        sx: col * stepX(cfg),   // geser per 1012, BUKAN 1080
        sy: row * stepY(cfg),   // geser per 1350
        readingIndex,
        // mosaic: upload terbalik (IG taruh terbaru di kiri-atas)
        // carousel: urut normal kiri→kanan
        uploadOrder: mode === 'mosaic' ? total - readingIndex : readingIndex + 1,
      });
    }
  }
  return tiles;
}
```

### `src/lib/loadImage.ts`

```ts
/** Decode File jadi ImageBitmap (cepat, hormati orientasi). ImageBitmap = CanvasImageSource valid. */
export async function loadImage(file: File): Promise<ImageBitmap> {
  return await createImageBitmap(file);
}
```

### `src/lib/cutter.ts` — **bagian paling kritis untuk presisi**

```ts
import type { CutConfig, TileSpec, ExportFormat } from '../types';
import { DEFAULT_CONFIG } from './config';

export async function cutTile(
  source: CanvasImageSource,
  tile: TileSpec,
  cfg: CutConfig = DEFAULT_CONFIG,
  format: ExportFormat = 'png',
  quality = 1,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  // WAJIB set ukuran piksel kanvas, BUKAN ukuran CSS. Ini sumber error presisi #1.
  canvas.width = cfg.postW;   // 1080
  canvas.height = cfg.postH;  // 1350

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D tidak tersedia di browser ini.');

  // Copy 1:1 — ukuran sumber == ukuran tujuan → tanpa interpolasi, tepi tetap tajam.
  ctx.drawImage(
    source,
    tile.sx, tile.sy, cfg.postW, cfg.postH,  // crop dari desain (source rect)
    0, 0, cfg.postW, cfg.postH,              // gambar penuh ke kanvas (dest rect)
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Gagal meng-encode gambar.'))),
      format === 'png' ? 'image/png' : 'image/jpeg',
      quality, // diabaikan untuk png
    );
  });
}
```

> **3 jebakan presisi yang dicegah kode di atas:**
> 1. `canvas.width/height` di-set ke **piksel asli** (1080×1350), bukan lewat CSS. Kalau pakai CSS, hasil ter-scale & buram.
> 2. **`drawImage` 8-argumen** dengan source-rect == dest-rect → copy piksel 1:1, nol interpolasi.
> 3. Default **PNG (lossless)** → tidak ada artefak JPEG di garis sambungan.

### `src/lib/validate.ts`

```ts
import type { GridSpec, CutConfig, DesignSize } from '../types';
import { designSize } from './feedMath';
import { DEFAULT_CONFIG } from './config';

export interface Validation {
  ok: boolean;
  level: 'ok' | 'scalable' | 'distort';
  expected: DesignSize;
  actual: DesignSize;
  message: string;
}

export function validateSize(
  actual: DesignSize,
  grid: GridSpec,
  cfg: CutConfig = DEFAULT_CONFIG,
): Validation {
  const expected = designSize(grid, cfg);
  const exact = actual.width === expected.width && actual.height === expected.height;
  const ratioOk =
    Math.abs(actual.width / actual.height - expected.width / expected.height) < 0.001;

  if (exact) {
    return { ok: true, level: 'ok', expected, actual,
      message: `Pas — ${expected.width}×${expected.height}px.` };
  }
  if (ratioOk) {
    return { ok: false, level: 'scalable', expected, actual,
      message: `Rasio benar, ukuran beda. Bisa di-scale ke ${expected.width}×${expected.height}px.` };
  }
  return { ok: false, level: 'distort', expected, actual,
    message: `Ukuran harus ${expected.width}×${expected.height}px. Punyamu ${actual.width}×${actual.height}px — hasilnya bisa gepeng.` };
}
```

### `src/lib/naming.ts`

```ts
import type { TileSpec, CutMode, GridSpec, DesignSize } from '../types';

export function tileFilename(t: TileSpec, mode: CutMode): string {
  if (mode === 'carousel') return `slide-${t.readingIndex + 1}.png`;
  const ord = String(t.uploadOrder).padStart(2, '0');
  return `upload-${ord}_r${t.row + 1}-c${t.col + 1}.png`;
}

export function buildManifest(
  tiles: TileSpec[], grid: GridSpec, design: DesignSize, mode: CutMode,
): string {
  const order = [...tiles].sort((a, b) => a.uploadOrder - b.uploadOrder);
  const lines = order.map(
    (t) => `  ${t.uploadOrder}. r${t.row + 1}-c${t.col + 1}`,
  );
  return [
    `Feed Cutter — ${grid.rows} baris × ${grid.cols} kolom`,
    `Ukuran desain: ${design.width} × ${design.height} px`,
    `Tiap potongan: 1080 × 1350 px`,
    ``,
    `Mode: ${mode.toUpperCase()}${mode === 'mosaic' ? ' (upload terbalik)' : ''}`,
    `Urutan upload:`,
    ...lines,
  ].join('\n');
}
```

### `src/lib/zip.ts`

```ts
import JSZip from 'jszip';

export async function bundleZip(
  files: { name: string; blob: Blob }[],
  manifest?: string,
): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  if (manifest) zip.file('manifest.txt', manifest);
  return zip.generateAsync({ type: 'blob' });
}
```

### `src/lib/download.ts`

```ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url); // bersihkan memori
}
```

---

## 6. State Orkestrasi (`src/hooks/useFeedCutter.ts`)

Untuk app sekecil ini, satu custom hook sudah cukup (tidak perlu Zustand/Redux).

```ts
import { useCallback, useEffect, useState } from 'react';
import type { GridSpec, CutMode, CutConfig, TileResult } from '../types';
import { DEFAULT_CONFIG } from '../lib/config';
import { planTiles, designSize } from '../lib/feedMath';
import { loadImage } from '../lib/loadImage';
import { cutTile } from '../lib/cutter';
import { tileFilename } from '../lib/naming';

type Status = 'idle' | 'ready' | 'cutting' | 'done' | 'error';

export function useFeedCutter() {
  const [grid, setGrid] = useState<GridSpec>({ cols: 3, rows: 1 });
  const [mode, setMode] = useState<CutMode>('mosaic');
  const [cfg] = useState<CutConfig>(DEFAULT_CONFIG);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<TileResult[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const target = designSize(grid, cfg);

  // bersihkan object URL lama agar tidak bocor memori
  const clearResults = useCallback(() => {
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setStatus('cutting');
    setError(null);
    clearResults();
    try {
      const bitmap = await loadImage(file);
      const specs = planTiles(grid, mode, cfg);
      const out: TileResult[] = [];
      for (const spec of specs) {
        const blob = await cutTile(bitmap, spec, cfg);
        out.push({
          ...spec,
          blob,
          url: URL.createObjectURL(blob),
          filename: tileFilename(spec, mode),
        });
      }
      bitmap.close?.();
      setResults(out);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      setStatus('error');
    }
  }, [file, grid, mode, cfg, clearResults]);

  useEffect(() => () => clearResults(), [clearResults]); // cleanup saat unmount

  return { grid, setGrid, mode, setMode, cfg, file, setFile,
           target, results, status, error, run, clearResults };
}
```

---

## 7. Komponen UI (kontrak singkat)

| Komponen | Props utama | Tugas |
|---|---|---|
| `GridPicker` | `grid`, `onChange` | Preset (1×2, 1×3, 2×3, 3×3) + input manual kolom/baris (batasi 1–6 × 1–4). |
| `TargetSizeBadge` | `target` | Tampilkan live: "Buat desain **3104 × 1350 px**". |
| `Dropzone` | `target`, `onFile`, `validation` | Drag-drop + klik; baca dimensi gambar; tampilkan status validasi (ok/scalable/distort). |
| `PreviewBoard` | `grid`, `cfg`, `imageUrl?` | Render papan preview + **bar overlap merah** + garis seam (lihat §8). |
| `ResultGrid` | `results`, `onDownloadAll` | Susun hasil + tombol "Download semua (ZIP)". |
| `TileCard` | `result` | Thumbnail + badge "**Upload ke-N**" + tombol download per file. |
| `AdvancedPanel` | `mode`, `cfg`, `onChange` | Toggle Mosaic/Carousel + ubah konstanta (postW, visible, bleed). |

### Alur di `App.tsx`

```
GridPicker → TargetSizeBadge → Dropzone → PreviewBoard
   → [tombol Potong] → ResultGrid (TileCard…) → Download/ZIP
AdvancedPanel selalu tersedia (collapsible).
```

---

## 8. Detail `PreviewBoard` (bar merah seperti diagram Anda)

Render desain (atau placeholder abu-abu) yang **di-scale** ke lebar papan, lalu overlay zona overlap & seam memakai koordinat desain × faktor skala `k = boardWidth / design.width`.

Untuk tiap batas antara kolom `c` dan `c+1` (ada `cols−1` batas):

```ts
const overlapLeftPx = (c + 1) * cfg.visible;        // tepi kiri zona overlap (desain)
const overlapWidthPx = cfg.bleed * 2;               // 68px
const seamPx = (c + 1) * cfg.visible + cfg.bleed;   // garis sambungan
// posisi di papan:
const left  = overlapLeftPx  * k;
const width = overlapWidthPx * k;
const seam  = seamPx * k;
```

Gambar:
- **Bar merah** semi-transparan di `left` selebar `width` → ini area yang "dipotong/overlap" (cocok dengan bar merah 34px×2 di diagram Anda).
- **Garis tipis** di `seam` → titik sambungan visual antar post.
- Untuk multi-baris, ulangi pola yang sama; vertikal **tanpa** bar merah (tidak ada overlap vertikal).

Konsistensi cek: untuk 1×3, bar merah muncul di desain x=1012 (lebar 68) dan x=2024 (lebar 68); seam di x=1046 dan x=2058 — sama persis dengan `SPEC-feed-cutter.md` §4.

---

## 9. Deployment ke Vercel

### Langkah

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Di Vercel → **Add New → Project** → import repo.
3. Vercel auto-deteksi **Framework Preset: Vite**. Biarkan default:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Tidak ada environment variable** yang dibutuhkan (semua client-side).
5. **Deploy.** Selesai — dapat URL `*.vercel.app`. Setiap push ke branch utama auto-redeploy.

### `vercel.json` (opsional)

Untuk SPA satu halaman tanpa client routing, **tidak perlu** file ini. Tambahkan **hanya jika** nanti memakai `react-router` agar refresh di sub-path tidak 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Catatan
- Pastikan Node version di Vercel cocok (Project Settings → Node.js 20.x/22.x).
- `dist/` cukup di-`.gitignore` — Vercel build sendiri dari source.

---

## 10. `package.json` (referensi dependency)

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "vite": "^7.0.0",
    "tailwindcss": "^4.3.0",
    "@tailwindcss/vite": "^4.3.0"
  }
}
```

*(Versi minor mengikuti yang terbaru saat `npm install`; angka di atas indikatif.)*

---

## 11. Urutan Build (saran tahapan)

1. **Engine dulu** — tulis & uji `lib/` (config, feedMath, cutter, validate, naming). Tanpa UI. Pastikan `designSize` & `planTiles` lulus test (§12).
2. **Hook** — `useFeedCutter`, sambungkan engine.
3. **UI minimal** — GridPicker + Dropzone + tombol Potong + ResultGrid (download per file). Sudah bisa dipakai.
4. **Preview** — PreviewBoard dengan bar merah & seam.
5. **ZIP + manifest + label urutan upload.**
6. **AdvancedPanel** (mode toggle + konstanta) + polish (drag-drop, validasi rasio, empty/error state).
7. **A11y & responsif** — fokus keyboard terlihat, `prefers-reduced-motion`, layout mobile.
8. **Deploy ke Vercel.**

---

## 12. Testing (Vitest — opsional tapi disarankan)

```bash
npm install -D vitest
```

`src/lib/feedMath.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { designSize, planTiles } from './feedMath';

describe('designSize', () => {
  it('1×3 = 3104×1350', () => {
    expect(designSize({ cols: 3, rows: 1 })).toEqual({ width: 3104, height: 1350 });
  });
  it('2×3 = 3104×2700', () => {
    expect(designSize({ cols: 3, rows: 2 })).toEqual({ width: 3104, height: 2700 });
  });
  it('1×1 = 1080×1350', () => {
    expect(designSize({ cols: 1, rows: 1 })).toEqual({ width: 1080, height: 1350 });
  });
});

describe('planTiles', () => {
  it('geser horizontal per 1012', () => {
    const t = planTiles({ cols: 3, rows: 1 });
    expect(t.map((x) => x.sx)).toEqual([0, 1012, 2024]);
  });
  it('kolom terakhir berhenti tepat di tepi desain', () => {
    const t = planTiles({ cols: 3, rows: 1 });
    const last = t[t.length - 1];
    expect(last.sx + 1080).toBe(designSize({ cols: 3, rows: 1 }).width); // 3104
  });
  it('mosaic mengupload terbalik', () => {
    const t = planTiles({ cols: 3, rows: 1 }, 'mosaic');
    // reading 0,1,2 → upload 3,2,1
    expect(t.map((x) => x.uploadOrder)).toEqual([3, 2, 1]);
  });
});
```

Jalankan: `npx vitest`. Kalau semua hijau, matematika presisi terjamin sebelum sentuh UI.

---

## 13. Catatan Performa & Lanjutan (opsional)

- **Batch besar** (mis. 3×3 = 9 potongan dari desain 3104×4050): tetap cepat. Loop `cutTile` berurutan sudah cukup; tampilkan progress bar bila ingin.
- **Sangat besar / banyak**: pertimbangkan `OffscreenCanvas` di **Web Worker** agar UI tidak nge-freeze. Tidak wajib untuk MVP.
- **Memori:** selalu `URL.revokeObjectURL` saat hasil diganti/komponen unmount (sudah ada di hook). `bitmap.close()` setelah selesai memotong.
- **Kualitas:** default PNG. Sediakan opsi JPEG quality 1.0 di AdvancedPanel hanya bila user butuh file lebih kecil.

---

## Ringkasan

**Stack:** Vite + React + TS + Tailwind v4, semua client-side, deploy statis ke Vercel.
**Inti presisi:** geser `sx = col × 1012`, potong `1080×1350` via `drawImage` 1:1, export PNG lossless.
**Pembeda yang sering dilupakan:** validasi ukuran desain + **urutan upload terbalik** untuk mosaic.
Bangun `lib/` dulu, uji dengan Vitest, baru lapisi UI — itu cara paling aman menjamin potongan "presisi dan sempurna".
