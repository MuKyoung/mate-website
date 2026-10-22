'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { domains } from '@/data/domains';
import { games } from '@/data/games';
import { ongoing } from '@/data/ongoing';
import { easeEnter } from '@/lib/motion';
import { arrowHover, btnPoint, btnSm, chip, container, radiusCard } from '@/lib/styles';

interface Area {
  key: string;
  en: string;
  kr: string;
  href: string;
  lead: string;
  summary: string;
  stats: { value: string; label: string }[];
  tags: string[];
  now: { title: string; status: string }[];
}

/* 외주 세 영역 + 자체 게임. 문구는 영역 데이터와 사이트에 이미 있던 자체 게임 소개에서 가져온다 */
const AREAS: Area[] = [
  ...domains.map((d) => ({
    key: d.key,
    en: d.en,
    kr: d.kr,
    href: `/${d.slug}`,
    lead: d.lead,
    summary: d.summary,
    stats: d.stats,
    tags: d.tags,
    now: ongoing[d.key],
  })),
  {
    key: 'originals',
    en: 'Original Games',
    kr: '자체 게임 제작 · 퍼블리싱',
    href: '/services#originals',
    lead: 'MATE 이름으로 내는 게임',
    summary: '기획과 아트, 개발, 퍼블리싱까지 팀 안에서 끝냅니다. 판권도 저희가 쥡니다. 지금 두 타이틀을 만들고 있습니다.',
    stats: [{ value: `${games.length}종`, label: '제작 중인 타이틀' }],
    tags: ['자체 IP'],
    now: games.map((g) => ({ title: g.title, status: g.status })),
  },
];

/* 숫자 칸 수에 맞춰 나눈다 - 빈 칸이 회색으로 남지 않게 */
const STAT_COLS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-1 sm:grid-cols-3'];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 하는 일 - 왼쪽 탭 목록을 고르면 오른쪽 카드가 바뀐다.
 * 카드는 한 줄 소개 · 설명 · 숫자 · 지금 하는 일. 사진은 쓰지 않는다 -
 * 바로 위 첫 화면 큐브가 영역마다 작업 화면을 이미 보여 준다.
 */
export default function DomainTabs() {
  const [active, setActive] = useState(0);
  const a = AREAS[active];

  return (
    <section id="what" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-4">
          <SectionHead eyebrow="Services"
            title={<>세 영역의 외주 개발과<br /><b>자체 게임 제작{' '}·{' '}퍼블리싱</b></>} />

          <div role="tablist" aria-label="하는 일" className="mt-10 w-full lg:mt-14">
            {AREAS.map((it, i) => {
              const on = i === active;
              return (
                <button key={it.key} type="button" role="tab" aria-selected={on} onClick={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-4 p-4 text-left text-[16px] font-bold transition-colors sm:text-[18px] ${
                    on ? 'bg-point-200 text-white' : 'border-b border-gray-200 text-gray-400 hover:text-ink'
                  }`}>
                  <span className="flex items-baseline gap-3">
                    <span className={`text-[13px] ${on ? 'text-white/70' : 'text-gray-300'}`}>{pad(i + 1)}</span>
                    {it.kr}
                  </span>
                  <FiChevronRight size={20} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-7 xl:col-start-6">
          <AnimatePresence mode="wait">
            <motion.article key={a.key} role="tabpanel" aria-label={a.kr}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: easeEnter }}
              className={`overflow-hidden bg-white shadow-float-lg ring-1 ring-line ${radiusCard}`}>
              <div className="p-6 sm:p-10">
                <p className="type-b4 text-point-200">Service {pad(active + 1)}</p>
                <h3 className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="type-h2 text-ink">{a.kr}</span>
                  <span className="text-[14px] font-bold text-gray-400">{a.en}</span>
                </h3>
                <p className="type-h3 mt-6 text-ink">{a.lead}</p>
                <p className="type-b3 mt-3 text-ink-2">{a.summary}</p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {a.tags.map((t) => <span key={t} className={chip}>{t}</span>)}
                </div>

                <dl className={`mt-8 grid gap-px overflow-hidden rounded-card-sm bg-line ${STAT_COLS[Math.min(a.stats.length, 3)]}`}>
                  {a.stats.slice(0, 3).map((s) => (
                    <div key={s.label} className="flex flex-col-reverse bg-gray-100 px-5 py-5">
                      <dt className="mt-2 text-[13px] font-bold text-gray-500">{s.label}</dt>
                      <dd className="text-[34px] font-bold leading-none text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* 지금 하는 일 */}
              <div className="flex flex-col gap-5 border-t border-line px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-point-200">지금 하는 일</p>
                  <ul className="mt-2 space-y-1.5">
                    {a.now.map((w) => (
                      <li key={w.title} className="flex items-baseline gap-2 text-[15px] text-ink-2">
                        <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-pill bg-point-200" />
                        <span className="font-bold text-ink">{w.title}</span>
                        <span className="text-gray-500">{w.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={a.href} className={`${btnPoint} ${btnSm} shrink-0 self-start sm:self-auto`}>
                  자세히 보기
                  <FiArrowUpRight size={15} className={arrowHover} />
                </Link>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
