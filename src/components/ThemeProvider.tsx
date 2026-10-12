'use client';

import { ThemeProvider as NextThemes } from 'next-themes';

/**
 * 테마 - 기기 설정을 따르고, 상단 바의 버튼으로 바꿀 수 있다.
 *
 * html 에 data-theme="light" | "dark" 를 단다. 첫 페인트 전에 달기 때문에
 * 어두운 화면이 밝게 번쩍이지 않는다. 색 토큰은 globals.css 가 이 속성을 보고 고른다.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
