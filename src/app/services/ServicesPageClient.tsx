'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import CtaSection from '@/components/ui/CtaSection';
import DomainSlabs from '@/components/DomainSlabs';
import { domains } from '@/data/domains';
import { processSteps } from '@/data/process';
import {
  fadeUp, fadeLeft, fadeRight, clipUp, lineDraw, stagger, staggerTight, inView, onMount,
} from '@/lib/motion';
import { arrowHover, container, sectionPad } from '@/lib/styles';

export default function ServicesPageClient() {
  return (
    <>
      {/* ━━━━━━ HERO ━━━━━━ */}
      <section className="pt-36 sm:pt-48 pb-16 sm:pb-24">
        <div className={container}>
          <motion.p {...onMount} variants={fadeLeft} className="index-num font-en mb-10">
            Services
          </motion.p>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 items-end">
            <motion.h1 {...onMount} variants={stagger}
              className="lg:col-span-7 font-bold text-[var(--text-1)] tracking-[-0.02em] leading-[1.06]"
              style={{ fontSize: 'clamp(2.25rem, 6.2vw, 5.25rem)' }}>
              <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <motion.span variants={clipUp} className="block">세 영역을</motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <motion.span variants={clipUp} className="block text-white/25">따로 맡습니다</motion.span>
              </span>
            </motion.h1>
            <motion.div {...onMount} variants={fadeRight} className="lg:col-span-5 lg:pb-4">
              <p className="type-h3 text-[var(--text-1)] leading-[1.45] mb-6">
                영역마다 판단 기준이 다릅니다.
              </p>
              <p className="type-b3 text-white/55 leading-[1.85]">
                웹 · 앱, 게임 · XR, 교육은 필요한 사람도 판단 기준도 다릅니다.
                그래서 영역별로 다루는 범위와 진행 방식을 따로 정리했습니다.
              </p>
            </motion.div>
          </div>
          <motion.div {...onMount} variants={lineDraw} className="h-px bg-white/10 mt-16 sm:mt-24 origin-left" />
        </div>
      </section>

      <DomainSlabs />

      {/* ━━━━━━ 공통 프로세스 ━━━━━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-8 mb-16 sm:mb-20">
            <motion.p {...inView} variants={fadeLeft} className="lg:col-span-3 index-num font-en">
              Process
            </motion.p>
            <div className="lg:col-span-9">
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)] mb-5">
                영역이 달라도 같은 것
              </motion.h2>
              <motion.p {...inView} variants={fadeRight} className="type-b3 text-white/50 max-w-xl leading-[1.85]">
                무엇을 만들든 진행 방식은 동일합니다. 각 단계가 끝날 때마다 확인할 수 있는 결과물을 드립니다.
              </motion.p>
            </div>
          </div>

          <motion.div {...inView} variants={staggerTight}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-white/10">
            {processSteps.map((s, i) => (
              <motion.div key={s.id} variants={fadeUp}
                className={[
                  'py-9 sm:py-12 border-b border-white/10',
                  i % 2 === 1 ? 'sm:border-l sm:pl-7' : '',
                  i > 0 ? 'lg:border-l lg:pl-7' : 'lg:border-l-0 lg:pl-0',
                  'border-white/10',
                ].join(' ')}>
                <p className="index-num-lg font-en mb-6">0{s.order}</p>
                <h3 className="type-b1 text-[var(--text-1)] mb-3">{s.title}</h3>
                <p className="type-c1 text-white/45 leading-[1.8] pr-4">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CtaSection num="05" line1="어느 영역이든" line2="창구는 하나입니다"
        kr="어디로 가야 할지 모르겠으면 그냥 적어 보내주셔도 됩니다" />
    </>
  );
}
