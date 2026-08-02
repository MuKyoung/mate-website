'use client';

import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { clipUp, fadeUp, stagger, onMount, inView, easeEnter } from '@/lib/motion';

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
  return (
    <>
      {/* ── 태그라인 히어로 ── */}
      <section className="relative bg-white pt-36 sm:pt-44 pb-20 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...onMount} variants={fadeUp}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#4e5968] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6]" />
            We are Dev Team MATE
          </motion.p>

          {/* 초대형 스테이트먼트 */}
          <motion.h1 {...onMount} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.04em] leading-[1.0] mb-10 max-w-5xl"
            style={{ fontSize: 'clamp(2.5rem, 7.5vw, 6rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">With MATE,</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">
                <span className="text-[#3182f6]">Imagination</span> becomes
              </motion.span>
            </span>
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-y-8 gap-x-8 items-end">
            <motion.p {...onMount} variants={fadeUp}
              className="lg:col-span-7 text-lg sm:text-xl text-[#4e5968] leading-[1.7]">
              게임 · 웹 · 앱 · AR/VR까지 한 팀에서. 기획부터 배포, 그 이후까지
              책임지는 5년 경력의 외주개발 스튜디오입니다.
            </motion.p>

            <motion.div {...onMount} variants={fadeUp}
              className="lg:col-span-5 flex flex-wrap items-center gap-3 lg:justify-end">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_4px_14px_rgba(49,130,246,0.30)]">
                문의하기
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/services"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-xl text-[15px] font-bold text-[#191f28] bg-white border border-[#d1d6db] hover:bg-[#f4f6f8] transition-colors">
                더 알아보기
                <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 신뢰 지표 스트립 ── */}
      <motion.div {...inView} variants={fadeUp} className="border-y border-[#e5e8eb] bg-[#f4f6f8]">
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
    </>
  );
}
