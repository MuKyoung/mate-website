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

const howItWorks = [
  {
    num: '01',
    en: 'User Experience',
    kr: '검증된 기획',
    desc: '요구사항을 구조화하고 목표를 명확히 정의해, 만들기 전에 방향을 검증합니다.',
  },
  {
    num: '02',
    en: 'Design & Development',
    kr: '설계와 개발',
    desc: 'Unity · 웹 · 앱 각 분야 전문가가 브랜드 경험과 기술 구현을 동시에 책임집니다.',
  },
  {
    num: '03',
    en: 'Maintenance',
    kr: '배포와 운영',
    desc: '배포 후 모니터링과 개선까지, 프로덕트가 성장하는 과정을 함께합니다.',
  },
];

const metrics = [
  { metric: '30+', label: '완료 프로젝트', desc: 'Game · AR/VR · Web · App · Simulation' },
  { metric: '5년', label: '외주 개발 경력', desc: 'Unity · 웹/앱 전문 팀으로 검증' },
  { metric: '100%', label: '프로젝트 성공률', desc: '납기 준수와 품질 보증을 최우선' },
  { metric: '5명', label: '전문 개발자', desc: 'Unity · 웹/앱 · 서버 · UI/UX 전문가' },
];

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <Hero />

      {/* ━━ How It Works — 대형 3열 인덱스 ━━ */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-20 max-w-3xl">
            <p className="index-num mb-6">How it works</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
              막연한 아이디어를<br />검증된 프로덕트로
            </h2>
          </motion.div>

          <motion.div {...inView} variants={stagger} className="grid md:grid-cols-3 gap-x-10 gap-y-16">
            {howItWorks.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="rule-top">
                <span className="index-num-lg mb-8">{s.num}</span>
                <p className="text-[14px] font-semibold text-[#3182f6] mb-3">{s.en}</p>
                <h3 className="text-[26px] sm:text-[30px] font-extrabold text-[#191f28] mb-4 tracking-[-0.025em] leading-[1.2]">{s.kr}</h3>
                <p className="text-[16px] text-[#4e5968] leading-[1.75]">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ Our Services ━━ */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-8 mb-20">
            <div className="max-w-3xl">
              <p className="index-num mb-6">Our services</p>
              <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
                style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                필요한 개발을<br />한 팀에서 해결합니다
              </h2>
            </div>
            <Link href="/services"
              className="group inline-flex items-center gap-2 text-[16px] font-bold text-[#191f28] hover:text-[#3182f6] transition-colors">
              모든 서비스 보기
              <FiArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Portfolio — 대형 2열 쇼케이스 ━━ */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-8 mb-20">
            <div>
              <p className="index-num mb-6">Portfolio</p>
              <h2 className="display-xl">Work</h2>
            </div>
            <Link href="/projects"
              className="group inline-flex items-center gap-2 text-[16px] font-bold text-[#191f28] hover:text-[#3182f6] transition-colors pb-4">
              전체 포트폴리오
              <FiArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* 2열 대형 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20">
            {featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE — 잉크 프리미엄 패널 ━━ */}
      <section className="py-32 sm:py-44 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[32px] bg-[#191f28] px-6 py-20 sm:px-16 sm:py-28 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-16 gap-x-10">
              <div className="lg:col-span-5">
                <p className="text-[14px] font-semibold text-[#5a9cf8] mb-6">Why MATE</p>
                <motion.h2 {...inView} variants={stagger}
                  className="text-white font-extrabold tracking-[-0.035em] leading-[1.06] mb-9"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
                  <span className="block overflow-hidden pb-[0.06em]"><motion.span variants={clipUp} className="block">기획부터 배포까지,</motion.span></span>
                  <span className="block overflow-hidden pb-[0.06em]"><motion.span variants={clipUp} className="block text-white/50">끝까지 함께합니다</motion.span></span>
                </motion.h2>
                <motion.p {...inView} variants={fadeUp} className="text-[17px] text-white/65 leading-[1.75] max-w-md mb-11">
                  Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                  검증된 풀스택 외주개발팀입니다.
                </motion.p>
                <motion.div {...inView} variants={fadeUp}>
                  <Link href="/team"
                    className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-2xl text-[16px] font-bold text-[#191f28] bg-white hover:bg-[#e8f3ff] transition-colors">
                    팀 소개 보기
                    <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </motion.div>
              </div>

              <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
                {metrics.map((item) => (
                  <motion.div key={item.label} variants={fadeUp}
                    className="grid grid-cols-[6rem_1fr] sm:grid-cols-[9rem_1fr] gap-6 py-8 border-b border-white/10 first:border-t first:border-white/10">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-stat tracking-[-0.03em]">{item.metric}</span>
                    <div>
                      <p className="text-[17px] font-semibold text-white mb-1.5">{item.label}</p>
                      <p className="text-[14px] text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 후기 ━━ */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-20">
            <p className="index-num mb-6">Testimonials</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
              함께한 고객의 평가
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ 초대형 중앙 CTA ━━ */}
      <section className="py-40 sm:py-56 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-14 max-w-6xl mx-auto"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">당신의 멋진 상상을</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">현실로 만들어보세요</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-3 h-16 px-12 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
              문의하기
              <FiArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
