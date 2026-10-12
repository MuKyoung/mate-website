'use client';

import { motion } from 'framer-motion';
import { games } from '@/data/games';
import { Label } from '@/components/home/parts';
import { clipUp, fadeUp, stagger, inView } from '@/lib/motion';
import { clipWrap } from '@/lib/styles';

/**
 * 자체 게임 - 맡는 일이 아니라 저희 사업이다. '하는 일' 목록에 끼우지 않고 따로 세운다.
 *
 * 파란 판은 화면 왼쪽을 비우고 오른쪽 끝까지 가며, 위로는 앞 섹션(검은 면)에
 * 걸쳐 올라간다.
 *
 * 적는 것은 회사가 알려 준 데까지다: 두 타이틀을 만들고 있고, 퍼블리싱도 직접 한다.
 * 장르나 출시 시기, 그림은 아직 받은 것이 없어 싣지 않는다.
 */
export default function OwnGames() {
  return (
    // flex: 첫 자식의 음수 여백이 섹션 밖으로 빠져나가 섹션째 끌려 올라가는 것을 막는다
    <section data-surface="paper" className="surface-paper relative flex flex-col">
      <div className="relative -mt-24 ml-4 sm:ml-10 lg:-mt-36 lg:ml-[16.666%]">
        <div className="surface-blue px-6 py-14 text-white sm:px-12 sm:py-16 lg:py-24 lg:pl-20 lg:pr-16">

          <motion.div {...inView} variants={fadeUp}>
            <Label className="text-white/90">자체 게임</Label>
          </motion.div>

          <motion.h2 {...inView} variants={stagger} className="font-display display-l mt-7">
            <span className={clipWrap}>
              <motion.span variants={clipUp} className="block">저희 게임도</motion.span>
            </span>
            <span className={clipWrap}>
              <motion.span variants={clipUp} className="block">만들고 있습니다.</motion.span>
            </span>
          </motion.h2>

          <motion.ul {...inView} variants={stagger}
            className="mt-12 flex flex-col gap-x-16 gap-y-8 border-t border-white/30 pt-10 sm:flex-row sm:flex-wrap lg:mt-16">
            {games.map((g, i) => (
              <motion.li key={g.id} variants={fadeUp} className="flex items-start gap-4">
                <span className="font-display leading-[1.15]" style={{ fontSize: 'clamp(2rem, 4.2vw, 3.75rem)' }}>
                  {g.title}
                </span>
                {/* 도장처럼 살짝 비뚤게 찍는다. 두 개가 같은 각도면 찍어 낸 것처럼 보인다. */}
                <span className={`mt-1.5 shrink-0 border-[1.5px] border-white px-2 py-1 text-[12px] font-bold leading-none
                                  ${i % 2 === 0 ? '-rotate-6' : 'rotate-3'}`}>
                  {g.status}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p {...inView} variants={fadeUp} className="mt-10 max-w-xl text-[16px] leading-[1.9] text-white/90 sm:text-[17px]">
            외주와 따로 굴러가는 저희 사업입니다. 만드는 타이틀 모두 기획부터 퍼블리싱까지 직접 합니다.
            공개할 수 있는 단계가 되면 여기에 올리겠습니다.
          </motion.p>
        </div>
      </div>

      <div className="h-24 sm:h-32" />
    </section>
  );
}
