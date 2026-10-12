'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, inView } from '@/lib/motion';
import { arrowHover, btnOnBrand, container, CONTACT_EMAIL, linkOnBrand } from '@/lib/styles';

interface CtaSectionProps {
  /** 큰 문장 1행 - 페이지마다 다르게 넘긴다 */
  line1: string;
  /** 큰 문장 2행 */
  line2: string;
  /** 한 줄 설명 */
  kr: string;
  /** 버튼 문구 */
  cta?: string;
}

/**
 * 페이지 하단 공통 문의 - 대표 색상의 둥근 면에 문장 + 한 줄 설명 + 버튼 + 이메일.
 * 모든 페이지가 같은 마무리를 갖도록 하나로 관리한다.
 * 영역 페이지에서 불려도 색은 바뀌지 않는다. 문의는 공통 영역이라 대표 색상을 쓴다.
 */
export default function CtaSection({ line1, line2, kr, cta = '프로젝트 문의' }: CtaSectionProps) {
  return (
    <section className="py-12 sm:py-20">
      <div className={container}>
        <motion.div {...inView} variants={fadeUp}
          className="on-brand -mx-3 rounded-block px-6 py-12 medium:mx-0 medium:px-12 medium:py-16">
          <p className="text-sub font-medium text-[var(--text-3)]">문의</p>
          <h2 className="mt-4 text-ext font-bold">
            <span className="block">{line1}</span>
            <span className="block">{line2}</span>
          </h2>
          <p className="mt-5 max-w-xl text-body text-[var(--text-2)]">{kr}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
            <Link href="/contact" className={btnOnBrand}>
              {cta}
              <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkOnBrand}>{CONTACT_EMAIL}</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
