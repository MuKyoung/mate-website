'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import ProcessTimeline from '@/components/ProcessTimeline';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

/* devigns Flow 패턴 — 아이디어에서 개발까지의 세로 진행 */
const flow = [
  {
    num: '01',
    title: '막연한 아이디어',
    desc: '머릿속에만 있던 구상을 함께 정리합니다. 목표와 사용자, 꼭 필요한 기능을 대화로 끌어내 문서로 남깁니다.',
  },
  {
    num: '02',
    title: '서비스 기획 · 디벨롭',
    desc: '핵심 기능과 우선순위를 정하고, 플랫폼과 기술 스택을 선택해 실행 가능한 범위로 다듬습니다.',
  },
  {
    num: '03',
    title: 'UX/UI 디자인',
    desc: '화면 흐름과 인터랙션을 설계합니다. 만들기 전에 화면으로 확인하며 방향을 맞춥니다.',
  },
  {
    num: '04',
    title: '검증 및 개발',
    desc: 'Unity · 웹 · 앱 각 영역의 개발자가 구현하고, 테스트와 피드백을 반복하며 완성도를 높입니다.',
  },
];

/* devigns How-To 패턴 — 6단계 순차 진행 */
const howTo = [
  { num: '01', label: '서비스 기획' },
  { num: '02', label: '서비스 검증' },
  { num: '03', label: 'UX/UI 디자인' },
  { num: '04', label: 'Pre-MVP 제작' },
  { num: '05', label: 'User Test' },
  { num: '06', label: '프로덕션 개발' },
];

export default function ServicesPageClient() {
  return (
    <>
      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Our Services"
        title="개발 서비스"
        description="Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지. 고객의 니즈에 맞는 검증된 서비스를 제공합니다."
      />

      {/* ━━ 서비스 그리드 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-14 max-w-2xl">
            <p className="index-num mb-5">Services</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.12]"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              제공 서비스
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 개발 프로세스 — 01–05 인덱스 ━━ */}
      <section className="py-24 sm:py-32 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6 mb-16">
            <div>
              <p className="index-num mb-5">개발 프로세스</p>
              <h2 className="display-xl">Process</h2>
            </div>
            <p className="max-w-sm text-[15px] text-[#4e5968] leading-[1.75] lg:pb-3">
              상담부터 배포까지, 체계적인 프로세스로 고품질의 결과물을 만들어갑니다.
            </p>
          </motion.div>

          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ━━ Flow — 아이디어에서 개발까지 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={stagger} className="mb-14 max-w-2xl">
            <motion.p variants={fadeUp} className="index-num mb-5">Flow</motion.p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.12]"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              <span className="block overflow-hidden">
                <motion.span variants={clipUp} className="block">막연한 아이디어가</motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span variants={clipUp} className="block">서비스가 되기까지</motion.span>
              </span>
            </h2>
          </motion.div>

          <motion.div {...inView} variants={stagger} className="border-b border-[#e5e8eb]">
            {flow.map((s) => (
              <motion.div key={s.num} variants={fadeUp}
                className="grid grid-cols-1 md:grid-cols-12 gap-y-4 gap-x-8 border-t border-[#e5e8eb] py-10 sm:py-12">
                <span className="index-num-lg md:col-span-2">{s.num}</span>
                <h3 className="md:col-span-5 text-[#191f28] font-extrabold tracking-[-0.025em] leading-[1.2]"
                  style={{ fontSize: 'clamp(1.375rem, 2.4vw, 2rem)' }}>
                  {s.title}
                </h3>
                <p className="md:col-span-5 text-[15px] text-[#4e5968] leading-[1.75] md:pt-1.5">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ How-To — 6단계 ━━ */}
      <section className="py-24 sm:py-32 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-14 max-w-2xl">
            <p className="index-num mb-5">How to</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.12]"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              6단계로 진행합니다
            </h2>
          </motion.div>

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-8">
            {howTo.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="rule-top">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e8f3ff] text-[13px] font-bold text-[#3182f6] font-mono-stat mb-4">
                  {s.num}
                </span>
                <p className="text-[15px] font-bold text-[#191f28] tracking-[-0.02em]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ 대형 중앙 CTA (devigns 패턴) ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.08] mb-10 max-w-4xl mx-auto"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.25rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">당신의 멋진 상상을</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">현실로 만들어보세요</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_4px_14px_rgba(49,130,246,0.30)]">
              문의하기
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
