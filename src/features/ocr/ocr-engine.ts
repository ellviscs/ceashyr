import { SAMPLE_OCR_PRESETS } from "@/constants/seed-data";
import type { OcrScanResult } from "@/types";

/**
 * Kontrak engine ekstraksi OCR untuk foto laporan kertas.
 * Ganti implementasi `ocrEngine` di bawah untuk beralih ke Tesseract.js / Cloud Vision API.
 */
export interface OcrEngine {
  extractFromPreset(presetKey: string): OcrScanResult;
  extractFromFile(
    file: File,
    fallbackPresetKey?: string
  ): Promise<OcrScanResult>;
  runOcr(scan: OcrScanResult): Promise<OcrScanResult>;
}

function readFileAsDataUrl(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : undefined);
    };
    reader.onerror = () => {
      resolve(undefined);
    };
    reader.readAsDataURL(file);
  });
}

function resolvePreset(presetKey?: string) {
  return (
    SAMPLE_OCR_PRESETS.find((p) => p.key === presetKey) ?? SAMPLE_OCR_PRESETS[0]
  );
}

/**
 * Implementasi simulasi OCR Sprint 1 berbasis preset sampel lokal.
 */
export const mockOcrEngine: OcrEngine = {
  extractFromPreset(presetKey: string): OcrScanResult {
    const preset = resolvePreset(presetKey);
    return {
      fileName: preset.fileName,
      rawText: preset.rawText,
      items: preset.items.map((item) => ({ ...item })),
      previewUrl: undefined,
      presetKey: preset.key,
    };
  },

  async extractFromFile(
    file: File,
    fallbackPresetKey?: string
  ): Promise<OcrScanResult> {
    const preset = resolvePreset(fallbackPresetKey);
    const previewUrl = await readFileAsDataUrl(file);
    return {
      fileName: file.name,
      rawText: preset.rawText,
      items: preset.items.map((item) => ({ ...item })),
      previewUrl,
      presetKey: preset.key,
    };
  },

  async runOcr(scan: OcrScanResult): Promise<OcrScanResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ...scan,
      items: scan.items.map((item) => ({ ...item })),
    };
  },
};

/**
 * Engine OCR aktif aplikasi. Tukar dengan implementasi real OCR tanpa mengubah komponen UI.
 */
export const ocrEngine: OcrEngine = mockOcrEngine;
