import {
  SAMPLE_OCR_PRESETS,
  SEED_OCR_REPORTS,
  SEED_OFFLINE_OCR_QUEUE,
} from "@/constants/seed-data";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import type { OcrRepository } from "@/services/contracts";
import type { OcrExtractedItem, OcrReportRecord } from "@/types";
import { createId, readJson, writeJson } from "./storage-client";

export function getOcrQueueSync(): OcrReportRecord[] {
  return readJson<OcrReportRecord[]>(
    STORAGE_KEYS.OCR_QUEUE,
    SEED_OFFLINE_OCR_QUEUE
  );
}

export function getOcrReportsSync(): OcrReportRecord[] {
  return readJson<OcrReportRecord[]>(
    STORAGE_KEYS.OCR_REPORTS,
    SEED_OCR_REPORTS
  );
}

export function enqueueOfflineOcrSync(
  fileName: string,
  presetKey?: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  const preset =
    SAMPLE_OCR_PRESETS.find((p) => p.key === presetKey) ?? SAMPLE_OCR_PRESETS[0];
  const items: OcrExtractedItem[] = preset.items.map((item) => ({ ...item }));
  const totalItems = items.reduce((s, x) => s + x.qtySold, 0);
  const totalAmount = items.reduce((s, x) => s + x.subtotal, 0);

  const queue = getOcrQueueSync();
  const record: OcrReportRecord = {
    id: createId("qocr"),
    code: `QUE-${String(queue.length + 1).padStart(4, "0")}`,
    fileName: fileName || preset.fileName,
    imagePreviewUrl,
    status: "queued_offline",
    items,
    totalItems,
    totalAmount,
    createdAt: new Date().toISOString(),
    notes: "Menunggu Proses OCR (Disimpan lokal saat WiFi bermasalah)",
  };

  writeJson(STORAGE_KEYS.OCR_QUEUE, [record, ...queue]);
  return record;
}

export function processOcrQueueSync(recordId?: string): OcrReportRecord[] {
  const queue = getOcrQueueSync();
  const reports = getOcrReportsSync();
  const now = new Date().toISOString();

  const toProcess = recordId ? queue.filter((q) => q.id === recordId) : queue;
  const remaining = recordId ? queue.filter((q) => q.id !== recordId) : [];

  const converted: OcrReportRecord[] = toProcess.map((rec, idx) => ({
    ...rec,
    code: `RKP-${String(reports.length + idx + 1).padStart(4, "0")}`,
    status: "saved",
    syncedAt: now,
    notes: "Diproses otomatis dari antrean offline",
  }));

  writeJson(STORAGE_KEYS.OCR_QUEUE, remaining);
  if (converted.length > 0) {
    writeJson(STORAGE_KEYS.OCR_REPORTS, [...converted, ...reports]);
  }
  return remaining;
}

export function saveDigitalOcrReportSync(
  items: OcrExtractedItem[],
  fileName: string,
  imagePreviewUrl?: string
): OcrReportRecord {
  const reports = getOcrReportsSync();
  const normalizedItems = items.map((item) => ({
    ...item,
    subtotal: Math.max(0, item.qtySold) * item.unitPrice,
  }));
  const totalItems = normalizedItems.reduce((s, x) => s + x.qtySold, 0);
  const totalAmount = normalizedItems.reduce((s, x) => s + x.subtotal, 0);

  const saved: OcrReportRecord = {
    id: createId("rkp"),
    code: `RKP-${String(reports.length + 1).padStart(4, "0")}`,
    fileName,
    imagePreviewUrl,
    status: "saved",
    items: normalizedItems,
    totalItems,
    totalAmount,
    createdAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  };

  writeJson(STORAGE_KEYS.OCR_REPORTS, [saved, ...reports]);
  return saved;
}

/**
 * Implementasi OcrRepository berbasis localStorage.
 */
export const localOcrRepository: OcrRepository = {
  async listQueue() {
    return getOcrQueueSync();
  },
  async listReports() {
    return getOcrReportsSync();
  },
  async enqueueOffline(fileName, presetKey, imagePreviewUrl) {
    return enqueueOfflineOcrSync(fileName, presetKey, imagePreviewUrl);
  },
  async processQueue(recordId) {
    return processOcrQueueSync(recordId);
  },
  async saveReport(items, fileName, imagePreviewUrl) {
    return saveDigitalOcrReportSync(items, fileName, imagePreviewUrl);
  },
};
