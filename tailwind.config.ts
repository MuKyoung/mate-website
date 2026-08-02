import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
      colors: {
        // 2026 비비드 디자인 토큰 — 일렉트릭 블루 + 라임
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#ffffff",
        surface: "#f4f3ff",
        ink: {
          DEFAULT: "#0f0f19",
          2: "#5b5b6b",
          3: "#858594",
        },
        faint: "#b3b3c2",
        hairline: "#e6e4f2",
        "border-strong": "#cfcbe8",
        brand: {
          DEFAULT: "#4f46ff",
          hover: "#3d33e8",
          tint: "#ecebff",
        },
        lime: {
          DEFAULT: "#d4ff3d",
          ink: "#4a5400",
        },
        success: { DEFAULT: "#12b76a", tint: "#d3f8df" },
        danger: { DEFAULT: "#f04438", tint: "#fee4e2" },
        info: { tint: "#ecebff" },
        warning: { tint: "#fef0c7" },
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
