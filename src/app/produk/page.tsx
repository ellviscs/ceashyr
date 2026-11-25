"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { EditProductModal } from "@/features/products/components/EditProductModal";
import { ProductCatalogSection } from "@/features/products/components/ProductCatalogSection";
import { ProductDetailPanel } from "@/features/products/components/ProductDetailPanel";
import { ProductForm } from "@/features/products/components/ProductForm";
import {
  type ProductCatalogLayout,
  ProductToolbar,
} from "@/features/products/components/ProductToolbar";
import { StockAlertBanner } from "@/features/products/components/StockAlertBanner";
import {
  getStockAlertSummary,
  matchesCategoryFilter,
} from "@/features/products/stock-status";
import { useSession } from "@/hooks/useSession";
import { dataProvider } from "@/services";
import type {
  AddProductResult,
  Product,
  ProductCategoryFilter,
  UpdateProductResult,
  UserRole,
} from "@/types";

/**
 * Konten Halaman Kelola & Tambah Produk (US-01, US-02, US-09 — Figma node 1527:2424).
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<ProductCategoryFilter>("all");
  const [layout, setLayout] = useState<ProductCatalogLayout>("grid");
  const [isEditMode, setIsEditMode] = useState(false);

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

  const alertSummary = useMemo(
    () => getStockAlertSummary(products),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (!matchesCategoryFilter(product, categoryFilter)) return false;
      if (!query) return true;
      const nameMatch = product.name.toLowerCase().includes(query);
      const catMatch = (product.category || "").toLowerCase().includes(query);
      return nameMatch || catMatch;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleSwitchRole = async (nextRole: UserRole) => {
    await switchRole(nextRole);
    setManualRole(nextRole);
    if (nextRole === "pengelola") {
      setViewMode("list");
      setIsEditMode(false);
      setEditingProduct(null);
    }
  };

  const openForm = () => {
    if (isPengelola) return;
    setSelectedProduct(null);
    setEditingProduct(null);
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

  const handleOpenEdit = (prod: Product) => {
    if (isPengelola) return;
    setSuccessBanner(null);
    setEditingProduct(prod);
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

  const handleProductUpdated = (
    res: Extract<UpdateProductResult, { ok: true }>
  ) => {
    setProducts(res.products);
    setEditingProduct(null);
    if (selectedProduct?.id === res.product.id) {
      setSelectedProduct(res.product);
    }
    setSuccessBanner(
      `✓ Produk '${res.product.name}' berhasil diperbarui! Perubahan harga hanya berlaku untuk transaksi berikutnya.`
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
        ) : undefined
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
              detail produk. Pengubahan &amp; penambahan produk dilakukan oleh
              Ketua KWU.
            </StatusBanner>
          )}

          {successBanner && !isPengelola && (
            <StatusBanner
              variant="success"
              onDismiss={() => setSuccessBanner(null)}
            >
              {successBanner}
            </StatusBanner>
          )}

          <ProductToolbar
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            layout={layout}
            isEditMode={isEditMode}
            isPengelola={isPengelola}
            alertCount={alertSummary.allAlerts.length}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategoryFilter}
            onLayoutChange={setLayout}
            onToggleEditMode={() => setIsEditMode((prev) => !prev)}
            onAddProduct={openForm}
          />

          <StockAlertBanner
            products={products}
            onFilterLowStock={() => setCategoryFilter("low_stock")}
            onSelectProduct={
              isPengelola ? handleSelectProduct : handleOpenEdit
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div
              className={selectedProduct ? "lg:col-span-8" : "lg:col-span-12"}
            >
              <ProductCatalogSection
                products={filteredProducts}
                totalCatalogCount={products.length}
                selectedProductId={selectedProduct?.id}
                layout={layout}
                isEditMode={isEditMode}
                isPengelola={isPengelola}
                recentlyAdded={recentlyAdded}
                onSelectProduct={handleSelectProduct}
                onEditProduct={handleOpenEdit}
              />
            </div>

            {selectedProduct && (
              <div ref={detailRef} className="lg:col-span-4">
                <ProductDetailPanel
                  product={selectedProduct}
                  isPengelola={isPengelola}
                  onClose={() => setSelectedProduct(null)}
                  onEdit={handleOpenEdit}
                  onAddNew={openForm}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {editingProduct && !isPengelola && (
        <EditProductModal
          product={editingProduct}
          onSave={(id, input) => dataProvider.products.update(id, input)}
          onSuccess={handleProductUpdated}
          onCancel={() => setEditingProduct(null)}
        />
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
