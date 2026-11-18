import type { Config } from "tailwindcss";

/**
 * MATE Design System — Tailwind 바인딩
 *
 * 색은 CSS 변수(globals.css `:root`)가 단일 원천이고 여기서는 이름만 노출한다.
 * 변수 하나만 바꾸면 Tailwind 클래스가 함께 따라온다.
 * 모양은 Figma 「(주)세종호이스트크레인 웹사이트 리뉴얼」 디자인 시스템이고, 주요 색만 로고 파랑이다.
 * 칸의 짜임(섹션 배치)만 그 사이트와 다르게 둔다 (2026-10-22).
 */
/** /hub 색 - globals.css 의 --tm-<이름>("R G B")을 투명도 표기가 먹는 꼴로 */
const tmc = (name: string) => `rgb(var(--tm-${name}) / <alpha-value>)`;

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

        // ── 사내 Hub(/hub) 전용 ──────────────────
        // 세종호이스트크레인 리뉴얼 관리자의 틀과 값을 옮겼다(2026-10-22).
        // 세종 네이비 자리에는 로고 파랑 #2644CB 를, 제목 글자에는 한 단계 짙은 파랑을 쓴다.
        // 빨강 · 호박색 · 초록은 급함 · 임박 · 끝남에만, 보라 · 청록은 영역을 가르는 데만 쓴다.
        // 값은 globals.css 의 --tm-* ("R G B") - 밝은 값(괄호 안)과 다크 값이 거기 있다. bg-tm-blue/20 같은 투명도 표기가 먹는다.
        tm: {
          blue: { DEFAULT: tmc("blue"), hover: tmc("blue-hover") }, // 채움 · 고른 메뉴 · 초점 (#2644cb, 흰 글자 7.6:1)
          deep: tmc("deep"), // 제목 글자 (#18308f) - 알림 바탕은 backgroundColor 쪽
          tint: tmc("tint"), // 마우스를 올린 칸 · 숫자 알약 바탕 (#eef2ff, 파란 글자 6.8:1)
          ink: tmc("ink"),   // 본문 (#1b2430)
          sub: tmc("sub"),   // 보조 글자 (#5b6676, 흰 바탕 5.8:1)
          line: tmc("line"), // 구분선 · 카드 테두리 (#d7dce4)
          edge: tmc("edge"), // 입력 칸 · 버튼 테두리 (#7f8b9e, 흰 바탕 3.4:1)
          bg: tmc("bg"),     // 바탕 (#f4f6f9)
          card: tmc("card"), // 카드 · 창 · 입력 칸 (#ffffff) - 다크에서는 바탕보다 한 단계 밝은 면
          red: { DEFAULT: tmc("red"), deep: tmc("red-deep"), tint: tmc("red-tint"), line: tmc("red-line") },
          ok: { DEFAULT: tmc("ok"), deep: tmc("ok-deep"), tint: tmc("ok-tint") },
          warn: { DEFAULT: tmc("warn"), deep: tmc("warn-deep"), tint: tmc("warn-tint") },
          violet: { DEFAULT: tmc("violet"), deep: tmc("violet-deep"), tint: tmc("violet-tint") },
          teal: { DEFAULT: tmc("teal"), deep: tmc("teal-deep"), tint: tmc("teal-tint") },
        },
      },
      // /hub 다크 모드 - 같은 이름이라도 글자 색은 더 밝게, 흰 글자를 얹는 바탕은 더 짙게 갈라 쓴다
      textColor: {
        tm: {
          blue: { DEFAULT: tmc("blue-text") },
          red: { DEFAULT: tmc("red-text") },
          ok: { DEFAULT: tmc("ok-text") },
          warn: { DEFAULT: tmc("warn-text") },
          violet: { DEFAULT: tmc("violet-text") },
          teal: { DEFAULT: tmc("teal-text") },
        },
      },
      backgroundColor: {
        tm: { deep: tmc("deep-fill"), red: { deep: tmc("red-deep-fill") } }, // 알림 · 위험 버튼(흰 글자)
      },
      borderColor: {
        tm: { red: { deep: tmc("red-deep-fill") } },
      },

      // ── Shape ────────────────────────────────────────────────
      // 카드 · 이미지 모서리는 PC 10px, 태블릿 · 모바일 8px (Figma 10/17 공통 수정사항)
      borderRadius: {
        DEFAULT: "10px", // /hub 가 쓰는 값이기도 하다
        card: "10px",
        "card-sm": "8px",
        pill: "9999px",
        // /hub - 세종 관리자의 모서리
        "tm-sm": "10px", // 메뉴 줄 · 작은 버튼 · 입력 칸
        "tm-btn": "12px", // 큰 버튼
        tm: "14px", // 카드
        "tm-lg": "18px", // 창
      },
      boxShadow: {
        // Figma effect - 0 0 15px rgba(0,0,0,.15). 목록 카드처럼 흰 면 위에 뜨는 판
        float: "0 0 15px rgba(0, 0, 0, 0.08)",
        "float-lg": "0 10px 30px rgba(22, 29, 60, 0.12)",
        // /hub - 평소에는 거의 없고, 마우스를 올리거나 띄울 때만 깊어진다
        tm: "0 1px 2px rgba(22, 39, 60, 0.06)",
        "tm-up": "0 14px 32px rgba(22, 39, 60, 0.14)",
        "tm-pop": "0 28px 72px rgba(15, 26, 41, 0.34)",
        "tm-toast": "0 14px 36px rgba(15, 26, 41, 0.36)",
      },
      // /hub - 창 · 알림 · 옆 패널이 나타나는 움직임 (세종 관리자 값)
      keyframes: {
        "tm-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
        "tm-pop": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.985)" },
          to: { opacity: "1", transform: "none" },
        },
        "tm-rise": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        "tm-slide": { from: { opacity: "0", transform: "translateX(24px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "tm-fade": "tm-fade 120ms linear",
        "tm-pop": "tm-pop 200ms cubic-bezier(0.2, 0.6, 0.25, 1)",
        "tm-rise": "tm-rise 200ms cubic-bezier(0.2, 0.6, 0.25, 1)",
        "tm-slide": "tm-slide 200ms cubic-bezier(0.2, 0.6, 0.25, 1)",
      },

      // 12칼럼 그리드 / gutter 16px
      gap: { gutter: "16px" },
      maxWidth: { inner: "1500px" },
    },
  },
  plugins: [],
};
export default config;
