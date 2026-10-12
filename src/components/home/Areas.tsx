'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { domains } from '@/data/domains';
import { projects } from '@/data/projects';
import type { DomainKey } from '@/types';
import { ArrowSwap, Label } from '@/components/home/parts';
import { clipUp, fadeUp, rowIn, stagger, staggerTight, inView } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 하는 일 - 서비스 이름을 늘어놓는 대신, 저희를 찾게 되는 상황으로 말한다.
 *
 * 세 줄은 왼쪽 시작점이 서로 다르다(계단). 같은 틀의 카드 셋을 나란히 세우면
 * 찍어 낸 것처럼 보인다.
 *
 * 자체 게임은 여기 넣지 않는다. 맡는 일이 아니라 저희 사업이라 따로 둔다.
 */

/** 영역에 속하는 공개 작업을 포트폴리오 분류로 찾는다 */
const BELONGS: Record<DomainKey, RegExp> = {
  web: /Web|Mobile/,
  game: /Game|VR|AR/,
  edu: /Education/,
};

/** 줄마다 다른 들여쓰기 - 넓은 화면에서만 */
const STEP = ['', 'lg:ml-[16.666%]', 'lg:ml-[8.333%]'];

const SHOW = 3;

const rows = domains.map((d) => {
  const mine = projects.filter((p) => BELONGS[d.key].test(p.category));
  const names = mine.slice(0, SHOW).map((p) => p.title).join(', ');
  return { ...d, examples: mine.length > SHOW ? `${names} 외 ${mine.length - SHOW}건` : names };
});

export default function Areas() {
  return (
    <section data-surface="paper" className="surface-paper relative">
      {/* 아래 여백을 넉넉히 둔다. 다음 섹션의 첫 그림이 이 위로 걸쳐 올라온다. */}
      <div className={`${container} pb-28 pt-8 sm:pb-36 lg:pb-72`}>

        <motion.div {...inView} variants={fadeUp}>
          <Label className="text-[var(--point)]">하는 일</Label>
        </motion.div>

        <motion.h2 {...inView} variants={stagger} className="font-display display-l mt-7 text-[var(--text-1)]">
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">이럴 때</motion.span>
          </span>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">찾아 주세요.</motion.span>
          </span>
        </motion.h2>

        <motion.ul {...inView} variants={staggerTight} className="mt-14 lg:mt-20">
          {rows.map((d, i) => (
            <motion.li key={d.key} variants={rowIn} className={STEP[i] ?? ''}>
              <Link href={`/${d.slug}`}
                className="group relative grid items-start gap-x-10 gap-y-6 border-t border-[var(--border-2)] py-9
                           sm:py-11 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)_auto]">
                {/* 올리면 파란 줄이 왼쪽에서 그어진다 */}
                <span aria-hidden
                  className="absolute -top-px left-0 h-[2px] w-full origin-left scale-x-0 bg-[var(--point)]
                             transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                             group-hover:scale-x-100 group-focus-visible:scale-x-100" />

                <h3 className="font-display display-m text-balance text-[var(--text-1)] transition-colors duration-300
                               group-hover:text-[var(--point)]">
                  {d.trigger}
                </h3>

                <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  <p className="flex items-center gap-2 text-[15px] font-bold text-[var(--text-1)]">
                    {d.kr}
                    {/* 좁은 화면에서는 큰 동그라미 대신 이름 옆 화살표로 갈 곳을 알린다 */}
                    <span className="text-[var(--point)] lg:hidden"><ArrowSwap size={15} /></span>
                  </p>
                  <p className="mt-2.5 text-[15px] leading-[1.85] text-[var(--text-2)]">{d.summary}</p>
                  {d.examples && (
                    <p className="mt-3 text-[13px] leading-[1.7] text-[var(--text-3)]">공개한 작업 · {d.examples}</p>
                  )}
                </div>

                <span className="hidden h-14 w-14 items-center justify-center rounded-full border border-[var(--border-2)]
                                 text-[var(--text-1)] transition-colors duration-300 lg:flex
                                 group-hover:border-[var(--point)] group-hover:bg-[var(--point)] group-hover:text-white">
                  <ArrowSwap size={19} />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
