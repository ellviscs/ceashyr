"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { toLocalDateKey } from "@/lib/reports/sales-report";
import { dataProvider } from "@/services";
import type { ClosingStockRecordItem, Product, Transaction } from "@/types";

export interface DailyClosingRow {
  product: Product;
  openingStock: number;
  rawInput: string;
  remainingStock: number;
  soldQty: number;
  subtotal: number;
  fieldError?: string;
}

export interface UseDailyClosingResult {
  todayKey: string;
  products: Product[];
  todayClosing: Transaction | null;
  isAlreadyClosedToday: boolean;
  rows: DailyClosingRow[];
  soldRows: DailyClosingRow[];
  totalSoldItems: number;
  totalRevenue: number;
  hasValidationErrors: boolean;
  submitError: string | null;
  isLoading: boolean;
  isSaving: boolean;
  setRemainingInput: (productId: string, value: string) => void;
  stepRemaining: (productId: string, delta: number) => void;
  resetDraft: () => void;
  submitDailyClosing: (cashierEmail?: string) => Promise<boolean>;
}

/**
 * Hook pencatatan penjualan harian berbasis selisih stok sistem dan sisa stok fisik
 * sebelum toko ditutup (`soldQty = openingStock - remainingStock`, 1x per hari).
 */
export function useDailyClosing(): UseDailyClosingResult {
  const [todayKey] = useState<string>(() => toLocalDateKey(new Date()));
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [todayClosing, setTodayClosing] = useState<Transaction | null>(null);
  const [remainingInputs, setRemainingInputs] = useState<
    Record<string, string>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      dataProvider.products.list(),
      dataProvider.transactions.getDailyClosing(todayKey),
    ]).then(([loadedProducts, existingClosing]) => {
      if (!active) return;
      setProducts(loadedProducts);
      setTodayClosing(existingClosing);
      const initialInputs: Record<string, string> = {};
      for (const product of loadedProducts) {
        initialInputs[product.id] = String(product.stock);
      }
      setRemainingInputs(initialInputs);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [todayKey]);

  const isAlreadyClosedToday = Boolean(todayClosing);

  const closingItemMap = useMemo(() => {
    const map = new Map<string, ClosingStockRecordItem>();
    for (const item of todayClosing?.closingItems ?? []) {
      map.set(item.productId, item);
    }
    return map;
  }, [todayClosing]);

  const rows: DailyClosingRow[] = useMemo(() => {
    return products.map((product) => {
      if (isAlreadyClosedToday) {
        const recorded = closingItemMap.get(product.id);
        const openingStock = recorded ? recorded.openingStock : product.stock;
        const remainingStock = recorded
          ? recorded.remainingStock
          : product.stock;
        const soldQty = recorded ? recorded.soldQty : 0;
        const subtotal = recorded ? recorded.subtotal : 0;
        return {
          product,
          openingStock,
          rawInput: String(remainingStock),
          remainingStock,
          soldQty,
          subtotal,
        };
      }

      const openingStock = product.stock;
      const rawInput = remainingInputs[product.id] ?? String(openingStock);
      const trimmed = rawInput.trim();

      if (trimmed === "") {
        return {
          product,
          openingStock,
          rawInput,
          remainingStock: openingStock,
          soldQty: 0,
          subtotal: 0,
          fieldError: `Wajib diisi (0 s.d. ${openingStock}).`,
        };
      }

      if (!/^\d+$/.test(trimmed)) {
        return {
          product,
          openingStock,
          rawInput,
          remainingStock: openingStock,
          soldQty: 0,
          subtotal: 0,
          fieldError: "Masukkan angka bulat ≥ 0.",
        };
      }

      const parsed = Number(trimmed);
      if (parsed > openingStock) {
        return {
          product,
          openingStock,
          rawInput,
          remainingStock: parsed,
          soldQty: 0,
          subtotal: 0,
          fieldError: `Melebihi stok di sistem (${openingStock}).`,
        };
      }

      const soldQty = openingStock - parsed;
      return {
        product,
        openingStock,
        rawInput,
        remainingStock: parsed,
        soldQty,
        subtotal: soldQty * product.price,
      };
    });
  }, [products, remainingInputs, isAlreadyClosedToday, closingItemMap]);

  const soldRows = useMemo(
    () => rows.filter((row) => row.soldQty > 0),
    [rows]
  );

  const totalSoldItems = useMemo(
    () => soldRows.reduce((sum, row) => sum + row.soldQty, 0),
    [soldRows]
  );

  const totalRevenue = useMemo(
    () => soldRows.reduce((sum, row) => sum + row.subtotal, 0),
    [soldRows]
  );

  const hasValidationErrors = useMemo(
    () => rows.some((row) => Boolean(row.fieldError)),
    [rows]
  );

  const setRemainingInput = useCallback((productId: string, value: string) => {
    setSubmitError(null);
    setRemainingInputs((prev) => ({
      ...prev,
      [productId]: value,
    }));
  }, []);

  const stepRemaining = useCallback(
    (productId: string, delta: number) => {
      setSubmitError(null);
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      setRemainingInputs((prev) => {
        const raw = (prev[productId] ?? String(product.stock)).trim();
        const current = /^\d+$/.test(raw) ? Number(raw) : product.stock;
        const next = Math.min(product.stock, Math.max(0, current + delta));
        return {
          ...prev,
          [productId]: String(next),
        };
      });
    },
    [products]
  );

  const resetDraft = useCallback(() => {
    setSubmitError(null);
    const resetInputs: Record<string, string> = {};
    for (const product of products) {
      resetInputs[product.id] = String(product.stock);
    }
    setRemainingInputs(resetInputs);
  }, [products]);

  const submitDailyClosing = useCallback(
    async (cashierEmail?: string) => {
      setSubmitError(null);

      if (hasValidationErrors) {
        setSubmitError(
          "Periksa kembali input sisa stok yang belum valid sebelum menutup toko."
        );
        return false;
      }

      if (soldRows.length === 0) {
        setSubmitError(
          "Belum ada produk terjual (semua sisa stok masih sama dengan stok di sistem). Ubah sisa stok fisik minimal 1 produk."
        );
        return false;
      }

      setIsSaving(true);
      try {
        const res = await dataProvider.transactions.recordDailyClosing({
          dateKey: todayKey,
          cashierEmail: cashierEmail || "kasir@gmail.com",
          items: rows.map((row) => ({
            productId: row.product.id,
            remainingStock: row.remainingStock,
          })),
        });

        if (!res.ok) {
          setSubmitError(res.error);
          return false;
        }

        setProducts(res.products);
        setTodayClosing(res.transaction);
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [hasValidationErrors, soldRows.length, todayKey, rows]
  );

  return {
    todayKey,
    products,
    todayClosing,
    isAlreadyClosedToday,
    rows,
    soldRows,
    totalSoldItems,
    totalRevenue,
    hasValidationErrors,
    submitError,
    isLoading,
    isSaving,
    setRemainingInput,
    stepRemaining,
    resetDraft,
    submitDailyClosing,
  };
}
