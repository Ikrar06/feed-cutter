# Feed Cutter — Spesifikasi Mini Project

> Tool web sederhana (100% client-side) untuk memotong satu desain besar menjadi beberapa postingan Instagram **1080×1350** yang tersambung mulus (seamless) di grid profil.

---

## 1. Tujuan

Pengguna meng-upload **satu file desain utuh**, memilih ukuran grid (mis. 1×3, 2×3), lalu tool memotongnya secara otomatis menjadi potongan-potongan `1080×1350 px` yang:

1. Tetap valid sebagai postingan **4:5** (1080×1350).
2. Saat tampil di **grid view 3:4** profil, sambungan antar potongan terlihat **mulus tanpa garis patah**.
3. Bisa di-download satu per satu atau sekaligus (ZIP), lengkap dengan **urutan upload** yang benar.

Tidak ada server, tidak ada upload ke cloud. Semua proses berjalan di browser pakai Canvas API → cepat, privat, gratis.

---

## 2. Istilah & Konsep Dasar

| Istilah | Nilai | Penjelasan |
|---|---|---|
| **Post size** | `1080 × 1350` | Ukuran asli 1 postingan, rasio **4:5**. Ini yang benar-benar di-upload ke IG. |
| **Grid view** | `1012 × 1350` | Yang **terlihat** di grid profil, rasio **3:4**. IG memotong sisi kiri-kanan. |
| **Bleed / margin tersembunyi** | `34 px` per sisi | Bagian yang dipotong IG di grid view (kiri 34px + kanan 34px). |
| **Overlap** | `68 px` | Area tumpang-tindih antara dua post bersebelahan (= 34 + 34). |
| **Step horizontal** | `1012 px` | Jarak geser tiap potongan ke kanan (= lebar visible). **Bukan 1080.** |
| **Step vertikal** | `1350 px` | Tidak ada overlap vertikal, geser penuh. |

**Catatan pembulatan:** Secara murni, 3:4 dari tinggi 1350 = `1350 × 3/4 = 1012.5 px`, dan bleed = `33.75 px`. Untuk presisi piksel-bulat, kita kunci ke himpunan integer yang konsisten:

```
1080 = 1012 + 34 + 34   →  visible + bleed kiri + bleed kanan
```

Set `{1080, 1012, 34, 68}` ini saling konsisten tanpa pecahan, jadi tidak ada drift sub-piksel walau dipakai untuk banyak kolom. Semua nilai ini dibuat **configurable** supaya aman kalau IG mengubah rasio grid lagi.

---

## 3. Matematika Inti (verifikasi angka Anda)

### 3.1. Ukuran desain

Karena potongan **digeser per 1012 px** tapi tiap potongan tetap **1080 px lebar**, setiap pasangan post bersebelahan saling overlap **68 px**. Maka:

```
Lebar desain  = C × 1080 − (C − 1) × 68
              = C × 1012 + 68

Tinggi desain = R × 1350
```

di mana `C` = jumlah kolom, `R` = jumlah baris.

### 3.2. Tabel verifikasi

| Layout (R×C) | Rumus lebar | Lebar | Rumus tinggi | Tinggi | Hasil |
|---|---|---|---|---|---|
| 1×1 | 1×1012+68 | **1080** | 1×1350 | **1350** | 1080×1350 |
| 1×2 | 2×1012+68 | **2092** | 1×1350 | **1350** | 2092×1350 |
| **1×3** | 3×1012+68 | **3104** | 1×1350 | **1350** | **3104×1350** ✅ |
| **2×3** | 3×1012+68 | **3104** | 2×1350 | **2700** | **3104×2700** ✅ |
| 3×3 | 3×1012+68 | **3104** | 3×1350 | **4050** | 3104×4050 |

➡️ **Angka Anda benar.** 1×3 = `3104×1350` dan 2×3 = `3104×2700` keduanya cocok dengan rumus.

### 3.3. Kenapa step-nya 1012, bukan 1080? (ini kunci yang sering bikin salah)

Kalau kita geser per **1080**, tiap post berdiri sendiri tanpa overlap → di grid view (yang dipotong jadi 1012) akan muncul **celah/loncatan** karena 68px tiap post hilang dan tidak ada yang menggantikan.

Solusinya: geser hanya **1012 px** (selebar area yang terlihat). Sisa **68 px** dari tiap post overlap dengan tetangganya. Konten di zona overlap **diduplikasi** di kedua post (di bagian bleed yang tersembunyi), sehingga saat IG memotong, sambungannya pas.

---

## 4. Anatomi Overlap (kenapa bisa mulus)

Contoh 1×3, desain lebar 3104. Posisi tiap post di koordinat desain:

```
DESAIN (lebar 3104 px)
0        1012      2024            3104
|---------|---------|---------------|
|====== POST A (0 → 1080) ======|
          |====== POST B (1012 → 2092) ======|
                    |====== POST C (2024 → 3104) ======|
```

Sekarang pisahkan tiap post jadi **bleed (tersembunyi)** vs **visible (terlihat di grid)**:

```
            bleed                visible               bleed
            34px                 1012px                34px
POST A:  [  0 – 34  ] [        34 – 1046         ] [ 1046 – 1080 ]
POST B:  [1012 –1046] [      1046 – 2058         ] [ 2058 – 2092 ]
POST C:  [2024 –2058] [      2058 – 3070         ] [ 3070 – 3104 ]
```

**Yang terlihat di grid** = gabungan area visible:

```
[34 – 1046] + [1046 – 2058] + [2058 – 3070]  =  [34 – 3070]  =  3036 px  =  3 × 1012 ✅
```

Sambungan (seam) jatuh tepat di **x = 1046** (A↔B) dan **x = 2058** (B↔C). Karena zona overlap [1012–1080] ada utuh di pixel A maupun B, sambungan tak terlihat. Bleed paling luar — `[0–34]` (kiri A) dan `[3070–3104]` (kanan C) — memang sengaja dikorbankan IG, jadi **jangan taruh elemen penting di 34px terluar desain.**

> **Aturan desain untuk user:** elemen penting (teks, logo, wajah) aman diletakkan di area visible `[34 … lebar−34]`. Zona merah/overlap di tengah boleh dilewati garis/gradien yang menyambung, tapi hindari teks yang terpotong di seam.

---

## 5. Algoritma Cutting

Untuk tiap sel grid pada baris `r` (0-indexed) dan kolom `c`:

```
sx = c × STEP_X      // STEP_X = 1012
sy = r × STEP_Y      // STEP_Y = 1350
crop area = (sx, sy, 1080, 1350)  →  gambar ke canvas 1080×1350  →  export PNG
```

### Pseudocode

```js
const POST_W = 1080, POST_H = 1350;
const STEP_X = 1012, STEP_Y = 1350;

function cut(image, cols, rows) {
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = c * STEP_X;
      const sy = r * STEP_Y;
      const canvas = document.createElement('canvas');
      canvas.width = POST_W;
      canvas.height = POST_H;
      const ctx = canvas.getContext('2d');
      // sumber (sx,sy,1080,1350) → tujuan (0,0,1080,1350)
      ctx.drawImage(image, sx, sy, POST_W, POST_H, 0, 0, POST_W, POST_H);
      tiles.push({ row: r, col: c, canvas });
    }
  }
  return tiles;
}
```

### Cek batas (boundary)

- Kolom terakhir: `sx + 1080 = (C−1)×1012 + 1080 = C×1012 + 68 =` lebar desain ✅
- Baris terakhir: `sy + 1350 = (R−1)×1350 + 1350 = R×1350 =` tinggi desain ✅

Tidak pernah keluar dari kanvas → tidak ada area kosong/transparan.

---

## 6. Urutan Upload (penting untuk grid mosaic)

Di grid profil, **post terbaru muncul di kiri-atas**, lalu mendorong yang lain ke kanan & bawah. Artinya supaya susunan grid terbaca benar (kiri→kanan, atas→bawah), **upload harus dilakukan terbalik**: mulai dari sel **kanan-bawah** dulu, terakhir sel **kiri-atas**.

```
Tata letak akhir di grid (urutan baca):     Urutan UPLOAD (kronologis):
┌─────┬─────┬─────┐                          ┌─────┬─────┬─────┐
│  1  │  2  │  3  │   baris 0                 │  6  │  5  │  4  │
├─────┼─────┼─────┤             ───►          ├─────┼─────┼─────┤
│  4  │  5  │  6  │   baris 1                 │  3  │  2  │  1  │
└─────┴─────┴─────┘                          └─────┴─────┴─────┘
   (cara dilihat)                          (angka = urutan posting; 1 = upload pertama)
```

Rumus: `urutanUpload = reverse(urutanBaca)`, di mana `urutanBaca` = sel diurut baris naik lalu kolom naik. Tool akan menampilkan label "Upload ke-N" di tiap potongan + nama file urut, supaya tidak salah.

> **Carousel vs Mosaic:** Spesifikasi ini untuk **mosaic** (beberapa post terpisah yang menyatu di grid — seperti contoh 147/148/149). Untuk **carousel** (1 post, geser-geser) urutannya justru normal kiri→kanan (A, B, C) dalam satu post. Tool sebaiknya punya toggle mode ini (lihat §11).

---

## 7. Fitur Fungsional

### Wajib (MVP)
1. **Pemilih grid** — input kolom (1–6) & baris (1–4) + preset cepat: 1×2, 1×3, 2×3, 3×3.
2. **Tampilkan ukuran desain target** secara live (mis. "Desain Anda harus 3104 × 1350 px").
3. **Area upload** — klik + drag-and-drop, terima PNG/JPG/WebP.
4. **Validasi ukuran** — bandingkan dimensi gambar dengan target:
   - Pas → lanjut.
   - Beda → opsi: (a) **scale to fit** proporsional, (b) **pakai apa adanya** dengan peringatan, (c) batal.
5. **Preview cut** — render potongan ala diagram: tile abu-abu + **bar overlap merah 34px** + garis seam, persis seperti contoh.
6. **Proses cut** → hasil potongan `1080×1350`.
7. **Download** per potongan **dan** "Download semua (ZIP)".
8. **Label urutan upload** di tiap potongan + penamaan file berurut.

### Opsional (nice-to-have)
- Toggle **Mosaic / Carousel** (ubah urutan & penamaan).
- **Konstanta configurable** (post size, visible, bleed) di panel "Advanced".
- **Guide overlay** di preview: zona aman vs zona bleed (jangan taruh teks di sini).
- **Snap/peringatan** kalau aspek rasio desain tidak sama dengan target (cegah gepeng).
- Export **manifest.txt** di dalam ZIP (berisi urutan upload + ukuran).
- Dark/light mode.

---

## 8. Arsitektur Teknis

| Lapisan | Pilihan | Alasan |
|---|---|---|
| **Tipe app** | Single-page, 100% client-side | Privat (gambar tak keluar dari browser), tanpa biaya server, instan. |
| **Pemotongan** | HTML5 **Canvas API** (`drawImage`) | Native, cepat, presisi piksel, lossless. |
| **Bundling ZIP** | **JSZip** (via CDN) | Download semua sekaligus. |
| **Download** | `Blob` + `URL.createObjectURL` + `<a download>` | Tidak butuh library tambahan. |
| **Format file** | Default **PNG** (lossless) | Tepi tajam, tidak ada artefak JPEG di sambungan. Opsi JPG quality 100 untuk file lebih kecil. |
| **Framework** | HTML + JS vanilla **atau** React 1 file | Cukup ringan; vanilla menghindari overhead. |

**Kenapa PNG default:** kompresi JPEG bisa menambah artefak halus di garis sambungan. Walau IG nanti re-compress, mengekspor lossless menjaga kualitas masukan setajam mungkin.

### Catatan presisi penting
- `ctx.drawImage` dengan `sw=dw` dan `sh=dh` (tanpa scaling) = **copy 1:1**, tidak ada interpolasi → tepi tetap tajam.
- Pastikan canvas tujuan tepat `1080×1350`, bukan ukuran CSS yang di-scale. (CSS `width` ≠ `canvas.width`.)
- Kalau perlu scaling input, pakai 1 kali downscale berkualitas (`imageSmoothingQuality = 'high'`), lalu baru potong.

---

## 9. Alur Pengguna (UX Flow)

```
1. Pilih grid (mis. 2×3)
        ↓
2. Tool tampilkan: "Buat desain ukuran 3104 × 2700 px"
        ↓
3. User upload desain
        ↓
4. Validasi ukuran
   ├─ pas      → ke step 5
   └─ tidak pas → tawarkan scale / pakai apa adanya / batal
        ↓
5. Preview cut (tile + bar merah overlap + seam)
        ↓
6. Klik "Potong"
        ↓
7. Lihat 6 potongan + label "Upload ke-1 … ke-6"
        ↓
8. Download per potongan / Download ZIP
```

---

## 10. Validasi & Edge Cases

| Kasus | Penanganan |
|---|---|
| Dimensi gambar pas dengan target | Lanjut langsung. |
| Lebar/tinggi beda tapi **rasio sama** | Tawarkan scale proporsional ke target. |
| **Rasio beda** (gambar gepeng/ketinggian) | Peringatan keras: hasil akan terdistorsi. Sarankan re-export. Opsi letterbox. |
| File bukan gambar | Tolak dengan pesan jelas: "Format tidak didukung. Pakai PNG/JPG/WebP." |
| File sangat besar (>~50MP) | Peringatan performa; proses tetap jalan tapi mungkin lambat. |
| Grid 1×1 | Tetap valid — output = gambar utuh 1080×1350 (tidak ada overlap). |
| Kolom = 1 (vertikal saja, mis. 3×1) | Tidak ada overlap horizontal; hanya geser vertikal 1350. Lebar desain = 1080. |

> **Empty state & error pakai bahasa lugas, bukan teknis.** Mis. saat belum ada file: "Tarik desainmu ke sini, atau klik untuk pilih file." Saat rasio salah: "Ukuran desain harus 3104 × 2700 px. Punyamu 3104 × 2600 — hasilnya bisa gepeng."

---

## 11. Format Output & Penamaan File

Penamaan menyertakan posisi grid **dan** urutan upload supaya tidak tertukar:

```
feed_2x3/
├── upload-1_r2-c3.png      ← upload pertama (kanan-bawah)
├── upload-2_r2-c2.png
├── upload-3_r2-c1.png
├── upload-4_r1-c3.png
├── upload-5_r1-c2.png
├── upload-6_r1-c1.png      ← upload terakhir (kiri-atas)
└── manifest.txt
```

`manifest.txt` (opsional) berisi:
```
Feed Cutter — 2 baris × 3 kolom
Ukuran desain: 3104 × 2700 px
Tiap potongan: 1080 × 1350 px

Mode: MOSAIC (upload terbalik)
Urutan upload:
  1. r2-c3 (kanan-bawah)
  2. r2-c2
  ...
  6. r1-c1 (kiri-atas)
```

Untuk mode **Carousel**, penamaan jadi `slide-1`, `slide-2`, … urut kiri→kanan (tanpa pembalikan).

---

## 12. Konstanta Konfigurasi

Semua dikumpulkan di satu objek agar mudah diubah bila spesifikasi IG berganti:

```js
const CONFIG = {
  POST_W:   1080,   // lebar 1 post (4:5)
  POST_H:   1350,   // tinggi 1 post
  VISIBLE:  1012,   // lebar terlihat di grid (3:4)
  BLEED:    34,     // (POST_W - VISIBLE) / 2
  // turunan:
  // OVERLAP = BLEED * 2 = 68
  // STEP_X  = VISIBLE  = 1012
  // STEP_Y  = POST_H   = 1350
  EXPORT:   'png',  // 'png' | 'jpeg'
  QUALITY:  1.0,    // dipakai bila jpeg
};
```

Aturan turunan otomatis: `OVERLAP = BLEED*2`, `STEP_X = VISIBLE`, `lebarDesain = C*VISIBLE + OVERLAP`, `tinggiDesain = R*POST_H`.

---

## 13. Test Cases (verifikasi sebelum rilis)

| # | Input | Ekspektasi |
|---|---|---|
| 1 | Grid 1×3, upload 3104×1350 | 3 potongan 1080×1350; gabung visible = 3036px mulus. |
| 2 | Grid 2×3, upload 3104×2700 | 6 potongan; urutan upload terbalik benar. |
| 3 | Grid 1×1, upload 1080×1350 | 1 potongan identik dengan input. |
| 4 | Grid 3×1, upload 1080×4050 | 3 potongan tumpuk vertikal, tanpa overlap. |
| 5 | Upload ukuran salah (3104×2600) | Muncul peringatan rasio; opsi scale/batal. |
| 6 | Tile kolom terakhir | Sisi kanan = tepat tepi kanan desain (tidak ada area kosong). |
| 7 | Seam check 1×3 | Sambungan di x=1046 & x=2058 tidak terlihat patah. |

---

## 14. Roadmap Pengembangan

1. **v0.1 — Core math + cut** : pilih grid, upload, potong, download per file. (Cukup buktikan presisi.)
2. **v0.2 — Preview & ZIP** : preview overlay merah + seam, download ZIP, label urutan upload.
3. **v0.3 — UX & validasi** : drag-drop, validasi rasio, scale-to-fit, empty/error states.
4. **v0.4 — Mode & advanced** : toggle Mosaic/Carousel, panel konstanta configurable, manifest.txt.
5. **v1.0 — Polish** : zona-aman overlay, responsif mobile, dark/light, aksesibilitas (fokus keyboard, reduced-motion).

---

## Ringkasan satu kalimat

> Geser potongan **per 1012 px** tapi potong selebar **1080 px**, sehingga tiap tetangga overlap **68 px** dan grid 3:4 menyambung mulus; ukuran desain = `kolom × 1012 + 68` (lebar) × `baris × 1350` (tinggi).
