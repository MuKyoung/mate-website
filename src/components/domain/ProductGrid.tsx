'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import SectionHead from '@/components/ui/SectionHead';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

export interface ProductItem {
  title: string;
  en: string;
  icon: IconType;
  desc?: string;
  tags?: string[];
}

/**
 * 영역에서 만드는 것들 - 회색 칸 왼쪽 위에 이름, 오른쪽 위에 흰 아이콘 칸 (Figma 사업영역 「주요 제품」 모양).
 */
export default function ProductGrid({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: ProductItem[] }) {
  return (
    <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
      <div className={container}>
        <SectionHead eyebrow={eyebrow} title={title} />
        <motion.ul {...inView} variants={staggerTight}
          className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <motion.li key={it.title} variants={fadeUp}
                className={`group flex min-h-[240px] flex-col bg-gray-100 p-6 transition-colors duration-300 hover:bg-point-100 sm:p-7 ${radiusCard}`}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[22px] font-bold leading-[1.3] text-ink xl:text-[25px]">{it.title}</h3>
                  <span aria-hidden
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-white text-point-200 shadow-float transition-transform duration-500 group-hover:-translate-y-1">
                    <Icon size={28} strokeWidth={1.6} />
                  </span>
                </div>
                {it.desc && <p className="mt-4 text-[15px] leading-[1.6] text-ink-2">{it.desc}</p>}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {it.tags?.map((t) => <span key={t} className="inline-flex items-center rounded-[4px] bg-white px-2.5 py-1 text-[12px] font-bold leading-none text-ink">{t}</span>)}
                  </div>
                  <span className="text-[13px] font-bold text-gray-500">{it.en}</span>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
