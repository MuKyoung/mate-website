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
  /** 볼드 블루 패널 위에 얹힐 때(예: 전문 역량 인셋 패널) — 어두운 근접색 대신 화이트 틴트로 표시 */
  onBlue?: boolean;
}

/* 이모지 → react-icons 매핑 (UI 이모지 금지) */
const iconMap: Record<string, IconType> = {
  unity: FiCode,
  outsourcing: FiGlobe,
  education: FiBookOpen,
};

export default function TeamCapabilityCard({ capability, index, onBlue = false }: TeamCapabilityCardProps) {
  const Icon = iconMap[capability.id] ?? FiBox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className={
        onBlue
          ? 'group h-full p-7 sm:p-8 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] transition-colors'
          : 'group h-full p-7 sm:p-8 rounded-2xl border border-[#e6e4f2] bg-white hover:border-[#4f46ff] hover:shadow-[0_8px_28px_-8px_rgba(79,70,255,0.25)] transition-all duration-200'
      }
    >
      {/* 아이콘 + 인덱스 */}
      <div className="flex items-start justify-between mb-7">
        <div className={
          onBlue
            ? 'w-12 h-12 rounded-xl flex items-center justify-center bg-white/15 text-white'
            : 'w-12 h-12 rounded-xl flex items-center justify-center bg-[#ecebff] text-[#4f46ff] group-hover:bg-[#4f46ff] group-hover:text-white transition-colors'
        }>
          <Icon size={22} />
        </div>
        <span className={onBlue ? 'text-[12px] text-white/50 font-mono-stat' : 'text-[12px] text-[#b3b3c2] font-mono-stat'}>
          0{index + 1}
        </span>
      </div>

      <h3 className={onBlue ? 'text-[17px] font-bold text-white mb-2.5' : 'text-[17px] font-bold text-[#0f0f19] mb-2.5'}>
        {capability.title}
      </h3>
      <p className={onBlue ? 'text-sm text-white/75 leading-[1.7] mb-6' : 'text-sm text-[#5b5b6b] leading-[1.7] mb-6'}>
        {capability.description}
      </p>

      {/* 통계 */}
      <div className={
        onBlue
          ? 'grid grid-cols-2 divide-x divide-white/15 border-y border-white/15 mb-6'
          : 'grid grid-cols-2 divide-x divide-[#e6e4f2] border-y border-[#e6e4f2] mb-6'
      }>
        <div className="py-4 pr-4">
          <div className={onBlue ? 'text-xl font-extrabold text-white font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#0f0f19] font-mono-stat tracking-tight'}>{capability.experience}</div>
          <div className={onBlue ? 'text-[12px] text-white/60 mt-1' : 'text-[12px] text-[#858594] mt-1'}>경력</div>
        </div>
        <div className="py-4 pl-4">
          <div className={onBlue ? 'text-xl font-extrabold text-white font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#0f0f19] font-mono-stat tracking-tight'}>{capability.projects}개</div>
          <div className={onBlue ? 'text-[12px] text-white/60 mt-1' : 'text-[12px] text-[#858594] mt-1'}>완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className={
          onBlue
            ? 'text-[12px] text-white/60 mb-3 flex items-center gap-1.5'
            : 'text-[12px] text-[#858594] mb-3 flex items-center gap-1.5'
        }>
          <FiCheck className={onBlue ? 'text-white/60' : 'text-[#858594]'} size={12} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {capability.skills.map((skill) => (
            onBlue
              ? <span key={skill} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white bg-white/10 border border-white/20">{skill}</span>
              : <span key={skill} className="tag-blue">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
