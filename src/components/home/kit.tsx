'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight, FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, inView } from '@/lib/motion';
import { container } from '@/lib/styles';

/**
 * 화면을 짓는 조각들.
 *
 * 홈은 풀페이지다 - 화면 한 장이 창 하나를 채운다 (Screen · ScreenBody · Eyebrow).
 * 브랜드 가이드처럼 길게 읽는 페이지는 두 단 섹션으로 짓는다 (Section):
 * 보는 곳(제목과 요약)과 다루는 곳(카드와 목록)을 나누고, 600px 부터 좌우로 놓는다.
 * 두 단의 비율은 600~960px 에서 42:58, 그보다 넓으면 38:62 다.
 */

/**
 * 화면의 바탕.
 *  auto  - 테마를 따른다
 *  dark  - 테마와 상관없이 어둡다 (그림을 거는 자리)
 *  photo - 사진을 깐다. 글자는 흰색
 *  brand - 대표 색상 면. 글자는 흰색
 * 상단 바와 화면 표시 점이 이 값을 보고 자기 색을 고른다 (globals.css 의 data-head / data-mid).
 */
export type Tone = 'auto' | 'dark' | 'photo' | 'brand';

const TONE: Record<Tone, string> = {
  auto: '',
  dark: 'theme-dark bg-[var(--canvas)] text-[var(--text-1)]',
  photo: 'theme-dark bg-[#080808] text-[var(--text-1)]',
  brand: 'on-brand',
};

/** 풀페이지의 화면 한 장. 제목에는 `${id}-title` 을 id 로 단다. */
export function Screen({ id, tone = 'auto', children }: { id: string; tone?: Tone; children: ReactNode }) {
  return (
    <section id={id} data-tone={tone} aria-labelledby={`${id}-title`}
      className={`fp-screen relative flex flex-col overflow-hidden ${TONE[tone]}`}>
      {children}
    </section>
  );
}

/**
 * 화면의 내용이 놓이는 자리. 세로 가운데에 놓는다.
 * 위는 상단 바(64px)만큼, 좁은 화면의 아래는 탭(56px)만큼 비운다.
 *
 * 넓은 화면의 여백은 창 높이를 따라 줄어든다. 노트북은 주소창과 탭을 빼면 창 높이가
 * 600~660px 밖에 안 되는데, 그 높이에도 화면 한 장이 다 들어와야 한다.
 */
export function ScreenBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${container} relative flex flex-1 flex-col justify-center
                     pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-20
                     expanded:pb-[clamp(1.25rem,4.5svh,3rem)] expanded:pt-[clamp(4.75rem,10.5svh,6rem)] ${className}`}>
      {children}
    </div>
  );
}

/** 화면 이름 - 제목 위에 작게 붙는다 */
export function Eyebrow({ children, className = 'text-[var(--accent)]' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sub font-medium uppercase tracking-[0.14em] ${className}`}>{children}</p>;
}

/** 두 단의 폭 - 히어로와 섹션이 같은 비율을 쓴다 */
export const panes = 'grid medium:grid-cols-[42fr_58fr] wide:grid-cols-[38fr_62fr]';

/** 섹션 - 왼쪽은 제목과 요약, 오른쪽은 카드 */
export function Section({ id, title, summary, children }: {
  id: string;
  title: string;
  summary?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="py-10 medium:py-14 wide:py-16">
      <div className={`${container} ${panes} gap-x-4 gap-y-7`}>
        {/* 넓은 화면에서는 오른쪽 카드가 흐르는 동안 제목이 따라 붙어 있다 */}
        <motion.header {...inView} variants={fadeUp}
          className="medium:sticky medium:top-24 medium:self-start medium:pr-8 medium:pt-5">
          <h2 id={id} className="text-ext font-bold text-[var(--text-1)]">{title}</h2>
          {summary && <p className="mt-4 max-w-[26rem] text-body text-[var(--text-2)]">{summary}</p>}
        </motion.header>
        <div className="min-w-0 space-y-4">{children}</div>
      </div>
    </section>
  );
}

/**
 * 카드 - 바탕보다 한 단 밝은 면. 그림자를 쓰지 않고 면의 밝기로만 가른다.
 * 좁은 화면에서는 카드가 여백 쪽으로 12px 넓어진다. 안쪽 글은 그대로 24px 선에 맞는다.
 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div {...inView} variants={fadeUp}
      className={`-mx-3 overflow-hidden rounded-block bg-surface medium:mx-0 ${className}`}>
      {children}
    </motion.div>
  );
}

/** 카드 위에 붙는 묶음 이름 */
export function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="px-3 pt-3 text-sub font-medium text-[var(--text-3)] medium:px-6">{children}</p>;
}

const rowBox = 'flex items-center gap-4 px-6 py-5 medium:px-7';
/** 줄 사이의 선은 카드 끝까지 긋지 않고 글 선에 맞춰 안쪽에만 긋는다 */
const rowRule = 'relative before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--border)] first:before:hidden medium:before:inset-x-7';

/**
 * 목록의 한 줄.
 * 주 문장은 한 줄에 들어오는 짧은 말로 쓴다. href 가 있으면 줄 전체가 눌린다.
 */
export function Row({ main, sub, trail, href, external = false }: {
  main: ReactNode;
  sub?: ReactNode;
  /** 오른쪽 끝에 붙는 짧은 값 */
  trail?: ReactNode;
  href?: string;
  external?: boolean;
}) {
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <h3 className="text-lst font-medium text-[var(--text-1)]">{main}</h3>
        {sub && <p className="mt-1.5 text-body text-[var(--text-2)]">{sub}</p>}
      </div>
      {trail && <span className="shrink-0 text-sub text-[var(--text-3)]">{trail}</span>}
      {href && (external
        ? <FiArrowUpRight aria-hidden size={18} className="shrink-0 text-[var(--text-3)]" />
        : <FiChevronRight aria-hidden size={20} className="shrink-0 text-[var(--text-3)] transition-transform duration-150 ease-calm group-hover:translate-x-0.5" />)}
    </>
  );
  const press = 'group transition-colors duration-150 ease-calm hover:bg-fg/[0.04] active:bg-fg/[0.08]';

  if (!href) return <li className={`${rowRule} ${rowBox}`}>{body}</li>;
  return (
    <li className={rowRule}>
      {external
        ? <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`${rowBox} ${press}`}>{body}</a>
        : <Link href={href} className={`${rowBox} ${press}`}>{body}</Link>}
    </li>
  );
}

/** 짧은 상태 표시 - 색만으로 알리지 않고 글자로 적는다 */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-chip bg-[var(--accent-tint)] px-2.5 text-min font-medium text-[var(--accent-strong)]">
      {children}
    </span>
  );
}
