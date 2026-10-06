'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowUpRight, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { projects } from '@/data/projects';
import {
  gameCapabilities, gamePlatforms, gamePipeline, gameCredentials, domainByKey,
} from '@/data/domains';
import { fadeUp, fadeLeft, fadeRight, clipUp, maskUp, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import { arrowHover, container, linkUnderline, CONTACT_EMAIL } from '@/lib/styles';

const d = domainByKey.game;
const work = projects.filter((p) => p.category === 'Game Application' || p.category === 'VR Application');
const reel = work.filter((p) => p.thumbnail);

const credentials = gameCredentials;

export default function GameClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // 히어로 배경만 느리게 밀려 시차를 만든다
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  const nudge = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  return (
    <div data-domain="game">

      {/* ━━━━━━ HERO — 풀블리드 이미지 위 중앙 정렬 ━━━━━━ */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
          <SafeImage src="/images/projects/영창하세요마법사님.webp" alt="" fill className="absolute inset-0" />
        </motion.div>
        {/* 비네트 — 상하단을 캔버스로 녹여 헤더/다음 섹션과 이어 붙인다 */}
        <div className="absolute inset-0" style={{ background: 'var(--canvas)', opacity: 0.66 }} />
        {/* 타이포가 앉는 중앙만 한 겹 더 눌러 글자를 띄운다 */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(58% 42% at 50% 42%, rgba(14,17,23,0.78) 0%, transparent 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 82% at 50% 42%, transparent 0%, var(--canvas) 84%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-56"
          style={{ background: 'linear-gradient(180deg, transparent, var(--canvas))' }} />
        {/* 바이올렛 글로우 */}
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-[min(620px,90vw)] aspect-square rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 66%)' }} />

        <motion.div style={{ y: titleY }} className={`relative ${container} text-center`}>
          <motion.p {...onMount} variants={fadeUp} className="index-num font-en justify-center mb-9">
            Game &amp; XR Development
          </motion.p>

          <motion.h1 {...onMount} variants={stagger}
            className="font-en font-extrabold text-[var(--text-1)] tracking-[-0.045em] leading-[0.92] mb-10"
            style={{ fontSize: 'clamp(3rem, 11vw, 9.5rem)' }}>
            <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <motion.span variants={clipUp} className="block">PLAYABLE</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <motion.span variants={clipUp} className="block text-[var(--accent)]">FIRST</motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="type-h3 text-white/70 max-w-2xl mx-auto leading-[1.5] mb-14">
            {d.lead}
          </motion.p>

          <motion.div {...onMount} variants={fadeUp}
            className="inline-flex flex-wrap items-center justify-center divide-x divide-white/15 border-y border-white/15">
            {d.stats.map((s) => (
              <div key={s.label} className="px-8 sm:px-12 py-6">
                <p className="font-en text-[30px] sm:text-[38px] font-extrabold text-[var(--text-1)] font-mono-stat leading-none mb-2.5">
                  {s.value}
                </p>
                <p className="type-c2 text-white/45">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━━━━ REEL — 썸네일 마퀴 ━━━━━━ */}
      <section className="py-14 sm:py-20 overflow-hidden border-y border-white/10">
        <div className="flex gap-4 animate-marquee w-max">
          {[...reel, ...reel].map((p, i) => (
            <div key={`${p.id}-${i}`}
              className="relative w-[240px] sm:w-[320px] aspect-[16/10] rounded-[10px] overflow-hidden shrink-0 border border-white/10">
              <SafeImage src={p.thumbnail} alt={p.title} fill className="absolute inset-0" />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(0deg, var(--canvas), transparent 62%)' }} />
              <p className="absolute bottom-3 left-4 right-4 type-c1 font-bold text-white/85 truncate">{p.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━ CAPABILITIES — 가로 스크롤 레일 ━━━━━━ */}
      <section className="py-24 sm:py-36">
        <div className={`${container} mb-12 sm:mb-16`}>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">What We Make</motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)]">
                만드는 것들
              </motion.h2>
            </div>
            <motion.div {...inView} variants={fadeRight} className="hidden sm:flex items-center gap-3">
              <button onClick={() => nudge(-1)} aria-label="이전"
                className="w-12 h-12 rounded-full border border-white/15 text-white/60 hover:text-[var(--text-1)] hover:border-white/45 transition-colors flex items-center justify-center">
                <FiArrowLeft size={17} />
              </button>
              <button onClick={() => nudge(1)} aria-label="다음"
                className="w-12 h-12 rounded-full border border-white/15 text-white/60 hover:text-[var(--text-1)] hover:border-white/45 transition-colors flex items-center justify-center">
                <FiArrowRight size={17} />
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div {...inView} variants={fadeUp}
          ref={railRef}
          className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{
            // 첫 카드를 컨테이너 정렬선에 붙이고, 오른쪽으로는 화면 밖까지 흐르게 둔다
            paddingLeft: 'max(1rem, calc((100vw - 1500px) / 2 + 1.5rem))',
            paddingRight: '1rem',
          }}>
          {gameCapabilities.map((c) => (
            <article key={c.id}
              className="group snap-start shrink-0 w-[300px] sm:w-[380px] rounded-[12px] border border-white/10
                         bg-[var(--surface)] p-8 sm:p-10 flex flex-col
                         hover:border-[var(--accent)] transition-colors duration-300">
              <p className="index-num-lg font-en mb-9">{c.no}</p>
              <h3 className="font-en text-[26px] sm:text-[30px] font-extrabold text-[var(--text-1)] tracking-[-0.025em] leading-none mb-2.5">
                {c.en}
              </h3>
              <p className="type-b3 text-[var(--accent)] mb-6">{c.kr}</p>
              <p className="type-b3 text-white/50 leading-[1.85] mb-9 flex-1">{c.desc}</p>
              <div className="flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="type-c2 px-3 py-1.5 rounded-[6px] bg-white/[0.06] text-white/60">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </motion.div>
      </section>

      {/* ━━━━━━ PLATFORMS ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">Platforms</motion.p>
          <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)] mb-16 sm:mb-20">
            빌드가 올라가는 곳
          </motion.h2>
          <motion.div {...inView} variants={staggerTight} className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/10">
            {gamePlatforms.map((p, i) => (
              <motion.div key={p.name} variants={fadeUp}
                className={[
                  'py-10 sm:py-14 border-b border-white/10',
                  i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-8' : '',
                ].join(' ')}>
                <h3 className="font-en text-[30px] sm:text-[40px] font-extrabold text-[var(--text-1)] tracking-[-0.03em] leading-none mb-4">
                  {p.name}
                </h3>
                <p className="type-c1 text-white/45 font-en">{p.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ PIPELINE — 좌측 라인 진행 ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-14">
            <div className="lg:col-span-4">
              <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">Pipeline</motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)] mb-7">
                만드는 순서
              </motion.h2>
              <motion.p {...inView} variants={fadeLeft} className="type-b3 text-white/50 leading-[1.85] max-w-sm">
                게임은 문서로 재미를 증명할 수 없습니다. 그래서 두 번째 단계에서 이미
                플레이 가능한 빌드를 만들고, 거기서부터 판단합니다.
              </motion.p>
            </div>

            <motion.ol {...inView} variants={staggerTight} className="lg:col-span-8 relative">
              <span className="absolute left-[19px] top-3 bottom-3 w-px bg-white/10" aria-hidden />
              {gamePipeline.map((s) => (
                <motion.li key={s.no} variants={fadeRight} className="relative pl-16 pb-12 last:pb-0">
                  <span className="absolute left-0 top-0 w-10 h-10 rounded-full border border-[var(--accent)]
                                   bg-[var(--canvas)] flex items-center justify-center
                                   type-c1 font-bold font-en text-[var(--accent)]">
                    {s.no}
                  </span>
                  <h3 className="type-h2 text-[var(--text-1)] mb-3">{s.title}</h3>
                  <p className="type-b3 text-white/50 leading-[1.85] max-w-xl">{s.desc}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ━━━━━━ WORK — 비대칭 매거진 그리드 ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-16 sm:mb-20">
            <div>
              <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">Selected Work</motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)]">
                Shipped Titles
              </motion.h2>
            </div>
            <motion.div {...inView} variants={fadeRight}>
              <Link href="/projects" className="group inline-flex items-center gap-1.5 type-b4 text-white/70 hover:text-gray-50 transition-colors">
                전체 포트폴리오
                <FiArrowUpRight size={15} className={arrowHover} />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-x-gutter gap-y-14">
            {work.map((p, i) => {
              // 한 줄 = 큰 카드(4칸) + 작은 카드(2칸). 4개 주기로 0,3,4,7…에 큰 카드를 두면
              // 큰 카드가 좌우로 지그재그하면서 6칸이 줄마다 정확히 떨어진다.
              const big = i % 4 === 0 || i % 4 === 3;
              return (
                <motion.article key={p.id} {...inView} variants={fadeUp}
                  className={`group ${big ? 'md:col-span-4' : 'md:col-span-2'}`}>
                  <Link href={`/projects/${p.id}`} className="block">
                    <motion.div variants={maskUp}
                      className={`relative overflow-hidden rounded-[10px] bg-[var(--surface)] mb-6
                                  ${big ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <SafeImage src={p.thumbnail} alt={p.title} fill
                        className="absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                        placeholder={<ThumbFallback label={p.category} />} />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: 'linear-gradient(180deg, transparent 40%, var(--accent-tint))' }} />
                    </motion.div>
                    <div className="flex items-start justify-between gap-5">
                      <h3 className={`font-extrabold text-[var(--text-1)] tracking-[-0.025em] leading-[1.2]
                                      transition-colors duration-300 group-hover:text-[var(--accent)]
                                      ${big ? 'text-[26px] sm:text-[34px]' : 'text-[20px] sm:text-[23px]'}`}>
                        {p.title}
                      </h3>
                      <p className="index-num pt-2 whitespace-nowrap shrink-0">{p.durationMonths}개월</p>
                    </div>
                    <p className="mt-2.5 type-b3 text-white/50 leading-[1.7] line-clamp-2">{p.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="type-c2 px-2.5 py-1 rounded-[5px] bg-white/[0.05] text-white/45 font-en">{t}</span>
                      ))}
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━ CREDENTIALS — 전시·수상 ━━━━━━ */}
      {credentials.length > 0 && (
        <section className="py-24 sm:py-36 border-t border-white/10">
          <div className={container}>
            <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">Credentials</motion.p>
            <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)] mb-16 sm:mb-20">
              밖에서 받은 평가
            </motion.h2>
            <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
              {credentials.map((a) => (
                <motion.div key={a.id} variants={rowIn}
                  className="grid grid-cols-12 gap-x-gutter gap-y-2 py-6 sm:py-7 border-b border-white/10 items-baseline">
                  <p className="col-span-12 sm:col-span-2 font-en type-b2 text-white/35 font-mono-stat">{a.year}</p>
                  <h3 className="col-span-12 sm:col-span-5 type-b1 text-[var(--text-1)]">{a.title}</h3>
                  <p className="col-span-6 sm:col-span-3 type-b3 text-white/45">{a.organization}</p>
                  <p className="col-span-6 sm:col-span-2 type-b4 text-[var(--accent)] sm:text-right">{a.rank}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ━━━━━━ CTA — 풀블리드 컬러 밴드 ━━━━━━ */}
      <section className="relative py-28 sm:py-44 overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(90% 100% at 50% 100%, var(--accent-tint) 0%, transparent 70%)' }} />
        <div className={`relative ${container} text-center`}>
          <motion.p {...inView} variants={fadeUp} className="index-num font-en justify-center mb-10">Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="font-extrabold text-[var(--text-1)] tracking-[-0.03em] leading-[1.12] mb-10"
            style={{ fontSize: 'clamp(2.125rem, 5.4vw, 4.5rem)' }}>
            <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <motion.span variants={clipUp} className="block">장면 한 컷이면</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
              <motion.span variants={clipUp} className="block text-[var(--accent)]">시작할 수 있습니다</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="caption-kr mb-14 max-w-xl mx-auto">
            — 기획서가 없어도 됩니다. 만들고 싶은 화면을 말로 설명해 주셔도 됩니다.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center justify-center gap-8">
            <Link href="/contact?domain=game"
              className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-pill type-b3 font-bold
                         text-gray-50 bg-[var(--accent)] hover:bg-[var(--accent-strong)] transition-colors duration-300">
              게임 · XR 프로젝트 문의
              <FiArrowUpRight size={17} className={arrowHover} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkUnderline}>{CONTACT_EMAIL}</a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
