# Alur Kerja Tim Multi-Agent (Universal Agile Playbook)

Dokumen ini mengatur cara kerja tim ketika **setiap anggota tim menggunakan AI coding agent pilihannya masing-masing** pada repository `ceashyr-pwa`. Semua aturan bersifat **universal** (tidak terikat tool/model tertentu).

---

## 1. Prinsip Kerja Paralel (Minim Merge Conflict)

Saat beberapa anggota tim mengerjakan User Story berbeda secara bersamaan (misalnya Developer A mengerjakan `US-07 Stok Masuk`, Developer B mengerjakan `US-12 Utang Pelanggan`), ikuti batasan area kerja berikut:

| Area File | Aturan Edit |
| :--- | :--- |
| `src/features/<domain-baru>/` | **Bebas dimiliki 1 task/developer** (komponen, hook, helper khusus domain). |
| `src/app/<rute-baru>/page.tsx` | **Bebas dimiliki 1 task/developer**, cukup sebagai wrapper tipis (~100–250 baris). |
| `src/types/<domain-baru>.ts` | Buat file baru per domain; di `src/types/index.ts` cukup tambah 1 baris `export * from "./<domain-baru>";`. |
| `src/services/contracts.ts` & `adapters/*` | Tambah interface/implementasi repository domain baru tanpa mengubah kontrak domain lain. |
| `src/config/navigation.ts` | Tambah 1 objek entri rute di `APP_NAV_ROUTES`; jangan ubah urutan/konfigurasi rute tim lain. |
| `src/components/ui/` & `src/hooks/` | Hanya ubah jika memang butuh primitif bersama baru; prioritaskan memakai komponen yang sudah ada. |

---

## 2. Template Brief / Prompt Universal untuk Agent Anggota Tim

Saat meminta AI agent mengerjakan sebuah task, salin dan isi template ringkas berikut agar agent langsung mengikuti arsitektur repo:

```text
Baca AGENT.md di root repository terlebih dahulu sebelum mengubah file apa pun.

Tugas: Kerjakan [Kode User Story / Nama Fitur, mis. US-07 Catat Barang Masuk Vendor].
Konteks bisnis & desain:
- Baca docs/01-PROJECT-OVERVIEW.md bagian [section terkait]
- Baca docs/03-DESIGN-SYSTEM-FIGMA.md (untuk token warna & layout)
- Baca docs/05-AGILE-ARCHITECTURE-GUIDE.md (untuk pola feature slice & dataProvider)

Batasan pengerjaan:
1. Buat tipe domain di src/types/<domain>.ts dan ekspor di src/types/index.ts.
2. Tambahkan kontrak & implementasi data via src/services/ (jangan akses localStorage langsung di UI).
3. Isolasi komponen & hook di src/features/<domain>/, lalu sambungkan di src/app/<rute>/page.tsx dan src/config/navigation.ts.
4. Jangan ubah fitur lain di luar ruang lingkup tugas ini.
5. Setelah selesai, jalankan `npm run typecheck && npm run build` dan laporkan file yang diubah beserta hasil verifikasi.
```

---

## 3. Checklist Review PR (Sprint 2+)

Sebelum me-merge Pull Request ke branch utama, reviewer (manusia maupun agent) memeriksa 5 poin berikut:

### A. Batas Arsitektur
- [ ] Tidak ada akses `window.localStorage` langsung di `src/app/`, `src/features/`, atau `src/components/`.
- [ ] Tidak ada impor baru ke `@/lib/storage/repository` (semua lewat `dataProvider` di `@/services`).
- [ ] Halaman `src/app/*/page.tsx` tetap tipis dan logika fitur terisolasi di `src/features/<domain>/`.

### B. Next.js, TypeScript & PWA
- [ ] `npm run typecheck` dan `npm run build` lulus (`exit code 0`).
- [ ] Semua komponen dengan hook/event handler memakai `"use client";`.
- [ ] Pemakaian `useSearchParams()` dibungkus `<Suspense>`.
- [ ] Rute offline baru sudah ditambahkan ke `APP_SHELL_URLS` di `public/sw.js` (jika perlu).

### C. UI & Pengalaman Pengguna
- [ ] Memakai komponen bersama (`SurfaceCard`, `StatusBanner`, `KpiCard`, `ProductCard`, `RoleRestrictedView`) dan kelas `ceashyr-*`.
- [ ] Berfungsi baik di layar Tablet (`1280×800`) dan Mobile (`<768px`).
- [ ] Menangani state kosong (*empty state*), error validasi, dan status offline dengan jelas.

### D. Pembagian Peran & Kesiapan SQL
- [ ] Hak akses peran (`ketua_kwu` vs `pengelola`) terdefinisi di `src/config/navigation.ts`.
- [ ] Semua operasi data di `src/services/contracts.ts` bertipe `Promise<...>` sehingga siap disambungkan ke PostgreSQL/Supabase.
- [ ] Tidak ada secret, password produksi, atau `.env` yang ikut ter-commit.

---

## 4. Transisi ke Backend SQL Terpusat (Checklist Singkat)

Ketika tim backend/database siap mengganti penyimpanan lokal demo:
1. Buat schema SQL terpusat (`users`, `products`, `transactions`, `transaction_items`, `stock_movements`, `ocr_reports`).
2. Buat Next.js Route Handlers di `src/app/api/*` beserta `middleware.ts` untuk validasi sesi `httpOnly` dan RBAC di sisi server.
3. Implementasikan `apiDataProvider` di `src/services/adapters/api/` yang memenuhi kontrak `DataProvider` (`src/services/contracts.ts`), dengan outbox **IndexedDB** untuk transaksi saat offline.
4. Tukar 1 baris di `src/services/index.ts` dari `localStorageDataProvider` menjadi `apiDataProvider`.
