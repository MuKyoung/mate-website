'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 1.4, ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);
  return (
    <div className="py-6 sm:py-7 px-5 sm:px-8 text-center sm:text-left">
      <div className="text-2xl sm:text-3xl font-bold text-[#262626] font-mono-stat mb-0.5">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="text-[11px] text-[#a3a3a3] uppercase tracking-widest">{label}</div>
    </div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const stats = [
    { to: 30,  suffix: '+', label: '완료 프로젝트' },
    { to: 5,   suffix: '년', label: '개발 경력' },
    { to: 100, suffix: '%', label: '프로젝트 성공률' },
    { to: 5,   suffix: '명', label: '전문 개발자' },
  ];

  const tags = [
    'Unity 게임 개발',
    'AR / VR 콘텐츠',
    '웹 개발 (React · Next.js)',
    '앱 개발 (Flutter · Android)',
    '개발 강의',
  ];

  return (
    <section ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--background)' }}>

      {/* 배경 구조선 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 세로 분할선 */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#e1e1e1] hidden lg:block" />
        {/* 오른쪽 패널 영역 상단 */}
        <div className="absolute top-[28%] right-0 left-1/2 h-px bg-[#e1e1e1] hidden lg:block" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 flex-1 flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 flex-1 flex flex-col pt-24 sm:pt-28 pb-0">

          {/* ── 메인 콘텐츠 ── */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-0 py-10 sm:py-14">

            {/* 왼쪽 ─ 타이포그래피 */}
            <div className="lg:w-1/2 lg:pr-16">

              {/* 로고 + 상태 */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-4 mb-10"
              >
                <Image src="/images/logo.png" alt="MATE" width={90} height={28}
                  className="h-6 w-auto" priority />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#5d5d5d] tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#058765] animate-pulse-subtle" />
                  상담 가능
                </span>
              </motion.div>

              {/* 대형 헤드라인 */}
              <div className="overflow-hidden mb-2">
                <motion.h1
                  className="font-extrabold tracking-tight text-[#262626] leading-[0.92]"
                  style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            >
              게임 · 웹 · 앱
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              className="font-extrabold tracking-tight leading-[0.92]"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: '#c6c6c6' }}
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.75, delay: 0.28, ease: [0.23, 1, 0.32, 1] }}
            >
              외주개발 전문팀
            </motion.h1>
              </div>

              {/* 설명 */}
              <motion.p
                className="text-[#4c4c4c] text-sm sm:text-base leading-relaxed mb-8 max-w-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                Unity 게임 · AR/VR부터 웹/앱까지.<br />
                5년 경력, 30개 이상의 프로젝트로 검증된 외주개발팀입니다.
              </motion.p>

              {/* CTA */}
              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.65, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link href="/contact"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white text-sm bg-[#2a72e5] hover:bg-[#0957c8] transition-colors duration-150 whitespace-nowrap">
                  프로젝트 문의
                  <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/projects"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[#262626] text-sm bg-white border border-[#c6c6c6] hover:bg-[#f7f7f7] transition-all duration-150 whitespace-nowrap">
                  포트폴리오
                  <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* 오른쪽 ─ 기술 스택 패널 */}
            <motion.div
              className="lg:w-1/2 lg:pl-16 lg:border-l"
              style={{ borderColor: 'var(--border)' }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="text-[11px] text-[#a3a3a3] uppercase tracking-[0.18em] mb-6">전문 분야</p>
              <div className="space-y-2">
                {tags.map((tag, i) => (
                  <motion.div key={tag}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="group flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-default bg-white transition-all duration-150 hover:border-[#c6c6c6] hover:bg-[#f7f7f7]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="text-sm font-medium text-[#4c4c4c] group-hover:text-[#262626] transition-colors truncate min-w-0">{tag}</span>
                    <span className="text-[10px] text-[#a3a3a3] font-mono-stat flex-shrink-0">0{i + 1}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── 통계 바 ── */}
      <motion.div
        className="relative z-10 border-t"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i}
                className={[
                  i % 2 === 1         ? 'border-l'    : '',
                  i >= 2              ? 'border-t'    : '',
                  i > 0               ? 'sm:border-l' : 'sm:border-l-0',
                  i >= 2              ? 'sm:border-t-0' : '',
                ].join(' ')}
                style={{ borderColor: 'var(--border)' }}>
                <Stat {...s} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}
