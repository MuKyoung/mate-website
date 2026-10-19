'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * 기기에서 '동작 줄이기'를 켠 방문자에게는 위치 · 크기 움직임을 끄고 투명도 변화만 남긴다.
 * CSS 애니메이션은 globals.css 의 prefers-reduced-motion 규칙이 따로 끈다.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
