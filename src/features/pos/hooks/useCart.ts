"use client";

import { useCallback, useEffect, useState } from "react";
import { SEED_PRODUCTS } from "@/constants/seed-data";
import { dataProvider } from "@/services";
import type { CartItem, Product, Transaction } from "@/types";

export interface UseCartResult {
  products: Product[];
  cart: CartItem[];
  lastTransaction: Transaction | null;
  cartError: string | null;
  isSaving: boolean;
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product) => void;
  updateQty: (productId: string, delta: number) => void;
  saveTransaction: (cashierEmail?: string) => Promise<void>;
  startNewSale: () => void;
}

/**
 * Hook pengelolaan keranjang kasir & pencatatan transaksi (US-05 & US-06).
 */
export function useCart(): UseCartResult {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null
  );
  const [cartError, setCartError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    dataProvider.products.list().then((loaded) => {
      if (active) setProducts(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const addToCart = useCallback(
    (product: Product) => {
      setCartError(null);
      if (lastTransaction) {
        setLastTransaction(null);
      }

      if (product.stock <= 0) {
        setCartError(`Stok '${product.name}' habis.`);
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (!existing) {
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              qty: 1,
              subtotal: product.price,
            },
          ];
        }

        if (existing.qty >= product.stock) {
          setCartError(
            `Stok '${product.name}' sudah maksimal (${product.stock}).`
          );
          return prev;
        }

        const nextQty = existing.qty + 1;
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                qty: nextQty,
                subtotal: nextQty * item.unitPrice,
              }
            : item
        );
      });
    },
    [lastTransaction]
  );

  const updateQty = useCallback(
    (productId: string, delta: number) => {
      setCartError(null);
      const product = products.find((p) => p.id === productId);
      const maxStock = product?.stock ?? 0;

      setCart((prev) =>
        prev
          .map((item) => {
            if (item.productId !== productId) return item;
            const nextQty = item.qty + delta;
            if (nextQty <= 0) return null;
            if (nextQty > maxStock) {
              setCartError(
                `Stok '${item.name}' hanya tersisa ${maxStock} unit.`
              );
              return item;
            }
            return {
              ...item,
              qty: nextQty,
              subtotal: nextQty * item.unitPrice,
            };
          })
          .filter((item): item is CartItem => item !== null)
      );
    },
    [products]
  );

  const saveTransaction = useCallback(
    async (cashierEmail?: string) => {
      setCartError(null);
      setIsSaving(true);
      try {
        const res = await dataProvider.transactions.create(
          cart,
          cashierEmail || "kasir@gmail.com"
        );
        if (!res.ok) {
          setCartError(res.error);
          return;
        }

        setProducts(res.products);
        setLastTransaction(res.transaction);
        setCart([]);
      } finally {
        setIsSaving(false);
      }
    },
    [cart]
  );

  const startNewSale = useCallback(() => {
    setLastTransaction(null);
    setCartError(null);
  }, []);

  return {
    products,
    cart,
    lastTransaction,
    cartError,
    isSaving,
    totalItems,
    totalAmount,
    addToCart,
    updateQty,
    saveTransaction,
    startNewSale,
  };
}
