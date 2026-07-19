'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/types';
import { FiStar } from 'react-icons/fi';
import { easeEnter } from '@/lib/motion';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export default function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className="h-full"
    >
      <div className="h-full p-6 bg-white rounded-2xl border border-[#e4e4e4] hover:border-[#0a0a0a] transition-colors flex flex-col">
        {/* 별점 */}
        <div className="flex gap-0.5 mb-4" aria-label={`평점 ${testimonial.rating}/5`}>
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} size={13}
              className={i < testimonial.rating ? 'text-[#2a72e5] fill-[#2a72e5]' : 'text-[#e1e1e1]'} />
          ))}
        </div>

        {/* 내용 */}
        <p className="text-sm text-[#4c4c4c] leading-relaxed flex-grow mb-5">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* 작성자 */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#e1e1e1]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 bg-[#2a72e5]">
            {testimonial.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#262626] text-[13px] truncate">{testimonial.name}</p>
            <p className="text-[12px] text-[#5d5d5d] mt-0.5 truncate">
              {testimonial.role}
              {testimonial.company && <span className="text-[#0043b3] font-medium"> · {testimonial.company}</span>}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
