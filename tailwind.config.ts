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
        ink: "#0f172a",
        slatepanel: "#111827",
        steel: "#334155",
        signal: "#f97316",
        mint: "#10b981",
        alert: "#ef4444",
        gold: "#f59e0b",
      },
      fontFamily: {
        sans: ["Segoe UI", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        panel: "0 14px 40px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
