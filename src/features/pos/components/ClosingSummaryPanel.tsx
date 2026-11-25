"use client";

import React, { useState } from "react";
import type { DailyClosingRow } from "@/features/pos/hooks/useDailyClosing";
import { formatDateLongId, formatRupiah } from "@/lib/formatters";
import { parseLocalDateKey } from "@/lib/reports/sales-report";

interface ClosingSummaryPanelProps {
  todayKey: string;
  soldRows: DailyClosingRow[];
  totalSoldItems: number;
  totalRevenue: number;
  hasValidationErrors: boolean;
  isSaving: boolean;
  onResetDraft: () => void;
  onSubmit: () => Promise<boolean>;
}

/**
 * Panel ringkasan rekap penjualan tutup toko harian sebelum disimpan (1x per hari).
 */
export function ClosingSummaryPanel({
  todayKey,
  soldRows,
  totalSoldItems,
  totalRevenue,
  hasValidationErrors,
  isSaving,
  onResetDraft,
  onSubmit,
}: ClosingSummaryPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const formattedDate = formatDateLongId(parseLocalDateKey(todayKey));
  const canSubmit =
    soldRows.length > 0 && !hasValidationErrors && !isSaving;

  const handleConfirmSubmit = async () => {
    const ok = await onSubmit();
    if (ok) {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ceashyr-ink">
            Rekap Tutup Toko ({totalSoldItems} pcs)
          </h2>
          <p className="text-[11px] text-ceashyr-muted mt-0.5">
            {formattedDate}
          </p>
        </div>

        {soldRows.length > 0 && !confirming && (
          <button
            type="button"
            onClick={onResetDraft}
            className="text-[11px] font-semibold text-ceashyr-muted hover:text-ceashyr-ink underline shrink-0"
          >
            Reset Input
          </button>
        )}
      </div>

      {soldRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ceashyr-border bg-ceashyr-field p-5 text-center space-y-1">
          <p className="text-xs font-semibold text-ceashyr-ink">
            Belum ada perubahan sisa stok
          </p>
          <p className="text-xs text-ceashyr-muted leading-relaxed">
            Isi jumlah sisa stok fisik di kiri untuk menghitung otomatis barang
            terjual hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {soldRows.map((row) => (
            <div
              key={row.product.id}
              className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3 space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-ceashyr-ink truncate">
                  {row.product.name}
                </p>
                <p className="text-xs font-bold text-ceashyr-orange shrink-0">
                  {formatRupiah(row.subtotal, true)}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-ceashyr-muted">
                <span>
                  Stok {row.openingStock} → Sisa {row.remainingStock}
                </span>
                <span className="font-semibold text-ceashyr-ink">
                  Terjual {row.soldQty} × {formatRupiah(row.product.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-3.5 py-2.5 text-[11px] leading-relaxed">
        <strong>Aturan Tutup Toko:</strong> Pencatatan dilakukan{" "}
        <strong>1 kali sehari</strong> sebelum toko ditutup dan langsung
        memperbarui stok akhir di sistem.
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ceashyr-border">
        <div>
          <p className="text-xs font-semibold text-ceashyr-ink">
            Total Penjualan Hari Ini
          </p>
          <p className="text-[11px] text-ceashyr-muted">
            {soldRows.length} produk • {totalSoldItems} pcs terjual
          </p>
        </div>
        <p className="text-lg font-bold text-ceashyr-ink">
          {formatRupiah(totalRevenue, true)}
        </p>
      </div>

      {confirming ? (
        <div className="rounded-xl bg-ceashyr-peach border border-ceashyr-orange p-3.5 space-y-3">
          <p className="text-xs font-semibold text-ceashyr-ink leading-relaxed">
            Yakin simpan rekap penjualan tutup toko hari ini? Setelah disimpan,
            stok memori diperbarui dan tidak bisa dicatat ulang hari ini.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setConfirming(false)}
              className="h-10 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
            >
              Periksa Lagi
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleConfirmSubmit}
              className="h-10 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Ya, Tutup Toko"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => setConfirming(true)}
          className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Simpan Penjualan &amp; Tutup Toko
        </button>
      )}
    </div>
  );
}

interface MobileClosingFloatingBarProps {
  totalSoldItems: number;
  totalRevenue: number;
  onScrollToSummary: () => void;
}

/**
 * Ringkasan tutup toko mengambang khusus layar HP (< 1024px).
 */
export function MobileClosingFloatingBar({
  totalSoldItems,
  totalRevenue,
  onScrollToSummary,
}: MobileClosingFloatingBarProps) {
  return (
    <div className="lg:hidden fixed bottom-[68px] inset-x-3 z-30 rounded-2xl bg-ceashyr-forest text-white px-4 py-3 shadow-ceashyr-card flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] text-ceashyr-forest-sub">
          {totalSoldItems} pcs terjual hari ini
        </p>
        <p className="text-sm font-bold">{formatRupiah(totalRevenue, true)}</p>
      </div>
      <button
        type="button"
        onClick={onScrollToSummary}
        className="px-3.5 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold"
      >
        Lihat / Tutup Toko ↓
      </button>
    </div>
  );
}
