/**
 * Kunci standar `localStorage` untuk persistensi data lokal-first PWA Ceashyr.
 * Seluruh key diberi prefix versi `ceashyr:v1:` agar aman terhadap perubahan skema di masa depan.
 */
export const STORAGE_KEYS = {
  SESSION: "ceashyr:v1:session",
  EXTRA_ACCOUNTS: "ceashyr:v1:extra_accounts",
  PRODUCTS: "ceashyr:v1:products",
  TRANSACTIONS: "ceashyr:v1:transactions",
  OCR_QUEUE: "ceashyr:v1:ocr_queue",
  OCR_REPORTS: "ceashyr:v1:ocr_reports",
} as const;
