// 움직임 토큰 - 모든 페이지가 같은 타이밍을 쓰도록 여기서만 정의한다.
//
// 규칙
//  - 100ms 보다 짧지 않고 500ms 를 넘지 않는다. 길면 다음 동작을 가로막는다.
//  - 빠르게 붙고 천천히 멎는 곡선 하나만 쓴다.
//  - 멀리서 날아오지 않는다. 제자리 가까이에서 나타난다.

import type { Variants, Transition } from 'framer-motion';

/** 기본 곡선 - 빠르게 가속한 뒤 천천히 감속한다 */
export const easeEnter = [0.22, 0.25, 0, 1] as const;

export const DUR = { fast: 0.15, standard: 0.3, slow: 0.5 } as const;

export const tEnter: Transition = { duration: DUR.slow, ease: easeEnter };

/** 아래에서 떠오르는 기본 진입 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: tEnter },
};

/** 큰 글자 - 아래에서 위로 열린다 */
export const clipUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)', y: 14 },
  show: { clipPath: 'inset(0% 0 0 0)', y: 0, transition: tEnter },
};

/** 그림 - 아래에서 위로 열린다 */
export const maskUp: Variants = {
  hidden: { clipPath: 'inset(100% 0 0 0)' },
  show: { clipPath: 'inset(0% 0 0 0)', transition: tEnter },
};

/** 왼쪽에서 진입 */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: tEnter },
};

/** 오른쪽에서 진입 */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: tEnter },
};

/** 떠오르는 진입 - 예전에는 기울어지며 들어왔다. 이름만 남긴다. */
export const riseTilt: Variants = fadeUp;
export const riseTiltR: Variants = fadeUp;

/** 큰 글자 - 왼쪽에서 오른쪽으로 열린다 */
export const clipLeft: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)', x: -10 },
  show: { clipPath: 'inset(0 0% 0 0)', x: 0, transition: tEnter },
};

/** 큰 글자 - 오른쪽에서 왼쪽으로 열린다 */
export const clipRight: Variants = {
  hidden: { clipPath: 'inset(0 0 0 100%)', x: 10 },
  show: { clipPath: 'inset(0 0 0 0%)', x: 0, transition: tEnter },
};

/** 큰 그림 · 판 - 살짝 큰 데서 제자리로 */
export const zoomTilt: Variants = {
  hidden: { opacity: 0, scale: 1.03 },
  show: { opacity: 1, scale: 1, transition: tEnter },
};

/** 선이 왼쪽에서 오른쪽으로 그어진다 */
export const lineDraw: Variants = {
  hidden: { scaleX: 0, transformOrigin: '0% 50%' },
  show: { scaleX: 1, transition: tEnter },
};

/* ── 표 · 목록 전용 ──────────────────────────────────
   행 하나하나가 크게 떠오르면 마지막 행이 자리를 잡을 때까지 읽기를 시작할 수 없다.
   밀도 높은 데이터에는 짧고 얕은 진입을 쓴다. */

/** 목록의 한 행 - 얕게, 짧게 */
export const rowIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.standard, ease: easeEnter } },
};

/** 행 단위 스태거 - 8행짜리 표도 0.3초 안에 다 선다 */
export const staggerRows: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

/** 자식 스태거 컨테이너 */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/** 촘촘한 스태거 (리스트/카드) */
export const staggerTight: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

/** whileInView 공통 props - once, 뷰포트 진입 시 */
export const inView = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  // rootMargin 은 네 면에 모두 걸린다. 단일 값을 쓰면 좌우 루트까지 좁아져,
  // 왼쪽에서 들어오는 요소가 컨테이너 가장자리에 있으면 교차 영역이 영영 생기지 않아
  // opacity 0 으로 남는다. 세로만 당긴다.
  viewport: { once: true, margin: '-10% 0px' },
};

/** 마운트 즉시 재생 (첫 화면) */
export const onMount = {
  initial: 'hidden' as const,
  animate: 'show' as const,
};
