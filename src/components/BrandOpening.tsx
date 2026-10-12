'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { WorkRow, WorkWall } from '@/components/WorkWall';
import { ArrowSwap, Label, Magnetic } from '@/components/home/parts';
import { clipUp, easeEnter, fadeUp, stagger, onMount } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 브랜드 오프닝.
 *
 * 화면 전체가 대표 색상(로고의 파랑) 면이고, 캐치프레이즈를 흰 글자로 올린다.
 * 오른쪽에는 그 면에 창을 내서 실제로 만든 작업이 멈추지 않고 흐르게 한다.
 *
 * 창은 파란 면 안에 얌전히 들어앉지 않는다. 아래로 삐져나와 다음 섹션(종이 면)에
 * 걸친다. 칸마다 딱 떨어지게 채우면 어느 템플릿에서나 보는 화면이 된다.
 *
 * 두 축(개발 전문성, 배포 안정성)은 다음 섹션으로 내렸다. 첫 화면에는 문장 하나만 둔다.
 */

const { since } = teamCapabilities.stats;

export default function BrandOpening() {
  return (
    // z-10: 창이 다음 섹션 위로 걸쳐야 하므로 뒤따르는 섹션보다 위에 그린다
    <section className="surface-blue relative z-10 text-white">

      {/* 작업 창 - 헤더 높이만큼은 파란 면으로 남긴다. 그래야 메뉴가 어느 폭에서도
          한 가지 바탕 위에 놓인다. 아래로는 다음 섹션에 걸칠 만큼 내려간다. */}
      <div className="absolute right-0 top-24 hidden w-[38%] lg:block min-[1536px]:w-[41%]" style={{ bottom: '-6.5rem' }}>
        <div className="h-full overflow-hidden bg-[var(--canvas)]">
          <WorkWall className="h-full" />
        </div>
        {/* 창 모서리에 붙인 쪽지. 그림자는 번지지 않게 딱 떨어뜨린다. */}
        <motion.p
          initial={{ opacity: 0, y: -14, rotate: -9 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ delay: 1.0, duration: 0.7, ease: easeEnter }}
          className="absolute -left-9 top-12 bg-[var(--paper)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)]"
          style={{ boxShadow: '3px 4px 0 rgba(8, 8, 10, 0.24)' }}>
          전부 저희가 만든 것들입니다
        </motion.p>
      </div>

      <div className={`relative ${container}`}>
        {/* 본문은 창 왼쪽에 머문다. 창이 화면의 38~41% 이므로 컨테이너의 57% 면 겹치지 않는다. */}
        <div className="flex flex-col pb-14 pt-28 sm:pt-36 lg:min-h-[min(100svh,920px)] lg:w-[57%] lg:pb-20">

          <motion.div {...onMount} variants={fadeUp}>
            <Label className="text-white/90">SI · 퍼블리싱 · {since}년부터</Label>
          </motion.div>

          <div className="mt-12 lg:mt-auto">
            {/* 둘째 줄을 들여 계단을 만든다. 두 줄을 왼쪽에 나란히 맞추면 제목이 상자처럼 굳는다. */}
            <motion.h1 {...onMount} variants={stagger} className="font-display display-xl">
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">멈추지 않게</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block sm:pl-[0.82em]">만듭니다</motion.span>
              </span>
            </motion.h1>

            <motion.p {...onMount} variants={fadeUp}
              className="mt-8 text-[17px] leading-[1.8] text-white/90 sm:mt-10 sm:text-[19px]">
              {/* 문장 단위로 끊는다 - 흘려 두면 마지막 낱말만 다음 줄로 떨어진다 */}
              <span className="block">만드는 것과 돌아가게 하는 것은 다릅니다.</span>
              <span className="block">그래서 배포한 뒤까지 봅니다.</span>
            </motion.p>

            <motion.div {...onMount} variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Magnetic>
                <Link href="/contact" className="group btn-sweep btn-on-blue">
                  프로젝트 이야기하기
                  <ArrowSwap />
                </Link>
              </Magnetic>
              <Link href="/projects" className="group inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                <span className="link-draw">만든 것 {projects.length}건 보기</span>
                <ArrowSwap size={15} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 좁은 화면에서는 작업이 가로로 흐른다. 띠의 아래 절반이 다음 섹션에 걸친다. */}
      <div className="relative -mb-[4.25rem] lg:hidden">
        <WorkRow />
      </div>
    </section>
  );
}
