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
    <div className="py-8 sm:py-10">
      <div className="text-3xl sm:text-4xl font-extrabold text-[#191f28] font-mono-stat tracking-tight">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="mt-2 text-[13px] font-medium text-[#6b7684]">{label}</div>
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
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={ref} className="relative bg-white overflow-hidden">
      {/* 상단 옅은 그레이 그라데이션 — 장식 도형 없이 깊이만 */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#f4f6f8] to-white pointer-events-none" />

      <motion.div style={{ y }} className="relative">
        <div className="container mx-auto px-4 sm:px-6 pt-36 sm:pt-44 pb-16 sm:pb-24">

          <motion.p {...onMount} variants={fadeUp}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#4e5968] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6]" />
            Dev Team MATE — 게임 · 웹 · 앱 외주개발 스튜디오
          </motion.p>

          {/* 초대형 헤드라인 */}
          <motion.h1 {...onMount} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.04] mb-8 max-w-5xl"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">아이디어를 제품으로,</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">
                <span className="text-[#3182f6]">검증된 팀</span>이 만듭니다
              </motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="max-w-xl text-lg sm:text-xl text-[#4e5968] leading-[1.7] mb-10">
            Unity 게임 · AR/VR부터 웹 · 앱까지 — 기획부터 배포, 그 이후까지
            책임지는 5년 경력의 외주개발 파트너입니다.
          </motion.p>

          <motion.div {...onMount} variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_4px_14px_rgba(49,130,246,0.30)]">
              프로젝트 문의
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/projects"
              className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-[#191f28] bg-white border border-[#d1d6db] hover:bg-[#f4f6f8] transition-colors">
              포트폴리오 보기
              <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 신뢰 지표 스트립 — 헤어라인 구분 */}
      <motion.div {...onMount} variants={fadeUp} className="relative border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label}
                className={[
                  'border-[#e5e8eb] px-5 sm:px-8',
                  i % 2 === 1 ? 'border-l' : '',
                  i >= 2 ? 'border-t' : '',
                  i > 0 ? 'sm:border-l' : 'sm:border-l-0',
                  i >= 2 ? 'sm:border-t-0' : '',
                ].join(' ')}>
                <Stat {...s} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
