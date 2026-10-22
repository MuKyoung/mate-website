'use client';

import { useEffect, useState } from 'react';

interface Dot {
  id: string;
  label: string;
}

/**
 * 왼쪽 가운데 세로 점 - 지금 보고 있는 칸을 로고 파랑으로 찍는다 (Figma 홈 왼쪽 점 일곱 개).
 * 점을 누르면 그 칸으로 간다. 어두운 칸 위에서는 흰 점이 되고, 푸터에 닿으면 사라진다.
 * 본문 왼쪽 여백이 넉넉한 넓은 화면(1680px 이상)에서만 띄운다 - 좁으면 제목 글자와 겹친다.
 */
export default function SectionDots({ items }: { items: Dot[] }) {
  const [active, setActive] = useState(0);
  const [dark, setDark] = useState(true);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2;
      let idx = 0;
      items.forEach((it, i) => {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      });
      setActive(idx);

      let d = false;
      document.querySelectorAll<HTMLElement>('[data-header]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) d = el.dataset.header === 'dark';
      });
      setDark(d);

      const footer = document.querySelector('footer');
      setGone(Boolean(footer && footer.getBoundingClientRect().top < mid));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  return (
    <nav aria-label="칸 이동"
      className={`fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col transition-opacity duration-300 min-[1680px]:flex min-[1680px]:left-8 ${gone ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
      {items.map((it, i) => {
        const on = i === active;
        return (
          <a key={it.id} href={`#${it.id}`} aria-label={it.label} aria-current={on ? 'true' : undefined}
            className="group relative flex h-[18px] w-[18px] items-center justify-center">
            <span className={`h-1.5 w-1.5 rounded-pill transition-colors duration-300 ${
              on ? (dark ? 'bg-point-light' : 'bg-point-200') : (dark ? 'bg-white/50' : 'bg-gray-200')
            }`} />
            <span className={`pointer-events-none absolute left-6 whitespace-nowrap text-[12px] font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
              dark ? 'text-white/80' : 'text-gray-500'
            }`}>
              {it.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
