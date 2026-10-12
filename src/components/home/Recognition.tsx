'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { homeCredentials } from '@/data/domains';
import { affiliations, type Award } from '@/data/teamCapabilities';
import { ArrowSwap, Label } from '@/components/home/parts';
import { clipUp, fadeUp, rowIn, stagger, staggerTight, inView } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 밖에서 받은 평가 - 소속과, 확인할 수 있는 심사 · 전시 이력.
 *
 * 소속은 이름과 관계만 적는다. 상대 기관과 무엇을 함께 하는지는 받은 내용이 없다.
 * 이력은 해마다 묶어 연도를 한 번만 크게 쓴다. 줄마다 같은 숫자를 되풀이하지 않는다.
 */

/** 연도별 묶음 - homeCredentials 는 이미 최근 순이다 */
const byYear = homeCredentials.reduce<{ year: number; items: Award[] }[]>((groups, a) => {
  const group = groups.find((g) => g.year === a.year);
  if (group) group.items.push(a);
  else groups.push({ year: a.year, items: [a] });
  return groups;
}, []);

export default function Recognition() {
  return (
    <section data-surface="paper" className="surface-paper relative">
      <div className={`${container} pb-28 sm:pb-36`}>
        <div className="grid gap-x-gutter gap-y-14 border-t border-[var(--border-2)] pt-16 lg:grid-cols-12 lg:pt-24">

          <div className="lg:col-span-5">
            <motion.div {...inView} variants={fadeUp}>
              <Label className="text-[var(--point)]">밖에서 받은 평가</Label>
            </motion.div>
            <motion.h2 {...inView} variants={stagger} className="font-display display-l mt-7 text-[var(--text-1)]">
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">자랑은 짧게</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">하겠습니다.</motion.span>
              </span>
            </motion.h2>

            <motion.ul {...inView} variants={staggerTight} className="mt-12 lg:mt-16">
              {affiliations.map((a) => (
                <motion.li key={a.id} variants={rowIn} className="flex items-center gap-3.5 py-2">
                  <span className="font-display display-s text-[var(--text-1)]">{a.name}</span>
                  <span className="border border-[var(--border-2)] px-2 py-1 text-[12px] font-semibold leading-none text-[var(--text-2)]">
                    {a.role}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <motion.div {...inView} variants={staggerTight} className="border-b border-[var(--border-2)]">
              {byYear.map((g) => (
                <motion.div key={g.year} variants={rowIn}
                  className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 border-t border-[var(--border-2)] py-6 sm:grid-cols-[7rem_minmax(0,1fr)]">
                  <p className="font-display pt-1.5 leading-none text-[var(--point)]" style={{ fontSize: 'clamp(1.375rem, 2.3vw, 2.125rem)' }}>
                    {g.year}
                  </p>
                  <ul>
                    {g.items.map((a) => (
                      // 좁은 화면에서는 결과를 늘 아래 줄에 둔다. 제목 길이에 따라 옆에 붙었다 떨어졌다 하지 않게.
                      <li key={a.id} className="group flex flex-col gap-y-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-6">
                        <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                          <p className="text-[17px] font-bold text-[var(--text-1)]">{a.title}</p>
                          <p className="mt-0.5 text-[14px] text-[var(--text-3)]">{a.organization}</p>
                        </div>
                        {a.rank && <p className="text-[14px] font-semibold text-[var(--point)] sm:shrink-0 sm:text-right">{a.rank}</p>}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...inView} variants={fadeUp} className="mt-8">
              <Link href="/team" className="group inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--text-1)]">
                <span className="link-draw">전시 참가 이력까지 전부 보기</span>
                <ArrowSwap size={15} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
