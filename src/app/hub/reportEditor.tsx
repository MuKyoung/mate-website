'use client';

import './reports.css';
import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { EditorContent, ReactRenderer, useEditor, type Editor } from '@tiptap/react';
import { Extension, type JSONContent, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { spansOf, stripBullet } from './reportStore';
import { STATUSES, type Member, type Status, type Task } from './types';
import { Avatar } from './ui';

/*
 * 보고 칸 편집기 - Confluence 문서처럼 쓴다(TipTap).
 *   · 칸은 글머리표 목록으로 시작한다. Enter 는 새 항목, Tab · Shift+Tab 은 들이고 내민다, 빈 항목에서 Enter 는 한 단계 꺼낸다.
 *   · Ctrl+B · I, ~~ · ` · ** 같은 마크다운 입력, 붙여 넣은 Confluence · 웹 목록은 목록 그대로.
 *   · '/' 를 치면 작업을 찾아 넣는다 - 내 작업이 먼저, 그다음 담당자별. 담당자 이름 · 작업 번호 · 제목으로 찾는다.
 * 저장은 예전과 같은 줄 글(한 줄 = 한 항목, 앞 공백 두 칸 = 한 단계 하위, 끝의 · 1일 = 소요기간)에
 * 짧은 글꼴 표시(**굵게** · *기울임* · ~~취소선~~ · `코드` · [글](주소))를 더한 것 - 화면 · 복사 · 주간 초안이 함께 읽는다(reportStore).
 */

/* ── 줄 글 ↔ 편집기 문서 ───────────────────────────────── */

function inlineNodes(text: string): JSONContent[] {
  return spansOf(text).filter((s) => s.text).map((s) => {
    const marks: JSONContent['marks'] = [];
    if (s.bold) marks.push({ type: 'bold' });
    if (s.italic) marks.push({ type: 'italic' });
    if (s.strike) marks.push({ type: 'strike' });
    if (s.code) marks.push({ type: 'code' });
    if (s.href) marks.push({ type: 'link', attrs: { href: s.href } });
    return marks.length ? { type: 'text', text: s.text, marks } : { type: 'text', text: s.text };
  });
}

const emptyDoc = (): JSONContent => ({
  type: 'doc', content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] }],
});

/** 줄 글 → 편집기 문서. 줄마다 목록 항목, 들여쓴 만큼 하위 목록(한 번에 한 단계까지) */
export function textToDoc(text: string): JSONContent {
  const lines = text.split('\n').filter((l) => l.trim()).map((raw) => {
    const lead = /^[ \t　]*/.exec(raw)?.[0] ?? '';
    let width = 0;
    for (const c of lead) width += c === ' ' ? 1 : 2;
    return { depth: Math.min(4, Math.floor(width / 2)), body: stripBullet(raw.slice(lead.length).trimEnd()) };
  });
  if (!lines.length) return emptyDoc();
  const root: JSONContent = { type: 'bulletList', content: [] };
  const stack: JSONContent[] = [root];
  for (const l of lines) {
    if (l.depth >= stack.length) {
      const items = stack[stack.length - 1].content ?? [];
      const last = items[items.length - 1];
      if (last) {
        const nested: JSONContent = { type: 'bulletList', content: [] };
        (last.content ??= []).push(nested);
        stack.push(nested);
      }
    } else {
      stack.length = l.depth + 1;
    }
    const nodes = inlineNodes(l.body);
    (stack[stack.length - 1].content ??= []).push({
      type: 'listItem', content: [nodes.length ? { type: 'paragraph', content: nodes } : { type: 'paragraph' }],
    });
  }
  return { type: 'doc', content: [root] };
}

function inlineText(nodes: JSONContent[] | undefined): string {
  return (nodes ?? []).map((n) => {
    if (n.type === 'hardBreak') return ' ';
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
  }).join('').replace(/\s+/g, ' ').trim();
}

/** 편집기 문서 → 줄 글. 빈 항목은 뺀다 */
export function docToText(doc: JSONContent): string {
  const out: string[] = [];
  const block = (n: JSONContent, depth: number) => {
    if (n.type === 'bulletList' || n.type === 'orderedList') {
      for (const li of n.content ?? []) for (const c of li.content ?? []) block(c, c.type === 'paragraph' ? depth : depth + 1);
    } else if (n.type === 'paragraph') {
      const t = inlineText(n.content);
      if (t) out.push(`${'  '.repeat(depth)}${t}`);
    } else {
      for (const c of n.content ?? []) block(c, depth);
    }
  };
  for (const c of doc.content ?? []) block(c, 0);
  return out.join('\n');
}

/* ── '/' 작업 찾기 ─────────────────────────────────────── */

export interface EditEnv {
  tasks: Task[];
  members: Member[];
  /** 지금 쓰는 사람(Member.id) - 그 사람 작업이 먼저 */
  me: string;
}

interface TaskItem { id: string; group: string; task: Task; who: string }

const STATUS_RANK: Record<Status, number> = { doing: 0, review: 1, todo: 2, backlog: 3, done: 4 };
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** 내 작업 → 담당자별(이름 순) → 담당자 없음. 묶음 안은 진행 중 · 리뷰 · 할 일 · 백로그 · 완료, 같으면 최근 고친 것 */
export function taskChoices(env: EditEnv, query: string): TaskItem[] {
  const q = norm(query);
  const nameOf = (id: string | null) => (id ? env.members.find((m) => m.id === id)?.name ?? '' : '');
  const hit = (t: Task) => !q || [t.key, t.title, nameOf(t.assignee), STATUSES.find((s) => s.id === t.status)?.label ?? '']
    .some((x) => norm(x).includes(q));
  const order = (a: Task, b: Task) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.updatedAt.localeCompare(a.updatedAt);
  const list = env.tasks.filter(hit);
  /** rank 0 = 내 작업, 1 = 담당자별, 2 = 담당자 없음 */
  const groups = new Map<string, { rank: number; name: string; tasks: Task[] }>();
  for (const t of list) {
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

interface ListHandle { onKeyDown(e: KeyboardEvent): boolean }

const TaskList = forwardRef<ListHandle, SuggestionProps<TaskItem, TaskItem>>(function TaskList({ items, command, query, editor }, ref) {
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

  let last = '';
  return (
    <div ref={box} id={`tm-rsg-${uid}`} className="tm-rsg" role="listbox" aria-label="작업 넣기">
      <p className="tm-rsg-title" role="presentation">작업 넣기 · 담당자 이름 · 번호 · 제목으로 찾기</p>
      {items.length === 0 && <p className="tm-rsg-empty" role="presentation">{query ? `'${query}'에 맞는 작업이 없습니다` : '작업이 없습니다'}</p>}
      {items.map((it, i) => {
        const head = it.group !== last ? <p key={`g-${it.group}-${i}`} className="tm-rsg-group" role="presentation">{it.group}</p> : null;
        last = it.group;
        const st = STATUSES.find((s) => s.id === it.task.status)?.label ?? '';
        return [
          head,
          <button key={it.id} id={`tm-rsg-${uid}-${i}`} type="button" role="option" tabIndex={-1} aria-selected={i === at} data-i={i}
            onMouseEnter={() => setAt(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => command(it)} className="tm-rsg-item">
            {it.task.assignee ? <Avatar id={it.task.assignee} size={22} /> : <span className="tm-rsg-noone" aria-hidden />}
            <span className="min-w-0 flex-1">
              <b className="block truncate">{it.task.title || '제목 없음'}</b>
              <small className="block truncate">{it.task.key} · {st}{it.who && it.group !== '내 작업' ? ` · ${it.who}` : ''}{it.task.due ? ` · ${it.task.due.slice(5).replace('-', '.')} 마감` : ''}</small>
            </span>
          </button>,
        ];
      })}
    </div>
  );
});

function taskSlash(envRef: { current: EditEnv }) {
  return Extension.create({
    name: 'tmReportTaskSlash',
    addProseMirrorPlugins() {
      return [Suggestion<TaskItem, TaskItem>({
        editor: this.editor,
        pluginKey: new PluginKey('tmReportTaskSlash'),
        char: '/',
        allow: ({ state, range }) => !state.doc.resolve(range.from).marks().some((m) => m.type.name === 'code'),
        items: ({ query }) => taskChoices(envRef.current, query),
        command: ({ editor, range, props: it }: { editor: Editor; range: Range; props: TaskItem }) => {
          editor.chain().focus().insertContentAt(range, `${it.task.key} ${it.task.title.trim()} `).run();
        },
        render: () => {
          let r: ReactRenderer<ListHandle, SuggestionProps<TaskItem, TaskItem>> | null = null;
          let unmount: (() => void) | null = null;
          return {
            onStart: (props: SuggestionProps<TaskItem, TaskItem>) => {
              r = new ReactRenderer(TaskList, { editor: props.editor, props });
              r.element.className = 'tm-rsg-root';
              unmount = props.mount(r.element);
            },
            onUpdate: (props: SuggestionProps<TaskItem, TaskItem>) => r?.updateProps(props),
            onKeyDown: ({ event }: SuggestionKeyDownProps) => {
              if (event.key === 'Escape') return false;
              return r?.ref?.onKeyDown(event) ?? false;
            },
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

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: false, codeBlock: false, blockquote: false, horizontalRule: false, orderedList: false,
      underline: false, hardBreak: false, trailingNode: false,
      link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https' },
    }),
    Placeholder.configure({ placeholder: () => hint.current, includeChildren: true }),
    taskSlash(envRef),
  ], []);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    content: textToDoc(value),
    editorProps: {
      attributes: { id, 'aria-label': label, 'aria-multiline': 'true', role: 'textbox', class: 'tm-rcell-pm', spellcheck: 'false' },
    },
    onUpdate: ({ editor: ed }) => {
      const t = docToText(ed.getJSON());
      if (t === last.current) return;
      last.current = t;
      send.current(t);
    },
    onBlur: ({ editor: ed }) => {
      // 쓰는 동안 들어온 바깥 글이 있으면 떠날 때 맞춘다
      if (latest.current !== last.current) {
        last.current = latest.current;
        ed.commands.setContent(textToDoc(latest.current), { emitUpdate: false });
      }
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed || value === last.current || editor.isFocused) return;
    last.current = value;
    editor.commands.setContent(textToDoc(value), { emitUpdate: false });
  }, [value, editor]);

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
    </div>
  );
}
