"use client";

import React, { useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  DEFAULT_MIN_STOCK,
  getProductStockStatus,
} from "@/features/products/stock-status";
import {
  parseNonNegativeIntegerInput,
  parsePositiveRupiahInput,
  validateProductForm,
} from "@/lib/validators";
import type {
  AddProductResult,
  Product,
  ProductFormErrors,
  ProductFormInput,
} from "@/types";

interface ProductFormProps {
  onCreateProduct: (input: ProductFormInput) => Promise<AddProductResult>;
  onSuccess: (result: Extract<AddProductResult, { ok: true }>) => void;
  onCancel: () => void;
}

/**
 * Form Tambah Produk beserta input Batas Stok Minimum & live preview kartu produk (US-01 & US-09).
 */
export function ProductForm({
  onCreateProduct,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState(String(DEFAULT_MIN_STOCK));
  const [category, setCategory] = useState("Makanan Ringan");
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductFormInput = {
      name,
      price,
      stock,
      minStock,
      category,
    };
    const clientErrors = validateProductForm(payload);
    if (
      clientErrors.banner ||
      clientErrors.name ||
      clientErrors.price ||
      clientErrors.stock ||
      clientErrors.minStock
    ) {
      setFormErrors(clientErrors);
      return;
    }

    setIsSaving(true);
    try {
      const res = await onCreateProduct(payload);
      if (!res.ok) {
        setFormErrors(res.errors);
        return;
      }

      setName("");
      setPrice("");
      setStock("");
      setMinStock(String(DEFAULT_MIN_STOCK));
      setFormErrors({});
      onSuccess(res);
    } finally {
      setIsSaving(false);
    }
  };

  const numericPrice = parsePositiveRupiahInput(price);
  const numericStock = parseNonNegativeIntegerInput(stock);
  const numericMinStock = parseNonNegativeIntegerInput(minStock);

  const hasValidationError = Boolean(
    formErrors.banner ||
      formErrors.name ||
      formErrors.price ||
      formErrors.stock ||
      formErrors.minStock
  );
  const isFormValidPreview =
    name.trim().length > 0 &&
    Number.isFinite(numericPrice) &&
    numericPrice > 0 &&
    Number.isFinite(numericStock) &&
    numericStock >= 1 &&
    Number.isFinite(numericMinStock) &&
    numericMinStock >= 0;

  const resolvedStock =
    Number.isFinite(numericStock) && numericStock >= 0 ? numericStock : 0;
  const resolvedMinStock =
    Number.isFinite(numericMinStock) && numericMinStock >= 0
      ? numericMinStock
      : DEFAULT_MIN_STOCK;
  const previewStockStatus = getProductStockStatus(
    resolvedStock,
    resolvedMinStock
  );

  const previewProduct: Product = {
    id: "preview",
    name: name.trim() || "Nama Produk Baru",
    price: Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : 3000,
    stock: resolvedStock,
    minStock: resolvedMinStock,
    category,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="lg:col-span-7 rounded-[20px] bg-ceashyr-cream border border-ceashyr-border p-5 md:p-7 shadow-ceashyr-card space-y-4"
      >
        <div>
          <h2 className="text-lg font-bold text-ceashyr-ink">
            Form Tambah Produk
          </h2>
          <p className="text-xs text-ceashyr-muted mt-0.5">
            Lengkapi data produk baru beserta batas stok minimum sebelum disimpan.
          </p>
        </div>

        {formErrors.banner && (
          <StatusBanner variant="error" className="text-xs">
            {formErrors.banner}
          </StatusBanner>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              htmlFor="prod-category"
              className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
            >
              Kategori
            </label>
            <select
              id="prod-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-ceashyr-border bg-ceashyr-field text-sm text-ceashyr-ink focus:outline-none focus:border-ceashyr-orange transition"
            >
              <option value="Makanan Ringan">Makanan Ringan</option>
              <option value="Minuman Kemasan">Minuman Kemasan</option>
              <option value="Produk Kantin">Produk Kantin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="prod-stock"
              className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
            >
              Stok Awal
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

          <div>
            <label
              htmlFor="prod-min-stock"
              className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
            >
              Batas Stok Minimum
            </label>
            <input
              id="prod-min-stock"
              type="text"
              inputMode="numeric"
              value={minStock}
              onChange={(e) => {
                setMinStock(e.target.value);
                if (formErrors.minStock || formErrors.banner) {
                  setFormErrors((prev) => ({
                    ...prev,
                    minStock: undefined,
                    banner: undefined,
                  }));
                }
              }}
              placeholder="5"
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink placeholder:text-ceashyr-muted focus:outline-none transition ${
                formErrors.minStock
                  ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                  : "border-ceashyr-border bg-ceashyr-field focus:border-ceashyr-orange"
              }`}
            />
            {formErrors.minStock && (
              <p className="mt-1 text-xs font-medium text-ceashyr-red">
                {formErrors.minStock}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-32 h-11 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-sm font-semibold hover:bg-ceashyr-field transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 h-11 rounded-xl bg-ceashyr-orange text-white text-sm font-semibold hover:brightness-105 transition disabled:opacity-60"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {/* Panel Pratinjau Kartu Produk */}
      <SurfaceCard as="aside" className="lg:col-span-5 p-5 md:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-ceashyr-ink">
            Pratinjau Kartu Produk
          </h2>
          <p className="text-xs text-ceashyr-muted mt-0.5">
            Tampilan produk &amp; indikator stok setelah disimpan:
          </p>
        </div>

        <ProductCard
          product={previewProduct}
          badgeText={
            hasValidationError
              ? "Error"
              : isFormValidPreview && previewStockStatus === "low"
                ? "Menipis"
                : isFormValidPreview
                  ? "Siap Simpan"
                  : "Draft"
          }
          badgeVariant={
            hasValidationError
              ? "orange"
              : isFormValidPreview && previewStockStatus === "low"
                ? "orange"
                : isFormValidPreview
                  ? "green"
                  : "muted"
          }
        />

        {stock.trim() !== "" && previewStockStatus !== "ok" && (
          <StatusBanner variant="warning" className="text-xs py-2.5">
            ⚠ Stok awal ({resolvedStock}) sudah mencapai/di bawah batas minimum (
            {resolvedMinStock}) — produk akan langsung ditandai hampir habis.
          </StatusBanner>
        )}

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
          <p>• Batas stok minimum wajib angka bulat ≥ 0</p>
        </div>
      </SurfaceCard>
    </div>
  );
}
