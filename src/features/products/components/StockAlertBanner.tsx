"use client";

import React from "react";
import {
  getProductStockStatus,
  getStockAlertSummary,
} from "@/features/products/stock-status";
import type { Product } from "@/types";

interface StockAlertBannerProps {
  products: Product[];
  onFilterLowStock?: () => void;
  onSelectProduct?: (product: Product) => void;
}

/**
 * Daftar & banner peringatan otomatis untuk produk dengan stok <= batas minimum (US-09 & US-11).
 */
export function StockAlertBanner({
  products,
  onFilterLowStock,
  onSelectProduct,
}: StockAlertBannerProps) {
  const { outOfStock, lowStock, allAlerts } = getStockAlertSummary(products);

  if (allAlerts.length === 0) return null;

  const hasOut = outOfStock.length > 0;

  return (
    <section
      aria-label="Peringatan stok menipis dan habis"
      className={`rounded-[16px] border px-4 py-3.5 space-y-2.5 ${
        hasOut
          ? "bg-ceashyr-red-soft border-ceashyr-red/60 text-ceashyr-ink"
          : "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
          <span
            className={`w-5 h-5 rounded-full text-white text-[11px] font-bold inline-flex items-center justify-center shrink-0 ${
              hasOut ? "bg-ceashyr-red" : "bg-ceashyr-amber-border"
            }`}
          >
            !
          </span>
          <span>
            Peringatan Stok: {outOfStock.length > 0 ? `${outOfStock.length} Habis` : ""}
            {outOfStock.length > 0 && lowStock.length > 0 ? " • " : ""}
            {lowStock.length > 0 ? `${lowStock.length} Menipis (≤ Batas Minimum)` : ""}
          </span>
        </div>

        {onFilterLowStock && (
          <button
            type="button"
            onClick={onFilterLowStock}
            className="px-3 py-1 rounded-full bg-white border border-ceashyr-border text-ceashyr-ink text-[11px] font-semibold hover:bg-ceashyr-field transition"
          >
            Filter Stok Menipis →
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {allAlerts.map((product) => {
          const status = getProductStockStatus(product.stock, product.minStock);
          const isOut = status === "out";
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelectProduct?.(product)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                isOut
                  ? "bg-white border-ceashyr-red text-ceashyr-red hover:bg-ceashyr-red-soft"
                  : "bg-white border-ceashyr-amber-border text-ceashyr-amber-ink hover:bg-ceashyr-amber-bg"
              }`}
            >
              <span>{isOut ? "!" : "⚠"}</span>
              <span>{product.name}</span>
              <span className="opacity-80">
                (Stok {product.stock} / Min {product.minStock})
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
