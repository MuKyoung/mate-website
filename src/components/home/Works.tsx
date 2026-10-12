'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { projects } from '@/data/projects';
import type { Project } from '@/types';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, stagger, inView } from '@/lib/motion';
import { btnOutline } from '@/lib/styles';

/**
 * 최근 작업 - 저희가 실제로 만든 것. 이 화면에는 스톡 사진을 쓰지 않는다.
 *
 * 그림이 있는 작업은 옆으로 넘기는 줄에 한 번씩만 건다. 같은 그림을 이어 붙여
 * 끝없이 돌리지 않는다. 공개할 화면이 없는 웹 · 앱 작업은 이름으로 보여 준다.
 * 적는 것은 제목과 분류, 기간뿐이다. 전부 포트폴리오 데이터에 있는 값이다.
 *
 * 그림을 거는 자리라 테마와 상관없이 어둡게 둔다.
 */

/**
 * 그림으로 보여 줄 작업. 원본 크기를 같이 적어 불러오기 전에 자리부터 잡는다.
 * pos 는 3:2 로 자를 때 남길 자리다. 세로로 긴 포스터는 제목이 있는 위쪽을 남긴다.
 */
const PICKS = [
  { id: '9', w: 887, h: 887, pos: 'object-top' },        // 꼬꼬지생 - 아래의 제목 띠가 반만 걸리지 않게
  { id: '2', w: 1600, h: 900, pos: 'object-center' },    // VR 키오스크 시뮬레이션
  { id: '3', w: 727, h: 426, pos: 'object-center' },     // 영창하세요 마법사님
  { id: '11', w: 891, h: 1090, pos: 'object-top' },      // VR 중고차 구매 가이드
  { id: '4', w: 640, h: 358, pos: 'object-center' },     // ITLand-Unity
  { id: '5', w: 523, h: 297, pos: 'object-center' },     // 잘라라 재료
];

const KIND: Record<string, string> = {
  'Game Application': '게임',
  'VR Application': 'VR',
  'Web Application': '웹 · 앱',
  'Education Content': '교육',
};

const meta = (p: Project) => `${KIND[p.category] ?? p.category} · ${p.durationMonths}개월`;

const shots = PICKS
  .map((pick) => ({ pick, project: projects.find((p) => p.id === pick.id) }))
  .filter((s): s is { pick: (typeof PICKS)[number]; project: Project & { thumbnail: string } } => Boolean(s.project?.thumbnail));

const webWorks = projects.filter((p) => /Web|Mobile/.test(p.category));

const roundBtn =
  'flex h-11 w-11 items-center justify-center rounded-full bg-fg/10 text-[var(--text-1)] ' +
  'transition-colors duration-150 ease-calm hover:bg-fg/[0.18]';

export default function Works() {
  const rail = useRef<HTMLUListElement>(null);

  /** 카드 한 장만큼 옆으로 넘긴다 */
  const nudge = (dir: -1 | 1) => {
    const el = rail.current;
    const card = el?.querySelector('li');
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: 'smooth' });
  };

  return (
    <Screen id="work" tone="dark">
      <ScreenBody>
        <motion.div {...inView} variants={stagger} className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div>
            <motion.div variants={fadeUp}><Eyebrow>Work</Eyebrow></motion.div>
            <motion.h2 id="work-title" variants={fadeUp} className="type-screen mt-4">최근 작업</motion.h2>
          </div>
          <motion.div variants={fadeUp} className="hidden items-center gap-2 medium:flex">
            <button type="button" onClick={() => nudge(-1)} aria-label="앞의 작업 보기" className={roundBtn}>
              <FiArrowLeft aria-hidden size={18} />
            </button>
            <button type="button" onClick={() => nudge(1)} aria-label="다음 작업 보기" className={roundBtn}>
              <FiArrowRight aria-hidden size={18} />
            </button>
            <Link href="/projects" className={`${btnOutline} ml-2`}>전체 포트폴리오 {projects.length}건</Link>
          </motion.div>
        </motion.div>

        {/* 옆으로 넘기는 줄 - 화면 가장자리까지 흐르게 해서 뒤에 더 있다는 것을 보인다 */}
        <motion.ul ref={rail} {...inView} variants={fadeUp}
          className="no-scrollbar -mx-6 mt-[clamp(1.25rem,3.6svh,2.25rem)] flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6">
          {shots.map(({ pick, project }) => (
            // 카드 폭이 창 높이를 따라 줄어든다. 그림이 3:2 라 폭이 줄면 높이도 같이 준다.
            <li key={project.id} className="w-[72%] shrink-0 snap-start medium:w-[clamp(240px,42svh,300px)] xl:w-[clamp(270px,46svh,352px)]">
              <Link href={`/projects/${project.id}`}
                className="group block rounded-block bg-surface p-3 transition-colors duration-150 ease-calm hover:bg-surface-2">
                <div className="relative aspect-[3/2] overflow-hidden rounded-thumb bg-surface-2">
                  <Image src={project.thumbnail} alt="" width={pick.w} height={pick.h}
                    sizes="(min-width: 1280px) 352px, (min-width: 600px) 300px, 76vw"
                    className={`h-full w-full object-cover ${pick.pos} transition-transform duration-500 ease-calm group-hover:scale-[1.03]`} />
                </div>
                <div className="px-2 pb-2 pt-3.5">
                  <h3 className="truncate text-lst font-medium text-[var(--text-1)]">{project.title}</h3>
                  <p className="mt-0.5 text-sub text-[var(--text-3)]">{meta(project)}</p>
                </div>
              </Link>
            </li>
          ))}
        </motion.ul>

        {webWorks.length > 0 && (
          // 좁은 화면에서는 한 줄로 두고 옆으로 넘긴다. 줄이 바뀌면 화면 한 장에 안 들어온다.
          <motion.div {...inView} variants={fadeUp}
            className="no-scrollbar -mx-6 mt-[clamp(1.1rem,3.2svh,2rem)] flex items-center gap-x-4 overflow-x-auto px-6 medium:mx-0 medium:flex-wrap medium:gap-y-3 medium:overflow-visible medium:px-0">
            <p className="shrink-0 text-sub font-medium text-[var(--text-3)]">웹 · 앱</p>
            <ul className="flex gap-2 medium:flex-wrap">
              {webWorks.map((p) => (
                <li key={p.id} className="shrink-0">
                  <Link href={`/projects/${p.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-chip bg-surface px-4 text-btn font-medium text-[var(--text-1)]
                               transition-colors duration-150 ease-calm hover:bg-surface-2">
                    {p.title}
                    <span className="font-normal text-[var(--text-3)]">{p.durationMonths}개월</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div {...inView} variants={fadeUp} className="mt-5 medium:hidden">
          <Link href="/projects" className={`${btnOutline} w-full`}>전체 포트폴리오 {projects.length}건</Link>
        </motion.div>
      </ScreenBody>
    </Screen>
  );
}
