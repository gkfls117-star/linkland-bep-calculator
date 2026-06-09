import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "Noto Sans SC", "sans-serif"],
      },
      colors: {
        ink: "#17201b",
        paper: "#f7f6f1",
        line: "#ded8cb",
        moss: "#4d6b57",
        clay: "#b86945",
        steel: "#466270",
      },
      boxShadow: {
        tight: "0 10px 24px rgba(23, 32, 27, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config
