'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, onMount } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full opacity-[0.14]"
          style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
      </div>

      <motion.div {...onMount} variants={stagger} className="relative text-center">
        {/* 로고 */}
        <motion.div variants={fadeUp} className="mb-12">
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38}
              className="h-8 w-auto brightness-0 invert" />
          </Link>
        </motion.div>

        {/* 404 */}
        <motion.h1 variants={stagger} className="display-hero text-white mb-6">
          <span className="block overflow-hidden">
            <motion.span variants={clipUp} className="block">404</motion.span>
          </span>
        </motion.h1>

        <motion.h2 variants={fadeUp} className="text-xl sm:text-2xl font-bold text-white mb-4">
          페이지를 찾을 수 없습니다
        </motion.h2>

        <motion.p variants={fadeUp} className="text-lg on-dark-2 leading-relaxed mb-10 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-[15px] font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors"
          >
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-[15px] font-medium text-white border border-white/25 hover:border-white/60 hover:bg-white/5 transition-colors"
          >
            <FiArrowLeft size={16} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
