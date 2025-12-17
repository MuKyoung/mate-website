'use client';

import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

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

export default function TeamCapabilityCard({ capability, index }: TeamCapabilityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -10 }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="text-5xl sm:text-6xl mb-5 inline-block"
          >
            {capability.icon}
          </motion.div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {capability.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
            {capability.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-gray-50">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold gradient-text">
                {capability.experience}
              </div>
              <div className="text-xs text-gray-500 mt-1">경력</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold gradient-text">
                {capability.projects}개
              </div>
              <div className="text-xs text-gray-500 mt-1">완료 프로젝트</div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiCheck className="text-purple-500" />
              주요 기술
            </h4>
            <div className="flex flex-wrap gap-2">
              {capability.skills.map((skill, idx) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm rounded-lg font-medium border border-purple-200/50"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
