import { Node, mergeAttributes, type Extensions, type NodeViewRenderer } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableCell, TableHeader, TableKit } from '@tiptap/extension-table';
import { Highlight } from '@tiptap/extension-highlight';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { CALLOUTS, imageSrcOk, linkTo, type CalloutKind } from './docMarkdown';

/*
 * 위키 편집기의 문서 꼴 - 어떤 블록 · 글 꾸밈이 있는지.
 * 화면 부품(React)이 없는 정의만 둔다. 편집기(DocEditor)는 여기에 그림 · 언급 · 문서 링크의 화면과
 * 슬래시 메뉴 같은 편집 도구를 덧붙인다. 블록 이름은 docMarkdown.ts 가 읽고 쓰는 이름과 같다.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /** 고른 블록을 알림 상자로 감싼다. 이미 알림 상자 안이면 종류만 바꾼다 */
      setCallout: (kind: CalloutKind) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

/** 제목 - 문서 이름이 h2 라 본문의 제목 1 은 h3 부터 쓴다. 붙여 넣은 h1~h6 은 1~4 로 받는다 */
const WikiHeading = Heading.extend({
  parseHTML() {
    return [
      ...[3, 4, 5, 6].map((tag) => ({
        tag: `h${tag}[data-level]`,
        priority: 60,
        getAttrs: (el: HTMLElement) => {
          const level = Number(el.getAttribute('data-level'));
          return level >= 1 && level <= 4 ? { level } : false;
        },
      })),
      ...[1, 2, 3, 4, 5, 6].map((tag) => ({ tag: `h${tag}`, attrs: { level: Math.min(tag, 4) } })),
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = Number(node.attrs.level) || 1;
    return [`h${Math.min(level + 2, 6)}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-level': level }), 0];
  },
}).configure({ levels: [1, 2, 3, 4] });

/** 알림 상자 - Confluence 의 정보 · 메모 · 성공 · 주의 · 오류 패널, GitHub 의 NOTE · TIP … */
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
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = CALLOUTS.find((c) => c.kind === node.attrs.kind)?.label ?? '정보';
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '', class: 'tm-callout', role: 'note', 'aria-label': label }), 0];
  },

  addCommands() {
    return {
      setCallout: (kind) => ({ state, commands }) => {
        const { $from } = state.selection;
        for (let d = $from.depth; d > 0; d -= 1) {
          if ($from.node(d).type.name === this.name) {
            return commands.command(({ tr }) => {
              tr.setNodeMarkup($from.before(d), undefined, { kind });
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

/** 표 칸에는 문단만 - 마크다운 표는 칸 하나가 한 줄이다(칸 안의 줄바꿈은 <br>) */
const WikiTableCell = TableCell.extend({ content: 'paragraph+' });
const WikiTableHeader = TableHeader.extend({ content: 'paragraph+' });

export interface WikiSchemaOptions {
  /** data:image 그림을 받을지 - 브라우저 저장 모드 */
  allowData?: boolean;
  /** 보기 모드에서 체크박스를 눌렀을 때 - 참이면 눌린 채로 둔다 */
  onReadOnlyChecked?: (node: PMNode, checked: boolean) => boolean;
  /** 그림 · 언급 · 문서 링크를 그리는 화면(편집기가 React 로 준다) */
  views?: Partial<Record<'image' | 'mention' | 'docLink', NodeViewRenderer>>;
}

/** 위키 문서의 블록 · 글 꾸밈 */
export function wikiSchema({ allowData = false, onReadOnlyChecked, views = {} }: WikiSchemaOptions = {}): Extensions {
  const withView = <T extends Node>(ext: T, view: NodeViewRenderer | undefined) =>
    (view ? ext.extend({ addNodeView: () => view }) : ext);
  return [
    StarterKit.configure({
      heading: false,
      underline: false,
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
    TaskList,
    TaskItem.configure({
      nested: true,
      onReadOnlyChecked,
      // 화면(노드 뷰)이 그리는 li 에는 종류 표시가 없다 - 모양(wiki.css)과 보기 모드 체크가 이것으로 찾는다
      HTMLAttributes: { 'data-type': 'taskItem' },
      a11y: { checkboxLabel: (node, checked) => `할 일${checked ? '(끝냄)' : ''}: ${node.textContent || '빈 할 일'}` },
    }),
    TableKit.configure({ table: { resizable: false, renderWrapper: true }, tableCell: false, tableHeader: false }),
    WikiTableCell,
    WikiTableHeader,
    Highlight.configure({ multicolor: false }),
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
    withView(WikiImage.configure({ allowData }), views.image),
    withView(Mention, views.mention),
    withView(DocLink, views.docLink),
  ];
}
