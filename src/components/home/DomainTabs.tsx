'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight, FiChevronRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { domains } from '@/data/domains';
import { games } from '@/data/games';
import { ongoing } from '@/data/ongoing';
import { easeEnter } from '@/lib/motion';
import { arrowHover, btnPoint, btnSm, chipLine, radiusCard, container } from '@/lib/styles';

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
  seed: number;
}

/* 외주 세 영역 + 자체 게임. 문구는 영역 데이터와 사이트에 이미 있던 자체 게임 소개에서 가져온다 */
const AREAS: Area[] = [
  ...domains.map((d, i) => ({
    key: d.key,
    en: d.en,
    kr: d.kr,
    href: `/${d.slug}`,
    lead: d.lead,
    summary: d.summary,
    stats: d.stats,
    tags: d.tags,
    now: ongoing[d.key],
    seed: [5, 9, 13][i] ?? 5,
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
    seed: 17,
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 하는 일 - 왼쪽 갈래 목록을 고르면 오른쪽 판이 바뀐다.
 * 판 머리는 블록 모자이크 위에 영문 이름, 아래는 한 줄 소개 · 숫자 · 지금 하는 일.
 * 사진은 쓰지 않는다 - 바로 위 첫 화면 큐브가 영역마다 작업 화면을 이미 보여 준다.
 */
export default function DomainTabs() {
  const [active, setActive] = useState(0);
  const a = AREAS[active];

  return (
    <section id="what" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
      <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
        <div className="lg:col-span-4">
          <SectionHead eyebrow="What we do:"
            title={<>세 영역의 외주 개발과<br /><b>자체 게임 제작{'\u00a0'}·{'\u00a0'}퍼블리싱</b></>} />

          <div role="tablist" aria-label="하는 일" className="mt-10 border-t border-line lg:mt-14">
            {AREAS.map((it, i) => {
              const on = i === active;
              return (
                <button key={it.key} type="button" role="tab" aria-selected={on} onClick={() => setActive(i)}
                  className={`group relative flex w-full items-center gap-4 border-b border-line py-5 pl-4 pr-2 text-left transition-colors ${
                    on ? 'bg-point-100' : 'hover:bg-gray-100'
                  }`}>
                  <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 transition-colors ${on ? 'bg-point-200' : 'bg-transparent'}`} />
                  <span className={`font-mono text-[12px] ${on ? 'text-point-200' : 'text-gray-400'}`}>{pad(i + 1)}</span>
                  <span className={`flex-1 text-[17px] font-medium tracking-[-0.008em] ${on ? 'text-point-200' : 'text-ink'}`}>{it.kr}</span>
                  <FiChevronRight size={18} className={`transition-transform ${on ? 'translate-x-0.5 text-point-200' : 'text-gray-300'}`} />
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
              className={`overflow-hidden border border-line bg-white ${radiusCard}`}>
              {/* 머리 - 모자이크 위 영문 이름 */}
              <div className="relative h-[200px] overflow-hidden bg-night sm:h-[260px]">
                <BlockMosaic seed={a.seed} rows={8} className="absolute inset-0" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night via-[rgba(7,11,29,0.55)] to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
                  <p className="font-mono text-[12px] tracking-[0.04em] text-white/60">{pad(active + 1)} / {pad(AREAS.length)}</p>
                  <p className="mt-2 font-medium leading-none tracking-[-0.022em] text-white"
                    style={{ fontSize: 'clamp(2.25rem, 1.4rem + 2.4vw, 3.75rem)' }}>
                    {a.en}
                  </p>
                </div>
              </div>

              {/* 본문 */}
              <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-8">
                  <p className="type-b4 text-point-200">{a.kr}</p>
                  <h3 className="type-h3 mt-2 text-ink">{a.lead}</h3>
                  <p className="type-b3 mt-4 text-ink-2">{a.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {a.tags.map((t) => <span key={t} className={chipLine}>{t}</span>)}
                  </div>
                </div>
                <dl className="flex gap-8 border-t border-line pt-6 md:col-span-4 md:flex-col md:gap-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  {a.stats.slice(0, 2).map((s) => (
                    <div key={s.label} className="flex flex-col-reverse">
                      <dt className="mt-2 text-[13px] text-ink-3">{s.label}</dt>
                      <dd className="text-[34px] font-medium leading-none tracking-[-0.02em] text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* 지금 하는 일 */}
              <div className="flex flex-col gap-5 border-t border-line bg-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">Now:</p>
                  <ul className="mt-2 space-y-1">
                    {a.now.map((w) => (
                      <li key={w.title} className="flex items-baseline gap-2 text-[14px] text-ink-2">
                        <span aria-hidden className="h-[5px] w-[5px] shrink-0 translate-y-[-2px] bg-point-200" />
                        <span className="font-medium text-ink">{w.title}</span>
                        <span className="text-ink-3">{w.status}</span>
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
