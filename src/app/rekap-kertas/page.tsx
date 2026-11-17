"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SAMPLE_OCR_PRESETS, SEED_PRODUCTS } from "@/constants/seed-data";
import { formatDateTimeId, formatRupiah } from "@/lib/formatters";
import {
  enqueueOfflineOcr,
  getOcrQueue,
  getOcrReports,
  getProducts,
  getSession,
  processOcrQueue,
  saveDigitalOcrReport,
} from "@/lib/storage/repository";
import type {
  OcrExtractedItem,
  OcrReportRecord,
  OcrSamplePreset,
  Product,
  UserRole,
} from "@/types";

type OcrStep = "empty" | "ready" | "converted" | "saved";

/**
 * Halaman Rekap Laporan Kertas OCR & Antrean Offline (US-16 — Tasks H-09, H-10, H-11).
 * Referensi Figma: Section `1331:6426` (`1341:4836`, `1341:4923`, `1341:5010`, `1341:5098`, `1341:5178`).
 */
export default function RekapKertasPage() {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [role, setRole] = useState<UserRole>("pengelola");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);

  const [step, setStep] = useState<OcrStep>("empty");
  const [activePreset, setActivePreset] = useState<OcrSamplePreset>(
    SAMPLE_OCR_PRESETS[0]
  );
  const [activeFileName, setActiveFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [rawText, setRawText] = useState("");
  const [extractedItems, setExtractedItems] = useState<OcrExtractedItem[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [browserOnline, setBrowserOnline] = useState(true);

  const [queue, setQueue] = useState<OcrReportRecord[]>([]);
  const [reports, setReports] = useState<OcrReportRecord[]>([]);
  const [lastSavedReport, setLastSavedReport] =
    useState<OcrReportRecord | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setRole(session.role);
      setEmail(session.email);
    }
    setProducts(getProducts());
    setQueue(getOcrQueue());
    setReports(getOcrReports());

    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    setBrowserOnline(online);
    const onOnline = () => setBrowserOnline(true);
    const onOffline = () => setBrowserOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const isOffline = simulatedOffline || !browserOnline;

  const handleSelectPreset = (preset: OcrSamplePreset) => {
    setStatusNotice(null);
    setActivePreset(preset);
    setActiveFileName(preset.fileName);
    setPreviewUrl(undefined);
    setRawText(preset.rawText);
    setExtractedItems(preset.items.map((item) => ({ ...item })));
    setStep("ready");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusNotice(null);

    const fallbackPreset = SAMPLE_OCR_PRESETS[0];
    setActivePreset(fallbackPreset);
    setActiveFileName(file.name);
    setRawText(fallbackPreset.rawText);
    setExtractedItems(fallbackPreset.items.map((item) => ({ ...item })));

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
      setStep("ready");
    };
    reader.onerror = () => {
      setPreviewUrl(undefined);
      setStep("ready");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveOfflineQueue = (autoFromOcr = false) => {
    enqueueOfflineOcr(
      activeFileName || activePreset.fileName,
      activePreset.key,
      previewUrl
    );
    setQueue(getOcrQueue());
    setStep("empty");
    setActiveFileName("");
    setPreviewUrl(undefined);
    setStatusNotice(
      autoFromOcr
        ? "WiFi sedang bermasalah — foto otomatis disimpan ke Antrean Offline Lokal agar data tidak hilang."
        : "Foto laporan berhasil disimpan ke Antrean Offline Lokal perangkat."
    );
  };

  const handleRunOcr = () => {
    if (step !== "ready") return;
    if (isOffline) {
      handleSaveOfflineQueue(true);
      return;
    }

    setIsProcessingOcr(true);
    setStatusNotice(null);
    setTimeout(() => {
      setIsProcessingOcr(false);
      setStep("converted");
    }, 400);
  };

  const handleAdjustOcrQty = (itemId: string, delta: number) => {
    setExtractedItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextQty = Math.max(0, item.qtySold + delta);
        return {
          ...item,
          qtySold: nextQty,
          subtotal: nextQty * item.unitPrice,
        };
      })
    );
  };

  const handleSaveDigitalReport = () => {
    const saved = saveDigitalOcrReport(
      extractedItems,
      activeFileName || activePreset.fileName,
      previewUrl
    );
    setLastSavedReport(saved);
    setReports(getOcrReports());
    setStep("saved");
    setStatusNotice(null);
  };

  const handleProcessQueue = (recordId?: string) => {
    if (isOffline) {
      setStatusNotice(
        "Koneksi masih offline. Aktifkan mode WiFi Normal terlebih dahulu untuk memproses antrean."
      );
      return;
    }
    const remaining = processOcrQueue(recordId);
    setQueue(remaining);
    setReports(getOcrReports());
    setStatusNotice(
      recordId
        ? "1 foto dari antrean offline berhasil dikonversi dan disimpan ke rekap digital."
        : "Seluruh foto di antrean offline berhasil diproses dan disimpan ke rekap digital."
    );
  };

  const handleResetUpload = () => {
    setStep("empty");
    setActiveFileName("");
    setPreviewUrl(undefined);
    setLastSavedReport(null);
    setStatusNotice(null);
  };

  const totalExtractedItems = extractedItems.reduce(
    (sum, item) => sum + item.qtySold,
    0
  );
  const totalExtractedAmount = extractedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  return (
    <AppShell
      role={role}
      activeNav="rekap"
      email={email}
      title="Rekap Laporan Kertas (OCR)"
      headerRightSlot={
        <button
          type="button"
          onClick={() => setSimulatedOffline((prev) => !prev)}
          className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition ${
            isOffline
              ? "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
              : "bg-ceashyr-green-soft border-ceashyr-green text-ceashyr-green"
          }`}
        >
          {isOffline
            ? "Simulasi WiFi Bermasalah (Offline)"
            : "WiFi Normal (Online)"}
        </button>
      }
    >
      {/* Hidden native inputs untuk Kamera & Galeri */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="space-y-5">
        {statusNotice && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-xs md:text-sm font-medium ${
              isOffline
                ? "bg-ceashyr-amber-bg border-ceashyr-amber-border text-ceashyr-amber-ink"
                : "bg-ceashyr-green-soft border-ceashyr-green text-ceashyr-green"
            }`}
          >
            {statusNotice}
          </div>
        )}

        {/* STATE 1: EMPTY UPLOAD (1341:4836) */}
        {step === "empty" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                1. Ambil / Unggah Foto Laporan Kertas
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-10 px-3 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
                >
                  Ambil Foto
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="h-10 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
                >
                  Pilih Galeri
                </button>
              </div>

              <div className="rounded-xl border border-dashed border-ceashyr-border bg-ceashyr-field p-6 text-center space-y-1.5">
                <p className="text-xs font-bold text-ceashyr-ink">
                  Belum ada foto laporan
                </p>
                <p className="text-xs text-ceashyr-muted leading-relaxed">
                  Ambil foto catatan penjualan harian di kertas atau pilih dari galeri HP untuk diubah menjadi data digital (OCR).
                </p>
              </div>

              <div className="pt-2 border-t border-ceashyr-border space-y-2">
                <p className="text-[11px] font-semibold text-ceashyr-muted">
                  Uji Contoh Foto Laporan (3 Sampel Preset):
                </p>
                <div className="space-y-1.5">
                  {SAMPLE_OCR_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white border border-ceashyr-border text-xs font-medium text-ceashyr-ink hover:border-ceashyr-orange hover:bg-ceashyr-peach/30 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                2. Katalog &amp; Preview Konversi Digital
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {products.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="h-[120px] rounded-[16px] bg-ceashyr-forest p-4 flex flex-col justify-between text-white"
                  >
                    <span className="text-sm font-semibold line-clamp-2">
                      {p.name}
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ceashyr-forest-sub">
                        {formatRupiah(p.price)}
                      </span>
                      <span className="font-semibold">0 pcs</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-ceashyr-border">
                <span className="text-xs font-semibold text-ceashyr-ink">
                  Total Rekap Digital (0 item)
                </span>
                <span className="text-base font-bold text-ceashyr-ink">
                  Rp 0
                </span>
              </div>
            </section>
          </div>
        )}

        {/* STATE 2: FOTO SIAP DIPROSES (1341:4923) */}
        {step === "ready" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-ceashyr-ink">
                  1. Foto Laporan Terpilih
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-ceashyr-green-soft text-ceashyr-green text-[11px] font-bold">
                  Foto Siap
                </span>
              </div>

              <p className="text-xs text-ceashyr-muted">{activeFileName}</p>

              {previewUrl && (
                <div className="rounded-xl overflow-hidden border border-ceashyr-border bg-white max-h-48">
                  <img
                    src={previewUrl}
                    alt={activeFileName}
                    className="w-full h-44 object-contain"
                  />
                </div>
              )}

              <pre className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 text-[11px] text-ceashyr-ink whitespace-pre-wrap font-mono leading-relaxed">
                {rawText}
              </pre>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
                >
                  Ganti via Kamera
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-white border border-ceashyr-border text-ceashyr-orange text-xs font-semibold hover:bg-ceashyr-peach/40 transition"
                >
                  Pilih Ulang Galeri
                </button>
              </div>
            </section>

            <section className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                2. Siap Dikonversi ke Data Digital
              </h2>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleRunOcr}
                  disabled={isProcessingOcr}
                  className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-60"
                >
                  {isProcessingOcr
                    ? "Membaca Teks Foto (OCR)..."
                    : "Baca Teks Foto (OCR)"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveOfflineQueue(false)}
                  className="w-full h-10 rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold hover:brightness-95 transition"
                >
                  Simpan ke Antrean Offline (Jika WiFi Bermasalah)
                </button>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-ceashyr-ink">
                  Referensi Produk Kantin ({products.length} Produk)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {products.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="h-[110px] rounded-[16px] bg-ceashyr-forest p-3.5 flex flex-col justify-between text-white"
                    >
                      <span className="text-xs font-semibold line-clamp-2">
                        {p.name}
                      </span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ceashyr-forest-sub">
                          {formatRupiah(p.price)}
                        </span>
                        <span className="font-semibold">Stok {p.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STATE 3: HASIL KONVERSI OCR & KOREKSI (1341:5010) */}
        {step === "converted" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                Hasil Konversi OCR ({extractedItems.length} Produk Terbaca)
              </h2>

              <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-2.5 text-xs font-medium">
                ✓ OCR Selesai: {extractedItems.length} baris barang berhasil dikonversi menjadi data digital
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {extractedItems.map((item) => (
                  <div
                    key={item.id}
                    className="h-[120px] rounded-[16px] bg-ceashyr-forest p-4 flex flex-col justify-between text-white"
                  >
                    <span className="text-sm font-semibold line-clamp-2">
                      {item.productName}
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ceashyr-forest-sub">
                        {formatRupiah(item.unitPrice)}
                      </span>
                      <span className="font-bold">{item.qtySold} pcs</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 space-y-1">
                <p className="text-xs font-bold text-ceashyr-ink">
                  Teks Terbaca Otomatis:
                </p>
                <p className="text-xs text-ceashyr-muted whitespace-pre-wrap">
                  {rawText}
                </p>
              </div>
            </section>

            <aside className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                Koreksi &amp; Simpan Rekap Digital
              </h2>

              <div className="space-y-2.5">
                {extractedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ceashyr-ink truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-ceashyr-muted">
                        {item.qtySold} × {formatRupiah(item.unitPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAdjustOcrQty(item.id, -1)}
                        aria-label={`Kurangi ${item.productName}`}
                        className="w-7 h-7 rounded-lg bg-white border border-ceashyr-border text-xs font-bold"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs font-bold">
                        {item.qtySold}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustOcrQty(item.id, 1)}
                        aria-label={`Tambah ${item.productName}`}
                        className="w-7 h-7 rounded-lg bg-ceashyr-orange text-white text-xs font-bold"
                      >
                        +
                      </button>
                      <span className="w-20 text-right text-xs font-bold text-ceashyr-orange">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ceashyr-border">
                <span className="text-xs font-semibold text-ceashyr-ink">
                  Total Rekap ({totalExtractedItems} item)
                </span>
                <span className="text-lg font-bold text-ceashyr-ink">
                  {formatRupiah(totalExtractedAmount, true)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveDigitalReport}
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Simpan Rekap Digital
              </button>
            </aside>
          </div>
        )}

        {/* STATE 4: REKAP TERSIMPAN & UJI SAMPEL (1341:5178) */}
        {step === "saved" && lastSavedReport && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <h2 className="text-base font-bold text-ceashyr-ink">
                Hasil Uji 3 Sampel Foto Laporan &amp; Data Produk
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {products.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="h-[110px] rounded-[16px] bg-ceashyr-forest p-3.5 flex flex-col justify-between text-white"
                  >
                    <span className="text-xs font-semibold line-clamp-2">
                      {p.name}
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-ceashyr-forest-sub">
                        {formatRupiah(p.price)}
                      </span>
                      <span className="font-semibold">Stok {p.stock}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-ceashyr-ink">
                  Hasil Uji Contoh Foto Laporan (3 Sampel)
                </p>
                {SAMPLE_OCR_PRESETS.map((preset) => (
                  <div
                    key={preset.key}
                    className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-3.5 py-2 text-xs font-medium"
                  >
                    {preset.accuracyLabel}
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ceashyr-green text-white text-xs font-bold flex items-center justify-center">
                  ✓
                </span>
                <h2 className="text-base font-bold text-ceashyr-ink">
                  Rekap Kertas Tersimpan!
                </h2>
              </div>

              <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border divide-y divide-ceashyr-border text-xs">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">No. Rekap</span>
                  <span className="font-bold text-ceashyr-ink">
                    {lastSavedReport.code}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Tanggal</span>
                  <span className="font-semibold text-ceashyr-ink">
                    {formatDateTimeId(lastSavedReport.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Total Barang</span>
                  <span className="font-semibold text-ceashyr-ink">
                    {lastSavedReport.totalItems} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-ceashyr-muted">Total Rekap</span>
                  <span className="font-bold text-sm text-ceashyr-orange">
                    {formatRupiah(lastSavedReport.totalAmount, true)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetUpload}
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Unggah Foto Laporan Baru
              </button>
            </aside>
          </div>
        )}

        {/* SECTION ANTREAN OFFLINE LOKAL (1341:5098 — Task H-11) */}
        {queue.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section className="lg:col-span-8 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-3">
              <h2 className="text-base font-bold text-ceashyr-ink">
                Antrean Foto Offline — Penyimpanan Lokal
              </h2>

              <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-2.5 text-xs font-medium">
                ⚠️ Saat WiFi Bermasalah: Foto disimpan otomatis di perangkat agar data tidak hilang.
              </div>

              {!isOffline && (
                <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-2.5 text-xs font-medium">
                  ✓ Koneksi Kembali Normal! {queue.length} foto laporan siap diproses ke data digital.
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
                      onClick={() => handleProcessQueue(rec.id)}
                      className="px-3.5 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
                    >
                      Proses Sekarang
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:col-span-4 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-3">
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
                Semua foto di antrean lokal siap dikonversi ke data digital begitu koneksi stabil.
              </p>
              <button
                type="button"
                onClick={() => handleProcessQueue()}
                className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
              >
                Proses Semua Antrean ({queue.length})
              </button>
            </aside>
          </div>
        )}

        {/* RIWAYAT REKAP TERSIMPAN */}
        {reports.length > 0 && (
          <section className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-3">
            <h2 className="text-base font-bold text-ceashyr-ink">
              Riwayat Rekap Digital Tersimpan ({reports.length} Laporan)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-xl bg-ceashyr-field border border-ceashyr-border p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ceashyr-ink">
                      {rep.code}
                    </span>
                    <span className="font-bold text-ceashyr-orange">
                      {formatRupiah(rep.totalAmount, true)}
                    </span>
                  </div>
                  <p className="text-[11px] text-ceashyr-muted truncate">
                    {rep.fileName} • {rep.totalItems} pcs
                  </p>
                  <p className="text-[11px] text-ceashyr-muted">
                    {formatDateTimeId(rep.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
