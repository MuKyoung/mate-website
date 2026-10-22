'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { FiGitBranch, FiCalendar, FiPackage, FiActivity } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { promises, type WorkPromise } from '@/data/promises';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container, iconTile, radiusCard } from '@/lib/styles';

const ICON: Record<WorkPromise['id'], IconType> = {
  repo: FiGitBranch,
  weekly: FiCalendar,
  handover: FiPackage,
  monitor: FiActivity,
};

/* 넓은 화면에서 칸마다 조금씩 높여 계단처럼 오른다 */
const LIFT = ['lg:mb-0', 'lg:mb-10', 'lg:mb-20', 'lg:mb-[120px]'];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 일하는 방식 - 회색 면 위로 흰 카드 네 장이 계단처럼 오른다. 마지막 칸이 배포한 뒤의 일이다.
 */
export default function WhyStairs() {
  return (
    <section id="why" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
      <div className={container}>
        <SectionHead eyebrow="Why MATE"
          title={<>납품으로 끝내지 않습니다<br />배포한 뒤에도 <b>지켜봅니다</b></>}
          desc="모니터링으로 안정성을 확인하고, 유지보수도 이어서 맡습니다." />

        <motion.ol {...inView} variants={staggerTight}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:items-end lg:gap-5">
          {promises.map((p, i) => {
            const Icon = ICON[p.id];
            return (
              <motion.li key={p.id} variants={fadeUp}
                className={`flex min-h-[260px] flex-col bg-white p-6 shadow-float sm:p-7 ${radiusCard} ${LIFT[i] ?? ''}`}>
                <div className="flex items-start justify-between">
                  <span className={iconTile}><Icon size={22} /></span>
                  <span className="text-[16px] font-bold text-point-200">{pad(i + 1)}</span>
                </div>
                <h3 className="type-b1 mt-auto pt-10 text-ink">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-ink-2">{p.desc}</p>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
