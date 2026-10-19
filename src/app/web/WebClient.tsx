'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi';
import CtaSection from '@/components/ui/CtaSection';
import SectionHead from '@/components/ui/SectionHead';
import HorizonGlow from '@/components/visual/HorizonGlow';
import BrowserFrame from '@/components/visual/BrowserFrame';
import { projects } from '@/data/projects';
import { webScope, webStack, webDeliverables, domainByKey } from '@/data/domains';
import { fadeUp, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';
import { container, numSquare, sectionPad } from '@/lib/styles';

const d = domainByKey.web;
const work = projects.filter((p) => p.category === 'Web Application' || p.category === 'Website');
/* 화면을 공개할 수 있는 웹 사례 - 고객사 허락을 받았다 (2026-10-16) */
const showcase = projects.find((p) => p.id === '13');

export default function WebClient() {
  const [open, setOpen] = useState<string | null>('product');

  return (
    <div data-domain="web">

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
              <SplitText text="Web & App" className="block" />
              <SplitText text="Development" className="block text-white/45" />
            </motion.h1>
            <motion.div {...onMount} variants={fadeUp} className="lg:col-span-5 lg:pb-3">
              <p className="type-h3 mb-5 text-[var(--text-1)]">{d.lead}</p>
              <p className="type-b3 text-white/65">{d.summary}</p>
            </motion.div>
          </div>

          {/* 지표 - 칸마다 이름표를 붙인 줄 */}
          <motion.div {...inView} variants={staggerTight}
            className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/[0.12] pt-6 sm:mt-24 lg:grid-cols-12">
            {d.stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="lg:col-span-3">
                <p className="mono-label mb-3">{s.label}:</p>
                <p className="font-en font-mono-stat text-[40px] leading-none tracking-[-0.032em] text-[var(--text-1)] sm:text-[48px]">{s.value}</p>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="col-span-2 lg:col-span-6">
              <p className="mono-label mb-3">Tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ 공개할 수 있는 작업 화면 + 접근 ━━━━━━ */}
      {showcase && (
        <section className="pb-24 sm:pb-32">
          <div className={`${container} grid items-center gap-x-gutter gap-y-12 lg:grid-cols-12`}>
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-7">
              <Link href={`/projects/${showcase.id}`} className="group block">
                <BrowserFrame src={showcase.thumbnail} alt={`${showcase.title} 화면`} url={(showcase.liveUrl ?? '').replace(/^https?:\/\//, '')}
                  className="transition-colors duration-300 group-hover:border-white/40" />
                <p className="mt-4 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.02em] text-white/55">
                  <span>Case / {showcase.title}</span>
                  <FiArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </Link>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="lg:col-span-4 lg:col-start-9">
              <p className="mono-label mb-6">Approach:</p>
              <p className="type-h3 mb-6 text-[var(--text-1)]">
                무엇을 왜 만드는지부터<br />문서로 정리합니다.
              </p>
              <p className="type-b3 text-white/60">
                기획 단계에서 상세 기획서를 쓰고 기술 스택과 일정을 정한 뒤 개발에 들어갑니다.
                개발 중에는 주 단위로 진행 상황을 공유합니다.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* ━━━━━━ SCOPE - 아코디언 3단 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Scope" title={<>어디서부터 어디까지</>}
            desc="맡기는 범위는 프로젝트마다 다릅니다. 설계만, 구현만, 혹은 전부. 어느 지점에서 들어와도 이어받을 수 있도록 단계를 나눠 두었습니다." />

          <div className="space-y-2">
            {webScope.map((s) => {
              const isOpen = open === s.id;
              return (
                <motion.div key={s.id} {...inView} variants={fadeUp}
                  className={`border transition-colors duration-300 ${isOpen ? 'border-white/25 bg-[var(--surface)]' : 'border-white/10'}`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center gap-6 px-5 py-6 text-left sm:gap-10 sm:px-7 sm:py-8">
                    <span className="w-[76px] shrink-0 font-mono text-[12px] uppercase tracking-[0.02em] text-white/50">{s.step}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                        <span className={`font-en font-medium leading-none tracking-[-0.028em] transition-colors ${isOpen ? 'text-[var(--text-1)]' : 'text-white/60 group-hover:text-[var(--text-1)]'}`}
                          style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.625rem)' }}>
                          {s.en}
                        </span>
                        <span className="type-b3 text-white/60">{s.kr}</span>
                      </span>
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors ${
                      isOpen ? 'border-primary-200 bg-primary-200 text-white' : 'border-white/25 text-white/70 group-hover:border-white/60'}`}>
                      {isOpen ? <FiMinus size={15} /> : <FiPlus size={15} />}
                    </span>
                  </button>

                  {/* 닫힌 패널은 높이만 0 일 뿐 DOM 에 남는다. 가려 두지 않으면 스크린리더가 접힌 내용을 전부 읽는다 */}
                  <motion.div
                    initial={false}
                    aria-hidden={!isOpen}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden">
                    <div className="grid gap-x-gutter gap-y-6 px-5 pb-8 sm:px-7 sm:pl-[136px] lg:grid-cols-12">
                      <p className="type-b3 pr-6 text-white/65 lg:col-span-5">{s.desc}</p>
                      <div className="flex flex-wrap content-start gap-1.5 lg:col-span-7 lg:justify-end">
                        {s.items.map((it) => <span key={it} className="tag">{it}</span>)}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━ STACK - 레이어 표 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Stack" title={<>다루는 기술</>} desc="프로젝트 요구사항에 맞는 기술을 고릅니다." />

          <motion.div {...inView} variants={staggerRows} className="border-t border-white/[0.12]">
            {webStack.map((row) => (
              <motion.div key={row.layer} variants={rowIn}
                className="grid items-baseline gap-x-gutter gap-y-4 border-b border-white/10 py-7 sm:grid-cols-12 sm:py-9">
                <p className="font-en font-medium leading-none tracking-[-0.028em] text-[var(--text-1)] sm:col-span-5"
                  style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)' }}>
                  {row.layer}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:col-span-7">
                  {row.items.map((it) => <span key={it} className="tag">{it}</span>)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ DELIVERABLES - 2x2 ━━━━━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="Deliverables" title={<>넘겨드리는 네 가지</>}
            desc="프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다." />

          <motion.div {...inView} variants={staggerTight} className="grid gap-2 sm:grid-cols-2">
            {webDeliverables.map((it, i) => (
              <motion.div key={it.title} variants={fadeUp}
                className="sweep flex min-h-[220px] flex-col border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-8">
                <span className={`${numSquare} mb-10`}>{i + 1}</span>
                <h3 className="type-h2 mb-3 text-[var(--text-1)]">{it.title}</h3>
                <p className="type-b3 max-w-md text-white/60">{it.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ WORK - 웹 사례 목록 ━━━━━━ */}
      {work.length > 0 && (
        <section className={`${sectionPad} border-t border-white/10`}>
          <div className={container}>
            <SectionHead label="Work" title={<>Built for Web</>} href="/projects" more="전체 포트폴리오"
              desc="납품이 끝난 건만 올립니다. 공개되지 않은 화면은 싣지 않고, 무엇을 만들었는지만 적습니다." />

            <motion.div {...inView} variants={staggerRows} className="border-t border-white/[0.12]">
              {work.map((p, i) => (
                <motion.div key={p.id} variants={rowIn}>
                  <Link href={`/projects/${p.id}`}
                    className="group grid items-baseline gap-x-gutter gap-y-3 border-b border-white/10 py-7 transition-colors hover:bg-white/[0.02] sm:py-9 lg:grid-cols-12">
                    <span className="font-mono text-[12px] text-white/40 tabular-nums lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="type-h2 text-[var(--text-1)] transition-colors duration-300 group-hover:text-[var(--point)] lg:col-span-3">
                      {p.title}
                    </h3>
                    <p className="type-b3 text-white/60 lg:col-span-7">{p.description}</p>
                    <FiArrowUpRight size={16} className="hidden justify-self-end text-white/40 transition-colors group-hover:text-white lg:col-span-1 lg:block" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <CtaSection line1="요구사항 정리부터" line2="같이 합니다"
        kr="아이디어 단계여도 됩니다. 요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일입니다."
        cta="웹 · 앱 프로젝트 문의" href="/contact?domain=web" />
    </div>
  );
}
