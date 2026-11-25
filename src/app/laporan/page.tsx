"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  formatDateShortId,
  formatPercentId,
  formatRupiah,
  formatTimeId,
} from "@/lib/formatters";
import { downloadSalesReportCsv } from "@/lib/reports/export-csv";
import { downloadSalesReportPdf } from "@/lib/reports/export-pdf";
import {
  buildSalesReport,
  getLatestActivityDateKey,
  parseLocalDateKey,
  shiftDateKey,
  toLocalDateKey,
} from "@/lib/reports/sales-report";
import {
  getOcrReports,
  getSession,
  getTransactions,
} from "@/lib/storage/repository";
import type {
  OcrReportRecord,
  ReportPeriodType,
  SalesReportData,
  SessionState,
  Transaction,
} from "@/types";

function formatCompactChartAmount(amount: number): string {
  if (amount <= 0) return "Rp0";
  if (amount >= 1_000_000) {
    const jt = (amount / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "");
    return `Rp${jt}jt`;
  }
  if (amount >= 1000) {
    const rb = (amount / 1000).toFixed(1).replace(".", ",").replace(/,0$/, "");
    return `Rp${rb}k`;
  }
  return `Rp${amount}`;
}

interface DownloadActionButtonsProps {
  isEmpty: boolean;
  periodType: ReportPeriodType;
  isExportingPdf: boolean;
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
  variant?: "header" | "panel";
}

function DownloadActionButtons({
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

/**
 * Halaman Laporan Penjualan Harian & Mingguan untuk Ketua KWU (US-15).
 * Mengambil dan merekap data transaksi dari localStorage serta menyediakan ekspor PDF A4 & CSV/Excel offline-first.
 */
export default function LaporanPenjualanPage() {
  const [todayKey] = useState<string>(() => toLocalDateKey(new Date()));
  const [session, setSession] = useState<SessionState | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ocrReports, setOcrReports] = useState<OcrReportRecord[]>([]);

  const [periodType, setPeriodType] = useState<ReportPeriodType>("daily");
  const [anchorDateKey, setAnchorDateKey] = useState<string>(todayKey);
  const [includeOcrReports, setIncludeOcrReports] = useState<boolean>(false);
  const [weeklyTab, setWeeklyTab] = useState<"daily_recap" | "transactions">(
    "daily_recap"
  );

  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [downloadBanner, setDownloadBanner] = useState<{
    fileName: string;
    summary: string;
  } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
    setTransactions(getTransactions());
    setOcrReports(getOcrReports());
  }, []);

  const savedOcrCount = useMemo(
    () => ocrReports.filter((rep) => rep.status === "saved").length,
    [ocrReports]
  );

  const report: SalesReportData = useMemo(
    () =>
      buildSalesReport({
        periodType,
        anchorDateKey,
        transactions,
        ocrReports,
        includeOcrReports,
        session,
      }),
    [periodType, anchorDateKey, transactions, ocrReports, includeOcrReports, session]
  );

  const latestActivityDateKey = useMemo(
    () => getLatestActivityDateKey(transactions, ocrReports, includeOcrReports),
    [transactions, ocrReports, includeOcrReports]
  );

  const hasOutOfRangeActivity = Boolean(
    latestActivityDateKey &&
      (latestActivityDateKey < report.startDateKey ||
        latestActivityDateKey > report.endDateKey)
  );

  const handlePeriodTypeChange = (nextType: ReportPeriodType) => {
    setPeriodType(nextType);
    setDownloadBanner(null);
    setExportError(null);
  };

  const handleShiftPeriod = (direction: -1 | 1) => {
    const stepDays = periodType === "daily" ? 1 : 7;
    setAnchorDateKey((prev) => shiftDateKey(prev, direction * stepDays));
    setDownloadBanner(null);
    setExportError(null);
  };

  const handleDownloadCsv = () => {
    setExportError(null);
    try {
      const fileName = downloadSalesReportCsv(report);
      setDownloadBanner({
        fileName,
        summary: `${report.totalTransactions} Nota • ${formatRupiah(
          report.totalRevenue,
          true
        )}`,
      });
    } catch {
      setExportError(
        "Gagal mengekspor file CSV. Silakan coba kembali pada browser Anda."
      );
    }
  };

  const handleDownloadPdf = async () => {
    setExportError(null);
    setIsExportingPdf(true);
    try {
      const fileName = await downloadSalesReportPdf(report);
      setDownloadBanner({
        fileName,
        summary: `${report.totalTransactions} Nota • ${formatRupiah(
          report.totalRevenue,
          true
        )}`,
      });
    } catch {
      setExportError(
        "Gagal membuat dokumen PDF laporan. Silakan coba kembali."
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Guard pembagian peran: hanya Ketua KWU yang dapat mengakses laporan
  if (session?.role === "pengelola") {
    return (
      <AppShell
        role="pengelola"
        activeNav="kasir"
        email={session.email}
        title="Akses Terbatas"
      >
        <div className="max-w-xl rounded-[20px] bg-ceashyr-cream border border-ceashyr-amber-border p-6 shadow-ceashyr-card space-y-4">
          <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-3 text-sm font-medium">
            Akses Terbatas: Halaman Laporan Penjualan hanya untuk Ketua KWU.
            Akun Pengelola/Kasir hanya memiliki akses Kasir, Rekap Kertas, dan
            Daftar Produk (Mode Lihat).
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kasir"
              className="px-4 py-2.5 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
            >
              Kembali ke Halaman Kasir →
            </Link>
            <Link
              href="/rekap-kertas"
              className="px-4 py-2.5 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
            >
              Masuk ke Rekap Kertas →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const maxBucketAmount = Math.max(
    1,
    ...report.dailyBuckets.map((day) => day.totalAmount)
  );

  const periodPillLabel = report.isEmpty
    ? `Periode: Nihil • ${report.shortPeriodLabel}`
    : report.periodType === "daily"
      ? `Periode: Harian • ${report.shortPeriodLabel}`
      : `Periode: ${report.shortPeriodLabel}`;

  return (
    <AppShell
      role="ketua_kwu"
      activeNav="laporan"
      email={session?.email}
      title="Laporan Penjualan"
      subtitle="Rekap transaksi harian & mingguan Kantin KWU HIMATEKPAL ITS untuk pelaporan ke himpunan"
      headerRightSlot={
        <DownloadActionButtons
          isEmpty={report.isEmpty}
          periodType={periodType}
          isExportingPdf={isExportingPdf}
          onDownloadCsv={handleDownloadCsv}
          onDownloadPdf={handleDownloadPdf}
          variant="header"
        />
      }
    >
      <div className="space-y-4">
        {/* Filter Pemilihan Rentang Waktu & Sumber Data */}
        <section
          aria-label="Filter periode laporan"
          className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-3.5 md:px-4 md:py-3 shadow-ceashyr-card flex flex-wrap items-center justify-between gap-3"
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
                onClick={() => handlePeriodTypeChange("daily")}
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
                onClick={() => handlePeriodTypeChange("weekly")}
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
                onClick={() => handleShiftPeriod(-1)}
                aria-label={
                  periodType === "daily"
                    ? "Hari sebelumnya"
                    : "Minggu sebelumnya"
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
                      setAnchorDateKey(e.target.value);
                      setDownloadBanner(null);
                      setExportError(null);
                    }
                  }}
                  className="bg-transparent text-xs font-semibold text-ceashyr-ink focus:outline-none cursor-pointer"
                />
              </label>

              <button
                type="button"
                onClick={() => handleShiftPeriod(1)}
                aria-label={
                  periodType === "daily"
                    ? "Hari berikutnya"
                    : "Minggu berikutnya"
                }
                className="w-8 h-8 rounded-lg bg-white border border-ceashyr-border text-ceashyr-ink font-bold text-sm flex items-center justify-center hover:bg-ceashyr-field transition"
              >
                ›
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnchorDateKey(todayKey);
                  setDownloadBanner(null);
                  setExportError(null);
                }}
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
                  onChange={(e) => {
                    setIncludeOcrReports(e.target.checked);
                    setDownloadBanner(null);
                  }}
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
              report.isEmpty
                ? "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
                : "bg-ceashyr-green-soft border-ceashyr-green/40 text-ceashyr-green"
            }`}
          >
            {periodPillLabel}
          </span>
        </section>

        {/* Banner Status Unduh */}
        {downloadBanner && (
          <div
            role="status"
            className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-2.5 text-xs md:text-sm font-medium flex flex-wrap items-center justify-between gap-2"
          >
            <span>
              ✓ File <strong>{downloadBanner.fileName}</strong> berhasil diunduh
              ke perangkat Anda ({downloadBanner.summary}).
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold">
                Tersimpan di perangkat
              </span>
              <button
                type="button"
                onClick={() => setDownloadBanner(null)}
                aria-label="Tutup notifikasi unduh"
                className="text-xs font-bold hover:opacity-75"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Banner Error Ekspor */}
        {exportError && (
          <div
            role="alert"
            className="rounded-xl bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red px-4 py-2.5 text-xs font-medium"
          >
            {exportError}
          </div>
        )}

        {/* Banner Periode Nihil */}
        {report.isEmpty && (
          <div
            role="status"
            className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-3 text-xs md:text-sm font-medium flex flex-wrap items-center justify-between gap-2"
          >
            <span>
              ℹ Belum ada transaksi penjualan pada{" "}
              <strong>{report.periodTitle}</strong>. Anda tetap dapat mengunduh{" "}
              <strong>Laporan Nihil (Rp 0)</strong> untuk kelengkapan arsip
              himpunan.
            </span>
            {hasOutOfRangeActivity && latestActivityDateKey && (
              <button
                type="button"
                onClick={() => {
                  setAnchorDateKey(latestActivityDateKey);
                  setDownloadBanner(null);
                }}
                className="px-3 py-1 rounded-lg bg-white border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:bg-ceashyr-cream transition whitespace-nowrap"
              >
                Lihat Data Terakhir (
                {formatDateShortId(parseLocalDateKey(latestActivityDateKey))})
              </button>
            )}
          </div>
        )}

        {/* 4 Kartu KPI Ringkasan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Total Pendapatan</p>
            <p className="text-xl font-bold text-ceashyr-ink mt-1">
              {formatRupiah(report.totalRevenue, true)}
            </p>
            <p className="text-[11px] text-ceashyr-muted mt-1">
              {report.isEmpty
                ? "Belum ada pemasukan"
                : periodType === "weekly"
                  ? `${report.activeDaysCount} hari aktif • ${formatRupiah(
                      report.averagePerActiveDay,
                      true
                    )} / hari`
                  : `Rata-rata ${formatRupiah(report.averagePerTransaction, true)} / nota`}
            </p>
          </div>

          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Jumlah Transaksi</p>
            <p className="text-xl font-bold text-ceashyr-orange mt-1">
              {report.totalTransactions} Nota
            </p>
            <p className="text-[11px] text-ceashyr-muted mt-1">
              {report.isEmpty
                ? "Tidak ada transaksi tercatat"
                : `Rata-rata ${formatRupiah(report.averagePerTransaction, true)} / nota`}
            </p>
          </div>

          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Total Item Terjual</p>
            <p className="text-xl font-bold text-ceashyr-green mt-1">
              {report.totalItemsSold} pcs
            </p>
            <p className="text-[11px] text-ceashyr-muted mt-1">
              {report.productRecap.length} jenis produk terjual
            </p>
          </div>

          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">
              {periodType === "weekly"
                ? "Hari Penjualan Tertinggi"
                : "Produk Terlaris"}
            </p>
            {periodType === "weekly" ? (
              <>
                <p className="text-base md:text-lg font-bold text-ceashyr-ink mt-1 truncate">
                  {report.peakDay ? report.peakDay.fullDateLabel : "—"}
                </p>
                <p className="text-[11px] text-ceashyr-muted mt-1">
                  {report.peakDay
                    ? `${formatRupiah(report.peakDay.totalAmount, true)} • ${
                        report.peakDay.transactionCount
                      } nota`
                    : "Belum ada data"}
                </p>
              </>
            ) : (
              <>
                <p className="text-base md:text-lg font-bold text-ceashyr-ink mt-1 truncate">
                  {report.topProduct ? report.topProduct.productName : "—"}
                </p>
                <p className="text-[11px] text-ceashyr-muted mt-1">
                  {report.topProduct
                    ? `${report.topProduct.qtySold} pcs • ${formatRupiah(
                        report.topProduct.subtotal,
                        true
                      )}`
                    : "Belum ada data"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Grid Utama 2 Kolom (7/5 di desktop, bertumpuk di mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Kiri: Rincian Transaksi atau Tren Mingguan */}
          <section className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-ceashyr-ink">
                {periodType === "weekly"
                  ? "Tren & Rekap Penjualan Mingguan"
                  : `Rincian Transaksi Harian — ${report.totalTransactions} Nota`}
              </h2>

              {periodType === "weekly" && !report.isEmpty ? (
                <div className="inline-flex rounded-xl bg-ceashyr-field border border-ceashyr-border p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setWeeklyTab("daily_recap")}
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
                    onClick={() => setWeeklyTab("transactions")}
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
                  <strong>{report.periodTitle}</strong>. Pilih tanggal lain,
                  beralih ke periode mingguan, atau unduh Laporan Nihil untuk
                  arsip KWU.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <Link
                    href="/kasir"
                    className="px-4 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
                  >
                    Buka Halaman Kasir →
                  </Link>
                  {periodType === "daily" && (
                    <button
                      type="button"
                      onClick={() => handlePeriodTypeChange("weekly")}
                      className="px-4 py-2 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-cream transition"
                    >
                      Lihat Periode Mingguan
                    </button>
                  )}
                  {hasOutOfRangeActivity && latestActivityDateKey && (
                    <button
                      type="button"
                      onClick={() => setAnchorDateKey(latestActivityDateKey)}
                      className="px-4 py-2 rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:brightness-95 transition"
                    >
                      Buka Tanggal Data Terakhir
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Grafik Batang 7 Hari pada Mode Mingguan */}
                {periodType === "weekly" && (
                  <div className="rounded-2xl bg-ceashyr-field border border-ceashyr-border p-4">
                    <div className="grid grid-cols-7 gap-2 h-28 items-end pt-4">
                      {report.dailyBuckets.map((day) => {
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
                                day.isPeak
                                  ? "text-ceashyr-orange"
                                  : "text-ceashyr-muted"
                              }`}
                            >
                              {day.shortDayLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tabel Rekap Harian (Mingguan Tab 1) atau Daftar Nota Transaksi */}
                {periodType === "weekly" && weeklyTab === "daily_recap" ? (
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
                                <span
                                  className={day.isPeak ? "font-bold" : ""}
                                >
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
                                {periodType === "weekly"
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
          </section>

          {/* Kolom Kanan: Rekap Produk & Ekspor File */}
          <aside className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
            <h2 className="text-base font-bold text-ceashyr-ink">
              {report.isEmpty
                ? "Rekap Produk & Laporan Nihil"
                : periodType === "weekly"
                  ? "Rekap Produk Mingguan & Unduh"
                  : "Rekap Produk & Ekspor Laporan"}
            </h2>

            <div className="rounded-[14px] bg-ceashyr-forest text-white p-4 shadow-ceashyr-box">
              <p className="text-sm font-bold">
                {report.isEmpty
                  ? "Status Periode: NIHIL (Rp 0)"
                  : periodType === "weekly"
                    ? `Ringkasan Mingguan (${report.weekLabel})`
                    : "Siap Dilaporkan ke HIMATEKPAL ITS"}
              </p>
              <p className="text-[11px] text-ceashyr-forest-sub mt-1 break-all">
                {report.isEmpty
                  ? "File tetap sah sebagai laporan kegiatan periode nol transaksi"
                  : `File: ${report.fileBaseName}.pdf`}
              </p>
            </div>

            {report.isEmpty ? (
              <div className="space-y-3">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-ceashyr-field border-y border-ceashyr-border text-ceashyr-muted">
                      <th className="text-left py-2 px-3 font-semibold">
                        Produk
                      </th>
                      <th className="text-right py-2 px-3 font-semibold">
                        Terjual
                      </th>
                      <th className="text-right py-2 px-3 font-semibold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={3}
                        className="py-6 px-3 text-center text-ceashyr-muted border-b border-ceashyr-border"
                      >
                        Tidak ada produk terjual pada {report.shortPeriodLabel}
                      </td>
                    </tr>
                    <tr className="bg-[#F4F7F3] font-bold text-ceashyr-ink">
                      <td className="py-2.5 px-3">Total Pendapatan</td>
                      <td className="py-2.5 px-3 text-right">0 pcs</td>
                      <td className="py-2.5 px-3 text-right">Rp 0</td>
                    </tr>
                  </tbody>
                </table>

                <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-3.5 py-2.5 text-[11px] leading-relaxed">
                  <strong>Catatan Laporan Nihil:</strong> File PDF &amp; CSV
                  tetap mencantumkan kop resmi, tanggal periode, ringkasan 0
                  nota / Rp 0, serta keterangan NIHIL tanpa error.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {report.productRecap.map((item, idx) => (
                  <div
                    key={item.key}
                    className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-ceashyr-ink truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-ceashyr-muted">
                          {item.qtySold} pcs × {formatRupiah(item.unitPrice)} •{" "}
                          {formatPercentId(item.revenueSharePct)} kontribusi
                        </p>
                      </div>
                      <span className="font-bold text-ceashyr-orange shrink-0 tabular-nums">
                        {formatRupiah(item.subtotal, true)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-ceashyr-border overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(2, item.revenueSharePct))}%`,
                        }}
                        className={`h-full rounded-full ${
                          idx % 2 === 1 ? "bg-ceashyr-orange" : "bg-ceashyr-forest"
                        }`}
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border px-3.5 py-2.5 text-[11px] text-ceashyr-muted space-y-1">
                  <p className="font-bold text-ceashyr-ink">
                    Spesifikasi File Siap Unduh:
                  </p>
                  <p>
                    • <strong>PDF A4 Resmi:</strong> Ringkasan KPI, Rekap
                    Produk, Daftar Nota, &amp; Kolom TTD
                  </p>
                  <p>
                    • <strong>CSV UTF-8 (Excel):</strong> Siap buka di Microsoft
                    Excel / Google Sheets
                  </p>
                </div>
              </div>
            )}

            <DownloadActionButtons
              isEmpty={report.isEmpty}
              periodType={periodType}
              isExportingPdf={isExportingPdf}
              onDownloadCsv={handleDownloadCsv}
              onDownloadPdf={handleDownloadPdf}
              variant="panel"
            />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
