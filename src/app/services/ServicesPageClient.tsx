'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import ProcessTimeline from '@/components/ProcessTimeline';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, inView } from '@/lib/motion';

export default function ServicesPageClient() {
  return (
    <>
      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Our Services"
        title="개발 서비스"
        description="Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지. 고객의 니즈에 맞는 검증된 서비스를 제공합니다."
      />

      {/* ── 서비스 그리드 (white) ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-10">
            <span className="section-label mb-2">What We Do</span>
            <h2 className="heading-md">제공 서비스</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 개발 프로세스 (surface) ── */}
      <section className="py-20 sm:py-28 bg-[#f7f7f7] border-y border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-10">
            <span className="section-label mb-2">Our Process</span>
            <h2 className="heading-md mb-3">개발 프로세스</h2>
            <p className="text-[#4c4c4c] text-[15px] leading-relaxed max-w-md">
              체계적인 프로세스로 고품질의 결과물을 만들어갑니다.
            </p>
          </motion.div>
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ── CTA (다크 마케팅 밴드) ── */}
      <section className="bg-[#262626]">
        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <motion.div {...inView} variants={fadeUp}>
              <p className="text-xs text-white/45 uppercase tracking-[0.16em] mb-3">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                프로젝트를 시작할 준비가 되셨나요?
              </h2>
              <p className="text-white/55 text-[15px]">게임 · 웹 · 앱 · AR/VR — 무료 상담을 통해 이야기해 보세요.</p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-lg font-medium text-white text-[15px] bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
                무료 상담 신청
                <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
