'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { FiArrowRight, FiCode, FiBookOpen, FiAward, FiUsers } from 'react-icons/fi';

export default function Home() {
  const featuredProjects = projects.slice(0, 3);
  const servicesRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: servicesProgress } = useScroll({
    target: servicesRef,
    offset: ["start end", "end start"]
  });

  const servicesY = useTransform(servicesProgress, [0, 1], [100, -100]);

  return (
    <>
      <Hero />

      {/* Services Section */}
      <section 
        ref={servicesRef}
        className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            style={{ y: servicesY }}
            className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <motion.span 
              className="inline-block text-purple-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Services
            </motion.span>
            <h2 className="heading-lg text-white mb-4 sm:mb-6">
              전문적인 <span className="gradient-text">개발 서비스</span>
            </h2>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              유니티 개발부터 교육까지, 고객의 니즈에 맞는 맞춤형 솔루션을 제공합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-base sm:text-lg transition-colors"
            >
              모든 서비스 자세히 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section - Why Choose Us */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #7c3aed 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <span className="inline-block text-purple-600 text-sm sm:text-base font-medium tracking-widest uppercase mb-4">
              Why Choose Us
            </span>
            <h2 className="heading-lg text-gray-900 mb-4 sm:mb-6">
              왜 <span className="gradient-text">MATE</span>여야 할까요?
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              5년 이상의 실무 경험과 30개 이상의 성공적인 프로젝트로 검증된 전문성
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { icon: FiCode, title: '전문 개발', desc: 'Unity 기반 게임, AR/VR, 시뮬레이션 개발 전문' },
              { icon: FiBookOpen, title: '체계적 교육', desc: '실무 경험 기반의 맞춤형 개발 강의 제공' },
              { icon: FiAward, title: '검증된 품질', desc: '다수의 수상 경력과 100% 프로젝트 성공률' },
              { icon: FiUsers, title: '밀착 소통', desc: '프로젝트 전 과정 투명한 커뮤니케이션' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-primary flex items-center justify-center mb-5 sm:mb-6 shadow-lg">
                    <item.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <span className="inline-block text-pink-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4">
              Featured Projects
            </span>
            <h2 className="heading-lg text-white mb-4 sm:mb-6">
              최근 <span className="gradient-text">프로젝트</span>
            </h2>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              모든 프로젝트 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237c3aed' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <span className="inline-block text-purple-600 text-sm sm:text-base font-medium tracking-widest uppercase mb-4">
              Testimonials
            </span>
            <h2 className="heading-lg text-gray-900 mb-4 sm:mb-6">
              고객 <span className="gradient-text">후기</span>
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              MATE 팀과 함께한 고객들의 생생한 경험담
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Stats Section */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1), rgba(124, 58, 237, 0.1))',
              filter: 'blur(100px)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <span className="inline-block text-cyan-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4">
              About Team
            </span>
            <h2 className="heading-lg text-white mb-4 sm:mb-6">
              <span className="gradient-text">MATE</span> 팀 소개
            </h2>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
            {[
              { emoji: '🎯', value: '30+', label: '완료 프로젝트' },
              { emoji: '⏱️', value: '5년', label: '외주 개발 경력' },
              { emoji: '👥', value: '4명', label: '전문 개발자' },
              { emoji: '✅', value: '100%', label: '성공률' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-6 sm:p-8 rounded-3xl glass border border-white/10 hover:border-purple-500/30 transition-all duration-500"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{stat.emoji}</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 text-white/70 hover:text-white font-medium text-base sm:text-lg transition-colors"
            >
              팀 역량 자세히 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-primary" />
        
        {/* Animated Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-32 h-32 border border-white/10 rotate-45"
          animate={{
            rotate: [45, 135, 45],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-lg text-white mb-4 sm:mb-6">
              프로젝트를 시작할 준비가 되셨나요?
            </h2>
            <p className="body-lg text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto">
              지금 바로 문의하시면 전문가가 무료로 상담해드립니다.
              <br className="hidden sm:block" />
              아이디어를 현실로 만들어 드리겠습니다.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-10 py-5 sm:px-12 sm:py-6 bg-white text-purple-600 rounded-full font-bold text-lg sm:text-xl shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                무료 상담 신청
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
