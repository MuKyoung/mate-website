'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ } from '@/types';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { DUR, easeEnter, fadeUp, staggerTight, inView } from '@/lib/motion';

interface FAQAccordionProps {
  faqs: FAQ[];
}

/**
 * 질문 한 줄마다 오른쪽에 각진 +/− 칸. 열린 질문은 칸이 파랗게 찬다.
 */
export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <motion.div {...inView} variants={staggerTight} className="space-y-2">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <motion.div key={faq.id} variants={fadeUp}
            className={`border transition-colors duration-300 ${isOpen ? 'border-white/25 bg-[var(--surface)]' : 'border-white/10'}`}>
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-6"
            >
              <span className="text-[16px] font-medium leading-[1.45] tracking-[-0.02em] text-[var(--text-1)] sm:text-[18px]">
                {faq.question}
              </span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center border transition-colors duration-300 ${
                isOpen ? 'border-primary-200 bg-primary-200 text-white' : 'border-white/25 text-white/70 group-hover:border-white/60'
              }`}>
                {isOpen ? <FiMinus size={14} /> : <FiPlus size={14} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: DUR.standard, ease: easeEnter }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl px-5 pb-6 text-[15px] leading-[1.8] text-white/60 sm:px-6 sm:text-[16px]">
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
