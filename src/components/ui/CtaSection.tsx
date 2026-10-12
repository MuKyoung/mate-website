'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, fadeLeft, fadeRight, clipUp, clipLeft, stagger, inView } from '@/lib/motion';
import {
  arrowHover, btnOnBrand, clipWrap, container, CONTACT_EMAIL,
  displaySizeLg, linkOnBrand, sectionPadLg,
} from '@/lib/styles';

interface CtaSectionProps {
  /** 대형 헤딩 1행 - 페이지마다 다르게 넘긴다 */
  line1: string;
  /** 대형 헤딩 2행 - 액센트 강조 */
  line2: string;
  /** 국문 캡션 (- 프리픽스 자동) */
  kr: string;
  /** 버튼 문구 */
  cta?: string;
}

/**
 * 페이지 하단 공통 CTA - 대표 색상 면에 큰 문장 + 한 줄 설명 + 흰 버튼 + 이메일.
 * 모든 페이지가 같은 마무리를 갖도록 하나로 관리한다.
 */
export default function CtaSection({ line1, line2, kr, cta = '프로젝트 문의' }: CtaSectionProps) {
  return (
    // 영역 페이지에서 불려도 색은 바뀌지 않는다 - 문의는 공통 영역이라 대표 색상을 쓴다
    <section className={`${sectionPadLg} bg-[var(--brand-fill)]`}>
      <div className={container}>
        <motion.p {...inView} variants={fadeUp}
          className="mb-10 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80">
          Contact
        </motion.p>

        <motion.h2 {...inView} variants={stagger}
          className="mb-8 font-bold leading-[1.1] tracking-[-0.02em] text-white"
          style={displaySizeLg}>
          <span className={clipWrap}>
            <motion.span variants={clipLeft} className="block">{line1}</motion.span>
          </span>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">{line2}</motion.span>
          </span>
        </motion.h2>

        <motion.p {...inView} variants={fadeLeft}
          className="mb-12 max-w-xl text-[17px] leading-[1.8] text-white/90 sm:mb-16 sm:text-[19px]">
          {kr}
        </motion.p>

        <motion.div {...inView} variants={fadeRight} className="flex flex-wrap items-center gap-8">
          <Link href="/contact" className={btnOnBrand}>
            {cta}
            <FiArrowUpRight size={17} className={arrowHover} />
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkOnBrand}>
            {CONTACT_EMAIL}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
