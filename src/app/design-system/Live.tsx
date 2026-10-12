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
const INK = [8, 8, 8];
const WHITE = [250, 250, 250];

/** CSS 변수 하나를 칩으로. 자기가 놓인 스코프(테마, 영역)의 값을 읽는다. */
export function Swatch({ token, name, note, tall = false }: {
  token: string;
  name: string;
  note?: string;
  tall?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<{ hex: string; onDark: boolean } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const c = channels(getComputedStyle(ref.current).backgroundColor);
    // 흰 글자와 검은 글자 중 대비가 더 큰 쪽을 얹는다
    const L = luminance(c) + 0.05;
    setV({ hex: toHex(c), onDark: (luminance(WHITE) + 0.05) / L >= L / (luminance(INK) + 0.05) });
  }, []);

  return (
    <div className="overflow-hidden rounded-thumb border border-[var(--border)]">
      <div ref={ref} className={`flex items-end p-4 ${tall ? 'h-[168px]' : 'h-[104px]'}`}
        style={{ background: `var(${token})`, color: v && !v.onDark ? toHex(INK) : toHex(WHITE) }}>
        {note && <span className="text-min font-medium">{note}</span>}
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-sub font-medium text-[var(--text-1)]">{name}</p>
        <p className="text-min text-[var(--text-3)]">{v ? v.hex : token}</p>
      </div>
    </div>
  );
}

/** 글자 크기 한 줄. 견본 글자에서 크기 · 굵기 · 행간을 읽는다. */
export function TypeRow({ name, cls, sample, use }: {
  name: string;
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
    // 첫 화면 문장은 화면 폭을 따라 변한다
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  return (
    <li className="grid grid-cols-1 items-baseline gap-x-4 gap-y-2 px-6 py-5 wide:grid-cols-12 medium:px-7">
      <p ref={ref} className={`min-w-0 truncate text-[var(--text-1)] wide:col-span-6 ${cls}`}>{sample}</p>
      <p className="text-sub text-[var(--text-2)] wide:col-span-3">{name} · {use}</p>
      <p className="text-min text-[var(--text-3)] wide:col-span-3 wide:text-right">{spec || ' '}</p>
    </li>
  );
}
