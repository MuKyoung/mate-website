'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function ServicesPageClient() {
  const sortedSteps = [...processSteps].sort((a, b) => a.order - b.order);

  return (
    <div style={{ background: 'var(--background)' }}>

      {/* ── 페이지 헤더 ── */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}>
            <span className="section-label mb-3">Our Services</span>
            <h1 className="heading-lg text-[#262626] mb-3">개발 서비스</h1>
            <p className="text-[#5d5d5d] text-sm sm:text-base max-w-lg leading-relaxed">
              Unity 게임 · AR/VR부터 웹/앱 개발, 개발 강의까지.
              고객의 니즈에 맞는 검증된 서비스를 제공합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 서비스 그리드 ── */}
      <section className="py-14 sm:py-18" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 개발 프로세스 ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="mb-10 sm:mb-12">
            <span className="section-label mb-3" style={{ color: 'var(--accent)' }}>Our Process</span>
            <h2 className="heading-md text-[#262626] mb-2">개발 프로세스</h2>
            <p className="text-[#4c4c4c] text-sm max-w-md">체계적인 프로세스로 고품질의 결과물을 만들어갑니다.</p>
          </motion.div>

          <div className="relative max-w-2xl">
            {/* 세로선 */}
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[#e1e1e1]" />

            <div className="space-y-0">
              {sortedSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="relative flex gap-6 pb-8 last:pb-0"
                >
                  {/* 번호 원 */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#2a72e5] bg-white flex items-center justify-center">
                    <span className="text-xs font-bold text-[#2a72e5] font-mono-stat">
                      {String(step.order).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="pt-1.5 pb-2">
                    <h3 className="text-sm font-semibold text-[#262626] mb-1">{step.title}</h3>
                    <p className="text-xs text-[#4c4c4c] leading-relaxed max-w-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 bg-[#262626]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.55 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">프로젝트를 시작할 준비가 되셨나요?</h2>
              <p className="text-white/60 text-sm">게임 · 웹 · 앱 · AR/VR — 무료 상담을 통해 이야기해 보세요.</p>
            </div>
            <Link href="/contact"
              className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#2a72e5] hover:bg-[#0957c8] transition-colors duration-200">
              무료 상담 신청
              <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
