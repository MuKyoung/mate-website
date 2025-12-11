'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <section className="py-12 sm:py-14 md:py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}

