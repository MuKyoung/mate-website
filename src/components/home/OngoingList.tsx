'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { ongoing } from '@/data/ongoing';
import { games } from '@/data/games';
import { fadeUp, staggerRows, inView } from '@/lib/motion';
import { container } from '@/lib/styles';

/* 영역마다 지금 하고 있는 일 + 자체 게임. 끝나면 데이터에서 지우거나 포트폴리오로 옮긴다 */
const rows = [
  ...ongoing.web.map((w) => ({ ...w, area: '웹 · 앱', href: '/web' })),
  ...ongoing.game.map((w) => ({ ...w, area: '게임 · XR', href: '/game' })),
  ...ongoing.edu.map((w) => ({ ...w, area: '교육', href: '/education' })),
  ...games.map((g) => ({ title: g.title, status: g.status, area: '자체 게임', href: '/services#originals' })),
];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 지금 하고 있는 일 - 흰 카드 안의 목록 (Figma 1-8. news).
 * Figma 의 날짜 자리에는 영역을, 오른쪽에는 진행 상태를 적는다.
 */
export default function OngoingList() {
  return (
    <section id="news" data-header="light" className="relative overflow-hidden bg-white py-24 sm:py-32 xl:pb-[140px] xl:pt-[100px]">
      {/* 오른쪽 위로 크게 지나가는 원 두 개 - Figma 의 옅은 지구본 선 자리 */}
      <div aria-hidden className="pointer-events-none absolute -right-[12%] -top-[30%] hidden aspect-square w-[46vw] rounded-pill border border-[#e6e9ef] lg:block" />
      <div aria-hidden className="pointer-events-none absolute -right-[4%] top-[18%] hidden aspect-square w-[34vw] rounded-pill border border-[#eef0f4] lg:block" />

      <div className={`${container} relative`}>
        <SectionHead eyebrow="Now"
          title={<>MATE가 <b>지금</b><br /><b>하고 있는 일</b>입니다</>} />

        <motion.ul {...inView} variants={staggerRows}
          className="mt-10 overflow-hidden rounded-card-sm border border-line bg-white shadow-float sm:mt-12 lg:rounded-card">
          {rows.map((r, i) => (
            <motion.li key={`${r.area}-${r.title}`} variants={fadeUp} className="border-b border-[#eef0f4] last:border-b-0">
              <Link href={r.href}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(246,247,249,0.7)] sm:grid sm:grid-cols-[48px_120px_1fr_auto_auto] sm:gap-x-6 sm:px-7 sm:py-5">
                <span className="hidden text-[13px] font-bold tabular-nums text-gray-500 sm:block">{pad(i + 1)}</span>
                <span className="hidden text-[14px] text-gray-500 sm:block">{r.area}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-gray-500 sm:hidden">{r.area} · {r.status}</span>
                  <span className="block text-[15px] font-bold text-ink transition-colors group-hover:text-point-200 sm:text-[16px]">
                    {r.title}
                  </span>
                </span>
                <span className="hidden text-right text-[13px] text-gray-500 sm:block">{r.status}</span>
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-gray-300 text-gray-500 transition-colors group-hover:border-point-200 group-hover:bg-point-200 group-hover:text-white">
                  <FiArrowRight size={15} />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
