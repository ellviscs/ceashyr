"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatRupiah } from "@/lib/formatters";
import type { OcrExtractedItem } from "@/types";

interface OcrReviewStepProps {
  extractedItems: OcrExtractedItem[];
  rawText: string;
  totalItems: number;
  totalAmount: number;
  isSaving?: boolean;
  onAdjustQty: (itemId: string, delta: number) => void;
  onSaveDigitalReport: () => void;
}

/**
 * State 3: Hasil konversi OCR beserta kontrol koreksi qty sebelum disimpan.
 */
export function OcrReviewStep({
  extractedItems,
  rawText,
  totalItems,
  totalAmount,
  isSaving = false,
  onAdjustQty,
  onSaveDigitalReport,
}: OcrReviewStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SurfaceCard as="section" className="lg:col-span-7 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Hasil Konversi OCR ({extractedItems.length} Produk Terbaca)
        </h2>

        <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-2.5 text-xs font-medium">
          ✓ OCR Selesai: {extractedItems.length} baris barang berhasil
          dikonversi menjadi data digital
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {extractedItems.map((item) => (
            <div
              key={item.id}
              className="h-[120px] rounded-[16px] bg-ceashyr-forest p-4 flex flex-col justify-between text-white"
            >
              <span className="text-sm font-semibold line-clamp-2">
                {item.productName}
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ceashyr-forest-sub">
                  {formatRupiah(item.unitPrice)}
                </span>
                <span className="font-bold">{item.qtySold} pcs</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 space-y-1">
          <p className="text-xs font-bold text-ceashyr-ink">
            Teks Terbaca Otomatis:
          </p>
          <p className="text-xs text-ceashyr-muted whitespace-pre-wrap">
            {rawText}
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard as="aside" className="lg:col-span-5 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Koreksi &amp; Simpan Rekap Digital
        </h2>

        <div className="space-y-2.5">
          {extractedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-ceashyr-ink truncate">
                  {item.productName}
                </p>
                <p className="text-[11px] text-ceashyr-muted">
                  {item.qtySold} × {formatRupiah(item.unitPrice)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onAdjustQty(item.id, -1)}
                  aria-label={`Kurangi ${item.productName}`}
                  className="w-7 h-7 rounded-lg bg-white border border-ceashyr-border text-xs font-bold"
                >
                  −
                </button>
                <span className="w-5 text-center text-xs font-bold">
                  {item.qtySold}
                </span>
                <button
                  type="button"
                  onClick={() => onAdjustQty(item.id, 1)}
                  aria-label={`Tambah ${item.productName}`}
                  className="w-7 h-7 rounded-lg bg-ceashyr-orange text-white text-xs font-bold"
                >
                  +
                </button>
                <span className="w-20 text-right text-xs font-bold text-ceashyr-orange">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-ceashyr-border">
          <span className="text-xs font-semibold text-ceashyr-ink">
            Total Rekap ({totalItems} item)
          </span>
          <span className="text-lg font-bold text-ceashyr-ink">
            {formatRupiah(totalAmount, true)}
          </span>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={onSaveDigitalReport}
          className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-60"
        >
          {isSaving ? "Menyimpan..." : "Simpan Rekap Digital"}
        </button>
      </SurfaceCard>
    </div>
  );
}
