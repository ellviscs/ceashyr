"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import type { ReportPeriodType } from "@/types";

interface ReportFilterBarProps {
  periodType: ReportPeriodType;
  anchorDateKey: string;
  todayKey: string;
  includeOcrReports: boolean;
  savedOcrCount: number;
  isEmpty: boolean;
  shortPeriodLabel: string;
  onPeriodTypeChange: (next: ReportPeriodType) => void;
  onShiftPeriod: (direction: -1 | 1) => void;
  onAnchorDateChange: (dateKey: string) => void;
  onIncludeOcrChange: (checked: boolean) => void;
}

/**
 * Toolbar filter periode (Harian/Mingguan), tanggal, dan toggle penggabungan Rekap OCR.
 */
export function ReportFilterBar({
  periodType,
  anchorDateKey,
  todayKey,
  includeOcrReports,
  savedOcrCount,
  isEmpty,
  shortPeriodLabel,
  onPeriodTypeChange,
  onShiftPeriod,
  onAnchorDateChange,
  onIncludeOcrChange,
}: ReportFilterBarProps) {
  const periodPillLabel = isEmpty
    ? `Periode: Nihil • ${shortPeriodLabel}`
    : periodType === "daily"
      ? `Periode: Harian • ${shortPeriodLabel}`
      : `Periode: ${shortPeriodLabel}`;

  return (
    <SurfaceCard
      as="section"
      ariaLabel="Filter periode laporan"
      className="p-3.5 md:px-4 md:py-3 flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
        {/* Toggle Harian vs Mingguan */}
        <div
          role="group"
          aria-label="Pilih tipe periode"
          className="inline-flex rounded-xl bg-ceashyr-field border border-ceashyr-border p-1 gap-1"
        >
          <button
            type="button"
            onClick={() => onPeriodTypeChange("daily")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              periodType === "daily"
                ? "bg-ceashyr-orange text-white"
                : "text-ceashyr-muted hover:text-ceashyr-ink"
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            onClick={() => onPeriodTypeChange("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              periodType === "weekly"
                ? "bg-ceashyr-orange text-white"
                : "text-ceashyr-muted hover:text-ceashyr-ink"
            }`}
          >
            Mingguan
          </button>
        </div>

        {/* Pemilih Tanggal / Minggu */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onShiftPeriod(-1)}
            aria-label={
              periodType === "daily" ? "Hari sebelumnya" : "Minggu sebelumnya"
            }
            className="w-8 h-8 rounded-lg bg-white border border-ceashyr-border text-ceashyr-ink font-bold text-sm flex items-center justify-center hover:bg-ceashyr-field transition"
          >
            ‹
          </button>

          <label className="relative inline-flex items-center gap-2 h-8 px-2.5 rounded-lg bg-ceashyr-field border border-ceashyr-border text-xs font-semibold text-ceashyr-ink">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="4"
                width="14"
                height="13"
                rx="2"
                stroke="#465947"
                strokeWidth="1.6"
              />
              <path
                d="M3 8H17M7 2V5M13 2V5"
                stroke="#465947"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="date"
              value={anchorDateKey}
              aria-label="Pilih tanggal referensi laporan"
              onChange={(e) => {
                if (e.target.value) {
                  onAnchorDateChange(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-semibold text-ceashyr-ink focus:outline-none cursor-pointer"
            />
          </label>

          <button
            type="button"
            onClick={() => onShiftPeriod(1)}
            aria-label={
              periodType === "daily" ? "Hari berikutnya" : "Minggu berikutnya"
            }
            className="w-8 h-8 rounded-lg bg-white border border-ceashyr-border text-ceashyr-ink font-bold text-sm flex items-center justify-center hover:bg-ceashyr-field transition"
          >
            ›
          </button>

          <button
            type="button"
            onClick={() => onAnchorDateChange(todayKey)}
            className="h-8 px-3 rounded-full bg-ceashyr-peach border border-ceashyr-orange/40 text-ceashyr-orange text-[11px] font-semibold hover:bg-ceashyr-peach/80 transition whitespace-nowrap"
          >
            {periodType === "daily" ? "Hari Ini" : "Minggu Ini"}
          </button>
        </div>

        {/* Sumber Data */}
        <div className="flex flex-wrap items-center gap-3 md:pl-3 md:border-l md:border-ceashyr-border text-xs font-medium text-ceashyr-ink">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-ceashyr-green text-white text-[10px] font-bold inline-flex items-center justify-center">
              ✓
            </span>
            Transaksi Kasir (POS)
          </span>

          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeOcrReports}
              onChange={(e) => onIncludeOcrChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-ceashyr-green rounded"
            />
            <span>
              Gabungkan Rekap OCR
              {savedOcrCount > 0 ? ` (${savedOcrCount})` : ""}
            </span>
          </label>
        </div>
      </div>

      <span
        className={`px-3 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${
          isEmpty
            ? "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
            : "bg-ceashyr-green-soft border-ceashyr-green/40 text-ceashyr-green"
        }`}
      >
        {periodPillLabel}
      </span>
    </SurfaceCard>
  );
}
