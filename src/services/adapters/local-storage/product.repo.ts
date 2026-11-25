import { SEED_PRODUCTS } from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import { validateProductForm } from "@/lib/validators";
import type { ProductRepository } from "@/services/contracts";
import type { AddProductResult, Product, ProductFormInput } from "@/types";
import { createId, readJson, writeJson } from "./storage-client";

export function getProductsSync(): Product[] {
  const stored = readJson<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (!stored || stored.length === 0) {
    writeJson(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return [...SEED_PRODUCTS];
  }
  return stored;
}

export function getProductByIdSync(id: string): Product | undefined {
  return getProductsSync().find((p) => p.id === id);
}

export function addProductSync(input: ProductFormInput): AddProductResult {
  const errors = validateProductForm(input);
  if (errors.banner || errors.name || errors.price || errors.stock) {
    return { ok: false, errors };
  }

  const now = new Date().toISOString();
  const parsedPrice = Number(input.price.replace(/[^\d]/g, ""));
  const parsedStock = Number(input.stock.trim());

  const current = getProductsSync().map((p) => ({ ...p, isNew: false }));
  const newProduct: Product = {
    id: createId("prod"),
    name: input.name.trim(),
    price: parsedPrice,
    stock: parsedStock,
    minStock: 5,
    category: "Produk Kantin",
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
};
