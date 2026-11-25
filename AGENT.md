# AGENT.md — Panduan Universal AI Coding Agent (`ceashyr-pwa`)

Dokumen ini adalah kontrak kerja standar bagi **setiap AI coding agent** (Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini, Antigravity, dll.) yang digunakan anggota tim saat bekerja di repository **Ceashyr PWA**.

Tujuan utamanya: menjaga konsistensi arsitektur, mencegah *merge conflict* saat bekerja paralel, dan memastikan kode siap berkembang menuju backend SQL terpusat.

---

## 1. Ringkasan Proyek & Tech Stack

- **Aplikasi**: **Ceashyr** — Aplikasi Kasir, Manajemen Stok, Rekap Kertas OCR, dan Laporan Penjualan (PWA) untuk Kantin KWU HIMATEKPAL ITS.
- **Stack**: Next.js 15 (App Router), React 19, TypeScript (`strict: true`), Tailwind CSS, `jspdf` + `jspdf-autotable`, Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.json`).
- **Target Perangkat**: Tablet (`1280×800`, utama) dan Mobile HP (`<768px`) dengan mode offline-first.
- **Peran Pengguna (`UserRole`)**: `ketua_kwu` dan `pengelola`.

---

## 2. Peta Arsitektur Modular

| Direktori / File | Tanggung Jawab |
| :--- | :--- |
| `src/app/` | Next.js App Router pages tipis (*route composer*, target ~100–300 baris). Tidak menyimpan logika bisnis berat. |
| `src/features/` | *Vertical feature slices* per domain (`products/`, `pos/`, `ocr/`, `reports/`). Berisi komponen UI & hook khusus fitur. |
| `src/services/` | Layer akses data `async` melalui `dataProvider` (`src/services/index.ts`) dan kontrak di `src/services/contracts.ts`. |
| `src/services/adapters/local-storage/` | Implementasi adapter `localStorage` untuk mode lokal/demo (`auth`, `product`, `transaction`, `ocr`). |
| `src/types/` | Definisi tipe TypeScript per domain (`auth.ts`, `product.ts`, `transaction.ts`, `ocr.ts`, `report.ts`) + barrel `src/types/index.ts`. |
| `src/config/navigation.ts` | *Single source of truth* daftar rute navigasi, label, ikon, dan izin akses peran (`APP_NAV_ROUTES`). |
| `src/hooks/` | Hook bersama lintas fitur (`useSession.ts`, `useOnlineStatus.ts`). |
| `src/components/ui/` | Primitif UI bersama (`ProductCard`, `SurfaceCard`, `StatusBanner`, `KpiCard`, `RoleRestrictedView`). |
| `src/components/layout/` | Layout shell aplikasi (`AppShell.tsx`, `SidebarIcons.tsx`). |
| `src/lib/` | Fungsi utilitas murni (`formatters.ts`, `validators.ts`, `reports/*`). `src/lib/storage/repository.ts` hanya facade kompatibilitas mundur (`@deprecated`). |
| `src/constants/` | Design tokens (`design-tokens.ts`) dan data seed demo (`seed-data.ts`). |
| `public/` | Aset statis, `manifest.json`, dan Service Worker (`sw.js`). |

---

## 3. Aturan Wajib (Non-Negotiable Rules)

1. **Batas Akses Data (`DataProvider` Boundary)**
   - **DILARANG** mengakses `window.localStorage` secara langsung atau mengimpor `@/lib/storage/repository` di `src/app/`, `src/features/`, maupun `src/components/`.
   - **WAJIB** memanggil `dataProvider` dari `@/services` (semua metode bertipe `Promise<...>`) agar pergantian ke backend SQL terpusat nanti cukup mengganti adapter di `src/services/index.ts`.
   - Seluruh tipe domain wajib didefinisikan di `src/types/<domain>.ts` dan diekspor ulang dari `src/types/index.ts`.

2. **Vertical Feature Slices (Anti Merge-Conflict)**
   - Letakkan komponen dan hook khusus domain baru di `src/features/<nama-fitur>/` (`components/`, `hooks/`).
   - Jaga `src/app/<rute>/page.tsx` tetap tipis: hanya menghubungkan `useSession`, `dataProvider`, dan komponen fitur.
   - Jangan mengubah fitur lain yang tidak termasuk dalam ruang lingkup task Anda.

3. **Navigasi & Pembagian Peran (RBAC)**
   - Daftarkan rute baru dan hak akses perannya di `src/config/navigation.ts` (`APP_NAV_ROUTES`), bukan hardcode di `AppShell.tsx`.
   - Gunakan `useSession()` untuk membaca peran/email aktif dan `RoleRestrictedView` untuk guard halaman di UI.
   - Catatan produksi: saat backend aktif, penegakan autentikasi & otorisasi **wajib** dipindahkan/ditambahkan ke server-side (Next.js `middleware.ts` + session cookie `httpOnly`).

4. **Konsistensi UI, Design System & Responsivitas**
   - Gunakan ulang primitif UI di `src/components/ui/` (`SurfaceCard`, `StatusBanner`, `KpiCard`, `ProductCard`, `RoleRestrictedView`) serta token warna `ceashyr-*` (lihat `docs/03-DESIGN-SYSTEM-FIGMA.md`).
   - Pastikan seluruh direktori UI (`src/app`, `src/components`, `src/features`) tercakup di `content` pada `tailwind.config.ts` dan selalu tulis kelas Tailwind sebagai string utuh (hindari interpolasi string dinamis seperti `` `lg:col-span-${n}` ``).
   - Setiap layar baru wajib responsif di Tablet (`1280×800`) dan Mobile HP (`<768px`) dengan copywriting bahasa Indonesia yang konsisten.

5. **Aturan Next.js App Router & PWA Offline-First**
   - File `.tsx` yang memakai React hooks (`useState`, `useEffect`, dll.), event handler, atau API browser wajib diawali `"use client";`.
   - Halaman yang memakai `useSearchParams()` wajib dibungkus `<Suspense>` (contoh: `src/app/produk/page.tsx`, `src/app/register/page.tsx`).
   - Jika menambah rute baru yang perlu berjalan saat offline, daftarkan path rute tersebut di `APP_SHELL_URLS` pada `public/sw.js` dan naikkan versi `CACHE_NAME`.

6. **Kontrak Ekstensibilitas (OCR & Backend)**
   - Logika pembacaan OCR harus berada di balik kontrak `OcrEngine` pada `src/features/ocr/ocr-engine.ts` agar implementasi nyata (Tesseract.js / Vision API) dapat ditukar dari satu tempat.

7. **Keamanan**
   - Jangan pernah menaruh kredensial produksi, API key, atau secret di kode frontend maupun file yang di-commit ke Git (`.env*` tetap di luar repository).

---

## 4. Alur Kerja Kolaborasi & Git (Agile)

- **1 User Story / Task = 1 Branch**: gunakan format `feat/usXX-deskripsi`, `fix/deskripsi`, `refactor/deskripsi`, atau `docs/deskripsi`.
- **Conventional Commits**: `feat(...)`, `fix(...)`, `refactor(...)`, `docs(...)`, `chore(...)`.
- **Minimal Diff pada File Bersama**: batasi perubahan pada file lintas-tim (`src/config/navigation.ts`, `src/types/index.ts`, `src/services/contracts.ts`) hanya pada penambahan entri baru agar PR paralel dari beberapa agent mudah di-merge.

---

## 5. Verifikasi Wajib & Definition of Done (DoD)

Sebelum menganggap task selesai atau membuka PR:

1. Jalankan pemeriksaan tipe dan build produksi:
   ```bash
   npm run typecheck
   npm run build
   ```
   Keduanya wajib selesai dengan `exit code 0`.
2. Pastikan tidak ada pemakaian langsung `localStorage` atau impor `@/lib/storage/repository` di luar `src/services/` dan facade lama.
3. Uji skenario peran (`ketua_kwu` vs `pengelola`), tampilan Tablet + HP (`<768px`), serta kondisi edge case (input kosong/negatif, periode nihil, mode offline).
4. Jika environment lokal tidak memiliki `node`/`npm` terpasang, laporkan secara eksplisit bahwa `typecheck`/`build` belum dijalankan di environment tersebut dan verifikasi melalui CI/mesin lokal dengan Node.js v20+.

---

## 6. Peta Baca Dokumentasi (`docs/`)

Baca dokumen seperlunya sesuai task yang dikerjakan agar konteks agent tetap hemat:

| Kebutuhan Task | Dokumen Acuan |
| :--- | :--- |
| Gambaran indeks dokumentasi | `docs/README.md` |
| Konteks bisnis, pain points, backlog `US-01`..`US-16` | `docs/01-PROJECT-OVERVIEW.md` |
| Arsitektur PWA, service worker, alur data awal | `docs/02-ARCHITECTURE-AND-PWA.md` |
| Warna, tipografi, dimensi tablet, node Figma | `docs/03-DESIGN-SYSTEM-FIGMA.md` |
| Alur pengguna & detail screen prototype | `docs/04-USER-FLOWS-AND-PROTOTYPE.md` |
| Playbook tambah fitur Sprint 2+, migrasi SQL & swap OCR | `docs/05-AGILE-ARCHITECTURE-GUIDE.md` |
| Alur kerja paralel tim multi-agent, template brief & PR checklist | `docs/06-TEAM-AGENT-WORKFLOW.md` |
| Checklist & rincian task historis Sprint 1 | `docs/tasks/TASK-BOARD-CHECKLIST.md` |
