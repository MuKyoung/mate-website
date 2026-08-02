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
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: index * 0.12, duration: 1.05, ease: easeEnter }}
      className={
        onBlue
          ? 'group h-full p-10 rounded-[28px] border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
          : 'group h-full p-10 sm:p-12 rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
      }
    >
      {/* 아이콘 + 인덱스 */}
      <div className="flex items-start justify-between mb-12">
        <div className={
          onBlue
            ? 'w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10 text-white group-hover:bg-white group-hover:text-[#191f28] transition-colors duration-500'
            : 'w-16 h-16 rounded-2xl flex items-center justify-center bg-[#e8f3ff] text-[#3182f6] group-hover:bg-[#3182f6] group-hover:text-white transition-colors duration-500'
        }>
          <Icon size={30} />
        </div>
        {onBlue ? (
          <span className="font-mono-stat font-extrabold leading-none tracking-[-0.03em] text-white/20"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
            0{index + 1}
          </span>
        ) : (
          <span className="index-num-lg">0{index + 1}</span>
        )}
      </div>

      <h3 className={
        onBlue
          ? 'text-[26px] sm:text-[30px] font-extrabold text-white tracking-[-0.025em] leading-[1.2] mb-4'
          : 'text-[26px] sm:text-[30px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] mb-4'
      }>
        {capability.title}
      </h3>
      <p className={
        onBlue
          ? 'text-[16px] text-white/65 leading-[1.75] mb-9'
          : 'text-[16px] text-[#4e5968] leading-[1.75] mb-9'
      }>
        {capability.description}
      </p>

      {/* 통계 */}
      <div className={
        onBlue
          ? 'grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 mb-9'
          : 'grid grid-cols-2 divide-x divide-[#e5e8eb] border-y border-[#e5e8eb] mb-9'
      }>
        <div className="py-7 pr-5">
          <div className={
            onBlue
              ? 'text-3xl sm:text-4xl font-extrabold text-white font-mono-stat tracking-[-0.03em]'
              : 'text-3xl sm:text-4xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]'
          }>{capability.experience}</div>
          <div className={onBlue ? 'text-[14px] text-white/60 mt-2' : 'text-[14px] text-[#6b7684] mt-2'}>경력</div>
        </div>
        <div className="py-7 pl-5">
          <div className={
            onBlue
              ? 'text-3xl sm:text-4xl font-extrabold text-white font-mono-stat tracking-[-0.03em]'
              : 'text-3xl sm:text-4xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]'
          }>{capability.projects}개</div>
          <div className={onBlue ? 'text-[14px] text-white/60 mt-2' : 'text-[14px] text-[#6b7684] mt-2'}>완료 프로젝트</div>
        </div>
      </div>

      {/* 기술 */}
      <div>
        <h4 className={
          onBlue
            ? 'text-[14px] font-semibold text-white/60 mb-4 flex items-center gap-2'
            : 'text-[14px] font-semibold text-[#6b7684] mb-4 flex items-center gap-2'
        }>
          <FiCheck className={onBlue ? 'text-white/60' : 'text-[#6b7684]'} size={15} />
          주요 기술
        </h4>
        <div className="flex flex-wrap gap-2">
          {capability.skills.map((skill) => (
            onBlue
              ? <span key={skill} className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white/80 bg-white/10">{skill}</span>
              : <span key={skill} className="tag-blue">{skill}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
