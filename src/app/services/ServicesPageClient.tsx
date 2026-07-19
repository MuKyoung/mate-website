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

export default function ServicesPageClient() {
  return (
    <>
      {/* ── 페이지 헤더 (dark) ── */}
      <PageHeader
        eyebrow="Our Services"
        title="개발 서비스"
        description="Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지. 고객의 니즈에 맞는 검증된 서비스를 제공합니다."
      />

      {/* ── 서비스 그리드 (light) ── */}
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#2a72e5] mb-5">
              What We Do
            </motion.span>
            <motion.h2 {...inView} variants={stagger} className="display-section text-[#0a0a0a]">
              <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">제공 서비스</motion.span></span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 개발 프로세스 (DARK 대비 밴드) ── */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-14 max-w-xl">
            <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-5">
              Our Process
            </motion.span>
            <motion.h2 {...inView} variants={stagger} className="display-section text-white mb-6">
              <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">개발 프로세스</motion.span></span>
            </motion.h2>
            <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg leading-relaxed">
              체계적인 프로세스로 고품질의 결과물을 만들어갑니다.
            </motion.p>
          </div>
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>

      {/* ── CTA (DARK) ── */}
      <section className="relative py-28 sm:py-40 bg-[#0a0a0a] border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6 justify-center">Contact</motion.span>
          <motion.h2 {...inView} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">프로젝트를 시작할</motion.span></span>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">준비가 되셨나요?</motion.span></span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg mb-10 max-w-lg mx-auto">
            게임 · 웹 · 앱 · AR/VR — 무료 상담을 통해 이야기해 보세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              무료 상담 신청
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
