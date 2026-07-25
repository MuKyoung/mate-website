'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import ProcessTimeline from '@/components/ProcessTimeline';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, stagger, inView } from '@/lib/motion';

export default function ServicesPageClient() {
  return (
    <>
      {/* ── 페이지 헤더 (dark) ── */}
      <PageHeader
        eyebrow="Our Services"
        title="개발 서비스"
        description="Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지. 고객의 니즈에 맞는 검증된 서비스를 제공합니다."
      />

      {/* ── 서비스 그리드 (light) — 가로 규칙선 헤더 ── */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex items-baseline gap-5 pb-6 mb-12 border-b border-[#e4e4e4]">
            <span className="text-[13px] text-[#a1a1aa]">01</span>
            <h2 className="text-[#0a0a0a] font-semibold tracking-[-0.025em]"
              style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
              제공 서비스
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 개발 프로세스 (DARK 대비 밴드) — 좌측 고정 제목 ── */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-y-12 gap-x-8">
            <div className="lg:col-span-4">
              <motion.div {...inView} variants={fadeUp} className="lg:sticky lg:top-28">
                <p className="text-[13px] text-white/35 mb-4">02 — Process</p>
                <h2 className="text-white font-semibold tracking-[-0.025em] leading-[1.1] mb-6"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                  개발 프로세스
                </h2>
                <p className="text-[15px] text-white/55 leading-[1.75] max-w-sm">
                  체계적인 프로세스로 고품질의 결과물을 만들어갑니다.
                </p>
              </motion.div>
            </div>
            <div className="lg:col-span-8">
              <ProcessTimeline steps={processSteps} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA (DARK) — 좌측 정렬 ── */}
      <section className="py-24 sm:py-32 bg-[#0a0a0a] border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] text-white/35 mb-5">Contact</p>
              <motion.h2 variants={fadeUp}
                className="text-white font-semibold tracking-[-0.03em] leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
                프로젝트를 시작할 준비가 되셨나요?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[15px] text-white/55 max-w-md">
                게임 · 웹 · 앱 · AR/VR — 무료 상담을 통해 이야기해 보세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors">
                무료 상담 신청
                <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
