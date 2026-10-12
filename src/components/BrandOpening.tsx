'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { counts, teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { games } from '@/data/games';
import { WorkRow, WorkWall } from '@/components/WorkWall';
import { clipUp, fadeLeft, fadeUp, stagger, onMount } from '@/lib/motion';
import { arrowHover, btnOnBrand, clipWrap, container, linkOnBrand } from '@/lib/styles';

/**
 * 브랜드 오프닝.
 *
 * 화면 전체가 대표 색상(로고의 파랑) 면이고, 캐치프레이즈를 흰 글자로 올린다.
 * 오른쪽에는 그 면에 창을 내서 실제로 만든 작업이 멈추지 않고 흐르게 한다.
 *
 * 색을 글자에 묻히는 대신 면으로 깐 이유: 검은 바탕에 강조색 글자를 쓰는 구도는
 * 어느 템플릿에나 있고, 로고와 같은 색의 큰 면은 이 회사 것이라는 표시가 된다.
 *
 * 두 축의 문장은 회사가 원래 밝혀 둔 내용(진행 절차의 '배포 후 모니터링',
 * FAQ 의 '완료 후 유지보수')에서만 가져온다.
 */

const { since } = teamCapabilities.stats;

const pillars = [
  {
    title: '개발 전문성',
    body: `${since}년부터 웹 · 앱과 게임 · XR ${counts.devProjects}건을 납품하고, 강의 ${counts.lectures}건을 진행했습니다.`,
  },
  {
    title: '배포 안정성',
    body: '배포한 뒤에도 모니터링으로 안정성을 확인합니다. 끝난 뒤의 버그 수정과 업데이트도 이어서 맡습니다.',
  },
];

export default function BrandOpening() {
  return (
    <section className="relative overflow-hidden bg-[var(--canvas)]">
      <div className="relative bg-[var(--brand-fill)]">
        {/* 작업 벽 - 파란 면의 오른쪽에 낸 창. 헤더 높이만큼은 파란 면으로 남긴다.
            그래야 메뉴가 어느 폭에서도 한 가지 바탕 위에 놓인다
            (창을 꼭대기까지 올리면 메뉴 글자가 파랑과 검정의 경계에 걸린다). */}
        <div className="absolute bottom-0 right-0 top-16 hidden w-[40%] bg-[var(--canvas)] lg:block min-[1536px]:w-[44%]">
          <WorkWall className="h-full" />
        </div>

        <div className={`relative ${container}`}>
          {/* 본문은 창 왼쪽에 머문다. 창이 화면의 40~44% 이므로 컨테이너의 51% 면
              어느 폭에서도 창과 겹치지 않는다. */}
          <div className="flex flex-col pb-10 pt-28 sm:pb-12 sm:pt-36 lg:min-h-[min(92svh,900px)] lg:w-[51%]">

            {/* 회사가 스스로 밝힌 정의 그대로 - SI 와 퍼블리싱.
                깜빡이는 점과 '상담 가능' 은 뺐다. 어느 템플릿에나 있는 장식이다. */}
            <motion.p {...onMount} variants={fadeLeft}
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/80">
              SI · Publishing · Since {since}
            </motion.p>

            <div className="my-auto py-12 sm:py-14">
              <motion.h1 {...onMount} variants={stagger}
                className="font-bold leading-[1.06] tracking-[-0.025em] text-white"
                style={{ fontSize: 'clamp(3.5rem, 8.4vw, 8.25rem)' }}>
                <span className={clipWrap}>
                  <motion.span variants={clipUp} className="block">멈추지 않게</motion.span>
                </span>
                <span className={clipWrap}>
                  <motion.span variants={clipUp} className="block">만듭니다</motion.span>
                </span>
              </motion.h1>

              <motion.p {...onMount} variants={fadeUp}
                className="mt-7 text-[17px] leading-[1.8] text-white/90 sm:mt-9 sm:text-[19px]">
                {/* 문장 단위로 끊는다 - 흘려 두면 마지막 낱말만 다음 줄로 떨어진다 */}
                <span className="block">만드는 것과 돌아가게 하는 것은 다릅니다.</span>
                <span className="block">그래서 배포한 뒤까지 봅니다.</span>
              </motion.p>

              <motion.div {...onMount} variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                {/* 파란 면 위에서는 버튼이 흰색이다. 글자는 로고 원색 (흰 바탕과 7.6:1) */}
                <Link href="/contact" className={btnOnBrand}>
                  프로젝트 문의
                  <FiArrowUpRight size={17} className={arrowHover} />
                </Link>
                <Link href="/projects" className={linkOnBrand}>
                  포트폴리오 {projects.length}건
                </Link>
              </motion.div>
            </div>

            {/* 두 축 - 캐치프레이즈의 근거 */}
            <motion.div {...onMount} variants={stagger}
              className="grid gap-x-10 gap-y-6 border-t border-white/25 pt-7 sm:grid-cols-2">
              {pillars.map((p) => (
                <motion.div key={p.title} variants={fadeUp}>
                  <h2 className="mb-2 text-[13px] font-semibold text-white/75">{p.title}</h2>
                  <p className="text-[15px] leading-[1.7] text-white">{p.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* 좁은 화면에서는 작업이 가로로 흐른다 */}
      <WorkRow className="py-3 lg:hidden" />

      {/* 자체 IP - SI 와 나란한 또 하나의 사업. 외주에서 파생된 것처럼 쓰지 않는다 */}
      <motion.div {...onMount} variants={fadeUp}
        className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-2 py-5`}>
          <p className="type-b4 text-[var(--text-1)]">자체 게임 {games.length}종 제작 · 퍼블리싱</p>
          <p className="type-c1 text-white/60">
            {games.map((g) => g.title).join(' · ')} · 기획부터 퍼블리싱까지 직접 합니다
          </p>
        </div>
      </motion.div>
    </section>
  );
}
