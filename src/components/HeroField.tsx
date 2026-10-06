'use client';

import { useEffect, useRef } from 'react';

/**
 * 히어로 배경 — 천천히 일렁이는 와이어프레임 지형.
 *
 * 스톡 영상 대신 캔버스로 직접 그린다. 용량이 0이고, 수천 개 사이트가
 * 공유하는 '구매한 템플릿' 인상이 생기지 않으며, 게임 엔진 뷰포트를
 * 닮은 그림이라 XR을 만드는 팀이라는 사실과도 어긋나지 않는다.
 *
 * 비용을 낮추기 위해:
 *  - 화면 밖이거나 탭이 숨으면 멈춘다
 *  - 해상도 배율을 2배로 묶는다
 *  - prefers-reduced-motion 이면 정지 화면 한 장만 그린다
 */
export default function HeroField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const COLS = 46;
    const ROWS = 26;
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let running = true;

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#4f7fe8';

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** 격자 한 점을 원근 투영한다. 뒤로 갈수록 좁아지고 위로 붙는다. */
    const project = (cx: number, cy: number) => {
      const u = cx / (COLS - 1);          // 0..1 가로
      const v = cy / (ROWS - 1);          // 0..1 깊이 (1이 가까움)
      const depth = 0.18 + v * 0.82;      // 소실점 쪽을 좁힌다
      const wave =
        Math.sin(u * 7 + t * 0.6) * Math.cos(v * 4 - t * 0.4) +
        Math.sin((u + v) * 5 - t * 0.3) * 0.5;
      const lift = wave * 14 * depth;
      return {
        x: w / 2 + (u - 0.5) * w * 1.25 * depth,
        y: h * 0.46 + v * h * 0.76 - lift,
        depth,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const color = accent();

      for (let r = 0; r < ROWS; r++) {
        // 가까울수록 또렷하게 — 먼 쪽은 거의 보이지 않는다
        const near = r / (ROWS - 1);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.05 + near * 0.42;
        ctx.lineWidth = 0.7 + near * 0.8;

        ctx.beginPath();
        for (let c = 0; c < COLS; c++) {
          const p = project(c, r);
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // 세로선은 띄엄띄엄 — 전부 그으면 격자가 너무 빽빽해진다
      for (let c = 0; c < COLS; c += 3) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (let r = 0; r < ROWS; r++) {
          const p = project(c, r);
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!running) return;
      t += 0.006;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw();
    } else {
      loop();
    }

    const onResize = () => { resize(); draw(); };
    window.addEventListener('resize', onResize);

    // 보이지 않을 때는 돌리지 않는다
    const io = new IntersectionObserver(([e]) => {
      const visible = e.isIntersecting && !document.hidden;
      if (visible && !running && !reduced) { running = true; loop(); }
      if (!visible) { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduced) { running = true; loop(); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
