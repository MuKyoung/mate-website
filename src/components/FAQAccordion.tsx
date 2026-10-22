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
 * 질문 목록 - 가는 선으로 나눈 줄마다 오른쪽에 + (Figma 기술인증 목록).
 * 열린 질문은 + 가 로고 파랑 원으로 바뀐다.
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
                  <span className="hidden w-14 shrink-0 text-[13px] font-bold text-gray-400 sm:block">{faq.category}</span>
                )}
                <span className={`text-[16px] font-bold leading-[1.5] transition-colors sm:text-[17px] ${isOpen ? 'text-point-200' : 'text-ink group-hover:text-point-200'}`}>
                  {faq.question}
                </span>
              </span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill transition-colors duration-300 ${
                isOpen ? 'bg-point-200 text-white' : 'text-gray-400 group-hover:text-point-200'
              }`}>
                {isOpen ? <FiMinus size={16} /> : <FiPlus size={20} />}
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
                  <p className="max-w-2xl pb-6 text-[15px] leading-[1.8] text-ink-2 sm:pl-[68px] sm:text-[16px]">
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
