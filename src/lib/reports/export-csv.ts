import { formatDateTimeId } from "@/lib/formatters";
import type { SalesReportData } from "@/types";

/**
 * Mengamankan sel CSV sesuai RFC 4180 agar kompatibel dengan Microsoft Excel & Google Sheets.
 */
export function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(cells: Array<string | number>): string {
  return cells.map(escapeCsvCell).join(",");
}

/**
 * Mengonversi data rekap penjualan menjadi string CSV UTF-8 BOM siap buka di Excel.
 */
export function generateSalesReportCsv(report: SalesReportData): string {
  const title =
    report.periodType === "daily"
      ? "LAPORAN PENJUALAN HARIAN KANTIN KWU HIMATEKPAL ITS"
      : "LAPORAN PENJUALAN MINGGUAN KANTIN KWU HIMATEKPAL ITS";

  const sourceLabel = report.includeOcrReports
    ? "Transaksi Kasir (POS) + Rekap Kertas OCR"
    : "Transaksi Kasir (POS)";

  const statusLabel = report.isEmpty
    ? "NIHIL - Tidak ada transaksi pada periode ini"
    : "ADA TRANSAKSI";

  const lines: string[] = [
    csvRow([title]),
    csvRow(["ID Laporan", report.reportId]),
    csvRow(["Periode", report.periodTitle]),
    csvRow(["Rentang Tanggal", `${report.startDateKey} s.d. ${report.endDateKey}`]),
    csvRow(["Status Laporan", statusLabel]),
    csvRow(["Sumber Data", sourceLabel]),
    csvRow([
      "Dicetak Oleh",
      `${report.generatedByName} (${report.generatedByEmail})`,
    ]),
    csvRow(["Waktu Cetak", formatDateTimeId(report.generatedAt)]),
    csvRow(["Total Pendapatan (Rp)", report.totalRevenue]),
    csvRow(["Jumlah Transaksi (Nota)", report.totalTransactions]),
    csvRow(["Total Item Terjual (pcs)", report.totalItemsSold]),
    csvRow(["Rata-rata per Nota (Rp)", report.averagePerTransaction]),
    "",
  ];

  if (report.periodType === "weekly") {
    lines.push(csvRow(["REKAP PENJUALAN PER HARI"]));
    lines.push(
      csvRow([
        "Tanggal",
        "Hari",
        "Jumlah Nota",
        "Item Terjual (pcs)",
        "Total Pendapatan (Rp)",
      ])
    );
    for (const day of report.dailyBuckets) {
      lines.push(
        csvRow([
          day.dateKey,
          day.fullDateLabel,
          day.transactionCount,
          day.totalItems,
          day.totalAmount,
        ])
      );
    }
    lines.push(
      csvRow([
        "TOTAL MINGGUAN",
        report.periodTitle,
        report.totalTransactions,
        report.totalItemsSold,
        report.totalRevenue,
      ])
    );
    lines.push("");
  }

  lines.push(csvRow(["REKAP PENJUALAN PER PRODUK"]));
  lines.push(
    csvRow([
      "No",
      "Nama Produk",
      "Harga Satuan (Rp)",
      "Qty Terjual (pcs)",
      "Subtotal (Rp)",
      "Porsi (%)",
    ])
  );

  if (report.productRecap.length === 0) {
    lines.push(
      csvRow([
        "-",
        `NIHIL - Tidak ada produk terjual pada periode ${report.periodTitle}`,
        0,
        0,
        0,
        "0.0",
      ])
    );
  } else {
    report.productRecap.forEach((item, index) => {
      lines.push(
        csvRow([
          index + 1,
          item.productName,
          item.unitPrice,
          item.qtySold,
          item.subtotal,
          item.revenueSharePct.toFixed(1),
        ])
      );
    });
    lines.push(
      csvRow([
        "",
        "TOTAL PENJUALAN PRODUK",
        "",
        report.totalItemsSold,
        report.totalRevenue,
        "100.0",
      ])
    );
  }

  lines.push("");
  lines.push(csvRow(["DAFTAR NOTA TRANSAKSI"]));
  lines.push(
    csvRow([
      "Kode Nota",
      "Tanggal & Waktu",
      "Sumber",
      "Kasir / File",
      "Rincian Item",
      "Total Item (pcs)",
      "Total Bayar (Rp)",
    ])
  );

  if (report.entries.length === 0) {
    lines.push(
      csvRow([
        "-",
        report.startDateKey,
        "-",
        "-",
        `NIHIL - Tidak ada transaksi pada periode ${report.periodTitle}`,
        0,
        0,
      ])
    );
  } else {
    for (const entry of report.entries) {
      const itemsText = entry.items
        .map((item) => `${item.productName} (${item.qty})`)
        .join(", ");
      lines.push(
        csvRow([
          entry.code,
          formatDateTimeId(entry.createdAt),
          entry.source === "ocr" ? "Rekap OCR" : "Kasir POS",
          entry.actorLabel,
          itemsText,
          entry.totalItems,
          entry.totalAmount,
        ])
      );
    }
    lines.push(
      csvRow([
        "",
        "",
        "",
        "",
        `TOTAL ${report.totalTransactions} TRANSAKSI`,
        report.totalItemsSold,
        report.totalRevenue,
      ])
    );
  }

  return `\uFEFF${lines.join("\r\n")}`;
}

/**
 * Memicu unduhan file CSV laporan ke perangkat pengguna dan mengembalikan nama file.
 */
export function downloadSalesReportCsv(report: SalesReportData): string {
  const fileName = `${report.fileBaseName}.csv`;
  const csvContent = generateSalesReportCsv(report);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return fileName;
}
