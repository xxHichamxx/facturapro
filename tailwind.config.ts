import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#008060",
          dark: "#006e52",
          light: "#009671",
        },
        "primary-dark": "#202223",
        success: {
          DEFAULT: "#007f5f",
          dark: "#005e45",
        },
        alert: {
          DEFAULT: "#d82c0d",
          dark: "#b2230b",
        },
        warning: "#ffc453",
        neutral: "#f6f6f7",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        ring: "var(--ring)",
        shopify: {
          surface: "#ffffff",
          "surface-subdued": "#f6f6f7",
          "surface-hover": "#f1f1f2",
          "surface-pressed": "#ececee",
          text: "#202223",
          "text-subdued": "#6d7175",
          "text-disabled": "#8c9196",
          border: "#d2d5d8",
          "border-strong": "#8c9196",
          icon: "#5c5f62",
          interactive: "#f1f1f2",
          "interactive-hover": "#e4e5e7",
          focus: "#008060",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Roboto",
          "\"Helvetica Neue\"",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        body: ["14px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.05)",
        popover: "0 4px 8px rgba(0,0,0,0.08)",
        modal: "0 24px 48px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [animate],
};
export default config;
