'use client';

import { motion } from 'framer-motion';
import { fadeLeft, fadeRight, fadeUp, stagger, inView } from '@/lib/motion';
import { container, radiusCard } from '@/lib/styles';

interface DomainIntroProps {
  /** 제목 위 작은 이름 - '웹 · 앱' */
  eyebrow: string;
  title: React.ReactNode;
  desc: React.ReactNode;
  /** 오른쪽 그림 칸 (742 × 500 비율) */
  media: React.ReactNode;
  /** 설명 아래에 붙는 것 - 태그 등 */
  children?: React.ReactNode;
}

/**
 * 영역 페이지 첫 칸 - 회색 띠 위에 왼쪽 글, 오른쪽 사진 (Figma 6-2. intro).
 */
export default function DomainIntro({ eyebrow, title, desc, media, children }: DomainIntroProps) {
  return (
    <section data-header="light" className="relative bg-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-full bg-gray-100 lg:h-[min(700px,88%)]" />
      <div className={`${container} relative grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,489fr)_minmax(0,742fr)] lg:gap-16 xl:gap-[120px] xl:py-[100px]`}>
        <motion.div {...inView} variants={stagger}>
          <motion.p variants={fadeLeft} className="type-b4 text-point-200">{eyebrow}</motion.p>
          <motion.h2 variants={fadeLeft} className="type-h1 mt-3 text-ink">{title}</motion.h2>
          <motion.p variants={fadeUp} className="type-b3 mt-6 max-w-[34em] text-ink-2">{desc}</motion.p>
          {children && <motion.div variants={fadeUp} className="mt-8">{children}</motion.div>}
        </motion.div>
        <motion.div {...inView} variants={fadeRight}
          className={`relative aspect-[742/500] overflow-hidden bg-gray-200 shadow-float ${radiusCard}`}>
          {media}
        </motion.div>
      </div>
    </section>
  );
}
