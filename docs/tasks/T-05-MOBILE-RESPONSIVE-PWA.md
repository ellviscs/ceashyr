# Task Group T-05: Audit Responsif HP (`<768px`), PWA Installability Tablet & Uji End-to-End

- **Cakupan**: Penyempurnaan pengalaman layar sempit (HP kasir/ketua saat mobile), kelayakan install PWA di Tablet, dan uji menyeluruh seluruh Sprint 1.
- **File Target Audit**:
  - `src/components/layout/AppShell.tsx`
  - `src/app/login/page.tsx`
  - `src/app/produk/page.tsx`
  - `src/app/kasir/page.tsx`
  - `src/app/rekap-kertas/page.tsx`

---

## Task H-12: Audit Responsif Mobile `<768px`, Offline App Shell PWA & End-to-End QA {#task-h-12}

### Tujuan
Memastikan aplikasi tidak hanya rapi pada kanvas tablet `1280×800`, tetapi juga nyaman dioperasikan satu tangan di layar HP (`360px`–`430px`) serta siap dipasang (`Install App`) di Tablet Kantin.

### Checklist Audit Teknis & UX Mobile

1. **Verifikasi Layout Tablet (`1280×800`) vs HP (`390×844`) di DevTools Browser**:
   - **Sidebar vs Bottom Bar**: Pastikan di lebar `390px` tidak ada sidebar `84px` memakan layar, dan bottom navigation bar tidak menutupi tombol aksi terbawah (`pb-24` di `AppShell`).
   - **`/login`**: Pastikan kartu login rapi terpusat tanpa overflow horizontal di `360px` width.
   - **`/produk` Panel Detail (`P2` / `K2`)**: Pastikan saat produk diklik pada layar `<1024px`, pengguna tidak perlu scroll jauh — pertimbangkan `scrollIntoView` halus atau merender `Detail Produk` sebagai panel atas/sheet di mobile.
   - **`/kasir` Keranjang Sticky Summary Mobile**: Di layar HP (`<1024px`), tambahkan floating bar ringkas atau pastikan daftar barang + panel `Keranjang Transaksi` mudah diakses tanpa horizontal scroll (`overflow-x: hidden`).
   - **`ProductCard`**: Pastikan tidak ada teks nama produk panjang atau harga/stok terpotong di lebar card sempit.

2. **Verifikasi PWA & Service Worker**:
   - Buka `/login` pada `npm run start` (production build) -> Chrome DevTools **Application -> Manifest**: pastikan tidak ada warning icon/start_url.
   - Chrome DevTools **Application -> Service Workers**: pastikan `/sw.js` berstatus `activated and is running`.
   - Centang **Offline** pada tab Network DevTools -> navigasi antar `/login`, `/ketua`, `/produk`, `/kasir`, `/rekap-kertas`: shell aplikasi tetap terbuka tanpa error offline Chrome.

3. **Skenario End-to-End Akhir (Jalankan Berurutan)**:
   - [ ] Reset seed data lewat `/`.
   - [ ] Login gagal (kosong & `salah@gmail.com`) -> lolos error state `US-04`.
   - [ ] Login Ketua KWU -> tambah produk `Roti Cokelat` (`5000`, `25`) -> muncul banner sukses & kartu `BARU` (`US-01`).
   - [ ] Switch peran via pill ke Pengelola -> pastikan mode read-only aktif (`US-01 Pengelola`).
   - [ ] Buka `/kasir` -> beli `2 Roti Cokelat` (`Rp 10.000`) -> simpan -> stok `Roti Cokelat` turun dari `25` menjadi `23` (`US-05` & `US-06`).
   - [ ] Buka `/rekap-kertas` -> simulasi offline -> simpan 1 foto ke antrean -> ubah jadi online -> `Proses Semua Antrean` -> nota `RKP-XXXX` tersimpan (`US-16`).
   - [ ] Jalankan perintah verifikasi final:
     ```bash
     npm run typecheck
     npm run build
     ```
     Keduanya harus keluar dengan **kode 0**.
