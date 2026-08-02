'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import ProcessTimeline from '@/components/ProcessTimeline';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

/* Flow — 아이디어에서 개발까지의 세로 진행 */
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

/* How-To — 6단계 순차 진행 */
const howTo = [
  { num: '01', label: '서비스 기획' },
  { num: '02', label: '서비스 검증' },
  { num: '03', label: 'UX/UI 디자인' },
  { num: '04', label: 'Pre-MVP 제작' },
  { num: '05', label: 'User Test' },
  { num: '06', label: '프로덕션 개발' },
];

/* 섹션 헤더 — 라벨 행 + 대형 타이틀 (page.tsx 패턴) */
function SectionHead({ num, label, title, desc }: {
  num: string; label: string; title: React.ReactNode; desc?: string;
}) {
  return (
    <div className="mb-16 sm:mb-20">
      <motion.div {...inView} variants={fadeUp}
        className="flex items-center justify-between pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-14">
        <p className="index-num">({num}) {label}</p>
      </motion.div>
      <motion.h2 {...inView} variants={fadeUp}
        className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04]"
        style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
        {title}
      </motion.h2>
      {desc && (
        <motion.p {...inView} variants={fadeUp}
          className="mt-8 max-w-xl text-lg sm:text-xl text-[#4e5968] leading-[1.7]">
          {desc}
        </motion.p>
      )}
    </div>
  );
}

export default function ServicesPageClient() {
  return (
    <>
      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Our Services"
        title="개발 서비스"
        description="Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지. 고객의 니즈에 맞는 검증된 서비스를 제공합니다."
      />

      {/* ━━ (01) Services — 호버 리스트 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="01" label="Services" title={<>제공 서비스</>} />
          <div>
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (02) Process — 헤어라인 스텝 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="02" label="개발 프로세스" title={<>Process</>}
            desc="상담부터 배포까지, 체계적인 프로세스로 고품질의 결과물을 만들어갑니다." />
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ━━ (03) Flow — 아이디어에서 개발까지 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-16 sm:mb-20">
            <motion.div {...inView} variants={fadeUp}
              className="flex items-center justify-between pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-14">
              <p className="index-num">(03) Flow</p>
            </motion.div>
            <motion.h2 {...inView} variants={stagger}
              className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span variants={clipUp} className="block">막연한 아이디어가</motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span variants={clipUp} className="block">서비스가 되기까지</motion.span>
              </span>
            </motion.h2>
          </div>

          <motion.div {...inView} variants={stagger} className="border-b border-[#e5e8eb]">
            {flow.map((s) => (
              <motion.div key={s.num} variants={fadeUp}
                className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-10 border-t border-[#e5e8eb] py-14 sm:py-20">
                <span className="index-num-lg md:col-span-2">{s.num}</span>
                <h3 className="md:col-span-5 text-[26px] sm:text-[30px] text-[#191f28] font-extrabold tracking-[-0.025em] leading-[1.2]">
                  {s.title}
                </h3>
                <p className="md:col-span-5 text-[17px] text-[#4e5968] leading-[1.75] md:pt-2">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (04) How-To — 6단계 헤어라인 그리드 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="04" label="How to" title={<>6단계로 진행합니다</>} />

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-14">
            {howTo.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="rule-top">
                <span className="index-num-lg mb-6">{s.num}</span>
                <p className="text-[17px] sm:text-[19px] font-bold text-[#191f28] tracking-[-0.02em] leading-[1.35]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (05) CTA ━━ */}
      <section className="py-32 sm:py-48 bg-white border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num mb-10">(05) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.96] mb-14 sm:mb-20"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">당신의 멋진 상상을</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">현실로 만들어보세요</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
              문의하기
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-[#4e5968] hover:text-[#191f28] border-b border-[#d1d6db] hover:border-[#191f28] pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
