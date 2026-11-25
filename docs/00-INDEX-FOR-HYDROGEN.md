# Panduan Kerja untuk Gemini Hydrogen (`ceashyr-pwa`)

> [!NOTE]
> Dokumen ini adalah arsip panduan eksekusi Sprint 1. Untuk aturan arsitektur modular terbaru dan panduan universal bagi seluruh AI coding agent tim, baca [`AGENT.md`](../AGENT.md), [`docs/05-AGILE-ARCHITECTURE-GUIDE.md`](05-AGILE-ARCHITECTURE-GUIDE.md), dan [`docs/06-TEAM-AGENT-WORKFLOW.md`](06-TEAM-AGENT-WORKFLOW.md).

Dokumen ini menjadi titik masuk utama saat Anda (atau **Gemini Hydrogen**) mengerjakan implementasi fitur secara bertahap dan hemat token.

## 1. Aturan Wajib AI Agent (Baca Sebelum Edit)

1. **Kerjakan satu task (`H-01` .. `H-12`) per sesi** agar konteks tetap kecil dan akurat.
2. **Jangan membuat ulang helper, types, atau design token** — seluruh kontrak data & penyimpanan lokal sudah tersedia:
   - Types: `src/types/index.ts`
   - Seed & Konstanta UI: `src/constants/seed-data.ts`, `src/constants/design-tokens.ts`
   - Formatters & Validators: `src/lib/formatters.ts`, `src/lib/validators.ts`
   - Penyimpanan Lokal (Local-First): `src/lib/storage/repository.ts`
   - Layout & Kartu: `src/components/layout/AppShell.tsx`, `src/components/ui/ProductCard.tsx`
3. **Ikuti UI Figma `⭐️ Templates (Copy)` (node `1331:4912`)** secara persis (warna, copywriting bahasa Indonesia, tata letak kartu 3 kolom `#465947`, sidebar ikon `84px` + avatar kontak).
4. **Dukungan Tablet (utama `1280×800`) dan Mobile HP (`<768px`)**: Gunakan grid responsif Tailwind (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) serta manfaatkan `AppShell` yang otomatis menampilkan bottom nav bar di `<768px`.
5. **Verifikasi Wajib Setelah Selesai Setiap Task**:
   ```bash
   npm run typecheck
   npm run build
   ```
   Pastikan `exit code 0` tanpa error TypeScript atau Next.js App Router SSR (`useSearchParams` harus di dalam `<Suspense>`, akses `localStorage` hanya di dalam `useEffect` / event handler via `repository.ts`).

---

## 2. Urutan Eksekusi Task (`H-01` s/d `H-12`)

Lihat checklist pemetaan lengkap terhadap 21 item Sprint 1 di [`docs/tasks/TASK-BOARD-CHECKLIST.md`](tasks/TASK-BOARD-CHECKLIST.md).

| Urutan | ID Task | Fokus Fitur & Route | File Spesifikasi | Estimasi Scope |
| :---: | :---: | :--- | :--- | :--- |
| 1 | `H-01` | Login sukses, Register, Forgot Password (`/login`, `/register`) | [T-01](tasks/T-01-US04-AUTH-AND-ROLES.md#task-h-01) | Kecil |
| 2 | `H-02` | Validasi Login Kosong & Akun Salah (`/login`) | [T-01](tasks/T-01-US04-AUTH-AND-ROLES.md#task-h-02) | Kecil |
| 3 | `H-03` | Beranda Ketua KWU + Guard Pembagian Peran (`/ketua`, `/kasir`) | [T-01](tasks/T-01-US04-AUTH-AND-ROLES.md#task-h-03) | Kecil |
| 4 | `H-04` | Daftar & Detail Produk Pengelola vs Ketua KWU + Switcher (`/produk`) | [T-02](tasks/T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-04) | Sedang |
| 5 | `H-05` | Form Tambah Produk + Pratinjau Kartu + Validasi Input (`/produk`) | [T-02](tasks/T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-05) | Sedang |
| 6 | `H-06` | Simpan Produk Baru ke Repository & Tampilkan Badge `BARU` (`/produk`) | [T-02](tasks/T-02-US01-PRODUCTS-MANAGEMENT.md#task-h-06) | Kecil |
| 7 | `H-07` | Kasir: Pilih Barang 3 Kolom, Keranjang `- / +`, Total Otomatis (`/kasir`) | [T-03](tasks/T-03-US05-SALES-POS.md#task-h-07) | Sedang |
| 8 | `H-08` | Kasir: Simpan Penjualan, Kurangi Stok Otomatis, Nota `TRX-XXXX` (`/kasir`) | [T-03](tasks/T-03-US05-SALES-POS.md#task-h-08) | Sedang |
| 9 | `H-09` | Rekap Kertas: Ambil/Pilih Foto + 3 Sampel Uji Preset (`/rekap-kertas`) | [T-04](tasks/T-04-US16-OCR-PAPER-REPORT.md#task-h-09) | Sedang |
| 10 | `H-10` | Rekap Kertas: Konversi OCR + Koreksi Qty + Simpan `RKP-XXXX` (`/rekap-kertas`) | [T-04](tasks/T-04-US16-OCR-PAPER-REPORT.md#task-h-10) | Sedang |
| 11 | `H-11` | Rekap Kertas: Mode Offline & Proses Antrean Lokal (`/rekap-kertas`) | [T-04](tasks/T-04-US16-OCR-PAPER-REPORT.md#task-h-11) | Sedang |
| 12 | `H-12` | Audit Responsif Mobile `<768px` & Checklist End-to-End PWA | [T-05](tasks/T-05-MOBILE-RESPONSIVE-PWA.md#task-h-12) | Kecil |

---

## 3. Template Prompt Hemat Token untuk Gemini Hydrogen

Saat berpindah ke mode **Gemini Hydrogen**, salin prompt pendek di bawah ini (ganti `H-XX` dan path file `T-XX`):

```text
Kerjakan hanya Task H-01 pada proyek Ceashyr PWA.
Baca dokumen berikut sebelum coding:
1. docs/03-DESIGN-SYSTEM-FIGMA.md (sebagai acuan style singkat)
2. docs/tasks/T-01-US04-AUTH-AND-ROLES.md (fokus pada Task H-01)
3. src/app/login/page.tsx dan src/app/register/page.tsx

Jangan ubah file fitur lain di luar scope Task H-01. Gunakan helper yang sudah ada di src/lib/storage/repository.ts dan src/lib/validators.ts. Setelah selesai, jalankan `npm run typecheck && npm run build` dan laporkan hasilnya.
```

> [!TIP]
> Selalu jalankan uji Task `H-01` s/d `H-11` dalam kelompok kecil atau satu per satu agar diff selalu bersih, mudah direview sesuai DoD Sprint 1, dan meminimalkan retry token.
