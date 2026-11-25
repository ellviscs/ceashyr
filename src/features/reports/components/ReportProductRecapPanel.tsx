"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatPercentId, formatRupiah } from "@/lib/formatters";
import type { SalesReportData } from "@/types";
import { DownloadActionButtons } from "./DownloadActionButtons";

interface ReportProductRecapPanelProps {
  report: SalesReportData;
  isExportingPdf: boolean;
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
}

/**
 * Kolom kanan laporan: rekap penjualan per produk & tombol ekspor PDF/CSV.
 */
export function ReportProductRecapPanel({
  report,
  isExportingPdf,
  onDownloadCsv,
  onDownloadPdf,
}: ReportProductRecapPanelProps) {
  const isWeekly = report.periodType === "weekly";

  return (
    <SurfaceCard as="aside" className="lg:col-span-5 p-5 md:p-6 space-y-4">
      <h2 className="text-base font-bold text-ceashyr-ink">
        {report.isEmpty
          ? "Rekap Produk & Laporan Nihil"
          : isWeekly
            ? "Rekap Produk Mingguan & Unduh"
            : "Rekap Produk & Ekspor Laporan"}
      </h2>

      <div className="rounded-[14px] bg-ceashyr-forest text-white p-4 shadow-ceashyr-box">
        <p className="text-sm font-bold">
          {report.isEmpty
            ? "Status Periode: NIHIL (Rp 0)"
            : isWeekly
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
                <th className="text-left py-2 px-3 font-semibold">Produk</th>
                <th className="text-right py-2 px-3 font-semibold">Terjual</th>
                <th className="text-right py-2 px-3 font-semibold">Total</th>
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
            <strong>Catatan Laporan Nihil:</strong> File PDF &amp; CSV tetap
            mencantumkan kop resmi, tanggal periode, ringkasan 0 nota / Rp 0,
            serta keterangan NIHIL tanpa error.
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
              • <strong>PDF A4 Resmi:</strong> Ringkasan KPI, Rekap Produk,
              Daftar Nota, &amp; Kolom TTD
            </p>
            <p>
              • <strong>CSV UTF-8 (Excel):</strong> Siap buka di Microsoft Excel
              / Google Sheets
            </p>
          </div>
        </div>
      )}

      <DownloadActionButtons
        isEmpty={report.isEmpty}
        periodType={report.periodType}
        isExportingPdf={isExportingPdf}
        onDownloadCsv={onDownloadCsv}
        onDownloadPdf={onDownloadPdf}
        variant="panel"
      />
    </SurfaceCard>
  );
}
