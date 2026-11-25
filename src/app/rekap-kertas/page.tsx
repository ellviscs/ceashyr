"use client";

import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SAMPLE_OCR_PRESETS, SEED_PRODUCTS } from "@/constants/seed-data";
import { OcrHistorySection } from "@/features/ocr/components/OcrHistorySection";
import { OcrOfflineQueueSection } from "@/features/ocr/components/OcrOfflineQueueSection";
import { OcrReadyStep } from "@/features/ocr/components/OcrReadyStep";
import { OcrReviewStep } from "@/features/ocr/components/OcrReviewStep";
import { OcrSavedStep } from "@/features/ocr/components/OcrSavedStep";
import { OcrUploadStep } from "@/features/ocr/components/OcrUploadStep";
import { ocrEngine } from "@/features/ocr/ocr-engine";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSession } from "@/hooks/useSession";
import { dataProvider } from "@/services";
import type {
  OcrExtractedItem,
  OcrReportRecord,
  OcrSamplePreset,
  Product,
} from "@/types";

type OcrStep = "empty" | "ready" | "converted" | "saved";

/**
 * Halaman Rekap Laporan Kertas OCR & Antrean Offline (US-16 — Tasks H-09, H-10, H-11).
 * Referensi Figma: Section `1331:6426` (`1341:4836`, `1341:4923`, `1341:5010`, `1341:5098`, `1341:5178`).
 */
export default function RekapKertasPage() {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const { role, email } = useSession({ fallbackRole: "pengelola" });
  const browserOnline = useOnlineStatus();

  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [step, setStep] = useState<OcrStep>("empty");
  const [activePresetKey, setActivePresetKey] = useState<string>(
    SAMPLE_OCR_PRESETS[0].key
  );
  const [activeFileName, setActiveFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [rawText, setRawText] = useState("");
  const [extractedItems, setExtractedItems] = useState<OcrExtractedItem[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [queue, setQueue] = useState<OcrReportRecord[]>([]);
  const [reports, setReports] = useState<OcrReportRecord[]>([]);
  const [lastSavedReport, setLastSavedReport] =
    useState<OcrReportRecord | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      dataProvider.products.list(),
      dataProvider.ocr.listQueue(),
      dataProvider.ocr.listReports(),
    ]).then(([loadedProducts, loadedQueue, loadedReports]) => {
      if (!active) return;
      setProducts(loadedProducts);
      setQueue(loadedQueue);
      setReports(loadedReports);
    });
    return () => {
      active = false;
    };
  }, []);

  const isOffline = simulatedOffline || !browserOnline;

  const handleSelectPreset = (preset: OcrSamplePreset) => {
    setStatusNotice(null);
    const scan = ocrEngine.extractFromPreset(preset.key);
    setActivePresetKey(scan.presetKey ?? preset.key);
    setActiveFileName(scan.fileName);
    setPreviewUrl(scan.previewUrl);
    setRawText(scan.rawText);
    setExtractedItems(scan.items);
    setStep("ready");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusNotice(null);

    const scan = await ocrEngine.extractFromFile(
      file,
      SAMPLE_OCR_PRESETS[0].key
    );
    setActivePresetKey(scan.presetKey ?? SAMPLE_OCR_PRESETS[0].key);
    setActiveFileName(scan.fileName);
    setPreviewUrl(scan.previewUrl);
    setRawText(scan.rawText);
    setExtractedItems(scan.items);
    setStep("ready");
    e.target.value = "";
  };

  const handleSaveOfflineQueue = async (autoFromOcr = false) => {
    await dataProvider.ocr.enqueueOffline(
      activeFileName,
      activePresetKey,
      previewUrl
    );
    const updatedQueue = await dataProvider.ocr.listQueue();
    setQueue(updatedQueue);
    setStep("empty");
    setActiveFileName("");
    setPreviewUrl(undefined);
    setStatusNotice(
      autoFromOcr
        ? "WiFi sedang bermasalah — foto otomatis disimpan ke Antrean Offline Lokal agar data tidak hilang."
        : "Foto laporan berhasil disimpan ke Antrean Offline Lokal perangkat."
    );
  };

  const handleRunOcr = async () => {
    if (step !== "ready") return;
    if (isOffline) {
      await handleSaveOfflineQueue(true);
      return;
    }

    setIsProcessingOcr(true);
    setStatusNotice(null);
    try {
      const processed = await ocrEngine.runOcr({
        fileName: activeFileName,
        rawText,
        items: extractedItems,
        previewUrl,
        presetKey: activePresetKey,
      });
      setExtractedItems(processed.items);
      setRawText(processed.rawText);
      setStep("converted");
    } finally {
      setIsProcessingOcr(false);
    }
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

  const handleSaveDigitalReport = async () => {
    setIsSavingReport(true);
    try {
      const saved = await dataProvider.ocr.saveReport(
        extractedItems,
        activeFileName,
        previewUrl
      );
      const updatedReports = await dataProvider.ocr.listReports();
      setLastSavedReport(saved);
      setReports(updatedReports);
      setStep("saved");
      setStatusNotice(null);
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleProcessQueue = async (recordId?: string) => {
    if (isOffline) {
      setStatusNotice(
        "Koneksi masih offline. Aktifkan mode WiFi Normal terlebih dahulu untuk memproses antrean."
      );
      return;
    }
    const [remaining, updatedReports] = await Promise.all([
      dataProvider.ocr.processQueue(recordId),
      dataProvider.ocr.listReports(),
    ]);
    setQueue(remaining);
    setReports(updatedReports);
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
          <StatusBanner variant={isOffline ? "warning" : "success"}>
            {statusNotice}
          </StatusBanner>
        )}

        {step === "empty" && (
          <OcrUploadStep
            products={products}
            onPickCamera={() => cameraInputRef.current?.click()}
            onPickGallery={() => galleryInputRef.current?.click()}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {step === "ready" && (
          <OcrReadyStep
            fileName={activeFileName}
            previewUrl={previewUrl}
            rawText={rawText}
            products={products}
            isProcessingOcr={isProcessingOcr}
            onPickCamera={() => cameraInputRef.current?.click()}
            onPickGallery={() => galleryInputRef.current?.click()}
            onRunOcr={handleRunOcr}
            onSaveOfflineQueue={() => handleSaveOfflineQueue(false)}
          />
        )}

        {step === "converted" && (
          <OcrReviewStep
            extractedItems={extractedItems}
            rawText={rawText}
            totalItems={totalExtractedItems}
            totalAmount={totalExtractedAmount}
            isSaving={isSavingReport}
            onAdjustQty={handleAdjustOcrQty}
            onSaveDigitalReport={handleSaveDigitalReport}
          />
        )}

        {step === "saved" && lastSavedReport && (
          <OcrSavedStep
            products={products}
            savedReport={lastSavedReport}
            onResetUpload={handleResetUpload}
          />
        )}

        <OcrOfflineQueueSection
          queue={queue}
          isOffline={isOffline}
          onProcessQueue={handleProcessQueue}
        />

        <OcrHistorySection reports={reports} />
      </div>
    </AppShell>
  );
}
