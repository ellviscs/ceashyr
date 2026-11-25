"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleRestrictedView } from "@/components/ui/RoleRestrictedView";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { DownloadActionButtons } from "@/features/reports/components/DownloadActionButtons";
import { ReportFilterBar } from "@/features/reports/components/ReportFilterBar";
import { ReportKpiGrid } from "@/features/reports/components/ReportKpiGrid";
import { ReportProductRecapPanel } from "@/features/reports/components/ReportProductRecapPanel";
import { ReportTransactionsTable } from "@/features/reports/components/ReportTransactionsTable";
import { useSession } from "@/hooks/useSession";
import { formatDateShortId, formatRupiah } from "@/lib/formatters";
import { downloadSalesReportCsv } from "@/lib/reports/export-csv";
import { downloadSalesReportPdf } from "@/lib/reports/export-pdf";
import {
  buildSalesReport,
  getLatestActivityDateKey,
  parseLocalDateKey,
  shiftDateKey,
  toLocalDateKey,
} from "@/lib/reports/sales-report";
import { dataProvider } from "@/services";
import type {
  OcrReportRecord,
  ReportPeriodType,
  SalesReportData,
  Transaction,
} from "@/types";

/**
 * Halaman Laporan Penjualan Harian & Mingguan untuk Ketua KWU (US-15).
 * Mengambil dan merekap data transaksi melalui `dataProvider` serta menyediakan ekspor PDF A4 & CSV/Excel offline-first.
 */
export default function LaporanPenjualanPage() {
  const [todayKey] = useState<string>(() => toLocalDateKey(new Date()));
  const { session } = useSession({ fallbackRole: "ketua_kwu" });
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
    let active = true;
    Promise.all([
      dataProvider.transactions.list(),
      dataProvider.ocr.listReports(),
    ]).then(([loadedTrx, loadedOcr]) => {
      if (!active) return;
      setTransactions(loadedTrx);
      setOcrReports(loadedOcr);
    });
    return () => {
      active = false;
    };
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

  const handleAnchorDateChange = (dateKey: string) => {
    setAnchorDateKey(dateKey);
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
      <RoleRestrictedView
        role="pengelola"
        email={session.email}
        activeNav="kasir"
        message="Akses Terbatas: Halaman Laporan Penjualan hanya untuk Ketua KWU. Akun Pengelola/Kasir hanya memiliki akses Kasir, Rekap Kertas, dan Daftar Produk (Mode Lihat)."
        actions={[
          {
            label: "Kembali ke Halaman Kasir →",
            href: "/kasir",
            variant: "primary",
          },
          {
            label: "Masuk ke Rekap Kertas →",
            href: "/rekap-kertas",
            variant: "secondary",
          },
        ]}
      />
    );
  }

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
        <ReportFilterBar
          periodType={periodType}
          anchorDateKey={anchorDateKey}
          todayKey={todayKey}
          includeOcrReports={includeOcrReports}
          savedOcrCount={savedOcrCount}
          isEmpty={report.isEmpty}
          shortPeriodLabel={report.shortPeriodLabel}
          onPeriodTypeChange={handlePeriodTypeChange}
          onShiftPeriod={handleShiftPeriod}
          onAnchorDateChange={handleAnchorDateChange}
          onIncludeOcrChange={(checked) => {
            setIncludeOcrReports(checked);
            setDownloadBanner(null);
          }}
        />

        {downloadBanner && (
          <StatusBanner
            variant="success"
            onDismiss={() => setDownloadBanner(null)}
            dismissLabel="Tutup notifikasi unduh"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                ✓ File <strong>{downloadBanner.fileName}</strong> berhasil
                diunduh ke perangkat Anda ({downloadBanner.summary}).
              </span>
              <span className="text-[11px] font-bold">
                Tersimpan di perangkat
              </span>
            </div>
          </StatusBanner>
        )}

        {exportError && (
          <StatusBanner variant="error" className="text-xs">
            {exportError}
          </StatusBanner>
        )}

        {report.isEmpty && (
          <StatusBanner variant="warning">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                ℹ Belum ada transaksi penjualan pada{" "}
                <strong>{report.periodTitle}</strong>. Anda tetap dapat
                mengunduh <strong>Laporan Nihil (Rp 0)</strong> untuk
                kelengkapan arsip himpunan.
              </span>
              {hasOutOfRangeActivity && latestActivityDateKey && (
                <button
                  type="button"
                  onClick={() => handleAnchorDateChange(latestActivityDateKey)}
                  className="px-3 py-1 rounded-lg bg-white border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:bg-ceashyr-cream transition whitespace-nowrap"
                >
                  Lihat Data Terakhir (
                  {formatDateShortId(parseLocalDateKey(latestActivityDateKey))})
                </button>
              )}
            </div>
          </StatusBanner>
        )}

        <ReportKpiGrid report={report} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <ReportTransactionsTable
            report={report}
            weeklyTab={weeklyTab}
            hasOutOfRangeActivity={hasOutOfRangeActivity}
            latestActivityDateKey={latestActivityDateKey}
            onWeeklyTabChange={setWeeklyTab}
            onSwitchToWeekly={() => handlePeriodTypeChange("weekly")}
            onJumpToDate={handleAnchorDateChange}
          />

          <ReportProductRecapPanel
            report={report}
            isExportingPdf={isExportingPdf}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>
      </div>
    </AppShell>
  );
}
