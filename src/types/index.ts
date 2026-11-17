/**
 * Peran pengguna di aplikasi Ceashyr (Kantin KWU HIMATEKPAL ITS).
 */
export type UserRole = "ketua_kwu" | "pengelola";

/**
 * Akun pengguna beserta hak akses dan rute beranda default.
 */
export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  label: string;
  redirectPath: "/ketua" | "/kasir";
}

/**
 * Sesi aktif pengguna yang tersimpan di penyimpanan lokal perangkat.
 */
export interface SessionState {
  accountId: string;
  email: string;
  name: string;
  role: UserRole;
  label: string;
  loggedInAt: string;
}

/**
 * Entitas produk yang dijual di kantin.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock?: number;
  category?: string;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Item di keranjang belanja pada halaman Kasir (US-05).
 */
export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

/**
 * Nota transaksi penjualan tersimpan (US-05 & US-06).
 */
export interface Transaction {
  id: string;
  code: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  cashierEmail: string;
  createdAt: string;
}

/**
 * Baris hasil pembacaan OCR dari foto laporan kertas (US-16).
 */
export interface OcrExtractedItem {
  id: string;
  productName: string;
  matchedProductId?: string;
  qtySold: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Status siklus pemrosesan foto laporan kertas pada antrean lokal & OCR.
 */
export type OcrReportStatus = "queued_offline" | "processed" | "saved";

/**
 * Rekap foto laporan kertas (online maupun antrean offline IndexedDB/localStorage).
 */
export interface OcrReportRecord {
  id: string;
  code: string;
  fileName: string;
  imagePreviewUrl?: string;
  status: OcrReportStatus;
  items: OcrExtractedItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  syncedAt?: string;
  notes?: string;
}

/**
 * Sampel preset laporan kertas untuk pengujian US-16 dan simulasi OCR offline-first.
 */
export interface OcrSamplePreset {
  key: string;
  title: string;
  fileName: string;
  rawText: string;
  accuracyLabel: string;
  items: OcrExtractedItem[];
}

/**
 * Payload input mentah dari form Tambah Produk (US-01).
 */
export interface ProductFormInput {
  name: string;
  price: string;
  stock: string;
}

/**
 * Pesan kesalahan validasi form Tambah Produk (US-01 frame 1390:5120).
 */
export interface ProductFormErrors {
  banner?: string;
  name?: string;
  price?: string;
  stock?: string;
}

/**
 * Hasil validasi input halaman login (US-04).
 */
export interface LoginValidationErrors {
  banner?: string;
  email?: string;
  password?: string;
}
