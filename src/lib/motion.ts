// devigns식 강한 스크롤 리빌 모션 — 큰 진입 이동, 클립 리빌, 스태거.
// 모든 페이지가 동일한 타이밍을 공유하도록 여기서만 정의한다.

import type { Variants, Transition } from 'framer-motion';

/** ease-out — 리빌 도착 */
export const easeEnter = [0.16, 1, 0.3, 1] as const;
/** ease-inOut — 양방향 */
export const easeStandard = [0.65, 0, 0.35, 1] as const;

export const DUR = { fast: 0.2, standard: 0.5, slow: 0.8 } as const;

export const tEnter: Transition = { duration: DUR.slow, ease: easeEnter };

/** 아래에서 크게 떠오르는 리빌 — 기본 진입 (강한 모션) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: tEnter },
};

/** 더 강한 리빌 (히어로/큰 블록) */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 64 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeEnter } },
};

/** 클립 리빌 — 아래에서 위로 마스크가 열림 (대형 타이포/이미지) */
export const clipUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)', y: 20 },
  show: {
    clipPath: 'inset(0% 0 0 0)', y: 0,
    transition: { duration: 0.9, ease: easeEnter },
  },
};

/** 단순 페이드 */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.slow, ease: easeEnter } },
};

/** 자식 스태거 컨테이너 (넉넉한 간격) */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** 촘촘한 스태거 (리스트/카드) */
export const staggerTight: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/** whileInView 공통 props — once, 뷰포트 진입 시 */
export const inView = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-15%' },
};

/** 마운트 즉시 재생 (히어로 등 above-the-fold) */
export const onMount = {
  initial: 'hidden' as const,
  animate: 'show' as const,
};
