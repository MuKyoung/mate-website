'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

export default function ServicesPageClient() {
  const sortedSteps = [...processSteps].sort((a, b) => a.order - b.order);

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="section-label justify-center mb-4">Our Services</span>
            <h1 className="heading-lg text-white mb-5">전문적인 개발 서비스</h1>
            <p className="body-lg text-white/40 max-w-2xl mx-auto">
              고객의 비즈니스 성장을 위한 전문적인 개발 서비스를 제공합니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20 md:py-28" style={{ background: 'var(--surface)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 sm:py-28 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="section-label justify-center" style={{ color: 'var(--accent)' }}>Our Process</span>
            <h2 className="heading-md text-gray-900 mb-4">개발 프로세스</h2>
            <p className="body-lg text-gray-500 max-w-2xl mx-auto">
              체계적인 프로세스로 고품질의 결과물을 만들어갑니다
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline 세로선 */}
            <div className="absolute left-[2.25rem] sm:left-8 md:left-12 top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-8 sm:space-y-12">
              {sortedSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                  className="relative flex items-start gap-4 sm:gap-6 md:gap-8 pl-2 sm:pl-4 md:pl-0"
                >
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#3b82f6] rounded-xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-md shadow-blue-500/15">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <FiCheck className="text-white" size={9} />
                    </div>
                  </div>

                  <div className="flex-grow pt-2 min-w-0">
                    <span className="inline-block text-[11px] font-semibold text-[#3b82f6] bg-blue-50 px-2.5 py-0.5 rounded mb-2.5 tracking-wide">
                      STEP {step.order}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ background: '#0d1117' }}>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="heading-md text-white mb-4">프로젝트를 시작할 준비가 되셨나요?</h2>
            <p className="body-lg text-white/40 mb-8 max-w-xl mx-auto">
              무료 상담을 통해 프로젝트에 대해 이야기해 보세요
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200 shadow-lg shadow-blue-500/15"
            >
              무료 상담 신청
              <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
