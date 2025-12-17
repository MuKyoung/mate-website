'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/types';
import { FiStar } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

export default function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -10 }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Gradient Border on Hover */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))',
          }}
        />

        {/* Quote Icon */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <FaQuoteLeft className="text-purple-100 group-hover:text-purple-200 transition-colors" size={32} />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Rating */}
          <div className="flex gap-1 mb-4 sm:mb-5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
              >
                <FiStar
                  className={`${
                    i < testimonial.rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-200'
                  }`}
                  size={18}
                />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <p className="text-sm sm:text-base text-gray-600 mb-6 flex-grow leading-relaxed">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">
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
