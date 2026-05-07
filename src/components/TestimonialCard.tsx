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
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -8 }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 sm:p-7 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 overflow-hidden accent-border-left in-view">
        {/* 호버 오버레이 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-br from-purple-50/70 to-pink-50/50" />

        {/* 상단 라인 드로우 */}
        <span className="absolute top-0 left-0 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />

        {/* 대형 인용 부호 */}
        <div className="absolute top-4 right-5 text-5xl leading-none text-purple-100 group-hover:text-purple-200 transition-colors duration-300 select-none font-serif">
          &ldquo;
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* 별점 — 스프링 스태거 */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -30 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08 + i * 0.06,
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <FiStar
                  className={`${
                    i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                  }`}
                  size={15}
                />
              </motion.div>
            ))}
          </div>

          {/* 내용 */}
          <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* 작성자 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {/* 아바타 */}
            <div
              className="w-10 h-10 gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {testimonial.role}
                {testimonial.company && (
                  <span className="text-purple-500 font-medium"> · {testimonial.company}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
