'use client';

import { motion } from 'framer-motion';
import { Service } from '@/types';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative h-full"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative h-full p-6 sm:p-8 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] overflow-hidden corner-cut-tr"
      >
        {/* 호버 그라디언트 오버레이 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-600/[0.08] to-pink-600/[0.06]" />

        {/* 상단 라인 드로우 */}
        <span className="absolute top-0 left-0 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />
        {/* 하단 라인 드로우 (반대 방향) */}
        <span className="absolute bottom-0 right-0 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-l from-purple-500 to-pink-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] delay-75" />

        {/* 콘텐츠 */}
        <div className="relative z-10 flex flex-col h-full">
          {/* 아이콘 */}
          <motion.div
            animate={hovered ? { scale: 1.15, rotate: 8 } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
            className="text-4xl sm:text-5xl mb-5 sm:mb-6 w-fit"
          >
            {service.icon}
          </motion.div>

          {/* 타이틀 */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:gradient-text transition-all duration-300">
            {service.title}
          </h3>

          {/* 설명 */}
          <p className="text-sm text-white/50 mb-6 leading-relaxed flex-grow">
            {service.description}
          </p>

          {/* 기능 목록 */}
          <ul className="space-y-2.5 mb-6">
            {service.features.map((feature, idx) => (
              <motion.li
                key={idx}
                className="flex items-start text-sm text-white/60"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 + idx * 0.06, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="flex-shrink-0 w-4 h-4 card-edge-sm bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 mt-0.5">
                  <FiCheck className="text-white" size={10} />
                </span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* 링크 */}
          <motion.div
            className="flex items-center gap-1.5 text-xs font-medium text-purple-400 group-hover:text-pink-400 transition-colors cursor-pointer"
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span>자세히 보기</span>
            <FiArrowRight size={12} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
