'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center bg-[#4f46ff] px-4 sm:px-6 overflow-hidden">
      {/* 라임 액센트 도형 */}
      <div className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
      <div className="absolute bottom-10 -left-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none hidden sm:block" />

      <motion.div {...onMount} variants={stagger} className="relative container mx-auto max-w-2xl">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38}
              className="h-8 w-auto brightness-0 invert" />
          </Link>
        </motion.div>

        {/* 404 */}
        <motion.h1 variants={stagger}
          className="text-white font-extrabold tracking-[-0.04em] leading-[0.95] mb-6"
          style={{ fontSize: 'clamp(4rem, 14vw, 9rem)' }}>
          <span className="block overflow-hidden">
            <motion.span variants={clipUp} className="block">404</motion.span>
          </span>
        </motion.h1>

        <motion.h2 variants={stagger}
          className="text-white font-extrabold tracking-[-0.03em] leading-[1.1] mb-5"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
          <span className="block overflow-hidden">
            <motion.span variants={clipUp} className="block">페이지를 찾을 수 없습니다</motion.span>
          </span>
        </motion.h2>

        <motion.p variants={fadeUp} className="text-[15px] text-white/75 leading-[1.75] mb-10 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors"
          >
            <FiHome size={17} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[14px] text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
          >
            <FiArrowLeft size={14} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
