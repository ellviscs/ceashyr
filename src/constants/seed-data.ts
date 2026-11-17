import type {
  OcrReportRecord,
  OcrSamplePreset,
  Product,
  Transaction,
  UserAccount,
} from "@/types";

/**
 * Akun bawaan untuk demonstrasi pembagian peran Ketua KWU dan Pengelola/Kasir (US-04).
 */
export const SEED_ACCOUNTS: UserAccount[] = [
  {
    id: "acc-ketua-kwu",
    email: "ketuakwu@gmail.com",
    password: "ketuakwu123",
    role: "ketua_kwu",
    name: "Ketua KWU HIMATEKPAL",
    label: "Peran Aktif: Ketua KWU • ketuakwu@gmail.com",
    redirectPath: "/ketua",
  },
  {
    id: "acc-pengelola-kasir",
    email: "kasir@gmail.com",
    password: "kasir123",
    role: "pengelola",
    name: "Bu Ellya (Pengelola / Kasir)",
    label: "Peran Aktif: Pengelola / Kasir • kasir@gmail.com",
    redirectPath: "/kasir",
  },
];

/**
 * Katalog produk awal sesuai prototipe Figma `1331:4912` (3 produk kantin).
 */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-air-mineral",
    name: "Air Mineral 600 ml",
    price: 4000,
    stock: 15,
    minStock: 5,
    category: "Minuman Kemasan",
    isNew: false,
    createdAt: "2026-11-17T08:00:00.000Z",
    updatedAt: "2026-11-17T08:00:00.000Z",
  },
  {
    id: "prod-bang-bang",
    name: "Bang-Bang",
    price: 2500,
    stock: 10,
    minStock: 5,
    category: "Makanan Ringan",
    isNew: false,
    createdAt: "2026-11-17T08:00:00.000Z",
    updatedAt: "2026-11-17T08:00:00.000Z",
  },
  {
    id: "prod-chocolatas",
    name: "Chocolatas",
    price: 1000,
    stock: 20,
    minStock: 5,
    category: "Makanan Ringan",
    isNew: false,
    createdAt: "2026-11-17T08:00:00.000Z",
    updatedAt: "2026-11-17T08:00:00.000Z",
  },
];

/**
 * Riwayat transaksi awal agar metrik Beranda Ketua KWU langsung terisi realistis.
 */
export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "trx-seed-1",
    code: "TRX-0000",
    items: [
      {
        productId: "prod-air-mineral",
        name: "Air Mineral 600 ml",
        unitPrice: 4000,
        qty: 2,
        subtotal: 8000,
      },
      {
        productId: "prod-bang-bang",
        name: "Bang-Bang",
        unitPrice: 2500,
        qty: 1,
        subtotal: 2500,
      },
    ],
    totalItems: 3,
    totalAmount: 10500,
    cashierEmail: "kasir@gmail.com",
    createdAt: "2026-11-17T09:15:00.000Z",
  },
];

/**
 * Daftar contoh foto laporan kertas untuk uji konversi digital (US-16).
 */
export const SAMPLE_OCR_PRESETS: OcrSamplePreset[] = [
  {
    key: "laporan-terang",
    title: "Sampel 1 — Catatan Harian Terang",
    fileName: "laporan-harian-17nov.jpg",
    accuracyLabel: "✓ Sampel 1 (Catatan Terang): 3 baris • Rp 39.000 (100% Akurat)",
    rawText:
      "Laporan Harian Kantin - 17/11/2026\n1. Air Mineral 600ml   6 x 4.000 = 24.000\n2. Bang-Bang           4 x 2.500 = 10.000\n3. Chocolatas          5 x 1.000 =  5.000",
    items: [
      {
        id: "ocr-item-1",
        productName: "Air Mineral 600 ml",
        matchedProductId: "prod-air-mineral",
        qtySold: 6,
        unitPrice: 4000,
        subtotal: 24000,
      },
      {
        id: "ocr-item-2",
        productName: "Bang-Bang",
        matchedProductId: "prod-bang-bang",
        qtySold: 4,
        unitPrice: 2500,
        subtotal: 10000,
      },
      {
        id: "ocr-item-3",
        productName: "Chocolatas",
        matchedProductId: "prod-chocolatas",
        qtySold: 5,
        unitPrice: 1000,
        subtotal: 5000,
      },
    ],
  },
  {
    key: "laporan-pagi-offline",
    title: "Sampel 2 — Catatan Sesi Pagi (Rapat)",
    fileName: "laporan-pagi-17nov.jpg",
    accuracyLabel: "✓ Sampel 2 (Tulisan Tangan Rapat): 3 baris • Rp 25.500 (Terkoreksi)",
    rawText:
      "Catatan Pagi KWU 17 Nov\n- Air Mineral 600 ml: 4 x 4.000 = 16.000\n- Bang-Bang: 3 x 2.500 = 7.500\n- Chocolatas: 2 x 1.000 = 2.000",
    items: [
      {
        id: "ocr-pagi-1",
        productName: "Air Mineral 600 ml",
        matchedProductId: "prod-air-mineral",
        qtySold: 4,
        unitPrice: 4000,
        subtotal: 16000,
      },
      {
        id: "ocr-pagi-2",
        productName: "Bang-Bang",
        matchedProductId: "prod-bang-bang",
        qtySold: 3,
        unitPrice: 2500,
        subtotal: 7500,
      },
      {
        id: "ocr-pagi-3",
        productName: "Chocolatas",
        matchedProductId: "prod-chocolatas",
        qtySold: 2,
        unitPrice: 1000,
        subtotal: 2000,
      },
    ],
  },
  {
    key: "laporan-siang-offline",
    title: "Sampel 3 — Rekap Offline Saat WiFi Putus",
    fileName: "laporan-siang-17nov.jpg",
    accuracyLabel: "✓ Sampel 3 (Simpan Offline → Online): 2 baris • Rp 18.000 (Berhasil)",
    rawText:
      "Rekap Siang (WiFi Offline)\n- Air Mineral 600 ml: 3 x 4.000 = 12.000\n- Chocolatas: 6 x 1.000 = 6.000",
    items: [
      {
        id: "ocr-siang-1",
        productName: "Air Mineral 600 ml",
        matchedProductId: "prod-air-mineral",
        qtySold: 3,
        unitPrice: 4000,
        subtotal: 12000,
      },
      {
        id: "ocr-siang-2",
        productName: "Chocolatas",
        matchedProductId: "prod-chocolatas",
        qtySold: 6,
        unitPrice: 1000,
        subtotal: 6000,
      },
    ],
  },
];

/**
 * Antrean offline awal agar tampilan US-16 frame 1341:5098 dapat langsung diuji.
 */
export const SEED_OFFLINE_OCR_QUEUE: OcrReportRecord[] = [];

/**
 * Riwayat rekap kertas tersimpan awal.
 */
export const SEED_OCR_REPORTS: OcrReportRecord[] = [];
