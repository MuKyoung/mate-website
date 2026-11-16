'use client';

/**
 * 팀 위키 3D 그래프 - 옵시디언의 그래프 보기를 3D 로 띄운 것.
 * 옵시디언의 3D 그래프 플러그인들(New 3D Graph · 3D Graph New · Agentage Galaxy)이 쓰는 3d-force-graph(MIT)로 그린다.
 *
 * - 문서 = 구(아래 문서가 많을수록 크다), 가운데 = 흰 구(카테고리 또는 전체)
 * - 위아래 문서 = 옅은 선, 문서 링크 = 파란 선(흐르는 점), 작업 = 상태 색 작은 구(본문에 적은 작업 번호)
 * - 마우스를 올리면 그 문서와 이웃만 밝게(옵시디언과 같다), 누르면 카메라가 그 문서로 날아가 정보 칸이 열리고,
 *   정보 칸의 '문서 열기'로 연다(두 번 눌러도 열린다). 끌어서 돌리고 휠로 확대한다.
 * - 왼쪽 위 '문서 선택'(기본 select)으로도 고른다 - 구를 누른 것과 같다(키보드 · 화면 읽기 프로그램용 길).
 * - 움직임 줄이기(prefers-reduced-motion)를 켠 기기는 날아가기 · 확대 · 맞춤이 바로 되고, 자동 회전 · 흐르는 점이 멈춘다.
 * three.js 를 쓰므로 3D 를 고를 때만 불러온다(WikiMap 의 next/dynamic).
 */
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import SpriteText from 'three-spritetext';
import { STATUS_DOT, pathTo, type CanvasApi, type WikiGraph } from './wikiGraph';
import { useMediaQuery } from './ui';

interface N {
  id: string;
  kind: 'root' | 'doc' | 'task';
  name: string;
  color: string;
  val: number;
  depth: number;
  /** 열 문서 - 가운데 '전체'는 없다 */
  docId?: string;
  taskKey?: string;
  x?: number; y?: number; z?: number;
  fx?: number; fy?: number; fz?: number;
}
interface L { source: string | N; target: string | N; kind: 'tree' | 'link' | 'task' }
type Sprite = SpriteText & { center: { y: number }; material: { opacity: number; transparent: boolean } };

const BG = '#0b1220';
const DIM = '#26324a';
const FONT = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
const asN = (n: object) => n as N;
const asL = (l: object) => l as L;
const idOf = (v: string | N) => (typeof v === 'string' ? v : v.id);
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export default function WikiGraph3D({ graph, showTasks, showLinks, rotate, onOpenDoc, onOpenTask, api }: {
  graph: WikiGraph;
  showTasks: boolean;
  showLinks: boolean;
  /** 천천히 돌기 */
  rotate: boolean;
  onOpenDoc(id: string): void;
  onOpenTask(key: string): void;
  api: MutableRefObject<CanvasApi | null>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraph3DInstance | null>(null);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<N | null>(null);
  const pickedRef = useRef<N | null>(null);
  const handlers = useRef({ onOpenDoc, onOpenTask });
  handlers.current = { onOpenDoc, onOpenTask };

  /** 밝게 둘 것 - 마우스를 올린 문서(없으면 누른 문서)와 그 이웃 */
  const lit = useRef<{ focus: string | null; nodes: Set<string>; links: Set<L> }>({ focus: null, nodes: new Set(), links: new Set() });
  const neighbors = useRef(new Map<string, { nodes: Set<string>; links: Set<L> }>());
  const labels = useRef(new Map<string, Sprite>());
  const rootRef = useRef(graph.rootId);
  rootRef.current = graph.rootId;
  /** 화면에 맞춰 둔 판(가운데 id) - 카테고리를 바꾸면 다시 맞춘다 */
  const fittedFor = useRef<string | null>(null);
  /** 움직임 줄이기 - 날아가기 · 확대 · 맞춤을 바로, 자동 회전 · 흐르는 점은 멈춘다(돌기 설정 값은 그대로 둔다) */
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const stillRef = useRef(still);
  stillRef.current = still;
  /** 엔진 밖(문서 선택 · 닫기)에서 구를 고르거나 푼다 */
  const actions = useRef<{ pick(id: string | null): void; focus(id: string | null): void } | null>(null);

  const open = (n: N) => {
    if (n.kind === 'task' && n.taskKey) handlers.current.onOpenTask(n.taskKey);
    else if (n.docId) handlers.current.onOpenDoc(n.docId);
  };

  /* ── 엔진 ── */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { setFailed(true); return; }
    let fg: ForceGraph3DInstance;
    try {
      fg = new ForceGraph3D(el, { controlType: 'orbit' });
    } catch {
      setFailed(true);
      return;
    }
    fgRef.current = fg;
    const labelMap = labels.current;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    /** 움직임 줄이기면 0(바로) */
    const ms = (t: number) => (stillRef.current ? 0 : t);

    const restyle = () => {
      fg.nodeColor(fg.nodeColor()).linkColor(fg.linkColor()).linkWidth(fg.linkWidth());
      const f = lit.current;
      labels.current.forEach((s, id) => {
        s.material.transparent = true;
        s.material.opacity = !f.focus || f.nodes.has(id) ? 1 : 0.16;
      });
    };
    const focus = (id: string | null) => {
      const nb = id ? neighbors.current.get(id) : undefined;
      lit.current = {
        focus: id,
        nodes: new Set(id ? [id, ...(nb?.nodes ?? [])] : []),
        links: new Set(nb?.links ?? []),
      };
      restyle();
    };
    const fly = (n: N) => {
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      const z = n.z ?? 0;
      const len = Math.hypot(x, y, z);
      const d = n.kind === 'root' ? 160 : 72;
      const pos = len < 1 ? { x: 0, y: 0, z: d } : { x: x * (1 + d / len), y: y * (1 + d / len), z: z * (1 + d / len) };
      fg.cameraPosition(pos, { x, y, z }, ms(900));
    };
    /** 구를 고른다(누르기 · 문서 선택 같은 길) - null 이면 정보 칸 · 밝히기를 푼다(카메라는 그대로) */
    const pick = (id: string | null) => {
      const n = id ? (fg.graphData().nodes as N[]).find((m) => m.id === id) : undefined;
      pickedRef.current = n ?? null;
      setPicked(n ?? null);
      focus(n?.id ?? null);
      if (n) fly(n);
    };
    actions.current = { pick, focus };
    let last = { id: '', t: 0 };

    fg.backgroundColor(BG)
      .showNavInfo(false)
      .width(el.clientWidth)
      .height(el.clientHeight)
      .nodeId('id')
      .nodeVal((n) => asN(n).val)
      .nodeColor((n) => (!lit.current.focus || lit.current.nodes.has(asN(n).id) ? asN(n).color : DIM))
      .nodeOpacity(0.95)
      .nodeResolution(14)
      .nodeLabel((n) => {
        const x = asN(n);
        return `<div style="font:600 13px/1.4 ${FONT};padding:2px 4px">${esc(x.name)}<br><span style="opacity:.7">${
          x.kind === 'task' ? '누르면 정보 칸 · 작업 열기로 엽니다' : x.docId ? '누르면 가까이 · 정보 칸의 문서 열기로 엽니다' : ''}</span></div>`;
      })
      .nodeThreeObjectExtend(true)
      .nodeThreeObject((n: object) => {
        const x = asN(n);
        if (x.kind === 'task') return null;
        const s = new SpriteText(x.name, x.kind === 'root' ? 8 : x.depth === 1 ? 5.6 : 4.2, '#e8eef8') as Sprite;
        s.fontFace = FONT;
        s.fontWeight = x.depth <= 1 ? '800' : '600';
        s.backgroundColor = 'rgba(11, 18, 32, 0.62)';
        s.padding = [2.5, 1.2];
        s.borderRadius = 2;
        s.center.y = -0.7; // 구 위로 올린다
        // 고른 구가 있으면 처음부터 흐리게(판을 다시 만든 뒤에도 밝히기가 이어지게)
        s.material.transparent = true;
        s.material.opacity = !lit.current.focus || lit.current.nodes.has(x.id) ? 1 : 0.16;
        labels.current.set(x.id, s);
        return s;
      })
      .linkColor((l) => {
        const k = asL(l);
        if (lit.current.focus && !lit.current.links.has(k)) return 'rgba(80, 96, 128, 0.12)';
        return k.kind === 'link' ? '#7aa2ff' : k.kind === 'task' ? 'rgba(255, 196, 92, 0.7)' : 'rgba(170, 184, 210, 0.6)';
      })
      .linkWidth((l) => {
        const k = asL(l);
        const on = !!lit.current.focus && lit.current.links.has(k);
        return (k.kind === 'link' ? 1.1 : k.kind === 'task' ? 0.4 : 0.6) * (on ? 2.2 : 1);
      })
      .linkOpacity(0.6)
      .linkDirectionalParticles((l) => (!stillRef.current && asL(l).kind === 'link' ? 2 : 0))
      .linkDirectionalParticleWidth(1.6)
      .linkDirectionalParticleSpeed(0.006)
      .linkDirectionalParticleColor(() => '#c9d8ff')
      .enableNodeDrag(!coarse)
      .cooldownTicks(160)
      .onNodeHover((n) => {
        el.style.cursor = n ? 'pointer' : '';
        focus(n ? asN(n).id : pickedRef.current?.id ?? null);
      })
      .onNodeClick((n) => {
        const x = asN(n);
        const now = performance.now();
        if (last.id === x.id && now - last.t < 450) { open(x); return; }
        last = { id: x.id, t: now };
        pick(x.id);
      })
      .onBackgroundClick(() => pick(null))
      .onEngineStop(() => {
        // 처음, 그리고 카테고리를 바꾼 뒤 한 번 화면에 맞춘다
        if (fittedFor.current !== rootRef.current) {
          fittedFor.current = rootRef.current;
          fg.zoomToFit(ms(700), 40);
        }
      });

    /* 끌림 - 위아래 문서는 가깝게, 문서 링크는 멀게, 작업은 문서 곁에 */
    const link = fg.d3Force('link') as unknown as { distance?: (fn: (l: L) => number) => unknown } | undefined;
    link?.distance?.((l) => (l.kind === 'tree' ? 34 : l.kind === 'task' ? 14 : 72));
    const charge = fg.d3Force('charge') as unknown as { strength?: (v: number) => unknown } | undefined;
    charge?.strength?.(-70);

    const dolly = (k: number) => {
      const p = fg.cameraPosition();
      const t = (fg.controls() as { target?: { x: number; y: number; z: number } }).target ?? { x: 0, y: 0, z: 0 };
      fg.cameraPosition({ x: t.x + (p.x - t.x) * k, y: t.y + (p.y - t.y) * k, z: t.z + (p.z - t.z) * k }, t, ms(350));
    };
    api.current = { zoomIn: () => dolly(0.7), zoomOut: () => dolly(1 / 0.7), fit: () => fg.zoomToFit(ms(600), 40) };

    const ro = new ResizeObserver(() => { fg.width(el.clientWidth).height(el.clientHeight); });
    ro.observe(el);

    return () => {
      ro.disconnect();
      api.current = null;
      actions.current = null;
      fg.pauseAnimation();
      fg._destructor();
      fgRef.current = null;
      labelMap.clear();
      el.replaceChildren();
    };
  }, [api]);

  /* ── 판 - 문서 · 링크 · 작업. 같은 id 의 구는 자리를 이어받아 다시 흩어지지 않게 ── */
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const prev = new Map((fg.graphData().nodes as N[]).map((n) => [n.id, n]));
    const nodes: N[] = [];
    const links: L[] = [];
    const keep = (n: N) => {
      const o = prev.get(n.id);
      if (o) { n.x = o.x; n.y = o.y; n.z = o.z; }
      nodes.push(n);
    };
    graph.docs.forEach((d) => {
      const n: N = {
        id: d.id,
        kind: d.depth === 0 ? 'root' : 'doc',
        name: `${d.icon ? `${d.icon} ` : ''}${d.title}`,
        color: d.depth === 0 ? '#ffffff' : d.color,
        val: d.depth === 0 ? 18 : d.depth === 1 ? 6 + Math.min(10, d.descendants) : 2.4 + Math.min(6, d.descendants + d.tasks.length * 0.5),
        depth: d.depth,
        docId: d.virtual ? undefined : d.id,
      };
      if (d.depth === 0) { n.fx = 0; n.fy = 0; n.fz = 0; }
      keep(n);
      if (d.parent) links.push({ source: d.parent, target: d.id, kind: 'tree' });
    });
    if (showLinks) graph.links.forEach((l) => links.push({ source: l.from, target: l.to, kind: 'link' }));
    if (showTasks) {
      graph.tasks.forEach((t) => keep({
        id: `t-${t.id}`, kind: 'task', name: `${t.key} ${t.title}`, color: STATUS_DOT[t.status], val: 1, depth: 9, taskKey: t.key,
      }));
      graph.docs.forEach((d) => d.tasks.forEach((t) => links.push({ source: d.id, target: `t-${t.id}`, kind: 'task' })));
    }
    const nb = new Map<string, { nodes: Set<string>; links: Set<L> }>();
    const at = (id: string) => {
      let v = nb.get(id);
      if (!v) { v = { nodes: new Set(), links: new Set() }; nb.set(id, v); }
      return v;
    };
    links.forEach((l) => {
      const a = idOf(l.source);
      const b = idOf(l.target);
      at(a).nodes.add(b); at(b).nodes.add(a);
      at(a).links.add(l); at(b).links.add(l);
    });
    neighbors.current = nb;
    labels.current.clear();
    lit.current = { focus: null, nodes: new Set(), links: new Set() };
    // 고른 구가 새 판에도 있으면 정보 칸 · 밝히기를 이어 가고, 없으면 푼다
    const kept = pickedRef.current ? nodes.find((n) => n.id === pickedRef.current?.id) : undefined;
    if (pickedRef.current && !kept) { pickedRef.current = null; setPicked(null); }
    if (kept) pickedRef.current = kept;
    fg.graphData({ nodes, links });
    if (kept) actions.current?.focus(kept.id);
  }, [graph, showTasks, showLinks]);

  /* 천천히 돌기(옵시디언 3D 플러그인들의 자동 회전) - 움직임 줄이기면 멈춘다(설정 값은 그대로) */
  useEffect(() => {
    const c = fgRef.current?.controls() as { autoRotate?: boolean; autoRotateSpeed?: number } | undefined;
    if (!c) return;
    c.autoRotate = rotate && !still;
    c.autoRotateSpeed = 0.9;
  }, [rotate, still, failed]);

  /* 흐르는 점 - 움직임 줄이기를 켜고 끌 때 바로 */
  useEffect(() => {
    fgRef.current?.linkDirectionalParticles((l) => (!still && asL(l).kind === 'link' ? 2 : 0));
  }, [still]);

  /** 문서 선택 - 가상의 '전체' 가운데는 빼고, 위 문서 › 제목 */
  const options = useMemo(() => graph.docs.filter((d) => !d.virtual).map((d) => {
    const path = pathTo(graph, d.id).map((t) => t.title);
    return { id: d.id, label: path.length ? path.join(' › ') : d.title };
  }), [graph]);

  const doc = picked?.docId ? graph.byId.get(picked.docId) : picked?.kind === 'root' ? graph.byId.get(graph.rootId) : undefined;
  const trail = doc ? pathTo(graph, doc.id).slice(0, -1) : [];

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#0b1220] p-6 text-center">
        <p className="max-w-[44ch] text-[15px] leading-[1.7] text-white/85">
          이 기기에서는 3D 를 그릴 수 없습니다(WebGL 을 쓸 수 없음). 마인드맵이나 프레젠테이션으로 보세요.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 엔진이 그리는 칸 - 크기는 바깥 틀이 정한다 */}
      <div className="absolute inset-0">
        <div ref={hostRef} role="img"
          aria-label={`팀 위키 3D 그래프 - 문서 ${graph.docs.length}개, 문서 링크 ${graph.links.length}개. 문서 목록은 '문서' 보기에서 키보드로 고를 수 있습니다`}
          className="h-full w-full" />
      </div>

      {/* 문서 선택 - 구를 누르는 것과 같다(키보드로도 고르고 아래 정보 칸의 '문서 열기'로 연다) */}
      <label className="absolute left-3 top-3 z-10 w-[min(320px,calc(100%-24px))] max-[720px]:inset-x-2 max-[720px]:top-2 max-[720px]:w-auto">
        <span className="sr-only">문서 선택</span>
        <select value={picked?.docId ?? ''} onChange={(e) => actions.current?.pick(e.target.value || null)}
          className="h-10 w-full cursor-pointer rounded-tm-sm border border-white/25 bg-[#0b1220] px-3 text-[14px] font-semibold text-white [color-scheme:dark]
                     hover:border-white/45 focus:border-[#7aa2ff] max-[720px]:h-11 max-[720px]:text-[16px] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px]">
          <option value="">문서 선택…</option>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>

      {/* 누른 문서 - 무엇인지, 어디에 있는지, 열기 */}
      {picked && (
        <div className="absolute left-3 top-[60px] z-10 w-[min(320px,calc(100%-24px))] rounded-tm border border-white/15 bg-[#0b1220] p-4 text-white shadow-tm-up
                        max-[720px]:inset-x-2 max-[720px]:bottom-2 max-[720px]:left-2 max-[720px]:top-auto max-[720px]:w-auto">
          <p className="truncate text-[12.5px] font-semibold text-white/60">
            {picked.kind === 'task' ? '작업' : picked.kind === 'root' ? '가운데' : '문서'}
            {trail.length > 0 && ` · ${trail.map((t) => t.title).join(' › ')}`}
          </p>
          <p className="mt-1 text-[17px] font-extrabold leading-[1.35] [overflow-wrap:anywhere]">{picked.name}</p>
          {doc && (
            <p className="mt-1.5 text-[13px] font-semibold text-white/75">
              {[
                doc.person ? `맡은 작업 ${doc.assigned}건` : '',
                doc.descendants ? `아래 문서 ${doc.descendants}` : '',
                doc.tasks.length ? `작업 ${doc.tasks.length}` : '',
                graph.links.filter((l) => l.from === doc.id || l.to === doc.id).length
                  ? `문서 링크 ${graph.links.filter((l) => l.from === doc.id || l.to === doc.id).length}` : '',
              ].filter(Boolean).join(' · ') || '아래 문서 없음'}
            </p>
          )}
          {doc?.excerpt && <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.6] text-white/85">{doc.excerpt}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {(picked.docId || picked.taskKey) && (
              <button type="button" onClick={() => open(picked)}
                className="inline-flex h-9 items-center rounded-tm-sm bg-[#2644cb] px-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-[#2e5bf0] max-[720px]:h-11 [@media(pointer:coarse)]:h-11">
                {picked.kind === 'task' ? '작업 열기' : '문서 열기'}
              </button>
            )}
            <button type="button" onClick={() => actions.current?.pick(null)}
              className="inline-flex h-9 items-center rounded-tm-sm border border-white/25 px-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-white/10 max-[720px]:h-11 [@media(pointer:coarse)]:h-11">
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
