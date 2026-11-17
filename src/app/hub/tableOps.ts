/*
 * 위키 표 고치기 - Confluence 처럼 표 둘레의 손잡이 · 넣기 단추가 부르는 명령. React 없음(Node 시험용).
 *
 *   행 · 열 고르기      손잡이를 누르면 그 행 · 열 전체(Shift 면 이어서 여러 개)
 *   경계에 넣기         두 행 · 두 열 사이의 + 단추 - 그 자리에 새 행 · 열, 커서는 새 셀로
 *   옮기기              손잡이를 끌어 놓은 자리로(prosemirror-tables 의 moveTableRow · moveTableColumn)
 *   정렬                열 하나를 기준으로 머리글 행 아래만(합친 셀이 여러 행에 걸치면 하지 않는다)
 *   열 너비 맞추기      고른 열을 같은 너비로
 *   단축키              Ctrl+Alt+↑ ↓ ← → 행 · 열 넣기, Shift+F10 셀 메뉴(Confluence 와 같은 키)
 */
import { Extension } from '@tiptap/core';
import { Fragment, type Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection, type EditorState, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { CellSelection, TableMap, addColumn, addRow, findTable, isInTable, rowIsHeader } from '@tiptap/pm/tables';

export interface TableInfo {
  /** 표 앞 자리 */
  pos: number;
  /** 표 안 첫 자리(셀 자리를 셀 때 기준) */
  start: number;
  node: PMNode;
  map: TableMap;
}

type Rect = Parameters<typeof addColumn>[1];

/** 커서(또는 pos)가 든 표 */
export function tableAround(state: EditorState, pos?: number): TableInfo | null {
  const t = findTable(pos === undefined ? state.selection.$from : state.doc.resolve(pos));
  return t ? { pos: t.pos, start: t.start, node: t.node, map: TableMap.get(t.node) } : null;
}

/** 표 앞 자리로 표를 찾는다 */
export function tableAt(state: EditorState, tablePos: number): TableInfo | null {
  const node = tablePos >= 0 && tablePos < state.doc.content.size ? state.doc.nodeAt(tablePos) : null;
  return node && node.type.spec.tableRole === 'table' ? { pos: tablePos, start: tablePos + 1, node, map: TableMap.get(node) } : null;
}

const rectOf = (t: TableInfo): Rect => ({ map: t.map, tableStart: t.start, table: t.node, left: 0, top: 0, right: t.map.width, bottom: t.map.height });
const cellPos = (t: TableInfo, row: number, col: number) => t.start + t.map.map[row * t.map.width + col];

/** 고른 셀 범위 - 행 · 열 손잡이를 켜 보이고, 메뉴가 무엇을 바꿀지 정한다 */
export interface Picked {
  kind: 'row' | 'col' | 'table' | 'cells' | 'cursor';
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function picked(state: EditorState, t: TableInfo): Picked | null {
  const sel = state.selection;
  if (sel instanceof CellSelection) {
    const a = t.map.findCell(sel.$anchorCell.pos - t.start);
    const h = t.map.findCell(sel.$headCell.pos - t.start);
    const r = { top: Math.min(a.top, h.top), bottom: Math.max(a.bottom, h.bottom), left: Math.min(a.left, h.left), right: Math.max(a.right, h.right) };
    const rows = sel.isRowSelection();
    const cols = sel.isColSelection();
    return { kind: rows && cols ? 'table' : rows ? 'row' : cols ? 'col' : 'cells', ...r };
  }
  const $c = sel.$from;
  for (let d = $c.depth; d > 0; d -= 1) {
    const role = $c.node(d).type.spec.tableRole;
    if (role === 'cell' || role === 'header_cell') {
      if ($c.node(d - 2) !== t.node) return null;
      const r = t.map.findCell($c.before(d) - t.start);
      return { kind: 'cursor', ...r };
    }
  }
  return null;
}

/** 행 a ~ b 를 고른다 */
export function selectRows(state: EditorState, t: TableInfo, a: number, b: number): Transaction {
  const top = Math.max(0, Math.min(a, b));
  const bottom = Math.min(t.map.height - 1, Math.max(a, b));
  const $a = state.doc.resolve(cellPos(t, top, 0));
  const $h = state.doc.resolve(cellPos(t, bottom, t.map.width - 1));
  return state.tr.setSelection(CellSelection.rowSelection($a, $h));
}

/** 열 a ~ b 를 고른다 */
export function selectCols(state: EditorState, t: TableInfo, a: number, b: number): Transaction {
  const left = Math.max(0, Math.min(a, b));
  const right = Math.min(t.map.width - 1, Math.max(a, b));
  const $a = state.doc.resolve(cellPos(t, 0, left));
  const $h = state.doc.resolve(cellPos(t, t.map.height - 1, right));
  return state.tr.setSelection(CellSelection.colSelection($a, $h));
}

/** 표 전체를 고른다(모서리 손잡이) */
export function selectTable(state: EditorState, t: TableInfo): Transaction {
  const $a = state.doc.resolve(t.start + t.map.map[0]);
  const $h = state.doc.resolve(t.start + t.map.map[t.map.map.length - 1]);
  return state.tr.setSelection(new CellSelection($a, $h));
}

/** 표의 (행, 열) 셀 안에 커서를 둔다 */
function cursorAt(tr: Transaction, tablePos: number, row: number, col: number) {
  const table = tr.doc.nodeAt(tablePos);
  if (!table) return tr;
  const map = TableMap.get(table);
  const r = Math.max(0, Math.min(row, map.height - 1));
  const c = Math.max(0, Math.min(col, map.width - 1));
  const at = tablePos + 1 + map.map[r * map.width + c];
  return tr.setSelection(TextSelection.near(tr.doc.resolve(at + 1)));
}

/** 열 경계 index(0 = 맨 왼쪽 앞, width = 맨 오른쪽 뒤)에 새 열을 넣고 커서를 그 열의 row 행 셀에 둔다 */
export function insertColumnAt(state: EditorState, t: TableInfo, index: number, row = 0): Transaction {
  const at = Math.max(0, Math.min(index, t.map.width));
  const tr = addColumn(state.tr, rectOf(t), at);
  return cursorAt(tr, t.pos, row, at);
}

/** 행 경계 index(0 = 맨 위 앞, height = 맨 아래 뒤)에 새 행을 넣고 커서를 그 행의 col 열 셀에 둔다 */
export function insertRowAt(state: EditorState, t: TableInfo, index: number, col = 0): Transaction {
  const at = Math.max(0, Math.min(index, t.map.height));
  const tr = addRow(state.tr, rectOf(t), at);
  return cursorAt(tr, t.pos, at, col);
}

/** 끌어 놓은 경계(0 ~ n)를 옮길 자리(0 ~ n-1)로 - 같은 자리면 null */
export function dropTarget(from: number, boundary: number): number | null {
  const to = boundary > from ? boundary - 1 : boundary;
  return to === from ? null : to;
}

/** 범위 안 셀의 내용을 비운다(셀 · 합친 칸 · 색은 둔다) */
export function clearCells(state: EditorState, t: TableInfo, r: { top: number; bottom: number; left: number; right: number }): Transaction {
  const tr = state.tr;
  const cells = [...t.map.cellsInRect(r)].sort((a, b) => b - a);
  for (const p of cells) {
    const cell = t.node.nodeAt(p);
    if (!cell) continue;
    const from = t.start + p + 1;
    tr.replaceWith(from, from + cell.content.size, state.schema.nodes.paragraph.create());
  }
  return tr;
}

/* ── 정렬 ─────────────────────────────────────────────── */

const NUM = /^[-+]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?%?$/;

/** 정렬 비교 - 빈 칸은 늘 끝으로, 숫자끼리는 값으로(1,200 · 3.5% 도), 나머지는 한국어 순서(숫자가 섞이면 자연 순서) */
export function compareCells(a: string, b: string, dir: 1 | -1): number {
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  const na = NUM.test(a) ? Number.parseFloat(a.replace(/[,%]/g, '')) : Number.NaN;
  const nb = NUM.test(b) ? Number.parseFloat(b.replace(/[,%]/g, '')) : Number.NaN;
  const r = !Number.isNaN(na) && !Number.isNaN(nb) ? na - nb : a.localeCompare(b, 'ko', { numeric: true, sensitivity: 'base' });
  return r * dir;
}

/**
 * 열 col 을 기준으로 머리글 행 아래 행들을 정렬한다. 같은 값은 원래 순서를 지킨다.
 * 여러 행에 걸쳐 합친 셀이 있으면 행을 따로 옮길 수 없어 하지 않는다 - 그때는 까닭을 돌려준다
 */
export function sortByColumn(state: EditorState, t: TableInfo, col: number, dir: 1 | -1): Transaction | string {
  const { node, map } = t;
  const rows: PMNode[] = [];
  node.forEach((r) => { rows.push(r); });
  let head = 0;
  while (head < rows.length && rowIsHeader(map, node, head)) head += 1;
  if (rows.length - head < 2) return '정렬할 행이 두 개 넘어야 합니다';
  for (let r = head; r < map.height; r += 1) {
    for (let c = 0; c < map.width; c += 1) {
      const cell = node.nodeAt(map.map[r * map.width + c]);
      if (cell && cell.attrs.rowspan > 1) return '여러 행에 걸쳐 합친 셀이 있어 정렬할 수 없습니다. 셀을 나눈 뒤 정렬해 주세요';
    }
  }
  const order = rows.slice(head).map((row, i) => ({ row, i, key: (node.nodeAt(map.map[(head + i) * map.width + col])?.textContent ?? '').trim() }));
  order.sort((a, b) => compareCells(a.key, b.key, dir) || a.i - b.i);
  const table = node.copy(Fragment.from([...rows.slice(0, head), ...order.map((o) => o.row)]));
  const tr = state.tr.replaceWith(t.pos, t.pos + node.nodeSize, table);
  // 정렬한 셀(머리글 행 아래 그 열)을 골라 둔다 - 무엇을 기준으로 바뀌었는지 보이게.
  // 열 전체로 고르면 위쪽의 합친 머리글 때문에 옆 열까지 넓어질 수 있다
  const m = TableMap.get(table);
  const $a = tr.doc.resolve(t.start + m.map[head * m.width + col]);
  const $h = tr.doc.resolve(t.start + m.map[(m.height - 1) * m.width + col]);
  return tr.setSelection(new CellSelection($a, $h));
}

/* ── 너비 ─────────────────────────────────────────────── */

/**
 * 열 너비(px)를 정한다. widths[c] 가 없는 열은 지금 값을 둔다. 합친 셀은 걸친 열마다 너비를 가진다(colwidth 배열).
 * 한 셀의 너비를 모두 알 수 없으면 그 셀은 너비 없이 둔다(본문 폭에 맞춰 나뉜다)
 */
export function setColumnWidths(state: EditorState, t: TableInfo, widths: (number | null | undefined)[]): Transaction {
  const tr = state.tr;
  const seen = new Set<number>();
  for (const pos of t.map.map) {
    if (seen.has(pos)) continue;
    seen.add(pos);
    const cell = t.node.nodeAt(pos);
    if (!cell) continue;
    const r = t.map.findCell(pos);
    const old = (cell.attrs.colwidth as number[] | null) ?? null;
    const cw = Array.from({ length: r.right - r.left }, (_, k) => widths[r.left + k] ?? old?.[k] ?? 0);
    const value = cw.every((w) => w > 0) ? cw.map((w) => Math.max(48, Math.round(w))) : null;
    if (JSON.stringify(value) !== JSON.stringify(old)) tr.setNodeMarkup(t.start + pos, undefined, { ...cell.attrs, colwidth: value });
  }
  return tr;
}

/** 고른 열(left ~ right-1)을 같은 너비로 - measured 는 화면에서 잰 지금 너비(px) */
export function distributeColumns(state: EditorState, t: TableInfo, measured: number[], left: number, right: number): Transaction {
  const span = measured.slice(left, right);
  const each = span.reduce((s, w) => s + w, 0) / Math.max(1, span.length);
  return setColumnWidths(state, t, measured.map((w, c) => (c >= left && c < right ? each : w)));
}

/** 열 너비를 모두 지운다(본문 폭에 맞춰 다시 나뉜다) */
export function clearColumnWidths(state: EditorState, t: TableInfo): Transaction {
  const tr = state.tr;
  const seen = new Set<number>();
  for (const pos of t.map.map) {
    if (seen.has(pos)) continue;
    seen.add(pos);
    const cell = t.node.nodeAt(pos);
    if (cell?.attrs.colwidth) tr.setNodeMarkup(t.start + pos, undefined, { ...cell.attrs, colwidth: null });
  }
  return tr;
}

/* ── 단축키 ───────────────────────────────────────────── */

export interface TableKeysStorage {
  /** Shift+F10 - 표 도구가 셀 메뉴를 연다 */
  openCellMenu: (() => void) | null;
}

/**
 * Confluence 와 같은 표 단축키 - Ctrl(⌘)+Alt(⌥)+↑ ↓ 행 넣기, ← → 열 넣기, Shift+F10 셀 메뉴.
 * 마지막 셀에서 Tab 이면 새 행(TipTap 표 기본)
 */
export const TableKeys = Extension.create<Record<string, never>, TableKeysStorage>({
  name: 'tmTableKeys',
  addStorage() {
    return { openCellMenu: null };
  },
  /* 커서가 든 표에 표시를 단다 - 표 아래에 표 도구 막대 자리를 비워 다음 문단을 가리지 않는다 */
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [new Plugin({
      key: new PluginKey('tmTableActive'),
      props: {
        decorations: (state) => {
          if (!editor.isEditable) return null;
          const t = findTable(state.selection.$from);
          return t ? DecorationSet.create(state.doc, [Decoration.node(t.pos, t.pos + t.node.nodeSize, { class: 'tm-table-active' })]) : null;
        },
      },
    })];
  },
  addKeyboardShortcuts() {
    const on = () => this.editor.isEditable && isInTable(this.editor.state);
    return {
      'Mod-Alt-ArrowUp': () => on() && this.editor.commands.addRowBefore(),
      'Mod-Alt-ArrowDown': () => on() && this.editor.commands.addRowAfter(),
      'Mod-Alt-ArrowLeft': () => on() && this.editor.commands.addColumnBefore(),
      'Mod-Alt-ArrowRight': () => on() && this.editor.commands.addColumnAfter(),
      'Shift-F10': () => {
        const open = this.storage.openCellMenu;
        if (!on() || !open) return false;
        open();
        return true;
      },
    };
  },
});
