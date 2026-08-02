'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ } from '@/types';
import { FiChevronDown } from 'react-icons/fi';
import { DUR, easeEnter, fadeUp, stagger, inView } from '@/lib/motion';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.div {...inView} variants={stagger} className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            variants={fadeUp}
            className="rounded-[20px] overflow-hidden border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:border-[#3182f6] transition-colors"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              aria-expanded={isOpen}
              className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 transition-colors"
            >
              <span className="font-semibold text-[#191f28] text-sm sm:text-[15px]">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: DUR.standard, ease: easeEnter }}
                className="flex-shrink-0"
              >
                <FiChevronDown
                  size={18}
                  className={isOpen ? 'text-[#3182f6]' : 'text-[#adb5bd]'}
                />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: DUR.slow, ease: easeEnter }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <div className="rounded-xl bg-[#f4f6f8] px-5 py-4">
                      <p className="text-[#4e5968] leading-relaxed text-sm sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
