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

/* 섹션 헤더 — eyebrow + 초대형 타이틀 + 더보기 */
function SectionHead({ eyebrow, title, href, more, dark = false }: {
  eyebrow: string; title: string; href?: string; more?: string; dark?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
      <div>
        <motion.span {...inView} variants={fadeUp}
          className={`eyebrow mb-5 ${dark ? 'text-[#5b9bff]' : 'text-[#2a72e5]'}`}>
          {eyebrow}
        </motion.span>
        <motion.h2 {...inView} variants={stagger} className={`display-section ${dark ? 'text-white' : 'text-[#0a0a0a]'}`}>
          <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">{title}</motion.span></span>
        </motion.h2>
      </div>
      {href && more && (
        <motion.div {...inView} variants={fadeUp}>
          <Link href={href}
            className={`group inline-flex items-center gap-2 text-sm font-medium ${dark ? 'text-white/60 hover:text-white' : 'text-[#52525b] hover:text-[#0a0a0a]'} transition-colors`}>
            {more}
            <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

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

      {/* ━━ 서비스 (light) ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Services" title="게임 · 웹 · 앱 개발" href="/services" more="모든 서비스 보기" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ 프로젝트 (surface) ━━ */}
      <section className="py-24 sm:py-32 bg-[#f5f5f5] border-y border-[#e4e4e4]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Selected Work" title="최근 프로젝트" href="/projects" more="전체 포트폴리오" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE (DARK 대비 밴드) ━━ */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-5">Why MATE</motion.span>
              <motion.h2 {...inView} variants={stagger} className="display-section text-white mb-8">
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">기획부터 배포까지,</motion.span></span>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">끝까지 함께합니다</motion.span></span>
              </motion.h2>
              <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg leading-relaxed max-w-md mb-10">
                Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                검증된 풀스택 외주개발팀입니다.
              </motion.p>
              <motion.div {...inView} variants={fadeUp}>
                <Link href="/team"
                  className="group inline-flex items-center gap-2 h-14 px-8 rounded-full text-[15px] font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
                  팀 소개 보기
                  <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <motion.div {...inView} variants={stagger} className="border-t border-white/10">
              {metrics.map((item) => (
                <motion.div key={item.label} variants={fadeUp}
                  className="flex items-start gap-6 py-6 border-b border-white/10">
                  <span className="flex-shrink-0 w-20 text-3xl font-extrabold text-white font-mono-stat tracking-tight">{item.metric}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-white mb-1">{item.label}</p>
                    <p className="text-sm on-dark-3 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ 후기 (light) ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Testimonials" title="고객 후기" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ CTA (DARK) ━━ */}
      <section className="relative py-28 sm:py-40 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6 justify-center">Let&apos;s build together</motion.span>
          <motion.h2 {...inView} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">프로젝트를</motion.span></span>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">시작해볼까요?</motion.span></span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg mb-10 max-w-lg mx-auto">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
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
