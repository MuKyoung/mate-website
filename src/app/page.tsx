'use client';

import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, type ReactNode } from 'react';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import { services }     from '@/data/services';
import { projects }     from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { FiArrowRight, FiCode, FiBookOpen, FiAward, FiUsers } from 'react-icons/fi';

// ── 공통 섹션 헤더 ─────────────────────────────────────
function SectionHeader({
  label, title, desc, dark = true,
}: { label: string; title: ReactNode; desc: string; dark?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="text-center mb-12 sm:mb-16"
    >
      <span className="section-label justify-center">{label}</span>
      <div style={{ overflow: 'hidden' }}>
        <motion.h2
          className={`heading-lg mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}
          initial={{ y: '100%' }}
          whileInView={{ y: '0%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
        >
          {title}
        </motion.h2>
      </div>
      <motion.p
        className={`body-lg max-w-xl mx-auto ${dark ? 'text-white/40' : 'text-gray-500'}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}

// ── 카운터 ───────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 1.6, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function Home() {
  const featuredProjects = projects.slice(0, 3);

  const whyItems = [
    { icon: FiCode,     title: '전문 개발',  desc: 'Unity 기반 게임·AR/VR·시뮬레이션 개발 전문' },
    { icon: FiBookOpen, title: '체계적 교육', desc: '실무 경험 기반의 맞춤형 개발 강의 제공' },
    { icon: FiAward,    title: '검증된 품질', desc: '다수의 수상 경력과 100% 프로젝트 성공률' },
    { icon: FiUsers,    title: '밀착 소통',   desc: '프로젝트 전 과정 투명한 커뮤니케이션' },
  ];

  const teamStats = [
    { value: 30,  suffix: '+', label: '완료 프로젝트' },
    { value: 5,   suffix: '년', label: '개발 경력' },
    { value: 4,   suffix: '명', label: '전문 개발자' },
    { value: 100, suffix: '%', label: '성공률' },
  ];

  return (
    <>
      <Hero />

      {/* ── 서비스 ────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden noise"
        style={{ background: 'var(--surface)' }}>
        {/* 상단 구분선 */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />

        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            label="Services"
            title="전문적인 개발 서비스"
            desc="유니티 개발부터 교육까지, 고객의 니즈에 맞는 맞춤형 솔루션을 제공합니다"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link href="/services"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/40 hover:text-white/70 transition-colors hover-underline">
              모든 서비스 보기
              <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 bg-[#f8f9fa] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader dark={false}
            label="Why Choose Us"
            title="왜 MATE여야 할까요?"
            desc="5년 이상의 실무 경험과 30개 이상의 성공적인 프로젝트로 검증된 전문성"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {whyItems.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -4 }}
                className="group p-6 sm:p-7 bg-white rounded-xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <item.icon className="text-[#3b82f6]" size={18} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 프로젝트 ──────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden noise"
        style={{ background: 'var(--background)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />

        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            label="Featured Projects"
            title="최근 프로젝트"
            desc="다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }} className="text-center mt-10">
            <Link href="/projects"
              className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white/55 border border-white/[0.1] hover:border-white/[0.2] hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200">
              모든 프로젝트 보기
              <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 후기 ─────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader dark={false}
            label="Testimonials"
            title="고객 후기"
            desc="MATE 팀과 함께한 고객들의 생생한 경험담"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 통계 ──────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden noise"
        style={{ background: 'var(--surface)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--border)' }} />

        <div className="container mx-auto px-4 sm:px-6">
          <SectionHeader
            label="About Team"
            title="MATE 팀 소개"
            desc="유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다"
          />

          {/* 스탯 그리드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06] max-w-4xl mx-auto mb-10">
            {teamStats.map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="py-8 px-6 text-center hover:bg-white/[0.025] transition-colors duration-200"
                style={{ background: 'var(--surface)' }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1.5 font-mono-stat">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/30 tracking-wider uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }} className="text-center">
            <Link href="/team"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/40 hover:text-white/70 transition-colors hover-underline">
              팀 역량 자세히 보기
              <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden noise"
        style={{ background: '#0d1117' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="heading-lg text-white mb-4"
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
              >
                프로젝트를 시작할 준비가 되셨나요?
              </motion.h2>
            </div>
            <motion.p
              className="text-white/40 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              지금 바로 문의하시면 전문가가 무료로 상담해드립니다.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <Link href="/contact"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white text-base bg-[#3b82f6] hover:bg-[#2563eb] transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20">
                무료 상담 신청
                <FiArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
