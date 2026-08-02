'use client';

import { motion } from 'framer-motion';
import { clipUp, fadeUp, onMount, stagger } from '@/lib/motion';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export default function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <section className="relative bg-gradient-to-b from-[#f4f6f8] to-white pt-44 sm:pt-56 pb-20 sm:pb-28 border-b border-[#e5e8eb]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-y-8 gap-x-10 items-end">
          <div className="lg:col-span-7">
            {eyebrow && (
              <motion.p {...onMount} variants={fadeUp}
                className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-[#3182f6] mb-7">
                <span className="w-2 h-2 rounded-full bg-[#3182f6]" />
                {eyebrow}
              </motion.p>
            )}
            <motion.h1 {...onMount} variants={stagger}
              className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0]"
              style={{ fontSize: 'clamp(2.75rem, 7.5vw, 6rem)' }}>
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={clipUp} className="block">{title}</motion.span>
              </span>
            </motion.h1>
          </div>
          <motion.p {...onMount} variants={fadeUp}
            className="lg:col-span-5 text-[17px] sm:text-xl text-[#4e5968] leading-[1.7] lg:pb-3">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
