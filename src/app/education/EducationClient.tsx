'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi';
import { eduCourses, eduAudiences, eduFormat, eduRecord, domainByKey } from '@/data/domains';
import SafeImage from '@/components/SafeImage';
import CtaSection from '@/components/ui/CtaSection';
import Scramble from '@/components/motion/Scramble';
import { SplitText } from '@/components/motion/SplitText';
import HorizonGlow from '@/components/visual/HorizonGlow';
import { fadeUp, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import { arrowHover, container } from '@/lib/styles';

const d = domainByKey.edu;

const SECTIONS = [
  { id: 'curriculum', no: '01', label: '커리큘럼' },
  { id: 'audience', no: '02', label: '교육 대상' },
  { id: 'format', no: '03', label: '운영 방식' },
  { id: 'record', no: '04', label: '진행 이력' },
];

const record = eduRecord.slice(0, 6);

/* 좌측 스티키 목차 - 현재 읽고 있는 절을 따라간다 */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function Course({ c, defaultOpen }: { c: (typeof eduCourses)[number]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.article {...inView} variants={fadeUp}
      className={`overflow-hidden border bg-white transition-colors ${open ? 'border-black/30' : 'border-[var(--border)]'}`}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="w-full text-left p-6 sm:p-9 group
                   sm:flex sm:items-start sm:gap-6">
        {/* 모바일: 코드·레벨·셰브론을 한 줄로 먼저 놓고 제목을 아래로 내린다.
            좁은 폭에서 가운데 영역이 짜부라지지 않도록 가로 배치를 sm 이상으로 미룬다. */}
        <span className="flex items-center justify-between gap-4 mb-4 sm:hidden">
          <span className="font-mono text-[12px] text-[var(--accent-strong)]">{c.code}</span>
          <span className="flex items-center gap-3">
            <span className="tag whitespace-nowrap">
              {c.level}
            </span>
            <span className={`flex h-7 w-7 items-center justify-center border ${open ? 'border-primary-300 bg-primary-300 text-white' : 'border-black/25 text-black/70'}`}>
              {open ? <FiMinus size={14} /> : <FiPlus size={14} />}
            </span>
          </span>
        </span>

        <span className="hidden w-12 shrink-0 pt-1.5 font-mono text-[12px] text-[var(--accent-strong)] sm:block">
          {c.code}
        </span>

        <span className="block sm:flex-1 sm:min-w-0">
          <span className="block sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-4 mb-2 sm:mb-3">
            <span className="block type-h2 text-[var(--text-1)]">{c.title}</span>
          </span>
          <span className="block type-b3 text-[var(--text-2)] leading-[1.75] mt-3 sm:mt-0 sm:pr-4">{c.summary}</span>
        </span>

        <span className="hidden sm:flex shrink-0 flex-col items-end gap-3">
          <span className="tag whitespace-nowrap">
            {c.level}
          </span>
          <span className={`flex h-8 w-8 items-center justify-center border ${open ? 'border-primary-300 bg-primary-300 text-white' : 'border-black/25 text-black/70 group-hover:border-black/60'}`}>
            {open ? <FiMinus size={15} /> : <FiPlus size={15} />}
          </span>
        </span>
      </button>

      <motion.div initial={false} aria-hidden={!open} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
        <div className="px-6 sm:px-9 pb-8">
          <dl className="border-t border-[var(--border)]">
            {c.outline.map((o, i) => (
              <div key={o.title}
                className="py-5 border-b border-[var(--border)]
                           sm:grid sm:grid-cols-12 sm:gap-x-6 sm:items-baseline">
                <dt className="mb-1 whitespace-nowrap font-mono text-[12px] text-[var(--accent-strong)] sm:col-span-2 sm:mb-0">
                  {String(i + 1).padStart(2, '0')}
                </dt>
                <dd className="sm:col-span-4 type-b2 text-[var(--text-1)] mb-2 sm:mb-0">{o.title}</dd>
                <dd className="sm:col-span-6 type-b3 text-[var(--text-2)] leading-[1.75]">{o.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function EducationClient() {
  const active = useScrollSpy(SECTIONS.map((s) => s.id));
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div data-domain="edu">

      {/* ━━━━━━ HERO - 검은 첫 화면. 다른 영역 페이지와 같은 문법 ━━━━━━ */}
      <section className="relative overflow-hidden pt-40 pb-16 sm:pt-52 sm:pb-24">
        <HorizonGlow side="top" rim="clamp(110px, 13vw, 200px)" radius="max(120vw, 900px)" />
        <div className={`relative ${container}`}>
          <motion.p {...onMount} variants={fadeUp} className="mono-label mb-12 border-b border-white/[0.12] pb-4 sm:mb-16">
            <Link href="/services" className="text-white/45 hover:text-white"><Scramble text="MATE / Services /" /></Link> <Scramble text={`${d.en}:`} delay={160} />
          </motion.p>

          <div className="grid gap-x-gutter gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <motion.h1 {...onMount} variants={stagger}
                className="mb-9 font-medium leading-[1.06] tracking-[-0.028em] text-[var(--text-1)]"
                style={{ fontSize: 'clamp(2.5rem, 5.6vw, 4.75rem)' }}>
                <SplitText text="현업에서 실제로" className="block" />
                <SplitText text="쓰는 것만 가르칩니다" className="block text-white/45" />
              </motion.h1>
              <motion.p {...onMount} variants={fadeUp} className="type-b3 max-w-xl text-white/65">
                {d.summary}{' '}
                마지막 주에는 수강생 각자의 결과물이 남습니다.
              </motion.p>
            </div>

            {/* 개요 칸 */}
            <motion.div {...onMount} variants={fadeUp} className="lg:col-span-4 lg:col-start-9">
              <div className="border border-white/10 bg-[var(--surface)] p-6 sm:p-7">
                <p className="mono-label mb-6">Overview:</p>
                <dl className="divide-y divide-white/10">
                  {d.stats.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-5 py-4 first:pt-0 last:pb-0">
                      <dt className="text-[14px] text-white/65">{s.label}</dt>
                      <dd className="font-en font-mono-stat text-[34px] leading-none tracking-[-0.032em] text-[var(--text-1)]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-white/10 pt-6">
                  {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 실제 수업 현장 - 스톡 이미지가 대신할 수 없는 자리다. 원래 색 그대로 둔다 */}
      <section className="pb-20 sm:pb-28">
        <div className={container}>
          <motion.figure {...inView} variants={fadeUp}>
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)] sm:aspect-[2/1]">
              <SafeImage
                src="/images/projects/미래산업과학고.webp"
                alt="미래산업과학고등학교 수업 현장. 화면에 C# 변수 선언과 초기화 슬라이드가 떠 있다"
                fill
                className="absolute inset-0 object-[50%_42%]"
              />
            </div>
            <figcaption className="mt-4 flex flex-col gap-2 border-t border-white/[0.12] pt-3 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="mono-label text-white/75">미래산업과학고등학교 · 정규 수업</span>
              <span className="text-[13px] text-white/55">
                화면은 C# 변수 선언과 초기화를 다루던 3주차 수업입니다
              </span>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ═══ 흰 문서 - 목차와 본문 ═══ */}
      <div data-surface="light" data-header="light" className="bg-[var(--canvas)] pt-20 text-[var(--text-1)] sm:pt-28">

        {/* ━━━━━━ 본문 - 좌 스티키 목차 / 우 콘텐츠 ━━━━━━ */}
        <div className={`${container} pb-24 sm:pb-32`} ref={bodyRef}>
          <div className="grid lg:grid-cols-12 gap-x-gutter">

            {/* 목차 */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="sticky top-28 pr-6">
                <p className="mono-label mb-6">Contents:</p>
                <ul className="space-y-0">
                  {SECTIONS.map((s) => {
                    const on = active === s.id;
                    return (
                      <li key={s.id}>
                        <a href={`#${s.id}`}
                          className={`flex items-baseline gap-3 py-3 border-l-2 pl-4 -ml-px transition-colors duration-200 ${
                            on
                              ? 'border-primary-300 text-[var(--text-1)]'
                              : 'border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                          }`}>
                          <span className="font-mono text-[11px] tabular-nums">{s.no}</span>
                          <span className="type-b3">{s.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/contact?domain=edu"
                  className="group mt-9 inline-flex h-11 items-center gap-2 rounded-[2px] bg-primary-300 px-5 text-[14px] font-medium text-white transition-colors hover:bg-primary-200">
                  강의 문의하기
                  <FiArrowUpRight size={15} className={arrowHover} />
                </Link>
              </nav>
            </aside>

            {/* 콘텐츠 */}
            <div className="lg:col-span-9 lg:pl-6">

              {/* ── 01 커리큘럼 ── */}
              <section id="curriculum" className="scroll-mt-28 pt-4 pb-20 sm:pb-28">
                <motion.div {...inView} variants={fadeUp} className="mb-10 sm:mb-14">
                  <p className="mono-label mb-5">Curriculum:</p>
                  <h2 className="type-h1 text-[var(--text-1)] mb-5">표준 커리큘럼</h2>
                  <p className="type-b3 text-[var(--text-2)] leading-[1.9] max-w-2xl">
                    아래 세 과정은 <strong className="font-medium text-[var(--text-1)]">표준안</strong>입니다.
                    실제 과정은 기관의 목표·수준·시수에 맞춰 주차 구성과 난이도를 다시 짜서 제안드립니다.
                  </p>
                </motion.div>
                <div className="space-y-2">
                  {eduCourses.map((c, i) => <Course key={c.id} c={c} defaultOpen={i === 0} />)}
                </div>
              </section>

              {/* ── 02 교육 대상 ── */}
              <section id="audience" className="scroll-mt-28 pb-20 sm:pb-28 border-t border-[var(--border)] pt-16 sm:pt-20">
                <motion.div {...inView} variants={fadeUp} className="mb-10 sm:mb-14">
                  <p className="mono-label mb-5">Audience:</p>
                  <h2 className="type-h1 text-[var(--text-1)]">교육 대상</h2>
                </motion.div>
                <motion.div {...inView} variants={staggerTight} className="grid gap-2 sm:grid-cols-3">
                  {eduAudiences.map((a) => (
                    <motion.div key={a.no} variants={fadeUp}
                      className="border border-[var(--border)] bg-[var(--surface)] p-6">
                      <span className="mb-8 inline-flex h-7 w-7 items-center justify-center bg-primary-300 font-mono text-[12px] text-white">{Number(a.no)}</span>
                      <h3 className="type-h2 mb-4 text-[var(--text-1)]">{a.title}</h3>
                      <p className="type-b3 text-[var(--text-2)] leading-[1.85] mb-6">{a.detail}</p>
                      <ul className="space-y-2">
                        {a.points.map((pt) => (
                          <li key={pt} className="flex items-center gap-2.5 font-mono text-[12px] text-[var(--text-3)]">
                            <span className="h-1.5 w-1.5 shrink-0 bg-primary-300" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </motion.div>
              </section>

              {/* ── 03 운영 방식 ── */}
              <section id="format" className="scroll-mt-28 pb-20 sm:pb-28 border-t border-[var(--border)] pt-16 sm:pt-20">
                <motion.div {...inView} variants={fadeUp} className="mb-10 sm:mb-14">
                  <p className="mono-label mb-5">Format:</p>
                  <h2 className="type-h1 text-[var(--text-1)]">진행 조건</h2>
                </motion.div>
                <motion.dl {...inView} variants={staggerRows} className="border-t border-[var(--border)]">
                  {eduFormat.map((f) => (
                    <motion.div key={f.k} variants={rowIn}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-x-gutter gap-y-1 py-5 border-b border-[var(--border)]">
                      <dt className="sm:col-span-4 type-b2 text-[var(--text-1)]">{f.k}</dt>
                      <dd className="sm:col-span-8 type-b3 text-[var(--text-2)] leading-[1.75]">{f.v}</dd>
                    </motion.div>
                  ))}
                </motion.dl>
              </section>

              {/* ── 04 진행 이력 ── */}
              <section id="record" className="scroll-mt-28 border-t border-[var(--border)] pt-16 sm:pt-20">
                <motion.div {...inView} variants={fadeUp} className="mb-10 sm:mb-14">
                  <p className="mono-label mb-5">Record:</p>
                  <h2 className="type-h1 text-[var(--text-1)] mb-5">기관과 함께한 기록</h2>
                  <p className="type-b3 text-[var(--text-2)] leading-[1.9] max-w-2xl">
                    강의와 별개로, 교육·연구 기관과 진행한 사업과 수상 이력입니다.
                    커리큘럼은 이 경험에서 나옵니다.
                  </p>
                </motion.div>
                <motion.div {...inView} variants={staggerRows} className="border-t border-[var(--border)]">
                  {record.map((a) => (
                    <motion.div key={a.id} variants={rowIn}
                      className="grid grid-cols-12 gap-x-gutter gap-y-1 py-5 border-b border-[var(--border)] items-baseline">
                      <p className="col-span-3 font-mono text-[13px] text-[var(--text-3)] tabular-nums sm:col-span-2">{a.year}</p>
                      <h3 className="col-span-9 sm:col-span-5 type-b2 text-[var(--text-1)]">{a.title}</h3>
                      <p className="col-span-7 sm:col-span-3 type-b3 text-[var(--text-2)]">{a.organization}</p>
                      <p className="col-span-5 text-right font-mono text-[12px] text-[var(--accent-strong)] sm:col-span-2">{a.rank}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <CtaSection line1="커리큘럼은 기관에 맞춰" line2="다시 씁니다."
        kr="대상, 시수, 목표만 알려주시면 표준 커리큘럼을 그에 맞게 재구성해 제안서로 보내드립니다."
        cta="강의 · 교육 문의" href="/contact?domain=edu" />
    </div>
  );
}
