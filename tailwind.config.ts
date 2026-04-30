import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6f8",
          100: "#e6ebef",
          200: "#c7d1d9",
          300: "#9caab6",
          400: "#6c7d8b",
          500: "#4a5b69",
          600: "#36444f",
          700: "#26323b",
          800: "#19222a",
          900: "#0d1419",
        },
        accent: {
          400: "#3eb6a3",
          500: "#1f9b87",
          600: "#0d8674",
        },
        warn: {
          500: "#d97706",
        },
        danger: {
          500: "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
