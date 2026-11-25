"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { ProductCatalogSection } from "@/features/products/components/ProductCatalogSection";
import { ProductDetailPanel } from "@/features/products/components/ProductDetailPanel";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useSession } from "@/hooks/useSession";
import { dataProvider } from "@/services";
import type { AddProductResult, Product, UserRole } from "@/types";

/**
 * Konten Halaman Kelola & Tambah Produk (US-01 — Tasks H-04, H-05, H-06).
 * Referensi Figma: 1390:4621 (Pengelola) & 1331:6084 (Ketua KWU K1..K6).
 */
function ProdukContent() {
  const searchParams = useSearchParams();
  const detailRef = useRef<HTMLDivElement | null>(null);

  const modeParam = searchParams.get("mode");
  const actionParam = searchParams.get("action");
  const [manualRole, setManualRole] = useState<UserRole | undefined>(undefined);

  const { role, email, switchRole } = useSession({
    fallbackRole: "ketua_kwu",
    overrideRole:
      manualRole ?? (modeParam === "pengelola" ? "pengelola" : undefined),
  });

  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  useEffect(() => {
    setManualRole(undefined);
  }, [modeParam]);

  useEffect(() => {
    let active = true;
    dataProvider.products.list().then((loaded) => {
      if (active) setProducts(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (actionParam === "tambah" && role === "ketua_kwu") {
      setViewMode("form");
    }
  }, [actionParam, role]);

  const isPengelola = role === "pengelola";

  const handleSwitchRole = async (nextRole: UserRole) => {
    await switchRole(nextRole);
    setManualRole(nextRole);
    if (nextRole === "pengelola" && viewMode === "form") {
      setViewMode("list");
    }
  };

  const openForm = () => {
    if (isPengelola) return;
    setSelectedProduct(null);
    setSuccessBanner(null);
    setViewMode("form");
  };

  const closeForm = () => {
    setViewMode("list");
  };

  const handleSelectProduct = (prod: Product) => {
    if (selectedProduct?.id === prod.id) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(prod);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);
  };

  const handleProductCreated = (
    res: Extract<AddProductResult, { ok: true }>
  ) => {
    setProducts(res.products);
    setSelectedProduct(null);
    setViewMode("list");
    setRecentlyAdded(true);
    setSuccessBanner(
      `✓ Produk '${res.product.name}' berhasil disimpan ke database dan ditampilkan di daftar produk!`
    );
  };

  return (
    <AppShell
      role={role}
      activeNav="produk"
      email={email}
      title={
        viewMode === "form"
          ? "Tambah Produk Baru"
          : isPengelola
            ? "Daftar Produk Kantin"
            : "Kelola & Tambah Produk"
      }
      onSwitchRole={handleSwitchRole}
      headerRightSlot={
        viewMode === "form" ? (
          <button
            type="button"
            onClick={closeForm}
            className="px-4 py-2 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
          >
            ← Kembali ke Daftar
          </button>
        ) : isPengelola ? (
          <span className="px-3.5 py-1.5 rounded-full bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold">
            Mode Pengelola • Hanya Lihat
          </span>
        ) : (
          <button
            type="button"
            onClick={openForm}
            className="px-4 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
          >
            + Tambah Produk
          </button>
        )
      }
    >
      {viewMode === "form" && !isPengelola ? (
        <ProductForm
          onCreateProduct={(input) => dataProvider.products.create(input)}
          onSuccess={handleProductCreated}
          onCancel={closeForm}
        />
      ) : (
        <div className="space-y-4">
          {isPengelola && (
            <StatusBanner variant="warning">
              Akses Terbatas Pengelola/Kasir: hanya dapat melihat daftar &amp;
              detail produk. Penambahan produk dilakukan oleh Ketua KWU.
            </StatusBanner>
          )}

          {successBanner && !isPengelola && (
            <StatusBanner variant="success">{successBanner}</StatusBanner>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <ProductCatalogSection
              products={products}
              selectedProductId={selectedProduct?.id}
              isPengelola={isPengelola}
              recentlyAdded={recentlyAdded}
              hasDetailOpen={Boolean(selectedProduct)}
              onSelectProduct={handleSelectProduct}
            />

            {selectedProduct && (
              <div ref={detailRef} className="lg:col-span-4">
                <ProductDetailPanel
                  product={selectedProduct}
                  isPengelola={isPengelola}
                  onClose={() => setSelectedProduct(null)}
                  onAddNew={openForm}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function ProdukPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ceashyr-mint flex items-center justify-center text-sm text-ceashyr-muted">
          Memuat halaman produk...
        </div>
      }
    >
      <ProdukContent />
    </Suspense>
  );
}
