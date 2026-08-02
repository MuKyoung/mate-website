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
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

const metrics = [
  { metric: '30+', label: '완료 프로젝트' },
  { metric: '5년', label: '외주 개발 경력' },
  { metric: '100%', label: '프로젝트 성공률' },
  { metric: '7명', label: '개발 4 · 디자인 2 · 운영 1' },
];

/* 섹션 헤더 — 라벨 행 + 대형 타이틀 */
function SectionHead({ num, label, title, href, more }: {
  num: string; label: string; title: React.ReactNode; href?: string; more?: string;
}) {
  return (
    <div className="mb-16 sm:mb-20">
      <motion.div {...inView} variants={fadeUp}
        className="flex items-center justify-between pb-6 border-b border-[#e5e8eb] mb-10 sm:mb-14">
        <p className="index-num">({num}) {label}</p>
        {href && more && (
          <Link href={href}
            className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#191f28] hover:text-[#3182f6] transition-colors">
            {more}
            <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        )}
      </motion.div>
      <motion.h2 {...inView} variants={fadeUp}
        className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.04]"
        style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
        {title}
      </motion.h2>
    </div>
  );
}

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <Hero />

      {/* ━━ (01) Services — 호버 리스트 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="01" label="Services" href="/services" more="모든 서비스"
            title={<>필요한 개발을<br />한 팀에서 해결합니다</>} />
          <div>
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ (02) Work — 비대칭 2열 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="02" label="Selected Work" href="/projects" more="전체 포트폴리오"
            title={<>최근 프로젝트</>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
            {featured.map((p, i) => (
              <div key={p.id} className={i % 2 === 1 ? 'md:mt-28' : ''}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (03) 매니페스토 — 대형 스테이트먼트 + 지표 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp}
            className="index-num pb-6 border-b border-[#e5e8eb] mb-14 sm:mb-20">(03) Why MATE</motion.p>

          <motion.p {...inView} variants={stagger}
            className="font-extrabold text-[#191f28] tracking-[-0.035em] leading-[1.22] max-w-5xl mb-20 sm:mb-28"
            style={{ fontSize: 'clamp(1.625rem, 3.6vw, 3rem)' }}>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipUp} className="block">외주는 넘기고 끝나는 일이 아니라,</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipUp} className="block">
                <span className="text-[#3182f6]">끝까지 책임지는 파트너십</span>이라 믿습니다.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipUp} className="block text-[#c6cbd1]">
                기획부터 배포, 그 이후의 운영까지.
              </motion.span>
            </span>
          </motion.p>

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 border-t border-[#e5e8eb]">
            {metrics.map((m, i) => (
              <motion.div key={m.label} variants={fadeUp}
                className={[
                  'py-9 sm:py-12 border-[#e5e8eb]',
                  i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
                  i >= 2 ? 'lg:border-t-0' : '',
                ].join(' ')}>
                <p className="text-4xl sm:text-5xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em] mb-3">{m.metric}</p>
                <p className="text-[13px] text-[#6b7684]">{m.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (04) Testimonials — 인용 2열 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="04" label="Testimonials" title={<>함께한 고객의 평가</>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-14">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ (05) CTA ━━ */}
      <section className="py-32 sm:py-48 bg-white border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num mb-10">(05) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.96] mb-14 sm:mb-20"
            style={{ fontSize: 'clamp(2.75rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">상상을 현실로,</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">지금 시작하세요</motion.span>
            </span>
          </motion.h2>
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
              프로젝트 문의
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-[#4e5968] hover:text-[#191f28] border-b border-[#d1d6db] hover:border-[#191f28] pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
