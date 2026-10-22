'use client';

import { motion } from 'framer-motion';
import SectionHead from '@/components/ui/SectionHead';
import { awards, counts, teamCapabilities } from '@/data/teamCapabilities';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

/* 값은 전부 데이터에서 센다. 납품과 강의는 따로 센다 - 더해서 'N건 납품'이라 쓰면 틀린 말이 된다 */
const cards = [
  { label: '개발 프로젝트 납품', value: counts.devProjects, unit: '+', glow: '22%' },
  { label: '진행 강의', value: counts.lectures, unit: '+', glow: '50%' },
  { label: '수상 · 전시', value: awards.length, unit: '건', glow: '78%' },
];

/**
 * 숫자 세 장 - Figma 1-2. Key Results.
 * Figma 는 카드마다 현장 사진을 깔았다. 사진은 홈의 다른 칸이 이미 한 장씩 쓰고 있어,
 * 남색 면 아래에서 로고 파랑이 떠오르는 면으로 대신한다. 뒤에는 큰 MATE 글자가 옅게 깔린다.
 */
export default function KeyResults() {
  const since = teamCapabilities.stats.since;
  return (
    <section id="results" data-header="light" className="relative overflow-hidden bg-white py-24 sm:py-32 xl:py-[200px]">
      <p aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[52%] select-none text-center font-bold leading-none tracking-[-0.015em] text-[rgba(123,138,167,0.1)]"
        style={{ fontSize: 'clamp(8rem, 27vw, 32.5rem)' }}>
        MATE
      </p>

      <div className={`${container} relative`}>
        <SectionHead align="center" eyebrow="Key Results"
          title={<><b>{since}년</b>부터 쌓아 온 일을<br /><b>숫자로</b> 정리했습니다</>} />

        <motion.ul {...inView} variants={staggerTight}
          className="mx-auto mt-12 grid max-w-[1120px] gap-3 sm:mt-14 sm:grid-cols-3 lg:gap-4">
          {cards.map((c) => (
            <motion.li key={c.label} variants={fadeUp}
              className={`group relative flex h-[240px] flex-col items-center overflow-hidden px-6 pt-12 text-center text-white sm:h-[340px] lg:h-[500px] lg:pt-[89px] ${radiusCard}`}
              style={{
                background: [
                  `radial-gradient(120% 62% at ${c.glow} 118%, rgba(76,110,245,0.95) 0%, rgba(38,68,203,0.55) 32%, rgba(38,68,203,0) 66%)`,
                  'linear-gradient(rgba(125,149,255,0.08) 1px, transparent 1px) 0 0 / 36px 36px',
                  'linear-gradient(90deg, rgba(125,149,255,0.08) 1px, transparent 1px) 0 0 / 36px 36px',
                  'linear-gradient(180deg, #070b1d 0%, #111a42 100%)',
                ].join(', '),
              }}>
              {/* 올리면 아래 빛이 조금 더 차오른다 */}
              <span aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: `radial-gradient(90% 45% at ${c.glow} 110%, rgba(125,149,255,0.45), transparent 70%)` }} />
              <h3 className="type-h2 relative text-white">{c.label}</h3>
              <p className="relative mt-5 flex items-end justify-center gap-1.5 lg:mt-8">
                <span className="type-num">{c.value}</span>
                <span className="pb-[0.32em] text-[clamp(2rem,1.3rem+1.8vw,3.5rem)] font-bold leading-none">{c.unit}</span>
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
