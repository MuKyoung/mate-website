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

// 다크 밴드 위에 렌더 — on-dark 텍스트, white/10 헤어라인, 블루 아이콘 노드.
export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <motion.div {...inView} variants={staggerTight} className="relative max-w-2xl">
      {/* 세로 헤어라인 커넥터 */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-white/10" />

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
              {/* 아이콘 노드 */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/15 flex items-center justify-center text-[#5b9bff]">
                <Icon size={17} />
              </div>

              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold on-dark-3 uppercase tracking-[0.14em] font-mono-stat">
                    Step {String(step.order).padStart(2, '0')}
                  </span>
                  <h3 className="text-[15px] font-semibold on-dark">{step.title}</h3>
                </div>
                <p className="text-sm on-dark-2 leading-relaxed max-w-md">
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
