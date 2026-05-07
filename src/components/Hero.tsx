'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

// ── 카운터 숫자 애니메이션 컴포넌트 ────────────────────────
function CounterStat({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.55], [1, 0.94]);

  const stats = [
    { value: 30, suffix: '+', label: '완료 프로젝트' },
    { value: 5, suffix: '년', label: '개발 경력' },
    { value: 100, suffix: '%', label: '성공률' },
    { value: 4, suffix: '명', label: '전문 개발자' },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080812] noise scan-line-effect"
      style={{ isolation: 'isolate' }}
    >
      {/* ── 배경 그라디언트 오브 ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.18),transparent)]" />

        <motion.div
          className="absolute top-[15%] left-[20%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
          animate={{ x: [0, -40, 0], y: [0, 35, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        />
      </div>

      {/* ── 도트 그리드 패턴 ── */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* ── 수평 글로우 라인 ── */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ top: '46%', background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.25) 30%, rgba(236,72,153,0.25) 70%, transparent 100%)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2.2, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* ── 메인 콘텐츠 ── */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto text-center">

          {/* 배지 */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="mb-8 sm:mb-10"
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium text-white/50 border border-white/[0.08]">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              외주 프로젝트 상담 가능
            </span>
          </motion.div>

          {/* MATE 타이틀 — clip 리빌 */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              className="heading-xl gradient-text leading-none mb-3 sm:mb-4"
              initial={{ y: '105%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              MATE
            </motion.div>
          </div>

          {/* 외주개발팀 — clip 리빌 (딜레이) */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white/60 mb-6 sm:mb-8"
              initial={{ y: '105%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.52, ease: [0.23, 1, 0.32, 1] }}
            >
              외주개발팀
            </motion.div>
          </div>

          {/* 설명 — blur fade */}
          <motion.p
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.23, 1, 0.32, 1] }}
            className="body-lg text-white/45 mb-9 sm:mb-11 max-w-2xl mx-auto"
          >
            유니티 외주 개발과 개발 강의에 특화된 전문 팀.
            <br className="hidden sm:block" />
            <span className="text-white/80 font-medium">5년 이상의 경력</span>과{' '}
            <span className="text-white/80 font-medium">30+ 프로젝트</span>를 성공적으로 완료했습니다.
          </motion.p>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary — clip corner */}
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 font-semibold text-white text-sm sm:text-base overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto btn-clip"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-pink-500 to-purple-600" />
              <span className="relative flex items-center gap-2">
                프로젝트 문의하기
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Secondary — clip corner outline */}
            <Link
              href="/projects"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 font-semibold text-white/60 text-sm sm:text-base border border-white/12 hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto btn-clip"
            >
              포트폴리오 보기
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* 스탯 카드 — 카운터 + clip corner */}
          <div className="mt-14 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 1.3 + i * 0.07,
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{ y: -4, borderColor: 'rgba(124,58,237,0.35)' }}
                className="text-center py-5 px-3 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 card-edge-sm"
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text font-mono-stat">
                  <CounterStat to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] sm:text-xs text-white/35 mt-1 tracking-wider uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 스크롤 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/25 font-mono">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-white/25 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#0f0f23] to-transparent pointer-events-none" />
    </section>
  );
}
