"use client";

import React from "react";

export type StatusBannerVariant = "success" | "error" | "warning" | "info";

interface StatusBannerProps {
  variant: StatusBannerVariant;
  role?: "alert" | "status";
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<StatusBannerVariant, string> = {
  success: "bg-ceashyr-green-soft border-ceashyr-green text-ceashyr-green",
  error: "bg-ceashyr-red-soft border-ceashyr-red text-ceashyr-red",
  warning:
    "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink",
  info: "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink",
};

/**
 * Banner notifikasi/status terpadu untuk pesan sukses, validasi gagal, maupun peringatan.
 */
export function StatusBanner({
  variant,
  role,
  onDismiss,
  dismissLabel = "Tutup notifikasi",
  className = "",
  children,
}: StatusBannerProps) {
  const resolvedRole = role ?? (variant === "error" ? "alert" : "status");

  return (
    <div
      role={resolvedRole}
      className={`rounded-xl border px-4 py-3 text-xs md:text-sm font-medium ${VARIANT_CLASSES[variant]} ${className}`.trim()}
    >
      {onDismiss ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="text-xs font-bold hover:opacity-75 shrink-0"
          >
            ✕
          </button>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
