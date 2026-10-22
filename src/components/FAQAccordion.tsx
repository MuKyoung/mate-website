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
 * 질문 목록 - 굵은 윗선 아래 가는 선으로 나눈 줄마다 오른쪽에 + 칸.
 * 열린 질문은 + 칸이 로고 파랑으로 찬다.
 */
export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <motion.ul {...inView} variants={staggerTight} className="border-t-2 border-ink">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <motion.li key={faq.id} variants={fadeUp} className="border-b border-gray-300">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
            >
              <span className="flex items-baseline gap-3">
                {faq.category && (
                  <span className="hidden w-16 shrink-0 font-mono text-[11px] text-ink-3 sm:block">{faq.category}</span>
                )}
                <span className={`text-[16px] font-semibold leading-[1.5] transition-colors sm:text-[17px] ${isOpen ? 'text-point-200' : 'text-ink group-hover:text-point-200'}`}>
                  {faq.question}
                </span>
              </span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-300 ${
                isOpen ? 'border-point-200 bg-point-200 text-white' : 'border-line text-ink-3 group-hover:border-point-200 group-hover:text-point-200'
              }`}>
                {isOpen ? <FiMinus size={15} /> : <FiPlus size={15} />}
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
                  <p className="max-w-2xl pb-6 text-[15px] leading-[1.8] text-ink-2 sm:pl-[76px] sm:text-[16px]">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
