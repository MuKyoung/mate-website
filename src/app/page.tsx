'use client';

import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect } from 'react';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import { services }     from '@/data/services';
import { projects }     from '@/data/projects';
import { testimonials } from '@/data/testimonials';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 1.5, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const ease = [0.23, 1, 0.32, 1] as const;

export default function Home() {
  const featuredProjects = projects.slice(0, 3);

  return (
    <>
      <Hero />

      {/* ━━ 서비스 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 sm:py-20 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* 섹션 헤더 — 좌우 분리 레이아웃 */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, ease }}>
              <span className="section-label mb-2">Services</span>
              <h2 className="heading-md text-white">게임 · 웹 · 앱 개발 서비스</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Link href="/services"
                className="group inline-flex items-center gap-1 text-xs font-medium text-white/30 hover:text-white/60 transition-colors">
                모든 서비스
                <FiArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ 선택 프로젝트 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 sm:py-20 border-t" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, ease }}>
              <span className="section-label mb-2">Projects</span>
              <h2 className="heading-md text-white">최근 프로젝트</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Link href="/projects"
                className="group inline-flex items-center gap-1 text-xs font-medium text-white/30 hover:text-white/60 transition-colors">
                전체 포트폴리오
                <FiArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 sm:py-20 border-t bg-[#f8f9fa]" style={{ borderColor: '#e5e7eb' }}>
        <div className="container mx-auto px-4 sm:px-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* 왼쪽 — 카피 */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
              <span className="section-label mb-3" style={{ color: '#3b82f6' }}>Why Choose Us</span>
              <h2 className="heading-md text-gray-900 mb-5">왜 MATE인가요?</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                검증된 풀스택 외주개발팀입니다. 기획부터 배포까지 함께합니다.
              </p>
              <Link href="/team"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors">
                팀 소개 보기
                <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* 오른쪽 — 지표 목록 */}
            <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {[
                { metric: '30+', label: '완료 프로젝트', desc: 'Game · AR/VR · Web · App · Simulation' },
                { metric: '5년', label: '외주 개발 경력', desc: 'Unity · 웹/앱 전문 팀으로 시작부터 검증까지' },
                { metric: '100%', label: '프로젝트 성공률', desc: '납기 준수와 품질 보증을 최우선' },
                { metric: '4명', label: '전문 개발자', desc: 'Unity · 웹/앱 · 서버 · UI/UX 각 분야 전문가' },
              ].map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease }}
                  className="flex items-start gap-6 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex-shrink-0 w-16 text-2xl font-bold text-gray-900 font-mono-stat pt-0.5">{item.metric}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 고객 후기 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 sm:py-20 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease }}
            className="mb-10">
            <span className="section-label mb-2">Testimonials</span>
            <h2 className="heading-md text-white">고객 후기</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-16 sm:py-20 border-t" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
              <p className="text-xs text-white/25 uppercase tracking-[0.18em] mb-3">Contact</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                프로젝트를 시작해볼까요?
              </h2>
              <p className="text-white/35 text-sm">게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.15, ease }}
              className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white text-sm bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200">
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
