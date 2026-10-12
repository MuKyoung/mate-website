'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * 풀페이지의 길잡이.
 *
 * 하는 일은 셋이다.
 *  1. 지금 어느 화면이 창의 머리, 가운데, 바닥에 놓여 있는지를 html 에 적어 둔다
 *     (data-head, data-mid, data-foot). 상단 바와 화면 표시 점, 아래 탭은 그 값을 보고
 *     색을 고른다. 화면마다 바탕이 다르기 때문이다 (사진, 파란 면, 밝은 면, 어두운 면).
 *  2. 오른쪽 가장자리에 화면 표시 점을 그린다. 누르면 그 화면으로 간다.
 *  3. 마우스 휠을 한 번에 한 장씩으로 바꾼다.
 *
 * 화면 머리에 달라붙는 일은 브라우저의 스크롤 스냅이 한다 (globals.css). 키보드와
 * 터치, 화면 표시 점은 그것만으로 한 장씩 넘어간다. 휠만 예외다. 휠 한 칸(100px)은
 * 화면 절반에 못 미쳐 스냅이 제자리로 되돌리므로, 휠만 받아서 직접 넘긴다.
 */

export interface ScreenInfo {
  id: string;
  /** 화면 표시 점에 붙는 이름 */
  label: string;
}

/** 서버에서는 레이아웃 이펙트를 쓸 수 없다 */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** 상단 바의 글자가 놓이는 높이 */
const HEAD_LINE = 32;
/** 아래 탭의 글자가 놓이는 높이 (창 바닥에서부터) */
const FOOT_LINE = 28;

/** 한 장씩 넘기는 창의 크기 - globals.css 의 스냅 규칙과 같아야 한다 */
const PAGED = '(min-height: 480px)';
/** 넘기는 동안 다음 휠을 받지 않는 시간(ms). 휠을 연달아 굴려도 한 장만 넘어간다. */
const LOCK = 700;
/** 이만큼 쉬었다 들어온 휠은 새 동작으로 본다(ms) */
const GAP = 140;

export default function FullPage({ screens }: { screens: ScreenInfo[] }) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useBeforePaint(() => {
    const root = document.documentElement;
    const els = screens
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    // 바닥글은 화면이 아니지만 그 위에 떠 있는 것들의 색은 정해 줘야 한다 (늘 테마를 따른다)
    const footer = document.querySelector('footer');

    let frame = 0;
    const read = () => {
      frame = 0;
      const midLine = window.innerHeight / 2;
      const footLine = window.innerHeight - FOOT_LINE;
      let head = 0;
      let mid = 0;
      let foot = 0;
      els.forEach((el, i) => {
        const top = el.getBoundingClientRect().top;
        if (top <= HEAD_LINE) head = i;
        if (top <= midLine) mid = i;
        if (top <= footLine) foot = i;
      });
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      const tone = (i: number, line: number) => (footerTop <= line ? 'auto' : els[i]?.dataset.tone ?? 'auto');
      root.dataset.head = tone(head, HEAD_LINE);
      root.dataset.mid = tone(mid, midLine);
      root.dataset.foot = tone(foot, footLine);
      // 화면이 창 머리에 딱 맞게 서 있는가. 어긋나 있으면 화면의 내용이 상단 바 밑을 지나가는 중이다.
      root.toggleAttribute('data-flush', Math.abs(els[head]?.getBoundingClientRect().top ?? 0) < 2);
      setActive(mid);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    /* ── 휠 ──────────────────────────────────────────── */
    const paged = window.matchMedia(PAGED);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lockUntil = 0;
    let lastWheel = 0;
    let armed = true;   // 트랙패드의 관성(손을 뗀 뒤에도 이어지는 잔떨림)에 또 넘어가지 않게 하는 걸쇠
    let travel = 0;

    const onWheel = (e: WheelEvent) => {
      // 확대(ctrl), 가로 스크롤(shift, 트랙패드 가로 쓸기 - 작업 줄을 넘길 때)은 건드리지 않는다
      if (!paged.matches || e.ctrlKey || e.shiftKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      if (dy === 0) return;

      const y = window.scrollY;
      const vh = window.innerHeight;
      const tops = els.map((el) => Math.round(el.getBoundingClientRect().top + y));

      // 창보다 긴 화면 안에서는 끝에 닿을 때까지 평소대로 스크롤되게 둔다
      let at = 0;
      tops.forEach((t, i) => { if (t <= y + 1) at = i; });
      const height = els[at]?.offsetHeight ?? vh;
      if (height > vh + 1) {
        if (dy > 0 && tops[at] + height > y + vh + 1) return;
        if (dy < 0 && tops[at] < y - 1) return;
      }

      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > GAP) { armed = true; travel = 0; }
      lastWheel = now;
      if (now < lockUntil) return;
      if (!armed && Math.abs(dy) < 50) return;
      travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      if (Math.abs(travel) < 30) return;

      // 설 수 있는 자리: 화면마다 머리, 그리고 문서의 끝(바닥글)
      const end = document.documentElement.scrollHeight - vh;
      const stops = end - tops[tops.length - 1] > 8 ? [...tops, end] : tops;
      const target = travel > 0
        ? stops.find((t) => t > y + 2)
        : [...stops].reverse().find((t) => t < y - 2);
      armed = false;
      travel = 0;
      if (target === undefined) return;
      lockUntil = now + LOCK;
      window.scrollTo({ top: target, behavior: calm.matches ? 'auto' : 'smooth' });
    };

    root.setAttribute('data-fullpage', '');
    read();
    setMounted(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // preventDefault 를 쓰려면 passive 가 아니어야 한다
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(frame);
      // 홈을 떠나면 다른 페이지가 스냅과 색을 물려받지 않게 지운다
      root.removeAttribute('data-fullpage');
      root.removeAttribute('data-flush');
      delete root.dataset.head;
      delete root.dataset.mid;
      delete root.dataset.foot;
    };
  }, [screens]);

  if (!mounted) return null;

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 페이지 본문은 진입 애니메이션 때문에 transform 이 걸린 상자 안에 있다. 그 안에서는
  // position: fixed 가 창이 아니라 그 상자를 기준으로 잡히므로 body 에 직접 붙인다.
  return createPortal(
    <nav aria-label="화면 이동" className="fp-dots fixed right-[10px] top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ol className="flex flex-col gap-2">
        {screens.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.id}>
              <button type="button" onClick={() => go(s.id)}
                aria-label={`${s.label} 화면으로 가기`} aria-current={on ? 'true' : undefined}
                className="group relative flex h-6 w-6 items-center justify-end">
                {/* 이름표 - 올리거나 초점이 가면 나온다. 글자색 면에 바탕색 글자로 뒤집어
                    어느 화면 위에서도 또렷하게 보인다. */}
                <span className="pointer-events-none absolute right-7 whitespace-nowrap rounded-chip bg-[var(--text-1)] px-2.5 py-1
                                 text-min font-medium text-[var(--canvas)] opacity-0 transition-opacity duration-150
                                 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {s.label}
                </span>
                {/* 지금 있는 화면은 색이 아니라 길이로 알린다 */}
                <span aria-hidden
                  className={`block w-[3px] rounded-full bg-[var(--text-1)] transition-all duration-300 ease-calm ${
                    on ? 'h-6 opacity-100' : 'h-2.5 opacity-40 group-hover:opacity-80'
                  }`} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>,
    document.body,
  );
}
