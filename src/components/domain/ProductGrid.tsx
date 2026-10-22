'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import SectionHead from '@/components/ui/SectionHead';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { chipLine, container, iconTile, radiusCard } from '@/lib/styles';

export interface ProductItem {
  title: string;
  en: string;
  icon: IconType;
  desc?: string;
  tags?: string[];
}

/**
 * 영역에서 만드는 것들 - 흰 칸에 파란 아이콘 칸, 영문 이름, 설명, 태그.
 */
export default function ProductGrid({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: ProductItem[] }) {
  return (
    <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
      <div className={container}>
        <SectionHead eyebrow={eyebrow} title={title} />
        <motion.ul {...inView} variants={staggerTight}
          className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.li key={it.title} variants={fadeUp}
                className={`group flex min-h-[260px] flex-col border border-line bg-white p-6 transition-colors duration-300 hover:border-point-200 sm:p-7 ${radiusCard}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={iconTile}><Icon size={20} /></span>
                  <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.06em] text-point-200">{it.en}</p>
                <h3 className="type-h3 mt-1.5 text-ink">{it.title}</h3>
                {it.desc && <p className="mt-3 text-[14px] leading-[1.7] text-ink-2">{it.desc}</p>}
                {it.tags && it.tags.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {it.tags.map((t) => <span key={t} className={chipLine}>{t}</span>)}
                  </div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
