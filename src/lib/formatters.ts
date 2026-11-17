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
