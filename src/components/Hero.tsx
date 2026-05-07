'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowDown } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

function CounterStat({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => ctrl.stop();
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y       = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { value: 30, suffix: '+', label: '완료 프로젝트' },
    { value: 5,  suffix: '년', label: '개발 경력' },
    { value: 100, suffix: '%', label: '성공률' },
    { value: 4,  suffix: '명', label: '전문 개발자' },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise"
      style={{ background: 'var(--background)' }}
    >
      {/* ── 서브틀 그리드 라인 ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* ── 중앙 미묘한 glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(59,130,246,0.06) 0%, transparent 70%)',
        }}
      />

      {/* ── 콘텐츠 ── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 w-full container mx-auto px-4 sm:px-6 pt-28 pb-16"
      >
        <div className="max-w-4xl mx-auto text-center">

          {/* 상태 배지 */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-white/[0.09] text-white/45 bg-white/[0.03] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
              외주 프로젝트 상담 가능
            </span>
          </motion.div>

          {/* MATE 타이틀 */}
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="heading-xl gradient-text leading-none tracking-tight mb-3"
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            >
              MATE
            </motion.h1>
          </div>

          {/* 외주개발팀 서브타이틀 */}
          <div style={{ overflow: 'hidden' }}>
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl font-medium text-white/40 mb-7"
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              유니티 외주개발팀
            </motion.p>
          </div>

          {/* 설명 */}
          <motion.p
            className="text-white/45 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-9"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            5년 이상의 실무 경력과 30개 이상의 프로젝트를 완료한
            <br className="hidden sm:block" />
            <span className="text-white/75 font-medium"> Unity · AR/VR · 게임 서버</span> 전문 개발팀입니다.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-sm bg-[#3b82f6] hover:bg-[#2563eb] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            >
              프로젝트 문의하기
              <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/projects"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white/55 text-sm border border-white/[0.1] hover:border-white/[0.2] hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              포트폴리오 보기
              <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.85, ease: [0.23, 1, 0.32, 1] }}
            className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-[#09090b] py-5 px-4 text-center hover:bg-[#0d0d10] transition-colors duration-200"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 font-mono-stat">
                  <CounterStat to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] text-white/30 tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="text-white/20"
        >
          <FiArrowDown size={16} />
        </motion.div>
      </motion.div>

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--background), transparent)' }} />
    </section>
  );
}
