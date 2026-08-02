'use client';

import { motion } from 'framer-motion';
import { ProcessStep } from '@/types';
import type { IconType } from 'react-icons';
import {
  FiMessageCircle,
  FiClipboard,
  FiCode,
  FiCheckCircle,
  FiSend,
} from 'react-icons/fi';
import { fadeUp, stagger, inView } from '@/lib/motion';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

// 데이터의 이모지(💬📋💻🧪🚀) 대신 일관된 아이콘 사용 (no emoji)
const iconById: Record<string, IconType> = {
  '1': FiMessageCircle, // 상담
  '2': FiClipboard, // 기획
  '3': FiCode, // 개발
  '4': FiCheckCircle, // 테스트
  '5': FiSend, // 배포
};

// devigns 스텝 패턴 — 상단 헤어라인 + 대형 인덱스. 라이트 밴드(화이트/쿨 그레이) 위 사용.
export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <motion.div {...inView} variants={stagger}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
      {sortedSteps.map((step) => {
        const Icon = iconById[step.id] ?? FiMessageCircle;
        return (
          <motion.div key={step.id} variants={fadeUp} className="rule-top">
            <span className="index-num-lg mb-6">
              {String(step.order).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className="text-[#3182f6] flex-shrink-0" />
              <h3 className="text-[20px] font-bold text-[#191f28] tracking-[-0.02em]">
                {step.title}
              </h3>
            </div>
            <p className="text-[15px] text-[#4e5968] leading-[1.75]">
              {step.description}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
