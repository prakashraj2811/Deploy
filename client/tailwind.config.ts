import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7f5",
          100: "#ffece7",
          200: "#ffd4c7",
          300: "#ffb2a0",
          400: "#ff8969",
          500: "#f9633c", // primary — warm, premium, trustworthy
          600: "#e0481f",
          700: "#b93818",
          800: "#932e18",
          900: "#762918",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e1",
          300: "#b0b8c6",
          400: "#8590a5",
          500: "#66728a",
          600: "#525c71",
          700: "#434b5c",
          800: "#3a404e",
          900: "#22252d",
        },
        gold: {
          400: "#e8c77e",
          500: "#d4a94f",
          600: "#b4893a",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(34, 37, 45, 0.06), 0 1px 2px rgba(34, 37, 45, 0.04)",
        elevated: "0 12px 32px rgba(34, 37, 45, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
