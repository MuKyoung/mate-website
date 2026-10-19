'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, clipUp, lineDraw, stagger, inView } from '@/lib/motion';
import { arrowHover, clipWrap, displaySize, linkMore } from '@/lib/styles';
import Scramble from '@/components/motion/Scramble';
import { SplitText, plainText } from '@/components/motion/SplitText';

interface SectionHeadProps {
  /** 섹션 번호 - 예전 호출부 호환용. 화면에는 찍지 않는다 (번호 매긴 섹션은 틀에서 찍어 낸 것처럼 보인다) */
  num?: string;
  /** 라벨 (영문). 끝에 쌍점이 붙는다 - "SELECTED WORK:" */
  label?: string;
  title: React.ReactNode;
  /** 국문 캡션 */
  kr?: string;
  /** 본문 설명 */
  desc?: string;
  /** 우측 링크 */
  href?: string;
  more?: string;
}

/**
 * 섹션 헤더 - 등폭 라벨 줄(헤어라인) + 보통 굵기의 큰 제목.
 * 라벨은 칸의 이름이다. 제목을 굵게 누르지 않고 크기와 자간으로 세운다.
 */
export default function SectionHead({
  label, title, kr, desc, href, more,
}: SectionHeadProps) {
  // 글자만 든 제목은 낱말마다 따로 올라오게 하고, 다른 요소가 섞인 제목은 한 줄로 올린다
  const text = plainText(title);
  return (
    <div className="mb-14 sm:mb-20">
      <div className="relative mb-10 pb-4 sm:mb-14">
        <div className="flex items-center justify-between gap-6">
          {label ? (
            <motion.p {...inView} variants={fadeUp} className="mono-label"><Scramble text={`${label}:`} /></motion.p>
          ) : <span />}
          {href && more && (
            <motion.div {...inView} variants={fadeUp}>
              <Link href={href} className={linkMore}>
                {more}
                <FiArrowUpRight size={14} className={arrowHover} />
              </Link>
            </motion.div>
          )}
        </div>
        <motion.span {...inView} variants={lineDraw}
          className="absolute bottom-0 left-0 right-0 block h-px bg-white/[0.12]" />
      </div>

      <motion.h2 {...inView} variants={stagger}
        className="max-w-5xl font-medium leading-[1.08] tracking-[-0.04em] text-[var(--text-1)]"
        style={displaySize}>
        {text ? (
          <SplitText text={text} className="block" />
        ) : (
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">{title}</motion.span>
          </span>
        )}
      </motion.h2>

      {kr && (
        <motion.p {...inView} variants={fadeUp} className="caption-kr mt-6">
          {kr}
        </motion.p>
      )}
      {desc && (
        <motion.p {...inView} variants={fadeUp}
          className="mt-7 max-w-xl text-[16px] leading-[1.75] text-white/60 sm:text-[17px]">
          {desc}
        </motion.p>
      )}
    </div>
  );
}
