'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center bg-[#0a0a0a] px-4 sm:px-6">
      <motion.div {...onMount} variants={stagger} className="container mx-auto max-w-2xl">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38}
              className="h-8 w-auto brightness-0 invert" />
          </Link>
        </motion.div>

        {/* 404 */}
        <motion.p variants={fadeUp} className="text-[13px] text-white/35 mb-4">404 — Not Found</motion.p>

        <motion.h1 variants={stagger} className="text-white font-semibold tracking-[-0.03em] leading-[1.05] mb-5"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
          <span className="block overflow-hidden">
            <motion.span variants={clipUp} className="block">페이지를 찾을 수 없습니다</motion.span>
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-[15px] text-white/55 leading-[1.75] mb-9 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 h-12 px-6 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors"
          >
            <FiHome size={15} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[14px] text-white/55 hover:text-white transition-colors underline underline-offset-4 decoration-white/25 hover:decoration-white"
          >
            <FiArrowLeft size={14} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
