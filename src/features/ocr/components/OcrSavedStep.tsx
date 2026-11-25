"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SAMPLE_OCR_PRESETS } from "@/constants/seed-data";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import type { OcrReportRecord, Product } from "@/types";

interface OcrSavedStepProps {
  products: Product[];
  savedReport: OcrReportRecord;
  onResetUpload: () => void;
}

/**
 * State 4: Ringkasan rekap digital tersimpan & hasil uji 3 sampel OCR.
 */
export function OcrSavedStep({
  products,
  savedReport,
  onResetUpload,
}: OcrSavedStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SurfaceCard as="section" className="lg:col-span-7 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Hasil Uji 3 Sampel Foto Laporan &amp; Data Produk
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {products.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="h-[110px] rounded-[16px] bg-ceashyr-forest p-3.5 flex flex-col justify-between text-white"
            >
              <span className="text-xs font-semibold line-clamp-2">
                {p.name}
              </span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-ceashyr-forest-sub">
                  {formatRupiah(p.price)}
                </span>
                <span className="font-semibold">Stok {p.stock}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold text-ceashyr-ink">
            Hasil Uji Contoh Foto Laporan (3 Sampel)
          </p>
          {SAMPLE_OCR_PRESETS.map((preset) => (
            <div
              key={preset.key}
              className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-3.5 py-2 text-xs font-medium"
            >
              {preset.accuracyLabel}
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard as="aside" className="lg:col-span-5 p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-ceashyr-green text-white text-xs font-bold flex items-center justify-center">
            ✓
          </span>
          <h2 className="text-base font-bold text-ceashyr-ink">
            Rekap Kertas Tersimpan!
          </h2>
        </div>

        <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border divide-y divide-ceashyr-border text-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-ceashyr-muted">No. Rekap</span>
            <span className="font-bold text-ceashyr-ink">
              {savedReport.code}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-ceashyr-muted">Tanggal</span>
            <span className="font-semibold text-ceashyr-ink">
              {formatDateTimeId(savedReport.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-ceashyr-muted">Total Barang</span>
            <span className="font-semibold text-ceashyr-ink">
              {savedReport.totalItems} pcs
            </span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-ceashyr-muted">Total Rekap</span>
            <span className="font-bold text-sm text-ceashyr-orange">
              {formatRupiah(savedReport.totalAmount, true)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetUpload}
          className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
        >
          Unggah Foto Laporan Baru
        </button>
      </SurfaceCard>
    </div>
  );
}
