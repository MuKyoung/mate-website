'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 가이드에 적는 색과 글자 크기는 화면에서 직접 읽어 온다.
 *
 * 예전에는 HEX 와 굵기를 이 페이지에 따로 적어 두었는데, 팔레트가 여러 번 바뀌는
 * 동안 아무도 고치지 않아 가이드가 실제와 다른 값을 설명하고 있었다. 토큰이
 * 바뀌면 이 페이지도 같이 바뀌도록 계산된 값을 보여 준다.
 */

const channels = (css: string) => (css.match(/\d+(\.\d+)?/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

/** WCAG 상대 휘도 */
const luminance = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const INK = [8, 8, 10];

/** CSS 변수 하나를 칩으로. 자기가 놓인 스코프(data-domain 등)의 값을 읽는다. */
export function Swatch({ token, name, note, tall = false }: {
  token: string;
  name: string;
  note?: string;
  tall?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<{ hex: string; rgb: string; onDark: boolean } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const c = channels(getComputedStyle(ref.current).backgroundColor);
    // 흰 글자와 검은 글자 중 대비가 더 큰 쪽을 얹는다. 밝기 어림으로 고르면
    // blue 200 처럼 중간 밝기인 색에서 3.9:1 짜리 흰 글자가 올라간다.
    const L = luminance(c) + 0.05;
    setV({ hex: toHex(c), rgb: c.join(' '), onDark: 1.05 / L >= L / (luminance(INK) + 0.05) });
  }, []);

  return (
    <div className="overflow-hidden rounded-card border border-[var(--border)]">
      <div ref={ref} className={`flex items-end p-4 ${tall ? 'h-[168px]' : 'h-[112px]'}`}
        style={{ background: `var(${token})`, color: v && !v.onDark ? toHex(INK) : '#FFFFFF' }}>
        {note && <span className="type-c2 font-bold">{note}</span>}
      </div>
      <div className="bg-[var(--surface)] px-4 py-3.5">
        <p className="type-b4 text-[var(--text-1)]">{name}</p>
        <p className="type-c2 mt-1 text-white/60">{v ? v.hex : token}</p>
        <p className="type-c2 text-white/55">{v ? `RGB ${v.rgb}` : ' '}</p>
      </div>
    </div>
  );
}

/** 타입 스케일 한 줄. 견본 글자에서 크기 · 굵기 · 행간을 읽는다. */
export function TypeRow({ token, cls, sample, use }: {
  token: string;
  cls: string;
  sample: string;
  use: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [spec, setSpec] = useState('');

  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      const s = getComputedStyle(ref.current);
      const size = parseFloat(s.fontSize);
      const lh = parseFloat(s.lineHeight);
      setSpec(`${Math.round(size)}px · ${s.fontWeight} · 행간 ${Number.isFinite(lh) ? (lh / size).toFixed(2) : s.lineHeight}`);
    };
    read();
    // 디스플레이 단계는 화면 폭을 따라 변한다
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  return (
    <div className="grid grid-cols-1 items-baseline gap-x-gutter gap-y-3 border-b border-[var(--border)] py-7 lg:grid-cols-12">
      <p className="type-c1 text-[var(--point)] lg:col-span-1">{token}</p>
      <p ref={ref} className={`text-[var(--text-1)] lg:col-span-6 ${cls}`}>{sample}</p>
      <p className="type-c1 text-white/60 lg:col-span-3">{use}</p>
      <p className="type-c2 text-white/55 lg:col-span-2 lg:text-right">{spec || ' '}</p>
    </div>
  );
}
