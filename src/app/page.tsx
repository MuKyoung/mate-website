'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import { services } from '@/data/services';
import { projects } from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { FiArrowRight, FiCode, FiBookOpen, FiAward, FiUsers } from 'react-icons/fi';

// ── 섹션 헤더 공통 컴포넌트 ─────────────────────────────────
function SectionLabel({ text, dark = true }: { text: string; dark?: boolean }) {
  return (
    <motion.span
      className={`inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase mb-4 ${
        dark ? 'text-purple-400/70' : 'text-purple-600/70'
      }`}
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <span className="section-line-left flex-shrink-0" />
      {text}
    </motion.span>
  );
}

// ── 통계 카운터 ────────────────────────────────────────────
function CounterNum({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function Home() {
  const featuredProjects = projects.slice(0, 3);
  const servicesRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: servicesProgress } = useScroll({
    target: servicesRef,
    offset: ['start end', 'end start'],
  });
  const servicesY = useTransform(servicesProgress, [0, 1], [60, -60]);

  const whyItems = [
    { icon: FiCode, title: '전문 개발', desc: 'Unity 기반 게임, AR/VR, 시뮬레이션 개발 전문' },
    { icon: FiBookOpen, title: '체계적 교육', desc: '실무 경험 기반의 맞춤형 개발 강의 제공' },
    { icon: FiAward, title: '검증된 품질', desc: '다수의 수상 경력과 100% 프로젝트 성공률' },
    { icon: FiUsers, title: '밀착 소통', desc: '프로젝트 전 과정 투명한 커뮤니케이션' },
  ];

  const teamStats = [
    { emoji: '🎯', value: 30, suffix: '+', label: '완료 프로젝트' },
    { emoji: '⏱️', value: 5, suffix: '년', label: '외주 개발 경력' },
    { emoji: '👥', value: 4, suffix: '명', label: '전문 개발자' },
    { emoji: '✅', value: 100, suffix: '%', label: '성공률' },
  ];

  return (
    <>
      <Hero />

      {/* ── 서비스 섹션 ─────────────────────────────────────── */}
      <section
        ref={servicesRef}
        className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden scan-line-effect"
      >
        <motion.div
          style={{ y: servicesY }}
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <SectionLabel text="Our Services" dark />
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-white mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                전문적인 <span className="gradient-text">개발 서비스</span>
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-white/45 max-w-2xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              유니티 개발부터 교육까지, 고객의 니즈에 맞는 맞춤형 솔루션을 제공합니다
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12 sm:mt-14"
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 text-white/50 hover:text-white font-medium text-sm sm:text-base transition-colors hover-underline"
            >
              모든 서비스 자세히 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #7c3aed 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <SectionLabel text="Why Choose Us" dark={false} />
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-gray-900 mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                왜 <span className="gradient-text">MATE</span>여야 할까요?
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-gray-500 max-w-2xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              5년 이상의 실무 경험과 30개 이상의 성공적인 프로젝트로 검증된 전문성
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {whyItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-400 draw-border corner-cut-tr"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-br from-purple-500/[0.03] to-pink-500/[0.03]" />
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-primary flex items-center justify-center mb-5 shadow-lg card-edge-sm">
                    <item.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 프로젝트 ──────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          animate={{ y: [0, -25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <SectionLabel text="Featured Projects" dark />
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-white mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                최근 <span className="gradient-text">프로젝트</span>
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-white/45 max-w-2xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mt-12 sm:mt-14"
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-white border border-white/12 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 btn-clip-sm text-sm sm:text-base"
            >
              모든 프로젝트 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 후기 섹션 ──────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%237c3aed' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <SectionLabel text="Testimonials" dark={false} />
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-gray-900 mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                고객 <span className="gradient-text">후기</span>
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-gray-500 max-w-2xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              MATE 팀과 함께한 고객들의 생생한 경험담
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 통계 ───────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 bg-[#0f0f23] overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(124,58,237,0.07), rgba(236,72,153,0.07), rgba(124,58,237,0.07))',
            filter: 'blur(120px)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <SectionLabel text="About Team" dark />
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-white mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="gradient-text">MATE</span> 팀 소개
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-white/45 max-w-2xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto mb-12 sm:mb-14">
            {teamStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -6, borderColor: 'rgba(124,58,237,0.3)' }}
                className="group relative p-6 sm:p-8 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 card-edge-sm"
              >
                {/* top-right 코너 악센트 */}
                <motion.div
                  className="absolute top-0 right-0 w-0 h-0 border-style-solid border-[24px] border-transparent border-r-purple-500/0 border-t-purple-500/0 group-hover:border-r-pink-500/25 group-hover:border-t-pink-500/25 transition-all duration-300"
                  style={{ borderStyle: 'solid' }}
                />
                <div className="text-2xl sm:text-3xl mb-3">{stat.emoji}</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 font-mono-stat">
                  <CounterNum to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-white/40 tracking-wide uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/team"
              className="group inline-flex items-center gap-2 text-white/50 hover:text-white font-medium text-sm sm:text-base transition-colors hover-underline"
            >
              팀 역량 자세히 보기
              <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA 섹션 ──────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 noise pointer-events-none" />

        {/* 배경 도형 */}
        <motion.div
          className="absolute top-8 left-8 w-16 h-16 border border-white/15"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          animate={{ rotate: [0, 180, 360], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-8 right-8 w-24 h-24 border border-white/10"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ rotate: [45, 135, 45], scale: [1, 1.12, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-white mb-4 sm:mb-5"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              >
                프로젝트를 시작할 준비가 되셨나요?
              </motion.h2>
            </div>
            <motion.p
              className="body-lg text-white/75 mb-9 sm:mb-10 max-w-xl mx-auto"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              지금 바로 문의하시면 전문가가 무료로 상담해드립니다.
              <br className="hidden sm:block" />
              아이디어를 현실로 만들어 드리겠습니다.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 px-10 py-5 sm:px-12 sm:py-6 bg-white text-purple-600 font-bold text-base sm:text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 btn-clip"
              >
                무료 상담 신청
                <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" size={22} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
