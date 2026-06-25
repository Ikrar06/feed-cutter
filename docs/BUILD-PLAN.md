# Feed Cutter — Rencana Build per Fase (untuk Claude Code)

> Kerjakan **berurutan**. Tiap fase punya tujuan, file yang disentuh, kriteria selesai yang **bisa diverifikasi**, dan commit. Jangan lompat fase. Selesaikan satu fase, commit, baru lanjut.

**Prinsip:** logika dulu (terverifikasi lewat test), UI belakangan. Itu yang menjamin potongan presisi.

---

## Fase 0 — Scaffold

**Tujuan:** proyek jalan + Tailwind aktif + kerangka folder ada.

**Aksi:**
- Scaffold `npm create vite@latest . -- --template react-ts` (atau sesuaikan).
- Install: `jszip`, `tailwindcss`, `@tailwindcss/vite`, (dev) `vitest`.
- Setup `vite.config.ts` (plugin `react()` + `tailwindcss()`), `src/index.css` (`@import "tailwindcss";` + blok `@theme`).
- Buat folder kosong: `src/lib/`, `src/hooks/`, `src/components/`, `docs/`.
- Pindahkan ketiga MD ke `docs/`.

**Selesai bila:**
- `npm run dev` jalan tanpa error.
- Satu class Tailwind (mis. `text-3xl font-bold`) tampil benar di `App.tsx`.

**Commit:** `chore: scaffold vite + react + ts + tailwind v4`

---

## Fase 1 — Engine inti (PALING PENTING) ⭐

**Tujuan:** semua logika piksel di `src/lib/`, terbukti benar lewat test. Belum ada UI.

**File:** `src/types.ts`, `src/lib/config.ts`, `src/lib/feedMath.ts`, `src/lib/naming.ts`, `src/lib/validate.ts`, `src/lib/feedMath.test.ts`.

**Aksi:** implementasikan persis seperti `docs/BUILD-GUIDE-feed-cutter.md` §4–§5. Tambahkan test dari §12.

**Selesai bila (`npx vitest` hijau):**
- `designSize(1×3) = {3104, 1350}`, `2×3 = {3104, 2700}`, `1×1 = {1080, 1350}`.
- `planTiles(1×3).sx = [0, 1012, 2024]`.
- Kolom terakhir: `sx + 1080 === lebarDesain` (tidak ada area kosong).
- Mode `mosaic`: `uploadOrder` terbalik (reading 0,1,2 → upload 3,2,1).
- Mode `carousel`: `uploadOrder` normal (1,2,3).

**Commit:** `feat(lib): core feed math + tile planner with passing tests`

---

## Fase 2 — Cutting + UI minimal yang berfungsi

**Tujuan:** bisa upload desain → potong → download per file. (MVP fungsional.)

**File:** `src/lib/loadImage.ts`, `src/lib/cutter.ts`, `src/lib/download.ts`, `src/hooks/useFeedCutter.ts`, `src/components/GridPicker.tsx`, `src/components/TargetSizeBadge.tsx`, `src/components/Dropzone.tsx`, `src/App.tsx`.

**Aksi:** ikuti BUILD-GUIDE §5–§7. UI seadanya dulu (fungsi > estetika).

**Selesai bila (uji manual):**
- Pilih grid 1×3 → badge tampil "3104 × 1350 px".
- Upload PNG `3104×1350` → tombol Potong menghasilkan **3 file**.
- Tiap file hasil **tepat `1080×1350`** (cek properti gambar).
- Sambungan visual mulus saat 3 file ditempel berurutan.
- **Presisi:** `canvas.width/height` di-set piksel asli; `drawImage` 8-arg; output PNG.

**Commit:** `feat: working cut + per-tile download (MVP)`

---

## Fase 3 — Preview board (bar overlap merah + seam)

**Tujuan:** preview visual seperti diagram referensi.

**File:** `src/components/PreviewBoard.tsx`.

**Aksi:** ikuti BUILD-GUIDE §8 (skala `k = boardWidth / design.width`).

**Selesai bila:**
- Untuk 1×3: bar merah muncul di desain `x=1012` & `x=2024` (lebar 68), seam di `x=1046` & `x=2058`.
- Multi-baris: pola sama horizontal; **tidak ada** bar merah vertikal.
- Preview ikut berubah saat grid diganti.

**Commit:** `feat: preview board with overlap bars and seam guides`

---

## Fase 4 — ZIP + manifest + label urutan upload

**Tujuan:** download sekaligus + bantu user tahu urutan posting.

**File:** `src/lib/zip.ts`, `src/components/ResultGrid.tsx`, `src/components/TileCard.tsx`.

**Selesai bila:**
- Tiap potongan menampilkan badge **"Upload ke-N"** sesuai `uploadOrder`.
- Tombol "Download semua (ZIP)" menghasilkan zip berisi semua PNG + `manifest.txt`.
- Nama file sesuai `naming.ts` (mis. `upload-01_r1-c3.png`).

**Commit:** `feat: zip bundle, manifest, and upload-order labels`

---

## Fase 5 — Mode, validasi, & state UX

**Tujuan:** robust terhadap input salah + dukung carousel.

**File:** `src/components/AdvancedPanel.tsx`, update `Dropzone.tsx` & hook.

**Selesai bila:**
- Toggle **Mosaic / Carousel** mengubah urutan & penamaan file.
- Upload ukuran salah: muncul status `ok` / `scalable` / `distort` (validate.ts) dengan pesan jelas.
- Empty state ("Tarik desainmu ke sini…") & error state tampil benar.
- AdvancedPanel bisa ubah konstanta (`postW/visible/bleed`) dan target ikut menyesuaikan.

**Commit:** `feat: mode toggle, size validation, empty/error states`

---

## Fase 6 — Polish + deploy

**Tujuan:** rapi, aksesibel, live di Vercel.

**Selesai bila:**
- Responsif sampai mobile; fokus keyboard terlihat; `prefers-reduced-motion` dihormati.
- `npm run build` sukses tanpa error TS.
- Ter-deploy ke Vercel (preset Vite auto; output `dist/`). URL hidup.

**Commit:** `chore: a11y, responsive polish, deploy config`

---

## Cara memulai sesi Claude Code

1. Taruh `CLAUDE.md` di root, ketiga MD di `docs/`.
2. Buka Claude Code di folder proyek.
3. Pakai **plan mode** dulu untuk tiap fase besar (minta rencana sebelum eksekusi).
4. Prompt pembuka yang disarankan:

> Baca `CLAUDE.md` dan `docs/BUILD-PLAN.md`. Kerjakan **Fase 0 dan Fase 1** saja. Untuk Fase 1, implementasikan `src/lib/` sesuai `docs/BUILD-GUIDE-feed-cutter.md` lalu pastikan `npx vitest` hijau sebelum berhenti. Jangan menyentuh UI dulu. Tunjukkan hasil test sebelum commit.

5. Setelah hijau & commit, lanjut: *"Lanjut Fase 2 sesuai BUILD-PLAN. Berhenti di kriteria selesai Fase 2 dan tunjukkan cara mengujinya manual."*
6. Lanjutkan fase demi fase. Satu fase = satu fokus = satu commit.

**Kenapa per fase:** Claude Code paling andal saat tugas dibatasi & punya gerbang verifikasi (test). Menyuruh "buat semuanya" sekaligus cenderung melewatkan detail presisi. Fase 1 yang terverifikasi test adalah jaminan utama potongan akurat.
