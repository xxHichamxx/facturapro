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
          DEFAULT: "#0071e3",
          dark: "#0066cc",
          light: "#409cff",
        },
        "primary-dark": "#1d1d1f",
        success: {
          DEFAULT: "#34c759",
          dark: "#248a3d",
        },
        alert: {
          DEFAULT: "#ff3b30",
          dark: "#d32f2f",
        },
        neutral: "#f5f5f7",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "\"SF Pro Display\"",
          "\"SF Pro Text\"",
          "\"Helvetica Neue\"",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        body: ["15px", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};
export default config;

