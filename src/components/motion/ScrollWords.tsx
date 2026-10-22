'use client';

import { Fragment, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';

type Segment = { text: string; className?: string; br?: boolean };

/**
 * 스크롤을 내리는 만큼 낱말이 하나씩 밝아지는 문장.
 *
 * 문장이 화면 아래쪽에 들어올 때 시작해 화면 가운데를 지날 때 다 켜진다.
 * 여러 조각(색이 다른 부분, 줄바꿈)을 이어 한 문장으로 센다.
 */
export default function ScrollWords({
  segments,
  className = '',
  style,
}: {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 88%', 'end 48%'] });

  const words = segments.flatMap((seg, si) =>
    seg.text.split(' ').map((w, wi, arr) => ({ w, cls: seg.className, br: seg.br && wi === arr.length - 1, key: `${si}-${wi}` })),
  );

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <Fragment key={word.key}>
          <Word progress={scrollYProgress} from={i / words.length} to={(i + 1) / words.length}
            className={word.cls} still={Boolean(reduce)}>
            {word.w}
          </Word>
          {word.br ? <br /> : ' '}
        </Fragment>
      ))}
    </p>
  );
}

function Word({
  progress, from, to, className, still, children,
}: {
  progress: MotionValue<number>; from: number; to: number; className?: string; still: boolean; children: string;
}) {
  const opacity = useTransform(progress, [from, to], [0.14, 1]);
  return (
    <motion.span className={className} style={still ? undefined : { opacity }}>
      {children}
    </motion.span>
  );
}
