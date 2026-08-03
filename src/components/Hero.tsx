'use client';

import { motion, AnimatePresence, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight, FiArrowDown } from 'react-icons/fi';
import { useRef, useEffect, useState, useCallback } from 'react';
import { easeEnter } from '@/lib/motion';

/* ── 글자 단위 리빌 (Splitting.js 방식) — 미세 회전 각도 포함 ── */
const charVariants = {
  hidden: { y: '118%', rotate: 8, transformOrigin: '0% 100%' },
  show: (i: number) => ({
    y: '0%', rotate: 0,
    transition: { delay: i * 0.028, duration: 0.9, ease: easeEnter },
  }),
  exit: (i: number) => ({
    y: '-118%', rotate: -6,
    transition: { delay: i * 0.012, duration: 0.45, ease: easeEnter },
  }),
};

function CharLine({ text, offset = 0, accent = false }: { text: string; offset?: number; accent?: boolean }) {
  const words = text.split(' ');
  let charIndex = offset;
  return (
    <span className="block">
      {words.map((word, wi) => {
        const chars = word.split('').map((ch) => {
          const i = charIndex++;
          return (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
              <motion.span custom={i} variants={charVariants} className="inline-block">
                {ch}
              </motion.span>
            </span>
          );
        });
        charIndex++; // 공백 몫
        return (
          <span key={wi} className={`inline-block whitespace-nowrap ${accent ? 'text-[#3182f6]' : ''}`}>
            {chars}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
    </span>
  );
}

/* ── 슬라이드 데이터 — EN 대형 + KR 캡션 ── */
const slides = [
  {
    en1: 'Ideas to Code,', en2: 'Code to Life', accent2: true,
    kr: '상상을 현실로 만드는 외주개발 스튜디오',
  },
  {
    en1: 'One Team,', en2: 'Full Cycle', accent2: true,
    kr: '기획부터 배포까지, 한 팀이 끝까지 책임집니다',
  },
  {
    en1: 'Quality,', en2: 'Proven by Work', accent2: true,
    kr: '5년간 30개 이상의 프로젝트로 증명한 품질',
  },
];

const ROTATE_MS = 6000;

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
    <div className="flex items-baseline gap-3 py-7 sm:py-9">
      <span ref={ref}
        className="font-en text-3xl sm:text-4xl font-extrabold text-[#f5f6f7] font-mono-stat tracking-[-0.02em]">
        0{suffix}
      </span>
      <span className="text-[13px] text-white/45">{label}</span>
    </div>
  );
}

const stats = [
  { to: 30, suffix: '+', label: '완료 프로젝트' },
  { to: 5, suffix: '년', label: '개발 경력' },
  { to: 100, suffix: '%', label: '성공률' },
  { to: 7, suffix: '명', label: '전문 인력' },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [index, setIndex] = useState(0);
  const goTo = useCallback((i: number) => setIndex(i % slides.length), []);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const slide = slides[index];

  return (
    <section ref={ref} className="relative bg-[#131518]">
      <motion.div style={{ y, opacity }}
        className="container mx-auto px-4 sm:px-6 min-h-[92svh] flex flex-col justify-end pt-32 pb-12 sm:pb-16">

        {/* 상단 메타 행 */}
        <div className="flex items-center justify-between pb-10 sm:pb-16">
          <p className="index-num">Game · Web · App Studio</p>
          <p className="index-num">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6] inline-block" />
            상담 가능
          </p>
        </div>

        {/* 로테이팅 스테이트먼트 — 글자 단위 리빌 (고스트 사이저로 높이 고정) */}
        <div className="mb-10 sm:mb-14 grid">
          {/* 슬라이드 전환 중 높이 붕괴로 하단 요소가 점프하지 않도록 자리를 잡는 정적 복제 */}
          <div className="invisible col-start-1 row-start-1" aria-hidden="true">
            <h1 className="font-en font-extrabold tracking-[-0.04em] leading-[1.0]"
              style={{ fontSize: 'clamp(2.5rem, 10.5vw, 10.5rem)' }}>
              <span className="block">Ideas to Code,</span>
              <span className="block">Proven by Work</span>
            </h1>
            <p className="caption-kr mt-7 sm:mt-9">— 기획부터 배포까지, 한 팀이 끝까지 책임집니다</p>
          </div>

          <div className="col-start-1 row-start-1">
            <AnimatePresence mode="wait">
              <motion.div key={index} initial="hidden" animate="show" exit="exit">
                <h1 className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[1.0]"
                  style={{ fontSize: 'clamp(2.5rem, 10.5vw, 10.5rem)' }}>
                  <CharLine text={slide.en1} />
                  <CharLine text={slide.en2} offset={slide.en1.length + 2} accent={slide.accent2} />
                </h1>
                {/* 캡션은 좌측에서 미끄러져 들어와 진입 방향을 분리 */}
                <motion.p
                  initial={{ opacity: 0, x: -44 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.55, duration: 0.85, ease: easeEnter } }}
                  exit={{ opacity: 0, x: 32, transition: { duration: 0.35, ease: easeEnter } }}
                  className="caption-kr mt-7 sm:mt-9">
                  — {slide.kr}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 하단 행 — 페이지네이션 좌 / 액션 우 */}
        <div className="flex flex-wrap items-center justify-between gap-y-8 gap-x-8">
          {/* 번호 페이지네이션 (레퍼런스 1/5 방식) */}
          <div className="flex items-center gap-5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`슬라이드 ${i + 1}`}
                className="group flex items-center gap-2.5 py-3 -my-3">
                <span className={`font-en text-[13px] font-bold tabular-nums transition-colors duration-300 ${
                  i === index ? 'text-[#f5f6f7]' : 'text-white/30 group-hover:text-white/60'
                }`}>
                  0{i + 1}
                </span>
                <span className="relative block w-10 h-px bg-white/15 overflow-hidden">
                  {i === index && (
                    <motion.span
                      key={`bar-${index}`}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                      className="absolute inset-0 bg-[#f5f6f7] origin-left" />
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-7">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
              프로젝트 문의
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <Link href="/projects"
              className="text-[15px] font-semibold text-white/70 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
              포트폴리오 보기
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 스크롤 큐 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 text-white/30 pointer-events-none">
        <span className="font-en text-[10px] font-bold tracking-[0.25em] uppercase">Scroll</span>
        <FiArrowDown size={13} className="animate-bounce" />
      </motion.div>

      {/* 지표 — 헤어라인 행 */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label}
                className={[
                  'border-white/10',
                  i % 2 === 1 ? 'border-l pl-6 sm:pl-8' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'lg:border-l lg:pl-8' : 'lg:border-l-0 lg:pl-0',
                  i >= 2 ? 'lg:border-t-0' : '',
                ].join(' ')}>
                <Stat {...s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
