"use client";

import React from "react";
import Link from "next/link";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import type { Transaction, UserRole } from "@/types";

interface ClosingReceiptProps {
  transaction: Transaction;
  role: UserRole;
}

/**
 * Nota rekap tutup toko harian tersimpan & terkunci (1x per hari).
 */
export function ClosingReceipt({ transaction, role }: ClosingReceiptProps) {
  const closingItems = transaction.closingItems ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-ceashyr-green text-white text-xs font-bold flex items-center justify-center shrink-0">
          ✓
        </span>
        <div>
          <h2 className="text-base font-bold text-ceashyr-ink">
            Rekap Tutup Toko Tersimpan
          </h2>
          <p className="text-[11px] text-ceashyr-muted">
            Tercatat 1× untuk hari ini
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border divide-y divide-ceashyr-border text-xs">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">No. Rekap</span>
          <span className="font-bold text-ceashyr-ink">{transaction.code}</span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Waktu Tutup Toko</span>
          <span className="font-semibold text-ceashyr-ink">
            {formatDateTimeId(transaction.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Total Terjual</span>
          <span className="font-semibold text-ceashyr-ink">
            {transaction.totalItems} pcs
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Total Penjualan</span>
          <span className="font-bold text-sm text-ceashyr-orange">
            {formatRupiah(transaction.totalAmount, true)}
          </span>
        </div>
      </div>

      {closingItems.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-ceashyr-ink">
            Rincian Stok &amp; Penjualan Hari Ini:
          </p>
          <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border divide-y divide-ceashyr-border text-[11px]">
            {closingItems.map((item) => (
              <div
                key={item.productId}
                className="px-3 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ceashyr-ink truncate">
                    {item.name}
                  </p>
                  <p className="text-ceashyr-muted">
                    Memori {item.openingStock} → Sisa {item.remainingStock}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-ceashyr-ink">
                    {item.soldQty} pcs
                  </p>
                  <p className="text-ceashyr-orange font-semibold">
                    {formatRupiah(item.subtotal, true)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href={
          role === "ketua_kwu" ? "/laporan" : "/produk?mode=pengelola"
        }
        className="block w-full text-center py-2.5 px-4 rounded-xl bg-ceashyr-forest text-white text-xs font-semibold hover:brightness-110 transition"
      >
        {role === "ketua_kwu"
          ? "Lihat Laporan Penjualan →"
          : "Lihat Daftar Stok Terbaru →"}
      </Link>
    </div>
  );
}
