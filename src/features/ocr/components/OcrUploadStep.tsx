"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SAMPLE_OCR_PRESETS } from "@/constants/seed-data";
import { formatRupiah } from "@/lib/formatters";
import type { OcrSamplePreset, Product } from "@/types";

interface OcrUploadStepProps {
  products: Product[];
  onPickCamera: () => void;
  onPickGallery: () => void;
  onSelectPreset: (preset: OcrSamplePreset) => void;
}

/**
 * State 1: Upload kosong & pemilihan sampel uji laporan kertas (US-16).
 */
export function OcrUploadStep({
  products,
  onPickCamera,
  onPickGallery,
  onSelectPreset,
}: OcrUploadStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SurfaceCard as="section" className="lg:col-span-5 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          1. Ambil / Unggah Foto Laporan Kertas
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPickCamera}
            className="h-10 px-3 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
          >
            Ambil Foto
          </button>
          <button
            type="button"
            onClick={onPickGallery}
            className="h-10 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
          >
            Pilih Galeri
          </button>
        </div>

        <div className="rounded-xl border border-dashed border-ceashyr-border bg-ceashyr-field p-6 text-center space-y-1.5">
          <p className="text-xs font-bold text-ceashyr-ink">
            Belum ada foto laporan
          </p>
          <p className="text-xs text-ceashyr-muted leading-relaxed">
            Ambil foto catatan penjualan harian di kertas atau pilih dari galeri
            HP untuk diubah menjadi data digital (OCR).
          </p>
        </div>

        <div className="pt-2 border-t border-ceashyr-border space-y-2">
          <p className="text-[11px] font-semibold text-ceashyr-muted">
            Uji Contoh Foto Laporan (3 Sampel Preset):
          </p>
          <div className="space-y-1.5">
            {SAMPLE_OCR_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="w-full text-left px-3 py-2 rounded-xl bg-white border border-ceashyr-border text-xs font-medium text-ceashyr-ink hover:border-ceashyr-orange hover:bg-ceashyr-peach/30 transition"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard as="section" className="lg:col-span-7 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          2. Katalog &amp; Preview Konversi Digital
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {products.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="h-[120px] rounded-[16px] bg-ceashyr-forest p-4 flex flex-col justify-between text-white"
            >
              <span className="text-sm font-semibold line-clamp-2">
                {p.name}
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ceashyr-forest-sub">
                  {formatRupiah(p.price)}
                </span>
                <span className="font-semibold">0 pcs</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-ceashyr-border">
          <span className="text-xs font-semibold text-ceashyr-ink">
            Total Rekap Digital (0 item)
          </span>
          <span className="text-base font-bold text-ceashyr-ink">Rp 0</span>
        </div>
      </SurfaceCard>
    </div>
  );
}
