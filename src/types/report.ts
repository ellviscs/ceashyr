/**
 * Rentang periode laporan penjualan untuk Ketua KWU (US-15).
 */
export type ReportPeriodType = "daily" | "weekly";

/**
 * Sumber baris penjualan dalam laporan (Kasir POS atau Rekap Kertas OCR tersimpan).
 */
export type SalesReportSource = "kasir" | "ocr";

/**
 * Item penjualan ter-normalisasi pada entri laporan.
 */
export interface SalesReportEntryItem {
  productId?: string;
  productName: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

/**
 * Satu entri transaksi atau rekap OCR dalam laporan penjualan.
 */
export interface SalesReportEntry {
  id: string;
  code: string;
  source: SalesReportSource;
  createdAt: string;
  dateKey: string;
  actorLabel: string;
  items: SalesReportEntryItem[];
  totalItems: number;
  totalAmount: number;
}

/**
 * Rekap penjualan teragregasi per produk pada periode laporan.
 */
export interface SalesProductRecap {
  key: string;
  productId?: string;
  productName: string;
  unitPrice: number;
  qtySold: number;
  subtotal: number;
  revenueSharePct: number;
}

/**
 * Agregasi penjualan per hari kalender (1 hari untuk harian, 7 hari Senin-Minggu untuk mingguan).
 */
export interface SalesDailyBucket {
  dateKey: string;
  shortDayLabel: string;
  fullDateLabel: string;
  transactionCount: number;
  totalItems: number;
  totalAmount: number;
  isPeak: boolean;
}

/**
 * Struktur data lengkap Laporan Penjualan (US-15) siap render UI dan ekspor PDF/CSV.
 */
export interface SalesReportData {
  reportId: string;
  periodType: ReportPeriodType;
  anchorDateKey: string;
  startDateKey: string;
  endDateKey: string;
  periodTitle: string;
  shortPeriodLabel: string;
  weekLabel?: string;
  fileBaseName: string;
  includeOcrReports: boolean;
  generatedAt: string;
  generatedByName: string;
  generatedByEmail: string;
  isEmpty: boolean;
  totalRevenue: number;
  totalTransactions: number;
  totalItemsSold: number;
  averagePerTransaction: number;
  activeDaysCount: number;
  averagePerActiveDay: number;
  topProduct: SalesProductRecap | null;
  peakDay: SalesDailyBucket | null;
  entries: SalesReportEntry[];
  productRecap: SalesProductRecap[];
  dailyBuckets: SalesDailyBucket[];
}
