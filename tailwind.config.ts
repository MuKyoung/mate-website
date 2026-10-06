import type { Config } from "tailwindcss";

/**
 * MATE Design System — Tailwind 바인딩
 *
 * 색은 CSS 변수(globals.css `:root`)가 단일 원천이고 여기서는 이름만 노출한다.
 * 변수 하나만 바꾸면 Tailwind 클래스·소재 클래스가 동시에 따라온다.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // 공용 클래스 문자열이 여기에 있으므로 반드시 스캔해야 한다 (미포함 시 purge됨)
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // ── Grid System — PC 1920 기준 / inner 1500 / gutter 16 / 12 columns ──
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2.5rem" },
      screens: { "2xl": "1500px" },
    },
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

      // ── Color System ─────────────────────────────────────────
      colors: {
        // primary — 딥 인디고. 숫자가 커질수록 어두워진다.
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          DEFAULT: "var(--primary-200)",
        },
        // gray — 쿨 뉴트럴. 50 화이트 → 600 텍스트 블랙/다크 캔버스.
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
        },
        // point — 앰버. 한 화면에 한 번만 쓰는 강조색.
        point: {
          100: "var(--point-100)",
          200: "var(--point-200)",
          300: "var(--point-300)",
          DEFAULT: "var(--point-200)",
        },

        // 시맨틱 별칭 — 컴포넌트는 되도록 이쪽을 쓴다.
        canvas: "var(--canvas)",
        background: "var(--canvas)",
        foreground: "var(--text-1)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)" },
        ink: { DEFAULT: "var(--text-1)", 2: "var(--text-2)", 3: "var(--text-3)" },
        faint: "var(--text-faint)",
        hairline: "var(--border)",
        "border-strong": "var(--border-2)",
        brand: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          tint: "var(--accent-tint)",
        },
        success: { DEFAULT: "var(--success)", tint: "var(--success-tint)" },
        danger: { DEFAULT: "var(--danger)", tint: "var(--danger-tint)" },
      },

      // ── Typography — Figma 스케일과 1:1 (LS -0.3%) ────────────
      fontSize: {
        d1: ["clamp(2.5rem, 10vw, 9rem)", { lineHeight: "0.98", letterSpacing: "-0.04em", fontWeight: "800" }],
        d2: ["clamp(2.25rem, 6vw, 4.75rem)", { lineHeight: "1.04", letterSpacing: "-0.03em", fontWeight: "800" }],
        h1: ["clamp(2rem, 4.4vw, 3.5rem)", { lineHeight: "1.3", letterSpacing: "-0.003em", fontWeight: "700" }],
        h2: ["clamp(1.5rem, 2.6vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.003em", fontWeight: "700" }],
        h3: ["clamp(1.5rem, 2.6vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.003em", fontWeight: "500" }],
        b1: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "700" }],
        b2: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "700" }],
        b3: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "500" }],
        b4: ["0.875rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "700" }],
        c1: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "400" }],
        c2: ["0.75rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "400" }],
      },

      // ── Shape ────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "10px", // Figma 카드 기준값
        card: "10px",
        pill: "9999px",
      },
      boxShadow: {
        card: "none",
        "card-hover": "0 12px 32px rgba(0, 0, 0, 0.35)",
      },

      // 12칼럼 그리드 / gutter 16px
      gap: { gutter: "16px" },
      maxWidth: { inner: "1500px" },
    },
  },
  plugins: [],
};
export default config;
