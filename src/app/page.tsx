"use client";

import React, { useState } from "react";
import Link from "next/link";
import { dataProvider } from "@/services";

const SPRINT1_ROUTES = [
  {
    code: "US-04",
    title: "Login Multi-Peran & Hak Akses",
    href: "/login",
    figmaRef: "Sections 1331:5579, 1387:4827, 1331:5785, 1331:6003",
    taskDoc: "docs/tasks/T-01-US04-AUTH-AND-ROLES.md",
    desc: "Halaman masuk Ketua KWU & Pengelola/Kasir, validasi field kosong/salah, register/lupa sandi, serta beranda peran.",
  },
  {
    code: "US-04 / Ketua",
    title: "Beranda Ketua KWU",
    href: "/ketua",
    figmaRef: "Frame 1331:5698",
    taskDoc: "docs/tasks/T-01-US04-AUTH-AND-ROLES.md",
    desc: "Ringkasan 4 KPI kantin, katalog produk 3 kolom, dan kartu Aksi Cepat Ketua KWU.",
  },
  {
    code: "US-01",
    title: "Kelola & Tambah Produk",
    href: "/produk",
    figmaRef: "Sections 1390:4621 (Pengelola) & 1331:6084 (KWU)",
    taskDoc: "docs/tasks/T-02-US01-PRODUCTS-MANAGEMENT.md",
    desc: "Mode Ketua KWU (daftar, detail produk, form tambah + validasi + simpan) dan Mode Pengelola (hanya lihat).",
  },
  {
    code: "US-05 & US-06",
    title: "Kasir — Rekap Sisa Stok Tutup Toko",
    href: "/kasir",
    figmaRef: "Section 1331:6270 (Frames 1338:4925..5211)",
    taskDoc: "docs/tasks/T-03-US05-SALES-POS.md",
    desc: "Input sisa stok fisik harian (Stok Memori − Sisa Stok), hitung penjualan otomatis, dan simpan rekap sekali sebelum toko ditutup.",
  },
  {
    code: "US-16",
    title: "Rekap Laporan Kertas (OCR)",
    href: "/rekap-kertas",
    figmaRef: "Section 1331:6426 (Frames 1341:4836..5178)",
    taskDoc: "docs/tasks/T-04-US16-OCR-PAPER-REPORT.md",
    desc: "Ambil/pilih foto laporan harian, konversi teks ke data digital, koreksi item, dan antrean offline lokal saat WiFi bermasalah.",
  },
  {
    code: "US-15",
    title: "Laporan Penjualan Harian & Mingguan",
    href: "/laporan",
    figmaRef: "docs/desain-halaman-laporan-penjualan-US15.pdf",
    taskDoc: "docs/01-PROJECT-OVERVIEW.md",
    desc: "Filter periode harian/mingguan, rekap transaksi & produk, serta unduh laporan PDF resmi himpunan dan CSV/Excel.",
  },
];

/**
 * Halaman Launchpad & Panduan Kerja Sprint 1 Ceashyr PWA.
 * Memudahkan QA, demo Tablet, dan pengujian per rute selama pengembangan oleh Gemini Hydrogen.
 */
export default function HomePage() {
  const [resetNotice, setResetNotice] = useState(false);

  const handleReset = async () => {
    await dataProvider.resetToSeed();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-ceashyr-mint py-8 px-4 md:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-6 md:p-8 shadow-ceashyr-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-ceashyr-peach border border-ceashyr-orange text-ceashyr-orange text-xs font-semibold mb-3">
              Ceashyr PWA • Kantin KWU HIMATEKPAL ITS
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-ceashyr-ink">
              Launchpad Sprint 1 &amp; Scaffold Gemini Hydrogen
            </h1>
            <p className="text-sm text-ceashyr-muted mt-1.5 max-w-2xl">
              Struktur initial commit siap pakai berbasis Next.js App Router, Tailwind CSS, Local-First Repository, dan UI Figma{" "}
              <span className="font-medium text-ceashyr-ink">⭐️ Templates (Copy)</span> (node{" "}
              <code className="text-xs bg-ceashyr-field px-1.5 py-0.5 rounded border border-ceashyr-border">
                1331:4912
              </code>
              ).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
            >
              Mulai dari /login →
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-sm font-medium hover:bg-ceashyr-field transition"
            >
              Reset Seed Data
            </button>
          </div>
        </div>

        {resetNotice && (
          <div className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-3 text-sm font-medium">
            ✓ Penyimpanan lokal berhasil di-reset ke seed data awal (3 produk kantin &amp; 2 akun demo).
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPRINT1_ROUTES.map((item) => (
            <div
              key={item.href}
              className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 shadow-ceashyr-card flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-ceashyr-green-soft text-ceashyr-green text-xs font-bold">
                    {item.code}
                  </span>
                  <span className="text-[11px] text-ceashyr-muted">{item.figmaRef}</span>
                </div>
                <h2 className="text-lg font-bold text-ceashyr-ink">{item.title}</h2>
                <p className="text-xs text-ceashyr-muted mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ceashyr-border">
                <code className="text-[11px] text-ceashyr-muted">{item.taskDoc}</code>
                <Link
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg bg-ceashyr-forest text-white text-xs font-semibold hover:brightness-110 transition"
                >
                  Buka {item.href} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 shadow-ceashyr-card text-xs text-ceashyr-muted flex flex-wrap items-center justify-between gap-2">
          <span>
            Akun demo default: <strong className="text-ceashyr-ink">ketuakwu@gmail.com</strong> (Ketua KWU) •{" "}
            <strong className="text-ceashyr-ink">kasir@gmail.com</strong> (Pengelola/Kasir) • sandi bebas/{" "}
            <code className="text-ceashyr-ink">12345678</code> / <code className="text-ceashyr-ink">ketuakwu123</code> /{" "}
            <code className="text-ceashyr-ink">kasir123</code>.
          </span>
          <Link href="/produk?mode=pengelola" className="text-ceashyr-orange font-semibold hover:underline">
            Lihat Mode Pengelola (/produk?mode=pengelola) →
          </Link>
        </div>
      </div>
    </div>
  );
}
