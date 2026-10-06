'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi';
import { projects } from '@/data/projects';
import { webScope, webStack, webDeliverables, domainByKey } from '@/data/domains';
import { fadeUp, fadeLeft, fadeRight, clipUp, lineDraw, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import { arrowHover, btnPrimary, container, linkUnderline, CONTACT_EMAIL } from '@/lib/styles';

const d = domainByKey.web;
const work = projects.filter((p) => p.category === 'Web Application');

/* 히어로 우측 — 화면 설계도를 추상화한 와이어프레임.
   실제 스크린샷 대신 구조만 남겨 '설계한다'는 도메인 성격을 드러낸다. */
function Wireframe() {
  const bar = (w: string, o = 0.14) => (
    <span className="block h-[6px] rounded-[2px]" style={{ width: w, background: `rgba(255,255,255,${o})` }} />
  );
  return (
    <div className="rounded-[12px] border border-white/12 bg-[var(--surface)] overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
      {/* 브라우저 크롬 */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-white/10 bg-[var(--surface-2)]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="ml-3 h-5 flex-1 max-w-[220px] rounded-[4px] bg-white/[0.06]" />
      </div>
      {/* 본문 골격 */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-7">
          {bar('64px', 0.3)}
          <div className="flex gap-3">{bar('28px')}{bar('28px')}{bar('28px')}</div>
        </div>
        <div className="space-y-2.5 mb-7">
          <span className="block h-[22px] w-[72%] rounded-[3px] opacity-60" style={{ background: 'var(--accent)' }} />
          <span className="block h-[22px] w-[48%] rounded-[3px] bg-white/[0.14]" />
        </div>
        <div className="space-y-2 mb-8">{bar('90%', 0.09)}{bar('80%', 0.09)}{bar('55%', 0.09)}</div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[6px] border border-white/10 bg-white/[0.02] p-3">
              <span className="block h-11 rounded-[4px] bg-white/[0.05] mb-3" />
              {bar('70%', 0.12)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WebClient() {
  const [open, setOpen] = useState<string | null>('product');

  return (
    <div data-domain="web">

      {/* ━━━━━━ HERO — 8/4 비대칭. 좌 타이포 / 우 지표 ━━━━━━ */}
      <section className="pt-36 sm:pt-44 pb-20 sm:pb-28">
        <div className={container}>
          <motion.div {...onMount} variants={fadeLeft} className="flex items-center gap-3 mb-10">
            <Link href="/services" className="type-c1 text-white/35 hover:text-white/70 transition-colors font-en">
              Services
            </Link>
            <span className="type-c1 text-white/20">/</span>
            <span className="type-c1 text-[var(--accent)] font-en">{d.en}</span>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-12 items-end">
            <div className="lg:col-span-7">
              <motion.h1 {...onMount} variants={stagger}
                className="font-en font-extrabold text-[var(--text-1)] tracking-[-0.045em] leading-[0.94]"
                style={{ fontSize: 'clamp(2.75rem, 8vw, 7rem)' }}>
                <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  <motion.span variants={clipUp} className="block">Web &amp; App</motion.span>
                </span>
                <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  <motion.span variants={clipUp} className="block text-white/25">Development</motion.span>
                </span>
              </motion.h1>
            </div>
            <motion.div {...onMount} variants={fadeRight} className="lg:col-span-5 lg:pb-3">
              <p className="type-h3 text-[var(--text-1)] leading-[1.4] mb-6">{d.lead}</p>
              <p className="type-b3 text-white/55 leading-[1.85]">{d.summary}</p>
            </motion.div>
          </div>

          {/* 지표 행 — 헤어라인 그리드를 드러낸다 */}
          <motion.div {...onMount} variants={lineDraw}
            className="h-px bg-white/10 mt-16 mb-0 origin-left" />
          <motion.div {...inView} variants={staggerTight}
            className="grid grid-cols-1 sm:grid-cols-3 border-b border-white/10">
            {d.stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp}
                className={`py-8 sm:py-10 ${i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-8' : ''}
                            ${i < 2 ? 'border-b sm:border-b-0 border-white/10' : ''}`}>
                <p className="font-en text-[38px] sm:text-[46px] font-extrabold text-[var(--text-1)] font-mono-stat tracking-[-0.03em] leading-none mb-3">
                  {s.value}
                </p>
                <p className="type-c1 text-white/40">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 와이어프레임 — 12칼럼 중 7칼럼 오프셋 배치 */}
          <motion.div {...inView} variants={fadeUp} className="mt-16 sm:mt-24 grid lg:grid-cols-12 gap-x-gutter items-center">
            <div className="lg:col-span-7">
              <Wireframe />
            </div>
            <div className="lg:col-span-5 lg:pl-10 mt-10 lg:mt-0">
              <p className="index-num font-en mb-6">Approach</p>
              <p className="type-h3 text-[var(--text-1)] leading-[1.45] mb-6">
                화면부터 그리지 않습니다.<br />무엇을 왜 만드는지부터 문서로 굳힙니다.
              </p>
              <p className="type-b3 text-white/50 leading-[1.85]">
                요구사항이 정리되지 않은 채로 개발을 시작하면 중간에 반드시 되돌아옵니다.
                MATE는 설계 단계에서 시간을 더 쓰고, 그 대신 개발 중 방향이 뒤집히는 일을 줄입니다.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ SCOPE — 아코디언 3단 ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-6 mb-16 sm:mb-20">
            <div className="lg:col-span-7">
              <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">
                Scope
              </motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)]">
                어디서부터 어디까지
              </motion.h2>
            </div>
            <motion.p {...inView} variants={fadeRight}
              className="lg:col-span-5 lg:self-end lg:pb-3 type-b3 text-white/50 leading-[1.85]">
              맡기는 범위는 프로젝트마다 다릅니다. 설계만, 구현만, 혹은 전부 —
              어느 지점에서 들어와도 이어받을 수 있도록 단계를 나눠 두었습니다.
            </motion.p>
          </div>

          <div className="border-t border-white/10">
            {webScope.map((s) => {
              const isOpen = open === s.id;
              return (
                <motion.div key={s.id} {...inView} variants={fadeUp} className="border-b border-white/10">
                  <button
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    aria-expanded={isOpen}
                    className="w-full group flex items-start gap-6 sm:gap-10 py-8 sm:py-11 text-left">
                    <span className={`type-c1 font-en pt-2 w-[70px] shrink-0 transition-colors
                                      ${isOpen ? 'text-[var(--accent)]' : 'text-white/30'}`}>
                      {s.step}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                        <span className={`font-en font-extrabold tracking-[-0.03em] leading-none transition-colors
                                          ${isOpen ? 'text-[var(--text-1)]' : 'text-white/55 group-hover:text-[var(--text-1)]'}`}
                          style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}>
                          {s.en}
                        </span>
                        <span className="type-b3 text-white/40">{s.kr}</span>
                      </span>
                    </span>
                    <span className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-colors
                                      ${isOpen ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/15 text-white/40 group-hover:border-white/40'}`}>
                      {isOpen ? <FiMinus size={16} /> : <FiPlus size={16} />}
                    </span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden">
                    <div className="pb-11 sm:pl-[112px] grid lg:grid-cols-12 gap-x-gutter gap-y-8">
                      <p className="lg:col-span-5 type-b3 text-white/55 leading-[1.85] pr-6">{s.desc}</p>
                      <div className="lg:col-span-7 flex flex-wrap gap-2.5 lg:justify-end lg:content-start">
                        {s.items.map((it) => (
                          <span key={it}
                            className="inline-flex items-center h-10 px-5 rounded-[8px] border border-white/12
                                       bg-white/[0.03] type-b4 text-white/70">
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━━━━ STACK — 레이어 테이블 ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4 mb-12 sm:mb-16">
            <motion.p {...inView} variants={fadeLeft} className="index-num font-en">Stack</motion.p>
            <motion.p {...inView} variants={fadeRight} className="type-b3 text-white/50 max-w-lg leading-[1.85]">
              3년 뒤 다른 개발자가 열었을 때 읽히는 스택만 넣습니다.
              새 프레임워크는 저희 사이드 프로젝트에서 먼저 써 봅니다.
            </motion.p>
          </div>

          {/* 레이어명 자체를 대형 타이포로 세워, 앞뒤 섹션과 시작 모양을 다르게 한다 */}
          <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
            {webStack.map((row) => (
              <motion.div key={row.layer} variants={rowIn}
                className="grid sm:grid-cols-12 gap-x-gutter gap-y-4 py-9 sm:py-12 border-b border-white/10 items-baseline">
                <p className="sm:col-span-5 font-en font-extrabold text-[var(--text-1)] tracking-[-0.035em] leading-none"
                  style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)' }}>
                  {row.layer}
                </p>
                <div className="sm:col-span-7 flex flex-wrap gap-x-7 gap-y-3">
                  {row.items.map((it) => (
                    <span key={it} className="type-b3 text-white/55 font-en">{it}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ DELIVERABLES — 2x2 ━━━━━━ */}
      <section className="py-24 sm:py-36 border-t border-white/10">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-6 mb-16 sm:mb-20">
            <motion.p {...inView} variants={fadeLeft}
              className="lg:col-span-5 lg:self-end lg:pb-3 lg:order-1 type-b3 text-white/50 leading-[1.85]">
              계약이 끝나도 MATE 없이 굴러가야 합니다. 그래서 넘기는 것을 미리 정해 둡니다.
            </motion.p>
            <div className="lg:col-span-7 lg:order-2 lg:text-right">
              <motion.p {...inView} variants={fadeRight} className="index-num font-en mb-7 lg:justify-end">
                Deliverables
              </motion.p>
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)]">
                넘겨드리는 네 가지
              </motion.h2>
            </div>
          </div>

          <motion.div {...inView} variants={staggerTight} className="grid sm:grid-cols-2 border-t border-white/10">
            {webDeliverables.map((it, i) => (
              <motion.div key={it.title} variants={fadeUp}
                className={[
                  'py-10 sm:py-14 border-b border-white/10',
                  i % 2 === 1 ? 'sm:border-l sm:border-white/10 sm:pl-10' : 'sm:pr-10',
                ].join(' ')}>
                <p className="index-num-lg font-en mb-6">0{i + 1}</p>
                <h3 className="type-h2 text-[var(--text-1)] mb-4">{it.title}</h3>
                <p className="type-b3 text-white/50 leading-[1.85] max-w-md">{it.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━ WORK — 공개 가능한 화면 캡처가 없어 정보 중심으로 세운다 ━━━━━━ */}
      {work.length > 0 && (
        <section className="py-24 sm:py-36 border-t border-white/10">
          <div className={container}>
            <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-6 mb-16 sm:mb-20">
              <div className="lg:col-span-7">
                <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-7">Work</motion.p>
                <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)]">
                  Built for Web
                </motion.h2>
              </div>
              <motion.div {...inView} variants={fadeRight}
                className="lg:col-span-5 lg:self-end lg:pb-3 flex items-end justify-between gap-6">
                <p className="type-b3 text-white/50 leading-[1.85]">
                  납품이 끝난 건만 올립니다. 화면은 발주처 자산이라 공개하지 않고, 무엇을 어떤 구성으로
                  만들었는지만 적습니다.
                </p>
                <Link href="/projects"
                  className="group inline-flex items-center gap-1.5 type-b4 text-white/70 hover:text-gray-50 transition-colors whitespace-nowrap">
                  전체
                  <FiArrowUpRight size={15} className={arrowHover} />
                </Link>
              </motion.div>
            </div>

            <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
              {work.map((p) => (
                <motion.div key={p.id} variants={rowIn}>
                  <Link href={`/projects/${p.id}`}
                    className="group grid lg:grid-cols-12 gap-x-gutter gap-y-4 py-9 sm:py-11
                               border-b border-white/10 items-baseline">
                    <h3 className="lg:col-span-3 type-h2 text-[var(--text-1)]
                                   transition-colors duration-300 group-hover:text-[var(--accent)]">
                      {p.title}
                    </h3>
                    <p className="lg:col-span-7 type-b3 text-white/55 leading-[1.8]">{p.description}</p>
                    <p className="lg:col-span-2 type-c1 text-white/30 font-mono-stat lg:text-right whitespace-nowrap">
                      {p.durationMonths}개월
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.p {...inView} variants={fadeUp} className="mt-8 type-c1 text-white/30">
              세 건 모두 React · Next.js 프론트에 Flutter 앱, Python 백엔드, AWS 배포 구성입니다.
            </motion.p>
          </div>
        </section>
      )}

      {/* ━━━━━━ CTA ━━━━━━ */}
      <section className="py-28 sm:py-40 border-t border-white/10">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 items-end">
            <div className="lg:col-span-7">
              <motion.p {...inView} variants={fadeLeft} className="index-num font-en mb-9">Contact</motion.p>
              <motion.h2 {...inView} variants={stagger}
                className="font-extrabold text-[var(--text-1)] tracking-[-0.03em] leading-[1.14] mb-8"
                style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)' }}>
                <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  <motion.span variants={clipUp} className="block">요구사항 정리부터</motion.span>
                </span>
                <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  <motion.span variants={clipUp} className="block text-[var(--accent)]">같이 합니다</motion.span>
                </span>
              </motion.h2>
              <motion.p {...inView} variants={fadeLeft} className="caption-kr max-w-lg">
                — 아이디어 단계여도 됩니다. 무엇을 만들지 문장으로 적는 데까지가 첫 상담입니다.
              </motion.p>
            </div>
            <motion.div {...inView} variants={fadeRight} className="lg:col-span-5 flex flex-wrap items-center gap-7">
              <Link href="/contact?domain=web" className={btnPrimary}>
                웹 · 앱 프로젝트 문의
                <FiArrowUpRight size={17} className={arrowHover} />
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkUnderline}>{CONTACT_EMAIL}</a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
