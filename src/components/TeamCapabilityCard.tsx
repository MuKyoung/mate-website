'use client';

import { motion } from 'framer-motion';

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow"
    >
      <div className="text-5xl mb-4">{capability.icon}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{capability.title}</h3>
      <p className="text-gray-600 mb-6">{capability.description}</p>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">경력</span>
          <span className="font-semibold text-purple-600">{capability.experience}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">완료 프로젝트</span>
          <span className="font-semibold text-purple-600">{capability.projects}개</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">주요 기술</h4>
        <div className="flex flex-wrap gap-2">
          {capability.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

