'use client';

import { motion } from 'framer-motion';
import { games } from '@/data/games';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, stagger, inView } from '@/lib/motion';

/**
 * 자체 게임 - 맡는 일과 나란한 또 하나의 사업이라 화면 한 장을 따로 쓴다.
 *
 * 사진을 깔지 않는다. 두 타이틀 다 제작 중이고 공개할 그림을 아직 받지 못했다.
 * 남의 게임 사진을 깔면 저희 게임처럼 보인다. 대표 색상 면에 이름만 크게 둔다.
 *
 * 적는 것은 회사가 알려 준 데까지다: 두 타이틀을 만들고 있고, 퍼블리싱도 직접 한다.
 */
export default function Publishing() {
  return (
    <Screen id="publishing" tone="brand">
      <ScreenBody>
        <div className="grid items-center gap-x-12 gap-y-10 wide:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow className="text-[var(--text-3)]">Publishing</Eyebrow></motion.div>
            <motion.h2 id="publishing-title" variants={fadeUp} className="type-screen mt-4">
              <span className="block">MATE 이름으로</span>
              <span className="block">내는 게임</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-body text-[var(--text-2)] wide:mt-6">
              맡아서 만드는 일과 나란히 하는 저희 사업입니다. 기획부터 퍼블리싱까지 직접 합니다.
            </motion.p>
          </motion.div>

          <motion.div {...inView} variants={stagger}>
            <ul className="border-b border-[var(--border)]">
              {games.map((g) => (
                <motion.li key={g.id} variants={fadeUp}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--border)] py-6 wide:py-8">
                  <span className="type-hero">{g.title}</span>
                  {/* 상태는 색이 아니라 글자로 적는다 */}
                  <span className="rounded-chip border border-[var(--border-2)] px-3 py-1.5 text-sub font-medium text-[var(--text-1)]">
                    {g.status}
                  </span>
                </motion.li>
              ))}
            </ul>
            <motion.p variants={fadeUp} className="mt-5 text-sub text-[var(--text-3)]">
              공개할 수 있는 단계가 되면 여기에 올립니다.
            </motion.p>
          </motion.div>
        </div>
      </ScreenBody>
    </Screen>
  );
}
