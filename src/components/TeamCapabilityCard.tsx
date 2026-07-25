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
  dark?: boolean;
}

/* 이모지 → react-icons 매핑 (UI 이모지 금지) */
const iconMap: Record<string, IconType> = {
  unity: FiCode,
  outsourcing: FiGlobe,
  education: FiBookOpen,
};

export default function TeamCapabilityCard({ capability, index, dark = false }: TeamCapabilityCardProps) {
  const Icon = iconMap[capability.id] ?? FiBox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className={
        dark
          ? 'group h-full p-7 sm:p-8 rounded-sm border border-white/10 bg-white/[0.03] hover:border-white/25 transition-colors'
          : 'group h-full p-7 sm:p-8 rounded-sm border border-[#e4e4e4] bg-white hover:border-[#0a0a0a] transition-colors'
      }
    >
      {/* 아이콘 + 인덱스 */}
      <div className="flex items-start justify-between mb-7">
        <Icon size={22} className={dark ? 'text-white' : 'text-[#0a0a0a]'} />
        <span className={dark ? 'text-[12px] text-white/35 font-mono-stat' : 'text-[12px] text-[#a1a1aa] font-mono-stat'}>
          0{index + 1}
        </span>
      </div>

      <h3 className={dark ? 'text-[17px] font-semibold text-white mb-2.5' : 'text-[17px] font-semibold text-[#0a0a0a] mb-2.5'}>
        {capability.title}
      </h3>
      <p className={dark ? 'text-sm text-white/55 leading-[1.7] mb-6' : 'text-sm text-[#52525b] leading-[1.7] mb-6'}>
        {capability.description}
      </p>

      {/* 통계 */}
      <div className={
        dark
          ? 'grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 mb-6'
          : 'grid grid-cols-2 divide-x divide-[#e4e4e4] border-y border-[#e4e4e4] mb-6'
      }>
        <div className="py-4 pr-4">
          <div className={dark ? 'text-xl font-semibold text-white font-mono-stat tracking-tight' : 'text-xl font-semibold text-[#0a0a0a] font-mono-stat tracking-tight'}>{capability.experience}</div>
          <div className={dark ? 'text-[12px] text-white/35 mt-1' : 'text-[12px] text-[#a1a1aa] mt-1'}>경력</div>
        </div>
        <div className="py-4 pl-4">
          <div className={dark ? 'text-xl font-semibold text-white font-mono-stat tracking-tight' : 'text-xl font-semibold text-[#0a0a0a] font-mono-stat tracking-tight'}>{capability.projects}개</div>
          <div className={dark ? 'text-[12px] text-white/35 mt-1' : 'text-[12px] text-[#a1a1aa] mt-1'}>완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className={
          dark
            ? 'text-[12px] text-white/35 mb-3 flex items-center gap-1.5'
            : 'text-[12px] text-[#a1a1aa] mb-3 flex items-center gap-1.5'
        }>
          <FiCheck className={dark ? 'text-white/35' : 'text-[#a1a1aa]'} size={12} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {capability.skills.map((skill) => (
            dark
              ? <span key={skill} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white/80 bg-white/[0.06] border border-white/10">{skill}</span>
              : <span key={skill} className="tag">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
