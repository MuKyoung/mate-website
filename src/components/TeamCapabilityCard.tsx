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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6 }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 sm:p-8 bg-white rounded-2xl border border-[#e1e1e1] hover:border-[#c6c6c6] transition-all duration-400 overflow-hidden">
        {/* Icon */}
        <motion.div whileHover={{ scale: 1.08 }}
          className="text-4xl sm:text-5xl mb-5 inline-block">
          {capability.icon}
        </motion.div>

        <h3 className="text-lg sm:text-xl font-bold text-[#262626] mb-2">{capability.title}</h3>
        <p className="text-[#4c4c4c] text-sm leading-relaxed mb-5">{capability.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-xl bg-[#f7f7f7] border border-[#e1e1e1]">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-[#2a72e5]">{capability.experience}</div>
            <div className="text-xs text-[#5d5d5d] mt-0.5">경력</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-[#2a72e5]">{capability.projects}개</div>
            <div className="text-xs text-[#5d5d5d] mt-0.5">완료 프로젝트</div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-xs font-semibold text-[#4c4c4c] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <FiCheck className="text-[#2a72e5]" size={12} />
            주요 기술
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {capability.skills.map((skill, idx) => (
              <motion.span key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="px-2.5 py-1 bg-[#c6e6ff] text-[#0043b3] text-xs rounded-full font-medium">
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
