# Master Checklist: Mapping 21 Task Sprint 1 -> Task Gemini Hydrogen (`H-01`..`H-12`)

Dokumen ini memetakan seluruh **21 tugas Sprint 1** (dari TaskBoard & `FP2_Sprint1_Caeshyr (1) (1).pdf`) ke status Initial Commit serta **12 task atomik untuk Gemini Hydrogen**.

> Status **`Foundation Ready`** artinya tipe data, seed data, validator, atau shell komponen sudah dibuat pada Initial Commit dan siap dipakai langsung oleh Hydrogen.

---

## 1. Pemetaan Lengkap 21 Tugas Sprint 1

| No | Tugas Sprint 1 (Spreadsheet) | Story | Status Initial Commit | Task Hydrogen | Dokumen Panduan |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | Desain halaman login | US-04 | Scaffold `/login` & ilustrasi Figma siap | `H-01` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-01) |
| 2 | Buat data akun dan peran | US-04 | **Done (Code)**: `SEED_ACCOUNTS` & `repository.ts` | `H-01` (pakai) | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-01) |
| 3 | Implementasi proses login dan validasi akun | US-04 | `validateLoginInput` & `login()` siap | `H-01` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-01) |
| 4 | Arahkan ke halaman sesuai peran setelah login | US-04 | Scaffold `/ketua` & `/kasir` siap | `H-01`, `H-03` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-03) |
| 5 | Tampilkan pesan error jika akun salah | US-04 | `authenticateAccount` mengembalikan copy error | `H-02` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-02) |
| 6 | Uji login benar dan salah | US-04 | Belum diuji interaktif | `H-02` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-02) |
| 7 | Uji pembagian peran | US-04 | `AppShell` sidebar per peran siap | `H-03` | [T-01](T-01-US04-AUTH-AND-ROLES.md#task-h-03) |
| 8 | Desain form tambah produk | US-01 | Scaffold `/produk` siap | `H-04`, `H-05` | [T-02](T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-05) |
| 9 | Buat validasi input | US-01 | `validateProductForm` siap di `validators.ts` | `H-05` | [T-02](T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-05) |
| 10 | Simpan data produk ke database (localStorage) | US-01 | `addProduct()` siap di `repository.ts` | `H-06` | [T-02](T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-06) |
| 11 | Tampilkan produk baru di daftar produk | US-01 | `ProductCard` mendukung badge `BARU` | `H-06` | [T-02](T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-06) |
| 12 | Uji data valid dan tidak valid | US-01 | Belum diuji di UI `/produk` | `H-05`, `H-06` | [T-02](T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-06) |
| 13 | Desain halaman pencatatan penjualan | US-05 | Scaffold `/kasir` 2 kolom siap | `H-07` | [T-03](T-03-US05-SALES-POS.md#task-h-07) |
| 14 | Buat fitur memilih barang dan jumlah | US-05 | Kontrak `CartItem` siap | `H-07` | [T-03](T-03-US05-SALES-POS.md#task-h-07) |
| 15 | Hitung total otomatis dan perbarui saat jumlah diubah | US-05 | Belum dirakit di UI `/kasir` | `H-07`, `H-08` | [T-03](T-03-US05-SALES-POS.md#task-h-07) |
| 16 | Uji ketepatan perhitungan total | US-05 / US-06 | `createTransaction()` (kurangi stok) siap | `H-08` | [T-03](T-03-US05-SALES-POS.md#task-h-08) |
| 17 | Desain tampilan ambil/unggah foto laporan | US-16 | Scaffold `/rekap-kertas` siap | `H-09` | [T-04](T-04-US16-OCR-PAPER-REPORT.md#task-h-09) |
| 18 | Buat fitur ambil atau pilih foto dari galeri | US-16 | `SAMPLE_OCR_PRESETS` siap | `H-09` | [T-04](T-04-US16-OCR-PAPER-REPORT.md#task-h-09) |
| 19 | Implementasi konversi foto menjadi data digital | US-16 | `saveDigitalOcrReport()` siap | `H-10` | [T-04](T-04-US16-OCR-PAPER-REPORT.md#task-h-10) |
| 20 | Simpan foto secara lokal saat bermasalah & proses ulang | US-16 | `enqueueOfflineOcr` & `processOcrQueue` siap | `H-11` | [T-04](T-04-US16-OCR-PAPER-REPORT.md#task-h-11) |
| 21 | Uji dengan beberapa contoh foto laporan | US-16 | 3 sampel preset siap | `H-10`, `H-11` | [T-04](T-04-US16-OCR-PAPER-REPORT.md#task-h-11) |
| Bonus | Audit Mobile `<768px` & Installability PWA Tablet | PWA | Manifest & SW aktif | `H-12` | [T-05](T-05-MOBILE-RESPONSIVE-PWA.md#task-h-12) |

---

## 2. Pelacak Progress Pengerjaan Hydrogen

Update status `[ ]` -> `[x]` setiap selesai 1 task dan lolos `npm run typecheck && npm run build`:

- [x] **H-01**: Login interaktif + `/register` & Forgot Password (`T-01`)
- [x] **H-02**: State Error Login Kosong & Akun Salah + Uji Akun (`T-01`)
- [x] **H-03**: Penjaga Peran `/ketua` vs `/kasir` & Mode Lihat Pengelola (`T-01`)
- [x] **H-04**: `/produk` Dual Mode (Pengelola vs Ketua KWU) + Panel Detail `Air Mineral 600 ml` (`T-02`)
- [x] **H-05**: `/produk` Form Tambah Produk + Pratinjau Kartu + Validasi Input (`T-02`)
- [x] **H-06**: `/produk` Simpan Produk Baru + Banner Sukses + Badge `BARU` (`T-02`)
- [x] **H-07**: `/kasir` Pilih Produk, Keranjang `- / +`, Total Real-time (`T-03`)
- [x] **H-08**: `/kasir` Simpan Penjualan, Kurangi Stok Otomatis (`US-06`), Nota `TRX-XXXX` (`T-03`)
- [x] **H-09**: `/rekap-kertas` Ambil Kamera / Pilih Galeri / 3 Sampel Preset (`T-04`)
- [x] **H-10**: `/rekap-kertas` Konversi OCR + Koreksi Qty + Simpan `RKP-XXXX` (`T-04`)
- [x] **H-11**: `/rekap-kertas` Antrean Offline Lokal + Simulasi WiFi Putus -> Proses Ulang (`T-04`)
- [x] **H-12**: Audit Responsif HP `<768px`, Offline PWA Tablet & Verifikasi End-to-End (`T-05`)
