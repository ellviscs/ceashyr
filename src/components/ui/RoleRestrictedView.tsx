"use client";

import React from "react";
import Link from "next/link";
import { AppShell, type ActiveNavKey } from "@/components/layout/AppShell";
import type { UserRole } from "@/types";
import { StatusBanner } from "./StatusBanner";
import { SurfaceCard } from "./SurfaceCard";

export interface RestrictedAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface RoleRestrictedViewProps {
  role: UserRole;
  email?: string;
  activeNav?: ActiveNavKey;
  message: string;
  actions: RestrictedAction[];
}

/**
 * Tampilan terpusat untuk halaman yang dibatasi berdasarkan peran pengguna.
 * TODO(auth): Pindahkan penegakan otorisasi rute ke Next.js middleware / server session saat migrasi ke backend.
 */
export function RoleRestrictedView({
  role,
  email,
  activeNav = "kasir",
  message,
  actions,
}: RoleRestrictedViewProps) {
  return (
    <AppShell
      role={role}
      activeNav={activeNav}
      email={email}
      title="Akses Terbatas"
    >
      <SurfaceCard className="max-w-xl border-ceashyr-amber-border p-6 space-y-4">
        <StatusBanner variant="warning" className="text-sm">
          {message}
        </StatusBanner>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.variant === "secondary"
                  ? "px-4 py-2.5 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
                  : "px-4 py-2.5 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </AppShell>
  );
}
