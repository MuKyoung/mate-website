'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, stagger, inView } from '@/lib/motion';
import { arrowHover, linkMore } from '@/lib/styles';

interface SectionHeadProps {
  /** 섹션의 작은 영문 이름 - "Key Results" */
  eyebrow?: string;
  /** 큰 제목. 굵게 누를 낱말만 <b> 로 감싼다 */
  title: React.ReactNode;
  desc?: React.ReactNode;
  align?: 'left' | 'center';
  /** 어두운 면 위 */
  dark?: boolean;
  /** 'View more ↗' - 왼쪽 정렬이면 제목 줄 오른쪽 끝에, 가운데 정렬이면 아래에 */
  more?: { href: string; label?: string };
  as?: 'h1' | 'h2';
  className?: string;
}

/**
 * 섹션 머리 - 로고 파랑 영문 이름 한 줄 + 보통 굵기와 굵은 낱말이 섞인 큰 제목.
 * Figma(세종호이스트크레인 리뉴얼)의 Key Results · Process · News 머리와 같은 모양이다.
 */
export default function SectionHead({
  eyebrow, title, desc, align = 'left', dark = false, more, as = 'h2', className = '',
}: SectionHeadProps) {
  const Heading = as === 'h1' ? motion.h1 : motion.h2;
  const center = align === 'center';
  const link = more && (
    <Link href={more.href} className={`${linkMore} ${dark ? 'text-white hover:text-point-light' : 'text-ink hover:text-point-200'}`}>
      {more.label ?? 'View more'}
      <FiArrowUpRight size={16} className={arrowHover} />
    </Link>
  );

  return (
    <motion.div {...inView} variants={stagger} className={className}>
      <div className={center ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'}>
        <div className={center ? '' : 'max-w-3xl'}>
          {eyebrow && (
            <motion.p variants={fadeUp} className={`eyebrow mb-3 ${dark ? 'on-night' : ''}`}>{eyebrow}</motion.p>
          )}
          <Heading variants={fadeUp} className={`type-h1 ${dark ? 'text-white' : 'text-ink'}`}>
            {title}
          </Heading>
          {desc && (
            <motion.p variants={fadeUp}
              className={`type-b3 mt-5 ${dark ? 'text-gray-200' : 'text-ink-2'} ${center ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
              {desc}
            </motion.p>
          )}
        </div>
        {link && !center && <motion.div variants={fadeUp} className="shrink-0 lg:pb-2">{link}</motion.div>}
      </div>
      {link && center && <motion.div variants={fadeUp} className="mt-8 flex justify-center">{link}</motion.div>}
    </motion.div>
  );
}
