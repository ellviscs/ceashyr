import { SEED_PRODUCTS } from "@/constants/seed-data";
import { normalizeMinStock } from "@/features/products/stock-status";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import {
  parseNonNegativeIntegerInput,
  parsePositiveRupiahInput,
  validateProductEditForm,
  validateProductForm,
} from "@/lib/validators";
import type { ProductRepository } from "@/services/contracts";
import type {
  AddProductResult,
  Product,
  ProductFormInput,
  ProductUpdateInput,
  UpdateProductResult,
} from "@/types";
import { createId, readJson, writeJson } from "./storage-client";

function withNormalizedMinStock(product: Product): Product {
  return {
    ...product,
    minStock: normalizeMinStock(product.minStock),
  };
}

export function getProductsSync(): Product[] {
  const stored = readJson<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (!stored || stored.length === 0) {
    const seeded = SEED_PRODUCTS.map(withNormalizedMinStock);
    writeJson(STORAGE_KEYS.PRODUCTS, seeded);
    return seeded;
  }
  return stored.map(withNormalizedMinStock);
}

export function getProductByIdSync(id: string): Product | undefined {
  return getProductsSync().find((p) => p.id === id);
}

export function addProductSync(input: ProductFormInput): AddProductResult {
  const errors = validateProductForm(input);
  if (errors.banner || errors.name || errors.price || errors.stock || errors.minStock) {
    return { ok: false, errors };
  }

  const now = new Date().toISOString();
  const parsedPrice = parsePositiveRupiahInput(input.price);
  const parsedStock = parseNonNegativeIntegerInput(input.stock);
  const parsedMinStock = parseNonNegativeIntegerInput(input.minStock);

  const current = getProductsSync().map((p) => ({ ...p, isNew: false }));
  const newProduct: Product = {
    id: createId("prod"),
    name: input.name.trim(),
    price: parsedPrice,
    stock: parsedStock,
    minStock: parsedMinStock,
    category: input.category?.trim() || "Produk Kantin",
    isNew: true,
    createdAt: now,
    updatedAt: now,
  };

  // Taruh produk baru di awal daftar (mengikuti Figma 1390:5212)
  const updated = [newProduct, ...current];
  writeJson(STORAGE_KEYS.PRODUCTS, updated);
  return { ok: true, product: newProduct, products: updated };
}

/**
 * Memperbarui data produk (nama, harga, stok minimum, dan stok opsional) ke database lokal.
 * Catatan US-02: Riwayat transaksi lama tidak diubah karena setiap transaksi menyimpan snapshot harga saat transaksi terjadi.
 */
export function updateProductSync(
  id: string,
  input: ProductUpdateInput
): UpdateProductResult {
  const errors = validateProductEditForm(input);
  if (errors.banner || errors.name || errors.price || errors.stock || errors.minStock) {
    return { ok: false, errors };
  }

  const current = getProductsSync();
  const target = current.find((p) => p.id === id);
  if (!target) {
    return {
      ok: false,
      errors: { banner: "Produk tidak ditemukan di database." },
    };
  }

  const now = new Date().toISOString();
  const parsedPrice = parsePositiveRupiahInput(input.price);
  const parsedMinStock = parseNonNegativeIntegerInput(input.minStock);
  const parsedStock =
    input.stock !== undefined
      ? parseNonNegativeIntegerInput(input.stock)
      : target.stock;

  const updatedProduct: Product = {
    ...target,
    name: input.name.trim(),
    price: parsedPrice,
    minStock: parsedMinStock,
    stock: parsedStock,
    category: input.category?.trim() || target.category || "Produk Kantin",
    updatedAt: now,
  };

  const updatedProducts = current.map((p) =>
    p.id === id ? updatedProduct : p
  );
  writeJson(STORAGE_KEYS.PRODUCTS, updatedProducts);
  return { ok: true, product: updatedProduct, products: updatedProducts };
}

/**
 * Implementasi ProductRepository berbasis localStorage.
 */
export const localProductRepository: ProductRepository = {
  async list() {
    return getProductsSync();
  },
  async getById(id) {
    return getProductByIdSync(id);
  },
  async create(input) {
    return addProductSync(input);
  },
  async update(id, input) {
    return updateProductSync(id, input);
  },
};
