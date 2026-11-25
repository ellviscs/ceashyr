"use client";

import React, { useEffect, useState } from "react";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { getProductStockStatus } from "@/features/products/stock-status";
import {
  parseNonNegativeIntegerInput,
  validateProductEditForm,
} from "@/lib/validators";
import type {
  Product,
  ProductFormErrors,
  ProductUpdateInput,
  UpdateProductResult,
} from "@/types";

interface EditProductModalProps {
  product: Product;
  onSave: (id: string, input: ProductUpdateInput) => Promise<UpdateProductResult>;
  onSuccess: (result: Extract<UpdateProductResult, { ok: true }>) => void;
  onCancel: () => void;
}

/**
 * Modal Edit Produk mengikuti desain Figma `node-id=1527-2424` ("Tampilan edit"):
 * - Otomatis terisi nama, harga jual, jumlah minimum stok, dan stok saat ini
 * - Validasi input & pratinjau status stok minimum
 * - Pembaruan harga hanya berlaku untuk transaksi baru (riwayat transaksi lama tetap)
 */
export function EditProductModal({
  product,
  onSave,
  onSuccess,
  onCancel,
}: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [minStock, setMinStock] = useState(String(product.minStock));
  const [stock, setStock] = useState(String(product.stock));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(product.name);
    setPrice(String(product.price));
    setMinStock(String(product.minStock));
    setStock(String(product.stock));
    setErrors({});
  }, [product]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, isSaving]);

  const handleStepStock = (delta: number) => {
    const parsed = parseNonNegativeIntegerInput(stock);
    const current = Number.isFinite(parsed) ? parsed : product.stock;
    const next = Math.max(0, current + delta);
    setStock(String(next));
    if (errors.stock || errors.banner) {
      setErrors((prev) => ({ ...prev, stock: undefined, banner: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductUpdateInput = { name, price, minStock, stock };
    const clientErrors = validateProductEditForm(payload);
    if (
      clientErrors.banner ||
      clientErrors.name ||
      clientErrors.price ||
      clientErrors.stock ||
      clientErrors.minStock
    ) {
      setErrors(clientErrors);
      return;
    }

    setIsSaving(true);
    try {
      const res = await onSave(product.id, payload);
      if (!res.ok) {
        setErrors(res.errors);
        return;
      }
      onSuccess(res);
    } finally {
      setIsSaving(false);
    }
  };

  const parsedStock = parseNonNegativeIntegerInput(stock);
  const parsedMinStock = parseNonNegativeIntegerInput(minStock);
  const previewStatus =
    Number.isFinite(parsedStock) && Number.isFinite(parsedMinStock)
      ? getProductStockStatus(parsedStock, parsedMinStock)
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onCancel();
        }
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[520px] rounded-[20px] bg-white border border-ceashyr-border p-5 sm:p-6 shadow-ceashyr-card space-y-4">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="edit-product-title"
              className="text-xl font-bold text-ceashyr-ink"
            >
              Edit Produk
            </h2>
            <p className="text-xs text-ceashyr-muted mt-0.5">
              Perbarui detail produk atau harga jual di kantin
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Tutup modal edit produk"
            className="w-8 h-8 rounded-full bg-ceashyr-orange text-white text-sm font-bold flex items-center justify-center hover:brightness-105 transition shrink-0"
          >
            ✕
          </button>
        </div>

        {errors.banner && (
          <StatusBanner variant="error" className="text-xs py-2.5">
            {errors.banner}
          </StatusBanner>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Nama Produk */}
          <div>
            <label
              htmlFor="edit-prod-name"
              className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
            >
              Nama Produk
            </label>
            <input
              id="edit-prod-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name || errors.banner) {
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                    banner: undefined,
                  }));
                }
              }}
              placeholder="Contoh: Bang - Bang"
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink focus:outline-none transition ${
                errors.name
                  ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                  : "border-ceashyr-border bg-white focus:border-ceashyr-orange"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-ceashyr-red">
                {errors.name}
              </p>
            )}
          </div>

          {/* Harga Jual */}
          <div>
            <label
              htmlFor="edit-prod-price"
              className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
            >
              Harga Jual
            </label>
            <div
              className={`flex items-center h-11 rounded-xl border px-3.5 gap-2 transition ${
                errors.price
                  ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                  : "border-ceashyr-border bg-white focus-within:border-ceashyr-orange"
              }`}
            >
              <span className="text-sm font-semibold text-ceashyr-muted select-none">
                Rp
              </span>
              <input
                id="edit-prod-price"
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price || errors.banner) {
                    setErrors((prev) => ({
                      ...prev,
                      price: undefined,
                      banner: undefined,
                    }));
                  }
                }}
                placeholder="2500"
                className="w-full bg-transparent text-sm text-ceashyr-ink focus:outline-none"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-xs font-medium text-ceashyr-red">
                {errors.price}
              </p>
            )}
          </div>

          {/* Jumlah Minimum Stok & Stepper Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label
                htmlFor="edit-prod-min-stock"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Jumlah Minimum Stok
              </label>
              <input
                id="edit-prod-min-stock"
                type="text"
                inputMode="numeric"
                value={minStock}
                onChange={(e) => {
                  setMinStock(e.target.value);
                  if (errors.minStock || errors.banner) {
                    setErrors((prev) => ({
                      ...prev,
                      minStock: undefined,
                      banner: undefined,
                    }));
                  }
                }}
                placeholder="5"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-ceashyr-ink focus:outline-none transition ${
                  errors.minStock
                    ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                    : "border-ceashyr-border bg-white focus:border-ceashyr-orange"
                }`}
              />
              {errors.minStock && (
                <p className="mt-1 text-xs font-medium text-ceashyr-red">
                  {errors.minStock}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-prod-stock"
                className="block text-xs font-semibold text-ceashyr-ink mb-1.5"
              >
                Stok
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepStock(-1)}
                  aria-label="Kurangi stok"
                  className="w-9 h-9 rounded-full bg-ceashyr-orange text-white font-bold text-base flex items-center justify-center hover:brightness-105 transition shrink-0"
                >
                  −
                </button>
                <input
                  id="edit-prod-stock"
                  type="text"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    if (errors.stock || errors.banner) {
                      setErrors((prev) => ({
                        ...prev,
                        stock: undefined,
                        banner: undefined,
                      }));
                    }
                  }}
                  className={`w-full h-11 px-2.5 rounded-xl border text-center text-sm font-bold text-ceashyr-ink focus:outline-none transition ${
                    errors.stock
                      ? "border-ceashyr-red bg-ceashyr-red-soft/50"
                      : "border-ceashyr-border bg-white focus:border-ceashyr-orange"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleStepStock(1)}
                  aria-label="Tambah stok"
                  className="w-9 h-9 rounded-full bg-ceashyr-orange text-white font-bold text-base flex items-center justify-center hover:brightness-105 transition shrink-0"
                >
                  +
                </button>
              </div>
              {errors.stock && (
                <p className="mt-1 text-xs font-medium text-ceashyr-red">
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Indikator Live Status Stok & Catatan Immutabilitas Riwayat */}
          <div className="rounded-xl bg-ceashyr-field border border-ceashyr-border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-ceashyr-muted">
              Harga baru hanya berlaku untuk transaksi berikutnya.
            </span>
            {previewStatus && (
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold ${
                  previewStatus === "out"
                    ? "bg-ceashyr-red-soft text-ceashyr-red"
                    : previewStatus === "low"
                      ? "bg-ceashyr-amber-bg text-ceashyr-amber-ink"
                      : "bg-ceashyr-green-soft text-ceashyr-green"
                }`}
              >
                {previewStatus === "out"
                  ? "Status: Stok Habis"
                  : previewStatus === "low"
                    ? "Status: Hampir Habis (≤ Min)"
                    : "Status: Stok Aman"}
              </span>
            )}
          </div>

          {/* Tombol Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-5 h-10 rounded-xl bg-white border border-ceashyr-border text-ceashyr-ink text-xs font-semibold hover:bg-ceashyr-field transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 h-10 rounded-xl bg-ceashyr-orange text-white text-xs font-semibold hover:brightness-105 transition disabled:opacity-60"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
