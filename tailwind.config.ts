import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "16px", md: "24px", lg: "32px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        sf: {
          red: "#EE4D2D",
          "red-dark": "#D73211",
          "red-light": "#FF6633",
          orange: "#FF6036",
          bg: "#F5F5F5",
          card: "#FFFFFF",
          text: "#333333",
          "text-secondary": "#888888",
          "text-light": "#BBBBBB",
          border: "#E8E8E8",
          star: "#FFC107",
          green: "#00AB56",
          promo: "#FFEDDF",
        },
        brand: {
          50: "#FFF3EE",
          100: "#FFE0D4",
          200: "#FFC1A8",
          300: "#FFA07C",
          400: "#FF7D50",
          500: "#EE4D2D",
          600: "#D73211",
          700: "#B52A0E",
          800: "#93220B",
          900: "#5C1507",
        },
        secondary: {
          DEFAULT: "#64748b",
          light: "#d0e1fb",
          dark: "#505f76",
        },
        surface: {
          DEFAULT: "#F5F5F5",
          dim: "#d0dbed",
          lowest: "#ffffff",
          low: "#FAFAFA",
          container: "#F0F0F0",
          high: "#E8E8E8",
          highest: "#D9D9D9",
        },
        ink: {
          DEFAULT: "#333333",
          variant: "#666666",
          inverse: "#FFFFFF",
        },
        outline: {
          DEFAULT: "#BBBBBB",
          variant: "#E8E8E8",
        },
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06)",
        hover: "0 4px 12px rgba(0,0,0,0.1)",
        overlay: "0 -2px 12px rgba(0,0,0,0.08)",
        bottom: "0 -1px 6px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      maxWidth: {
        container: "960px",
      },
    },
  },
  plugins: [],
};
export default config;
