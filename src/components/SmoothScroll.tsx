'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * 관성 스무스 스크롤.
 * prefers-reduced-motion 사용자와 터치 기기에서는 네이티브 스크롤을 그대로 둔다.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    // 관성 스크롤은 읽는 화면용이다. 작업 도구에서는 스크롤이 정확해야 한다.
    if (reduced || coarse || pathname.startsWith('/taskmanager')) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // 해시 앵커 링크를 Lenis로 처리
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
    // 라우트가 바뀌면 다시 평가한다 - 작업 도구로 들어갈 때 Lenis 를 걷어내야 한다
  }, [pathname]);

  // 라우트 변경 시 즉시 최상단으로 (관성이 남아 스크롤 위치가 어긋나는 것 방지).
  // 메뉴의 '/team#awards' 처럼 칸을 가리키고 들어왔으면 그 칸으로 보낸다
  useEffect(() => {
    const hash = window.location.hash;
    const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      // 헤더 높이만큼 덜 내려간다 - 칸에 scroll-margin 을 두면 Lenis 앵커 이동에서 두 번 빠진다
      requestAnimationFrame(() =>
        window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 80));
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
