import type { Config } from "tailwindcss";

/**
 * MATE Design System - Tailwind 바인딩
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
    // ── 화면 폭 ────────────────────────────────────────────────
    // 기본값에 세 개를 더했다. 600 부터 큰 화면 배치(두 단), 840 부터 상단 메뉴,
    // 960 부터 두 단의 비율이 바뀐다. 작은 값을 extend 로 넣으면 목록 끝에 붙어
    // 순서가 뒤집히므로 전체를 작은 것부터 다시 적는다.
    screens: {
      medium: "600px",
      sm: "640px",
      md: "768px",
      expanded: "840px",
      wide: "960px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    // ── Grid System - inner 1500 / gutter 16 / 좌우 여백 24 이상 ──
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1500px" },
    },
    extend: {
      fontFamily: {
        // 라틴과 숫자는 Roboto, 한글은 Pretendard 가 받는다 (Roboto 에는 한글이 없다)
        sans: [
          "Roboto Variable",
          "Roboto",
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "-apple-system",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
      },

      // ── Color System ─────────────────────────────────────────
      colors: {
        // primary - MATE Blue. 400 이 로고 원색(#2644cb), 200 이 어두운 배경 위 글자용.
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          DEFAULT: "var(--primary-200)",
        },
        // gray - 쿨 뉴트럴. 50 화이트 → 600 텍스트 블랙/다크 캔버스.
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
        },
        // point - 따로 두지 않는다. 이름만 남겨 primary 를 가리킨다 (globals.css 참고).
        point: {
          100: "var(--point-100)",
          200: "var(--point-200)",
          300: "var(--point-300)",
          DEFAULT: "var(--point-200)",
        },

        // 시맨틱 별칭 - 컴포넌트는 되도록 이쪽을 쓴다.
        // fg 는 '그 테마의 글자색'이다. 밝은 테마에서는 검정, 어두운 테마에서는 흰색.
        // 예전에는 text-white/70 처럼 흰색을 직접 적어 어두운 화면에서만 맞았다.
        // fg / canvas / surface 는 투명도를 붙여 쓸 수 있다 (text-fg/70, bg-canvas/80).
        fg: "rgb(var(--fg-rgb) / <alpha-value>)",
        canvas: "rgb(var(--canvas-rgb) / <alpha-value>)",
        background: "var(--canvas)",
        foreground: "var(--text-1)",
        surface: {
          DEFAULT: "rgb(var(--surface-rgb) / <alpha-value>)",
          2: "rgb(var(--surface-2-rgb) / <alpha-value>)",
        },
        ink: { DEFAULT: "var(--text-1)", 2: "var(--text-2)", 3: "var(--text-3)" },
        faint: "var(--text-faint)",
        hairline: "var(--border)",
        "border-strong": "var(--border-2)",
        brand: {
          DEFAULT: "var(--accent)",
          // 면에 까는 대표 색상 - 로고 원색 그대로. 흰 글자를 올린다.
          fill: "var(--brand-fill)",
          "fill-hover": "var(--brand-fill-hover)",
          strong: "var(--accent-strong)",
          tint: "var(--accent-tint)",
        },
        success: { DEFAULT: "var(--success)", tint: "var(--success-tint)" },
        danger: { DEFAULT: "var(--danger)", tint: "var(--danger-tint)" },

        // ── GitHub Primer (light) - /taskmanager 전용 ──────────
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

      // ── Typography - Figma 스케일과 1:1 (LS -0.3%) ────────────
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
        c2: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "-0.003em", fontWeight: "400" }],

        // ── 역할별 글자 크기 (홈과 공통 요소) ─────────────────
        // 크기 아홉 단계는 참고한 가이드라인이 밝힌 값이다. 40 과 20 사이는 원본에도
        // 비어 있으므로 중간 단계를 만들지 않는다. 행간과 자간은 원본에 없어 저희가 정했다.
        ext: ["40px", { lineHeight: "1.22", letterSpacing: "-0.025em" }],   // 큰 제목
        dlg: ["20px", { lineHeight: "1.4", letterSpacing: "-0.01em" }],     // 카드 제목
        ttl: ["19px", { lineHeight: "1.4", letterSpacing: "-0.01em" }],     // 상단 바 제목
        lst: ["18px", { lineHeight: "1.45", letterSpacing: "-0.01em" }],    // 목록의 주 문장
        tbtn: ["17px", { lineHeight: "1.4", letterSpacing: "-0.005em" }],   // 글자 버튼
        body: ["16px", { lineHeight: "1.75", letterSpacing: "-0.003em" }],  // 본문
        btn: ["15px", { lineHeight: "1.4", letterSpacing: "-0.003em" }],    // 면 버튼
        sub: ["14px", { lineHeight: "1.5", letterSpacing: "0" }],           // 묶음 이름
        min: ["13px", { lineHeight: "1.5", letterSpacing: "0" }],           // 가장 작은 글자
      },

      // ── Shape ────────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "10px", // 작업 관리 도구가 쓴다 - 건드리지 않는다
        // 모서리는 네 가지만 쓴다
        block: "26px",  // 큰 면
        thumb: "20px",  // 카드 · 중간 그림
        chip: "12px",   // 작은 그림 · 꼬리표
        btn: "18px",    // 버튼
        card: "20px",
        pill: "9999px",
      },
      transitionTimingFunction: {
        // 빠르게 붙고 천천히 멎는다. 사이트의 모든 움직임이 이 곡선을 쓴다.
        calm: "cubic-bezier(0.22, 0.25, 0, 1)",
      },
      boxShadow: {
        card: "none",
        "card-hover": "0 12px 32px rgba(0, 0, 0, 0.35)",
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
