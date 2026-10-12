'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/types';
import { easeEnter } from '@/lib/motion';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  /** 첫 건은 크게 세워 네 칸이 같은 덩어리로 읽히지 않게 한다 */
  lead?: boolean;
}

/** 인용 행 - 박스 없이 상단 헤어라인으로 구분 */
export default function TestimonialCard({ testimonial, index, lead = false }: TestimonialCardProps) {
  return (
    <motion.div
      initial={index % 2 === 0 ? { opacity: 0, x: -56 } : { opacity: 0, x: 56 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: (index % 2) * 0.1, duration: 0.95, ease: easeEnter }}
      className="border-t border-white/10 pt-8"
    >
      <p
        className={`text-white/85 leading-[1.6] font-medium mb-7 ${
          lead ? 'tracking-[-0.02em]' : 'text-[16px] sm:text-[17px] leading-[1.75]'
        }`}
        style={lead ? { fontSize: 'clamp(1.375rem, 2.4vw, 2rem)' } : undefined}
      >
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <p className="index-num">
        {testimonial.role}
        {testimonial.company && <span className="text-white/50">{testimonial.company}</span>}
      </p>
    </motion.div>
  );
}
