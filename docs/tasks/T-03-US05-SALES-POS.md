# Task Group T-03: Pencatatan Penjualan Kasir & Pengurangan Stok Otomatis (`US-05` & `US-06`)

- **Cakupan TaskBoard**: No `13, 14, 15, 16`
- **File Target Utama**: `src/app/kasir/page.tsx`
- **Helper yang WAJIB Dipakai**:
  - `getProducts`, `createTransaction`, `getSession` dari `src/lib/storage/repository.ts`
  - `formatRupiah`, `formatDateTimeId` dari `src/lib/formatters.ts`
  - `AppShell` dan `ProductCard`
- **Acuan Figma (`1331:4912`)**:
  - `US-05 (Pencatatan Penjualan)` (`1331:6270`):
    - Frame `1338:4925`: `1 - Catat Penjualan (Kosong)`
    - Frame `1338:5007`: `2 - Pilih Barang & Atur Jumlah`
    - Frame `1338:5097`: `3 - Hitung Total Otomatis Saat Jumlah Diubah`
    - Frame `1338:5211`: `4 - Penjualan Berhasil Disimpan`

---

## Task H-07: Pilih Produk, Keranjang `− / +` & Hitung Total Otomatis {#task-h-07}

### Tujuan
Menghidupkan katalog kasir dan `Keranjang Transaksi` pada `src/app/kasir/page.tsx` agar kasir dapat memilih beberapa item, menaik-turunkan qty, dan melihat total harga langsung terhitung otomatis.

### Langkah Implementasi (`src/app/kasir/page.tsx`)

1. **State Halaman Kasir**:
   - `products`: di-load dari `getProducts()` di `useEffect`.
   - `role`: dari `getSession()?.role ?? 'pengelola'`.
   - `cart: CartItem[]`: array barang dipilih.
   - `lastTransaction: Transaction | null`: nota terakhir setelah berhasil disimpan (Frame `1338:5211`).
   - `cartError: string | null`: pesan error jika melebihi stok atau keranjang kosong.
2. **Interaksi Kartu Produk (Kolom Kiri `lg:col-span-8`)**:
   - Setiap klik pada `ProductCard`:
     - Jika belum di keranjang dan `product.stock > 0`: tambahkan ke `cart` (`qty: 1`, `subtotal: product.price`).
     - Jika sudah di keranjang dan `currentQty < product.stock`: tambah `qty + 1` dan perbarui `subtotal = (currentQty + 1) * unitPrice`.
     - Jika `currentQty >= product.stock` atau `product.stock === 0`: set `cartError = "Stok '" + product.name + "' sudah maksimal (" + product.stock + ")."`.
   - Tampilan `badgeText` pada `ProductCard`:
     - Jika `product.stock === 0`: `badgeText="Habis"`, `badgeVariant="muted"`, `disabled={true}`.
     - Jika ada di keranjang (`qty > 0`): `badgeText={qty === 1 ? "Dipilih (1)" : `Dipilih ${qty}x`}`, `badgeVariant="green"`.
     - Jika belum dipilih: `badgeText="+ Tambah"`, `badgeVariant="orange"`.
3. **Interaksi Panel `Keranjang Transaksi` (Kolom Kanan `lg:col-span-4`)**:
   - Jika `cart.length === 0`: tampilkan empty state `"Belum ada barang dipilih"` & `"Klik '+ Tambah' pada kotak produk di kiri untuk mencatat penjualan."` (`1338:4925`).
   - Jika `cart.length > 0`:
     - Judul: `Keranjang Transaksi ({totalItems} Item)`.
     - Untuk setiap item:
       - Nama produk + subjudul `× {formatRupiah(item.unitPrice)}`.
       - Tombol `−` (kurangi 1; jika jadi 0 hapus item dari `cart`), angka `qty` bold, tombol `+` (cek `qty < product.stock`).
       - Subtotal kanan: `{formatRupiah(item.subtotal)}` dengan warna oranye.
   - Baris total di bawah (`1338:5097`):
     - `Total Penjualan`, sublabel `{totalItems} item`, nilai kanan `{formatRupiah(totalAmount, true)}` (`font-bold text-lg`).
   - Uji rumus mental contoh dari Figma `1338:5097`: `(2 × Rp4.000) + (1 × Rp2.500) + (3 × Rp1.000) = Rp 13.500 (6 item)` — pastikan tidak ada selisih pembulatan.

### Kriteria Selesai (`H-07`)
- [ ] Klik `Air Mineral 600 ml` 2x, `Bang-Bang` 1x, `Chocolatas` 3x menghasilkan `6 item` dengan `Total Penjualan: Rp 13.500`.
- [ ] Menekan tombol `−` atau `+` pada baris keranjang langsung memperbarui subtotal item, jumlah item, dan total penjualan.
- [ ] Jumlah di keranjang tidak bisa melebihi `product.stock` yang tersedia.

---

## Task H-08: Simpan Penjualan, Kurangi Stok Otomatis (`US-06`) & Nota Transaksi {#task-h-08}

### Tujuan
Menyimpan transaksi ke repository sehingga stok setiap item otomatis berkurang dan menampilkan ringkasan **`Nota Transaksi Tersimpan`** (`TRX-XXXX`).

### Langkah Implementasi

1. Saat tombol **`Simpan Penjualan`** diklik:
   - Panggil `const res = createTransaction(cart, session?.email ?? 'kasir@gmail.com')`.
   - Jika `res.ok === false`: tampilkan `cartError = res.error`.
   - Jika `res.ok === true`:
     - Perbarui state `products` dengan `res.products` (stok sudah otomatis dikurangi oleh `createTransaction`!).
     - Simpan `lastTransaction = res.transaction` dan kosongkan `cart = []`.
2. **Tampilan Mode Setelah Transaksi Disimpan (`1338:5211`)**:
   - Di atas grid kiri, tampilkan banner hijau:
     `✓ Transaksi {lastTransaction.code} berhasil disimpan! Stok produk otomatis berkurang sesuai jumlah terjual.`
   - Judul grid kiri menjadi: `Pilih Produk Kantin — Stok Diperbarui Otomatis`.
   - Di panel kanan, tampilkan kartu **`Nota Transaksi Tersimpan`** dengan 4 baris:
     - `No. Transaksi`: `{lastTransaction.code}` (`TRX-0001`, dst.)
     - `Waktu`: `{formatDateTimeId(lastTransaction.createdAt)}`
     - `Jumlah Item`: `{lastTransaction.totalItems} pcs`
     - `Total Bayar`: `{formatRupiah(lastTransaction.totalAmount, true)}` (warna oranye bold)
   - Serta tombol penuh oranye **`Catat Penjualan Baru`** yang menutup `lastTransaction = null` agar siap menerima transaksi berikutnya (atau otomatis menutup saat kasir langsung mengklik `+ Tambah` pada produk di kiri).

### Kriteria Selesai (`H-08`)
- [ ] Menyimpan `2 Air Mineral + 1 Bang-Bang + 3 Chocolatas` membuat `Air Mineral` stok `15 -> 13`, `Bang-Bang` `10 -> 9`, `Chocolatas` `20 -> 17`.
- [ ] Reload browser (`F5`) dan buka `/ketua` atau `/produk`: stok tetap berkurang dan KPI `Total Penjualan` & `Transaksi` bertambah otomatis.
- [ ] Jalankan `npm run typecheck && npm run build` tanpa error.
