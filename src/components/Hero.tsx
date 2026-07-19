'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowDown } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { clipUp, fadeUp, stagger, onMount, easeEnter } from '@/lib/motion';

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const ctrl = animate(0, to, {
      duration: 1.4, ease: easeEnter,
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [seen, to, suffix]);
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono-stat tracking-tight">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] on-dark-3">{label}</div>
    </div>
  );
}

const stats = [
  { to: 30, suffix: '+', label: 'Projects' },
  { to: 5, suffix: '년', label: 'Experience' },
  { to: 100, suffix: '%', label: 'Success' },
  { to: 5, suffix: '명', label: 'Experts' },
];

const marquee = ['UNITY', 'AR / VR', 'REACT', 'NEXT.JS', 'FLUTTER', 'GAME SERVER', 'UI / UX', 'SIMULATION', '개발 강의'];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* 배경 그리드/글로우 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full opacity-[0.14]"
          style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
      </div>

      <motion.div style={{ y, opacity }} className="relative flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 sm:px-6 pt-32 pb-16">
          {/* 아이브로우 */}
          <motion.span {...onMount} variants={fadeUp}
            className="eyebrow text-[#5b9bff] mb-8">
            Dev Team MATE · 외주개발 스튜디오
          </motion.span>

          {/* 초대형 헤드라인 — 라인별 클립 리빌 */}
          <motion.h1 {...onMount} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">게임 · 웹 · 앱</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">
                외주개발 <span className="text-[#5b9bff]">전문팀</span>
              </motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="max-w-xl text-lg on-dark-2 leading-relaxed mb-10">
            상상을 제품으로. Unity 게임 · AR/VR부터 웹 · 앱까지 —
            기획부터 배포까지 함께하는 5년 경력의 외주개발 파트너.
          </motion.p>

          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap gap-3">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              프로젝트 문의
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/projects"
              className="inline-flex items-center gap-2 h-14 px-8 rounded-full font-medium text-white border border-white/25 hover:border-white/60 hover:bg-white/5 transition-colors">
              포트폴리오 보기
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 통계 + 스크롤 큐 */}
      <div className="relative border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <motion.div {...onMount} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-14">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp}><Stat {...s} /></motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] on-dark-3">
            <span>Scroll</span>
            <FiArrowDown className="animate-bounce" size={14} />
          </motion.div>
        </div>
      </div>

      {/* 키워드 마퀴 */}
      <div className="relative border-t border-white/10 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marquee, ...marquee].map((k, i) => (
            <span key={i} className="mx-6 text-sm font-medium uppercase tracking-[0.18em] on-dark-3">
              {k} <span className="ml-12 text-[#5b9bff]/40">✕</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
