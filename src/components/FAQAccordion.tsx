'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ } from '@/types';
import { FiChevronDown } from 'react-icons/fi';
import { DUR, easeEnter, fadeUp, stagger, inView } from '@/lib/motion';

interface FAQAccordionProps {
  faqs: FAQ[];
}

// 헤어라인 아코디언 — 카드 박스 없이 border-t로 구분되는 풀폭 행.
export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.div {...inView} variants={stagger}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div
            key={faq.id}
            variants={fadeUp}
            className="border-t border-[#e5e8eb] last:border-b"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              aria-expanded={isOpen}
              className="group w-full py-7 text-left flex items-center justify-between gap-6"
            >
              <span className="text-[17px] sm:text-[19px] font-bold text-[#191f28] tracking-[-0.02em] leading-[1.4] transition-colors duration-300 group-hover:text-[#3182f6]">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: DUR.standard, ease: easeEnter }}
                className="flex-shrink-0 text-[#adb5bd]"
              >
                <FiChevronDown size={22} />
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
                  <p className="text-[16px] leading-[1.8] text-[#4e5968] pb-8 max-w-2xl">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
