'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { Project } from '@/types';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { blurUp, easeEnter, inView } from '@/lib/motion';
import { arrowHover, linkMore } from '@/lib/styles';

/**
 * 최근 작업 - Resend 홈의 코드 틀("Integrate this afternoon")을 옮겼다.
 * 윗줄 탭에서 작업을 고르면 틀 안의 화면과 설명이 흐림으로 바뀐다. 한 번에 하나를 크게 본다.
 * 빛줄은 틀 윗변 오른쪽에 둔다 (Resend 코드 틀과 같은 자리).
 */
export default function WorkShowcase({ items, total }: { items: Project[]; total: number }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = items[active];
  if (!p) return null;

  // 탭 사이를 좌우 화살표로 옮긴다 (WAI-ARIA 탭 패턴)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <motion.div {...inView} variants={blurUp} className="beam-frame overflow-hidden"
      style={{ '--beam-x': '74%', '--beam-w': 'min(44%, 520px)' } as React.CSSProperties}>
      {/* 탭 줄 - 오른쪽 끝에 전체 보기 (Resend 틀의 복사 단추 자리) */}
      <div className="flex items-center gap-3 border-b border-white/10 py-3 pl-3 pr-4 sm:pl-4">
        <div role="tablist" aria-label="최근 작업" onKeyDown={onKey}
          className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto [mask-image:linear-gradient(90deg,#000_85%,transparent)] sm:[mask-image:none]">
          {items.map((it, i) => {
            const on = i === active;
            return (
              <button key={it.id} ref={(el) => { tabs.current[i] = el; }}
                type="button" role="tab" id={`work-tab-${it.id}`}
                aria-selected={on} aria-controls="work-panel" tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                className={`flex shrink-0 items-center gap-2.5 rounded-[2px] border px-3 py-2 text-[14px] transition-colors ${
                  on
                    ? 'border-white/[0.14] bg-white/[0.07] text-white'
                    : 'border-transparent text-white/50 hover:text-white/85'
                }`}>
                <span className={`font-mono text-[11px] tabular-nums ${on ? 'text-[var(--point)]' : 'text-white/35'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {it.title}
              </button>
            );
          })}
        </div>
        <Link href="/projects" aria-label="전체 포트폴리오"
          className="group hidden h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-white/[0.14] text-white/60 transition-colors hover:border-white/30 hover:text-white sm:inline-flex">
          <FiArrowUpRight size={15} className={arrowHover} />
        </Link>
      </div>

      {/* 본문 - 고른 작업의 화면과 설명 */}
      <div id="work-panel" role="tabpanel" aria-labelledby={`work-tab-${p.id}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={p.id}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: easeEnter }}
            className="grid gap-8 p-4 sm:p-6 lg:grid-cols-12 lg:gap-12 lg:p-8">
            <Link href={`/projects/${p.id}`} className="group relative block aspect-[16/10] overflow-hidden bg-[var(--surface)] lg:col-span-7">
              {p.thumbnail ? (
                <SafeImage src={p.thumbnail} alt={p.title} fill
                  className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
              ) : (
                <ThumbFallback label={p.category} />
              )}
            </Link>

            <div className="flex flex-col lg:col-span-5 lg:justify-center lg:py-2">
              <p className="mono-label mb-6">{p.category}</p>
              <h3 className="mb-5 text-[26px] font-medium leading-[1.2] tracking-[-0.022em] text-[var(--text-1)] sm:text-[34px]">
                {p.title}
              </h3>
              <p className="type-b3 max-w-[30em] text-white/60">{p.description}</p>
              <Link href={`/projects/${p.id}`} className={`${linkMore} mt-8 self-start lg:mt-10`}>
                자세히 보기 <FiArrowUpRight size={13} className={arrowHover} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 아랫줄 - 몇 번째인지와 전체 포트폴리오 */}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.02em] text-white/45 sm:px-6">
        <span className="tabular-nums">{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        <Link href="/projects" className={`${linkMore} text-[11px]`}>
          공개 포트폴리오 {total}건 <FiArrowUpRight size={12} className={arrowHover} />
        </Link>
      </div>
    </motion.div>
  );
}
