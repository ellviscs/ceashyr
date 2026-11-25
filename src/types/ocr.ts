/**
 * Baris hasil pembacaan OCR dari foto laporan kertas (US-16).
 */
export interface OcrExtractedItem {
  id: string;
  productName: string;
  matchedProductId?: string;
  qtySold: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Status siklus pemrosesan foto laporan kertas pada antrean lokal & OCR.
 */
export type OcrReportStatus = "queued_offline" | "processed" | "saved";

/**
 * Rekap foto laporan kertas (online maupun antrean offline IndexedDB/localStorage).
 */
export interface OcrReportRecord {
  id: string;
  code: string;
  fileName: string;
  imagePreviewUrl?: string;
  status: OcrReportStatus;
  items: OcrExtractedItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  syncedAt?: string;
  notes?: string;
}

/**
 * Sampel preset laporan kertas untuk pengujian US-16 dan simulasi OCR offline-first.
 */
export interface OcrSamplePreset {
  key: string;
  title: string;
  fileName: string;
  rawText: string;
  accuracyLabel: string;
  items: OcrExtractedItem[];
}

/**
 * Output terstruktur dari proses ekstraksi OCR (preset atau file gambar).
 */
export interface OcrScanResult {
  fileName: string;
  rawText: string;
  items: OcrExtractedItem[];
  previewUrl?: string;
  presetKey?: string;
}
