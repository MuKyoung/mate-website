'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';

interface FloatingNoticeProps {
  message: string;
}

export default function FloatingNotice({ message }: FloatingNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-xl px-2 sm:px-0"
        >
          <div className="bg-amber-500 text-white rounded-lg sm:rounded-xl shadow-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 flex items-center gap-2 sm:gap-3">
            <FiAlertCircle className="text-lg sm:text-xl md:text-2xl flex-shrink-0" />
            <p className="text-xs sm:text-sm md:text-base font-medium flex-grow leading-snug sm:leading-normal">{message}</p>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 touch-manipulation"
              aria-label="닫기"
            >
              <FiX className="text-base sm:text-lg" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

