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
    <div className="bg-[#0f0f23]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              className="inline-block text-purple-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Our Services
            </motion.span>
            <h1 className="heading-lg text-white mb-6">
              전문적인 <span className="gradient-text">개발 서비스</span>
            </h1>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              고객의 비즈니스 성장을 위한 전문적인 개발 서비스를 제공합니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block text-purple-600 text-sm font-medium tracking-widest uppercase mb-4">
              Our Process
            </span>
            <h2 className="heading-md text-gray-900 mb-4">
              개발 <span className="gradient-text">프로세스</span>
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              체계적인 프로세스로 고품질의 결과물을 만들어갑니다
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-[2.25rem] sm:left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600" />

            <div className="space-y-8 sm:space-y-12">
              {sortedSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4 sm:gap-6 md:gap-8 pl-2 sm:pl-4 md:pl-0"
                >
                  {/* Timeline Dot */}
                  <motion.div 
                    className="relative z-10 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-lg shadow-purple-500/25">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <FiCheck className="text-white text-xs" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-grow pt-2 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs sm:text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                        STEP {step.order}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-[#0f0f23] relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-md text-white mb-6">
              프로젝트를 시작할 준비가 되셨나요?
            </h2>
            <p className="body-lg text-white/60 mb-8 max-w-xl mx-auto">
              무료 상담을 통해 프로젝트에 대해 이야기해 보세요
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              무료 상담 신청
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

