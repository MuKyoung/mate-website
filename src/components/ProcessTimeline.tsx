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
import { easeEnter } from '@/lib/motion';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

// 데이터의 이모지(💬📋💻🧪🚀) 대신 일관된 아이콘 사용 (goorm: no emoji)
const iconById: Record<string, IconType> = {
  '1': FiMessageCircle, // 상담
  '2': FiClipboard, // 기획
  '3': FiCode, // 개발
  '4': FiCheckCircle, // 테스트
  '5': FiSend, // 배포
};

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="relative max-w-2xl">
      {/* 세로 헤어라인 커넥터 */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-[#e1e1e1]" />

      <div className="space-y-0">
        {sortedSteps.map((step, index) => {
          const Icon = iconById[step.id] ?? FiMessageCircle;
          const isLast = index === sortedSteps.length - 1;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.06, duration: 0.32, ease: easeEnter }}
              className={`relative flex gap-5 ${isLast ? '' : 'pb-8'}`}
            >
              {/* 아이콘 노드 */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border border-[#e1e1e1] flex items-center justify-center text-[#2a72e5]">
                <Icon size={17} />
              </div>

              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-[#a3a3a3] uppercase tracking-[0.14em] font-mono-stat">
                    Step {String(step.order).padStart(2, '0')}
                  </span>
                  <h3 className="text-[15px] font-semibold text-[#262626]">{step.title}</h3>
                </div>
                <p className="text-sm text-[#5d5d5d] leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
