// goorm식 차분한 모션 토큰 — 짧고 절제된 전환, 스프링/바운스 없음.
// 모든 페이지가 동일한 타이밍을 공유하도록 여기서만 정의한다.

import type { Variants, Transition } from 'framer-motion';

/** ease-enter — 도착(시트/카드/콘텐츠) */
export const easeEnter = [0.2, 0.6, 0.25, 1] as const;
/** ease-standard — 양방향 전환 */
export const easeStandard = [0.25, 0.1, 0.25, 1] as const;

export const DUR = { fast: 0.12, standard: 0.2, slow: 0.32 } as const;

export const tEnter: Transition = { duration: DUR.slow, ease: easeEnter };

/** 아래에서 살짝 떠오르는 페이드 — 기본 진입 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: tEnter },
};

/** 단순 페이드 */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.slow, ease: easeEnter } },
};

/** 자식 스태거 컨테이너 */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

/** whileInView 공통 props — once, 살짝 일찍 트리거 */
export const inView = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-80px' },
};
