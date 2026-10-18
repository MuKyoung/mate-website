/**
 * MATE Design System - 소재(클래스) 레이어
 *
 * 토큰은 globals.css `:root` 가 단일 원천이고, 여기서는 그 토큰을
 * 실제 UI 소재(버튼·링크·간격·타입)로 조립한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 *
 * 컬러 역할 분담
 *   파랑(primary 200)     = 버튼 면 · 아이콘 칸 · 빛
 *   밝은 파랑(primary 100) = 검은 바탕 위 강조 글자 · 링크 호버
 *   흑백                    = 그 밖의 모든 것
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/* ── Typography - Figma 타입 스케일 (Pretendard / LS -0.3%) ──
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

/** 대형 타이포 크기 - D2 / D1 티어와 동일한 clamp (style prop용) */
export const displaySize = { fontSize: 'clamp(2.25rem, 5.2vw, 4.25rem)' } as const;
export const displaySizeLg = { fontSize: 'clamp(2.5rem, 6.4vw, 5.75rem)' } as const;

/* ── Buttons - 각진 면. 파랑 + 흰색을 짝으로 쓴다 ─────────── */

/** 파란 면 버튼 - 기본 CTA */
export const btnPrimary =
  'group inline-flex items-center justify-center gap-3 h-12 px-6 rounded-[2px] text-[15px] font-medium ' +
  'text-white bg-primary-200 hover:bg-[var(--blue-glow)] transition-colors duration-200';

/** 흰 면 버튼 - 파란 버튼 옆의 보조 액션 */
export const btnLight =
  'group inline-flex items-center justify-center gap-3 h-12 px-6 rounded-[2px] text-[15px] font-medium ' +
  'text-black bg-white hover:bg-[var(--blue-ice)] transition-colors duration-200';

/** 테두리 버튼 - 3순위 */
export const btnOutline =
  'group inline-flex items-center justify-center gap-3 h-12 px-6 rounded-[2px] text-[15px] font-medium ' +
  'text-white border border-white/25 hover:border-white hover:bg-white/[0.04] transition-colors duration-200';

/** 예전 이름 - 파란 버튼과 같다 */
export const btnPoint = btnPrimary;

/* ── Links ────────────────────────────────────────────── */

/** 밑줄 텍스트 링크 */
export const linkUnderline =
  'text-[15px] text-white/65 hover:text-white ' +
  'border-b border-white/25 hover:border-white pb-0.5 transition-colors';

/** 섹션 상단 '더보기' 링크 - 모노 라벨 */
export const linkMore =
  'group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.02em] ' +
  'text-white/60 hover:text-white transition-colors';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300';

/* ── 면과 칸 ──────────────────────────────────────────── */

/** 어두운 패널 - 1px 테두리 + 아주 옅은 면 */
export const panel = 'border border-white/10 bg-[var(--surface)]';

/** 파란 아이콘 칸 - 카드 제목 앞에 붙는 작은 정사각형 */
export const iconSquare =
  'inline-flex shrink-0 items-center justify-center w-7 h-7 bg-primary-200 text-white';

/** 번호 칸 - 목록 앞의 테두리 정사각형 */
export const numSquare =
  'inline-flex shrink-0 items-center justify-center w-7 h-7 border border-white/25 ' +
  'font-mono text-[12px] text-white/80';

/* ── Layout - Grid System (inner 1500 / gutter 16 / 12col) ── */

/** 섹션 세로 여백 */
export const sectionPad = 'py-24 sm:py-32';
/** 앞 섹션과 한 덩어리로 읽혀야 하는 구간 - 호흡을 좁혀 스크롤 리듬을 만든다 */
export const sectionPadTight = 'py-16 sm:py-24';
/** CTA 섹션 세로 여백 (더 넉넉하게) */
export const sectionPadLg = 'py-28 sm:py-40';
/** 컨테이너 - inner 1500px 기준 */
export const container = 'container mx-auto px-4 sm:px-6';

/** 클립 리빌용 오버플로 래퍼 - 라틴 디센더가 잘리지 않도록 여유 확보 */
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
