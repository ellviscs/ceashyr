"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import type { OcrReportRecord } from "@/types";

interface OcrHistorySectionProps {
  reports: OcrReportRecord[];
}

/**
 * Grid riwayat rekap laporan kertas digital yang telah tersimpan.
 */
export function OcrHistorySection({ reports }: OcrHistorySectionProps) {
  if (reports.length === 0) return null;

  return (
    <SurfaceCard as="section" className="p-5 md:p-6 space-y-3">
      <h2 className="text-base font-bold text-ceashyr-ink">
        Riwayat Rekap Digital Tersimpan ({reports.length} Laporan)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ceashyr-ink">{rep.code}</span>
              <span className="font-bold text-ceashyr-orange">
                {formatRupiah(rep.totalAmount, true)}
              </span>
            </div>
            <p className="text-[11px] text-ceashyr-muted truncate">
              {rep.fileName} • {rep.totalItems} pcs
            </p>
            <p className="text-[11px] text-ceashyr-muted">
              {formatDateTimeId(rep.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
