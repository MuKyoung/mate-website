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
      <div className="h-full p-6 bg-white rounded-[20px] border border-[#e5e8eb] shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_12px_32px_rgba(25,31,40,0.10)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
        {/* 별점 */}
        <div className="flex gap-0.5 mb-4" aria-label={`평점 ${testimonial.rating}/5`}>
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} size={13}
              className={i < testimonial.rating ? 'text-[#3182f6] fill-[#3182f6]' : 'text-[#e5e8eb]'} />
          ))}
        </div>

        {/* 내용 */}
        <p className="text-sm text-[#4e5968] leading-relaxed flex-grow mb-5">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* 작성자 */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#e5e8eb]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 bg-[#3182f6]">
            {testimonial.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#191f28] text-[13px] truncate">{testimonial.name}</p>
            <p className="text-[12px] text-[#6b7684] mt-0.5 truncate">
              {testimonial.role}
              {testimonial.company && <span className="text-[#3182f6] font-medium"> · {testimonial.company}</span>}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
