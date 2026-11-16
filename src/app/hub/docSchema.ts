import {
  Extension, Mark, Node, mergeAttributes, wrappingInputRule,
  type CommandProps, type Extensions, type NodeViewRenderer,
} from '@tiptap/core';
import type { DOMOutputSpec, Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection, type EditorState, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { columnResizing } from '@tiptap/pm/tables';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableCell, TableHeader, TableKit } from '@tiptap/extension-table';
import { Highlight } from '@tiptap/extension-highlight';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import {
  CALLOUTS, anchorName, hexColor, imageSrcOk, isIsoDate, linkTo, statusColor, varKind, varName, varOptions, type CalloutKind,
} from './docMarkdown';

/*
 * 위키 편집기의 문서 꼴 - 어떤 블록 · 글 꾸밈이 있는지.
 * 화면 부품(React)이 없는 정의만 둔다. 편집기(DocEditor)는 여기에 그림 · 언급 · 문서 링크 · 상태 · 날짜 · 목차 같은
 * 화면과 슬래시 메뉴 같은 편집 도구를 덧붙인다. 블록 이름은 docMarkdown.ts 가 읽고 쓰는 이름과 같다.
 * Confluence 에서 옮겨 온 문서의 요소(칸 합친 표 · 단 나누기 · 상태 · 날짜 · 결정 · 목차 · 하위 문서 · 글자 색 …)도 여기서 정한다.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /** 고른 블록을 알림 상자로 감싼다. 이미 알림 상자 안이면 종류만 바꾼다 */
      setCallout: (kind: CalloutKind) => ReturnType;
      unsetCallout: () => ReturnType;
    };
    blockFormat: {
      /** 고른 문단 · 제목의 맞춤(left 는 기본으로 되돌린다) */
      setTextAlign: (align: 'left' | 'center' | 'right') => ReturnType;
      /** 고른 문단 · 제목을 한 단계 더 · 덜 들여 쓴다(0~6) */
      indentBlock: () => ReturnType;
      outdentBlock: () => ReturnType;
    };
    textColor: {
      /** 글자 색 · 바탕색 - null 이면 지운다 */
      setTextColor: (color: string | null) => ReturnType;
      setBgColor: (color: string | null) => ReturnType;
    };
    layout: {
      /** 단 나누기를 넣는다 - 너비(%)마다 한 단 */
      insertLayout: (widths: number[]) => ReturnType;
      /** 커서가 든 단 나누기의 단 수 · 너비를 바꾼다. 없어지는 단의 내용은 남는 마지막 단으로 옮긴다 */
      setLayout: (widths: number[]) => ReturnType;
      /** 단 나누기를 풀어 단의 내용을 차례로 늘어놓는다 */
      unsetLayout: () => ReturnType;
    };
  }
}

/** 제목 - 문서 이름이 h2 라 본문의 제목 1 은 h3 부터 쓴다(제목 4~6 은 h6 에 data-level 로 가른다) */
const WikiHeading = Heading.extend({
  parseHTML() {
    return [
      ...[3, 4, 5, 6].map((tag) => ({
        tag: `h${tag}[data-level]`,
        priority: 60,
        getAttrs: (el: HTMLElement) => {
          const level = Number(el.getAttribute('data-level'));
          return level >= 1 && level <= 6 ? { level } : false;
        },
      })),
      ...[1, 2, 3, 4, 5, 6].map((tag) => ({ tag: `h${tag}`, attrs: { level: tag } })),
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = Number(node.attrs.level) || 1;
    return [`h${Math.min(level + 2, 6)}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-level': level }), 0];
  },
}).configure({ levels: [1, 2, 3, 4, 5, 6] });

/* ── 맞춤 · 들여쓰기(문단 · 제목) ───────────────────────── */

const ALIGNABLE = new Set(['paragraph', 'heading']);

/** 고른 범위의 문단 · 제목마다 */
function eachTextBlock(state: EditorState, f: (node: PMNode, pos: number) => void): number {
  let n = 0;
  const { from, to } = state.selection;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!ALIGNABLE.has(node.type.name)) return true;
    n += 1;
    f(node, pos);
    return false;
  });
  return n;
}

export const BlockFormat = Extension.create({
  name: 'blockFormat',

  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading'],
      attributes: {
        textAlign: {
          default: null,
          parseHTML: (el: HTMLElement) => {
            const a = (el.style?.textAlign || el.getAttribute('align') || '').toLowerCase();
            return a === 'center' ? 'center' : a === 'right' || a === 'end' ? 'right' : null;
          },
          renderHTML: (attrs: { textAlign?: string | null }) => (attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {}),
        },
        indent: {
          default: 0,
          parseHTML: (el: HTMLElement) => {
            const d = Number(el.getAttribute('data-indent'));
            if (d > 0) return Math.min(6, Math.round(d));
            // Confluence 는 들여쓰기를 margin-left 30px 단위로 적는다
            const m = /^([\d.]+)px$/.exec(el.style?.marginLeft ?? '');
            return m ? Math.max(0, Math.min(6, Math.round(Number(m[1]) / 30))) : 0;
          },
          renderHTML: (attrs: { indent?: number }) => (attrs.indent ? { 'data-indent': attrs.indent } : {}),
        },
      },
    }];
  },

  addCommands() {
    const shift = (d: 1 | -1) => () => ({ state, tr, dispatch }: CommandProps) => {
      const n = eachTextBlock(state, (node, pos) => {
        const next = Math.max(0, Math.min(6, (Number(node.attrs.indent) || 0) + d));
        if (dispatch && next !== node.attrs.indent) tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
      });
      return n > 0;
    };
    return {
      setTextAlign: (align) => ({ state, tr, dispatch }) => {
        const n = eachTextBlock(state, (node, pos) => {
          if (dispatch) tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align === 'left' ? null : align });
        });
        return n > 0;
      },
      indentBlock: shift(1),
      outdentBlock: shift(-1),
    };
  },

  addKeyboardShortcuts() {
    /** 목록 · 표 · 코드 밖의 문단 · 제목인가 - Tab 은 그곳에서만 들여쓰기(목록은 겹치기, 표는 다음 칸) */
    const plain = () => {
      const { $from } = this.editor.state.selection;
      for (let d = $from.depth; d > 0; d -= 1) {
        const n = $from.node(d).type.name;
        if (n === 'listItem' || n === 'taskItem' || n === 'decisionItem' || n === 'tableCell' || n === 'tableHeader') return false;
      }
      return ALIGNABLE.has($from.parent.type.name);
    };
    return {
      Tab: () => {
        if (!plain()) return false;
        this.editor.commands.indentBlock();
        return true;
      },
      'Shift-Tab': () => plain() && this.editor.commands.outdentBlock(),
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
    };
  },
});

/* ── 글 꾸밈 - 글자 색 · 바탕색 · 아래 · 위 첨자 ─────────── */

/** 본문의 기본 글자 색(검정 · Confluence 기본색)은 색으로 받지 않는다 */
const PLAIN_TEXT = new Set(['#000000', '#172b4d', '#1b2430', '#091e42']);
export const textColorOf = (raw: unknown) => {
  const c = hexColor(raw);
  return c && !PLAIN_TEXT.has(c) ? c : null;
};
/** 흰 바탕은 바탕색으로 받지 않는다 */
export const bgColorOf = (raw: unknown) => {
  const c = hexColor(raw);
  return c && c !== '#ffffff' ? c : null;
};

/** 글자 색 · 바탕색 - 한 꾸밈에 둘을 같이 든다(<span style="color; background-color">) */
export const ColorMark = Mark.create({
  name: 'color',

  addAttributes() {
    return {
      color: { default: null },
      bg: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (el: HTMLElement) => {
          // 언급 · 문서 링크 · 상태 배지의 span 은 그 요소로 읽는다
          if (el.hasAttribute('data-mention') || el.hasAttribute('data-doc-link') || el.hasAttribute('data-status')) return false;
          const color = textColorOf(el.style?.color || el.getAttribute('data-text-custom-color'));
          const bg = bgColorOf(el.style?.backgroundColor || el.getAttribute('data-background-custom-color'));
          return color || bg ? { color, bg } : false;
        },
      },
      {
        tag: 'font[color]',
        getAttrs: (el: HTMLElement) => {
          const color = textColorOf(el.getAttribute('color'));
          return color ? { color, bg: null } : false;
        },
      },
    ];
  },

  renderHTML({ mark }) {
    const color = hexColor(mark.attrs.color);
    const bg = hexColor(mark.attrs.bg);
    const style = [color ? `color: ${color}` : '', bg ? `background-color: ${bg}` : ''].filter(Boolean).join('; ');
    return ['span', { style, class: bg ? 'tm-bg' : null }, 0];
  },

  addCommands() {
    const paint = (key: 'color' | 'bg', raw: string | null) => ({ state, tr, dispatch }: CommandProps) => {
      const type = state.schema.marks.color;
      if (!type) return false;
      const value = key === 'color' ? textColorOf(raw) : bgColorOf(raw);
      const next = (old: Record<string, unknown> | undefined) => ({ color: old?.color ?? null, bg: old?.bg ?? null, [key]: value });
      const { empty, ranges } = tr.selection;
      if (!dispatch) return true;
      if (empty) {
        const old = (tr.storedMarks ?? state.selection.$from.marks()).find((m) => m.type === type)?.attrs;
        const attrs = next(old);
        tr.removeStoredMark(type);
        if (attrs.color || attrs.bg) tr.addStoredMark(type.create(attrs));
        return true;
      }
      ranges.forEach(({ $from, $to }) => {
        state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          if (!node.isText || node.marks.some((m) => m.type.name === 'code')) return;
          const from = Math.max(pos, $from.pos);
          const to = Math.min(pos + node.nodeSize, $to.pos);
          const attrs = next(node.marks.find((m) => m.type === type)?.attrs);
          tr.removeMark(from, to, type);
          if (attrs.color || attrs.bg) tr.addMark(from, to, type.create(attrs));
        });
      });
      return true;
    };
    return {
      setTextColor: (color) => paint('color', color),
      setBgColor: (color) => paint('bg', color),
    };
  },
});

export const Subscript = Mark.create({
  name: 'subscript',
  excludes: 'superscript',
  parseHTML() {
    return [{ tag: 'sub' }, { style: 'vertical-align', getAttrs: (v: string) => (v === 'sub' ? null : false) }];
  },
  renderHTML() {
    return ['sub', 0];
  },
});

export const Superscript = Mark.create({
  name: 'superscript',
  excludes: 'subscript',
  parseHTML() {
    return [{ tag: 'sup' }, { style: 'vertical-align', getAttrs: (v: string) => (v === 'super' ? null : false) }];
  },
  renderHTML() {
    return ['sup', 0];
  },
});

/* ── 알림 상자 ─────────────────────────────────────────── */

/** 알림 상자 - Confluence 의 정보 · 메모 · 성공 · 주의 · 오류 · 사용자 패널, GitHub 의 NOTE · TIP …. 제목 · 바탕색 · 아이콘(이모지)을 붙일 수 있다 */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'note',
        parseHTML: (el: HTMLElement) => {
          const k = el.getAttribute('data-kind');
          return CALLOUTS.some((c) => c.kind === k) ? k : 'note';
        },
        renderHTML: (attrs: { kind?: string }) => ({ 'data-kind': attrs.kind ?? 'note' }),
      },
      title: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-title')?.trim() || null,
        renderHTML: (attrs: { title?: string | null }) => (attrs.title ? { 'data-title': attrs.title } : {}),
      },
      bg: {
        default: null,
        parseHTML: (el: HTMLElement) => hexColor(el.getAttribute('data-bg')),
        renderHTML: (attrs: { bg?: string | null }) => (attrs.bg ? { 'data-bg': attrs.bg, style: `--tm-callout-bg: ${attrs.bg}` } : {}),
      },
      icon: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-icon')?.trim() || null,
        renderHTML: (attrs: { icon?: string | null }) => (attrs.icon ? { 'data-icon': attrs.icon } : {}),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-callout]',
      // 제목 줄은 속성(data-title)으로 읽고, 내용은 본문 칸에서만
      contentElement: (dom: globalThis.Node) => (dom as HTMLElement).querySelector<HTMLElement>(':scope > .tm-callout-body') ?? dom as HTMLElement,
    }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = CALLOUTS.find((c) => c.kind === node.attrs.kind)?.label ?? '정보';
    const title = String(node.attrs.title ?? '').trim();
    const parts: DOMOutputSpec[] = [];
    if (title) parts.push(['p', { class: 'tm-callout-title', contenteditable: 'false' }, title]);
    parts.push(['div', { class: 'tm-callout-body' }, 0]);
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '', class: 'tm-callout', role: 'note', 'aria-label': title || label }), ...parts];
  },

  addCommands() {
    return {
      setCallout: (kind) => ({ state, commands }) => {
        const { $from } = state.selection;
        for (let d = $from.depth; d > 0; d -= 1) {
          if ($from.node(d).type.name === this.name) {
            return commands.command(({ tr }) => {
              tr.setNodeMarkup($from.before(d), undefined, { ...$from.node(d).attrs, kind });
              return true;
            });
          }
        }
        return commands.wrapIn(this.name, { kind });
      },
      unsetCallout: () => ({ commands }) => commands.lift(this.name),
    };
  },
});

/* ── 그림 · 언급 · 문서 링크 ───────────────────────────── */

/** 그림 - 한 블록을 혼자 차지한다. data:image 는 이 브라우저 저장 모드에서만 받는다(팀 저장소에는 파일로 올린다) */
export const WikiImage = Node.create<{ allowData: boolean }>({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { allowData: false };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      /** 보이는 너비(px) - 없으면 원래 크기(본문 폭까지) */
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const w = Number.parseInt(el.getAttribute('width') ?? '', 10);
          return w > 0 ? Math.min(w, 4000) : null;
        },
        renderHTML: (attrs: { width?: number | null }) => (attrs.width ? { width: attrs.width } : {}),
      },
      /** 자리 - 없으면 왼쪽 */
      align: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const a = el.getAttribute('data-align') ?? el.getAttribute('align');
          return a === 'left' || a === 'center' || a === 'right' ? a : null;
        },
        renderHTML: (attrs: { align?: string | null }) => (attrs.align ? { 'data-align': attrs.align } : {}),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'img[src]',
      getAttrs: (el: HTMLElement) => {
        const src = el.getAttribute('src') ?? '';
        if (!imageSrcOk(src) || (src.startsWith('data:') && !this.options.allowData)) return false;
        return { src, alt: el.getAttribute('alt') || null };
      },
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { loading: 'lazy', class: 'tm-image' })];
  },
});

/** 사람 언급 - 이름은 화면이 지금 이름으로 다시 적는다(이름을 바꿔도 따라간다) */
export const Mention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-id'),
        renderHTML: (attrs: { id?: string | null }) => ({ 'data-id': attrs.id }),
      },
      label: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-label') ?? (el.textContent ?? '').replace(/^@/, ''),
        renderHTML: (attrs: { label?: string }) => ({ 'data-label': attrs.label }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-mention]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-mention': '', class: 'tm-mention' }), `@${node.attrs.label}`];
  },

  renderText({ node }) {
    return `@${node.attrs.label}`;
  },
});

/** 다른 문서로 가는 링크 - 제목은 화면이 지금 제목으로 다시 적는다 */
export const DocLink = Node.create({
  name: 'docLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-id'),
        renderHTML: (attrs: { id?: string | null }) => ({ 'data-id': attrs.id }),
      },
      title: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-title') ?? el.textContent ?? '',
        renderHTML: (attrs: { title?: string }) => ({ 'data-title': attrs.title }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-doc-link]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-doc-link': '', class: 'tm-doclink' }), node.attrs.title || '문서'];
  },

  renderText({ node }) {
    return node.attrs.title || '문서';
  },
});

/* ── 상태 배지 · 날짜 · 책갈피 ─────────────────────────── */

/** 상태 배지 - Confluence 의 상태 매크로(완료 · 진행 중 …). 색은 여섯 가지 */
export const Status = Node.create({
  name: 'status',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-text') ?? (el.textContent ?? '').trim(),
        renderHTML: () => ({}),
      },
      color: {
        default: 'grey',
        parseHTML: (el: HTMLElement) => statusColor(el.getAttribute('data-status')),
        renderHTML: (attrs: { color?: string }) => ({ 'data-status': statusColor(attrs.color) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-status]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'tm-status' }), String(node.attrs.text || '상태')];
  },

  renderText({ node }) {
    return String(node.attrs.text ?? '');
  },
});

/** 날짜를 보이는 꼴 - 2026. 11. 16. */
export function dateLabel(iso: unknown): string {
  if (!isIsoDate(iso)) return '날짜';
  const [y, m, d] = iso.split('-');
  return `${y}. ${Number(m)}. ${Number(d)}.`;
}

/** 날짜 - Confluence 의 날짜(// 로 넣는 것). 회의 날 · 마감 날 */
export const DateNode = Node.create({
  name: 'date',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      date: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const d = (el.getAttribute('datetime') ?? '').slice(0, 10);
          return isIsoDate(d) ? d : null;
        },
        renderHTML: (attrs: { date?: string | null }) => ({ datetime: attrs.date }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'time[datetime]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['time', mergeAttributes(HTMLAttributes, { class: 'tm-date' }), dateLabel(node.attrs.date)];
  },

  renderText({ node }) {
    return String(node.attrs.date ?? '');
  },
});

/**
 * 양식 칸 - Confluence 양식의 변수(at:var). 양식('양식' 라벨을 단 문서)으로 새 문서를 만들 때
 * 새 문서 창이 칸마다 값을 묻고 그 값으로 바꾼다(한 줄 글 · 여러 줄 글 · 고르기, 이름에 date 가 들면 날짜)
 */
export const TemplateVar = Node.create({
  name: 'templateVar',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: '값',
        parseHTML: (el: HTMLElement) => varName(el.getAttribute('name') ?? el.textContent) || '값',
        renderHTML: (attrs: { name?: string }) => ({ name: attrs.name ?? '값' }),
      },
      kind: {
        default: 'string',
        parseHTML: (el: HTMLElement) => varKind(el.getAttribute('data-kind')),
        renderHTML: (attrs: { kind?: string }) => (attrs.kind && attrs.kind !== 'string' ? { 'data-kind': attrs.kind } : {}),
      },
      options: {
        default: null,
        parseHTML: (el: HTMLElement) => varOptions(el.getAttribute('data-options')),
        renderHTML: (attrs: { options?: string[] | null }) => (attrs.options?.length ? { 'data-options': JSON.stringify(attrs.options) } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'var[name]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['var', mergeAttributes(HTMLAttributes, { class: 'tm-var' }), String(node.attrs.name || '값')];
  },

  renderText({ node }) {
    return `{${String(node.attrs.name ?? '')}}`;
  },
});

/** 책갈피 - 본문 안 링크(#이름)가 가는 곳. 보기 모드에서는 보이지 않는다 */
export const Anchor = Node.create({
  name: 'anchor',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (el: HTMLElement) => anchorName(el.getAttribute('data-anchor') ?? el.getAttribute('id') ?? el.getAttribute('name')),
        renderHTML: (attrs: { name?: string }) => ({ id: attrs.name, 'data-anchor': attrs.name }),
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'a[data-anchor], a[id]:not([href]), a[name]:not([href])',
      // 글이 든 <a name> 은 책갈피가 아니라 글이다
      getAttrs: (el: HTMLElement) => ((el.textContent ?? '').trim() ? false : null),
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', mergeAttributes(HTMLAttributes, { class: 'tm-bookmark', title: `책갈피 #${HTMLAttributes['data-anchor'] ?? ''}` })];
  },

  renderText() {
    return '';
  },
});

/* ── 단 나누기 ─────────────────────────────────────────── */

/** 단 나누기 묶음 - 단(layoutColumn) 두~다섯 개 */
export const LayoutSection = Node.create({
  name: 'layoutSection',
  group: 'block',
  content: 'layoutColumn+',
  isolating: true,
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-layout]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const cols: string[] = [];
    node.forEach((c) => {
      const w = Number(c.attrs.width);
      cols.push(w > 0 ? `minmax(0, ${w}fr)` : 'minmax(0, 1fr)');
    });
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-layout': 'columns', class: 'tm-layout', style: `grid-template-columns: ${cols.join(' ')}`,
    }), 0];
  },

  addCommands() {
    /** 커서를 품은 단 나누기 */
    const around = (state: EditorState) => {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d -= 1) {
        if ($from.node(d).type.name === this.name) return { node: $from.node(d), pos: $from.before(d) };
      }
      return null;
    };
    const column = (state: EditorState, width: number, content?: PMNode[]) =>
      state.schema.nodes.layoutColumn.create({ width }, content?.length ? content : [state.schema.nodes.paragraph.create()]);
    return {
      insertLayout: (widths) => ({ state, tr, dispatch }) => {
        const { $from } = state.selection;
        if (around(state) || widths.length < 2 || $from.depth < 1) return false;
        const section = state.schema.nodes.layoutSection.create(null, widths.map((w) => column(state, w)));
        if (dispatch) {
          // 맨 위 블록이 빈 문단이면 그 자리에, 아니면 그 블록 아래에(목록 · 상자 안에는 넣지 않는다)
          const top = $from.node(1);
          const start = $from.before(1);
          let pos = start;
          if (top.isTextblock && top.content.size === 0) tr.replaceWith(start, start + top.nodeSize, section);
          else {
            pos = start + top.nodeSize;
            tr.insert(pos, section);
          }
          // 첫 단의 첫 줄로
          tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(pos + 3, tr.doc.content.size)))).scrollIntoView();
        }
        return true;
      },
      setLayout: (widths) => ({ state, tr, dispatch }) => {
        const hit = around(state);
        if (!hit || widths.length < 1) return false;
        if (dispatch) {
          const old: PMNode[] = [];
          hit.node.forEach((c) => old.push(c));
          const cols = widths.map((w, i) => {
            if (i < widths.length - 1 || i >= old.length - 1) {
              const c = old[i];
              return column(state, w, c ? [...Array.from({ length: c.childCount }, (_, k) => c.child(k))] : undefined);
            }
            // 마지막 단 - 없어지는 단의 내용을 이어 붙인다
            const rest: PMNode[] = [];
            old.slice(i).forEach((c) => c.forEach((b) => rest.push(b)));
            return column(state, w, rest);
          });
          tr.replaceWith(hit.pos, hit.pos + hit.node.nodeSize, state.schema.nodes.layoutSection.create(null, cols));
          tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(hit.pos + 3, tr.doc.content.size))));
        }
        return true;
      },
      unsetLayout: () => ({ state, tr, dispatch }) => {
        const hit = around(state);
        if (!hit) return false;
        if (dispatch) {
          const blocks: PMNode[] = [];
          hit.node.forEach((c) => c.forEach((b) => blocks.push(b)));
          tr.replaceWith(hit.pos, hit.pos + hit.node.nodeSize, blocks);
          tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(hit.pos + 1, tr.doc.content.size))));
        }
        return true;
      },
    };
  },
});

/** 단 하나 - 너비는 % */
export const LayoutColumn = Node.create({
  name: 'layoutColumn',
  content: 'block+',
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const w = Number.parseFloat(el.getAttribute('data-column') ?? '');
          return w > 0 ? Math.round(w * 100) / 100 : null;
        },
        renderHTML: (attrs: { width?: number | null }) => ({ 'data-column': attrs.width ?? '' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-column]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'tm-layout-col' }), 0];
  },
});

/* ── 목차 · 하위 문서 · 매크로 자리 ────────────────────── */

const levelAttr = (name: string) => ({
  default: null,
  parseHTML: (el: HTMLElement) => {
    const n = Number(el.getAttribute(name));
    return n >= 1 && n <= 6 ? n : null;
  },
  renderHTML: (attrs: Record<string, unknown>) => {
    const key = name === 'data-min' ? 'minLevel' : 'maxLevel';
    return attrs[key] ? { [name]: attrs[key] } : {};
  },
});

/** 목차 - 이 문서의 제목을 모아 보여 준다(Confluence 목차 매크로) */
export const Toc = Node.create({
  name: 'toc',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { minLevel: levelAttr('data-min'), maxLevel: levelAttr('data-max') };
  },

  parseHTML() {
    return [{ tag: 'div[data-toc]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-toc': '', class: 'tm-toc' }), '목차'];
  },
});

/** 하위 문서 목록 - 이 문서 아래 문서들(Confluence 하위 페이지 표시 매크로). depth 0 = 모든 깊이 */
export const ChildPages = Node.create({
  name: 'childPages',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      depth: {
        default: 1,
        parseHTML: (el: HTMLElement) => {
          const d = Number.parseInt(el.getAttribute('data-depth') ?? '1', 10);
          return Number.isFinite(d) && d >= 0 ? Math.min(d, 9) : 1;
        },
        renderHTML: (attrs: { depth?: number }) => ({ 'data-depth': attrs.depth ?? 1 }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-children]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-children': '', class: 'tm-children' }), '하위 문서'];
  },
});

/** 이 위키가 그리지 못하는 Confluence 매크로의 자리 - 이름 · 값을 그대로 들고 있다 */
export const Macro = Node.create({
  name: 'macro',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      name: {
        default: 'macro',
        parseHTML: (el: HTMLElement) => el.getAttribute('data-macro') || 'macro',
        renderHTML: (attrs: { name?: string }) => ({ 'data-macro': attrs.name ?? 'macro' }),
      },
      params: {
        default: {},
        parseHTML: (el: HTMLElement) => {
          try {
            const v = JSON.parse(el.getAttribute('data-params') ?? '{}');
            return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
          } catch {
            return {};
          }
        },
        renderHTML: (attrs: { params?: Record<string, string> }) => ({ 'data-params': JSON.stringify(attrs.params ?? {}) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-macro]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'tm-macro' }), `Confluence 매크로 · ${node.attrs.name}`];
  },
});

/* ── 결정 목록 ─────────────────────────────────────────── */

/** 결정 목록 - Confluence 의 결정(◆). 줄 머리에 <> 를 치면 바로 시작한다 */
export const DecisionList = Node.create({
  name: 'decisionList',
  group: 'block list',
  content: 'decisionItem+',

  parseHTML() {
    return [{ tag: 'ul[data-type="decisionList"]', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(HTMLAttributes, { 'data-type': 'decisionList', class: 'tm-decisions' }), 0];
  },

  addInputRules() {
    return [wrappingInputRule({ find: /^\s*<>\s$/, type: this.type })];
  },
});

export const DecisionItem = Node.create({
  name: 'decisionItem',
  content: 'paragraph block*',
  defining: true,

  parseHTML() {
    return [{ tag: 'li[data-type="decisionItem"]', priority: 51 }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(HTMLAttributes, { 'data-type': 'decisionItem' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem(this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    };
  },
});

/* ── 코드 블록 제목 · 줄 번호 ──────────────────────────── */

const LN_KEY = new PluginKey<DecorationSet>('tmLineNumbers');

/** 줄 번호를 켠 코드 블록의 줄마다 번호 - 꾸밈이라 글에는 들어가지 않는다 */
function lineNumbers() {
  const build = (doc: PMNode) => {
    const decos: Decoration[] = [];
    doc.descendants((node, pos) => {
      if (node.type.name !== 'codeBlock') return true;
      if (node.attrs.lineNumbers) {
        const text = node.textContent;
        const add = (at: number, n: number) => decos.push(Decoration.widget(at, () => {
          const s = document.createElement('span');
          s.className = 'tm-ln';
          s.textContent = String(n);
          s.contentEditable = 'false';
          s.setAttribute('aria-hidden', 'true');
          return s;
        }, { side: -1, key: `ln-${n}`, ignoreSelection: true }));
        let line = 1;
        add(pos + 1, line);
        for (let k = 0; k < text.length; k += 1) if (text[k] === '\n') add(pos + 2 + k, (line += 1));
      }
      return false;
    });
    return DecorationSet.create(doc, decos);
  };
  return new Plugin<DecorationSet>({
    key: LN_KEY,
    state: {
      init: (_, { doc }) => build(doc),
      apply: (tr: Transaction, old) => (tr.docChanged ? build(tr.doc) : old),
    },
    props: { decorations: (state) => LN_KEY.getState(state) },
  });
}

const CodeBlockMeta = Extension.create({
  name: 'codeBlockMeta',
  addGlobalAttributes() {
    return [{
      types: ['codeBlock'],
      attributes: {
        title: {
          default: null,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-title')?.trim() || null,
          renderHTML: (attrs: { title?: string | null }) => (attrs.title ? { 'data-title': attrs.title } : {}),
        },
        lineNumbers: {
          default: false,
          parseHTML: (el: HTMLElement) => el.getAttribute('data-line-numbers') === 'true',
          renderHTML: (attrs: { lineNumbers?: boolean }) => (attrs.lineNumbers ? { 'data-line-numbers': 'true' } : {}),
        },
      },
    }];
  },
  addProseMirrorPlugins() {
    return [lineNumbers()];
  },
});

/* ── 표 ────────────────────────────────────────────────── */

/** 칸 바탕색 - Confluence 의 칸 색(data-highlight-colour), 붙여 넣은 표의 칸 색 */
const cellBackground = {
  background: {
    default: null,
    parseHTML: (el: HTMLElement) => bgColorOf(
      el.getAttribute('data-bg') ?? el.getAttribute('data-highlight-colour') ?? el.getAttribute('data-cell-background')
        ?? (el.style?.backgroundColor || el.getAttribute('bgcolor')),
    ),
    renderHTML: (attrs: { background?: string | null }) => (attrs.background
      ? { 'data-bg': attrs.background, style: `background-color: ${attrs.background}` } : {}),
  },
};

/** 표 칸 - 문단 · 목록 · 코드 같은 블록이 들어간다. | 표로 적을 수 없으면 <table> 꼴로 저장한다 */
const WikiTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});
const WikiTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellBackground };
  },
});

/** 칸 너비 바꾸기 - 편집 모드에서만 손잡이가 선다(보기 모드로 연 문서를 편집으로 바꿔도 되게 늘 붙여 둔다) */
const TableResize = Extension.create({
  name: 'tableResize',
  addProseMirrorPlugins() {
    return [columnResizing({ handleWidth: 6, cellMinWidth: 48, View: null, lastColumnResizable: true })];
  },
});

export interface WikiSchemaOptions {
  /** data:image 그림을 받을지 - 브라우저 저장 모드 */
  allowData?: boolean;
  /** 보기 모드에서 체크박스를 눌렀을 때 - 참이면 눌린 채로 둔다 */
  onReadOnlyChecked?: (node: PMNode, checked: boolean) => boolean;
  /** 그림 · 언급 · 문서 링크 · 상태 · 날짜 · 목차 · 하위 문서 · 매크로를 그리는 화면(편집기가 React 로 준다) */
  views?: Partial<Record<'image' | 'mention' | 'docLink' | 'status' | 'date' | 'templateVar' | 'toc' | 'childPages' | 'macro', NodeViewRenderer>>;
}

/** 위키 문서의 블록 · 글 꾸밈 */
export function wikiSchema({ allowData = false, onReadOnlyChecked, views = {} }: WikiSchemaOptions = {}): Extensions {
  const withView = <T extends Node>(ext: T, view: NodeViewRenderer | undefined) =>
    (view ? ext.extend({ addNodeView: () => view }) : ext);
  return [
    StarterKit.configure({
      heading: false,
      link: {
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: { target: null, rel: 'noopener noreferrer nofollow' },
        isAllowedUri: (url) => !!linkTo(url),
      },
      dropcursor: { color: '#2644cb', width: 2 },
    }),
    WikiHeading,
    BlockFormat,
    TaskList,
    TaskItem.configure({
      nested: true,
      onReadOnlyChecked,
      // 화면(노드 뷰)이 그리는 li 에는 종류 표시가 없다 - 모양(wiki.css)과 보기 모드 체크가 이것으로 찾는다
      HTMLAttributes: { 'data-type': 'taskItem' },
      a11y: { checkboxLabel: (node, checked) => `할 일${checked ? '(끝냄)' : ''}: ${node.textContent || '빈 할 일'}` },
    }),
    DecisionList,
    DecisionItem,
    TableKit.configure({ table: { resizable: false, renderWrapper: true }, tableCell: false, tableHeader: false }),
    WikiTableCell,
    WikiTableHeader,
    TableResize,
    Highlight.configure({ multicolor: false }),
    ColorMark,
    Subscript,
    Superscript,
    Details.configure({
      persist: false,
      HTMLAttributes: { class: 'tm-details' },
      renderToggleButton: ({ element, isOpen }) => {
        element.setAttribute('aria-label', isOpen ? '접기' : '펼치기');
        element.setAttribute('aria-expanded', String(isOpen));
        element.className = 'tm-details-toggle';
      },
    }),
    DetailsSummary,
    DetailsContent,
    Callout,
    CodeBlockMeta,
    LayoutSection,
    LayoutColumn,
    withView(WikiImage.configure({ allowData }), views.image),
    withView(Mention, views.mention),
    withView(DocLink, views.docLink),
    withView(Status, views.status),
    withView(DateNode, views.date),
    withView(TemplateVar, views.templateVar),
    Anchor,
    withView(Toc, views.toc),
    withView(ChildPages, views.childPages),
    withView(Macro, views.macro),
  ];
}
