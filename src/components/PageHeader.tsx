'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import HorizonGlow from '@/components/visual/HorizonGlow';
import type { NavLink } from '@/data/navigation';
import { fadeUp, onMount, stagger } from '@/lib/motion';
import { container } from '@/lib/styles';

interface PageHeaderProps {
  /** 칸 이름 줄 - 'MATE / ' 뒤에 붙는다 ("Services") */
  crumb: string;
  title: React.ReactNode;
  desc?: string;
  /** 머리 아래 탭 - 같은 갈래의 다른 페이지나 이 페이지의 칸으로 간다 */
  tabs?: NavLink[];
  /** 지금 페이지(또는 읽고 있는 칸)에 해당하는 탭의 href */
  active?: string;
}

/**
 * 하위 페이지 머리 - 위에서 휘어 내려오는 빛 아래 왼쪽 정렬 제목, 오른쪽 설명, 맨 아래 밑줄 탭.
 * 홈 첫 화면(큐브)과 같은 빛을 낮고 옅게 둔다. 헤더는 이 위에서 흰 글자가 된다.
 */
export default function PageHeader({ crumb, title, desc, tabs, active }: PageHeaderProps) {
  return (
    <section data-header="dark" className="on-night relative overflow-hidden bg-night pt-40 sm:pt-56">
      <HorizonGlow side="top" rim="clamp(110px, 13vw, 200px)" radius="max(120vw, 900px)" />

      <motion.div {...onMount} variants={stagger} className={`${container} relative`}>
        <motion.p variants={fadeUp} className="eyebrow mb-8 sm:mb-10">
          <span className="text-white/45">MATE /</span> {crumb}:
        </motion.p>
        <div className="grid items-end gap-x-8 gap-y-6 lg:grid-cols-12">
          <motion.h1 variants={fadeUp}
            className="font-medium leading-[1.08] tracking-[-0.022em] text-white lg:col-span-7"
            style={{ fontSize: 'clamp(2.5rem, 1.3rem + 3.4vw, 4.75rem)' }}>
            {title}
          </motion.h1>
          {desc && (
            <motion.p variants={fadeUp} className="type-b3 max-w-xl text-gray-300 lg:col-span-5 lg:pb-2">
              {desc}
            </motion.p>
          )}
        </div>

        {tabs && tabs.length > 0 ? (
          <motion.nav variants={fadeUp} aria-label="이 갈래의 페이지" className="mt-14 border-t border-white/15 sm:mt-20">
            <ul className="no-scrollbar -mb-px flex gap-7 overflow-x-auto sm:gap-10">
              {tabs.map((t) => {
                const on = t.href === active;
                const cls = `relative block whitespace-nowrap py-5 text-[15px] transition-colors ${
                  on ? 'font-semibold text-white' : 'text-white/55 hover:text-white'
                }`;
                const bar = on && <span aria-hidden className="absolute inset-x-0 top-[-1px] h-0.5 bg-point-light" />;
                return (
                  <li key={t.href}>
                    {/* 같은 페이지 안의 칸으로 가는 탭은 일반 링크로 둔다 - 관성 스크롤(SmoothScroll)이 받아서 옮긴다 */}
                    {t.href.startsWith('#') ? (
                      <a href={t.href} aria-current={on ? 'location' : undefined} className={cls}>{t.label}{bar}</a>
                    ) : (
                      <Link href={t.href} aria-current={on ? 'page' : undefined} className={cls}>{t.label}{bar}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        ) : (
          <div className="pb-16 sm:pb-24" />
        )}
      </motion.div>
    </section>
  );
}
