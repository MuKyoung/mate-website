'use client';

import { motion } from 'framer-motion';
import { awards } from '@/data/teamCapabilities';
import { easeEnter } from '@/lib/motion';

/**
 * 연도별 수상 · 전시 - 이력 한 건이 칸 하나다.
 *
 * 숫자를 지어내지 않도록 teamCapabilities 의 awards 를 그대로 센다.
 * 수상 · 선정은 파란 칸, 전시 참가는 회색 칸. 칸에 마우스를 올리면 그 이력이 보인다.
 */
export default function AwardUnits({ className = '' }: { className?: string }) {
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

      <div role="img" aria-label={byYear.map((c) => `${c.year}년 ${c.items.length}건`).join(', ')}
        className="grid items-end gap-1 sm:gap-1.5"
        style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
        {byYear.map((c, ci) => (
          <div key={c.year} className="flex flex-col items-stretch">
            <p className="mb-2 font-mono text-[12px] text-white/70 tabular-nums">{c.items.length}</p>
            <div className="flex flex-col-reverse gap-1 sm:gap-1.5">
              {c.items.map((a, i) => (
                <motion.span key={a.id}
                  title={`${a.year} · ${a.title} · ${a.rank}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-8% 0px' }}
                  transition={{ delay: ci * 0.06 + i * 0.05, duration: 0.5, ease: easeEnter }}
                  className={`block [height:var(--unit)] ${a.type === 'award'
                    ? 'bg-gradient-to-b from-[#dce7ff] via-[#4c7dff] to-[#1d4fe6]'
                    : 'bg-gradient-to-b from-[#9aa4b6] to-[#2b3242]'}`} />
              ))}
            </div>
            <p className="mt-3 border-t border-white/15 pt-2 font-mono text-[11px] text-white/55 tabular-nums">{c.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
