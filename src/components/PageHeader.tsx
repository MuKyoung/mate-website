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
    <section className="relative bg-gradient-to-b from-[#f4f6f8] to-white pt-32 sm:pt-40 pb-14 sm:pb-20 border-b border-[#e5e8eb]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-y-6 gap-x-8 items-end">
          <div className="lg:col-span-7">
            {eyebrow && (
              <motion.p {...onMount} variants={fadeUp}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#3182f6] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6]" />
                {eyebrow}
              </motion.p>
            )}
            <motion.h1 {...onMount} variants={stagger}
              className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              <span className="block overflow-hidden">
                <motion.span variants={clipUp} className="block">{title}</motion.span>
              </span>
            </motion.h1>
          </div>
          <motion.p {...onMount} variants={fadeUp}
            className="lg:col-span-5 text-[15px] sm:text-base text-[#4e5968] leading-[1.75] lg:pb-2">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
