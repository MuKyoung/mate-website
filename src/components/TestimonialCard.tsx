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
      <div className="h-full p-6 bg-white rounded-2xl border border-[#e6e4f2] hover:border-[#4f46ff] hover:shadow-[0_8px_28px_-8px_rgba(79,70,255,0.25)] transition-all duration-200 flex flex-col">
        {/* 별점 */}
        <div className="flex gap-0.5 mb-4" aria-label={`평점 ${testimonial.rating}/5`}>
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} size={13}
              className={i < testimonial.rating ? 'text-[#4f46ff] fill-[#4f46ff]' : 'text-[#e6e4f2]'} />
          ))}
        </div>

        {/* 내용 */}
        <p className="text-sm text-[#5b5b6b] leading-relaxed flex-grow mb-5">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* 작성자 */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#e6e4f2]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 bg-[#4f46ff]">
            {testimonial.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#0f0f19] text-[13px] truncate">{testimonial.name}</p>
            <p className="text-[12px] text-[#858594] mt-0.5 truncate">
              {testimonial.role}
              {testimonial.company && <span className="text-[#4f46ff] font-medium"> · {testimonial.company}</span>}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
