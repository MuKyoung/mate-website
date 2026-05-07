'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

export default function FloatingContactButton() {
  const pathname = usePathname();

  if (pathname === '/contact' || pathname === '/contact/') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 0.8, duration: 0.4, type: 'spring' }}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50"
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-lg font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20 transition-all duration-200"
          >
            <FiMessageCircle size={18} />
            <span className="hidden sm:inline text-sm">문의하기</span>
            <span className="sm:hidden text-sm">문의</span>
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
