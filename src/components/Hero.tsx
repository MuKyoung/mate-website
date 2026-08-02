'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
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
      <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono-stat tracking-tight">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="mt-1.5 text-[13px] font-medium text-white/60">{label}</div>
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
  const y = useTransform(scrollYProgress, [0, 1], [0, 70]);

  return (
    <section ref={ref} className="relative flex flex-col overflow-hidden bg-[#4f46ff]">
      {/* 배경 라임 도형 — 큼직하고 대담하게, 모서리 둥글게 */}
      <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
      <div className="absolute top-1/3 -right-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none hidden sm:block" />

      <motion.div style={{ y }} className="relative flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-16 sm:pb-20">

          <motion.p {...onMount} variants={fadeUp}
            className="eyebrow text-white/85 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#d4ff3d]" />
            Dev Team MATE · 외주개발 스튜디오
          </motion.p>

          {/* 초대형 헤드라인 */}
          <motion.h1 {...onMount} variants={stagger}
            className="text-white font-extrabold tracking-[-0.035em] leading-[0.98] mb-8 max-w-4xl"
            style={{ fontSize: 'clamp(2.75rem, 8.5vw, 6.5rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">게임 · 웹 · 앱</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">
                <span className="relative inline-block">
                  외주개발
                  <span className="absolute left-0 right-0 -bottom-1 sm:-bottom-2 h-3 sm:h-5 bg-[#d4ff3d] -z-10 rounded-sm" />
                </span>{' '}전문팀
              </motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="max-w-lg text-lg sm:text-xl text-white/80 leading-relaxed mb-10">
            Unity 게임 · AR/VR부터 웹 · 앱까지.
            기획부터 배포까지 함께하는 5년 경력의 외주개발 파트너입니다.
          </motion.p>

          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-4">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
              프로젝트 문의
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/projects"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-colors">
              포트폴리오 보기
              <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 통계 — 화이트 카드 라운드 밴드로 하단 마감 */}
      <motion.div {...onMount} variants={fadeUp} className="relative border-t border-white/15">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s) => <Stat key={s.label} {...s} />)}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
