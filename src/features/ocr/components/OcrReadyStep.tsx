"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatRupiah } from "@/lib/formatters";
import type { Product } from "@/types";

interface OcrReadyStepProps {
  fileName: string;
  previewUrl?: string;
  rawText: string;
  products: Product[];
  isProcessingOcr: boolean;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onRunOcr: () => void;
  onSaveOfflineQueue: () => void;
}

/**
 * State 2: Foto laporan siap dikonversi OCR atau disimpan ke antrean offline.
 */
export function OcrReadyStep({
  fileName,
  previewUrl,
  rawText,
  products,
  isProcessingOcr,
  onPickCamera,
  onPickGallery,
  onRunOcr,
  onSaveOfflineQueue,
}: OcrReadyStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SurfaceCard as="section" className="lg:col-span-5 p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ceashyr-ink">
            1. Foto Laporan Terpilih
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-ceashyr-green-soft text-ceashyr-green text-[11px] font-bold">
            Foto Siap
          </span>
        </div>

        <p className="text-xs text-ceashyr-muted">{fileName}</p>

        {previewUrl && (
          <div className="rounded-xl overflow-hidden border border-ceashyr-border bg-white max-h-48">
            <img
              src={previewUrl}
              alt={fileName}
              className="w-full h-44 object-contain"
            />
          </div>
        )}

        <pre className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 text-[11px] text-ceashyr-ink whitespace-pre-wrap font-mono leading-relaxed">
          {rawText}
        </pre>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onPickCamera}
            className="py-2 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
          >
            Ganti via Kamera
          </button>
          <button
            type="button"
            onClick={onPickGallery}
            className="py-2 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-orange text-xs font-semibold hover:bg-ceashyr-peach/40 transition"
          >
            Pilih Ulang Galeri
          </button>
        </div>
      </SurfaceCard>

      <SurfaceCard as="section" className="lg:col-span-7 p-5 md:p-6 space-y-4">
        <h2 className="text-base font-bold text-ceashyr-ink">
          2. Siap Dikonversi ke Data Digital
        </h2>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onRunOcr}
            disabled={isProcessingOcr}
            className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-60"
          >
            {isProcessingOcr
              ? "Membaca Teks Foto (OCR)..."
              : "Baca Teks Foto (OCR)"}
          </button>

          <button
            type="button"
            onClick={onSaveOfflineQueue}
            className="w-full h-10 rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:brightness-95 transition"
          >
            Simpan ke Antrean Offline (Jika WiFi Bermasalah)
          </button>
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-xs font-bold text-ceashyr-ink">
            Referensi Produk Kantin ({products.length} Produk)
          </p>
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
        </div>
      </SurfaceCard>
    </div>
  );
}
