import type {
  CartItem,
  OcrExtractedItem,
  OcrReportRecord,
  Product,
  ProductFormInput,
  SessionState,
  Transaction,
  UserAccount,
  UserRole,
} from "@/types";
import {
  SAMPLE_OCR_PRESETS,
  SEED_ACCOUNTS,
  SEED_OCR_REPORTS,
  SEED_OFFLINE_OCR_QUEUE,
  SEED_PRODUCTS,
  SEED_TRANSACTIONS,
} from "@/constants/seed-data";
import { authenticateAccount, validateLoginInput, validateProductForm } from "@/lib/validators";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Abaikan quota error pada mode private browsing ekstrem
  }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------------
// Autentikasi & Manajemen Peran (US-04)
// ---------------------------------------------------------------------------

export function getExtraAccounts(): UserAccount[] {
  return readJson<UserAccount[]>(STORAGE_KEYS.EXTRA_ACCOUNTS, []);
}

export function registerDemoAccount(
  email: string,
  password: string,
  role: UserRole = "pengelola"
): { ok: true; account: UserAccount } | { ok: false; error: string } {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password.trim()) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }
  const existing = [...SEED_ACCOUNTS, ...getExtraAccounts()].find(
    (a) => a.email.toLowerCase() === trimmedEmail
  );
  if (existing) {
    return { ok: false, error: "Email sudah terdaftar pada sistem." };
  }
  const newAcc: UserAccount = {
    id: createId("acc"),
    email: trimmedEmail,
    password: password.trim(),
    role,
    name: role === "ketua_kwu" ? "Ketua KWU" : "Pengelola / Kasir",
    label:
      role === "ketua_kwu"
        ? `Peran Aktif: Ketua KWU • ${trimmedEmail}`
        : `Peran Aktif: Pengelola / Kasir • ${trimmedEmail}`,
    redirectPath: role === "ketua_kwu" ? "/ketua" : "/kasir",
  };
  writeJson(STORAGE_KEYS.EXTRA_ACCOUNTS, [...getExtraAccounts(), newAcc]);
  return { ok: true, account: newAcc };
}

export function getSession(): SessionState | null {
  return readJson<SessionState | null>(STORAGE_KEYS.SESSION, null);
}

export function login(
  email: string,
  password: string
):
  | { ok: true; session: SessionState; redirectPath: "/ketua" | "/kasir" }
  | { ok: false; fieldErrors?: { email?: string; password?: string }; error: string } {
  const fieldErrors = validateLoginInput(email, password);
  if (fieldErrors.email || fieldErrors.password) {
    return {
      ok: false,
      fieldErrors,
      error: "Mohon isi email dan kata sandi terlebih dahulu.",
    };
  }

  const auth = authenticateAccount(email, password, getExtraAccounts());
  if (!auth.account) {
    return {
      ok: false,
      error: auth.error || "Email atau kata sandi salah! Periksa kembali akun Anda.",
    };
  }

  const session: SessionState = {
    accountId: auth.account.id,
    email: auth.account.email,
    name: auth.account.name,
    role: auth.account.role,
    label: auth.account.label,
    loggedInAt: new Date().toISOString(),
  };
  writeJson(STORAGE_KEYS.SESSION, session);
  return { ok: true, session, redirectPath: auth.account.redirectPath };
}

/**
 * Mengganti peran aktif untuk demonstrasi switcher `Masuk sebagai Ketua KWU / Pengelola`
 * sesuai pill di kanan atas Figma US-1 (`1390:4652`, `1390:4815`).
 */
export function switchRole(targetRole: UserRole): SessionState {
  const targetAccount =
    SEED_ACCOUNTS.find((a) => a.role === targetRole) ?? SEED_ACCOUNTS[0];
  const session: SessionState = {
    accountId: targetAccount.id,
    email: targetAccount.email,
    name: targetAccount.name,
    role: targetAccount.role,
    label: targetAccount.label,
    loggedInAt: new Date().toISOString(),
  };
  writeJson(STORAGE_KEYS.SESSION, session);
  return session;
}

export function logout(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// ---------------------------------------------------------------------------
// Produk Kantin (US-01)
// ---------------------------------------------------------------------------

export function getProducts(): Product[] {
  const stored = readJson<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
  if (!stored || stored.length === 0) {
    writeJson(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return [...SEED_PRODUCTS];
  }
  return stored;
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function addProduct(
  input: ProductFormInput
):
  | { ok: true; product: Product; products: Product[] }
  | { ok: false; errors: ReturnType<typeof validateProductForm> } {
  const errors = validateProductForm(input);
  if (errors.banner || errors.name || errors.price || errors.stock) {
    return { ok: false, errors };
  }

  const now = new Date().toISOString();
  const parsedPrice = Number(input.price.replace(/[^\d]/g, ""));
  const parsedStock = Number(input.stock.trim());

  const current = getProducts().map((p) => ({ ...p, isNew: false }));
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

// ---------------------------------------------------------------------------
// Pencatatan Penjualan & Pengurangan Stok Otomatis (US-05 & US-06)
// ---------------------------------------------------------------------------

export function getTransactions(): Transaction[] {
  const stored = readJson<Transaction[] | null>(STORAGE_KEYS.TRANSACTIONS, null);
  if (!stored) {
    writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
    return [...SEED_TRANSACTIONS];
  }
  return stored;
}

export function createTransaction(
  items: CartItem[],
  cashierEmail = "kasir@gmail.com"
):
  | { ok: true; transaction: Transaction; products: Product[] }
  | { ok: false; error: string } {
  const validItems = items.filter((item) => item.qty > 0);
  if (validItems.length === 0) {
    return { ok: false, error: "Keranjang transaksi masih kosong." };
  }

  const products = getProducts();
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
  const existingTransactions = getTransactions();
  const nextNumber = existingTransactions.length;
  const code = `TRX-${String(nextNumber).padStart(4, "0")}`;

  const normalizedItems: CartItem[] = validItems.map((item) => ({
    ...item,
    subtotal: item.unitPrice * item.qty,
  }));

  const totalItems = normalizedItems.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);

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

// ---------------------------------------------------------------------------
// Rekap Foto Laporan (OCR) & Antrean Offline (US-16)
// ---------------------------------------------------------------------------

export function getOcrQueue(): OcrReportRecord[] {
  return readJson<OcrReportRecord[]>(
    STORAGE_KEYS.OCR_QUEUE,
    SEED_OFFLINE_OCR_QUEUE
  );
}

export function getOcrReports(): OcrReportRecord[] {
  return readJson<OcrReportRecord[]>(
    STORAGE_KEYS.OCR_REPORTS,
    SEED_OCR_REPORTS
  );
}

export function enqueueOfflineOcr(
  fileName: string,
  presetKey?: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  const preset =
    SAMPLE_OCR_PRESETS.find((p) => p.key === presetKey) ?? SAMPLE_OCR_PRESETS[0];
  const items: OcrExtractedItem[] = preset.items.map((item) => ({ ...item }));
  const totalItems = items.reduce((s, x) => s + x.qtySold, 0);
  const totalAmount = items.reduce((s, x) => s + x.subtotal, 0);

  const queue = getOcrQueue();
  const record: OcrReportRecord = {
    id: createId("qocr"),
    code: `QUE-${String(queue.length + 1).padStart(4, "0")}`,
    fileName: fileName || preset.fileName,
    imagePreviewUrl,
    status: "queued_offline",
    items,
    totalItems,
    totalAmount,
    createdAt: new Date().toISOString(),
    notes: "Menunggu Proses OCR (Disimpan lokal saat WiFi bermasalah)",
  };

  writeJson(STORAGE_KEYS.OCR_QUEUE, [record, ...queue]);
  return record;
}

export function processOcrQueue(recordId?: string): OcrReportRecord[] {
  const queue = getOcrQueue();
  const reports = getOcrReports();
  const now = new Date().toISOString();

  const toProcess = recordId ? queue.filter((q) => q.id === recordId) : queue;
  const remaining = recordId ? queue.filter((q) => q.id !== recordId) : [];

  const converted: OcrReportRecord[] = toProcess.map((rec, idx) => ({
    ...rec,
    code: `RKP-${String(reports.length + idx + 1).padStart(4, "0")}`,
    status: "saved",
    syncedAt: now,
    notes: "Diproses otomatis dari antrean offline",
  }));

  writeJson(STORAGE_KEYS.OCR_QUEUE, remaining);
  if (converted.length > 0) {
    writeJson(STORAGE_KEYS.OCR_REPORTS, [...converted, ...reports]);
  }
  return remaining;
}

export function saveDigitalOcrReport(
  items: OcrExtractedItem[],
  fileName: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  const reports = getOcrReports();
  const normalizedItems = items.map((item) => ({
    ...item,
    subtotal: Math.max(0, item.qtySold) * item.unitPrice,
  }));
  const totalItems = normalizedItems.reduce((s, x) => s + x.qtySold, 0);
  const totalAmount = normalizedItems.reduce((s, x) => s + x.subtotal, 0);

  const saved: OcrReportRecord = {
    id: createId("rkp"),
    code: `RKP-${String(reports.length + 1).padStart(4, "0")}`,
    fileName,
    imagePreviewUrl,
    status: "saved",
    items: normalizedItems,
    totalItems,
    totalAmount,
    createdAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  };

  writeJson(STORAGE_KEYS.OCR_REPORTS, [saved, ...reports]);
  return saved;
}

/**
 * Mengembalikan seluruh penyimpanan lokal ke seed data awal untuk keperluan demo / QA.
 */
export function resetAllDataToSeed(): void {
  if (!isBrowser()) return;
  writeJson(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  writeJson(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  writeJson(STORAGE_KEYS.OCR_QUEUE, SEED_OFFLINE_OCR_QUEUE);
  writeJson(STORAGE_KEYS.OCR_REPORTS, SEED_OCR_REPORTS);
  window.localStorage.removeItem(STORAGE_KEYS.SESSION);
  window.localStorage.removeItem(STORAGE_KEYS.EXTRA_ACCOUNTS);
}
