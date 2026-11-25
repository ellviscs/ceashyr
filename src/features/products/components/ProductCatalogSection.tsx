"use client";

import React from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import type { Product } from "@/types";

interface ProductCatalogSectionProps {
  products: Product[];
  selectedProductId?: string;
  isPengelola: boolean;
  recentlyAdded: boolean;
  hasDetailOpen: boolean;
  onSelectProduct: (product: Product) => void;
}

/**
 * Grid 3 kolom katalog produk kantin beserta header ringkasan status.
 */
export function ProductCatalogSection({
  products,
  selectedProductId,
  isPengelola,
  recentlyAdded,
  hasDetailOpen,
  onSelectProduct,
}: ProductCatalogSectionProps) {
  return (
    <SurfaceCard
      as="section"
      className={`${
        hasDetailOpen ? "lg:col-span-8" : "lg:col-span-12"
      } p-5 md:p-6 space-y-4`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Total Produk: {products.length} produk dijual di kantin
        </h2>

        {recentlyAdded && !isPengelola ? (
          <span className="px-3 py-1 rounded-full bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green text-xs font-semibold">
            Tersimpan di Database • +1 Produk
          </span>
        ) : (
          <span className="text-xs font-medium text-ceashyr-muted">
            {isPengelola
              ? "Klik produk untuk melihat detail"
              : "Klik kartu produk untuk detail atau + Tambah Produk"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const isSel = selectedProductId === product.id;
          return (
            <ProductCard
              key={product.id}
              product={product}
              selected={isSel}
              badgeText={isSel ? "Dipilih" : undefined}
              onClick={() => onSelectProduct(product)}
            />
          );
        })}
      </div>
    </SurfaceCard>
  );
}
