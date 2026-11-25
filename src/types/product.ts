/**
 * Status ketersediaan stok terhadap batas stok minimum (`US-09` & `US-11`).
 */
export type StockAlertStatus = "ok" | "low" | "out";

/**
 * Filter kategori & status stok pada halaman daftar produk.
 */
export type ProductCategoryFilter = "all" | "makanan" | "minuman" | "low_stock";

/**
 * Entitas produk yang dijual di kantin.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category?: string;
  imageUrl?: string;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload input mentah dari form Tambah Produk (US-01 & US-09).
 */
export interface ProductFormInput {
  name: string;
  price: string;
  stock: string;
  minStock: string;
  category?: string;
}

/**
 * Payload input mentah dari modal Edit Produk (US-02 & US-09).
 */
export interface ProductUpdateInput {
  name: string;
  price: string;
  minStock: string;
  stock?: string;
  category?: string;
}

/**
 * Pesan kesalahan validasi form Tambah/Edit Produk (US-01, US-02, US-09).
 */
export interface ProductFormErrors {
  banner?: string;
  name?: string;
  price?: string;
  stock?: string;
  minStock?: string;
}

/**
 * Hasil operasi penambahan produk dari ProductRepository.
 */
export type AddProductResult =
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ProductFormErrors };

/**
 * Hasil operasi pembaruan produk dari ProductRepository (US-02).
 */
export type UpdateProductResult =
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ProductFormErrors };
