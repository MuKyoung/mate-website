'use client';

import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

/**
 * 수평선처럼 휘는 파란 빛.
 *
 * 아주 큰 원의 가장자리만 부모 안에 걸리게 둔다. 부모는 position 이 있고
 * overflow-hidden 이어야 한다. 색 단계와 입자는 globals.css `.glow-horizon` 에 있다.
 *
 * - side 'top'    : 원이 위에 있고, 흰빛 가장자리가 아래로 휘어 내려온다 (첫 화면)
 * - side 'bottom' : 원이 아래에서 떠오른다. 안쪽으로 갈수록 밝다 (페이지 마무리)
 * - radius        : 원의 반지름. 클수록 띠가 평평해진다
 * - rim           : 가장자리 가운데가 지나는 높이 (부모 기준)
 *
 * 움직임은 세 겹으로 나눠 서로 덮어쓰지 않게 한다.
 *   바깥 - 스크롤. top 은 내려갈수록 위로 빠지며 옅어지고, bottom 은 페이지 끝에 닿을수록 떠오른다
 *   가운데 - 첫 진입. top 은 위에서 내려와 자리를 잡는다
 *   안쪽 - 숨쉬기. 아주 느리게 조금 커졌다 작아진다 (CSS)
 */
export default function HorizonGlow({
  side = 'top',
  radius = 'max(96vw, 760px)',
  rim = '30%',
  className = '',
}: {
  side?: 'top' | 'bottom';
  radius?: string;
  rim?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const top = side === 'top';
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: top ? ['start start', 'end start'] : ['start end', 'end end'],
  });
  const y = useTransform(scrollYProgress, [0, 1], top ? ['0%', '-24%'] : ['26%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 1], top ? [1, 0.25] : [0.35, 1]);

  return (
    <motion.div ref={ref} aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={reduce ? undefined : { y, opacity }}>
      <motion.div className="absolute inset-0"
        initial={top && !reduce ? { opacity: 0, y: '-12%' } : false}
        animate={{ opacity: 1, y: '0%' }}
        transition={{ duration: 2, ease: easeEnter }}>
        <div className={`absolute inset-0 ${top ? 'glow-breathe-top' : 'glow-breathe-bottom'}`}>
          <div
            className={`glow-horizon glow-horizon--${side}`}
            style={{ '--glow-r': radius, '--glow-rim': rim } as CSSProperties}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
