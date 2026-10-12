'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

/**
 * 홈의 여러 섹션이 같이 쓰는 작은 조각.
 */

/** 로고 심볼의 두 원. 섹션 이름 앞에 번호 대신 붙인다. 색은 글자색을 따른다. */
export function Dots({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex shrink-0 gap-[3px] ${className}`}>
      <span className="h-[7px] w-[7px] rounded-full bg-current" />
      <span className="h-[7px] w-[7px] rounded-full bg-current" />
    </span>
  );
}

/** 섹션 이름표 */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 text-[13px] font-semibold ${className}`}>
      <Dots />
      {children}
    </p>
  );
}

/**
 * 화살표 갈아끼우기. 올리면 화살표가 오른쪽 위로 빠져나가고 왼쪽 아래에서 새것이 들어온다.
 * 부모에 group 이 있어야 한다.
 */
export function ArrowSwap({ size = 17 }: { size?: number }) {
  const move = 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]';
  return (
    <span aria-hidden className="relative inline-flex shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <FiArrowUpRight size={size}
        className={`${move} group-hover:-translate-y-full group-hover:translate-x-full group-focus-visible:-translate-y-full group-focus-visible:translate-x-full`} />
      <FiArrowUpRight size={size}
        className={`absolute inset-0 -translate-x-full translate-y-full ${move} group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0`} />
    </span>
  );
}

/**
 * 커서를 살짝 따라오는 래퍼. 버튼을 감싼다.
 * 마우스일 때만 움직인다. 손가락으로 누를 때와 '움직임 줄이기' 에서는 가만히 있다.
 */
export function Magnetic({ children, strength = 0.3, className = '' }: {
  children: ReactNode;
  /** 커서가 중심에서 벗어난 거리의 몇 배를 따라갈지 */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 240, damping: 17, mass: 0.4 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={ref} onPointerMove={onMove} onPointerLeave={reset}
      style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  );
}
