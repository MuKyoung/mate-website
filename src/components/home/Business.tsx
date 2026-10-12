'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { domains } from '@/data/domains';
import { stock, type StockPhoto } from '@/data/stock';
import type { DomainKey } from '@/types';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, stagger, inView } from '@/lib/motion';

/**
 * 하는 일 - 맡는 세 영역.
 *
 * 넓은 화면: 왼쪽 목록에서 영역에 올리면 오른쪽 큰 사진이 그 영역 것으로 바뀐다.
 *            사진은 겹쳐서 바뀐다 (앞 사진이 다 사라지기 전에 다음 사진이 나타난다).
 * 좁은 화면: 올리는 동작이 없으므로 영역마다 사진을 깐 줄로 보여 준다.
 *
 * 자체 게임은 여기 넣지 않는다. 맡는 일이 아니라 저희 사업이라 다음 화면에 따로 둔다.
 */

const PHOTO: Record<DomainKey, StockPhoto> = { web: stock.web, game: stock.game, edu: stock.edu };

/** 사진마다 다른 맞춤. 코드 화면 사진은 둘레가 어두워서 당겨 잡아야 글자가 보인다. */
const FIT: Record<DomainKey, string> = {
  web: 'scale-[1.38] object-[50%_42%]',
  game: 'object-center',
  edu: 'object-center',
};

/** 사진 위 글자를 읽히게 하는 어두운 막. 값은 글자 뒤 픽셀로 대비를 재서 정했다. */
const shade = 'linear-gradient(0deg, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.30) 46%, rgba(8,8,8,0.04) 100%)';
/** 좁은 화면의 줄은 높이가 낮아 글자가 사진의 절반을 덮는다. 더 짙게 누른다. */
const shadeRow = 'linear-gradient(0deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.80) 58%, rgba(8,8,8,0.46) 100%)';

export default function Business() {
  const [active, setActive] = useState(0);

  return (
    <Screen id="business">
      <ScreenBody>
        <div className="grid items-center gap-x-12 gap-y-7 medium:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Business</Eyebrow></motion.div>
            <motion.h2 id="business-title" variants={fadeUp} className="type-screen mt-4 text-[var(--text-1)]">
              하는 일
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-body text-[var(--text-2)]">
              웹 · 앱, 게임 · XR, 교육. 어느 영역이든 창구는 하나입니다.
            </motion.p>

            {/* 넓은 화면의 목록 */}
            <motion.ul variants={fadeUp} className="mt-[clamp(1.25rem,4svh,2.5rem)] hidden border-b border-[var(--border)] medium:block">
              {domains.map((d, i) => {
                const on = i === active;
                return (
                  <li key={d.key} className="border-t border-[var(--border)]">
                    <Link href={`/${d.slug}`}
                      onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                      className="group relative flex items-center gap-4 py-[clamp(0.8rem,2.4svh,1.5rem)] pl-5">
                      {/* 지금 사진이 걸린 영역은 색만이 아니라 왼쪽 막대와 굵기로도 알린다 */}
                      <span aria-hidden
                        className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)] transition-all duration-300 ease-calm ${
                          on ? 'h-9 opacity-100' : 'h-0 opacity-0'}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-dlg transition-colors duration-150 ${
                          on ? 'font-bold text-[var(--text-1)]' : 'font-medium text-[var(--text-2)]'}`}>
                          {d.kr}
                        </span>
                        <span className="mt-1 block text-btn text-[var(--text-3)]">{d.lead}</span>
                      </span>
                      <FiChevronRight aria-hidden size={20}
                        className="shrink-0 text-[var(--text-3)] transition-transform duration-150 ease-calm group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          </motion.div>

          {/* 넓은 화면의 큰 사진 */}
          <motion.div {...inView} variants={fadeUp}
            className="relative hidden h-[clamp(280px,60svh,640px)] overflow-hidden rounded-block bg-[#080808] medium:block">
            {domains.map((d, i) => (
              <Image key={d.key} src={PHOTO[d.key].src} alt="" fill sizes="(min-width: 600px) 58vw, 100vw"
                className={`object-cover transition-opacity duration-500 ease-calm ${FIT[d.key]} ${i === active ? 'opacity-100' : 'opacity-0'}`} />
            ))}
            <div aria-hidden className="absolute inset-0" style={{ background: shade }} />
            <div className="theme-dark absolute inset-x-0 bottom-0 p-7 wide:p-9">
              <p className="text-ext font-bold text-[var(--text-1)]">{domains[active].en}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {domains[active].tags.map((t) => (
                  <li key={t} className="rounded-chip bg-white/15 px-3 py-1.5 text-min font-medium text-[var(--text-1)]">{t}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 좁은 화면 - 영역마다 사진을 깐 줄 */}
          <motion.ul {...inView} variants={stagger} className="-mx-3 space-y-3 medium:hidden">
            {domains.map((d) => (
              <motion.li key={d.key} variants={fadeUp}>
                <Link href={`/${d.slug}`}
                  className="theme-dark relative flex h-[104px] items-end overflow-hidden rounded-block bg-[#080808] px-6 py-5 active:opacity-90">
                  <Image src={PHOTO[d.key].src} alt="" fill sizes="100vw" className={`object-cover ${FIT[d.key]}`} />
                  <span aria-hidden className="absolute inset-0" style={{ background: shadeRow }} />
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-lst font-bold text-[var(--text-1)]">{d.kr}</span>
                    <span className="mt-0.5 block truncate text-sub text-[var(--text-2)]">{d.lead}</span>
                  </span>
                  <FiChevronRight aria-hidden size={20} className="relative shrink-0 text-[var(--text-1)]" />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </ScreenBody>
    </Screen>
  );
}
