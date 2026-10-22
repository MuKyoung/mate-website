'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import { serviceTabs } from '@/data/navigation';
import { eduCourses, eduAudiences, eduFormat, eduRecord, domainByKey } from '@/data/domains';
import { fadeUp, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowHover, btnPoint, btnSm, container, radiusCard } from '@/lib/styles';

const d = domainByKey.edu;
const record = eduRecord.slice(0, 6);

/** 커리큘럼 한 과정 - 누르면 주차 구성이 펼쳐진다 */
function Course({ c, defaultOpen }: { c: (typeof eduCourses)[number]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.li variants={fadeUp}
      className={`overflow-hidden border bg-white transition-colors duration-300 ${open ? 'border-point-200' : 'border-line'} ${radiusCard}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-start gap-4 p-6 text-left sm:gap-6 sm:p-8">
        <span className="pt-1 text-[14px] font-bold text-point-200">{c.code}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="type-h2 text-ink">{c.title}</span>
            <span className="rounded-pill bg-gray-100 px-3 py-1 text-[13px] font-bold text-gray-500">{c.level}</span>
          </span>
          <span className="type-b3 mt-3 block text-ink-2">{c.summary}</span>
        </span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill transition-colors ${
          open ? 'bg-point-200 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {open ? <FiMinus size={16} /> : <FiPlus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden">
            <dl className="mx-6 mb-6 border-t border-line sm:mx-8 sm:mb-8 sm:ml-[88px]">
              {c.outline.map((o, i) => (
                <div key={o.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[56px_200px_1fr] sm:gap-4">
                  <dt className="text-[13px] font-bold tabular-nums text-point-200">{String(i + 1).padStart(2, '0')}</dt>
                  <dd className="type-b2 text-ink">{o.title}</dd>
                  <dd className="type-b3 text-ink-2">{o.detail}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function EducationClient() {
  return (
    <div data-domain="edu">
      {/* 강의 사진은 아래 소개 칸에서 크게 쓴다 - 머리에는 깔지 않는다 */}
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/education" />

      <DomainIntro
        eyebrow="교육 · 강의"
        title={<>현업에서 실제로<br /><b>쓰는 것만 가르칩니다</b></>}
        desc={<>{d.summary} 마지막 주에는 수강생 각자의 결과물이 남습니다.</>}
        media={(
          <Link href="/projects/1" className="group absolute inset-0 block">
            <Image src="/images/projects/미래산업과학고.webp" fill sizes="(min-width: 1024px) 45vw, 100vw"
              alt="미래산업과학고등학교 수업 현장. 화면에 C# 변수 선언과 초기화 슬라이드가 떠 있다"
              className="object-cover object-[50%_42%] transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-4 py-2 text-[13px] font-bold text-ink shadow-float">
              미래산업과학고등학교 · 정규 수업
              <FiArrowUpRight size={14} className={arrowHover} />
            </span>
          </Link>
        )}>
        <div className="flex flex-wrap gap-1.5">
          {d.tags.map((t) => (
            <span key={t} className="rounded-pill border border-line bg-white px-3 py-1.5 text-[13px] font-bold text-gray-500">{t}</span>
          ))}
        </div>
      </DomainIntro>

      {/* ━━ 커리큘럼 ━━ */}
      <section data-header="light" className="bg-white pb-24 pt-4 sm:pb-32 xl:pb-[160px]">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
          <motion.div {...inView} variants={fadeUp} className="lg:col-span-4">
            <p className="eyebrow mb-3">Curriculum</p>
            <h2 className="type-h1 text-ink"><b>표준 커리큘럼</b></h2>
            <p className="type-b3 mt-5 max-w-sm text-ink-2">
              아래 세 과정은 <b className="text-ink">표준안</b>입니다.
              실제 과정은 기관의 목표·수준·시수에 맞춰 주차 구성과 난이도를 다시 짜서 제안드립니다.
            </p>
            <Link href="/contact?domain=edu" className={`${btnPoint} ${btnSm} mt-8`}>
              강의 문의하기
              <FiArrowUpRight size={15} className={arrowHover} />
            </Link>
          </motion.div>
          <motion.ul {...inView} variants={staggerTight} className="space-y-3 lg:col-span-8">
            {eduCourses.map((c, i) => <Course key={c.id} c={c} defaultOpen={i === 0} />)}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 교육 대상 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
        <div className={container}>
          <motion.div {...inView} variants={fadeUp} className="text-center">
            <p className="eyebrow mb-3">Audience</p>
            <h2 className="type-h1 text-ink"><b>교육 대상</b></h2>
          </motion.div>
          <motion.ul {...inView} variants={staggerTight} className="mt-12 grid gap-3 sm:mt-14 md:grid-cols-3 lg:gap-4">
            {eduAudiences.map((a) => (
              <motion.li key={a.no} variants={fadeUp}
                className={`flex flex-col border border-line bg-white p-6 sm:p-8 ${radiusCard}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-point-200 text-[14px] font-bold text-white">{a.no}</span>
                <h3 className="type-h2 mt-8 text-ink">{a.title}</h3>
                <p className="type-b3 mt-3 text-ink-2">{a.detail}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-5">
                  {a.points.map((pt) => (
                    <li key={pt} className="rounded-pill bg-gray-100 px-3 py-1.5 text-[13px] font-bold text-gray-500">{pt}</li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 진행 조건 + 기관과 함께한 기록 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-[160px]">
        <div className={`${container} grid gap-20 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <motion.div {...inView} variants={fadeUp}>
              <p className="eyebrow mb-3">Format</p>
              <h2 className="type-h1 text-ink"><b>진행 조건</b></h2>
            </motion.div>
            <motion.dl {...inView} variants={staggerRows} className="mt-10 border-t-2 border-ink">
              {eduFormat.map((f) => (
                <motion.div key={f.k} variants={rowIn}
                  className="grid gap-1 border-b border-line py-5 sm:grid-cols-[140px_1fr] sm:gap-4">
                  <dt className="type-b2 text-ink">{f.k}</dt>
                  <dd className="type-b3 text-ink-2">{f.v}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>

          <div>
            <motion.div {...inView} variants={fadeUp}>
              <p className="eyebrow mb-3">Record</p>
              <h2 className="type-h1 text-ink">기관과 함께한 <b>기록</b></h2>
              <p className="type-b3 mt-5 max-w-lg text-ink-2">
                강의와 별개로, 교육·연구 기관과 진행한 사업과 수상 이력입니다. 커리큘럼은 이 경험에서 나옵니다.
              </p>
            </motion.div>
            <motion.ul {...inView} variants={staggerRows} className="mt-10 border-t-2 border-ink">
              {record.map((a) => (
                <motion.li key={a.id} variants={rowIn}
                  className="grid grid-cols-[56px_1fr] gap-x-4 gap-y-1 border-b border-line py-5 sm:grid-cols-[64px_1fr_auto] sm:items-baseline">
                  <span className="text-[15px] font-bold tabular-nums text-gray-500">{a.year}</span>
                  <span>
                    <span className="block text-[16px] font-bold text-ink">{a.title}</span>
                    <span className="mt-1 block text-[14px] text-gray-500">{a.organization}</span>
                  </span>
                  <span className="col-start-2 text-[14px] font-bold text-point-200 sm:col-start-auto sm:text-right">{a.rank}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>
    </div>
  );
}
