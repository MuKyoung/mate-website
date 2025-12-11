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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8 h-full flex flex-col"
    >
      {/* Rating */}
      <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`${
              i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            size={18}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 flex-grow leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {/* Author */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4">
        <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
        <p className="text-xs sm:text-sm text-gray-600">
          {testimonial.role}
          {testimonial.company && ` · ${testimonial.company}`}
        </p>
      </div>
    </motion.div>
  );
}

