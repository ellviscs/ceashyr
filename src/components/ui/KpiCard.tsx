import React from "react";

export type KpiValueTone = "ink" | "orange" | "green";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  valueTone?: KpiValueTone;
  valueClassName?: string;
}

const TONE_CLASSES: Record<KpiValueTone, string> = {
  ink: "text-ceashyr-ink",
  orange: "text-ceashyr-orange",
  green: "text-ceashyr-green",
};

/**
 * Kartu ringkasan KPI standar pada Beranda Ketua KWU dan Laporan Penjualan.
 */
export function KpiCard({
  label,
  value,
  subtitle,
  valueTone = "ink",
  valueClassName = "text-xl",
}: KpiCardProps) {
  return (
    <div className="rounded-[16px] bg-ceashyr-cream border border-ceashyr-border p-4 shadow-ceashyr-card">
      <p className="text-xs text-ceashyr-muted">{label}</p>
      <p className={`font-bold mt-1 ${valueClassName} ${TONE_CLASSES[valueTone]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-ceashyr-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
