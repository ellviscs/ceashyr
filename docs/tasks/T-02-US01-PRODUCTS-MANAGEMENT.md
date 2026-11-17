# Task Group T-02: Manajemen & Tambah Produk (`US-01`)

- **Cakupan TaskBoard**: No `8, 9, 10, 11, 12`
- **File Target Utama**: `src/app/produk/page.tsx` (boleh dipecah ke komponen kecil di `src/components/produk/` jika diperlukan, namun cukup 1–2 file agar hemat token)
- **Helper yang WAJIB Dipakai**:
  - `getProducts`, `addProduct`, `switchRole`, `getSession` dari `src/lib/storage/repository.ts`
  - `validateProductForm` dari `src/lib/validators.ts`
  - `formatRupiah` dari `src/lib/formatters.ts`
  - `AppShell` dan `ProductCard`
- **Acuan Figma (`1331:4912`)**:
  - `US-1(Tambah Produk)Pengelola` (`1390:4621`): `P1` (`1390:4624`), `P2` (`1390:4693`)
  - `US-1(Tambah Produk)KWU` (`1331:6084`): `K1` (`1390:4781`), `K2` (`1390:4854`), `K3` (`1390:4946`), `K4` (`1390:5033`), `K5` (`1390:5120`), `K6` (`1390:5212`)

---

## Task H-04: Dual Mode Daftar Produk & Panel Detail (`P1`, `P2`, `K1`, `K2`) {#task-h-04}

### Tujuan
Menghidupkan tampilan daftar produk 3 kolom + switcher peran (`Masuk sebagai Ketua KWU →` / `Masuk sebagai Pengelola →`) + panel kanan `Detail Produk` saat kartu produk diklik.

### Langkah Implementasi (`src/app/produk/page.tsx`)

1. **Sinkronisasi Peran Awal**:
   - Di `useEffect`, baca `searchParams.get('mode')`: jika `'pengelola'` pakai `'pengelola'`; jika tidak, cek `getSession()?.role ?? 'ketua_kwu'`.
   - Jika `searchParams.get('action') === 'tambah'` dan peran bukan `'pengelola'`, langsung buka mode Form Tambah (`viewMode = 'form'`).
2. **State `selectedProduct: Product | null` (Frame `P2` & `K2`)**:
   - Saat kartu produk diklik -> set `selectedProduct` (klik ulang produk yang sama untuk menutup).
   - Ketika `selectedProduct !== null`:
     - Ubah grid kiri menjadi 8 kolom (`lg:col-span-8`) dan tampilkan kartu `Detail Produk` di 4 kolom kanan (`lg:col-span-4`, border `border-ceashyr-orange`, tombol tutup **`✕`** di kanan atas).
     - Berikan prop `selected` + `badgeText="Dipilih"` pada `ProductCard` yang sedang terpilih.
     - Isi panel kanan persis sesuai Figma `P2`/`K2`:
       - Hero box `#465947`: Nama produk (`Air Mineral 600 ml`) + subjudul (`{product.category} • Produk Kantin Aktif`).
       - Baris info: `Harga Jual` (`{formatRupiah(product.price)}`), `Stok Tersedia` (`{product.stock} unit`), `Hak Akses` (`Lihat Saja (Pengelola)` vs `Kelola Penuh (Ketua KWU)`).
       - Footer panel:
         - Jika **Pengelola**: kotak info amber `"Masuk sebagai Ketua KWU bila perlu menambah produk baru."` (tanpa tombol tambah!).
         - Jika **Ketua KWU**: tombol oranye **`+ Tambah Produk Baru`** yang membuka mode Form Tambah.
3. **Role Switcher (`onSwitchRole`)**:
   - Hubungkan `onSwitchRole` di `AppShell` dengan `switchRole(nextRole)`. Saat beralih ke Pengelola ketika sedang di form, kembalikan `viewMode = 'list'`.

### Kriteria Selesai (`H-04`)
- [ ] Klik kartu `Air Mineral 600 ml` membuka panel `Detail Produk` di kanan (di desktop) atau di bawah/modal (di HP), dan tombol `✕` menutupnya kembali.
- [ ] Mode Pengelola tidak menampilkan tombol `+ Tambah Produk` atau form tambah sama sekali.
- [ ] Klik pill **`Masuk sebagai Pengelola →`** / **`Masuk sebagai Ketua KWU →`** mengganti mode, sidebar, dan badge seketika.

---

## Task H-05: Form Tambah Produk + Pratinjau Kartu + Validasi Input (`K3`, `K4`, `K5`) {#task-h-05}

### Tujuan
Mengimplementasikan tampilan Form Tambah Produk (`viewMode = 'form'`) saat tombol **`+ Tambah Produk`** diklik, lengkap dengan panel **Pratinjau Kartu Produk** di sisi kanan dan validasi merah saat input tidak valid.

### Langkah Implementasi

1. **Header saat `viewMode === 'form'`**:
   - Judul `AppShell`: **`Tambah Produk Baru`**
   - `headerRightSlot`: tombol **`← Kembali ke Daftar`** (putih border `ceashyr-border`).
2. **Layout Form (`lg:col-span-7`) + Pratinjau (`lg:col-span-5`)**:
   - **Form Kiri (`Form Tambah Produk`)**:
     - Subjudul: `"Lengkapi data produk baru sebelum disimpan ke database."`
     - Alert error opsional (tampil saat `errors.banner` ada): latar `bg-ceashyr-red-soft border-ceashyr-red text-ceashyr-red`.
     - 3 Input dengan placeholder persis Figma Frame `1390:4946`:
       1. **`Nama Produk`**: placeholder `"Contoh: Air Mineral 600 ml"`
       2. **`Harga Jual (Rp)`**: input numerik/teks, placeholder `"3000"`
       3. **`Stok`**: input numerik/teks, placeholder `"Jumlah barang yang ada sekarang"`
     - Masing-masing input menampilkan border merah (`border-ceashyr-red bg-ceashyr-red-soft/40`) dan pesan error di bawahnya (`errors.name`, `errors.price`, `errors.stock`) jika tidak valid, atau border hijau saat terisi valid (opsional).
     - Tombol aksi bawah: **`Batal`** (putih, kembali ke `viewMode = 'list'`) dan **`Simpan`** (oranye penuh).
   - **Panel Kanan (`Pratinjau Kartu Produk`)**:
     - Merender komponen `ProductCard` secara *live* dari state input saat ini (jika kosong, tampilkan `"Nama Produk Baru"`, `Rp3.000`, `Stok 0`, badge `Draft`; jika valid, badge hijau `Siap Simpan`; jika sedang error, badge merah `Error`).
     - Di bawah kartu pratinjau, tampilkan kotak **`Ketentuan Validasi Form:`** dengan 3 poin aturan:
       - `• Nama produk wajib diisi (tidak boleh kosong)`
       - `• Harga jual wajib berupa angka positif (> Rp 0)`
       - `• Stok awal minimal 1 unit`
3. **Validasi Saat Klik `Simpan`**:
   - Panggil `validateProductForm({ name, price, stock })` terlebih dahulu sebelum menyimpan (atau tangkap `{ ok: false, errors }` dari `addProduct`).
   - Pastikan skenario tidak valid (`name=""`, `price="-1500"`, `stock="0"`) menampilkan seluruh error per-field + alert banner (sesuai Frame `1390:5120`).

### Kriteria Selesai (`H-05`)
- [ ] Placeholder 3 field persis sesuai Figma `K3` (`Contoh: Air Mineral 600 ml`, `3000`, `Jumlah barang yang ada sekarang`).
- [ ] Mengetik `"Roti Cokelat"`, `"5000"`, `"25"` langsung memperbarui kartu `Pratinjau Kartu Produk` di sebelah kanan.
- [ ] Klik `Simpan` dengan input kosong atau `Harga <= 0` / `Stok < 1` memunculkan alert banner & error merah per-field tanpa menyimpan data.

---

## Task H-06: Simpan Produk Baru & Tampilkan Daftar Terbaru (`K6`) {#task-h-06}

### Tujuan
Menyimpan produk valid melalui `addProduct`, kembali ke daftar produk, menampilkan banner hijau sukses, dan menandai produk terbaru dengan badge **`BARU`**.

### Langkah Implementasi

1. Ketika `addProduct({ name, price, stock })` mengembalikan `{ ok: true, product, products }`:
   - Update state `products` ke array `products` terbaru.
   - Tutup form (`viewMode = 'list'`), reset input form & errors.
   - Set `successBanner = "✓ Produk '" + product.name + "' berhasil disimpan ke database dan ditampilkan di daftar produk!"`.
2. Render banner hijau di atas daftar produk (`bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green rounded-xl px-4 py-3`).
3. Pada kartu kontainer daftar produk, tampilkan badge kanan **`Tersimpan di Database • +1 Produk`**. Produk baru tampil di urutan pertama grid 3 kolom dengan badge **`BARU`** (otomatis didukung oleh `ProductCard` melalui `product.isNew`).
4. Reload halaman (`F5`) untuk membuktikan data produk baru bertahan di `localStorage` (`getProducts()`).

### Kriteria Selesai (`H-06`)
- [ ] Setelah menyimpan `"Roti Cokelat"` (`5000`, `25`), total berubah menjadi `4 produk dijual di kantin` dan `Roti Cokelat` muncul paling depan berlabel `BARU`.
- [ ] Reload browser tidak menghilangkan produk baru.
- [ ] Jalankan `npm run typecheck && npm run build` tanpa error.
