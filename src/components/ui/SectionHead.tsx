'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, stagger, inView } from '@/lib/motion';
import { arrowHover, linkMore } from '@/lib/styles';

interface SectionHeadProps {
  /** 칸 이름 - 등폭 대문자로 찍힌다. 끝에 쌍점을 붙여 넘긴다 ("What we do:") */
  eyebrow?: string;
  /** 큰 제목. 강조할 낱말만 <b> 로 감싸면 로고 파랑이 된다 */
  title: React.ReactNode;
  desc?: React.ReactNode;
  align?: 'left' | 'center';
  /** 어두운 면 위 */
  dark?: boolean;
  /** '전체 보기 ↗' - 왼쪽 정렬이면 제목 오른쪽 끝에, 가운데 정렬이면 아래에 */
  more?: { href: string; label?: string };
  as?: 'h1' | 'h2';
  className?: string;
}

/**
 * 섹션 머리 - 등폭 칸 이름 + 보통 굵기의 큰 제목 + 짧은 설명.
 */
export default function SectionHead({
  eyebrow, title, desc, align = 'left', dark = false, more, as = 'h2', className = '',
}: SectionHeadProps) {
  const Heading = as === 'h1' ? motion.h1 : motion.h2;
  const center = align === 'center';
  const link = more && (
    <Link href={more.href}
      className={`${linkMore} ${dark ? 'text-white/70 hover:text-white' : 'text-ink-3 hover:text-point-200'}`}>
      {more.label ?? 'View all'}
      <FiArrowUpRight size={14} className={arrowHover} />
    </Link>
  );

  return (
    <motion.div {...inView} variants={stagger} className={`${dark ? 'on-night' : ''} ${className}`}>
      <div className={center ? 'mx-auto max-w-3xl text-center' : 'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'}>
        <div className={center ? '' : 'max-w-3xl'}>
          {eyebrow && <motion.p variants={fadeUp} className="eyebrow mb-5">{eyebrow}</motion.p>}
          <Heading variants={fadeUp} className={`type-h1 ${dark ? 'text-white' : 'text-ink'}`}>
            {title}
          </Heading>
          {desc && (
            <motion.p variants={fadeUp}
              className={`type-b3 mt-5 ${dark ? 'text-gray-300' : 'text-ink-2'} ${center ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
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
