'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** 샘플 페이지 주소 (/landing-motion/LP-101.html) */
  src: string;
  title: string;
  /** 페이지가 보게 될 화면 크기 - PC 1440×900, 모바일 390×780 */
  w: number;
  h: number;
  /** false 면 구경만 한다(갤러리 카드의 미리보기) */
  interactive?: boolean;
  className?: string;
}

/**
 * 움직이는 샘플 페이지를 정해진 화면 크기로 띄우고, 칸 폭에 맞춰 통째로 줄여 보여 준다.
 * 안의 페이지는 w × h 화면이라고 여기므로 PC 짜임 · 모바일 짜임이 실제와 같게 나온다.
 * ?embed=1 을 붙이면 샘플 안내 띠가 숨는다(landing-library/motion/kit/kit.js).
 */
export default function MotionFrame({ src, title, w, h, interactive = true, className = '' }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  return (
    <div ref={box} className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      {scale > 0 && (
        <iframe src={`${src}?embed=1`} title={title} tabIndex={interactive ? 0 : -1}
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width: w, height: h, transform: `scale(${scale})`, pointerEvents: interactive ? undefined : 'none' }} />
      )}
    </div>
  );
}
