import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // 공용 클래스 문자열이 여기에 있으므로 반드시 스캔해야 한다 (미포함 시 purge됨)
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
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
        // 엔터프라이즈 프리미엄 토큰
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#ffffff",
        surface: { DEFAULT: "#f4f6f8", 2: "#eaedf1" },
        ink: {
          DEFAULT: "#191f28",
          2: "#4e5968",
          3: "#6b7684",
        },
        faint: "#adb5bd",
        hairline: "#e5e8eb",
        "border-strong": "#d1d6db",
        brand: {
          DEFAULT: "#3182f6",
          dark: "#1b64da",
          tint: "#e8f3ff",
        },
        success: { DEFAULT: "#12b76a", tint: "#d3f8df" },
        danger: { DEFAULT: "#f04438", tint: "#fee4e2" },
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(25, 31, 40, 0.05)",
        "card-hover": "0 12px 32px rgba(25, 31, 40, 0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
