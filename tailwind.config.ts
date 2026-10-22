import type { Config } from "tailwindcss";

/**
 * MATE Design System — Tailwind 바인딩
 *
 * 색은 CSS 변수(globals.css `:root`)가 단일 원천이고 여기서는 이름만 노출한다.
 * 변수 하나만 바꾸면 Tailwind 클래스가 함께 따라온다.
 * 체계는 Figma 「(주)세종호이스트크레인 웹사이트 리뉴얼」 디자인 시스템이고, 주요 색만 로고 파랑이다.
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
    extend: {
      fontFamily: {
        // 국문 · 영문 · 숫자 모두 Pretendard (globals.css --font-sans 와 같은 순서)
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },

      // ── Color System ─────────────────────────────────────────
      colors: {
        // point — 로고 파랑. 200 이 로고 색 그대로, 300 은 누름, light 는 어두운 면 위 글자
        point: {
          100: "var(--point-100)",
          200: "var(--point-200)",
          300: "var(--point-300)",
          light: "var(--point-on-dark)",
          DEFAULT: "var(--point-200)",
        },
        // primary — 남색. 400 이 텍스트 블랙
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          DEFAULT: "var(--primary-400)",
        },
        // gray — 쿨 뉴트럴 (Figma 값 그대로)
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
        },
        // 어두운 면
        night: { DEFAULT: "var(--night)", 2: "var(--night-2)" },

        // 시맨틱 별칭 — 컴포넌트는 되도록 이쪽을 쓴다.
        ink: { DEFAULT: "var(--text-1)", 2: "var(--text-2)", 3: "var(--text-3)" },
        line: { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        success: "var(--success)",
        danger: "var(--danger)",

        // ── GitHub Primer (light) — /taskmanager 전용 ──────────
        // 사내 도구는 마케팅 사이트와 완전히 다른 체계를 쓴다.
        // 고정 HEX 인 이유: 테마 토글이 없는 라이트 전용 화면이고,
        // GitHub 색을 그대로 쓰는 것이 목적이라 파생값을 두지 않는다.
        gh: {
          canvas: { DEFAULT: "#ffffff", subtle: "#f6f8fa", mute: "#eaeef2" },
          border: { DEFAULT: "#d1d9e0", muted: "#e4e8ec", strong: "#afb8c1" },
          fg: { DEFAULT: "#1f2328", muted: "#59636e", subtle: "#818b98", on: "#ffffff" },
          accent: {
            DEFAULT: "#0969da", hover: "#0860ca", active: "#0757ba",
            fg: "#0969da", subtle: "#ddf4ff", border: "#54aeff",
          },
          success: {
            DEFAULT: "#1f883d", hover: "#1a7f37", fg: "#1a7f37",
            subtle: "#dafbe1", border: "#4ac26b",
          },
          done: { DEFAULT: "#8250df", fg: "#8250df", subtle: "#fbefff", border: "#c297ff" },
          danger: {
            DEFAULT: "#cf222e", hover: "#a40e26", fg: "#cf222e",
            subtle: "#ffebe9", border: "#ff818a",
          },
          attention: {
            DEFAULT: "#bf8700", fg: "#9a6700",
            subtle: "#fff8c5", border: "#d4a72c",
          },
          neutral: { DEFAULT: "#6e7781", muted: "#818b9826" },
        },
      },

      // ── Shape ────────────────────────────────────────────────
      // 카드 · 이미지 모서리는 PC 10px, 태블릿 · 모바일 8px (Figma 10/17 공통 수정사항)
      borderRadius: {
        DEFAULT: "10px", // /taskmanager 가 쓰는 값이기도 하다
        card: "10px",
        "card-sm": "8px",
        pill: "9999px",
      },
      boxShadow: {
        // Figma effect - 0 0 15px rgba(0,0,0,.15). 목록 카드처럼 흰 면 위에 뜨는 판
        float: "0 0 15px rgba(0, 0, 0, 0.08)",
        "float-lg": "0 10px 30px rgba(22, 29, 60, 0.12)",
        // GitHub 은 그림자를 아끼고 1px 테두리로 면을 나눈다. 띄우는 건 오버레이뿐.
        "gh-sm": "0 1px 3px rgba(31, 35, 40, 0.06)",
        "gh-md": "0 3px 8px rgba(31, 35, 40, 0.15)",
        "gh-lg": "0 8px 24px rgba(31, 35, 40, 0.12)",
        "gh-inset": "inset 0 1px 0 0 rgba(0, 33, 85, 0.2)",
      },

      // 12칼럼 그리드 / gutter 16px
      gap: { gutter: "16px" },
      maxWidth: { inner: "1500px" },
    },
  },
  plugins: [],
};
export default config;
