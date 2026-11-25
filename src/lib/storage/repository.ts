import { buildSalesReport } from "@/lib/reports/sales-report";
import {
  getExtraAccountsSync,
  getSessionSync,
  loginSync,
  logoutSync,
  registerAccountSync,
  switchRoleSync,
} from "@/services/adapters/local-storage/auth.repo";
import { resetAllDataToSeedSync } from "@/services/adapters/local-storage/index";
import {
  enqueueOfflineOcrSync,
  getOcrQueueSync,
  getOcrReportsSync,
  processOcrQueueSync,
  saveDigitalOcrReportSync,
} from "@/services/adapters/local-storage/ocr.repo";
import {
  addProductSync,
  getProductByIdSync,
  getProductsSync,
  updateProductSync,
} from "@/services/adapters/local-storage/product.repo";
import {
  createTransactionSync,
  getTransactionsSync,
} from "@/services/adapters/local-storage/transaction.repo";
import type {
  CartItem,
  OcrExtractedItem,
  OcrReportRecord,
  Product,
  ProductFormErrors,
  ProductFormInput,
  ProductUpdateInput,
  ReportPeriodType,
  SalesReportData,
  SessionState,
  Transaction,
  UserAccount,
  UserRole,
} from "@/types";

/**
 * @deprecated Gunakan `dataProvider` dari `@/services` untuk semua fitur dan halaman baru.
 * Facade sinkron ini dipertahankan sementara demi kompatibilitas mundur.
 */

// ---------------------------------------------------------------------------
// Autentikasi & Manajemen Peran (US-04)
// ---------------------------------------------------------------------------

/** @deprecated Gunakan `dataProvider.auth.getExtraAccounts()` */
export function getExtraAccounts(): UserAccount[] {
  return getExtraAccountsSync();
}

/** @deprecated Gunakan `dataProvider.auth.registerAccount()` */
export function registerDemoAccount(
  email: string,
  password: string,
  role: UserRole = "pengelola"
): { ok: true; account: UserAccount } | { ok: false; error: string } {
  return registerAccountSync(email, password, role);
}

/** @deprecated Gunakan `dataProvider.auth.getSession()` */
export function getSession(): SessionState | null {
  return getSessionSync();
}

/** @deprecated Gunakan `dataProvider.auth.login()` */
export function login(
  email: string,
  password: string
):
  | { ok: true; session: SessionState; redirectPath: "/ketua" | "/kasir" }
  | { ok: false; fieldErrors?: { email?: string; password?: string }; error: string } {
  return loginSync(email, password);
}

/** @deprecated Gunakan `dataProvider.auth.switchRole()` */
export function switchRole(targetRole: UserRole): SessionState {
  return switchRoleSync(targetRole);
}

/** @deprecated Gunakan `dataProvider.auth.logout()` */
export function logout(): void {
  logoutSync();
}

// ---------------------------------------------------------------------------
// Produk Kantin (US-01)
// ---------------------------------------------------------------------------

/** @deprecated Gunakan `dataProvider.products.list()` */
export function getProducts(): Product[] {
  return getProductsSync();
}

/** @deprecated Gunakan `dataProvider.products.getById()` */
export function getProductById(id: string): Product | undefined {
  return getProductByIdSync(id);
}

/** @deprecated Gunakan `dataProvider.products.create()` */
export function addProduct(
  input: ProductFormInput
):
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ProductFormErrors } {
  return addProductSync(input);
}

/** @deprecated Gunakan `dataProvider.products.update()` */
export function updateProduct(
  id: string,
  input: ProductUpdateInput
):
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ProductFormErrors } {
  return updateProductSync(id, input);
}

// ---------------------------------------------------------------------------
// Pencatatan Penjualan & Pengurangan Stok Otomatis (US-05 & US-06)
// ---------------------------------------------------------------------------

/** @deprecated Gunakan `dataProvider.transactions.list()` */
export function getTransactions(): Transaction[] {
  return getTransactionsSync();
}

/** @deprecated Gunakan `dataProvider.transactions.create()` */
export function createTransaction(
  items: CartItem[],
  cashierEmail = "kasir@gmail.com"
):
  | { ok: true; transaction: Transaction; products: Product[] }
  | { ok: false; error: string } {
  return createTransactionSync(items, cashierEmail);
}

// ---------------------------------------------------------------------------
// Rekap Foto Laporan (OCR) & Antrean Offline (US-16)
// ---------------------------------------------------------------------------

/** @deprecated Gunakan `dataProvider.ocr.listQueue()` */
export function getOcrQueue(): OcrReportRecord[] {
  return getOcrQueueSync();
}

/** @deprecated Gunakan `dataProvider.ocr.listReports()` */
export function getOcrReports(): OcrReportRecord[] {
  return getOcrReportsSync();
}

/** @deprecated Gunakan `dataProvider.ocr.enqueueOffline()` */
export function enqueueOfflineOcr(
  fileName: string,
  presetKey?: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  return enqueueOfflineOcrSync(fileName, presetKey, imagePreviewUrl);
}

/** @deprecated Gunakan `dataProvider.ocr.processQueue()` */
export function processOcrQueue(recordId?: string): OcrReportRecord[] {
  return processOcrQueueSync(recordId);
}

/** @deprecated Gunakan `dataProvider.ocr.saveReport()` */
export function saveDigitalOcrReport(
  items: OcrExtractedItem[],
  fileName: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  return saveDigitalOcrReportSync(items, fileName, imagePreviewUrl);
}

/**
 * Mengambil dan merekap data laporan penjualan harian/mingguan dari database lokal (US-15).
 */
export function getSalesReportData(
  periodType: ReportPeriodType,
  anchorDateKey: string,
  includeOcrReports = false
): SalesReportData {
  return buildSalesReport({
    periodType,
    anchorDateKey,
    transactions: getTransactions(),
    ocrReports: getOcrReports(),
    includeOcrReports,
    session: getSession(),
  });
}

/**
 * @deprecated Gunakan `dataProvider.resetToSeed()`
 * Mengembalikan seluruh penyimpanan lokal ke seed data awal untuk keperluan demo / QA.
 */
export function resetAllDataToSeed(): void {
  resetAllDataToSeedSync();
}
