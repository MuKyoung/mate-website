'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="py-12 sm:py-14 md:py-16 text-white border-b"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="text-sm sm:text-base text-white/40 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
