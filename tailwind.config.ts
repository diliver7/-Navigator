import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#05070f",
        surface: "#0a0f1d",
        elevated: "#101830",
        line: "rgba(148, 163, 184, 0.14)",
        brand: {
          DEFAULT: "#6f8cff",
          soft: "#9db2ff",
          deep: "#4c63d2",
        },
        mint: "#4fe3c1",
        violet: "#a78bfa",
        amber: "#f7b267",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(111, 140, 255, 0.55)",
        card: "0 30px 90px -45px rgba(0, 0, 0, 0.95)",
        mint: "0 0 50px -18px rgba(79, 227, 193, 0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(40px,-30px,0) scale(1.06)" },
          "66%": { transform: "translate3d(-30px,20px,0) scale(0.96)" },
        },
        orbit: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.75)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "grid-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.45" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        orbit: "orbit 26s linear infinite",
        shimmer: "shimmer 3.2s linear infinite",
        "pulse-ring": "pulse-ring 2.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "grid-move": "grid-move 12s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        blink: "blink 1.1s step-end infinite",
        "slide-in": "slide-in 0.35s ease-out both",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
