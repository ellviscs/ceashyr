"use client";

import React, { useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { validateProductForm } from "@/lib/validators";
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
 * Form Tambah Produk beserta panel live preview kartu produk (US-01).
 */
export function ProductForm({
  onCreateProduct,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateProductForm({ name, price, stock });
    if (
      clientErrors.banner ||
      clientErrors.name ||
      clientErrors.price ||
      clientErrors.stock
    ) {
      setFormErrors(clientErrors);
      return;
    }

    setIsSaving(true);
    try {
      const res = await onCreateProduct({ name, price, stock });
      if (!res.ok) {
        setFormErrors(res.errors);
        return;
      }

      setName("");
      setPrice("");
      setStock("");
      setFormErrors({});
      onSuccess(res);
    } finally {
      setIsSaving(false);
    }
  };

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
            Lengkapi data produk baru sebelum disimpan ke database.
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
      </SurfaceCard>
    </div>
  );
}
