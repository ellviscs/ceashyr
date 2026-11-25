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
 * Hasil operasi penambahan produk dari ProductRepository.
 */
export type AddProductResult =
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ProductFormErrors };
