'use client';

import { motion } from 'framer-motion';
import { ProcessStep } from '@/types';
import { fadeUp, stagger, inView } from '@/lib/motion';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

// 헤어라인 스텝 그리드 — 아이콘 없이 번호 + 타이틀 + 설명 (rule-top 패턴).
export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <motion.div {...inView} variants={stagger}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-16">
      {sortedSteps.map((step) => (
        <motion.div key={step.id} variants={fadeUp} className="rule-top">
          <span className="index-num-lg mb-8">
            {String(step.order).padStart(2, '0')}
          </span>
          <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] mb-4">
            {step.title}
          </h3>
          <p className="text-[15px] text-[#4e5968] leading-[1.75]">
            {step.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
