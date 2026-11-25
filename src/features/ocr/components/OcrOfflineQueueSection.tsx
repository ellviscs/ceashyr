"use client";

import React from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatDateTimeId } from "@/lib/formatters";
import type { OcrReportRecord } from "@/types";

interface OcrOfflineQueueSectionProps {
  queue: OcrReportRecord[];
  isOffline: boolean;
  onProcessQueue: (recordId?: string) => void;
}

/**
 * Daftar antrean foto offline lokal beserta status sinkronisasi perangkat (Task H-11).
 */
export function OcrOfflineQueueSection({
  queue,
  isOffline,
  onProcessQueue,
}: OcrOfflineQueueSectionProps) {
  if (queue.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <SurfaceCard as="section" className="lg:col-span-8 p-5 md:p-6 space-y-3">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Antrean Foto Offline — Penyimpanan Lokal
        </h2>

        <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-2.5 text-xs font-medium">
          ⚠️ Saat WiFi Bermasalah: Foto disimpan otomatis di perangkat agar data
          tidak hilang.
        </div>

        {!isOffline && (
          <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-2.5 text-xs font-medium">
            ✓ Koneksi Kembali Normal! {queue.length} foto laporan siap diproses
            ke data digital.
          </div>
        )}

        <div className="space-y-2.5">
          {queue.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-ceashyr-ink">
                  {rec.fileName}
                </p>
                <p className="text-[11px] text-ceashyr-muted mt-0.5">
                  {formatDateTimeId(rec.createdAt)} • {rec.notes}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onProcessQueue(rec.id)}
                className="px-3.5 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
              >
                Proses Sekarang
              </button>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard as="aside" className="lg:col-span-4 p-5 md:p-6 space-y-3">
        <h2 className="text-base font-bold text-ceashyr-ink">
          Status Sinkronisasi Perangkat
        </h2>
        <span className="inline-flex px-3 py-1 rounded-full bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green text-xs font-semibold">
          Penyimpanan Lokal Aktif
        </span>
        <p className="text-lg font-bold text-ceashyr-ink">
          {queue.length} Foto Tersimpan Aman
        </p>
        <p className="text-xs text-ceashyr-muted">
          Semua foto di antrean lokal siap dikonversi ke data digital begitu
          koneksi stabil.
        </p>
        <button
          type="button"
          onClick={() => onProcessQueue()}
          className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
        >
          Proses Semua Antrean ({queue.length})
        </button>
      </SurfaceCard>
    </div>
  );
}
