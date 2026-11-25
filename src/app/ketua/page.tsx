"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/ui/KpiCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { RoleRestrictedView } from "@/components/ui/RoleRestrictedView";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { StockAlertBanner } from "@/features/products/components/StockAlertBanner";
import { useSession } from "@/hooks/useSession";
import { formatRupiah } from "@/lib/formatters";
import { dataProvider } from "@/services";
import type { Product } from "@/types";

/**
 * Halaman Beranda Ketua KWU (US-04 — Task H-03).
 * Referensi Figma: Frame `1331:5698` & guard akses terbatas `1331:5947`.
 */
export default function KetuaDashboardPage() {
  const { session } = useSession({ fallbackRole: "ketua_kwu" });
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [totalSales, setTotalSales] = useState(10500);
  const [trxCount, setTrxCount] = useState(1);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      dataProvider.products.list(),
      dataProvider.transactions.list(),
      dataProvider.ocr.listReports(),
    ]).then(([loadedProducts, loadedTrx, loadedReports]) => {
      if (!active) return;
      setProducts(loadedProducts);
      setTrxCount(loadedTrx.length);
      setTotalSales(loadedTrx.reduce((sum, t) => sum + t.totalAmount, 0));
      setReportCount(loadedReports.length);
    });
    return () => {
      active = false;
    };
  }, []);

  if (session?.role === "pengelola") {
    return (
      <RoleRestrictedView
        role="pengelola"
        email={session.email}
        activeNav="kasir"
        message="Akses Terbatas: Halaman Beranda Ketua KWU hanya untuk Ketua KWU. Akun Pengelola/Kasir hanya memiliki akses Kasir, Rekap Kertas, dan Daftar Produk (Mode Lihat)."
        actions={[
          {
            label: "Masuk ke Halaman Kasir →",
            href: "/kasir",
            variant: "primary",
          },
          {
            label: "Lihat Daftar Produk (Mode Pengelola) →",
            href: "/produk?mode=pengelola",
            variant: "secondary",
          },
        ]}
      />
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
          <KpiCard
            label="Total Penjualan"
            value={formatRupiah(totalSales, true)}
          />
          <KpiCard
            label="Transaksi"
            value={`${trxCount} Nota`}
            valueTone="orange"
          />
          <KpiCard
            label="Katalog Produk"
            value={`${products.length} Item`}
            valueTone="green"
          />
          <KpiCard label="Rekap Kertas" value={`${reportCount} Laporan`} />
        </div>

        {/* Peringatan Stok Minimum */}
        <StockAlertBanner products={products} />

        {/* Kartu Daftar Produk 3 Kolom */}
        <SurfaceCard as="section" className="p-5 md:p-6 space-y-4">
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
        </SurfaceCard>

        {/* Aksi Cepat Ketua KWU */}
        <SurfaceCard as="section" className="p-5 md:p-6 space-y-3">
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
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
