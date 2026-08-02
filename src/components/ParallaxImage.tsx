'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { easeEnter } from '@/lib/motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** 컨테이너 높이/비율 클래스 (예: 'aspect-[16/10]', 'h-[70vh]') */
  className?: string;
  /** 패럴랙스 이동 폭(px). 클수록 강하게 움직인다. */
  strength?: number;
  placeholder?: ReactNode;
  /** 라운드 처리 */
  rounded?: string;
}

/**
 * 스크롤에 따라 이미지가 컨테이너 안에서 움직이는 패럴랙스 + 마스크 리빌.
 * 이미지를 컨테이너보다 크게 잡아(scale) 이동 시 빈 공간이 생기지 않게 한다.
 */
export default function ParallaxImage({
  src, alt, className = 'aspect-[16/10]', strength = 80,
  placeholder, rounded = 'rounded-xl',
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 1.3, ease: easeEnter }}
      className={`relative overflow-hidden bg-[#f4f6f8] ${rounded} ${className}`}
    >
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[12%]">
        <SafeImage
          src={src}
          alt={alt}
          fill
          className="absolute inset-0 object-cover"
          placeholder={placeholder}
        />
      </motion.div>
    </motion.div>
  );
}
