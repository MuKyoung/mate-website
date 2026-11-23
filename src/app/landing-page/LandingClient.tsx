'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiPlay, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import PartnersBand from '@/components/home/PartnersBand';
import type { LandingDesign } from '@/types';
import { landingDesigns, landingFields, landingVocab } from '@/data/landingDesigns';
import {
  landingContactHref, landingHero, landingMotion, landingProcess, landingScope, landingScopeNote, landingTabs,
  landingViewQuery, readLandingView, rightsNotice, saveLandingView, type LandingView,
} from '@/data/landingService';
import { fadeUp, inView, rowIn, staggerRows, staggerTight } from '@/lib/motion';
import { arrowHover, btnLight, chip, container, numTile, radiusCard } from '@/lib/styles';
import MotionFrame from './MotionFrame';

type FilterKey = 'field' | 'purpose' | 'mood' | 'visual';
const EMPTY: Record<FilterKey, string[]> = { field: [], purpose: [], mood: [], visual: [] };

const groups: { key: FilterKey; label: string; items: [string, string][] }[] = [
  { key: 'field', label: '업종', items: Object.entries(landingFields) },
  { key: 'purpose', label: '목적', items: landingVocab.purposes.map((p): [string, string] => [p, p]) },
  { key: 'mood', label: '분위기', items: landingVocab.moods.map((p): [string, string] => [p, p]) },
  { key: 'visual', label: '표현', items: landingVocab.visualStyles.map((p): [string, string] => [p, p]) },
];

/** 움직이는 페이지(모션 그래픽 포함) - 그림 대신 실제로 열리는 샘플이 있는 디자인 */
const motionDesigns = landingDesigns.filter((d) => d.demo);

/** 카드 그림 위의 '체험' 표시 */
const motionBadge = 'absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-pill bg-ink/85 px-2.5 py-1 text-[12px] font-bold text-white';

/**
 * 움직이는 페이지 카드 - 마우스를 올리면 그 자리에서 실제 페이지가 돈다.
 * 터치 기기에는 올려 두기가 없으므로 그림만 보이고, 누르면 상세에서 열린다.
 */
function MotionCard({ d, view }: { d: LandingDesign; view: LandingView }) {
  const [live, setLive] = useState(false);
  const timer = useRef<number>();
  const enter = () => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    timer.current = window.setTimeout(() => setLive(true), 220);
  };
  const leave = () => { window.clearTimeout(timer.current); setLive(false); };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const mobile = view === 'mobile';

  return (
    <Link href={`${d.id}/${landingViewQuery(view)}`} className="group block" onMouseEnter={enter} onMouseLeave={leave}>
      <div className={`relative overflow-hidden bg-night-2 transition-transform duration-300 group-hover:-translate-y-1 ${
        mobile ? 'rounded-[20px] border-[5px] border-white/25' : 'rounded-[12px] border border-white/15'}`}>
        {mobile ? (
          <Image src={d.mobileThumb} alt={`${d.title} 모바일 첫 화면`} width={360} height={779} className="aspect-[390/844] w-full object-cover object-top" />
        ) : (
          <Image src={d.thumb} alt={`${d.title} PC 첫 화면`} width={640} height={400} className="aspect-[16/10] w-full object-cover object-top" />
        )}
        {live && d.demo && (
          <div className="absolute inset-0">
            <MotionFrame src={d.demo} title={`${d.title} 미리보기`} w={mobile ? 390 : 1440} h={mobile ? 844 : 900} interactive={false} />
          </div>
        )}
        <span className={motionBadge}><FiPlay aria-hidden /> 체험</span>
      </div>
      <p className="mt-3 font-mono text-[12px] text-gray-300">{d.id}</p>
      <h3 className="mt-1.5 text-[16px] font-bold leading-snug text-white group-hover:text-point-light">{d.title}</h3>
      <p className="mt-1 text-[13px] text-gray-300">{d.fieldLabel}</p>
    </Link>
  );
}

/**
 * 단일 랜딩페이지 제작 - 서비스 소개와 스타일 갤러리.
 * 갤러리 카드는 걸러질 때마다 다시 그려지므로 스크롤 등장 효과를 걸지 않는다(걸러진 뒤 안 보이는 일이 없게).
 */
export default function LandingClient() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Record<FilterKey, string[]>>(EMPTY);
  /* 미리보기 화면 - 서버 그림과 같게 PC 로 시작하고, 상세에서 돌아오면 고른 화면을 되살린다 */
  const [view, setView] = useState<LandingView>('pc');
  useEffect(() => {
    const v = readLandingView();
    if (v) setView(v);
  }, []);
  const pickView = (v: LandingView) => { setView(v); saveLandingView(v); };

  const toggle = (k: FilterKey, v: string) =>
    setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const reset = () => { setQ(''); setSel(EMPTY); };
  const filtered = q.trim() !== '' || Object.values(sel).some((a) => a.length > 0);

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return landingDesigns.filter((d) => {
      if (sel.field.length && !sel.field.includes(String(d.field))) return false;
      if (sel.purpose.length && !d.purposes.some((p) => sel.purpose.includes(p))) return false;
      if (sel.mood.length && !d.moods.some((p) => sel.mood.includes(p))) return false;
      if (sel.visual.length && !d.visualStyles.some((p) => sel.visual.includes(p))) return false;
      if (words.length) {
        const hay = [d.id, d.title, d.summary, d.fieldLabel, ...d.industries, ...d.purposes, ...d.moods, ...d.visualStyles]
          .join(' ').toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }, [q, sel]);

  return (
    <>
      {/* 하위 도메인(landingpage.devteammate.co.kr)에서 따로 여는 화면이라 본 사이트 사업영역 탭은 달지 않고, 같은 하위 도메인의 디자인 템플릿 갤러리로 가는 탭만 둔다 */}
      <PageHeader eyebrow="단일 랜딩페이지 제작" title={<>당신의 공간과 사람,<br /><b>제품이 보이는 한 페이지.</b></>}
        desc={landingHero.sub}
        tabs={[{ href: landingTabs.here, label: '랜딩페이지 디자인' }, { href: landingTabs.templates, label: '디자인 템플릿' }]}
        active={landingTabs.here} note={rightsNotice.site} />
      <PartnersBand />

      {/* 맡길 수 있는 일 */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Scope" title={<><b>필요한 만큼</b><br />맡기세요</>} desc={landingHero.desc} />
          <motion.div {...inView} variants={staggerTight} className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {landingScope.map((s) => (
              <motion.article key={s.title} variants={fadeUp} className={`bg-white p-6 sm:p-8 ${radiusCard}`}>
                <h3 className="text-[20px] font-bold text-ink sm:text-[22px]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-gray-500 sm:text-[16px]">{s.desc}</p>
              </motion.article>
            ))}
          </motion.div>
          <p className="mt-6 text-[15px] text-gray-500">{landingScopeNote}</p>
        </div>
      </section>

      {/* 움직이는 페이지 - 그림이 아니라 실제로 열리는 샘플. 아래 갤러리에도 같은 번호로 들어 있다(표현 > 모션 그래픽) */}
      {motionDesigns.length > 0 && (
        <section id="motion" data-header="dark" className="night-grid on-night scroll-mt-24 py-24 sm:py-32 xl:py-40">
          <div className={container}>
            <SectionHead dark eyebrow="Motion" title={<>움직이는 디자인은<br /><b>직접 열어 보세요</b></>} desc={landingMotion.desc} />
            <ul className={`mt-12 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] sm:mt-16 sm:grid sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:pb-0 ${
              view === 'pc' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-4 lg:grid-cols-5'}`}>
              {motionDesigns.map((d) => (
                <li key={d.id} className={`min-w-0 shrink-0 snap-start sm:w-auto ${view === 'pc' ? 'w-[78%]' : 'w-[44%]'}`}>
                  <MotionCard d={d} view={view} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 스타일 갤러리 */}
      <section id="gallery" data-header="light" className="scroll-mt-24 bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Gallery" title={<>스타일을 고르고<br /><b>번호로 문의하세요</b></>}
            desc="업종, 목적, 분위기로 골라 보세요. 마음에 드는 디자인의 번호를 문의에 적어 주시면 그 스타일로 상담을 시작합니다." />

          <div className="mt-10 grid gap-3 border-y border-gray-200 py-5 sm:mt-14">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="landing-q" className="flex min-w-0 flex-[1_1_260px] items-center gap-2 rounded-pill border border-gray-200 px-5 py-3">
                <FiSearch aria-hidden className="shrink-0 text-gray-400" />
                <span className="sr-only">검색</span>
                <input id="landing-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
                  placeholder="업종이나 분위기로 찾기 (예: 카페, 축제, 신뢰감)"
                  className="w-full border-0 bg-transparent p-0 text-[16px] text-ink placeholder:text-gray-400 outline-none focus:ring-0" />
              </label>
              <div role="group" aria-label="미리보기 화면" className="inline-flex shrink-0 rounded-pill border border-gray-200 p-1">
                {(['pc', 'mobile'] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)}
                    className={`rounded-pill px-4 py-1.5 text-[14px] font-bold transition-colors ${view === v ? 'bg-ink text-white' : 'text-gray-500 hover:text-ink'}`}>
                    {v === 'pc' ? 'PC' : '모바일'}
                  </button>
                ))}
              </div>
              <p className="text-[15px] text-gray-500" aria-live="polite"><b className="text-ink">{list.length}</b>개 스타일</p>
              {filtered && (
                <button type="button" onClick={reset} className="text-[15px] font-bold text-point-200">필터 초기화</button>
              )}
            </div>
            {groups.map((g) => (
              <div key={g.key} className="flex min-w-0 items-center gap-3">
                <span className="w-12 shrink-0 text-[14px] font-bold text-gray-500">{g.label}</span>
                <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {g.items.map(([value, label]) => {
                    const on = sel[g.key].includes(value);
                    return (
                      <button key={value} type="button" aria-pressed={on} onClick={() => toggle(g.key, value)}
                        className={`shrink-0 whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-[14px] transition-colors ${
                          on ? 'border-ink bg-ink text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-point-200 hover:text-point-200'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {list.length === 0 ? (
            <p className="py-16 text-[16px] text-gray-500">조건에 맞는 스타일이 없습니다. 필터를 하나 풀어 보세요.</p>
          ) : (
            <ul className={view === 'pc'
              ? 'mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5'}>
              {list.map((d) => (
                <li key={d.id} className="min-w-0">
                  {/* 상대 주소 - 하위 도메인에서는 /LP-001/, 본 사이트 경로에서는 /landing-page/LP-001/ 로 간다. 모바일로 보고 있으면 상세도 모바일로 연다 */}
                  <Link href={`${d.id}/${landingViewQuery(view)}`} className="group block">
                    {view === 'pc' ? (
                      <div className="relative overflow-hidden rounded-[12px] border border-gray-200 bg-gray-100 transition-transform duration-300 group-hover:-translate-y-1">
                        <Image src={d.thumb} alt={`${d.title} PC 첫 화면`} width={640} height={400}
                          className="aspect-[16/10] w-full object-cover object-top" />
                        {d.demo && <span className={motionBadge}><FiPlay aria-hidden /> 체험</span>}
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-[20px] border-[5px] border-ink bg-white transition-transform duration-300 group-hover:-translate-y-1">
                        <Image src={d.mobileThumb} alt={`${d.title} 모바일 첫 화면`} width={360} height={779}
                          className="aspect-[390/844] w-full object-cover object-top" />
                        {d.demo && <span className={motionBadge}><FiPlay aria-hidden /> 체험</span>}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-[12px]">
                      <span className="font-mono text-ink">{d.id}</span>
                      <span className={chip}>{d.demo ? '움직이는 페이지' : d.kind === 'template' ? '외부 디자인 기반' : 'MATE 시안'}</span>
                    </div>
                    <h3 className="mt-2 text-[16px] font-bold leading-snug text-ink group-hover:text-point-200">{d.title}</h3>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {[d.fieldLabel, ...d.purposes.slice(0, 2), ...d.moods.slice(0, 2)].join(' · ')}
                    </p>
                    {d.credit && (
                      <p className="mt-1 text-[12px] text-gray-400">{d.kind === 'template' ? '원작' : '바탕'} {d.credit.creator} · {d.credit.license}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 제작 과정 */}
      <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-40">
        <div className={`${container} grid gap-12 lg:grid-cols-12 lg:gap-8`}>
          <div className="lg:col-span-4">
            <SectionHead eyebrow="Process" title={<>상담부터 공개까지<br /><b>여섯 단계</b></>} desc="필요한 단계만 고를 수 있습니다." />
          </div>
          <motion.ol {...inView} variants={staggerRows} className="border-t-2 border-ink lg:col-span-7 lg:col-start-6">
            {landingProcess.map((p, i) => (
              <motion.li key={p.title} variants={rowIn} className="flex items-start gap-5 border-b border-gray-200 py-6">
                <span className={numTile}>{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[18px] font-bold text-ink">
                    {p.title}
                    {p.optional && <span className={chip}>필요할 때</span>}
                  </p>
                  <p className="mt-1 text-[15px] leading-[1.7] text-gray-500">{p.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* 샘플 안내 · 출처 · 권리 표시는 본 사이트의 /credits/ 에 둔다(푸터 링크). 디자인마다의 출처는 상세 화면에 있다 */}
      {/* 문의 */}
      <section data-header="dark" className="night-grid on-night py-20 sm:py-28">
        <div className={`${container} flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 text-[28px] font-bold leading-tight text-white sm:text-[40px]">고른 스타일이 없어도 괜찮습니다</h2>
            <p className="mt-3 text-[16px] text-gray-300">업종과 가진 자료를 알려 주시면 맞는 스타일부터 함께 찾습니다.</p>
          </div>
          <Link href={landingContactHref()} className={btnLight}>
            제작 문의하기 <FiArrowUpRight className={arrowHover} />
          </Link>
        </div>
      </section>
    </>
  );
}
