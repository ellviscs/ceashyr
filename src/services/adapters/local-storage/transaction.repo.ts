import { SEED_TRANSACTIONS } from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import type { TransactionRepository } from "@/services/contracts";
import type {
  CartItem,
  ClosingStockRecordItem,
  CreateTransactionResult,
  DailyClosingInput,
  DailyClosingResult,
  Transaction,
} from "@/types";
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

export function getDailyClosingSync(dateKey: string): Transaction | null {
  const existing = getTransactionsSync().find(
    (t) => t.recordingMode === "closing_stock" && t.closingDateKey === dateKey
  );
  return existing ?? null;
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
    recordingMode: "per_sale",
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
 * Mencatat penjualan harian berdasarkan selisih stok sistem dan sisa stok hari ini
 * (dicatat sekali sebelum toko ditutup).
 */
export function recordDailyClosingSync(
  input: DailyClosingInput
): DailyClosingResult {
  const { dateKey, items, cashierEmail = "kasir@gmail.com" } = input;

  if (getDailyClosingSync(dateKey)) {
    return {
      ok: false,
      error:
        "Penjualan untuk hari ini sudah dicatat sebelum tutup toko. Pencatatan hanya dilakukan 1 kali per hari.",
    };
  }

  const products = getProductsSync();
  const inputMap = new Map(items.map((item) => [item.productId, item]));

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return {
        ok: false,
        error: `Produk dengan ID '${item.productId}' tidak ditemukan.`,
      };
    }
    if (
      !Number.isFinite(item.remainingStock) ||
      !Number.isInteger(item.remainingStock) ||
      item.remainingStock < 0
    ) {
      return {
        ok: false,
        error: `Sisa stok '${product.name}' harus berupa bilangan bulat minimal 0.`,
      };
    }
    if (item.remainingStock > product.stock) {
      return {
        ok: false,
        error: `Sisa stok '${product.name}' (${item.remainingStock}) tidak boleh melebihi stok di sistem (${product.stock}).`,
      };
    }
  }

  const closingItems: ClosingStockRecordItem[] = products.map((product) => {
    const entry = inputMap.get(product.id);
    const remainingStock = entry ? entry.remainingStock : product.stock;
    const soldQty = Math.max(0, product.stock - remainingStock);
    return {
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      openingStock: product.stock,
      remainingStock,
      soldQty,
      subtotal: soldQty * product.price,
    };
  });

  const soldItems: CartItem[] = closingItems
    .filter((item) => item.soldQty > 0)
    .map((item) => ({
      productId: item.productId,
      name: item.name,
      unitPrice: item.unitPrice,
      qty: item.soldQty,
      subtotal: item.subtotal,
    }));

  if (soldItems.length === 0) {
    return {
      ok: false,
      error:
        "Belum ada produk terjual (semua sisa stok masih sama dengan stok di sistem). Ubah sisa stok fisik minimal 1 produk sebelum menutup toko.",
    };
  }

  const now = new Date().toISOString();
  const existingTransactions = getTransactionsSync();
  const nextNumber = existingTransactions.length;
  const code = `TRX-${String(nextNumber).padStart(4, "0")}`;

  const totalItems = soldItems.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = soldItems.reduce((sum, item) => sum + item.subtotal, 0);

  const transaction: Transaction = {
    id: createId("trx"),
    code,
    items: soldItems,
    totalItems,
    totalAmount,
    cashierEmail,
    createdAt: now,
    recordingMode: "closing_stock",
    closingDateKey: dateKey,
    closingItems,
  };

  // US-06: Perbarui stok produk menjadi sisa stok fisik saat tutup toko
  const updatedProducts = products.map((product) => {
    const entry = inputMap.get(product.id);
    if (!entry) return product;
    return {
      ...product,
      stock: entry.remainingStock,
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
  async getDailyClosing(dateKey) {
    return getDailyClosingSync(dateKey);
  },
  async recordDailyClosing(input) {
    return recordDailyClosingSync(input);
  },
};
