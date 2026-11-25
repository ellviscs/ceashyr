"use client";

import React from "react";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import type { Transaction } from "@/types";

interface TransactionReceiptProps {
  transaction: Transaction;
  onNewSale: () => void;
}

/**
 * Ringkasan nota transaksi tersimpan setelah kasir menyimpan penjualan (US-05).
 */
export function TransactionReceipt({
  transaction,
  onNewSale,
}: TransactionReceiptProps) {
  return (
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
            {transaction.code}
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Waktu</span>
          <span className="font-semibold text-ceashyr-ink">
            {formatDateTimeId(transaction.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Jumlah Item</span>
          <span className="font-semibold text-ceashyr-ink">
            {transaction.totalItems} pcs
          </span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-ceashyr-muted">Total Bayar</span>
          <span className="font-bold text-sm text-ceashyr-orange">
            {formatRupiah(transaction.totalAmount, true)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewSale}
        className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
      >
        Catat Penjualan Baru
      </button>
    </div>
  );
}
