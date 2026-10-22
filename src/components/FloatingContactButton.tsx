'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClipboard, FiChevronUp } from 'react-icons/fi';

import { isToolScreen } from '@/lib/shell';
/**
 * 오른쪽 아래 동그란 버튼 둘 - 로고 파랑 '문의하기'와 흰 '맨 위로' (Figma Key Results 화면).
 * 맨 위로는 조금 내려온 뒤에 나타난다.
 */
export default function FloatingContactButton() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isToolScreen(pathname)) return null;
  const isContact = /^\/contact\/?$/.test(pathname);

  const circle = 'flex h-14 w-14 items-center justify-center rounded-pill sm:h-[68px] sm:w-[68px]';

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-center gap-3 sm:bottom-8 sm:right-6 2xl:right-[100px]">
      {!isContact && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.32, ease: [0.2, 0.6, 0.25, 1] }}>
          <Link href="/contact"
            className={`${circle} flex-col gap-0.5 bg-point-200 text-white shadow-float-lg transition-colors duration-200 hover:bg-point-300`}>
            <FiClipboard size={20} />
            <span className="text-[11px] font-bold leading-none sm:text-[12px]">문의하기</span>
          </Link>
        </motion.div>
      )}
      <AnimatePresence>
        {showTop && (
          <motion.button type="button" aria-label="맨 위로"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`${circle} border-2 border-gray-600 bg-white text-gray-600 shadow-float transition-colors hover:border-point-200 hover:text-point-200`}>
            <FiChevronUp size={26} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
