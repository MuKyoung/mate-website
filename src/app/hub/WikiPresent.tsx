'use client';

/**
 * 팀 위키 프레젠테이션 - Prezi 처럼 원 안에 원을 두고 확대해 들어가며 본다.
 *
 * 가운데 원 = 카테고리(또는 전체), 그 안의 원 = 아래 문서, 또 그 안의 원 = 그 아래 문서.
 * 넘김 순서는 깊이 우선(가운데 → 첫 가지 → 그 아래 → 둘째 가지 …)이고, 원을 누르면 그 문서로 들어간다.
 * - 화면 이동은 van Wijk & Nuij(2003)의 부드러운 확대 경로를 따른다(d3-interpolate 의 interpolateZoom 과 같은 식).
 *   멀리 떨어진 원으로 갈 때 Prezi 처럼 잠깐 빠져나왔다가 다시 들어간다.
 * - impress.js 처럼 큰 판(world) 하나에 CSS transform 하나로 카메라를 움직인다 - 따로 라이브러리를 쓰지 않는다.
 * - 휠로 확대 · 끌어서 이동 · 두 손가락 확대, 빈 곳을 누르면 한 단계 밖으로.
 *   문서는 아래 넘기기 막대의 '문서 열기'로 연다(원을 두 번 눌러도 열린다).
 * - 카테고리마다 마지막으로 보던 문서를 WikiMap 이 기억해 두고(startId · onStep), 다시 오면 그 원에서 시작한다.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { STATUS_DOT, pathTo, type CanvasApi, type GDoc, type WikiGraph } from './wikiGraph';
import { usePainter } from './colorStore';
import { PAINT } from './ui';

/** 판(world) 위의 원 */
interface Circle { x: number; y: number; r: number }
/** 카메라 - 판 위의 가운데 점과, 화면 가로에 들어가는 판의 폭 */
interface View { cx: number; cy: number; w: number }

/**
 * 가운데 원의 반지름. 크게 잡아 둔다 - 깊이 내려간 원의 글자가 너무 작은 픽셀 값이 되면
 * 브라우저가 최소 글자 크기로 올려 원 밖으로 넘친다
 */
const R0 = 10000;

/** 원 안에 아래 원들을 고리로 놓는다 - 제목 자리(위쪽)를 비우려고 고리를 조금 아래로 내린다 */
function layout(g: WikiGraph): Map<string, Circle> {
  const pos = new Map<string, Circle>();
  const place = (id: string, x: number, y: number, r: number) => {
    pos.set(id, { x, y, r });
    const kids = (g.byId.get(id)?.children ?? []).filter((c) => g.byId.has(c));
    const k = kids.length;
    if (k === 0) return;
    if (k === 1) { place(kids[0], x, y + r * 0.2, r * 0.42); return; }
    const few = k <= 3;
    const cy = y + r * 0.16;
    const ring = r * (few ? 0.42 : 0.5);
    const rc = Math.min(r * (few ? 0.3 : 0.26), Math.sin(Math.PI / k) * ring * 0.9);
    kids.forEach((c, i) => {
      const a = -Math.PI / 2 + (i / k) * Math.PI * 2;
      place(c, x + Math.cos(a) * ring, cy + Math.sin(a) * ring, rc);
    });
  };
  place(g.rootId, 0, 0, R0);
  return pos;
}

/* ── 부드러운 확대 경로(van Wijk & Nuij) ── */
const RHO = Math.SQRT2;
function zoomPath(a: View, b: View): { S: number; at(t: number): View } {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const d2 = dx * dx + dy * dy;
  if (d2 < 1e-9) {
    const S = Math.log(b.w / a.w) / RHO;
    return { S, at: (t) => ({ cx: a.cx + t * dx, cy: a.cy + t * dy, w: a.w * Math.exp(RHO * t * S) }) };
  }
  const d1 = Math.sqrt(d2);
  const b0 = (b.w * b.w - a.w * a.w + RHO ** 4 * d2) / (2 * a.w * RHO ** 2 * d1);
  const b1 = (b.w * b.w - a.w * a.w - RHO ** 4 * d2) / (2 * b.w * RHO ** 2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / RHO;
  return {
    S,
    at: (t) => {
      const s = t * S;
      const c0 = Math.cosh(r0);
      const u = (a.w / (RHO ** 2 * d1)) * (c0 * Math.tanh(RHO * s + r0) - Math.sinh(r0));
      return { cx: a.cx + u * dx, cy: a.cy + u * dy, w: (a.w * c0) / Math.cosh(RHO * s + r0) };
    },
  };
}
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const hudBtn =
  'inline-flex h-9 min-w-[36px] items-center justify-center gap-1.5 whitespace-nowrap rounded-tm-sm border border-white/25 px-3 text-[13.5px] font-bold text-white ' +
  'transition-colors duration-150 hover:bg-white/10 disabled:cursor-default disabled:opacity-35 ' +
  'max-[720px]:h-11 max-[720px]:min-w-[44px] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-[44px]';

/** 맞춘 원과 무대 가장자리(아래 넘기기 막대) 사이의 최소 틈(px) */
const GAP = 12;

export default function WikiPresent({ graph, label, showTasks, startId, onStep, onOpenDoc, onOpenTask, api }: {
  graph: WikiGraph;
  /** 보는 것의 이름(카테고리 또는 '팀 위키 전체') - 화면 읽기 프로그램용 */
  label: string;
  /** 끄면 원 안의 작업 단추 목록을 숨긴다(작업 수 · 맡은 작업 요약은 남는다) */
  showTasks: boolean;
  /** 처음 볼 문서 - 이 카테고리에서 마지막으로 보던 문서 id. 없거나 지워졌으면 개요 */
  startId: string | null;
  /** 넘겨서 보는 문서가 바뀌었다(개요로 가면 가운데 id) - 손으로 옮긴 것만 알린다 */
  onStep(id: string): void;
  onOpenDoc(id: string): void;
  onOpenTask(key: string): void;
  api: MutableRefObject<CanvasApi | null>;
}) {
  const paint = usePainter();
  const pos = useMemo(() => layout(graph), [graph]);
  const order = graph.docs;
  const [step, setStep] = useState(0);
  const cur: GDoc = order[Math.min(step, order.length - 1)] ?? order[0];

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View | null>(null);
  const animRef = useRef(0);
  /** 지금 맞춘 문서 - go 가 바로 적는다(창 크기 감시가 첫 그리기 전에 돌아도 같은 원에 맞추게) */
  const shownId = useRef<string | null>(null);
  /** 방금 끌어서 옮겼다 - 이어서 오는 click 을 무시한다 */
  const dragged = useRef(false);
  const [full, setFull] = useState(false);
  const canFull = typeof document !== 'undefined' && !!document.fullscreenEnabled;

  const size = () => {
    const el = stageRef.current;
    return { W: el?.clientWidth || 1, H: el?.clientHeight || 1 };
  };
  const apply = useCallback((v: View) => {
    const world = worldRef.current;
    if (!world) return;
    const { W, H } = size();
    const s = W / v.w;
    world.style.transform = `translate(${W / 2 - v.cx * s}px, ${H / 2 - v.cy * s}px) scale(${s})`;
    viewRef.current = v;
  }, []);
  const viewOf = useCallback((id: string): View | null => {
    const c = pos.get(id);
    if (!c) return null;
    const { W, H } = size();
    const m = Math.min(W, H);
    const d = Math.max(1, Math.min(0.9 * m, (m - GAP * 2) / 1.03));
    const s = d / (2 * c.r);
    return { cx: c.x, cy: c.y, w: W / s };
  }, [pos]);

  const animateTo = useCallback((target: View, instant = false) => {
    cancelAnimationFrame(animRef.current);
    const from = viewRef.current;
    const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (instant || !from || still) { apply(target); return; }
    const path = zoomPath(from, target);
    const dur = Math.min(1600, Math.max(520, Math.abs(path.S) * 1000));
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      apply(t < 1 ? path.at(ease(t)) : target);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [apply]);

  /* 넘김 - 고른 문서로 카메라를 옮긴다. record: 손으로 옮긴 것(개요로 간 것도)만 기억하게 알린다 */
  const go = useCallback((i: number, instant = false, record = true) => {
    const n = Math.max(0, Math.min(order.length - 1, i));
    setStep(n);
    const id = order[n]?.id ?? graph.rootId;
    shownId.current = id;
    const v = viewOf(id);
    if (v) animateTo(v, instant);
    if (record) onStep(id);
  }, [order, viewOf, animateTo, graph.rootId, onStep]);
  const goId = useCallback((id: string) => {
    const i = order.findIndex((d) => d.id === id);
    if (i >= 0) go(i);
  }, [order, go]);

  /* 처음 · 카테고리를 바꿈 · 문서가 바뀜
     - 같은 판(문서 내용만 바뀜): 보던 문서
     - 다시 왔거나 카테고리를 바꿈: 그 카테고리에서 마지막으로 보던 문서(문서 id 로), 없으면 보던 문서
     - 둘 다 판에 없으면(지워짐) 개요. 기억한 값은 손으로 옮길 때만 바꾼다 */
  const boardRef = useRef<string | null>(null);
  const startRef = useRef(startId);
  startRef.current = startId;
  useEffect(() => {
    const same = boardRef.current === graph.rootId;
    boardRef.current = graph.rootId;
    const want = same ? [shownId.current] : [startRef.current, shownId.current];
    let i = -1;
    for (const id of want) {
      if (id) i = order.findIndex((d) => d.id === id);
      if (i >= 0) break;
    }
    go(i >= 0 ? i : 0, true, false);
    // 판이 바뀔 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  /* 창 크기가 바뀌면 지금 문서를 다시 맞춘다 */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const v = viewOf(shownId.current ?? graph.rootId);
      if (v) apply(v);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewOf, apply, graph.rootId]);

  /* 막대의 확대 단추 */
  useEffect(() => {
    api.current = {
      zoomIn: () => { const v = viewRef.current; if (v) animateTo({ ...v, w: v.w * 0.7 }); },
      zoomOut: () => { const v = viewRef.current; if (v) animateTo({ ...v, w: Math.min(v.w / 0.7, R0 * 8) }); },
      fit: () => go(0),
    };
    return () => { api.current = null; };
  }, [api, animateTo, go]);

  /* 휠 확대 · 끌어서 이동 · 두 손가락 확대 */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const clampW = (w: number) => Math.max(R0 * 0.0004, Math.min(R0 * 8, w));
    /** 화면 점(sx, sy)이 가리키는 판 위의 점을 그 자리에 둔 채로 폭을 w 로 */
    const zoomAround = (sx: number, sy: number, w: number) => {
      const v = viewRef.current;
      if (!v) return;
      const r = stage.getBoundingClientRect();
      const mx = sx - r.left - r.width / 2;
      const my = sy - r.top - r.height / 2;
      const s0 = r.width / v.w;
      const nw = clampW(w);
      const s1 = r.width / nw;
      apply({ cx: v.cx + mx / s0 - mx / s1, cy: v.cy + my / s0 - my / s1, w: nw });
    };
    const onWheel = (e: WheelEvent) => {
      const v = viewRef.current;
      if (!v) return;
      e.preventDefault();
      cancelAnimationFrame(animRef.current);
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAround(e.clientX, e.clientY, v.w * Math.exp(dy * 0.0015));
    };

    const pts = new Map<number, { x: number; y: number }>();
    let start: { v: View; x: number; y: number; dist: number; mx: number; my: number } | null = null;
    const snapshot = () => {
      const v = viewRef.current;
      const p = [...pts.values()];
      if (!v || p.length === 0) { start = null; return; }
      const mx = p.reduce((s, q) => s + q.x, 0) / p.length;
      const my = p.reduce((s, q) => s + q.y, 0) / p.length;
      const dist = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
      start = { v, x: mx, y: my, dist, mx, my };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest('[data-hud]')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragged.current = false;
      snapshot();
    };
    const onMove = (e: PointerEvent) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const p = [...pts.values()];
      const mx = p.reduce((s, q) => s + q.x, 0) / p.length;
      const my = p.reduce((s, q) => s + q.y, 0) / p.length;
      if (!dragged.current && Math.hypot(mx - start.x, my - start.y) < 6 && p.length < 2) return;
      if (!dragged.current) {
        dragged.current = true;
        cancelAnimationFrame(animRef.current);
        stage.setPointerCapture(e.pointerId);
      }
      const r = stage.getBoundingClientRect();
      const s0 = r.width / start.v.w;
      if (p.length > 1 && start.dist > 0) {
        // 두 손가락 - 처음 가운데 점을 따라가며 손가락 사이 거리만큼 확대
        const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        const nw = clampW(start.v.w * (start.dist / dist));
        const s1 = r.width / nw;
        const ax = start.mx - r.left - r.width / 2;
        const ay = start.my - r.top - r.height / 2;
        const bx = mx - r.left - r.width / 2;
        const by = my - r.top - r.height / 2;
        apply({ cx: start.v.cx + ax / s0 - bx / s1, cy: start.v.cy + ay / s0 - by / s1, w: nw });
      } else {
        apply({ cx: start.v.cx - (mx - start.x) / s0, cy: start.v.cy - (my - start.y) / s0, w: start.v.w });
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      snapshot();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      cancelAnimationFrame(animRef.current);
    };
  }, [apply]);

  /* 전체 화면(발표) */
  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen?.();
  };

  const open = (d: GDoc) => { if (!d.virtual) onOpenDoc(d.id); };
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); go(step + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); go(step - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(order.length - 1); break;
      case 'Enter': e.preventDefault(); open(cur); break;
      case 'Escape': if (!document.fullscreenElement && cur.parent) { e.preventDefault(); goId(cur.parent); } break;
      case '+': case '=': e.preventDefault(); api.current?.zoomIn(); break;
      case '-': e.preventDefault(); api.current?.zoomOut(); break;
      case '0': e.preventDefault(); go(0); break;
      default:
    }
  };

  const trail = pathTo(graph, cur.id);
  const avatar = (m: { id: string; initial: string; name: string }) => {
    const p = PAINT[paint.member(m.id)];
    return (
      <i key={m.id} title={m.name} className="inline-grid h-[1.15em] w-[1.15em] flex-none place-items-center rounded-full text-[0.5em] font-bold not-italic"
        style={{ background: p.tint, color: p.solid }}>
        {m.initial}
      </i>
    );
  };

  return (
    <div ref={wrapRef} className="tm-present absolute inset-0 flex flex-col overflow-hidden bg-[#0b1220]">
      {/* 무대 - 넘기기 막대를 뺀 나머지 높이. 맞춤 · 창 크기 다시 맞추기가 이 크기를 쓴다 */}
      <div className="relative min-h-0 flex-1">
        <div ref={stageRef} tabIndex={0} onKeyDown={onKeyDown}
          role="application" aria-roledescription="프레젠테이션"
          aria-label={`${label} 프레젠테이션. 화살표로 넘기고 Enter 로 문서를 엽니다`}
          aria-describedby="wp-live"
          onClick={(e) => {
            // 빈 곳을 누르면 한 단계 밖으로(Prezi 와 같다)
            if (dragged.current || e.target !== e.currentTarget) return;
            if (cur.parent) goId(cur.parent);
          }}
          className="absolute inset-0 cursor-grab touch-none select-none outline-none focus-visible:shadow-[inset_0_0_0_2px_#7aa2ff] active:cursor-grabbing">
          <div ref={worldRef} className="pointer-events-none absolute left-0 top-0 origin-top-left">
            {order.map((d) => {
              const c = pos.get(d.id);
              if (!c) return null;
              const leaf = d.children.length === 0;
              const root = d.depth === 0;
              const on = d.id === cur.id;
              const meta = [
                d.person ? `맡은 작업 ${d.assigned}건` : '',
                d.descendants ? `문서 ${d.descendants}` : '',
                d.tasks.length ? `작업 ${d.tasks.length}` : '',
              ].filter(Boolean);
              return (
                <div key={d.id} data-id={d.id}
                  onClick={(e) => { e.stopPropagation(); if (!dragged.current) goId(d.id); }}
                  onDoubleClick={(e) => { e.stopPropagation(); open(d); }}
                  title={d.virtual ? d.title : `${d.title} · 누르면 들어갑니다 · 아래 문서 열기(또는 두 번 누르기)로 엽니다`}
                  className="pointer-events-auto absolute cursor-pointer rounded-full"
                  style={{
                    left: c.x - c.r, top: c.y - c.r, width: c.r * 2, height: c.r * 2, fontSize: c.r * 0.085,
                    background: root ? '#13203d' : d.depth === 1 ? '#ffffff' : d.tint,
                    border: `${c.r * (root ? 0.008 : 0.028)}px solid ${root ? '#2f4fd6' : d.color}`,
                    boxShadow: on && !root ? `0 0 0 ${c.r * 0.03}px rgba(122, 162, 255, 0.55)` : undefined,
                    color: root ? '#ffffff' : '#1b2430',
                  }}>
                  <div className={`absolute flex flex-col items-center gap-[0.18em] text-center ${
                    leaf ? 'inset-x-[13%] inset-y-[14%] justify-center' : 'inset-x-[18%] top-[9%]'}`}>
                    <p className="flex max-w-full items-center justify-center gap-[0.25em] font-extrabold leading-[1.2] tracking-[-0.02em]"
                      style={{ fontSize: leaf ? '2em' : root ? '1em' : '1.45em' }}>
                      {d.person ? avatar(d.person) : d.icon ? <span aria-hidden className="flex-none">{d.icon}</span> : null}
                      <span className={`[overflow-wrap:anywhere] ${leaf || root ? 'line-clamp-2' : 'line-clamp-1'}`}>{d.title}</span>
                    </p>
                    {meta.length > 0 && (
                      <p className={`font-semibold ${leaf ? 'text-[0.72em]' : 'text-[0.42em]'}`} style={{ color: root ? 'rgba(255,255,255,0.75)' : '#5b6676' }}>
                        {meta.join(' · ')}
                      </p>
                    )}
                    {leaf && d.excerpt && (
                      <p className="line-clamp-4 max-w-full text-[0.78em] font-medium leading-[1.55]" style={{ color: root ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                        {d.excerpt}
                      </p>
                    )}
                    {leaf && d.people.length > 0 && (
                      <p className="flex items-center gap-[0.15em] text-[1.3em]">{d.people.slice(0, 6).map(avatar)}</p>
                    )}
                    {leaf && showTasks && d.tasks.length > 0 && (
                      <ul className="mt-[0.2em] flex max-w-full flex-col items-stretch gap-[0.12em] text-[0.62em]">
                        {d.tasks.slice(0, 4).map((t) => (
                          <li key={t.id}>
                            <button type="button" tabIndex={-1}
                              onClick={(e) => { e.stopPropagation(); onOpenTask(t.key); }}
                              className="flex w-full items-center gap-[0.4em] rounded-[0.5em] bg-white/85 px-[0.6em] py-[0.25em] text-left font-semibold text-[#1b2430] ring-1 ring-black/10 hover:bg-white">
                              <i className="h-[0.6em] w-[0.6em] flex-none rounded-full" style={{ background: STATUS_DOT[t.status] }} />
                              <b className="flex-none tabular-nums text-[#5b6676]">{t.key}</b>
                              <span className="truncate">{t.title}</span>
                            </button>
                          </li>
                        ))}
                        {d.tasks.length > 4 && <li className="text-center font-bold text-[#5b6676]">작업 {d.tasks.length - 4}건 더</li>}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p id="wp-live" className="sr-only" aria-live="polite">
        {`${step + 1} / ${order.length}, ${cur.title}${cur.children.length ? `, 아래 문서 ${cur.children.length}개` : ''}`}
      </p>

      {/* 넘기기 막대 - 무대 아래 따로 한 줄(z-10: 손가락 기기에서 지도 조작이 꺼져도 누를 수 있게) */}
      <div data-hud className="relative z-10 flex flex-none justify-center border-t border-white/15 bg-[#0b1220] px-3 py-2 max-[720px]:px-2 max-[720px]:py-1.5">
        <div className="flex max-w-full flex-wrap items-center justify-center gap-2 text-white max-[720px]:gap-1.5">
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className={hudBtn} aria-label="이전">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 4.5L7 10l5.5 5.5" /></svg>
          </button>
          <span className="min-w-[52px] text-center text-[13.5px] font-bold tabular-nums">{step + 1} / {order.length}</span>
          <button type="button" onClick={() => go(step + 1)} disabled={step >= order.length - 1} className={hudBtn} aria-label="다음">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 4.5L13 10l-5.5 5.5" /></svg>
          </button>
          <nav aria-label="지금 위치" className="flex min-w-0 max-w-[46ch] items-center gap-1 text-[13.5px] font-semibold text-white/80 max-[720px]:hidden">
            <button type="button" onClick={() => go(0)} className="truncate hover:text-white hover:underline">{order[0]?.title}</button>
            {trail.map((t) => (
              <span key={t.id} className="flex min-w-0 items-center gap-1">
                <span aria-hidden className="text-white/45">›</span>
                <button type="button" onClick={() => goId(t.id)} className={`truncate hover:underline ${t.id === cur.id ? 'font-bold text-white' : 'hover:text-white'}`}>
                  {t.title}
                </button>
              </span>
            ))}
          </nav>
          {!cur.virtual && (
            <button type="button" onClick={() => open(cur)} className={`${hudBtn} border-transparent bg-[#2644cb] hover:bg-[#2e5bf0]`}>
              문서 열기
            </button>
          )}
          <button type="button" onClick={() => go(0)} disabled={step === 0} className={`${hudBtn} max-[720px]:hidden`}>개요</button>
          {canFull && (
            <button type="button" onClick={toggleFull} className={hudBtn} aria-pressed={full} aria-label={full ? '전체 화면 끝' : '전체 화면'}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                {full ? <path d="M8 3.5v4.5H3.5M12 3.5v4.5h4.5M8 16.5V12H3.5M12 16.5V12h4.5" /> : <path d="M3.5 8V3.5H8M16.5 8V3.5H12M3.5 12v4.5H8M16.5 12v4.5H12" />}
              </svg>
              <span className="max-[720px]:hidden">{full ? '전체 화면 끝' : '전체 화면'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
