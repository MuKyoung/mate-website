'use client';

import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { fadeUp, fade, stagger, inView, easeEnter } from '@/lib/motion';

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const ctrl = animate(0, to, {
      duration: 1.1, ease: easeEnter,
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [seen, to, suffix]);
  return (
    <div className="px-5 sm:px-8 py-7">
      <div className="text-2xl sm:text-3xl font-bold text-[#262626] font-mono-stat mb-1">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="text-[11px] text-[#a3a3a3] uppercase tracking-[0.14em]">{label}</div>
    </div>
  );
}

const stats = [
  { to: 30, suffix: '+', label: '완료 프로젝트' },
  { to: 5, suffix: '년', label: '개발 경력' },
  { to: 100, suffix: '%', label: '프로젝트 성공률' },
  { to: 5, suffix: '명', label: '전문 개발자' },
];

const fields = [
  { title: 'Unity 게임 개발', desc: '2D · 3D · 시뮬레이션' },
  { title: 'AR / VR 콘텐츠', desc: '몰입형 인터랙티브 경험' },
  { title: '웹 개발', desc: 'React · Next.js' },
  { title: '앱 개발', desc: 'Flutter · Android' },
  { title: '개발 강의', desc: '실무 기반 커리큘럼' },
];

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* 우측 surface 밴드 (데스크톱) */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[#f7f7f7] border-l border-[#e1e1e1] hidden lg:block" />

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-stretch">

          {/* ── 좌: 카피 ── */}
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="pt-28 sm:pt-32 lg:pt-36 pb-14 lg:pb-24 lg:pr-16"
          >
            <motion.span variants={fadeUp}
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#2a72e5] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#058765]" />
              상담 가능 · 외주 개발 파트너
            </motion.span>

            <motion.h1 variants={fadeUp}
              className="text-[clamp(2.75rem,6vw,4.75rem)] font-extrabold tracking-tight leading-[1.05] text-[#262626] mb-2">
              게임 · 웹 · 앱
            </motion.h1>
            <motion.h1 variants={fadeUp}
              className="text-[clamp(2.75rem,6vw,4.75rem)] font-extrabold tracking-tight leading-[1.05] text-[#c6c6c6] mb-7">
              외주개발 전문팀
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-[#4c4c4c] text-base leading-relaxed max-w-md mb-9">
              Unity 게임 · AR/VR부터 웹 · 앱까지. 기획부터 배포까지,
              5년 경력 · 30개 이상의 프로젝트로 검증된 외주개발팀입니다.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg font-medium text-white text-[15px] bg-[#2a72e5] hover:bg-[#0957c8] transition-colors">
                프로젝트 문의
                <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/projects"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-lg font-medium text-[#262626] text-[15px] bg-white border border-[#c6c6c6] hover:bg-[#f7f7f7] transition-colors">
                포트폴리오 보기
              </Link>
            </motion.div>
          </motion.div>

          {/* ── 우: 전문 분야 패널 (docs 스타일) ── */}
          <motion.div
            {...inView}
            variants={fadeUp}
            className="relative lg:pl-16 pb-14 lg:pb-24 lg:pt-36 flex flex-col justify-center"
          >
            <p className="text-[11px] text-[#a3a3a3] uppercase tracking-[0.16em] mb-5">전문 분야</p>
            <div className="rounded-xl border border-[#e1e1e1] bg-white overflow-hidden">
              {fields.map((f, i) => (
                <div key={f.title}
                  className={`group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#f7f7f7] ${i !== 0 ? 'border-t border-[#e1e1e1]' : ''}`}>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#262626] truncate">{f.title}</p>
                    <p className="text-[13px] text-[#5d5d5d] truncate">{f.desc}</p>
                  </div>
                  <span className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-[#a3a3a3] font-mono-stat">0{i + 1}</span>
                    <FiArrowUpRight size={15} className="text-[#c6c6c6] group-hover:text-[#2a72e5] transition-colors" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 통계 스트립 ── */}
      <motion.div {...inView} variants={fade}
        className="relative border-t border-[#e1e1e1] bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i}
                className={[
                  'border-[#e1e1e1]',
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
