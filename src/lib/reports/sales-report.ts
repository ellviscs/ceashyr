import {
  formatDateLongId,
  formatDateShortId,
} from "@/lib/formatters";
import type {
  OcrReportRecord,
  ReportPeriodType,
  SalesDailyBucket,
  SalesProductRecap,
  SalesReportData,
  SalesReportEntry,
  SalesReportEntryItem,
  SessionState,
  Transaction,
} from "@/types";

const SHORT_DAY_LABELS_MON_FIRST = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
] as const;

const FULL_DAY_LABELS_SUN_FIRST = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

/**
 * Mengonversi objek Date ke string tanggal lokal `YYYY-MM-DD` tanpa pergeseran UTC.
 */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Mem-parsing kunci tanggal lokal `YYYY-MM-DD` pada jam 12:00 lokal untuk menghindari edge case DST.
 */
export function parseLocalDateKey(dateKey: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

/**
 * Menggeser tanggal lokal `YYYY-MM-DD` sebanyak `deltaDays` hari.
 */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const base = parseLocalDateKey(dateKey);
  base.setDate(base.getDate() + deltaDays);
  return toLocalDateKey(base);
}

/**
 * Menghitung tahun dan nomor minggu standar ISO-8601 (Senin sebagai awal minggu).
 */
export function getIsoWeekInfo(date: Date): { isoYear: number; isoWeek: number } {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const isoYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { isoYear, isoWeek };
}

/**
 * Menghasilkan rentang 7 hari (Senin-Minggu) beserta label untuk minggu dari `anchorDateKey`.
 */
export function getWeekRange(anchorDateKey: string): {
  startDateKey: string;
  endDateKey: string;
  dayKeys: string[];
  isoYear: number;
  isoWeek: number;
  weekLabel: string;
  periodTitle: string;
  shortPeriodLabel: string;
} {
  const anchor = parseLocalDateKey(anchorDateKey);
  const dayOfWeek = anchor.getDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate() + offsetToMonday,
    12,
    0,
    0,
    0
  );

  const dayKeys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i,
      12,
      0,
      0,
      0
    );
    dayKeys.push(toLocalDateKey(d));
  }

  const startDateKey = dayKeys[0];
  const endDateKey = dayKeys[6];
  const sunday = parseLocalDateKey(endDateKey);
  const { isoYear, isoWeek } = getIsoWeekInfo(monday);
  const weekCode = `W${String(isoWeek).padStart(2, "0")}`;
  const startShort = formatDateShortId(monday);
  const endShort = formatDateShortId(sunday);

  return {
    startDateKey,
    endDateKey,
    dayKeys,
    isoYear,
    isoWeek,
    weekLabel: `${isoYear}-${weekCode}`,
    periodTitle: `Minggu ke-${isoWeek} (${startShort} – ${endShort})`,
    shortPeriodLabel: `Minggu ${isoWeek} • ${startShort} – ${endShort}`,
  };
}

/**
 * Mencari tanggal transaksi (atau rekap OCR) terbaru sebagai pintasan navigasi pada UI.
 */
export function getLatestActivityDateKey(
  transactions: Transaction[],
  ocrReports: OcrReportRecord[] = [],
  includeOcrReports = false
): string | null {
  let latestTime = -Infinity;
  let latestKey: string | null = null;

  const inspect = (iso: string) => {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return;
    if (parsed.getTime() > latestTime) {
      latestTime = parsed.getTime();
      latestKey = toLocalDateKey(parsed);
    }
  };

  for (const trx of transactions) {
    inspect(trx.createdAt);
  }
  if (includeOcrReports) {
    for (const rep of ocrReports) {
      if (rep.status === "saved") {
        inspect(rep.createdAt);
      }
    }
  }

  return latestKey;
}

function isoToLocalDateKey(isoString: string): string | null {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  return toLocalDateKey(d);
}

function normalizeTransactionEntry(trx: Transaction): SalesReportEntry | null {
  const dateKey = isoToLocalDateKey(trx.createdAt);
  if (!dateKey) return null;

  const items: SalesReportEntryItem[] = trx.items.map((item) => {
    const qty = Math.max(0, Math.floor(item.qty));
    const unitPrice = Math.max(0, Math.round(item.unitPrice));
    return {
      productId: item.productId,
      productName: item.name,
      unitPrice,
      qty,
      subtotal: qty * unitPrice,
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: trx.id,
    code: trx.code,
    source: "kasir",
    createdAt: trx.createdAt,
    dateKey,
    actorLabel: trx.cashierEmail || "kasir@gmail.com",
    items,
    totalItems,
    totalAmount,
  };
}

function normalizeOcrEntry(rep: OcrReportRecord): SalesReportEntry | null {
  if (rep.status !== "saved") return null;
  const dateKey = isoToLocalDateKey(rep.createdAt);
  if (!dateKey) return null;

  const items: SalesReportEntryItem[] = rep.items
    .filter((item) => item.qtySold > 0)
    .map((item) => {
      const qty = Math.max(0, Math.floor(item.qtySold));
      const unitPrice = Math.max(0, Math.round(item.unitPrice));
      return {
        productId: item.matchedProductId,
        productName: item.productName,
        unitPrice,
        qty,
        subtotal: qty * unitPrice,
      };
    });

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: rep.id,
    code: rep.code,
    source: "ocr",
    createdAt: rep.createdAt,
    dateKey,
    actorLabel: rep.fileName || "Rekap Kertas OCR",
    items,
    totalItems,
    totalAmount,
  };
}

function getShortDayLabelMonFirst(date: Date): string {
  const sunIdx = date.getDay();
  const monIdx = sunIdx === 0 ? 6 : sunIdx - 1;
  return SHORT_DAY_LABELS_MON_FIRST[monIdx];
}

export interface BuildSalesReportParams {
  periodType: ReportPeriodType;
  anchorDateKey: string;
  transactions: Transaction[];
  ocrReports?: OcrReportRecord[];
  includeOcrReports?: boolean;
  session?: SessionState | null;
  now?: Date;
}

/**
 * Fungsi murni untuk menyusun rekap laporan penjualan harian atau mingguan dari data transaksi & OCR.
 */
export function buildSalesReport(params: BuildSalesReportParams): SalesReportData {
  const {
    periodType,
    anchorDateKey,
    transactions,
    ocrReports = [],
    includeOcrReports = false,
    session = null,
    now = new Date(),
  } = params;

  const normalizedAnchor = toLocalDateKey(parseLocalDateKey(anchorDateKey));
  const anchorDate = parseLocalDateKey(normalizedAnchor);

  let startDateKey = normalizedAnchor;
  let endDateKey = normalizedAnchor;
  let dayKeys = [normalizedAnchor];
  let weekLabel: string | undefined;
  let periodTitle = formatDateLongId(anchorDate);
  let shortPeriodLabel = formatDateShortId(anchorDate);
  let reportId = `LAP-H-${normalizedAnchor.replace(/-/g, "")}`;
  let fileBaseName = `laporan-penjualan-harian-${normalizedAnchor}`;

  if (periodType === "weekly") {
    const week = getWeekRange(normalizedAnchor);
    startDateKey = week.startDateKey;
    endDateKey = week.endDateKey;
    dayKeys = week.dayKeys;
    weekLabel = week.weekLabel;
    periodTitle = week.periodTitle;
    shortPeriodLabel = week.shortPeriodLabel;
    reportId = `LAP-M-${week.weekLabel.replace("-", "")}`;
    fileBaseName = `laporan-penjualan-mingguan-${week.weekLabel}`;
  }

  const candidateEntries: SalesReportEntry[] = [];
  for (const trx of transactions) {
    const entry = normalizeTransactionEntry(trx);
    if (entry) candidateEntries.push(entry);
  }
  if (includeOcrReports) {
    for (const rep of ocrReports) {
      const entry = normalizeOcrEntry(rep);
      if (entry) candidateEntries.push(entry);
    }
  }

  const filteredEntries = candidateEntries
    .filter(
      (entry) => entry.dateKey >= startDateKey && entry.dateKey <= endDateKey
    )
    .sort((a, b) => {
      const timeDiff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.code.localeCompare(b.code);
    });

  // Agregasi per produk (dikelompokkan berdasarkan produk + harga satuan agar subtotal selalu konsisten)
  const productMap = new Map<
    string,
    Omit<SalesProductRecap, "revenueSharePct">
  >();

  for (const entry of filteredEntries) {
    for (const item of entry.items) {
      if (item.qty <= 0) continue;
      const groupId = item.productId || item.productName.trim().toLowerCase();
      const key = `${groupId}::${item.unitPrice}`;
      const existing = productMap.get(key);
      if (!existing) {
        productMap.set(key, {
          key,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          qtySold: item.qty,
          subtotal: item.subtotal,
        });
      } else {
        existing.qtySold += item.qty;
        existing.subtotal += item.subtotal;
      }
    }
  }

  const totalRevenue = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalAmount,
    0
  );
  const totalTransactions = filteredEntries.length;
  const totalItemsSold = filteredEntries.reduce(
    (sum, entry) => sum + entry.totalItems,
    0
  );
  const averagePerTransaction =
    totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const productRecap: SalesProductRecap[] = Array.from(productMap.values())
    .sort((a, b) => {
      if (b.subtotal !== a.subtotal) return b.subtotal - a.subtotal;
      if (b.qtySold !== a.qtySold) return b.qtySold - a.qtySold;
      return a.productName.localeCompare(b.productName, "id-ID");
    })
    .map((item) => ({
      ...item,
      revenueSharePct:
        totalRevenue > 0
          ? Math.round((item.subtotal / totalRevenue) * 1000) / 10
          : 0,
    }));

  // Agregasi bucket harian
  const bucketTotals = new Map<
    string,
    { transactionCount: number; totalItems: number; totalAmount: number }
  >();
  for (const entry of filteredEntries) {
    const prev = bucketTotals.get(entry.dateKey) ?? {
      transactionCount: 0,
      totalItems: 0,
      totalAmount: 0,
    };
    prev.transactionCount += 1;
    prev.totalItems += entry.totalItems;
    prev.totalAmount += entry.totalAmount;
    bucketTotals.set(entry.dateKey, prev);
  }

  let maxDayAmount = 0;
  for (const key of dayKeys) {
    const amt = bucketTotals.get(key)?.totalAmount ?? 0;
    if (amt > maxDayAmount) maxDayAmount = amt;
  }

  let peakAssigned = false;
  const dailyBuckets: SalesDailyBucket[] = dayKeys.map((dateKey) => {
    const d = parseLocalDateKey(dateKey);
    const stats = bucketTotals.get(dateKey) ?? {
      transactionCount: 0,
      totalItems: 0,
      totalAmount: 0,
    };
    const isPeak =
      maxDayAmount > 0 && stats.totalAmount === maxDayAmount && !peakAssigned;
    if (isPeak) peakAssigned = true;

    return {
      dateKey,
      shortDayLabel: getShortDayLabelMonFirst(d),
      fullDateLabel: `${FULL_DAY_LABELS_SUN_FIRST[d.getDay()]}, ${formatDateShortId(d)}`,
      transactionCount: stats.transactionCount,
      totalItems: stats.totalItems,
      totalAmount: stats.totalAmount,
      isPeak,
    };
  });

  const activeDaysCount = dailyBuckets.filter(
    (b) => b.transactionCount > 0
  ).length;
  const averagePerActiveDay =
    activeDaysCount > 0 ? Math.round(totalRevenue / activeDaysCount) : 0;
  const topProduct = productRecap.length > 0 ? productRecap[0] : null;
  const peakDay = dailyBuckets.find((b) => b.isPeak) ?? null;

  return {
    reportId,
    periodType,
    anchorDateKey: normalizedAnchor,
    startDateKey,
    endDateKey,
    periodTitle,
    shortPeriodLabel,
    weekLabel,
    fileBaseName,
    includeOcrReports,
    generatedAt: now.toISOString(),
    generatedByName: session?.name || "Ketua KWU HIMATEKPAL",
    generatedByEmail: session?.email || "ketuakwu@gmail.com",
    isEmpty: filteredEntries.length === 0,
    totalRevenue,
    totalTransactions,
    totalItemsSold,
    averagePerTransaction,
    activeDaysCount,
    averagePerActiveDay,
    topProduct,
    peakDay,
    entries: filteredEntries,
    productRecap,
    dailyBuckets,
  };
}
