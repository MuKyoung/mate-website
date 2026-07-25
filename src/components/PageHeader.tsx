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
    <section className="bg-[#0a0a0a] pt-36 sm:pt-44 pb-16 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-y-6 gap-x-8 items-end">
          <div className="lg:col-span-7">
            {eyebrow && (
              <motion.p {...onMount} variants={fadeUp} className="text-[13px] text-white/35 mb-5">
                {eyebrow}
              </motion.p>
            )}
            <motion.h1 {...onMount} variants={stagger}
              className="text-white font-semibold tracking-[-0.03em] leading-[1.05]"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              <span className="block overflow-hidden">
                <motion.span variants={clipUp} className="block">{title}</motion.span>
              </span>
            </motion.h1>
          </div>
          <motion.p {...onMount} variants={fadeUp}
            className="lg:col-span-5 text-[15px] text-white/55 leading-[1.75] lg:pb-2">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
