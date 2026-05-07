'use client';

import { motion } from 'framer-motion';
import { ProcessStep } from '@/types';
import { FiCheck } from 'react-icons/fi';

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="relative max-w-3xl mx-auto px-2 sm:px-0">
      {/* Vertical line */}
      <div className="absolute left-[2.25rem] sm:left-8 md:left-12 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {sortedSteps.map((step, index) => (
          <motion.div key={step.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex items-start gap-4 sm:gap-6 md:gap-8 pl-2 sm:pl-4 md:pl-0"
          >
            <div className="relative z-10 flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#3b82f6] rounded-xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-md shadow-blue-500/15">
                {step.icon}
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <FiCheck className="text-white" size={9} />
              </div>
            </div>

            <div className="flex-grow pt-1 sm:pt-2 min-w-0">
              <span className="inline-block text-[11px] font-semibold text-[#3b82f6] bg-blue-50 px-2.5 py-0.5 rounded mb-2.5 tracking-wide">
                STEP {step.order}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
