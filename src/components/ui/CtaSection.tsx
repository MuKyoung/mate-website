'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, fadeLeft, fadeRight, clipUp, clipLeft, stagger, inView } from '@/lib/motion';
import {
  arrowHover, btnPrimary, clipWrap, container, CONTACT_EMAIL,
  displaySizeLg, linkUnderline, sectionPadLg,
} from '@/lib/styles';

interface CtaSectionProps {
  /** 섹션 번호 라벨 (예: '06') */
  num: string;
  /** 대형 헤딩 1행 — 페이지마다 다르게 넘긴다 */
  line1: string;
  /** 대형 헤딩 2행 — 액센트 강조 */
  line2: string;
  /** 국문 캡션 (— 프리픽스 자동) */
  kr: string;
  /** 버튼 문구 */
  cta?: string;
}

/**
 * 페이지 하단 공통 CTA — 대형 스테이트먼트 + 국문 캡션 + 화이트 필 버튼 + 이메일.
 * 모든 페이지가 같은 마무리를 갖도록 하나로 관리한다.
 */
export default function CtaSection({ num, line1, line2, kr, cta = '프로젝트 문의' }: CtaSectionProps) {
  return (
    <section className={`${sectionPadLg} border-t border-white/10`}>
      <div className={container}>
        <motion.p {...inView} variants={fadeUp} className="index-num font-en mb-10">
          Contact
        </motion.p>

        <motion.h2 {...inView} variants={stagger}
          className="text-[var(--text-1)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-8"
          style={displaySizeLg}>
          <span className={clipWrap}>
            <motion.span variants={clipLeft} className="block">{line1}</motion.span>
          </span>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block text-[var(--point)]">{line2}</motion.span>
          </span>
        </motion.h2>

        <motion.p {...inView} variants={fadeLeft} className="caption-kr mb-14 sm:mb-20">
          — {kr}
        </motion.p>

        <motion.div {...inView} variants={fadeRight} className="flex flex-wrap items-center gap-8">
          <Link href="/contact" className={btnPrimary}>
            {cta}
            <FiArrowUpRight size={17} className={arrowHover} />
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkUnderline}>
            {CONTACT_EMAIL}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
