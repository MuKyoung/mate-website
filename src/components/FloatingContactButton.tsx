'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

export default function FloatingContactButton() {
  const pathname = usePathname();

  if (pathname === '/contact' || pathname === '/contact/') return null;
  if (pathname.startsWith('/taskmanager')) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.6, duration: 0.32, ease: [0.2, 0.6, 0.25, 1] }}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50"
      >
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            href="/contact"
            className="flex h-11 items-center gap-2 rounded-[2px] bg-primary-200 px-4 font-medium text-white
                        shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-[var(--blue-glow)] sm:px-5"
          >
            <FiMessageCircle size={16} />
            <span className="hidden sm:inline text-sm">문의하기</span>
            <span className="sm:hidden text-sm">문의</span>
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
