/**
 * Peran pengguna di aplikasi Ceashyr (Kantin KWU HIMATEKPAL ITS).
 */
export type UserRole = "ketua_kwu" | "pengelola";

/**
 * Akun pengguna beserta hak akses dan rute beranda default.
 */
export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  label: string;
  redirectPath: "/ketua" | "/kasir";
}

/**
 * Sesi aktif pengguna yang tersimpan di penyimpanan lokal perangkat.
 */
export interface SessionState {
  accountId: string;
  email: string;
  name: string;
  role: UserRole;
  label: string;
  loggedInAt: string;
}

/**
 * Hasil validasi input halaman login (US-04).
 */
export interface LoginValidationErrors {
  banner?: string;
  email?: string;
  password?: string;
}

/**
 * Hasil operasi login dari AuthRepository.
 */
export type LoginResult =
  | { ok: true; session: SessionState; redirectPath: "/ketua" | "/kasir" }
  | { ok: false; fieldErrors?: LoginValidationErrors; error: string };

/**
 * Hasil operasi registrasi akun baru dari AuthRepository.
 */
export type RegisterResult =
  | { ok: true; account: UserAccount }
  | { ok: false; error: string };
