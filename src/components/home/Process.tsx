'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { practices } from '@/data/practices';
import { stock } from '@/data/stock';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, rowIn, stagger, staggerTight, inView } from '@/lib/motion';

/**
 * 일하는 방식 - 프로젝트가 흘러가는 순서대로.
 *
 * 문장은 practices.ts 것을 그대로 쓴다. 고객이 계약 조건처럼 읽는 목록이라
 * 여기서 말을 보태지 않는다.
 *
 * 넓은 화면에서는 순서가 한눈에 보이게 가로로 놓고 한 줄로 잇는다.
 * 좁은 화면에서는 위에서 아래로 읽는 목록으로 놓는다.
 */
export default function Process() {
  return (
    <Screen id="process">
      <ScreenBody>
        <motion.div {...inView} variants={stagger} className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div>
            <motion.div variants={fadeUp}><Eyebrow>Process</Eyebrow></motion.div>
            <motion.h2 id="process-title" variants={fadeUp} className="type-screen mt-4 text-[var(--text-1)]">
              일하는 방식
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} className="max-w-sm text-body text-[var(--text-2)] wide:pb-2">
            프로젝트가 흘러가는 순서대로 적었습니다.
          </motion.p>
        </motion.div>

        {/* 사진은 넓은 화면에서만 건다. 좁은 화면은 다섯 줄만으로 한 장이 찬다. */}
        <motion.div {...inView} variants={fadeUp}
          className="relative mt-[clamp(1.25rem,3.6svh,2.25rem)] hidden h-[clamp(96px,20svh,250px)] overflow-hidden rounded-block bg-surface-2 medium:block">
          <Image src={stock.process.src} alt="" fill sizes="100vw" className="object-cover object-[50%_38%]" />
        </motion.div>

        {/* 넓은 화면 - 가로로 이은 다섯 단계 */}
        <motion.ol {...inView} variants={staggerTight}
          className="mt-[clamp(1.5rem,4svh,2.25rem)] hidden grid-cols-5 gap-x-6 border-t border-[var(--border-2)] wide:grid">
          {practices.map((v) => (
            <motion.li key={v.title} variants={rowIn} className="relative pt-6">
              {/* 선 위의 마디 */}
              <span aria-hidden className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-[var(--accent)]" />
              <h3 className="text-lst font-medium text-[var(--text-1)]">{v.title}</h3>
              <p className="mt-2 text-btn leading-[1.7] text-[var(--text-2)]">{v.desc}</p>
            </motion.li>
          ))}
        </motion.ol>

        {/* 좁은 화면 - 위에서 아래로 */}
        <motion.ol {...inView} variants={staggerTight}
          className="-mx-3 mt-5 overflow-hidden rounded-block bg-surface medium:mx-0 medium:mt-6 wide:hidden">
          {practices.map((v, i) => (
            <motion.li key={v.title} variants={rowIn}
              className={`px-6 py-3.5 medium:px-7 medium:py-4 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
              <h3 className="text-lst font-medium text-[var(--text-1)]">{v.title}</h3>
              <p className="mt-0.5 text-btn leading-[1.6] text-[var(--text-2)]">{v.desc}</p>
            </motion.li>
          ))}
        </motion.ol>
      </ScreenBody>
    </Screen>
  );
}
