# Task Group T-04: Rekap Laporan Kertas (OCR) & Antrean Offline (`US-16`)

- **Cakupan TaskBoard**: No `17, 18, 19, 20, 21`
- **File Target Utama**: `src/app/rekap-kertas/page.tsx`
- **Helper yang WAJIB Dipakai**:
  - `getProducts`, `getOcrQueue`, `getOcrReports`, `enqueueOfflineOcr`, `processOcrQueue`, `saveDigitalOcrReport`, `getSession` dari `src/lib/storage/repository.ts`
  - `SAMPLE_OCR_PRESETS` dari `src/constants/seed-data.ts`
  - `formatRupiah`, `formatDateTimeId` dari `src/lib/formatters.ts`
  - `AppShell`
- **Acuan Figma (`1331:4912`)**:
  - `US-16 (Ambil/Unggah Foto Laporan)` (`1331:6426`):
    - Frame `1341:4836`: `1 - Unggah Foto Laporan (Kosong)`
    - Frame `1341:4923`: `2 - Ambil atau Pilih Foto dari Galeri`
    - Frame `1341:5010`: `3 - Konversi Foto ke Data Digital (OCR)`
    - Frame `1341:5098`: `4 - Simpan Lokal Saat Offline & Proses Saat Normal`
    - Frame `1341:5178`: `5 - Uji Contoh Foto Laporan & Rekap Tersimpan`

---

## Task H-09: Ambil Kamera, Pilih Galeri & 3 Sampel Uji Preset (`1341:4836`, `1341:4923`) {#task-h-09}

### Tujuan
Menghidupkan pemilih foto laporan kertas di `src/app/rekap-kertas/page.tsx`, baik dari kamera/galeri perangkat (`<input type="file">`) maupun 3 tombol sampel foto bawaan agar penguji & dosen dapat mengetes tanpa harus memotret kertas sungguhan setiap kali.

### Langkah Implementasi (`src/app/rekap-kertas/page.tsx`)

1. **Input File Tersembunyi (`ref`) untuk Perangkat Asli (Tablet / HP)**:
   - Input Kamera: `<input type="file" accept="image/*" capture="environment" className="hidden" />` dipicu tombol **`Ambil Foto`**.
   - Input Galeri: `<input type="file" accept="image/*" className="hidden" />` dipicu tombol **`Pilih Galeri`**.
   - Saat file dipilih, baca preview dengan `URL.createObjectURL(file)` atau `FileReader.readAsDataURL` (agar tahan reload bila disimpan ke `localStorage` untuk ukuran kecil, cukup simpan nama file + preview opsional). Cocokkan ke `SAMPLE_OCR_PRESETS[0]` sebagai parser simulasi OCR client-side.
2. **Bagian "Uji Contoh Foto Laporan (3 Sampel Preset)" (`1341:5178`)**:
   - Tampilkan 3 tombol pilihan cepat dari `SAMPLE_OCR_PRESETS`:
     - `Sampel 1 — Catatan Harian Terang` (`laporan-harian-17nov.jpg`)
     - `Sampel 2 — Catatan Sesi Pagi (Rapat)` (`laporan-pagi-17nov.jpg`)
     - `Sampel 3 — Rekap Offline Saat WiFi Putus` (`laporan-siang-17nov.jpg`)
3. **Tampilan State `Foto Siap` (`1341:4923`)**:
   - Begitu foto atau sampel terpilih:
     - Tampilkan badge hijau **`Foto Siap`**, nama file (`{fileName}`), dan pratinjau gambar atau blok `rawText` catatan laporan kertas.
     - Tombol ulang di bawah preview: **`Ganti via Kamera`** dan **`Pilih Ulang Galeri`**.
     - Di kolom kanan: tombol oranye **`Baca Teks Foto (OCR)`** dan tombol amber **`Simpan ke Antrean Offline (Jika WiFi Bermasalah)`**.

### Kriteria Selesai (`H-09`)
- [ ] Klik `Pilih Galeri` atau `Ambil Foto` membuka file picker perangkat (`capture="environment"` untuk kamera belakang tablet/HP).
- [ ] Klik salah satu dari 3 sampel preset langsung memuat state `Foto Siap` beserta teks/pratinjau laporan.

---

## Task H-10: Konversi OCR -> Data Digital + Koreksi Qty -> Simpan `RKP-XXXX` (`1341:5010`, `1341:5178`) {#task-h-10}

### Tujuan
Mengubah foto terpilih menjadi item terstruktur (`OcrExtractedItem[]`), memungkinkan kasir mengoreksi jumlah apabila tulisan tangan kurang jelas, lalu menyimpannya menjadi rekap digital permanen.

### Langkah Implementasi

1. **Saat Klik `Baca Teks Foto (OCR)`**:
   - Jika sedang mode simulasi offline (atau `!navigator.onLine`), arahkan agar user memakai tombol **`Simpan ke Antrean Offline`** (atau tawarkan penyimpanan lokal otomatis agar data tidak hilang!).
   - Saat online normal: tampilkan loading singkat ~`400ms` lalu ubah `step` menjadi `'converted'` (`1341:5010`).
2. **Tampilan `Hasil Konversi OCR` (`1341:5010`)**:
   - Banner hijau: `✓ OCR Selesai: {items.length} baris barang berhasil dikonversi menjadi data digital`.
   - Grid 3 kolom kartu `#465947` menampilkan tiap barang yang terbaca + badge kanan bawah **`{item.qtySold} pcs`**.
   - Kotak **`Teks Terbaca Otomatis:`** menampilkan `rawText` dari preset/file.
   - Panel kanan **`Koreksi & Simpan Rekap Digital`**:
     - Untuk setiap `OcrExtractedItem`: tampilkan nama barang, tombol **`−` / `+`** (koreksi `qtySold`), harga satuan, dan subtotal (`qtySold * unitPrice`).
     - Total bawah: **`Total Rekap ({totalItems} item)`** & **`{formatRupiah(totalAmount, true)}`**.
     - Tombol oranye **`Simpan Rekap Digital`** memanggil `saveDigitalOcrReport(extractedItems, activeFileName, previewUrl)`.
3. **Tampilan Setelah Tersimpan (`1341:5178`)**:
   - Kartu **`Rekap Kertas Tersimpan!`**: `No. Rekap` (`RKP-0001`), `Tanggal`, `Total Barang`, `Total Rekap` (warna oranye), dan tombol **`Unggah Foto Laporan Baru`**.

### Kriteria Selesai (`H-10`)
- [ ] Sampel 1 (`laporan-harian-17nov.jpg`) menghasilkan total `15 item` (`Rp 39.000`) sebelum dikoreksi.
- [ ] Mengubah qty `− / +` pada `Koreksi & Simpan Rekap Digital` otomatis memperbarui `Total Rekap`.
- [ ] Menyimpan rekap menambah riwayat `RKP-XXXX` dan ikut memperbarui KPI `Rekap Kertas` di `/ketua`.

---

## Task H-11: Antrean Offline Lokal saat WiFi Bermasalah & Proses Ulang Saat Normal (`1341:5098`) {#task-h-11}

### Tujuan
Memenuhi Task #20 (`Simpan foto secara lokal saat aplikasi bermasalah, lalu proses saat normal kembali`) agar kasir di kantin yang WiFi-nya putus tidak pernah kehilangan laporan kertas.

### Langkah Implementasi

1. **Tambahkan Toggle "Simulasi Kondisi WiFi" di bagian atas `/rekap-kertas`** (di sebelah header kartu):
   - Mode: `WiFi Normal (Online)` vs `Simulasi WiFi Bermasalah (Offline)` (dan juga hormati `navigator.onLine === false` secara otomatis!).
2. **Saat Klik `Simpan ke Antrean Offline (Jika WiFi Bermasalah)` atau saat `Baca Teks Foto (OCR)` ditekan dalam kondisi Offline**:
   - Panggil `enqueueOfflineOcr(fileName, presetKey, previewUrl)`.
   - Perbarui state `queue = getOcrQueue()` dan tampilkan section **`Antrean Foto Offline — Penyimpanan Lokal`** (sesuai Frame `1341:5098`):
     - Banner amber: `⚠️ Saat WiFi Bermasalah: Foto disimpan otomatis di perangkat agar data tidak hilang.`
     - Ketika koneksi normal kembali (`!simulatedOffline && isOnline` dan `queue.length > 0`), tampilkan banner hijau: `✓ Koneksi Kembali Normal! {queue.length} foto laporan siap diproses ke data digital.`
     - Daftar file di antrean (`laporan-pagi-17nov.jpg`, dst.) dengan tombol **`Proses Sekarang`** per item (memanggil `processOcrQueue(record.id)` atau membukanya ke mode koreksi `1341:5010`).
     - Panel kanan **`Status Sinkronisasi Perangkat`**: menampilkan jumlah `{queue.length} Foto Tersimpan Aman` dan tombol oranye penuh **`Proses Semua Antrean ({queue.length})`** (`processOcrQueue()`).
3. Setelah antrean diproses, tampilkan notifikasi sukses & daftar `Rekap Tersimpan (RKP-XXXX)` terbaru di bawah halaman agar mudah dicek ulang.

### Kriteria Selesai (`H-11`)
- [ ] Saat toggle offline aktif, mengunggah/memilih sampel lalu klik `Simpan ke Antrean Offline` menyimpannya di `localStorage` dan tetap ada setelah `F5` reload.
- [ ] Mematikan simulasi offline memunculkan banner `Koneksi Kembali Normal!` dan klik `Proses Semua Antrean` mengonversi seluruh item ke laporan `RKP-XXXX` hingga antrean `0`.
- [ ] Jalankan `npm run typecheck && npm run build` tanpa error.
