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
    <div className="relative max-w-3xl mx-auto">
      {/* Timeline Line */}
      <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600" />

      <div className="space-y-8 md:space-y-12">
        {sortedSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-6 md:gap-8 pl-4 md:pl-0"
          >
            {/* Timeline Dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-lg">
                {step.icon}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                <FiCheck className="text-white text-xs" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow pt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  STEP {step.order}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

