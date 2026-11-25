"use client";

import React from "react";
import { getProductStockStatus } from "@/features/products/stock-status";
import { formatRupiah } from "@/lib/formatters";
import type { Product, StockAlertStatus } from "@/types";
import type { ProductCatalogLayout } from "./ProductToolbar";

interface ProductCatalogSectionProps {
  products: Product[];
  totalCatalogCount: number;
  selectedProductId?: string;
  layout: ProductCatalogLayout;
  isEditMode: boolean;
  isPengelola: boolean;
  recentlyAdded: boolean;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

function ImagePlaceholderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`text-ceashyr-muted ${className}`.trim()}
    >
      <rect
        x="3"
        y="4"
        width="16"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
      <path
        d="M4.5 17.5L9.5 12.5L13 16L15.5 13.5L18.5 16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 3V8M17.5 5.5H22.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getCardBorderClass(
  status: StockAlertStatus,
  selected: boolean
): string {
  if (selected) {
    return "border-2 border-ceashyr-orange ring-2 ring-ceashyr-orange/25";
  }
  if (status === "out") {
    return "border-2 border-ceashyr-red";
  }
  if (status === "low") {
    return "border-2 border-ceashyr-amber-border";
  }
  return "border border-ceashyr-border hover:border-ceashyr-orange/60";
}

function StockIndicatorBadge({
  status,
  stock,
  minStock,
  isNew,
}: {
  status: StockAlertStatus;
  stock: number;
  minStock: number;
  isNew?: boolean;
}) {
  if (status === "out") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ceashyr-red">
        <span className="w-4 h-4 rounded-full bg-ceashyr-red text-white text-[10px] inline-flex items-center justify-center">
          !
        </span>
        <span>Stok {stock} • Habis</span>
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ceashyr-amber-ink">
        <span aria-hidden="true">⚠</span>
        <span>Stok {stock} • Menipis</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ceashyr-ink">
      <span>Stok {stock}</span>
      {isNew && (
        <span className="px-1.5 py-0.5 rounded-full bg-ceashyr-green text-white text-[9px] font-bold">
          BARU
        </span>
      )}
      <span className="text-[10px] font-normal text-ceashyr-muted">
        (Min {minStock})
      </span>
    </span>
  );
}

/**
 * Katalog produk kantin mendukung tampilan Grid 4 kolom (Gambar) dan List,
 * lengkap dengan indikator visual stok minimum dan tombol Edit per kartu.
 */
export function ProductCatalogSection({
  products,
  totalCatalogCount,
  selectedProductId,
  layout,
  isEditMode,
  isPengelola,
  recentlyAdded,
  onSelectProduct,
  onEditProduct,
}: ProductCatalogSectionProps) {
  const showEditAction = isEditMode && !isPengelola;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ceashyr-muted">
          Menampilkan {products.length} dari {totalCatalogCount} produk kantin
        </p>
        {recentlyAdded && !isPengelola && (
          <span className="px-3 py-1 rounded-full bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green text-xs font-semibold">
            Tersimpan di Database • +1 Produk
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-[20px] bg-ceashyr-cream border border-dashed border-ceashyr-border p-8 text-center space-y-1">
          <p className="text-sm font-bold text-ceashyr-ink">
            Tidak ada produk yang cocok
          </p>
          <p className="text-xs text-ceashyr-muted">
            Ubah kata kunci pencarian atau pilih filter kategori lainnya.
          </p>
        </div>
      ) : layout === "list" ? (
        <div className="space-y-2.5">
          {products.map((product) => {
            const isSel = selectedProductId === product.id;
            const status = getProductStockStatus(
              product.stock,
              product.minStock
            );
            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                className={`rounded-[16px] bg-white px-4 py-3 shadow-ceashyr-card flex flex-wrap items-center justify-between gap-3 cursor-pointer transition ${getCardBorderClass(
                  status,
                  isSel
                )}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-14 h-12 rounded-xl bg-ceashyr-field border border-ceashyr-border flex items-center justify-center overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImagePlaceholderIcon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-ceashyr-ink truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-ceashyr-muted">
                      {formatRupiah(product.price, true)} •{" "}
                      {product.category || "Produk Kantin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StockIndicatorBadge
                    status={status}
                    stock={product.stock}
                    minStock={product.minStock}
                    isNew={product.isNew}
                  />

                  {showEditAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product);
                      }}
                      className="px-3 py-1 rounded-full bg-ceashyr-peach border border-ceashyr-orange text-ceashyr-orange text-xs font-semibold hover:bg-ceashyr-orange hover:text-white transition"
                    >
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const isSel = selectedProductId === product.id;
            const status = getProductStockStatus(
              product.stock,
              product.minStock
            );
            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                className={`rounded-[16px] bg-white p-3.5 shadow-ceashyr-card flex flex-col justify-between gap-3 cursor-pointer transition ${getCardBorderClass(
                  status,
                  isSel
                )}`}
              >
                {/* Header Stok & Penanda Peringatan */}
                <div className="flex items-center justify-between gap-2">
                  <StockIndicatorBadge
                    status={status}
                    stock={product.stock}
                    minStock={product.minStock}
                    isNew={product.isNew}
                  />
                </div>

                {/* Area Thumbnail / Placeholder Gambar Produk */}
                <div className="h-[92px] rounded-xl bg-ceashyr-field border border-ceashyr-border/70 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <ImagePlaceholderIcon />
                  )}
                </div>

                {/* Footer Nama, Harga & Tombol Edit */}
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ceashyr-ink truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-ceashyr-muted mt-0.5">
                      {formatRupiah(product.price, true)}
                    </p>
                  </div>

                  {showEditAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-full bg-ceashyr-peach border border-ceashyr-orange text-ceashyr-orange text-[11px] font-semibold hover:bg-ceashyr-orange hover:text-white transition"
                    >
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
