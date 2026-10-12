'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDown } from 'react-icons/fi';
import { teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { games } from '@/data/games';
import { clipUp, fadeLeft, fadeRight, fadeUp, stagger, onMount } from '@/lib/motion';
import { arrowHover, btnPrimary, clipWrap, container, linkUnderline } from '@/lib/styles';

/**
 * 브랜드 오프닝.
 *
 * 서비스 나열로 페이지를 열면 "무엇을 파는가"는 보이지만 "어떤 회사인가"가
 * 남지 않는다. 캐치프레이즈 한 줄을 먼저 세우고, 그 아래에 그 말을 뒷받침하는
 * 두 축(개발 전문성 / 배포 안정성)만 사실로 붙인다.
 *
 * 숫자는 전부 데이터에서 끌어온다 - 여기에 상수를 적어 두면 역량 데이터와
 * 어긋나는 순간을 아무도 못 잡는다.
 */

const SINCE = 2020;
const TOTAL = teamCapabilities.capabilities.reduce((n, c) => n + c.projects, 0);

export default function BrandOpening() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--canvas)]">
      <div className={`${container} flex min-h-[86svh] flex-col justify-between pb-12 pt-32 sm:pb-16 sm:pt-40`}>

        {/* 머리 - 무엇을 하는 회사인지 한 줄로 못박는다 */}
        <motion.div {...onMount} variants={stagger}
          className="flex flex-wrap items-center justify-between gap-y-3">
          <motion.p variants={fadeLeft} className="index-num font-en">
            SI · Publishing · Since {SINCE}
          </motion.p>
          <motion.p variants={fadeRight} className="type-c1 flex items-center gap-2 text-white/60">
            {/* 캐치프레이즈를 글자로만 말하지 않는다 - 깜빡이는 점이 같은 말을 한다.
                운영 중인 서비스 수를 적고 싶지만 그 숫자는 데이터에 없다.
                포트폴리오 건수를 대신 끌어다 쓰면 거짓이 되므로 확인된 사실만 둔다. */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--point)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--point)]" />
            </span>
            상담 가능
          </motion.p>
        </motion.div>

        {/* 캐치프레이즈 */}
        <div className="py-16 sm:py-20">
          <motion.h1 {...onMount} variants={stagger}
            className="font-bold leading-[1.06] tracking-[-0.025em] text-[var(--text-1)]"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 9rem)' }}>
            <span className={clipWrap}>
              <motion.span variants={clipUp} className="block">멈추지 않게</motion.span>
            </span>
            <span className={clipWrap}>
              <motion.span variants={clipUp} className="block text-[var(--point)]">만듭니다</motion.span>
            </span>
          </motion.h1>

          <motion.p {...onMount} variants={fadeUp}
            className="mt-8 max-w-xl text-[17px] leading-[1.85] text-white/72 sm:mt-10 sm:text-[19px]">
            만드는 것과 돌아가게 하는 것은 다릅니다. MATE는 기획부터 배포와
            운영까지를 하나의 일로 봅니다.
          </motion.p>
        </div>

        {/* 두 축 + 진입 */}
        <motion.div {...onMount} variants={stagger}
          className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div variants={fadeLeft} className="grid max-w-xl gap-px bg-[var(--border)] sm:grid-cols-2">
            <div className="bg-[var(--canvas)] pr-6 pt-6 sm:pb-2">
              <p className="type-b4 mb-2 text-[var(--point)]">개발 전문성</p>
              <p className="type-b3 leading-[1.7] text-white/72">
                웹 · 앱, 게임 · XR, 교육. {SINCE}년부터 {TOTAL}건을 납품했습니다.
              </p>
            </div>
            <div className="bg-[var(--canvas)] pt-6 sm:pl-6 sm:pb-2">
              <p className="type-b4 mb-2 text-[var(--point)]">배포 안정성</p>
              <p className="type-b3 leading-[1.7] text-white/72">
                소스와 문서, 인프라 계정까지 넘겨드립니다. 저희 없이도 굴러가야 정상입니다.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeRight} className="flex shrink-0 flex-wrap items-center gap-7 lg:pb-16">
            <Link href="/contact" className={btnPrimary}>
              프로젝트 문의
              <FiArrowUpRight size={17} className={arrowHover} />
            </Link>
            <Link href="/projects" className={linkUnderline}>
              포트폴리오 {projects.length}건
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* 자체 IP - SI 와 나란한 또 하나의 사업. 외주에서 파생된 것처럼 쓰지 않는다 */}
      <motion.div {...onMount} variants={fadeUp}
        className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className={`${container} flex flex-wrap items-center gap-x-6 gap-y-2 py-5`}>
          <p className="type-b4 text-[var(--text-1)]">자체 게임 {games.length}종 제작 · 퍼블리싱</p>
          <p className="type-c1 text-white/60">
            {games.map((g) => g.title).join(' · ')} · 기획부터 퍼블리싱까지 직접 합니다
          </p>
          <FiArrowDown size={14} className="ml-auto hidden animate-bounce text-white/40 lg:block" />
        </div>
      </motion.div>
    </section>
  );
}
