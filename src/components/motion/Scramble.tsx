'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/** 섞일 때 지나가는 글자 - 등폭 라벨이라 폭이 흔들리지 않는다 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_';
const canScramble = (c: string) => /[A-Za-z0-9]/.test(c);

/**
 * 등폭 라벨이 화면에 들어올 때 글자가 잠깐 뒤섞였다가 왼쪽부터 제자리를 찾는다.
 *
 * 서버와 첫 렌더는 완성된 글자를 그린다(하이드레이션 불일치 없음, 검색엔진도 그대로 읽는다).
 * 영문과 숫자만 섞고, 한글과 쌍점 · 빗금은 그대로 둔다. 움직임 줄이기 설정이면 섞지 않는다.
 */
export default function Scramble({
  text,
  delay = 0,
  duration = 720,
  className,
}: {
  text: string;
  /** 화면에 들어온 뒤 기다리는 시간 (ms) */
  delay?: number;
  /** 마지막 글자가 자리를 찾을 때까지 (ms) */
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px 4% 0px' });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!inView || reduce) return;
    const chars = Array.from(text);
    // 왼쪽 글자부터 차례로 멈춘다. 약간씩 어긋나야 기계적으로 보이지 않는다
    const settle = chars.map((_, i) => (i / Math.max(1, chars.length)) * duration * 0.75 + Math.random() * duration * 0.25);
    const start = performance.now() + delay;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const t = now - start;
      // 30fps 로 끊어 바꾼다 - 매 프레임 바꾸면 글자가 번져 보인다
      if (now - last >= 33) {
        last = now;
        let done = t >= 0;
        const next = chars.map((c, i) => {
          if (!canScramble(c)) return c;
          if (t >= settle[i]) return c;
          done = false;
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }).join('');
        setOut(next);
        if (done) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, text, delay, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}
