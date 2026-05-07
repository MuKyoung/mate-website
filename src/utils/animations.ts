import { Variants } from 'framer-motion';

// ── 기본 variants ────────────────────────────────────────
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const scaleOnHover = {
  initial: { scale: 1 },
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// ── 에지 있는 reveal variants ─────────────────────────────

/** 아래에서 위로 clip-path 리빌 */
export const clipReveal: Variants = {
  initial: { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
  animate: {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
};

/** 오른쪽으로 clip-path 리빌 */
export const clipRevealRight: Variants = {
  initial: { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 1,
  },
};

/** blur + y + opacity 인 */
export const blurInUp: Variants = {
  initial: { opacity: 0, y: 40, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    y: 40,
    filter: 'blur(10px)',
    transition: { duration: 0.3 },
  },
};

/** 왼쪽에서 슬라이드 인 */
export const slideFromLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { opacity: 0, x: -60 },
};

/** 오른쪽에서 슬라이드 인 */
export const slideFromRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { opacity: 0, x: 60 },
};

/** 스프링 scale 인 */
export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.82 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.82 },
};

/** 약간 skew 와 함께 위에서 등장 */
export const skewInUp: Variants = {
  initial: { opacity: 0, y: 40, skewY: 2 },
  animate: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.65, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { opacity: 0, y: 40, skewY: -2 },
};

/** 개별 문자 reveal (overflow:hidden 부모 안에서 사용) */
export const charReveal: Variants = {
  initial: { y: '115%', rotateX: -45, opacity: 0 },
  animate: {
    y: '0%',
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { y: '-115%', rotateX: 45, opacity: 0 },
};

// ── stagger 컨테이너 variants ─────────────────────────────

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export const staggerContainer2: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
};
