"use client";

import React from "react";
import type { ReportPeriodType } from "@/types";

interface DownloadActionButtonsProps {
  isEmpty: boolean;
  periodType: ReportPeriodType;
  isExportingPdf: boolean;
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
  variant?: "header" | "panel";
}

/**
 * Tombol unduh laporan PDF resmi dan CSV/Excel untuk header dan panel samping.
 */
export function DownloadActionButtons({
  isEmpty,
  periodType,
  isExportingPdf,
  onDownloadCsv,
  onDownloadPdf,
  variant = "header",
}: DownloadActionButtonsProps) {
  const pdfLabel = isExportingPdf
    ? "Menyiapkan PDF..."
    : isEmpty
      ? "Unduh Laporan Nihil (PDF)"
      : variant === "panel" && periodType === "weekly"
        ? "Unduh PDF Mingguan"
        : variant === "panel"
          ? "Unduh PDF Resmi"
          : "Unduh Laporan PDF";

  const csvLabel = isEmpty ? "Unduh CSV Nihil" : "Unduh CSV / Excel";

  const containerClass =
    variant === "panel"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-ceashyr-border"
      : "flex flex-wrap items-center gap-2";

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={onDownloadCsv}
        className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition ${
          variant === "panel" ? "order-2" : ""
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.333 13.333V15.833C3.333 16.293 3.706 16.667 4.167 16.667H15.833C16.293 16.667 16.667 16.293 16.667 15.833V13.333M10 3.333V12.5M10 12.5L6.667 9.167M10 12.5L13.333 9.167"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{csvLabel}</span>
      </button>

      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={isExportingPdf}
        className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition disabled:opacity-60 ${
          variant === "panel" ? "order-1" : ""
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.333 13.333V15.833C3.333 16.293 3.706 16.667 4.167 16.667H15.833C16.293 16.667 16.667 16.293 16.667 15.833V13.333M10 3.333V12.5M10 12.5L6.667 9.167M10 12.5L13.333 9.167"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{pdfLabel}</span>
      </button>
    </div>
  );
}
