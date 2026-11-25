import type { Product } from "./product";

/**
 * Mode pencatatan penjualan pada halaman Kasir.
 */
export type SaleRecordingMode = "per_sale" | "closing_stock";

/**
 * Item di keranjang belanja pada halaman Kasir (US-05 mode per transaksi).
 */
export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

/**
 * Input sisa stok fisik harian untuk pencatatan penjualan sebelum tutup toko.
 */
export interface ClosingStockItemInput {
  productId: string;
  remainingStock: number;
}

/**
 * Rincian per produk pada nota rekap tutup toko harian (`closing_stock`).
 */
export interface ClosingStockRecordItem {
  productId: string;
  name: string;
  unitPrice: number;
  openingStock: number;
  remainingStock: number;
  soldQty: number;
  subtotal: number;
}

/**
 * Payload pencatatan penjualan harian saat toko akan ditutup (1x per hari).
 */
export interface DailyClosingInput {
  dateKey: string;
  items: ClosingStockItemInput[];
  cashierEmail?: string;
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
  recordingMode?: SaleRecordingMode;
  closingDateKey?: string;
  closingItems?: ClosingStockRecordItem[];
}

/**
 * Hasil operasi pembuatan transaksi penjualan & pengurangan stok (per transaksi).
 */
export type CreateTransactionResult =
  | { ok: true; transaction: Transaction; products: Product[] }
  | { ok: false; error: string };

/**
 * Hasil operasi pencatatan rekap penjualan tutup toko harian (`closing_stock`).
 */
export type DailyClosingResult =
  | { ok: true; transaction: Transaction; products: Product[] }
  | { ok: false; error: string };
