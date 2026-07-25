'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { clipUp, fadeUp, stagger, onMount, easeEnter } from '@/lib/motion';

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const ctrl = animate(0, to, {
      duration: 1.2, ease: easeEnter,
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [seen, to, suffix]);
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-semibold text-white font-mono-stat tracking-tight">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="mt-1.5 text-[12px] text-white/40">{label}</div>
    </div>
  );
}

const stats = [
  { to: 30, suffix: '+', label: '완료 프로젝트' },
  { to: 5, suffix: '년', label: '개발 경력' },
  { to: 100, suffix: '%', label: '프로젝트 성공률' },
  { to: 5, suffix: '명', label: '전문 개발자' },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col bg-[#0a0a0a]">
      <motion.div style={{ y }} className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 sm:px-6 pt-36 pb-20">
          <div className="grid lg:grid-cols-12 gap-y-12 gap-x-8 items-end">

            {/* 헤드라인 */}
            <div className="lg:col-span-8">
              <motion.h1 {...onMount} variants={stagger}
                className="text-white font-semibold tracking-[-0.03em] leading-[1.02]"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
                <span className="block overflow-hidden">
                  <motion.span variants={clipUp} className="block">게임 · 웹 · 앱</motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={clipUp} className="block text-white/35">외주개발 전문팀</motion.span>
                </span>
              </motion.h1>
            </div>

            {/* 우측 설명 + CTA */}
            <motion.div {...onMount} variants={fadeUp} className="lg:col-span-4 lg:pb-3">
              <p className="text-[15px] text-white/55 leading-[1.75] mb-8">
                Unity 게임 · AR/VR부터 웹 · 앱까지.
                기획부터 배포까지 함께하는 5년 경력의 외주개발 파트너입니다.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Link href="/contact"
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors">
                  프로젝트 문의
                  <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/projects"
                  className="text-[14px] text-white/55 hover:text-white transition-colors underline underline-offset-4 decoration-white/25 hover:decoration-white">
                  포트폴리오 보기
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* 통계 — 얇은 규칙선으로 구분 */}
      <motion.div {...onMount} variants={fadeUp} className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((s) => <Stat key={s.label} {...s} />)}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
