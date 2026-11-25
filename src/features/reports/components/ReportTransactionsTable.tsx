"use client";

import React from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatRupiah, formatTimeId } from "@/lib/formatters";
import type { SalesReportData } from "@/types";
import { WeeklyTrendChart } from "./WeeklyTrendChart";

interface ReportTransactionsTableProps {
  report: SalesReportData;
  weeklyTab: "daily_recap" | "transactions";
  hasOutOfRangeActivity: boolean;
  latestActivityDateKey: string | null;
  onWeeklyTabChange: (tab: "daily_recap" | "transactions") => void;
  onSwitchToWeekly: () => void;
  onJumpToDate: (dateKey: string) => void;
}

/**
 * Kolom kiri laporan: rincian nota transaksi harian atau rekap & tren mingguan.
 */
export function ReportTransactionsTable({
  report,
  weeklyTab,
  hasOutOfRangeActivity,
  latestActivityDateKey,
  onWeeklyTabChange,
  onSwitchToWeekly,
  onJumpToDate,
}: ReportTransactionsTableProps) {
  const isWeekly = report.periodType === "weekly";

  return (
    <SurfaceCard as="section" className="lg:col-span-7 p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ceashyr-ink">
          {isWeekly
            ? "Tren & Rekap Penjualan Mingguan"
            : `Rincian Transaksi Harian — ${report.totalTransactions} Nota`}
        </h2>

        {isWeekly && !report.isEmpty ? (
          <div className="inline-flex rounded-xl bg-ceashyr-field border border-ceashyr-border p-1 gap-1">
            <button
              type="button"
              onClick={() => onWeeklyTabChange("daily_recap")}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                weeklyTab === "daily_recap"
                  ? "bg-ceashyr-orange text-white"
                  : "text-ceashyr-muted hover:text-ceashyr-ink"
              }`}
            >
              Rekap per Hari
            </button>
            <button
              type="button"
              onClick={() => onWeeklyTabChange("transactions")}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                weeklyTab === "transactions"
                  ? "bg-ceashyr-orange text-white"
                  : "text-ceashyr-muted hover:text-ceashyr-ink"
              }`}
            >
              Daftar {report.totalTransactions} Nota
            </button>
          </div>
        ) : (
          <span className="px-3 py-1 rounded-full bg-ceashyr-field border border-ceashyr-border text-[11px] font-semibold text-ceashyr-muted">
            {report.shortPeriodLabel}
          </span>
        )}
      </div>

      {report.isEmpty ? (
        <div className="rounded-2xl border border-dashed border-ceashyr-border bg-ceashyr-field p-7 md:p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-ceashyr-amber-bg border border-ceashyr-amber-border flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 2H6C5.47 2 4.961 2.211 4.586 2.586C4.211 2.961 4 3.47 4 4V20C4 20.53 4.211 21.039 4.586 21.414C4.961 21.789 5.47 22 6 22H18C18.53 22 19.039 21.789 19.414 21.414C19.789 21.039 20 20.53 20 20V8L14 2Z"
                stroke="#8A5111"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20M9 14H15M9 18H13"
                stroke="#8A5111"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h3 className="text-sm md:text-base font-bold text-ceashyr-ink">
            Belum Ada Transaksi pada Periode Ini
          </h3>
          <p className="text-xs text-ceashyr-muted max-w-md mx-auto leading-relaxed">
            Tidak ditemukan catatan penjualan pada{" "}
            <strong>{report.periodTitle}</strong>. Pilih tanggal lain, beralih ke
            periode mingguan, atau unduh Laporan Nihil untuk arsip KWU.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Link
              href="/kasir"
              className="px-4 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
            >
              Buka Halaman Kasir →
            </Link>
            {!isWeekly && (
              <button
                type="button"
                onClick={onSwitchToWeekly}
                className="px-4 py-2 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-cream transition"
              >
                Lihat Periode Mingguan
              </button>
            )}
            {hasOutOfRangeActivity && latestActivityDateKey && (
              <button
                type="button"
                onClick={() => onJumpToDate(latestActivityDateKey)}
                className="px-4 py-2 rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:brightness-95 transition"
              >
                Buka Tanggal Data Terakhir
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {isWeekly && <WeeklyTrendChart dailyBuckets={report.dailyBuckets} />}

          {isWeekly && weeklyTab === "daily_recap" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-ceashyr-field border-y border-ceashyr-border text-ceashyr-muted">
                    <th className="text-left py-2.5 px-3 font-semibold">
                      Hari / Tanggal
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold">
                      Transaksi
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold">
                      Item Terjual
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold">
                      Total Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.dailyBuckets.map((day) => {
                    const isZero = day.transactionCount === 0;
                    return (
                      <tr
                        key={day.dateKey}
                        className={`border-b border-ceashyr-border ${
                          isZero ? "text-ceashyr-muted" : "text-ceashyr-ink"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className={day.isPeak ? "font-bold" : ""}>
                            {day.fullDateLabel}
                          </span>
                          {day.isPeak && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-ceashyr-peach text-ceashyr-orange text-[10px] font-bold">
                              Tertinggi
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {day.transactionCount} Nota
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">
                          {day.totalItems} pcs
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                            day.isPeak ? "text-ceashyr-orange" : ""
                          }`}
                        >
                          {formatRupiah(day.totalAmount, true)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#F4F7F3] border-t-2 border-ceashyr-forest font-bold text-ceashyr-ink">
                    <td className="py-2.5 px-3">
                      Total Mingguan ({report.weekLabel})
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {report.totalTransactions} Nota
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {report.totalItemsSold} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right text-ceashyr-orange tabular-nums">
                      {formatRupiah(report.totalRevenue, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-ceashyr-field border-y border-ceashyr-border text-ceashyr-muted">
                    <th className="text-left py-2.5 px-2.5 font-semibold">
                      No. Nota
                    </th>
                    <th className="text-left py-2.5 px-2.5 font-semibold">
                      Waktu
                    </th>
                    <th className="text-left py-2.5 px-2.5 font-semibold">
                      Rincian Item
                    </th>
                    <th className="text-right py-2.5 px-2.5 font-semibold">
                      Qty
                    </th>
                    <th className="text-right py-2.5 px-2.5 font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.map((entry) => {
                    const itemsText = entry.items
                      .map((i) => `${i.productName} (${i.qty})`)
                      .join(", ");
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-ceashyr-border text-ceashyr-ink"
                      >
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-ceashyr-peach text-ceashyr-orange font-bold text-[11px]">
                            {entry.code}
                          </span>
                          {entry.source === "ocr" && (
                            <span className="ml-1 inline-block px-1.5 py-0.5 rounded bg-ceashyr-green-soft text-ceashyr-green font-bold text-[10px]">
                              OCR
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 whitespace-nowrap text-ceashyr-muted">
                          {isWeekly
                            ? `${entry.dateKey} ${formatTimeId(entry.createdAt)}`
                            : formatTimeId(entry.createdAt)}
                        </td>
                        <td className="py-2.5 px-2.5">{itemsText}</td>
                        <td className="py-2.5 px-2.5 text-right whitespace-nowrap tabular-nums">
                          {entry.totalItems} pcs
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold whitespace-nowrap tabular-nums">
                          {formatRupiah(entry.totalAmount, true)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#F4F7F3] border-t-2 border-ceashyr-forest font-bold text-ceashyr-ink">
                    <td colSpan={3} className="py-2.5 px-2.5">
                      Total Periode ({report.shortPeriodLabel})
                    </td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">
                      {report.totalItemsSold} pcs
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-ceashyr-orange tabular-nums">
                      {formatRupiah(report.totalRevenue, true)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </SurfaceCard>
  );
}
