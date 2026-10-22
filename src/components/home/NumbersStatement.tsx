'use client';

import { motion } from 'framer-motion';
import ScrollWords from '@/components/motion/ScrollWords';
import Ticker from '@/components/motion/Ticker';
import { partners } from '@/data/partners';
import { awards, counts, teamCapabilities } from '@/data/teamCapabilities';
import { fadeUp, rowIn, staggerRows, inView } from '@/lib/motion';
import { container } from '@/lib/styles';

/* 띠에 흐르는 수상 · 전시 이력 - 최근 것부터 */
const tickerItems = [...awards]
  .sort((a, b) => b.year - a.year)
  .map((a) => `${a.year} ${a.title} · ${a.rank}`);

/**
 * 숫자 - 숫자 칸을 늘어놓지 않고 한 문장으로 읽힌다. 스크롤을 내리는 만큼 낱말이 밝아진다.
 * 오른쪽에는 함께한 곳, 맨 아래로는 수상 · 전시 이력이 흐른다.
 * 값은 전부 데이터에서 센다. 납품과 강의는 따로 센다 - 더해서 'N건 납품'이라 쓰면 틀린 말이 된다.
 */
export default function NumbersStatement() {
  const since = teamCapabilities.stats.since;
  return (
    <section id="numbers" data-header="dark" className="night-grid on-night relative overflow-hidden pt-24 sm:pt-32 xl:pt-40">
      <div className={`${container} grid gap-16 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-7">
          <motion.p {...inView} variants={fadeUp} className="eyebrow mb-8 sm:mb-10">Since {since}:</motion.p>
          <ScrollWords
            className="font-medium leading-[1.3] tracking-[-0.02em] text-white"
            style={{ fontSize: 'clamp(1.75rem, 1rem + 2.1vw, 3rem)' }}
            segments={[
              { text: `${since}년부터`, br: true },
              { text: '개발 프로젝트' },
              { text: `${counts.devProjects}건 이상을`, className: 'text-point-light' },
              { text: '납품하고,', br: true },
              { text: '강의를' },
              { text: `${counts.lectures}회 이상`, className: 'text-point-light' },
              { text: '진행했습니다.', br: true },
              { text: `받은 상과 참가한 전시는 ${awards.length}건입니다.`, className: 'text-white/55' },
            ]}
          />
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <motion.p {...inView} variants={fadeUp} className="eyebrow mb-6">Worked with:</motion.p>
          <motion.ul {...inView} variants={staggerRows} className="border-t border-white/15">
            {partners.map((p) => (
              <motion.li key={p.name} variants={rowIn}
                className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                <span className="text-[15px] font-medium text-white">{p.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-white/50">{p.role}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div className="mt-20 border-t border-white/10 sm:mt-28">
        <Ticker items={tickerItems} />
      </div>
    </section>
  );
}
