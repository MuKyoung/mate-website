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
          className="fixed bottom-4 left-0 right-0 z-50 px-2 sm:px-4 md:px-6"
        >
          <div className="mx-auto max-w-xl">
            <div className="bg-amber-500 text-white rounded-lg sm:rounded-xl shadow-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
              <FiAlertCircle className="text-base sm:text-lg md:text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs sm:text-sm md:text-base font-medium flex-grow min-w-0 break-words leading-relaxed">{message}</p>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 touch-manipulation mt-0.5 sm:mt-0"
                aria-label="닫기"
              >
                <FiX className="text-sm sm:text-base md:text-lg" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

