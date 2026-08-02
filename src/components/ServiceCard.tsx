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
      <div className="h-full p-8 rounded-[20px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_12px_32px_rgba(25,31,40,0.10)] hover:-translate-y-0.5 transition-all duration-200">
        {/* 아이콘 + 인덱스 */}
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6] group-hover:bg-[#3182f6] group-hover:text-white transition-colors">
            <Icon size={22} />
          </div>
          <span className="text-[12px] text-[#adb5bd] font-mono-stat">0{index + 1}</span>
        </div>

        <h3 className="text-[18px] font-bold text-[#191f28] mb-2.5">
          {service.title}
        </h3>
        <p className="text-sm text-[#4e5968] mb-7 leading-[1.7]">
          {service.description}
        </p>

        <ul className="space-y-2.5 mb-8">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[#4e5968]">
              <FiCheck className="flex-shrink-0 mt-0.5 text-[#3182f6]" size={15} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#3182f6]">
          자세히 보기
          <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
