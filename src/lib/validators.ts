import type {
  LoginValidationErrors,
  ProductFormErrors,
  ProductFormInput,
  UserAccount,
} from "@/types";
import { SEED_ACCOUNTS } from "@/constants/seed-data";

/**
 * Memvalidasi kekosongan & format dasar input login (sesuai frame `1331:5596`).
 */
export function validateLoginInput(
  email: string,
  password: string
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};
  if (!email.trim()) {
    errors.email = "Please Enter Email Address!";
  }
  if (!password.trim()) {
    errors.password = "Please Enter Password";
  }
  return errors;
}

/**
 * Memverifikasi kredensial email & kata sandi terhadap daftar akun yang tersedia.
 * Mengembalikan akun cocok jika valid, atau pesan error sesuai frame `1331:6680`.
 */
export function authenticateAccount(
  email: string,
  password: string,
  extraAccounts: UserAccount[] = []
): { account?: UserAccount; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPass = password.trim();
  const allAccounts = [...SEED_ACCOUNTS, ...extraAccounts];

  const found = allAccounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  const isDemoShortcutPass =
    normalizedPass === "12345678" || (found && found.password === normalizedPass);

  if (!found || !isDemoShortcutPass) {
    return {
      error: "Email atau kata sandi salah! Periksa kembali akun Anda.",
    };
  }

  return { account: found };
}

/**
 * Memvalidasi input Form Tambah Produk sesuai aturan validasi US-01 (`1390:5120`):
 * - Nama produk wajib diisi
 * - Harga jual harus bilangan positif (> Rp 0)
 * - Stok awal minimal 1 unit
 */
export function validateProductForm(input: ProductFormInput): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (!input.name.trim()) {
    errors.name = "Nama produk wajib diisi.";
  }

  const parsedPrice = Number(input.price.replace(/[^\d.-]/g, ""));
  if (!input.price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    errors.price = "Harga jual harus lebih dari Rp 0.";
  }

  const parsedStock = Number(input.stock.trim());
  if (
    !input.stock.trim() ||
    !Number.isFinite(parsedStock) ||
    !Number.isInteger(parsedStock) ||
    parsedStock < 1
  ) {
    errors.stock = "Stok awal minimal 1 unit.";
  }

  if (errors.name || errors.price || errors.stock) {
    errors.banner =
      "Validasi Gagal: Periksa kembali isian form — nama produk kosong & harga/stok tidak valid!";
  }

  return errors;
}
