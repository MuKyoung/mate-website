'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TemplateItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight, FiPlay, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import PartnersBand from '@/components/home/PartnersBand';
import {
  landingContactHref, landingTabs, landingViewQuery, readLandingView, rightsNotice, saveLandingView, templateHero, LANDING_DEFAULT_VIEW, type LandingView,
} from '@/data/landingService';
import { templateFields, templateFormats, templateGenres, templateThumb, templates } from '@/data/templateLibrary';
import { arrowHover, btnLight, chip, chipLine, container } from '@/lib/styles';
import PhoneScreen, { hasPhoneView } from './PhoneScreen';

type FilterKey = 'format' | 'field' | 'genre';
const EMPTY: Record<FilterKey, string[]> = { format: [], field: [], genre: [] };

const groups: { key: FilterKey; label: string; items: [string, string][] }[] = [
  { key: 'format', label: '종류', items: templateFormats.map((f): [string, string] => [f.key, f.name]) },
  { key: 'field', label: '업종', items: templateFields.map((f): [string, string] => [String(f.id), f.name]) },
  { key: 'genre', label: '장르', items: templateGenres.map((g): [string, string] => [g.key, g.name]) },
];

/** 휴대폰 화면으로 볼 수 있는 종류의 이름 (모바일판이 따로 있는 상세페이지 + 카드뉴스 · 인스타그램 피드 · 릴스) - 모바일로 볼 때 안내에 쓴다 */
const mobileFormats = templateFormats.filter((f) => templates.some((t) => t.format === f.key && hasPhoneView(t))).map((f) => f.name);

/**
 * 디자인 템플릿 라이브러리 - 종류 · 업종 · 장르로 고르는 갤러리.
 * PC · 모바일 고르기(기본은 모바일): 모바일이면 휴대폰에서 보는 종류를 휴대폰 틀에 넣어 먼저 보여 주고
 * (상세페이지는 따로 짠 모바일판, 카드뉴스 · 인스타그램 피드 · 릴스는 같은 그림이 휴대폰에 뜬 모습),
 * 휴대폰 화면이 없는 종류(발표 자료 · 인쇄물 등)는 그 아래에 원래 모양으로 보여 준다. 고른 화면은 상세까지 이어진다.
 * 카드는 걸러질 때마다 다시 그려지므로 스크롤 등장 효과를 걸지 않는다(걸러진 뒤 안 보이는 일이 없게).
 */
export default function TemplatesClient() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Record<FilterKey, string[]>>(EMPTY);
  /* 미리보기 화면 - 모바일로 시작하고(서버 그림도 모바일), 상세에서 돌아오면 고른 화면을 되살린다 */
  const [view, setView] = useState<LandingView>(LANDING_DEFAULT_VIEW);
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
    return templates.filter((t) => {
      if (sel.format.length && !sel.format.includes(t.format)) return false;
      if (sel.field.length && !sel.field.includes(String(t.field))) return false;
      if (sel.genre.length && !sel.genre.includes(t.genre)) return false;
      if (words.length) {
        const hay = [t.id, t.title, t.summary, t.formatLabel, t.fieldLabel, t.genreLabel, t.business].join(' ').toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }, [q, sel]);
  /* 모바일이면 휴대폰 화면이 있는 것과 없는 것을 나눠 두 칸으로 보여 준다 */
  const phoneList = view === 'mobile' ? list.filter(hasPhoneView) : [];
  const restList = view === 'mobile' ? list.filter((t) => !hasPhoneView(t)) : list;
  const gridPc = 'mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4';
  const gridPhone = 'mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5';

  const card = (t: TemplateItem, phone: boolean) => (
    <li key={t.id} className="min-w-0">
      {/* 상대 주소 - 하위 도메인에서는 /templates/PT-01/, 본 사이트 경로에서는 /landing-page/templates/PT-01/ 로 간다 */}
      <Link href={`${t.id}/${landingViewQuery(view)}`} className="group block">
        {phone ? (
          /* 휴대폰 틀 - 상세페이지는 모바일판 첫 화면, SNS 종류는 글이 뜬 모습 */
          <div className="overflow-hidden rounded-[20px] border-[5px] border-ink bg-white transition-transform duration-300 group-hover:-translate-y-1">
            <PhoneScreen t={t} mode="card" />
          </div>
        ) : (
        /* 종류마다 비율이 달라(16:9 · 9:16 · 현수막 ...) 같은 크기 칸 안에 통째로 넣는다 */
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[12px] border border-gray-200 bg-gray-100 p-3 transition-transform duration-300 group-hover:-translate-y-1 sm:p-5">
          <Image src={templateThumb(t.id)} alt={`${t.title} 미리보기`} width={640} height={480}
            className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]" />
          {t.video > 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-ink/85 px-2.5 py-1 text-[12px] font-bold text-white">
              <FiPlay aria-hidden /> 영상
            </span>
          )}
        </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-mono text-ink">{t.id}</span>
          <span className={chip}>{t.formatLabel}</span>
          {t.mobile && <span className={chipLine}>PC · 모바일</span>}
        </div>
        <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink group-hover:text-point-200 sm:text-[16px]">{t.title}</h3>
        <p className="mt-1 text-[13px] text-gray-500">{[t.fieldLabel, t.genreLabel].join(' · ')}</p>
      </Link>
    </li>
  );

  return (
    <>
      {/* 탭은 상대 주소 - 하위 도메인에서는 / 과 /templates/, 본 사이트 경로에서는 /landing-page/ 아래로 간다 */}
      <PageHeader eyebrow="디자인 템플릿" title={<>발표 자료부터 현수막까지,<br /><b>고르고 바꿔서 만듭니다.</b></>}
        desc={templateHero.desc}
        tabs={[{ href: landingTabs.landing, label: '랜딩페이지 디자인' }, { href: landingTabs.here, label: '디자인 템플릿' }]}
        active={landingTabs.here} note={rightsNotice.site} />
      <PartnersBand />

      {/* 템플릿 갤러리 */}
      <section id="gallery" data-header="light" className="scroll-mt-24 bg-white py-24 sm:py-32 xl:py-40">
        <div className={container}>
          <SectionHead eyebrow="Templates" title={<>템플릿을 고르고<br /><b>번호로 문의하세요</b></>}
            desc="종류, 업종, 장르로 골라 보세요. 마음에 드는 템플릿의 번호를 문의에 적어 주시면 그 스타일로 상담을 시작합니다." />

          <div className="mt-10 grid gap-3 border-y border-gray-200 py-5 sm:mt-14">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="template-q" className="flex min-w-0 flex-[1_1_260px] items-center gap-2 rounded-pill border border-gray-200 px-5 py-3">
                <FiSearch aria-hidden className="shrink-0 text-gray-400" />
                <span className="sr-only">검색</span>
                <input id="template-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
                  placeholder="종류나 업종으로 찾기 (예: 포스터, 카페, 레트로)"
                  className="w-full border-0 bg-transparent p-0 text-[16px] text-ink placeholder:text-gray-400 outline-none focus:ring-0" />
              </label>
              {mobileFormats.length > 0 && (
                <div role="group" aria-label="미리보기 화면" className="inline-flex shrink-0 rounded-pill border border-gray-200 p-1">
                  {(['pc', 'mobile'] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)}
                      className={`rounded-pill px-4 py-1.5 text-[14px] font-bold transition-colors ${view === v ? 'bg-ink text-white' : 'text-gray-500 hover:text-ink'}`}>
                      {v === 'pc' ? 'PC' : '모바일'}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[15px] text-gray-500" aria-live="polite"><b className="text-ink">{list.length}</b>개 템플릿</p>
              {filtered && (
                <button type="button" onClick={reset} className="text-[15px] font-bold text-point-200">필터 초기화</button>
              )}
            </div>
            {view === 'mobile' && (
              <p className="text-[14px] text-gray-500">
                휴대폰에서 보는 {mobileFormats.join(' · ')} 템플릿을 휴대폰 화면으로 먼저 보여 주고, 나머지는 그 아래에 원래 모양으로 보여 줍니다.
              </p>
            )}
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
            <p className="py-16 text-[16px] text-gray-500">
              조건에 맞는 템플릿이 없습니다. 필터를 하나 풀어 보세요.
            </p>
          ) : (
            <>
              {phoneList.length > 0 && <ul className={gridPhone}>{phoneList.map((t) => card(t, true))}</ul>}
              {restList.length > 0 && (
                <div className={phoneList.length > 0 ? 'mt-20 border-t border-gray-200 pt-12' : ''}>
                  {view === 'mobile' && (
                    <>
                      <h3 className="text-[20px] font-bold text-ink sm:text-[24px]">휴대폰 화면이 없는 템플릿 <span className="text-gray-400">{restList.length}</span></h3>
                      <p className="mt-2 text-[14px] text-gray-500">발표 자료 · 문서 · 로고 · 유튜브 · 인쇄물은 원래 모양으로 보여 줍니다.</p>
                    </>
                  )}
                  <ul className={gridPc}>{restList.map((t) => card(t, false))}</ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* 샘플 안내 · 사진 출처 · 권리 표시는 본 사이트의 /credits/ 에 둔다(푸터 링크). 템플릿마다의 사진가는 상세 화면에 있다 */}
      {/* 문의 */}
      <section data-header="dark" className="night-grid on-night py-20 sm:py-28">
        <div className={`${container} flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 text-[28px] font-bold leading-tight text-white sm:text-[40px]">고른 템플릿이 없어도 괜찮습니다</h2>
            <p className="mt-3 text-[16px] text-gray-300">필요한 종류와 쓰임을 알려 주시면 맞는 스타일부터 함께 찾습니다.</p>
          </div>
          <Link href={landingContactHref()} className={btnLight}>
            제작 문의하기 <FiArrowUpRight className={arrowHover} />
          </Link>
        </div>
      </section>
    </>
  );
}
