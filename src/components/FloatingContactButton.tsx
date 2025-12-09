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
        className="fixed bottom-6 right-6 z-50"
      >
        <Link
          href="/contact"
          className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          <FiMessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
          <span>문의하기</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

