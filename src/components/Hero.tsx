'use client';

import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiArrowDown } from 'react-icons/fi';
import { useRef, useEffect } from 'react';
import { clipUp, fadeUp, stagger, onMount, inView, easeEnter } from '@/lib/motion';

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    if (!seen) return;
    const ctrl = animate(0, to, {
      duration: 1.6, ease: easeEnter,
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [seen, to, suffix]);
  return (
    <div className="py-10 sm:py-14">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191f28] font-mono-stat tracking-[-0.03em]">
        <span ref={ref}>0{suffix}</span>
      </div>
      <div className="mt-3 text-[13px] sm:text-[14px] font-medium text-[#6b7684]">{label}</div>
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
  // 스크롤 시 헤드라인이 크게 밀려 올라가며 사라짐
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <>
      {/* ── 풀스크린 태그라인 히어로 ── */}
      <section ref={ref} className="relative bg-white min-h-[92vh] flex flex-col justify-center overflow-hidden">
        <motion.div style={{ y, opacity, scale }} className="container mx-auto px-4 sm:px-6 pt-40 pb-24 origin-top">
          <motion.p {...onMount} variants={fadeUp}
            className="inline-flex items-center gap-2.5 text-[14px] sm:text-[15px] font-semibold text-[#4e5968] mb-10">
            <span className="w-2 h-2 rounded-full bg-[#3182f6]" />
            We are Dev Team MATE
          </motion.p>

          {/* 화면을 가득 채우는 초대형 스테이트먼트 */}
          <motion.h1 {...onMount} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.045em] leading-[0.92] mb-14"
            style={{ fontSize: 'clamp(3rem, 11vw, 11rem)' }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">With MATE,</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block">Imagination</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">becomes real</motion.span>
            </span>
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-y-10 gap-x-8 items-end">
            <motion.p {...onMount} variants={fadeUp}
              className="lg:col-span-7 text-xl sm:text-2xl lg:text-[28px] text-[#4e5968] leading-[1.6] tracking-[-0.01em]">
              게임 · 웹 · 앱 · AR/VR까지 한 팀에서.<br className="hidden sm:block" />
              기획부터 배포까지 책임지는 외주개발 스튜디오.
            </motion.p>

            <motion.div {...onMount} variants={fadeUp}
              className="lg:col-span-5 flex flex-wrap items-center gap-4 lg:justify-end">
              <Link href="/contact"
                className="group inline-flex items-center gap-3 h-16 px-10 rounded-2xl text-[17px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)]">
                문의하기
                <FiArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
              <Link href="/projects"
                className="group inline-flex items-center gap-2 text-[17px] font-bold text-[#191f28] hover:text-[#3182f6] transition-colors">
                <span className="border-b-2 border-[#191f28] group-hover:border-[#3182f6] pb-1 transition-colors">포트폴리오</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* 스크롤 큐 */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#adb5bd]">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Scroll</span>
          <FiArrowDown size={16} className="animate-bounce" />
        </motion.div>
      </section>

      {/* ── 신뢰 지표 — 큼직하게 ── */}
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
