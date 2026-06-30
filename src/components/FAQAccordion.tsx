'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ } from '@/types';
import { FiChevronDown } from 'react-icons/fi';

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white rounded-xl overflow-hidden border border-[#e1e1e1] hover:border-[#c6c6c6] transition-colors"
        >
          <button
            onClick={() => toggleFAQ(faq.id)}
            className="w-full px-5 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-[#f7f7f7] transition-colors"
          >
            <span className="font-semibold text-[#262626] pr-4 text-sm md:text-base">{faq.question}</span>
            <motion.div
              animate={{ rotate: openId === faq.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <FiChevronDown className="text-[#5d5d5d]" size={20} />
            </motion.div>
          </button>
          <AnimatePresence>
            {openId === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 md:px-6 py-4 md:py-5 bg-[#f7f7f7] border-t border-[#e1e1e1]">
                  <p className="text-[#4c4c4c] leading-relaxed text-sm md:text-base">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

