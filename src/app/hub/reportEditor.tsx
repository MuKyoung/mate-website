'use client';

import './reports.css';
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, ReactRenderer, useEditor, type Editor, type NodeViewProps } from '@tiptap/react';
import { Extension, Node, type JSONContent, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { PANEL_KINDS, dateChip, lineKindOf, spansOf, type PanelKind, type StatusColor } from './reportStore';
import { isImageFile, openReportFile, reportFileUrl, sizeLabel, uploadReportFile } from './reportFiles';
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

/** 줄 글 → 편집기 문서. 목록 줄은 들여쓴 만큼 하위 목록(한 번에 한 단계까지), 제목 · 인용 · 패널 · 결정 · 구분선은 맨 위 블록 */
export function textToDoc(text: string): JSONContent {
  const top: JSONContent[] = [];
  let stack: { node: JSONContent; type: ListType }[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    const lead = /^[ \t　]*/.exec(raw)?.[0] ?? '';
    let width = 0;
    for (const c of lead) width += c === ' ' ? 1 : 2;
    const depth = Math.min(4, Math.floor(width / 2));
    const k = lineKindOf(raw.slice(lead.length).trimEnd(), depth);
    if (depth === 0 && ['h1', 'h2', 'h3', 'quote', 'divider', 'panel', 'decision'].includes(k.kind)) {
      stack = [];
      if (k.kind === 'divider') top.push({ type: 'horizontalRule' });
      else if (k.kind === 'quote') {
        const last = top[top.length - 1];
        if (last?.type === 'blockquote') (last.content ??= []).push(para(k.body));
        else top.push({ type: 'blockquote', content: [para(k.body)] });
      } else if (k.kind === 'panel') top.push({ type: 'rPanel', attrs: { kind: k.panel }, content: para(k.body).content });
      else if (k.kind === 'decision') top.push({ type: 'rDecision', content: para(k.body).content });
      else top.push({ type: 'heading', attrs: { level: Number(k.kind.slice(1)) }, content: para(k.body).content });
      continue;
    }
    const type: ListType = k.kind === 'num' ? 'orderedList' : k.kind === 'task' || k.kind === 'done' ? 'taskList' : 'bulletList';
    const d = Math.min(depth, stack.length);
    const fresh = (): JSONContent => (type === 'orderedList' && k.num && k.num !== 1
      ? { type, attrs: { start: k.num }, content: [] } : { type, content: [] });
    if (d === 0) {
      if (stack[0]?.type !== type) {
        const node = fresh();
        top.push(node);
        stack = [{ node, type }];
      } else stack.length = 1;
    } else if (stack[d]?.type === type) {
      stack.length = d + 1;
    } else {
      const items = stack[d - 1].node.content ?? [];
      const parent = items[items.length - 1];
      const node = fresh();
      if (parent) (parent.content ??= []).push(node);
      else (stack[d - 1].node.content ??= []).push(node);
      stack.length = d;
      stack.push({ node, type });
    }
    const body = ['h1', 'h2', 'h3', 'quote', 'divider', 'panel', 'decision'].includes(k.kind) ? raw.slice(lead.length).trimEnd() : k.body;
    (stack[stack.length - 1].node.content ??= []).push(type === 'taskList'
      ? { type: 'taskItem', attrs: { checked: k.kind === 'done' }, content: [para(body)] }
      : { type: 'listItem', content: [para(body)] });
  }
  return top.length ? { type: 'doc', content: top } : emptyDoc();
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
    if (has('bold')) t = `**${t}**`;
    if (has('italic')) t = `*${t}*`;
    if (has('strike')) t = `~~${t}~~`;
    const href = has('link')?.attrs?.href as string | undefined;
    if (href && href !== n.text) t = `[${t}](${href})`;
    return t;
  }).join('').replace(/[ \t]+/g, ' ').replace(/^ | $/g, '').replace(/^(<br>)+|(<br>)+$/g, '');
}

/** 글머리표 줄인데 글이 줄 머리 표시처럼 시작하면 '- ' 를 붙여 그대로 읽히게 한다 */
const LOOKS_MARKED = /^(?:\[[ xX]\]\s|\[!|<>\s|#{1,3}\s|>\s|\d{1,3}[.)]\s|-{3,}$|_{3,}$|\*{3,}$|[-*•·]\s)/;

/** 편집기 문서 → 줄 글. 빈 항목은 뺀다 */
export function docToText(doc: JSONContent): string {
  const out: string[] = [];
  const pad = (d: number) => '  '.repeat(d);
  const list = (n: JSONContent, depth: number) => {
    let i = Number(n.attrs?.start) || 1;
    for (const li of n.content ?? []) {
      let first = true;
      for (const c of li.content ?? []) {
        if (c.type === 'paragraph') {
          const t = inlineText(c.content);
          if (t) {
            const mark = !first ? '' : n.type === 'orderedList' ? `${i}. ` : n.type === 'taskList' ? (li.attrs?.checked ? '[x] ' : '[ ] ')
              : LOOKS_MARKED.test(t) ? '- ' : '';
            out.push(`${pad(depth)}${mark}${t}`);
          }
          first = false;
        } else block(c, depth + 1);
      }
      i += 1;
    }
  };
  const block = (n: JSONContent, depth: number) => {
    const t = inlineText(n.content);
    switch (n.type) {
      case 'bulletList': case 'orderedList': case 'taskList': list(n, depth); break;
      case 'paragraph': if (t) out.push(`${pad(depth)}${LOOKS_MARKED.test(t) ? '- ' : ''}${t}`); break;
      case 'heading': if (t) out.push(depth ? `${pad(depth)}${t}` : `${'#'.repeat(Number(n.attrs?.level) || 1)} ${t}`); break;
      case 'blockquote': for (const c of n.content ?? []) {
        if (c.type === 'paragraph') { const q = inlineText(c.content); if (q) out.push(`${pad(depth)}> ${q}`); } else block(c, depth);
      } break;
      case 'horizontalRule': out.push(`${pad(depth)}---`); break;
      case 'rPanel': if (t) out.push(`${pad(depth)}[!${n.attrs?.kind ?? 'info'}] ${t}`); break;
      case 'rDecision': if (t) out.push(`${pad(depth)}<> ${t}`); break;
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
  return (
    <NodeViewWrapper as="span" className={`tm-rfile ${selected ? 'is-selected' : ''}`} data-r-file="" title={`${name} - 두 번 누르면 엽니다`}
      onDoubleClick={() => void openReportFile(String(node.attrs.src)).catch(() => {})}>
      <span aria-hidden>{/\.pdf$/i.test(name) ? '📄' : '📎'}</span>
      {name}
      {Number(node.attrs.size) > 0 && <small>{sizeLabel(Number(node.attrs.size))}</small>}
    </NodeViewWrapper>
  );
}

const RImage = atom('rImage', { src: '', name: '' }, (a) => ['span', { class: 'tm-rimage' }, `[그림 ${a.name}]`])
  .extend({ addNodeView() { return ReactNodeViewRenderer(ImageView, { as: 'span' }); } });
const RFile = atom('rFile', { src: '', name: '', size: 0 }, (a) => ['span', { class: 'tm-rfile' }, `[파일 ${a.name}]`])
  .extend({ addNodeView() { return ReactNodeViewRenderer(FileView, { as: 'span' }); } });

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

function suggest(name: string, char: string, title: string, items: (query: string) => SugItem[], spaces = false) {
  return Extension.create({
    name,
    addProseMirrorPlugins() {
      return [Suggestion<SugItem, SugItem>({
        editor: this.editor,
        pluginKey: new PluginKey(name),
        char,
        // '/' 메뉴는 Confluence 처럼 띄어 쓴 이름(작업 항목)으로도 찾는다 - 너무 길어지면 글을 쓰는 중으로 보고 닫는다
        allowSpaces: spaces,
        allow: ({ state, range }) => !state.doc.resolve(range.from).marks().some((m) => m.type.name === 'code')
          && (!spaces || (range.to - range.from <= 25 && (() => {
            // 띄어 쓴 뒤에도 맞는 것이 없으면 메뉴가 아니라 글이다 - 닫는다
            const q = state.doc.textBetween(range.from + char.length, range.to, ' ');
            return !q.includes(' ') || items(q).length > 0;
          })())),
        items: ({ query }) => items(query),
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

/* '/' Confluence 넣기 메뉴 */

const STATUS_PRESETS: { text: string; color: StatusColor }[] = [
  { text: '할 일', color: 'gray' }, { text: '진행 중', color: 'blue' }, { text: '검토', color: 'yellow' },
  { text: '완료', color: 'green' }, { text: '막힘', color: 'red' }, { text: '보류', color: 'purple' },
];
const EMOJI: { e: string; label: string; keys: string }[] = [
  { e: '✅', label: '완료', keys: 'check done ok 체크' }, { e: '❌', label: '안 됨', keys: 'x no fail 실패' },
  { e: '⚠️', label: '주의', keys: 'warning 경고' }, { e: '💡', label: '아이디어', keys: 'idea bulb 생각' },
  { e: '🔥', label: '급함', keys: 'fire hot 불' }, { e: '👍', label: '좋아요', keys: 'thumbs up like 좋음' },
  { e: '🎉', label: '축하', keys: 'party tada 축하' }, { e: '❓', label: '질문', keys: 'question 물음' },
  { e: '🚧', label: '작업 중', keys: 'construction wip 공사' }, { e: '📌', label: '고정', keys: 'pin 핀 중요' },
];

const block = (e: Editor, r: Range) => e.chain().focus().deleteRange(r).clearNodes();

function slashItems(ui: { current: Ui }, query: string): SugItem[] {
  const all: SugItem[] = [
    { id: 'h1', group: '서식', label: '제목 1', icon: 'H1', keys: 'heading h1 제목 큰', run: (e, r) => { block(e, r).setNode('heading', { level: 1 }).run(); } },
    { id: 'h2', group: '서식', label: '제목 2', icon: 'H2', keys: 'heading h2 제목', run: (e, r) => { block(e, r).setNode('heading', { level: 2 }).run(); } },
    { id: 'h3', group: '서식', label: '제목 3', icon: 'H3', keys: 'heading h3 제목 작은', run: (e, r) => { block(e, r).setNode('heading', { level: 3 }).run(); } },
    { id: 'bullet', group: '서식', label: '글머리표 목록', hint: '- 로도 시작', icon: '•', keys: 'bullet list ul 목록 글머리', run: (e, r) => { block(e, r).toggleBulletList().run(); } },
    { id: 'ordered', group: '서식', label: '번호 목록', hint: '1. 로도 시작', icon: '1.', keys: 'numbered ordered ol list 번호 목록', run: (e, r) => { block(e, r).toggleOrderedList().run(); } },
    { id: 'quote', group: '서식', label: '인용', hint: '> 로도 시작', icon: '❝', keys: 'quote blockquote 인용', run: (e, r) => { block(e, r).toggleBlockquote().run(); } },
    { id: 'divider', group: '서식', label: '구분선', hint: '--- 로도', icon: '—', keys: 'divider rule hr line 구분 선', run: (e, r) => { e.chain().focus().deleteRange(r).setHorizontalRule().run(); } },
    { id: 'code', group: '서식', label: '코드', hint: '` 로 감싸도', icon: '</>', keys: 'code snippet 코드', run: (e, r) => { e.chain().focus().deleteRange(r).toggleCode().run(); } },
    { id: 'task', group: '작업 · 결정', label: '작업 항목', hint: '[] 로도 시작 · 체크 상자', icon: '☑', keys: 'action item task todo checkbox 할 일 작업 체크', run: (e, r) => { block(e, r).toggleTaskList().run(); } },
    { id: 'decision', group: '작업 · 결정', label: '결정', hint: '<> 로도 시작', icon: '◆', keys: 'decision 결정', run: (e, r) => { block(e, r).setNode('rDecision').run(); } },
    ...PANEL_KINDS.map<SugItem>((p) => ({
      id: `panel-${p.id}`, group: '패널', label: `${p.label} 패널`, icon: p.icon, keys: `panel ${p.id} ${p.label} 패널`,
      run: (e, r) => { block(e, r).setNode('rPanel', { kind: p.id as PanelKind }).run(); },
    })),
    { id: 'image', group: '넣기', label: '그림', hint: '붙여 넣기 · 끌어 놓기도 됩니다', icon: '🖼️', keys: 'image picture photo screenshot 그림 사진 이미지 캡처', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.pick('image'); } },
    { id: 'file', group: '넣기', label: '파일 · PDF', hint: '20MB 까지', icon: '📎', keys: 'file pdf attachment upload 파일 첨부 문서', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.pick('file'); } },
    { id: 'link', group: '넣기', label: '링크', hint: 'Ctrl+K', icon: '🔗', keys: 'link url 링크 주소', run: (e, r) => { e.chain().focus().deleteRange(r).run(); ui.current.link(); } },
    { id: 'mention', group: '넣기', label: '사람 언급', hint: '@ 로도', icon: '@', keys: 'mention people user 언급 사람 태그', run: (e, r) => { e.chain().focus().insertContentAt(r, '@').run(); } },
    { id: 'tasks', group: '넣기', label: '작업 넣기', hint: '# 로도 · 담당자별 찾기', icon: '#', keys: 'jira issue task 작업 이슈 지라', run: (e, r) => { e.chain().focus().insertContentAt(r, '#').run(); } },
    { id: 'date', group: '넣기', label: '날짜', hint: '오늘', icon: '📅', keys: 'date today 날짜 오늘', run: (e, r) => { e.chain().focus().insertContentAt(r, [{ type: 'rDate', attrs: { date: localToday() } }, { type: 'text', text: ' ' }]).run(); } },
    ...STATUS_PRESETS.map<SugItem>((s) => ({
      id: `status-${s.color}`, group: '상태', label: `상태 · ${s.text}`, icon: <span className={`tm-rstatus tm-rstatus-${s.color}`}>{s.text.slice(0, 1)}</span>,
      keys: `status lozenge 상태 ${s.text}`,
      run: (e, r) => { e.chain().focus().insertContentAt(r, [{ type: 'rStatus', attrs: { text: s.text, color: s.color } }, { type: 'text', text: ' ' }]).run(); },
    })),
    ...EMOJI.map<SugItem>((m) => ({
      id: `emoji-${m.e}`, group: '이모지', label: `${m.e} ${m.label}`, icon: m.e, keys: `emoji 이모지 ${m.label} ${m.keys}`,
      run: (e, r) => { e.chain().focus().insertContentAt(r, `${m.e} `).run(); },
    })),
  ];
  const q = norm(query);
  return q ? all.filter((it) => norm(`${it.label} ${it.keys ?? ''} ${it.hint ?? ''}`).includes(q)) : all;
}

/* ── 칸 ─────────────────────────────────────────────── */

/**
 * 보고 칸 하나. 글은 줄 글로 주고받는다(value · onChange). 다른 곳에서 바뀐 글(실시간 · 지난 예정 가져오기 · 채우기)은
 * 이 칸을 쓰고 있지 않을 때 받아들이고, 쓰는 중이면 칸을 떠날 때 맞춘다
 */
export function RichCell({ id, value, onChange, placeholder, label, env, variant = 'field', minLines = 1 }: {
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
}) {
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
        const src = await uploadReportFile(f);
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
      heading: { levels: [1, 2, 3] }, codeBlock: false, underline: false, trailingNode: false,
      link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https' },
    }),
    TaskList, TaskItem.configure({ nested: true }),
    RPanel, RDecision, RMention, RStatus, RDate, RImage, RFile,
    Placeholder.configure({ placeholder: () => hint.current, includeChildren: true }),
    suggest('tmReportSlash', '/', '넣기 · 이름으로 찾기', (q) => slashItems(ui, q), true),
    suggest('tmReportTaskSlash', '#', '작업 넣기 · 담당자 이름 · 번호 · 제목으로 찾기', (q) => taskItems(envRef, q)),
    suggest('tmReportMention', '@', '사람 언급', (q) => mentionItems(envRef, q)),
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
