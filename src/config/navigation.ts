import type { UserRole } from "@/types";

export type NavKey = "beranda" | "produk" | "kasir" | "rekap" | "laporan";

export type NavIconName =
  | "dashboard"
  | "product"
  | "cashier"
  | "ocr"
  | "report";

export interface NavRouteConfig {
  key: NavKey;
  label: string;
  href: string;
  hrefByRole?: Partial<Record<UserRole, string>>;
  icon: NavIconName;
  roles: UserRole[];
  order?: Partial<Record<UserRole, number>>;
}

export interface ResolvedNavRoute {
  key: NavKey;
  label: string;
  href: string;
  icon: NavIconName;
  roles: UserRole[];
}

/**
 * Konfigurasi tunggal rute & izin akses peran aplikasi Ceashyr.
 * Tambah fitur/halaman Sprint 2+ cukup mendaftarkan 1 entri baru di array ini.
 */
export const APP_NAV_ROUTES: readonly NavRouteConfig[] = [
  {
    key: "beranda",
    label: "Beranda",
    href: "/ketua",
    icon: "dashboard",
    roles: ["ketua_kwu"],
    order: { ketua_kwu: 1 },
  },
  {
    key: "produk",
    label: "Produk",
    href: "/produk",
    hrefByRole: { pengelola: "/produk?mode=pengelola" },
    icon: "product",
    roles: ["ketua_kwu", "pengelola"],
    order: { ketua_kwu: 2, pengelola: 3 },
  },
  {
    key: "kasir",
    label: "Kasir",
    href: "/kasir",
    icon: "cashier",
    roles: ["ketua_kwu", "pengelola"],
    order: { ketua_kwu: 3, pengelola: 1 },
  },
  {
    key: "rekap",
    label: "Rekap",
    href: "/rekap-kertas",
    icon: "ocr",
    roles: ["ketua_kwu", "pengelola"],
    order: { ketua_kwu: 4, pengelola: 2 },
  },
  {
    key: "laporan",
    label: "Laporan",
    href: "/laporan",
    icon: "report",
    roles: ["ketua_kwu"],
    order: { ketua_kwu: 5 },
  },
];

/**
 * Mengembalikan daftar menu navigasi terurut sesuai peran pengguna.
 */
export function getNavRoutesForRole(role: UserRole): ResolvedNavRoute[] {
  return APP_NAV_ROUTES.filter((route) => route.roles.includes(role))
    .slice()
    .sort((a, b) => (a.order?.[role] ?? 99) - (b.order?.[role] ?? 99))
    .map((route) => ({
      key: route.key,
      label: route.label,
      href: route.hrefByRole?.[role] ?? route.href,
      icon: route.icon,
      roles: route.roles,
    }));
}

/**
 * Mengecek apakah peran pengguna diizinkan mengakses suatu fitur/rute.
 */
export function canRoleAccess(
  role: UserRole,
  allowedRoles: readonly UserRole[]
): boolean {
  return allowedRoles.includes(role);
}
