'use client';

/**
 * 조직도의 마인드맵 모양 - 팀 위키 마인드맵(WikiMap)과 같은 엔진(Mind Elixir, 보기 전용)과 모양.
 * 가운데 MATE → 팀(팀별) 또는 맨 위 사람(보고 체계) → 사람 → 그 사람의 가지(맡은 일 · MATE Studio 도구 · 구글 폴더).
 * 트리 모양과 같은 조직도 데이터(orgChart.ts 의 buildOrg)를 그대로 쓰고, 누르면 같은 옆 칸이 열린다(Org.tsx).
 * 마인드맵을 고를 때만 불러온다(엔진 42KB gz).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import MindElixir from 'mind-elixir';
import type { MindElixirData, NodeObj, Operation, SubLineParams, Theme, Topic } from 'mind-elixir';
import 'mind-elixir/style.css';
import './wikimap.css';
import './orgmind.css';
import { TASK_COLORS, type Member } from './types';
import { usePainter, type Painter } from './colorStore';
import { PAINT } from './ui';
import type { CanvasApi } from './wikiGraph';
import { DRIVE_FOLDER, type DriveTree } from './driveTree';
import { NO_UNIT, blankEntry, dutyLines, shortName, toolsOf, type OrgNode, type OrgTree, type OrgView } from './orgChart';

/** 사람 가지로 붙일 것 */
export interface MindDetails { duties: boolean; tools: boolean; folders: boolean }

type Meta =
  | { kind: 'root' }
  | { kind: 'unit'; name: string }
  | { kind: 'person'; id: string }
  | { kind: 'detail'; id: string };

/** 노드 사이 가로 틈 · 처음 열 때 이보다 작게는 줄이지 않는다 - WikiMap 과 같은 값 */
const GAP_X = 26;
const MIN_FIT = 0.75;
/** 맡은 일 가지에 적는 줄 · 폴더 가지에 적는 폴더 - 넘치면 '외 N' */
const DUTY_LINES = 5;
const FOLDER_LINES = 4;

/** 잔가지 선 - 부모 상자 옆 가운데에서 자식 상자 옆 가운데로(WikiMap 과 같다) */
function subBranch({ pT, pL, pW, pH, cT, cL, cW, cH, direction }: SubLineParams): string {
  const y1 = pT + pH / 2;
  const y2 = cT + cH / 2;
  const [x1, x2] = direction === 'lhs' ? [pL + GAP_X, cL + cW - GAP_X] : [pL + pW - GAP_X, cL + GAP_X];
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`;
}

const PALETTE = TASK_COLORS.map((c) => PAINT[c.id].solid);

/* WikiMap 의 테마와 같은 값 - 위키 코드를 이 조각에 싣지 않으려고 옮겨 적었다 */
const THEME: Theme = {
  name: 'MATE',
  type: 'light',
  palette: PALETTE,
  generateSubBranch: subBranch,
  cssVar: {
    '--node-gap-x': `${GAP_X}px`,
    '--node-gap-y': '9px',
    '--main-gap-x': '54px',
    '--main-gap-y': '14px',
    '--main-color': 'rgb(var(--tm-ink))',
    '--main-bgcolor': 'rgb(var(--tm-card))',
    '--main-bgcolor-transparent': 'rgb(var(--tm-card) / 0.9)',
    '--color': 'rgb(var(--tm-ink))',
    '--bgcolor': 'rgb(var(--tm-bg))',
    '--selected': 'rgb(var(--tm-blue))',
    '--accent-color': 'rgb(var(--tm-blue))',
    '--root-color': '#ffffff',
    '--root-bgcolor': 'rgb(var(--tm-blue))',
    '--root-border-color': 'rgb(var(--tm-blue))',
    '--root-radius': '14px',
    '--main-radius': '12px',
    '--topic-padding': '7px 11px',
    '--panel-color': 'rgb(var(--tm-ink))',
    '--panel-bgcolor': 'rgb(var(--tm-card))',
    '--panel-border-color': 'rgb(var(--tm-line))',
    '--map-padding': '56px 72px',
  },
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const FOLDER_SVG = '<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"><path d="M2.6 5.2c0-.6.4-1 1-1h4.1l1.7 1.9h7c.6 0 1 .4 1 1v8.1c0 .6-.4 1-1 1H3.6c-.6 0-1-.4-1-1z" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

/* ── 지도 만들기 ─────────────────────────────────────── */

interface BuildInput {
  tree: OrgTree;
  view: OrgView;
  me: string;
  dtree: DriveTree | null;
  openTasks: Map<string, number>;
  /** 찾기 · 도구로 짚은 사람 - null 이면 짚지 않음 */
  hits: Set<string> | null;
  selected: string;
  details: MindDetails;
  /** 사람이 펼치거나 접은 것(true = 펼침) */
  toggled: ReadonlyMap<string, boolean>;
  paint: Painter;
  narrow: boolean;
}

function buildData(x: BuildInput): MindElixirData<Meta> {
  const avatar = (m: Member) => {
    const p = PAINT[x.paint.member(m.id)];
    const bg = m.avatar ? `${p.bg} url('${esc(m.avatar)}') center/cover;color:transparent` : `${p.bg};color:${p.fg}`;
    return `<i style="background:${bg}" title="${esc(m.name)}">${esc(m.initial)}</i>`;
  };
  /** 엔진 노드 id - 팀 이름은 아무 글자나 될 수 있어 차례 번호로 */
  const unitIds = new Map<string, string>();
  const idOf = (n: OrgNode) => {
    if (n.kind === 'root') return 'root';
    if (n.kind === 'person') return `p-${n.key}`;
    let id = unitIds.get(n.key);
    if (!id) { id = `u-${unitIds.size}`; unitIds.set(n.key, id); }
    return id;
  };
  const folded = (id: string, kids: number) => (kids ? x.toggled.get(id) ?? true : undefined);
  const selectedStyle = { background: 'rgb(var(--tm-tint))', border: '2px solid rgb(var(--tm-blue))' };
  const detailStyle = { background: 'rgb(var(--tm-card))', border: '1px solid rgb(var(--tm-line))' };

  const detailsOf = (n: OrgNode): NodeObj<Meta>[] => {
    const m = n.member!;
    const e = n.entry ?? blankEntry(m.id);
    const out: NodeObj<Meta>[] = [];
    const meta = { kind: 'detail', id: n.key } as const;
    if (x.details.duties) {
      const lines = dutyLines(e.duties);
      if (lines.length) {
        out.push({
          id: `d-${n.key}`, topic: `${m.name} 맡은 일`, style: detailStyle, metadata: meta,
          dangerouslySetInnerHTML: `<span class="om-d"><b class="om-h">맡은 일</b>`
            + lines.slice(0, DUTY_LINES).map((l) => `<span class="om-l">${esc(l)}</span>`).join('')
            + (lines.length > DUTY_LINES ? `<span class="om-x">외 ${lines.length - DUTY_LINES}개</span>` : '')
            + '</span>',
        });
      }
    }
    if (x.details.tools) {
      const { pinned, suggested } = toolsOf(m, e);
      const chips = [...pinned.map((a) => `<i class="om-c om-pin" title="${esc(a.name)} · 쓰는 도구">${esc(shortName(a))}</i>`),
        ...suggested.map((s) => `<i class="om-c" title="${esc(s.app.name)} · 추천">${esc(shortName(s.app))}</i>`)];
      out.push({
        id: `t-${n.key}`, topic: `${m.name} 도구`, style: detailStyle, metadata: meta,
        dangerouslySetInnerHTML: `<span class="om-d"><b class="om-h">MATE Studio</b><span class="om-chips">${chips.join('')}</span></span>`,
      });
    }
    if (x.details.folders && e.folders.length) {
      const names = e.folders.map((f) => {
        const node = x.dtree?.byId.get(f.id);
        return node && node.item.mime === DRIVE_FOLDER ? node.item.name : f.name || '드라이브 폴더';
      });
      out.push({
        id: `f-${n.key}`, topic: `${m.name} 구글 폴더`, style: detailStyle, metadata: meta,
        dangerouslySetInnerHTML: `<span class="om-d"><b class="om-h">구글 폴더</b>`
          + names.slice(0, FOLDER_LINES).map((nm) => `<span class="om-l om-f">${FOLDER_SVG}<span>${esc(nm)}</span></span>`).join('')
          + (names.length > FOLDER_LINES ? `<span class="om-x">외 ${names.length - FOLDER_LINES}개</span>` : '')
          + '</span>',
      });
    }
    return out;
  };

  const nodeOf = (n: OrgNode, depth: number, color: string): NodeObj<Meta> => {
    const id = idOf(n);
    const sel = n.key === x.selected;
    if (n.kind === 'unit') {
      const kids = n.kids.map((k) => nodeOf(k, depth + 1, color));
      // 팀 안의 모든 사람(상위 아래에 있는 사람도) - 바로 아래만 세면 팀장 한 명만 보인다
      const people: OrgNode[] = [];
      const walk = (k: OrgNode) => { if (k.kind === 'person' && k.member) people.push(k); k.kids.forEach(walk); };
      n.kids.forEach(walk);
      return {
        id, topic: n.label, children: kids, expanded: folded(id, kids.length),
        ...(depth === 1 ? { branchColor: color } : {}),
        style: sel ? selectedStyle : depth === 1 ? { border: `2px solid ${color}` } : {},
        metadata: { kind: 'unit', name: n.label },
        dangerouslySetInnerHTML: `<span class="wm-n om-n${n.label === NO_UNIT ? ' om-none' : ''}">`
          + `<span class="wm-t"><i class="wm-dot" style="background:${color}"></i><span class="wm-tt">${esc(n.label)}</span></span>`
          + `<span class="wm-m">${n.below}명</span>`
          + (people.length ? `<span class="wm-p">${people.slice(0, 6).map((k) => avatar(k.member!)).join('')}${people.length > 6 ? `<b>+${people.length - 6}</b>` : ''}</span>` : '')
          + '</span>',
      };
    }
    const m = n.member!;
    const e = n.entry ?? blankEntry(m.id);
    const kids = [...n.kids.map((k) => nodeOf(k, depth + 1, color)), ...detailsOf(n)];
    const tasks = x.openTasks.get(m.id) ?? 0;
    const counts = [tasks ? `맡은 작업 ${tasks}` : '', e.folders.length ? `폴더 ${e.folders.length}` : ''].filter(Boolean).join(' · ');
    const dim = x.hits !== null && !x.hits.has(n.key);
    const hit = x.hits !== null && x.hits.has(n.key);
    return {
      id, topic: `${m.name} ${m.role}`, children: kids, expanded: folded(id, kids.length),
      ...(depth === 1 ? { branchColor: color } : {}),
      style: sel ? selectedStyle : depth === 1 ? { border: `2px solid ${color}` } : {},
      metadata: { kind: 'person', id: n.key },
      dangerouslySetInnerHTML: `<span class="wm-n om-n${dim ? ' om-dim' : ''}${hit ? ' om-hit' : ''}">`
        + `<span class="wm-t">${avatar(m)}<span class="wm-tt">${esc(m.name)}</span>${m.id === x.me ? '<em class="om-me">나</em>' : ''}</span>`
        + `<span class="wm-m">${esc(m.role || '직무 미정')}${x.view === 'report' && e.unit.trim() ? ` · ${esc(e.unit.trim())}` : ''}</span>`
        + (counts ? `<span class="om-cnt">${esc(counts)}</span>` : '')
        + '</span>',
    };
  };

  const root = x.tree.root;
  const units = x.tree.units.length;
  const nodeData: NodeObj<Meta> = {
    id: 'root',
    topic: 'MATE 조직도',
    children: root.kids.map((k, i) => nodeOf(k, 1, PALETTE[i % PALETTE.length])),
    metadata: { kind: 'root' },
    ...(x.selected === 'root' ? { style: { border: '2px solid rgb(var(--tm-deep))' } } : {}),
    dangerouslySetInnerHTML: `<span class="wm-n wm-root"><span class="wm-t"><span class="wm-tt">${esc(root.label)}</span></span>`
      + `<span class="wm-m">조직도${units ? ` · 팀 ${units}개` : ''}</span></span>`,
  };
  return { nodeData, direction: x.narrow ? MindElixir.RIGHT : MindElixir.SIDE };
}

/* ── 칸 ─────────────────────────────────────────── */

export default function OrgMind({ tree, view, me, dtree, openTasks, hits, selected, details, narrow, onPick, api, onZoom }: {
  tree: OrgTree;
  view: OrgView;
  me: string;
  dtree: DriveTree | null;
  openTasks: Map<string, number>;
  hits: Set<string> | null;
  selected: string;
  details: MindDetails;
  narrow: boolean;
  /** 옆 칸에 열 것 - 'root' · 'unit:<이름>' · 팀원 id */
  onPick(key: string): void;
  api: MutableRefObject<CanvasApi | null>;
  onZoom(scale: number): void;
}) {
  const paint = usePainter();
  /* 사람이 펼치고 접은 것 - 보기(팀별 · 보고 체계)를 바꾸면 지운다 */
  const [toggled, setToggled] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const [shownView, setShownView] = useState(view);
  if (shownView !== view) {
    setShownView(view);
    setToggled(new Map());
  }
  const data = useMemo(
    () => buildData({ tree, view, me, dtree, openTasks, hits, selected, details, toggled, paint, narrow }),
    [tree, view, me, dtree, openTasks, hits, selected, details, toggled, paint, narrow],
  );
  const fitKey = `${view}|${details.duties}|${details.tools}|${details.folders}`;
  const onToggle = useCallback((id: string, expanded: boolean) => {
    setToggled((t) => new Map(t).set(id, expanded));
  }, []);
  const onActivate = useCallback((n: NodeObj<Meta> | undefined) => {
    const meta = n?.metadata;
    if (!meta) return;
    if (meta.kind === 'root') onPick('root');
    else if (meta.kind === 'unit') onPick(`unit:${meta.name}`);
    else onPick(meta.id);
  }, [onPick]);

  return (
    <div className="tm-wikimap tm-orgmind absolute inset-0">
      {/* 방향(휴대폰은 오른쪽으로만)이 바뀌면 엔진을 새로 띄운다 */}
      <MindCanvas key={narrow ? 'right' : 'side'} data={data} fitKey={fitKey} onToggle={onToggle} onActivate={onActivate}
        api={api} onZoom={onZoom} alignLeft={narrow} />
    </div>
  );
}

function MindCanvas({ data, fitKey, onToggle, onActivate, api, onZoom, alignLeft }: {
  data: MindElixirData<Meta>;
  /** 오른쪽으로만 펼칠 때(휴대폰) - 맞춘 뒤 가운데(MATE)를 왼쪽 가장자리에 붙인다(가운데로 두면 화면 밖에 걸린다) */
  alignLeft: boolean;
  fitKey: string;
  onToggle(id: string, expanded: boolean): void;
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
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;

  const fit = useCallback((readable = true) => {
    const m = mindRef.current;
    if (!m) return;
    m.scaleFit();
    if (readable && m.scaleVal < MIN_FIT) m.scale(MIN_FIT);
    else if (m.scaleVal < 0.25) m.scale(0.25);
    zoomRef.current(m.scaleVal);
    const host = hostRef.current;
    const root = host?.querySelector('.me-root .me-tpc');
    if (alignLeft && host && root) {
      const dx = host.getBoundingClientRect().left + 16 - root.getBoundingClientRect().left;
      if (Math.abs(dx) > 1) m.move(dx, 0);
    }
  }, [alignLeft]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const mind = new MindElixir({
      el,
      direction: dataRef.current.direction ?? MindElixir.SIDE,
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

    /* 누르면 옆 칸에 - 끌어서 옮긴 것(6px 넘게)과 펼치기 단추는 빼고 */
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

    const onDrawn = () => {
      el.querySelectorAll<Topic<Meta>>('.me-tpc').forEach((tpc) => {
        const kind = tpc.nodeObj?.metadata?.kind;
        tpc.title = kind === 'person' || kind === 'unit' ? `${tpc.nodeObj.topic} · 누르면 옆에 자세히` : '';
      });
    };
    mind.bus.addListener('linkDiv', onDrawn);
    onDrawn();

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

  /* 내용이 바뀌면 다시 그린다. 보기 · 가지를 바꿨으면 화면에도 다시 맞춘다 */
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

  /* ── 키보드 - 화살표로 옮기고 Enter 로 옆 칸에(엔진의 키 처리는 편집용이라 끄고 여기서 한다) ── */
  const say = (tpc: Topic<Meta>) => {
    const kids = tpc.nodeObj.children?.length ?? 0;
    setLive(`${tpc.nodeObj.topic}${kids ? `, 아래 ${kids}개${tpc.nodeObj.expanded === false ? ' 접힘' : ''}` : ''}`);
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
      <div className="absolute inset-0 isolate">
        <div ref={hostRef} tabIndex={0} onKeyDown={onKeyDown}
          onFocus={(e) => {
            const m = mindRef.current;
            if (!m || m.currentNode || !e.currentTarget.matches(':focus-visible')) return;
            const r = e.currentTarget.querySelector<Topic<Meta>>('.me-root .me-tpc');
            if (r) { m.selectNode(r); say(r); }
          }}
          role="application" aria-roledescription="마인드맵"
          aria-label="조직도 마인드맵. 화살표로 옮기고 Enter 로 옆 칸에 자세히 봅니다"
          aria-describedby="om-live"
          className="wm-host h-full w-full" />
      </div>
      <p id="om-live" className="sr-only" aria-live="polite">{live}</p>
    </>
  );
}
