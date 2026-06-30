'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--background)' }}>

      <div className="text-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
            <Image
              src="/images/logo.png"
              alt="MATE"
              width={120}
              height={38}
              className="h-8 w-auto"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-8xl sm:text-9xl font-bold text-[#262626] mb-4 tracking-tight">404</h1>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-semibold text-[#262626] mb-3"
        >
          페이지를 찾을 수 없습니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[#5d5d5d] mb-8 max-w-md mx-auto text-sm"
        >
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white bg-[#2a72e5] hover:bg-[#0957c8] transition-colors duration-200 text-sm">
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-[#262626] bg-white border border-[#c6c6c6] hover:bg-[#f7f7f7] transition-all duration-200"
          >
            <FiArrowLeft size={16} />
            이전 페이지
          </button>
        </motion.div>
      </div>
    </div>
  );
}
