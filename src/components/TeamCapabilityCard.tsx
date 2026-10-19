'use client';

import { motion } from 'framer-motion';
import { fadeUp, inView } from '@/lib/motion';

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

/* 역량 패널 - 번호, 이름, 설명, 기술 칩, 아래 두 줄의 숫자.
   교육의 숫자는 납품 건수가 아니라 강의 횟수라 이름표를 따로 붙인다. */
export default function TeamCapabilityCard({ capability, index }: TeamCapabilityCardProps) {
  const isLecture = capability.id === 'education';
  return (
    <motion.div {...inView} variants={fadeUp}
      className="sweep flex h-full flex-col border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-8">
      <span className="font-mono text-[12px] text-white/45 tabular-nums">0{index + 1}</span>

      <h3 className="mb-3 mt-10 text-[24px] font-medium leading-[1.2] tracking-[-0.035em] text-[var(--text-1)] sm:text-[28px]">
        {capability.title}
      </h3>
      <p className="mb-7 text-[15px] leading-[1.75] text-white/60">
        {capability.description}
      </p>

      <div className="mb-10 flex flex-wrap gap-1.5">
        {capability.skills.map((s) => <span key={s} className="tag">{s}</span>)}
      </div>

      <dl className="mt-auto">
        <div className="flex items-baseline justify-between gap-3 border-t border-white/10 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.02em] text-white/55">경력</dt>
          <dd className="font-en font-mono-stat text-[26px] leading-none tracking-[-0.04em] text-[var(--text-1)]">{capability.experience}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-y border-white/10 py-4">
          <dt className="font-mono text-[11px] uppercase tracking-[0.02em] text-white/55">{isLecture ? '진행 강의' : '납품 프로젝트'}</dt>
          <dd className="font-en font-mono-stat text-[26px] leading-none tracking-[-0.04em] text-[var(--text-1)]">
            {capability.projects}+
          </dd>
        </div>
      </dl>
    </motion.div>
  );
}
