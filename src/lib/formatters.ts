/**
 * Memformat angka ke string mata uang Rupiah Indonesia.
 * Gunakan `withSpace = false` untuk kartu produk (`Rp4.000`),
 * dan `withSpace = true` untuk total ringkasan (`Rp 10.500`).
 */
export function formatRupiah(amount: number, withSpace = false): string {
  const safeValue = Number.isFinite(amount) ? Math.round(amount) : 0;
  const formatted = new Intl.NumberFormat("id-ID").format(Math.abs(safeValue));
  const prefix = safeValue < 0 ? "-Rp" : "Rp";
  return withSpace ? `${prefix} ${formatted}` : `${prefix}${formatted}`;
}

/**
 * Memformat jumlah stok untuk sudut kanan bawah kartu produk.
 */
export function formatStockLabel(stock: number): string {
  const safeStock = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
  return `Stok ${safeStock}`;
}

/**
 * Memformat timestamp ISO ke tanggal & jam ringkas bahasa Indonesia.
 */
export function formatDateTimeId(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Memformat objek Date ke tanggal lengkap bahasa Indonesia (mis. "Selasa, 17 November 2026").
 */
export function formatDateLongId(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Memformat objek Date ke tanggal ringkas bahasa Indonesia (mis. "17 Nov 2026").
 */
export function formatDateShortId(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Memformat timestamp ISO ke jam:menit 24 jam (mis. "09:15").
 */
export function formatTimeId(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "--:--";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Memformat persentase desimal Indonesia (mis. "63,4%").
 */
export function formatPercentId(value: number): string {
  if (!Number.isFinite(value)) return "0,0%";
  const rounded = Math.max(0, Math.round(value * 10) / 10);
  return `${rounded.toFixed(1).replace(".", ",")}%`;
}
