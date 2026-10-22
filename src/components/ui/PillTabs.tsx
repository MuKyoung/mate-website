'use client';

import { useId } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface PillTab {
  key: string;
  label: string;
  /** 있으면 링크, 없으면 버튼 (onSelect) */
  href?: string;
  count?: number;
}

interface PillTabsProps {
  tabs: PillTab[];
  active: string;
  onSelect?: (key: string) => void;
  className?: string;
}

/**
 * 알약 탭 - 회색 홈 안에서 고른 칸만 로고 파랑으로 찬다 (Figma 하위 페이지 머리 · 시공사례 필터).
 * 좁은 화면에서는 가로로 밀린다.
 */
export default function PillTabs({ tabs, active, onSelect, className = '' }: PillTabsProps) {
  const id = useId();
  return (
    <div className={`flex max-w-full justify-center ${className}`}>
      <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-pill border border-gray-200 bg-gray-100 p-1">
        {tabs.map((t) => {
          const on = t.key === active;
          const cls = `relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-pill px-5 text-[14px] transition-colors duration-200 sm:h-11 sm:px-6 sm:text-[15px] ${
            on ? 'font-bold text-white' : 'text-gray-500 hover:text-ink'
          }`;
          const inner = (
            <>
              {on && (
                <motion.span layoutId={`pill-${id}`} aria-hidden
                  className="absolute inset-0 rounded-pill bg-point-200"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
              )}
              <span className="relative">{t.label}</span>
              {t.count !== undefined && (
                <span className={`relative text-[12px] tabular-nums ${on ? 'text-white/75' : 'text-gray-400'}`}>{t.count}</span>
              )}
            </>
          );
          // 같은 페이지 안의 칸으로 가는 탭은 일반 링크로 둔다 - 관성 스크롤(SmoothScroll)이 받아서 옮긴다
          if (t.href?.startsWith('#')) {
            return <a key={t.key} href={t.href} aria-current={on ? 'location' : undefined} className={cls}>{inner}</a>;
          }
          return t.href ? (
            <Link key={t.key} href={t.href} aria-current={on ? 'page' : undefined} className={cls}>{inner}</Link>
          ) : (
            <button key={t.key} type="button" aria-pressed={on} onClick={() => onSelect?.(t.key)} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
