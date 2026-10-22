'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

export interface ProductItem {
  title: string;
  en: string;
  icon: IconType;
  desc?: string;
}

/**
 * 영역의 주요 작업 - 회색 칸 네 줄 (Figma 6-2 「전기 · 전력 주요 제품」).
 * Figma 는 칸 오른쪽에 제품 사진을 넣었다. 사진 대신 흰 아이콘 칸을 둔다.
 */
export default function ProductGrid({ title, items }: { title: React.ReactNode; items: ProductItem[] }) {
  return (
    <section data-header="light" className="bg-white pb-24 pt-4 sm:pb-32 xl:pb-[160px]">
      <div className={container}>
        <motion.h2 {...inView} variants={fadeUp} className="type-h2 font-normal text-ink">{title}</motion.h2>
        <motion.ul {...inView} variants={staggerTight}
          className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <motion.li key={it.title} variants={fadeUp}
                className={`group flex min-h-[188px] flex-col bg-gray-100 p-6 transition-colors duration-300 hover:bg-point-100 sm:min-h-[200px] ${radiusCard}`}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[21px] font-bold leading-[1.3] text-ink xl:text-[25px]">{it.title}</h3>
                  <span aria-hidden
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-white text-point-200 shadow-float transition-transform duration-500 group-hover:-translate-y-1 xl:h-[72px] xl:w-[72px]">
                    <Icon size={28} strokeWidth={1.6} />
                  </span>
                </div>
                {it.desc && <p className="mt-4 text-[14px] leading-[1.6] text-ink-2">{it.desc}</p>}
                <p className="mt-auto pt-5 text-[13px] font-bold text-gray-500">{it.en}</p>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
