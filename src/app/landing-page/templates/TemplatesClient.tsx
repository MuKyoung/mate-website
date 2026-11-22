'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight, FiPlay, FiSearch } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import { landingContactHref, landingTabs, templateHero, templateSampleNotes } from '@/data/landingService';
import { templateFields, templateFormats, templateGenres, templateThumb, templates } from '@/data/templateLibrary';
import { arrowHover, btnLight, chip, container } from '@/lib/styles';

type FilterKey = 'format' | 'field' | 'genre';
const EMPTY: Record<FilterKey, string[]> = { format: [], field: [], genre: [] };

const groups: { key: FilterKey; label: string; items: [string, string][] }[] = [
  { key: 'format', label: '종류', items: templateFormats.map((f): [string, string] => [f.key, f.name]) },
  { key: 'field', label: '업종', items: templateFields.map((f): [string, string] => [String(f.id), f.name]) },
  { key: 'genre', label: '장르', items: templateGenres.map((g): [string, string] => [g.key, g.name]) },
];

/** 사진가 수 - 안내 글에 쓴다 */
const photographerCount = new Set(templates.flatMap((t) => t.credits.map((c) => c.name))).size;

/**
 * 디자인 템플릿 라이브러리 - 종류 · 업종 · 장르로 고르는 갤러리.
 * 카드는 걸러질 때마다 다시 그려지므로 스크롤 등장 효과를 걸지 않는다(걸러진 뒤 안 보이는 일이 없게).
 */
export default function TemplatesClient() {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<Record<FilterKey, string[]>>(EMPTY);

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

  return (
    <>
      {/* 탭은 상대 주소 - 하위 도메인에서는 / 과 /templates/, 본 사이트 경로에서는 /landing-page/ 아래로 간다 */}
      <PageHeader eyebrow="디자인 템플릿" title={<>발표 자료부터 현수막까지,<br /><b>고르고 바꿔서 만듭니다.</b></>}
        desc={templateHero.desc}
        tabs={[{ href: landingTabs.landing, label: '랜딩페이지 디자인' }, { href: landingTabs.here, label: '디자인 템플릿' }]}
        active={landingTabs.here} />

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
              <p className="text-[15px] text-gray-500" aria-live="polite"><b className="text-ink">{list.length}</b>개 템플릿</p>
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
            <p className="py-16 text-[16px] text-gray-500">조건에 맞는 템플릿이 없습니다. 필터를 하나 풀어 보세요.</p>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((t) => (
                <li key={t.id} className="min-w-0">
                  {/* 상대 주소 - 하위 도메인에서는 /templates/PT-01/, 본 사이트 경로에서는 /landing-page/templates/PT-01/ 로 간다 */}
                  <Link href={`${t.id}/`} className="group block">
                    {/* 종류마다 비율이 달라(16:9 · 9:16 · 현수막 ...) 같은 크기 칸 안에 통째로 넣는다 */}
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[12px] border border-gray-200 bg-gray-100 p-3 transition-transform duration-300 group-hover:-translate-y-1 sm:p-5">
                      <Image src={templateThumb(t.id)} alt={`${t.title} 미리보기`} width={640} height={480}
                        className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]" />
                      {t.video > 0 && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-ink/85 px-2.5 py-1 text-[12px] font-bold text-white">
                          <FiPlay aria-hidden /> 영상
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="font-mono text-ink">{t.id}</span>
                      <span className={chip}>{t.formatLabel}</span>
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

      {/* 샘플과 사진 출처 */}
      <section data-header="light" className="bg-gray-100 py-20 sm:py-24">
        <div className={container}>
          <SectionHead eyebrow="Credits" title={<><b>샘플과 사진 출처</b></>} />
          <div className="mt-8 grid max-w-[980px] gap-3 text-[15px] leading-[1.7] text-gray-500">
            {templateSampleNotes.map((n) => <p key={n}>{n}</p>)}
            <p>
              사진가 {photographerCount}명의 사진을 썼고, 사진가 이름과 원본 주소는 템플릿마다 상세 화면에 있습니다.{' '}
              <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline hover:text-point-200">Unsplash License</a>
            </p>
          </div>
        </div>
      </section>

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
