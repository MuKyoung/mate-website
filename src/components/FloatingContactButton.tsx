'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

/** Header.tsx 의 LIGHT_ROUTES 와 같은 목록 - 밝은 표면에서는 알약을 어둡게 뒤집는다 */
const LIGHT_ROUTES = ['/education'];

export default function FloatingContactButton() {
  const pathname = usePathname();

  if (pathname === '/contact' || pathname === '/contact/') return null;
  if (pathname.startsWith('/taskmanager')) return null;

  const light = LIGHT_ROUTES.some((r) => pathname.startsWith(r));

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
            className={`flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-full font-bold
                        shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-colors duration-300
                        hover:bg-[var(--accent)] hover:text-white ${
                          light ? 'bg-[var(--gray-600)] text-white' : 'bg-white text-[var(--canvas)]'
                        }`}
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
