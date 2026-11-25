"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { formatRupiah } from "@/lib/formatters";
import {
  getOcrReports,
  getProducts,
  getSession,
  getTransactions,
} from "@/lib/storage/repository";
import type { Product, SessionState } from "@/types";

/**
 * Halaman Beranda Ketua KWU (US-04 — Task H-03).
 * Referensi Figma: Frame `1331:5698` & guard akses terbatas `1331:5947`.
 */
export default function KetuaDashboardPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [totalSales, setTotalSales] = useState(10500);
  const [trxCount, setTrxCount] = useState(1);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    setSession(getSession());
    const loadedProducts = getProducts();
    const loadedTrx = getTransactions();
    const loadedReports = getOcrReports();
    setProducts(loadedProducts);
    setTrxCount(loadedTrx.length);
    setTotalSales(loadedTrx.reduce((sum, t) => sum + t.totalAmount, 0));
    setReportCount(loadedReports.length);
  }, []);

  if (session?.role === "pengelola") {
    return (
      <AppShell
        role="pengelola"
        activeNav="kasir"
        email={session.email}
        title="Akses Terbatas"
      >
        <div className="max-w-xl rounded-[20px] bg-ceashyr-cream border border-ceashyr-amber-border p-6 shadow-ceashyr-card space-y-4">
          <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-3 text-sm font-medium">
            Akses Terbatas: Halaman Beranda Ketua KWU hanya untuk Ketua KWU. Akun Pengelola/Kasir hanya memiliki akses Kasir, Rekap Kertas, dan Daftar Produk (Mode Lihat).
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kasir"
              className="px-4 py-2.5 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
            >
              Masuk ke Halaman Kasir →
            </Link>
            <Link
              href="/produk?mode=pengelola"
              className="px-4 py-2.5 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
            >
              Lihat Daftar Produk (Mode Pengelola) →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="ketua_kwu"
      activeNav="beranda"
      email={session?.email}
      title="Beranda Ketua KWU"
    >
      <div className="space-y-5">
        {/* 4 Kartu KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Total Penjualan</p>
            <p className="text-xl font-bold text-ceashyr-ink mt-1">
              {formatRupiah(totalSales, true)}
            </p>
          </div>
          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Transaksi</p>
            <p className="text-xl font-bold text-ceashyr-orange mt-1">
              {trxCount} Nota
            </p>
          </div>
          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Katalog Produk</p>
            <p className="text-xl font-bold text-ceashyr-green mt-1">
              {products.length} Item
            </p>
          </div>
          <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
            <p className="text-xs text-ceashyr-muted">Rekap Kertas</p>
            <p className="text-xl font-bold text-ceashyr-ink mt-1">
              {reportCount} Laporan
            </p>
          </div>
        </div>

        {/* Kartu Daftar Produk 3 Kolom */}
        <section className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-ceashyr-ink">
              Total Produk: {products.length} Produk
            </h2>
            <Link
              href="/produk?action=tambah"
              className="px-4 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
            >
              + Tambah Produk
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Aksi Cepat Ketua KWU */}
        <section className="rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-3">
          <h2 className="text-base font-bold text-ceashyr-ink">
            Aksi Cepat Ketua KWU
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/produk"
              className="rounded-xl bg-ceashyr-mint/70 border border-ceashyr-border p-4 hover:border-ceashyr-orange transition"
            >
              <p className="text-sm font-bold text-ceashyr-ink">
                + Tambah &amp; Kelola Produk
              </p>
              <p className="text-xs text-ceashyr-muted mt-1">
                Atur harga jual &amp; stok awal (US-01)
              </p>
            </Link>
            <Link
              href="/kasir"
              className="rounded-xl bg-ceashyr-mint/70 border border-ceashyr-border p-4 hover:border-ceashyr-orange transition"
            >
              <p className="text-sm font-bold text-ceashyr-ink">
                Pantau Riwayat Penjualan
              </p>
              <p className="text-xs text-ceashyr-muted mt-1">
                Audit semua nota transaksi harian (US-05)
              </p>
            </Link>
            <Link
              href="/rekap-kertas"
              className="rounded-xl bg-ceashyr-mint/70 border border-ceashyr-border p-4 hover:border-ceashyr-orange transition"
            >
              <p className="text-sm font-bold text-ceashyr-ink">
                Rekap Kertas (OCR)
              </p>
              <p className="text-xs text-ceashyr-muted mt-1">
                Konversi foto laporan ke digital (US-16)
              </p>
            </Link>
            <Link
              href="/laporan"
              className="rounded-xl bg-ceashyr-peach/70 border border-ceashyr-orange/60 p-4 hover:border-ceashyr-orange transition"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-ceashyr-ink">
                  Laporan Penjualan (PDF / CSV)
                </p>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-ceashyr-orange text-white text-[10px] font-bold">
                  BARU
                </span>
              </div>
              <p className="text-xs text-ceashyr-amber-ink mt-1">
                Unduh rekap harian &amp; mingguan ke himpunan (US-15)
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
