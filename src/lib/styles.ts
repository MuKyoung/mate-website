/**
 * MATE Design System - 소재(클래스) 레이어
 *
 * 토큰은 globals.css `:root` 가 단일 원천이고, 여기서는 그 토큰을
 * 실제 UI 소재(버튼·링크·간격·칸)로 조립한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 *
 * 컬러 역할 분담
 *   로고 파랑(point 200) = 버튼 면 · 칸 이름 · 강조 낱말 · 활성 표시
 *   남색(primary 400)    = 제목
 *   회색                 = 본문 · 선 · 면
 *
 * 모양은 세종 사이트와 다르게 둔다 - 알약 버튼 · 남색 동그라미 화살표 대신
 * 모서리 6px 버튼과 네모 화살표 칸을 쓴다 (2026-10-22).
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/* ── Typography ── */
export const typeH1 = 'type-h1';
export const typeH2 = 'type-h2';
export const typeH3 = 'type-h3';
export const typeB1 = 'type-b1';
export const typeB2 = 'type-b2';
export const typeB3 = 'type-b3';
export const typeB4 = 'type-b4';
export const typeC1 = 'type-c1';
export const typeC2 = 'type-c2';

/* ── Layout - Grid System (inner 1500 / gutter 16 / 12col) ── */

/** 컨테이너 - 안쪽 폭 1500px */
export const container = 'mx-auto w-full max-w-[1580px] px-5 sm:px-8 lg:px-10';
/** 섹션 세로 여백 */
export const sectionPad = 'py-24 sm:py-32 xl:py-40';

/** 카드 · 이미지 모서리 - PC 10px, 태블릿 · 모바일 8px */
export const radiusCard = 'rounded-card-sm lg:rounded-card';

/* ── Buttons - 모서리 6px. 로고 파랑이 기본 ─────────────── */

/** 로고 파랑 버튼 - 기본 CTA */
export const btnPoint =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] bg-point-200 px-6 text-[15px] font-semibold text-white ' +
  'transition-colors duration-200 hover:bg-point-300 disabled:cursor-not-allowed disabled:bg-gray-400';

/** 흰 버튼 - 어두운 면 위의 보조 액션 */
export const btnLight =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] bg-white px-6 text-[15px] font-semibold text-ink ' +
  'transition-colors duration-200 hover:bg-point-100';

/** 테두리 버튼 - '더보기' */
export const btnLine =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-[6px] border border-line bg-white px-6 text-[15px] font-semibold text-ink ' +
  'transition-colors duration-200 hover:border-point-200 hover:text-point-200';

/** 작은 버튼 */
export const btnSm = 'h-10 px-4 text-[14px]';

/* ── Links ────────────────────────────────────────────── */

/** '전체 보기 ↗' - 등폭 대문자 */
export const linkMore =
  'group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] transition-colors duration-200';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5';

/* ── 칸 ──────────────────────────────────────────────── */

/** 네모 화살표 칸 - 목록 줄 오른쪽. 줄에 올리면 로고 파랑으로 찬다 */
export const arrowTile =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-line text-ink ' +
  'transition-colors duration-300 group-hover:border-point-200 group-hover:bg-point-200 group-hover:text-white';

/** 어두운 면 위 네모 화살표 칸 */
export const arrowTileDark =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-white/25 text-white ' +
  'transition-colors duration-300 group-hover:border-point-200 group-hover:bg-point-200';

/** 파란 아이콘 칸 */
export const iconTile =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-point-200 text-white';

/** 번호 칸 - 등폭 숫자를 테두리 네모에. 세로로 쌓는 칸이나 격자 안에서도 늘어나지 않는다 */
export const numTile =
  'inline-flex h-8 w-fit min-w-8 shrink-0 items-center justify-center rounded-[4px] border border-line px-2 font-mono text-[12px] text-ink-3';

/** 분류 칩 - 옅은 파랑 면에 등폭 글자 */
export const chip =
  'inline-flex items-center rounded-[4px] bg-point-100 px-2 py-1 font-mono text-[11px] leading-none tracking-[0.02em] text-point-200';

/** 테두리 칩 */
export const chipLine =
  'inline-flex items-center rounded-[4px] border border-line px-2 py-1 font-mono text-[11px] leading-none tracking-[0.02em] text-ink-3';
