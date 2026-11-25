import { SEED_ACCOUNTS } from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import { authenticateAccount, validateLoginInput } from "@/lib/validators";
import type { AuthRepository } from "@/services/contracts";
import type {
  LoginResult,
  RegisterResult,
  SessionState,
  UserAccount,
  UserRole,
} from "@/types";
import {
  createId,
  readJson,
  removeStorageKey,
  writeJson,
} from "./storage-client";

export function getExtraAccountsSync(): UserAccount[] {
  return readJson<UserAccount[]>(STORAGE_KEYS.EXTRA_ACCOUNTS, []);
}

export function registerAccountSync(
  email: string,
  password: string,
  role: UserRole = "pengelola"
): RegisterResult {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password.trim()) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  const existing = [...SEED_ACCOUNTS, ...getExtraAccountsSync()].find(
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

  writeJson(STORAGE_KEYS.EXTRA_ACCOUNTS, [...getExtraAccountsSync(), newAcc]);
  return { ok: true, account: newAcc };
}

export function getSessionSync(): SessionState | null {
  return readJson<SessionState | null>(STORAGE_KEYS.SESSION, null);
}

export function loginSync(email: string, password: string): LoginResult {
  const fieldErrors = validateLoginInput(email, password);
  if (fieldErrors.email || fieldErrors.password) {
    return {
      ok: false,
      fieldErrors,
      error: "Mohon isi email dan kata sandi terlebih dahulu.",
    };
  }

  const auth = authenticateAccount(email, password, getExtraAccountsSync());
  if (!auth.account) {
    return {
      ok: false,
      error:
        auth.error || "Email atau kata sandi salah! Periksa kembali akun Anda.",
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
export function switchRoleSync(targetRole: UserRole): SessionState {
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

export function logoutSync(): void {
  removeStorageKey(STORAGE_KEYS.SESSION);
}

/**
 * Implementasi AuthRepository berbasis localStorage.
 */
export const localAuthRepository: AuthRepository = {
  async getExtraAccounts() {
    return getExtraAccountsSync();
  },
  async registerAccount(email, password, role = "pengelola") {
    return registerAccountSync(email, password, role);
  },
  async getSession() {
    return getSessionSync();
  },
  async login(email, password) {
    return loginSync(email, password);
  },
  async switchRole(targetRole) {
    return switchRoleSync(targetRole);
  },
  async logout() {
    logoutSync();
  },
};
