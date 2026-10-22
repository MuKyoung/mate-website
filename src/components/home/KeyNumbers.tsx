'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { partners } from '@/data/partners';
import { awards, counts, teamCapabilities } from '@/data/teamCapabilities';
import { fadeUp, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, container, radiusCard } from '@/lib/styles';

const capOf = (id: string) => teamCapabilities.capabilities.find((c) => c.id === id)?.projects ?? 0;
const years = awards.map((a) => a.year);

/* 값은 전부 데이터에서 센다. 납품과 강의는 따로 센다 - 더해서 'N건 납품'이라 쓰면 틀린 말이 된다 */
const big = { label: '개발 프로젝트 납품', value: counts.devProjects, unit: '+', note: `게임 · XR ${capOf('unity')}+ / 웹 · 앱 ${capOf('outsourcing')}+` };
const small = [
  { label: '진행 강의', value: counts.lectures, unit: '+', note: '고등학교 · 대학교 · 기관' },
  { label: '수상 · 전시', value: awards.length, unit: '건', note: `${Math.min(...years)}~${Math.max(...years)}` },
];

/* 남색 면 아래에서 로고 파랑이 떠오르는 숫자 카드 바탕 */
const cardBg = (glowX: string) => ({
  background: [
    `radial-gradient(120% 70% at ${glowX} 120%, rgba(76,110,245,0.9) 0%, rgba(38,68,203,0.5) 34%, rgba(38,68,203,0) 68%)`,
    'linear-gradient(rgba(125,149,255,0.08) 1px, transparent 1px) 0 0 / 36px 36px',
    'linear-gradient(90deg, rgba(125,149,255,0.08) 1px, transparent 1px) 0 0 / 36px 36px',
    'linear-gradient(180deg, #070b1d 0%, #111a42 100%)',
  ].join(', '),
});

/**
 * 숫자 - 왼쪽에 제목과 함께한 곳, 오른쪽에 숫자 카드 셋을 큰 칸 하나 + 작은 칸 둘로 엇갈려 놓는다.
 */
export default function KeyNumbers() {
  const since = teamCapabilities.stats.since;
  return (
    <section id="numbers" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
      <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-5">
          <SectionHead eyebrow="Key Results"
            title={<><b>{since}년</b>부터 쌓아 온 일을<br /><b>숫자로</b> 정리했습니다</>} />

          <p className="type-b2 mt-12 text-ink">함께한 곳</p>
          <motion.ul {...inView} variants={staggerRows}
            className="mt-4 grid grid-cols-2 border-l border-t border-line bg-white">
            {partners.map((p) => (
              <motion.li key={p.name} variants={rowIn}
                className="flex min-h-[84px] flex-col justify-center gap-1 border-b border-r border-line px-4 py-3">
                <span className="text-[14px] font-bold leading-[1.35] text-ink sm:text-[15px]">{p.name}</span>
                <span className="text-[12px] text-gray-500">{p.role}</span>
              </motion.li>
            ))}
            {partners.length % 2 === 1 && (
              <motion.li variants={rowIn} className="border-b border-r border-line">
                <Link href="/contact" className="group flex h-full min-h-[84px] flex-col justify-center gap-1 bg-point-100 px-4 py-3 transition-colors hover:bg-point-200">
                  <span className="inline-flex items-center gap-1 text-[14px] font-bold text-point-200 group-hover:text-white sm:text-[15px]">
                    함께할 프로젝트 문의
                    <FiArrowUpRight size={14} className={arrowHover} />
                  </span>
                  <span className="text-[12px] text-gray-500 group-hover:text-white/80">아이디어 단계여도 됩니다</span>
                </Link>
              </motion.li>
            )}
          </motion.ul>
        </div>

        <motion.div {...inView} variants={staggerTight}
          className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:gap-4">
          <motion.div variants={fadeUp}
            className={`relative flex min-h-[300px] flex-col justify-between overflow-hidden p-7 text-white sm:row-span-2 sm:min-h-[560px] sm:p-9 ${radiusCard}`}
            style={cardBg('30%')}>
            <h3 className="type-h2 text-white">{big.label}</h3>
            <div>
              <p className="flex items-end gap-1.5">
                <span className="font-bold leading-none" style={{ fontSize: 'clamp(5rem, 3.4rem + 4.4vw, 8.5rem)' }}>{big.value}</span>
                <span className="pb-[0.3em] text-[clamp(2rem,1.4rem+1.6vw,3.5rem)] font-bold leading-none">{big.unit}</span>
              </p>
              <p className="mt-4 text-[14px] font-bold text-white/70">{big.note}</p>
            </div>
          </motion.div>
          {small.map((c, i) => (
            <motion.div key={c.label} variants={fadeUp}
              className={`relative flex min-h-[260px] flex-col justify-between overflow-hidden p-7 text-white sm:p-8 ${radiusCard}`}
              style={cardBg(i === 0 ? '80%' : '20%')}>
              <h3 className="type-h2 text-white">{c.label}</h3>
              <div>
                <p className="flex items-end gap-1">
                  <span className="text-[clamp(3.5rem,2.6rem+2.4vw,5.5rem)] font-bold leading-none">{c.value}</span>
                  <span className="pb-[0.25em] text-[clamp(1.75rem,1.3rem+1.2vw,2.75rem)] font-bold leading-none">{c.unit}</span>
                </p>
                <p className="mt-3 text-[14px] font-bold text-white/70">{c.note}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
