'use client';

/**
 * 팀 위키 그래프 - 옵시디언(Obsidian)의 그래프 보기를 최대한 그대로 옮긴 것.
 *
 * 옵시디언 도움말(그래프 뷰)의 설정 이름과 동작을 따른다.
 * - 필터: 파일 검색 · 태그 · 첨부 파일(여기서는 본문에 적은 작업) · 미연결 노트 · 로컬 그래프(깊이)
 *   + MATE 만의 '위아래 문서 잇기'(위키가 트리라서 - 끄면 옵시디언처럼 링크만 선이 된다)
 * - 그룹: 검색어 + 색. path: · tag: · file: · -빼기를 알아듣는다
 * - 표시: 화살표 · 텍스트 표시 시작점 · 노드 크기 · 링크 두께 · 애니메이션 재생(만든 순서대로 나타나는 타임랩스)
 * - 포스: 중심 장력 · 반발력 · 링크 장력 · 링크 거리
 * - 그 노트를 가리키는 링크가 많을수록 원이 크다. 마우스를 올리면 그 노트의 연결만 밝고, 누르면 열린다.
 *   오른쪽 누르기는 메뉴, 끌어서 이동, 휠 · +/- 로 확대, 방향키로 이동(Shift 는 빠르게).
 * - 마우스 올리기가 없는 기기(손가락)는 누르면 선택만 한다 - 그 노트와 이웃이 밝아지고, 아래 칸의 열기 단추로 연다.
 * - 이름은 화면에서 늘 13px(올리거나 고른 노트는 16px 로 맨 위에 다 쓴다).
 * 그리기는 force-graph(MIT, 3d-force-graph 의 2D 판) 캔버스, 색은 옵시디언 기본 어두운 테마.
 * force-graph 를 쓰므로 이 보기를 고를 때만 불러온다(WikiMap 의 next/dynamic).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import ForceGraph from 'force-graph';
import type { Doc, Task } from './types';
import { docLinkIds } from './docMarkdown';
import { titleOf } from './DocPanels';
import { TASK_RE, type CanvasApi } from './wikiGraph';
import { useMediaQuery } from './ui';

type Kind = 'doc' | 'tag' | 'task';
interface ONode {
  id: string;
  kind: Kind;
  name: string;
  docId?: string;
  taskKey?: string;
  /** 위 문서 제목들 - path: 검색에 쓴다 */
  path: string;
  labels: string[];
  /** 가리키는 링크 수(+1) - 원 크기 */
  weight: number;
  /** 만든 시각(ms) - 애니메이션 재생 순서 */
  created: number;
  /** 그룹 색 */
  color: string | null;
  x?: number; y?: number; vx?: number; vy?: number; fx?: number; fy?: number;
}
interface OLink { source: string | ONode; target: string | ONode; kind: 'link' | 'tree' | 'tag' | 'task' }

interface Group { query: string; color: string }
/** 로컬 그래프 상태 - 중심 문서가 없거나 판에 없으면 조용히 전체로 돌아가지 않고 알린다 */
type LocalState = 'off' | 'ok' | 'none' | 'outside' | 'searched';
interface Settings {
  search: string;
  tags: boolean;
  attachments: boolean;
  orphans: boolean;
  hierarchy: boolean;
  local: boolean;
  depth: number;
  groups: Group[];
  arrows: boolean;
  textFade: number;
  nodeSize: number;
  linkThickness: number;
  center: number;
  repel: number;
  linkForce: number;
  linkDistance: number;
  open: { filters: boolean; groups: boolean; display: boolean; forces: boolean };
  panel: boolean;
}

/** 옵시디언 그래프 설정의 기본값과 같은 자리 */
const DEFAULTS: Settings = {
  search: '', tags: false, attachments: false, orphans: true, hierarchy: true, local: false, depth: 1, groups: [],
  arrows: false, textFade: 0, nodeSize: 1, linkThickness: 1,
  center: 0.52, repel: 10, linkForce: 1, linkDistance: 250,
  open: { filters: true, groups: false, display: false, forces: false },
  panel: false,
};

/** 옵시디언 기본 어두운 테마의 그래프 색 */
const C = {
  bg: '#1e1e1e',
  node: '#999999',
  tag: '#44cf6e',
  attachment: '#e0de71',
  focus: '#997ef1',
  accent: '#8a6cef',
  line: '#3f3f3f',
  lineFaint: 'rgba(63, 63, 63, 0.3)',
  text: '#dadada',
  panel: '#262626',
  border: '#363636',
  muted: '#a3a3a3',
  input: '#1e1e1e',
};
const FONT = 'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
/** 그룹 색 고르기의 처음 색들(옵시디언 그룹은 사람이 고른다) - 태그 초록 · 첨부 노랑과 겹치지 않게 */
const GROUP_COLORS = ['#e05252', '#027aff', '#ff8c3a', '#a882ff', '#53dfdd', '#fa99cd', '#b5e853', '#e0ac00'];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ends = (l: OLink): [string, string] => [
  typeof l.source === 'object' ? l.source.id : l.source,
  typeof l.target === 'object' ? l.target.id : l.target,
];

/** 옵시디언 검색어의 일부 - 여러 낱말은 모두 맞아야(AND), path: · tag: · file:, 앞에 - 는 빼기 */
function matcher(q: string): ((n: ONode) => boolean) | null {
  const toks = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!toks.length) return null;
  return (n) => toks.every((t) => {
    const neg = t.length > 1 && t.startsWith('-');
    const s = neg ? t.slice(1) : t;
    let ok: boolean;
    if (s.startsWith('path:')) ok = n.path.toLowerCase().includes(s.slice(5));
    else if (s.startsWith('tag:')) {
      const v = s.slice(4).replace(/^#/, '');
      ok = n.labels.some((l) => l.toLowerCase() === v);
    } else if (s.startsWith('file:')) ok = n.name.toLowerCase().includes(s.slice(5));
    else ok = n.name.toLowerCase().includes(s) || n.path.toLowerCase().includes(s);
    return neg ? !ok : ok;
  });
}

/** 판 만들기 - 필터 · 로컬 그래프 · 그룹까지 */
function build(docs: Doc[], all: Map<string, Doc>, tasks: Task[], s: Settings, localId: string | null, prev: Map<string, ONode>) {
  const nodes = new Map<string, ONode>();
  const links: OLink[] = [];
  const time = (iso: string) => Date.parse(iso) || 0;
  const keep = (n: ONode) => {
    const o = prev.get(n.id);
    if (o) { n.x = o.x; n.y = o.y; n.vx = o.vx; n.vy = o.vy; }
    nodes.set(n.id, n);
  };
  /** 옵시디언의 경로처럼 위 문서들과 자기 제목('프로젝트/프로젝트 A') - path:프로젝트 는 그 카테고리 문서와 아래 문서 */
  const pathOf = (d: Doc) => {
    const parts: string[] = [];
    for (let cur: Doc | undefined = d, g = 0; cur && g < 60; g += 1) {
      parts.unshift(titleOf(cur));
      cur = cur.parentId ? all.get(cur.parentId) : undefined;
    }
    return parts.join('/');
  };

  // 파일 검색 - 맞는 노트만 남긴다(태그 · 첨부는 남은 노트에 붙은 것만)
  const search = matcher(s.search);
  docs.forEach((d) => {
    const n: ONode = { id: d.id, kind: 'doc', name: titleOf(d), docId: d.id, path: pathOf(d), labels: d.labels, weight: 1, created: time(d.createdAt), color: null };
    if (!search || search(n)) keep(n);
  });

  const seen = new Set<string>();
  docs.forEach((d) => {
    if (!nodes.has(d.id)) return;
    docLinkIds(d.body).forEach((to) => {
      const key = `${d.id}>${to}`;
      const target = nodes.get(to);
      if (to === d.id || !target || seen.has(key)) return;
      seen.add(key);
      links.push({ source: d.id, target: to, kind: 'link' });
      target.weight += 1; // 가리키는 노트가 많을수록 크게(옵시디언과 같다)
    });
    // 위아래 문서 잇기 - 아래 문서가 위 문서를 가리키는 링크로 친다(옵시디언에서 '위로' 링크를 단 노트처럼 위 문서가 커진다)
    const parent = d.parentId ? nodes.get(d.parentId) : undefined;
    if (s.hierarchy && parent) { links.push({ source: d.parentId as string, target: d.id, kind: 'tree' }); parent.weight += 1; }
  });

  if (s.tags) {
    docs.forEach((d) => {
      if (!nodes.has(d.id)) return;
      d.labels.forEach((l) => {
        const id = `tag:${l}`;
        const had = nodes.get(id);
        if (had) { had.weight += 1; had.created = Math.min(had.created, time(d.createdAt)); }
        else keep({ id, kind: 'tag', name: `#${l}`, path: '', labels: [l], weight: 1, created: time(d.createdAt), color: null });
        links.push({ source: d.id, target: id, kind: 'tag' });
      });
    });
  }
  if (s.attachments) {
    const byKey = new Map(tasks.map((t) => [t.key, t]));
    docs.forEach((d) => {
      if (!nodes.has(d.id)) return;
      new Set([...d.body.matchAll(TASK_RE)].map((m) => m[0])).forEach((k) => {
        const t = byKey.get(k);
        if (!t) return;
        const id = `task:${t.id}`;
        const had = nodes.get(id);
        if (had) { had.weight += 1; had.created = Math.min(had.created, time(d.createdAt)); }
        else keep({ id, kind: 'task', name: `${t.key} ${t.title}`, taskKey: t.key, path: '', labels: [], weight: 1, created: time(d.createdAt), color: null });
        links.push({ source: d.id, target: id, kind: 'task' });
      });
    });
  }

  let list = [...nodes.values()];
  let edges = links;

  // 로컬 그래프 - 고른 노트에서 깊이만큼. 중심이 없거나(지워짐) 이 카테고리 밖이거나 검색에서 빠졌으면 빈 판으로 알린다
  let local: LocalState = 'off';
  if (s.local) {
    if (!localId || !all.has(localId)) local = 'none';
    else if (!docs.some((d) => d.id === localId)) local = 'outside';
    else if (!nodes.has(localId)) local = 'searched';
    else local = 'ok';
  }
  if (local !== 'off' && local !== 'ok') { list = []; edges = []; }
  if (local === 'ok' && localId) {
    const adj = new Map<string, string[]>();
    edges.forEach((l) => {
      const [a, b] = ends(l);
      adj.set(a, [...(adj.get(a) ?? []), b]);
      adj.set(b, [...(adj.get(b) ?? []), a]);
    });
    const inside = new Set([localId]);
    let frontier = [localId];
    for (let i = 0; i < s.depth; i += 1) {
      const next: string[] = [];
      frontier.forEach((id) => (adj.get(id) ?? []).forEach((nb) => { if (!inside.has(nb)) { inside.add(nb); next.push(nb); } }));
      frontier = next;
    }
    list = list.filter((n) => inside.has(n.id));
    edges = edges.filter((l) => ends(l).every((id) => inside.has(id)));
  }

  // 미연결 노트 - 끄면 선이 하나도 없는 노트를 뺀다
  if (!s.orphans) {
    const linked = new Set(edges.flatMap((l) => ends(l)));
    list = list.filter((n) => linked.has(n.id));
  }

  // 그룹 - 위에서부터 처음 맞는 그룹의 색
  const groups = s.groups.map((g) => ({ m: matcher(g.query), color: g.color })).filter((g) => g.m);
  list.forEach((n) => { n.color = groups.find((g) => g.m?.(n))?.color ?? null; });

  // 남은 문서 수(태그 · 작업 노드는 세지 않는다) - 조건 막대 · 결과 없음
  return { nodes: list, links: edges, docs: list.filter((n) => n.kind === 'doc').length, local };
}

/** 노드 색 - 그룹 색이 먼저, 없으면 종류 색 */
const fillOf = (n: ONode) => n.color ?? (n.kind === 'tag' ? C.tag : n.kind === 'task' ? C.attachment : C.node);

/** 올리거나 고른 노트의 이름 - 화면 폭 260px 안에서 줄을 나눠 다 쓴다(띄어쓰기에서 먼저 나눈다) */
function wrapText(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of Array.from(text)) {
    const next = line + ch;
    if (line && ctx.measureText(next).width > max) {
      const sp = line.lastIndexOf(' ');
      if (sp > 0) { lines.push(line.slice(0, sp)); line = line.slice(sp + 1) + ch; }
      else { lines.push(line); line = ch === ' ' ? '' : ch; }
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** 가운데로 당기는 힘(옵시디언의 중심 장력) - 세기를 바꿀 수 있게 따로 만든다 */
type CustomForce = { (alpha: number): void; initialize?: (nodes: ONode[]) => void; [key: string]: unknown };
function centerPull() {
  let nodes: ONode[] = [];
  let k = 0.06;
  const f = Object.assign((alpha: number) => {
    nodes.forEach((n) => {
      n.vx = (n.vx ?? 0) - (n.x ?? 0) * k * alpha;
      n.vy = (n.vy ?? 0) - (n.y ?? 0) * k * alpha;
    });
  }, {
    initialize: (ns: ONode[]) => { nodes = ns; },
    strength: (v: number) => { k = v; },
  });
  return f as unknown as CustomForce & { strength(v: number): void };
}

/* ── 설정 칸의 부품(옵시디언 모양) ── */

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle(): void; children: React.ReactNode }) {
  return (
    <div className="border-t first:border-t-0" style={{ borderColor: C.border }}>
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-3 py-2.5 text-left text-[13.5px] font-semibold max-[720px]:min-h-11 [@media(pointer:coarse)]:min-h-11"
        style={{ color: C.text }}>
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>
          <path d="M7.5 4.5L13 10l-5.5 5.5" />
        </svg>
        {title}
      </button>
      {open && <div className="flex flex-col gap-2.5 px-3 pb-3">{children}</div>}
    </div>
  );
}

function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange(v: boolean): void; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} title={hint}
      className="flex min-h-[28px] w-full items-center justify-between gap-3 text-left text-[13px] max-[720px]:min-h-11 [@media(pointer:coarse)]:min-h-11" style={{ color: C.text }}>
      <span>{label}</span>
      <span className="relative h-[18px] w-[34px] flex-none rounded-full transition-colors duration-150"
        style={{ background: checked ? C.accent : '#4a4a4a' }}>
        <span className="absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-[left] duration-150" style={{ left: checked ? 18 : 2 }} />
      </span>
    </button>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange(v: number): void }) {
  return (
    <label className="flex flex-col gap-1 text-[13px]" style={{ color: C.text }}>
      <span className="flex items-center justify-between gap-2">
        {label}
        <span className="tabular-nums" style={{ color: C.muted }}>{Number.isInteger(step) ? value : value.toFixed(2)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-5 w-full cursor-pointer max-[720px]:h-11 [@media(pointer:coarse)]:h-11" style={{ accentColor: C.accent }} />
    </label>
  );
}

/** 설정 칸 · 아래 칸의 단추 크기 - 휴대폰(720px 이하)과 손가락 기기는 44px */
const TAP = 'max-[720px]:h-11 [@media(pointer:coarse)]:h-11';
const TAP_SQ = 'max-[720px]:h-11 max-[720px]:w-11 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

/* ── 그래프 ── */

export default function WikiObsidian({ docs, allDocs, tasks, categories, activeId, storageKey, onOpenDoc, onOpenTask, api }: {
  /** 고른 카테고리 안의 문서(전체면 모두) */
  docs: Doc[];
  /** 살아 있는 모든 문서 - path: 를 만들 때 위 문서를 찾는다 */
  allDocs: Doc[];
  tasks: Task[];
  /** 카테고리(맨 위 문서) 제목 - '카테고리마다 그룹' 단추 */
  categories: string[];
  activeId: string | null;
  /** 설정을 남길 자리(사람마다) */
  storageKey: string;
  onOpenDoc(id: string): void;
  onOpenTask(key: string): void;
  api: MutableRefObject<CanvasApi | null>;
}) {
  const [s, setS] = useState<Settings>(() => {
    try {
      const raw = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as Partial<Settings>;
      return { ...DEFAULTS, ...raw, open: { ...DEFAULTS.open, ...(raw.open ?? {}) }, groups: Array.isArray(raw.groups) ? raw.groups : [] };
    } catch { return DEFAULTS; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(s)); } catch { /* 저장이 막힌 환경 */ }
  }, [s, storageKey]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  /** 로컬 그래프의 가운데 - 처음에는 지금 연 문서, 오른쪽 메뉴로 바꿀 수 있다 */
  const [localId, setLocalId] = useState<string | null>(activeId);
  const [menu, setMenu] = useState<{ x: number; y: number; node: ONode } | null>(null);
  const [anim, setAnim] = useState(false);

  const allById = useMemo(() => new Map(allDocs.map((d) => [d.id, d])), [allDocs]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraph<ONode, OLink> | null>(null);
  const centerRef = useRef(centerPull());
  const sRef = useRef(s);
  sRef.current = s;
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const localRef = useRef(localId);
  localRef.current = localId;
  /** 마우스 올리기가 없는 기기 - 누르면 열지 않고 선택만 한다 */
  const noHover = useMediaQuery('(hover: none)');
  const touchRef = useRef(noHover);
  touchRef.current = noHover;
  /** 손가락으로 고른 노트 - 다음 선택이나 빈 곳을 누를 때까지 남는다 */
  const [sel, setSel] = useState<ONode | null>(null);
  const selRef = useRef<string | null>(null);
  /** 판을 만든 결과 - 남은 문서 수(-1 = 아직), 로컬 그래프 상태 */
  const [info, setInfo] = useState<{ docs: number; local: LocalState }>({ docs: -1, local: 'off' });
  const handlers = useRef({ onOpenDoc, onOpenTask });
  handlers.current = { onOpenDoc, onOpenTask };
  /** 마우스를 올린 노트와 그 연결 */
  const hover = useRef<{ id: string | null; nodes: Set<string>; links: Set<OLink> }>({ id: null, nodes: new Set(), links: new Set() });
  /** 애니메이션 재생 중 - 이 시각까지 만든 노트만 보인다 */
  const until = useRef(Number.POSITIVE_INFINITY);
  /** 화면에 맞출 차례 - 카테고리 · 검색 · 로컬 그래프가 바뀌었을 때만(팀원이 문서를 고친 것으로는 흔들지 않는다) */
  const needFit = useRef(true);
  const lastFitKey = useRef('');
  const scopeKey = useMemo(() => docs.map((d) => d.id).sort().join(','), [docs]);

  const radius = (n: ONode) => (2.2 + Math.sqrt(n.weight) * 2.4) * sRef.current.nodeSize;
  const redraw = useCallback(() => {
    const fg = fgRef.current;
    if (fg) fg.nodeVal(fg.nodeVal()).linkWidth(fg.linkWidth());
  }, []);
  /** 마우스를 올린 노트(손가락이면 고른 노트)와 그 연결만 밝힌다 */
  const highlight = useCallback((id: string | null) => {
    const fg = fgRef.current;
    const ns = new Set<string>();
    const ls = new Set<OLink>();
    if (fg && id) {
      ns.add(id);
      fg.graphData().links.forEach((l) => {
        const [a, b] = ends(l);
        if (a === id || b === id) { ls.add(l); ns.add(a); ns.add(b); }
      });
    }
    hover.current = { id, nodes: ns, links: ls };
    fg?.linkColor(fg.linkColor()).linkWidth(fg.linkWidth());
  }, []);
  const select = useCallback((n: ONode | null) => {
    selRef.current = n?.id ?? null;
    setSel(n);
    highlight(n?.id ?? null);
  }, [highlight]);

  /* ── 엔진 ── */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const fg = new ForceGraph<ONode, OLink>(el);
    fgRef.current = fg;
    /** 화면에 맞춘다 - 노트가 몇 개 안 되면 너무 크게 당겨지므로 2.4배에서 멈춘다 */
    const fit = () => {
      fg.zoomToFit(500, 50);
      window.setTimeout(() => { if (fgRef.current === fg && fg.zoom() > 2.4) fg.zoom(2.4, 250); }, 520);
    };

    fg.backgroundColor(C.bg)
      .width(el.clientWidth)
      .height(el.clientHeight)
      .nodeId('id')
      .nodeRelSize(1)
      // force-graph 가 화살표 · 누르는 자리를 원 반지름(√val)으로 잡으므로 그리는 원과 같게
      .nodeVal((n) => radius(n) ** 2)
      .nodeLabel(() => '')
      .nodeVisibility((n) => n.created <= until.current)
      .linkVisibility((l) => {
        const [a, b] = [l.source, l.target];
        return typeof a !== 'object' || typeof b !== 'object' || (a.created <= until.current && b.created <= until.current);
      })
      .nodeCanvasObjectMode(() => 'replace')
      .nodeCanvasObject((n, ctx, k) => {
        const st = sRef.current;
        const h = hover.current;
        const r = radius(n);
        const lit = !h.id || h.nodes.has(n.id);
        const fill = n.id === h.id ? C.focus : fillOf(n);
        ctx.globalAlpha = lit ? 1 : 0.2;
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        if ((n.docId && n.docId === activeRef.current) || (st.local && n.id === localRef.current)) {
          // 지금 연 문서 · 로컬 그래프의 중심
          ctx.lineWidth = 1.5 / k;
          ctx.strokeStyle = C.accent;
          ctx.stroke();
        }
        // 텍스트 표시 시작점 - 이만큼 확대해야 이름이 나타난다(마우스를 올린 노트와 이웃은 늘).
        // 글자는 화면에서 늘 13px(확대해도 커지지 않는다). 올리거나 고른 노트는 onRenderFramePost 가 맨 위에 쓴다
        const k0 = 1.3 * 2 ** -st.textFade;
        let a = clamp((k - k0 * 0.75) / (k0 * 0.5), 0, 1);
        if (h.id) a = h.nodes.has(n.id) ? 1 : a * 0.2;
        if (a > 0.02 && n.id !== h.id) {
          const fs = 13 / k;
          const name = n.name.length > 30 ? `${n.name.slice(0, 29)}…` : n.name;
          ctx.globalAlpha = a;
          ctx.font = `500 ${fs}px ${FONT}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = C.text;
          ctx.fillText(name, n.x ?? 0, (n.y ?? 0) + r + 2 / k);
        }
        ctx.globalAlpha = 1;
      })
      .nodePointerAreaPaint((n, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, radius(n) + 2, 0, Math.PI * 2);
        ctx.fill();
      })
      .linkColor((l) => {
        const h = hover.current;
        if (!h.id) return C.line;
        return h.links.has(l) ? C.accent : C.lineFaint;
      })
      .linkWidth((l) => sRef.current.linkThickness * (hover.current.links.has(l) ? 1.6 : 1))
      .linkDirectionalArrowLength((l) => (sRef.current.arrows && l.kind === 'link' ? 3.6 * Math.max(0.6, sRef.current.linkThickness) : 0))
      .linkDirectionalArrowRelPos(1)
      .linkDirectionalArrowColor((l) => (hover.current.links.has(l) ? C.accent : '#6b6b6b'))
      .d3AlphaDecay(0.02)
      .d3VelocityDecay(0.35)
      .cooldownTime(12000)
      .minZoom(0.1)
      .maxZoom(12)
      .d3Force('center', centerRef.current)
      // 올리거나 고른 노트의 이름 - 다른 이름 위에 16px 로, 줄을 나눠 다 쓴다(화면 밖으로 나가지 않게 좌우를 맞춘다)
      .onRenderFramePost((ctx, k) => {
        const h = hover.current;
        if (!h.id) return;
        const n = fg.graphData().nodes.find((m) => m.id === h.id);
        if (!n || n.x === undefined || n.y === undefined || n.created > until.current) return;
        const fs = 16 / k;
        ctx.font = `600 ${fs}px ${FONT}`;
        const lines = wrapText(ctx, n.name, 260 / k);
        if (!lines.length) return;
        const lh = fs * 1.3;
        const w = Math.max(...lines.map((ln) => ctx.measureText(ln).width)) + 12 / k;
        const left = fg.screen2GraphCoords(0, 0).x;
        const right = fg.screen2GraphCoords(el.clientWidth, 0).x;
        const x = clamp(n.x, left + w / 2 + 4 / k, Math.max(left + w / 2 + 4 / k, right - w / 2 - 4 / k));
        const y = n.y + radius(n) + 3 / k;
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(30, 30, 30, 0.88)';
        ctx.beginPath();
        // roundRect 가 없는 옛 브라우저는 네모로
        if (typeof ctx.roundRect === 'function') ctx.roundRect(x - w / 2, y, w, lines.length * lh + 6 / k, 4 / k);
        else ctx.rect(x - w / 2, y, w, lines.length * lh + 6 / k);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        lines.forEach((ln, i) => ctx.fillText(ln, x, y + 3 / k + i * lh + (lh - fs) / 2));
      })
      .onNodeHover((n) => {
        el.style.cursor = n ? 'pointer' : '';
        // 손가락 기기는 고른 노트만 밝힌다(끌다가 지나간 노트로 바뀌지 않게)
        if (!touchRef.current) highlight(n?.id ?? null);
      })
      .onNodeClick((n) => {
        setMenu(null);
        // 손가락 - 누르면 선택만(아래 칸의 열기 단추로 연다)
        if (touchRef.current) { select(n); return; }
        if (n.kind === 'doc' && n.docId) handlers.current.onOpenDoc(n.docId);
        else if (n.kind === 'task' && n.taskKey) handlers.current.onOpenTask(n.taskKey);
        else if (n.kind === 'tag') setS((p) => ({ ...p, search: `tag:${n.name}`, panel: true, open: { ...p.open, filters: true } }));
      })
      .onNodeRightClick((n, ev) => {
        const r = el.getBoundingClientRect();
        setMenu({ x: ev.clientX - r.left, y: ev.clientY - r.top, node: n });
      })
      .onBackgroundClick(() => { setMenu(null); if (selRef.current) select(null); })
      .onBackgroundRightClick(() => setMenu(null))
      .onEngineStop(() => {
        if (needFit.current) { needFit.current = false; fit(); }
      });

    api.current = {
      zoomIn: () => fg.zoom(fg.zoom() * 1.3, 250),
      zoomOut: () => fg.zoom(fg.zoom() / 1.3, 250),
      fit,
    };
    const ro = new ResizeObserver(() => { fg.width(el.clientWidth).height(el.clientHeight); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      api.current = null;
      fg.pauseAnimation();
      fg._destructor();
      fgRef.current = null;
      el.replaceChildren();
    };
    // 엔진은 한 번만 만든다 - 바뀌는 값은 ref 로 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  /* ── 판 - 문서 · 필터 · 그룹이 바뀌면 다시(같은 노트는 자리를 이어받는다) ── */
  const filterKey = JSON.stringify([s.search, s.tags, s.attachments, s.orphans, s.hierarchy, s.local, s.depth, s.groups, localId]);
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const prev = new Map(fg.graphData().nodes.map((n) => [n.id, n]));
    const data = build(docs, allById, tasks, sRef.current, localId, prev);
    fg.graphData({ nodes: data.nodes, links: data.links });
    setInfo({ docs: data.docs, local: data.local });
    // 고른 노트가 새 판에도 있으면 그대로 밝히고, 없으면 선택을 푼다
    const keepSel = selRef.current ? data.nodes.find((n) => n.id === selRef.current) ?? null : null;
    if (selRef.current) select(keepSel);
    else highlight(null);
    const fitKey = JSON.stringify([scopeKey, sRef.current.search, sRef.current.local, sRef.current.depth, localId]);
    if (fitKey !== lastFitKey.current) { lastFitKey.current = fitKey; needFit.current = true; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, allById, tasks, filterKey]);

  /* ── 고른 노트가 화면 밖(아래 칸이 생기며 줄어든 자리)이면 가운데로 ── */
  const selId = sel?.id ?? null;
  useEffect(() => {
    const fg = fgRef.current;
    const el = hostRef.current;
    if (!selId || !fg || !el) return;
    const id = requestAnimationFrame(() => {
      const n = fg.graphData().nodes.find((m) => m.id === selId);
      if (!n || n.x === undefined || n.y === undefined) return;
      const p = fg.graph2ScreenCoords(n.x, n.y);
      const m = 28;
      if (p.x < m || p.y < m || p.x > el.clientWidth - m || p.y > el.clientHeight - m) fg.centerAt(n.x, n.y, 300);
    });
    return () => cancelAnimationFrame(id);
  }, [selId]);

  /* ── 포스 ── */
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    (fg.d3Force('charge') as { strength?: (v: number) => unknown } | undefined)?.strength?.(-s.repel * 12);
    const link = fg.d3Force('link') as { distance?: (v: number) => unknown; strength?: (v: number) => unknown } | undefined;
    link?.distance?.(s.linkDistance * 0.22);
    link?.strength?.(s.linkForce);
    centerRef.current.strength(s.center * 0.12);
    fg.d3ReheatSimulation();
  }, [s.repel, s.linkDistance, s.linkForce, s.center]);

  /* ── 표시 - 다시 그리기만 ── */
  useEffect(() => { redraw(); }, [s.arrows, s.textFade, s.nodeSize, s.linkThickness, activeId, redraw]);

  /* ── 애니메이션 재생 - 만든 순서대로 노트가 나타난다(옵시디언의 타임랩스) ── */
  const animRef = useRef(0);
  const play = () => {
    const fg = fgRef.current;
    if (!fg) return;
    const times = fg.graphData().nodes.map((n) => n.created).filter((t) => t > 0).sort((a, b) => a - b);
    if (!times.length) return;
    const from = times[0];
    const to = times[times.length - 1];
    const dur = 6000;
    const t0 = performance.now();
    cancelAnimationFrame(animRef.current);
    setAnim(true);
    fg.d3ReheatSimulation();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      until.current = t >= 1 ? Number.POSITIVE_INFINITY : from + (to - from) * t;
      fg.nodeVisibility(fg.nodeVisibility()).linkVisibility(fg.linkVisibility());
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else setAnim(false);
    };
    until.current = from - 1;
    animRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  /* ── 키보드 - 방향키로 이동(Shift 는 빠르게), +/- 확대, 0 맞춤 ── */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const fg = fgRef.current;
    if (!fg || (e.target as HTMLElement).closest('[data-panel]')) return;
    const k = fg.zoom();
    const step = (e.shiftKey ? 240 : 70) / k;
    const c = fg.centerAt();
    const move: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (move[e.key]) {
      e.preventDefault();
      fg.centerAt(c.x + move[e.key][0] * step, c.y + move[e.key][1] * step, 160);
    } else if (e.key === '+' || e.key === '=') { e.preventDefault(); fg.zoom(k * 1.25, 160); }
    else if (e.key === '-') { e.preventDefault(); fg.zoom(k / 1.25, 160); }
    else if (e.key === '0') { e.preventDefault(); api.current?.fit(); }
    else if (e.key === 'Escape') { setMenu(null); if (selRef.current) select(null); }
  };

  const addGroup = (query = '', color?: string) =>
    set('groups', [...s.groups, { query, color: color ?? GROUP_COLORS[s.groups.length % GROUP_COLORS.length] }]);

  /* ── 걸린 조건 · 알림 ── */
  const q = s.search.trim();
  const centerDoc = localId ? allById.get(localId) : undefined;
  const conds: { key: string; text: string; clearLabel: string; clear(): void }[] = [];
  if (q) conds.push({ key: 'search', text: `검색: ${q} · 문서 ${Math.max(0, info.docs)}개`, clearLabel: '검색 지우기', clear: () => set('search', '') });
  if (s.local) {
    conds.push({
      key: 'local', text: `로컬 그래프 · 깊이 ${s.depth}${centerDoc ? ` · ${titleOf(centerDoc)}` : ''}`,
      clearLabel: '로컬 그래프 끄기', clear: () => set('local', false),
    });
  }
  if (!s.orphans) conds.push({ key: 'orphans', text: '미연결 노트 숨김', clearLabel: '미연결 노트 보이기', clear: () => set('orphans', true) });
  const localOff = { label: '로컬 그래프 끄기', run: () => set('local', false) };
  const notice: { text: string; actions: { label: string; run(): void }[] } | null =
    info.local === 'searched' ? { text: '중심 문서가 검색 결과에 없습니다', actions: [{ label: '검색 지우기', run: () => set('search', '') }, localOff] }
      : info.local === 'outside' ? { text: `로컬 그래프의 중심 문서(${centerDoc ? titleOf(centerDoc) : ''})가 이 카테고리에 없습니다`, actions: [localOff] }
        : info.local === 'none' ? { text: '로컬 그래프의 중심 문서가 없습니다(지워졌거나 아직 고르지 않았습니다)', actions: [localOff] }
          : info.docs === 0 && conds.length > 0
            ? { text: '조건에 맞는 문서가 없습니다', actions: [{ label: '필터 초기화', run: () => setS((p) => ({ ...p, search: '', local: false, orphans: true })) }] }
            : null;

  /** 어두운 바탕의 단추 - 첫째(진한 보라, 흰 글자 5.2:1) · 테두리 · 네모 */
  const btnMain = `inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md px-3 text-[13.5px] font-bold text-white ${TAP}`;
  const btnLine = `inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border px-3 text-[13.5px] font-semibold hover:bg-white/10 aria-pressed:border-[#8a6cef] ${TAP}`;
  const btnSq = `grid h-9 w-9 flex-none place-items-center rounded-md hover:bg-white/10 ${TAP_SQ}`;
  const MAIN = '#7253e0';
  const xIcon = (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
  );

  return (
    <div ref={wrapRef} className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: C.bg }}>
      {/* 걸린 조건 - 검색 · 로컬 그래프 · 미연결 노트 숨김이 있을 때만. 지도 위가 아니라 따로 한 줄(노드를 가리지 않게) */}
      {conds.length > 0 && (
        <div role="status" className="relative z-10 flex flex-none flex-wrap items-center gap-1.5 border-b px-2 py-1.5"
          style={{ background: C.panel, borderColor: C.border }}>
          {conds.map((c) => (
            <span key={c.key} className="inline-flex min-w-0 max-w-full items-center gap-0.5 rounded-full border pl-3 text-[13px] font-semibold"
              style={{ borderColor: C.border, color: C.text }}>
              <span className="min-w-0 truncate">{c.text}</span>
              <button type="button" onClick={c.clear} aria-label={c.clearLabel} title={c.clearLabel}
                className={`grid h-7 w-7 flex-none place-items-center rounded-full hover:bg-white/10 ${TAP_SQ}`} style={{ color: C.muted }}>
                {xIcon}
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0" tabIndex={0} onKeyDown={onKeyDown}
          role="application" aria-roledescription="그래프"
          aria-label={noHover
            ? '팀 위키 그래프. 노트를 누르면 선택되고, 아래 칸의 열기 단추로 엽니다'
            : '팀 위키 그래프(옵시디언 그래프 보기와 같은 조작). 노트를 누르면 열립니다. 방향키로 이동, +와 -로 확대'}
          onContextMenu={(e) => e.preventDefault()}>
          <div ref={hostRef} className="h-full w-full" />
        </div>

        {/* 조건 때문에 빈 판 - 조용히 전체로 돌아가지 않고 무엇을 하면 되는지 */}
        {notice && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center p-4">
            <div className="pointer-events-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border px-5 py-4 text-center shadow-tm-up"
              style={{ background: C.panel, borderColor: C.border }}>
              <p className="text-[14.5px] font-semibold leading-[1.55] [overflow-wrap:anywhere]" style={{ color: C.text }}>{notice.text}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {notice.actions.map((a, i) => (
                  <button key={a.label} type="button" onClick={a.run}
                    className={i === 0 ? btnMain : btnLine}
                    style={i === 0 ? { background: MAIN } : { borderColor: C.border, color: C.text }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 설정 칸 열기 - 옵시디언처럼 오른쪽 위 톱니바퀴 */}
        {!s.panel && (
          <button type="button" onClick={() => set('panel', true)} aria-label="그래프 설정 열기" title="그래프 설정"
            className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-md transition-colors hover:bg-white/10 ${TAP_SQ}`}
            style={{ color: C.muted }}>
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* 설정 칸 - 필터 · 그룹 · 표시 · 포스. PC 는 오른쪽 위 272px, 휴대폰은 지도 아래쪽에 붙여 지도 높이의 60% 까지 */}
        {s.panel && (
          <div data-panel role="region" aria-label="그래프 설정"
            className="absolute right-2 top-2 z-10 flex max-h-[calc(100%-16px)] w-[272px] flex-col overflow-hidden rounded-lg border shadow-tm-up
                       max-[720px]:inset-x-0 max-[720px]:bottom-0 max-[720px]:top-auto max-[720px]:max-h-[60%] max-[720px]:w-auto
                       max-[720px]:rounded-b-none max-[720px]:border-x-0 max-[720px]:border-b-0"
            style={{ background: C.panel, borderColor: C.border }}>
            <div className="flex flex-none items-center gap-1 border-b px-1.5 py-1" style={{ borderColor: C.border }}>
              <p className="min-w-0 flex-1 truncate px-1.5 text-[13.5px] font-bold" style={{ color: C.text }}>그래프 설정</p>
              <button type="button" onClick={() => setS({ ...DEFAULTS, panel: true, groups: s.groups })} title="기본 설정으로(그룹은 남긴다)" aria-label="기본 설정으로"
                className={`grid h-8 w-8 place-items-center rounded-md hover:bg-white/10 ${TAP_SQ}`} style={{ color: C.muted }}>
                <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 10a6.5 6.5 0 1 0 2-4.7M3.5 3.5v3h3" />
                </svg>
              </button>
              <button type="button" onClick={() => set('panel', false)} aria-label="그래프 설정 닫기"
                className={`grid h-8 w-8 place-items-center rounded-md hover:bg-white/10 ${TAP_SQ}`} style={{ color: C.muted }}>
                <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">
              <Section title="필터" open={s.open.filters} onToggle={() => set('open', { ...s.open, filters: !s.open.filters })}>
                <input type="search" value={s.search} onChange={(e) => set('search', e.target.value)} placeholder="파일 검색…"
                  aria-label="파일 검색 - path: · tag: · file: · 앞에 - 는 빼기"
                  className={`h-8 w-full rounded-md border px-2.5 text-[13px] outline-none focus:border-[#8a6cef] ${TAP} max-[720px]:text-[16px] [@media(pointer:coarse)]:text-[16px]`}
                  style={{ background: C.input, borderColor: C.border, color: C.text }} />
                <Switch label="태그" checked={s.tags} onChange={(v) => set('tags', v)} hint="라벨(#)을 노드로" />
                <Switch label="첨부 파일(작업)" checked={s.attachments} onChange={(v) => set('attachments', v)} hint="본문에 적은 작업 번호를 노드로" />
                <Switch label="미연결 노트" checked={s.orphans} onChange={(v) => set('orphans', v)} hint="선이 하나도 없는 노트도 보이기" />
                <Switch label="위아래 문서 잇기" checked={s.hierarchy} onChange={(v) => set('hierarchy', v)}
                  hint="옵시디언에는 없는 MATE 설정 - 끄면 옵시디언처럼 문서 링크만 선이 됩니다" />
                <Switch label="로컬 그래프" checked={s.local} onChange={(v) => set('local', v)}
                  hint="중심 노트(지금 연 문서 · 오른쪽 메뉴나 선택 칸에서 고른 노트)에서 깊이만큼만" />
                {s.local && <Slider label="깊이" value={s.depth} min={1} max={5} step={1} onChange={(v) => set('depth', v)} />}
              </Section>
              <Section title="그룹" open={s.open.groups} onToggle={() => set('open', { ...s.open, groups: !s.open.groups })}>
                {s.groups.map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input type="color" value={g.color} aria-label={`그룹 ${i + 1} 색`}
                      onChange={(e) => set('groups', s.groups.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))}
                      className={`h-7 w-7 flex-none cursor-pointer rounded-full border-0 bg-transparent p-0 ${TAP_SQ}`} />
                    <input value={g.query} placeholder="검색어 - path:프로젝트" aria-label={`그룹 ${i + 1} 검색어`}
                      onChange={(e) => set('groups', s.groups.map((x, j) => (j === i ? { ...x, query: e.target.value } : x)))}
                      className={`h-8 min-w-0 flex-1 rounded-md border px-2 text-[13px] outline-none focus:border-[#8a6cef] ${TAP} max-[720px]:text-[16px] [@media(pointer:coarse)]:text-[16px]`}
                      style={{ background: C.input, borderColor: C.border, color: C.text }} />
                    <button type="button" onClick={() => set('groups', s.groups.filter((_, j) => j !== i))} aria-label={`그룹 ${i + 1} 지우기`}
                      className={`grid h-8 w-8 flex-none place-items-center rounded-md hover:bg-white/10 ${TAP_SQ}`} style={{ color: C.muted }}>
                      <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => addGroup()}
                    className={`h-8 rounded-md px-3 text-[13px] font-semibold text-white ${TAP}`} style={{ background: C.accent }}>
                    새 그룹
                  </button>
                  {categories.length > 0 && (
                    <button type="button" title="카테고리(맨 위 문서)마다 path: 그룹을 만듭니다"
                      onClick={() => set('groups', [
                        ...s.groups,
                        ...categories.filter((c) => !s.groups.some((g) => g.query === `path:${c}`))
                          .map((c, i) => ({ query: `path:${c}`, color: GROUP_COLORS[(s.groups.length + i) % GROUP_COLORS.length] })),
                      ])}
                      className={`h-8 rounded-md border px-3 text-[13px] font-semibold ${TAP}`} style={{ borderColor: C.border, color: C.text }}>
                      카테고리마다
                    </button>
                  )}
                </div>
              </Section>
              <Section title="표시" open={s.open.display} onToggle={() => set('open', { ...s.open, display: !s.open.display })}>
                <Switch label="화살표" checked={s.arrows} onChange={(v) => set('arrows', v)} hint="문서 링크의 방향" />
                <Slider label="텍스트 표시 시작점" value={s.textFade} min={-3} max={3} step={0.1} onChange={(v) => set('textFade', v)} />
                <Slider label="노드 크기" value={s.nodeSize} min={0.1} max={5} step={0.05} onChange={(v) => set('nodeSize', v)} />
                <Slider label="링크 두께" value={s.linkThickness} min={0.1} max={5} step={0.05} onChange={(v) => set('linkThickness', v)} />
                <button type="button" onClick={play} disabled={anim}
                  className={`h-8 rounded-md px-3 text-[13px] font-semibold text-white disabled:opacity-60 ${TAP}`} style={{ background: C.accent }}>
                  {anim ? '재생 중…' : '애니메이션 재생'}
                </button>
              </Section>
              <Section title="포스" open={s.open.forces} onToggle={() => set('open', { ...s.open, forces: !s.open.forces })}>
                <Slider label="중심 장력" value={s.center} min={0} max={1} step={0.01} onChange={(v) => set('center', v)} />
                <Slider label="반발력" value={s.repel} min={0} max={20} step={0.1} onChange={(v) => set('repel', v)} />
                <Slider label="링크 장력" value={s.linkForce} min={0} max={1} step={0.01} onChange={(v) => set('linkForce', v)} />
                <Slider label="링크 거리" value={s.linkDistance} min={30} max={500} step={1} onChange={(v) => set('linkDistance', v)} />
              </Section>
            </div>
          </div>
        )}

        {/* 오른쪽 누르기 메뉴 */}
        {menu && (
          <div role="menu" className="absolute z-20 min-w-[180px] overflow-hidden rounded-md border py-1 shadow-tm-up"
            style={{ left: Math.min(menu.x, (wrapRef.current?.clientWidth ?? 400) - 190), top: menu.y, background: C.panel, borderColor: C.border }}>
            <p className="truncate px-3 py-1.5 text-[12px] font-semibold" style={{ color: C.muted }}>{menu.node.name}</p>
            {(menu.node.docId || menu.node.taskKey) && (
              <button type="button" role="menuitem"
                onClick={() => { setMenu(null); if (menu.node.docId) handlers.current.onOpenDoc(menu.node.docId); else if (menu.node.taskKey) handlers.current.onOpenTask(menu.node.taskKey); }}
                className="block w-full px-3 py-1.5 text-left text-[13px] hover:bg-white/10 [@media(pointer:coarse)]:py-2.5" style={{ color: C.text }}>
                {menu.node.kind === 'task' ? '작업 열기' : '열기'}
              </button>
            )}
            {menu.node.kind === 'doc' && (
              <button type="button" role="menuitem"
                onClick={() => { setLocalId(menu.node.id); setS((p) => ({ ...p, local: true, panel: true, open: { ...p.open, filters: true } })); setMenu(null); }}
                className="block w-full px-3 py-1.5 text-left text-[13px] hover:bg-white/10 [@media(pointer:coarse)]:py-2.5" style={{ color: C.text }}>
                이 노트의 로컬 그래프
              </button>
            )}
          </div>
        )}
      </div>

      {/* 고른 노트(손가락 기기) - 지도 아래 따로 한 줄이라 노드를 가리지 않는다. 다음 선택 · 빈 곳 누르기 · 닫기까지 남는다 */}
      {sel && (
        <div className="relative z-10 flex flex-none flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t px-3 py-2"
          style={{ background: C.panel, borderColor: C.border }}>
          <span aria-hidden className="h-3 w-3 flex-none rounded-full" style={{ background: fillOf(sel) }} />
          <p className="min-w-0 flex-[1_1_150px] text-[14px] font-semibold leading-[1.45] [overflow-wrap:anywhere]" style={{ color: C.text }} aria-live="polite">
            {sel.name}
          </p>
          <div className="ml-auto flex flex-none items-center gap-1.5">
            {sel.kind === 'doc' && sel.docId && (
              <>
                <button type="button" aria-pressed={s.local && localId === sel.id}
                  onClick={() => { setLocalId(sel.id); set('local', true); }}
                  className={btnLine} style={{ borderColor: C.border, color: C.text }}>
                  로컬 그래프
                </button>
                <button type="button" onClick={() => { if (sel.docId) handlers.current.onOpenDoc(sel.docId); }}
                  className={btnMain} style={{ background: MAIN }}>
                  문서 열기
                </button>
              </>
            )}
            {sel.kind === 'task' && sel.taskKey && (
              <button type="button" onClick={() => { if (sel.taskKey) handlers.current.onOpenTask(sel.taskKey); }}
                className={btnMain} style={{ background: MAIN }}>
                작업 열기
              </button>
            )}
            {sel.kind === 'tag' && (
              <button type="button" onClick={() => set('search', `tag:${sel.name}`)} className={btnMain} style={{ background: MAIN }}>
                이 태그로 찾기
              </button>
            )}
            <button type="button" onClick={() => select(null)} aria-label="선택 해제" title="선택 해제" className={btnSq} style={{ color: C.muted }}>
              {xIcon}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
