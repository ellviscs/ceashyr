import type {
  AddProductResult,
  CartItem,
  CreateTransactionResult,
  DailyClosingInput,
  DailyClosingResult,
  LoginResult,
  OcrExtractedItem,
  OcrReportRecord,
  Product,
  ProductFormInput,
  RegisterResult,
  SessionState,
  Transaction,
  UserAccount,
  UserRole,
} from "@/types";

/**
 * Kontrak repository autentikasi & manajemen sesi pengguna.
 */
export interface AuthRepository {
  getExtraAccounts(): Promise<UserAccount[]>;
  registerAccount(
    email: string,
    password: string,
    role?: UserRole
  ): Promise<RegisterResult>;
  getSession(): Promise<SessionState | null>;
  login(email: string, password: string): Promise<LoginResult>;
  switchRole(targetRole: UserRole): Promise<SessionState>;
  logout(): Promise<void>;
}

/**
 * Kontrak repository katalog produk kantin.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  create(input: ProductFormInput): Promise<AddProductResult>;
}

/**
 * Kontrak repository pencatatan penjualan (POS) dan mutasi stok.
 */
export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  create(
    items: CartItem[],
    cashierEmail?: string
  ): Promise<CreateTransactionResult>;
  getDailyClosing(dateKey: string): Promise<Transaction | null>;
  recordDailyClosing(input: DailyClosingInput): Promise<DailyClosingResult>;
}

/**
 * Kontrak repository antrean offline & laporan rekap kertas OCR.
 */
export interface OcrRepository {
  listQueue(): Promise<OcrReportRecord[]>;
  listReports(): Promise<OcrReportRecord[]>;
  enqueueOffline(
    fileName: string,
    presetKey?: string,
    imagePreviewUrl?: string
  ): Promise<OcrReportRecord>;
  processQueue(recordId?: string): Promise<OcrReportRecord[]>;
  saveReport(
    items: OcrExtractedItem[],
    fileName: string,
    imagePreviewUrl?: string
  ): Promise<OcrReportRecord>;
}

/**
 * Kontrak DataProvider terpadu agar adapter lokal (localStorage/IndexedDB)
 * dapat ditukar ke backend API / SQL terpusat tanpa menyentuh layer UI.
 */
export interface DataProvider {
  auth: AuthRepository;
  products: ProductRepository;
  transactions: TransactionRepository;
  ocr: OcrRepository;
  resetToSeed(): Promise<void>;
}
