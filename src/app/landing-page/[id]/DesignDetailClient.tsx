'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import type { LandingDesign } from '@/types';
import {
  landingContactHref, landingViewQuery, readLandingView, saveLandingView, type LandingView,
} from '@/data/landingService';
import { arrowHover, btnLine, btnPoint, chip, chipLine, container } from '@/lib/styles';

interface Props {
  design: LandingDesign;
  prev: LandingDesign | null;
  next: LandingDesign | null;
}

/**
 * 갤러리 디자인 상세 - 왼쪽은 PC · 모바일 전체 길이 미리보기(전환), 오른쪽은 분류 · 출처 · 문의.
 * 문의 버튼은 /contact 로 design 번호를 넘긴다(문의 제목이 채워진다).
 */
export default function DesignDetailClient({ design: d, prev, next }: Props) {
  /* 갤러리에서 고른 화면(?view=mobile 또는 저장해 둔 값)으로 연다. 서버 그림과 같게 PC 로 시작한다 */
  const [view, setView] = useState<LandingView>('pc');
  useEffect(() => {
    const v = readLandingView();
    if (v) setView(v);
  }, []);
  const pickView = (v: LandingView) => { setView(v); saveLandingView(v); };
  const rows: [string, string][] = [
    ['업종', [d.fieldLabel, ...d.industries].join(' · ')],
    ['목적', d.purposes.join(' · ')],
    ['분위기', d.moods.join(' · ')],
    ['표현', d.visualStyles.join(' · ')],
  ];

  return (
    <article data-header="light" className="bg-white pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className={container}>
        {/* 상대 주소 - 하위 도메인에서는 /, 본 사이트 경로에서는 /landing-page/ 로 돌아간다 */}
        <Link href="../#gallery" className="inline-flex items-center gap-2 text-[15px] font-bold text-gray-500 hover:text-point-200">
          <FiArrowLeft aria-hidden /> 스타일 갤러리
        </Link>

        <header className="mt-8 max-w-[880px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[14px] text-ink">{d.id}</span>
            <span className={d.kind === 'template' ? chip : chipLine}>{d.kindLabel}</span>
          </div>
          <h1 className="mt-4 text-[30px] font-bold leading-tight text-ink sm:text-[44px]">{d.title}</h1>
          <p className="mt-4 text-[17px] leading-[1.7] text-gray-500">{d.summary}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* 미리보기 */}
          <div className="min-w-0 lg:col-span-8">
            <div className="flex items-center justify-between gap-3">
              <div role="group" aria-label="미리보기 화면" className="inline-flex rounded-pill border border-gray-200 p-1">
                {(['pc', 'mobile'] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)}
                    className={`rounded-pill px-5 py-2 text-[14px] font-bold transition-colors ${view === v ? 'bg-ink text-white' : 'text-gray-500 hover:text-ink'}`}>
                    {v === 'pc' ? 'PC' : '모바일'}
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-gray-400">전체 길이 미리보기</span>
            </div>
            <div className="mt-4 max-h-[78vh] overflow-auto rounded-[12px] border border-gray-200 bg-gray-100 p-4 sm:p-6">
              {view === 'pc' ? (
                <Image key="pc" src={d.desktop} alt={`${d.title} PC 전체 화면`} width={900} height={3000}
                  className="mx-auto h-auto w-full max-w-[900px] rounded-[6px]" />
              ) : (
                <Image key="mobile" src={d.mobile} alt={`${d.title} 모바일 전체 화면`} width={390} height={3000}
                  className="mx-auto h-auto w-full max-w-[360px] rounded-[22px] border-[6px] border-ink" />
              )}
            </div>
          </div>

          {/* 분류 · 출처 · 문의 */}
          <aside className="grid content-start gap-8 lg:col-span-4">
            <dl className="border-t-2 border-ink">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b border-gray-200 py-4">
                  <dt className="w-14 shrink-0 text-[14px] font-bold text-gray-500">{k}</dt>
                  <dd className="text-[15px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-2 rounded-[12px] bg-gray-100 p-5 text-[13px] leading-[1.7] text-gray-500">
              {d.credit ? (
                <>
                  <b className="text-ink">출처</b>
                  <span>{d.credit.text}</span>
                  {d.kind === 'template' && (
                    <span>
                      <a href={d.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-point-200">원본 보기</a>
                      {' · '}
                      <a href={d.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-point-200">{d.credit.license}</a>
                    </span>
                  )}
                  {d.kind === 'template' && <span>이 스타일로 만든 페이지에도 원작자 표시가 한 줄 들어갑니다.</span>}
                </>
              ) : (
                <><b className="text-ink">MATE 시안</b><span>MATE가 구성한 시안입니다.</span></>
              )}
              <span>제작 스타일 샘플입니다. 상호·수치·후기·일정은 예시이고, 사진 자리는 실제 촬영으로 채웁니다.</span>
              {d.photoCredits.length > 0 && (
                <span>
                  지금 들어 있는 사진은 예시입니다. 사진: Unsplash의{' '}
                  {d.photoCredits.map((c, i) => (
                    <span key={c.photoUrl}>
                      {i > 0 && ', '}
                      <a href={c.photoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-point-200">{c.name}</a>
                    </span>
                  ))}
                </span>
              )}
            </div>

            <div className="grid gap-3">
              <Link href={landingContactHref(d.id)} className={btnPoint}>
                이 스타일로 제작 문의 <FiArrowUpRight className={arrowHover} />
              </Link>
              <Link href="../#gallery" className={btnLine}>다른 스타일 보기</Link>
            </div>
          </aside>
        </div>

        <nav aria-label="이전 · 다음 디자인" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-gray-200 pt-8">
          {prev ? (
            <Link href={`../${prev.id}/${landingViewQuery(view)}`} className="group flex items-center gap-3 text-[15px] text-gray-500 hover:text-point-200">
              <FiArrowLeft aria-hidden /> <span className="font-mono">{prev.id}</span> {prev.title}
            </Link>
          ) : <span />}
          {next && (
            <Link href={`../${next.id}/${landingViewQuery(view)}`} className="group flex items-center gap-3 text-[15px] text-gray-500 hover:text-point-200">
              <span className="font-mono">{next.id}</span> {next.title} <FiArrowRight aria-hidden />
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
