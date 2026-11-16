'use client';

import './wiki.css';
import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  EditorContent, NodeViewWrapper, ReactNodeViewRenderer, ReactRenderer, useEditor, useEditorState,
  type Editor, type JSONContent, type NodeViewProps,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Extension, getMarkRange, type EditorOptions, type Range } from '@tiptap/core';
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { Placeholder } from '@tiptap/extensions';
import { CALLOUTS, docToMd, linkTo, mdToDoc, type CalloutKind, type DiffMark } from './docMarkdown';
import { wikiSchema } from './docSchema';
import { useMembers } from './members';
import { localToday, statusLabel, type Status } from './types';
import { Avatar } from './ui';

/*
 * 위키 편집기 - 노션 · Confluence 처럼 보이는 그대로 고친다.
 *
 * 본문은 마크다운 글자로 받고 고친 결과도 마크다운으로 돌려준다(docMarkdown.ts). 보기 모드도 같은 편집기를
 * 읽기 전용으로 띄워 보기와 편집의 모양이 같다. 편집기는 문서마다 새로 세운다(key) - 되돌리기 기록이 섞이지 않게.
 *
 *   /            블록 넣기 메뉴           @   사람 언급        [[  문서 · 작업 링크
 *   글 고르기    떠 있는 서식 막대        왼쪽 손잡이  끌어 옮기기 · 블록 메뉴
 *   붙여 넣기    마크다운 글은 꼴로, 그림 · 파일은 올려서 넣는다
 */

/* ── 편집기 밖의 것들 ─────────────────────────────── */

export interface WikiRefs {
  /** 문서 링크의 지금 제목 · 아이콘. gone = 휴지통에 있거나 지운 문서 */
  docs: { id: string; title: string; icon: string; gone?: boolean }[];
  tasks: { key: string; title: string; status: Status }[];
  openDoc(id: string): void;
  openTask(key: string): void;
  /** tmfile: 주소 → 볼 수 있는 주소 */
  fileUrl(src: string): Promise<string>;
  /** 링크를 눌렀는데 열 수 없을 때 까닭을 알린다(없는 문서 · 없는 제목 · 열지 못한 파일) */
  notice?(text: string): void;
}

const WikiContext = createContext<WikiRefs | null>(null);
const useWiki = () => useContext(WikiContext);

export interface WikiHeading {
  level: number;
  text: string;
  pos: number;
}

/* ── 그림 · 언급 · 문서 링크의 화면 ──────────────────── */

function ImageView({ node, selected, editor, updateAttributes }: NodeViewProps) {
  const wiki = useWiki();
  const src = String(node.attrs.src ?? '');
  const alt = String(node.attrs.alt ?? '');
  const [url, setUrl] = useState<string | null>(src.startsWith('tmfile:') ? null : src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src.startsWith('tmfile:')) {
      setUrl(src);
      return;
    }
    let live = true;
    setUrl(null);
    setFailed(false);
    wiki?.fileUrl(src).then((u) => { if (live) setUrl(u); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [src, wiki]);

  return (
    <NodeViewWrapper className={`tm-figure${selected ? ' is-selected' : ''}`} data-drag-handle="">
      {url ? (
        // 보기 모드에서 누르면 원본 크기로 새 탭에 연다
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="tm-image" draggable={false}
          onClick={() => { if (!editor.isEditable) window.open(url, '_blank', 'noopener,noreferrer'); }} />
      ) : (
        <div className="tm-image-wait">{failed ? '그림을 불러오지 못했습니다' : '그림을 불러오는 중…'}</div>
      )}
      {editor.isEditable && selected ? (
        <input className="tm-figcaption-input" value={alt} placeholder="그림 설명(보기 모드에서 아래에 적힙니다)"
          onChange={(e) => updateAttributes({ alt: e.target.value || null })} />
      ) : alt ? <span className="tm-figcaption">{alt}</span> : null}
    </NodeViewWrapper>
  );
}

function MentionView({ node }: NodeViewProps) {
  const members = useMembers();
  const m = members.find((x) => x.id === node.attrs.id);
  return (
    <NodeViewWrapper as="span" className="tm-mention" title={m ? `${m.name} · ${m.role}` : undefined}>
      @{m?.name ?? node.attrs.label}
    </NodeViewWrapper>
  );
}

function DocLinkView({ node, editor }: NodeViewProps) {
  const wiki = useWiki();
  const d = wiki?.docs.find((x) => x.id === node.attrs.id);
  const title = d?.title || String(node.attrs.title || '문서');
  return (
    <NodeViewWrapper as="span" className={`tm-doclink${!d || d.gone ? ' is-gone' : ''}`}
      title={!d ? '찾을 수 없는 문서' : d.gone ? '휴지통에 있는 문서' : `${title} 열기`}
      onClick={(e: React.MouseEvent) => {
        // 편집 중에는 Ctrl(⌘)과 함께 눌러야 연다 - 그냥 누르면 고르기만
        if (editor.isEditable && !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        // 영구 삭제된 문서 - 아무 일 없이 끝나지 않게 까닭을 알린다
        if (!d) wiki?.notice?.(`'${title}' 문서를 찾을 수 없습니다. 영구 삭제된 문서라 열 수 없습니다`);
        else wiki?.openDoc(d.id);
      }}>
      {d?.icon ? <span className="tm-doclink-icon" aria-hidden>{d.icon}</span> : <DocGlyph />}
      {title}
    </NodeViewWrapper>
  );
}

function DocGlyph() {
  return (
    <svg className="tm-doclink-glyph" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3h6l3.5 3.5V17h-9.5z" /><path d="M11.5 3v3.5H15" />
    </svg>
  );
}

/* ── 제안 목록(/ · @ · [[) ────────────────────────────── */

interface SuggestItem {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  /** 묶음 이름 - 바뀌는 곳에 묶음 머리를 단다 */
  group?: string;
  /** 마크다운처럼 바로 치는 법(오른쪽에 작게) */
  md?: string;
  /** 쓸 수 없으면 그 까닭 - 보이되 고를 수 없다 */
  disabled?: string;
  run(editor: Editor, range: Range): void;
}

interface SuggestListHandle {
  onKeyDown(e: KeyboardEvent): boolean;
}

/** from 에서 d 쪽으로 가며 고를 수 있는 첫 항목 - 쓸 수 없는 항목은 건너뛴다 */
function nextEnabled(items: SuggestItem[], from: number, d: 1 | -1): number {
  const n = items.length;
  for (let k = 1; k <= n; k += 1) {
    const i = (((from + d * k) % n) + n) % n;
    if (!items[i].disabled) return i;
  }
  return from;
}

const SuggestList = forwardRef<SuggestListHandle, SuggestionProps<SuggestItem, SuggestItem> & { title: string }>(
  function SuggestList({ items, command, title, query, editor }, ref) {
    const uid = useId().replace(/:/g, '');
    const first = (xs: SuggestItem[]) => Math.max(0, xs.findIndex((x) => !x.disabled));
    const [at, setAt] = useState(() => first(items));
    const box = useRef<HTMLDivElement>(null);
    useEffect(() => setAt(first(items)), [items]);

    /* 편집 칸과 목록을 잇는다 - 화면 읽기 프로그램이 지금 고른 항목을 읽는다. 목록이 닫히면 뗀다 */
    useEffect(() => {
      const dom = editor.view.dom;
      dom.setAttribute('aria-controls', `tm-suggest-${uid}`);
      dom.setAttribute('aria-autocomplete', 'list');
      return () => ['aria-controls', 'aria-autocomplete', 'aria-activedescendant'].forEach((a) => dom.removeAttribute(a));
    }, [editor, uid]);
    useEffect(() => {
      const dom = editor.view.dom;
      if (items[at]) dom.setAttribute('aria-activedescendant', `tm-suggest-${uid}-${at}`);
      else dom.removeAttribute('aria-activedescendant');
      keepInView(box.current, box.current?.querySelector<HTMLElement>(`[data-i="${at}"]`) ?? null);
    }, [at, items, editor, uid]);

    useImperativeHandle(ref, () => ({
      onKeyDown(e) {
        if (!items.length) return false;
        if (e.key === 'ArrowDown') { setAt((x) => nextEnabled(items, x, 1)); return true; }
        if (e.key === 'ArrowUp') { setAt((x) => nextEnabled(items, x, -1)); return true; }
        if (e.key === 'Enter' || e.key === 'Tab') {
          const it = items[at];
          // 맞는 문서가 없어 '새 문서'만 남았으면 Enter 는 줄바꿈으로 둔다 - 코드의 [[ … ]] 를 치다 문서가 생기지 않게(Tab · 누르기로는 만든다)
          if (e.key === 'Enter' && it?.id === 'new' && items.length === 1) return false;
          if (it && !it.disabled) command(it);
          return true;
        }
        return false;
      },
    }), [items, at, command]);

    /* 이어지는 같은 묶음끼리 모은다 */
    const groups: { name?: string; list: { it: SuggestItem; i: number }[] }[] = [];
    items.forEach((it, i) => {
      const last = groups[groups.length - 1];
      if (last && last.name === it.group) last.list.push({ it, i });
      else groups.push({ name: it.group, list: [{ it, i }] });
    });
    const option = (it: SuggestItem, i: number) => (
      <button key={it.id} id={`tm-suggest-${uid}-${i}`} type="button" role="option" tabIndex={-1}
        aria-selected={i === at} aria-disabled={it.disabled ? true : undefined} data-i={i}
        onMouseEnter={() => { if (!it.disabled) setAt(i); }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { if (!it.disabled) command(it); }}
        className="tm-suggest-item">
        {it.icon && <span className="tm-suggest-icon" aria-hidden>{it.icon}</span>}
        <span className="min-w-0 flex-1">
          <b className="block truncate">{it.label}</b>
          {(it.disabled ?? it.hint) && <small className="block truncate">{it.disabled ?? it.hint}</small>}
        </span>
        {it.md && <kbd className="tm-menu-md">{it.md}</kbd>}
      </button>
    );

    return (
      <div ref={box} id={`tm-suggest-${uid}`} className="tm-suggest" role="listbox" aria-label={title}>
        <p className="tm-suggest-title" role="presentation">{title}</p>
        {items.length === 0 ? (
          <p className="tm-suggest-empty" role="presentation">{query ? `'${query}'에 맞는 것이 없습니다` : '고를 것이 없습니다'}</p>
        ) : groups.map((g, gi) => (g.name ? (
          <div key={`${g.name}-${gi}`} role="group" aria-label={g.name}>
            <p className="tm-suggest-group" role="presentation">{g.name}</p>
            {g.list.map(({ it, i }) => option(it, i))}
          </div>
        ) : g.list.map(({ it, i }) => option(it, i))))}
      </div>
    );
  },
);

/** 제안 목록 띄우기 - 편집기 안의 React 로 그려 문서 · 팀원 목록을 그대로 읽는다 */
function suggestRender(title: string) {
  return () => {
    let r: ReactRenderer<SuggestListHandle, SuggestionProps<SuggestItem, SuggestItem> & { title: string }> | null = null;
    let unmount: (() => void) | null = null;
    return {
      onStart: (props: SuggestionProps<SuggestItem, SuggestItem>) => {
        r = new ReactRenderer(SuggestList, { editor: props.editor, props: { ...props, title } });
        r.element.className = 'tm-suggest-root';
        unmount = props.mount(r.element);
      },
      onUpdate: (props: SuggestionProps<SuggestItem, SuggestItem>) => r?.updateProps({ ...props, title }),
      onKeyDown: ({ event }: SuggestionKeyDownProps) => r?.ref?.onKeyDown(event) ?? false,
      onExit: () => {
        unmount?.();
        r?.destroy();
        r = null;
        unmount = null;
      },
    };
  };
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
const matches = (q: string, ...xs: (string | undefined)[]) => !q || xs.some((x) => x && norm(x).includes(norm(q)));

/** 제안 목록을 띄울 수 있는 자리 - 코드 블록 · 접기 제목 · 코드 글자 안은 글자 그대로 쓴다 */
const writable = ({ state, range }: { state: Editor['state']; range: Range }) => {
  const $from = state.doc.resolve(range.from);
  const parent = $from.parent.type.name;
  return parent !== 'codeBlock' && parent !== 'detailsSummary' && !$from.marks().some((m) => m.type.name === 'code');
};

/** 표 칸 안인가 - 표 칸에는 문단만 들어가므로 / 메뉴에서 글 안에 넣는 것만 보인다 */
const inCell = (state: Editor['state'], pos: number) => {
  const $p = state.doc.resolve(pos);
  for (let d = $p.depth; d > 0; d -= 1) {
    const n = $p.node(d).type.name;
    if (n === 'tableCell' || n === 'tableHeader') return true;
  }
  return false;
};
const CELL_OK = new Set(['doc', 'mention', 'date']);

/* ── 슬래시 메뉴의 블록 ─────────────────────────────── */

/** 블록 넣기 묶음 - / 목록과 도구 막대의 '넣기'가 같은 순서로 쓴다 */
const BLOCK_GROUPS = ['기본', '목록', '정보 · 코드', '미디어', '링크 · 사람'] as const;
type BlockGroup = typeof BLOCK_GROUPS[number];

type BlockCmd = {
  id: string; label: string; hint: string; keys: string; icon: React.ReactNode; group: BlockGroup;
  /** 마크다운처럼 바로 치는 법 */
  md?: string;
  run(e: Editor, r: Range): void;
};

/** 파일을 올릴 수 없는 환경(Supabase 에 위키 SQL 이 없음)에서 그림 · 파일 첨부가 꺼진 까닭 */
const UPLOAD_OFF = '이 위키에서는 파일을 올릴 수 없습니다';
const needsUpload = (id: string) => id === 'image' || id === 'file';

/** 블록 넣기 명령 - / 목록과 도구 막대의 '넣기' 메뉴가 같은 목록을 쓴다. 설명은 무엇에 쓰는지부터 */
function blockCommands(pick: (kind: 'image' | 'file') => void): BlockCmd[] {
  const at = (e: Editor, r: Range) => e.chain().focus().deleteRange(r);
  return [
    { id: 'p', group: '기본', label: '본문', hint: '보통 글', keys: 'text paragraph 텍스트 글 본문', icon: 'T', run: (e, r) => at(e, r).setParagraph().run() },
    { id: 'h1', group: '기본', label: '제목 1', hint: '문서를 크게 나누는 제목', md: '#', keys: 'h1 heading 제목 #', icon: 'H1', run: (e, r) => at(e, r).setHeading({ level: 1 }).run() },
    { id: 'h2', group: '기본', label: '제목 2', hint: '단락 안을 나누는 제목', md: '##', keys: 'h2 heading 제목 ##', icon: 'H2', run: (e, r) => at(e, r).setHeading({ level: 2 }).run() },
    { id: 'h3', group: '기본', label: '제목 3', hint: '작은 소제목', md: '###', keys: 'h3 heading 제목 ###', icon: 'H3', run: (e, r) => at(e, r).setHeading({ level: 3 }).run() },
    { id: 'h4', group: '기본', label: '제목 4', hint: '목차에 드는 가장 작은 제목', md: '####', keys: 'h4 heading 제목 ####', icon: 'H4', run: (e, r) => at(e, r).setHeading({ level: 4 }).run() },
    { id: 'ul', group: '목록', label: '글머리 목록', hint: '순서 없이 항목 나열', md: '-', keys: 'bullet list ul 목록 리스트', icon: <Ico n="ul" />, run: (e, r) => at(e, r).toggleBulletList().run() },
    { id: 'ol', group: '목록', label: '번호 목록', hint: '순서가 있는 단계', md: '1.', keys: 'number ordered ol 번호 목록', icon: <Ico n="ol" />, run: (e, r) => at(e, r).toggleOrderedList().run() },
    { id: 'todo', group: '목록', label: '할 일 목록', hint: '체크하며 진행할 일', md: '[ ]', keys: 'todo task check 할일 체크 체크박스', icon: <Ico n="todo" />, run: (e, r) => at(e, r).toggleTaskList().run() },
    { id: 'quote', group: '정보 · 코드', label: '강조 패널', hint: '눈에 띄게 둘 짧은 안내', md: '>', keys: 'quote panel blockquote 인용 패널 강조', icon: <Ico n="quote" />, run: (e, r) => at(e, r).toggleBlockquote().run() },
    ...CALLOUTS.map((c): BlockCmd => ({
      id: `callout-${c.kind}`, group: '정보 · 코드', label: `알림 상자 · ${c.label}`, hint: CALLOUT_HINT[c.kind], keys: `callout alert 알림 상자 콜아웃 ${c.kind} ${c.tag}`,
      icon: <Ico n={`callout-${c.kind}` as IcoName} />, run: (e, r) => at(e, r).setCallout(c.kind).run(),
    })),
    { id: 'toggle', group: '정보 · 코드', label: '접기', hint: '필요할 때 펼쳐 보는 긴 내용', keys: 'toggle details 접기 토글 펼치기', icon: <Ico n="toggle" />, run: (e, r) => at(e, r).setDetails().run() },
    { id: 'code', group: '정보 · 코드', label: '코드 블록', hint: '명령어 · 코드를 글자 그대로', md: '```', keys: 'code block 코드', icon: <Ico n="codeblock" />, run: (e, r) => at(e, r).toggleCodeBlock().run() },
    { id: 'table', group: '정보 · 코드', label: '표', hint: '항목을 줄과 칸으로 비교 · 3 × 3', keys: 'table 표 테이블', icon: <Ico n="table" />, run: (e, r) => at(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { id: 'hr', group: '정보 · 코드', label: '구분선', hint: '흐름을 나누는 줄', md: '---', keys: 'divider hr line 구분선 줄', icon: <Ico n="hr" />, run: (e, r) => at(e, r).setHorizontalRule().run() },
    { id: 'image', group: '미디어', label: '그림', hint: '그림 파일 올리기 · 붙여 넣기도 됩니다', keys: 'image picture photo 그림 이미지 사진', icon: <Ico n="image" />, run: (e, r) => { at(e, r).run(); pick('image'); } },
    { id: 'file', group: '미디어', label: '파일 첨부', hint: '파일을 올려 링크로 넣기', keys: 'file attach 파일 첨부', icon: <Ico n="file" />, run: (e, r) => { at(e, r).run(); pick('file'); } },
    { id: 'doc', group: '링크 · 사람', label: '문서 · 작업 링크', hint: '다른 문서나 작업으로 잇기', md: '[[', keys: 'link page doc task 문서 링크 작업 페이지', icon: <DocGlyph />, run: (e, r) => at(e, r).insertContent('[[').run() },
    {
      id: 'mention', group: '링크 · 사람', label: '사람 언급', hint: '팀원 이름 넣기', md: '@', keys: 'mention person 사람 언급 멘션', icon: '@',
      // @ 목록은 띄어쓰기 · 줄 처음 뒤에서만 열린다 - 글자 바로 뒤면 한 칸 띄운다
      run: (e, r) => {
        const before = r.from > 1 ? e.state.doc.textBetween(r.from - 1, r.from, '\n', '\n') : '';
        at(e, r).insertContent(before && !/\s/.test(before) ? ' @' : '@').run();
      },
    },
    { id: 'date', group: '링크 · 사람', label: '오늘 날짜', hint: `날짜를 글자로 · ${localToday()}`, keys: 'date today 날짜 오늘', icon: <Ico n="date" />, run: (e, r) => at(e, r).insertContent(`${localToday()} `).run() },
  ];
}

const CALLOUT_HINT: Record<CalloutKind, string> = {
  note: '알아 둘 정보 · 파란 상자', tip: '도움이 되는 요령 · 초록 상자', important: '꼭 확인할 내용 · 보라 상자',
  warning: '조심할 점 · 노란 상자', caution: '하면 안 되는 일 · 빨간 상자',
};

/* ── 아이콘(선 굵기 1.8 - ui.tsx 와 같은 결) ──────────── */

type IcoName = 'ul' | 'ol' | 'todo' | 'quote' | 'toggle' | 'code' | 'codeblock' | 'table' | 'hr' | 'image' | 'file' | 'date'
  | 'link' | 'undo' | 'redo' | 'grip' | 'plus' | 'highlight' | 'unlink' | 'open' | 'more' | 'clear' | `callout-${CalloutKind}`;

function Ico({ n, size = 18 }: { n: IcoName; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    ul: <><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="10" r="1" fill="currentColor" /><circle cx="4.5" cy="14" r="1" fill="currentColor" /><path d="M8 6h8M8 10h8M8 14h8" /></>,
    ol: <><path d="M8 6h8M8 10h8M8 14h8" /><path d="M3.5 4.8l1-.6v3.4M3.2 12.2c.3-.6 1.6-.7 1.8 0 .2.7-1.8 1.6-1.8 2.3h2" /></>,
    todo: <><rect x="3" y="4" width="5" height="5" rx="1.2" /><path d="M4.2 6.5l1 1 1.7-1.8M11 6.5h6M3 13.5h5M11 13.5h6" /></>,
    quote: <><path d="M4 4v12" strokeWidth="2.6" /><path d="M8 7h8M8 10h8M8 13h5" /></>,
    toggle: <><path d="M4 6l3 3-3 3" /><path d="M10 9h7M10 14h6" /></>,
    code: <path d="M7 6l-4 4 4 4M13 6l4 4-4 4" />,
    codeblock: <><rect x="2.5" y="3.5" width="15" height="13" rx="2" /><path d="M8 8l-2 2 2 2M12 8l2 2-2 2" /></>,
    table: <><rect x="3" y="4" width="14" height="12" rx="1.6" /><path d="M3 8h14M3 12h14M8 4v12M12.5 4v12" /></>,
    hr: <path d="M3 10h14" />,
    image: <><rect x="3" y="4" width="14" height="12" rx="1.6" /><circle cx="7.5" cy="8.5" r="1.4" /><path d="M3.5 15l4.2-4.2 3 3 2.3-2.3 3.5 3.5" /></>,
    file: <path d="M13.5 7.5l-5.6 5.6a2 2 0 01-2.9-2.9l6.3-6.3a3.2 3.2 0 014.6 4.6l-6.5 6.5" />,
    date: <><rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" /></>,
    link: <path d="M8.5 11.5a3 3 0 004.2 0l2.6-2.6a3 3 0 00-4.2-4.2l-1 1M11.5 8.5a3 3 0 00-4.2 0l-2.6 2.6a3 3 0 004.2 4.2l1-1" />,
    unlink: <><path d="M8.5 11.5a3 3 0 004.2 0l2.6-2.6a3 3 0 00-4.2-4.2l-1 1M11.5 8.5a3 3 0 00-4.2 0l-2.6 2.6a3 3 0 004.2 4.2l1-1" /><path d="M3 3l14 14" /></>,
    open: <><path d="M11 4h5v5M16 4l-7 7" /><path d="M14 11.5V16H4V6h4.5" /></>,
    undo: <path d="M7 5L3.5 8.5 7 12M4 8.5h7.5a4.5 4.5 0 010 9H9" />,
    redo: <path d="M13 5l3.5 3.5L13 12M16 8.5H8.5a4.5 4.5 0 000 9H11" />,
    grip: <><circle cx="7.5" cy="5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12.5" cy="5" r="1.2" fill="currentColor" stroke="none" /><circle cx="7.5" cy="10" r="1.2" fill="currentColor" stroke="none" /><circle cx="12.5" cy="10" r="1.2" fill="currentColor" stroke="none" /><circle cx="7.5" cy="15" r="1.2" fill="currentColor" stroke="none" /><circle cx="12.5" cy="15" r="1.2" fill="currentColor" stroke="none" /></>,
    plus: <path d="M10 4v12M4 10h12" />,
    more: <><circle cx="4.5" cy="10" r="1.3" fill="currentColor" stroke="none" /><circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" /><circle cx="15.5" cy="10" r="1.3" fill="currentColor" stroke="none" /></>,
    clear: <><path d="M5 4.5h10M10 4.5L7.5 16" /><path d="M12.5 12l4 4M16.5 12l-4 4" /></>,
    highlight: <><path d="M12.5 3.5l4 4-7 7H5.5v-4z" /><path d="M3 17h14" /></>,
    'callout-note': <><circle cx="10" cy="10" r="7" /><path d="M10 9v4.5M10 6.3v.2" /></>,
    'callout-tip': <><path d="M7.5 14h5M8.3 17h3.4M10 3a5 5 0 00-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 00-3-9z" /></>,
    'callout-important': <><path d="M4 3.5h12v10H9l-4 3v-3H4z" /><path d="M10 6.5v3.5M10 12v.2" /></>,
    'callout-warning': <><path d="M10 3l7.5 13h-15z" /><path d="M10 8v3.5M10 13.8v.2" /></>,
    'callout-caution': <><path d="M7 3h6l4 4v6l-4 4H7l-4-4V7z" /><path d="M10 6.5v4M10 13v.2" /></>,
  };
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="flex-none">
      {p[n]}
    </svg>
  );
}

/* ── 작업 번호(MATE-123) ──────────────────────────────── */

const TASK_KEY = new PluginKey<DecorationSet>('tmTaskRefs');
const TASK_RE = /(?<![\w-])MATE-\d+(?!\d)/g;

/** 본문의 MATE-### 를 작업 칩으로 보여 준다. 글자는 그대로 두고 꾸밈만 얹는다 */
function taskRefs(get: () => WikiRefs | null) {
  const build = (doc: PMNode) => {
    const tasks = new Map((get()?.tasks ?? []).map((t) => [t.key, t]));
    const decos: Decoration[] = [];
    doc.descendants((node, pos) => {
      if (!node.isText || node.marks.some((m) => m.type.name === 'code' || m.type.name === 'link')) return;
      for (const m of node.text?.matchAll(TASK_RE) ?? []) {
        const t = tasks.get(m[0]);
        decos.push(Decoration.inline(pos + m.index!, pos + m.index! + m[0].length, {
          class: 'tm-taskref',
          'data-task': m[0],
          'data-status': t?.status ?? 'none',
          title: t ? `${m[0]} · ${t.title} · ${statusLabel(t.status)}` : `${m[0]} · 없는 작업`,
        }));
      }
    });
    return DecorationSet.create(doc, decos);
  };
  return new Plugin<DecorationSet>({
    key: TASK_KEY,
    state: {
      init: (_, { doc }) => build(doc),
      apply: (tr, old) => (tr.docChanged || tr.getMeta(TASK_KEY) ? build(tr.doc) : old),
    },
    props: {
      decorations: (state) => TASK_KEY.getState(state),
      handleClick: (view, _pos, event) => {
        const el = (event.target as HTMLElement | null)?.closest<HTMLElement>('.tm-taskref');
        if (!el) return false;
        // 편집 중에는 Ctrl(⌘)과 함께 눌러야 연다
        if (view.editable && !(event.ctrlKey || event.metaKey)) return false;
        get()?.openTask(el.dataset.task ?? '');
        return true;
      },
    },
  });
}

/* ── 제목 링크(#) - 제목마다 주소 조각을 달고, 읽기 모드에서 '#' 단추로 링크를 복사한다 ──────────
   꾸밈(decoration)이라 마크다운에는 남지 않는다 */

/** 제목 → 주소 조각 - 한글은 그대로, 띄어쓰기는 -, 기호는 뺀다. 같은 제목이 또 있으면 -2, -3 */
export function headingSlugs(texts: string[]): string[] {
  const seen = new Map<string, number>();
  return texts.map((t) => {
    const base = t.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || '제목';
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/** 본문 안에서 그 제목으로 간다 - 문서 스크롤 칸만 움직인다(작업 관리 셸을 밀어 올리지 않게) */
export function scrollToAnchor(root: HTMLElement | null, slug: string): boolean {
  const el = root?.querySelector<HTMLElement>(`[data-anchor="${CSS.escape(slug)}"]`) ?? null;
  if (el) scrollWithin(el);
  return !!el;
}

const ANCHOR_KEY = new PluginKey<DecorationSet>('tmAnchors');

function anchorButton(slug: string, text: string, copy: (slug: string) => void) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tm-anchor';
  b.textContent = '#';
  b.title = '이 제목으로 바로 가는 링크 복사';
  b.setAttribute('aria-label', `'${text.trim()}' 제목 링크 복사`);
  b.addEventListener('mousedown', (e) => e.preventDefault());
  b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    copy(slug);
  });
  return b;
}

function headingAnchors(copy: (slug: string) => void) {
  const build = (doc: PMNode) => {
    const hs: { pos: number; node: PMNode }[] = [];
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') hs.push({ pos, node });
      return node.type.name !== 'heading';
    });
    const slugs = headingSlugs(hs.map((h) => h.node.textContent));
    const decos: Decoration[] = [];
    hs.forEach((h, i) => {
      decos.push(Decoration.node(h.pos, h.pos + h.node.nodeSize, { 'data-anchor': slugs[i] }));
      if (!h.node.textContent.trim()) return;
      decos.push(Decoration.widget(h.pos + h.node.nodeSize - 1, () => anchorButton(slugs[i], h.node.textContent, copy), {
        side: 1, key: `anchor-${slugs[i]}-${h.node.textContent}`, ignoreSelection: true, stopEvent: () => true,
      }));
    });
    return DecorationSet.create(doc, decos);
  };
  return new Plugin<DecorationSet>({
    key: ANCHOR_KEY,
    state: {
      init: (_, { doc }) => build(doc),
      apply: (tr, old) => (tr.docChanged ? build(tr.doc) : old),
    },
    props: { decorations: (state) => ANCHOR_KEY.getState(state) },
  });
}

/* ── 올리는 중인 파일 - 넣을 자리에 이름 · 진행 · 실패를 보여 준다 ──────────
   문서 내용이 아니라 꾸밈(widget)이라 마크다운으로 저장되지 않는다. 자리는 고칠 때마다 따라 옮긴다 */

interface UploadMark {
  id: string;
  /** 넣을 자리 - 앞에서 글을 넣거나 지우면 따라 옮긴다 */
  pos: number;
  name: string;
  /** 같은 자리에 여럿이면 놓은 순서 */
  order: number;
  /** 실패한 까닭(없으면 올리는 중) */
  failed: string | null;
}
type UploadMeta = { add?: UploadMark[]; set?: UploadMark; drop?: string };
export interface UploadActions { retry(id: string): void; cancel(id: string): void }

const UPLOAD_KEY = new PluginKey<UploadMark[]>('tmUploads');

function uploadDom(m: UploadMark, act: () => UploadActions) {
  const box = document.createElement('span');
  box.className = `tm-upload${m.failed ? ' is-failed' : ''}`;
  box.contentEditable = 'false';
  box.setAttribute('role', m.failed ? 'alert' : 'status');
  const lead = document.createElement('span');
  lead.className = m.failed ? 'tm-upload-mark' : 'tm-upload-spin';
  lead.setAttribute('aria-hidden', 'true');
  if (m.failed) lead.textContent = '!';
  const name = document.createElement('b');
  name.textContent = m.name;
  const text = document.createElement('span');
  text.textContent = m.failed ? m.failed : '올리는 중…';
  box.append(lead, name, text);
  if (m.failed) {
    const btn = (label: string, run: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.preventDefault(); run(); });
      return b;
    };
    box.append(btn('다시 시도', () => act().retry(m.id)), btn('취소', () => act().cancel(m.id)));
  }
  return box;
}

function uploadMarks(act: () => UploadActions) {
  return new Plugin<UploadMark[]>({
    key: UPLOAD_KEY,
    state: {
      init: () => [],
      apply: (tr, list) => {
        // 같은 자리에 넣은 글 · 블록 뒤로 따라간다(앞 파일이 들어가면 다음 파일은 그 뒤)
        let next = tr.docChanged ? list.map((m) => ({ ...m, pos: tr.mapping.map(m.pos, 1) })) : list;
        const meta = tr.getMeta(UPLOAD_KEY) as UploadMeta | undefined;
        if (meta?.add) next = [...next, ...meta.add];
        if (meta?.set) { const s = meta.set; next = next.map((m) => (m.id === s.id ? s : m)); }
        if (meta?.drop) next = next.filter((m) => m.id !== meta.drop);
        return next;
      },
    },
    props: {
      decorations: (state) => DecorationSet.create(state.doc, (UPLOAD_KEY.getState(state) ?? []).map((m) =>
        Decoration.widget(Math.min(m.pos, state.doc.content.size), () => uploadDom(m, act), {
          key: `${m.id}-${m.failed ?? 'up'}`, side: 1 + m.order, ignoreSelection: true, stopEvent: () => true,
        }))),
    },
  });
}

/* ── 기록 비교 - 블록마다 새로 생김 · 사라짐 ───────────── */

const DIFF_KEY = new PluginKey('tmDiff');
function diffMarks(marks: DiffMark[]) {
  return new Plugin({
    key: DIFF_KEY,
    props: {
      decorations: (state) => {
        const decos: Decoration[] = [];
        let pos = 0;
        state.doc.forEach((node, offset, i) => {
          pos = offset;
          const m = marks[i];
          if (m && m !== 'same') decos.push(Decoration.node(pos, pos + node.nodeSize, { class: m === 'add' ? 'tm-diff-add' : 'tm-diff-del' }));
        });
        return DecorationSet.create(state.doc, decos);
      },
    },
  });
}

/* ── 편집기 ──────────────────────────────────────────── */

export interface DocEditorProps {
  /** 마크다운 본문. 바뀌면 다른 곳(다른 팀원 · 되돌리기)에서 고친 것으로 보고 화면에 반영한다 */
  body: string;
  /** body 대신 바로 줄 내용 - 기록 비교 */
  content?: JSONContent;
  editable: boolean;
  /** 보기 모드에서도 체크박스를 누를 수 있다 */
  checkable?: boolean;
  onChange?(md: string): void;
  refs: WikiRefs;
  /** [[ 목록에서 자기 자신을 뺀다 */
  selfId?: string;
  /** 파일을 올리고 본문에 넣을 주소를 돌려준다. 없으면 그림 · 파일을 넣지 못한다 */
  upload?(file: File): Promise<string>;
  /** data:image 그림을 받는다(브라우저 저장 모드) */
  allowData?: boolean;
  /** [[ 목록의 '새 문서' - 만든 문서의 id · 제목 */
  onCreateDoc?(title: string): { id: string; title: string } | null;
  onNotice?(text: string, tone?: 'ok' | 'err'): void;
  /** 아직 내보내지 않은 고침이 있는가(치고 0.25초 안) - 저장 상태 표시에 쓴다 */
  onPending?(pending: boolean): void;
  onHeadings?(hs: WikiHeading[]): void;
  editorRef?: React.MutableRefObject<Editor | null>;
  diff?: DiffMark[];
  /** 처음 열 때 본문에 커서를 둔다 */
  autoFocus?: boolean;
  className?: string;
}

export default function DocEditor(props: DocEditorProps) {
  const {
    body, content, editable, checkable = false, onChange, refs, selfId, upload, allowData = false, onCreateDoc,
    onNotice, onPending, onHeadings, editorRef, diff, autoFocus, className = '',
  } = props;
  const members = useMembers();

  /* 편집기는 한 번 세우므로 바뀌는 값은 ref 로 읽는다 */
  const live = useRef({ refs, members, onChange, onCreateDoc, onNotice, onPending, onHeadings, upload, checkable, selfId, editable });
  live.current = { refs, members, onChange, onCreateDoc, onNotice, onPending, onHeadings, upload, checkable, selfId, editable };

  /** 마지막으로 내보내거나 받은 본문 - 같은 글이 다시 들어오면 화면을 건드리지 않는다 */
  const seen = useRef<string | null>(null);
  /** 마지막으로 내보낸 때 - 그 직후에 다른 사람의 저장이 들어와 화면이 바뀌면 알린다 */
  const emittedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pickKind = useRef<'image' | 'file'>('image');
  const [linkOpen, setLinkOpen] = useState(false);
  const linkOpenRef = useRef(setLinkOpen);
  linkOpenRef.current = setLinkOpen;
  const editorBox = useRef<Editor | null>(null);
  /* 목차는 글자를 칠 때마다 다시 세지 않는다 */
  const hTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 올리는 중이거나 실패해 다시 올릴 파일 */
  const uploads = useRef(new Map<string, File>());
  const uploadActions = useRef<UploadActions>({ retry: () => {}, cancel: () => {} });
  /** 제목 '#' 단추 - 이 문서 · 그 제목으로 바로 가는 주소를 복사한다 */
  const copyAnchor = useCallback((slug: string) => {
    const id = live.current.selfId;
    if (!id) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('doc', id);
    url.hash = slug;
    navigator.clipboard.writeText(url.toString()).then(
      () => live.current.onNotice?.('제목 링크를 복사했습니다', 'ok'),
      () => live.current.onNotice?.('링크를 복사하지 못했습니다. 주소창의 주소를 복사해 주세요', 'err'),
    );
  }, []);

  const pick = useCallback((kind: 'image' | 'file') => {
    pickKind.current = kind;
    if (!fileInput.current) return;
    fileInput.current.accept = kind === 'image' ? 'image/png,image/jpeg,image/gif,image/webp' : '';
    fileInput.current.click();
  }, []);

  const extensions = useMemo(() => {
    const getRefs = () => live.current.refs;

    const slash = Extension.create({
      name: 'tmSlash',
      addProseMirrorPlugins() {
        const cmds = blockCommands(pick);
        return [Suggestion<SuggestItem, SuggestItem>({
          editor: this.editor,
          pluginKey: new PluginKey('tmSlash'),
          char: '/',
          allow: writable,
          items: ({ query, editor }) => {
            const cell = inCell(editor.state, editor.state.selection.from);
            const canUpload = !!live.current.upload;
            return cmds.filter((c) => (!cell || CELL_OK.has(c.id)) && matches(query, c.label, c.keys)).map((c) => ({
              id: c.id, label: c.label, hint: c.hint, icon: c.icon, group: c.group, md: c.md, run: c.run,
              disabled: needsUpload(c.id) && !canUpload ? UPLOAD_OFF : undefined,
            }));
          },
          command: ({ editor, range, props: item }) => item.run(editor, range),
          render: suggestRender('블록 넣기'),
        })];
      },
    });

    const mention = Extension.create({
      name: 'tmMentionSuggest',
      addProseMirrorPlugins() {
        return [Suggestion<SuggestItem, SuggestItem>({
          editor: this.editor,
          pluginKey: new PluginKey('tmMention'),
          char: '@',
          allowedPrefixes: [' ', '(', ' '],
          allow: writable,
          items: ({ query }) => live.current.members
            .filter((m) => m.active !== false && matches(query, m.name, m.email, m.role))
            .slice(0, 8)
            .map((m) => ({
              id: m.id, label: m.name, hint: m.role || m.email, icon: <Avatar id={m.id} size={22} />,
              run: (e: Editor, r: Range) => e.chain().focus().insertContentAt(r, [
                { type: 'mention', attrs: { id: m.id, label: m.name } }, { type: 'text', text: ' ' },
              ]).run(),
            })),
          command: ({ editor, range, props: item }) => item.run(editor, range),
          render: suggestRender('사람 언급'),
        })];
      },
    });

    const docLinks = Extension.create({
      name: 'tmDocSuggest',
      addProseMirrorPlugins() {
        return [Suggestion<SuggestItem, SuggestItem>({
          editor: this.editor,
          pluginKey: new PluginKey('tmDocLink'),
          char: '[[',
          allowSpaces: true,
          allowedPrefixes: null,
          // ]] 로 닫았거나 너무 길면 문서 이름이 아니다(코드의 [[1,2]] · [[ -f x ]]) - 목록을 닫는다
          allow: (p) => {
            if (!writable(p)) return false;
            const q = p.state.doc.textBetween(p.range.from, p.range.to, ' ');
            return !q.includes(']]') && q.length <= 60;
          },
          items: ({ query }) => {
            const { refs: r, selfId: self, onCreateDoc: make } = live.current;
            const q = query.replace(/\]+$/, '');
            const docs: SuggestItem[] = r.docs
              .filter((d) => !d.gone && d.id !== self && matches(q, d.title))
              .slice(0, 8)
              .map((d) => ({
                id: `doc-${d.id}`, label: d.title || '제목 없는 문서', hint: '문서', group: '문서', icon: d.icon || <DocGlyph />,
                run: (e: Editor, rg: Range) => e.chain().focus().insertContentAt(rg, [
                  { type: 'docLink', attrs: { id: d.id, title: d.title } }, { type: 'text', text: ' ' },
                ]).run(),
              }));
            const tasks: SuggestItem[] = r.tasks
              .filter((t) => matches(q, t.key, t.title))
              .slice(0, 5)
              .map((t) => ({
                id: `task-${t.key}`, label: `${t.key} ${t.title}`, hint: `작업 · ${statusLabel(t.status)}`, group: '작업', icon: <Ico n="todo" />,
                run: (e: Editor, rg: Range) => e.chain().focus().insertContentAt(rg, `${t.key} `).run(),
              }));
            const create: SuggestItem[] = make && q.trim() ? [{
              id: 'new', label: `새 문서 '${q.trim()}'`, hint: '이 문서 아래에 만들고 링크를 겁니다', group: '만들기', icon: <Ico n="plus" />,
              run: (e: Editor, rg: Range) => {
                const made = make(q.trim());
                if (made) {
                  e.chain().focus().insertContentAt(rg, [
                    { type: 'docLink', attrs: { id: made.id, title: made.title } }, { type: 'text', text: ' ' },
                  ]).run();
                }
              },
            }] : [];
            return [...docs, ...tasks, ...create];
          },
          command: ({ editor, range, props: item }) => item.run(editor, range),
          render: suggestRender('문서 · 작업 링크'),
        })];
      },
    });

    const extras = Extension.create({
      name: 'tmWikiExtras',
      addProseMirrorPlugins() {
        const plugins = [taskRefs(getRefs), uploadMarks(() => uploadActions.current)];
        // 문서 화면의 편집기만 - 기록 미리 보기에는 제목 링크를 달지 않는다
        if (selfId) plugins.push(headingAnchors(copyAnchor));
        if (diff) plugins.push(diffMarks(diff));
        return plugins;
      },
      addKeyboardShortcuts() {
        return {
          // 편집 중 ⌘K 는 고른 글이 있든 없든 링크 쓰기(없으면 커서 자리에 넣는다). 보기 모드는 문서 찾기 창이 받는다
          'Mod-k': ({ editor }) => {
            if (!editor.isEditable) return false;
            linkOpenRef.current(true);
            return true;
          },
          'Mod-s': () => true,
        };
      },
    });

    return [
      ...wikiSchema({
        allowData,
        onReadOnlyChecked: () => live.current.checkable,
        views: {
          image: ReactNodeViewRenderer(ImageView),
          mention: ReactNodeViewRenderer(MentionView, { as: 'span' }),
          docLink: ReactNodeViewRenderer(DocLinkView, { as: 'span' }),
        },
      }),
      Placeholder.configure({
        showOnlyCurrent: true,
        includeChildren: true,
        placeholder: ({ node, editor }) => {
          if (node.type.name === 'heading') return '제목';
          if (node.type.name === 'detailsSummary') return '접기 제목';
          if (editor.isEmpty) return "글을 쓰거나 '/' 를 눌러 표 · 목록 · 알림 상자를 넣으세요";
          return "'/' 를 눌러 블록 넣기";
        },
      }),
      slash,
      mention,
      docLinks,
      extras,
    ];
    // 편집기는 처음 한 번만 세운다 - 바뀌는 값은 live 로 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 지금 내용을 마크다운으로 내보낸다(바뀌었을 때만) */
  const emit = useCallback((ed: Editor) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    live.current.onPending?.(false);
    if (ed.isDestroyed) return;
    let md: string;
    try {
      md = docToMd(ed.getJSON());
    } catch {
      return;
    }
    if (md === seen.current) return;
    seen.current = md;
    emittedAt.current = Date.now();
    live.current.onChange?.(md);
  }, []);

  const headingsOf = useCallback((ed: Editor) => {
    const hs: WikiHeading[] = [];
    ed.state.doc.descendants((n, pos) => {
      if (n.type.name === 'heading' && n.textContent.trim()) hs.push({ level: Number(n.attrs.level) || 1, text: n.textContent.trim(), pos });
    });
    live.current.onHeadings?.(hs);
  }, []);

  /** 파일 하나를 올려 그 파일의 자리 표시가 있는 곳에 넣는다. 실패하면 자리 표시에 까닭 · 다시 시도 · 취소를 둔다 */
  const sendUpload = useCallback(async (ed: Editor, id: string) => {
    const up = live.current.upload;
    const f = uploads.current.get(id);
    if (!up || !f) return;
    const markOf = () => (ed.isDestroyed ? undefined : UPLOAD_KEY.getState(ed.state)?.find((m) => m.id === id));
    try {
      const src = await up(f);
      // 올리는 사이 문서를 떠났다 - 다른 문서에 넣지 않는다(편집기는 문서마다 따로 선다)
      if (ed.isDestroyed) {
        uploads.current.delete(id);
        live.current.onNotice?.(`문서를 떠나 '${f.name}' 을(를) 넣지 못했습니다. 다시 넣어 주세요`, 'err');
        return;
      }
      const mark = markOf();
      uploads.current.delete(id);
      if (!mark) return; // 취소했다
      const image = /^image\/(png|jpe?g|gif|webp)$/.test(f.type);
      const node: JSONContent = image
        ? { type: 'image', attrs: { src, alt: f.name.replace(/\.[^.]+$/, '') || null } }
        : { type: 'paragraph', content: [{ type: 'text', text: `📎 ${f.name}`, marks: [{ type: 'link', attrs: { href: src } }] }] };
      // 올리는 사이 편집을 끝냈어도 저장되게 표시를 단다(보기 모드의 고침은 이 표시가 있을 때만 내보낸다)
      ed.chain().setMeta('tmSave', true).setMeta(UPLOAD_KEY, { drop: id } satisfies UploadMeta)
        .insertContentAt(Math.min(mark.pos, ed.state.doc.content.size), node).run();
    } catch (e) {
      const mark = markOf();
      if (!mark) return;
      const why = e instanceof Error && e.message ? e.message : '올리지 못했습니다';
      ed.view.dispatch(ed.state.tr.setMeta(UPLOAD_KEY, { set: { ...mark, failed: why } } satisfies UploadMeta));
    }
  }, []);

  /** 파일을 올려 넣는다 - 그림은 그림 블록, 나머지는 링크. 넣을 자리에 이름 · '올리는 중'을 먼저 보인다 */
  const insertFiles = useCallback(async (ed: Editor, files: File[], at?: number) => {
    if (!files.length) return;
    if (!live.current.upload) {
      live.current.onNotice?.(UPLOAD_OFF, 'err');
      return;
    }
    const pos = Math.min(at ?? ed.state.selection.to, ed.state.doc.content.size);
    const marks: UploadMark[] = files.map((f, order) => {
      const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
      uploads.current.set(id, f);
      return { id, pos, name: f.name, order, failed: null };
    });
    ed.view.dispatch(ed.state.tr.setMeta(UPLOAD_KEY, { add: marks } satisfies UploadMeta));
    // 놓은 순서대로 하나씩 - 앞 파일이 들어가면 뒤 파일 자리는 그 뒤로 옮겨진다
    for (const m of marks) await sendUpload(ed, m.id);
  }, [sendUpload]);

  /* 자리 표시의 단추 - 다시 시도 · 취소 */
  uploadActions.current = {
    retry: (id) => {
      const ed = editorBox.current;
      const mark = ed && !ed.isDestroyed ? UPLOAD_KEY.getState(ed.state)?.find((m) => m.id === id) : undefined;
      if (!ed || !mark) return;
      ed.view.dispatch(ed.state.tr.setMeta(UPLOAD_KEY, { set: { ...mark, failed: null } } satisfies UploadMeta));
      void sendUpload(ed, id);
    },
    cancel: (id) => {
      uploads.current.delete(id);
      const ed = editorBox.current;
      if (ed && !ed.isDestroyed) ed.view.dispatch(ed.state.tr.setMeta(UPLOAD_KEY, { drop: id } satisfies UploadMeta));
    },
  };

  /* 처음 내용 · 편집기 설정은 한 번만 만든다. 그릴 때마다 새 객체를 주면 TipTap 이 다른 설정으로 보고
     setOptions 로 화면을 다시 그리고, 본문도 그때마다 다시 읽게 된다 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialContent = useMemo(() => content ?? mdToDoc(body), []);
  const editorProps = useMemo<NonNullable<EditorOptions['editorProps']>>(() => ({
    attributes: {
      class: `tm-prose ${className}`.trim(),
      'aria-label': '문서 본문',
      spellcheck: 'false',
    },
    // 복사할 때의 글 - 한 블록 안에서 고른 글은 글자 그대로(코드는 코드 그대로), 여러 블록이면 마크다운으로
    clipboardTextSerializer: (slice) => {
      const c = slice.content;
      if (c.childCount === 1 && c.firstChild?.isTextblock && slice.openStart > 0) return c.textBetween(0, c.size, '\n', '\n');
      try {
        return docToMd({ type: 'doc', content: c.toJSON() as JSONContent[] });
      } catch {
        return c.textBetween(0, c.size, '\n\n');
      }
    },
    handlePaste: (view, event) => {
      const ed = live.current.editable ? editorBox.current : null;
      if (!ed) return false;
      const cb = event.clipboardData;
      const html = cb?.getData('text/html') ?? '';
      const text = cb?.getData('text/plain') ?? '';
      const files = [...(cb?.files ?? [])];
      // 엑셀 · 한글 · 워드는 표 글과 함께 고른 곳의 그림도 싣는다 - 글이 있으면 글(표)을 넣는다
      if (files.length && !html.trim() && !text.trim()) {
        // 올릴 수 없는 곳이면 insertFiles 가 끌어 놓기 · 파일 고르기와 같은 말로 알린다
        void insertFiles(ed, files);
        return true;
      }
      if (view.state.selection.$from.parent.type.spec.code) return false;
      // 코드 편집기(VS Code 등)에서 복사한 글은 HTML 이 글자색만 입힌 코드다 - 마크다운 글로 읽는다
      const fromCodeEditor = /font-family:[^;"]*(consolas|monospace|menlo|courier)|white-space:\s*pre/i.test(html);
      if (html.trim() && !fromCodeEditor) return false;
      // 마크다운으로 적은 글이면 꼴을 살려 넣는다
      if (/^(#{1,4}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.+\|)|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/m.test(text)) {
        const doc = mdToDoc(text);
        ed.chain().focus().insertContent(doc.content ?? []).run();
        return true;
      }
      return false;
    },
    handleDrop: (view, event, _slice, moved) => {
      const ed = editorBox.current;
      if (moved || !ed || !live.current.editable) return false;
      const files = [...(event.dataTransfer?.files ?? [])];
      if (!files.length) return false;
      // 올릴 수 없는 곳이면 insertFiles 가 붙여 넣기 · 파일 고르기와 같은 말로 알린다
      const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
      void insertFiles(ed, files, at?.pos);
      return true;
    },
    handleDOMEvents: {
      // 보기 모드에 파일을 놓으면 브라우저가 그 파일을 열어 화면을 떠난다 - 막고 편집 모드에서 넣으라고 알린다
      dragover: (view, event) => {
        if (view.editable || !event.dataTransfer?.types.includes('Files')) return false;
        event.preventDefault();
        return true;
      },
      drop: (view, event) => {
        if (view.editable || !event.dataTransfer?.types.includes('Files')) return false;
        event.preventDefault();
        live.current.onNotice?.('편집을 누른 뒤 파일을 넣을 수 있습니다', 'err');
        return true;
      },
      // 보기 모드 - 링크는 새 탭(밖으로 나가는 주소) · 팀 저장소 파일은 받을 수 있는 주소로 바꿔 연다 · #제목은 본문 안에서 간다
      click: (view, event) => {
        const a = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href]');
        if (!a || (view.editable && !(event.ctrlKey || event.metaKey))) return false;
        event.preventDefault();
        openHref(a.getAttribute('href') ?? '', live.current.refs, view.dom);
        return true;
      },
      // 두 번 누르기는 글자 고르기 그대로 둔다 - 편집은 '편집' 단추 · E 로만 들어간다
    },
  }), [className, insertFiles]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable,
    extensions,
    content: initialContent,
    autofocus: autoFocus ? 'start' : false,
    editorProps,
    onCreate: ({ editor: ed }) => {
      // 열 때의 내용이 기준 - 정리만 된 글(빈 줄 · 기호)을 고친 것으로 보지 않는다
      seen.current = docToMd(ed.getJSON());
      headingsOf(ed);
    },
    onUpdate: ({ editor: ed, transaction }) => {
      // 보기 모드에서는 체크박스 · 늦게 끝난 업로드(tmSave 표시)만 내보낸다
      const save = !!transaction.getMeta('tmSave');
      if (!live.current.editable && !save) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => emit(ed), 250);
      live.current.onPending?.(true);
      if (save && !live.current.editable) emit(ed);
    },
    onTransaction: ({ editor: ed, transaction }) => {
      if (!transaction.docChanged) return;
      if (hTimer.current) clearTimeout(hTimer.current);
      hTimer.current = setTimeout(() => { if (!ed.isDestroyed) headingsOf(ed); }, 300);
    },
    onBlur: ({ editor: ed }) => {
      if (timer.current) emit(ed);
    },
  });
  editorBox.current = editor;

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
    return () => { if (editorRef) editorRef.current = null; };
  }, [editor, editorRef]);

  /* 보기 ↔ 편집 */
  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.isEditable === editable) return;
    if (!editable && timer.current) emit(editor);
    editor.setEditable(editable, false);
  }, [editor, editable, emit]);

  /* 보기 모드의 체크박스 - TipTap 은 눌린 모양만 바꾸므로 문서에도 적어 저장한다 */
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onChangeBox = (e: Event) => {
      const box = e.target as HTMLInputElement;
      if (editor.isEditable || box.type !== 'checkbox' || !live.current.checkable) return;
      const li = box.closest('li[data-type="taskItem"]');
      const inner = li?.querySelector(':scope > div');
      if (!inner) return;
      const $pos = editor.state.doc.resolve(editor.view.posAtDOM(inner, 0));
      for (let d = $pos.depth; d > 0; d -= 1) {
        const node = $pos.node(d);
        if (node.type.name === 'taskItem') {
          editor.view.dispatch(editor.state.tr.setNodeMarkup($pos.before(d), undefined, { ...node.attrs, checked: box.checked }).setMeta('tmSave', true));
          return;
        }
      }
    };
    dom.addEventListener('change', onChangeBox);
    return () => dom.removeEventListener('change', onChangeBox);
  }, [editor]);

  /* 바깥에서 본문이 바뀌었다(다른 팀원 · 되돌리기). 내가 아직 내보내지 않은 고침이 있거나
     한글을 조합하는 중이면 덮지 않는다(조합 중에 내용을 바꾸면 치던 글자가 깨진다) */
  useEffect(() => {
    if (!editor || editor.isDestroyed || content || body === seen.current || editor.view.composing) return;
    if (timer.current) return;
    const next = mdToDoc(body);
    const { from, to } = editor.state.selection;
    editor.chain().setMeta('addToHistory', false).setContent(next, { emitUpdate: false }).run();
    const size = editor.state.doc.content.size;
    if (editor.isFocused) {
      try {
        editor.commands.setTextSelection({ from: Math.min(from, size), to: Math.min(to, size) });
      } catch { /* 자리가 사라졌으면 그대로 */ }
    }
    seen.current = docToMd(editor.getJSON());
    headingsOf(editor);
    // 편집 중 방금 쓴 글이 다른 사람의 나중 저장으로 바뀌었을 수 있다 - 말없이 사라진 것처럼 보이지 않게 알린다
    if (live.current.editable && Date.now() - emittedAt.current < 8000) {
      live.current.onNotice?.('다른 팀원이 같은 문서를 동시에 고쳐 그 내용으로 맞췄습니다. 방금 쓴 글이 사라졌다면 기록(⋯ 메뉴)을 확인해 보세요. 기록에 남지 않았을 수도 있습니다', 'err');
    }
  }, [body, content, editor, headingsOf]);

  /* 작업 목록이 바뀌면 작업 칩의 제목 · 상태를 다시 그린다 */
  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta(TASK_KEY, true));
  }, [editor, refs.tasks]);

  /* 문서를 떠날 때 아직 내보내지 않은 글을 내보낸다 */
  useEffect(() => () => {
    const ed = editorBox.current;
    if (ed && timer.current) emit(ed);
  }, [emit]);

  /* 탭을 닫거나 새로 고칠 때도 - 저장소의 나가기 경고 · 마저 보내기보다 먼저 돌도록 잡는 단계(capture)에 둔다 */
  useEffect(() => {
    const onLeave = () => {
      const ed = editorBox.current;
      if (ed && timer.current) emit(ed);
    };
    window.addEventListener('beforeunload', onLeave, true);
    return () => window.removeEventListener('beforeunload', onLeave, true);
  }, [emit]);

  if (!editor) return <div className="tm-prose min-h-[120px]" aria-busy />;

  /* 링크 막대 열기 - 고른 글이 있으면 그 글에, 없으면 커서 자리에 '표시할 글 · 주소'로 넣는다(막대를 띄우는 것은 Bubble 이) */
  const openLink = () => setLinkOpen(true);

  return (
    <WikiContext.Provider value={refs}>
      {editable && <Toolbar editor={editor} pick={pick} canUpload={!!upload} onLink={openLink} />}
      <div className="tm-editor-frame relative">
        {editable && <BlockHandle editor={editor} />}
        <EditorContent editor={editor} />
        {editable && <Bubble editor={editor} linkOpen={linkOpen} setLinkOpen={setLinkOpen} />}
      </div>
      <input ref={fileInput} type="file" multiple hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          if (pickKind.current === 'image' && files.some((f) => !f.type.startsWith('image/'))) {
            onNotice?.('그림 파일(png · jpg · gif · webp)만 넣을 수 있습니다', 'err');
            return;
          }
          void insertFiles(editor, files);
        }} />
    </WikiContext.Provider>
  );
}

/**
 * 링크 열기 - 밖으로 나가는 주소는 새 탭, 사이트 안 경로는 이 탭, 팀 저장소 파일은 받을 주소로 바꿔서,
 * #제목은 본문(root) 안에서 그 제목으로 가고 주소 조각만 바꾼다
 */
function openHref(href: string, refs: WikiRefs, root?: HTMLElement | null) {
  if (href.startsWith('tmfile:')) {
    // 팝업 차단을 피하려고 창을 먼저 열고 주소를 넣는다. 올린 파일이 이 탭을 건드리지 못하게 opener 를 끊는다
    const w = window.open('', '_blank');
    if (w) w.opener = null;
    refs.fileUrl(href).then((u) => {
      if (w) w.location.href = u;
      else window.open(u, '_blank', 'noopener,noreferrer');
    }).catch(() => {
      w?.close();
      refs.notice?.('파일을 열지 못했습니다. 지워졌거나 받을 수 없는 파일일 수 있습니다');
    });
    return;
  }
  const to = linkTo(href);
  if (!to) {
    refs.notice?.('열 수 없는 주소입니다. 링크를 고쳐 주세요');
    return;
  }
  if (to.external) window.open(to.href, '_blank', 'noopener,noreferrer');
  else if (to.href.startsWith('#')) {
    let slug = to.href.slice(1);
    try { slug = decodeURIComponent(slug); } catch { /* 이미 풀린 글자 */ }
    if (scrollToAnchor(root ?? null, slug)) {
      const url = new URL(window.location.href);
      url.hash = slug;
      window.history.replaceState(window.history.state, '', url);
    } else refs.notice?.(`'${slug}' 제목을 이 문서에서 찾을 수 없습니다. 제목이 바뀌었거나 지워졌을 수 있습니다`);
  } else window.location.assign(to.href);
}

/* ── 위쪽 서식 도구 ─────────────────────────────────── */

function Toolbar({ editor, pick, canUpload, onLink }: {
  editor: Editor; pick(kind: 'image' | 'file'): void; canUpload: boolean; onLink(): void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      level: ([1, 2, 3, 4] as const).find((l) => e.isActive('heading', { level: l })) ?? 0,
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      highlight: e.isActive('highlight'),
      link: e.isActive('link'),
      ul: e.isActive('bulletList'),
      ol: e.isActive('orderedList'),
      todo: e.isActive('taskList'),
      callout: e.isActive('callout'),
      table: e.isActive('table'),
      undo: e.can().undo(),
      redo: e.can().redo(),
    }),
  });
  const [open, setOpen] = useState<null | 'insert' | 'table' | 'block' | 'more'>(null);
  /** '블록' 메뉴를 열 때의 블록 - 메뉴가 열려 있는 동안 고정한다 */
  const [blockAt, setBlockAt] = useState<BlockAt | null>(null);
  const insertBtn = useRef<HTMLButtonElement>(null);
  const tableBtn = useRef<HTMLButtonElement>(null);
  const blockBtn = useRef<HTMLButtonElement>(null);
  const moreBtn = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  /** 막대 안에서 Tab 이 멈추는 단추(나머지는 ← → 로) */
  const roving = useRef(0);
  const cmds = useMemo(() => blockCommands(pick), [pick]);
  const run = (f: (c: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => f(editor.chain().focus()).run();
  const close = () => setOpen(null);
  const toggle = (k: 'insert' | 'table' | 'block' | 'more') => setOpen((v) => (v === k ? null : k));

  /* 표 밖으로 나가면 표 메뉴를 닫는다. 블록 메뉴는 내용이 바뀌면 닫는다(다른 팀원의 고침으로 블록 자리가 바뀔 수 있다) */
  useEffect(() => {
    if (open === 'table' && !s.table) setOpen(null);
  }, [open, s.table]);
  useEffect(() => {
    if (open !== 'block') return;
    const hide = ({ transaction }: { transaction: { docChanged: boolean } }) => { if (transaction.docChanged) setOpen(null); };
    editor.on('transaction', hide);
    return () => { editor.off('transaction', hide); };
  }, [open, editor]);

  /* 막대 안 초점 - Tab 은 막대에 한 번만 멈추고 ← → Home End 로 단추를 오간다 */
  const tools = () => [...(bar.current?.querySelectorAll<HTMLElement>('[data-tool]:not(:disabled)') ?? [])];
  const markTab = (els: HTMLElement[], k: number) => els.forEach((el, i) => { el.tabIndex = i === k ? 0 : -1; });
  useLayoutEffect(() => {
    const els = tools();
    roving.current = Math.max(0, Math.min(roving.current, els.length - 1));
    markTab(els, roving.current);
  });
  const onBarKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const els = tools();
    const i = els.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const k = e.key === 'Home' ? 0 : e.key === 'End' ? els.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + els.length) % els.length;
    roving.current = k;
    markTab(els, k);
    els[k].focus();
  };
  const onBarFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const els = tools();
    const i = els.indexOf(e.target as HTMLElement);
    if (i < 0 || i === roving.current) return;
    roving.current = i;
    markTab(els, i);
  };

  return (
    <div ref={bar} className="tm-toolbar" role="toolbar" aria-label="서식" onKeyDown={onBarKey} onFocus={onBarFocus}>
      {/* 글 모양 */}
      <label className="sr-only" htmlFor="tm-block-style">글 모양</label>
      <select id="tm-block-style" data-tool className="tm-tool-select" value={s.level} title="글 모양"
        onChange={(e) => {
          const level = Number(e.target.value) as 0 | 1 | 2 | 3 | 4;
          run((c) => (level ? c.setHeading({ level }) : c.setParagraph()));
        }}>
        <option value={0}>본문</option>
        <option value={1}>제목 1</option>
        <option value={2}>제목 2</option>
        <option value={3}>제목 3</option>
        <option value={4}>제목 4</option>
      </select>
      <span className="tm-tool-sep" aria-hidden />
      {/* 기본 서식 */}
      <ToolBtn label="굵게 (Ctrl+B)" on={s.bold} onClick={() => run((c) => c.toggleBold())}><b className="text-[15px]">B</b></ToolBtn>
      <ToolBtn label="기울임 (Ctrl+I)" on={s.italic} onClick={() => run((c) => c.toggleItalic())}><i className="font-serif text-[16px]">I</i></ToolBtn>
      <ToolBtn label="형광펜 (Ctrl+Shift+H)" on={s.highlight} onClick={() => run((c) => c.toggleHighlight())}><Ico n="highlight" /></ToolBtn>
      <ToolBtn label="링크 (Ctrl+K)" on={s.link} onClick={onLink}><Ico n="link" /></ToolBtn>
      <span className="tm-tool-sep" aria-hidden />
      {/* 목록 */}
      <ToolBtn label="글머리 목록 (Ctrl+Shift+8)" on={s.ul} onClick={() => run((c) => c.toggleBulletList())}><Ico n="ul" /></ToolBtn>
      <ToolBtn label="번호 목록 (Ctrl+Shift+7)" on={s.ol} onClick={() => run((c) => c.toggleOrderedList())}><Ico n="ol" /></ToolBtn>
      <ToolBtn label="할 일 목록 (Ctrl+Shift+9)" on={s.todo} onClick={() => run((c) => c.toggleTaskList())}><Ico n="todo" /></ToolBtn>
      <span className="tm-tool-sep" aria-hidden />
      {/* 넣기 · 표 · 블록 · 더보기 */}
      <ToolBtn label="넣기 (표 · 알림 상자 · 그림 · 링크)" text="넣기" expanded={open === 'insert'} btnRef={insertBtn} onClick={() => toggle('insert')}>
        <Ico n="plus" />
      </ToolBtn>
      {s.table && (
        <ToolBtn label="표 고치기" text="표" expanded={open === 'table'} btnRef={tableBtn} onClick={() => toggle('table')}>
          <Ico n="table" />
        </ToolBtn>
      )}
      <ToolBtn label="블록 메뉴 (지금 블록 옮기기 · 복제 · 지우기)" expanded={open === 'block'} btnRef={blockBtn}
        onClick={() => {
          setBlockAt(currentBlock(editor));
          toggle('block');
        }}>
        <Ico n="grip" />
      </ToolBtn>
      <ToolBtn label="서식 더보기 (취소선 · 코드 · 서식 지우기)" expanded={open === 'more'} btnRef={moreBtn} onClick={() => toggle('more')}>
        <Ico n="more" />
      </ToolBtn>
      <span className="tm-tool-sep" aria-hidden />
      <ToolBtn label="되돌리기 (Ctrl+Z)" disabled={!s.undo} onClick={() => run((c) => c.undo())}><Ico n="undo" /></ToolBtn>
      <ToolBtn label="다시 하기 (Ctrl+Shift+Z)" disabled={!s.redo} onClick={() => run((c) => c.redo())}><Ico n="redo" /></ToolBtn>

      {open === 'insert' && (
        <FloatMenu anchor={insertBtn.current} label="넣기" width={320} onClose={close}>
          {BLOCK_GROUPS.map((g) => (
            <div key={g} role="group" aria-label={g}>
              <p className="tm-menu-label" aria-hidden>{g}</p>
              {cmds.filter((c) => c.group === g).map((c) => {
                const off = needsUpload(c.id) && !canUpload ? UPLOAD_OFF : null;
                return (
                  <button key={c.id} type="button" role="menuitem" tabIndex={-1} aria-disabled={off ? true : undefined}
                    className="tm-menu-item is-rich"
                    onClick={() => {
                      if (off) return;
                      close();
                      const p = editor.state.selection.from;
                      c.run(editor, { from: p, to: p });
                    }}>
                    <span className="tm-menu-icon" aria-hidden>{c.icon}</span>
                    <span className="min-w-0 flex-1">
                      <b>{c.label}</b>
                      <small>{off ?? c.hint}</small>
                    </span>
                    {c.md && <kbd className="tm-menu-md">{c.md}</kbd>}
                  </button>
                );
              })}
            </div>
          ))}
        </FloatMenu>
      )}
      {open === 'table' && (
        <FloatMenu anchor={tableBtn.current} label="표 고치기" onClose={close}>
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => { close(); run((c) => c.addRowAfter()); }}>아래에 줄 넣기</button>
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => { close(); run((c) => c.addColumnAfter()); }}>오른쪽에 칸 넣기</button>
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => { close(); run((c) => c.deleteRow()); }}>줄 지우기</button>
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => { close(); run((c) => c.deleteColumn()); }}>칸 지우기</button>
          <div className="tm-menu-sep" role="separator" />
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item is-danger" onClick={() => { close(); run((c) => c.deleteTable()); }}>표 지우기</button>
        </FloatMenu>
      )}
      {open === 'block' && blockAt && (
        <FloatMenu anchor={blockBtn.current} label="블록 메뉴" onClose={close}>
          <BlockMenuItems editor={editor} at={blockAt} onDone={close} />
        </FloatMenu>
      )}
      {open === 'more' && (
        <FloatMenu anchor={moreBtn.current} label="서식 더보기" onClose={close}>
          <button type="button" role="menuitemcheckbox" aria-checked={s.strike} tabIndex={-1} className="tm-menu-item"
            onClick={() => { close(); run((c) => c.toggleStrike()); }}>
            <span className="flex-1">취소선</span><kbd className="tm-menu-md">Ctrl+Shift+S</kbd>
          </button>
          <button type="button" role="menuitemcheckbox" aria-checked={s.code} tabIndex={-1} className="tm-menu-item"
            onClick={() => { close(); run((c) => c.toggleCode()); }}>
            <span className="flex-1">코드 글자</span><kbd className="tm-menu-md">Ctrl+E</kbd>
          </button>
          <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item"
            onClick={() => { close(); run((c) => c.unsetAllMarks()); }}>
            <span className="flex-1">서식 지우기</span><Ico n="clear" size={16} />
          </button>
          {s.callout && (
            <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item"
              onClick={() => { close(); run((c) => c.unsetCallout()); }}>
              알림 상자 풀기
            </button>
          )}
        </FloatMenu>
      )}
    </div>
  );
}

function ToolBtn({ label, on, disabled, expanded, onClick, children, btnRef, text }: {
  label: string; on?: boolean; disabled?: boolean; expanded?: boolean; onClick(): void; children: React.ReactNode;
  btnRef?: React.Ref<HTMLButtonElement>;
  /** 그림 옆에 보이는 글자 */
  text?: string;
}) {
  return (
    <button ref={btnRef} type="button" data-tool title={label} aria-label={label} aria-pressed={on} aria-expanded={expanded} disabled={disabled}
      aria-haspopup={expanded === undefined ? undefined : 'menu'}
      onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={`tm-tool-btn${text ? ' has-text' : ''}`}>
      {children}
      {text && <span className="tm-tool-text" aria-hidden>{text}</span>}
    </button>
  );
}

/* ── 떠 있는 메뉴 ─────────────────────────────────────── */

const MENU_ITEMS = '[role="menuitem"]:not(:disabled):not([aria-disabled="true"]),[role="menuitemcheckbox"]:not(:disabled),[role="menuitemradio"]:not(:disabled)';
/** 화면 가장자리와 띄우는 거리 · 단추와 메뉴 사이 */
const EDGE = 8;
const GAP = 6;

export type MenuCloseReason = 'escape' | 'tab' | 'outside';

/**
 * 떠 있는 메뉴 - 화면 맨 위 층(body)에 그려 스크롤 칸에 잘리지 않는다. 단추 아래에 두되 아래 자리가 모자라면 위로 올리고,
 * 화면 가장자리에서 8px 안쪽에 둔다. 그래도 높이가 모자라면 메뉴 안에서 스크롤한다.
 * ↑ ↓ Home End 로 항목을 오간다. Esc 는 닫고 단추로 돌아가고, Tab 은 닫고 단추 다음 칸으로 넘어간다(같은 자리에 갇히지 않게).
 * 항목을 누른 뒤의 닫기와 초점은 부르는 쪽이 정한다
 */
export function FloatMenu({ anchor, label, onClose, children, align = 'start', width }: {
  anchor: HTMLElement | null;
  label: string;
  onClose(why: MenuCloseReason): void;
  children: React.ReactNode;
  align?: 'start' | 'end';
  width?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  /* 자리 - 그리기 전에 재고, 스크롤 · 크기 바뀜 · 휴대폰 자판(visualViewport)에 따라 다시 잰다.
     React 상태로 두면 자리를 잡기 전(숨긴 채)에 초점 효과가 먼저 돌아 초점이 들어가지 않는다 - 요소에 바로 적는다 */
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !anchor) return;
    const place = () => {
      if (!anchor.isConnected) { close.current('outside'); return; }
      const a = anchor.getBoundingClientRect();
      const vv = window.visualViewport;
      const top0 = (vv?.offsetTop ?? 0) + EDGE;
      const bottom0 = (vv ? vv.offsetTop + vv.height : window.innerHeight) - EDGE;
      const left0 = (vv?.offsetLeft ?? 0) + EDGE;
      const right0 = (vv ? vv.offsetLeft + vv.width : window.innerWidth) - EDGE;
      const h = el.scrollHeight;
      const w = el.offsetWidth;
      const below = bottom0 - (a.bottom + GAP);
      const above = a.top - GAP - top0;
      const down = h <= below || below >= above;
      const maxHeight = Math.max(0, Math.min(h, down ? below : above));
      const top = down ? a.bottom + GAP : a.top - GAP - maxHeight;
      const want = align === 'end' ? a.right - w : a.left;
      const left = Math.max(left0, Math.min(want, right0 - w));
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      el.style.maxHeight = `${maxHeight}px`;
      el.style.visibility = 'visible';
    };
    place();
    const vv = window.visualViewport;
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    vv?.addEventListener('resize', place);
    vv?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      vv?.removeEventListener('resize', place);
      vv?.removeEventListener('scroll', place);
    };
  }, [anchor, align]);

  /* 열면 첫 항목에 초점, 바깥을 누르면 닫는다(단추를 누른 것은 단추가 처리한다) */
  useEffect(() => {
    box.current?.querySelector<HTMLElement>(MENU_ITEMS)?.focus({ preventScroll: true });
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t) || anchor?.contains(t)) return;
      close.current('outside');
    };
    document.addEventListener('pointerdown', down, true);
    return () => document.removeEventListener('pointerdown', down, true);
  }, [anchor]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 메뉴 안의 키는 편집기 · 화면 단축키(E · / · Ctrl+K)로 넘기지 않는다
    e.stopPropagation();
    if (e.nativeEvent.isComposing) return;
    const items = [...(box.current?.querySelectorAll<HTMLElement>(MENU_ITEMS) ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (k: number) => {
      e.preventDefault();
      const el = items[(k + items.length) % items.length];
      el?.focus({ preventScroll: true });
      keepInView(box.current, el ?? null);
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i < 0 ? items.length - 1 : i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      anchor?.focus({ preventScroll: true });
      close.current('escape');
    } else if (e.key === 'Tab') {
      // 단추로 초점을 옮겨 두면 브라우저의 Tab 이 단추 다음(Shift 면 앞) 칸으로 넘긴다. 메뉴는 그다음에 닫는다
      anchor?.focus({ preventScroll: true });
      setTimeout(() => close.current('tab'), 0);
    }
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={box} role="menu" aria-label={label} onKeyDown={onKeyDown} className="tm-float" style={{ width }}>
      {children}
    </div>,
    document.body,
  );
}

/* ── 글을 고르면 뜨는 막대 · 링크 고치기 ─────────────── */

/**
 * 떠 있는 막대가 위쪽 서식 도구(sticky)를 가리지 않게 - 스크롤 칸 맨 위에서 도구 막대 아래까지를 쓸 수 없는 자리로 센다.
 * 위가 모자라면 고른 글 아래로 뒤집힌다(flip)
 */
function bubbleRoom(state: { elements: { floating: Element } }) {
  const frame = state.elements.floating.closest('.tm-editor-frame');
  const bar = frame?.parentElement?.querySelector('.tm-toolbar');
  let clip: Element | null = frame?.parentElement ?? null;
  while (clip && !/(auto|scroll)/.test(getComputedStyle(clip).overflowY)) clip = clip.parentElement;
  const top = clip ? clip.getBoundingClientRect().top : 0;
  const under = bar ? bar.getBoundingClientRect().bottom - top : 0;
  return { padding: { top: Math.max(EDGE, under + EDGE), right: EDGE, bottom: EDGE, left: EDGE } };
}

/* 떠 있는 막대의 설정 - 매번 새로 만들면 막대가 그릴 때마다 편집기에 설정을 다시 보낸다(함수도 모듈에 하나) */
const BUBBLE_OPTIONS = { placement: 'top', offset: 8, flip: bubbleRoom, shift: { padding: EDGE } } as const;
/** 떠 있는 막대의 플러그인 이름 - 이 이름으로 'show' 를 보내면 고른 글이 없어도 바로 뜬다(링크 쓰기) */
const BUBBLE_KEY = 'tmBubble';

function Bubble({ editor, linkOpen, setLinkOpen }: { editor: Editor; linkOpen: boolean; setLinkOpen(v: boolean): void }) {
  const wiki = useWiki();
  const linkOpenNow = useRef(linkOpen);
  linkOpenNow.current = linkOpen;
  const shouldShow = useCallback(({ editor: e, state, from, to }: { editor: Editor; state: Editor['state']; from: number; to: number }) => {
    if (!e.isEditable) return false;
    if (state.selection instanceof NodeSelection) return false;
    if (state.doc.resolve(from).parent.type.spec.code) return false;
    // 글을 골랐거나, 링크 위에 커서가 있거나, 링크를 고치는 중
    return linkOpenNow.current || from !== to || e.isActive('link');
  }, []);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), strike: e.isActive('strike'),
      code: e.isActive('code'), highlight: e.isActive('highlight'), link: e.isActive('link'),
      href: String(e.getAttributes('link').href ?? ''), empty: e.state.selection.empty,
    }),
  });
  const [href, setHref] = useState('');
  const [text, setText] = useState('');
  const [bad, setBad] = useState(false);
  const textInput = useRef<HTMLInputElement>(null);
  const hrefInput = useRef<HTMLInputElement>(null);
  /** 링크 칸을 열 때 보이던 글 - 표시할 글을 바꿨는지 견준다 */
  const shown = useRef('');

  /* 링크 칸을 열 때 한 번만 채운다(치는 동안 다시 채우면 쓰던 글이 지워진다). 고른 글이 없으면 막대가 숨어 있으니
     라이브러리에 '보이기'를 보내 바로 띄우고, 그다음 칸에 초점을 준다 */
  useEffect(() => {
    if (!linkOpen) return;
    const { state } = editor;
    const { from, to, empty } = state.selection;
    let label = empty ? '' : state.doc.textBetween(from, to, ' ');
    if (empty && editor.isActive('link')) {
      const range = getMarkRange(state.selection.$from, state.schema.marks.link);
      if (range) label = state.doc.textBetween(range.from, range.to, ' ');
    }
    shown.current = label;
    setText(label);
    setHref(String(editor.getAttributes('link').href ?? ''));
    setBad(false);
    editor.view.dispatch(editor.state.tr.setMeta(BUBBLE_KEY, 'show'));
    // 고른 글이 있으면 주소 칸부터, 없으면 표시할 글부터
    requestAnimationFrame(() => (label ? hrefInput : textInput).current?.focus());
  }, [linkOpen, editor]);

  /** 링크 칸을 닫는다 - 고른 글도 링크도 없으면 막대도 숨긴다(라이브러리는 커서만 있을 때 다시 따지지 않는다) */
  const finish = () => {
    linkOpenNow.current = false;
    setLinkOpen(false);
    if (editor.state.selection.empty && !editor.isActive('link')) editor.view.dispatch(editor.state.tr.setMeta(BUBBLE_KEY, 'hide'));
  };
  const close = () => {
    finish();
    editor.commands.focus();
  };

  const apply = () => {
    const v = href.trim();
    const label = text.trim();
    const onLink = editor.isActive('link');
    if (!v) {
      if (onLink) editor.chain().focus().extendMarkRange('link').unsetLink().run();
      close();
      return;
    }
    // 주소만 적으면 https:// 를 붙인다
    const withScheme = /^[a-z][\w+.-]*:|^\/|^#/i.test(v) ? v : `https://${v}`;
    const to = linkTo(withScheme);
    if (!to) { setBad(true); return; }
    const mark = { type: 'link', attrs: { href: to.href } };
    if (editor.state.selection.empty && !onLink) {
      // 고른 글이 없다 - 커서 자리에 넣고 한 칸 띄운다(이어 치는 글이 링크에 붙지 않게)
      editor.chain().focus().insertContent([{ type: 'text', text: label || v, marks: [mark] }, { type: 'text', text: ' ' }]).run();
    } else if (label && label !== shown.current) {
      // 표시할 글을 바꿨다 - 고른 글(링크 전체)을 새 글로 바꾼다
      editor.chain().focus().extendMarkRange('link').insertContent({ type: 'text', text: label, marks: [mark] }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: to.href }).run();
    }
    finish();
  };

  const escape = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    close();
  };

  return (
    <BubbleMenu editor={editor} pluginKey={BUBBLE_KEY} options={BUBBLE_OPTIONS} shouldShow={shouldShow} className="tm-bubble">
      {linkOpen ? (
        <form className="tm-link-form" onSubmit={(e) => { e.preventDefault(); apply(); }}>
          <label className="tm-link-row" htmlFor="tm-link-text">
            <span>표시할 글</span>
            <input id="tm-link-text" ref={textInput} value={text} placeholder="비우면 주소가 보입니다"
              onChange={(e) => setText(e.target.value)} onKeyDown={escape} className="tm-bubble-input" />
          </label>
          <label className="tm-link-row" htmlFor="tm-link-href">
            <span>주소</span>
            <input id="tm-link-href" ref={hrefInput} value={href} placeholder="https:// · /경로 · #제목"
              aria-invalid={bad || undefined}
              onChange={(e) => { setHref(e.target.value); setBad(false); }}
              onKeyDown={escape} className="tm-bubble-input" />
          </label>
          <div className="tm-link-actions">
            {bad && <span className="tm-bubble-error mr-auto" role="alert">열 수 없는 주소</span>}
            {s.link && (
              <button type="button" className="tm-bubble-btn" title="링크 없애기" aria-label="링크 없애기"
                onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); finish(); }}>
                <Ico n="unlink" size={16} />
              </button>
            )}
            <button type="button" className="tm-bubble-btn" onClick={close}>취소</button>
            <button type="submit" className="tm-bubble-btn is-primary">적용</button>
          </div>
        </form>
      ) : s.empty && s.link ? (
        <div className="flex items-center gap-1.5">
          <span className="tm-bubble-href" title={s.href}>{s.href}</span>
          <button type="button" className="tm-bubble-btn" title="열기" aria-label="링크 열기"
            onClick={() => { if (wiki) openHref(s.href, wiki, editor.view.dom); }}>
            <Ico n="open" size={16} />
          </button>
          <button type="button" className="tm-bubble-btn" onClick={() => setLinkOpen(true)}>고치기</button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          <ToolBtn label="굵게" on={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}><b className="text-[15px]">B</b></ToolBtn>
          <ToolBtn label="기울임" on={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><i className="font-serif text-[16px]">I</i></ToolBtn>
          <ToolBtn label="취소선" on={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><s className="text-[15px]">S</s></ToolBtn>
          <ToolBtn label="형광펜" on={s.highlight} onClick={() => editor.chain().focus().toggleHighlight().run()}><Ico n="highlight" /></ToolBtn>
          <ToolBtn label="코드" on={s.code} onClick={() => editor.chain().focus().toggleCode().run()}><Ico n="code" /></ToolBtn>
          <ToolBtn label="링크" on={s.link} onClick={() => setLinkOpen(true)}><Ico n="link" /></ToolBtn>
        </div>
      )}
    </BubbleMenu>
  );
}

/* ── 블록 메뉴 - 손잡이(마우스)와 도구 막대의 '블록' 단추(손가락 · 키보드)가 같이 쓴다 ── */

/** 블록 자리 - 맨 위 블록이나 목록 항목. 목록 항목이면 '바꾸기' 를 내지 않는다 */
interface BlockAt {
  pos: number;
  item: boolean;
}

/** 커서가 있는 블록 */
function currentBlock(editor: Editor): BlockAt | null {
  const sel = editor.state.selection;
  if (sel instanceof NodeSelection && sel.$from.depth === 0) return { pos: sel.from, item: false };
  const $p = sel.$from;
  for (let d = $p.depth; d > 0; d -= 1) {
    const name = $p.node(d).type.name;
    if (name === 'listItem' || name === 'taskItem') return { pos: $p.before(d), item: true };
  }
  return $p.depth < 1 ? null : { pos: $p.before(1), item: false };
}

type BlockKind = 'up' | 'down' | 'dup' | 'del' | `to-${string}`;

/** 블록 옮기기 · 복제 · 지우기 · 바꾸기. 옮긴 블록이 보이게 문서 스크롤 칸 안에서만 움직인다 */
function blockAct(editor: Editor, at: BlockAt, kind: BlockKind) {
  const { state } = editor;
  const n = state.doc.nodeAt(at.pos);
  if (!n) return;
  const $p = state.doc.resolve(at.pos);
  const index = $p.index();
  const parent = $p.parent;
  const end = at.pos + n.nodeSize;
  let tr = state.tr;
  let landed = at.pos;
  if (kind === 'up' && index > 0) {
    const prev = parent.child(index - 1);
    landed = at.pos - prev.nodeSize;
    tr = tr.delete(at.pos, end).insert(landed, n);
    tr.setSelection(NodeSelection.create(tr.doc, landed));
  } else if (kind === 'down' && index < parent.childCount - 1) {
    const next = parent.child(index + 1);
    landed = at.pos + next.nodeSize;
    tr = tr.delete(at.pos, end).insert(landed, n);
    tr.setSelection(NodeSelection.create(tr.doc, landed));
  } else if (kind === 'dup') {
    tr = tr.insert(end, n);
    landed = end;
  } else if (kind === 'del') {
    tr = tr.delete(at.pos, end);
  } else if (kind.startsWith('to-')) {
    // 바꾸기 - 블록 안에 커서를 두고 명령을 돌린다
    editor.chain().focus().setTextSelection(Math.min(at.pos + 1, state.doc.content.size)).run();
    const c = editor.chain().focus();
    const to = kind.slice(3);
    if (to === 'p') c.setParagraph().run();
    else if (to.startsWith('h')) c.setHeading({ level: Number(to.slice(1)) as 1 | 2 | 3 | 4 }).run();
    else if (to === 'ul') c.toggleBulletList().run();
    else if (to === 'ol') c.toggleOrderedList().run();
    else if (to === 'todo') c.toggleTaskList().run();
    else if (to === 'quote') c.toggleBlockquote().run();
    else if (to === 'code') c.toggleCodeBlock().run();
    return;
  } else return;
  editor.view.dispatch(tr);
  editor.commands.focus();
  if (kind !== 'del') {
    const dom = editor.view.nodeDOM(landed) as HTMLElement | null;
    let box = dom?.parentElement ?? null;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    keepInView(box, dom);
  }
}

const SWAPS = [['p', '본문'], ['h1', '제목 1'], ['h2', '제목 2'], ['h3', '제목 3'], ['h4', '제목 4'], ['ul', '글머리 목록'],
  ['ol', '번호 목록'], ['todo', '할 일 목록'], ['quote', '강조 패널'], ['code', '코드 블록']] as const;

/** 블록 메뉴의 항목 - 맨 위 · 맨 아래 블록이면 위로 · 아래로 옮기기를 끈다 */
function BlockMenuItems({ editor, at, onDone }: { editor: Editor; at: BlockAt; onDone(): void }) {
  const node = editor.state.doc.nodeAt(at.pos);
  if (!node) return <p className="tm-menu-label">블록을 찾지 못했습니다</p>;
  const $p = editor.state.doc.resolve(at.pos);
  const first = $p.index() === 0;
  const last = $p.index() >= $p.parent.childCount - 1;
  const go = (kind: BlockKind) => {
    onDone();
    blockAct(editor, at, kind);
  };
  return (
    <>
      <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" disabled={first} onClick={() => go('up')}>위로 옮기기</button>
      <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" disabled={last} onClick={() => go('down')}>아래로 옮기기</button>
      <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => go('dup')}>복제</button>
      {node.isTextblock && !at.item && (
        <div role="group" aria-label="바꾸기">
          <p className="tm-menu-label" aria-hidden>바꾸기</p>
          {SWAPS.map(([k, label]) => (
            <button key={k} type="button" role="menuitem" tabIndex={-1} className="tm-menu-item" onClick={() => go(`to-${k}`)}>{label}</button>
          ))}
        </div>
      )}
      <div className="tm-menu-sep" role="separator" />
      <button type="button" role="menuitem" tabIndex={-1} className="tm-menu-item is-danger" onClick={() => go('del')}>지우기</button>
    </>
  );
}

/* ── 블록 손잡이 - 끌어 옮기기 · 블록 메뉴 · 아래에 넣기 ── */

interface Hover extends BlockAt {
  top: number;
}

function BlockHandle({ editor }: { editor: Editor }) {
  const [hover, setHover] = useState<Hover | null>(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(menu);
  menuRef.current = menu;
  const grip = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const view = editor.view;
    const frame = view.dom.closest('.tm-editor-frame') as HTMLElement | null;
    if (!frame) return;

    const find = (clientX: number, clientY: number): Hover | null => {
      const box = view.dom.getBoundingClientRect();
      const x = Math.min(Math.max(clientX, box.left + 24), box.right - 8);
      const hit = view.posAtCoords({ left: x, top: clientY });
      if (!hit) return null;
      const $pos = view.state.doc.resolve(hit.inside >= 0 ? hit.inside : hit.pos);
      let depth = 1;
      let item = false;
      for (let d = $pos.depth; d > 0; d -= 1) {
        const name = $pos.node(d).type.name;
        if (name === 'listItem' || name === 'taskItem') { depth = d; item = true; break; }
      }
      if ($pos.depth < 1) {
        // 블록 사이 · 원자 블록(그림 · 구분선) - 그 자리의 블록
        const node = view.state.doc.nodeAt(hit.inside >= 0 ? hit.inside : hit.pos);
        if (!node) return null;
        const pos = hit.inside >= 0 ? hit.inside : hit.pos;
        const dom = view.nodeDOM(pos) as HTMLElement | null;
        if (!dom?.getBoundingClientRect) return null;
        return { pos, top: dom.getBoundingClientRect().top - frame.getBoundingClientRect().top, item: false };
      }
      const pos = $pos.before(item ? depth : 1);
      const dom = view.nodeDOM(pos) as HTMLElement | null;
      if (!dom?.getBoundingClientRect) return null;
      const r = dom.getBoundingClientRect();
      // 글 첫 줄 높이에 맞춘다
      const line = parseFloat(getComputedStyle(dom).lineHeight) || 26;
      const top = r.top - frame.getBoundingClientRect().top + Math.max(0, Math.min(line, r.height) / 2 - 13);
      return { pos, top, item };
    };

    const move = (e: MouseEvent) => {
      if (menuRef.current) return;
      const next = find(e.clientX, e.clientY);
      setHover((h) => (h?.pos === next?.pos && h?.top === next?.top ? h : next));
    };
    const leave = (e: MouseEvent) => {
      if (menuRef.current || frame.contains(e.relatedTarget as Node)) return;
      setHover(null);
    };
    frame.addEventListener('mousemove', move);
    frame.addEventListener('mouseleave', leave);
    return () => {
      frame.removeEventListener('mousemove', move);
      frame.removeEventListener('mouseleave', leave);
    };
  }, [editor]);

  /* 내용이 바뀌면 자리가 어긋나므로 감춘다 */
  useEffect(() => {
    const hide = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      // 메뉴가 열려 있어도 닫는다 - 다른 팀원의 고침으로 블록 자리가 바뀌면 메뉴가 엉뚱한 블록을 옮기거나 지운다
      if (!transaction.docChanged) return;
      setMenu(false);
      setHover(null);
    };
    editor.on('transaction', hide);
    return () => { editor.off('transaction', hide); };
  }, [editor]);

  if (!hover) return null;
  const node = editor.state.doc.nodeAt(hover.pos);
  if (!node) return null;

  const onDragStart = (e: React.DragEvent) => {
    const { view } = editor;
    const sel = NodeSelection.create(view.state.doc, hover.pos);
    view.dispatch(view.state.tr.setSelection(sel));
    const dom = view.nodeDOM(hover.pos) as HTMLElement | null;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', docToMd({ type: 'doc', content: [node.toJSON()] }));
    if (dom) e.dataTransfer.setDragImage(dom, 0, 0);
    // 놓으면 ProseMirror 가 고른 블록(위에서 고른 NodeSelection)을 지우고 놓은 자리에 넣는다
    view.dragging = { slice: sel.content(), move: true };
  };

  const addBelow = () => {
    const n = editor.state.doc.nodeAt(hover.pos);
    if (!n) return;
    const at = hover.pos + n.nodeSize;
    editor.chain().insertContentAt(at, { type: 'paragraph' }).setTextSelection(at + 1).insertContent('/').focus().run();
    setHover(null);
  };

  return (
    <div className="tm-handle" style={{ top: hover.top }} onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}>
      {!hover.item && (
        <button type="button" className="tm-handle-btn" title="아래에 블록 넣기" aria-label="아래에 블록 넣기" onClick={addBelow}>
          <Ico n="plus" size={16} />
        </button>
      )}
      <div className="relative">
        <button ref={grip} type="button" className="tm-handle-btn is-grip" draggable title="끌어서 옮기기 · 눌러서 메뉴"
          aria-label="블록 메뉴" aria-haspopup="menu" aria-expanded={menu} onDragStart={onDragStart} onDragEnd={() => setHover(null)}
          onClick={() => setMenu((v) => !v)}>
          <Ico n="grip" size={16} />
        </button>
        {menu && (
          <FloatMenu anchor={grip.current} label="블록 메뉴"
            onClose={(why) => {
              setMenu(false);
              setHover(null);
              // 손잡이는 닫으면 사라진다 - Esc 로 닫았으면 본문으로 돌아간다
              if (why === 'escape') editor.commands.focus();
            }}>
            <BlockMenuItems editor={editor} at={hover} onDone={() => { setMenu(false); setHover(null); }} />
          </FloatMenu>
        )}
      </div>
    </div>
  );
}

/**
 * 요소가 든 스크롤 칸만 움직여 요소를 위쪽에 둔다. scrollIntoView 는 바깥 화면(작업 관리 셸)까지 밀어 올려
 * 왼쪽 메뉴가 위로 밀리고 아래에 빈 띠가 생긴다
 */
export function scrollWithin(el: HTMLElement | null, offset = 16) {
  let box = el?.parentElement ?? null;
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
  if (!el || !box) return;
  box.scrollBy({ top: el.getBoundingClientRect().top - box.getBoundingClientRect().top - offset, behavior: 'smooth' });
}

/** 목록 칸 안에서만 - 고른 줄이 보이게(위아래 가장자리에 맞춘다) */
export function keepInView(box: HTMLElement | null, el: HTMLElement | null) {
  if (!box || !el) return;
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (r.top < b.top) box.scrollTop -= b.top - r.top + 4;
  else if (r.bottom > b.bottom) box.scrollTop += r.bottom - b.bottom + 4;
}

/** 편집기 밖(목차)에서 제목 자리로 간다 */
export function scrollToPos(editor: Editor | null, pos: number) {
  if (!editor || editor.isDestroyed) return;
  scrollWithin(editor.view.nodeDOM(pos) as HTMLElement | null);
}

/** 편집기 밖에서 커서를 둔다(편집을 시작할 때) */
export function focusEditor(editor: Editor | null, where: 'start' | 'end' = 'end') {
  if (!editor || editor.isDestroyed) return;
  editor.commands.focus(where);
}
