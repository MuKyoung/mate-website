'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/types';
import { easeEnter } from '@/lib/motion';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

/** 인용 행 — 박스 없이 상단 헤어라인으로 구분 */
export default function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={index % 2 === 0 ? { opacity: 0, x: -56 } : { opacity: 0, x: 56 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: (index % 2) * 0.1, duration: 0.95, ease: easeEnter }}
      className="border-t border-white/10 pt-8"
    >
      <p className="text-[17px] sm:text-[19px] text-white/85 leading-[1.7] font-medium mb-7">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <p className="index-num">
        {testimonial.name}
        {testimonial.company && <span className="text-white/30">— {testimonial.company}</span>}
      </p>
    </motion.div>
  );
}
