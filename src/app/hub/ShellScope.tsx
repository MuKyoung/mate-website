'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * 도구 라우트에 머무는 동안에만 html[data-shell="app"] 을 유지한다.
 *
 * layout.tsx 의 인라인 스크립트가 첫 페인트 전에 속성을 달아 다크 플래시를 막고,
 * 이 컴포넌트는 클라이언트 라우팅으로 마케팅 사이트로 빠져나갈 때 속성을 떼어
 * 홈페이지가 라이트 셸을 물려받지 않게 한다.
 *
 * Hub 다크 모드(2026-11-18)도 여기서 맡는다 - html[data-tm-theme="light" | "dark"].
 * 고른 값은 이 브라우저의 localStorage 'tm-theme' 에 두고, '시스템'이면 기기 설정을 따라 바로 바뀐다.
 * 첫 페인트 전 적용은 layout.tsx 의 스크립트(THEME_BOOT)가 같은 규칙으로 한다.
 */
export type TmTheme = 'light' | 'dark' | 'system';

const KEY = 'tm-theme';
const DARK_MQ = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();

function readPref(): TmTheme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(pref: TmTheme) {
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia(DARK_MQ).matches);
  document.documentElement.setAttribute('data-tm-theme', dark ? 'dark' : 'light');
}

export function setTmTheme(pref: TmTheme) {
  try {
    if (pref === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch { /* 저장이 막힌 브라우저 - 이번 화면에만 적용 */ }
  apply(pref);
  listeners.forEach((on) => on());
}

const subscribe = (on: () => void) => {
  listeners.add(on);
  return () => { listeners.delete(on); };
};

/** 고른 화면 모드 - 서버에서 그릴 때는 '시스템' */
export function useTmTheme(): TmTheme {
  return useSyncExternalStore(subscribe, readPref, () => 'system');
}

export default function ShellScope() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-shell', 'app');
    apply(readPref());
    // 기기 설정이 바뀌면('시스템'일 때만) · 다른 탭에서 고르면 따라간다
    const mq = window.matchMedia(DARK_MQ);
    const onSystem = () => { if (readPref() === 'system') apply('system'); };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY && e.key !== null) return;
      apply(readPref());
      listeners.forEach((on) => on());
    };
    mq.addEventListener('change', onSystem);
    window.addEventListener('storage', onStorage);
    return () => {
      mq.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
      root.removeAttribute('data-shell');
      root.removeAttribute('data-tm-theme');
    };
  }, []);
  return null;
}
