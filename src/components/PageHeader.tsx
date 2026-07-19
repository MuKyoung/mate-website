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
    <section className="relative bg-[#0a0a0a] overflow-hidden pt-36 sm:pt-44 pb-16 sm:pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/3 right-0 w-[55vw] h-[55vw] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
      </div>
      <div className="relative container mx-auto px-4 sm:px-6">
        <motion.span {...onMount} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6">
          {eyebrow ?? 'MATE'}
        </motion.span>
        <motion.h1 {...onMount} variants={stagger} className="display-section text-white mb-6">
          <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{title}</motion.span></span>
        </motion.h1>
        <motion.p {...onMount} variants={fadeUp} className="text-lg on-dark-2 leading-relaxed max-w-2xl">
          {description}
        </motion.p>
      </div>
    </section>
  );
}
