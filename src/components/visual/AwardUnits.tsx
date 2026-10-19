'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { awards, type Award } from '@/data/teamCapabilities';
import { easeEnter } from '@/lib/motion';

/**
 * 연도별 수상 · 전시 - 이력 한 건이 칸 하나다.
 *
 * 숫자를 지어내지 않도록 teamCapabilities 의 awards 를 그대로 센다.
 * 수상 · 선정은 파란 칸, 전시 참가는 회색 칸.
 *
 * 움직임: 화면에 들어오면 해마다 바닥부터 칸이 쌓이고, 다 쌓인 뒤 빛 한 줄이 왼쪽에서
 * 오른쪽으로 한 번 훑는다. 칸에 마우스를 올리면 위쪽 줄에 그 이력이 뜬다.
 */
export default function AwardUnits({ className = '' }: { className?: string }) {
  const [hover, setHover] = useState<Award | null>(null);
  const years = Array.from(new Set(awards.map((a) => a.year))).sort((a, b) => a - b);
  const byYear = years.map((y) => ({
    year: y,
    items: awards
      .filter((a) => a.year === y)
      // 수상을 아래에 깔아 파란 칸이 바닥부터 쌓이게 한다
      .sort((a, b) => (a.type === b.type ? 0 : a.type === 'award' ? -1 : 1)),
  }));
  const awardCount = awards.filter((a) => a.type === 'award').length;

  return (
    <div className={`[--unit:clamp(14px,2.1vw,26px)] ${className}`}>
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.02em] text-white/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-gradient-to-b from-[#dce7ff] to-[#2e5bf0]" /> 수상 · 선정 {awardCount}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-gradient-to-b from-[#9aa4b6] to-[#2b3242]" /> 전시 참가 {awards.length - awardCount}
        </span>
      </div>

      {/* 마우스를 올린 칸의 이력. 높이를 고정해 아래 차트가 흔들리지 않게 한다 */}
      <p aria-hidden className="mb-5 h-5 truncate font-mono text-[12px] tracking-[0.01em] text-white/80">
        {hover ? (
          <><span className="text-[var(--point)]">{hover.year}</span> · {hover.title} · {hover.rank}</>
        ) : (
          <span className="text-white/40">ALL: {awards.length}건</span>
        )}
      </p>

      <motion.div role="img" aria-label={byYear.map((c) => `${c.year}년 ${c.items.length}건`).join(', ')}
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-8% 0px' }}
        className="relative grid items-end gap-1 overflow-hidden sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}
        onMouseLeave={() => setHover(null)}>
        {byYear.map((c, ci) => (
          <div key={c.year} className="flex flex-col items-stretch">
            <motion.p
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.3 + ci * 0.08 + c.items.length * 0.06 } } }}
              className="mb-2 font-mono text-[12px] text-white/70 tabular-nums">
              {c.items.length}
            </motion.p>
            <div className="flex flex-col-reverse gap-1 sm:gap-1.5">
              {c.items.map((a, i) => (
                <motion.span key={a.id}
                  onMouseEnter={() => setHover(a)}
                  variants={{
                    hidden: { opacity: 0, scaleY: 0 },
                    show: { opacity: 1, scaleY: 1, transition: { delay: ci * 0.08 + i * 0.06, duration: 0.55, ease: easeEnter } },
                  }}
                  style={{ transformOrigin: '50% 100%' }}
                  className={`block cursor-default outline outline-1 -outline-offset-1 transition-[filter,outline-color] duration-200
                    [height:var(--unit)] hover:brightness-125 ${
                    hover?.id === a.id ? 'outline-white' : 'outline-transparent'} ${
                    a.type === 'award'
                      ? 'bg-gradient-to-b from-[#dce7ff] via-[#4c7dff] to-[#1d4fe6]'
                      : 'bg-gradient-to-b from-[#9aa4b6] to-[#2b3242]'}`} />
              ))}
            </div>
            <p className="mt-3 border-t border-white/15 pt-2 font-mono text-[11px] text-white/55 tabular-nums">{c.year}</p>
          </div>
        ))}

        {/* 다 쌓인 뒤 한 번 훑고 지나가는 빛 */}
        <motion.span aria-hidden
          variants={{ hidden: { x: '-10%', opacity: 0 }, show: { x: '1100%', opacity: [0, 1, 1, 0], transition: { delay: 1.1, duration: 1.6, ease: [0.65, 0, 0.35, 1] } } }}
          className="pointer-events-none absolute inset-y-0 left-0 w-[9%]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(143,176,255,0.28) 60%, rgba(220,231,255,0.65) 92%, transparent)' }} />
      </motion.div>
    </div>
  );
}
