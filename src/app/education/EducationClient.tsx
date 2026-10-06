'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi';
import { eduCourses, eduAudiences, eduFormat, eduRecord, domainByKey } from '@/data/domains';
import SafeImage from '@/components/SafeImage';
import { fadeUp, fadeLeft, fadeRight, clipUp, lineDraw, rowIn, stagger, staggerTight, staggerRows, inView, onMount } from '@/lib/motion';
import { arrowHover, container, CONTACT_EMAIL } from '@/lib/styles';

const d = domainByKey.edu;

const SECTIONS = [
  { id: 'curriculum', no: '01', label: '커리큘럼' },
  { id: 'audience', no: '02', label: '교육 대상' },
  { id: 'format', no: '03', label: '운영 방식' },
  { id: 'record', no: '04', label: '진행 이력' },
];

const record = eduRecord.slice(0, 6);

/* 좌측 스티키 목차 — 현재 읽고 있는 절을 따라간다 */
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
      className="border border-[var(--border)] rounded-card bg-[var(--gray-50)] overflow-hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="w-full text-left p-6 sm:p-9 group
                   sm:flex sm:items-start sm:gap-6">
        {/* 모바일: 코드·레벨·셰브론을 한 줄로 먼저 놓고 제목을 아래로 내린다.
            좁은 폭에서 가운데 영역이 짜부라지지 않도록 가로 배치를 sm 이상으로 미룬다. */}
        <span className="flex items-center justify-between gap-4 mb-4 sm:hidden">
          <span className="type-c1 font-en font-bold text-[var(--accent-strong)]">{c.code}</span>
          <span className="flex items-center gap-3">
            <span className="type-c2 px-3 py-1.5 rounded-[6px] bg-[var(--surface-2)] text-[var(--text-2)] whitespace-nowrap">
              {c.level}
            </span>
            <FiChevronDown size={20}
              className={`text-[var(--text-3)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </span>
        </span>

        <span className="hidden sm:block type-c1 font-en font-bold text-[var(--accent-strong)] pt-1.5 shrink-0 w-12">
          {c.code}
        </span>

        <span className="block sm:flex-1 sm:min-w-0">
          <span className="block sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-4 mb-2 sm:mb-3">
            <span className="block type-h2 text-[var(--text-1)]">{c.title}</span>
            <span className="block mt-1 sm:mt-0 type-c1 text-[var(--text-3)] font-en">{c.weeks}</span>
          </span>
          <span className="block type-b3 text-[var(--text-2)] leading-[1.75] mt-3 sm:mt-0 sm:pr-4">{c.summary}</span>
        </span>

        <span className="hidden sm:flex shrink-0 flex-col items-end gap-3">
          <span className="type-c2 px-3 py-1.5 rounded-[6px] bg-[var(--surface-2)] text-[var(--text-2)] whitespace-nowrap">
            {c.level}
          </span>
          <FiChevronDown size={20}
            className={`text-[var(--text-3)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
        <div className="px-6 sm:px-9 pb-8">
          <dl className="border-t border-[var(--border)]">
            {c.outline.map((o) => (
              <div key={o.range}
                className="py-5 border-b border-[var(--border)]
                           sm:grid sm:grid-cols-12 sm:gap-x-6 sm:items-baseline">
                <dt className="sm:col-span-2 type-b4 text-[var(--accent-strong)] font-en whitespace-nowrap mb-1 sm:mb-0">
                  {o.range}
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

      {/* ═══ 라이트 본문 ═══ */}
      <div data-surface="light" className="bg-[var(--canvas)] text-[var(--text-1)]">

        {/* ━━━━━━ HERO — 문서 표지 ━━━━━━ */}
        <section className="pt-36 sm:pt-44 pb-16 sm:pb-24">
          <div className={container}>
            <motion.div {...onMount} variants={fadeLeft} className="flex items-center gap-3 mb-10">
              <Link href="/services" className="type-c1 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors font-en">
                Services
              </Link>
              <span className="type-c1 text-[var(--text-faint)]">/</span>
              <span className="type-c1 text-[var(--accent-strong)] font-en">{d.en}</span>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-12">
              <div className="lg:col-span-7">
                <motion.h1 {...onMount} variants={stagger}
                  className="font-bold text-[var(--text-1)] tracking-[-0.02em] leading-[1.12] mb-9"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
                  <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                    <motion.span variants={clipUp} className="block">현업에서 실제로</motion.span>
                  </span>
                  <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                    <motion.span variants={clipUp} className="block">쓰는 것만 가르칩니다</motion.span>
                  </span>
                </motion.h1>
                <motion.p {...onMount} variants={fadeUp} className="type-b3 text-[var(--text-2)] leading-[1.9] max-w-xl">
                  {d.summary} 지난달 외주에서 쓴 도구와 절차를 그대로 가져옵니다.
                  마지막 주에는 수강생 각자의 결과물이 남습니다.
                </motion.p>
              </div>

              {/* 표지 우측 — 개요 카드 */}
              <motion.div {...onMount} variants={fadeRight} className="lg:col-span-5 lg:pl-8">
                <div className="border border-[var(--border)] rounded-card p-8 sm:p-9 bg-[var(--surface)]">
                  <p className="type-c1 font-en font-bold text-[var(--text-3)] uppercase tracking-[0.14em] mb-7">
                    Overview
                  </p>
                  <dl className="divide-y divide-[var(--border)]">
                    {d.stats.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-5 py-4 first:pt-0 last:pb-0">
                        <dt className="type-b3 text-[var(--text-2)]">{s.label}</dt>
                        <dd className="font-en type-h3 font-bold text-[var(--text-1)] font-mono-stat">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-7 pt-7 border-t border-[var(--border)] flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <span key={t} className="type-c2 px-3 py-1.5 rounded-[6px] bg-[var(--surface-2)] text-[var(--text-2)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* 실제 수업 현장 — 스톡 이미지가 대신할 수 없는 자리다 */}
        <section className="pb-20 sm:pb-28">
          <div className={container}>
            <motion.figure {...inView} variants={fadeUp}>
              <div className="relative aspect-[4/3] sm:aspect-[2/1] overflow-hidden rounded-card bg-[var(--surface-2)]">
                <SafeImage
                  src="/images/projects/미래산업과학고.webp"
                  alt="미래산업과학고등학교 수업 현장 — 화면에 C# 변수 선언과 초기화 슬라이드가 떠 있다"
                  fill
                  className="absolute inset-0 object-[50%_42%]"
                />
              </div>
              <figcaption className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <span className="type-b3 text-[var(--text-2)]">
                  미래산업과학고등학교 · 정규 수업 9개월 과정
                </span>
                <span className="type-c1 text-[var(--text-3)]">
                  화면은 C# 변수 선언과 초기화를 다루던 3주차 수업입니다
                </span>
              </figcaption>
            </motion.figure>
            <motion.div {...inView} variants={lineDraw} className="h-px bg-[var(--border)] mt-16 sm:mt-20 origin-left" />
          </div>
        </section>

        {/* ━━━━━━ 본문 — 좌 스티키 목차 / 우 콘텐츠 ━━━━━━ */}
        <div className={`${container} pb-24 sm:pb-32`} ref={bodyRef}>
          <div className="grid lg:grid-cols-12 gap-x-gutter">

            {/* 목차 */}
            <aside className="hidden lg:block lg:col-span-3">
              <nav className="sticky top-28 pr-6">
                <p className="type-c1 font-en font-bold text-[var(--text-3)] uppercase tracking-[0.14em] mb-6">
                  Contents
                </p>
                <ul className="space-y-0">
                  {SECTIONS.map((s) => {
                    const on = active === s.id;
                    return (
                      <li key={s.id}>
                        <a href={`#${s.id}`}
                          className={`flex items-baseline gap-3 py-3 border-l-2 pl-4 -ml-px transition-colors duration-200 ${
                            on
                              ? 'border-[var(--accent)] text-[var(--text-1)]'
                              : 'border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)]'
                          }`}>
                          <span className="type-c2 font-en font-mono-stat">{s.no}</span>
                          <span className="type-b3">{s.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/contact?domain=edu"
                  className="mt-9 inline-flex items-center gap-2 type-b4 text-[var(--accent-strong)] hover:gap-3 transition-all group">
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
                  <p className="index-num font-en mb-5">Curriculum</p>
                  <h2 className="type-h1 text-[var(--text-1)] mb-5">표준 커리큘럼</h2>
                  <p className="type-b3 text-[var(--text-2)] leading-[1.9] max-w-2xl">
                    아래 세 과정은 <strong className="font-bold text-[var(--text-1)]">표준안</strong>입니다.
                    실제 과정은 기관의 목표·수준·시수에 맞춰 주차 구성과 난이도를 다시 짜서 제안드립니다.
                  </p>
                </motion.div>
                <div className="space-y-4">
                  {eduCourses.map((c, i) => <Course key={c.id} c={c} defaultOpen={i === 0} />)}
                </div>
              </section>

              {/* ── 02 교육 대상 ── */}
              <section id="audience" className="scroll-mt-28 pb-20 sm:pb-28 border-t border-[var(--border)] pt-16 sm:pt-20">
                <motion.div {...inView} variants={fadeUp} className="mb-10 sm:mb-14">
                  <p className="index-num font-en mb-5">Audience</p>
                  <h2 className="type-h1 text-[var(--text-1)]">어디서 진행했나</h2>
                </motion.div>
                <motion.div {...inView} variants={staggerTight} className="grid sm:grid-cols-3 gap-gutter">
                  {eduAudiences.map((a) => (
                    <motion.div key={a.no} variants={fadeUp}
                      className="border-t-2 border-[var(--accent)] pt-7">
                      <p className="index-num-lg font-en mb-5">{a.no}</p>
                      <h3 className="type-h3 font-bold text-[var(--text-1)] mb-4">{a.title}</h3>
                      <p className="type-b3 text-[var(--text-2)] leading-[1.85] mb-6">{a.detail}</p>
                      <ul className="space-y-2">
                        {a.points.map((pt) => (
                          <li key={pt} className="flex items-center gap-2.5 type-c1 text-[var(--text-3)]">
                            <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
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
                  <p className="index-num font-en mb-5">Format</p>
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
                  <p className="index-num font-en mb-5">Record</p>
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
                      <p className="col-span-3 sm:col-span-2 font-en type-b2 text-[var(--text-3)] font-mono-stat">{a.year}</p>
                      <h3 className="col-span-9 sm:col-span-5 type-b2 text-[var(--text-1)]">{a.title}</h3>
                      <p className="col-span-7 sm:col-span-3 type-b3 text-[var(--text-2)]">{a.organization}</p>
                      <p className="col-span-5 sm:col-span-2 type-b4 text-[var(--accent-strong)] sm:text-right">{a.rank}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━ CTA — 다크로 되돌아가 푸터와 이어진다 ━━━━━━ */}
      <section className="py-28 sm:py-40 bg-[var(--gray-600)]">
        <div className={container}>
          <div className="grid lg:grid-cols-12 gap-x-gutter gap-y-10 items-end">
            <div className="lg:col-span-7">
              <motion.p {...inView} variants={fadeLeft} className="type-c1 font-en uppercase tracking-[0.14em] text-white/55 mb-9">
                Contact
              </motion.p>
              <motion.h2 {...inView} variants={stagger}
                className="font-bold text-white tracking-[-0.02em] leading-[1.15] mb-8"
                style={{ fontSize: 'clamp(1.875rem, 4.4vw, 3.25rem)' }}>
                <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <motion.span variants={clipUp} className="block">커리큘럼은 기관에 맞춰</motion.span>
                </span>
                <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <motion.span variants={clipUp} className="block text-[var(--domain-200)]">다시 씁니다.</motion.span>
                </span>
              </motion.h2>
              <motion.p {...inView} variants={fadeLeft} className="text-[17px] text-white/55 leading-[1.8] max-w-lg">
                — 대상, 시수, 목표만 알려주시면 표준 커리큘럼을 그에 맞게 재구성해 제안서로 보내드립니다.
              </motion.p>
            </div>
            <motion.div {...inView} variants={fadeRight} className="lg:col-span-5 flex flex-wrap items-center gap-7">
              <Link href="/contact?domain=edu"
                className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-pill type-b3 font-bold
                           text-[var(--gray-600)] bg-[var(--domain-200)] hover:bg-[var(--domain-100)] transition-colors duration-300">
                강의 · 교육 문의
                <FiArrowUpRight size={17} className={arrowHover} />
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="text-[15px] font-semibold text-white/60 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
                {CONTACT_EMAIL}
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
