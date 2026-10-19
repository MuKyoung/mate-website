'use client';

import { motion } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

/**
 * 파란 세로 줄무늬 - 폭이 제각각인 막대마다 위아래로 빛이 번진다.
 *
 * 감싸는 칸의 위치(relative 나 absolute)는 className 으로 넘긴다.
 *
 * 움직임: 화면에 들어오면 막대가 가운데에서 위아래로 차례로 자라나고,
 * 그 뒤로는 막대 몇 개가 제각각 천천히 숨을 쉬며, 이따금 빛 한 줄기가 가로로 훑고 지나간다.
 *
 * 무작위처럼 보이지만 seed 로 정해지는 수열이라 서버와 브라우저가 같은 그림을 그린다
 * (하이드레이션 불일치가 나지 않는다). 같은 페이지에 두 번 쓰면 seed 를 바꾼다.
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

type Bar = { x: number; w: number; v: string; o: number; y: number; h: number; breathe: number; d: number };

export default function StripeField({
  seed = 7,
  density = 1,
  className = '',
}: {
  seed?: number;
  /** 1 이 기본. 높을수록 막대가 촘촘하다 */
  density?: number;
  className?: string;
}) {
  const r = rng(seed);
  const bars: Bar[] = [];
  let x = r() * 20;
  while (x < 1000) {
    const wide = r() < 0.18;
    const w = wide ? 18 + r() * 34 : 2 + r() * 12;
    const pick = r();
    const v = pick < 0.22 ? 'bright' : pick < 0.62 ? 'blue' : pick < 0.82 ? 'steel' : 'deep';
    // 막대마다 빛의 높이가 조금씩 어긋나야 한 장의 그라디언트로 읽히지 않는다
    const y = -10 + r() * 18;
    // 셋 중 하나쯤만 숨을 쉰다 - 전부 움직이면 화면이 떨린다
    const breathe = r() < 0.34 ? 5 + r() * 6 : 0;
    bars.push({ x, w, v, o: 0.55 + r() * 0.45, y, h: 100 - y * 2 + r() * 10, breathe, d: r() * 4 });
    x += w + (r() < 0.3 ? 0 : (2 + r() * 22) / density);
  }
  const id = (v: string) => `sf${seed}-${v}`;

  return (
    <div aria-hidden className={`grain overflow-hidden bg-black ${className}`}>
      <motion.svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none"
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10% 0px' }}>
        <defs>
          <linearGradient id={id('bright')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.3" stopColor="#163fd1" />
            <stop offset="0.52" stopColor="#dce7ff" />
            <stop offset="0.74" stopColor="#163fd1" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('blue')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.36" stopColor="#2e5bf0" />
            <stop offset="0.56" stopColor="#6e97ff" />
            <stop offset="0.82" stopColor="#12339f" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('steel')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.42" stopColor="#7f8aa0" />
            <stop offset="0.6" stopColor="#c3c9d0" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('deep')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.5" stopColor="#1a3bb0" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {bars.map((b, i) => (
          <g key={i} className={b.breathe ? 'bar-breathe' : undefined}
            style={b.breathe ? { animationDuration: `${b.breathe}s`, animationDelay: `-${b.d}s` } : undefined}>
            <motion.rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${id(b.v)})`}
              style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
              variants={{
                hidden: { scaleY: 0, opacity: 0 },
                show: { scaleY: 1, opacity: b.o, transition: { duration: 1.1, delay: (b.x / 1000) * 0.7 + (i % 3) * 0.05, ease: easeEnter } },
              }} />
          </g>
        ))}
      </motion.svg>
      {/* 가로로 훑고 지나가는 빛 - overlay 라 검은 틈에서는 보이지 않고 막대만 밝힌다.
          움직임 줄이기 설정이면 CSS 전역 규칙이 멈춘다 (렌더를 설정에 따라 바꾸면 서버 HTML 과 어긋난다) */}
      <div className="stripe-sweep" />
    </div>
  );
}
