# Task Group T-01: Autentikasi Multi-Peran & Pembagian Peran (`US-04`)

- **Cakupan TaskBoard**: No `1, 2, 3, 4, 5, 6, 7`
- **File Target Utama**:
  - `src/app/login/page.tsx`
  - `src/app/register/page.tsx`
  - `src/app/ketua/page.tsx`
- **Helper yang WAJIB Dipakai**:
  - `login`, `registerDemoAccount`, `getSession` dari `src/lib/storage/repository.ts`
  - `SEED_ACCOUNTS` dari `src/constants/seed-data.ts`
- **Acuan Figma (`1331:4912`)**:
  - Login Ketua KWU (`1331:5579`: `1331:5580`, `1331:5622`, `1331:5638`, `1331:5698`)
  - Error Negatif (`1387:4827`: `1331:5596`, `1331:6664`, `1331:6680`)
  - Login Kasir (`1331:5785`: `1331:5786`, `1331:5838`, `1331:5854`, `1331:5870`, `1331:5947`)
  - Register & Forgot Password (`1331:6003`: `1331:6004`, `1331:6065`, `1331:6033`, `1331:6046`, `1331:6019`)

---

## Task H-01: Form Login Interaktif, Auto-Redirect Peran & Alur Register/Forgot Password {#task-h-01}

### Tujuan
Mengaktifkan submit login pada `src/app/login/page.tsx` agar dapat mengautentikasi Ketua KWU maupun Pengelola/Kasir dan mengarahkan ke rute masing-masing, serta melengkapi alur daftar/lupa kata sandi di `src/app/register/page.tsx`.

### Langkah Implementasi

1. **Pada `src/app/login/page.tsx`**:
   - Tambahkan state: `email`, `password`, `showPassword`, `fieldErrors` (`{ email?: string; password?: string }`), `authError` (`string | null`), dan `isSubmitting`.
   - Sediakan toggle show/hide kata sandi (ikon mata di sebelah kanan field `Password`).
   - Saat tombol **`Login`** diklik:
     - Panggil `const res = login(email, password)`.
     - Jika `res.ok === true`: panggil `router.push(res.redirectPath)` (`'/ketua'` untuk `ketuakwu@gmail.com`, `'/kasir'` untuk `kasir@gmail.com`).
   - Tambahkan **2 tombol cepat pengisian demo (opsional di bawah form)** bertuliskan:
     - `"Isi Akun Ketua KWU"` (`ketuakwu@gmail.com` / `ketuakwu123`)
     - `"Isi Akun Pengelola/Kasir"` (`kasir@gmail.com` / `kasir123`)
     - Ini mempermudah QA dan mitra saat demo di tablet tanpa menghilangkan input manual.

2. **Pada `src/app/register/page.tsx`**:
   - Baca query param `tab` (dibungkus `<Suspense>`!): default `'register'`, jika `tab=forgot` buka mode **`Recover Your account`**.
   - **Alur Register (`1331:6004` -> `1331:6065`)**:
     - Field: `Email Address`, `Password`, `Confirm Password`, plus pilihan peran (`Pengelola / Kasir` atau `Ketua KWU`).
     - Setelah valid -> tampilkan kartu **`Enter confirmation code`** (input 4 digit kode OTP, kode demo `1234` atau bebas non-kosong) -> panggil `registerDemoAccount(email, password, role)` -> redirect `/login`.
   - **Alur Forgot Password (`1331:6033` -> `1331:6046` -> `1331:6019`)**:
     - Langkah 1 (`Recover Your account`): input email -> kirim kode -> Langkah 2 (`Enter confirmation code`) -> Langkah 3 (`Enter Your New Password`) -> tampilkan pesan sukses & link kembali ke `/login`.

### Kriteria Selesai (`H-01`)
- [ ] Login `ketuakwu@gmail.com` + `ketuakwu123` (atau `12345678`) mengarah ke `/ketua`.
- [ ] Login `kasir@gmail.com` + `kasir123` (atau `12345678`) mengarah ke `/kasir`.
- [ ] Akun baru yang didaftarkan melalui `/register` bisa langsung dipakai login di `/login`.

---

## Task H-02: State Error Login Kosong & Akun Salah (`1387:4827`) {#task-h-02}

### Tujuan
Menampilkan validasi input persis seperti Section `Salah password/email. gk masukin password/email` (`1387:4827`) di Figma `1331:4912`.

### Langkah Implementasi (`src/app/login/page.tsx`)

1. **Kasus Input Kosong (`1331:5596`)**:
   - Jika `login(email, password)` gagal dengan `res.fieldErrors`:
     - Ubah border input bermasalah menjadi merah (`border-ceashyr-red bg-ceashyr-red-soft/40`).
     - Tampilkan pesan merah tepat di bawah/dalam field:
       - Email kosong: `"Please Enter Email Address!"` (beserta ikon tanda seru `!` merah).
       - Password kosong: `"Please Enter Password"` (beserta ikon tanda seru `!` merah).
2. **Kasus Akun / Sandi Salah (`1331:6664` -> `1331:6680`)**:
   - Misal input `salah@gmail.com` & `salah123`:
   - `login(...)` mengembalikan `{ ok: false, error: "Email atau kata sandi salah! Periksa kembali akun Anda." }`.
   - Tampilkan alert merah di antara judul **`Welcome!`** dan input Email:
     `bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red text-xs font-medium rounded-xl px-3.5 py-2.5`.
   - Hapus alert/field error begitu user mengetik ulang pada salah satu input.

### Kriteria Selesai (`H-02`)
- [ ] Submit saat kosong memunculkan border merah + teks `"Please Enter Email Address!"` dan `"Please Enter Password"`.
- [ ] Submit dengan `salah@gmail.com` / `salah123` memunculkan banner `"Email atau kata sandi salah! Periksa kembali akun Anda."`.

---

## Task H-03: Guard Pembagian Peran & Halaman Beranda Ketua KWU {#task-h-03}

### Tujuan
Memastikan pemisahan hak akses Ketua KWU vs Pengelola/Kasir berjalan nyata (sesuai Frame `1331:5698` dan `1331:5947`).

### Langkah Implementasi

1. **Pada `src/app/ketua/page.tsx`**:
   - Di dalam `useEffect`: cek `const session = getSession()`.
   - Jika `session?.role === 'pengelola'`: **jangan biarkan Pengelola mengoperasikan Beranda Ketua KWU**; tampilkan kartu peringatan akses terbatas berwarna amber (`Akses Terbatas: Halaman Beranda Ketua KWU hanya untuk Ketua KWU.`) dengan tombol **`Masuk ke Halaman Kasir →`** (`/kasir`) atau **`Lihat Daftar Produk (Mode Pengelola) →`** (`/produk?mode=pengelola`).
   - Pastikan tombol `+ Tambah Produk` pada kartu produk mengarah ke `/produk?action=tambah` dan 3 kartu `Aksi Cepat Ketua KWU` mengarah ke `/produk`, `/kasir`, dan `/rekap-kertas`.
2. **Pada `src/app/kasir/page.tsx` dan `src/app/rekap-kertas/page.tsx`** (kolaborasi role header):
   - Baca `getSession()` di `useEffect` agar jika Ketua KWU membuka `/kasir` atau `/rekap-kertas`, `AppShell` menampilkan `role="ketua_kwu"` dan `email={session.email}` (sidebar 4 ikon tetap konsisten!). Jika belum login / `pengelola`, gunakan `role="pengelola"`.

### Kriteria Selesai (`H-03`)
- [ ] Pengelola (`kasir@gmail.com`) melihat 3 menu sidebar (`Kasir`, `Rekap`, `Produk`), dan dicegah mengakses fitur khusus `/ketua`.
- [ ] Ketua KWU (`ketuakwu@gmail.com`) melihat 4 menu sidebar (`Beranda`, `Produk`, `Kasir`, `Rekap`) beserta KPI real-time di `/ketua`.
- [ ] Jalankan `npm run typecheck && npm run build` tanpa error.
