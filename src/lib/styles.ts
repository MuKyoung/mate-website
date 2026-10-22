/**
 * MATE Design System - 소재(클래스) 레이어
 *
 * 토큰은 globals.css `:root` 가 단일 원천이고, 여기서는 그 토큰을
 * 실제 UI 소재(버튼·링크·간격·칸)로 조립한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 *
 * 컬러 역할 분담 (Figma 세종호이스트크레인 체계, 주요 색만 로고 파랑)
 *   로고 파랑(point 200) = 버튼 면 · 섹션 이름 · 활성 표시
 *   남색(primary 400)    = 제목 · 화살표 원
 *   회색                 = 본문 · 선 · 면
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/* ── Typography - Figma 타입 스케일 (Pretendard / LS -0.3%) ── */
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
/** 앞 섹션과 한 덩어리로 읽혀야 하는 구간 */
export const sectionPadTight = 'py-16 sm:py-24';

/** 카드 · 이미지 모서리 - PC 10px, 태블릿 · 모바일 8px */
export const radiusCard = 'rounded-card-sm lg:rounded-card';

/* ── Buttons - 둥근 알약. 로고 파랑이 기본 ─────────────── */

/** 로고 파랑 버튼 - 기본 CTA */
export const btnPoint =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-point-200 px-7 text-[15px] font-bold text-white ' +
  'transition-colors duration-200 hover:bg-point-300 disabled:cursor-not-allowed disabled:bg-gray-400';

/** 진회색 버튼 - 파란 버튼 옆의 보조 액션 */
export const btnDark =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-gray-600 px-7 text-[15px] font-bold text-white ' +
  'transition-colors duration-200 hover:bg-black';

/** 테두리 버튼 - '더보기' */
export const btnLine =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-gray-200 bg-white px-7 text-[15px] font-bold text-gray-500 ' +
  'transition-colors duration-200 hover:border-point-200 hover:text-point-200';

/** 작은 알약 - 카드 아래 '더보기' 류 */
export const btnSm = 'h-10 px-5 text-[14px]';

/* ── Links ────────────────────────────────────────────── */

/** 'View more ↗' - 밑줄 달린 굵은 글자 */
export const linkMore =
  'group inline-flex items-center gap-2 border-b border-current pb-1 text-[15px] font-bold sm:text-[16px] ' +
  'transition-colors duration-200';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5';

/* ── 칸 ──────────────────────────────────────────────── */

/** 남색 화살표 원 - 카드 오른쪽. 카드에 올리면 로고 파랑으로 바뀐다 */
export const arrowCircle =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-primary-400 text-white transition-colors duration-300 group-hover:bg-point-200';

/** 회색 칩 - 카드 위 분류 */
export const chip =
  'inline-flex items-center rounded-[4px] bg-gray-100 px-2.5 py-1 text-[12px] font-bold leading-none text-ink';

/** 테두리 칩 - 상세 제목 위 분류 */
export const chipLine =
  'inline-flex items-center rounded-[4px] border border-point-200 px-2 py-1 text-[12px] font-bold leading-none text-point-200';

/** 로고 파랑으로 찬 칩 - 진행 상태 ('제작 중') */
export const chipFill =
  'inline-flex items-center rounded-[4px] bg-point-200 px-2 py-1 text-[12px] font-bold leading-none text-white';

/** 남색 화살표 원 - 목록 줄 오른쪽 (arrowCircle 과 같은 모양, 크기만 조금 크다) */
export const arrowTile =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-primary-400 text-white transition-colors duration-300 group-hover:bg-point-200';

/** 어두운 면 위 흰 테두리 원 */
export const arrowTileDark =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-white/60 text-white transition-colors duration-300 group-hover:border-point-200 group-hover:bg-point-200';

/** 아이콘 칸 - 옅은 파랑 면에 로고 파랑 아이콘 (공정 원의 단계 아이콘과 같은 모양) */
export const iconTile =
  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-point-100 text-point-200';

/** 번호 원 - 회색 테두리 동그라미에 번호 (공정 원의 번호와 같은 모양) */
export const numTile =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-[#d1d7de] bg-white text-[14px] font-bold text-gray-500';

/** 흰 알약 버튼 - 어두운 면 위 */
export const btnLight =
  'group inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-white px-7 text-[15px] font-bold text-ink ' +
  'transition-colors duration-200 hover:bg-point-100';
