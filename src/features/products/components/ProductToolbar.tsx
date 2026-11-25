"use client";

import React from "react";
import type { ProductCategoryFilter } from "@/types";

export type ProductCatalogLayout = "grid" | "list";

interface ProductToolbarProps {
  searchQuery: string;
  categoryFilter: ProductCategoryFilter;
  layout: ProductCatalogLayout;
  isEditMode: boolean;
  isPengelola: boolean;
  alertCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (filter: ProductCategoryFilter) => void;
  onLayoutChange: (layout: ProductCatalogLayout) => void;
  onToggleEditMode: () => void;
  onAddProduct: () => void;
}

const FILTER_OPTIONS: Array<{ key: ProductCategoryFilter; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "makanan", label: "Makanan" },
  { key: "minuman", label: "Minuman" },
  { key: "low_stock", label: "Stok Menipis" },
];

/**
 * Toolbar katalog produk mengikuti prototipe Figma `node-id=1527-2424`:
 * pencarian, pill filter kategori/stok menipis, switcher List/Grid, mode Edit, & Tambah Produk.
 */
export function ProductToolbar({
  searchQuery,
  categoryFilter,
  layout,
  isEditMode,
  isPengelola,
  alertCount,
  onSearchChange,
  onCategoryChange,
  onLayoutChange,
  onToggleEditMode,
  onAddProduct,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Pencarian & Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
        <div className="relative flex-1 min-w-[180px] max-w-[260px]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ceashyr-muted pointer-events-none"
          >
            <circle
              cx="9"
              cy="9"
              r="6"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M13.5 13.5L17 17"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-ceashyr-border text-xs text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none focus:border-ceashyr-orange transition"
          />
        </div>

        <div
          role="group"
          aria-label="Filter kategori dan stok produk"
          className="flex flex-wrap items-center gap-1.5"
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = categoryFilter === opt.key;
            const isLowStockPill = opt.key === "low_stock";
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onCategoryChange(opt.key)}
                className={`h-9 px-3.5 rounded-full border text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                  isActive
                    ? "bg-ceashyr-peach border-ceashyr-orange text-ceashyr-orange"
                    : "bg-white border-ceashyr-border text-ceashyr-ink hover:border-ceashyr-orange/50"
                }`}
              >
                <span>{opt.label}</span>
                {isLowStockPill && alertCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                      isActive
                        ? "bg-ceashyr-orange text-white"
                        : "bg-ceashyr-amber-bg text-ceashyr-amber-ink border border-ceashyr-amber-border"
                    }`}
                  >
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aksi Kanan: List/Grid, Edit Mode, Tambah Produk */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Mode tampilan daftar produk"
          className="inline-flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => onLayoutChange("list")}
            aria-label="Tampilan daftar"
            title="Tampilan List"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              layout === "list"
                ? "bg-ceashyr-orange border-ceashyr-orange text-white"
                : "bg-white border-ceashyr-border text-ceashyr-ink hover:bg-ceashyr-field"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 5H16M4 10H16M4 15H16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onLayoutChange("grid")}
            aria-label="Tampilan grid kartu"
            title="Tampilan Grid"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
              layout === "grid"
                ? "bg-ceashyr-orange border-ceashyr-orange text-white"
                : "bg-white border-ceashyr-border text-ceashyr-ink hover:bg-ceashyr-field"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <rect
                x="11"
                y="3"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <rect
                x="3"
                y="11"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <rect
                x="11"
                y="11"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        </div>

        {!isPengelola && (
          <>
            <button
              type="button"
              onClick={onToggleEditMode}
              aria-pressed={isEditMode}
              className={`h-9 px-3.5 rounded-full border text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                isEditMode
                  ? "bg-ceashyr-orange border-ceashyr-orange text-white"
                  : "bg-white border-ceashyr-orange text-ceashyr-orange hover:bg-ceashyr-peach/50"
              }`}
            >
              <span aria-hidden="true">✎</span>
              <span>{isEditMode ? "Selesai Edit" : "Edit"}</span>
            </button>

            <button
              type="button"
              onClick={onAddProduct}
              className="h-9 px-4 rounded-full bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
            >
              + Tambah Produk
            </button>
          </>
        )}
      </div>
    </div>
  );
}
