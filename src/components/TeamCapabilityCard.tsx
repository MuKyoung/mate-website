'use client';

import { motion } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, inView } from '@/lib/motion';

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

/* 플레인 칼럼 — 박스/칩 없이 인덱스 · 타이포 · 헤어라인만으로 구성 */
export default function TeamCapabilityCard({ capability, index }: TeamCapabilityCardProps) {
  return (
    <motion.div {...inView}
      variants={[fadeUp, fadeLeft, fadeRight][index % 3]}
    >
      <span className="index-num-lg font-en">0{index + 1}</span>

      <h3 className="text-[24px] sm:text-[28px] font-extrabold text-[#f5f6f7] tracking-[-0.025em] leading-[1.2] mt-6 mb-4">
        {capability.title}
      </h3>
      <p className="text-[15px] text-white/55 leading-[1.75] mb-7">
        {capability.description}
      </p>

      {/* 주요 기술 — 플레인 텍스트 */}
      <p className="text-[13px] text-white/30 leading-[1.8] mb-10">
        {capability.skills.join(' · ')}
      </p>

      {/* 지표 — 헤어라인 행 */}
      <div>
        <div className="flex items-baseline gap-3 py-5 border-t border-white/10">
          <span className="font-en text-3xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.03em]">
            {capability.experience}
          </span>
          <span className="text-[13px] text-white/45">경력</span>
        </div>
        <div className="flex items-baseline gap-3 py-5 border-t border-b border-white/10">
          <span className="font-en text-3xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.03em]">
            {capability.projects}개
          </span>
          <span className="text-[13px] text-white/45">완료 프로젝트</span>
        </div>
      </div>
    </motion.div>
  );
}
