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
 * 서비스 리스트 로우 — 카드 박스 대신 헤어라인으로 구분되는 풀폭 행 (다크).
 */
export default function ServiceCard({ service, index }: ServiceCardProps) {
  // 행마다 진입 방향을 교차 — 좌 / 우 / 상승
  const dir = index % 3;
  const hidden = dir === 0 ? { opacity: 0, x: -80 } : dir === 1 ? { opacity: 0, x: 80 } : { opacity: 0, y: 56 };
  return (
    <motion.div
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: index * 0.08, duration: 0.95, ease: easeEnter }}
    >
      <Link href="/services"
        className="group grid grid-cols-[auto_1fr_auto] lg:grid-cols-[5rem_1fr_1fr_auto] items-center gap-x-6 lg:gap-x-10 py-9 sm:py-12 border-t border-white/10 last:border-b transition-colors duration-300 hover:bg-white/[0.03] -mx-4 sm:-mx-6 px-4 sm:px-6">
        {/* 번호 */}
        <span className="index-num-lg font-en">0{index + 1}</span>

        {/* 타이틀 */}
        <h3 className="text-[26px] sm:text-[36px] lg:text-[44px] font-extrabold text-[#f5f6f7] tracking-[-0.03em] leading-[1.1] transition-colors duration-300 group-hover:text-[#3182f6]">
          {service.title}
        </h3>

        {/* 설명 + 키워드 (데스크톱) */}
        <div className="hidden lg:block">
          <p className="text-[15px] text-white/55 leading-[1.7] mb-2">{service.description}</p>
          <p className="text-[13px] text-white/30">
            {service.features.slice(0, 3).join(' · ')}
          </p>
        </div>

        {/* 화살표 — 호버 시 45도 회전하며 채워짐 */}
        <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/15 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-white group-hover:border-white group-hover:text-[#131518] group-hover:rotate-45">
          <FiArrowUpRight size={20} />
        </span>
      </Link>
    </motion.div>
  );
}
