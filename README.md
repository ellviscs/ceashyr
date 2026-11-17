# Ceashyr — Aplikasi Kasir & Manajemen Stok Kantin (PWA)

Aplikasi kasir berbasis **Progressive Web App (PWA)** untuk **Kantin KWU HIMATEKPAL ITS** yang dirancang agar cepat dioperasikan di Tablet (`1280×800`) maupun HP (`<768px`), tetap berjalan saat koneksi WiFi kantin bermasalah (*local-first*), dan kompatibel dengan pencatatan kertas melalui fitur rekap foto laporan (OCR).

---

## Fitur Utama (Sprint 1)

1. **Login Multi-Peran & Hak Akses (`US-04`) — `/login`, `/register`, `/ketua`**
   - Pemisahan akses antara **Ketua KWU** dan **Pengelola / Kasir**.
   - Validasi input kosong, penanganan kredensial salah, serta alur *Register* & *Forgot Password*.
2. **Manajemen & Tambah Produk (`US-01`) — `/produk`**
   - **Mode Ketua KWU**: Melihat katalog 3 kolom, detail produk, menambah produk baru dengan live preview, validasi input, dan badge `BARU`.
   - **Mode Pengelola (`/produk?mode=pengelola`)**: Mode lihat saja (*read-only*) tanpa akses tambah/ubah produk.
3. **Kasir & Pengurangan Stok Otomatis (`US-05` & `US-06`) — `/kasir`**
   - Pilih produk cepat, atur jumlah (`−` / `+`) di keranjang transaksi, hitung total otomatis, dan simpan nota (`TRX-XXXX`) dengan pengurangan stok otomatis.
4. **Rekap Foto Laporan Kertas OCR & Antrean Offline (`US-16`) — `/rekap-kertas`**
   - Ambil foto kamera atau pilih dari galeri (tersedia juga **3 sampel uji preset**), konversi ke data digital dengan koreksi qty, serta **Antrean Offline Lokal** saat WiFi bermasalah untuk diproses ulang ketika koneksi normal.

---

## Prasyarat

- **Node.js** `v20+` (dikembangkan dan diuji pada `v24.15.0`)
- **npm** `v10+` (diuji pada `v11.12.1`)

---

## Cara Menjalankan di Lokal

1. **Clone repository & masuk ke folder proyek**
   ```bash
   git clone <url-repository>
   cd ceashyr
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Jalankan mode development**
   ```bash
   npm run dev
   ```
   Buka browser dan akses **http://localhost:3000** (halaman Launchpad) atau langsung ke **http://localhost:3000/login**.

---

## Perintah Build & Verifikasi

```bash
# Pengecekan tipe TypeScript
npm run typecheck

# Build aplikasi production (Next.js)
npm run build

# Jalankan server production (untuk menguji Service Worker & instalasi PWA)
npm run start
```

---

## Akun Demo

Anda dapat mengetik kredensial berikut di `/login` atau memakai tombol isi cepat (**Isi Akun Ketua KWU** / **Isi Akun Pengelola/Kasir**):

| Peran | Email | Kata Sandi | Halaman Awal |
| :--- | :--- | :--- | :--- |
| **Ketua KWU** | `ketuakwu@gmail.com` | `ketuakwu123` (atau `12345678`) | `/ketua` |
| **Pengelola / Kasir** | `kasir@gmail.com` | `kasir123` (atau `12345678`) | `/kasir` |

> **Reset Data**: Kapan saja Anda ingin mengembalikan daftar produk (`Air Mineral 600 ml`, `Bang-Bang`, `Chocolatas`), transaksi, dan antrean OCR ke kondisi awal, buka **http://localhost:3000** lalu klik tombol **Reset Seed Data**.

---

## Instalasi sebagai PWA di Tablet / HP

1. Jalankan server production (`npm run build && npm run start`) atau deploy ke hosting HTTPS.
2. Buka aplikasi di **Chrome / Edge** (Android Tablet/HP) atau **Safari** (iPadOS/iOS).
3. Pilih **Install App** (*Tambahkan ke Layar Utama*).
4. Aplikasi akan berjalan dalam mode `standalone` (layar penuh tanpa address bar) dengan cache app-shell dari `public/sw.js`.

---

## Struktur Folder Utama

```text
ceashyr/
├── docs/                  # Dokumentasi arsitektur, design system, flow Figma & checklist task
├── public/
│   ├── icons/             # Ikon PWA & avatar default
│   ├── images/            # Aset ilustrasi halaman login
│   ├── manifest.json      # Konfigurasi Web App Manifest
│   └── sw.js              # Service Worker offline-first
├── src/
│   ├── app/               # Halaman Next.js App Router (/, /login, /register, /ketua, /produk, /kasir, /rekap-kertas)
│   ├── components/        # AppShell, SidebarIcons, ProductCard, PwaRegistrar
│   ├── constants/         # Design tokens & seed data kantin
│   ├── lib/               # Formatters, validators, dan localStorage repository
│   └── types/             # Definisi tipe TypeScript
├── package.json
└── tailwind.config.ts
```

---

## Dokumentasi Lengkap

Seluruh spesifikasi desain Figma, alur pengguna, dan rincian task pengembangan tersedia di folder [`docs/`](docs/00-INDEX-FOR-HYDROGEN.md).
