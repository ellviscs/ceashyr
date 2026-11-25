import { SEED_TRANSACTIONS } from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import type { TransactionRepository } from "@/services/contracts";
import type { CartItem, CreateTransactionResult, Transaction } from "@/types";
import { getProductsSync } from "./product.repo";
import { createId, readJson, writeJson } from "./storage-client";

export function getTransactionsSync(): Transaction[] {
  const stored = readJson<Transaction[] | null>(
    STORAGE_KEYS.TRANSACTIONS,
    null
  );
  if (!stored) {
    writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
    return [...SEED_TRANSACTIONS];
  }
  return stored;
}

export function createTransactionSync(
  items: CartItem[],
  cashierEmail = "kasir@gmail.com"
): CreateTransactionResult {
  const validItems = items.filter((item) => item.qty > 0);
  if (validItems.length === 0) {
    return { ok: false, error: "Keranjang transaksi masih kosong." };
  }

  const products = getProductsSync();
  for (const item of validItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return { ok: false, error: `Produk '${item.name}' tidak ditemukan.` };
    }
    if (product.stock < item.qty) {
      return {
        ok: false,
        error: `Stok '${product.name}' tidak mencukupi (tersisa ${product.stock}).`,
      };
    }
  }

  const now = new Date().toISOString();
  const existingTransactions = getTransactionsSync();
  const nextNumber = existingTransactions.length;
  const code = `TRX-${String(nextNumber).padStart(4, "0")}`;

  const normalizedItems: CartItem[] = validItems.map((item) => ({
    ...item,
    subtotal: item.unitPrice * item.qty,
  }));

  const totalItems = normalizedItems.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const transaction: Transaction = {
    id: createId("trx"),
    code,
    items: normalizedItems,
    totalItems,
    totalAmount,
    cashierEmail,
    createdAt: now,
  };

  // US-06: Kurangi stok produk otomatis sebesar jumlah terjual
  const updatedProducts = products.map((product) => {
    const sold = normalizedItems.find((item) => item.productId === product.id);
    if (!sold) return product;
    return {
      ...product,
      stock: Math.max(0, product.stock - sold.qty),
      updatedAt: now,
    };
  });

  writeJson(STORAGE_KEYS.PRODUCTS, updatedProducts);
  writeJson(STORAGE_KEYS.TRANSACTIONS, [transaction, ...existingTransactions]);

  return { ok: true, transaction, products: updatedProducts };
}

/**
 * Implementasi TransactionRepository berbasis localStorage.
 */
export const localTransactionRepository: TransactionRepository = {
  async list() {
    return getTransactionsSync();
  },
  async create(items, cashierEmail = "kasir@gmail.com") {
    return createTransactionSync(items, cashierEmail);
  },
};
