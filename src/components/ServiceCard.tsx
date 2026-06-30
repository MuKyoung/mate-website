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

// 데이터의 이모지 대신 일관된 아이콘 사용 (goorm: no emoji)
const iconById: Record<string, IconType> = {
  '1': FiBox,
  '2': FiGlobe,
  '3': FiBookOpen,
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = iconById[service.id] ?? FiBox;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: easeEnter }}
      className="group h-full"
    >
      <div className="h-full p-7 rounded-xl border border-[#e1e1e1] bg-white hover:bg-[#f7f7f7] hover:border-[#c6c6c6] transition-colors">
        {/* 아이콘 */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 bg-[#c6e6ff] text-[#0957c8]">
          <Icon size={19} />
        </div>

        <h3 className="text-[17px] font-bold text-[#262626] mb-2 group-hover:text-[#2a72e5] transition-colors">
          {service.title}
        </h3>
        <p className="text-sm text-[#5d5d5d] mb-6 leading-relaxed">
          {service.description}
        </p>

        <ul className="space-y-2.5 mb-7">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-[#4c4c4c]">
              <FiCheck className="flex-shrink-0 mt-0.5 text-[#058765]" size={15} />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#5d5d5d] group-hover:text-[#2a72e5] transition-colors">
          자세히 보기
          <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
