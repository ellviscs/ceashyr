# Design System Ceashyr (Dari Figma `⭐️ Templates (Copy)` `1331:4912`)

Seluruh komponen visual di aplikasi harus mengikuti spesifikasi halaman Figma `⭐️ Templates (Copy)` (`node-id=1331:4912`). Tokens kode tersedia di `tailwind.config.ts` dan `src/constants/design-tokens.ts`.

---

## 1. Palet Warna Resmi

| Token Tailwind | Kode Hex | Penggunaan Utama |
| :--- | :--- | :--- |
| `ceashyr-mint` | `#EBF4E8` | Latar belakang kanvas utama seluruh halaman |
| `ceashyr-cream` | `#FFFDF9` | Sidebar (`84px`), panel form, dan kartu kontainer putih gading |
| `ceashyr-forest` | `#465947` | **Kotak produk horizontal** (`ProductCard`) dan hero detail produk |
| `ceashyr-forest-sub` | `#D6E3D9` | Teks harga di sudut kiri bawah kartu `#465947` (`Rp4.000`) |
| `ceashyr-orange` | `#E86339` | Aksen primer: CTA tombol (`Simpan`, `+ Tambah Produk`, `Login`), pill switcher, active nav border |
| `ceashyr-peach` | `#FDECE6` | Latar badge peran aktif, avatar kontak, & latar tombol sidebar aktif |
| `ceashyr-green` | `#2D7A53` | Aksen sukses: banner produk baru tersimpan, KPI katalog, badge `Siap Simpan` |
| `ceashyr-green-soft` | `#E7F5EC` | Latar banner sukses & status online PWA |
| `ceashyr-amber-bg` | `#FFF6E5` | Latar banner peringatan pembagian peran / mode offline |
| `ceashyr-amber-border` | `#D9822B` | Garis tepi banner amber |
| `ceashyr-amber-ink` | `#8A5111` | Teks banner amber |
| `ceashyr-ink` | `#1F2024` | Teks judul utama (`28px`), label, dan tombol `Logout` |
| `ceashyr-muted` | `#71727A` | Teks sekunder, subjudul, dan teks placeholder |
| `ceashyr-border` | `#E3E5EA` | Border tipis `1px` kartu & input field |
| `ceashyr-field` | `#F9FAFB` | Latar input field (`Input Box`) |
| `ceashyr-red` | `#ED3241` | Garis & teks validasi error (`US-04` dan `US-01 K5`) |
| `ceashyr-red-soft` | `#FDECEC` | Latar input & alert error |

---

## 2. Tipografi (`Inter`)

- **Judul Halaman (`<h1>`)**: `28px` (`text-2xl md:text-[28px]`), `font-bold`, `text-ceashyr-ink`.
- **Judul Kartu / Panel (`<h2>`)**: `16px`–`18px` (`text-base` / `text-lg`), `font-bold`.
- **Judul Produk di Kartu `#465947`**: `15px`–`16px`, `font-semibold`, `text-white`.
- **Harga di Kartu Produk**: `14px`, `font-normal`, `text-ceashyr-forest-sub`, format **`Rp4.000`** (tanpa spasi).
- **Stok di Kartu Produk**: `13px`, `font-semibold`, `text-white`, format **`Stok 15`** sejajar di kanan.
- **Total Ringkasan / Nota**: `18px`–`20px`, `font-bold`, format **`Rp 10.500`** (dengan spasi).

---

## 3. Tata Letak Shell Tablet (`1280×800`) & Responsif HP (`<768px`)

### A. Tata Letak Tablet / Desktop (`>= 768px`)

1. **Sidebar Kiri Ikon-Only (`w-[84px]`, `bg-ceashyr-cream`, `border-r`)**:
   - **Tanpa teks label panjang** (hanya ikon dengan `title` & `aria-label` agar lebar tetap ramping seperti desain final).
   - Atas: Jam (`9:41`) + **Profile Avatar** (`44×44px`, lingkaran `#FDECE6` + border `#E86339` + vektor siluet orang — bukan huruf inisial).
   - Menu Navigasi (`42×42px`, `rounded-[12px]`, jarak `10px`):
     - **Ketua KWU (4 ikon)**: `Beranda` -> `Produk` -> `Kasir` -> `Rekap Kertas`
     - **Pengelola/Kasir (3 ikon)**: `Kasir` -> `Rekap Kertas` -> `Daftar Produk`
   - Bawah: `Logout Button` (`42×42px`, `#1F2024`, ikon keluar putih).
2. **Header Konten**:
   - Baris 1 Kiri: Role badge pill (`Peran Aktif: ...`).
   - Baris 1 Kanan: Mode Switcher pill pada `/produk` (`Masuk sebagai Pengelola →` / `Masuk sebagai Ketua KWU →`).
   - Baris 2 Kiri: `<h1>` judul halaman (`28px Bold`).
   - Baris 2 Kanan: CTA utama (`+ Tambah Produk` atau pill `Mode Pengelola • Hanya Lihat`).

### B. Adaptasi Layar Mobile / HP (`< 768px`)

- Sidebar kiri disembunyikan (`hidden md:flex`) agar ruang konten utama tetap lega di layar sempit (`360px`–`430px`).
- Digantikan oleh **Mobile Compact Header** (avatar + role + badge Online/Offline + tombol Logout) dan **Fixed Bottom Navigation Bar** (`md:hidden`) dengan 3–4 ikon menu sesuai peran.
- Grid produk 3 kolom (`lg:grid-cols-3`) otomatis meluruh menjadi **2 kolom (`sm:grid-cols-2`)** di tablet portrait dan **1 kolom (`grid-cols-1`)** di HP.
- Layout 2 kolom (Grid + Detail Panel, Form + Live Preview, Kasir + Keranjang) otomatis bertumpuk vertikal (`grid-cols-1 lg:grid-cols-12`) pada layar `<1024px`.

---

## 4. Aturan Visual Kartu Produk (`ProductCard`)

Gunakan komponen `src/components/ui/ProductCard.tsx`:
- Tinggi tetap `h-[148px]`, sudut membulat `rounded-[16px]`, latar `bg-ceashyr-forest` (`#465947`).
- Baris atas: Nama produk di kiri (`line-clamp-2`), badge opsional di kanan (`BARU`, `Dipilih`, `+ Tambah`, `Dipilih 2x`).
- Baris bawah: Harga di kiri bawah, sisa stok sejajar di kanan bawah.
- Jika sedang dipilih (halaman Detail `US-01` frame `P2`/`K2`), kartu memakai border `#E86339` + ring.
