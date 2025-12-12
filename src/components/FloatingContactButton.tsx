'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

export default function FloatingContactButton() {
  const pathname = usePathname();
  
  // 문의 페이지에서는 표시하지 않음
  if (pathname === '/contact' || pathname === '/contact/') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        <Link
          href="/contact"
          className="group flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-sm sm:text-base touch-manipulation"
        >
          <FiMessageCircle size={18} className="sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">문의하기</span>
          <span className="sm:hidden">문의</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

