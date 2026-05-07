'use client';

import { motion } from 'framer-motion';
import { Service } from '@/types';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div
        className="relative h-full p-6 sm:p-7 rounded-xl border transition-all duration-300"
        style={{
          background: 'var(--background)',
          borderColor: 'var(--border)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)';
          (e.currentTarget as HTMLDivElement).style.background = '#0d0d10';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--background)';
        }}
      >
        {/* 아이콘 컨테이너 */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 text-2xl"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.14)' }}
        >
          <span className="text-xl leading-none">{service.icon}</span>
        </div>

        {/* 타이틀 */}
        <h3 className="text-base font-semibold text-white mb-2.5 group-hover:text-[#93c5fd] transition-colors duration-200">
          {service.title}
        </h3>

        {/* 설명 */}
        <p className="text-sm text-white/40 mb-5 leading-relaxed">
          {service.description}
        </p>

        {/* 기능 목록 */}
        <ul className="space-y-2 mb-6">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-white/50">
              <span className="flex-shrink-0 mt-0.5 w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.12)' }}>
                <FiCheck className="text-[#60a5fa]" size={9} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {/* 링크 */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-white/30 group-hover:text-[#60a5fa] transition-colors duration-200">
          <span>자세히 보기</span>
          <FiArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
