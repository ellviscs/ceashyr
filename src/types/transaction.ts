import type { Product } from "./product";

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
 * Hasil operasi pembuatan transaksi penjualan & pengurangan stok.
 */
export type CreateTransactionResult =
  | { ok: true; transaction: Transaction; products: Product[] }
  | { ok: false; error: string };
