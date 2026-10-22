'use client';

import { motion } from 'framer-motion';
import { fadeLeft, fadeUp, stagger, inView } from '@/lib/motion';
import { chipLine, container } from '@/lib/styles';

interface DomainIntroProps {
  /** 칸 이름 - "Web & App:" */
  eyebrow: string;
  title: React.ReactNode;
  desc: React.ReactNode;
  /** 왼쪽 그림 칸 - 비율과 모양은 넘기는 쪽이 정한다 */
  media: React.ReactNode;
  stats?: { value: string; label: string }[];
  tags?: string[];
}

/**
 * 영역 페이지 첫 칸 - 왼쪽에 그림, 오른쪽에 글과 숫자.
 */
export default function DomainIntro({ eyebrow, title, desc, media, stats, tags }: DomainIntroProps) {
  return (
    <section data-header="light" className="bg-white py-20 sm:py-28 xl:py-36">
      <div className={`${container} grid items-center gap-12 lg:grid-cols-12 lg:gap-8`}>
        <motion.div {...inView} variants={fadeLeft} className="lg:col-span-6">
          {media}
        </motion.div>

        <motion.div {...inView} variants={stagger} className="lg:col-span-5 lg:col-start-8">
          <motion.p variants={fadeUp} className="eyebrow mb-5">{eyebrow}</motion.p>
          <motion.h2 variants={fadeUp} className="type-h1 text-ink">{title}</motion.h2>
          <motion.p variants={fadeUp} className="type-b3 mt-6 text-ink-2">{desc}</motion.p>
          {stats && stats.length > 0 && (
            <motion.dl variants={fadeUp} className="mt-9 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-2 text-[13px] text-ink-3">{s.label}</dt>
                  <dd className="text-[34px] font-medium leading-none tracking-[-0.02em] text-ink">{s.value}</dd>
                </div>
              ))}
            </motion.dl>
          )}
          {tags && tags.length > 0 && (
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-1.5">
              {tags.map((t) => <span key={t} className={chipLine}>{t}</span>)}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
