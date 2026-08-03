'use client';

import { motion } from 'framer-motion';
import { clipUp, fadeLeft, fadeRight, lineDraw, onMount, stagger } from '@/lib/motion';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export default function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <section className="pt-40 sm:pt-52 pb-14 sm:pb-20 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6">
        {eyebrow && (
          <div className="relative pb-6 mb-12 sm:mb-16">
            <motion.p {...onMount} variants={fadeLeft} className="index-num font-en">
              {eyebrow}
            </motion.p>
            <motion.span {...onMount} variants={lineDraw}
              className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
          </div>
        )}
        <div className="grid lg:grid-cols-12 gap-y-8 gap-x-8 items-end">
          <motion.h1 {...onMount} variants={stagger}
            className="lg:col-span-8 font-en text-[#f5f6f7] font-extrabold tracking-[-0.045em] leading-[0.98]"
            style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block">{title}</motion.span>
            </span>
          </motion.h1>
          {/* 설명은 우측 칼럼 — 오른쪽에서 진입해 방향을 분리 */}
          <motion.p {...onMount} variants={fadeRight}
            className="lg:col-span-4 text-[16px] sm:text-lg text-white/55 leading-[1.7] lg:pb-4">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
