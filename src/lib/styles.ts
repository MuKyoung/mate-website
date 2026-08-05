/**
 * 반복되는 클래스 조합을 한 곳에서 관리한다.
 * 값을 바꾸면 사이트 전체에 일관되게 반영된다.
 */

/** 브랜드 상수 */
export const CONTACT_EMAIL = 'hsib1212@naver.com';
export const CONTACT_PHONE = '0507-1339-9141';
export const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

/** 화이트 필 버튼 — 기본 CTA (호버 시 블루) */
export const btnPrimary =
  'group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold ' +
  'text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300';

/** 아웃라인 필 버튼 — 보조 액션 */
export const btnOutline =
  'inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold ' +
  'text-white border border-white/20 hover:border-white transition-colors duration-300';

/** 밑줄 텍스트 링크 — 3순위 액션 */
export const linkUnderline =
  'text-[15px] font-semibold text-white/60 hover:text-white ' +
  'border-b border-white/25 hover:border-white pb-0.5 transition-colors';

/** 섹션 상단 '더보기' 링크 */
export const linkMore =
  'group inline-flex items-center gap-1.5 text-[14px] font-semibold ' +
  'text-white/70 hover:text-white transition-colors';

/** 화살표 아이콘 호버 이동 */
export const arrowHover =
  'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300';

/** 섹션 세로 여백 */
export const sectionPad = 'py-28 sm:py-40';
/** CTA 섹션 세로 여백 (더 넉넉하게) */
export const sectionPadLg = 'py-32 sm:py-48';
/** 컨테이너 */
export const container = 'container mx-auto px-4 sm:px-6';

/** 대형 타이포 크기 */
export const displaySize = { fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' } as const;
export const displaySizeLg = { fontSize: 'clamp(2.5rem, 10vw, 9rem)' } as const;

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
