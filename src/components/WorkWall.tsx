import Image from 'next/image';
import { projects } from '@/data/projects';

/**
 * 히어로 배경에 흐르는 작업 벽.
 *
 * 스톡 사진이나 그려 넣은 장식 대신 실제로 만든 것을 깐다. 직접 그린 게임 아트와
 * 플레이 화면이라 다른 회사 사이트에는 있을 수 없는 그림이다. 멈추지 않고 흐르는
 * 것 자체가 캐치프레이즈("멈추지 않게 만듭니다")다.
 *
 * 넣지 않은 것
 *  - 교실 사진: 학생이 찍혀 있고 초상권 범위가 아직 확인되지 않았다
 *  - 21세기 표류기 포스터: 그림체가 생성 이미지처럼 보인다
 *  - 웹·앱 프로젝트: 공개할 화면이 아직 없다
 *
 * 장식이므로 보조기기에는 숨긴다. 같은 작업은 아래 '최근 작업' 과 포트폴리오에
 * 읽을 수 있는 형태로 있다.
 */

/** public/images/hero 의 축소본. id 는 projects.ts 와 맞춘다 (제목을 거기서 가져온다) */
const SOURCES = [
  { slug: 'kkokkoji', id: '9', w: 640, h: 640 },
  { slug: 'wizard', id: '3', w: 640, h: 375 },
  { slug: 'vr-kiosk', id: '2', w: 640, h: 360 },
  { slug: 'cut', id: '5', w: 523, h: 297 },
  { slug: 'used-car', id: '11', w: 640, h: 783 },
  { slug: 'itland', id: '4', w: 640, h: 358 },
] as const;

const WORKS = SOURCES.map((s) => ({
  ...s,
  src: `/images/hero/${s.slug}.webp`,
  title: projects.find((p) => p.id === s.id)?.title ?? '',
}));

type Work = (typeof WORKS)[number];

/**
 * 여섯 장으로 두 줄을 채우면 같은 그림이 양쪽에 동시에 보인다. 그래서
 *  - 보통 화면에서는 한 줄만 크게 보여 준다. 한 번에 두 장 남짓이 보이므로 겹칠 일이 없다.
 *  - 아주 넓은 화면에서만 둘째 줄을 연다. 방향과 속도는 같고 반 바퀴 뒤처져 돌기 때문에
 *    두 줄이 같은 그림을 보여 주지 않는다.
 * (서로 반대로 돌리면 더 움직여 보이지만 여섯 장으로는 같은 그림이 계속 마주친다.)
 */
const pick = (order: number[]): Work[] => order.map((i) => WORKS[i]);
const COLUMN_A = pick([0, 2, 4, 1, 5, 3]);
const ROW = pick([0, 1, 2, 4, 5, 3]);

function Tile({ work, eager }: { work: Work; eager: boolean }) {
  return (
    // gap 이 아니라 아래 여백으로 띄운다. 그래야 한 벌의 높이에 마지막 간격까지
    // 들어가서 -50% 지점이 정확히 둘째 벌의 시작과 겹친다.
    <figure className="mb-3">
      <Image src={work.src} alt="" width={work.w} height={work.h}
        loading={eager ? 'eager' : 'lazy'}
        className="h-auto w-full rounded-md" />
      <figcaption className="mt-1.5 truncate text-[12px] leading-none text-white/60">{work.title}</figcaption>
    </figure>
  );
}

function Column({ works, className = '', lag = false }: { works: Work[]; className?: string; lag?: boolean }) {
  return (
    <div className={`min-w-0 flex-1 overflow-hidden ${className}`}>
      {/* lag: 한 바퀴(96초)에서 반 바퀴만큼 뒤처져 시작한다 */}
      <div className="wall-up" style={lag ? { animationDelay: '-48s' } : undefined}>
        {/* 같은 벌을 두 번 - 끝과 처음이 이어져 끊김이 보이지 않는다 */}
        {[0, 1].map((copy) =>
          works.map((w, i) => <Tile key={`${copy}-${w.slug}`} work={w} eager={copy === 0 && i < 2} />),
        )}
      </div>
    </div>
  );
}

/** 넓은 화면 - 세로로 흐르는 줄. 부모가 높이를 정한다. */
export function WorkWall({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none flex gap-3 px-3 ${className}`}>
      <Column works={COLUMN_A} />
      <Column works={COLUMN_A} lag className="hidden min-[1536px]:block" />
    </div>
  );
}

/** 좁은 화면 - 가로로 흐르는 한 줄 */
export function WorkRow({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <div className="wall-left flex w-max">
        {[0, 1].map((copy) =>
          ROW.map((w) => (
            <Image key={`${copy}-${w.slug}`} src={w.src} alt="" width={w.w} height={w.h}
              loading="lazy" className="mr-3 h-[132px] w-auto max-w-none rounded-md" />
          )),
        )}
      </div>
    </div>
  );
}
