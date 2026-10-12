'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { homeCredentials } from '@/data/domains';
import { affiliations } from '@/data/teamCapabilities';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, rowIn, stagger, staggerRows, inView } from '@/lib/motion';
import { btnOutline } from '@/lib/styles';

/**
 * 밖에서 받은 평가 - 소속과, 확인할 수 있는 심사 · 전시 이력.
 *
 * 소속은 이름과 관계만 적는다. 상대 기관과 무엇을 함께 하는지는 받은 내용이 없다.
 * 이력은 최근 것부터 여섯 건이고 전체 목록은 팀 페이지에 있다.
 * 사진을 깔지 않는다. 남의 시상식이나 전시장 사진은 저희 것처럼 보인다.
 */

/** 좁은 화면에서는 한 장에 담기도록 이만큼만 보인다 */
const SHOW_NARROW = 3;

export default function Recognition() {
  return (
    <Screen id="recognition">
      <ScreenBody>
        <div className="grid items-center gap-x-12 gap-y-6 wide:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Recognition</Eyebrow></motion.div>
            <motion.h2 id="recognition-title" variants={fadeUp} className="type-screen mt-4 text-[var(--text-1)]">
              <span className="wide:block">밖에서 </span>
              <span className="wide:block">받은 평가</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 hidden max-w-sm text-body text-[var(--text-2)] wide:block">
              전시 참가 이력을 포함한 전체 목록은 팀 페이지에 있습니다.
            </motion.p>

            {/* 소속 */}
            <motion.ul variants={fadeUp} className="mt-4 flex flex-wrap gap-2 wide:mt-8 wide:flex-col wide:items-start">
              {affiliations.map((a) => (
                <li key={a.id}
                  className="inline-flex h-11 items-center gap-2.5 rounded-chip bg-surface px-4 text-btn font-medium text-[var(--text-1)]">
                  {a.name}
                  <span className="font-normal text-[var(--text-3)]">{a.role}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-8 hidden wide:block">
              <Link href="/team" className={btnOutline}>수상 · 전시 전체 보기</Link>
            </motion.div>
          </motion.div>

          <div>
            <motion.ul {...inView} variants={staggerRows} className="-mx-3 overflow-hidden rounded-block bg-surface medium:mx-0">
              {homeCredentials.map((a, i) => (
                <motion.li key={a.id} variants={rowIn}
                  className={`grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-x-4 px-6 py-4 medium:grid-cols-[4rem_minmax(0,1fr)_auto] medium:px-7 wide:py-[clamp(0.5rem,1.9svh,1.25rem)]
                              ${i > 0 ? 'border-t border-[var(--border)]' : ''} ${i >= SHOW_NARROW ? 'hidden medium:grid' : 'grid'}`}>
                  <span className="text-sub text-[var(--text-3)]">{a.year}</span>
                  <span className="min-w-0">
                    <span className="block text-lst font-medium text-[var(--text-1)]">{a.title}</span>
                    <span className="mt-0.5 block text-sub text-[var(--text-3)]">
                      {a.organization}
                      {/* 좁은 화면에서는 결과를 기관 옆에 잇는다 */}
                      <span className="medium:hidden"> · {a.rank}</span>
                    </span>
                  </span>
                  <span className="hidden text-sub font-medium text-[var(--accent)] medium:block">{a.rank}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div {...inView} variants={fadeUp} className="mt-4 wide:hidden">
              <Link href="/team" className={`${btnOutline} w-full medium:w-auto`}>수상 · 전시 전체 보기</Link>
            </motion.div>
          </div>
        </div>
      </ScreenBody>
    </Screen>
  );
}
