"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import {
  createTransaction,
  getProducts,
  getSession,
} from "@/lib/storage/repository";
import type { CartItem, Product, Transaction, UserRole } from "@/types";

/**
 * Halaman Kasir — Pencatatan Penjualan (US-05 & US-06 — Tasks H-07 & H-08).
 * Referensi Figma: Section `1331:6270` (`1338:4925`, `1338:5007`, `1338:5097`, `1338:5211`).
 */
export default function KasirPage() {
  const cartRef = useRef<HTMLElement | null>(null);

  const [role, setRole] = useState<UserRole>("pengelola");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setRole(session.role);
      setEmail(session.email);
    }
    setProducts(getProducts());
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleAddProductToCart = (product: Product) => {
    setCartError(null);
    if (lastTransaction) {
      setLastTransaction(null);
    }

    if (product.stock <= 0) {
      setCartError(`Stok '${product.name}' habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (!existing) {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            qty: 1,
            subtotal: product.price,
          },
        ];
      }

      if (existing.qty >= product.stock) {
        setCartError(
          `Stok '${product.name}' sudah maksimal (${product.stock}).`
        );
        return prev;
      }

      const nextQty = existing.qty + 1;
      return prev.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              qty: nextQty,
              subtotal: nextQty * item.unitPrice,
            }
          : item
      );
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCartError(null);
    const product = products.find((p) => p.id === productId);
    const maxStock = product?.stock ?? 0;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          if (nextQty > maxStock) {
            setCartError(
              `Stok '${item.name}' hanya tersisa ${maxStock} unit.`
            );
            return item;
          }
          return {
            ...item,
            qty: nextQty,
            subtotal: nextQty * item.unitPrice,
          };
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleSaveTransaction = () => {
    setCartError(null);
    const res = createTransaction(cart, email || "kasir@gmail.com");
    if (!res.ok) {
      setCartError(res.error);
      return;
    }

    setProducts(res.products);
    setLastTransaction(res.transaction);
    setCart([]);
  };

  const handleNewSale = () => {
    setLastTransaction(null);
    setCartError(null);
  };

  return (
    <AppShell
      role={role}
      activeNav="kasir"
      email={email}
      title="Kasir — Pencatatan Penjualan"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Katalog Produk Kantin */}
        <section className="lg:col-span-8 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
          <h2 className="text-base font-bold text-ceashyr-ink">
            {lastTransaction
              ? "Pilih Produk Kantin — Stok Diperbarui Otomatis"
              : `Pilih Produk Kantin (Total Produk: ${products.length} Produk)`}
          </h2>

          {lastTransaction && (
            <div
              role="status"
              className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-3 text-xs md:text-sm font-medium"
            >
              ✓ Transaksi {lastTransaction.code} berhasil disimpan! Stok produk otomatis berkurang sesuai jumlah terjual.
            </div>
          )}

          {cartError && (
            <div
              role="alert"
              className="rounded-xl bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red px-4 py-2.5 text-xs font-medium"
            >
              {cartError}
            </div>
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
                  onClick={() => handleAddProductToCart(product)}
                />
              );
            })}
          </div>
        </section>

        {/* Panel Kanan: Keranjang Transaksi atau Nota Tersimpan */}
        <aside
          ref={cartRef}
          className="lg:col-span-4 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 shadow-ceashyr-card space-y-4"
        >
          {lastTransaction && cart.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ceashyr-green text-white text-xs font-bold flex items-center justify-center shrink-0">
                  ✓
                </span>
                <h2 className="text-base font-bold text-ceashyr-ink">
                  Nota Transaksi Tersimpan
                </h2>
              </div>

              <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border divide-y divide-ceashyr-border text-xs">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">No. Transaksi</span>
                  <span className="font-bold text-ceashyr-ink">
                    {lastTransaction.code}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Waktu</span>
                  <span className="font-semibold text-ceashyr-ink">
                    {formatDateTimeId(lastTransaction.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Jumlah Item</span>
                  <span className="font-semibold text-ceashyr-ink">
                    {lastTransaction.totalItems} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Total Bayar</span>
                  <span className="font-bold text-sm text-ceashyr-orange">
                    {formatRupiah(lastTransaction.totalAmount, true)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNewSale}
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Catat Penjualan Baru
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-ceashyr-ink">
                Keranjang Transaksi ({totalItems} Item)
              </h2>

              {cart.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ceashyr-border bg-ceashyr-field p-5 text-center">
                  <p className="text-xs font-semibold text-ceashyr-ink">
                    Belum ada barang dipilih
                  </p>
                  <p className="text-xs text-ceashyr-muted mt-1">
                    Klik &apos;+ Tambah&apos; pada kotak produk di kiri untuk mencatat penjualan.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ceashyr-ink truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-ceashyr-muted">
                            × {formatRupiah(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-ceashyr-orange shrink-0">
                          {formatRupiah(item.subtotal)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, -1)}
                          aria-label={`Kurangi ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-white border border-ceashyr-border text-ceashyr-ink font-bold text-sm flex items-center justify-center hover:bg-ceashyr-peach transition"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-ceashyr-ink">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId, 1)}
                          aria-label={`Tambah ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-ceashyr-orange text-white font-bold text-sm flex items-center justify-center hover:brightness-105 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-ceashyr-border">
                <div>
                  <p className="text-xs font-semibold text-ceashyr-ink">
                    Total Penjualan
                  </p>
                  <p className="text-[11px] text-ceashyr-muted">
                    {totalItems} item
                  </p>
                </div>
                <p className="text-lg font-bold text-ceashyr-ink">
                  {formatRupiah(totalAmount, true)}
                </p>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleSaveTransaction}
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Penjualan
              </button>
            </>
          )}
        </aside>
      </div>

      {/* Ringkasan Keranjang Mengambang khusus HP (< 1024px) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-[68px] inset-x-3 z-30 rounded-2xl bg-ceashyr-forest text-white px-4 py-3 shadow-ceashyr-card flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-ceashyr-forest-sub">
              {totalItems} item di keranjang
            </p>
            <p className="text-sm font-bold">
              {formatRupiah(totalAmount, true)}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              cartRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="px-3.5 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold"
          >
            Lihat / Simpan ↓
          </button>
        </div>
      )}
    </AppShell>
  );
}
