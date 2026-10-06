'use client';

import { useEffect } from 'react';

/**
 * 도구 라우트에 머무는 동안에만 html[data-shell="app"] 을 유지한다.
 *
 * layout.tsx 의 인라인 스크립트가 첫 페인트 전에 속성을 달아 다크 플래시를 막고,
 * 이 컴포넌트는 클라이언트 라우팅으로 마케팅 사이트로 빠져나갈 때 속성을 떼어
 * 홈페이지가 라이트 셸을 물려받지 않게 한다.
 */
export default function ShellScope() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-shell', 'app');
    return () => root.removeAttribute('data-shell');
  }, []);
  return null;
}
