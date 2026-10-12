'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { counts, teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { games } from '@/data/games';
import { clipUp, fadeLeft, fadeRight, fadeUp, stagger, onMount } from '@/lib/motion';
import { arrowHover, btnPrimary, clipWrap, container, linkUnderline } from '@/lib/styles';

/**
 * 브랜드 오프닝.
 *
 * 서비스 나열로 페이지를 열면 "무엇을 파는가"는 보이지만 "어떤 회사인가"가
 * 남지 않는다. 캐치프레이즈를 왼쪽에 세우고, 오른쪽에는 그 말을 뒷받침하는
 * 두 축만 붙인다.
 *
 * 두 축의 문장은 회사가 원래 밝혀 둔 내용(진행 절차의 '배포 후 모니터링',
 * FAQ 의 '완료 후 유지보수')에서만 가져온다. 캐치프레이즈에 맞춰 약속을
 * 지어내면 그 순간부터 이 화면은 광고가 된다.
 */

const { since } = teamCapabilities.stats;

/** 두 축 - 왼쪽 캐치프레이즈의 근거 */
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
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--canvas)]">
      <div className={`${container} flex min-h-[80svh] flex-col pb-12 pt-32 sm:pb-16 sm:pt-40`}>

        {/* 머리 - 무엇을 하는 회사인지 한 줄로 못박는다 */}
        <motion.div {...onMount} variants={stagger}
          className="flex flex-wrap items-center justify-between gap-y-3">
          <motion.p variants={fadeLeft} className="index-num font-en">
            SI · Publishing · Since {since}
          </motion.p>
          <motion.p variants={fadeRight} className="type-c1 flex items-center gap-2 text-white/60">
            {/* 캐치프레이즈를 글자로만 말하지 않는다 - 깜빡이는 점이 같은 말을 한다.
                운영 중인 서비스 수를 적고 싶지만 그 숫자는 데이터에 없다.
                포트폴리오 건수를 대신 끌어다 쓰면 거짓이 되므로 확인된 사실만 둔다. */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--point)] opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--point)]" />
            </span>
            상담 가능
          </motion.p>
        </motion.div>

        {/* 좌: 캐치프레이즈 / 우: 그 말의 근거와 진입.
            아래 기준선에 맞춰 두면 큰 글자에서 시작한 시선이 오른쪽 아래로 내려온다. */}
        <div className="grid flex-1 items-end gap-x-gutter gap-y-14 pt-16 sm:pt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
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
              만드는 것과 돌아가게 하는 것은 다릅니다. 그래서 배포한 뒤까지 봅니다.
            </motion.p>
          </div>

          <motion.div {...onMount} variants={stagger} className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-[var(--border)]">
              {pillars.map((p) => (
                <motion.div key={p.title} variants={fadeUp} className="border-b border-[var(--border)] py-6">
                  <h2 className="type-b4 mb-2 text-[var(--point)]">{p.title}</h2>
                  <p className="type-b3 leading-[1.75] text-white/72">{p.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-7">
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
      </div>

      {/* 자체 IP - SI 와 나란한 또 하나의 사업. 외주에서 파생된 것처럼 쓰지 않는다 */}
      <motion.div {...onMount} variants={fadeUp}
        className="border-t border-[var(--border)] bg-[var(--surface)]">
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
