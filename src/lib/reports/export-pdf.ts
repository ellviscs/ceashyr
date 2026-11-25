import {
  formatDateLongId,
  formatDateTimeId,
  formatPercentId,
  formatRupiah,
  formatTimeId,
} from "@/lib/formatters";
import { parseLocalDateKey } from "@/lib/reports/sales-report";
import type { SalesReportData } from "@/types";

type RGB = [number, number, number];

const PDF_COLORS = {
  forest: [70, 89, 71] as RGB,
  orange: [232, 99, 57] as RGB,
  peach: [253, 236, 230] as RGB,
  green: [45, 122, 83] as RGB,
  amberBg: [255, 246, 229] as RGB,
  amberBorder: [217, 130, 43] as RGB,
  amberInk: [138, 81, 17] as RGB,
  ink: [31, 32, 36] as RGB,
  muted: [113, 114, 122] as RGB,
  border: [227, 229, 234] as RGB,
  field: [249, 250, 251] as RGB,
  cream: [255, 253, 249] as RGB,
  totalBg: [244, 247, 243] as RGB,
  white: [255, 255, 255] as RGB,
};

/**
 * Mengubah karakter tipografi non-WinAnsi agar font bawaan Helvetica di jsPDF selalu tercetak rapi.
 */
function toPdfSafeText(text: string): string {
  return text
    .replace(/[–—]/g, "-")
    .replace(/•/g, "-")
    .replace(/✓/g, "OK");
}

/**
 * Menyusun dokumen PDF A4 resmi Kantin KWU HIMATEKPAL ITS dari data laporan penjualan.
 */
export async function createSalesReportPdfDocument(report: SalesReportData) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  // Garis aksen 2 warna di paling atas (konsisten dengan desain A4 PDF)
  doc.setFillColor(...PDF_COLORS.forest);
  doc.rect(0, 0, pageWidth * 0.72, 3.2, "F");
  doc.setFillColor(...PDF_COLORS.orange);
  doc.rect(pageWidth * 0.72, 0, pageWidth * 0.28, 3.2, "F");

  // Header Kop Dokumen
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.orange);
  doc.text("CEASHYR - KANTIN KWU HIMATEKPAL ITS", marginX, 13);

  doc.setFontSize(17);
  doc.setTextColor(...PDF_COLORS.ink);
  const reportTitle =
    report.periodType === "daily"
      ? "LAPORAN PENJUALAN HARIAN"
      : "LAPORAN PENJUALAN MINGGUAN";
  doc.text(reportTitle, marginX, 20.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(
    "Departemen Kewirausahaan - Himpunan Mahasiswa Teknik Perkapalan ITS",
    marginX,
    25.5
  );

  // Badge ID Laporan di kanan atas
  const badgeW = 46;
  const badgeH = 8;
  const badgeX = pageWidth - marginX - badgeW;
  const badgeY = 11.5;
  doc.setFillColor(...PDF_COLORS.peach);
  doc.setDrawColor(...PDF_COLORS.orange);
  doc.setLineWidth(0.35);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.orange);
  doc.text(`ID: ${report.reportId}`, badgeX + badgeW / 2, badgeY + 5.3, {
    align: "center",
  });

  // Garis pembatas kop
  doc.setDrawColor(...PDF_COLORS.forest);
  doc.setLineWidth(0.7);
  doc.line(marginX, 29, pageWidth - marginX, 29);

  // Kotak Metadata
  const metaY = 32.5;
  const metaH = 15;
  doc.setFillColor(...PDF_COLORS.field);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(marginX, metaY, contentWidth, metaH, 2, 2, "FD");

  const sourceLabel = report.includeOcrReports
    ? "Kasir (POS) + Rekap Kertas OCR"
    : "Database Transaksi Kasir (Ceashyr PWA)";
  const colMidX = marginX + contentWidth / 2 + 2;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Periode:", marginX + 3.5, metaY + 5.5);
  doc.text("Sumber Data:", marginX + 3.5, metaY + 11.2);
  doc.text("Dicetak Oleh:", colMidX, metaY + 5.5);
  doc.text("Waktu Cetak:", colMidX, metaY + 11.2);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.ink);
  doc.text(toPdfSafeText(report.periodTitle), marginX + 20, metaY + 5.5);
  doc.text(sourceLabel, marginX + 24, metaY + 11.2);
  doc.text(
    toPdfSafeText(`${report.generatedByName} (${report.generatedByEmail})`),
    colMidX + 21,
    metaY + 5.5
  );
  doc.text(
    toPdfSafeText(`${formatDateTimeId(report.generatedAt)} WIB`),
    colMidX + 21,
    metaY + 11.2
  );

  // 4 Kotak Ringkasan KPI
  const kpiY = metaY + metaH + 4;
  const kpiGap = 3.5;
  const kpiW = (contentWidth - kpiGap * 3) / 4;
  const kpiH = 15.5;

  const kpiCards: Array<{ label: string; value: string; color: RGB }> = [
    {
      label: "Total Pendapatan",
      value: formatRupiah(report.totalRevenue, true),
      color: PDF_COLORS.ink,
    },
    {
      label: "Jumlah Transaksi",
      value: `${report.totalTransactions} Nota`,
      color: PDF_COLORS.orange,
    },
    {
      label: "Total Item Terjual",
      value: `${report.totalItemsSold} pcs`,
      color: PDF_COLORS.green,
    },
    {
      label: "Rata-rata / Nota",
      value: formatRupiah(report.averagePerTransaction, true),
      color: PDF_COLORS.ink,
    },
  ];

  kpiCards.forEach((card, idx) => {
    const x = marginX + idx * (kpiW + kpiGap);
    doc.setFillColor(...PDF_COLORS.cream);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, kpiY, kpiW, kpiH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(card.label, x + 3, kpiY + 5.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...card.color);
    doc.text(card.value, x + 3, kpiY + 11.8);
  });

  let cursorY = kpiY + kpiH + 6;

  // Banner khusus ketika belum ada transaksi (Laporan Nihil)
  if (report.isEmpty) {
    doc.setFillColor(...PDF_COLORS.amberBg);
    doc.setDrawColor(...PDF_COLORS.amberBorder);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, cursorY, contentWidth, 12, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_COLORS.amberInk);
    doc.text(
      toPdfSafeText(
        `STATUS: NIHIL - Tidak terdapat transaksi penjualan pada periode ${report.periodTitle}.`
      ),
      marginX + 3.5,
      cursorY + 5
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.text(
      "Dokumen ini tetap sah digunakan sebagai bukti pelaporan kegiatan nihil ke himpunan.",
      marginX + 3.5,
      cursorY + 9.5
    );
    cursorY += 16.5;
  }

  let sectionCounter = 1;

  // Tabel Rekap Harian (khusus periode mingguan)
  if (report.periodType === "weekly") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COLORS.forest);
    doc.text(
      `${sectionCounter}. Rekap Penjualan per Hari (Senin - Minggu)`,
      marginX,
      cursorY
    );
    sectionCounter += 1;

    autoTable(doc, {
      startY: cursorY + 2,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      showFoot: "lastPage",
      head: [["Hari / Tanggal", "Kode Tanggal", "Nota", "Item Terjual", "Total Pendapatan"]],
      body: report.dailyBuckets.map((day) => [
        day.isPeak ? `${day.fullDateLabel} (Tertinggi)` : day.fullDateLabel,
        day.dateKey,
        `${day.transactionCount} Nota`,
        `${day.totalItems} pcs`,
        formatRupiah(day.totalAmount, true),
      ]),
      foot: [
        [
          "TOTAL MINGGUAN",
          report.weekLabel || "",
          `${report.totalTransactions} Nota`,
          `${report.totalItemsSold} pcs`,
          formatRupiah(report.totalRevenue, true),
        ],
      ],
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.2,
        textColor: PDF_COLORS.ink,
        lineColor: PDF_COLORS.border,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: PDF_COLORS.forest,
        textColor: PDF_COLORS.white,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: PDF_COLORS.totalBg,
        textColor: PDF_COLORS.ink,
        fontStyle: "bold",
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    const lastY =
      (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
        ?.finalY ?? cursorY + 35;
    cursorY = lastY + 7;
  }

  // Tabel Rekap Penjualan per Produk
  if (cursorY > 245) {
    doc.addPage();
    cursorY = 16;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.forest);
  doc.text(`${sectionCounter}. Rekap Penjualan per Produk`, marginX, cursorY);
  sectionCounter += 1;

  const productBody =
    report.productRecap.length === 0
      ? [
          [
            "-",
            toPdfSafeText(
              `NIHIL - Tidak ada produk terjual pada periode ${report.periodTitle}`
            ),
            "Rp 0",
            "0 pcs",
            "Rp 0",
            "0,0%",
          ],
        ]
      : report.productRecap.map((item, idx) => [
          String(idx + 1),
          item.productName,
          formatRupiah(item.unitPrice, true),
          `${item.qtySold} pcs`,
          formatRupiah(item.subtotal, true),
          formatPercentId(item.revenueSharePct),
        ]);

  autoTable(doc, {
    startY: cursorY + 2,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    showFoot: "lastPage",
    head: [["No", "Nama Produk", "Harga Satuan", "Qty Terjual", "Subtotal", "Porsi"]],
    body: productBody,
    foot: [
      [
        "",
        "TOTAL PENJUALAN PRODUK",
        "",
        `${report.totalItemsSold} pcs`,
        formatRupiah(report.totalRevenue, true),
        report.isEmpty ? "0,0%" : "100,0%",
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.3,
      textColor: PDF_COLORS.ink,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: PDF_COLORS.forest,
      textColor: PDF_COLORS.white,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: PDF_COLORS.totalBg,
      textColor: PDF_COLORS.ink,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right", cellWidth: 16 },
    },
  });

  const afterProductY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? cursorY + 35;
  cursorY = afterProductY + 7;

  // Tabel Daftar Nota Transaksi
  if (cursorY > 245) {
    doc.addPage();
    cursorY = 16;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_COLORS.forest);
  doc.text(`${sectionCounter}. Daftar Nota Transaksi`, marginX, cursorY);

  const entriesBody =
    report.entries.length === 0
      ? [
          [
            "-",
            "-",
            "-",
            toPdfSafeText(
              `NIHIL - Tidak ada transaksi tercatat pada periode ${report.periodTitle}`
            ),
            "0",
            "Rp 0",
          ],
        ]
      : report.entries.map((entry) => {
          const timePart =
            report.periodType === "daily"
              ? formatTimeId(entry.createdAt)
              : `${entry.dateKey} ${formatTimeId(entry.createdAt)}`;
          const itemsSummary = entry.items
            .map((item) => `${item.productName} (${item.qty})`)
            .join(", ");
          const actorText =
            entry.source === "ocr" ? `OCR: ${entry.actorLabel}` : entry.actorLabel;
          return [
            entry.code,
            timePart,
            actorText,
            itemsSummary,
            String(entry.totalItems),
            formatRupiah(entry.totalAmount, true),
          ];
        });

  autoTable(doc, {
    startY: cursorY + 2,
    margin: { left: marginX, right: marginX },
    theme: "grid",
    showFoot: "lastPage",
    head: [["Kode Nota", "Waktu", "Kasir / Sumber", "Rincian Item", "Qty", "Total"]],
    body: entriesBody,
    foot: [
      [
        "",
        "",
        "",
        `TOTAL ${report.totalTransactions} NOTA TRANSAKSI`,
        String(report.totalItemsSold),
        formatRupiah(report.totalRevenue, true),
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 2.1,
      textColor: PDF_COLORS.ink,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: PDF_COLORS.forest,
      textColor: PDF_COLORS.white,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: PDF_COLORS.totalBg,
      textColor: PDF_COLORS.ink,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 22 },
      1: { cellWidth: report.periodType === "daily" ? 14 : 26 },
      4: { halign: "right", cellWidth: 11 },
      5: { halign: "right", cellWidth: 24 },
    },
  });

  const afterEntriesY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
      ?.finalY ?? cursorY + 35;

  // Blok Tanda Tangan
  let sigY = afterEntriesY + 14;
  if (sigY + 32 > pageHeight - 14) {
    doc.addPage();
    sigY = 24;
  }

  const leftCenterX = marginX + contentWidth * 0.24;
  const rightCenterX = marginX + contentWidth * 0.76;
  const signDateLabel = formatDateLongId(parseLocalDateKey(report.endDateKey));
  const cleanDatePart = signDateLabel.includes(",")
    ? signDateLabel.split(",").slice(1).join(",").trim()
    : signDateLabel;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("Mengetahui,", leftCenterX, sigY, { align: "center" });
  doc.text(`Surabaya, ${cleanDatePart}`, rightCenterX, sigY, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.ink);
  doc.text("Pengelola Kantin KWU", leftCenterX, sigY + 4.5, {
    align: "center",
  });
  doc.text("Ketua KWU HIMATEKPAL ITS", rightCenterX, sigY + 4.5, {
    align: "center",
  });

  doc.setDrawColor(...PDF_COLORS.muted);
  doc.setLineWidth(0.3);
  doc.line(leftCenterX - 28, sigY + 21, leftCenterX + 28, sigY + 21);
  doc.line(rightCenterX - 28, sigY + 21, rightCenterX + 28, sigY + 21);

  doc.text("Ibu Ellya Setyawati", leftCenterX, sigY + 25.5, {
    align: "center",
  });
  doc.text(toPdfSafeText(report.generatedByName), rightCenterX, sigY + 25.5, {
    align: "center",
  });

  // Footer nomor halaman di setiap halaman
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(
      `Ceashyr PWA - Kantin KWU HIMATEKPAL ITS (${report.reportId})`,
      marginX,
      pageHeight - 8
    );
    doc.text(
      `Halaman ${p} dari ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 8,
      { align: "right" }
    );
  }

  return doc;
}

/**
 * Mengonversi laporan penjualan ke file PDF A4 dan langsung mengunduh ke perangkat pengguna.
 */
export async function downloadSalesReportPdf(
  report: SalesReportData
): Promise<string> {
  const fileName = `${report.fileBaseName}.pdf`;
  const doc = await createSalesReportPdfDocument(report);
  doc.save(fileName);
  return fileName;
}
