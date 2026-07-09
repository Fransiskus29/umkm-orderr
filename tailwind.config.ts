import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "16px", md: "20px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ffdbce",
          100: "#ffb599",
          400: "#cc4900",
          500: "#ea580c",
          600: "#a73a00",
          700: "#a33900",
          800: "#7f2b00",
          900: "#370e00",
        },
        secondary: {
          DEFAULT: "#64748b",
          light: "#d0e1fb",
          dark: "#505f76",
        },
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#d0dbed",
          lowest: "#ffffff",
          low: "#eff4ff",
          container: "#e6eeff",
          high: "#dee9fc",
          highest: "#d9e3f6",
        },
        ink: {
          DEFAULT: "#121c2a",
          variant: "#5a4138",
          inverse: "#27313f",
        },
        outline: {
          DEFAULT: "#8e7166",
          variant: "#e2bfb2",
        },
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03)",
        hover: "0 10px 15px -3px rgba(0,0,0,0.08)",
        overlay: "0 20px 25px -5px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
