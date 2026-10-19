'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiMonitor, FiSmartphone, FiBox } from 'react-icons/fi';
import CtaSection from '@/components/ui/CtaSection';
import SectionHead from '@/components/ui/SectionHead';
import ProjectCard from '@/components/ProjectCard';
import HorizonGlow from '@/components/visual/HorizonGlow';
import StripeField from '@/components/visual/StripeField';
import { projects } from '@/data/projects';
import {
  gameCapabilities, gamePlatforms, gamePipeline, gameCredentials, domainByKey,
} from '@/data/domains';
import { fadeUp, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';
import { container, iconSquare, numSquare, sectionPad } from '@/lib/styles';

const d = domainByKey.game;
const work = projects.filter((p) => p.category === 'Game Application' || p.category === 'VR Application');
const credentials = gameCredentials;
const platformIcon = [FiMonitor, FiSmartphone, FiBox];

export default function GameClient() {
  const railRef = useRef<HTMLDivElement>(null);
  const nudge = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  return (
    <div data-domain="game">

      {/* ━━━━━━ HERO ━━━━━━ */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-52 sm:pb-24">
        <HorizonGlow side="top" rim="clamp(110px, 13vw, 200px)" radius="max(120vw, 900px)" />
        <div className={`relative ${container}`}>
          <motion.p {...onMount} variants={fadeUp} className="mono-label mb-12 border-b border-white/[0.12] pb-4 sm:mb-16">
            <Link href="/services" className="text-white/45 hover:text-white"><Scramble text="MATE / Services /" /></Link> <Scramble text={`${d.en}:`} delay={160} />
          </motion.p>

          <div className="grid items-end gap-x-gutter gap-y-12 lg:grid-cols-12">
            <motion.h1 {...onMount} variants={stagger}
              className="font-en font-medium leading-[0.96] tracking-[-0.032em] text-[var(--text-1)] lg:col-span-7"
              style={{ fontSize: 'clamp(2.75rem, 7.6vw, 6.75rem)' }}>
              <SplitText text="Game & XR" className="block" />
              <SplitText text="Development" className="block text-white/45" />
            </motion.h1>
            <motion.div {...onMount} variants={fadeUp} className="lg:col-span-5 lg:pb-3">
              <p className="type-h3 mb-5 text-[var(--text-1)]">{d.lead}</p>
              <p className="type-b3 text-white/65">{d.summary}</p>
            </motion.div>
          </div>

          <motion.div {...inView} variants={staggerTight}
            className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.12] pt-6 sm:mt-24 lg:grid-cols-12">
            {d.stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="lg:col-span-2">
                <p className="mono-label mb-3">{s.label}:</p>
                <p className="font-en font-mono-stat text-[40px] leading-none tracking-[-0.032em] text-[var(--text-1)] sm:text-[48px]">{s.value}</p>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="col-span-2 lg:col-span-5 lg:col-start-8">
              <p className="mono-label mb-3">Tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ CAPABILITIES - 가로 스크롤 레일 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="What we make" title={<>만드는 것들</>} />
        </div>
        <div className={`${container} -mt-6 mb-6 hidden justify-end gap-2 sm:flex`}>
          <button onClick={() => nudge(-1)} aria-label="이전"
            className="flex h-10 w-10 items-center justify-center border border-white/25 text-white/70 transition-colors hover:border-white hover:text-white">
            <FiArrowLeft size={16} />
          </button>
          <button onClick={() => nudge(1)} aria-label="다음"
            className="flex h-10 w-10 items-center justify-center border border-white/25 text-white/70 transition-colors hover:border-white hover:text-white">
            <FiArrowRight size={16} />
          </button>
        </div>

        <motion.div {...inView} variants={staggerTight}
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
          style={{
            // 첫 카드를 컨테이너 정렬선에 붙이고, 오른쪽으로는 화면 밖까지 흐르게 둔다.
            // 스냅이 첫 카드를 왼쪽 끝에 붙이지 않도록 같은 값을 scroll-padding 에도 준다
            paddingLeft: 'max(1.5rem, calc((100vw - 1500px) / 2 + 1.5rem))',
            scrollPaddingLeft: 'max(1.5rem, calc((100vw - 1500px) / 2 + 1.5rem))',
            paddingRight: '1rem',
          }}>
          {gameCapabilities.map((c) => (
            <motion.article key={c.id} variants={fadeUp}
              className="sweep group flex w-[290px] shrink-0 snap-start flex-col border border-white/10 bg-[var(--surface)] p-7
                         transition-colors duration-300 hover:border-white/35 sm:w-[360px] sm:p-8">
              <p className="mb-10 font-mono text-[12px] text-white/45 tabular-nums">{c.no}</p>
              <h3 className="font-en mb-2 text-[26px] font-medium leading-none tracking-[-0.025em] text-[var(--text-1)] sm:text-[30px]">
                {c.en}
              </h3>
              <p className="type-b3 mb-6 text-[var(--point)]">{c.kr}</p>
              <p className="type-b3 mb-9 flex-1 text-white/60">{c.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ━━━━━━ PLATFORMS ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Platforms" title={<>빌드가 올라가는 곳</>} />
          <motion.div {...inView} variants={staggerTight} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {gamePlatforms.map((p, i) => {
              const Icon = platformIcon[i % platformIcon.length];
              return (
                <motion.div key={p.name} variants={fadeUp}
                  className="sweep flex min-h-[200px] flex-col justify-between border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-8">
                  <span className={iconSquare}><Icon size={14} /></span>
                  <div>
                    <h3 className="font-en mb-2 text-[34px] font-medium leading-none tracking-[-0.028em] text-[var(--text-1)] sm:text-[42px]">
                      {p.name}
                    </h3>
                    <p className="font-mono text-[12px] uppercase tracking-[0.02em] text-white/55">{p.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ PIPELINE - 번호 칸이 이어지는 세로 줄 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <div className="grid gap-x-gutter gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <motion.p {...inView} variants={fadeUp} className="mono-label mb-10 border-b border-white/[0.12] pb-4">Pipeline:</motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 mb-7 text-[var(--text-1)]">
                만드는 순서
              </motion.h2>
              <motion.p {...inView} variants={fadeUp} className="type-b3 max-w-sm text-white/60">
                게임은 문서로 재미를 증명할 수 없습니다. 그래서 두 번째 단계에서 이미
                플레이 가능한 빌드를 만들고, 거기서부터 판단합니다.
              </motion.p>
              <motion.div {...inView} variants={fadeUp} className="relative mt-12 hidden h-56 lg:block">
                <StripeField seed={13} className="absolute inset-0" />
              </motion.div>
            </div>

            <motion.ol {...inView} variants={staggerTight} className="relative lg:col-span-7 lg:col-start-6">
              <span className="absolute bottom-3 left-[13px] top-3 w-px bg-white/15" aria-hidden />
              {gamePipeline.map((s) => (
                <motion.li key={s.no} variants={fadeUp} className="relative pb-12 pl-14 last:pb-0">
                  <span className={`${numSquare} absolute left-0 top-0 bg-black`}>{Number(s.no)}</span>
                  <h3 className="type-h2 mb-3 text-[var(--text-1)]">{s.title}</h3>
                  <p className="type-b3 max-w-xl text-white/60">{s.desc}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ━━━━━━ WORK - 넓은 칸과 좁은 칸을 엇갈려 놓는다 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Selected work" title={<>Shipped Titles</>} href="/projects" more="전체 포트폴리오" />
          <div className="grid gap-x-6 gap-y-16 lg:grid-cols-12">
            {work.map((p, i) => {
              const wide = i % 4 === 0 || i % 4 === 3;
              return (
                <div key={p.id} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
                  <ProjectCard project={p} index={i} aspect={wide ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━ CREDENTIALS - 전시 · 수상 ━━━━━━ */}
      {credentials.length > 0 && (
        <section className={`${sectionPad} border-t border-white/10`}>
          <div className={container}>
            <SectionHead label="Credentials" title={<>밖에서 받은 평가</>} />
            <motion.div {...inView} variants={staggerRows} className="border-t border-white/[0.12]">
              {credentials.map((a) => (
                <motion.div key={a.id} variants={rowIn}
                  className="grid grid-cols-12 items-baseline gap-x-gutter gap-y-1 border-b border-white/10 py-5 sm:py-6">
                  <p className="col-span-3 font-mono text-[13px] text-white/50 tabular-nums sm:col-span-2">{a.year}</p>
                  <h3 className="col-span-9 text-[16px] font-medium tracking-[-0.012em] text-[var(--text-1)] sm:col-span-5 sm:text-[17px]">{a.title}</h3>
                  <p className="col-span-7 col-start-4 text-[14px] text-white/55 sm:col-span-3 sm:col-start-auto">{a.organization}</p>
                  <p className="col-span-5 text-right font-mono text-[12px] text-[var(--point)] sm:col-span-2">{a.rank}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <CtaSection line1="장면 한 컷이면" line2="시작할 수 있습니다"
        kr="기획서가 없어도 됩니다. 만들고 싶은 화면을 말로 설명해 주셔도 됩니다."
        cta="게임 · XR 프로젝트 문의" href="/contact?domain=game" />
    </div>
  );
}
