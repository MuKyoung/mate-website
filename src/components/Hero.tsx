'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { clipUp, fadeUp, stagger, onMount, inView, easeEnter } from '@/lib/motion';

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
        className="text-3xl sm:text-4xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]">
        0{suffix}
      </span>
      <span className="text-[13px] text-[#6b7684]">{label}</span>
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
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative bg-white">
      <motion.div style={{ y, opacity }}
        className="container mx-auto px-4 sm:px-6 min-h-[88svh] flex flex-col justify-end pt-32 pb-14 sm:pb-20">

        {/* 상단 메타 행 */}
        <motion.div {...onMount} variants={fadeUp}
          className="flex items-center justify-between pb-10 sm:pb-14">
          <p className="index-num">Game · Web · App Studio</p>
          <p className="index-num">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6] inline-block" />
            상담 가능
          </p>
        </motion.div>

        {/* 초대형 스테이트먼트 */}
        <motion.h1 {...onMount} variants={stagger}
          className="text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.94] mb-12 sm:mb-16"
          style={{ fontSize: 'clamp(2.625rem, 12vw, 12rem)' }}>
          {/* pb/-mb 보정 — 라틴 디센더(g)가 클립되지 않게 여유를 주되 행간은 유지 */}
          <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
            <motion.span variants={clipUp} className="block">With MATE,</motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
            <motion.span variants={clipUp} className="block">
              Imagination<span className="text-[#3182f6]">.</span>
            </motion.span>
          </span>
        </motion.h1>

        {/* 하단 행 — 설명 좌 / 액션 우 */}
        <motion.div {...onMount} variants={fadeUp}
          className="grid lg:grid-cols-12 gap-y-8 gap-x-8 items-end">
          <p className="lg:col-span-6 text-lg sm:text-xl text-[#4e5968] leading-[1.65] max-w-xl">
            게임 · 웹 · 앱 · AR/VR까지 한 팀에서.
            기획부터 배포까지 책임지는 외주개발 스튜디오입니다.
          </p>
          <div className="lg:col-span-6 flex flex-wrap items-center gap-7 lg:justify-end">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
              프로젝트 문의
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <Link href="/projects"
              className="text-[15px] font-semibold text-[#191f28] border-b border-[#191f28]/30 hover:border-[#191f28] pb-0.5 transition-colors">
              포트폴리오 보기
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* 지표 — 헤어라인 행 */}
      <motion.div {...inView} variants={fadeUp} className="border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label}
                className={[
                  'border-[#e5e8eb]',
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
      </motion.div>
    </section>
  );
}
