'use client';

import { motion } from 'framer-motion';
import { easeEnter } from '@/lib/motion';

/**
 * 라우트 전환 연출.
 * template.tsx는 페이지 이동마다 새로 마운트되므로 진입 애니메이션이 매번 재생된다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeEnter }}
    >
      {children}
    </motion.div>
  );
}
