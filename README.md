# Website Simulasi CBT Tryout UTBK-SNBT

Aplikasi web simulasi ujian berbasis komputer (CBT) resmi UTBK-SNBT yang dibangun menggunakan **React + Tailwind CSS** dengan desain, sistem navigasi, dan alur pengerjaan yang menyerupai aplikasi resmi UTBK (BPPP Kemdikbud).

---

## 🚀 Cara Menjalankan Website

1. Buka terminal pada folder proyek ini.
2. Masuk ke direktori aplikasi:
   ```bash
   cd cbt-utbk
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka tautan berikut di browser:
   **[http://localhost:5173/](http://localhost:5173/)**

---

## ⏱️ Struktur 7 Subtes & Durasi Resmi

| No | Subtes | Durasi | Jumlah Soal | Kategori |
|---|---|---|---|---|
| 1 | **Penalaran Umum (PU)** | 30 menit | 30 soal | Tes Potensi Skolastik (TPS) |
| 2 | **Pengetahuan dan Pemahaman Umum (PPU)** | 15 menit | 20 soal | Tes Potensi Skolastik (TPS) |
| 3 | **Pemahaman Bacaan dan Menulis (PBM)** | 25 menit | 20 soal | Tes Potensi Skolastik (TPS) |
| 4 | **Pengetahuan Kuantitatif (PK)** | 20 menit | 20 soal | Tes Potensi Skolastik (TPS) |
| 5 | **Literasi dalam Bahasa Indonesia** | 42,5 menit | 30 soal | Tes Literasi |
| 6 | **Literasi dalam Bahasa Inggris** | 20 menit | 20 soal | Tes Literasi |
| 7 | **Penalaran Matematika** | 42,5 menit | 20 soal | Tes Penalaran |
| **Total** | **7 Subtes** | **195 Menit (3 Jam 15 Mnt)** | **160 Soal** | — |

---

## ✨ Fitur-Fitur Utama

1. **Penghilangan Watermark 100%**:
   - Seluruh soal dari folder `Sumber Soal` telah diproses secara digital untuk menghilangkan watermark teks diagonal, maskot di latar belakang, serta header/footer dokumen rahasia.
   - Menghasilkan gambar soal dengan latar belakang putih bersih, formula matematika tajam, dan diagram yang jernih.

2. **Tampilan CBT UTBK Asli (Opsi A)**:
   - Layout 1 soal per layar dengan opsi jawaban A, B, C, D, E interaktif (serta isian angka untuk soal isian singkat).
   - Panel Wacana/Stimulus terpisah di sisi kiri untuk soal-soal bacaan panjang dan diagram.
   - Fitur zoom in/out dan preview gambar layar penuh jika membutuhkan tampilan yang lebih besar.

3. **Indikator Soal Hijau**:
   - Kotak nomor pada modal **Daftar Soal** otomatis berubah menjadi **warna hijau** (`bg-emerald-600`) begitu soal telah dikerjakan / dipilih jawabannya.
   - Soal yang belum dikerjakan berwarna putih dengan border abu-abu.
   - Soal yang sedang aktif ditandai dengan ring biru tebal.

4. **Mode Simulasi Resmi**:
   - Subtes dikerjakan secara berurutan dari subtes 1 sampai 7.
   - Alokasi waktu berlaku ketat per subtes. Jika timer habis, sistem otomatis menyimpan jawaban dan mengunci subtes untuk beralih ke subtes berikutnya.
   - Peserta tidak dapat kembali ke subtes sebelumnya yang telah diselesaikan (persis standar UTBK resmi).
   - Tombol ragu-ragu dan mode latihan bebas telah dihilangkan sesuai permintaan.

5. **Penyimpanan Otomatis (Auto-Save LocalStorage)**:
   - Jawaban dan sisa waktu tersimpan otomatis di browser secara real-time. Jika browser tidak sengaja tertutup atau ter-refresh, ujian dapat dilanjutkan tanpa kehilangan progres.

6. **Dashboard Skor & Pembahasan Lengkap**:
   - Setelah menyelesaikan subtes ke-7, nilai UTBK langsung dihitung dengan estimasi skala standar **200–1000** beserta rincian per subtes.
   - Menampilkan statistik akurasi (jumlah Benar, Salah, dan Kosong).
   - Mode evaluasi interaktif per nomor lengkap dengan lembar pembahasan langkah demi langkah resmi dari Edulab.
   - Tersedia tombol cetak hasil / simpan PDF.

7. **Pintasan Keyboard (Keyboard Shortcuts)**:
   - Tekan tombol **A**, **B**, **C**, **D**, atau **E** pada keyboard untuk memilih jawaban cepat.
   - Tekan tanda panah **← (Kiri)** untuk soal sebelumnya dan **→ (Kanan)** untuk soal selanjutnya.
