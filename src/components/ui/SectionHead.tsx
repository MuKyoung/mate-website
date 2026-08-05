'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import {
  fadeLeft, fadeRight, clipUp, clipLeft, lineDraw, stagger, inView,
} from '@/lib/motion';
import { arrowHover, clipWrap, displaySize, linkMore } from '@/lib/styles';

interface SectionHeadProps {
  /** 섹션 번호 — 홀짝에 따라 진입 방향이 교차된다 */
  num: string;
  /** 영문 라벨 */
  label: string;
  title: React.ReactNode;
  /** 국문 캡션 (— 프리픽스 자동) */
  kr?: string;
  /** 본문 설명 */
  desc?: string;
  /** 우측 링크 */
  href?: string;
  more?: string;
}

/**
 * 섹션 헤더 — 라벨 행(좌→우 라인 드로우) + 대형 타이틀 + 국문 캡션.
 * 섹션 번호의 홀짝에 따라 라벨·타이틀·캡션의 진입 방향이 뒤집혀
 * 연속된 섹션이 같은 연출을 반복하지 않는다.
 */
export default function SectionHead({
  num, label, title, kr, desc, href, more,
}: SectionHeadProps) {
  const even = parseInt(num, 10) % 2 === 0;

  return (
    <div className="mb-16 sm:mb-20">
      <div className="relative pb-6 mb-10 sm:mb-14">
        <div className="flex items-center justify-between gap-6">
          <motion.p {...inView} variants={even ? fadeRight : fadeLeft}
            className="index-num font-en">
            ({num}) {label}
          </motion.p>
          {href && more && (
            <motion.div {...inView} variants={even ? fadeLeft : fadeRight}>
              <Link href={href} className={linkMore}>
                {more}
                <FiArrowUpRight size={15} className={arrowHover} />
              </Link>
            </motion.div>
          )}
        </div>
        {/* 헤어라인이 좌→우로 그어짐 */}
        <motion.span {...inView} variants={lineDraw}
          className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
      </div>

      <motion.h2 {...inView} variants={stagger}
        className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.03em] leading-[1.04]"
        style={displaySize}>
        <span className={clipWrap}>
          <motion.span variants={even ? clipLeft : clipUp} className="block">{title}</motion.span>
        </span>
      </motion.h2>

      {kr && (
        <motion.p {...inView} variants={even ? fadeLeft : fadeRight} className="caption-kr mt-6">
          — {kr}
        </motion.p>
      )}
      {desc && (
        <motion.p {...inView} variants={even ? fadeRight : fadeLeft}
          className="mt-7 max-w-xl text-[17px] sm:text-lg text-white/55 leading-[1.75]">
          {desc}
        </motion.p>
      )}
    </div>
  );
}
