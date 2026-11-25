"use client";

import React from "react";
import type { DailyClosingRow } from "@/features/pos/hooks/useDailyClosing";
import { formatRupiah } from "@/lib/formatters";

interface ClosingStockCardProps {
  row: DailyClosingRow;
  locked: boolean;
  onChangeRemaining: (value: string) => void;
  onStepRemaining: (delta: number) => void;
}

/**
 * Kartu input sisa stok fisik harian per produk untuk menghitung penjualan tutup toko.
 */
export function ClosingStockCard({
  row,
  locked,
  onChangeRemaining,
  onStepRemaining,
}: ClosingStockCardProps) {
  const {
    product,
    openingStock,
    rawInput,
    remainingStock,
    soldQty,
    subtotal,
    fieldError,
  } = row;
  const isOutOfStock = openingStock === 0;
  const isInputDisabled = locked || isOutOfStock;

  let badgeText = "0 Terjual";
  let badgeClass = "bg-white/15 text-ceashyr-forest-sub";
  if (fieldError) {
    badgeText = "Tidak Valid";
    badgeClass = "bg-ceashyr-red text-white";
  } else if (isOutOfStock) {
    badgeText = "Stok Habis";
    badgeClass = "bg-ceashyr-muted text-white";
  } else if (soldQty > 0) {
    badgeText = `Terjual ${soldQty} pcs`;
    badgeClass = "bg-ceashyr-orange text-white";
  }

  return (
    <div
      className={`rounded-[16px] overflow-hidden border bg-white shadow-ceashyr-box flex flex-col justify-between transition-all ${
        fieldError
          ? "border-ceashyr-red ring-2 ring-ceashyr-red/40"
          : soldQty > 0
            ? "border-ceashyr-orange ring-1 ring-ceashyr-orange"
            : "border-ceashyr-border"
      }`}
    >
      {/* Header Hijau Hutan mengikuti ProductCard Ceashyr */}
      <div className="bg-ceashyr-forest px-4 py-3.5 text-white space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-semibold leading-snug line-clamp-2">
            {product.name}
          </span>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-ceashyr-forest-sub">
            {formatRupiah(product.price, false)} / pcs
          </span>
          <span className="font-semibold text-white">
            Stok Memori: {openingStock}
          </span>
        </div>
      </div>

      {/* Area Kontrol Sisa Stok & Kalkulasi Terjual */}
      <div className="p-3.5 bg-ceashyr-field space-y-3">
        <div>
          <label
            htmlFor={`remaining-${product.id}`}
            className="block text-[11px] font-semibold text-ceashyr-muted mb-1.5"
          >
            Sisa Stok Hari Ini
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isInputDisabled || remainingStock <= 0}
              onClick={() => onStepRemaining(-1)}
              aria-label={`Kurangi sisa stok ${product.name}`}
              className="w-8 h-9 rounded-lg bg-white border border-ceashyr-border text-ceashyr-ink font-bold text-sm flex items-center justify-center hover:bg-ceashyr-peach transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>

            <input
              id={`remaining-${product.id}`}
              type="text"
              inputMode="numeric"
              disabled={isInputDisabled}
              value={rawInput}
              onChange={(e) => onChangeRemaining(e.target.value)}
              aria-label={`Input sisa stok ${product.name}`}
              className={`flex-1 min-w-0 h-9 px-2.5 rounded-lg border text-center text-sm font-bold focus:outline-none transition disabled:bg-ceashyr-border/40 disabled:text-ceashyr-muted ${
                fieldError
                  ? "border-ceashyr-red bg-ceashyr-red-soft/50 text-ceashyr-red"
                  : "border-ceashyr-border bg-white text-ceashyr-ink focus:border-ceashyr-orange"
              }`}
            />

            <button
              type="button"
              disabled={isInputDisabled || remainingStock >= openingStock}
              onClick={() => onStepRemaining(1)}
              aria-label={`Tambah sisa stok ${product.name}`}
              className="w-8 h-9 rounded-lg bg-ceashyr-orange text-white font-bold text-sm flex items-center justify-center hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {fieldError && (
            <p className="mt-1 text-[11px] font-medium text-ceashyr-red">
              {fieldError}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-ceashyr-border flex items-center justify-between text-xs">
          <span className="text-ceashyr-muted">
            Terjual:{" "}
            <strong className="text-ceashyr-ink">{soldQty} pcs</strong>
          </span>
          <span
            className={`font-bold ${
              soldQty > 0 ? "text-ceashyr-orange" : "text-ceashyr-muted"
            }`}
          >
            {formatRupiah(subtotal, true)}
          </span>
        </div>
      </div>
    </div>
  );
}
