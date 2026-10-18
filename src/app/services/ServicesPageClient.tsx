'use client';

import { motion } from 'framer-motion';
import CtaSection from '@/components/ui/CtaSection';
import DomainSlabs from '@/components/DomainSlabs';
import SectionHead from '@/components/ui/SectionHead';
import HorizonGlow from '@/components/visual/HorizonGlow';
import { processSteps } from '@/data/process';
import { fadeUp, clipUp, stagger, staggerTight, inView, onMount } from '@/lib/motion';
import { container, numSquare, sectionPad } from '@/lib/styles';

export default function ServicesPageClient() {
  return (
    <>
      {/* ━━━━━━ HERO ━━━━━━ */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-56 sm:pb-24">
        <HorizonGlow side="top" rim="clamp(110px, 13vw, 200px)" radius="max(120vw, 900px)" />
        <div className={`relative ${container}`}>
          <motion.p {...onMount} variants={fadeUp} className="mono-label mb-12 border-b border-white/[0.12] pb-4 sm:mb-16">
            <span className="text-white/45">MATE /</span> Services:
          </motion.p>
          <div className="grid items-end gap-x-gutter gap-y-10 lg:grid-cols-12">
            <motion.h1 {...onMount} variants={stagger}
              className="font-medium leading-[1.02] tracking-[-0.045em] text-[var(--text-1)] lg:col-span-7"
              style={{ fontSize: 'clamp(2.5rem, 6.4vw, 5.5rem)' }}>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <motion.span variants={clipUp} className="block">세 영역을</motion.span>
              </span>
              <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                <motion.span variants={clipUp} className="block text-white/45">따로 맡습니다</motion.span>
              </span>
            </motion.h1>
            <motion.div {...onMount} variants={fadeUp} className="lg:col-span-5 lg:pb-3">
              <p className="type-h3 mb-5 text-[var(--text-1)]">영역마다 판단 기준이 다릅니다.</p>
              <p className="type-b3 text-white/65">
                웹 · 앱, 게임 · XR, 교육은 필요한 사람도 판단 기준도 다릅니다.
                그래서 영역별로 다루는 범위와 진행 방식을 따로 정리했습니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <DomainSlabs />

      {/* ━━━━━━ 공통 프로세스 - 번호 칸이 달린 다섯 장 ━━━━━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead label="Process" title={<>영역이 달라도 같은 것</>}
            desc="무엇을 만들든 진행 방식은 같습니다. 단계마다 진행 상황을 공유합니다." />

          <motion.ol {...inView} variants={staggerTight} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((s) => (
              <motion.li key={s.id} variants={fadeUp}
                className="flex min-h-[240px] flex-col border border-white/10 bg-[var(--surface)] p-6">
                <span className={`${numSquare} mb-10`}>{s.order}</span>
                <h3 className="type-h2 mb-3 text-[var(--text-1)]">{s.title}</h3>
                <p className="text-[14px] leading-[1.75] text-white/60">{s.description}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      <CtaSection line1="어느 영역이든" line2="창구는 하나입니다"
        kr="어디로 가야 할지 모르겠으면 그냥 적어 보내주셔도 됩니다" />
    </>
  );
}
