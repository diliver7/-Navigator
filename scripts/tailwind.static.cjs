/**
 * 静态版 index.html 专用 Tailwind 配置。
 * 颜色与阴影刻意与原先 CDN 版 tailwind.config 保持一致，避免换成编译版后配色变化。
 * 用法：npx tailwindcss -c scripts/tailwind.static.cjs -i scripts/tailwind.input.css -o <out> --minify
 */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        base: "#070b16",
        surface: "#0b1222",
        elevated: "#111a30",
        line: "rgba(148,163,184,0.14)",
        brand: "#6d7cff",
        "brand-soft": "#9db2ff",
        mint: "#34d399",
        amber: "#fbbf24",
        glow: "#00f2ea",
        "glow-soft": "#7ef7f2",
        ember: "#ff0576",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', "SimSun", "serif"],
      },
      boxShadow: {
        card: "0 18px 50px -18px rgba(6,10,24,0.85)",
        glow: "0 0 42px rgba(109,124,255,0.35)",
        "glow-mint": "0 0 28px rgba(52,211,153,0.28)",
        "glow-cyan": "0 0 34px rgba(0,242,234,0.28)",
      },
    },
  },
  plugins: [],
};
