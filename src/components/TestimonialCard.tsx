'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/types';
import { FiStar } from 'react-icons/fi';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export default function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="relative h-full p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
        {/* 왼쪽 상단 accent line */}
        <div className="absolute top-0 left-0 w-0 group-hover:w-full h-[1.5px] bg-[#3b82f6] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]" />

        {/* 별점 */}
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 + i * 0.05, type: 'spring', stiffness: 400, damping: 18 }}>
              <FiStar
                size={13}
                className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
              />
            </motion.div>
          ))}
        </div>

        {/* 내용 */}
        <p className="text-sm text-gray-600 leading-relaxed flex-grow mb-5">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* 작성자 */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: '#3b82f6' }}>
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-xs">{testimonial.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {testimonial.role}
              {testimonial.company && (
                <span className="text-[#3b82f6] font-medium"> · {testimonial.company}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
