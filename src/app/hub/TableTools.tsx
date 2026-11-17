'use client';

/*
 * 표 도구 - Confluence 처럼 표 둘레에서 바로 고친다(편집 모드).
 *
 *   위쪽 막대 · 왼쪽 막대   열 · 행 손잡이. 누르면 그 열 · 행을 고르고 메뉴, 끌면 옮긴다. Shift 로 이어서 여러 개
 *   모서리                  표 전체 고르기
 *   경계의 점               마우스를 올리면 + - 그 자리에 열 · 행 넣기(넣을 자리에 파란 선)
 *   셀 오른쪽 위 ▾          셀 메뉴(셀 색 · 합치기 · 나누기 · 넣기 · 지우기) - Shift+F10
 *   표 아래 막대            머리글 행 · 머리글 열 · 열 너비 맞추기 · 너비 되돌리기 · 표 지우기
 *   지우기에 올리면          지울 곳을 빨갛게 미리 보인다
 *
 * 표 DOM 안에는 아무것도 넣지 않는다(ProseMirror 가 다시 그린다). 편집기 틀(.tm-editor-frame) 위에 겹쳐 그리고,
 * 글 · 선택 · 크기 · 가로 스크롤이 바뀔 때마다 셀 자리를 다시 잰다
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import type { Command } from '@tiptap/pm/state';
import { columnIsHeader, mergeCells, moveTableColumn, moveTableRow, rowIsHeader, setCellAttr, splitCell } from '@tiptap/pm/tables';
import * as T from './tableOps';

export type TableMenuClose = 'escape' | 'tab' | 'outside';
export interface TableMenuProps {
  anchor: HTMLElement | null;
  label: string;
  onClose(why: TableMenuClose): void;
  children: React.ReactNode;
  align?: 'start' | 'end';
  width?: number;
}

interface Props {
  editor: Editor;
  /** 떠 있는 메뉴(편집기의 FloatMenu) */
  Menu: React.ComponentType<TableMenuProps>;
  /** 셀 색 [색, 이름] */
  colors: [string, string][];
  notice?(text: string): void;
}

interface Geo {
  pos: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** 가로로 보이는 범위(표가 넓어 스크롤하면 그 칸) */
  clipL: number;
  clipR: number;
  cols: { l: number; r: number }[];
  rows: { t: number; b: number }[];
  /** 커서 · 고른 셀 끝의 셀 자리(셀 메뉴 단추) */
  cell: { l: number; r: number; t: number } | null;
}

type Span = { top: number; bottom: number; left: number; right: number };
type MenuKind = 'col' | 'row' | 'cell';
type Drag = { axis: 'row' | 'col'; from: number; boundary: number | null };

/** 손잡이 굵기 · 표와의 틈 */
const GRIP = 10;
const GAP = 4;

const findTablePosByDom = (editor: Editor, el: Element): number | null => {
  const wrap = el.closest('.tableWrapper') ?? el.closest('table');
  if (!wrap) return null;
  let found: number | null = null;
  editor.state.doc.descendants((n, pos) => {
    if (found !== null) return false;
    if (n.type.spec.tableRole === 'table') {
      const dom = editor.view.nodeDOM(pos);
      if (dom === wrap || (dom instanceof HTMLElement && dom.contains(wrap))) found = pos;
      return false;
    }
    return true;
  });
  return found;
};

export default function TableTools({ editor, Menu, colors, notice }: Props) {
  /* 커서가 든 표 - 셀 메뉴 단추 · 아래 막대는 이 표에만 */
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e.isEditable) return null;
      const t = T.tableAround(e.state);
      if (!t) return null;
      const p = T.picked(e.state, t);
      let widths = false;
      t.node.descendants((c) => { if (c.attrs.colwidth) widths = true; return !widths && c.type.spec.tableRole !== 'cell' && c.type.spec.tableRole !== 'header_cell'; });
      return {
        pos: t.pos,
        pick: p,
        w: t.map.width,
        h: t.map.height,
        canMerge: mergeCells(e.state),
        canSplit: splitCell(e.state),
        headerRow: rowIsHeader(t.map, t.node, 0),
        headerCol: columnIsHeader(t.map, t.node, 0),
        widths,
      };
    },
  });

  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const active = s?.pos ?? hoverPos;
  const activeRef = useRef(active);
  activeRef.current = active;
  const [geo, setGeo] = useState<Geo | null>(null);
  const [menu, setMenu] = useState<{ kind: MenuKind; anchor: HTMLElement } | null>(null);
  const [danger, setDanger] = useState<Span | 'table' | null>(null);
  const [line, setLine] = useState<{ axis: 'row' | 'col'; at: number } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const cellBtn = useRef<HTMLButtonElement>(null);
  const press = useRef<{ axis: 'row' | 'col'; index: number; x: number; y: number; moved: boolean; shift: boolean } | null>(null);
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const grip = coarse ? 16 : GRIP;

  const frameOf = useCallback(() => editor.view.dom.closest('.tm-editor-frame') as HTMLElement | null, [editor]);

  /* ── 자리 재기 ───────────────────────────────────── */
  const measure = useCallback(() => {
    if (editor.isDestroyed) return;
    const view = editor.view;
    const frame = frameOf();
    const pos = activeRef.current;
    const t = pos == null ? null : T.tableAt(editor.state, pos);
    const dom = t ? (view.nodeDOM(t.pos) as HTMLElement | null) : null;
    const tableEl = dom ? (dom.tagName === 'TABLE' ? (dom as HTMLTableElement) : dom.querySelector('table')) : null;
    if (!frame || !t || !dom || !tableEl) { setGeo(null); return; }
    const f = frame.getBoundingClientRect();
    const tb = tableEl.getBoundingClientRect();
    const wb = dom.getBoundingClientRect();
    const w = t.map.width;
    const rows = Array.from(tableEl.rows).slice(0, t.map.height).map((r) => {
      const b = r.getBoundingClientRect();
      return { t: b.top - f.top, b: b.bottom - f.top };
    });
    const edges: (number | undefined)[] = new Array(w + 1).fill(undefined);
    const seen = new Set<number>();
    for (const p of t.map.map) {
      if (seen.has(p)) continue;
      seen.add(p);
      const el = view.nodeDOM(t.start + p) as HTMLElement | null;
      if (!el?.getBoundingClientRect) continue;
      const r = t.map.findCell(p);
      const b = el.getBoundingClientRect();
      const one = r.right - r.left === 1;
      if (one || edges[r.left] === undefined) edges[r.left] = b.left - f.left;
      if (one || edges[r.right] === undefined) edges[r.right] = b.right - f.left;
    }
    edges[0] ??= tb.left - f.left;
    edges[w] ??= tb.right - f.left;
    for (let i = 1; i < w; i += 1) {
      if (edges[i] !== undefined) continue;
      let j = i + 1;
      while (edges[j] === undefined) j += 1;
      const a = edges[i - 1] as number;
      edges[i] = a + ((edges[j] as number) - a) / (j - i + 1);
    }
    const cols = Array.from({ length: w }, (_, c) => ({ l: edges[c] as number, r: edges[c + 1] as number }));
    let cell: Geo['cell'] = null;
    const p = T.picked(editor.state, t);
    if (p && s?.pos === t.pos) {
      const head = t.map.map[Math.min(p.bottom - 1, t.map.height - 1) * w + Math.min(p.right - 1, w - 1)];
      const el = view.nodeDOM(t.start + head) as HTMLElement | null;
      if (el?.getBoundingClientRect) {
        const b = el.getBoundingClientRect();
        cell = { l: b.left - f.left, r: b.right - f.left, t: b.top - f.top };
      }
    }
    setGeo({
      pos: t.pos, top: tb.top - f.top, bottom: tb.bottom - f.top, left: tb.left - f.left, right: tb.right - f.left,
      clipL: wb.left - f.left + 1, clipR: wb.right - f.left - 1, cols, rows, cell,
    });
  }, [editor, frameOf, s?.pos]);

  const raf = useRef(0);
  const schedule = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(measure);
  }, [measure]);

  useLayoutEffect(() => { measure(); }, [measure, active, s]);

  useEffect(() => {
    const onTr = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      // 다른 팀원의 고침 등으로 표가 바뀌면 열린 메뉴는 엉뚱한 행 · 열을 고칠 수 있다 - 닫는다
      if (transaction.docChanged) { setMenu(null); setDanger(null); setLine(null); }
      schedule();
    };
    editor.on('transaction', onTr);
    window.addEventListener('resize', schedule);
    return () => {
      editor.off('transaction', onTr);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf.current);
    };
  }, [editor, schedule]);

  /* 표 크기 · 가로 스크롤이 바뀌면 다시 잰다(셀 안 그림이 늦게 열리는 것 등) */
  useEffect(() => {
    if (active == null) return;
    const dom = editor.view.nodeDOM(active) as HTMLElement | null;
    if (!dom) return;
    const ro = new ResizeObserver(schedule);
    ro.observe(dom);
    dom.addEventListener('scroll', schedule);
    return () => { ro.disconnect(); dom.removeEventListener('scroll', schedule); };
  }, [editor, active, schedule]);

  /* 마우스를 올린 표 - 커서가 없어도 손잡이를 보인다 */
  useEffect(() => {
    const frame = frameOf();
    if (!frame) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const move = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el || el.closest('.tm-tt')) { if (timer) { clearTimeout(timer); timer = null; } return; }
      const pos = el.closest('.tableWrapper, table') ? findTablePosByDom(editor, el) : null;
      if (pos !== null) {
        if (timer) { clearTimeout(timer); timer = null; }
        setHoverPos((p) => (p === pos ? p : pos));
      } else if (!timer) {
        timer = setTimeout(() => { timer = null; setHoverPos(null); }, 400);
      }
    };
    const leave = () => { if (!timer) timer = setTimeout(() => { timer = null; setHoverPos(null); }, 400); };
    frame.addEventListener('mousemove', move);
    frame.addEventListener('mouseleave', leave);
    return () => {
      if (timer) clearTimeout(timer);
      frame.removeEventListener('mousemove', move);
      frame.removeEventListener('mouseleave', leave);
    };
  }, [editor, frameOf]);

  /* ── 명령 ────────────────────────────────────────── */
  const table = useCallback(() => (geo ? T.tableAt(editor.state, geo.pos) : null), [editor, geo]);
  const pickNow = useCallback(() => { const t = table(); return t ? T.picked(editor.state, t) : null; }, [editor, table]);
  // scrollIntoView 는 붙이지 않는다 - 바깥 화면(작업 관리 셸)까지 밀어 올려 왼쪽 메뉴가 위로 밀린다
  const dispatch = useCallback((tr: ReturnType<typeof T.selectRows> | null) => {
    if (tr) editor.view.dispatch(tr);
  }, [editor]);
  const cmd = useCallback((c: Command) => c(editor.state, editor.view.dispatch), [editor]);
  const done = useCallback(() => {
    setMenu(null);
    setDanger(null);
    setLine(null);
    editor.view.focus();
  }, [editor]);

  const openCellMenu = useCallback(() => {
    if (cellBtn.current) setMenu({ kind: 'cell', anchor: cellBtn.current });
  }, []);
  useEffect(() => {
    const st = (editor.storage as unknown as Record<string, T.TableKeysStorage | undefined>).tmTableKeys;
    if (!st) return;
    st.openCellMenu = openCellMenu;
    return () => { if (st.openCellMenu === openCellMenu) st.openCellMenu = null; };
  }, [editor, openCellMenu]);

  /** 손잡이를 누름 - 고르고 메뉴(Shift 면 이어서 고르기만) */
  const pickLine = (axis: 'row' | 'col', index: number, shift: boolean, anchor: HTMLElement | null) => {
    const t = table();
    if (!t) return;
    const p = T.picked(editor.state, t);
    const same = p && p.kind === (axis === 'row' ? 'row' : 'col');
    let a = index;
    if (shift && same && p) {
      if (axis === 'row') a = index >= p.top ? p.top : p.bottom - 1;
      else a = index >= p.left ? p.left : p.right - 1;
    }
    dispatch(axis === 'row' ? T.selectRows(editor.state, t, a, index) : T.selectCols(editor.state, t, a, index));
    editor.view.focus();
    if (!shift && anchor) setMenu({ kind: axis, anchor });
  };

  const boundaryAt = (axis: 'row' | 'col', clientX: number, clientY: number) => {
    const frame = frameOf();
    if (!frame || !geo) return null;
    const f = frame.getBoundingClientRect();
    const edges = axis === 'col' ? [geo.cols[0]?.l ?? 0, ...geo.cols.map((c) => c.r)] : [geo.rows[0]?.t ?? 0, ...geo.rows.map((r) => r.b)];
    const v = axis === 'col' ? clientX - f.left : clientY - f.top;
    let best = 0;
    edges.forEach((e, i) => { if (Math.abs(e - v) < Math.abs(edges[best] - v)) best = i; });
    return best;
  };

  const gripDown = (axis: 'row' | 'col', index: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    press.current = { axis, index, x: e.clientX, y: e.clientY, moved: false, shift: e.shiftKey };
  };
  const gripMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6) return;
    if (!p.moved) {
      p.moved = true;
      setMenu(null);
      const t = table();
      if (t) dispatch(p.axis === 'row' ? T.selectRows(editor.state, t, p.index, p.index) : T.selectCols(editor.state, t, p.index, p.index));
    }
    setDrag({ axis: p.axis, from: p.index, boundary: boundaryAt(p.axis, e.clientX, e.clientY) });
  };
  const gripUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    press.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!p) return;
    if (!p.moved) {
      pickLine(p.axis, p.index, p.shift, e.currentTarget);
      return;
    }
    const b = boundaryAt(p.axis, e.clientX, e.clientY);
    setDrag(null);
    const to = b === null ? null : T.dropTarget(p.index, b);
    const t = table();
    if (to === null || !t) return;
    const ok = cmd((p.axis === 'row' ? moveTableRow : moveTableColumn)({ from: p.index, to, select: true, pos: t.start }));
    if (!ok) notice?.(`합친 셀이 걸쳐 있어 이 ${p.axis === 'row' ? '행' : '열'}을 옮길 수 없습니다. 셀을 나눈 뒤 옮겨 주세요`);
    editor.view.focus();
  };
  const gripCancel = () => { press.current = null; setDrag(null); };
  /** 키보드로 누름(Enter · Space) - 고르고 메뉴 */
  const gripKey = (axis: 'row' | 'col', index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) pickLine(axis, index, e.shiftKey, e.currentTarget);
  };

  const insertAt = (axis: 'row' | 'col', b: number) => {
    const t = table();
    if (!t) return;
    const p = T.picked(editor.state, t);
    dispatch(axis === 'col' ? T.insertColumnAt(editor.state, t, b, 0) : T.insertRowAt(editor.state, t, b, p?.left ?? 0));
    setLine(null);
    editor.view.focus();
  };

  const run = (make: (t: T.TableInfo, p: T.Picked) => ReturnType<typeof T.selectRows> | null | string) => {
    const t = table();
    const p = pickNow();
    if (!t || !p) return;
    const out = make(t, p);
    if (typeof out === 'string') notice?.(out);
    else dispatch(out);
    done();
  };
  const deleteRows = () => { if (!editor.commands.deleteRow()) editor.commands.deleteTable(); done(); };
  const deleteCols = () => { if (!editor.commands.deleteColumn()) editor.commands.deleteTable(); done(); };
  const measuredWidths = () => (geo ? geo.cols.map((c) => c.r - c.l) : []);

  const swatches = (
    <>
      <p className="tm-menu-label" aria-hidden>셀 색</p>
      <div className="tm-swatches" role="group" aria-label="셀 색">
        <button type="button" role="menuitem" tabIndex={-1} className="tm-swatch is-none" title="색 없음" aria-label="셀 색 없음"
          onClick={() => { cmd(setCellAttr('background', null)); done(); }} />
        {colors.map(([hex, name]) => (
          <button key={hex} type="button" role="menuitem" tabIndex={-1} className="tm-swatch" style={{ background: hex }} title={name} aria-label={`셀 색 ${name}`}
            onClick={() => { cmd(setCellAttr('background', hex)); done(); }} />
        ))}
      </div>
    </>
  );
  /** 지우기 항목 - 올리면 지울 곳을 빨갛게 */
  const dangerItem = (label: string, span: Span | 'table', act: () => void) => (
    <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item is-danger"
      onMouseEnter={() => setDanger(span)} onMouseLeave={() => setDanger(null)} onFocus={() => setDanger(span)} onBlur={() => setDanger(null)}
      onClick={act}>{label}</button>
  );
  const item = (label: string, act: () => void, opts: { disabled?: boolean; hint?: string; kbd?: string } = {}) => (
    <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" disabled={opts.disabled} title={opts.disabled ? opts.hint : undefined} onClick={act}>
      <span>{label}</span>
      {opts.kbd && <kbd className="tm-menu-md">{opts.kbd}</kbd>}
    </button>
  );

  if (!geo) return null;
  const t = T.tableAt(editor.state, geo.pos);
  if (!t) return null;
  const mine = s?.pos === geo.pos;
  const p = mine ? s?.pick ?? null : null;
  const colOn = (c: number) => !!p && (p.kind === 'col' || p.kind === 'table') && c >= p.left && c < p.right;
  const rowOn = (r: number) => !!p && (p.kind === 'row' || p.kind === 'table') && r >= p.top && r < p.bottom;
  const visible = (l: number, r: number) => r - l >= 4;
  const clip = (l: number, r: number) => ({ l: Math.max(l, geo.clipL), r: Math.min(r, geo.clipR) });
  const x0 = Math.max(geo.left, geo.clipL);
  const colTop = geo.top - GAP - grip;
  const rowLeft = x0 - GAP - grip;
  const spanBox = (sp: Span | 'table') => {
    const r = sp === 'table' ? { top: 0, bottom: t.map.height, left: 0, right: t.map.width } : sp;
    const c = clip(geo.cols[r.left]?.l ?? geo.left, geo.cols[r.right - 1]?.r ?? geo.right);
    return { left: c.l, top: geo.rows[r.top]?.t ?? geo.top, width: Math.max(0, c.r - c.l), height: (geo.rows[r.bottom - 1]?.b ?? geo.bottom) - (geo.rows[r.top]?.t ?? geo.top) };
  };
  const pickSpan: Span | null = p ? { top: p.top, bottom: p.bottom, left: p.left, right: p.right } : null;
  const mod = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘⌥' : 'Ctrl+Alt+';

  return (
    <div className="tm-tt" data-dragging={drag ? '' : undefined}>
      {/* 모서리 - 표 전체 */}
      <button type="button" className={`tm-tt-corner${p?.kind === 'table' ? ' is-on' : ''}`} style={{ left: rowLeft, top: colTop, width: grip, height: grip }}
        title="표 전체 고르기" aria-label="표 전체 고르기" onMouseDown={(e) => e.preventDefault()}
        onClick={() => { const tt = table(); if (tt) { dispatch(T.selectTable(editor.state, tt)); editor.view.focus(); } }} />

      {/* 열 손잡이 */}
      {geo.cols.map((c, i) => {
        const v = clip(c.l + 1, c.r - 1);
        if (!visible(v.l, v.r)) return null;
        return (
          <button key={`c${i}`} type="button" className={`tm-tt-grip is-col${colOn(i) ? ' is-on' : ''}`}
            style={{ left: v.l, top: colTop, width: v.r - v.l, height: grip }}
            title="눌러서 열 고르기 · 끌어서 옮기기" aria-label={`${i + 1}번째 열`} aria-haspopup="menu"
            onPointerDown={gripDown('col', i)} onPointerMove={gripMove} onPointerUp={gripUp} onPointerCancel={gripCancel} onClick={gripKey('col', i)} />
        );
      })}
      {/* 행 손잡이 */}
      {geo.rows.map((r, i) => (
        <button key={`r${i}`} type="button" className={`tm-tt-grip is-row${rowOn(i) ? ' is-on' : ''}`}
          style={{ left: rowLeft, top: r.t + 1, width: grip, height: Math.max(4, r.b - r.t - 2) }}
          title="눌러서 행 고르기 · 끌어서 옮기기" aria-label={`${i + 1}번째 행`} aria-haspopup="menu"
          onPointerDown={gripDown('row', i)} onPointerMove={gripMove} onPointerUp={gripUp} onPointerCancel={gripCancel} onClick={gripKey('row', i)} />
      ))}

      {/* 경계의 넣기 단추 */}
      {!drag && [geo.cols[0]?.l ?? geo.left, ...geo.cols.map((c) => c.r)].map((x, b) => (x < geo.clipL - 1 || x > geo.clipR + 1 ? null : (
        <button key={`ac${b}`} type="button" className="tm-tt-add" style={{ left: x - 9, top: colTop + grip / 2 - 9 }}
          title="여기에 열 넣기" aria-label={`${b + 1}번째 자리에 열 넣기`} onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setLine({ axis: 'col', at: x })} onMouseLeave={() => setLine(null)}
          onFocus={() => setLine({ axis: 'col', at: x })} onBlur={() => setLine(null)} onClick={() => insertAt('col', b)}>
          <span aria-hidden><svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span>
        </button>
      )))}
      {!drag && [geo.rows[0]?.t ?? geo.top, ...geo.rows.map((r) => r.b)].map((y, b) => (
        <button key={`ar${b}`} type="button" className="tm-tt-add" style={{ left: rowLeft + grip / 2 - 9, top: y - 9 }}
          title="여기에 행 넣기" aria-label={`${b + 1}번째 자리에 행 넣기`} onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => setLine({ axis: 'row', at: y })} onMouseLeave={() => setLine(null)}
          onFocus={() => setLine({ axis: 'row', at: y })} onBlur={() => setLine(null)} onClick={() => insertAt('row', b)}>
          <span aria-hidden><svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span>
        </button>
      ))}

      {/* 넣을 자리 · 옮길 자리 · 지울 곳 */}
      {line && (line.axis === 'col'
        ? <div className="tm-tt-line" style={{ left: line.at - 1, top: colTop, width: 2, height: geo.bottom - colTop }} />
        : <div className="tm-tt-line" style={{ left: rowLeft, top: line.at - 1, width: Math.min(geo.right, geo.clipR) - rowLeft, height: 2 }} />)}
      {drag && drag.boundary !== null && T.dropTarget(drag.from, drag.boundary) !== null && (drag.axis === 'col'
        ? <div className="tm-tt-drop" style={{ left: ([geo.cols[0]?.l ?? 0, ...geo.cols.map((c) => c.r)][drag.boundary] ?? 0) - 1.5, top: colTop, width: 3, height: geo.bottom - colTop }} />
        : <div className="tm-tt-drop" style={{ left: rowLeft, top: ([geo.rows[0]?.t ?? 0, ...geo.rows.map((r) => r.b)][drag.boundary] ?? 0) - 1.5, width: Math.min(geo.right, geo.clipR) - rowLeft, height: 3 }} />)}
      {danger && <div className="tm-tt-danger" style={spanBox(danger)} />}

      {/* 셀 메뉴 단추 */}
      {mine && geo.cell && !drag && geo.cell.r - 26 > geo.clipL && geo.cell.r - 4 < geo.clipR + 1 && (
        <button ref={cellBtn} type="button" className="tm-tt-cellbtn" style={{ left: Math.min(geo.cell.r, geo.clipR) - 25, top: geo.cell.t + 5 }}
          title="셀 메뉴 (Shift+F10)" aria-label="셀 메뉴" aria-haspopup="menu" aria-expanded={menu?.kind === 'cell'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            // 이벤트의 currentTarget 은 처리가 끝나면 비워진다 - 상태 함수보다 먼저 잡아 둔다
            const el = e.currentTarget;
            setMenu((m) => (m?.kind === 'cell' ? null : { kind: 'cell', anchor: el }));
          }}>
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 8l4 4 4-4" /></svg>
        </button>
      )}

      {/* 표 아래 막대 */}
      {mine && s && !drag && (
        <div className="tm-tt-bar" role="toolbar" aria-label="표 도구" style={{ left: geo.clipL - 1, top: geo.bottom + 8 }} onMouseDown={(e) => e.preventDefault()}>
          <button type="button" aria-pressed={s.headerRow} onClick={() => { editor.commands.toggleHeaderRow(); editor.view.focus(); }}>머리글 행</button>
          <button type="button" aria-pressed={s.headerCol} onClick={() => { editor.commands.toggleHeaderColumn(); editor.view.focus(); }}>머리글 열</button>
          <span className="tm-tt-sep" aria-hidden />
          <button type="button" title="모든 열을 같은 너비로" onClick={() => run((tt) => T.distributeColumns(editor.state, tt, measuredWidths(), 0, tt.map.width))}>열 너비 맞추기</button>
          {s.widths && <button type="button" title="열 너비를 본문 폭에 맞춰 다시 나눈다" onClick={() => run((tt) => T.clearColumnWidths(editor.state, tt))}>너비 되돌리기</button>}
          <span className="tm-tt-sep" aria-hidden />
          <button type="button" className="is-danger" onMouseEnter={() => setDanger('table')} onMouseLeave={() => setDanger(null)}
            onFocus={() => setDanger('table')} onBlur={() => setDanger(null)} onClick={() => { editor.commands.deleteTable(); setDanger(null); editor.view.focus(); }}>표 지우기</button>
        </div>
      )}

      {/* 메뉴 */}
      {menu && p && pickSpan && (
        <Menu anchor={menu.anchor} width={232}
          label={menu.kind === 'col' ? '열 메뉴' : menu.kind === 'row' ? '행 메뉴' : '셀 메뉴'}
          onClose={(why) => { setMenu(null); setDanger(null); if (why === 'escape') editor.view.focus(); }}>
          {menu.kind === 'col' && (
            <>
              {item('왼쪽에 열 넣기', () => run((tt, pp) => T.insertColumnAt(editor.state, tt, pp.left, 0)), { kbd: `${mod}←` })}
              {item('오른쪽에 열 넣기', () => run((tt, pp) => T.insertColumnAt(editor.state, tt, pp.right, 0)), { kbd: `${mod}→` })}
              <div className="tm-menu-sep" role="separator" />
              {item('오름차순 정렬', () => run((tt, pp) => T.sortByColumn(editor.state, tt, pp.left, 1)), { disabled: p.right - p.left !== 1, hint: '열 하나를 골라야 정렬할 수 있습니다' })}
              {item('내림차순 정렬', () => run((tt, pp) => T.sortByColumn(editor.state, tt, pp.left, -1)), { disabled: p.right - p.left !== 1, hint: '열 하나를 골라야 정렬할 수 있습니다' })}
              {p.right - p.left > 1 && item('고른 열 너비 맞추기', () => run((tt, pp) => T.distributeColumns(editor.state, tt, measuredWidths(), pp.left, pp.right)))}
              <div className="tm-menu-sep" role="separator" />
              {swatches}
              <div className="tm-menu-sep" role="separator" />
              {item('내용 비우기', () => run((tt, pp) => T.clearCells(editor.state, tt, pp)))}
              {dangerItem(p.right - p.left > 1 ? `열 ${p.right - p.left}개 지우기` : '열 지우기', pickSpan, deleteCols)}
            </>
          )}
          {menu.kind === 'row' && (
            <>
              {item('위에 행 넣기', () => run((tt, pp) => T.insertRowAt(editor.state, tt, pp.top, 0)), { kbd: `${mod}↑` })}
              {item('아래에 행 넣기', () => run((tt, pp) => T.insertRowAt(editor.state, tt, pp.bottom, 0)), { kbd: `${mod}↓` })}
              <div className="tm-menu-sep" role="separator" />
              {swatches}
              <div className="tm-menu-sep" role="separator" />
              {item('내용 비우기', () => run((tt, pp) => T.clearCells(editor.state, tt, pp)))}
              {dangerItem(p.bottom - p.top > 1 ? `행 ${p.bottom - p.top}개 지우기` : '행 지우기', pickSpan, deleteRows)}
            </>
          )}
          {menu.kind === 'cell' && (
            <>
              {swatches}
              <div className="tm-menu-sep" role="separator" />
              {item('셀 합치기', () => { cmd(mergeCells); done(); }, { disabled: !s?.canMerge, hint: '셀 여러 개를 끌어 고르거나 행 · 열 손잡이로 고른 뒤 합칠 수 있습니다' })}
              {item('셀 나누기', () => { cmd(splitCell); done(); }, { disabled: !s?.canSplit, hint: '합친 셀에서만 나눌 수 있습니다' })}
              <div className="tm-menu-sep" role="separator" />
              {item('위에 행 넣기', () => run((tt, pp) => T.insertRowAt(editor.state, tt, pp.top, pp.left)), { kbd: `${mod}↑` })}
              {item('아래에 행 넣기', () => run((tt, pp) => T.insertRowAt(editor.state, tt, pp.bottom, pp.left)), { kbd: `${mod}↓` })}
              {item('왼쪽에 열 넣기', () => run((tt, pp) => T.insertColumnAt(editor.state, tt, pp.left, pp.top)), { kbd: `${mod}←` })}
              {item('오른쪽에 열 넣기', () => run((tt, pp) => T.insertColumnAt(editor.state, tt, pp.right, pp.top)), { kbd: `${mod}→` })}
              <div className="tm-menu-sep" role="separator" />
              {item('내용 비우기', () => run((tt, pp) => T.clearCells(editor.state, tt, pp)))}
              {dangerItem('행 지우기', { top: p.top, bottom: p.bottom, left: 0, right: t.map.width }, deleteRows)}
              {dangerItem('열 지우기', { top: 0, bottom: t.map.height, left: p.left, right: p.right }, deleteCols)}
            </>
          )}
        </Menu>
      )}
    </div>
  );
}
