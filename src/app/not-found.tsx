'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { easeEnter } from '@/lib/motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } }}
        className="text-center"
      >
        {/* 로고 */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeEnter } } }}
          className="mb-10"
        >
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <Image src="/images/logo.png" alt="MATE" width={120} height={38} className="h-8 w-auto" />
          </Link>
        </motion.div>

        {/* 404 */}
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeEnter } } }}
          className="text-7xl sm:text-8xl font-extrabold tracking-tight text-[#262626] mb-5"
        >
          404
        </motion.h1>

        <motion.h2
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeEnter } } }}
          className="text-xl sm:text-2xl font-bold text-[#262626] mb-3"
        >
          페이지를 찾을 수 없습니다
        </motion.h2>

        <motion.p
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeEnter } } }}
          className="text-[15px] text-[#5d5d5d] leading-relaxed mb-9 max-w-md mx-auto"
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeEnter } } }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-[15px] font-medium text-white bg-[#2a72e5] hover:bg-[#0957c8] transition-colors"
          >
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-[15px] font-medium text-[#262626] bg-white border border-[#c6c6c6] hover:bg-[#f7f7f7] hover:border-[#a3a3a3] transition-colors"
          >
            <FiArrowLeft size={16} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
