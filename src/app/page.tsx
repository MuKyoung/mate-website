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
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

const metrics = [
  { metric: '30+', label: '완료 프로젝트', desc: 'Game · AR/VR · Web · App · Simulation' },
  { metric: '5년', label: '외주 개발 경력', desc: 'Unity · 웹/앱 전문 팀으로 검증' },
  { metric: '100%', label: '프로젝트 성공률', desc: '납기 준수와 품질 보증을 최우선' },
  { metric: '5명', label: '전문 개발자', desc: 'Unity · 웹/앱 · 서버 · UI/UX 전문가' },
];

export default function Home() {
  const featured = projects.slice(0, 3);

  return (
    <>
      <Hero />

      {/* ━━ 서비스 — 좌측 고정 제목 + 우측 카드 (비대칭) ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-y-12 gap-x-8">
            <div className="lg:col-span-4">
              <motion.div {...inView} variants={fadeUp} className="lg:sticky lg:top-28">
                <p className="text-[13px] font-semibold text-[#4f46ff] mb-4">01 — Services</p>
                <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em] leading-[1.1] mb-6"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                  게임 · 웹 · 앱 개발
                </h2>
                <Link href="/services"
                  className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0f0f19] hover:text-[#4f46ff] transition-colors">
                  모든 서비스 보기
                  <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 프로젝트 — 라벤더 서피스 밴드 ━━ */}
      <section className="py-24 sm:py-32 bg-[#f4f3ff]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-baseline justify-between gap-4 mb-12">
            <div className="flex items-baseline gap-4">
              <span className="text-[13px] font-semibold text-[#4f46ff]">02</span>
              <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em]"
                style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                최근 프로젝트
              </h2>
            </div>
            <Link href="/projects"
              className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0f0f19] hover:text-[#4f46ff] transition-colors">
              전체 포트폴리오
              <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE — 볼드 블루 벤토 패널 (화이트 섹션 안에 인셋) ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[2.5rem] bg-[#4f46ff] px-6 py-14 sm:px-14 sm:py-20 relative overflow-hidden">
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-[3rem] bg-white/[0.06] rotate-12 pointer-events-none" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-y-14 gap-x-8">
              <div className="lg:col-span-5">
                <p className="text-[13px] font-semibold text-[#d4ff3d] mb-4">03 — Why MATE</p>
                <motion.h2 {...inView} variants={stagger}
                  className="text-white font-extrabold tracking-[-0.03em] leading-[1.08] mb-7"
                  style={{ fontSize: 'clamp(1.875rem, 4vw, 3.25rem)' }}>
                  <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">기획부터 배포까지,</motion.span></span>
                  <span className="block overflow-hidden"><motion.span variants={clipUp} className="block text-white/60">끝까지 함께합니다</motion.span></span>
                </motion.h2>
                <motion.p {...inView} variants={fadeUp} className="text-[15px] text-white/75 leading-[1.75] max-w-md mb-9">
                  Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                  검증된 풀스택 외주개발팀입니다.
                </motion.p>
                <motion.div {...inView} variants={fadeUp}>
                  <Link href="/team"
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-2xl text-[14px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
                    팀 소개 보기
                    <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
                {metrics.map((item) => (
                  <motion.div key={item.label} variants={fadeUp}
                    className="grid grid-cols-[5rem_1fr] sm:grid-cols-[7rem_1fr] gap-5 py-6 border-b border-white/15 first:border-t first:border-white/15">
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-mono-stat tracking-tight">{item.metric}</span>
                    <div>
                      <p className="text-[15px] font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-[13px] text-white/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 후기 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex items-baseline gap-4 mb-12">
            <span className="text-[13px] font-semibold text-[#4f46ff]">04</span>
            <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em]"
              style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
              고객 후기
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ CTA — 볼드 블루 풀블리드 (히어로와 북엔드) ━━ */}
      <section className="relative py-24 sm:py-32 bg-[#4f46ff] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] font-semibold text-white/80 mb-5">Contact</p>
              <h2 className="text-white font-extrabold tracking-[-0.035em] leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">프로젝트를 시작해볼까요?</motion.span></span>
              </h2>
              <motion.p variants={fadeUp} className="text-lg text-white/75 max-w-md">
                게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
                무료 상담 신청
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
