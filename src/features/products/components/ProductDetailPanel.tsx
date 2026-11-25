"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatRupiah } from "@/lib/formatters";
import type { Product } from "@/types";

interface ProductDetailPanelProps {
  product: Product;
  isPengelola: boolean;
  onClose: () => void;
  onAddNew: () => void;
}

/**
 * Panel kanan detail produk terpilih untuk Ketua KWU & Pengelola (US-01).
 */
export function ProductDetailPanel({
  product,
  isPengelola,
  onClose,
  onAddNew,
}: ProductDetailPanelProps) {
  return (
    <SurfaceCard as="aside" highlight className="p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ceashyr-ink">Detail Produk</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="w-8 h-8 rounded-lg bg-ceashyr-field border border-ceashyr-border text-ceashyr-ink text-sm font-bold flex items-center justify-center hover:bg-ceashyr-border/50 transition"
        >
          ✕
        </button>
      </div>

      <div className="rounded-[14px] bg-ceashyr-forest p-4 space-y-1">
        <p className="text-base font-bold text-white">{product.name}</p>
        <p className="text-xs text-ceashyr-forest-sub">
          {product.category || "Produk Kantin"} • Produk Kantin Aktif
        </p>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-ceashyr-muted text-xs">Harga Jual</span>
          <span className="font-semibold text-ceashyr-ink">
            {formatRupiah(product.price)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ceashyr-muted text-xs">Stok Tersedia</span>
          <span className="font-semibold text-ceashyr-ink">
            {product.stock} unit
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ceashyr-muted text-xs">Hak Akses</span>
          <span className="font-semibold text-ceashyr-ink">
            {isPengelola
              ? "Lihat Saja (Pengelola)"
              : "Kelola Penuh (Ketua KWU)"}
          </span>
        </div>
      </div>

      {isPengelola ? (
        <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-3.5 py-2.5 text-xs font-medium">
          Masuk sebagai Ketua KWU bila perlu menambah produk baru.
        </div>
      ) : (
        <button
          type="button"
          onClick={onAddNew}
          className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
        >
          + Tambah Produk Baru
        </button>
      )}
    </SurfaceCard>
  );
}
