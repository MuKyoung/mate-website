'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun } from 'react-icons/fi';

/**
 * 밝은 화면 / 어두운 화면 전환.
 *
 * 처음에는 기기 설정을 따른다. 한 번 누르면 그 뒤로는 고른 쪽을 기억한다.
 * 서버가 만든 HTML 은 방문자의 테마를 모르므로, 마운트 전에는 자리만 잡아 둔다.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === 'dark';
  const label = dark ? '밝은 화면으로 바꾸기' : '어두운 화면으로 바꾸기';

  return (
    <button type="button" onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label} title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-2)]
                  transition-colors duration-150 ease-calm hover:bg-fg/10 hover:text-[var(--text-1)] ${className}`}>
      {mounted && (dark ? <FiSun size={18} /> : <FiMoon size={18} />)}
    </button>
  );
}
