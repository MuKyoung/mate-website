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
import { revealUp, staggerTight, inView } from '@/lib/motion';

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

// 화이트/라벤더 배경 위 — 번호가 채워진 원형 노드 + 헤어라인 커넥터.
export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <motion.div {...inView} variants={staggerTight} className="relative max-w-2xl">
      {/* 세로 커넥터 라인 */}
      <div className="absolute left-6 top-6 bottom-6 w-px bg-[#e6e4f2]" />

      <div className="space-y-0">
        {sortedSteps.map((step, index) => {
          const Icon = iconById[step.id] ?? FiMessageCircle;
          const isLast = index === sortedSteps.length - 1;
          return (
            <motion.div
              key={step.id}
              variants={revealUp}
              className={`relative flex gap-5 ${isLast ? '' : 'pb-10'}`}
            >
              {/* 번호 노드 */}
              <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[#4f46ff] flex items-center justify-center text-white font-bold">
                <Icon size={19} />
              </div>

              <div className="min-w-0 pt-2">
                <div className="flex items-baseline gap-2.5 mb-1.5">
                  <span className="text-[12px] text-[#4f46ff] font-bold font-mono-stat">
                    {String(step.order).padStart(2, '0')}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#0f0f19]">{step.title}</h3>
                </div>
                <p className="text-sm text-[#5b5b6b] leading-[1.7] max-w-md">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
