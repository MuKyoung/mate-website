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
  /** 'View more ↗' */
  more?: { href: string; label?: string };
  as?: 'h1' | 'h2';
  className?: string;
}

/**
 * 섹션 머리 - 로고 파랑 영문 이름 한 줄 + 보통 굵기와 굵은 낱말이 섞인 큰 제목.
 * Figma 의 Key Results · Process · References 머리와 같은 구성이다.
 */
export default function SectionHead({
  eyebrow, title, desc, align = 'left', dark = false, more, as = 'h2', className = '',
}: SectionHeadProps) {
  const Heading = as === 'h1' ? motion.h1 : motion.h2;
  const center = align === 'center';
  return (
    <motion.div {...inView} variants={stagger}
      className={`${center ? 'mx-auto text-center' : ''} ${className}`}>
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
      {more && (
        <motion.div variants={fadeUp} className="mt-8">
          <Link href={more.href} className={`${linkMore} ${dark ? 'text-white hover:text-point-light' : 'text-ink hover:text-point-200'}`}>
            {more.label ?? 'View more'}
            <FiArrowUpRight size={16} className={arrowHover} />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
