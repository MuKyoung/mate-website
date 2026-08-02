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
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: index * 0.12, duration: 1.05, ease: easeEnter }}
      className="group h-full"
    >
      <div className="h-full p-10 sm:p-12 rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* 아이콘 + 인덱스 */}
        <div className="flex items-start justify-between mb-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6] group-hover:bg-[#3182f6] group-hover:text-white transition-colors duration-500">
            <Icon size={30} />
          </div>
          <span className="index-num-lg">0{index + 1}</span>
        </div>

        <h3 className="text-[26px] sm:text-[30px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] mb-4">
          {service.title}
        </h3>
        <p className="text-[16px] text-[#4e5968] mb-9 leading-[1.75]">
          {service.description}
        </p>

        <ul className="space-y-3.5 mb-10">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-[15px] text-[#4e5968]">
              <FiCheck className="flex-shrink-0 mt-1 text-[#3182f6]" size={17} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 text-[15px] font-bold text-[#3182f6]">
          자세히 보기
          <FiArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );
}
