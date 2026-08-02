'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Service } from '@/types';
import { FiArrowUpRight } from 'react-icons/fi';
import { easeEnter } from '@/lib/motion';

interface ServiceCardProps {
  service: Service;
  index: number;
}

/**
 * 서비스 리스트 로우 — 카드 박스 대신 헤어라인으로 구분되는 풀폭 행.
 * 부모 컨테이너가 리스트를 감싸고, 각 행은 상단 헤어라인을 가진다(마지막 행은 하단도).
 */
export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: index * 0.1, duration: 0.95, ease: easeEnter }}
    >
      <Link href="/services"
        className="group grid grid-cols-[auto_1fr_auto] lg:grid-cols-[5rem_1fr_1fr_auto] items-center gap-x-6 lg:gap-x-10 py-9 sm:py-12 border-t border-[#e5e8eb] last:border-b transition-colors duration-300 hover:bg-[#fafbfc] -mx-4 sm:-mx-6 px-4 sm:px-6">
        {/* 번호 */}
        <span className="index-num-lg">0{index + 1}</span>

        {/* 타이틀 */}
        <h3 className="text-[26px] sm:text-[36px] lg:text-[44px] font-extrabold text-[#191f28] tracking-[-0.03em] leading-[1.1] transition-colors duration-300 group-hover:text-[#3182f6]">
          {service.title}
        </h3>

        {/* 설명 + 키워드 (데스크톱) */}
        <div className="hidden lg:block">
          <p className="text-[15px] text-[#4e5968] leading-[1.7] mb-2">{service.description}</p>
          <p className="text-[13px] text-[#adb5bd]">
            {service.features.slice(0, 3).join(' · ')}
          </p>
        </div>

        {/* 화살표 */}
        <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#e5e8eb] flex items-center justify-center text-[#191f28] transition-all duration-300 group-hover:bg-[#191f28] group-hover:border-[#191f28] group-hover:text-white">
          <FiArrowUpRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
