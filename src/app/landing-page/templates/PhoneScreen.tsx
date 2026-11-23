'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TemplateItem } from '@/types';
import { templateMobileThumb, templatePage, templateThumb, templateVideo } from '@/data/templateLibrary';

/** 휴대폰에서 보는 SNS 종류 - 카드뉴스 · 인스타그램 피드 · 인스타그램 릴스 */
const SNS = ['cn', 'ig', 'rl'];

/** 휴대폰 화면으로 보여 줄 수 있는 템플릿인지 - 모바일판이 따로 있는 종류(상세페이지)와 휴대폰에서 보는 SNS 종류 */
export const hasPhoneView = (t: TemplateItem) => !!t.mobile || SNS.includes(t.format);

/**
 * SNS 글이 휴대폰에 떴을 때의 뼈대 - 위에 글쓴이 줄, 가운데 그림, 아래에 글 줄.
 * 특정 서비스의 화면을 흉내 내지 않고 동그라미와 줄만 둔다. 크기는 휴대폰 폭(cqw)에 맞춰 함께 줄어든다.
 */
function Post({ children, dots = 0, at = 0 }: { children: React.ReactNode; dots?: number; at?: number }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-[3cqw] px-[4cqw] pb-[3cqw] pt-[10cqw]">
        <span className="h-[9cqw] w-[9cqw] rounded-full bg-gray-200" />
        <span className="h-[2.6cqw] w-[30cqw] rounded-full bg-gray-200" />
      </div>
      {children}
      {dots > 1 && (
        <div className="flex justify-center gap-[1.6cqw] pt-[3cqw]">
          {Array.from({ length: dots }, (_, i) => (
            <span key={i} className={`h-[1.8cqw] w-[1.8cqw] rounded-full transition-colors ${i === at ? 'bg-point-200' : 'bg-gray-200'}`} />
          ))}
        </div>
      )}
      <div className="grid gap-[2.6cqw] px-[4cqw] pt-[4cqw]">
        <span className="h-[2.4cqw] w-[70cqw] rounded-full bg-gray-200" />
        <span className="h-[2.4cqw] w-[46cqw] rounded-full bg-gray-100" />
      </div>
      {/* 아래로 이어지는 다음 글 - 화면이 비어 보이지 않게 뼈대만 */}
      <div className="mt-[7cqw] flex items-center gap-[3cqw] border-t border-gray-100 px-[4cqw] py-[3cqw]">
        <span className="h-[9cqw] w-[9cqw] rounded-full bg-gray-100" />
        <span className="h-[2.6cqw] w-[24cqw] rounded-full bg-gray-100" />
      </div>
      <div className="min-h-0 flex-1 bg-gray-100" />
    </div>
  );
}

/**
 * 템플릿을 휴대폰 화면(390 × 844 비율)에 넣어 보여 준다. 바깥 틀(테두리 · 둥근 모서리)은 쓰는 쪽이 준다.
 * - card   갤러리 카드. 첫 장만 가벼운 그림으로
 * - detail 상세. 카드뉴스는 옆으로 넘기고, 릴스는 영상이 돈다
 */
export default function PhoneScreen({ t, mode }: { t: TemplateItem; mode: 'card' | 'detail' }) {
  const [at, setAt] = useState(0);
  const detail = mode === 'detail';
  const box = 'aspect-[390/844] w-full overflow-hidden [container-type:inline-size]';

  /* 모바일판이 따로 있는 상세페이지 - 갤러리 카드에서만 쓴다(상세는 전체 길이 그림을 스크롤해 본다) */
  if (t.mobile) {
    return (
      <div className={box}>
        <Image src={templateMobileThumb(t.id)} alt={`${t.title} 모바일 첫 화면`} width={360} height={779} className="h-full w-full object-cover object-top" />
      </div>
    );
  }

  /* 릴스 - 9:16 영상을 화면 가운데에(위아래는 검은 띠) */
  if (t.format === 'rl') {
    return (
      <div className={`${box} flex items-center bg-black`}>
        {detail ? (
          <video autoPlay loop muted playsInline preload="metadata" poster={templatePage(t.id, 1)} className="aspect-[9/16] w-full object-cover">
            <source src={templateVideo(t.id)} type="video/mp4" />
          </video>
        ) : (
          <Image src={templateThumb(t.id)} alt={`${t.title} 휴대폰 화면`} width={640} height={1138} className="aspect-[9/16] w-full object-cover" />
        )}
      </div>
    );
  }

  /* 카드뉴스 - 상세에서는 옆으로 넘겨 본다 */
  if (t.format === 'cn') {
    return (
      <div className={box}>
        <Post dots={t.pages.length} at={at}>
          {detail ? (
            <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
              onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
              {t.pages.map(([w, h], i) => (
                <Image key={i} src={templatePage(t.id, i + 1)} alt={`${t.title} ${i + 1}쪽`} width={w} height={h} priority={i === 0}
                  className="aspect-square w-full shrink-0 snap-center object-cover" />
              ))}
            </div>
          ) : (
            <Image src={templateThumb(t.id)} alt={`${t.title} 휴대폰 화면`} width={640} height={640} className="aspect-square w-full object-cover" />
          )}
        </Post>
      </div>
    );
  }

  /* 인스타그램 피드 - 4:5 한 장 */
  return (
    <div className={box}>
      <Post>
        <Image src={detail ? templatePage(t.id, 1) : templateThumb(t.id)} alt={`${t.title} 휴대폰 화면`} width={640} height={800} priority={detail}
          className="aspect-[4/5] w-full object-cover" />
      </Post>
    </div>
  );
}
