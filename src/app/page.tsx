'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const featuredProjects = projects.slice(0, 3);

  return (
    <>
      <Hero />

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              우리의 서비스
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              고객의 비즈니스 성장을 위한 전문적인 개발 서비스를 제공합니다
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
            >
              모든 서비스 보기
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              주요 프로젝트
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center text-white hover:text-purple-300 font-semibold transition-colors"
            >
              모든 프로젝트 보기
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              고객 후기
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mate 팀과 함께한 고객들의 생생한 후기입니다
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-purple-700 to-indigo-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mate 팀의 역량
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-5 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl md:text-4xl mb-3">🎯</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">30+</div>
              <div className="text-sm md:text-base text-purple-100">완료 프로젝트</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-5 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl md:text-4xl mb-3">⏱️</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">5년</div>
              <div className="text-sm md:text-base text-purple-100">외주 개발 경력</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-5 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl md:text-4xl mb-3">👥</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">4명</div>
              <div className="text-sm md:text-base text-purple-100">전문 개발자</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center p-5 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl md:text-4xl mb-3">✅</div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm md:text-base text-purple-100">성공률</div>
            </motion.div>
          </div>
          <div className="text-center">
            <Link
              href="/team"
              className="inline-flex items-center text-white hover:text-purple-200 font-semibold transition-colors"
            >
              팀 역량 자세히 보기
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              프로젝트를 시작할 준비가 되셨나요?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              지금 바로 문의하시면 전문가가 상담해드립니다
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              문의하기
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

