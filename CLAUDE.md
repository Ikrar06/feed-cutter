# CLAUDE.md

Konteks proyek untuk Claude Code. File ini dibaca otomatis tiap sesi — jaga tetap ringkas.

## Proyek

**Feed Cutter** — tool web yang memotong satu desain besar menjadi beberapa postingan Instagram `1080×1350` yang tersambung mulus (seamless) di grid profil. **100% client-side**, semua proses (decode, crop, zip) jalan di browser. Tidak ada backend, database, auth, atau SSR.

## Dokumen rujukan (BACA DULU sebelum mulai)

- `docs/SPEC-feed-cutter.md` — matematika, anatomi overlap, algoritma. **Otoritatif untuk semua angka.**
- `docs/BUILD-GUIDE-feed-cutter.md` — stack, struktur file, kode inti TypeScript, deployment.
- `docs/BUILD-PLAN.md` — rencana per-fase + kriteria selesai. **Kerjakan fase berurutan.**

## Stack

Vite + React 19 + TypeScript (strict) + Tailwind CSS v4. Deploy statis ke Vercel.
Tailwind v4: token di `@theme` dalam `src/index.css`. **Tidak ada** `tailwind.config.js` / `postcss.config.js` / autoprefixer.

## Perintah

| Aksi | Perintah |
|---|---|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Test | `npx vitest` |
| Preview build | `npm run preview` |

## Matematika yang TIDAK BOLEH SALAH

- Post `1080×1350`. Terlihat di grid `1012`. Bleed `34`/sisi. Overlap `68`.
- **Lebar desain** = `cols × 1012 + 68`. **Tinggi desain** = `rows × 1350`.
- **Step horizontal = 1012** (BUKAN 1080). Step vertikal = 1350.
- Patokan verifikasi: `1×3 → 3104×1350`, `2×3 → 3104×2700`, `1×1 → 1080×1350`.

## Aturan arsitektur

- `src/lib/` harus **PURE** — tanpa import React. Semua matematika piksel + Canvas di sini.
- UI di `src/components/`. State di `src/hooks/useFeedCutter.ts`.
- **Presisi Canvas:** set `canvas.width/height` ke piksel asli (bukan CSS); `drawImage` 8-argumen copy 1:1; export **PNG lossless**.
- Konstanta di `src/lib/config.ts` (`CutConfig`) — selalu configurable, jangan hardcode tersebar.
- **Jangan** pakai `localStorage`/`sessionStorage`.
- Selalu `URL.revokeObjectURL` saat hasil diganti / komponen unmount; `bitmap.close()` setelah memotong.

## Konvensi

- TypeScript strict; tipe eksplisit di signature fungsi `lib/`.
- Fungsi `lib/` murni & deterministik agar mudah di-unit-test (Vitest).
- Pesan UI berbahasa Indonesia, lugas, non-teknis (contoh error/empty di SPEC §10).

## Definition of Done

Sebuah fase selesai bila: kriteria di `docs/BUILD-PLAN.md` terpenuhi **dan** `npx vitest` hijau (untuk fase yang punya test). Commit di akhir tiap fase.
