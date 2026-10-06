/**
 * MATE Design System — 소재(클래스) 레이어
 *
 * 토큰은 globals.css `:root` 가 단일 원천이고, 여기서는 그 토큰을
 * 실제 UI 소재(버튼·링크·간격·타입)로 조립한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 *
 * 컬러 역할 분담
 *   indigo(primary 200) = 액션 · 링크 · 인터랙션
 *   amber (point 200)   = 섹션 라벨 · 강조 · 활성 상태
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/* ── Typography — Figma 타입 스케일 (Pretendard / LS -0.3%) ──
   디스플레이 D1·D2는 MATE 전용 에디토리얼 티어. */
export const typeD1 = 'type-d1';
export const typeD2 = 'type-d2';
export const typeH1 = 'type-h1';
export const typeH2 = 'type-h2';
export const typeH3 = 'type-h3';
export const typeB1 = 'type-b1';
export const typeB2 = 'type-b2';
export const typeB3 = 'type-b3';
export const typeB4 = 'type-b4';
export const typeC1 = 'type-c1';
export const typeC2 = 'type-c2';

/** 대형 타이포 크기 — D2 / D1 티어와 동일한 clamp (style prop용) */
export const displaySize = { fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' } as const;
export const displaySizeLg = { fontSize: 'clamp(2.25rem, 7vw, 6.5rem)' } as const;

/* ── Buttons ──────────────────────────────────────────── */

/** 화이트 필 버튼 — 기본 CTA (호버 시 인디고) */
export const btnPrimary =
  'group inline-flex items-center gap-2.5 h-14 px-9 rounded-pill text-[15px] font-bold ' +
  'text-canvas bg-gray-50 hover:bg-primary-200 hover:text-gray-50 transition-colors duration-300';

/** 아웃라인 필 버튼 — 보조 액션 */
export const btnOutline =
  'inline-flex items-center gap-2.5 h-14 px-9 rounded-pill text-[15px] font-bold ' +
  'text-gray-50 border border-white/20 hover:border-white transition-colors duration-300';

/** 포인트 필 버튼 — 화면당 1회, 앰버 강조 액션 */
export const btnPoint =
  'group inline-flex items-center gap-2.5 h-14 px-9 rounded-pill text-[15px] font-bold ' +
  'text-primary-600 bg-point-200 hover:bg-point-100 transition-colors duration-300';

/* ── Links ────────────────────────────────────────────── */

/** 밑줄 텍스트 링크 — 3순위 액션 */
export const linkUnderline =
  'text-[15px] font-semibold text-white/60 hover:text-gray-50 ' +
  'border-b border-white/25 hover:border-white pb-0.5 transition-colors';

/** 섹션 상단 '더보기' 링크 */
export const linkMore =
  'group inline-flex items-center gap-1.5 text-b4 ' +
  'text-white/70 hover:text-gray-50 transition-colors';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300';

/* ── Layout — Grid System (inner 1500 / gutter 16 / 12col) ── */

/** 섹션 세로 여백 */
export const sectionPad = 'py-24 sm:py-32';
/** 앞 섹션과 한 덩어리로 읽혀야 하는 구간 — 호흡을 좁혀 스크롤 리듬을 만든다 */
export const sectionPadTight = 'py-16 sm:py-24';
/** CTA 섹션 세로 여백 (더 넉넉하게) */
export const sectionPadLg = 'py-28 sm:py-40';
/** 컨테이너 — inner 1500px 기준 */
export const container = 'container mx-auto px-4 sm:px-6';

/** 클립 리빌용 오버플로 래퍼 — 라틴 디센더가 잘리지 않도록 여유 확보 */
export const clipWrap = 'block overflow-hidden pb-[0.12em] -mb-[0.12em]';

/**
 * 헤어라인 그리드 셀 경계선.
 * 2열(모바일) → 4열(lg) 그리드에서 셀 위치에 맞는 border 클래스를 만든다.
 */
export function hairlineCell(i: number): string {
  return [
    'border-white/10',
    i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
    i >= 2 ? 'border-t' : '',
    i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
    i >= 2 ? 'lg:border-t-0' : '',
  ].join(' ');
}
