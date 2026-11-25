import {
  SEED_OCR_REPORTS,
  SEED_OFFLINE_OCR_QUEUE,
  SEED_PRODUCTS,
  SEED_TRANSACTIONS,
} from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import type { DataProvider } from "@/services/contracts";
import { localAuthRepository } from "./auth.repo";
import { localOcrRepository } from "./ocr.repo";
import { localProductRepository } from "./product.repo";
import { isBrowser, removeStorageKey, writeJson } from "./storage-client";
import { localTransactionRepository } from "./transaction.repo";

export function resetAllDataToSeedSync(): void {
  if (!isBrowser()) return;
  writeJson(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  writeJson(STORAGE_KEYS.OCR_QUEUE, SEED_OFFLINE_OCR_QUEUE);
  writeJson(STORAGE_KEYS.OCR_REPORTS, SEED_OCR_REPORTS);
  removeStorageKey(STORAGE_KEYS.SESSION);
  removeStorageKey(STORAGE_KEYS.EXTRA_ACCOUNTS);
}

/**
 * Adapter DataProvider untuk mode offline-first berbasis localStorage.
 */
export const localStorageDataProvider: DataProvider = {
  auth: localAuthRepository,
  products: localProductRepository,
  transactions: localTransactionRepository,
  ocr: localOcrRepository,
  async resetToSeed() {
    resetAllDataToSeedSync();
  },
};
