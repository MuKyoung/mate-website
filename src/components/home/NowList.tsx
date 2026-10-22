'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { ongoing } from '@/data/ongoing';
import { games } from '@/data/games';
import { rowIn, staggerRows, inView } from '@/lib/motion';
import { arrowTile, chip, chipLine, container } from '@/lib/styles';

/* 영역마다 지금 하고 있는 일 + 자체 게임. 끝나면 데이터에서 지우거나 포트폴리오로 옮긴다 */
const rows = [
  ...ongoing.web.map((w) => ({ ...w, area: '웹 · 앱', href: '/web' })),
  ...ongoing.game.map((w) => ({ ...w, area: '게임 · XR', href: '/game' })),
  ...ongoing.edu.map((w) => ({ ...w, area: '교육', href: '/education' })),
  ...games.map((g) => ({ title: g.title, status: g.status, area: '자체 게임', href: '/services#originals' })),
];

/**
 * 지금 하는 일 - 굵은 윗선 아래로 줄마다 상태 칩 · 영역 칩 · 이름.
 */
export default function NowList() {
  return (
    <section id="now" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
      <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead eyebrow="Now:" title={<>지금<br /><b>진행 중인 일</b></>} />
            <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
              Total <span className="text-point-200">{String(rows.length).padStart(2, '0')}</span>
            </p>
          </div>
        </div>

        <motion.ul {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-8">
          {rows.map((r) => (
            <motion.li key={`${r.area}-${r.title}`} variants={rowIn} className="border-b border-line">
              <Link href={r.href} className="group flex items-center justify-between gap-6 py-5 sm:py-6">
                <span className="min-w-0">
                  <span className="flex flex-wrap gap-1.5">
                    <span className={chip}>{r.status}</span>
                    <span className={chipLine}>{r.area}</span>
                  </span>
                  <span className="mt-3 block text-[18px] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-point-200 sm:text-[21px]">
                    {r.title}
                  </span>
                </span>
                <span aria-hidden className={arrowTile}><FiArrowUpRight size={18} /></span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
