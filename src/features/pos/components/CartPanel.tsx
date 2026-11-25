"use client";

import React from "react";
import { formatRupiah } from "@/lib/formatters";
import type { CartItem } from "@/types";

interface CartPanelProps {
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  isSaving?: boolean;
  onUpdateQty: (productId: string, delta: number) => void;
  onSave: () => void;
}

/**
 * Panel daftar keranjang transaksi beserta kontrol jumlah dan tombol simpan (US-05).
 */
export function CartPanel({
  cart,
  totalItems,
  totalAmount,
  isSaving = false,
  onUpdateQty,
  onSave,
}: CartPanelProps) {
  return (
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
            Klik &apos;+ Tambah&apos; pada kotak produk di kiri untuk mencatat
            penjualan.
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
                  onClick={() => onUpdateQty(item.productId, -1)}
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
                  onClick={() => onUpdateQty(item.productId, 1)}
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
          <p className="text-[11px] text-ceashyr-muted">{totalItems} item</p>
        </div>
        <p className="text-lg font-bold text-ceashyr-ink">
          {formatRupiah(totalAmount, true)}
        </p>
      </div>

      <button
        type="button"
        disabled={cart.length === 0 || isSaving}
        onClick={onSave}
        className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Menyimpan..." : "Simpan Penjualan"}
      </button>
    </>
  );
}

interface MobileCartFloatingBarProps {
  totalItems: number;
  totalAmount: number;
  onScrollToCart: () => void;
}

/**
 * Ringkasan keranjang mengambang khusus layar HP (< 1024px).
 */
export function MobileCartFloatingBar({
  totalItems,
  totalAmount,
  onScrollToCart,
}: MobileCartFloatingBarProps) {
  return (
    <div className="lg:hidden fixed bottom-[68px] inset-x-3 z-30 rounded-2xl bg-ceashyr-forest text-white px-4 py-3 shadow-ceashyr-card flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] text-ceashyr-forest-sub">
          {totalItems} item di keranjang
        </p>
        <p className="text-sm font-bold">{formatRupiah(totalAmount, true)}</p>
      </div>
      <button
        type="button"
        onClick={onScrollToCart}
        className="px-3.5 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold"
      >
        Lihat / Simpan ↓
      </button>
    </div>
  );
}
