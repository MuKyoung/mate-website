'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { fadeUp, stagger, onMount } from '@/lib/motion';
import { btnLine, btnPoint } from '@/lib/styles';

export default function NotFound() {
  return (
    <section data-header="light" className="flex min-h-screen items-center justify-center px-5 pb-24 pt-32">
      <motion.div {...onMount} variants={stagger} className="text-center">
        <motion.p variants={fadeUp} className="text-[clamp(5rem,3rem+8vw,10rem)] font-bold leading-none tracking-[-0.03em] text-point-200">
          404
        </motion.p>
        <motion.h1 variants={fadeUp} className="type-h2 mt-6 text-ink">페이지를 찾을 수 없습니다</motion.h1>
        <motion.p variants={fadeUp} className="type-b3 mx-auto mt-4 max-w-md text-ink-2">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className={btnPoint}>
            <FiHome size={16} />
            홈으로 돌아가기
          </Link>
          <button type="button" onClick={() => window.history.back()} className={btnLine}>
            <FiArrowLeft size={16} />
            이전 페이지
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
