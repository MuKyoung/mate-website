'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight, FiPlay, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import PartnersBand from '@/components/home/PartnersBand';
import {
  landingContactHref, landingTabs, landingViewQuery, readLandingView, saveLandingView, templateHero, type LandingView,
} from '@/data/landingService';
import {
  templateFields, templateFormats, templateGenres, templateMobileThumb, templateThumb, templates,
} from '@/data/templateLibrary';
import { arrowHover, btnLight, chip, chipLine, container } from '@/lib/styles';

type FilterKey = 'format' | 'field' | 'genre';
const EMPTY: Record<FilterKey, string[]> = { format: [], field: [], genre: [] };

const groups: { key: FilterKey; label: string; items: [string, string][] }[] = [
  { key: 'format', label: '종류', items: templateFormats.map((f): [string, string] => [f.key, f.name]) },
  { key: 'field', label: '업종', items: templateFields.map((f): [string, string] => [String(f.id), f.name]) },
  { key: 'genre', label: '장르', items: templateGenres.map((g): [string, string] => [g.key, g.name]) },
];

/** 모바일판이 따로 있는 종류의 이름 (지금은 상세페이지) - 모바일로 볼 때 안내에 쓴다 */
const mobileFormats = templateFormats.filter((f) => templates.some((t) => t.format === f.key && t.mobile)).map((f) => f.name);

/**
 * 디자인 템플릿 라이브러리 - 종류 · 업종 · 장르로 고르는 갤러리.
 * PC · 모바일 고르기: 모바일을 고르면 모바일판이 따로 있는 템플릿만 남기고 휴대폰 화면으로 보여 준다
 * (인쇄물 · 영상처럼 크기가 하나뿐인 종류에는 모바일판이 없다). 고른 화면은 상세까지 이어진다.
 * 카드는 걸러질 때마다 다시 그려지므로 스크롤 등장 효과를 걸지 않는다(걸러진 뒤 안 보이는 일이 없게).
 */
export default function TemplatesClient() {
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
    return templates.filter((t) => {
      if (view === 'mobile' && !t.mobile) return false;
      if (sel.format.length && !sel.format.includes(t.format)) return false;
      if (sel.field.length && !sel.field.includes(String(t.field))) return false;
      if (sel.genre.length && !sel.genre.includes(t.genre)) return false;
      if (words.length) {
        const hay = [t.id, t.title, t.summary, t.formatLabel, t.fieldLabel, t.genreLabel, t.business].join(' ').toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }, [q, sel, view]);

  return (
    <>
      {/* 탭은 상대 주소 - 하위 도메인에서는 / 과 /templates/, 본 사이트 경로에서는 /landing-page/ 아래로 간다 */}
      <PageHeader eyebrow="디자인 템플릿" title={<>발표 자료부터 현수막까지,<br /><b>고르고 바꿔서 만듭니다.</b></>}
        desc={templateHero.desc}
        tabs={[{ href: landingTabs.landing, label: '랜딩페이지 디자인' }, { href: landingTabs.here, label: '디자인 템플릿' }]}
        active={landingTabs.here} />
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
                모바일판이 따로 있는 {mobileFormats.join(' · ')} 템플릿만 보여 줍니다. 인쇄물과 영상처럼 크기가 하나인 종류는 PC에서 보세요.
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
              조건에 맞는 템플릿이 없습니다. {view === 'mobile' ? '필터를 풀거나 PC로 바꿔 보세요.' : '필터를 하나 풀어 보세요.'}
            </p>
          ) : (
            <ul className={view === 'pc'
              ? 'mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4'
              : 'mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5'}>
              {list.map((t) => (
                <li key={t.id} className="min-w-0">
                  {/* 상대 주소 - 하위 도메인에서는 /templates/PT-01/, 본 사이트 경로에서는 /landing-page/templates/PT-01/ 로 간다 */}
                  <Link href={`${t.id}/${landingViewQuery(view)}`} className="group block">
                    {view === 'mobile' ? (
                      /* 모바일판의 첫 화면을 휴대폰 틀에 넣는다 */
                      <div className="overflow-hidden rounded-[20px] border-[5px] border-ink bg-white transition-transform duration-300 group-hover:-translate-y-1">
                        <Image src={templateMobileThumb(t.id)} alt={`${t.title} 모바일 첫 화면`} width={360} height={779}
                          className="aspect-[390/844] w-full object-cover object-top" />
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
              ))}
            </ul>
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
