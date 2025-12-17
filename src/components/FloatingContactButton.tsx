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
        transition={{ delay: 0.8, duration: 0.4, type: "spring" }}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/contact"
            className="group relative flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-full font-semibold text-white shadow-2xl shadow-purple-500/30 transition-all duration-300 overflow-hidden"
          >
            {/* Gradient Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
            
            {/* Hover Gradient */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-pink-600 to-purple-600" />
            
            {/* Glow Effect */}
            <motion.span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)',
              }}
            />
            
            {/* Content */}
            <span className="relative flex items-center gap-2">
              <FiMessageCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline text-sm sm:text-base">문의하기</span>
              <span className="sm:hidden text-sm">문의</span>
            </span>
          </Link>
        </motion.div>

        {/* Pulse Animation Ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ pointerEvents: 'none' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
