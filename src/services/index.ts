import { localStorageDataProvider } from "./adapters/local-storage";
import type { DataProvider } from "./contracts";

/**
 * Titik masuk tunggal akses data aplikasi.
 * Untuk bermigrasi ke backend SQL terpusat (PostgreSQL / Supabase / REST API),
 * buat implementasi `ApiDataProvider` dan ganti nilai `dataProvider` di baris ini.
 */
export const dataProvider: DataProvider = localStorageDataProvider;

export * from "./contracts";
