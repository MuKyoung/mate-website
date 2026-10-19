'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import StripeField from '@/components/visual/StripeField';
import { blurUp, fadeUp, stagger, inView } from '@/lib/motion';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';
import {
  arrowHover, btnLight, btnPrimary, container, CONTACT_EMAIL,
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
  /** split - 왼쪽 문장 + 오른쪽 줄무늬 (기본) / center - 가운데 큰 문장 (홈, Resend 홈의 마지막 칸) */
  variant?: 'split' | 'center';
}

/**
 * 페이지 하단 공통 CTA - 큰 문장 + 파란 버튼과 흰 버튼 한 쌍.
 * 바로 아래 푸터가 수평선 빛으로 페이지를 닫으므로 여기서는 빛을 쓰지 않고
 * 오른쪽에 파란 줄무늬 한 칸만 둔다.
 */
export default function CtaSection({
  line1, line2, kr, cta = '프로젝트 문의', href = '/contact', variant = 'split',
}: CtaSectionProps) {
  const buttons = (
    <>
      <Link href={href} className={btnPrimary}>
        {cta}
        <FiArrowUpRight size={16} className={arrowHover} />
      </Link>
      <a href={`mailto:${CONTACT_EMAIL}`} className={`${btnLight} font-mono text-[13px]`}>
        {CONTACT_EMAIL}
      </a>
    </>
  );

  // 가운데 - 윗선 가운데에 빛이 닿고, 큰 문장이 흐림을 걷으며 떠오른다.
  // 첫 줄은 흰빛이 흐르는 글자, 둘째 줄은 밝은 파랑
  if (variant === 'center') {
    return (
      <section className={`${sectionPadLg} beam-top border-t border-white/10`}>
        <div className={`${container} flex flex-col items-center text-center`}>
          <motion.p {...inView} variants={fadeUp} className="mono-label mb-10"><Scramble text="Contact:" /></motion.p>
          <motion.h2 {...inView} variants={blurUp}
            className="mb-8 font-medium leading-[1.06] tracking-[-0.028em]"
            style={displaySizeLg}>
            <span className="sheen inline-block pb-[0.06em]">{line1}</span>
            <br />
            <span className="inline-block text-[var(--point)]">{line2}</span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="caption-kr mb-12">
            {kr}
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2">
            {buttons}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${sectionPadLg} border-t border-white/10`}>
      <div className={container}>
        <div className="grid items-end gap-x-gutter gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p {...inView} variants={fadeUp} className="mono-label mb-10"><Scramble text="Contact:" /></motion.p>

            <motion.h2 {...inView} variants={stagger}
              className="mb-8 font-medium leading-[1.04] tracking-[-0.028em] text-[var(--text-1)]"
              style={displaySizeLg}>
              <SplitText text={line1} className="block" />
              <SplitText text={line2} className="block text-[var(--point)]" />
            </motion.h2>

            <motion.p {...inView} variants={fadeUp} className="caption-kr mb-12">
              {kr}
            </motion.p>

            <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center gap-2">
              {buttons}
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
