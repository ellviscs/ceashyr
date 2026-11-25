# Panduan Arsitektur Modular & Pengembangan Agile (Sprint 2+)

Dokumen ini menjelaskan struktur arsitektur hasil refactoring pada branch `refactor/agile-modular-architecture` agar tim dapat menambah User Story baru secara paralel (*low merge-conflict*), menguji modul secara terpisah, dan bermigrasi ke backend SQL terpusat tanpa membongkar kode UI.

---

## 1. Peta Direktori Modular

```text
src/
├── app/                         # Next.js App Router (halaman tipis / route composer)
│   ├── page.tsx                 # Launchpad & reset seed
│   ├── login/page.tsx           # US-04 Login
│   ├── register/page.tsx        # US-04 Register & Lupa Sandi
│   ├── ketua/page.tsx           # US-04 Beranda Ketua KWU
│   ├── produk/page.tsx          # US-01 Katalog & Tambah Produk
│   ├── kasir/page.tsx           # US-05 & US-06 POS Kasir
│   ├── rekap-kertas/page.tsx    # US-16 Rekap OCR & Antrean Offline
│   └── laporan/page.tsx         # US-15 Laporan Penjualan PDF/CSV
│
├── config/
│   └── navigation.ts            # Single source of truth rute, ikon, dan izin peran (RBAC)
│
├── hooks/
│   ├── useOnlineStatus.ts       # Pemantau status navigator.onLine
│   └── useSession.ts            # Pengelola sesi aktif, peran, dan switchRole/logout
│
├── components/
│   ├── layout/                  # AppShell & SidebarIcons
│   ├── pwa/                     # PwaRegistrar
│   └── ui/                      # Primitif UI bersama (ProductCard, SurfaceCard, StatusBanner, KpiCard, RoleRestrictedView)
│
├── features/                    # Feature slices terisolasi per domain bisnis
│   ├── products/components/     # ProductForm, ProductDetailPanel, ProductCatalogSection
│   ├── pos/
│   │   ├── hooks/useCart.ts     # State keranjang & transaksi POS
│   │   └── components/          # CartPanel, MobileCartFloatingBar, TransactionReceipt
│   ├── ocr/
│   │   ├── ocr-engine.ts        # Kontrak OcrEngine (swap point mock -> Tesseract/Vision API)
│   │   └── components/          # OcrUploadStep, OcrReadyStep, OcrReviewStep, OcrSavedStep, OcrOfflineQueueSection, OcrHistorySection
│   └── reports/components/      # DownloadActionButtons, ReportFilterBar, ReportKpiGrid, WeeklyTrendChart, ReportTransactionsTable, ReportProductRecapPanel
│
├── services/                    # Layer akses data async-ready (Repository + Adapter Pattern)
│   ├── contracts.ts             # Interface AuthRepository, ProductRepository, TransactionRepository, OcrRepository, DataProvider
│   ├── index.ts                 # Titik swap tunggal (`export const dataProvider = ...`)
│   └── adapters/local-storage/  # Implementasi localStorage per domain (auth, product, transaction, ocr)
│
├── types/                       # Tipe domain modular + barrel export di src/types/index.ts
│   ├── auth.ts
│   ├── product.ts
│   ├── transaction.ts
│   ├── ocr.ts
│   ├── report.ts
│   └── index.ts
│
├── constants/                   # Design tokens & seed data
└── lib/                         # Formatters, validators, report builders/exporters, storage-keys
```

---

## 2. Playbook Menambah Fitur Baru (Sprint 2+ Agile)

Untuk menambah User Story baru (misalnya **`US-07: Stok Masuk Vendor`** atau **`US-12: Catatan Utang Pelanggan`**) tanpa menyentuh fitur lain:

1. **Tipe Domain (`src/types/`)**:
   Tambahkan file baru (mis. `src/types/restock.ts` atau `src/types/debt.ts`) dan ekspor ulang dari `src/types/index.ts`.
2. **Kontrak & Adapter Data (`src/services/`)**:
   - Tambahkan interface repository di `src/services/contracts.ts` dan daftarkan di `DataProvider`.
   - Implementasikan adapter lokal sementara di `src/services/adapters/local-storage/` (atau langsung ke `api/` bila backend sudah tersedia).
3. **Feature Slice (`src/features/<nama-fitur>/`)**:
   Buat folder `components/` dan `hooks/` khusus untuk fitur tersebut agar pekerjaan antar-developer tidak menimbulkan *merge conflict*.
4. **Daftarkan Rute & Akses Peran (`src/config/navigation.ts`)**:
   Tambahkan 1 entri di `APP_NAV_ROUTES` (termasuk `roles: ["ketua_kwu"]` atau `["ketua_kwu", "pengelola"]`), lalu buat halaman tipis `src/app/<rute>/page.tsx` yang memanggil komponen dari `src/features/<nama-fitur>/`.

---

## 3. Playbook Migrasi ke Database SQL Terpusat (PostgreSQL / Supabase)

Seluruh halaman dan feature hooks kini hanya memanggil `dataProvider` dari `@/services` yang sudah bertipe `Promise<...>`.

Langkah migrasi ke backend SQL tanpa mengubah komponen UI:

1. **Siapkan API / Route Handlers** di `src/app/api/*` (mis. `/api/products`, `/api/transactions`, `/api/ocr-reports`, `/api/auth/session`) yang terhubung ke PostgreSQL via Prisma/Drizzle atau Supabase.
2. **Buat Adapter API** di `src/services/adapters/api/`:
   Implementasikan interface `DataProvider` (`auth`, `products`, `transactions`, `ocr`) menggunakan `fetch("/api/...")`.
   - Untuk ketahanan offline (*offline-first*), simpan antrean outbox di **IndexedDB** saat `!navigator.onLine`, lalu sinkronkan saat koneksi kembali pulih.
3. **Tukar Satu Baris di `src/services/index.ts`**:
   ```ts
   // Sebelum:
   export const dataProvider: DataProvider = localStorageDataProvider;

   // Sesudah:
   export const dataProvider: DataProvider = apiDataProvider;
   ```
4. **Penegakan Auth Server-Side**:
   Tambahkan Next.js `middleware.ts` untuk memverifikasi session cookie `httpOnly` di sisi server (menggantikan guard client-side `RoleRestrictedView` sebagai lapisan pertahanan utama).

---

## 4. Playbook Swap Engine OCR Nyata

Logika pemrosesan gambar saat ini terisolasi di `src/features/ocr/ocr-engine.ts` melalui interface `OcrEngine`:

1. Buat implementasi baru (mis. `tesseractOcrEngine` untuk OCR lokal di browser atau `visionApiOcrEngine` yang mengirim gambar ke `/api/ocr/scan`).
2. Ganti ekspor tunggal di `src/features/ocr/ocr-engine.ts`:
   ```ts
   export const ocrEngine: OcrEngine = visionApiOcrEngine;
   ```
3. Seluruh state machine dan UI di `src/features/ocr/components/` tetap berjalan tanpa perubahan.
