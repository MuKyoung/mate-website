'use client';

import { motion } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

/**
 * 가로 블록 모자이크 - 줄마다 한두 개의 막대가 파랑에서 회색으로 번진다.
 *
 * 감싸는 칸의 위치(relative 나 absolute)는 className 으로 넘긴다.
 * 화면에 들어오면 줄마다 왼쪽에서 밀려 들어오고, 그 뒤로는 몇 줄이 천천히 좌우로 흐른다.
 * seed 로 정해지는 수열이라 서버와 브라우저가 같은 그림을 그린다.
 */

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BlockMosaic({
  seed = 3,
  rows = 9,
  className = '',
}: {
  seed?: number;
  rows?: number;
  className?: string;
}) {
  const r = rng(seed);
  const h = 100 / rows;
  const lines: { y: number; drift: number; blocks: { x: number; w: number; g: number; o: number }[] }[] = [];
  for (let i = 0; i < rows; i++) {
    const n = r() < 0.35 ? 2 : 1;
    let x = r() * 30;
    const blocks = [];
    for (let k = 0; k < n && x < 92; k++) {
      const w = 18 + r() * 46;
      blocks.push({ x, w: Math.min(w, 100 - x), g: Math.floor(r() * 3), o: 0.6 + r() * 0.4 });
      x += w + 4 + r() * 20;
    }
    lines.push({ y: i * h, drift: r() < 0.45 ? 9 + r() * 8 : 0, blocks });
  }
  const id = (g: number) => `bm${seed}-${g}`;

  return (
    <div aria-hidden className={`grain overflow-hidden bg-black ${className}`}>
      <motion.svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px' }}>
        <defs>
          <linearGradient id={id(0)} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.45" stopColor="#2e5bf0" />
            <stop offset="1" stopColor="#c3c9d0" />
          </linearGradient>
          <linearGradient id={id(1)} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7f8aa0" />
            <stop offset="0.55" stopColor="#1d4fe6" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id(2)} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d1b57" />
            <stop offset="0.5" stopColor="#4c7dff" />
            <stop offset="1" stopColor="#0d1b57" />
          </linearGradient>
        </defs>
        {lines.map((line, li) => (
          <g key={li} className={line.drift ? 'row-drift' : undefined}
            style={line.drift ? { animationDuration: `${line.drift}s`, animationDelay: `-${li}s` } : undefined}>
            {line.blocks.map((b, bi) => (
              <motion.rect key={bi} x={b.x} y={line.y} width={b.w} height={h} fill={`url(#${id(b.g)})`}
                variants={{
                  hidden: { x: -18, opacity: 0 },
                  show: { x: 0, opacity: b.o, transition: { duration: 1, delay: li * 0.06 + bi * 0.08, ease: easeEnter } },
                }} />
            ))}
          </g>
        ))}
      </motion.svg>
    </div>
  );
}
