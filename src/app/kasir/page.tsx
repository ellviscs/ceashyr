"use client";

import React, { useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ClosingReceipt } from "@/features/pos/components/ClosingReceipt";
import { ClosingStockCard } from "@/features/pos/components/ClosingStockCard";
import {
  ClosingSummaryPanel,
  MobileClosingFloatingBar,
} from "@/features/pos/components/ClosingSummaryPanel";
import { useDailyClosing } from "@/features/pos/hooks/useDailyClosing";
import { useSession } from "@/hooks/useSession";

/**
 * Halaman Kasir — Pencatatan Penjualan Harian via Sisa Stok Tutup Toko (US-05 & US-06).
 * Rumus: Terjual = Stok di Memori − Sisa Stok Hari Ini, dicatat 1× sebelum toko ditutup.
 */
export default function KasirPage() {
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const { role, email } = useSession({ fallbackRole: "pengelola" });
  const {
    todayKey,
    products,
    todayClosing,
    isAlreadyClosedToday,
    rows,
    soldRows,
    totalSoldItems,
    totalRevenue,
    hasValidationErrors,
    submitError,
    isSaving,
    setRemainingInput,
    stepRemaining,
    resetDraft,
    submitDailyClosing,
  } = useDailyClosing();

  return (
    <AppShell
      role={role}
      activeNav="kasir"
      email={email}
      title="Kasir — Tutup Toko & Rekap Sisa Stok"
      subtitle="Hitung penjualan harian otomatis dari selisih stok sistem dan sisa stok fisik sebelum toko ditutup (1× / hari)"
      headerRightSlot={
        <span
          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
            isAlreadyClosedToday
              ? "bg-ceashyr-green-soft border-ceashyr-green text-ceashyr-green"
              : "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
          }`}
        >
          {isAlreadyClosedToday
            ? "Sudah Tutup Toko Hari Ini"
            : "Belum Tutup Toko • 1× / Hari"}
        </span>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Daftar Produk & Input Sisa Stok Fisik Hari Ini */}
        <SurfaceCard as="section" className="lg:col-span-8 p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-ceashyr-ink">
              {isAlreadyClosedToday
                ? "Stok Akhir Tersimpan — Tutup Toko Hari Ini Selesai"
                : `Input Sisa Stok Hari Ini (${products.length} Produk)`}
            </h2>
            <span className="text-xs font-medium text-ceashyr-muted">
              Terjual = Stok Memori − Sisa Stok
            </span>
          </div>

          {isAlreadyClosedToday && todayClosing && (
            <StatusBanner variant="success">
              ✓ Penjualan hari ini ({todayClosing.code}) sudah dicatat sebelum
              tutup toko. Stok sistem telah diperbarui sesuai sisa stok fisik.
            </StatusBanner>
          )}

          {submitError && (
            <StatusBanner variant="error" className="py-2.5 text-xs">
              {submitError}
            </StatusBanner>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row) => (
              <ClosingStockCard
                key={row.product.id}
                row={row}
                locked={isAlreadyClosedToday}
                onChangeRemaining={(val) =>
                  setRemainingInput(row.product.id, val)
                }
                onStepRemaining={(delta) =>
                  stepRemaining(row.product.id, delta)
                }
              />
            ))}
          </div>
        </SurfaceCard>

        {/* Panel Kanan: Ringkasan Tutup Toko atau Nota Terkunci */}
        <div ref={summaryRef} className="lg:col-span-4">
          <SurfaceCard as="aside" className="p-5 space-y-4">
            {isAlreadyClosedToday && todayClosing ? (
              <ClosingReceipt transaction={todayClosing} role={role} />
            ) : (
              <ClosingSummaryPanel
                todayKey={todayKey}
                soldRows={soldRows}
                totalSoldItems={totalSoldItems}
                totalRevenue={totalRevenue}
                hasValidationErrors={hasValidationErrors}
                isSaving={isSaving}
                onResetDraft={resetDraft}
                onSubmit={() => submitDailyClosing(email)}
              />
            )}
          </SurfaceCard>
        </div>
      </div>

      {!isAlreadyClosedToday && totalSoldItems > 0 && (
        <MobileClosingFloatingBar
          totalSoldItems={totalSoldItems}
          totalRevenue={totalRevenue}
          onScrollToSummary={() =>
            summaryRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />
      )}
    </AppShell>
  );
}
