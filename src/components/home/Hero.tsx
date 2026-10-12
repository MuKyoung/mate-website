'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import WorkWall from '@/components/WorkWall';
import { panes } from '@/components/home/kit';
import { fadeUp, stagger, onMount } from '@/lib/motion';
import { arrowHover, btnOnBrand, btnOnBrandQuiet, btnOutline, btnPrimary, container } from '@/lib/styles';

/**
 * 첫 화면.
 *
 * 왼쪽 면 - 보는 곳. 대표 색상(로고의 파랑) 면에 캐치프레이즈를 흰 글자로 올린다.
 * 오른쪽 면 - 실제로 만든 작업이 멈추지 않고 흐른다.
 *
 * 누르는 것은 아래에 둔다. 넓은 화면에서는 파란 면의 맨 아래, 좁은 화면에서는
 * 두 면 아래(엄지가 닿는 곳)다.
 */

const { since } = teamCapabilities.stats;

export default function Hero() {
  return (
    // 상단 바(64px) 아래에서 시작한다
    <section className="pt-16">
      <div className={`${container} pt-3 medium:pt-4`}>
        <div className={`${panes} gap-3 medium:gap-4`}>

          <motion.div {...onMount} variants={stagger}
            className="on-brand -mx-3 flex flex-col rounded-block px-6 pb-9 pt-12 text-center
                       medium:mx-0 medium:min-h-[min(calc(100svh-7rem),760px)] medium:px-9 medium:pb-9 medium:pt-10 medium:text-left
                       wide:px-11 wide:pb-11 wide:pt-12">
            <motion.p variants={fadeUp} className="text-sub font-medium text-[var(--text-3)]">
              SI · Publishing · Since {since}
            </motion.p>

            <div className="mt-6 medium:mt-auto">
              <motion.h1 variants={fadeUp} className="type-hero text-balance">
                멈추지 않게 만듭니다
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-body text-[var(--text-2)] wide:text-lst">
                {/* 문장 단위로 끊는다 - 흘려 두면 마지막 낱말만 다음 줄로 떨어진다 */}
                <span className="block">만드는 것과 돌아가게 하는 것은 다릅니다.</span>
                <span className="block">그래서 배포한 뒤까지 봅니다.</span>
              </motion.p>

              {/* 면이 좁은 구간(600~960px)에서는 버튼을 면 폭에 맞춰 위아래로 쌓는다 */}
              <motion.div variants={fadeUp} className="mt-9 hidden flex-col gap-2 medium:flex wide:flex-row wide:flex-wrap">
                <Link href="/contact" className={`${btnOnBrand} medium:px-4 wide:px-7`}>
                  프로젝트 문의
                  <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
                </Link>
                <Link href="/projects" className={`${btnOnBrandQuiet} medium:px-4 wide:px-7`}>포트폴리오 {projects.length}건</Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div {...onMount} variants={fadeUp}
            className="relative -mx-3 h-[184px] overflow-hidden rounded-block bg-surface medium:mx-0 medium:h-auto">
            <div className="absolute inset-0">
              <WorkWall />
            </div>
          </motion.div>
        </div>

        {/* 좁은 화면의 동작 - 첫 화면의 맨 아래 */}
        <motion.div {...onMount} variants={fadeUp} className="mt-4 grid gap-2 medium:hidden">
          <Link href="/contact" className={btnPrimary}>
            프로젝트 문의
            <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
          </Link>
          <Link href="/projects" className={btnOutline}>포트폴리오 {projects.length}건</Link>
        </motion.div>
      </div>
    </section>
  );
}
