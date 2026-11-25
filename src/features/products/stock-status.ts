import type {
  Product,
  ProductCategoryFilter,
  StockAlertStatus,
} from "@/types";

export const DEFAULT_MIN_STOCK = 5;

/**
 * Menormalkan nilai batas stok minimum agar produk lama di penyimpanan lokal tetap valid.
 */
export function normalizeMinStock(minStock?: number): number {
  if (
    typeof minStock !== "number" ||
    !Number.isFinite(minStock) ||
    minStock < 0
  ) {
    return DEFAULT_MIN_STOCK;
  }
  return Math.floor(minStock);
}

/**
 * Membandingkan jumlah stok aktual terhadap batas stok minimum (`US-09`).
 * - `out`: stok <= 0 (habis)
 * - `low`: 0 < stok <= minStock (menipis / mencapai batas minimum)
 * - `ok`: stok > minStock (aman)
 */
export function getProductStockStatus(
  stock: number,
  minStock: number
): StockAlertStatus {
  const safeStock = Number.isFinite(stock) ? Math.floor(stock) : 0;
  const safeMin = normalizeMinStock(minStock);
  if (safeStock <= 0) return "out";
  if (safeStock <= safeMin) return "low";
  return "ok";
}

/**
 * Mengembalikan `true` bila stok aktual produk sudah mencapai atau di bawah batas minimum.
 */
export function isProductAtOrBelowMinStock(
  product: Pick<Product, "stock" | "minStock">
): boolean {
  return getProductStockStatus(product.stock, product.minStock) !== "ok";
}

export interface StockAlertSummary {
  outOfStock: Product[];
  lowStock: Product[];
  allAlerts: Product[];
}

/**
 * Mengelompokkan produk yang habis dan hampir habis, diurutkan dari yang paling mendesak.
 */
export function getStockAlertSummary(products: Product[]): StockAlertSummary {
  const outOfStock: Product[] = [];
  const lowStock: Product[] = [];

  for (const product of products) {
    const status = getProductStockStatus(product.stock, product.minStock);
    if (status === "out") {
      outOfStock.push(product);
    } else if (status === "low") {
      lowStock.push(product);
    }
  }

  lowStock.sort(
    (a, b) =>
      a.stock - normalizeMinStock(a.minStock) -
      (b.stock - normalizeMinStock(b.minStock))
  );

  return {
    outOfStock,
    lowStock,
    allAlerts: [...outOfStock, ...lowStock],
  };
}

/**
 * Memfilter produk berdasarkan kategori atau status stok menipis.
 */
export function matchesCategoryFilter(
  product: Product,
  filter: ProductCategoryFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "low_stock") {
    return isProductAtOrBelowMinStock(product);
  }
  const cat = (product.category || "").toLowerCase();
  if (filter === "makanan") {
    return cat.includes("makanan") || cat.includes("snack");
  }
  if (filter === "minuman") {
    return cat.includes("minuman");
  }
  return true;
}
