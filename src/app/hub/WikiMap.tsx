'use client';

/**
 * 팀 위키 마인드맵 - 네 가지 보기: 마인드맵(가지) · 3D 그래프 · 그래프(옵시디언 그래프 보기 그대로, WikiObsidian) ·
 * 프레젠테이션(Prezi 꼴, WikiPresent).
 *
 * 위키의 맨 위 문서(팀 위키 자체, WIKI_HOME_ID)가 가운데 1단이고, 그 바로 아래 문서가 카테고리다. 카테고리 하나를
 * 고르면 그 아래 문서를 가지로 펼치고, '전체'는 맨 위 문서를 가운데에 두고 카테고리를 모두 한 장에 둔다.
 * 마인드맵은 단계 단추(숫자 키)로 가운데부터 몇 단까지 펼칠지 한 번에 고른다.
 * 고른 카테고리 · 켠 것 · 보기 방식은 세 보기가 함께 쓴다. 3D 는 three.js 를 쓰므로 고를 때만 불러온다.
 * - 문서를 누르면 그 위키 문서가 열리고, 작업 잎을 누르면 작업 창이 열린다.
 * - 본문의 문서 링크([제목](doc:id))는 점선 화살표로 잇는다 - 프로젝트 문서와 개발자 문서를 잇는 자리.
 * - 본문에 적은 작업 번호(MATE-123)는 그 문서의 잎으로 붙는다. 제목이 팀원 이름과 같은 문서에는 그 사람이 맡은 작업 수를 적는다.
 *
 * 엔진은 Mind Elixir(MIT) - 2026-11 오픈소스 마인드맵 비교에서 골랐다(편집형 마인드맵 코어 중 가장 활발하고,
 * 노드 사이 화살표 · 터치 확대 · 보기 전용 모드를 갖췄다). 여기서는 보기 전용(editable: false)으로만 쓰고,
 * 위아래 버튼 · 키보드 · 고르기 막대는 이 파일이 따로 그린다.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import MindElixir from 'mind-elixir';
import type { MindElixirData, NodeObj, Operation, SubLineParams, Theme, Topic } from 'mind-elixir';
import 'mind-elixir/style.css';
import './wikimap.css';
import { TASK_COLORS, statusLabel, type Doc, type Member, type Task } from './types';
import { WIKI_HOME_ID, WIKI_HOME_TITLE } from './docStore';
import { buildTree, type TreeNode } from './DocTree';
import { titleOf } from './DocPanels';
import { docLinkIds } from './docMarkdown';
import { useMembers } from './members';
import { usePainter, type Painter } from './colorStore';
import { IconNav, IconPlus, PAINT, tmCount, tmGhostBtn, tmIconBtn, tmTab, useMediaQuery } from './ui';
import { ALL, MENTION_RE, STATUS_DOT, TASK_RE, buildGraph, type CanvasApi } from './wikiGraph';
import WikiPresent from './WikiPresent';

/** 노드에 붙여 두는 값 - 누르면 무엇을 열지 */
type Meta =
  | { kind: 'all' }
  | { kind: 'doc'; id: string }
  | { kind: 'task'; key: string }
  | { kind: 'more'; id: string };

/** 문서 사이 화살표(엔진은 이 꼴을 따로 내보내지 않는다) */
type Arrow = NonNullable<MindElixirData<Meta>['arrows']>[number];
/** 한 문서에 잎으로 붙이는 작업 수 - 넘치면 '+N건'으로 줄인다 */
const TASKS_PER_DOC = 6;
/** 문서가 이보다 많으면 단계를 고르지 않았을 때 3단까지만 펼친다(넷째 단부터 접어 둔다) */
const FOLD_OVER = 60;
/** 많은 지도의 기본 단계 */
const BIG_LEVEL = 3;
/** 처음 열 때 이보다 작게는 줄이지 않는다(글자를 읽을 수 있는 크기) - 넘치면 밀어서 본다. '맞춤'은 다 보이게 끝까지 줄인다 */
const MIN_FIT = 0.75;
/** 노드 사이 가로 틈 - 테마의 --node-gap-x 와 같다(잔가지 선이 노드 상자 가장자리에서 시작하게) */
const GAP_X = 26;

/**
 * 잔가지 선 - 엔진 기본은 노드 밑줄을 따라 긋는다(글자 노드용). 여기 노드는 상자라서
 * 부모 상자 옆 가운데에서 자식 상자 옆 가운데로 부드럽게 잇는다(XMind 꼴)
 */
function subBranch({ pT, pL, pW, pH, cT, cL, cW, cH, direction }: SubLineParams): string {
  const y1 = pT + pH / 2;
  const y2 = cT + cH / 2;
  const [x1, x2] = direction === 'lhs' ? [pL + GAP_X, cL + cW - GAP_X] : [pL + pW - GAP_X, cL + GAP_X];
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}

/** 가지 색 - 사람 · 라벨 색과 같은 여덟 색(빨강 · 호박 · 초록은 급함 · 임박 · 끝남의 뜻이라 뺐다) */
const PALETTE = TASK_COLORS.map((c) => PAINT[c.id].solid);

const THEME: Theme = {
  name: 'MATE',
  type: 'light',
  palette: PALETTE,
  // 엔진은 테마를 입힐 때 선 그리는 함수도 테마 것으로 바꾼다 - 옵션이 아니라 여기에 둔다
  generateSubBranch: subBranch,
  cssVar: {
    '--node-gap-x': `${GAP_X}px`,
    '--node-gap-y': '9px',
    '--main-gap-x': '54px',
    '--main-gap-y': '14px',
    '--main-color': '#1b2430',
    '--main-bgcolor': '#ffffff',
    '--main-bgcolor-transparent': 'rgba(255, 255, 255, 0.9)',
    '--color': '#1b2430',
    '--bgcolor': '#f4f6f9',
    '--selected': '#2644cb',
    '--accent-color': '#2644cb',
    '--root-color': '#ffffff',
    '--root-bgcolor': '#2644cb',
    '--root-border-color': '#2644cb',
    '--root-radius': '14px',
    '--main-radius': '12px',
    '--topic-padding': '7px 11px',
    '--panel-color': '#1b2430',
    '--panel-bgcolor': '#ffffff',
    '--panel-border-color': '#d7dce4',
    '--map-padding': '56px 72px',
  },
};


const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const countAll = (ns: TreeNode[]): number => ns.reduce((n, d) => n + 1 + countAll(d.children), 0);

/* ── 지도 만들기 ─────────────────────────────────────── */

interface BuildInput {
  /** 카테고리들(맨 위 문서 바로 아래 문서) */
  roots: TreeNode[];
  /** 맨 위 문서 - '전체'의 가운데. 아직 없으면 이름만 있는 가운데 */
  home: Doc | null;
  cat: string;
  tasksByKey: Map<string, Task>;
  tasks: Task[];
  members: Member[];
  paint: Painter;
  showTasks: boolean;
  showLinks: boolean;
  activeId: string | null;
  /** 사람이 펼치거나 접은 것(true = 펼침) - 단계 규칙보다 앞선다 */
  toggled: ReadonlyMap<string, boolean>;
  /**
   * 고른 단계(가운데 = 1단) - 숫자는 늘 'N단까지', 'all' 은 지금 가장 깊은 단까지(문서가 깊어지면 따라간다).
   * null 이면 고르지 않은 것 - 문서가 많을 때만 3단까지
   */
  level: Level | null;
}

interface Built {
  data: MindElixirData<Meta>;
  docs: number;
  links: number;
  /** 범위(가운데와 그 아래 모든 문서)에 연결된 작업 - 접힌 문서 · 잎으로 다 그리지 않은 작업도 넣고, 같은 작업은 한 번 */
  taskTotal: number;
  /** 그릴 가지가 없다(아래 문서도, 가운데에 붙는 작업 잎도 없음) - 큰 안내를 띄운다. 1단으로 감춘 것은 비지 않은 것 */
  empty: boolean;
  /** 이 지도의 가장 깊은 단(가운데 = 1단, 작업 잎도 센다) - 단계 단추를 이만큼 그린다 */
  maxLevel: number;
  /** 단계를 고르지 않았을 때 - 문서가 많으면 3단, 아니면 모두 */
  auto: Level;
}

/** 마인드맵 단계 - N단까지 · 모두 */
type Level = number | 'all';

function buildMap(x: BuildInput): Built {
  const catRoot = x.cat === ALL ? null : x.roots.find((r) => r.id === x.cat) ?? null;
  const top = catRoot ? catRoot.children : x.roots;
  const big = countAll(top) > FOLD_OVER;
  const auto: Level = big ? BIG_LEVEL : 'all';
  /** 이 단까지 보인다 - 단 = 가운데 1, 카테고리(또는 고른 카테고리의 아래 문서) 2, … */
  const chosen = x.level ?? auto;
  const upTo = chosen === 'all' ? Infinity : chosen;
  let maxLevel = 1;
  /** 범위의 연결 작업(작업 id) */
  const scopeTasks = new Set<string>();
  const byName = new Map(x.members.map((m) => [m.name.trim(), m]));
  const byId = new Map(x.members.map((m) => [m.id, m]));

  /** 화면에 그려지는 문서(위가 모두 펼쳐져 있다) - 화살표는 이것끼리만 잇는다 */
  const shown = new Map<string, TreeNode>();
  const parentOf = new Map<string, string>();

  const avatar = (m: Member) => {
    const p = PAINT[x.paint.member(m.id)];
    return `<i style="background:${p.tint};color:${p.solid}" title="${esc(m.name)}">${esc(m.initial)}</i>`;
  };

  /** 문서가 가리키는 작업 - 있는 작업만 */
  const tasksOf = (d: Doc) =>
    [...new Set([...d.body.matchAll(TASK_RE)].map((m) => m[0]))]
      .map((k) => x.tasksByKey.get(k))
      .filter((t): t is Task => !!t);

  /**
   * 문서 노드 안에 그릴 것 - 아이콘(없으면 가지 색 점) · 제목 · 한 줄 요약 · 언급한 사람.
   * 접힌 문서는 모든 깊이의 아래 문서 수를, 1단만 보일 때의 가운데는 바로 아래 수와 모든 깊이의 수를 함께 적는다
   */
  const docHtml = (d: TreeNode, color: string, opts: { folded: boolean; tasks: Task[]; root?: 'home' | 'cat' }) => {
    const meta: string[] = [];
    const person = byName.get(d.title.trim());
    if (person) {
      const open = x.tasks.filter((t) => t.assignee === person.id && t.status !== 'done');
      meta.push(`맡은 작업 ${open.length}건${open.some((t) => t.status === 'doing') ? ` · 진행 ${open.filter((t) => t.status === 'doing').length}` : ''}`);
    }
    if (opts.folded && d.children.length) {
      meta.push(opts.root
        ? `${opts.root === 'home' ? '카테고리' : '하위 문서'} ${d.children.length}개 · 전체 하위 문서 ${countAll(d.children)}개`
        : `전체 하위 문서 ${countAll(d.children)}개`);
    }
    if (!x.showTasks && opts.tasks.length) meta.push(`연결 작업 ${opts.tasks.length}개`);
    const people = [...new Set([...d.body.matchAll(MENTION_RE)].map((m) => m[1]))]
      .map((id) => byId.get(id))
      .filter((m): m is Member => !!m && m.id !== person?.id);
    const lead = person
      ? avatar(person)
      : d.icon ? `<span class="wm-ic">${esc(d.icon)}</span>` : opts.root ? '' : `<i class="wm-dot" style="background:${color}"></i>`;
    return `<span class="wm-n${opts.root ? ' wm-root' : ''}">`
      + `<span class="wm-t">${lead}<span class="wm-tt">${esc(titleOf(d))}</span></span>`
      + (meta.length ? `<span class="wm-m">${esc(meta.join(' · '))}</span>` : '')
      + (people.length ? `<span class="wm-p">${people.slice(0, 5).map(avatar).join('')}${people.length > 5 ? `<b>+${people.length - 5}</b>` : ''}</span>` : '')
      + '</span>';
  };

  const taskNode = (t: Task, under: string): NodeObj<Meta> => {
    return {
      id: `t-${t.id}-${under}`,
      topic: `${t.key} ${t.title}`,
      dangerouslySetInnerHTML:
        `<span class="wm-k" data-s="${t.status}"><i style="background:${STATUS_DOT[t.status]}"></i><b>${esc(t.key)}</b>`
        + `<span class="wm-kt">${esc(t.title)}</span></span>`,
      style: { background: '#ffffff', border: '1px solid #e3e7ee' },
      metadata: { kind: 'task', key: t.key },
    };
  };

  const leavesOf = (d: TreeNode, tasks: Task[]): NodeObj<Meta>[] => {
    if (!x.showTasks || tasks.length === 0) return [];
    const out = tasks.slice(0, TASKS_PER_DOC).map((t) => taskNode(t, d.id));
    if (tasks.length > TASKS_PER_DOC) {
      out.push({
        id: `more-${d.id}`,
        topic: `작업 ${tasks.length - TASKS_PER_DOC}건 더`,
        dangerouslySetInnerHTML: `<span class="wm-more">작업 ${tasks.length - TASKS_PER_DOC}건 더 · 문서에서 보기</span>`,
        style: { background: '#ffffff', border: '1px dashed #c3cad5' },
        metadata: { kind: 'more', id: d.id },
      });
    }
    return out;
  };

  const docNode = (d: TreeNode, depth: number, color: string, visible: boolean): NodeObj<Meta> => {
    const tasks = tasksOf(d);
    tasks.forEach((t) => scopeTasks.add(t.id));
    const leaves = leavesOf(d, tasks);
    // 이 문서는 depth + 1 단, 작업 잎은 그 아래 단
    maxLevel = Math.max(maxLevel, depth + (leaves.length ? 2 : 1));
    const foldable = d.children.length > 0 || leaves.length > 0;
    const expanded = foldable ? x.toggled.get(d.id) ?? depth + 1 < upTo : undefined;
    if (visible) shown.set(d.id, d);
    const kidsVisible = visible && expanded !== false;
    const children = [
      ...d.children.map((c) => { parentOf.set(c.id, d.id); return docNode(c, depth + 1, color, kidsVisible); }),
      ...leaves,
    ];
    const on = d.id === x.activeId;
    return {
      id: d.id,
      topic: titleOf(d),
      dangerouslySetInnerHTML: docHtml(d, color, { folded: expanded === false, tasks }),
      children,
      expanded,
      ...(depth === 1 ? { branchColor: color } : {}),
      style: on
        ? { background: '#eef2ff', border: '2px solid #2644cb' }
        : depth === 1 ? { border: `2px solid ${color}` } : {},
      metadata: { kind: 'doc', id: d.id },
    };
  };

  /** 가운데(1단) - 고른 카테고리. '전체'면 맨 위 문서(팀 위키 자체)이고 그 아래가 카테고리들 */
  const center: TreeNode | null = catRoot ?? (x.home ? { ...x.home, children: x.roots } : null);
  /** 1단만 - 엔진은 가운데를 접지 못하므로 가지를 빼고 그린다(가운데에 '하위 N'을 적는다) */
  const onlyCenter = upTo <= 1;

  const mainKids = top.map((d, i) => {
    parentOf.set(d.id, center?.id ?? ALL);
    return docNode(d, 1, PALETTE[i % PALETTE.length], !onlyCenter);
  });

  let nodeData: NodeObj<Meta>;
  /** 가운데에 붙는 작업 잎 - 아래 문서가 없어도 이것이 있으면 빈 지도가 아니다 */
  let centerLeaves = 0;
  if (center) {
    shown.set(center.id, center);
    const tasks = tasksOf(center);
    tasks.forEach((t) => scopeTasks.add(t.id));
    const leaves = leavesOf(center, tasks);
    centerLeaves = leaves.length;
    if (leaves.length) maxLevel = Math.max(maxLevel, 2);
    nodeData = {
      id: center.id,
      topic: titleOf(center),
      dangerouslySetInnerHTML: docHtml(center, PALETTE[0], { folded: onlyCenter, tasks, root: catRoot ? 'cat' : 'home' }),
      children: onlyCenter ? [] : [...mainKids, ...leaves],
      metadata: { kind: 'doc', id: center.id },
      ...(center.id === x.activeId ? { style: { border: '2px solid #18308f' } } : {}),
    };
  } else {
    // 맨 위 문서를 아직 만들지 못했다(목록을 읽는 중 · 만들기 실패) - 이름만 둔다
    const more = onlyCenter && top.length
      ? `<span class="wm-m">카테고리 ${top.length}개 · 전체 하위 문서 ${countAll(top)}개</span>` : '';
    nodeData = {
      id: ALL,
      topic: WIKI_HOME_TITLE,
      dangerouslySetInnerHTML: `<span class="wm-n wm-root"><span class="wm-t"><span class="wm-tt">${esc(WIKI_HOME_TITLE)}</span></span>${more}</span>`,
      children: onlyCenter ? [] : mainKids,
      metadata: { kind: 'all' },
    };
  }

  /* 문서 링크 - 위아래로 이미 이어진 짝(부모 · 자식)은 선을 또 긋지 않는다. 서로 걸었으면 양쪽 화살표 하나 */
  const arrows: Arrow[] = [];
  if (x.showLinks) {
    const pairs = new Map<string, Arrow>();
    shown.forEach((d) => {
      docLinkIds(d.body).forEach((to) => {
        if (to === d.id || !shown.has(to) || parentOf.get(to) === d.id || parentOf.get(d.id) === to) return;
        const key = [d.id, to].sort().join('|');
        const had = pairs.get(key);
        if (had) { if (had.from !== d.id) had.bidirectional = true; return; }
        pairs.set(key, {
          id: `ln-${pairs.size}`,
          label: '',
          from: d.id,
          to,
          style: { stroke: '#5b6676', strokeWidth: '1.6', strokeDasharray: '6 5', opacity: '0.85' },
        });
      });
    });
    arrows.push(...[...pairs.values()].slice(0, 80));
  }

  return {
    data: { nodeData, arrows, direction: MindElixir.SIDE },
    docs: shown.size,
    links: arrows.length,
    taskTotal: scopeTasks.size,
    empty: top.length === 0 && centerLeaves === 0,
    maxLevel,
    auto,
  };
}

/* ── 마인드맵(가지) 칸 - Mind Elixir ──────────────────── */

function ElixirCanvas({ data, fitKey, label, onToggle, onActivate, api, onZoom, onLevel }: {
  data: MindElixirData<Meta>;
  /** 고른 카테고리 · 단계 - 바뀌면 화면에 다시 맞춘다 */
  fitKey: string;
  label: string;
  /**
   * 사람이 노드를 펼치거나 접었다(펼치기 단추 · 키보드). 엔진이 다시 그리는 것(refresh)은 이 알림을 내지 않는다 -
   * 부르는 쪽이 다음에 지도를 새로 만들 때 쓰고 '직접 조정'을 표시한다
   */
  onToggle(id: string, expanded: boolean): void;
  onActivate(n: NodeObj<Meta> | undefined): void;
  api: MutableRefObject<CanvasApi | null>;
  onZoom(s: number): void;
  /** 숫자 키 1~9 - 그 단까지 펼친다 */
  onLevel(n: number): void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<MindElixir | null>(null);
  const [live, setLive] = useState('');
  const dataRef = useRef(data);
  dataRef.current = data;
  const zoomRef = useRef(onZoom);
  zoomRef.current = onZoom;
  const activateRef = useRef(onActivate);
  activateRef.current = onActivate;
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;

  /** 화면에 맞춘다 - readable 이면 글자를 읽을 수 있는 크기에서 멈추고 가운데를 보여 준다('맞춤' 단추는 끝까지 줄여 다 보이게) */
  const fit = useCallback((readable = true) => {
    const m = mindRef.current;
    if (!m) return;
    m.scaleFit();
    if (readable && m.scaleVal < MIN_FIT) m.scale(MIN_FIT);
    else if (m.scaleVal < 0.25) m.scale(0.25);
    zoomRef.current(m.scaleVal);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const mind = new MindElixir({
      el,
      direction: MindElixir.SIDE,
      editable: false,
      contextMenu: false,
      toolBar: false,
      keypress: false,
      allowUndo: false,
      alignment: 'nodes',
      theme: THEME,
      scaleMin: 0.25,
      scaleMax: 2,
    });
    mind.init(dataRef.current);
    mindRef.current = mind;
    const onOp = (op: Operation) => {
      if (op.name === 'expandNode' || op.name === 'collapseNode') toggleRef.current(op.target.id, op.name === 'expandNode');
    };
    const onScale = (v: number) => zoomRef.current(v);
    mind.bus.addListener('operation', onOp);
    mind.bus.addListener('scale', onScale);
    requestAnimationFrame(() => fit());
    api.current = {
      zoomIn: () => mind.scale(Math.min(2, mind.scaleVal + 0.15)),
      zoomOut: () => mind.scale(Math.max(0.25, mind.scaleVal - 0.15)),
      fit: () => fit(false),
    };

    /* 누르면 연다 - 끌어서 옮긴 것(6px 넘게 움직임)과 펼치기 단추는 빼고 */
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onClick = (e: MouseEvent) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const t = e.target as Element | null;
      if (!t || t.closest('.me-epd')) return;
      const tpc = t.closest('.me-tpc') as Topic<Meta> | null;
      if (tpc?.nodeObj) activateRef.current(tpc.nodeObj);
    };
    el.addEventListener('pointerdown', onDown, true);
    el.addEventListener('click', onClick);

    /* 문서 경로를 툴팁으로 - 마우스를 올리면 무엇이 열리는지 보인다 */
    const onDrawn = () => {
      el.querySelectorAll<Topic<Meta>>('.me-tpc').forEach((tpc) => {
        const meta = tpc.nodeObj?.metadata;
        tpc.title = meta?.kind === 'task' ? `${tpc.nodeObj.topic} · 누르면 작업이 열립니다`
          : meta?.kind === 'doc' ? `${tpc.nodeObj.topic} · 누르면 문서가 열립니다` : '';
      });
    };
    mind.bus.addListener('linkDiv', onDrawn);
    onDrawn();

    /* 창 크기가 크게 바뀌면(휴대폰을 돌림) 다시 맞춘다 */
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(el.clientWidth - lastW) > 80) { lastW = el.clientWidth; fit(); }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      api.current = null;
      el.removeEventListener('pointerdown', onDown, true);
      el.removeEventListener('click', onClick);
      mind.bus.removeListener('operation', onOp);
      mind.bus.removeListener('scale', onScale);
      mind.bus.removeListener('linkDiv', onDrawn);
      mind.destroy();
      mindRef.current = null;
      el.replaceChildren();
    };
  }, [fit, api]);

  /* 내용이 바뀌면 다시 그린다. 카테고리 · 단계를 바꿨으면 화면에도 다시 맞춘다 */
  const firstRun = useRef(true);
  const lastFit = useRef(fitKey);
  useEffect(() => {
    const m = mindRef.current;
    if (!m) return;
    if (firstRun.current) { firstRun.current = false; lastFit.current = fitKey; return; }
    m.refresh(data);
    if (lastFit.current !== fitKey) {
      lastFit.current = fitKey;
      requestAnimationFrame(() => fit());
    }
  }, [data, fitKey, fit]);

  /* ── 키보드 - 화살표로 옮기고 Enter 로 연다(엔진의 키 처리는 편집용이라 끄고 여기서 한다) ── */
  const say = (tpc: Topic<Meta>) => {
    const meta = tpc.nodeObj.metadata;
    const kind = meta?.kind === 'task' ? '작업' : meta?.kind === 'doc' ? '문서' : '';
    const kids = tpc.nodeObj.children?.length ?? 0;
    setLive(`${tpc.nodeObj.topic}${kind ? `, ${kind}` : ''}${kids ? `, 아래 ${kids}개${tpc.nodeObj.expanded === false ? ' 접힘' : ''}` : ''}`);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const m = mindRef.current;
    const host = hostRef.current;
    if (!m || !host) return;
    const rootTpc = host.querySelector<Topic<Meta>>('.me-root .me-tpc');
    const cur = (m.currentNode as Topic<Meta> | null) ?? rootTpc;
    if (!cur) return;
    const find = (id: string) => { try { return m.findEle(id) as Topic<Meta>; } catch { return null; } };
    const isLeft = (t: Topic<Meta>) => !!t.closest('.lhs');
    /** 같은 부모 아래, 같은 쪽(왼쪽 · 오른쪽)에 보이는 형제 - 화면 위에서 아래 차례 */
    const siblings = (t: Topic<Meta>) => {
      const p = t.nodeObj.parent;
      if (!p) return [t];
      return (p.children ?? [])
        .map((c) => find(c.id))
        .filter((x): x is Topic<Meta> => !!x && x.offsetParent !== null && isLeft(x) === isLeft(t))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    };
    let next: Topic<Meta> | null = null;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        const list = siblings(cur);
        next = list[list.indexOf(cur) + (e.key === 'ArrowDown' ? 1 : -1)] ?? null;
        break;
      }
      case 'ArrowRight':
      case 'ArrowLeft': {
        const n = cur.nodeObj;
        const isRoot = !n.parent;
        // 가지가 뻗는 쪽으로 누르면 아래 문서로, 반대쪽이면 위 문서로. 가운데에서는 누른 쪽 가지로
        const outward = isRoot || (e.key === 'ArrowRight') !== isLeft(cur);
        if (outward) {
          if (!isRoot && n.children?.length && n.expanded === false) { m.expandNode(cur, true); say(cur); e.preventDefault(); return; }
          const kids = (n.children ?? []).map((c) => find(c.id)).filter((x): x is Topic<Meta> => !!x && x.offsetParent !== null);
          const side = kids.filter((k) => isLeft(k) === (e.key === 'ArrowLeft'))
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
          next = isRoot ? side[0] ?? kids[0] ?? null : kids[0] ?? null;
        } else if (n.parent) {
          next = find(n.parent.id);
        }
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        activateRef.current(cur.nodeObj);
        return;
      case '+':
      case '=':
        e.preventDefault();
        m.scale(Math.min(2, m.scaleVal + 0.15));
        return;
      case '-':
        e.preventDefault();
        m.scale(Math.max(0.25, m.scaleVal - 0.15));
        return;
      case '0':
        e.preventDefault();
        fit(false);
        return;
      default:
        // 1~9 - 가운데부터 그 단까지 펼친다
        if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          onLevel(Number(e.key));
        }
        return;
    }
    e.preventDefault();
    if (next) {
      m.selectNode(next);
      m.scrollIntoView(next);
      say(next);
    }
  };

  return (
    <>
      {/* 엔진이 그리는 칸에 position: relative 를 박아 넣는다 - 크기는 바깥 틀(absolute)이 정한다.
          isolate: 엔진 안의 z-index 가 손가락 막(WikiMap 의 '지도 조작' 꺼짐) 위로 올라오지 않게 */}
      <div className="absolute inset-0 isolate">
        <div ref={hostRef} tabIndex={0} onKeyDown={onKeyDown}
          onFocus={(e) => {
            // 키보드로 들어왔으면 가운데 노드를 골라 두고 읽어 준다(마우스로 누른 것은 엔진이 이미 골랐다)
            const m = mindRef.current;
            if (!m || m.currentNode || !e.currentTarget.matches(':focus-visible')) return;
            const r = e.currentTarget.querySelector<Topic<Meta>>('.me-root .me-tpc');
            if (r) { m.selectNode(r); say(r); }
          }}
          role="application" aria-roledescription="마인드맵"
          aria-label={`${label} 마인드맵. 화살표로 옮기고 Enter 로 엽니다. 숫자 키로 펼칠 단계를 고릅니다`}
          aria-describedby="wm-live"
          className="wm-host h-full w-full" />
      </div>
      <p id="wm-live" className="sr-only" aria-live="polite">{live}</p>
    </>
  );
}

/* ── 틀 - 보기 방식 · 카테고리 · 켜고 끄기 · 확대, 그리고 고른 보기 ── */

type Mode = 'map' | '3d' | 'obsidian' | 'present';
type Prefs = {
  cat: string; tasks: boolean; links: boolean; mode: Mode; rotate: boolean;
  /** 프레젠테이션에서 카테고리마다 마지막으로 보던 문서 id(개요면 가운데 id) */
  present: Record<string, string>;
  /** 마인드맵에서 카테고리마다 고른 단계(가운데 = 1단, 'all' = 모두) - 없으면 기본(문서가 많을 때만 3단까지) */
  levels: Record<string, Level>;
};

/** 저장해 둔 단계 - 1 이상 정수와 'all'(모두). 예전에 저장한 숫자는 숫자 그대로 읽는다 */
const readLevels = (v: unknown): Record<string, Level> =>
  v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v as Record<string, unknown>)
      .filter((e): e is [string, Level] => e[1] === 'all' || (Number.isInteger(e[1]) && (e[1] as number) >= 1)))
    : {};

/** 사람이 펼치고 접은 것이 없을 때 */
const NO_TOGGLES: ReadonlyMap<string, boolean> = new Map();

const MODES: { id: Mode; label: string; hint: string; aria?: string }[] = [
  { id: 'map', label: '마인드맵', hint: '가운데에서 가지로 펼친 지도' },
  { id: '3d', label: '3D', aria: '3D 그래프', hint: '옵시디언 그래프처럼 문서 · 링크 · 작업을 3D 로' },
  { id: 'obsidian', label: '그래프', hint: '옵시디언 그래프 보기처럼 - 필터 · 그룹 · 표시 · 포스, 로컬 그래프, 애니메이션 재생' },
  { id: 'present', label: '프레젠테이션', hint: 'Prezi 처럼 원 안으로 확대해 들어가며 넘겨 보기' },
];

/** 가지 색 짝 - [선 · 테두리, 옅은 바탕] */
const PAIRS: [string, string][] = TASK_COLORS.map((c) => [PAINT[c.id].solid, PAINT[c.id].tint]);

function ModeIcon({ mode }: { mode: Mode }) {
  if (mode === 'map') return <IconNav name="mindmap" size={17} />;
  const svg = { width: 17, height: 17, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  if (mode === 'obsidian') {
    return (
      /* 점과 선 - 그래프 보기 */
      <svg {...svg} aria-hidden>
        <circle cx="5" cy="6" r="2" /><circle cx="15" cy="5.5" r="2" /><circle cx="10.5" cy="15" r="2.4" />
        <path d="M6.9 6.7l2.6 6.2M13.9 7.3l-2.5 5.6M7 5.9l6-.3" />
      </svg>
    );
  }
  return mode === '3d' ? (
    /* 정육면체 */
    <svg {...svg} aria-hidden><path d="M10 2.8l6.2 3.5v7.4L10 17.2l-6.2-3.5V6.3z" /><path d="M3.8 6.3L10 9.8l6.2-3.5M10 9.8v7.4" /></svg>
  ) : (
    /* 원 안의 원 - 확대해 들어가기 */
    <svg {...svg} aria-hidden><circle cx="10" cy="10" r="7.2" /><circle cx="12.4" cy="11.6" r="3" /><circle cx="7" cy="7.6" r="1.4" /></svg>
  );
}

/* 그래프(옵시디언식)는 force-graph 를 쓴다 - 고를 때만 불러온다 */
const ObsidianGraph = dynamic(() => import('./WikiObsidian'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-[#1e1e1e] text-[15px] font-semibold text-white/70">그래프를 불러오는 중…</div>
  ),
});

/* 3D 는 three.js 를 쓴다 - 고를 때만 불러온다 */
const Graph3D = dynamic(() => import('./WikiGraph3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-[#0b1220] text-[15px] font-semibold text-white/70">3D 를 불러오는 중…</div>
  ),
});

export default function WikiMap({
  docs, tasks, me, activeId, canCreate, onOpenDoc, onOpenTask, onAddChild, onRenameHome,
}: {
  /** 살아 있는 문서(휴지통과 그 아래 문서는 뺀 것) - 맨 위 문서(WIKI_HOME_ID)도 들어 있다 */
  docs: Doc[];
  tasks: Task[];
  me: string;
  /** 지금 열어 둔 문서 - 맵에서 파랗게 칠하고, 처음 고를 카테고리를 정한다 */
  activeId: string | null;
  /** 문서를 만들 수 있는가(목록을 읽었고 오류가 없다) */
  canCreate: boolean;
  onOpenDoc(id: string): void;
  onOpenTask(key: string): void;
  /** 이 아래에 새 문서 - null 이면 맨 위 문서 바로 아래(새 카테고리) */
  onAddChild(parentId: string | null): void;
  /** 맨 위 문서(가운데 1단)의 이름 바꾸기 창을 연다 - 메뉴의 '팀 위키'와는 따로 */
  onRenameHome?(): void;
}) {
  const members = useMembers();
  const paint = usePainter();
  /** 맨 위 문서(팀 위키 자체) - '전체'의 가운데. 카테고리는 그 바로 아래 문서들 */
  const home = useMemo(() => docs.find((d) => d.id === WIKI_HOME_ID) ?? null, [docs]);
  const homeTitle = home ? titleOf(home) : WIKI_HOME_TITLE;
  const roots = useMemo(() => buildTree(docs.filter((d) => d.id !== WIKI_HOME_ID)), [docs]);
  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);
  const tasksByKey = useMemo(() => new Map(tasks.map((t) => [t.key, t])), [tasks]);

  /* ── 고른 카테고리 · 켠 것 · 보기 방식 - 이 브라우저에 사람마다 ── */
  const prefKey = `mate.taskmanager.docs.map.v1:${me}`;
  const [prefs, setPrefs] = useState<Prefs>(() => {
    let p: Partial<Prefs> = {};
    try { p = JSON.parse(window.localStorage.getItem(prefKey) ?? '{}') as Partial<Prefs>; } catch { /* 저장이 막힌 환경 */ }
    // 열어 둔 문서가 있으면 그 문서의 카테고리(맨 위 문서 바로 아래 문서)부터 보여 준다. 맨 위 문서면 전체
    let top: string | null = null;
    for (let cur = activeId ? byId.get(activeId) : undefined, guard = 0; cur && cur.id !== WIKI_HOME_ID && guard < 60; guard += 1) {
      top = cur.id;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return {
      // 전체를 보던 사람은 전체 그대로(열어 둔 문서도 그 안에 있다). 맨 위 문서를 열어 두었으면 전체
      cat: p.cat === ALL || activeId === WIKI_HOME_ID ? ALL : top ?? p.cat ?? ALL,
      tasks: p.tasks ?? true,
      links: p.links ?? true,
      mode: MODES.some((m) => m.id === p.mode) ? (p.mode as Mode) : 'map',
      rotate: p.rotate ?? false,
      present: p.present && typeof p.present === 'object' ? p.present : {},
      levels: readLevels(p.levels),
    };
  });
  useEffect(() => {
    try { window.localStorage.setItem(prefKey, JSON.stringify(prefs)); } catch { /* noop */ }
  }, [prefs, prefKey]);

  /** 고른 카테고리가 지워졌으면 전체로 */
  const cat = prefs.cat === ALL || roots.some((r) => r.id === prefs.cat) ? prefs.cat : ALL;
  const { tasks: showTasks, links: showLinks, mode, rotate } = prefs;

  /**
   * 사람이 펼치고 접은 것(true = 펼침) - 카테고리마다 따로 두고, 카테고리를 바꾸면 모두 지운다(다른 지도에서 펼친 가지가
   * 저장된 단계보다 깊게 따라오지 않게). 바꿔도 다시 그리지 않으려고 ref 에 둔다(다음에 지도를 새로 만들 때 쓴다)
   */
  const manual = useRef(new Map<string, Map<string, boolean>>());
  /** 단계를 적용한 뒤 사람이 노드를 직접 펼치거나 접었다 - 숫자 단계의 눌림을 풀고 '직접 조정'을 보인다 */
  const [adjusted, setAdjusted] = useState(false);
  /* 카테고리가 바뀌면(고른 카테고리가 지워져 전체가 된 것도) 직접 펼친 것 · 직접 조정을 지운다 - 그 카테고리에 저장된 단계부터.
     지우기만 하는 일이라 그리기가 두 번 돌아도 결과가 같다 */
  const [shownCat, setShownCat] = useState(cat);
  if (shownCat !== cat) {
    manual.current.clear();
    setShownCat(cat);
    setAdjusted(false);
  }
  const catRef = useRef(cat);
  catRef.current = cat;
  /** 단계 단추를 누른 횟수 - 같은 단계를 다시 눌러도(사람이 펼치고 접은 것을 지우고) 새로 그리고 화면에 맞춘다 */
  const [levelTick, setLevelTick] = useState(0);
  const level = prefs.levels[cat] ?? null;

  const built = useMemo(() => {
    void levelTick; // 펼침 기록(ref)을 비웠다 - 같은 값으로도 다시 만든다
    return buildMap({
      roots, home, cat, tasksByKey, tasks, members, paint, showTasks, showLinks, activeId,
      toggled: manual.current.get(cat) ?? NO_TOGGLES, level,
    });
  }, [roots, home, cat, tasksByKey, tasks, members, paint, showTasks, showLinks, activeId, level, levelTick]);
  /** 가운데부터 n 단까지(또는 모두) 펼친다 - 사람이 따로 펼치고 접은 것은 지운다. 카테고리마다 이 브라우저에 기억한다 */
  const applyLevel = useCallback((n: Level) => {
    manual.current.clear();
    setAdjusted(false);
    setPrefs((p) => ({ ...p, levels: { ...p.levels, [cat]: n } }));
    setLevelTick((t) => t + 1);
  }, [cat]);
  /** 엔진이 알린 사람의 펼치기 · 접기 - 지금 카테고리에만 적고, 지도는 다시 그리지 않는다 */
  const onToggle = useCallback((id: string, expanded: boolean) => {
    const c = catRef.current;
    let m = manual.current.get(c);
    if (!m) {
      m = new Map();
      manual.current.set(c, m);
    }
    m.set(id, expanded);
    setAdjusted(true);
  }, []);
  /** 3D · 프레젠테이션이 쓰는 그래프 */
  const graph = useMemo(() => buildGraph({ roots, home, cat, tasks, members, palette: PAIRS }), [roots, home, cat, tasks, members]);
  /**
   * 그래프(옵시디언식)에 올릴 문서 - 카테고리를 골랐으면 그 문서와 아래 문서.
   * 카테고리(위 문서가 빈 문서)는 맨 위 문서 아래로 잇는다 - '위아래 문서 잇기'와 path: 가 맨 위 문서부터 시작한다
   */
  const underHome = useMemo(
    () => (home ? docs.map((d) => (d.id !== home.id && !d.parentId ? { ...d, parentId: home.id } : d)) : docs),
    [docs, home],
  );
  const scopeDocs = useMemo(() => {
    if (cat === ALL) return underHome;
    const out: Doc[] = [];
    const walk = (n: TreeNode) => { out.push(n); n.children.forEach(walk); };
    const r = roots.find((x) => x.id === cat);
    if (r) walk(r);
    return out;
  }, [cat, underHome, roots]);
  const categoryTitles = useMemo(() => roots.map((r) => titleOf(r)), [roots]);

  const handlers = useRef({ onOpenDoc, onOpenTask });
  handlers.current = { onOpenDoc, onOpenTask };
  const activate = useCallback((n: NodeObj<Meta> | undefined) => {
    const meta = n?.metadata;
    if (!meta) return;
    if (meta.kind === 'doc') handlers.current.onOpenDoc(meta.id);
    else if (meta.kind === 'more') handlers.current.onOpenDoc(meta.id);
    else if (meta.kind === 'task') handlers.current.onOpenTask(meta.key);
  }, []);
  const openDoc = useCallback((id: string) => handlers.current.onOpenDoc(id), []);
  const openTask = useCallback((key: string) => handlers.current.onOpenTask(key), []);

  /** 고른 보기의 손잡이 - 막대의 확대 단추가 쓴다 */
  const apiRef = useRef<CanvasApi | null>(null);
  const [zoom, setZoom] = useState(1);

  /* ── 휴대폰 · 손가락 기기 ── */
  const narrow = useMediaQuery('(max-width: 720px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  /** 마우스 올리기가 없는 기기 - 그래프는 누르면 선택만 한다(WikiObsidian) */
  const noHover = useMediaQuery('(hover: none)');
  /** 휴대폰: 작업 · 문서 링크 · 회전을 '표시' 단추로 펼친다 */
  const [showOpts, setShowOpts] = useState(false);
  /** 손가락 기기: 지도 조작 - 꺼져 있으면 지도 위를 밀어도 쪽이 스크롤되고 엔진은 손가락을 받지 않는다 */
  const [touchOn, setTouchOn] = useState(false);
  const [lockHint, setLockHint] = useState(false);
  const hintTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(hintTimer.current), []);
  const showLockHint = () => {
    setLockHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setLockHint(false), 2200);
  };

  /** 프레젠테이션 - 카테고리마다 마지막으로 보던 문서(다른 보기로 나갔다 와도 그 장부터) */
  const presentStart = prefs.present[cat] ?? null;
  const onPresentStep = useCallback((id: string) => {
    setPrefs((p) => (p.present[cat] === id ? p : { ...p, present: { ...p.present, [cat]: id } }));
  }, [cat]);

  /* ── 막대 ── */
  const setCat = (c: string) => setPrefs((p) => ({ ...p, cat: c }));
  const catDoc = cat === ALL ? null : byId.get(cat) ?? null;
  const label = catDoc ? titleOf(catDoc) : `${homeTitle} 전체`;
  const links = mode === 'map' ? built.links : graph.links.length;
  /** 범위의 고유 연결 작업 수 - 접힌 문서 · 잎으로 다 그리지 않은 작업도 넣고 같은 작업은 한 번(3D · 프레젠테이션도 같은 셈) */
  const taskCount = mode === 'map' ? built.taskTotal : graph.tasks.length;

  const toggle = (label2: string, checked: boolean, on: (v: boolean) => void) => (
    <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-tm-sm px-2 text-[14px] font-semibold text-tm-ink [@media(pointer:coarse)]:min-h-11">
      <input type="checkbox" checked={checked} onChange={(e) => on(e.target.checked)} className="h-[18px] w-[18px] accent-tm-blue" />
      {label2}
    </label>
  );
  /** 그래프(옵시디언식)는 제 설정 칸(필터)에서 고른다 */
  const hasOpts = mode !== 'obsidian';
  const opts = hasOpts && (
    <>
      {toggle('작업', showTasks, (v) => setPrefs((p) => ({ ...p, tasks: v })))}
      {(mode === 'map' || mode === '3d') && toggle('문서 링크', showLinks, (v) => setPrefs((p) => ({ ...p, links: v })))}
      {mode === '3d' && toggle('천천히 돌기', rotate, (v) => setPrefs((p) => ({ ...p, rotate: v })))}
    </>
  );
  /*
   * 마인드맵 단계 - 가운데(1단)부터 몇 단까지 펼칠지 한 번에 고른다. 숫자는 늘 'N단까지', '모두'는 지금 가장 깊은 단까지
   * (문서가 깊어지면 따라간다). 8단 이상이면 '1단 · 2단 · 3단 · 단계 선택 · 모두'로 줄인다
   */
  const max = built.maxLevel;
  /** 지금 눌린 단계 - 직접 조정했으면 없음. 고르지 않았으면 기본(문서가 많으면 3단, 아니면 모두) */
  const chosen: Level = level ?? built.auto;
  const pressed: Level | null = adjusted ? null : chosen === 'all' ? 'all' : Math.min(chosen, max);
  /** 휴대폰 '표시' 단추에 붙이는 지금 단계 */
  const levelShort = adjusted ? '직접' : pressed === 'all' ? '모두' : `${pressed}단`;
  const compact = max >= 8;
  const levelBtn = `inline-flex h-[30px] min-w-[42px] flex-none items-center justify-center whitespace-nowrap rounded-full px-2 text-[13.5px] font-bold tabular-nums
    text-tm-ink transition-colors duration-150 hover:bg-white aria-pressed:bg-tm-blue aria-pressed:text-white
    [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-11`;
  const levelHelp = '가운데가 1단입니다 · 작업 잎도 한 단으로 세므로 작업을 켜고 끄면 가장 깊은 단이 바뀔 수 있습니다';
  /** 고르면 휴대폰은 '표시' 칸을 닫아 지도를 바로 보게 한다 */
  const pickLevel = (n: Level) => {
    applyLevel(n);
    if (narrow) setShowOpts(false);
  };
  const levelGroup = mode === 'map' && max > 1 && (
    <div role="group" aria-label={`펼칠 단계${adjusted ? ' · 직접 조정함' : ''}`} aria-describedby="wm-level-help"
      className="flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="flex-none text-[13px] font-bold text-tm-sub" aria-hidden title={levelHelp}>단계</span>
      <div className="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full border border-tm-line bg-tm-bg p-0.5">
        {Array.from({ length: compact ? 3 : max }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" aria-pressed={pressed === n} onClick={() => pickLevel(n)}
            title={`${n === 1 ? '가운데만 봅니다' : `가운데부터 ${n}단까지 펼칩니다`}${n <= 9 ? ` (숫자 키 ${n})` : ''}`}
            className={levelBtn}>
            {n}단
          </button>
        ))}
        {compact && (
          <select aria-label="4단부터 고르기" value={typeof pressed === 'number' && pressed > 3 ? String(pressed) : ''}
            onChange={(e) => { if (e.target.value) pickLevel(Number(e.target.value)); }}
            className={`h-[30px] flex-none cursor-pointer rounded-full border-0 px-2.5 text-[13.5px] font-bold tabular-nums
                        [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px] ${
              typeof pressed === 'number' && pressed > 3 ? 'bg-tm-blue text-white' : 'bg-transparent text-tm-ink hover:bg-white'}`}>
            <option value="" disabled>단계 선택</option>
            {Array.from({ length: max - 3 }, (_, i) => i + 4).map((n) => <option key={n} value={n}>{n}단</option>)}
          </select>
        )}
        <button type="button" aria-pressed={pressed === 'all'} onClick={() => pickLevel('all')}
          title="가장 깊은 단까지 모두 펼칩니다 · 문서가 더 깊어져도 따라갑니다" className={levelBtn}>
          모두
        </button>
      </div>
      {adjusted && <span className="flex-none text-[12.5px] font-bold text-tm-blue">직접 조정</span>}
      <span id="wm-level-help" className={narrow ? 'basis-full text-[12.5px] font-semibold leading-[1.5] text-tm-sub' : 'sr-only'}>{levelHelp}</span>
    </div>
  );
  /** 숫자 키 - 이 지도에 있는 단까지만 */
  const levelKey = (n: number) => { if (n <= max) applyLevel(n); };
  /** 휴대폰 막대의 44px 단추 */
  const touchBtn = 'inline-flex h-11 flex-none items-center justify-center gap-1 whitespace-nowrap rounded-tm-sm border px-2.5 text-[14px] font-bold transition-colors duration-150';
  const fitLabel = mode === 'present' ? '개요' : '맞춤';
  /** 보기마다 아래 띠의 읽는 법 - 손가락 기기는 실제 조작대로 */
  const guide: Record<Mode, { long: string; short: string }> = {
    map: { long: '문서를 누르면 열립니다 · 끌거나 휠로 옮기고 Ctrl+휠로 확대합니다', short: '누르면 열립니다 · 두 손가락으로 확대' },
    '3d': noHover
      ? { long: '누르면 가까이 가고 정보 칸이 열립니다 · 정보 칸의 문서 열기로 엽니다', short: '누르면 선택 · 정보 칸에서 문서 열기' }
      : { long: '끌어서 돌리고 휠로 확대합니다 · 누르면 가까이 가고 정보 칸의 문서 열기로 엽니다', short: '누르면 선택 · 정보 칸에서 문서 열기' },
    obsidian: noHover
      ? { long: '누르면 선택 · 열기 단추로 문서 열기 · 빈 곳을 누르면 선택 해제 · 톱니바퀴에서 설정', short: '누르면 선택 · 열기 단추로 문서 열기' }
      : { long: '노트를 누르면 열립니다 · 오른쪽 누르기는 메뉴 · 휠이나 +/- 로 확대, 방향키로 이동 · 오른쪽 위 톱니바퀴에서 필터 · 그룹 · 표시 · 포스', short: '누르면 열림 · 톱니바퀴에서 설정' },
    present: {
      long: '← → 로 넘기고 원을 누르면 들어갑니다 · 빈 곳은 한 단계 밖 · 아래 막대의 문서 열기로 엽니다',
      short: '원을 누르면 들어감 · 문서 열기 단추로 열기',
    },
  };

  return (
    <div className="tm-wikimap flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm">
      <div className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-tm-line px-4 py-3 max-[720px]:px-3 max-[720px]:py-2.5">
        {/* 보기 방식 */}
        <div role="group" aria-label="보기 방식"
          className="flex flex-none items-center gap-1 rounded-full border border-tm-line bg-tm-bg p-1 max-[720px]:w-full max-[720px]:p-0.5">
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} title={m.hint} aria-label={m.aria}
              onClick={() => setPrefs((p) => ({ ...p, mode: m.id }))}
              className="inline-flex h-[34px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[14px] font-bold text-tm-ink transition-colors duration-150
                         hover:bg-white aria-pressed:bg-tm-blue aria-pressed:text-white max-[720px]:flex-auto max-[720px]:px-2.5 max-[720px]:text-[13.5px]
                         [@media(pointer:coarse)]:h-11">
              {/* 휴대폰: 네 보기가 한 줄에 들어가게 그림은 뺀다 */}
              <span className="max-[720px]:hidden"><ModeIcon mode={m.id} /></span>
              {m.label}
            </button>
          ))}
        </div>

        {/* 카테고리 고르기 - 맨 위 문서(팀 위키 자체) 바로 아래 문서가 카테고리다. '전체'는 맨 위 문서가 가운데 */}
        <div role="group" aria-label="카테고리"
          className="no-scrollbar -my-1 flex min-w-0 flex-[1_1_320px] items-center gap-1.5 overflow-x-auto py-1 max-[720px]:basis-full">
          <button type="button" aria-pressed={cat === ALL} onClick={() => setCat(ALL)} className={tmTab}
            title={`가운데에 '${homeTitle}'(맨 위 문서)를 두고 카테고리를 모두 봅니다`}>
            전체
          </button>
          {roots.map((r) => (
            <button key={r.id} type="button" aria-pressed={cat === r.id} onClick={() => setCat(r.id)} className={`group ${tmTab}`}>
              {r.icon && <span aria-hidden>{r.icon}</span>}
              <span className="max-w-[180px] truncate">{titleOf(r)}</span>
              <span className={`${tmCount} group-aria-pressed:bg-white/20 group-aria-pressed:text-white`} aria-label={`문서 ${countAll(r.children)}개`}>
                {countAll(r.children)}
              </span>
            </button>
          ))}
        </div>

        {/* 조작 - PC 는 켜고 끄기를 바로, 휴대폰은 '표시' 로 펼친다. 손가락 기기는 '지도 조작' */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 max-[720px]:w-full max-[720px]:flex-nowrap max-[720px]:gap-x-1.5">
          {!narrow && opts}
          {!narrow && levelGroup && (
            <>
              <span className="mx-1 h-6 w-px bg-tm-line" aria-hidden />
              {levelGroup}
            </>
          )}
          {narrow && hasOpts && (
            <button type="button" onClick={() => setShowOpts((v) => !v)} aria-expanded={showOpts} aria-controls={showOpts ? 'wm-opts' : undefined}
              className={`${touchBtn} ${showOpts ? 'border-tm-blue bg-tm-tint text-tm-deep' : 'border-tm-edge bg-white text-tm-ink'}`}>
              {/* 닫혀 있어도 지금 단계가 보이게(마인드맵) - 표시 · 2단 · 표시 · 모두 · 표시 · 직접 */}
              {mode === 'map' && max > 1 ? `표시 · ${levelShort}` : '표시'}
              <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-150 ${showOpts ? 'rotate-180' : ''}`}>
                <path d="M5 8l5 5 5-5" />
              </svg>
            </button>
          )}
          {coarse && (
            <button type="button" onClick={() => setTouchOn((v) => !v)} aria-pressed={touchOn}
              title={touchOn ? '지도를 끌고 확대할 수 있습니다. 다시 누르면 쪽 스크롤로 돌아갑니다' : '켜면 지도를 끌고 확대하고 누를 수 있습니다'}
              className={`${touchBtn} ${touchOn ? 'border-tm-blue bg-tm-blue text-white' : 'border-tm-edge bg-white text-tm-ink'}`}>
              지도 조작
            </button>
          )}
          {!narrow && hasOpts && <span className="mx-1 h-6 w-px bg-tm-line" aria-hidden />}
          <div className="flex items-center gap-1.5 max-[720px]:ml-auto max-[720px]:gap-1" role="group" aria-label="확대">
            <button type="button" onClick={() => apiRef.current?.zoomOut()} className={tmIconBtn} aria-label="작게">
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 10h12" /></svg>
            </button>
            {mode === 'map' && !narrow && (
              <span className="w-[46px] text-center text-[13.5px] font-bold tabular-nums text-tm-sub" aria-live="off">{Math.round(zoom * 100)}%</span>
            )}
            <button type="button" onClick={() => apiRef.current?.zoomIn()} className={tmIconBtn} aria-label="크게">
              <IconPlus size={16} />
            </button>
            {narrow ? (
              <button type="button" onClick={() => apiRef.current?.fit()} className={tmIconBtn} aria-label={fitLabel}
                title={mode === 'present' ? '처음 장(개요)으로' : '전체가 보이게 맞추기'}>
                <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4" />
                </svg>
              </button>
            ) : (
              <button type="button" onClick={() => apiRef.current?.fit()} className={tmGhostBtn}
                title={mode === 'present' ? '처음 장(개요)으로' : '전체가 보이게 맞추기 (0)'}>
                {fitLabel}
              </button>
            )}
          </div>
        </div>
        {narrow && hasOpts && showOpts && (
          <div id="wm-opts" role="group" aria-label="표시" className="-mt-1 flex w-full flex-wrap items-center gap-x-1 gap-y-1.5">
            {opts}
            {levelGroup && <div className="flex w-full min-w-0 px-2">{levelGroup}</div>}
          </div>
        )}
      </div>

      {/* 고른 보기 */}
      <div className={`relative min-h-0 flex-1 ${mode === 'map' ? '' : mode === 'obsidian' ? 'bg-[#1e1e1e]' : 'bg-[#0b1220]'}`}>
        {mode === 'map' && (
          /* 카테고리 · 단계를 바꿨거나 지도가 비었다 · 찼으면(예시 지우기 · 첫 문서) 화면에 다시 맞춘다 - 엔진은 자리를 그대로 두고 다시 그린다 */
          <ElixirCanvas data={built.data} fitKey={`${cat}|${levelTick}|${built.empty ? 'empty' : ''}`} label={label} onToggle={onToggle} onActivate={activate} api={apiRef}
            onZoom={setZoom} onLevel={levelKey} />
        )}
        {mode === '3d' && (
          <Graph3D graph={graph} showTasks={showTasks} showLinks={showLinks} rotate={rotate}
            onOpenDoc={openDoc} onOpenTask={openTask} api={apiRef} />
        )}
        {mode === 'obsidian' && (
          <ObsidianGraph docs={scopeDocs} allDocs={underHome} tasks={tasks} categories={categoryTitles} activeId={activeId}
            storageKey={`mate.taskmanager.docs.obsidian.v1:${me}`} onOpenDoc={openDoc} onOpenTask={openTask} api={apiRef} />
        )}
        {mode === 'present' && (
          <WikiPresent graph={graph} label={label} showTasks={showTasks} startId={presentStart} onStep={onPresentStep}
            onOpenDoc={openDoc} onOpenTask={openTask} api={apiRef} />
        )}

        {/* 손가락 기기 · 지도 조작 꺼짐: 지도 위를 세로로 밀면 쪽이 스크롤된다(엔진은 손가락을 받지 않고 노드도 열리지 않는다).
            안내 · 정보 칸 · 설정 · 넘기기 막대는 z-10 이라 이 막 위에서 그대로 누를 수 있다 */}
        {coarse && !touchOn && (
          <div aria-hidden onClick={showLockHint} className="absolute inset-0 z-[5]" style={{ touchAction: 'pan-y' }} />
        )}
        {lockHint && coarse && !touchOn && (
          <p role="status" className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-tm-ink px-3.5 py-2 text-[13px] font-semibold text-white shadow-tm-up">
            지도를 움직이려면 &apos;지도 조작&apos;을 켜세요
          </p>
        )}

        {/* 아래 문서가 없는 카테고리 - 무엇을 하면 되는지(위쪽에 - 프레젠테이션의 넘기기 막대와 겹치지 않게) */}
        {built.empty && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4">
            <div className="pointer-events-auto flex max-w-[560px] flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-tm border border-tm-line bg-white px-5 py-3.5 text-center shadow-tm-up">
              <p className="text-[14.5px] leading-[1.6] text-tm-ink">
                {catDoc
                  ? <>아직 <b className="font-bold text-tm-deep">{titleOf(catDoc)}</b> 아래에 문서가 없습니다. 문서를 만들면 가지로 펼쳐집니다.</>
                  : <>아직 카테고리가 없습니다. 맨 위 문서 <b className="font-bold text-tm-deep">{homeTitle}</b> 바로 아래에 만든 문서가 카테고리가 됩니다.</>}
              </p>
              {canCreate && !catDoc && onRenameHome && (
                <button type="button" onClick={onRenameHome} className={tmGhostBtn}
                  title={`가운데 '${homeTitle}'의 이름을 바꿉니다. 왼쪽 메뉴의 '팀 위키'는 그대로입니다`}>
                  <PencilGlyph />
                  이름 바꾸기
                </button>
              )}
              {canCreate && (
                <button type="button" onClick={() => onAddChild(catDoc?.id ?? null)}
                  className="inline-flex h-[38px] items-center gap-1.5 rounded-tm-sm bg-tm-blue px-3.5 text-[14px] font-bold text-white transition-colors hover:bg-tm-blue-hover [@media(pointer:coarse)]:h-11">
                  <IconPlus size={16} />
                  {catDoc ? '하위 문서 만들기' : '새 카테고리'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 읽는 법 · 새 문서 - 지도 아래 띠(지도 위에 띄우면 가장자리 노드를 가린다) */}
      {!built.empty && (
        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-tm-line px-4 py-2 text-[13px] font-semibold text-tm-sub max-[720px]:px-3">
          {coarse && !touchOn ? (
            <span>지도 위를 밀면 화면이 움직입니다 · &apos;지도 조작&apos;을 켜면 지도를 누르고 끌 수 있습니다</span>
          ) : (
            <>
              <span className="max-[900px]:hidden">{guide[mode].long}</span>
              <span className="hidden max-[900px]:inline">{guide[mode].short}</span>
            </>
          )}
          {(mode === 'map' || mode === '3d') && links > 0 && (
            <span className="inline-flex items-center gap-1.5">
              {mode === 'map'
                ? <svg width="26" height="6" aria-hidden><path d="M1 3h24" stroke="#5b6676" strokeWidth="1.6" strokeDasharray="6 5" /></svg>
                : <svg width="26" height="6" aria-hidden><path d="M1 3h24" stroke="#4f74e8" strokeWidth="2.2" /></svg>}
              문서 링크 {links}
            </span>
          )}
          {mode !== 'obsidian' && showTasks && taskCount > 0 && (
            <span className="inline-flex items-center gap-1.5" title="접힌 문서의 연결 작업도 포함하며 같은 작업은 한 번만 셉니다">
              {(['todo', 'doing', 'review', 'done'] as const).map((st) => (
                <i key={st} className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[st] }} title={statusLabel(st)} />
              ))}
              연결 작업 {taskCount}개
              {/* 화면 읽기 프로그램에는 셈의 범위를 함께 읽어 준다(마우스는 위 title) */}
              <span className="sr-only"> · 접힌 문서의 연결 작업도 포함하며 같은 작업은 한 번만 셉니다</span>
            </span>
          )}
          {canCreate && (
            <div className="ml-auto flex flex-none items-center gap-1.5">
              {/* '전체'의 가운데는 맨 위 문서 - 이름만 따로 바꾼다(지우거나 옮길 수 없다) */}
              {!catDoc && onRenameHome && (
                <button type="button" onClick={onRenameHome} className={tmGhostBtn}
                  title={`가운데 '${homeTitle}'의 이름을 바꿉니다. 왼쪽 메뉴의 '팀 위키'는 그대로입니다`}>
                  <PencilGlyph />
                  <span className="max-[720px]:hidden">맨 위 문서 </span>이름 바꾸기
                </button>
              )}
              <button type="button" onClick={() => onAddChild(catDoc?.id ?? null)} className={tmGhostBtn}
                aria-label={catDoc ? `${titleOf(catDoc)} 아래에 새 문서` : `${homeTitle} 바로 아래에 새 카테고리`}
                title={catDoc ? undefined : `'${homeTitle}' 바로 아래에 새 카테고리 문서를 만듭니다`}>
                <IconPlus size={16} />
                {catDoc ? <><span className="max-[720px]:hidden">{titleOf(catDoc)} 아래에 </span>새 문서</> : '새 카테고리'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 이름 바꾸기 - 연필 */
function PencilGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.6 4.4l3 3L7.2 15.8H4.2v-3z" />
      <path d="M11 6l3 3" />
    </svg>
  );
}
