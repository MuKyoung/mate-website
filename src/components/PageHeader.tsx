'use client';

import { motion } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export default function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <section className="bg-[#f7f7f7] border-b border-[#e1e1e1] pt-28 sm:pt-32 pb-12 sm:pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        {eyebrow && (
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: easeEnter }}
            className="section-label mb-4"
          >
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.04, ease: easeEnter }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#262626] mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.1, ease: easeEnter }}
          className="text-[15px] sm:text-base text-[#4c4c4c] leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
