'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, fadeRight, clipLeft, lineDraw, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center px-4 sm:px-6">
      <motion.div {...onMount} variants={stagger} className="container mx-auto max-w-3xl">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-14">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38} className="h-8 w-auto brightness-0 invert" />
          </Link>
        </motion.div>

        {/* 라벨 행 — 헤어라인 라인 드로우 */}
        <div className="relative pb-6 mb-10 sm:mb-12">
          <motion.p variants={fadeRight} className="index-num font-en">
            404 — Not Found
          </motion.p>
          <motion.span variants={lineDraw}
            className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
        </div>

        {/* 대형 타이틀 */}
        <motion.h1 variants={stagger}
          className="text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[1.04] mb-6"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span variants={clipLeft} className="block">페이지를 찾을 수 없습니다</motion.span>
          </span>
        </motion.h1>

        <motion.p variants={fadeRight} className="text-[15px] sm:text-[16px] text-white/55 leading-[1.75] mb-12 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-8">
          <Link href="/"
            className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-white/60 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
            <FiArrowLeft size={14} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
