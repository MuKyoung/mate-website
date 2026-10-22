'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DomainIntro from '@/components/domain/DomainIntro';
import SectionHead from '@/components/ui/SectionHead';
import { serviceTabs } from '@/data/navigation';
import { eduCourses, eduAudiences, eduFormat, eduRecord, domainByKey } from '@/data/domains';
import { fadeUp, staggerTight, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowCircle, arrowHover, btnPoint, btnSm, chipLine, container, numTile, radiusCard } from '@/lib/styles';

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
            <span className="type-h3 text-ink">{c.title}</span>
            <span className={chipLine}>{c.level}</span>
          </span>
          <span className="type-b3 mt-3 block text-ink-2">{c.summary}</span>
        </span>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border transition-colors ${
          open ? 'border-point-200 bg-point-200 text-white' : 'border-[#d1d7de] text-gray-500'
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
                  <dt className="text-[14px] font-bold tabular-nums text-point-200">{String(i + 1).padStart(2, '0')}</dt>
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
      <PageHeader eyebrow="사업영역" title={d.kr} tabs={serviceTabs} active="/education" />

      <DomainIntro
        eyebrow="Education"
        title={<>현업에서 실제로<br /><b>쓰는 것만 가르칩니다</b></>}
        desc={<>{d.summary} 마지막 주에는 수강생 각자의 결과물이 남습니다.</>}
        stats={d.stats}
        tags={d.tags}
        media={(
          <Link href="/projects/1" className="group block">
            <div className={`relative aspect-[4/3] overflow-hidden bg-gray-100 ${radiusCard}`}>
              <Image src="/images/projects/미래산업과학고.webp" fill sizes="(min-width: 1024px) 45vw, 100vw"
                alt="미래산업과학고등학교 수업 현장. 화면에 C# 변수 선언과 초기화 슬라이드가 떠 있다"
                className="object-cover object-[50%_42%] transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <p className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[16px] font-bold text-ink transition-colors group-hover:text-point-200 sm:text-[18px]">미래산업과학고등학교 · 정규 수업</span>
              <span className={arrowCircle}><FiArrowUpRight size={16} /></span>
            </p>
          </Link>
        )}
      />

      {/* ━━ 커리큘럼 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHead eyebrow="Curriculum" title={<><b>표준 커리큘럼</b></>}
                desc="아래 세 과정은 표준안입니다. 실제 과정은 기관의 목표·수준·시수에 맞춰 주차 구성과 난이도를 다시 짜서 제안드립니다." />
              <Link href="/contact?domain=edu" className={`${btnPoint} ${btnSm} mt-8`}>
                강의 문의하기
                <FiArrowUpRight size={15} className={arrowHover} />
              </Link>
            </div>
          </div>
          <motion.ul {...inView} variants={staggerTight} className="space-y-3 lg:col-span-8">
            {eduCourses.map((c, i) => <Course key={c.id} c={c} defaultOpen={i === 0} />)}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 교육 대상 ━━ */}
      <section data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Audience" title={<><b>교육 대상</b></>} />
          <motion.ul {...inView} variants={staggerTight} className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-3 lg:gap-5">
            {eduAudiences.map((a) => (
              <motion.li key={a.no} variants={fadeUp}
                className={`flex flex-col border border-line bg-white p-6 sm:p-8 ${radiusCard}`}>
                <span className={numTile}>{a.no}</span>
                <h3 className="type-h3 mt-8 text-ink">{a.title}</h3>
                <p className="type-b3 mt-3 text-ink-2">{a.detail}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                  {a.points.map((pt) => <li key={pt} className={chipLine}>{pt}</li>)}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━ 진행 조건 + 기관과 함께한 기록 ━━ */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid gap-20 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <SectionHead eyebrow="Format" title={<><b>진행 조건</b></>} />
            <motion.dl {...inView} variants={staggerRows} className="mt-10 border-t-2 border-ink">
              {eduFormat.map((f) => (
                <motion.div key={f.k} variants={rowIn}
                  className="grid gap-1 border-b border-gray-200 py-5 sm:grid-cols-[140px_1fr] sm:gap-4">
                  <dt className="type-b2 text-ink">{f.k}</dt>
                  <dd className="type-b3 text-ink-2">{f.v}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>

          <div>
            <SectionHead eyebrow="Record" title={<>기관과 함께한 <b>기록</b></>}
              desc="강의와 별개로, 교육·연구 기관과 진행한 사업과 수상 이력입니다. 커리큘럼은 이 경험에서 나옵니다." />
            <motion.ul {...inView} variants={staggerRows} className="mt-10 border-t-2 border-ink">
              {record.map((a) => (
                <motion.li key={a.id} variants={rowIn}
                  className="grid grid-cols-[56px_1fr] gap-x-4 gap-y-1 border-b border-gray-200 py-5 sm:grid-cols-[64px_1fr_auto] sm:items-baseline">
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
