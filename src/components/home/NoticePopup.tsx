'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { notice } from '@/data/notice';

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

/* 카드 크기 - 폭 400px(좁은 화면은 88vw), 높이는 A4 비율(1:1.4143)이되 화면을 넘지 않는다. 넘치는 본문은 안에서 스크롤 */
const CARD_W = 'min(400px, 88vw)';
const cardSize = {
  width: CARD_W,
  minHeight: `min(calc(1.4143 * ${CARD_W}), calc(100svh - 40px))`,
  maxHeight: 'calc(100svh - 40px)',
};

/* 카드 바탕 - 남색에서 오른쪽 아래로 갈수록 로고 파랑이 조금 스민다 */
const cardBg = 'linear-gradient(155deg, var(--night-2) 42%, #15257a 100%)';

/* 바탕 무늬의 호 - 오른쪽 아래 모서리를 중심으로 퍼지는 사분원. 바깥으로 갈수록 옅다 */
const ARC_BOX = 340;
const arcs = [
  { r: 72, o: 0.6 },
  { r: 132, o: 0.45 },
  { r: 192, o: 0.32 },
  { r: 252, o: 0.22 },
  { r: 312, o: 0.14 },
];

/**
 * 카드 바탕 무늬 - 옅은 모눈(오른쪽 아래만 보이고 위 · 왼쪽으로 사라진다) + 가는 호 다섯 겹 + 호 위의 점 하나.
 * 첫 화면의 수평선 빛을 되풀이하지 않고 같은 '휘는 선'을 선으로만 그린다. 흐리게 번지는 층은 얹지 않는다.
 * 열릴 때 호가 안쪽부터 차례로 그려진다.
 */
function NoticeArt() {
  const c = ARC_BOX;
  const dot = { r: 192, a: Math.PI / 3 }; // 가운데 호 - PC · 휴대폰 모두 연락처 줄 오른쪽 빈자리에 온다
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[52px] top-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: 'right -1px bottom -1px',
          WebkitMaskImage: 'radial-gradient(115% 85% at 100% 100%, #000 0%, transparent 72%)',
          maskImage: 'radial-gradient(115% 85% at 100% 100%, #000 0%, transparent 72%)',
        }}
      />
      {/* 카드 폭의 85%(PC 에서 340px) - 좁은 화면에서도 같은 비율로 아래쪽에 머문다 */}
      <svg viewBox={`0 0 ${c} ${c}`} className="absolute bottom-0 right-0 h-auto w-[85%]" fill="none">
        {arcs.map((a, i) => (
          <motion.path
            key={a.r}
            d={`M ${c - a.r} ${c} A ${a.r} ${a.r} 0 0 1 ${c} ${c - a.r}`}
            stroke="var(--point-on-dark)"
            strokeOpacity={a.o}
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.25 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        <motion.circle
          cx={c - dot.r * Math.cos(dot.a)}
          cy={c - dot.r * Math.sin(dot.a)}
          r={3.5}
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.1 }}
        />
      </svg>
    </div>
  );
}

/**
 * 홈 첫 화면의 안내 팝업. 내용 · 등록일은 src/data/notice.ts.
 * 모양은 세종호이스트크레인 사이트의 공지 팝업을 따랐다 - 짙은 남색 막, 각진 세로 카드,
 * 작은 영문 NOTICE · 흰 제목 · 흐린 흰 본문 · 밑줄 연락처, 아래 '오늘 하루 열지 않기 | 닫기' 줄.
 *
 * 등록일과 '오늘 하루 열지 않기'는 방문자 브라우저에서 계산하므로 빌드 때 날짜가 굳지 않는다.
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

  const link = 'font-bold text-white underline underline-offset-2 transition-colors hover:text-point-light';

  return createPortal(
    <AnimatePresence>
      {posted !== null && (
        <motion.div
          key="notice"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close(false);
          }}
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[rgba(7,11,29,0.55)] p-5"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...cardSize, backgroundImage: cardBg }}
            className="relative flex shrink-0 flex-col overflow-hidden bg-night-2 shadow-[0_34px_90px_rgba(7,11,29,0.5)]"
          >
            <NoticeArt />
            <div className="relative flex-1 overflow-y-auto overscroll-contain px-7 pb-6 pt-8">
              <p className="text-[12px] font-semibold uppercase text-white/55">Notice</p>
              <h2 id="notice-title" className="mt-2.5 break-keep text-[21px] font-bold leading-[1.4] text-white">
                {notice.title}
              </h2>
              <p className="mt-2 text-[13px] text-white/55">
                등록일 <time dateTime={ymd(posted, '-')}>{ymd(posted, '.')}</time>
              </p>
              <div className="mt-4 break-keep text-[14.5px] leading-[1.85] text-white/80">
                {notice.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <div className="mt-[1.85em]">
                  {notice.contacts.map((c) => (
                    <p key={c.label}>
                      {c.label} :{' '}
                      {c.href.startsWith('/') ? (
                        <Link href={c.href} onClick={() => close(false)} className={link}>
                          {c.value}
                        </Link>
                      ) : (
                        <a href={c.href} className={link}>
                          {c.value}
                        </a>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            {/* 아래 줄은 카드와 색을 뒤집는다 - 흰 바탕에 남색 글자 */}
            <div className="relative flex shrink-0 items-stretch bg-white">
              <button
                type="button"
                onClick={() => close(true)}
                className="h-[52px] flex-1 px-5 text-left text-[13px] font-medium text-ink-2 transition-colors duration-200 hover:bg-gray-50 hover:text-ink"
              >
                오늘 하루 열지 않기
              </button>
              <span aria-hidden className="w-px bg-gray-200" />
              <button
                ref={closeRef}
                type="button"
                onClick={() => close(false)}
                className="h-[52px] px-6 text-[14px] font-bold text-ink transition-colors duration-200 hover:bg-gray-50 hover:text-point-200"
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
