'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import CtaSection from '@/components/ui/CtaSection';
import { domains } from '@/data/domains';
import { processSteps } from '@/data/process';
import {
  fadeUp, fadeLeft, fadeRight, clipUp, lineDraw, stagger, staggerTight, inView, onMount,
} from '@/lib/motion';
import { arrowHover, container, sectionPad } from '@/lib/styles';

/** 도메인별 슬래브 연출 — 각 도메인 페이지의 디자인 언어를 미리 보여준다 */
const SLAB = {
  web: {
    domain: 'web',
    href: '/web',
    bg: null as string | null,
    note: '설계 문서에서 시작해 배포까지',
  },
  game: {
    domain: 'game',
    href: '/game',
    bg: '/images/projects/꼬꼬지생.webp',
    note: '두 번째 단계에서 이미 플레이 가능한 빌드',
  },
  edu: {
    domain: 'edu',
    href: '/education',
    bg: '/images/projects/미래산업과학고.webp',
    note: '기관 목표에 맞춰 커리큘럼을 다시 구성',
  },
} as const;

export default function ServicesPageClient() {
  return (
    <>
      {/* ━━━━━━ HERO ━━━━━━ */}
      <section className="pt-36 sm:pt-48 pb-16 sm:pb-24">
        <div className={container}>
          <motion.p {...onMount} variants={fadeLeft} className="index-num font-en mb-10">
            Services
          </motion.p>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 items-end">
            <motion.h1 {...onMount} variants={stagger}
              className="lg:col-span-7 font-en font-extrabold text-[var(--text-1)] tracking-[-0.045em] leading-[0.94]"
              style={{ fontSize: 'clamp(2.75rem, 8vw, 7rem)' }}>
              <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <motion.span variants={clipUp} className="block">Three</motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <motion.span variants={clipUp} className="block text-white/25">Domains</motion.span>
              </span>
            </motion.h1>
            <motion.div {...onMount} variants={fadeRight} className="lg:col-span-5 lg:pb-4">
              <p className="type-h3 text-[var(--text-1)] leading-[1.45] mb-6">
                영역마다 판단 기준이 다릅니다.
              </p>
              <p className="type-b3 text-white/55 leading-[1.85]">
                웹 · 앱, 게임 · XR, 교육은 필요한 사람도 판단 기준도 다릅니다.
                그래서 영역별로 다루는 범위와 진행 방식을 따로 정리했습니다.
              </p>
            </motion.div>
          </div>
          <motion.div {...onMount} variants={lineDraw} className="h-px bg-white/10 mt-16 sm:mt-24 origin-left" />
        </div>
      </section>

      {/* ━━━━━━ 도메인 슬래브 ━━━━━━ */}
      <section className="pb-8">
        {domains.map((d, i) => {
          const s = SLAB[d.key];
          return (
            <motion.div key={d.key} {...inView} variants={fadeUp} data-domain={s.domain}>
              <Link href={s.href} className="group block relative overflow-hidden border-b border-white/10">
                {/* 배경 — 게임 도메인만 이미지, 나머지는 액센트 워시 */}
                {s.bg ? (
                  <>
                    <div className="absolute inset-0 opacity-[0.26] group-hover:opacity-[0.38] transition-opacity duration-700"
                      style={{ filter: 'saturate(0.85)' }}>
                      <SafeImage src={s.bg} alt="" fill className="absolute inset-0" />
                    </div>
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, var(--canvas) 22%, rgba(14,17,23,0.62) 72%)' }} />
                  </>
                ) : (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: 'linear-gradient(90deg, var(--accent-dim), transparent 62%)' }} />
                )}

                <div className={`relative ${container} pt-16 pb-12 sm:pt-20 sm:pb-16`}>
                  <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 items-start">

                    {/* 번호 + 영문 타이틀 — 번호는 흐름에서 빼내 좌우 기준선을 맞춘다 */}
                    <div className="lg:col-span-5 relative">
                      <p className="index-num-lg font-en mb-5 lg:mb-0 lg:absolute lg:-top-9 lg:left-0">
                        0{i + 1}
                      </p>
                      <h2 className="font-en font-extrabold tracking-[-0.04em] leading-[0.95] text-[var(--text-1)]
                                     transition-colors duration-300 group-hover:text-[var(--accent)] mb-4"
                        style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4.25rem)' }}>
                        {d.en}
                      </h2>
                      <p className="type-b1 text-white/50">{d.kr}</p>
                    </div>

                    {/* 설명 + 태그 */}
                    <div className="lg:col-span-5 lg:pl-6">
                      <p className="type-h3 text-[var(--text-1)] leading-[1.45] mb-5">{d.lead}</p>
                      <p className="type-b3 text-white/50 leading-[1.85] mb-7 max-w-md">{d.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {d.tags.map((t) => (
                          <span key={t}
                            className="type-c2 px-3 py-1.5 rounded-[6px] border border-white/12 text-white/55 font-en">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 지표 + 진입 */}
                    <div className="lg:col-span-2 flex lg:flex-col lg:items-end justify-between gap-6 lg:h-full">
                      <div className="lg:text-right space-y-4">
                        {d.stats.slice(0, 2).map((st) => (
                          <div key={st.label}>
                            <p className="font-en type-h3 font-extrabold text-[var(--text-1)] font-mono-stat leading-none mb-1.5">
                              {st.value}
                            </p>
                            <p className="type-c2 text-white/40">{st.label}</p>
                          </div>
                        ))}
                      </div>
                      <span className="w-14 h-14 shrink-0 rounded-full border border-white/20 flex items-center justify-center
                                       text-white/60 transition-all duration-300
                                       group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:rotate-45">
                        <FiArrowUpRight size={20} />
                      </span>
                    </div>
                  </div>

                  <p className="relative mt-8 type-c1 text-white/35">— {s.note}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* ━━━━━━ 공통 프로세스 ━━━━━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-8 mb-16 sm:mb-20">
            <motion.p {...inView} variants={fadeLeft} className="lg:col-span-3 index-num font-en">
              (04) Process
            </motion.p>
            <div className="lg:col-span-9">
              <motion.h2 {...inView} variants={fadeUp} className="type-d2 font-en text-[var(--text-1)] mb-5">
                영역이 달라도 같은 것
              </motion.h2>
              <motion.p {...inView} variants={fadeRight} className="type-b3 text-white/50 max-w-xl leading-[1.85]">
                무엇을 만들든 진행 방식은 동일합니다. 각 단계가 끝날 때마다 확인할 수 있는 결과물을 드립니다.
              </motion.p>
            </div>
          </div>

          <motion.div {...inView} variants={staggerTight}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-white/10">
            {processSteps.map((s, i) => (
              <motion.div key={s.id} variants={fadeUp}
                className={[
                  'py-9 sm:py-12 border-b border-white/10',
                  i % 2 === 1 ? 'sm:border-l sm:pl-7' : '',
                  i > 0 ? 'lg:border-l lg:pl-7' : 'lg:border-l-0 lg:pl-0',
                  'border-white/10',
                ].join(' ')}>
                <p className="index-num-lg font-en mb-6">0{s.order}</p>
                <h3 className="type-b1 text-[var(--text-1)] mb-3">{s.title}</h3>
                <p className="type-c1 text-white/45 leading-[1.8] pr-4">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CtaSection num="05" line1="Same door," line2="three rooms."
        kr="어느 영역이든 들어오는 문은 하나입니다" />
    </>
  );
}
