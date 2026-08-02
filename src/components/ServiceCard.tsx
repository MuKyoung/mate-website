'use client';

import { motion } from 'framer-motion';
import { Service } from '@/types';
import { FiCheck, FiArrowRight, FiBox, FiGlobe, FiBookOpen } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { easeEnter } from '@/lib/motion';

interface ServiceCardProps {
  service: Service;
  index: number;
}

// 데이터의 이모지 대신 일관된 아이콘 사용
const iconById: Record<string, IconType> = {
  '1': FiBox,
  '2': FiGlobe,
  '3': FiBookOpen,
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = iconById[service.id] ?? FiBox;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className="group h-full"
    >
      <div className="h-full p-8 rounded-2xl border border-[#e6e4f2] bg-white hover:border-[#4f46ff] hover:shadow-[0_8px_28px_-8px_rgba(79,70,255,0.25)] transition-all duration-200">
        {/* 아이콘 + 인덱스 */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#ecebff] text-[#4f46ff] group-hover:bg-[#4f46ff] group-hover:text-white transition-colors">
            <Icon size={22} />
          </div>
          <span className="text-[12px] text-[#b3b3c2] font-mono-stat">0{index + 1}</span>
        </div>

        <h3 className="text-[18px] font-bold text-[#0f0f19] mb-2.5">
          {service.title}
        </h3>
        <p className="text-sm text-[#5b5b6b] mb-7 leading-[1.7]">
          {service.description}
        </p>

        <ul className="space-y-2.5 mb-8">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[#5b5b6b]">
              <FiCheck className="flex-shrink-0 mt-0.5 text-[#4f46ff]" size={15} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#4f46ff]">
          자세히 보기
          <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
