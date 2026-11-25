import React from "react";

interface SurfaceCardProps {
  as?: "div" | "section" | "aside";
  highlight?: boolean;
  className?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

/**
 * Kontainer kartu krem standar Ceashyr (`rounded-[20px]`, latar `#FFFDF9`, shadow ringan).
 */
export function SurfaceCard({
  as = "div",
  highlight = false,
  className = "",
  ariaLabel,
  children,
}: SurfaceCardProps) {
  const Component = as;
  const borderClass = highlight
    ? "border-[1.5px] border-ceashyr-orange"
    : "border border-ceashyr-border";

  return (
    <Component
      aria-label={ariaLabel}
      className={`rounded-[20px] bg-ceashyr-cream ${borderClass} shadow-ceashyr-card ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
