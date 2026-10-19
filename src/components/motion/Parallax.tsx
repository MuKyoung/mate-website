'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * 스크롤에 따라 안쪽 층이 바깥 칸보다 느리게 움직인다.
 * 안쪽 층은 위아래로 amount 만큼 더 크게 잡아 움직여도 빈 곳이 드러나지 않는다.
 * 바깥 칸의 위치와 크기는 className 으로 넘긴다 (예: 'absolute inset-0').
 */
export default function Parallax({
  amount = 60,
  className = '',
  children,
}: {
  amount?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="absolute inset-x-0" style={{ top: -amount, bottom: -amount, ...(reduce ? {} : { y }) }}>
        {children}
      </motion.div>
    </div>
  );
}
