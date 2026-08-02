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

/* devigns "How It Works" 3열 패턴 */
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
  const featured = projects.slice(0, 6);

  return (
    <>
      <Hero />

      {/* ━━ How It Works — 3열 인덱스 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-16 max-w-2xl">
            <p className="index-num mb-5">How it works</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.12]"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              막연한 아이디어를<br />검증된 프로덕트로
            </h2>
          </motion.div>

          <motion.div {...inView} variants={stagger} className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {howItWorks.map((s) => (
              <motion.div key={s.num} variants={fadeUp} className="rule-top">
                <span className="index-num-lg mb-6">{s.num}</span>
                <p className="text-[13px] font-semibold text-[#3182f6] mb-2">{s.en}</p>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-[#191f28] mb-3 tracking-[-0.02em]">{s.kr}</h3>
                <p className="text-[15px] text-[#4e5968] leading-[1.75]">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ Our Services ━━ */}
      <section className="py-24 sm:py-32 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="index-num mb-5">Our services</p>
              <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em] leading-[1.12]"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
                필요한 개발을<br />한 팀에서 해결합니다
              </h2>
            </div>
            <Link href="/services"
              className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#191f28] hover:text-[#3182f6] transition-colors">
              모든 서비스 보기
              <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Portfolio 쇼케이스 — 3열 그리드 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              <p className="index-num mb-5">Portfolio</p>
              <h2 className="display-xl">Work</h2>
            </div>
            <Link href="/projects"
              className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#191f28] hover:text-[#3182f6] transition-colors pb-3">
              전체 포트폴리오
              <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ Why MATE — 잉크 프리미엄 패널 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[24px] bg-[#191f28] px-6 py-14 sm:px-14 sm:py-20 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-14 gap-x-8">
              <div className="lg:col-span-5">
                <p className="text-[13px] font-semibold text-[#5a9cf8] mb-5">Why MATE</p>
                <motion.h2 {...inView} variants={stagger}
                  className="text-white font-extrabold tracking-[-0.03em] leading-[1.12] mb-7"
                  style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
                  <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">기획부터 배포까지,</motion.span></span>
                  <span className="block overflow-hidden"><motion.span variants={clipUp} className="block text-white/55">끝까지 함께합니다</motion.span></span>
                </motion.h2>
                <motion.p {...inView} variants={fadeUp} className="text-[15px] text-white/65 leading-[1.75] max-w-md mb-9">
                  Unity 게임 · AR/VR · 웹 · 앱까지, 5년간 30개 이상의 프로젝트로
                  검증된 풀스택 외주개발팀입니다.
                </motion.p>
                <motion.div {...inView} variants={fadeUp}>
                  <Link href="/team"
                    className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[14px] font-bold text-[#191f28] bg-white hover:bg-[#e8f3ff] transition-colors">
                    팀 소개 보기
                    <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              </div>

              <motion.div {...inView} variants={stagger} className="lg:col-span-6 lg:col-start-7">
                {metrics.map((item) => (
                  <motion.div key={item.label} variants={fadeUp}
                    className="grid grid-cols-[5rem_1fr] sm:grid-cols-[7rem_1fr] gap-5 py-6 border-b border-white/10 first:border-t first:border-white/10">
                    <span className="text-xl sm:text-2xl font-extrabold text-white font-mono-stat tracking-tight">{item.metric}</span>
                    <div>
                      <p className="text-[15px] font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-[13px] text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 후기 ━━ */}
      <section className="py-24 sm:py-32 bg-[#f4f6f8] border-y border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-14">
            <p className="index-num mb-5">Testimonials</p>
            <h2 className="text-[#191f28] font-extrabold tracking-[-0.03em]"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              함께한 고객의 평가
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ 대형 중앙 CTA (devigns 패턴) ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.08] mb-10 max-w-4xl mx-auto"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.25rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">당신의 멋진 상상을</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">현실로 만들어보세요</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_4px_14px_rgba(49,130,246,0.30)]">
              문의하기
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
