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
        // goorm 라이트 디자인 토큰
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#ffffff",
        surface: "#f7f7f7",
        ink: {
          DEFAULT: "#262626",
          2: "#4c4c4c",
          3: "#5d5d5d",
        },
        faint: "#a3a3a3",
        hairline: "#e1e1e1",
        "border-strong": "#c6c6c6",
        vapor: {
          DEFAULT: "#2a72e5",
          active: "#0957c8",
          link: "#0043b3",
        },
        success: { DEFAULT: "#058765", tint: "#bbecd7" },
        danger: { DEFAULT: "#da3944", tint: "#ffd8d7" },
        info: { tint: "#c6e6ff" },
        warning: { tint: "#ffd9c8" },
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
