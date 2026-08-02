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
    <section className="bg-white pt-40 sm:pt-52 pb-14 sm:pb-20 border-b border-[#e5e8eb]">
      <div className="container mx-auto px-4 sm:px-6">
        {eyebrow && (
          <motion.p {...onMount} variants={fadeUp}
            className="index-num pb-6 border-b border-[#e5e8eb] mb-12 sm:mb-16">
            {eyebrow}
          </motion.p>
        )}
        <div className="grid lg:grid-cols-12 gap-y-8 gap-x-8 items-end">
          <motion.h1 {...onMount} variants={stagger}
            className="lg:col-span-8 text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.96]"
            style={{ fontSize: 'clamp(3rem, 9vw, 8rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">{title}</motion.span>
            </span>
          </motion.h1>
          <motion.p {...onMount} variants={fadeUp}
            className="lg:col-span-4 text-[16px] sm:text-lg text-[#4e5968] leading-[1.7] lg:pb-4">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
