"use client";

import React, { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  CartPanel,
  MobileCartFloatingBar,
} from "@/features/pos/components/CartPanel";
import { TransactionReceipt } from "@/features/pos/components/TransactionReceipt";
import { useCart } from "@/features/pos/hooks/useCart";
import { useSession } from "@/hooks/useSession";

/**
 * Halaman Kasir — Pencatatan Penjualan (US-05 & US-06 — Tasks H-07 & H-08).
 * Referensi Figma: Section `1331:6270` (`1338:4925`, `1338:5007`, `1338:5097`, `1338:5211`).
 */
export default function KasirPage() {
  const cartRef = useRef<HTMLDivElement | null>(null);
  const { role, email } = useSession({ fallbackRole: "pengelola" });
  const {
    products,
    cart,
    lastTransaction,
    cartError,
    isSaving,
    totalItems,
    totalAmount,
    addToCart,
    updateQty,
    saveTransaction,
    startNewSale,
  } = useCart();

  return (
    <AppShell
      role={role}
      activeNav="kasir"
      email={email}
      title="Kasir — Pencatatan Penjualan"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Katalog Produk Kantin */}
        <SurfaceCard as="section" className="lg:col-span-8 p-5 md:p-6 space-y-4">
          <h2 className="text-base font-bold text-ceashyr-ink">
            {lastTransaction
              ? "Pilih Produk Kantin — Stok Diperbarui Otomatis"
              : `Pilih Produk Kantin (Total Produk: ${products.length} Produk)`}
          </h2>

          {lastTransaction && (
            <StatusBanner variant="success">
              ✓ Transaksi {lastTransaction.code} berhasil disimpan! Stok produk
              otomatis berkurang sesuai jumlah terjual.
            </StatusBanner>
          )}

          {cartError && (
            <StatusBanner variant="error" className="py-2.5 text-xs">
              {cartError}
            </StatusBanner>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const inCart = cart.find((c) => c.productId === product.id);
              const qty = inCart?.qty ?? 0;

              let badgeText = "+ Tambah";
              let badgeVariant: "orange" | "green" | "muted" = "orange";
              if (product.stock === 0) {
                badgeText = "Habis";
                badgeVariant = "muted";
              } else if (qty > 0) {
                badgeText = qty === 1 ? "Dipilih (1)" : `Dipilih ${qty}x`;
                badgeVariant = "green";
              }

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={qty > 0}
                  badgeText={badgeText}
                  badgeVariant={badgeVariant}
                  disabled={product.stock === 0}
                  onClick={() => addToCart(product)}
                />
              );
            })}
          </div>
        </SurfaceCard>

        {/* Panel Kanan: Keranjang Transaksi atau Nota Tersimpan */}
        <div ref={cartRef} className="lg:col-span-4">
          <SurfaceCard as="aside" className="p-5 space-y-4">
            {lastTransaction && cart.length === 0 ? (
              <TransactionReceipt
                transaction={lastTransaction}
                onNewSale={startNewSale}
              />
            ) : (
              <CartPanel
                cart={cart}
                totalItems={totalItems}
                totalAmount={totalAmount}
                isSaving={isSaving}
                onUpdateQty={updateQty}
                onSave={() => saveTransaction(email)}
              />
            )}
          </SurfaceCard>
        </div>
      </div>

      {cart.length > 0 && (
        <MobileCartFloatingBar
          totalItems={totalItems}
          totalAmount={totalAmount}
          onScrollToCart={() =>
            cartRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />
      )}
    </AppShell>
  );
}
