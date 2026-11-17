import React from "react";
import type { Product } from "@/types";
import { formatRupiah, formatStockLabel } from "@/lib/formatters";

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  badgeText?: string;
  badgeVariant?: "orange" | "green" | "muted";
  rightSubtleLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const BADGE_CLASSES = {
  orange: "bg-ceashyr-orange text-white",
  green: "bg-ceashyr-green text-white",
  muted: "bg-ceashyr-muted text-white",
};

/**
 * Kartu produk horizontal kotak sesuai desain `#465947` pada Figma `1331:4912`.
 * - Nama produk di kiri atas, badge opsional di kanan atas (`BARU`, `Dipilih`, `+ Tambah`)
 * - Harga jual (`Rp4.000`) di kiri bawah, sisa stok (`Stok 15`) sejajar di kanan bawah
 */
export function ProductCard({
  product,
  selected = false,
  badgeText,
  badgeVariant = "orange",
  rightSubtleLabel,
  onClick,
  disabled = false,
}: ProductCardProps) {
  const isNewHighlighted = product.isNew && !selected;
  const resolvedBadge = badgeText ?? (product.isNew ? "BARU" : undefined);

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      className={`w-full h-[148px] rounded-[16px] bg-ceashyr-forest px-5 py-[18px] flex flex-col justify-between text-left shadow-ceashyr-box transition-all ${
        selected
          ? "ring-2 ring-ceashyr-orange border-2 border-ceashyr-orange"
          : isNewHighlighted
            ? "ring-2 ring-ceashyr-green border-2 border-ceashyr-green"
            : "border border-transparent"
      } ${
        onClick && !disabled
          ? "cursor-pointer hover:brightness-110 active:scale-[0.99]"
          : ""
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <span className="text-[15px] font-semibold text-white leading-snug line-clamp-2">
          {product.name}
        </span>

        {resolvedBadge && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
              BADGE_CLASSES[badgeVariant]
            }`}
          >
            {resolvedBadge}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 w-full">
        <span className="text-sm font-normal text-ceashyr-forest-sub">
          {formatRupiah(product.price, false)}
        </span>
        <span className="text-[13px] font-semibold text-white">
          {rightSubtleLabel ?? formatStockLabel(product.stock)}
        </span>
      </div>
    </Wrapper>
  );
}
