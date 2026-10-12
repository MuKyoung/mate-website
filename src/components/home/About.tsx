'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { counts, teamCapabilities } from '@/data/teamCapabilities';
import { departments, totalHeadcount } from '@/data/organization';
import { stock } from '@/data/stock';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, stagger, inView } from '@/lib/motion';
import { btnOutline } from '@/lib/styles';

/**
 * 소개 - 서비스를 나열하기 전에 어떤 회사인지부터 답한다.
 *
 * 숫자(연도, 건수, 인원)는 적어 넣지 않고 데이터에서 가져온다.
 * 두 축의 문장은 진행 절차의 '배포 후 모니터링' 과 FAQ 의 '완료 후 유지보수' 에서 온 것이다.
 */

const { since } = teamCapabilities.stats;
const roster = departments.map((d) => `${d.name} ${d.headcount}`).join(' · ');

const pillars = [
  {
    name: '개발 전문성',
    body: `${since}년부터 웹 · 앱과 게임 · XR ${counts.devProjects}건을 납품하고, 강의 ${counts.lectures}건을 진행했습니다.`,
  },
  {
    name: '배포 안정성',
    body: '배포한 뒤에도 모니터링으로 안정성을 확인합니다. 끝난 뒤의 버그 수정과 업데이트도 이어서 맡습니다.',
  },
];

export default function About() {
  return (
    <Screen id="about">
      <ScreenBody>
        <div className="grid items-center gap-x-16 gap-y-6 wide:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)]">

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>About</Eyebrow></motion.div>
            <motion.h2 id="about-title" variants={fadeUp} className="type-screen mt-4 text-[var(--text-1)]">
              <span className="block">맡아서 만들고,</span>
              <span className="block">저희 이름으로도 냅니다</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-body text-[var(--text-2)] wide:mt-6">
              MATE는 SI 개발과 자체 퍼블리싱을 함께 하는 팀입니다.
              {' '}{since}년에 시작해 웹 · 앱, 게임 · XR, 교육으로 영역을 넓혀 왔습니다.
            </motion.p>
            {/* 좁은 화면에서는 줄인다. 인원 구성은 팀 페이지에 있다. */}
            <motion.p variants={fadeUp} className="mt-3 hidden max-w-xl text-body text-[var(--text-2)] medium:block">
              두 사업의 기준은 같습니다. 만든 것이 멈추지 않아야 한다는 것.
              {' '}{roster}, {totalHeadcount}명이 한 팀으로 움직입니다.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 hidden wide:block">
              <Link href="/team" className={btnOutline}>팀 전체 보기</Link>
            </motion.div>
          </motion.div>

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}
              className="relative -mx-3 aspect-[3/1] overflow-hidden rounded-block bg-surface-2 medium:mx-0 medium:aspect-[21/9]
                         wide:aspect-auto wide:h-[clamp(170px,38svh,420px)]">
              <Image src={stock.about.src} alt="" fill sizes="(min-width: 960px) 50vw, 100vw" className="object-cover" />
            </motion.div>

            <motion.div variants={fadeUp} className="-mx-3 mt-3 overflow-hidden rounded-block bg-surface medium:mx-0 medium:mt-4">
              <dl className="wide:grid wide:grid-cols-2">
                {pillars.map((p, i) => (
                  <div key={p.name}
                    className={`px-6 py-4 medium:py-5 wide:px-7 wide:py-6 ${i > 0 ? 'border-t border-[var(--border)] wide:border-l wide:border-t-0' : ''}`}>
                    <dt className="text-lst font-medium text-[var(--text-1)]">{p.name}</dt>
                    <dd className="mt-1.5 text-btn leading-[1.7] text-[var(--text-2)]">{p.body}</dd>
                  </div>
                ))}
              </dl>
              {/* 태블릿 폭에서는 팀 페이지로 가는 길을 목록의 마지막 줄로 둔다.
                  휴대폰에서는 뺀다. 한 장에 담아야 하고, 아래 탭에 '팀' 이 있다. */}
              <Link href="/team"
                className="hidden items-center justify-between border-t border-[var(--border)] px-6 py-4 text-lst font-medium text-[var(--text-1)]
                           transition-colors duration-150 hover:bg-fg/[0.04] medium:flex wide:hidden">
                팀 전체 보기
                <FiChevronRight aria-hidden size={20} className="text-[var(--text-3)]" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </ScreenBody>
    </Screen>
  );
}
