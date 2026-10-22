'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiArrowUp } from 'react-icons/fi';
import { isToolScreen } from '@/lib/shell';

/**
 * 오른쪽 아래 문의 버튼 - 로고 파랑 면에 말풍선과 '문의하기'.
 * 조금 내려오면 왼쪽에 맨 위로 가는 네모 칸이 붙는다.
 */
export default function FloatingContactButton() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isToolScreen(pathname)) return null;
  const isContact = /^\/contact\/?$/.test(pathname);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex items-center gap-2 sm:bottom-7 sm:right-6">
      <AnimatePresence>
        {showTop && (
          <motion.button type="button" aria-label="맨 위로"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-line bg-white text-ink shadow-float transition-colors hover:border-point-200 hover:text-point-200">
            <FiArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
      {!isContact && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.32, ease: [0.2, 0.6, 0.25, 1] }}>
          <Link href="/contact"
            className="flex h-11 items-center gap-2 rounded-[8px] bg-point-200 px-4 text-[14px] font-semibold text-white shadow-[0_10px_28px_rgba(38,68,203,0.35)] transition-colors duration-200 hover:bg-point-300 sm:px-5">
            <FiMessageCircle size={16} />
            문의하기
          </Link>
        </motion.div>
      )}
    </div>
  );
}
