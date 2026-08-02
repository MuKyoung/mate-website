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

/* 레퍼런스의 Vision 섹션 방식 — EN 키워드 + KR 부연 */
const values = [
  { en: 'Ownership', kr: '끝까지 책임', desc: '넘기고 끝나는 외주가 아니라, 배포 이후까지 챙기는 주인의식.' },
  { en: 'Transparency', kr: '투명한 소통', desc: '진행 상황과 이슈를 숨기지 않고 공유하는 커뮤니케이션.' },
  { en: 'Craft', kr: '품질에 대한 집착', desc: '테스트와 리뷰를 거쳐 완성도를 끌어올리는 개발 문화.' },
  { en: 'Velocity', kr: '빠른 실행', desc: '빠른 프로토타입으로 방향을 검증하고 속도를 유지합니다.' },
];

/* 섹션 헤더 — EN 라벨 행 + EN 대형 타이틀 + KR 캡션 */
function SectionHead({ num, label, title, kr, href, more }: {
  num: string; label: string; title: React.ReactNode; kr?: string; href?: string; more?: string;
}) {
  return (
    <div className="mb-16 sm:mb-20">
      <motion.div {...inView} variants={fadeUp}
        className="flex items-center justify-between pb-6 border-b border-white/10 mb-10 sm:mb-14">
        <p className="index-num font-en">({num}) {label}</p>
        {href && more && (
          <Link href={href}
            className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/70 hover:text-white transition-colors">
            {more}
            <FiArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Link>
        )}
      </motion.div>
      <motion.h2 {...inView} variants={fadeUp}
        className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.03em] leading-[1.04]"
        style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
        {title}
      </motion.h2>
      {kr && (
        <motion.p {...inView} variants={fadeUp} className="caption-kr mt-6">— {kr}</motion.p>
      )}
    </div>
  );
}

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <Hero />

      {/* ━━ (01) Services — 호버 리스트 ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="01" label="Services" href="/services" more="모든 서비스"
            title={<>What We Build</>} kr="필요한 개발을 한 팀에서 해결합니다" />
          <div>
            {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ (02) Work — 비대칭 2열 ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="02" label="Selected Work" href="/projects" more="전체 포트폴리오"
            title={<>Recent Work</>} kr="최근 프로젝트" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
            {featured.map((p, i) => (
              <div key={p.id} className={i % 2 === 1 ? 'md:mt-28' : ''}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (03) 매니페스토 + 지표 ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp}
            className="index-num font-en pb-6 border-b border-white/10 mb-14 sm:mb-20">(03) Why MATE</motion.p>

          <motion.p {...inView} variants={stagger}
            className="font-extrabold text-[#f5f6f7] tracking-[-0.035em] leading-[1.22] max-w-5xl mb-20 sm:mb-28"
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
              <motion.span variants={clipUp} className="block text-white/30">
                기획부터 배포, 그 이후의 운영까지.
              </motion.span>
            </span>
          </motion.p>

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 border-t border-white/10">
            {metrics.map((m, i) => (
              <motion.div key={m.label} variants={fadeUp}
                className={[
                  'py-9 sm:py-12 border-white/10',
                  i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
                  i >= 2 ? 'lg:border-t-0' : '',
                ].join(' ')}>
                <p className="font-en text-4xl sm:text-5xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.02em] mb-3">{m.metric}</p>
                <p className="text-[13px] text-white/45">{m.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (04) Values — EN 키워드 + KR 부연 (레퍼런스 Vision 방식) ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="04" label="Values" title={<>How We Work</>} kr="MATE가 일하는 방식" />
          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10">
            {values.map((v, i) => (
              <motion.div key={v.en} variants={fadeUp}
                className={[
                  'py-10 sm:py-12 border-white/10',
                  'border-b sm:border-b-0',
                  i % 2 === 1 ? 'sm:border-l sm:pl-8' : '',
                  i >= 2 ? 'sm:border-t lg:border-t-0' : '',
                  i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
                ].join(' ')}>
                <p className="font-en text-[13px] font-bold text-white/30 mb-6">0{i + 1}</p>
                <h3 className="font-en text-[24px] sm:text-[28px] font-extrabold text-[#f5f6f7] tracking-[-0.02em] mb-2">{v.en}</h3>
                <p className="text-[15px] font-semibold text-[#3182f6] mb-4">{v.kr}</p>
                <p className="text-[14px] text-white/50 leading-[1.75] pr-4">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (05) Testimonials ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <SectionHead num="05" label="Testimonials" title={<>Client Words</>} kr="함께한 고객의 평가" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-14">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* ━━ (06) CTA ━━ */}
      <section className="py-32 sm:py-48 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num font-en mb-10">(06) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[0.98] mb-8"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block">Let&apos;s build</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">together</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="caption-kr mb-14 sm:mb-20">
            — 당신의 멋진 상상을 현실로 만들어보세요
          </motion.p>
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
              프로젝트 문의
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-white/60 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
