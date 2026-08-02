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
  /** 딥 잉크 패널 위에 얹힐 때(예: 전문 역량 인셋 패널) — 화이트 틴트로 표시 */
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
          ? 'group h-full p-7 sm:p-8 rounded-[20px] border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-colors'
          : 'group h-full p-7 sm:p-8 rounded-[20px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_12px_32px_rgba(25,31,40,0.10)] hover:-translate-y-0.5 transition-all duration-200'
      }
    >
      {/* 아이콘 + 인덱스 */}
      <div className="flex items-start justify-between mb-7">
        <div className={
          onBlue
            ? 'w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 text-white'
            : 'w-12 h-12 rounded-xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6] group-hover:bg-[#3182f6] group-hover:text-white transition-colors'
        }>
          <Icon size={22} />
        </div>
        <span className={onBlue ? 'text-[12px] text-white/50 font-mono-stat' : 'text-[12px] text-[#adb5bd] font-mono-stat'}>
          0{index + 1}
        </span>
      </div>

      <h3 className={onBlue ? 'text-[17px] font-bold text-white mb-2.5' : 'text-[17px] font-bold text-[#191f28] mb-2.5'}>
        {capability.title}
      </h3>
      <p className={onBlue ? 'text-sm text-white/65 leading-[1.7] mb-6' : 'text-sm text-[#4e5968] leading-[1.7] mb-6'}>
        {capability.description}
      </p>

      {/* 통계 */}
      <div className={
        onBlue
          ? 'grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 mb-6'
          : 'grid grid-cols-2 divide-x divide-[#e5e8eb] border-y border-[#e5e8eb] mb-6'
      }>
        <div className="py-4 pr-4">
          <div className={onBlue ? 'text-xl font-extrabold text-white font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#191f28] font-mono-stat tracking-tight'}>{capability.experience}</div>
          <div className={onBlue ? 'text-[12px] text-white/60 mt-1' : 'text-[12px] text-[#6b7684] mt-1'}>경력</div>
        </div>
        <div className="py-4 pl-4">
          <div className={onBlue ? 'text-xl font-extrabold text-white font-mono-stat tracking-tight' : 'text-xl font-extrabold text-[#191f28] font-mono-stat tracking-tight'}>{capability.projects}개</div>
          <div className={onBlue ? 'text-[12px] text-white/60 mt-1' : 'text-[12px] text-[#6b7684] mt-1'}>완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className={
          onBlue
            ? 'text-[12px] text-white/60 mb-3 flex items-center gap-1.5'
            : 'text-[12px] text-[#6b7684] mb-3 flex items-center gap-1.5'
        }>
          <FiCheck className={onBlue ? 'text-white/60' : 'text-[#6b7684]'} size={12} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {capability.skills.map((skill) => (
            onBlue
              ? <span key={skill} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white/80 bg-white/10">{skill}</span>
              : <span key={skill} className="tag-blue">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
