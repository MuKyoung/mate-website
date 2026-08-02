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
    <motion.div {...inView} variants={stagger} className="space-y-4">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            variants={fadeUp}
            className="rounded-[28px] overflow-hidden border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:border-[#3182f6] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              aria-expanded={isOpen}
              className="w-full px-8 sm:px-10 py-7 sm:py-8 text-left flex items-center justify-between gap-6 transition-colors"
            >
              <span className="font-bold text-[#191f28] text-[17px] sm:text-[19px] tracking-[-0.02em] leading-[1.4]">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: DUR.standard, ease: easeEnter }}
                className="flex-shrink-0"
              >
                <FiChevronDown
                  size={26}
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
                  <div className="px-8 sm:px-10 pb-8 sm:pb-10">
                    <div className="rounded-2xl bg-[#f4f6f8] px-7 py-6">
                      <p className="text-[#4e5968] leading-[1.8] text-[16px]">
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
