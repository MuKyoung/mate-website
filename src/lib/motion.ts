// 대형 스크롤 모션 토큰 — 큼직한 진입, 마스크 리빌, 스케일 변형.
// 모든 페이지가 동일한 타이밍을 공유하도록 여기서만 정의한다.

import type { Variants, Transition } from 'framer-motion';

/** ease-out expo — 리빌 도착 (크고 부드럽게 감속) */
export const easeEnter = [0.16, 1, 0.3, 1] as const;
/** ease-inOut — 양방향 */
export const easeStandard = [0.65, 0, 0.35, 1] as const;

export const DUR = { fast: 0.3, standard: 0.7, slow: 1.1 } as const;

export const tEnter: Transition = { duration: DUR.slow, ease: easeEnter };

/** 아래에서 크게 떠오르는 리빌 — 기본 진입 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 64 },
  show: { opacity: 1, y: 0, transition: tEnter },
};

/** 더 강한 리빌 (히어로/대형 블록) */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: easeEnter } },
};

/** 클립 리빌 — 아래에서 위로 마스크가 열림 (대형 타이포) */
export const clipUp: Variants = {
  hidden: { clipPath: 'inset(105% 0 0 0)', y: 40 },
  show: {
    clipPath: 'inset(0% 0 0 0)', y: 0,
    transition: { duration: 1.15, ease: easeEnter },
  },
};

/** 이미지 마스크 리빌 — 아래에서 위로 크게 열림 */
export const maskUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)' },
  show: { clipPath: 'inset(0% 0 0 0)', transition: { duration: 1.3, ease: easeEnter } },
};

/** 스케일 인 — 큰 이미지/패널이 밀려 들어오는 느낌 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 1.08, y: 40 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 1.2, ease: easeEnter } },
};

/** 단순 페이드 */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.slow, ease: easeEnter } },
};

/* ── 방향·각도 변주 — 균일한 상승 일변도를 깨는 어휘 ──
   같은 섹션 안에서 좌/우/틸트를 콘텐츠 위치에 맞춰 교차 사용한다. */

/** 왼쪽에서 진입 */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -72 },
  show: { opacity: 1, x: 0, transition: tEnter },
};

/** 오른쪽에서 진입 */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 72 },
  show: { opacity: 1, x: 0, transition: tEnter },
};

/** 살짝 기울며 떠오르는 진입 (왼쪽 아래 축) */
export const riseTilt: Variants = {
  hidden: { opacity: 0, y: 84, rotate: 2.4, transformOrigin: '0% 100%' },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 1.15, ease: easeEnter } },
};

/** 살짝 기울며 떠오르는 진입 (오른쪽 아래 축) */
export const riseTiltR: Variants = {
  hidden: { opacity: 0, y: 84, rotate: -2.4, transformOrigin: '100% 100%' },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 1.15, ease: easeEnter } },
};

/** 클립 리빌 — 왼쪽에서 오른쪽으로 열림 (타이포) */
export const clipLeft: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)', x: -28 },
  show: { clipPath: 'inset(0 0% 0 0)', x: 0, transition: { duration: 1.1, ease: easeEnter } },
};

/** 클립 리빌 — 오른쪽에서 왼쪽으로 열림 (타이포) */
export const clipRight: Variants = {
  hidden: { clipPath: 'inset(0 0 0 100%)', x: 28 },
  show: { clipPath: 'inset(0 0 0 0%)', x: 0, transition: { duration: 1.1, ease: easeEnter } },
};

/** 이미지 마스크 — 좌→우 열림 */
export const maskLeft: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  show: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.25, ease: easeEnter } },
};

/** 이미지 마스크 — 우→좌 열림 */
export const maskRight: Variants = {
  hidden: { clipPath: 'inset(0 0 0 100%)' },
  show: { clipPath: 'inset(0 0 0 0%)', transition: { duration: 1.25, ease: easeEnter } },
};

/** 줌아웃 + 미세 회전 진입 (대형 이미지/패널) */
export const zoomTilt: Variants = {
  hidden: { opacity: 0, scale: 1.12, rotate: 1.6 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.25, ease: easeEnter } },
};

/** 라인 드로우 — 헤어라인이 좌→우로 그어짐 */
export const lineDraw: Variants = {
  hidden: { scaleX: 0, transformOrigin: '0% 50%' },
  show: { scaleX: 1, transition: { duration: 1.1, ease: easeEnter } },
};

/** 자식 스태거 컨테이너 (넉넉한 간격) */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.06 } },
};

/** 촘촘한 스태거 (리스트/카드) */
export const staggerTight: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

/** 글자 단위 리빌 컨테이너 */
export const staggerChars: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

/** whileInView 공통 props — once, 뷰포트 진입 시 */
export const inView = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-12%' },
};

/** 마운트 즉시 재생 (히어로 등 above-the-fold) */
export const onMount = {
  initial: 'hidden' as const,
  animate: 'show' as const,
};
