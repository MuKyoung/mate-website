'use client';

import { motion } from 'framer-motion';
import HorizonGlow from '@/components/visual/HorizonGlow';
import { fadeUp, lineDraw, onMount, stagger } from '@/lib/motion';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
}

/**
 * 하위 페이지 첫 화면 - 위에서 휘어 내려오는 빛 아래에 제목과 설명.
 * 홈의 첫 화면보다 빛을 낮고 옅게 둔다.
 */
export default function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-40 pb-14 sm:pt-56 sm:pb-20">
      <HorizonGlow side="top" rim="clamp(110px, 13vw, 200px)" radius="max(120vw, 900px)" />
      <div className="container relative mx-auto px-4 sm:px-6">
        {eyebrow && (
          <div className="relative mb-12 pb-4 sm:mb-16">
            <motion.p {...onMount} variants={fadeUp} className="mono-label">
              <span className="text-white/45"><Scramble text="MATE /" /></span> <Scramble text={`${eyebrow}:`} delay={120} />
            </motion.p>
            <motion.span {...onMount} variants={lineDraw}
              className="absolute bottom-0 left-0 right-0 block h-px bg-white/[0.12]" />
          </div>
        )}
        <div className="grid items-end gap-x-8 gap-y-8 lg:grid-cols-12">
          <motion.h1 {...onMount} variants={stagger}
            className="font-medium leading-[1.02] tracking-[-0.045em] text-[var(--text-1)] lg:col-span-8"
            style={{ fontSize: 'clamp(2.5rem, 6.4vw, 5.5rem)' }}>
            <SplitText text={title} className="block" delay={0.15} />
          </motion.h1>
          <motion.p {...onMount} variants={fadeUp}
            className="text-[16px] leading-[1.7] text-white/65 sm:text-[17px] lg:col-span-4 lg:pb-3">
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
