'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import type { TemplateItem } from '@/types';
import {
  landingContactHref, landingViewQuery, readLandingView, rightsNotice, saveLandingView, type LandingView,
} from '@/data/landingService';
import { templateMobile, templatePage, templateVideo } from '@/data/templateLibrary';
import { arrowHover, btnLine, btnPoint, chip, chipLine, container } from '@/lib/styles';
import PhoneScreen, { hasPhoneView } from '../PhoneScreen';

interface Props {
  template: TemplateItem;
  prev: TemplateItem | null;
  next: TemplateItem | null;
}

/** 미리보기 폭 - 세로로 긴 종류(릴스 · 배너 · 포스터)가 화면을 넘치지 않게 비율로 정한다 */
function previewWidth(t: TemplateItem): string {
  const [w, h] = t.pages[0];
  const r = w / h;
  if (t.format === 'dp') return 'max-w-[640px]';
  if (r < 0.45) return 'max-w-[300px]';
  if (r < 0.85) return 'max-w-[460px]';
  if (r < 1.25) return 'max-w-[620px]';
  return 'max-w-[980px]';
}

/**
 * 템플릿 상세 - 왼쪽은 쪽별 미리보기(영상은 재생기와 장면 그림), 오른쪽은 분류 · 사진 출처 · 문의.
 * 휴대폰에서 보는 종류는 PC · 모바일을 골라 본다(상세페이지는 따로 짠 모바일판, 카드뉴스 · 인스타그램 피드 · 릴스는
 * 휴대폰 틀 안에 뜬 모습 - 카드뉴스는 옆으로 넘기고 릴스는 영상이 돈다). 갤러리에서 고른 화면으로 열린다.
 * 문의 버튼은 /contact 로 design 번호를 넘긴다(문의 제목이 채워진다).
 */
export default function TemplateDetailClient({ template: t, prev, next }: Props) {
  const isVideo = t.video > 0;
  /* 갤러리에서 고른 화면(?view=mobile 또는 저장해 둔 값)으로 연다. 서버 그림과 같게 PC 로 시작한다 */
  const [view, setView] = useState<LandingView>('pc');
  useEffect(() => {
    const v = readLandingView();
    if (v) setView(v);
  }, []);
  const pickView = (v: LandingView) => { setView(v); saveLandingView(v); };
  /* 휴대폰 화면이 없는 템플릿은 무엇을 골랐든 PC 판을 보여 준다 */
  const mobile = view === 'mobile' && hasPhoneView(t);
  const rows: [string, string][] = [
    ['종류', `${t.formatLabel} · ${t.spec}`],
    ['업종', t.fieldLabel],
    ['장르', t.genreLabel],
    ['쓰임', t.business],
    ['구성', isVideo ? `영상 ${t.video}초 · 장면 그림 ${t.pages.length}장` : t.mobile ? 'PC판 · 모바일판' : `${t.pages.length}쪽`],
    ['글꼴', t.fonts.join(', ')],
    ['형식', t.outputs.join(', ')],
  ];
  const width = previewWidth(t);

  return (
    <article data-header="light" className="bg-white pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className={container}>
        {/* 상대 주소 - 하위 도메인에서는 /templates/, 본 사이트 경로에서는 /landing-page/templates/ 로 돌아간다 */}
        <Link href="../#gallery" className="inline-flex items-center gap-2 text-[15px] font-bold text-gray-500 hover:text-point-200">
          <FiArrowLeft aria-hidden /> 템플릿 갤러리
        </Link>

        <header className="mt-8 max-w-[880px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[14px] text-ink">{t.id}</span>
            <span className={chip}>{t.formatLabel}</span>
            <span className={chipLine}>{t.genreLabel}</span>
          </div>
          <h1 className="mt-4 text-[30px] font-bold leading-tight text-ink sm:text-[44px]">{t.title}</h1>
          <p className="mt-4 text-[17px] leading-[1.7] text-gray-500">{t.summary}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* 미리보기 */}
          <div className="min-w-0 lg:col-span-8">
            {hasPhoneView(t) && (
              <div className="mb-4 flex items-center justify-between gap-3">
                <div role="group" aria-label="미리보기 화면" className="inline-flex rounded-pill border border-gray-200 p-1">
                  {(['pc', 'mobile'] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={view === v} onClick={() => pickView(v)}
                      className={`rounded-pill px-5 py-2 text-[14px] font-bold transition-colors ${view === v ? 'bg-ink text-white' : 'text-gray-500 hover:text-ink'}`}>
                      {v === 'pc' ? 'PC' : '모바일'}
                    </button>
                  ))}
                </div>
                <span className="text-[13px] text-gray-400">
                  {t.mobile ? '전체 길이 미리보기' : !mobile ? '' : t.format === 'cn' ? '옆으로 넘겨 보세요' : '휴대폰에 뜬 모습'}
                </span>
              </div>
            )}
            <div className={`grid justify-items-center gap-6 rounded-[12px] border border-gray-200 bg-gray-100 p-4 sm:p-6 ${t.format === 'dp' ? 'max-h-[78vh] overflow-auto' : ''}`}>
              {mobile && t.mobile && (
                <Image key="mobile" src={templateMobile(t.id)} alt={`${t.title} 모바일판`} width={t.mobile[0]} height={t.mobile[1]} priority
                  className="h-auto w-full max-w-[360px] rounded-[22px] border-[6px] border-ink" />
              )}
              {mobile && !t.mobile && (
                <div className="w-full max-w-[340px] overflow-hidden rounded-[26px] border-[6px] border-ink bg-white">
                  <PhoneScreen key={t.id} t={t} mode="detail" />
                </div>
              )}
              {!mobile && isVideo && (
                <video controls loop muted playsInline preload="metadata" poster={templatePage(t.id, 1)}
                  className={`h-auto w-full ${width} rounded-[6px] bg-black`}>
                  <source src={templateVideo(t.id)} type="video/mp4" />
                </video>
              )}
              {mobile ? null : isVideo ? (
                <div className={`grid w-full ${t.pages[0][0] > t.pages[0][1] ? 'max-w-[980px] sm:grid-cols-3' : 'max-w-[620px] grid-cols-3'} gap-3`}>
                  {t.pages.map(([w, h], i) => (
                    <figure key={i} className="min-w-0">
                      <Image src={templatePage(t.id, i + 1)} alt={`${t.title} 장면 ${i + 1}`} width={w} height={h}
                        className="h-auto w-full rounded-[6px]" />
                      <figcaption className="mt-2 text-center text-[12px] text-gray-400">장면 {i + 1}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                t.pages.map(([w, h], i) => (
                  <figure key={i} className={`w-full min-w-0 ${width}`}>
                    <Image src={templatePage(t.id, i + 1)} alt={`${t.title} ${i + 1}쪽`} width={w} height={h} priority={i === 0}
                      className="h-auto w-full rounded-[6px] shadow-[0_10px_28px_-14px_rgba(0,0,0,0.35)]" />
                    {t.pages.length > 1 && (
                      <figcaption className="mt-2 text-center text-[12px] text-gray-400">{i + 1} / {t.pages.length}</figcaption>
                    )}
                  </figure>
                ))
              )}
            </div>
          </div>

          {/* 분류 · 사진 출처 · 문의 */}
          <aside className="grid content-start gap-8 lg:col-span-4">
            <dl className="border-t-2 border-ink">
              {rows.map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b border-gray-200 py-4">
                  <dt className="w-14 shrink-0 text-[14px] font-bold text-gray-500">{k}</dt>
                  <dd className="min-w-0 text-[15px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-2 rounded-[12px] bg-gray-100 p-5 text-[13px] leading-[1.7] text-gray-500">
              <b className="text-ink">바꿔 넣는 것</b>
              <span>{t.swap}</span>
            </div>

            <div className="grid gap-2 rounded-[12px] bg-gray-100 p-5 text-[13px] leading-[1.7] text-gray-500">
              <b className="text-ink">MATE 시안</b>
              <span>MATE가 구성한 제작 스타일 샘플입니다. 상호·가격·일정은 예시이고, 사진은 제작할 때 주신 사진이나 촬영한 사진으로 바꿉니다.</span>
              {t.credits.length > 0 && (
                <span>
                  사진: Unsplash의{' '}
                  {t.credits.map((c, i) => (
                    <span key={c.photoUrl}>
                      {i > 0 && ', '}
                      <a href={c.photoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-point-200">{c.name}</a>
                    </span>
                  ))}
                </span>
              )}
              <span>{rightsNotice.mate}</span>
            </div>

            <div className="grid gap-3">
              <Link href={landingContactHref(t.id)} className={btnPoint}>
                이 템플릿으로 제작 문의 <FiArrowUpRight className={arrowHover} />
              </Link>
              <Link href="../#gallery" className={btnLine}>다른 템플릿 보기</Link>
            </div>
          </aside>
        </div>

        <nav aria-label="이전 · 다음 템플릿" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-gray-200 pt-8">
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
