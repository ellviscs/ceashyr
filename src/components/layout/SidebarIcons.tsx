"use client";

import React, { useId } from "react";

interface IconProps {
  active?: boolean;
  className?: string;
}

/**
 * Avatar kontak default lingkaran dengan siluet orang (#E86339 di latar #FDECE6).
 * Diekstrak dari Figma node `1331:5701`, memakai clipPath ID unik per instance.
 */
export function AvatarSilhouetteIcon({ className }: { className?: string }) {
  const clipId = useId();
  const svgClassName = ["rounded-full overflow-hidden", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
      aria-hidden="true"
    >
      <g clipPath={`url(#${clipId})`}>
        <rect width="44" height="44" rx="22" fill="#FDECE6" />
        <path
          d="M22 23C25.866 23 29 19.866 29 16C29 12.134 25.866 9 22 9C18.134 9 15 12.134 15 16C15 19.866 18.134 23 22 23Z"
          fill="#E86339"
        />
        <path
          d="M8.5 44V39.5C8.5 32.5 14.5 27.5 22 27.5C29.5 27.5 35.5 32.5 35.5 39.5V44H8.5Z"
          fill="#E86339"
        />
      </g>
      <rect
        x="0.75"
        y="0.75"
        width="42.5"
        height="42.5"
        rx="21.25"
        stroke="#E86339"
        strokeWidth="1.5"
      />
      <defs>
        <clipPath id={clipId}>
          <rect width="44" height="44" rx="22" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Ikon Beranda / Dashboard (khusus Ketua KWU). Figma node `1331:5707`.
 */
export function DashboardGridIcon({ active = false, className }: IconProps) {
  const stroke = active ? "#E86339" : "#1F2024";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.08333 2.5H3.75C3.05964 2.5 2.5 3.05964 2.5 3.75V7.08333C2.5 7.77369 3.05964 8.33333 3.75 8.33333H7.08333C7.77369 8.33333 8.33333 7.77369 8.33333 7.08333V3.75C8.33333 3.05964 7.77369 2.5 7.08333 2.5Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
      <path
        d="M16.2503 2.5H12.917C12.2266 2.5 11.667 3.05964 11.667 3.75V7.08333C11.667 7.77369 12.2266 8.33333 12.917 8.33333H16.2503C16.9407 8.33333 17.5003 7.77369 17.5003 7.08333V3.75C17.5003 3.05964 16.9407 2.5 16.2503 2.5Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
      <path
        d="M7.08333 11.6667H3.75C3.05964 11.6667 2.5 12.2263 2.5 12.9167V16.25C2.5 16.9403 3.05964 17.5 3.75 17.5H7.08333C7.77369 17.5 8.33333 16.9403 8.33333 16.25V12.9167C8.33333 12.2263 7.77369 11.6667 7.08333 11.6667Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
      <path
        d="M16.2503 11.6667H12.917C12.2266 11.6667 11.667 12.2263 11.667 12.9167V16.25C11.667 16.9403 12.2266 17.5 12.917 17.5H16.2503C16.9407 17.5 17.5003 16.9403 17.5003 16.25V12.9167C17.5003 12.2263 16.9407 11.6667 16.2503 11.6667Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
    </svg>
  );
}

/**
 * Ikon Katalog / Kelola Produk (kubus 3D). Figma node `1331:5713`.
 */
export function ProductCubeIcon({ active = false, className }: IconProps) {
  const stroke = active ? "#E86339" : "#1F2024";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17.5 6.66666C17.4997 6.37438 17.4225 6.08733 17.2763 5.83429C17.13 5.58125 16.9198 5.37112 16.6667 5.22499L10.8333 1.89166C10.58 1.74538 10.2926 1.66837 10 1.66837C9.70744 1.66837 9.42003 1.74538 9.16667 1.89166L3.33333 5.22499C3.08022 5.37112 2.86998 5.58125 2.72372 5.83429C2.57745 6.08733 2.5003 6.37438 2.5 6.66666V13.3333C2.5003 13.6256 2.57745 13.9126 2.72372 14.1657C2.86998 14.4187 3.08022 14.6289 3.33333 14.775L9.16667 18.1083C9.42003 18.2546 9.70744 18.3316 10 18.3316C10.2926 18.3316 10.58 18.2546 10.8333 18.1083L16.6667 14.775C16.9198 14.6289 17.13 14.4187 17.2763 14.1657C17.4225 13.9126 17.4997 13.6256 17.5 13.3333V6.66666Z"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 5.83334L10 10M10 10L17.25 5.83334M10 10V18.3333"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ikon Kasir / Pencatatan Penjualan (keranjang). Figma node `1331:5717`.
 */
export function CashierCartIcon({ active = false, className }: IconProps) {
  const stroke = active ? "#E86339" : "#1F2024";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.66699 18.75C7.35735 18.75 7.91699 18.1904 7.91699 17.5C7.91699 16.8096 7.35735 16.25 6.66699 16.25C5.97664 16.25 5.41699 16.8096 5.41699 17.5C5.41699 18.1904 5.97664 18.75 6.66699 18.75Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
      <path
        d="M15.833 18.75C16.5234 18.75 17.083 18.1904 17.083 17.5C17.083 16.8096 16.5234 16.25 15.833 16.25C15.1427 16.25 14.583 16.8096 14.583 17.5C14.583 18.1904 15.1427 18.75 15.833 18.75Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
      <path
        d="M1.70801 1.70833H3.37467L5.59134 12.0583C5.67266 12.4374 5.88357 12.7762 6.18777 13.0165C6.49197 13.2569 6.87043 13.3836 7.25801 13.375H15.408C15.7873 13.3744 16.1551 13.2444 16.4505 13.0065C16.746 12.7686 16.9515 12.4371 17.033 12.0667L18.408 5.87499H4.26634"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ikon Rekap Kertas / OCR (kamera). Figma node `1331:5722`.
 */
export function PaperOcrCameraIcon({ active = false, className }: IconProps) {
  const stroke = active ? "#E86339" : "#1F2024";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.0837 3.33333H7.91699L5.83366 5.83333H3.33366C2.89163 5.83333 2.46771 6.00892 2.15515 6.32148C1.84259 6.63404 1.66699 7.05797 1.66699 7.49999V15C1.66699 15.442 1.84259 15.8659 2.15515 16.1785C2.46771 16.4911 2.89163 16.6667 3.33366 16.6667H16.667C17.109 16.6667 17.5329 16.4911 17.8455 16.1785C18.1581 15.8659 18.3337 15.442 18.3337 15V7.49999C18.3337 7.05797 18.1581 6.63404 17.8455 6.32148C17.5329 6.00892 17.109 5.83333 16.667 5.83333H14.167L12.0837 3.33333Z"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.3333C11.3807 13.3333 12.5 12.214 12.5 10.8333C12.5 9.45262 11.3807 8.33333 10 8.33333C8.61929 8.33333 7.5 9.45262 7.5 10.8333C7.5 12.214 8.61929 13.3333 10 13.3333Z"
        stroke={stroke}
        strokeWidth="1.66667"
      />
    </svg>
  );
}

/**
 * Ikon Laporan Penjualan (khusus Ketua KWU — US-15).
 */
export function SalesReportIcon({ active = false, className }: IconProps) {
  const stroke = active ? "#E86339" : "#1F2024";
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.5 2.5H5C4.55797 2.5 4.13405 2.67559 3.82149 2.98816C3.50893 3.30072 3.33333 3.72464 3.33333 4.16667V15.8333C3.33333 16.2754 3.50893 16.6993 3.82149 17.0118C4.13405 17.3244 4.55797 17.5 5 17.5H15C15.442 17.5 15.866 17.3244 16.1785 17.0118C16.4911 16.6993 16.6667 16.2754 16.6667 15.8333V6.66667L12.5 2.5Z"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 2.5V6.66667H16.6667"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.66667 14.1667V11.6667M10 14.1667V9.16667M13.3333 14.1667V10.8333"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Ikon Logout (tombol gelap di bawah sidebar). Figma node `1331:5726`.
 */
export function LogoutDoorIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
        stroke="white"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.333 14.1667L17.4997 10L13.333 5.83334"
        stroke="white"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 10H7.5"
        stroke="white"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
