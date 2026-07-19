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
          ? 'group h-full p-7 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 transition-colors'
          : 'group h-full p-7 sm:p-8 rounded-2xl border border-[#e4e4e4] bg-white hover:border-[#0a0a0a] transition-colors'
      }
    >
      {/* 아이콘 */}
      <span className={
        dark
          ? 'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 text-[#5b9bff] mb-6'
          : 'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#c6e6ff] text-[#0957c8] mb-6'
      }>
        <Icon size={21} />
      </span>

      <h3 className={dark ? 'text-lg font-bold on-dark mb-2 group-hover:text-[#5b9bff] transition-colors' : 'text-lg font-bold text-[#0a0a0a] mb-2 group-hover:text-[#2a72e5] transition-colors'}>
        {capability.title}
      </h3>
      <p className={dark ? 'on-dark-2 text-sm leading-relaxed mb-6' : 'text-[#52525b] text-sm leading-relaxed mb-6'}>
        {capability.description}
      </p>

      {/* 통계 */}
      <div className={
        dark
          ? 'grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 mb-6'
          : 'grid grid-cols-2 divide-x divide-[#e4e4e4] border-y border-[#e4e4e4] mb-6'
      }>
        <div className="py-4 pr-4">
          <div className={dark ? 'text-xl font-extrabold on-dark font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#0a0a0a] font-mono-stat tracking-tight'}>{capability.experience}</div>
          <div className={dark ? 'text-xs on-dark-3 mt-1' : 'text-xs text-[#a1a1aa] mt-1'}>경력</div>
        </div>
        <div className="py-4 pl-4">
          <div className={dark ? 'text-xl font-extrabold on-dark font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#0a0a0a] font-mono-stat tracking-tight'}>{capability.projects}개</div>
          <div className={dark ? 'text-xs on-dark-3 mt-1' : 'text-xs text-[#a1a1aa] mt-1'}>완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className={
          dark
            ? 'text-[11px] font-semibold on-dark-3 uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5'
            : 'text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-[0.14em] mb-3 flex items-center gap-1.5'
        }>
          <FiCheck className={dark ? 'text-[#5b9bff]' : 'text-[#2a72e5]'} size={12} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {capability.skills.map((skill) => (
            dark
              ? <span key={skill} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white/80 bg-white/[0.06] border border-white/10">{skill}</span>
              : <span key={skill} className="tag tag-blue">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
