/**
 * MATE Design System - 소재(클래스) 레이어
 *
 * 토큰은 globals.css `:root` 가 단일 원천이고, 여기서는 그 토큰을
 * 실제 UI 소재(버튼 · 링크 · 간격)로 조립한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/** 대형 타이포 크기 (안쪽 페이지 - style prop용) */
export const displaySize = { fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' } as const;
export const displaySizeLg = { fontSize: 'clamp(2.25rem, 7vw, 6.5rem)' } as const;

/* ── Buttons ──────────────────────────────────────────
   버튼은 면이 있는 한 가지 모양만 쓴다. 강조는 면의 색으로 가른다.
     파란 면 = 가장 중요한 동작, 회색 면 = 그다음.
   모서리 18px, 글자 15px. 높이(52px)는 참고한 가이드라인에 없어 저희가 정했다. */
const btnBase =
  'group inline-flex items-center justify-center gap-2 h-[52px] px-7 rounded-btn whitespace-nowrap ' +
  'text-btn font-medium transition-[background-color,transform] duration-150 ease-calm active:scale-[0.98]';

/** 강조 버튼 - 파란 면에 흰 글자 */
export const btnPrimary =
  `${btnBase} text-gray-50 bg-[var(--brand-fill)] hover:bg-[var(--brand-fill-hover)]`;

/** 보조 버튼 - 회색 면 */
export const btnOutline = `${btnBase} text-fg bg-fg/10 hover:bg-fg/[0.16]`;

/** 파란 면 위의 강조 버튼 - 흰 면에 파란 글자 (7.3:1) */
export const btnOnBrand =
  `${btnBase} text-[var(--primary-400)] bg-gray-50 hover:bg-[var(--primary-100)]`;

/** 파란 면 위의 보조 버튼 - 옅은 흰 면 */
export const btnOnBrandQuiet = `${btnBase} text-gray-50 bg-white/15 hover:bg-white/25`;

/* ── Links ────────────────────────────────────────────── */

/** 밑줄 글자 링크 */
export const linkUnderline =
  'text-btn font-medium text-fg/70 hover:text-fg ' +
  'border-b border-fg/30 hover:border-fg pb-0.5 transition-colors duration-150';

/** 파란 면 위 밑줄 링크 */
export const linkOnBrand =
  'text-btn font-medium text-gray-50 border-b border-white/50 hover:border-white pb-0.5 transition-colors duration-150';

/** 섹션 상단 '더보기' 링크 */
export const linkMore =
  'group inline-flex items-center gap-1.5 text-sub font-medium ' +
  'text-[var(--accent)] transition-colors duration-150';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 ease-calm';

/* ── Layout - inner 1500 / gutter 16 / 좌우 여백 24 ───── */

/** 섹션 세로 여백 */
export const sectionPad = 'py-24 sm:py-32';
/** CTA 섹션 세로 여백 (더 넉넉하게) */
export const sectionPadLg = 'py-28 sm:py-40';
/** 컨테이너 - 글과 조작 요소는 화면 가장자리에서 24px 이상 떨어진다 */
export const container = 'container mx-auto px-6';

/** 클립 리빌용 오버플로 래퍼 - 라틴 디센더가 잘리지 않도록 여유 확보 */
export const clipWrap = 'block overflow-hidden pb-[0.12em] -mb-[0.12em]';

/**
 * 헤어라인 그리드 셀 경계선.
 * 2열(모바일) → 4열(lg) 그리드에서 셀 위치에 맞는 border 클래스를 만든다.
 */
export function hairlineCell(i: number): string {
  return [
    'border-fg/10',
    i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
    i >= 2 ? 'border-t' : '',
    i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
    i >= 2 ? 'lg:border-t-0' : '',
  ].join(' ');
}
