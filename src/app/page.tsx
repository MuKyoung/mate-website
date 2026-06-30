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
import { fadeUp, stagger, inView } from '@/lib/motion';

/* 섹션 헤더 — eyebrow + 타이틀 + 더보기 링크 */
function SectionHead({ eyebrow, title, href, more }: { eyebrow: string; title: string; href?: string; more?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <motion.div {...inView} variants={fadeUp}>
        <span className="section-label mb-2">{eyebrow}</span>
        <h2 className="heading-md">{title}</h2>
      </motion.div>
      {href && more && (
        <motion.div {...inView} variants={fadeUp}>
          <Link href={href} className="link-more group">
            {more}
            <FiArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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

      {/* ━━ 서비스 (white) ━━ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Services" title="게임 · 웹 · 앱 개발 서비스" href="/services" more="모든 서비스" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ 프로젝트 (surface) ━━ */}
      <section className="py-20 sm:py-28 bg-[#f7f7f7] border-y border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Projects" title="최근 프로젝트" href="/projects" more="전체 포트폴리오" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE (white) ━━ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div {...inView} variants={fadeUp}>
              <span className="section-label mb-3">Why Choose Us</span>
              <h2 className="heading-md mb-5">왜 MATE인가요?</h2>
              <p className="text-[#4c4c4c] text-[15px] leading-relaxed mb-8 max-w-md">
                Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                검증된 풀스택 외주개발팀입니다. 기획부터 배포까지 함께합니다.
              </p>
              <Link href="/team"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg text-[15px] font-medium text-white bg-[#262626] hover:opacity-90 transition-opacity">
                팀 소개 보기
                <FiArrowRight size={15} />
              </Link>
            </motion.div>

            <motion.div {...inView} variants={stagger} className="divide-y divide-[#e1e1e1] border-t border-[#e1e1e1]">
              {metrics.map((item) => (
                <motion.div key={item.label} variants={fadeUp}
                  className="flex items-start gap-6 py-5">
                  <span className="flex-shrink-0 w-16 text-2xl font-bold text-[#262626] font-mono-stat">{item.metric}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#262626] mb-0.5">{item.label}</p>
                    <p className="text-[13px] text-[#5d5d5d] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━ 후기 (surface) ━━ */}
      <section className="py-20 sm:py-28 bg-[#f7f7f7] border-y border-[#e1e1e1]">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Testimonials" title="고객 후기" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ CTA (다크 마케팅 밴드) ━━ */}
      <section className="bg-[#262626]">
        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <motion.div {...inView} variants={fadeUp}>
              <p className="text-xs text-white/45 uppercase tracking-[0.16em] mb-3">Contact</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                프로젝트를 시작해볼까요?
              </h2>
              <p className="text-white/55 text-[15px]">게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.</p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-lg font-medium text-white text-[15px] bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
                무료 상담 신청
                <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
