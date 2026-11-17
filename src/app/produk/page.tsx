"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ui/ProductCard";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { formatRupiah } from "@/lib/formatters";
import {
  addProduct,
  getProducts,
  getSession,
  switchRole,
} from "@/lib/storage/repository";
import { validateProductForm } from "@/lib/validators";
import type { Product, ProductFormErrors, UserRole } from "@/types";

/**
 * Konten Halaman Kelola & Tambah Produk (US-01 — Tasks H-04, H-05, H-06).
 * Referensi Figma: 1390:4621 (Pengelola) & 1331:6084 (Ketua KWU K1..K6).
 */
function ProdukContent() {
  const searchParams = useSearchParams();
  const detailRef = useRef<HTMLDivElement | null>(null);

  const [role, setRole] = useState<UserRole>("ketua_kwu");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  // Form Tambah Produk state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    const actionParam = searchParams.get("action");
    const session = getSession();

    const resolvedRole: UserRole =
      modeParam === "pengelola"
        ? "pengelola"
        : session?.role ?? "ketua_kwu";

    setRole(resolvedRole);
    setEmail(
      resolvedRole === session?.role ? session.email : undefined
    );
    setProducts(getProducts());

    if (actionParam === "tambah" && resolvedRole === "ketua_kwu") {
      setViewMode("form");
    }
  }, [searchParams]);

  const isPengelola = role === "pengelola";

  const handleSwitchRole = (nextRole: UserRole) => {
    const updatedSession = switchRole(nextRole);
    setRole(nextRole);
    setEmail(updatedSession.email);
    if (nextRole === "pengelola" && viewMode === "form") {
      setViewMode("list");
    }
  };

  const openForm = () => {
    if (isPengelola) return;
    setSelectedProduct(null);
    setFormErrors({});
    setSuccessBanner(null);
    setViewMode("form");
  };

  const closeForm = () => {
    setFormErrors({});
    setName("");
    setPrice("");
    setStock("");
    setViewMode("list");
  };

  const handleSelectProduct = (prod: Product) => {
    if (selectedProduct?.id === prod.id) {
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(prod);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateProductForm({ name, price, stock });
    if (clientErrors.banner || clientErrors.name || clientErrors.price || clientErrors.stock) {
      setFormErrors(clientErrors);
      return;
    }

    const res = addProduct({ name, price, stock });
    if (!res.ok) {
      setFormErrors(res.errors);
      return;
    }

    setProducts(res.products);
    setSelectedProduct(null);
    setName("");
    setPrice("");
    setStock("");
    setFormErrors({});
    setViewMode("list");
    setRecentlyAdded(true);
    setSuccessBanner(
      `✓ Produk '${res.product.name}' berhasil disimpan ke database dan ditampilkan di daftar produk!`
    );
  };

  // Hitung live preview kartu produk
  const numericPrice = Number(price.replace(/[^\d]/g, ""));
  const numericStock = Number(stock.trim());
  const hasValidationError = Boolean(
    formErrors.banner || formErrors.name || formErrors.price || formErrors.stock
  );
  const isFormValidPreview =
    name.trim().length > 0 &&
    Number.isFinite(numericPrice) &&
    numericPrice > 0 &&
    Number.isInteger(numericStock) &&
    numericStock >= 1;

  const previewProduct: Product = {
    id: "preview",
    name: name.trim() || "Nama Produk Baru",
    price: Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 3000,
    stock:
      stock.trim() !== "" && Number.isFinite(numericStock) && numericStock >= 0
        ? Math.floor(numericStock)
        : 0,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <AppShell
      role={role}
      activeNav="produk"
      email={email}
      title={
        viewMode === "form"
          ? "Tambah Produk Baru"
          : isPengelola
            ? "Daftar Produk Kantin"
            : "Kelola & Tambah Produk"
      }
      onSwitchRole={handleSwitchRole}
      headerRightSlot={
        viewMode === "form" ? (
          <button
            type="button"
            onClick={closeForm}
            className="px-4 py-2 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
          >
            ← Kembali ke Daftar
          </button>
        ) : isPengelola ? (
          <span className="px-3.5 py-1.5 rounded-full bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink text-xs font-semibold">
            Mode Pengelola • Hanya Lihat
          </span>
        ) : (
          <button
            type="button"
            onClick={openForm}
            className="px-4 py-2 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
          >
            + Tambah Produk
          </button>
        )
      }
    >
      {/* MODE FORM TAMBAH PRODUK (K3, K4, K5) */}
      {viewMode === "form" && !isPengelola ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-7 shadow-ceashyr-card space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-ceashyr-ink">
                Form Tambah Produk
              </h2>
              <p className="text-xs text-ceashyr-muted mt-0.5">
                Lengkapi data produk baru sebelum disimpan ke database.
              </p>
            </div>

            {formErrors.banner && (
              <div
                role="alert"
                className="rounded-xl bg-ceashyr-red-soft border border-ceashyr-red text-ceashyr-red px-4 py-3 text-xs font-medium"
              >
                {formErrors.banner}
              </div>
            )}

            <div>
              <label
                htmlFor="prod-name"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Nama Produk
              </label>
              <input
                id="prod-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name || formErrors.banner) {
                    setFormErrors((prev) => ({
                      ...prev,
                      name: undefined,
                      banner: undefined,
                    }));
                  }
                }}
                placeholder="Contoh: Air Mineral 600 ml"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition ${
                  formErrors.name
                    ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                    : "border-ceashyr-border bg-ceashyr-field focus:border-ceashyr-orange"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs font-medium text-ceashyr-red">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-price"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Harga Jual (Rp)
              </label>
              <input
                id="prod-price"
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (formErrors.price || formErrors.banner) {
                    setFormErrors((prev) => ({
                      ...prev,
                      price: undefined,
                      banner: undefined,
                    }));
                  }
                }}
                placeholder="3000"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition ${
                  formErrors.price
                    ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                    : "border-ceashyr-border bg-ceashyr-field focus:border-ceashyr-orange"
                }`}
              />
              {formErrors.price && (
                <p className="mt-1 text-xs font-medium text-ceashyr-red">
                  {formErrors.price}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-stock"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Stok
              </label>
              <input
                id="prod-stock"
                type="text"
                inputMode="numeric"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (formErrors.stock || formErrors.banner) {
                    setFormErrors((prev) => ({
                      ...prev,
                      stock: undefined,
                      banner: undefined,
                    }));
                  }
                }}
                placeholder="Jumlah barang yang ada sekarang"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition ${
                  formErrors.stock
                    ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                    : "border-ceashyr-border bg-ceashyr-field focus:border-ceashyr-orange"
                }`}
              />
              {formErrors.stock && (
                <p className="mt-1 text-xs font-medium text-ceashyr-red">
                  {formErrors.stock}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="w-32 h-11 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-sm font-semibold hover:bg-ceashyr-field transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition"
              >
                Simpan
              </button>
            </div>
          </form>

          {/* Panel Pratinjau Kartu Produk */}
          <aside className="lg:col-span-5 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4">
            <div>
              <h2 className="text-base font-bold text-ceashyr-ink">
                Pratinjau Kartu Produk
              </h2>
              <p className="text-xs text-ceashyr-muted mt-0.5">
                Tampilan produk di daftar kantin setelah disimpan:
              </p>
            </div>

            <ProductCard
              product={previewProduct}
              badgeText={
                hasValidationError
                  ? "Error"
                  : isFormValidPreview
                    ? "Siap Simpan"
                    : "Draft"
              }
              badgeVariant={
                hasValidationError
                  ? "orange"
                  : isFormValidPreview
                    ? "green"
                    : "muted"
              }
            />

            <div
              className={`rounded-xl p-3.5 border text-xs space-y-1 ${
                hasValidationError
                  ? "bg-ceashyr-red-soft border-ceashyr-red text-ceashyr-red"
                  : "bg-ceashyr-field border-ceashyr-border text-ceashyr-muted"
              }`}
            >
              <p
                className={`font-semibold ${
                  hasValidationError ? "text-ceashyr-red" : "text-ceashyr-ink"
                }`}
              >
                Ketentuan Validasi Form:
              </p>
              <p>• Nama produk wajib diisi (tidak boleh kosong)</p>
              <p>• Harga jual wajib berupa angka positif (&gt; Rp 0)</p>
              <p>• Stok awal minimal 1 unit</p>
            </div>
          </aside>
        </div>
      ) : (
        /* MODE DAFTAR PRODUK + PANEL DETAIL (P1, P2, K1, K2, K6) */
        <div className="space-y-4">
          {isPengelola && (
            <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-4 py-3 text-xs md:text-sm font-medium">
              Akses Terbatas Pengelola/Kasir: hanya dapat melihat daftar &amp; detail produk. Penambahan produk dilakukan oleh Ketua KWU.
            </div>
          )}

          {successBanner && !isPengelola && (
            <div
              role="status"
              className="rounded-xl bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green px-4 py-3 text-xs md:text-sm font-medium"
            >
              {successBanner}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <section
              className={`${
                selectedProduct ? "lg:col-span-8" : "lg:col-span-12"
              } rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-6 shadow-ceashyr-card space-y-4`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-ceashyr-ink">
                  Total Produk: {products.length} produk dijual di kantin
                </h2>

                {recentlyAdded && !isPengelola ? (
                  <span className="px-3 py-1 rounded-full bg-ceashyr-green-soft border border-ceashyr-green text-ceashyr-green text-xs font-semibold">
                    Tersimpan di Database • +1 Produk
                  </span>
                ) : (
                  <span className="text-xs font-medium text-ceashyr-muted">
                    {isPengelola
                      ? "Klik produk untuk melihat detail"
                      : "Klik kartu produk untuk detail atau + Tambah Produk"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const isSel = selectedProduct?.id === product.id;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selected={isSel}
                      badgeText={isSel ? "Dipilih" : undefined}
                      onClick={() => handleSelectProduct(product)}
                    />
                  );
                })}
              </div>
            </section>

            {/* Panel Kanan Detail Produk (P2 & K2) */}
            {selectedProduct && (
              <aside
                ref={detailRef}
                className="lg:col-span-4 rounded-[20px] bg-ceashyr-cream border-[1.5px] border-ceashyr-orange p-5 md:p-6 shadow-ceashyr-card space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-ceashyr-ink">
                    Detail Produk
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    aria-label="Tutup detail produk"
                    className="w-8 h-8 rounded-lg bg-ceashyr-field border border-ceashyr-border text-ceashyr-ink text-sm font-bold flex items-center justify-center hover:bg-ceashyr-border/50 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="rounded-[14px] bg-ceashyr-forest p-4 space-y-1">
                  <p className="text-base font-bold text-white">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-ceashyr-forest-sub">
                    {selectedProduct.category || "Produk Kantin"} • Produk Kantin Aktif
                  </p>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ceashyr-muted text-xs">Harga Jual</span>
                    <span className="font-semibold text-ceashyr-ink">
                      {formatRupiah(selectedProduct.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ceashyr-muted text-xs">Stok Tersedia</span>
                    <span className="font-semibold text-ceashyr-ink">
                      {selectedProduct.stock} unit
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ceashyr-muted text-xs">Hak Akses</span>
                    <span className="font-semibold text-ceashyr-ink">
                      {isPengelola
                        ? "Lihat Saja (Pengelola)"
                        : "Kelola Penuh (Ketua KWU)"}
                    </span>
                  </div>
                </div>

                {isPengelola ? (
                  <div className="rounded-xl bg-ceashyr-amber-bg border border-ceashyr-amber-border text-ceashyr-amber-ink px-3.5 py-2.5 text-xs font-medium">
                    Masuk sebagai Ketua KWU bila perlu menambah produk baru.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openForm}
                    className="w-full h-11 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition"
                  >
                    + Tambah Produk Baru
                  </button>
                )}
              </aside>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function ProdukPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ceashyr-mint flex items-center justify-center text-sm text-ceashyr-muted">
          Memuat halaman produk...
        </div>
      }
    >
      <ProdukContent />
    </Suspense>
  );
}
