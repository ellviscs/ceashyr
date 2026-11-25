"use client";

import React from "react";
import { KpiCard } from "@/components/ui/KpiCard";
import { formatRupiah } from "@/lib/formatters";
import type { SalesReportData } from "@/types";

interface ReportKpiGridProps {
  report: SalesReportData;
}

/**
 * 4 Kartu KPI ringkasan Laporan Penjualan (Pendapatan, Transaksi, Item, dan Puncak/Terlaris).
 */
export function ReportKpiGrid({ report }: ReportKpiGridProps) {
  const isWeekly = report.periodType === "weekly";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <KpiCard
        label="Total Pendapatan"
        value={formatRupiah(report.totalRevenue, true)}
        subtitle={
          report.isEmpty
            ? "Belum ada pemasukan"
            : isWeekly
              ? `${report.activeDaysCount} hari aktif • ${formatRupiah(
                  report.averagePerActiveDay,
                  true
                )} / hari`
              : `Rata-rata ${formatRupiah(report.averagePerTransaction, true)} / nota`
        }
      />

      <KpiCard
        label="Jumlah Transaksi"
        value={`${report.totalTransactions} Nota`}
        valueTone="orange"
        subtitle={
          report.isEmpty
            ? "Tidak ada transaksi tercatat"
            : `Rata-rata ${formatRupiah(report.averagePerTransaction, true)} / nota`
        }
      />

      <KpiCard
        label="Total Item Terjual"
        value={`${report.totalItemsSold} pcs`}
        valueTone="green"
        subtitle={`${report.productRecap.length} jenis produk terjual`}
      />

      {isWeekly ? (
        <KpiCard
          label="Hari Penjualan Tertinggi"
          value={report.peakDay ? report.peakDay.fullDateLabel : "—"}
          valueClassName="text-base md:text-lg truncate"
          subtitle={
            report.peakDay
              ? `${formatRupiah(report.peakDay.totalAmount, true)} • ${
                  report.peakDay.transactionCount
                } nota`
              : "Belum ada data"
          }
        />
      ) : (
        <KpiCard
          label="Produk Terlaris"
          value={report.topProduct ? report.topProduct.productName : "—"}
          valueClassName="text-base md:text-lg truncate"
          subtitle={
            report.topProduct
              ? `${report.topProduct.qtySold} pcs • ${formatRupiah(
                  report.topProduct.subtotal,
                  true
                )}`
              : "Belum ada data"
          }
        />
      )}
    </div>
  );
}
