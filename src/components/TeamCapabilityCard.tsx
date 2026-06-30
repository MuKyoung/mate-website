'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiCode, FiGlobe, FiBookOpen, FiBox } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { easeEnter } from '@/lib/motion';

interface Capability {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: string[];
  experience: string;
  projects: number;
}

interface TeamCapabilityCardProps {
  capability: Capability;
  index: number;
}

/* 이모지 → react-icons 매핑 (UI 이모지 금지) */
const iconMap: Record<string, IconType> = {
  unity: FiCode,
  outsourcing: FiGlobe,
  education: FiBookOpen,
};

export default function TeamCapabilityCard({ capability, index }: TeamCapabilityCardProps) {
  const Icon = iconMap[capability.id] ?? FiBox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.32, ease: easeEnter }}
      className="h-full p-6 sm:p-7 rounded-xl border border-[#e1e1e1] bg-white hover:border-[#c6c6c6] transition-colors"
    >
      {/* 아이콘 */}
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#f7f7f7] border border-[#e1e1e1] text-[#2a72e5] mb-5">
        <Icon size={20} />
      </span>

      <h3 className="text-lg font-bold text-[#262626] mb-2">{capability.title}</h3>
      <p className="text-[#5d5d5d] text-sm leading-relaxed mb-5">{capability.description}</p>

      {/* 통계 */}
      <div className="grid grid-cols-2 divide-x divide-[#e1e1e1] border-y border-[#e1e1e1] mb-5">
        <div className="py-4 pr-4">
          <div className="text-lg font-bold text-[#262626] font-mono-stat">{capability.experience}</div>
          <div className="text-xs text-[#5d5d5d] mt-0.5">경력</div>
        </div>
        <div className="py-4 pl-4">
          <div className="text-lg font-bold text-[#262626] font-mono-stat">{capability.projects}개</div>
          <div className="text-xs text-[#5d5d5d] mt-0.5">완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className="text-[11px] font-semibold text-[#5d5d5d] uppercase tracking-[0.12em] mb-2.5 flex items-center gap-1.5">
          <FiCheck className="text-[#2a72e5]" size={12} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {capability.skills.map((skill) => (
            <span key={skill} className="tag tag-blue">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
