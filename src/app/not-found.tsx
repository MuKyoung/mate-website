'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-b from-[#f4f6f8] to-white px-4 sm:px-6">
      <motion.div {...onMount} variants={stagger} className="container mx-auto max-w-2xl">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38} className="h-8 w-auto" />
          </Link>
        </motion.div>

        {/* 404 */}
        <motion.h1 variants={stagger}
          className="text-[#3182f6] font-extrabold tracking-[-0.04em] leading-[0.95] mb-6"
          style={{ fontSize: 'clamp(4rem, 14vw, 8rem)' }}>
          <span className="block overflow-hidden">
            <motion.span variants={clipUp} className="block">404</motion.span>
          </span>
        </motion.h1>

        <motion.h2 variants={fadeUp}
          className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.15] mb-5"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
          페이지를 찾을 수 없습니다
        </motion.h2>

        <motion.p variants={fadeUp} className="text-[15px] text-[#4e5968] leading-[1.75] mb-10 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors"
          >
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#4e5968] hover:text-[#191f28] transition-colors underline underline-offset-4 decoration-[#d1d6db] hover:decoration-[#191f28]"
          >
            <FiArrowLeft size={14} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
