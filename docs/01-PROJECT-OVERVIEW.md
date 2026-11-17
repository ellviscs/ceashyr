# Gambaran Proyek & Product Backlog Ceashyr

Dokumen ini merangkum konteks bisnis dan kebutuhan proyek dari folder `referensi/` (`FP1_Sprint0_Caeshyr (2).pdf`, `FP2_Sprint1_Caeshyr (1) (1).pdf`, dan materi presentasi Kelompok 9 MPT Kelas D ITS).

---

## 1. Visi Produk & Mitra Kantin

- **Nama Aplikasi**: **Ceashyr**
- **Mitra Lapangan**: **Ibu Ellya Setyawati** — Pengelola Kantin **KWU HIMATEKPAL ITS**
- **Ketua KWU / Pemilik Kantin**: Ketua KWU HIMATEKPAL ITS (audit transaksi, katalog produk, laporan himpunan)
- **Visi Produk**: Aplikasi kasir PWA sederhana yang membantu pedagang/pengelola kantin mencatat penjualan secara digital tanpa konfigurasi rumit, meminimalkan selisih stok, tetap kompatibel dengan pencatatan kertas lewat OCR foto laporan, dan tetap berjalan di tablet meskipun koneksi WiFi bermasalah.

### 6 Pain Points Mitra (Sprint 1 Discovery)

| No | Pain Point Lapangan | Kebutuhan Sistem | Prioritas |
| :---: | :--- | :--- | :---: |
| 1 | Barang datang dari vendor sering tidak sesuai nota | Pencatatan stok masuk & cocokkan jumlah nota vs fisik (`US-07`) | High |
| 2 | Barang sering hilang (air mineral, barang titipan) | Visibilitas stok masuk, keluar, dan sisa berkala (`US-06`, `US-09`) | High |
| 3 | Vendor baru dihubungi setelah barang habis | Penanda stok minimum & peringatan restock (`US-09`, `US-11`) | High |
| 4 | Barang kurang laku menumpuk | Data penjualan per produk sebagai dasar keputusan beli | Medium |
| 5 | Pencatatan harian masih memakai kertas & minta tetap didukung | Kompatibel dengan alur kertas via foto + konversi OCR digital (`US-16`) | High |
| 6 | Antrean lama saat WiFi kantin bermasalah / QRIS gagal | Mode offline-first PWA & penyimpanan antrean lokal (`US-16`, `US-12`) | Medium |

---

## 2. Peran Pengguna (`UserRole`)

| Peran | Contoh Akun Demo | Tugas Utama | Akses Halaman |
| :--- | :--- | :--- | :--- |
| **Ketua KWU** (`ketua_kwu`) | `ketuakwu@gmail.com` | Tambah/ubah katalog produk, pantau KPI penjualan, audit transaksi & laporan | `/ketua`, `/produk`, `/kasir`, `/rekap-kertas` |
| **Pengelola / Kasir** (`pengelola`) | `kasir@gmail.com` | Catat penjualan cepat, unggah/foto laporan kertas (OCR), lihat daftar produk (read-only) | `/kasir`, `/rekap-kertas`, `/produk?mode=pengelola` |

---

## 3. Cakupan Sprint 1 (Prioritas Eksekusi Saat Ini)

**Sprint 1 Goal**:
Membangun fondasi sistem autentikasi multi-peran serta pengelolaan data produk, stok awal, pencatatan transaksi dasar + pengurangan stok otomatis, maupun pemindahan dari laporan kertas ke digital (OCR + simpan offline lokal).

### User Stories Inti pada Sprint Backlog & Desain Figma `1331:4912`

1. **`US-04` (8 Poin — MUST)**: Login multi-peran (`Ketua KWU` vs `Pengelola/Kasir`), validasi input/kredensial error, register & reset sandi, pembagian akses peran.
2. **`US-01` (3 Poin — MUST)**: Tambah data produk baru oleh Ketua KWU (nama, harga, stok awal), validasi input, simpan & tampil di daftar produk, serta mode lihat saja untuk Pengelola.
3. **`US-05` (2 Poin — MUST) & `US-06` (2 Poin — MUST)**: Kasir mencatat penjualan dengan memilih barang & jumlah, hitung total otomatis, dan stok produk berkurang otomatis setelah transaksi disimpan.
4. **`US-16` (3 Poin — MUST)**: Pengelola mengambil/mengunggah foto laporan kertas, mengubah ke data digital (OCR), koreksi hasil, dan simpan lokal saat koneksi bermasalah untuk diproses saat normal kembali.

---

## 4. Product Backlog Lanjutan (Pasca Sprint 1 / Sprint 2+)

User story berikut sudah tercatat dalam backlog namun belum masuk layar prototipe `1331:4912`:
- `US-02`: Edit nama & harga produk (harga riwayat transaksi lama tetap).
- `US-03`: Hapus produk non-aktif tanpa menghilangkan riwayat.
- `US-07`: Catat barang masuk vendor & deteksi `"selisih"` nota vs diterima.
- `US-08`: Filter riwayat transaksi berdasarkan tanggal (audit Ketua KWU).
- `US-09` & `US-11`: Batas stok minimum (`"menipis"`) & notifikasi restock.
- `US-12` & `US-13`: Pencatatan & pelunasan transaksi utang per nama pelanggan.
- `US-15`: Unduh/bagikan laporan penjualan harian & mingguan ke himpunan.
- `US-10` & `US-14`: Forecasting sisa hari stok & verifikasi status QRIS.

---

## 5. Definition of Done (DoD Sprint 1)

Sebuah task / user story dinyatakan selesai jika:
1. Seluruh Acceptance Criteria (AC) terpenuhi dan teruji manual di browser (desktop tablet `1280×800` dan mobile `<768px`).
2. Berjalan tanpa error runtime pada skenario normal dan skenario negatif (input kosong, input negatif/nol, akun salah, kondisi offline).
3. Lolos pengecekan `npm run typecheck` (`tsc --noEmit`) dan `npm run build` (`next build`).
4. Data produk, stok, transaksi, dan antrean OCR konsisten setelah aksi dijalankan (tersimpan di `localStorage`).
