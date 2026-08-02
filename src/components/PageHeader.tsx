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
    <section className="relative bg-[#f4f3ff] pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-[2.5rem] bg-[#d4ff3d] rotate-12 opacity-70 pointer-events-none" />
      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-y-6 gap-x-8 items-end">
          <div className="lg:col-span-7">
            {eyebrow && (
              <motion.p {...onMount} variants={fadeUp} className="eyebrow text-[#4f46ff] mb-5">
                <span className="w-2 h-2 rounded-full bg-[#4f46ff]" />
                {eyebrow}
              </motion.p>
            )}
            <motion.h1 {...onMount} variants={stagger}
              className="text-[#0f0f19] font-extrabold tracking-[-0.035em] leading-[1.02]"
              style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)' }}>
              <span className="block overflow-hidden">
                <motion.span variants={clipUp} className="block">{title}</motion.span>
              </span>
            </motion.h1>
          </div>
          <motion.p {...onMount} variants={fadeUp}
            className="lg:col-span-5 text-[15px] sm:text-base text-[#5b5b6b] leading-[1.75] lg:pb-2">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
