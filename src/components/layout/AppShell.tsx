"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";
import { logout } from "@/lib/storage/repository";
import {
  AvatarSilhouetteIcon,
  CashierCartIcon,
  DashboardGridIcon,
  LogoutDoorIcon,
  PaperOcrCameraIcon,
  ProductCubeIcon,
} from "@/components/layout/SidebarIcons";

export type ActiveNavKey = "beranda" | "produk" | "kasir" | "rekap";

interface NavItemConfig {
  key: ActiveNavKey;
  label: string;
  href: string;
  renderIcon: (active: boolean) => React.ReactNode;
}

interface AppShellProps {
  role: UserRole;
  activeNav: ActiveNavKey;
  title: string;
  subtitle?: string;
  email?: string;
  headerRightSlot?: React.ReactNode;
  onSwitchRole?: (nextRole: UserRole) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

function getNavItemsForRole(role: UserRole): NavItemConfig[] {
  if (role === "ketua_kwu") {
    return [
      {
        key: "beranda",
        label: "Beranda",
        href: "/ketua",
        renderIcon: (active) => <DashboardGridIcon active={active} />,
      },
      {
        key: "produk",
        label: "Produk",
        href: "/produk",
        renderIcon: (active) => <ProductCubeIcon active={active} />,
      },
      {
        key: "kasir",
        label: "Kasir",
        href: "/kasir",
        renderIcon: (active) => <CashierCartIcon active={active} />,
      },
      {
        key: "rekap",
        label: "Rekap",
        href: "/rekap-kertas",
        renderIcon: (active) => <PaperOcrCameraIcon active={active} />,
      },
    ];
  }

  return [
    {
      key: "kasir",
      label: "Kasir",
      href: "/kasir",
      renderIcon: (active) => <CashierCartIcon active={active} />,
    },
    {
      key: "rekap",
      label: "Rekap",
      href: "/rekap-kertas",
      renderIcon: (active) => <PaperOcrCameraIcon active={active} />,
    },
    {
      key: "produk",
      label: "Produk",
      href: "/produk?mode=pengelola",
      renderIcon: (active) => <ProductCubeIcon active={active} />,
    },
  ];
}

/**
 * Shell layout terpadu mengikuti Figma `⭐️ Templates (Copy)` (`1331:4912`):
 * - Tablet/Desktop (`>= 768px`): sidebar ikon 84px (`#FFFDF9`) + avatar kontak + konten 1280×800 `#EBF4E8`
 * - Mobile / HP (`< 768px`): top compact bar + bottom navigation bar agar mudah dipakai dengan satu tangan
 */
export function AppShell({
  role,
  activeNav,
  title,
  subtitle,
  email,
  headerRightSlot,
  onSwitchRole,
  onLogout,
  children,
}: AppShellProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const navItems = getNavItemsForRole(role);
  const resolvedEmail =
    email || (role === "ketua_kwu" ? "ketuakwu@gmail.com" : "kasir@gmail.com");
  const roleLabel =
    role === "ketua_kwu"
      ? `Peran Aktif: Ketua KWU • ${resolvedEmail}`
      : `Peran Aktif: Pengelola / Kasir • ${resolvedEmail}`;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-ceashyr-mint text-ceashyr-ink flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar Tablet / Desktop (84px width sesuai Figma 1331:4912) */}
      <aside className="hidden md:flex md:flex-col md:justify-between md:w-[84px] md:min-h-screen bg-ceashyr-cream border-r border-ceashyr-border py-5 px-5 shrink-0 sticky top-0 h-screen">
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold tracking-tight text-ceashyr-ink mb-4">
            9:41
          </span>

          <div
            className="mb-6"
            title={role === "ketua_kwu" ? "Ketua KWU" : "Pengelola / Kasir"}
          >
            <AvatarSilhouetteIcon />
          </div>

          <nav
            aria-label="Navigasi utama"
            className="flex flex-col items-center gap-[10px]"
          >
            {navItems.map((item) => {
              const isActive = item.key === activeNav;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-[42px] h-[42px] rounded-[12px] flex items-center justify-center border transition-colors ${
                    isActive
                      ? "bg-ceashyr-peach border-ceashyr-orange"
                      : "bg-white border-ceashyr-border hover:border-ceashyr-orange/50"
                  }`}
                >
                  {item.renderIcon(isActive)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar (Logout)"
            aria-label="Keluar"
            className="w-[42px] h-[42px] rounded-[12px] bg-ceashyr-ink hover:bg-ceashyr-ink/90 flex items-center justify-center transition-colors"
          >
            <LogoutDoorIcon />
          </button>
        </div>
      </aside>

      {/* Mobile Compact Header (< 768px) */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-ceashyr-cream border-b border-ceashyr-border sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarSilhouetteIcon className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ceashyr-orange truncate">
              {role === "ketua_kwu" ? "Ketua KWU" : "Pengelola / Kasir"}
            </p>
            <p className="text-[11px] text-ceashyr-muted truncate">
              {resolvedEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              isOnline
                ? "bg-ceashyr-green-soft text-ceashyr-green border-ceashyr-green/40"
                : "bg-ceashyr-amber-bg text-ceashyr-amber-ink border-ceashyr-amber-border"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar"
            className="w-9 h-9 rounded-[10px] bg-ceashyr-ink flex items-center justify-center"
          >
            <LogoutDoorIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        {/* Status Indicator Tablet */}
        <div className="hidden md:flex items-center justify-end gap-2 px-8 pt-4 text-[11px] text-ceashyr-muted">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-medium ${
              isOnline
                ? "bg-white/70 text-ceashyr-green border-ceashyr-green/30"
                : "bg-ceashyr-amber-bg text-ceashyr-amber-ink border-ceashyr-amber-border"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-ceashyr-green" : "bg-ceashyr-amber-border"
              }`}
            />
            {isOnline ? "PWA Terhubung" : "Mode Offline Lokal"}
          </span>
        </div>

        {/* Header Role Badge + Switcher + Judul */}
        <div className="px-4 md:px-10 pt-4 md:pt-2 max-w-[1200px] w-full mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-ceashyr-peach border border-ceashyr-orange text-ceashyr-orange text-xs font-medium">
              {roleLabel}
            </span>

            {onSwitchRole && (
              <button
                type="button"
                onClick={() =>
                  onSwitchRole(role === "ketua_kwu" ? "pengelola" : "ketua_kwu")
                }
                className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white border-[1.5px] border-ceashyr-orange text-ceashyr-orange text-xs font-semibold hover:bg-ceashyr-peach/50 transition-colors"
              >
                {role === "ketua_kwu"
                  ? "Masuk sebagai Pengelola →"
                  : "Masuk sebagai Ketua KWU →"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-[28px] font-bold text-ceashyr-ink tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-ceashyr-muted mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {headerRightSlot && (
              <div className="flex items-center gap-2">{headerRightSlot}</div>
            )}
          </div>
        </div>

        {/* Slot Halaman Anak */}
        <main className="px-4 md:px-10 pt-5 max-w-[1200px] w-full mx-auto flex-1">
          {children}
        </main>
      </div>

      {/* Bottom Navigation Mobile (< 768px) */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ceashyr-cream border-t border-ceashyr-border flex items-center justify-around py-2 px-2"
      >
        {navItems.map((item) => {
          const isActive = item.key === activeNav;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-ceashyr-peach text-ceashyr-orange font-semibold"
                  : "text-ceashyr-ink"
              }`}
            >
              {item.renderIcon(isActive)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
