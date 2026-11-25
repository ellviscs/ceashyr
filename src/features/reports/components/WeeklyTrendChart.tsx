"use client";

import React from "react";
import type { SalesDailyBucket } from "@/types";

function formatCompactChartAmount(amount: number): string {
  if (amount <= 0) return "Rp0";
  if (amount >= 1_000_000) {
    const jt = (amount / 1_000_000)
      .toFixed(1)
      .replace(".", ",")
      .replace(/,0$/, "");
    return `Rp${jt}jt`;
  }
  if (amount >= 1000) {
    const rb = (amount / 1000)
      .toFixed(1)
      .replace(".", ",")
      .replace(/,0$/, "");
    return `Rp${rb}k`;
  }
  return `Rp${amount}`;
}

interface WeeklyTrendChartProps {
  dailyBuckets: SalesDailyBucket[];
}

/**
 * Grafik batang 7 hari (Senin–Minggu) untuk mode Laporan Penjualan Mingguan.
 */
export function WeeklyTrendChart({ dailyBuckets }: WeeklyTrendChartProps) {
  const maxBucketAmount = Math.max(
    1,
    ...dailyBuckets.map((day) => day.totalAmount)
  );

  return (
    <div className="rounded-2xl bg-ceashyr-field border border-ceashyr-border p-4">
      <div className="grid grid-cols-7 gap-2 h-28 items-end pt-4">
        {dailyBuckets.map((day) => {
          const heightPx =
            day.totalAmount > 0
              ? Math.max(
                  10,
                  Math.round((day.totalAmount / maxBucketAmount) * 64)
                )
              : 4;
          return (
            <div
              key={day.dateKey}
              className="flex flex-col items-center justify-end h-full gap-1"
            >
              <span
                className={`text-[10px] font-bold ${
                  day.isPeak
                    ? "text-ceashyr-orange"
                    : day.totalAmount > 0
                      ? "text-ceashyr-ink"
                      : "text-ceashyr-muted font-medium"
                }`}
              >
                {formatCompactChartAmount(day.totalAmount)}
              </span>
              <div
                style={{ height: `${heightPx}px` }}
                className={`w-6 sm:w-7 rounded-t-md rounded-b-sm transition-all ${
                  day.totalAmount === 0
                    ? "bg-ceashyr-border"
                    : day.isPeak
                      ? "bg-ceashyr-orange"
                      : "bg-ceashyr-forest"
                }`}
              />
              <span
                className={`text-[11px] font-semibold ${
                  day.isPeak ? "text-ceashyr-orange" : "text-ceashyr-muted"
                }`}
              >
                {day.shortDayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
