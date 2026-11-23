'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { notice } from '@/data/notice';
import { btnPoint } from '@/lib/styles';

const DAY = 86_400_000;
/** 한국 시간은 UTC+9, 서머타임이 없다 */
const KST = 9 * 3_600_000;
const HIDE_KEY = `mate-notice-hide:${notice.id}`;

/** 한국 시간 기준 오늘(그날 0시를 UTC 0시로 놓은 값) */
function kstToday(now: number): number {
  return Math.floor((now + KST) / DAY) * DAY;
}

function ymd(ms: number, sep: string): string {
  const d = new Date(ms);
  return [d.getUTCFullYear(), String(d.getUTCMonth() + 1).padStart(2, '0'), String(d.getUTCDate()).padStart(2, '0')].join(sep);
}

/** 등록일 - postedOn 에서 시작해 refreshDays 마다 그날로 넘어간다 */
function postedDate(now: number): number {
  const start = Date.parse(`${notice.postedOn}T00:00:00Z`);
  const today = kstToday(now);
  if (today <= start) return start;
  const step = notice.refreshDays * DAY;
  return start + Math.floor((today - start) / step) * step;
}

/**
 * 홈 첫 화면의 안내 팝업. 내용 · 등록일은 src/data/notice.ts.
 *
 * 등록일과 '오늘 하루 보지 않기'는 방문자 브라우저에서 계산하므로 빌드 때 날짜가 굳지 않는다.
 * 그래서 처음 그릴 때(서버)는 비워 두고, 화면에 붙은 뒤 띄운다.
 * 페이지 감싸개(template.tsx 의 .route-enter 애니메이션)가 겹침 층을 따로 만들어 상단 바 · 문의 단추 밑에
 * 깔리므로 body 에 바로 그린다.
 */
export default function NoticePopup() {
  const [mounted, setMounted] = useState(false);
  const [posted, setPosted] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!notice.active) return;
    const now = Date.now();
    try {
      if (localStorage.getItem(HIDE_KEY) === ymd(kstToday(now), '-')) return;
    } catch {
      /* 저장소를 못 쓰는 브라우저(사생활 보호 창 등)는 그냥 띄운다 */
    }
    setPosted(postedDate(now));
  }, []);

  const close = useCallback((forToday: boolean) => {
    if (forToday) {
      try {
        localStorage.setItem(HIDE_KEY, ymd(kstToday(Date.now()), '-'));
      } catch {
        /* 못 적으면 다음 방문 때 다시 뜰 뿐이다 */
      }
    }
    setPosted(null);
  }, []);

  const open = posted !== null;

  /* 떠 있는 동안 뒤 화면 스크롤을 멈추고, Esc 로 닫는다 */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {posted !== null && (
        <motion.div
          key="notice"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close(false);
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px] overflow-hidden rounded-card bg-white shadow-[0_28px_72px_rgba(0,0,0,0.35)]"
          >
            <div className="px-6 pb-7 pt-8 sm:px-9 sm:pt-10">
              <p className="text-[14px] font-bold text-point-200">Notice</p>
              <h2 id="notice-title" className="mt-2 text-[24px] font-bold leading-tight text-ink sm:text-[28px]">
                {notice.title}
              </h2>
              <p className="mt-3 text-[13px] text-ink-3">
                등록일 <time dateTime={ymd(posted, '-')}>{ymd(posted, '.')}</time>
              </p>
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-6 text-[15px] leading-[1.7] text-ink-2">
                {notice.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <Link href={notice.link.href} onClick={() => close(false)} className={`${btnPoint} mt-7 w-full`}>
                {notice.link.label}
                <FiArrowUpRight size={17} />
              </Link>
            </div>
            <div className="flex border-t border-gray-200 text-[14px]">
              <button
                type="button"
                onClick={() => close(true)}
                className="flex-1 py-4 text-ink-3 transition-colors hover:bg-gray-50 hover:text-ink"
              >
                오늘 하루 보지 않기
              </button>
              <span aria-hidden className="w-px bg-gray-200" />
              <button
                ref={closeRef}
                type="button"
                onClick={() => close(false)}
                className="flex-1 py-4 font-bold text-ink transition-colors hover:bg-gray-50 hover:text-point-200"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
