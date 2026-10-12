'use client';

import { motion } from 'framer-motion';
import { practices } from '@/data/practices';
import { Dots, Label } from '@/components/home/parts';
import { clipUp, easeEnter, fadeUp, rowIn, stagger, staggerTight, inView } from '@/lib/motion';
import { clipWrap, container } from '@/lib/styles';

/**
 * 일하는 방식 - 프로젝트가 흘러가는 순서대로.
 *
 * 왼쪽 제목은 스크롤을 따라 붙어 있고 오른쪽 목록만 흐른다. 양쪽 폭이 다르다.
 * 문장은 practices.ts 것을 그대로 쓴다. 고객이 계약 조건처럼 읽는 목록이라
 * 여기서 말을 보태지 않는다.
 *
 * 마지막 줄(배포한 뒤에도 지켜봅니다)에는 손으로 그은 듯한 밑줄을 긋는다.
 * 캐치프레이즈가 약속하는 것이 바로 이 줄이다.
 */
export default function Practices() {
  const last = practices.length - 1;

  return (
    <section data-surface="paper" className="surface-paper relative">
      <div className={`${container} pb-24 pt-4 sm:pb-32 lg:pt-8`}>
        <div className="grid gap-x-gutter gap-y-12 lg:grid-cols-12">

          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <motion.div {...inView} variants={fadeUp}>
              <Label className="text-[var(--point)]">일하는 방식</Label>
            </motion.div>
            <motion.h2 {...inView} variants={stagger} className="font-display display-l mt-7 text-[var(--text-1)]">
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">일은 이렇게</motion.span>
              </span>
              <span className={clipWrap}>
                <motion.span variants={clipUp} className="block">합니다.</motion.span>
              </span>
            </motion.h2>
            <motion.p {...inView} variants={fadeUp} className="mt-7 max-w-xs text-[15px] leading-[1.85] text-[var(--text-2)]">
              프로젝트가 흘러가는 순서대로 적었습니다.
            </motion.p>
          </div>

          <motion.ol {...inView} variants={staggerTight} className="border-b border-[var(--border-2)] lg:col-span-7 lg:col-start-6">
            {practices.map((v, i) => (
              <motion.li key={v.title} variants={rowIn} className="group relative border-t border-[var(--border-2)] py-8 sm:py-10">
                {/* 올리면 두 점이 나오고 글이 자리를 내준다 */}
                <Dots className="absolute left-0 top-[3.1rem] -translate-x-2 text-[var(--point)] opacity-0 transition-all duration-500
                                 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 sm:top-[3.75rem]" />
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-7">
                  <h3 className="font-display display-m text-[var(--text-1)]">
                    {i === last ? (
                      <span className="relative inline-block">
                        {v.title}
                        <svg aria-hidden viewBox="0 0 400 14" preserveAspectRatio="none"
                          className="absolute -bottom-2 left-0 h-[0.34em] w-full overflow-visible">
                          <motion.path
                            d="M3 8.5 C 58 2.5, 96 12, 150 6.5 S 248 3, 300 8 S 366 9.5, 397 4.5"
                            fill="none" stroke="var(--point)" strokeWidth="3" strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                            viewport={{ once: true, margin: '-18% 0px' }}
                            transition={{ delay: 0.35, duration: 0.9, ease: easeEnter }} />
                        </svg>
                      </span>
                    ) : v.title}
                  </h3>
                  <p className="mt-3.5 max-w-[36rem] text-[16px] leading-[1.9] text-[var(--text-2)]">{v.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
