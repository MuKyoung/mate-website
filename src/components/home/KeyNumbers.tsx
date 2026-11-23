'use client';

import { motion } from 'framer-motion';
import SectionHead from '@/components/ui/SectionHead';
import LogoMarquee from '@/components/motion/LogoMarquee';
import { partners } from '@/data/partners';
import { awards, counts, teamCapabilities } from '@/data/teamCapabilities';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

/* 함께하는 곳을 두 줄로 나눈다 */
const half = Math.ceil(partners.length / 2);
const rowA = partners.slice(0, half);
const rowB = partners.slice(half);

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
 * 숫자 - 왼쪽에 제목과 함께하는 곳(로고 흐름 두 줄), 오른쪽에 숫자 카드 셋을 큰 칸 하나 + 작은 칸 둘로 엇갈려 놓는다.
 */
export default function KeyNumbers() {
  const since = teamCapabilities.stats.since;
  return (
    <section id="numbers" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
      <div className={`${container} grid gap-14 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-5">
          <SectionHead eyebrow="Key Results"
            title={<><b>{since}년</b>부터 쌓아 온 일을<br /><b>숫자로</b> 정리했습니다</>} />

          <p className="type-b2 mt-12 text-ink">함께하는 곳</p>
          {/* 첫 화면 아래 로고 띠와 같은 곳들 - 여기서는 이름을 붙인 칸으로, 두 줄이 서로 반대로 흐른다 */}
          <motion.div {...inView} variants={fadeUp} className="mt-4 grid gap-3 [--logo:30px]">
            <LogoMarquee items={rowA} card repeat={2} seconds={40} fade="from-gray-100" />
            <LogoMarquee items={rowB} card repeat={2} seconds={40} reverse fade="from-gray-100" />
          </motion.div>
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
