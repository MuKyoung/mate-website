'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isToolScreen } from '@/lib/shell';

/** 오른쪽 단추 · 길게 누르기 · 끌기 · 복사를 막는 대상 */
const GUARDED = 'img, picture, video, canvas';

function guarded(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(GUARDED) !== null;
}

/**
 * 공개 사이트에서 이미지를 저장 · 복사 · 공유하지 못하게 한다. 허브 · 핀볼(사내 도구)은 그대로 둔다.
 *
 * - 오른쪽 단추 메뉴(PC), 길게 누르기 메뉴(안드로이드)를 막는다
 * - 아이폰의 길게 누르기 미리보기 · 공유 시트는 CSS(-webkit-touch-callout)로 막는다 - globals.css 의 .img-guard
 * - 이미지를 끌어 바탕화면 · 다른 창으로 옮기지 못하게 한다
 * - 글을 고르며 복사할 때 이미지가 섞이면 글자만 클립보드에 넣는다
 *
 * 화면 캡처 · 개발자 도구까지 막을 수는 없다.
 */
export default function ImageGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (isToolScreen(pathname)) return;
    const root = document.documentElement;
    root.classList.add('img-guard');

    const block = (e: Event) => {
      if (guarded(e.target)) e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !e.clipboardData) return;
      const box = document.createElement('div');
      for (let i = 0; i < sel.rangeCount; i += 1) box.appendChild(sel.getRangeAt(i).cloneContents());
      if (!box.querySelector(GUARDED)) return;
      e.preventDefault();
      e.clipboardData.setData('text/plain', sel.toString());
    };

    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('copy', onCopy);
    return () => {
      root.classList.remove('img-guard');
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
      document.removeEventListener('copy', onCopy);
    };
  }, [pathname]);

  return null;
}
