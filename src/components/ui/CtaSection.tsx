'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import StripeField from '@/components/visual/StripeField';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';
import {
  arrowHover, btnLight, btnPrimary, clipWrap, container, CONTACT_EMAIL,
  displaySizeLg, sectionPadLg,
} from '@/lib/styles';

interface CtaSectionProps {
  /** 예전 섹션 번호 - 쓰는 곳이 남아 있어 받기만 한다 */
  num?: string;
  /** 대형 헤딩 1행 - 페이지마다 다르게 넘긴다 */
  line1: string;
  /** 대형 헤딩 2행 - 밝은 파랑 */
  line2: string;
  /** 국문 캡션 */
  kr: string;
  /** 버튼 문구 */
  cta?: string;
  /** 버튼이 가는 곳 - 영역 페이지는 문의 폼에 영역을 미리 골라 둔다 */
  href?: string;
}

/**
 * 페이지 하단 공통 CTA - 큰 문장 + 파란 버튼과 흰 버튼 한 쌍.
 * 바로 아래 푸터가 수평선 빛으로 페이지를 닫으므로 여기서는 빛을 쓰지 않고
 * 오른쪽에 파란 줄무늬 한 칸만 둔다.
 */
export default function CtaSection({ line1, line2, kr, cta = '프로젝트 문의', href = '/contact' }: CtaSectionProps) {
  return (
    <section className={`${sectionPadLg} border-t border-white/10`}>
      <div className={container}>
        <div className="grid items-end gap-x-gutter gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p {...inView} variants={fadeUp} className="mono-label mb-10">Contact:</motion.p>

            <motion.h2 {...inView} variants={stagger}
              className="mb-8 font-medium leading-[1.04] tracking-[-0.045em] text-[var(--text-1)]"
              style={displaySizeLg}>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">{line1}</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block text-[var(--point)]">{line2}</motion.span>
              </span>
            </motion.h2>

            <motion.p {...inView} variants={fadeUp} className="caption-kr mb-12">
              {kr}
            </motion.p>

            <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center gap-2">
              <Link href={href} className={btnPrimary}>
                {cta}
                <FiArrowUpRight size={16} className={arrowHover} />
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${btnLight} font-mono text-[13px]`}>
                {CONTACT_EMAIL}
              </a>
            </motion.div>
          </div>

          <motion.div {...inView} variants={fadeUp} className="relative hidden h-[360px] lg:col-span-5 lg:block">
            <StripeField seed={21} className="absolute inset-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
