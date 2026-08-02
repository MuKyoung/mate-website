'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center bg-white px-4 sm:px-6">
      <motion.div {...onMount} variants={stagger} className="container mx-auto max-w-3xl">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-14">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38} className="h-8 w-auto" />
          </Link>
        </motion.div>

        {/* 라벨 행 */}
        <motion.p variants={fadeUp} className="index-num pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-12">
          404 — Not Found
        </motion.p>

        {/* 대형 타이틀 */}
        <motion.h1 variants={stagger}
          className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04] mb-6"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span variants={clipUp} className="block">페이지를 찾을 수 없습니다</motion.span>
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-[15px] sm:text-[16px] text-[#4e5968] leading-[1.75] mb-12 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-8">
          <Link href="/"
            className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#4e5968] hover:text-[#191f28] border-b border-[#d1d6db] hover:border-[#191f28] pb-0.5 transition-colors">
            <FiArrowLeft size={14} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
