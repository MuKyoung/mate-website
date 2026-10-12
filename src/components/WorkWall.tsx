'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiPause, FiPlay } from 'react-icons/fi';
import { projects } from '@/data/projects';

/**
 * 흐르는 작업 벽 - 첫 화면의 오른쪽 면을 채운다.
 *
 * 스톡 사진이나 그려 넣은 장식 대신 실제로 만든 것을 건다. 직접 그린 게임 아트와
 * 플레이 화면이라 다른 회사 사이트에는 있을 수 없는 그림이다. 멈추지 않고 흐르는
 * 것 자체가 캐치프레이즈("멈추지 않게 만듭니다")다.
 *
 * 넣지 않은 것
 *  - 교실 사진: 학생이 찍혀 있고 초상권 범위가 아직 확인되지 않았다
 *  - 21세기 표류기 포스터: 그림체가 생성 이미지처럼 보인다
 *  - 웹·앱 프로젝트: 공개할 화면이 아직 없다
 *
 * 벽은 장식이라 보조기기에는 숨긴다. 같은 작업은 아래 '최근 작업' 과 포트폴리오에
 * 읽을 수 있는 형태로 있다. 저절로 움직이는 것이므로 멈춤 버튼을 둔다.
 */

/** public/images/hero 의 축소본. id 는 projects.ts 와 맞춘다 (제목을 거기서 가져온다) */
const SOURCES = [
  { slug: 'kkokkoji', id: '9', w: 640, h: 640 },
  { slug: 'vr-kiosk', id: '2', w: 640, h: 360 },
  { slug: 'used-car', id: '11', w: 640, h: 783 },
  { slug: 'wizard', id: '3', w: 640, h: 375 },
  { slug: 'itland', id: '4', w: 640, h: 358 },
  { slug: 'cut', id: '5', w: 523, h: 297 },
] as const;

const WORKS = SOURCES.map((s) => ({
  ...s,
  src: `/images/hero/${s.slug}.webp`,
  title: projects.find((p) => p.id === s.id)?.title ?? '',
}));

/**
 * 세로 줄. 둘째 줄은 같은 순서를 반 바퀴 늦게 돈다 (한 바퀴 96초).
 * 그림이 여섯 장이라 두 줄까지만 같은 그림이 동시에 보이지 않는다. 그래서 줄은 둘까지만 둔다.
 */
function Column({ lag, className = '' }: { lag: number; className?: string }) {
  return (
    <div className={`min-w-0 flex-1 overflow-hidden ${className}`}>
      <div className="wall-up" style={lag ? { animationDelay: `${lag}s` } : undefined}>
        {/* 같은 벌을 두 번 - 끝과 처음이 이어져 끊김이 보이지 않는다 */}
        {[0, 1].map((copy) =>
          WORKS.map((w, i) => (
            // gap 이 아니라 아래 여백으로 띄운다. 그래야 한 벌의 높이에 마지막 간격까지
            // 들어가서 -50% 지점이 정확히 둘째 벌의 시작과 겹친다.
            <figure key={`${copy}-${w.slug}`} className="mb-3">
              <Image src={w.src} alt="" width={w.w} height={w.h}
                loading={copy === 0 && i < 2 ? 'eager' : 'lazy'}
                className="h-auto w-full rounded-thumb" />
              <figcaption className="mt-2 truncate px-1.5 text-min leading-none text-[var(--text-3)]">{w.title}</figcaption>
            </figure>
          )),
        )}
      </div>
    </div>
  );
}

export default function WorkWall() {
  const [paused, setPaused] = useState(false);

  return (
    <div className={`relative h-full overflow-hidden ${paused ? 'is-paused' : ''}`}>
      {/* 넓은 화면 - 세로로 흐르는 줄. 840px 부터 두 줄이 된다. */}
      <div aria-hidden className="pointer-events-none hidden h-full gap-3 px-3 medium:flex">
        <Column lag={0} />
        <Column lag={-48} className="hidden expanded:block" />
      </div>

      {/* 좁은 화면 - 가로로 흐르는 한 줄 */}
      <div aria-hidden className="pointer-events-none overflow-hidden py-3 medium:hidden">
        <div className="wall-left flex w-max">
          {[0, 1].map((copy) =>
            WORKS.map((w) => (
              <Image key={`${copy}-${w.slug}`} src={w.src} alt="" width={w.w} height={w.h}
                loading="lazy" className="ml-3 h-[136px] w-auto max-w-none rounded-thumb" />
            )),
          )}
        </div>
      </div>

      {/* 멈춤 - 움직임을 줄여 달라고 한 기기에서는 벽이 처음부터 서 있으므로 감춘다 */}
      <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}
        // 왼쪽 아래에 둔다. 오른쪽 아래는 떠 있는 문의 버튼이 지나가는 자리다.
        className="absolute bottom-3 left-3 inline-flex h-9 items-center gap-1.5 rounded-pill bg-canvas px-3.5
                   text-min font-medium text-[var(--text-1)] transition-colors duration-150 ease-calm
                   hover:bg-surface-2 motion-reduce:hidden">
        {paused ? <FiPlay aria-hidden size={14} /> : <FiPause aria-hidden size={14} />}
        {paused ? '다시 흐르게' : '멈춤'}
      </button>
    </div>
  );
}
