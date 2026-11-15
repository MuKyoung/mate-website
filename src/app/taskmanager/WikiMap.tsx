'use client';

/**
 * 팀 위키 마인드맵 - 세 가지 보기: 마인드맵(가지) · 3D 그래프 · 프레젠테이션(Prezi 꼴, WikiPresent).
 *
 * 카테고리(맨 위 문서) 하나를 고르면 그 아래 문서를 가지로 펼친다. '전체'는 카테고리를 모두 한 장에 둔다.
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
import { TASK_COLORS, WIKI_CATEGORIES, statusLabel, type Doc, type Member, type Task, type WikiCategoryId } from './types';
import { buildTree, type TreeNode } from './DocTree';
import { titleOf } from './DocPanels';
import { docLinkIds } from './docMarkdown';
import { useMembers } from './members';
import { usePainter, type Painter } from './colorStore';
import { IconNav, IconPlus, PAINT, tmCount, tmGhostBtn, tmIconBtn, tmTab } from './ui';
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
/** 문서가 이보다 많으면 셋째 줄부터 접어 둔다 */
const FOLD_OVER = 60;
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
  roots: TreeNode[];
  cat: string;
  tasksByKey: Map<string, Task>;
  tasks: Task[];
  members: Member[];
  paint: Painter;
  showTasks: boolean;
  showLinks: boolean;
  activeId: string | null;
  /** 사람이 펼치거나 접은 것(true = 펼침) - 기본 규칙보다 앞선다 */
  toggled: ReadonlyMap<string, boolean>;
}

interface Built {
  data: MindElixirData<Meta>;
  docs: number;
  links: number;
  taskLeaves: number;
  /** 맵에 올린 문서 - 아래 문서가 하나도 없으면 안내를 띄운다 */
  empty: boolean;
}

function buildMap(x: BuildInput): Built {
  const catRoot = x.cat === ALL ? null : x.roots.find((r) => r.id === x.cat) ?? null;
  const top = catRoot ? catRoot.children : x.roots;
  const big = countAll(top) > FOLD_OVER;
  const byName = new Map(x.members.map((m) => [m.name.trim(), m]));
  const byId = new Map(x.members.map((m) => [m.id, m]));

  /** 화면에 그려지는 문서(위가 모두 펼쳐져 있다) - 화살표는 이것끼리만 잇는다 */
  const shown = new Map<string, TreeNode>();
  const parentOf = new Map<string, string>();
  let taskLeaves = 0;

  const avatar = (m: Member) => {
    const p = PAINT[x.paint.member(m.id)];
    return `<i style="background:${p.tint};color:${p.solid}" title="${esc(m.name)}">${esc(m.initial)}</i>`;
  };

  /** 문서가 가리키는 작업 - 있는 작업만 */
  const tasksOf = (d: Doc) =>
    [...new Set([...d.body.matchAll(TASK_RE)].map((m) => m[0]))]
      .map((k) => x.tasksByKey.get(k))
      .filter((t): t is Task => !!t);

  /** 문서 노드 안에 그릴 것 - 아이콘(없으면 가지 색 점) · 제목 · 한 줄 요약 · 언급한 사람 */
  const docHtml = (d: TreeNode, color: string, opts: { folded: boolean; tasks: Task[]; root?: boolean }) => {
    const meta: string[] = [];
    const person = byName.get(d.title.trim());
    if (person) {
      const open = x.tasks.filter((t) => t.assignee === person.id && t.status !== 'done');
      meta.push(`맡은 작업 ${open.length}건${open.some((t) => t.status === 'doing') ? ` · 진행 ${open.filter((t) => t.status === 'doing').length}` : ''}`);
    }
    if (opts.folded && d.children.length) meta.push(`하위 ${countAll(d.children)}`);
    if (!x.showTasks && opts.tasks.length) meta.push(`작업 ${opts.tasks.length}`);
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
    taskLeaves += 1;
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
    const leaves = leavesOf(d, tasks);
    const foldable = d.children.length > 0 || leaves.length > 0;
    const expanded = foldable ? x.toggled.get(d.id) ?? !(big && depth >= 2) : undefined;
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

  const mainKids = top.map((d, i) => {
    parentOf.set(d.id, catRoot?.id ?? ALL);
    return docNode(d, 1, PALETTE[i % PALETTE.length], true);
  });

  let nodeData: NodeObj<Meta>;
  if (catRoot) {
    shown.set(catRoot.id, catRoot);
    const tasks = tasksOf(catRoot);
    nodeData = {
      id: catRoot.id,
      topic: titleOf(catRoot),
      dangerouslySetInnerHTML: docHtml(catRoot, PALETTE[0], { folded: false, tasks, root: true }),
      children: [...mainKids, ...leavesOf(catRoot, tasks)],
      metadata: { kind: 'doc', id: catRoot.id },
      ...(catRoot.id === x.activeId ? { style: { border: '2px solid #18308f' } } : {}),
    };
  } else {
    nodeData = {
      id: ALL,
      topic: '팀 위키',
      dangerouslySetInnerHTML: '<span class="wm-n wm-root"><span class="wm-t"><span class="wm-tt">팀 위키</span></span></span>',
      children: mainKids,
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
    taskLeaves,
    empty: top.length === 0,
  };
}

/* ── 마인드맵(가지) 칸 - Mind Elixir ──────────────────── */

function ElixirCanvas({ data, cat, label, toggled, onActivate, api, onZoom }: {
  data: MindElixirData<Meta>;
  /** 고른 카테고리 - 바뀌면 화면에 다시 맞춘다 */
  cat: string;
  label: string;
  /** 사람이 펼치고 접은 것(true = 펼침) - 다음에 지도를 새로 만들 때 쓴다 */
  toggled: MutableRefObject<Map<string, boolean>>;
  onActivate(n: NodeObj<Meta> | undefined): void;
  api: MutableRefObject<CanvasApi | null>;
  onZoom(s: number): void;
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
      if (op.name === 'expandNode' || op.name === 'collapseNode') toggled.current.set(op.target.id, op.name === 'expandNode');
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
  }, [fit, api, toggled]);

  /* 내용이 바뀌면 다시 그린다. 카테고리를 바꿨으면 화면에도 다시 맞춘다 */
  const firstRun = useRef(true);
  const lastCat = useRef(cat);
  useEffect(() => {
    const m = mindRef.current;
    if (!m) return;
    if (firstRun.current) { firstRun.current = false; lastCat.current = cat; return; }
    m.refresh(data);
    if (lastCat.current !== cat) {
      lastCat.current = cat;
      requestAnimationFrame(() => fit());
    }
  }, [data, cat, fit]);

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
      {/* 엔진이 그리는 칸에 position: relative 를 박아 넣는다 - 크기는 바깥 틀(absolute)이 정한다 */}
      <div className="absolute inset-0">
        <div ref={hostRef} tabIndex={0} onKeyDown={onKeyDown}
          onFocus={(e) => {
            // 키보드로 들어왔으면 가운데 노드를 골라 두고 읽어 준다(마우스로 누른 것은 엔진이 이미 골랐다)
            const m = mindRef.current;
            if (!m || m.currentNode || !e.currentTarget.matches(':focus-visible')) return;
            const r = e.currentTarget.querySelector<Topic<Meta>>('.me-root .me-tpc');
            if (r) { m.selectNode(r); say(r); }
          }}
          role="application" aria-roledescription="마인드맵"
          aria-label={`${label} 마인드맵. 화살표로 옮기고 Enter 로 엽니다`}
          aria-describedby="wm-live"
          className="wm-host h-full w-full" />
      </div>
      <p id="wm-live" className="sr-only" aria-live="polite">{live}</p>
    </>
  );
}

/* ── 틀 - 보기 방식 · 카테고리 · 켜고 끄기 · 확대, 그리고 고른 보기 ── */

type Mode = 'map' | '3d' | 'present';
type Prefs = { cat: string; tasks: boolean; links: boolean; mode: Mode; rotate: boolean };

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'map', label: '마인드맵', hint: '가운데에서 가지로 펼친 지도' },
  { id: '3d', label: '3D', hint: '옵시디언 그래프처럼 문서 · 링크 · 작업을 3D 로' },
  { id: 'present', label: '프레젠테이션', hint: 'Prezi 처럼 원 안으로 확대해 들어가며 넘겨 보기' },
];

/** 가지 색 짝 - [선 · 테두리, 옅은 바탕] */
const PAIRS: [string, string][] = TASK_COLORS.map((c) => [PAINT[c.id].solid, PAINT[c.id].tint]);

function ModeIcon({ mode }: { mode: Mode }) {
  if (mode === 'map') return <IconNav name="mindmap" size={17} />;
  const svg = { width: 17, height: 17, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return mode === '3d' ? (
    /* 정육면체 */
    <svg {...svg} aria-hidden><path d="M10 2.8l6.2 3.5v7.4L10 17.2l-6.2-3.5V6.3z" /><path d="M3.8 6.3L10 9.8l6.2-3.5M10 9.8v7.4" /></svg>
  ) : (
    /* 원 안의 원 - 확대해 들어가기 */
    <svg {...svg} aria-hidden><circle cx="10" cy="10" r="7.2" /><circle cx="12.4" cy="11.6" r="3" /><circle cx="7" cy="7.6" r="1.4" /></svg>
  );
}

/* 3D 는 three.js 를 쓴다 - 고를 때만 불러온다 */
const Graph3D = dynamic(() => import('./WikiGraph3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-[#0b1220] text-[15px] font-semibold text-white/70">3D 를 불러오는 중…</div>
  ),
});

export default function WikiMap({
  docs, tasks, me, activeId, canCreate, onOpenDoc, onOpenTask, onAddChild, onCreateCategory,
}: {
  /** 살아 있는 문서(휴지통과 그 아래 문서는 뺀 것) */
  docs: Doc[];
  tasks: Task[];
  me: string;
  /** 지금 열어 둔 문서 - 맵에서 파랗게 칠하고, 처음 고를 카테고리를 정한다 */
  activeId: string | null;
  /** 문서를 만들 수 있는가(목록을 읽었고 오류가 없다) */
  canCreate: boolean;
  onOpenDoc(id: string): void;
  onOpenTask(key: string): void;
  /** 이 아래에 새 문서 - null 이면 맨 위(새 카테고리) */
  onAddChild(parentId: string | null): void;
  /** 권하는 카테고리(프로젝트 · 개발자)를 만들고 그 문서 id 를 돌려준다 */
  onCreateCategory(id: WikiCategoryId): string | null;
}) {
  const members = useMembers();
  const paint = usePainter();
  const roots = useMemo(() => buildTree(docs), [docs]);
  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);
  const tasksByKey = useMemo(() => new Map(tasks.map((t) => [t.key, t])), [tasks]);

  /* ── 고른 카테고리 · 켠 것 · 보기 방식 - 이 브라우저에 사람마다 ── */
  const prefKey = `mate.taskmanager.docs.map.v1:${me}`;
  const [prefs, setPrefs] = useState<Prefs>(() => {
    let p: Partial<Prefs> = {};
    try { p = JSON.parse(window.localStorage.getItem(prefKey) ?? '{}') as Partial<Prefs>; } catch { /* 저장이 막힌 환경 */ }
    // 열어 둔 문서가 있으면 그 문서의 카테고리(맨 위 문서)부터 보여 준다
    let top: string | null = null;
    for (let cur = activeId ? byId.get(activeId) : undefined, guard = 0; cur && guard < 60; guard += 1) {
      top = cur.id;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return {
      // 전체를 보던 사람은 전체 그대로(열어 둔 문서도 그 안에 있다)
      cat: p.cat === ALL ? ALL : top ?? p.cat ?? ALL,
      tasks: p.tasks ?? true,
      links: p.links ?? true,
      mode: MODES.some((m) => m.id === p.mode) ? (p.mode as Mode) : 'map',
      rotate: p.rotate ?? false,
    };
  });
  useEffect(() => {
    try { window.localStorage.setItem(prefKey, JSON.stringify(prefs)); } catch { /* noop */ }
  }, [prefs, prefKey]);

  /** 고른 카테고리가 지워졌으면 전체로 */
  const cat = prefs.cat === ALL || roots.some((r) => r.id === prefs.cat) ? prefs.cat : ALL;
  const { tasks: showTasks, links: showLinks, mode, rotate } = prefs;

  /** 사람이 펼치고 접은 것(true = 펼침) - 바꿔도 다시 그리지 않으려고 ref 에 둔다(다음에 지도를 새로 만들 때 쓴다) */
  const toggled = useRef(new Map<string, boolean>());

  const built = useMemo(() => buildMap({
    roots, cat, tasksByKey, tasks, members, paint, showTasks, showLinks, activeId, toggled: toggled.current,
  }), [roots, cat, tasksByKey, tasks, members, paint, showTasks, showLinks, activeId]);
  /** 3D · 프레젠테이션이 쓰는 그래프 */
  const graph = useMemo(() => buildGraph({ roots, cat, tasks, members, palette: PAIRS }), [roots, cat, tasks, members]);

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

  /* ── 막대 ── */
  const setCat = (c: string) => setPrefs((p) => ({ ...p, cat: c }));
  const missing = WIKI_CATEGORIES.filter((c) => !roots.some((r) => r.title.trim() === c.title));
  const catDoc = cat === ALL ? null : byId.get(cat) ?? null;
  const label = catDoc ? titleOf(catDoc) : '팀 위키 전체';
  const links = mode === 'map' ? built.links : graph.links.length;
  const taskCount = mode === 'map' ? built.taskLeaves : graph.tasks.length;

  const createCategory = (id: WikiCategoryId) => {
    const made = onCreateCategory(id);
    if (made) setCat(made);
  };
  const toggle = (label2: string, checked: boolean, on: (v: boolean) => void) => (
    <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-tm-sm px-2 text-[14px] font-semibold text-tm-ink [@media(pointer:coarse)]:min-h-11">
      <input type="checkbox" checked={checked} onChange={(e) => on(e.target.checked)} className="h-[18px] w-[18px] accent-tm-blue" />
      {label2}
    </label>
  );

  return (
    <div className="tm-wikimap flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm">
      <div className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 border-b border-tm-line px-4 py-3 max-[720px]:px-3">
        {/* 보기 방식 */}
        <div role="group" aria-label="보기 방식" className="flex flex-none items-center gap-1 rounded-full border border-tm-line bg-tm-bg p-1">
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} title={m.hint}
              onClick={() => setPrefs((p) => ({ ...p, mode: m.id }))}
              className="inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[14px] font-bold text-tm-ink transition-colors duration-150
                         hover:bg-white aria-pressed:bg-tm-blue aria-pressed:text-white [@media(pointer:coarse)]:h-10">
              <ModeIcon mode={m.id} />
              {m.label}
            </button>
          ))}
        </div>

        {/* 카테고리 고르기 - 맨 위 문서가 카테고리다 */}
        <div role="group" aria-label="카테고리"
          className="no-scrollbar -my-1 flex min-w-0 flex-[1_1_320px] items-center gap-1.5 overflow-x-auto py-1">
          <button type="button" aria-pressed={cat === ALL} onClick={() => setCat(ALL)} className={tmTab}>
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
          {canCreate && missing.map((c) => (
            <button key={c.id} type="button" onClick={() => createCategory(c.id)}
              title={`맨 위에 '${c.title}' 문서를 만들고 쓰는 법을 넣습니다`}
              className="inline-flex h-[42px] flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-tm-edge bg-white px-4
                         text-[14.5px] font-bold text-tm-blue transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint [@media(pointer:coarse)]:h-11">
              <IconPlus size={16} />
              {c.title} 카테고리
            </button>
          ))}
        </div>

        {/* 켜고 끄기 · 확대 - 휴대폰에서는 한 줄을 다 쓰고, 모자라면 확대 단추가 다음 줄 오른쪽으로 */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 max-[720px]:w-full">
          {toggle('작업', showTasks, (v) => setPrefs((p) => ({ ...p, tasks: v })))}
          {mode !== 'present' && toggle('문서 링크', showLinks, (v) => setPrefs((p) => ({ ...p, links: v })))}
          {mode === '3d' && toggle('천천히 돌기', rotate, (v) => setPrefs((p) => ({ ...p, rotate: v })))}
          <span className="mx-1 h-6 w-px bg-tm-line max-[720px]:hidden" aria-hidden />
          <div className="flex items-center gap-1.5 max-[720px]:ml-auto" role="group" aria-label="확대">
            <button type="button" onClick={() => apiRef.current?.zoomOut()} className={tmIconBtn} aria-label="작게">
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 10h12" /></svg>
            </button>
            {mode === 'map' && (
              <span className="w-[46px] text-center text-[13.5px] font-bold tabular-nums text-tm-sub" aria-live="off">{Math.round(zoom * 100)}%</span>
            )}
            <button type="button" onClick={() => apiRef.current?.zoomIn()} className={tmIconBtn} aria-label="크게">
              <IconPlus size={16} />
            </button>
            <button type="button" onClick={() => apiRef.current?.fit()} className={tmGhostBtn}
              title={mode === 'present' ? '처음 장(개요)으로' : '전체가 보이게 맞추기 (0)'}>
              {mode === 'present' ? '개요' : '맞춤'}
            </button>
          </div>
        </div>
      </div>

      {/* 고른 보기 */}
      <div className={`relative min-h-0 flex-1 ${mode === 'map' ? '' : 'bg-[#0b1220]'}`}>
        {mode === 'map' && (
          <ElixirCanvas data={built.data} cat={cat} label={label} toggled={toggled} onActivate={activate} api={apiRef} onZoom={setZoom} />
        )}
        {mode === '3d' && (
          <Graph3D graph={graph} showTasks={showTasks} showLinks={showLinks} rotate={rotate}
            onOpenDoc={openDoc} onOpenTask={openTask} api={apiRef} />
        )}
        {mode === 'present' && (
          <WikiPresent graph={graph} label={label} onOpenDoc={openDoc} onOpenTask={openTask} api={apiRef} />
        )}

        {/* 아래 문서가 없는 카테고리 - 무엇을 하면 되는지(위쪽에 - 프레젠테이션의 넘기기 막대와 겹치지 않게) */}
        {built.empty && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-4">
            <div className="pointer-events-auto flex max-w-[560px] flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-tm border border-tm-line bg-white px-5 py-3.5 text-center shadow-tm-up">
              <p className="text-[14.5px] leading-[1.6] text-tm-ink">
                {catDoc
                  ? <>아직 <b className="font-bold text-tm-deep">{titleOf(catDoc)}</b> 아래에 문서가 없습니다. 문서를 만들면 가지로 펼쳐집니다.</>
                  : '아직 문서가 없습니다. 카테고리부터 만들어 보세요.'}
              </p>
              {canCreate && (
                <button type="button" onClick={() => onAddChild(catDoc?.id ?? null)}
                  className="inline-flex h-[38px] items-center gap-1.5 rounded-tm-sm bg-tm-blue px-3.5 text-[14px] font-bold text-white transition-colors hover:bg-tm-blue-hover [@media(pointer:coarse)]:h-11">
                  <IconPlus size={16} />
                  {catDoc ? '하위 문서 만들기' : '새 문서'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 읽는 법 · 새 문서 - 지도 아래 띠(지도 위에 띄우면 가장자리 노드를 가린다) */}
      {!built.empty && (
        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-t border-tm-line px-4 py-2 text-[13px] font-semibold text-tm-sub max-[720px]:px-3">
          {mode === 'map' && (
            <>
              <span className="max-[900px]:hidden">문서를 누르면 열립니다 · 끌거나 휠로 옮기고 Ctrl+휠로 확대합니다</span>
              <span className="hidden max-[900px]:inline">누르면 열립니다 · 두 손가락으로 확대</span>
            </>
          )}
          {mode === '3d' && (
            <>
              <span className="max-[900px]:hidden">끌어서 돌리고 휠로 확대합니다 · 누르면 가까이 가고, 두 번 누르면 문서가 열립니다</span>
              <span className="hidden max-[900px]:inline">끌어서 돌리기 · 두 번 누르면 열림</span>
            </>
          )}
          {mode === 'present' && (
            <>
              <span className="max-[900px]:hidden">← → 로 넘기고 원을 누르면 들어갑니다 · 빈 곳을 누르면 한 단계 밖으로 · 두 번 누르면 문서가 열립니다</span>
              <span className="hidden max-[900px]:inline">원을 누르면 들어갑니다 · 두 번 누르면 열림</span>
            </>
          )}
          {mode !== 'present' && links > 0 && (
            <span className="inline-flex items-center gap-1.5">
              {mode === 'map'
                ? <svg width="26" height="6" aria-hidden><path d="M1 3h24" stroke="#5b6676" strokeWidth="1.6" strokeDasharray="6 5" /></svg>
                : <svg width="26" height="6" aria-hidden><path d="M1 3h24" stroke="#4f74e8" strokeWidth="2.2" /></svg>}
              문서 링크 {links}
            </span>
          )}
          {showTasks && taskCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              {(['todo', 'doing', 'review', 'done'] as const).map((st) => (
                <i key={st} className="h-2 w-2 rounded-full" style={{ background: STATUS_DOT[st] }} title={statusLabel(st)} />
              ))}
              작업 {taskCount}
            </span>
          )}
          {canCreate && catDoc && (
            <button type="button" onClick={() => onAddChild(catDoc.id)} className={`ml-auto ${tmGhostBtn}`}>
              <IconPlus size={16} />
              <span className="max-[720px]:hidden">{titleOf(catDoc)} 아래에 </span>새 문서
            </button>
          )}
        </div>
      )}
    </div>
  );
}
