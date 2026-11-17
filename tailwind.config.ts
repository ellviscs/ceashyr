import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ceashyr-mint": "#EBF4E8",
        "ceashyr-cream": "#FFFDF9",
        "ceashyr-forest": "#465947",
        "ceashyr-forest-sub": "#D6E3D9",
        "ceashyr-green": "#2D7A53",
        "ceashyr-green-soft": "#E7F5EC",
        "ceashyr-orange": "#E86339",
        "ceashyr-peach": "#FDECE6",
        "ceashyr-amber-bg": "#FFF6E5",
        "ceashyr-amber-border": "#D9822B",
        "ceashyr-amber-ink": "#8A5111",
        "ceashyr-ink": "#1F2024",
        "ceashyr-muted": "#71727A",
        "ceashyr-border": "#E3E5EA",
        "ceashyr-field": "#F9FAFB",
        "ceashyr-red": "#ED3241",
        "ceashyr-red-soft": "#FDECEC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "ceashyr-card": "0 4px 14px rgba(20, 31, 23, 0.10)",
        "ceashyr-box": "0 4px 10px rgba(20, 31, 23, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
