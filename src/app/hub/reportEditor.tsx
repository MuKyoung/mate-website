'use client';

import './reports.css';
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, ReactRenderer, useEditor, useEditorState, type Editor, type NodeViewProps } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Extension, Mark, Node, type JSONContent, type Range } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import { Highlight } from '@tiptap/extension-highlight';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { TableKit } from '@tiptap/extension-table';
import { PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { PANEL_KINDS, TEXT_COLORS, dateChip, lineKindOf, parseLines, spansOf, type LineKind, type PanelKind, type StatusColor, type TextColor } from './reportStore';
import {
  isImageFile, openReportFile, reportFileInfo, reportFileUrl, reportFilesVersion, sizeLabel, subscribeReportFiles, uploadReportFile,
  type FileScope,
} from './reportFiles';
import { STATUSES, localToday, type Member, type Status, type Task } from './types';
import { Avatar } from './ui';

/*
 * 보고 칸 편집기 - Confluence 문서처럼 쓴다(TipTap).
 *   · 칸은 글머리표 목록으로 시작한다. Enter 새 항목, Shift+Enter 같은 항목 안 줄 바꿈, Tab · Shift+Tab 하위로 · 위로,
 *     빈 항목에서 Enter 는 한 단계 꺼낸다. Ctrl+B · I · K(링크), 마크다운 입력(# · - · 1. · [] · > · ---).
 *   · '/' Confluence 넣기 메뉴(제목 · 목록 · 작업 항목 · 결정 · 패널 · 인용 · 구분선 · 코드 · 그림 · 파일 · 링크 · 날짜 · 상태 · 이모지)
 *   · '#' 작업 찾기(내 작업 먼저, 담당자 이름 · 번호 · 제목으로), '@' 사람 언급.
 *   · 그림 · PDF · 파일은 '/' 메뉴, 붙여 넣기, 끌어 놓기로 글 중간에 넣는다(reportFiles.ts).
 * 저장은 줄 글(한 줄 = 한 항목, 앞 공백 두 칸 = 한 단계 하위)에 줄 머리 표시와 짧은 표시를 더한 것 - reportStore 의 parseLines · spansOf 가 읽는다.
 */

/* ── 줄 글 ↔ 편집기 문서 ───────────────────────────────── */

const clean = (s: string) => s.replace(/[|>\n]/g, ' ').trim();

function inlineNodes(text: string): JSONContent[] {
  return spansOf(text).flatMap<JSONContent>((s) => {
    if (s.br) return [{ type: 'hardBreak' }];
    if (s.mention) return [{ type: 'rMention', attrs: { id: s.mention.id, label: s.mention.label } }];
    if (s.status) return [{ type: 'rStatus', attrs: { text: s.status.text, color: s.status.color } }];
    if (s.date) return [{ type: 'rDate', attrs: { date: s.date } }];
    if (s.img) return [{ type: 'rImage', attrs: { src: s.img.src, name: s.img.name } }];
    if (s.file) return [{ type: 'rFile', attrs: { src: s.file.src, name: s.file.name, size: s.file.size } }];
    if (!s.text) return [];
    const marks: JSONContent['marks'] = [];
    if (s.bold) marks.push({ type: 'bold' });
    if (s.italic) marks.push({ type: 'italic' });
    if (s.strike) marks.push({ type: 'strike' });
    if (s.underline) marks.push({ type: 'underline' });
    if (s.highlight) marks.push({ type: 'highlight' });
    if (s.color) marks.push({ type: 'rColor', attrs: { color: s.color } });
    if (s.code) marks.push({ type: 'code' });
    if (s.href) marks.push({ type: 'link', attrs: { href: s.href } });
    return [marks.length ? { type: 'text', text: s.text, marks } : { type: 'text', text: s.text }];
  });
}

const para = (text: string): JSONContent => {
  const nodes = inlineNodes(text);
  return nodes.length ? { type: 'paragraph', content: nodes } : { type: 'paragraph' };
};

const emptyDoc = (): JSONContent => ({
  type: 'doc', content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] }],
});

type ListType = 'bulletList' | 'orderedList' | 'taskList';
const listOf = (k: LineKind): ListType | null =>
  (k === 'item' ? 'bulletList' : k === 'num' ? 'orderedList' : k === 'task' || k === 'done' ? 'taskList' : null);

/** 편집기에 넣을 줄 - 소요기간은 글에 그대로 둔다(편집기는 글 그대로 보여 준다) */
interface Raw { depth: number; kind: LineKind; body: string; num?: number; panel?: PanelKind; lang?: string; rows?: string[][]; head?: boolean }

function scan(text: string): Raw[] {
  const out: Raw[] = [];
  for (const l of parseLines(text)) {
    let r: Raw;
    if (l.kind === 'code') r = { depth: l.depth, kind: 'code', body: l.text, lang: l.lang };
    else if (l.kind === 'table') r = { depth: l.depth, kind: 'table', body: '', rows: l.rows, head: l.head };
    else {
      const first = l.raw.split('\n')[0];
      const rest = first.trimStart();
      const k = l.note ? { kind: 'item' as LineKind, body: rest } : lineKindOf(rest);
      r = { depth: l.depth, kind: k.kind, body: k.body, num: k.num, panel: k.panel };
    }
    // 한 번에 한 단계까지만 깊어진다 - 부모 없이 깊은 줄은 바로 위 단계의 아래로
    const prev = out[out.length - 1];
    r.depth = Math.min(r.depth, prev ? prev.depth + 1 : 0);
    out.push(r);
  }
  return out;
}

function blockNode(l: Raw): JSONContent {
  switch (l.kind) {
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      return { type: 'heading', attrs: { level: Number(l.kind.slice(1)) }, content: inlineNodes(l.body) };
    case 'quote': return { type: 'blockquote', content: [para(l.body)] };
    case 'divider': return { type: 'horizontalRule' };
    case 'panel': return { type: 'rPanel', attrs: { kind: l.panel ?? 'info' }, content: inlineNodes(l.body) };
    case 'decision': return { type: 'rDecision', content: inlineNodes(l.body) };
    case 'code': return { type: 'codeBlock', attrs: { language: l.lang ?? null }, content: l.body ? [{ type: 'text', text: l.body }] : [] };
    case 'table': {
      const rows = l.rows?.length ? l.rows : [['']];
      const cols = Math.max(...rows.map((r) => r.length));
      return {
        type: 'table',
        content: rows.map((r, i) => ({
          type: 'tableRow',
          content: Array.from({ length: cols }, (_, c) => ({
            type: l.head && i === 0 ? 'tableHeader' : 'tableCell', content: [para(r[c] ?? '')],
          })),
        })),
      };
    }
    default: return para(l.body);
  }
}

/** depth 단계의 줄을 읽는다 - 목록은 이어진 같은 종류끼리 하나로, 더 깊은 줄은 그 항목(접기는 그 안)의 아래 */
function build(L: Raw[], start: number, depth: number): { nodes: JSONContent[]; next: number } {
  const nodes: JSONContent[] = [];
  let i = start;
  while (i < L.length && L[i].depth >= depth) {
    const l = L[i];
    const lt = listOf(l.kind);
    if (lt) {
      const list: JSONContent = lt === 'orderedList' && l.num && l.num !== 1 ? { type: lt, attrs: { start: l.num }, content: [] } : { type: lt, content: [] };
      while (i < L.length && L[i].depth === depth && listOf(L[i].kind) === lt) {
        const it = L[i];
        const kids = build(L, i + 1, depth + 1);
        const content = [para(it.body), ...kids.nodes];
        list.content?.push(lt === 'taskList' ? { type: 'taskItem', attrs: { checked: it.kind === 'done' }, content } : { type: 'listItem', content });
        i = kids.next;
      }
      nodes.push(list);
      continue;
    }
    const kids = build(L, i + 1, depth + 1);
    if (l.kind === 'toggle') {
      nodes.push({
        type: 'details', attrs: { open: true },
        content: [
          { type: 'detailsSummary', content: inlineNodes(l.body) },
          { type: 'detailsContent', content: kids.nodes.length ? kids.nodes : [{ type: 'paragraph' }] },
        ],
      });
    } else {
      const last = nodes[nodes.length - 1];
      // 이어진 인용 줄은 한 인용으로
      if (l.kind === 'quote' && last?.type === 'blockquote' && !kids.nodes.length) (last.content ??= []).push(para(l.body));
      else nodes.push(blockNode(l), ...kids.nodes);
    }
    i = kids.next;
  }
  return { nodes, next: i };
}

/** 줄 글 → 편집기 문서 */
export function textToDoc(text: string): JSONContent {
  const nodes = build(scan(text), 0, 0).nodes;
  return nodes.length ? { type: 'doc', content: nodes } : emptyDoc();
}

function inlineText(nodes: JSONContent[] | undefined): string {
  return (nodes ?? []).map((n) => {
    const a = n.attrs ?? {};
    if (n.type === 'hardBreak') return '<br>';
    if (n.type === 'rMention') return `<@${clean(String(a.id))}|${clean(String(a.label))}>`;
    if (n.type === 'rStatus') return `<status:${clean(String(a.text))}|${a.color}>`;
    if (n.type === 'rDate') return `<date:${a.date}>`;
    if (n.type === 'rImage') return `<img:${clean(String(a.src))}|${clean(String(a.name))}>`;
    if (n.type === 'rFile') return `<file:${clean(String(a.src))}|${clean(String(a.name))}|${Number(a.size) || ''}>`;
    let t = n.text ?? '';
    if (!t) return '';
    const has = (k: string) => n.marks?.find((m) => m.type === k);
    if (has('code')) t = `\`${t}\``;
    // 글자색은 코드 다음 안쪽에 - 색 안의 글에는 '>' 가 올 수 없어 밑줄 · 굵게 같은 표시는 바깥에 둔다
    const color = has('rColor')?.attrs?.color as string | undefined;
    if (color) t = `<color:${color}|${t.replace(/>/g, '›')}>`;
    if (has('bold')) t = `**${t}**`;
    if (has('italic')) t = `*${t}*`;
    if (has('strike')) t = `~~${t}~~`;
    if (has('underline')) t = `<u>${t}</u>`;
    if (has('highlight')) t = `==${t}==`;
    const href = has('link')?.attrs?.href as string | undefined;
    if (href && href !== n.text) t = `[${t}](${href})`;
    return t;
  }).join('').replace(/[ \t]+/g, ' ').replace(/^ | $/g, '').replace(/^(<br>)+|(<br>)+$/g, '');
}

/** 글머리표 줄인데 글이 줄 머리 표시처럼 시작하면 '- ' 를 붙여 그대로 읽히게 한다 */
const LOOKS_MARKED = /^(?:\[[ xX+]\]|\[!|<>\s|#{1,6}\s|>\s|\d{1,3}[.)]\s|-{3,}$|_{3,}$|\*{3,}$|[-*•·]\s|¶|```|\|)/;

/** 편집기 문서 → 줄 글. 빈 항목은 뺀다 */
export function docToText(doc: JSONContent): string {
  const out: string[] = [];
  const pad = (d: number) => '  '.repeat(d);
  const list = (n: JSONContent, depth: number) => {
    let i = Number(n.attrs?.start) || 1;
    for (const li of n.content ?? []) {
      let first = true;
      for (const c of li.content ?? []) {
        if (c.type === 'paragraph' && first) {
          const t = inlineText(c.content);
          if (t) {
            const mark = n.type === 'orderedList' ? `${i}. ` : n.type === 'taskList' ? (li.attrs?.checked ? '[x] ' : '[ ] ')
              : LOOKS_MARKED.test(t) ? '- ' : '';
            out.push(`${pad(depth)}${mark}${t}`);
          }
          first = false;
        } else block(c, depth + 1);
      }
      i += 1;
    }
  };
  const cellText = (cell: JSONContent) =>
    (cell.content ?? []).map((p) => inlineText(p.content)).filter(Boolean).join('<br>').replace(/\|/g, '\\|');
  const block = (n: JSONContent, depth: number) => {
    const t = inlineText(n.content);
    switch (n.type) {
      case 'bulletList': case 'orderedList': case 'taskList': list(n, depth); break;
      case 'paragraph': if (t) out.push(`${pad(depth)}¶ ${t}`); break;
      case 'heading': if (t) out.push(`${pad(depth)}${'#'.repeat(Number(n.attrs?.level) || 1)} ${t}`); break;
      case 'blockquote': for (const c of n.content ?? []) {
        if (c.type === 'paragraph') { const q = inlineText(c.content); if (q) out.push(`${pad(depth)}> ${q}`); } else block(c, depth);
      } break;
      case 'horizontalRule': out.push(`${pad(depth)}---`); break;
      case 'rPanel': if (t) out.push(`${pad(depth)}[!${n.attrs?.kind ?? 'info'}] ${t}`); break;
      case 'rDecision': if (t) out.push(`${pad(depth)}<> ${t}`); break;
      case 'codeBlock': {
        const code = (n.content ?? []).map((x) => x.text ?? '').join('');
        if (!code.trim()) break;
        out.push(`${pad(depth)}\`\`\`${n.attrs?.language ?? ''}`, ...code.split('\n').map((c) => `${pad(depth)}${c}`), `${pad(depth)}\`\`\``);
        break;
      }
      case 'table': {
        const rows = n.content ?? [];
        rows.forEach((r, ri) => {
          const cells = r.content ?? [];
          out.push(`${pad(depth)}| ${cells.map(cellText).join(' | ')} |`);
          if (ri === 0 && cells.length && cells.every((c) => c.type === 'tableHeader')) out.push(`${pad(depth)}| ${cells.map(() => '---').join(' | ')} |`);
        });
        break;
      }
      case 'details': {
        const summary = (n.content ?? []).find((c) => c.type === 'detailsSummary');
        const body = (n.content ?? []).find((c) => c.type === 'detailsContent');
        const s = inlineText(summary?.content);
        const before = out.length;
        out.push(`${pad(depth)}[+] ${s}`);
        for (const c of body?.content ?? []) block(c, depth + 1);
        // 제목도 안도 비었으면 뺀다
        if (!s && out.length === before + 1) out.pop();
        break;
      }
      default: for (const c of n.content ?? []) block(c, depth);
    }
  };
  for (const c of doc.content ?? []) block(c, 0);
  return out.join('\n');
}

/* ── 넣는 것들(편집기 안 모양) ─────────────────────────────── */

/** 이 편집 칸 밖과 잇는 것 - 작업 · 팀원 · 나, 파일 고르기 · 링크 창 */
export interface EditEnv {
  tasks: Task[];
  members: Member[];
  /** 지금 쓰는 사람(Member.id) - 그 사람 작업이 먼저 */
  me: string;
  /** '[[' 로 거는 팀 위키 문서 */
  docs?: { id: string; title: string; icon?: string | null }[];
}
interface Ui { pick(kind: 'image' | 'file'): void; link(): void }

const dataAttr = (name: string) => ({ [`data-${name}`]: '' });

function atom(name: string, defaults: Record<string, unknown>, render: (a: Record<string, unknown>) => [string, Record<string, string>, string]) {
  return Node.create({
    name, group: 'inline', inline: true, atom: true, selectable: true,
    addAttributes() {
      return Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, {
        default: d,
        parseHTML: (el: HTMLElement) => { const v = el.getAttribute(`data-${k}`); return v === null ? d : typeof d === 'number' ? Number(v) : v; },
        renderHTML: (attrs: Record<string, unknown>) => ({ [`data-${k}`]: String(attrs[k] ?? '') }),
      }]));
    },
    parseHTML() { return [{ tag: `span[data-${name}]` }]; },
    renderHTML({ node, HTMLAttributes }) {
      const [tag, attrs, text] = render(node.attrs);
      return [tag, { ...HTMLAttributes, ...attrs, ...dataAttr(name) }, text];
    },
    renderText({ node }) { return render(node.attrs)[2]; },
  });
}

const RMention = atom('rMention', { id: '', label: '' }, (a) => ['span', { class: 'tm-rmention' }, `@${a.label}`]);
const RStatus = atom('rStatus', { text: '', color: 'gray' }, (a) => ['span', { class: `tm-rstatus tm-rstatus-${a.color}` }, String(a.text)]);
const RDate = atom('rDate', { date: '' }, (a) => ['span', { class: 'tm-rdate' }, a.date ? dateChip(String(a.date)) : '']);

/** 그림 · 파일 - 볼 주소를 받아 그린다(비공개 저장소의 한 시간짜리 주소) */
function useFileUrl(src: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    let live = true;
    setUrl(null);
    setFail(false);
    reportFileUrl(src).then((u) => { if (live) setUrl(u); }, () => { if (live) setFail(true); });
    return () => { live = false; };
  }, [src]);
  return { url, fail };
}

function ImageView({ node, selected }: NodeViewProps) {
  const { url, fail } = useFileUrl(String(node.attrs.src));
  useSyncExternalStore(subscribeReportFiles, reportFilesVersion, reportFilesVersion);
  const info = reportFileInfo(String(node.attrs.src));
  // 드라이브로 옮긴 그림은 서버에 없다 - 칩으로(두 번 누르면 드라이브)
  if (info?.moved_at) {
    return (
      <NodeViewWrapper as="span" className={`tm-rfile ${selected ? 'is-selected' : ''}`} data-r-image="" title="구글 드라이브로 옮긴 그림 - 두 번 누르면 엽니다"
        onDoubleClick={() => void openReportFile(String(node.attrs.src)).catch(() => {})}>
        <span aria-hidden>🖼️</span>{String(node.attrs.name)}<small>드라이브</small>
      </NodeViewWrapper>
    );
  }
  return (
    <NodeViewWrapper as="span" className={`tm-rimage ${selected ? 'is-selected' : ''}`} data-r-image="">
      {/* 비공개 저장소의 한 시간짜리 주소 · data URL 이라 next/image 로 줄이지 않는다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? <img src={url} alt={String(node.attrs.name)} draggable={false} />
        : <span className="tm-rfile">{fail ? '그림을 불러오지 못했습니다' : '그림 불러오는 중…'}</span>}
    </NodeViewWrapper>
  );
}

function FileView({ node, selected }: NodeViewProps) {
  const name = String(node.attrs.name);
  useSyncExternalStore(subscribeReportFiles, reportFilesVersion, reportFilesVersion);
  const moved = !!reportFileInfo(String(node.attrs.src))?.moved_at;
  return (
    <NodeViewWrapper as="span" className={`tm-rfile ${selected ? 'is-selected' : ''}`} data-r-file="" title={`${name} - 두 번 누르면 엽니다`}
      onDoubleClick={() => void openReportFile(String(node.attrs.src)).catch(() => {})}>
      <span aria-hidden>{/\.pdf$/i.test(name) ? '📄' : '📎'}</span>
      {name}
      {Number(node.attrs.size) > 0 && <small>{sizeLabel(Number(node.attrs.size))}</small>}
      {moved && <small>드라이브</small>}
    </NodeViewWrapper>
  );
}

const RImage = atom('rImage', { src: '', name: '' }, (a) => ['span', { class: 'tm-rimage' }, `[그림 ${a.name}]`])
  .extend({ addNodeView() { return ReactNodeViewRenderer(ImageView, { as: 'span' }); } });
const RFile = atom('rFile', { src: '', name: '', size: 0 }, (a) => ['span', { class: 'tm-rfile' }, `[파일 ${a.name}]`])
  .extend({ addNodeView() { return ReactNodeViewRenderer(FileView, { as: 'span' }); } });

/** 글자색 - 정해 둔 몇 가지 색만(테마마다 읽히게 CSS 가 칠한다) */
const RColor = Mark.create({
  name: 'rColor',
  addAttributes() {
    return { color: { default: 'red', parseHTML: (el: HTMLElement) => el.getAttribute('data-r-color') || 'red', renderHTML: () => ({}) } };
  },
  parseHTML() { return [{ tag: 'span[data-r-color]' }]; },
  renderHTML({ mark }) { return ['span', { 'data-r-color': mark.attrs.color, class: `tm-rcolor-${mark.attrs.color}` }, 0]; },
});

/** 패널 · 결정 - 한 줄짜리 블록 */
const RPanel = Node.create({
  name: 'rPanel', group: 'block', content: 'inline*', defining: true,
  addAttributes() {
    return { kind: { default: 'info', parseHTML: (el: HTMLElement) => el.getAttribute('data-r-panel') || 'info', renderHTML: () => ({}) } };
  },
  parseHTML() { return [{ tag: 'div[data-r-panel]' }]; },
  renderHTML({ node }) { return ['div', { 'data-r-panel': node.attrs.kind, class: `tm-rpanel tm-rpanel-${node.attrs.kind}` }, 0]; },
});
const RDecision = Node.create({
  name: 'rDecision', group: 'block', content: 'inline*', defining: true,
  parseHTML() { return [{ tag: 'div[data-r-decision]' }]; },
  renderHTML() { return ['div', { 'data-r-decision': '', class: 'tm-rdecision' }, 0]; },
});

/* ── 제안 목록('/' · '#' · '@') ─────────────────────────── */

interface SugItem {
  id: string;
  group?: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  keys?: string;
  run(editor: Editor, range: Range): void;
}
interface ListHandle { onKeyDown(e: KeyboardEvent): boolean }

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

const SugList = forwardRef<ListHandle, SuggestionProps<SugItem, SugItem> & { title: string }>(function SugList({ items, command, query, editor, title }, ref) {
  const uid = useId().replace(/:/g, '');
  const [at, setAt] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => setAt(0), [items]);
  useEffect(() => {
    const dom = editor.view.dom;
    dom.setAttribute('aria-controls', `tm-rsg-${uid}`);
    dom.setAttribute('aria-autocomplete', 'list');
    return () => ['aria-controls', 'aria-autocomplete', 'aria-activedescendant'].forEach((a) => dom.removeAttribute(a));
  }, [editor, uid]);
  useEffect(() => {
    const dom = editor.view.dom;
    if (items[at]) dom.setAttribute('aria-activedescendant', `tm-rsg-${uid}-${at}`);
    const el = box.current?.querySelector<HTMLElement>(`[data-i="${at}"]`);
    const b = box.current;
    if (el && b) {
      const r = el.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      if (r.top < bb.top) b.scrollTop -= bb.top - r.top + 4;
      else if (r.bottom > bb.bottom) b.scrollTop += r.bottom - bb.bottom + 4;
    }
  }, [at, items, editor, uid]);
  useImperativeHandle(ref, () => ({
    onKeyDown(e) {
      if (!items.length) return false;
      if (e.key === 'ArrowDown') { setAt((x) => (x + 1) % items.length); return true; }
      if (e.key === 'ArrowUp') { setAt((x) => (x - 1 + items.length) % items.length); return true; }
      if (e.key === 'Enter' || e.key === 'Tab') { command(items[at]); return true; }
      return false;
    },
  }), [items, at, command]);

  let last: string | undefined;
  return (
    <div ref={box} id={`tm-rsg-${uid}`} className="tm-rsg" role="listbox" aria-label={title}>
      <p className="tm-rsg-title" role="presentation">{title}</p>
      {items.length === 0 && <p className="tm-rsg-empty" role="presentation">{query ? `'${query}'에 맞는 것이 없습니다` : '고를 것이 없습니다'}</p>}
      {items.map((it, i) => {
        const head = it.group && it.group !== last ? <p key={`g-${it.group}-${i}`} className="tm-rsg-group" role="presentation">{it.group}</p> : null;
        last = it.group;
        return [
          head,
          <button key={it.id} id={`tm-rsg-${uid}-${i}`} type="button" role="option" tabIndex={-1} aria-selected={i === at} data-i={i}
            onMouseEnter={() => setAt(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => command(it)} className="tm-rsg-item">
            <span className="tm-rsg-icon" aria-hidden>{it.icon}</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate">{it.label}</b>
              {it.hint && <small className="block truncate">{it.hint}</small>}
            </span>
          </button>,
        ];
      })}
    </div>
  );
});

function suggest(name: string, char: string, title: string, items: (query: string, editor: Editor) => SugItem[], { spaces = false, min = 0 } = {}) {
  return Extension.create({
    name,
    addProseMirrorPlugins() {
      return [Suggestion<SugItem, SugItem>({
        editor: this.editor,
        pluginKey: new PluginKey(name),
        char,
        // '/' 메뉴는 Confluence 처럼 띄어 쓴 이름(작업 항목)으로도 찾는다 - 너무 길어지면 글을 쓰는 중으로 보고 닫는다
        allowSpaces: spaces,
        allow: ({ editor, state, range }) => !state.doc.resolve(range.from).marks().some((m) => m.type.name === 'code')
          && !editor.isActive('codeBlock')
          && range.to - range.from >= char.length + min
          && (!spaces || (range.to - range.from <= 25 && (() => {
            // 띄어 쓴 뒤에도 맞는 것이 없으면 메뉴가 아니라 글이다 - 닫는다
            const q = state.doc.textBetween(range.from + char.length, range.to, ' ');
            return !q.includes(' ') || items(q, editor).length > 0;
          })())),
        items: ({ query, editor }) => items(query, editor),
        command: ({ editor, range, props: it }) => it.run(editor, range),
        render: () => {
          let r: ReactRenderer<ListHandle, SuggestionProps<SugItem, SugItem> & { title: string }> | null = null;
          let unmount: (() => void) | null = null;
          return {
            onStart: (props: SuggestionProps<SugItem, SugItem>) => {
              r = new ReactRenderer(SugList, { editor: props.editor, props: { ...props, title } });
              r.element.className = 'tm-rsg-root';
              unmount = props.mount(r.element);
            },
            onUpdate: (props: SuggestionProps<SugItem, SugItem>) => r?.updateProps({ ...props, title }),
            onKeyDown: ({ event }: SuggestionKeyDownProps) => (event.key === 'Escape' ? false : r?.ref?.onKeyDown(event) ?? false),
            onExit: () => {
              unmount?.();
              r?.destroy();
              r = null;
              unmount = null;
            },
          };
        },
      })];
    },
  });
}

/* '#' 작업 찾기 - 내 작업 → 담당자별(이름 순) → 담당자 없음. 묶음 안은 진행 중 · 리뷰 · 할 일 · 백로그 · 완료, 같으면 최근 고친 것 */

const STATUS_RANK: Record<Status, number> = { doing: 0, review: 1, todo: 2, backlog: 3, done: 4 };

export function taskChoices(env: EditEnv, query: string): { id: string; group: string; task: Task; who: string }[] {
  const q = norm(query);
  const nameOf = (id: string | null) => (id ? env.members.find((m) => m.id === id)?.name ?? '' : '');
  const hit = (t: Task) => !q || [t.key, t.title, nameOf(t.assignee), STATUSES.find((s) => s.id === t.status)?.label ?? '']
    .some((x) => norm(x).includes(q));
  const order = (a: Task, b: Task) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.updatedAt.localeCompare(a.updatedAt);
  const groups = new Map<string, { rank: number; name: string; tasks: Task[] }>();
  for (const t of env.tasks.filter(hit)) {
    const k = t.assignee === env.me ? 'me' : t.assignee ?? 'none';
    const g = groups.get(k) ?? {
      rank: k === 'me' ? 0 : k === 'none' ? 2 : 1,
      name: k === 'me' ? '내 작업' : k === 'none' ? '담당자 없음' : nameOf(t.assignee) || '이름 없는 팀원',
      tasks: [],
    };
    g.tasks.push(t);
    groups.set(k, g);
  }
  const sorted = [...groups.values()].sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'ko'));
  const per = q ? 12 : sorted.length > 1 ? 6 : 15;
  return sorted.flatMap((g) => g.tasks.sort(order).slice(0, g.rank === 0 ? per * 2 : per)
    .map((t) => ({ id: t.id, group: g.name, task: t, who: nameOf(t.assignee) }))).slice(0, 60);
}

function taskItems(envRef: { current: EditEnv }, query: string): SugItem[] {
  return taskChoices(envRef.current, query).map(({ id, group, task, who }) => {
    const st = STATUSES.find((s) => s.id === task.status)?.label ?? '';
    return {
      id, group, label: task.title || '제목 없음',
      hint: `${task.key} · ${st}${who && group !== '내 작업' ? ` · ${who}` : ''}${task.due ? ` · ${task.due.slice(5).replace('-', '.')} 마감` : ''}`,
      icon: task.assignee ? <Avatar id={task.assignee} size={22} /> : <span className="tm-rsg-noone" />,
      run: (e, r) => { e.chain().focus().insertContentAt(r, `${task.key} ${task.title.trim()} `).run(); },
    };
  });
}

function mentionItems(envRef: { current: EditEnv }, query: string): SugItem[] {
  const q = norm(query);
  return envRef.current.members
    .filter((m) => m.active !== false && (!q || [m.name, m.role, m.email ?? ''].some((x) => norm(x).includes(q))))
    .sort((a, b) => (a.id === envRef.current.me ? 1 : 0) - (b.id === envRef.current.me ? 1 : 0) || a.name.localeCompare(b.name, 'ko'))
    .slice(0, 12)
    .map((m) => ({
      id: m.id, label: m.name, hint: m.role || undefined, icon: <Avatar id={m.id} size={22} />,
      run: (e, r) => { e.chain().focus().insertContentAt(r, [{ type: 'rMention', attrs: { id: m.id, label: m.name } }, { type: 'text', text: ' ' }]).run(); },
    }));
}

/* '/' Confluence 넣기 메뉴 - 팀 위키의 넣기 메뉴와 같은 이름 · 묶음. 단 나누기 · 목차 · 하위 문서 목록 · 양식 칸은
   한 문서 전체를 다루는 것이라 사람마다의 보고 칸에는 넣지 않는다 */

const STATUS_PRESETS: { text: string; color: StatusColor }[] = [
  { text: '할 일', color: 'gray' }, { text: '진행 중', color: 'blue' }, { text: '검토', color: 'yellow' },
  { text: '완료', color: 'green' }, { text: '막힘', color: 'red' }, { text: '보류', color: 'purple' },
];

/** ':' 로 찾는 이모지 - 이름(한 · 영)으로 */
const EMOJI: { e: string; label: string; keys: string }[] = [
  { e: '✅', label: '완료', keys: 'check done ok white_check_mark 체크' }, { e: '☑️', label: '체크', keys: 'ballot check 체크' },
  { e: '❌', label: '안 됨', keys: 'x no fail cross 실패' }, { e: '⭕', label: '동그라미', keys: 'o circle 맞음' },
  { e: '⚠️', label: '주의', keys: 'warning 경고' }, { e: '❗', label: '느낌표', keys: 'exclamation 중요' },
  { e: '❓', label: '질문', keys: 'question 물음' }, { e: '💡', label: '아이디어', keys: 'idea bulb 생각 전구' },
  { e: '🔥', label: '급함', keys: 'fire hot 불' }, { e: '🚧', label: '작업 중', keys: 'construction wip 공사' },
  { e: '📌', label: '고정', keys: 'pin pushpin 핀 중요' }, { e: '📎', label: '첨부', keys: 'paperclip attach 클립' },
  { e: '📅', label: '날짜', keys: 'calendar date 달력 일정' }, { e: '⏰', label: '시간', keys: 'alarm clock time 알람 마감' },
  { e: '🎯', label: '목표', keys: 'target goal dart 목표' }, { e: '🚀', label: '출시', keys: 'rocket launch ship 배포' },
  { e: '🐛', label: '버그', keys: 'bug 버그 벌레' }, { e: '🛠️', label: '수정', keys: 'tools fix wrench 고침 도구' },
  { e: '🔧', label: '설정', keys: 'wrench settings config 설정' }, { e: '📝', label: '메모', keys: 'memo note write 메모 글' },
  { e: '📊', label: '자료', keys: 'chart bar data 그래프 통계' }, { e: '📈', label: '상승', keys: 'chart up increase 상승 증가' },
  { e: '📉', label: '하락', keys: 'chart down decrease 하락 감소' }, { e: '🔍', label: '검토', keys: 'search magnify review 찾기 조사' },
  { e: '👀', label: '보는 중', keys: 'eyes look watch 확인' }, { e: '👍', label: '좋아요', keys: 'thumbs up like +1 좋음' },
  { e: '👎', label: '별로', keys: 'thumbs down dislike -1' }, { e: '👏', label: '박수', keys: 'clap applause 박수 칭찬' },
  { e: '🙏', label: '부탁', keys: 'pray please thanks 감사 부탁' }, { e: '💪', label: '힘내', keys: 'muscle strong 힘' },
  { e: '🎉', label: '축하', keys: 'party tada celebrate 축하' }, { e: '😊', label: '웃음', keys: 'smile happy 웃음 기쁨' },
  { e: '😂', label: '웃김', keys: 'joy laugh lol 웃김' }, { e: '😅', label: '머쓱', keys: 'sweat smile 땀' },
  { e: '🤔', label: '고민', keys: 'thinking hmm 생각 고민' }, { e: '😭', label: '울음', keys: 'cry sob 슬픔' },
  { e: '🙌', label: '만세', keys: 'raised hands hooray 만세' }, { e: '❤️', label: '하트', keys: 'heart love 사랑' },
  { e: '⭐', label: '별', keys: 'star 별 중요' }, { e: '🔴', label: '빨강', keys: 'red circle 빨강 위험' },
  { e: '🟡', label: '노랑', keys: 'yellow circle 노랑 주의' }, { e: '🟢', label: '초록', keys: 'green circle 초록 좋음' },
  { e: '🔵', label: '파랑', keys: 'blue circle 파랑' }, { e: '➡️', label: '오른쪽', keys: 'arrow right 화살표' },
  { e: '⬆️', label: '위', keys: 'arrow up 화살표' }, { e: '⬇️', label: '아래', keys: 'arrow down 화살표' },
  { e: '💬', label: '말', keys: 'speech comment chat 말 댓글' }, { e: '📢', label: '알림', keys: 'loudspeaker announce 공지' },
  { e: '🎮', label: '게임', keys: 'game controller 게임' }, { e: '🎨', label: '그림', keys: 'art palette design 디자인' },
  { e: '🎵', label: '음악', keys: 'music note sound 사운드 음악' }, { e: '💻', label: '노트북', keys: 'laptop computer code 개발' },
];

function emojiItems(query: string): SugItem[] {
  const q = norm(query);
  return EMOJI.filter((m) => !q || norm(`${m.label} ${m.keys}`).includes(q)).slice(0, q ? 20 : 16).map((m) => ({
    id: `emoji-${m.e}`, label: `${m.e} ${m.label}`, icon: m.e,
    run: (e, r) => { e.chain().focus().insertContentAt(r, `${m.e} `).run(); },
  }));
}

/** '[[' 팀 위키 문서 링크 */
function docItems(envRef: { current: EditEnv }, query: string): SugItem[] {
  const q = norm(query.replace(/\]+$/, ''));
  return (envRef.current.docs ?? []).filter((d) => !q || norm(d.title).includes(q)).slice(0, 12).map((d) => ({
    id: `doc-${d.id}`, label: d.title || '제목 없는 문서', hint: '팀 위키 문서', icon: d.icon || '📄',
    run: (e, r) => {
      const href = `${window.location.origin}/hub/?doc=${encodeURIComponent(d.id)}`;
      e.chain().focus().insertContentAt(r, [{ type: 'text', text: d.title || '문서', marks: [{ type: 'link', attrs: { href } }] }, { type: 'text', text: ' ' }]).run();
    },
  }));
}

const block = (e: Editor, r: Range) => e.chain().focus().deleteRange(r).clearNodes();

function slashItems(ui: { current: Ui }, query: string, editor: Editor): SugItem[] {
  const inTable = editor.isActive('table');
  const tableCmds: SugItem[] = inTable ? [
    { id: 't-row', group: '표', label: '아래에 행 넣기', icon: '⤓', keys: 'row add 행 추가', run: (e, r) => { e.chain().focus().deleteRange(r).addRowAfter().run(); } },
    { id: 't-col', group: '표', label: '오른쪽에 열 넣기', icon: '⇥', keys: 'column add 열 추가', run: (e, r) => { e.chain().focus().deleteRange(r).addColumnAfter().run(); } },
    { id: 't-row-del', group: '표', label: '이 행 지우기', icon: '✕', keys: 'row delete 행 삭제', run: (e, r) => { e.chain().focus().deleteRange(r).deleteRow().run(); } },
    { id: 't-col-del', group: '표', label: '이 열 지우기', icon: '✕', keys: 'column delete 열 삭제', run: (e, r) => { e.chain().focus().deleteRange(r).deleteColumn().run(); } },
    { id: 't-head', group: '표', label: '머리 행 켜고 끄기', icon: 'H', keys: 'header 머리 제목', run: (e, r) => { e.chain().focus().deleteRange(r).toggleHeaderRow().run(); } },
    { id: 't-del', group: '표', label: '표 지우기', icon: '🗑', keys: 'table delete 표 삭제', run: (e, r) => { e.chain().focus().deleteRange(r).deleteTable().run(); } },
  ] : [];
  const all: SugItem[] = [
    ...tableCmds,
    { id: 'p', group: '기본', label: '본문', hint: '글머리표 없는 글', icon: '¶', keys: 'paragraph text normal 본문 글', run: (e, r) => { block(e, r).run(); } },
    ...[1, 2, 3, 4, 5, 6].map<SugItem>((n) => ({
      id: `h${n}`, group: '기본', label: `제목 ${n}`, hint: `${'#'.repeat(n)} 로도 시작`, icon: `H${n}`, keys: `heading h${n} 제목`,
      run: (e, r) => { block(e, r).setNode('heading', { level: n }).run(); },
    })),
    { id: 'bullet', group: '목록', label: '글머리 목록', hint: '- 로도 시작', icon: '•', keys: 'bullet list ul 목록 글머리', run: (e, r) => { block(e, r).toggleBulletList().run(); } },
    { id: 'ordered', group: '목록', label: '번호 목록', hint: '1. 로도 시작', icon: '1.', keys: 'numbered ordered ol list 번호 목록', run: (e, r) => { block(e, r).toggleOrderedList().run(); } },
    { id: 'task', group: '목록', label: '작업 항목', hint: '[] 로도 시작 · 체크 상자', icon: '☑', keys: 'action item task todo checkbox 할 일 작업 체크', run: (e, r) => { block(e, r).toggleTaskList().run(); } },
    { id: 'decision', group: '목록', label: '결정', hint: '<> 로도 시작', icon: '◆', keys: 'decision 결정', run: (e, r) => { block(e, r).setNode('rDecision').run(); } },
    { id: 'toggle', group: '정보 · 코드', label: '접기', hint: '눌러서 펼쳐 보는 내용', icon: '▸', keys: 'toggle expand details collapse 접기 토글 펼치기', run: (e, r) => { block(e, r).setDetails().updateAttributes('details', { open: true }).run(); } },
    ...PANEL_KINDS.map<SugItem>((p) => ({
      id: `panel-${p.id}`, group: '정보 · 코드', label: `${p.label} 패널`, icon: p.icon, keys: `panel ${p.id} ${p.label} 패널`,
      run: (e, r) => { block(e, r).setNode('rPanel', { kind: p.id as PanelKind }).run(); },
    })),
    { id: 'quote', group: '정보 · 코드', label: '인용', hint: '> 로도 시작', icon: '❝', keys: 'quote blockquote 인용', run: (e, r) => { block(e, r).toggleBlockquote().run(); } },
    { id: 'codeblock', group: '정보 · 코드', label: '코드 블록', hint: '``` 로도 시작', icon: '{ }', keys: 'code block snippet 코드 블록', run: (e, r) => { block(e, r).toggleCodeBlock().run(); } },
    { id: 'code', group: '정보 · 코드', label: '코드 글자', hint: '` 로 감싸도', icon: '</>', keys: 'inline code 코드 글자', run: (e, r) => { e.chain().focus().deleteRange(r).toggleCode().run(); } },
    { id: 'table', group: '정보 · 코드', label: '표', hint: 'Tab 으로 다음 칸, 표 안에서 / 로 행 · 열', icon: '▦', keys: 'table grid 표', run: (e, r) => { block(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); } },
    { id: 'divider', group: '정보 · 코드', label: '구분선', hint: '--- 로도', icon: '—', keys: 'divider rule hr line 구분 선', run: (e, r) => { e.chain().focus().deleteRange(r).setHorizontalRule().run(); } },
    { id: 'image', group: '미디어', label: '그림', hint: '붙여 넣기 · 끌어 놓기도 됩니다', icon: '🖼️', keys: 'image picture photo screenshot 그림 사진 이미지 캡처', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.pick('image'); } },
    { id: 'file', group: '미디어', label: '파일 · PDF', hint: '20MB 까지', icon: '📎', keys: 'file pdf hwp attachment upload 파일 첨부 문서', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.pick('file'); } },
    { id: 'link', group: '링크 · 사람', label: '링크', hint: 'Ctrl+K', icon: '🔗', keys: 'link url 링크 주소', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.link(); } },
    { id: 'doc', group: '링크 · 사람', label: '팀 위키 문서', hint: '[[ 로도', icon: '📄', keys: 'page doc wiki link 문서 위키 링크', run: (e, r) => { e.chain().focus().insertContentAt(r, '[[').run(); } },
    { id: 'tasks', group: '링크 · 사람', label: '작업 넣기', hint: '# 로도 · 담당자별 찾기', icon: '#', keys: 'jira issue task 작업 이슈 지라', run: (e, r) => { e.chain().focus().insertContentAt(r, '#').run(); } },
    { id: 'mention', group: '링크 · 사람', label: '사람 언급', hint: '@ 로도', icon: '@', keys: 'mention people user 언급 사람 태그', run: (e, r) => { e.chain().focus().insertContentAt(r, '@').run(); } },
    { id: 'date', group: '링크 · 사람', label: '날짜', hint: '오늘', icon: '📅', keys: 'date today 날짜 오늘', run: (e, r) => { e.chain().focus().insertContentAt(r, [{ type: 'rDate', attrs: { date: localToday() } }, { type: 'text', text: ' ' }]).run(); } },
    ...STATUS_PRESETS.map<SugItem>((s) => ({
      id: `status-${s.color}`, group: '상태 배지', label: `상태 · ${s.text}`, icon: <span className={`tm-rstatus tm-rstatus-${s.color}`}>{s.text.slice(0, 1)}</span>,
      keys: `status lozenge 상태 배지 ${s.text}`,
      run: (e, r) => { e.chain().focus().insertContentAt(r, [{ type: 'rStatus', attrs: { text: s.text, color: s.color } }, { type: 'text', text: ' ' }]).run(); },
    })),
    { id: 'emoji', group: '이모지', label: '이모지', hint: ': 로도 · 이름으로 찾기', icon: '😊', keys: 'emoji 이모지 이모티콘', run: (e, r) => { e.chain().focus().insertContentAt(r, ':').run(); } },
  ];
  const q = norm(query);
  if (!q) return all;
  // 이름이 같은 것 → 이름이 그렇게 시작하는 것 → 이름에 든 것 → 찾는 말 · 설명에 든 것 ('표' 는 '본문'(글머리표 없는 글)보다 '표' 가 먼저)
  const rank = (it: SugItem) => {
    const l = norm(it.label);
    if (l === q) return 0;
    if (l.startsWith(q)) return 1;
    if (l.includes(q)) return 2;
    return norm(`${it.keys ?? ''} ${it.hint ?? ''}`).includes(q) ? 3 : -1;
  };
  return all.map((it) => ({ it, r: rank(it) })).filter((x) => x.r >= 0).sort((a, b) => a.r - b.r).map((x) => x.it);
}

/* ── 글을 고르면 뜨는 서식 막대 ────────────────────────── */

const COLOR_NAMES: Record<TextColor, string> = { red: '빨강', orange: '주황', yellow: '노랑', green: '초록', blue: '파랑', purple: '보라', gray: '회색' };

function Bubble({ editor, onLink }: { editor: Editor; onLink(): void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      code: e.isActive('code'), highlight: e.isActive('highlight'), link: e.isActive('link'),
      color: (e.getAttributes('rColor').color as TextColor | undefined) ?? null,
    }),
  });
  const btn = (label: string, on: boolean, run: () => void, face: React.ReactNode) => (
    <button key={label} type="button" title={label} aria-label={label} aria-pressed={on} className={on ? 'is-on' : ''}
      onMouseDown={(e) => e.preventDefault()} onClick={run}>{face}</button>
  );
  const c = () => editor.chain().focus();
  return (
    <BubbleMenu editor={editor} pluginKey="tmReportBubble" className="tm-rbubble" options={{ placement: 'top', offset: 8 }}
      shouldShow={({ editor: e, state, from, to }) => e.isEditable && e.isFocused && from !== to
        && !(state.selection instanceof NodeSelection) && !(state.selection instanceof CellSelection)
        && !state.doc.resolve(from).parent.type.spec.code}>
      {btn('굵게 (Ctrl+B)', s.bold, () => c().toggleBold().run(), <b>B</b>)}
      {btn('기울임 (Ctrl+I)', s.italic, () => c().toggleItalic().run(), <i>I</i>)}
      {btn('밑줄 (Ctrl+U)', s.underline, () => c().toggleUnderline().run(), <u>U</u>)}
      {btn('취소선', s.strike, () => c().toggleStrike().run(), <s>S</s>)}
      {btn('코드 글자', s.code, () => c().toggleCode().run(), <code>{'</>'}</code>)}
      {btn('형광펜', s.highlight, () => c().toggleHighlight().run(), <mark>H</mark>)}
      <span className="tm-rbubble-sep" aria-hidden />
      {TEXT_COLORS.map((col) => btn(`글자색 ${COLOR_NAMES[col]}`, s.color === col,
        () => (s.color === col ? c().unsetMark('rColor').run() : c().setMark('rColor', { color: col }).run()),
        <span className={`tm-rbubble-dot tm-rcolor-${col}`}>A</span>))}
      <span className="tm-rbubble-sep" aria-hidden />
      {btn('링크 (Ctrl+K)', s.link, onLink, <span aria-hidden>🔗</span>)}
    </BubbleMenu>
  );
}

/* ── 칸 ─────────────────────────────────────────────── */

/**
 * 보고 칸 하나. 글은 줄 글로 주고받는다(value · onChange). 다른 곳에서 바뀐 글(실시간 · 지난 예정 가져오기 · 채우기)은
 * 이 칸을 쓰고 있지 않을 때 받아들이고, 쓰는 중이면 칸을 떠날 때 맞춘다
 */
export function RichCell({ id, value, onChange, placeholder, label, env, variant = 'field', minLines = 1, fileScope }: {
  id: string;
  value: string;
  onChange(v: string): void;
  placeholder?: string;
  /** 칸 이름(화면 읽기 프로그램) */
  label: string;
  env: EditEnv;
  /** cell = 표 칸(테두리 없이, 올리면 회색), field = 입력 칸 */
  variant?: 'cell' | 'field';
  minLines?: number;
  /** 첨부가 속한 보고 - 서버 경로 · 드라이브 폴더(날 · 사람)를 정한다 */
  fileScope?: FileScope;
}) {
  const scopeRef = useRef(fileScope);
  scopeRef.current = fileScope;
  const envRef = useRef(env);
  envRef.current = env;
  const last = useRef(value);
  const latest = useRef(value);
  latest.current = value;
  const send = useRef(onChange);
  send.current = onChange;
  const hint = useRef(placeholder ?? '');
  hint.current = placeholder ?? '';
  const fileInput = useRef<HTMLInputElement>(null);
  const [pickKind, setPickKind] = useState<'image' | 'file'>('file');
  const [busy, setBusy] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [link, setLink] = useState<{ text: string; url: string } | null>(null);
  const edRef = useRef<Editor | null>(null);
  const ui = useRef<Ui>({ pick: () => {}, link: () => {} });

  /** 파일을 올리고 지금 자리에 넣는다 - 그림은 그림으로, 나머지(PDF 등)는 파일 칩으로 */
  const insertFiles = async (files: File[], at?: number) => {
    const ed = edRef.current;
    if (!ed || !files.length) return;
    setNote(null);
    setBusy((n) => n + files.length);
    for (const f of files) {
      try {
        const src = await uploadReportFile(f, scopeRef.current);
        const node = isImageFile(f)
          ? { type: 'rImage', attrs: { src, name: f.name } }
          : { type: 'rFile', attrs: { src, name: f.name, size: f.size } };
        const chain = ed.chain().focus();
        if (at !== undefined && at <= ed.state.doc.content.size) chain.insertContentAt(at, [node, { type: 'text', text: ' ' }]);
        else chain.insertContent([node, { type: 'text', text: ' ' }]);
        chain.run();
      } catch (e) {
        setNote(e instanceof Error ? e.message : '파일을 넣지 못했습니다.');
      } finally {
        setBusy((n) => n - 1);
      }
    }
  };

  ui.current = {
    pick: (kind) => {
      setPickKind(kind);
      // 고르기 창은 사람의 누름 안에서 열어야 한다 - 메뉴의 Enter · 누름이 곧 그 누름이다
      setTimeout(() => fileInput.current?.click(), 0);
    },
    link: () => {
      const ed = edRef.current;
      const { from, to } = ed?.state.selection ?? { from: 0, to: 0 };
      setLink({ text: ed ? ed.state.doc.textBetween(from, to, ' ') : '', url: '' });
    },
  };

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] }, codeBlock: { HTMLAttributes: { class: 'tm-rcode' } }, trailingNode: false,
      link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https' },
    }),
    TaskList, TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: false }), RColor,
    Details.configure({
      persist: true, // 편집 칸에서는 열림을 문서에 둔다(새로 만든 접기 · 다시 연 접기는 펼친 채로 써 나간다). 저장 글에는 남기지 않는다
      HTMLAttributes: { class: 'tm-rdetails' },
      renderToggleButton: ({ element, isOpen }) => {
        element.setAttribute('aria-label', isOpen ? '접기' : '펼치기');
        element.setAttribute('aria-expanded', String(isOpen));
        element.className = 'tm-rdetails-toggle';
      },
    }),
    DetailsSummary, DetailsContent,
    TableKit.configure({ table: { resizable: false, HTMLAttributes: { class: 'tm-rtable' } } }),
    RPanel, RDecision, RMention, RStatus, RDate, RImage, RFile,
    Placeholder.configure({ placeholder: () => hint.current, includeChildren: true }),
    suggest('tmReportSlash', '/', '넣기 · 이름으로 찾기', (q, ed) => slashItems(ui, q, ed), { spaces: true }),
    suggest('tmReportTaskSlash', '#', '작업 넣기 · 담당자 이름 · 번호 · 제목으로 찾기', (q) => taskItems(envRef, q)),
    suggest('tmReportMention', '@', '사람 언급', (q) => mentionItems(envRef, q)),
    suggest('tmReportDoc', '[[', '팀 위키 문서 링크 · 제목으로 찾기', (q) => docItems(envRef, q), { spaces: true }),
    suggest('tmReportEmoji', ':', '이모지 · 이름으로 찾기', (q) => emojiItems(q), { min: 1 }),
    Extension.create({
      name: 'tmReportKeys',
      addKeyboardShortcuts() { return { 'Mod-k': () => { ui.current.link(); return true; } }; },
    }),
  ], []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: textToDoc(value),
    editorProps: {
      attributes: { id, 'aria-label': label, 'aria-multiline': 'true', role: 'textbox', class: 'tm-rcell-pm', spellcheck: 'false' },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])];
        // 글이 함께 오면(워드 · 웹 문서) 글을 넣는다 - 파일만 왔을 때(스크린숏 · 파일 복사)만 올린다
        if (!files.length || (event.clipboardData?.getData('text/plain') ?? '').trim()) return false;
        event.preventDefault();
        void insertFiles(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = [...(event.dataTransfer?.files ?? [])];
        if (moved || !files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertFiles(files, at);
        return true;
      },
    },
    onCreate: ({ editor: ed }) => { edRef.current = ed; },
    onUpdate: ({ editor: ed }) => {
      const t = docToText(ed.getJSON());
      if (t === last.current) return;
      last.current = t;
      send.current(t);
    },
    onBlur: ({ editor: ed }) => {
      // 쓰는 동안 들어온 바깥 글이 있으면 떠날 때 맞춘다(링크 창 · 파일 올리는 중에는 두고)
      if (latest.current !== last.current && !link && !busy) {
        last.current = latest.current;
        ed.commands.setContent(textToDoc(latest.current), { emitUpdate: false });
      }
    },
  });
  edRef.current = editor;

  useEffect(() => {
    if (!editor || editor.isDestroyed || value === last.current || editor.isFocused) return;
    last.current = value;
    editor.commands.setContent(textToDoc(value), { emitUpdate: false });
  }, [value, editor]);

  const putLink = () => {
    if (!editor || !link) return;
    let url = link.url.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    const text = link.text.trim() || url;
    editor.chain().focus().insertContent([{ type: 'text', text, marks: [{ type: 'link', attrs: { href: url } }] }, { type: 'text', text: ' ' }]).run();
    setLink(null);
  };

  return (
    <div className="tm-rcell" data-variant={variant} style={{ ['--tm-rcell-lines' as string]: String(minLines) }}
      onMouseDown={(e) => {
        // 칸의 빈 곳을 눌러도 글 끝으로 들어간다
        if (editor && !editor.isFocused && (e.target as HTMLElement).classList.contains('tm-rcell')) {
          e.preventDefault();
          editor.commands.focus('end');
        }
      }}>
      <EditorContent editor={editor} />
      {editor && <Bubble editor={editor} onLink={() => ui.current.link()} />}
      <input ref={fileInput} type="file" multiple hidden tabIndex={-1} aria-hidden
        accept={pickKind === 'image' ? 'image/png,image/jpeg,image/gif,image/webp' : undefined}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          void insertFiles(files);
        }} />
      {(busy > 0 || note) && (
        <p role="status" className={`tm-rcell-note ${note ? 'is-error' : ''}`}>{note ?? `파일 ${busy}개 올리는 중…`}</p>
      )}
      {link && (
        <div className="tm-rlink" role="dialog" aria-label="링크 넣기"
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); setLink(null); editor?.commands.focus(); }
            if (e.key === 'Enter') { e.preventDefault(); putLink(); }
          }}>
          <input autoFocus value={link.url} placeholder="주소 (https://…)" aria-label="링크 주소"
            onChange={(e) => setLink({ ...link, url: e.target.value })} />
          <input value={link.text} placeholder="보일 글 (비우면 주소)" aria-label="보일 글"
            onChange={(e) => setLink({ ...link, text: e.target.value })} />
          <span>
            <button type="button" onClick={() => { setLink(null); editor?.commands.focus(); }}>취소</button>
            <button type="button" className="is-primary" onClick={putLink} disabled={!link.url.trim()}>넣기</button>
          </span>
        </div>
      )}
    </div>
  );
}
