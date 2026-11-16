import type { JSONContent } from '@tiptap/core';
import {
  anchorName, hexColor, isIsoDate, linkTo, mdToDoc, statusColor, varKind, varName, varOptions, type CalloutKind, type VarKind,
} from './docMarkdown';
import { atlassianTokenImage } from './pasteImages';

/*
 * Confluence 문서 → 위키 문서(편집기 JSON).
 *
 * 세 가지 꼴을 같은 규칙으로 읽는다.
 *   storage    XML 내보내기 · 양식의 본문(Confluence 저장 형식 - ac: · ri: 태그가 섞인 XHTML)
 *   export     HTML 내보내기의 문서 파일(#main-content) - 매크로가 HTML 로 그려진 모습
 *   clipboard  Confluence 화면에서 복사해 붙여 넣은 HTML(보기 · 편집 모드)
 * 위키에 같은 요소가 있으면 그대로(알림 상자 · 상태 · 날짜 · 결정 · 할 일 · 단 · 목차 · 칸 합친 표 …),
 * 없으면 내용을 살려 가까운 꼴로(탭 → 접기), 그것도 안 되는 매크로는 이름 · 값만 남긴 자리(macro)로 둔다.
 * 문서 · 첨부 · 사람을 위키의 것으로 잇는 일은 부르는 쪽(refs)이 한다.
 */

type Block = JSONContent;
type Mk = { type: string; attrs?: Record<string, unknown> };
/** 글 안에서 만난 블록(그림 · 매크로 상자) - 문단을 그 자리에서 끊고 블록으로 꺼낸다 */
type Lift = { lift: Block[] };
type Piece = Block | Lift;

export type ConfluenceMode = 'storage' | 'export' | 'clipboard';
export type WarnKind = 'macro' | 'link' | 'attachment' | 'user' | 'image' | 'content';

export interface PageRef { id?: string; title?: string; spaceKey?: string; blog?: boolean; postingDay?: string }
export interface AttachmentRef { id?: string; filename?: string; page?: PageRef; path?: string }
export interface UserRef { accountId?: string; userKey?: string; username?: string; name?: string }

export interface ConfluenceRefs {
  /** Confluence 문서 → 위키 문서(옮겨 오지 않은 문서면 null) */
  page?(ref: PageRef): { id: string; title: string } | null;
  /** 첨부 파일 → 본문에 넣을 주소(tmfile: · https:). 옮기지 못했으면 null */
  attachment?(ref: AttachmentRef): { src: string; name: string; image: boolean } | null;
  /** 사람 → 팀원(id 가 있으면 언급, 없으면 이름만 글로) */
  user?(ref: UserRef): { id?: string | null; label: string } | null;
  /** 이 문서의 Confluence 제목 - Confluence 가 만든 제목 링크(#제목없이붙인이름-제목)를 풀 때 */
  pageTitle?: string;
  /** Confluence 주소(https://x.atlassian.net/wiki) - 옮기지 않은 문서 · Jira 링크를 그쪽으로 */
  baseUrl?: string;
  /** 옮기며 생긴 일 - 보고서에 모은다 */
  warn?(kind: WarnKind, detail: string): void;
}

/* ── DOM 도우미 ─────────────────────────────────────── */

const ELEMENT = 1;
const TEXT = 3;
const CDATA = 4;
const nm = (n: Node) => n.nodeName.toLowerCase();
const isEl = (n: Node | null | undefined): n is Element => !!n && n.nodeType === ELEMENT;
const kids = (el: Element | Document) => Array.from(el.childNodes ?? []);
const elKids = (el: Element) => Array.from(el.children ?? []);
const kid = (el: Element, name: string) => elKids(el).find((c) => nm(c) === name) ?? null;
const attr = (el: Element, name: string) => el.getAttribute(name);
const hasClass = (el: Element, c: string) => (` ${attr(el, 'class') ?? ''} `).includes(` ${c} `);
const classes = (el: Element) => (attr(el, 'class') ?? '').split(/\s+/).filter(Boolean);
/** 요소 안의 첫 자손 - 이름 또는 조건 */
function find(el: Element, test: (e: Element) => boolean): Element | null {
  for (const c of elKids(el)) {
    if (test(c)) return c;
    const hit = find(c, test);
    if (hit) return hit;
  }
  return null;
}
function findAll(el: Element, test: (e: Element) => boolean, out: Element[] = []): Element[] {
  for (const c of elKids(el)) {
    if (test(c)) out.push(c);
    findAll(c, test, out);
  }
  return out;
}

/** style 속성 → { 이름: 값 } */
function styleOf(el: Element): Record<string, string> {
  const out: Record<string, string> = {};
  (attr(el, 'style') ?? '').split(';').forEach((part) => {
    const at = part.indexOf(':');
    if (at > 0) out[part.slice(0, at).trim().toLowerCase()] = part.slice(at + 1).trim();
  });
  return out;
}

/** 보이는 글 - 줄바꿈(<br>)과 블록 사이는 줄바꿈으로 */
function plain(n: Node): string {
  if (n.nodeType === TEXT || n.nodeType === CDATA) return n.nodeValue ?? '';
  if (!isEl(n)) return '';
  const name = nm(n);
  if (name === 'br') return '\n';
  if (name === 'style' || name === 'script' || name === 'button') return '';
  // 붙여 넣은 코드의 줄 번호는 글이 아니다
  if (n.hasAttribute('data-ds--line-number') || hasClass(n, 'react-syntax-highlighter-line-number') || hasClass(n, 'linenumber')) return '';
  const inner = kids(n).map(plain).join('');
  if (n.hasAttribute('data-ds--code--row')) return inner.endsWith('\n') ? inner : `${inner}\n`;
  return /^(p|div|li|tr|h[1-6]|pre)$/.test(name) ? `${inner}\n` : inner;
}

/** 보이지 않는 글자(폭 없는 공백 · BOM)와 줄 구분 문자 - 소스에 글자로 적으면 줄바꿈으로 읽혀 코드로 만든다 */
const ZERO_WIDTH = new RegExp(`[${String.fromCharCode(0x200b, 0x200c, 0x200d, 0x2060, 0xfeff)}]`, 'g');
const LINE_SEP = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, 'g');
const cleanText = (s: string) => s.replace(ZERO_WIDTH, '').replace(LINE_SEP, '\n');

/* ── 저장 형식 읽기 ──────────────────────────────────── */

const XML_ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const COMMON_ENT: Record<string, number> = {
  nbsp: 160, ensp: 8194, emsp: 8195, thinsp: 8201, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218,
  ldquo: 8220, rdquo: 8221, bdquo: 8222, bull: 8226, hellip: 8230, middot: 183, prime: 8242, laquo: 171, raquo: 187,
  larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, lArr: 8656, rArr: 8658, hArr: 8660, copy: 169, reg: 174,
  trade: 8482, times: 215, divide: 247, deg: 176, plusmn: 177, micro: 181, para: 182, sect: 167, euro: 8364, pound: 163,
  yen: 165, cent: 162, frac12: 189, frac14: 188, frac34: 190, sup2: 178, sup3: 179, ne: 8800, le: 8804, ge: 8805,
  infin: 8734, check: 10003, cross: 10007, star: 9734, iexcl: 161, iquest: 191, shy: 173, zwj: 8205, zwnj: 8204,
};
const entCache = new Map<string, string | null>();
/** 이름 붙은 HTML 문자(&rarr; …) → 글자. 브라우저에서는 모든 이름을 풀 수 있다 */
function entity(name: string): string | null {
  if (name in XML_ENT) return XML_ENT[name];
  if (name in COMMON_ENT) return String.fromCodePoint(COMMON_ENT[name]);
  if (entCache.has(name)) return entCache.get(name) ?? null;
  let out: string | null = null;
  if (typeof document !== 'undefined') {
    const t = document.createElement('textarea');
    t.innerHTML = `&${name};`;
    out = t.value !== `&${name};` ? t.value : null;
  }
  entCache.set(name, out);
  return out;
}

const NS = 'xmlns="http://www.w3.org/1999/xhtml" xmlns:ac="http://atlassian.com/content" '
  + 'xmlns:ri="http://atlassian.com/resource/identifier" xmlns:at="http://atlassian.com/template"';

/**
 * 저장 형식 → DOM. XML 로 읽되(Confluence 와 같다) 이름 붙은 HTML 문자는 숫자로 바꾼다. XML 로 읽지 못하면(깨진 태그)
 * HTML 로 읽는다 - 그때는 스스로 닫는 ac: 태그와 CDATA 를 HTML 이 읽을 수 있게 먼저 바꾼다
 */
export function parseStorage(xhtml: string): Element {
  const src = xhtml
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&([a-zA-Z][a-zA-Z0-9]{1,31});/g, (whole, name: string) => {
      if (name in XML_ENT) return whole;
      const ch = entity(name);
      return ch === null ? `&amp;${name};` : `&#${ch.codePointAt(0)};${ch.length > 2 ? ch.slice(2) : ''}`;
    });
  const xml = new DOMParser().parseFromString(`<root ${NS}>${src}</root>`, 'application/xml');
  const root = xml.documentElement;
  if (root && nm(root) === 'root' && !root.getElementsByTagName('parsererror').length) return root;
  // HTML 로 - CDATA 는 글자로, <ac:x/> 는 <ac:x></ac:x> 로
  const html = src
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    .replace(/<((?:ac|ri|at):[\w-]+|time)(\s[^<>]*?)?\s*\/>/gi, '<$1$2></$1>');
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}</body>`, 'text/html');
  return doc.body;
}

/* ── 이모지 · 색 · 언어 ──────────────────────────────── */

/** Confluence 이모티콘 이름(ac:name) → 이모지 - Atlassian 의 표와 같다 */
const EMOTICON: Record<string, string> = {
  smile: '🙂', sad: '🙁', cheeky: '😛', laugh: '😀', wink: '😉', information: 'ℹ️', tick: '✅', cross: '❌', warning: '⚠️',
  plus: '➕', minus: '➖', question: '❓', 'thumbs-up': '👍', 'thumbs-down': '👎', 'light-on': '💡', 'light-off': '🚫',
  'yellow-star': '⭐', 'red-star': '❤️', 'green-star': '💚', 'blue-star': '💙', heart: '❤️', 'broken-heart': '💔',
};
const SHORTNAME: Record<string, string> = {
  ':warning:': '⚠️', ':check_mark:': '✅', ':white_check_mark:': '✅', ':cross_mark:': '❌', ':x:': '❌', ':info:': 'ℹ️',
  ':information_source:': 'ℹ️', ':question:': '❓', ':plus:': '➕', ':minus:': '➖', ':light_bulb_on:': '💡', ':bulb:': '💡',
  ':star:': '⭐', ':thumbsup:': '👍', ':thumbsdown:': '👎', ':smile:': '😄', ':slight_smile:': '🙂', ':grinning:': '😀',
  ':heart:': '❤️', ':blue_star:': '⭐', ':flag_on:': '🚩', ':flag_off:': '🏳️', ':pushpin:': '📌', ':memo:': '📝',
};

/** 이모지 - 대신 쓰는 글자(fallback)가 진짜 이모지면 그것, 아니면 id(코드 포인트) · 짧은 이름 · 옛 이름 */
function emoji(o: { fallback?: string | null; id?: string | null; short?: string | null; name?: string | null }): string {
  const fb = (o.fallback ?? '').trim();
  if (fb && !/^:[\w+-]+:$/.test(fb)) return fb;
  const id = (o.id ?? '').trim();
  if (/^[0-9a-f]{2,6}(-[0-9a-f]{2,6})*$/i.test(id)) {
    try { return String.fromCodePoint(...id.split('-').map((h) => Number.parseInt(h, 16))); } catch { /* 아래로 */ }
  }
  const short = (o.short ?? (fb || '')).trim();
  if (short && SHORTNAME[short]) return SHORTNAME[short];
  const name = (o.name ?? '').trim();
  if (name && EMOTICON[name]) return EMOTICON[name];
  return short || (name ? `:${name}:` : '');
}

/** 본문의 기본 글자 색은 색으로 받지 않는다 */
const PLAIN_INK = new Set(['#000000', '#172b4d', '#091e42', '#333333', '#292a2e', '#1b2430', '#44546f']);
const inkOf = (raw: unknown) => {
  const c = hexColor(raw);
  return c && !PLAIN_INK.has(c) ? c : null;
};
const paperOf = (raw: unknown) => {
  const c = hexColor(raw);
  return c && c !== '#ffffff' ? c : null;
};

/** DC 의 칸 색 이름 → 색 */
const CELL_COLORS: Record<string, string> = {
  grey: '#f4f5f7', gray: '#f4f5f7', blue: '#deebff', green: '#e3fcef', red: '#ffebe6', yellow: '#fffae6',
  purple: '#eae6ff', teal: '#e6fcff',
};
const cellColor = (raw: string | null | undefined) => {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'none') return null;
  return CELL_COLORS[s] ?? paperOf(s);
};

/** Confluence 코드 언어 → 위키 코드 블록 언어(없으면 null) */
function language(raw: string | null | undefined): string | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s || s === 'none' || s === 'text' || s === 'plain' || s === 'plaintext' || s === 'nohighlight') return null;
  const map: Record<string, string> = {
    js: 'javascript', jscript: 'javascript', ts: 'typescript', py: 'python', python3: 'python', sh: 'bash', shell: 'bash',
    'c#': 'csharp', 'c++': 'cpp', yml: 'yaml', ps: 'powershell', ps1: 'powershell', vb: 'vbnet', erl: 'erlang',
    actionscript3: 'actionscript', 'html/xml': 'xml', jfx: 'javafx', md: 'markdown', golang: 'go', kt: 'kotlin',
  };
  return (map[s] ?? s).replace(/[^\w+#.-]/g, '').slice(0, 30) || null;
}

/** 내보낸 HTML 의 코드 언어(brush) - 모르는 언어를 java 로 적으니, 자바처럼 보일 때만 java 로 둔다 */
function brushLanguage(brush: string | null | undefined, code: string): string | null {
  const b = (brush ?? '').trim().toLowerCase();
  if (b === 'java') return /\b(public|private|protected)\s+(static\s+)?(class|void|final|[A-Z]\w*)\b|\bimport\s+java\.|System\.out\./.test(code) ? 'java' : null;
  return language(b);
}

/** 제목 · 책갈피 → 위키의 주소 조각(제목 링크와 같은 규칙: 작은 글자, 띄어쓰기는 -, 기호는 뺀다) */
export function slugOf(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || '제목';
}

/** 단 나누기 종류 → 너비(%) - Confluence 편집기의 값 */
const LAYOUT_WIDTHS: Record<string, number[]> = {
  single: [100], fixed_width: [100], 'fixed-width': [100], full_width: [100], 'full-width': [100],
  two_equal: [50, 50], two_left_sidebar: [33.33, 66.67], two_right_sidebar: [66.67, 33.33],
  three_equal: [33.33, 33.33, 33.34], three_with_sidebars: [25, 50, 25], three_left_sidebars: [25, 25, 50],
  three_right_sidebars: [50, 25, 25], four_equal: [25, 25, 25, 25], five_equal: [20, 20, 20, 20, 20],
};
const layoutWidths = (type: string | null, n: number) => {
  const w = LAYOUT_WIDTHS[(type ?? '').replace(/-/g, '_')] ?? LAYOUT_WIDTHS[type ?? ''];
  return w && w.length === n ? w : Array.from({ length: n }, () => Math.round((100 / n) * 100) / 100);
};

const PANELS: Record<string, CalloutKind> = {
  // 저장 형식 매크로 이름 - Confluence 화면 이름과 다르다(tip = 성공 초록, note = 경고 노랑, warning = 오류 빨강)
  info: 'note', tip: 'tip', note: 'warning', warning: 'caution',
};
/** Cloud 패널 종류(ADF panelType) → 위키 알림 상자 */
const ADF_PANELS: Record<string, CalloutKind> = {
  info: 'note', note: 'important', success: 'tip', tip: 'tip', warning: 'warning', error: 'caution', custom: 'panel',
};

/* ── 바꾸기 ─────────────────────────────────────────── */

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'table', 'blockquote', 'pre', 'hr', 'div', 'section', 'article',
  'header', 'footer', 'main', 'aside', 'nav', 'figure', 'details', 'dl', 'center', 'body', 'root', 'ac:layout',
  'ac:task-list', 'ac:rich-text-body', 'ac:adf-extension', 'ac:layout-section', 'ac:layout-cell',
]);

class Conv {
  /** Cloud HTML 내보내기의 글자 색(data-colorid → 색) */
  colorIds = new Map<string, string>();
  /** 양식의 안내 글(ac:placeholder)을 기울인 글로 남긴다 - 양식을 옮길 때만 */
  keepPlaceholders = false;
  /** 양식의 칸(at:declarations) - 양식을 옮길 때만. 있으면 at:var 를 양식 칸으로 */
  vars: Map<string, { kind: VarKind; options: string[] | null }> | null = null;

  constructor(readonly refs: ConfluenceRefs, readonly mode: ConfluenceMode) {}

  warn(kind: WarnKind, detail: string) {
    this.refs.warn?.(kind, detail);
  }

  /* ── 블록 ── */

  /** 노드들 → 블록들. 글 조각은 모아 문단으로 */
  blocks(nodes: Node[]): Block[] {
    const out: Block[] = [];
    let run: Node[] = [];
    const flush = () => {
      // 블록 사이의 줄 · 들여쓰기 공백만 있는 조각은 문단이 아니다
      if (run.some((n) => isEl(n) || ((n.nodeValue ?? '').replace(ZERO_WIDTH, '').trim()))) out.push(...this.paragraphs(run, null, false));
      run = [];
    };
    for (const n of nodes) {
      if (isEl(n) && this.isBlock(n)) {
        flush();
        out.push(...this.block(n));
      } else run.push(n);
    }
    flush();
    return out;
  }

  /** 블록 자리에서 읽을 요소인가(아니면 글 조각) */
  isBlock(el: Element): boolean {
    const name = nm(el);
    if (BLOCK_TAGS.has(name)) {
      // 글 사이에 낀 div(맞춤 표시 · 감싸기)는 블록, span 은 글
      return true;
    }
    if (name === 'ac:structured-macro' || name === 'ac:macro') return !INLINE_MACROS.has((attr(el, 'ac:name') ?? '').toLowerCase());
    if (name === 'ac:image') return !/emoticon/.test(attr(el, 'ac:class') ?? '');
    if (name === 'img') return contentImage(el);
    if (name === 'span' && hasClass(el, 'confluence-embedded-file-wrapper')) return !!find(el, (c) => nm(c) === 'img' && contentImage(c));
    if (name === 'div' && attr(el, 'data-node-type') === 'mediaSingle') return true;
    if (name === 'a' && (attr(el, 'data-card-appearance') === 'block' || attr(el, 'data-card-appearance') === 'embed')) return true;
    if ((name === 'a' || name === 'span' || name === 'div') && (el.hasAttribute('data-block-card') || el.hasAttribute('data-embed-card'))) return true;
    return false;
  }

  /** 블록 요소 하나 → 블록들 */
  block(el: Element): Block[] {
    const name = nm(el);
    const style = styleOf(el);

    // 저장 형식
    if (name === 'ac:structured-macro' || name === 'ac:macro') return this.macro(el);
    if (name === 'ac:layout') return this.blocks(kids(el));
    if (name === 'ac:layout-section') {
      const cells = elKids(el).filter((c) => nm(c) === 'ac:layout-cell');
      return this.layout(cells.map((c) => kids(c)), layoutWidths(attr(el, 'ac:type'), cells.length));
    }
    if (name === 'ac:layout-cell' || name === 'ac:rich-text-body' || name === 'root' || name === 'body') return this.blocks(kids(el));
    if (name === 'ac:task-list') return [this.taskList(el)];
    if (name === 'ac:adf-extension') return this.adfExtension(el);
    if (name === 'ac:image') {
      const img = this.acImage(el);
      return img ? [img] : [];
    }

    // HTML
    if (/^h[1-6]$/.test(name)) return this.heading(el, Number(name[1]));
    if (name === 'p') {
      // 편집기가 남긴 빈 자리(<p class="auto-cursor-target"><br/></p>)는 뺀다
      if (hasClass(el, 'auto-cursor-target') && !plain(el).trim()) return [];
      return this.paragraphs(kids(el), this.boxAttrs(el, style));
    }
    if (name === 'ul' || name === 'ol') return this.list(el);
    if (name === 'table') return this.table(el);
    if (name === 'blockquote') return [{ type: 'blockquote', content: this.nonEmpty(this.blocks(kids(el))) }];
    if (name === 'pre') return [this.code(plain(el), this.preLanguage(el), null, false)];
    if (name === 'hr') return [{ type: 'horizontalRule' }];
    if (name === 'img') {
      const img = this.imageNode(el);
      return img ? [img] : [];
    }
    if (name === 'details') {
      const sum = kid(el, 'summary');
      return [this.details(sum ? plain(sum) : '', kids(el).filter((c) => c !== sum))];
    }
    if (name === 'dl') return this.blocks(kids(el).flatMap((c) => (isEl(c) ? kids(c) : [c])));
    if (name === 'figure') return this.blocks(kids(el));
    if (name === 'span' && hasClass(el, 'confluence-embedded-file-wrapper')) {
      const img = find(el, (c) => nm(c) === 'img' && contentImage(c));
      const node = img ? this.imageNode(img) : null;
      return node ? [node] : [];
    }
    if (name === 'a' || name === 'span') return this.card(el);
    return this.div(el, style);
  }

  /** div 와 그 비슷한 것 - Confluence 가 그린 매크로 · 상자를 알아본다 */
  div(el: Element, style: Record<string, string>): Block[] {
    const c = classes(el);
    const has = (x: string) => c.includes(x);
    const data = (x: string) => attr(el, x);

    // 붙여 넣은 Cloud 편집기 · 보기 화면(data-* 가 뜻을 지닌다)
    const panelType = data('data-panel-type');
    if (panelType) {
      const kind = ADF_PANELS[panelType] ?? 'note';
      const body = find(el, (x) => x.hasAttribute('data-panel-content') || hasClass(x, 'ak-editor-panel__content')) ?? el;
      const icon = data('data-panel-icon-text') || emoji({ id: data('data-panel-icon-id'), short: data('data-panel-icon') }) || null;
      const bg = kind === 'panel' ? paperOf(data('data-panel-color')) : null;
      return [this.callout(kind, null, bg, icon, kids(body).filter((x) => !(isEl(x) && hasClass(x, 'ak-editor-panel__icon'))))];
    }
    const nodeType = data('data-node-type');
    if (nodeType === 'expand' || nodeType === 'nestedExpand') {
      const title = data('data-title') ?? '';
      const body = elKids(el).find((x) => nm(x) !== 'button' && !x.querySelector?.('button')) ?? el;
      return [this.details(title, nm(body) === 'div' && body !== el ? kids(body) : kids(el).filter((x) => !(isEl(x) && nm(x) === 'button')))];
    }
    if (nodeType === 'actionList' || el.hasAttribute('data-task-list-local-id')) return [this.taskListHtml(el)];
    if (nodeType === 'decisionList' || el.hasAttribute('data-decision-list-local-id')) return [this.decisionList(el)];
    if (has('code-block') || el.hasAttribute('data-code-lang')) {
      const codeEl = find(el, (x) => nm(x) === 'code') ?? el;
      return [this.code(plain(codeEl), language(attr(codeEl, 'data-code-lang') ?? attr(codeEl, 'data-language')), null, false)];
    }
    if (el.hasAttribute('data-layout-section')) {
      const cols = elKids(el).filter((x) => x.hasAttribute('data-layout-column'));
      const widths = cols.map((x) => Number.parseFloat(attr(x, 'data-column-width') ?? '') || 0);
      return this.layout(cols.map((x) => {
        const inner = find(x, (y) => y.hasAttribute('data-layout-content'));
        return kids(inner ?? x);
      }), widths.every((w) => w > 0) ? widths : layoutWidths(null, cols.length));
    }
    if (nodeType === 'mediaSingle' || nodeType === 'media' || nodeType === 'mediaGroup') return this.media(el);
    if (has('fabric-editor-alignment') || has('fabric-editor-indentation-mark')) {
      const align = data('data-align') === 'center' ? 'center' : data('data-align') === 'end' ? 'right' : null;
      const indent = Number(data('data-level')) || 0;
      return this.applyBox(this.blocks(kids(el)), align, indent);
    }

    // HTML 내보내기
    if (c.some((x) => x.startsWith('confluence-information-macro-'))) {
      const which = c.find((x) => x.startsWith('confluence-information-macro-') && x !== 'confluence-information-macro-icon' && x !== 'confluence-information-macro-body') ?? '';
      const kind: CalloutKind = which.endsWith('-note') ? 'warning' : which.endsWith('-warning') ? 'caution' : which.endsWith('-tip') ? 'tip' : 'note';
      const title = find(el, (x) => nm(x) === 'p' && hasClass(x, 'title'));
      const body = find(el, (x) => hasClass(x, 'confluence-information-macro-body')) ?? el;
      return [this.callout(kind, title ? plain(title).trim() : null, null, null, kids(body))];
    }
    if (has('code') && has('panel')) {
      const pre = find(el, (x) => nm(x) === 'pre');
      const head = find(el, (x) => hasClass(x, 'codeHeader'));
      const params = (pre && (attr(pre, 'data-syntaxhighlighter-params') ?? attr(pre, 'class'))) ?? '';
      const brush = /brush:\s*([^;]+)/.exec(params)?.[1] ?? null;
      const text = pre ? plain(pre) : plain(el);
      return [this.code(text, brushLanguage(brush, text), head ? plain(head).trim() : null, /gutter:\s*true/.test(params))];
    }
    if (has('preformatted') && has('panel')) {
      const pre = find(el, (x) => nm(x) === 'pre');
      return [this.code(pre ? plain(pre) : plain(el), null, null, false)];
    }
    if (has('panel')) {
      const head = find(el, (x) => hasClass(x, 'panelHeader'));
      const body = find(el, (x) => hasClass(x, 'panelContent')) ?? el;
      const bg = paperOf(style['background-color'] ?? styleOf(body)['background-color']);
      return [this.callout(bg === '#eae6ff' ? 'important' : 'panel', head ? plain(head).trim() : null, bg === '#eae6ff' ? null : bg, null, kids(body))];
    }
    if (has('expand-container')) {
      const t = find(el, (x) => hasClass(x, 'expand-control-text'));
      const body = find(el, (x) => hasClass(x, 'expand-content')) ?? el;
      return [this.details(t ? plain(t).trim() : '', kids(body))];
    }
    if (has('toc-macro')) return [{ type: 'toc' }];
    if (has('contentLayout2') || has('contentLayout')) return this.blocks(kids(el));
    if (has('columnLayout')) {
      const cells = elKids(el).filter((x) => hasClass(x, 'cell'));
      const type = attr(el, 'data-layout') ?? c.find((x) => x !== 'columnLayout') ?? null;
      return this.layout(cells.map((x) => kids(find(x, (y) => hasClass(y, 'innerCell')) ?? x)), layoutWidths(type, cells.length));
    }
    if (has('plugin_attachments_container') || has('plugin_attachments_upload_container') || has('hidden')
      || has('refresh-issues-bottom') || has('ak-editor-panel__icon') || has('page-metadata') || has('pageSection')) return [];
    if (has('confluence-jim-macro') && (has('jira-table') || has('jira-issues'))) {
      this.warn('macro', 'Jira 이슈 표');
      return this.blocks(kids(el));
    }
    if (data('data-macro-name') === 'attachments') return [];

    // 맞춤 · 들여쓰기가 있는 div
    const align = alignOf(style['text-align'] ?? attr(el, 'align'));
    const blocks = this.blocks(kids(el));
    return align ? this.applyBox(blocks, align, 0) : blocks;
  }

  /** 문단 · 제목에 맞춤 · 들여쓰기를 붙인다 */
  applyBox(blocks: Block[], align: 'center' | 'right' | null, indent: number): Block[] {
    if (!align && !indent) return blocks;
    return blocks.map((b) => {
      if (b.type !== 'paragraph' && b.type !== 'heading') return b;
      const attrs = { ...(b.attrs ?? {}) };
      if (align && !attrs.textAlign) attrs.textAlign = align;
      if (indent && !attrs.indent) attrs.indent = Math.min(6, indent);
      return { ...b, attrs };
    });
  }

  /** 문단 · 제목의 맞춤 · 들여쓰기 */
  boxAttrs(el: Element, style: Record<string, string>): Record<string, unknown> | null {
    const a: Record<string, unknown> = {};
    const align = alignOf(style['text-align'] ?? attr(el, 'align'));
    if (align) a.textAlign = align;
    const m = /^([\d.]+)px$/.exec(style['margin-left'] ?? '');
    const indent = m ? Math.round(Number(m[1]) / 30) : Number(attr(el, 'data-indent')) || 0;
    if (indent > 0) a.indent = Math.min(6, indent);
    return Object.keys(a).length ? a : null;
  }

  /** 글 조각 → 문단(들). 글 사이의 그림 · 상자는 문단을 끊고 꺼낸다. keep = 비어도 빈 문단을 남긴다(<p></p>) */
  paragraphs(nodes: Node[], attrs: Record<string, unknown> | null, keep = true): Block[] {
    const pieces = this.inline(nodes, []);
    const out: Block[] = [];
    let cur: Block[] = [];
    const flush = (force = false) => {
      const content = tidy(cur);
      if (content.length || force) out.push(attrs ? { type: 'paragraph', attrs, ...(content.length ? { content } : {}) } : (content.length ? { type: 'paragraph', content } : { type: 'paragraph' }));
      cur = [];
    };
    let lifted = false;
    for (const p of pieces) {
      if ('lift' in p) {
        flush();
        out.push(...p.lift);
        lifted = true;
      } else cur.push(p);
    }
    flush(keep && !lifted && !out.length);
    return out;
  }

  heading(el: Element, level: number): Block[] {
    const pieces = this.inline(kids(el), []);
    const lifted: Block[] = [];
    const inl: Block[] = [];
    pieces.forEach((p) => {
      if ('lift' in p) lifted.push(...p.lift);
      else if (p.type === 'hardBreak') inl.push({ type: 'text', text: ' ' });
      else inl.push(p);
    });
    const content = tidy(inl);
    const box = this.boxAttrs(el, styleOf(el));
    return [{ type: 'heading', attrs: { level, ...(box ?? {}) }, ...(content.length ? { content } : {}) }, ...lifted];
  }

  nonEmpty(blocks: Block[]): Block[] {
    return blocks.length ? blocks : [{ type: 'paragraph' }];
  }

  callout(kind: CalloutKind, title: string | null, bg: string | null, icon: string | null, body: Node[]): Block {
    const attrs: Record<string, unknown> = { kind };
    if (title?.trim()) attrs.title = title.trim().replace(/\s+/g, ' ');
    if (bg) attrs.bg = bg;
    if (icon) attrs.icon = icon;
    return { type: 'callout', attrs, content: this.nonEmpty(this.blocks(body)) };
  }

  details(title: string, body: Node[]): Block {
    const t = cleanText(title).replace(/\s+/g, ' ').trim() || '펼치기';
    return {
      type: 'details',
      content: [
        { type: 'detailsSummary', content: [{ type: 'text', text: t }] },
        { type: 'detailsContent', content: this.nonEmpty(this.blocks(body)) },
      ],
    };
  }

  code(text: string, lang: string | null, title: string | null, lineNumbers: boolean): Block {
    const t = cleanText(text).replace(/\r\n?/g, '\n').replace(/\n$/, '');
    const attrs: Record<string, unknown> = { language: lang };
    if (title?.trim()) attrs.title = title.trim();
    if (lineNumbers) attrs.lineNumbers = true;
    return { type: 'codeBlock', attrs, ...(t ? { content: [{ type: 'text', text: t }] } : {}) };
  }

  preLanguage(el: Element): string | null {
    const codeEl = find(el, (x) => nm(x) === 'code');
    const fromClass = (e: Element | null) => /(?:^|\s)(?:language|lang)-([\w+#-]+)/.exec(attr(e as Element, 'class') ?? '')?.[1];
    const raw = attr(el, 'data-language') ?? (codeEl && (attr(codeEl, 'data-language') ?? attr(codeEl, 'data-code-lang')))
      ?? fromClass(el) ?? (codeEl ? fromClass(codeEl) : null);
    const brush = /brush:\s*([^;]+)/.exec(attr(el, 'data-syntaxhighlighter-params') ?? attr(el, 'class') ?? '')?.[1];
    if (brush) return brushLanguage(brush, plain(el));
    return language(raw);
  }

  layout(cols: Node[][], widths: number[]): Block[] {
    const columns = cols.map((nodes) => this.blocks(nodes));
    if (columns.length <= 1) return columns.flat();
    return [{
      type: 'layoutSection',
      content: columns.map((content, i) => ({ type: 'layoutColumn', attrs: { width: widths[i] ?? null }, content: this.nonEmpty(content) })),
    }];
  }

  /* ── 목록 ── */

  list(el: Element): Block[] {
    const name = nm(el);
    // Cloud 편집기는 할 일을 div, 결정을 ol 로 그리지만 판에 따라 바뀐다 - 꼴이 아니라 data-* 로 알아본다
    if (hasClass(el, 'inline-task-list') || attr(el, 'data-node-type') === 'actionList' || el.hasAttribute('data-task-list-local-id')) return [this.taskListHtml(el)];
    if (hasClass(el, 'decision-list') || attr(el, 'data-node-type') === 'decisionList' || el.hasAttribute('data-decision-list-local-id')) return [this.decisionList(el)];
    if (hasClass(el, 'childpages-macro')) {
      // 하위 문서 목록 - 그 순간 그려 둔 목록 대신 늘 지금의 하위 문서를 보이는 블록으로. 겹친 목록의 깊이를 센다
      const depth = (e: Element): number => 1 + Math.max(0, ...elKids(e).flatMap((li) => elKids(li).filter((x) => nm(x) === 'ul').map(depth)));
      return [{ type: 'childPages', attrs: { depth: Math.min(depth(el), 9) } }];
    }
    if (hasClass(el, 'content-by-label')) {
      // 라벨로 모은 문서 - 그 순간의 목록을 링크로 남긴다
      const links = findAll(el, (x) => nm(x) === 'a' && attr(x, 'data-linked-resource-type') === 'page');
      if (!links.length) return [];
      return [{ type: 'bulletList', content: links.map((a) => ({ type: 'listItem', content: [{ type: 'paragraph', content: tidy(this.pieces(this.inline([a], []))) }] })) }];
    }
    const ordered = name === 'ol';
    const items: Block[] = [];
    for (const c of kids(el)) {
      if (isEl(c) && nm(c) === 'li') items.push({ type: 'listItem', content: this.itemContent(kids(c)) });
      else if (isEl(c) && (nm(c) === 'ul' || nm(c) === 'ol')) {
        // ul 바로 안의 ul(잘못된 HTML) - 앞 항목 아래 목록으로
        const nested = this.list(c);
        if (items.length) items[items.length - 1].content!.push(...nested);
        else items.push({ type: 'listItem', content: [{ type: 'paragraph' }, ...nested] });
      } else if (!(c.nodeType === TEXT && !(c.nodeValue ?? '').trim())) {
        const extra = this.blocks([c]);
        if (extra.length) {
          if (items.length) items[items.length - 1].content!.push(...extra);
          else items.push({ type: 'listItem', content: this.itemContent([c]) });
        }
      }
    }
    if (!items.length) return [];
    const start = Number.parseInt(attr(el, 'start') ?? '1', 10);
    return [ordered
      ? { type: 'orderedList', attrs: { start: Number.isFinite(start) && start > 0 ? Math.min(start, 999999999) : 1 }, content: items }
      : { type: 'bulletList', content: items }];
  }

  /** 목록 항목의 내용 - 첫 블록은 문단이어야 한다 */
  itemContent(nodes: Node[]): Block[] {
    const blocks = this.blocks(nodes);
    if (!blocks.length || blocks[0].type !== 'paragraph') blocks.unshift({ type: 'paragraph' });
    return blocks;
  }

  /** 저장 형식 할 일 목록 - ac:task 마다. ac:task-list 바로 안의 ac:task-list 는 앞 할 일 아래로 */
  taskList(el: Element): Block {
    const items: Block[] = [];
    for (const c of elKids(el)) {
      if (nm(c) === 'ac:task') {
        const status = (kid(c, 'ac:task-status')?.textContent ?? '').trim();
        const body = kid(c, 'ac:task-body');
        const content = this.itemContent(body ? kids(body) : []);
        items.push({ type: 'taskItem', attrs: { checked: status === 'complete' }, content });
      } else if (nm(c) === 'ac:task-list' && items.length) {
        items[items.length - 1].content!.push(this.taskList(c));
      }
    }
    return { type: 'taskList', content: items.length ? items : [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph' }] }] };
  }

  /** 내보낸 HTML · 붙여 넣은 HTML 의 할 일 목록 */
  taskListHtml(el: Element): Block {
    const items: Block[] = [];
    for (const c of elKids(el)) {
      const name = nm(c);
      if (name === 'li' || c.hasAttribute('data-task-local-id')) {
        const box = find(c, (x) => nm(x) === 'input' && attr(x, 'type') === 'checkbox');
        const checked = hasClass(c, 'checked') || attr(c, 'data-task-state') === 'DONE' || (!!box && (box.hasAttribute('checked') || attr(box, 'aria-checked') === 'true'));
        const content = find(c, (x) => attr(x, 'data-component') === 'content') ?? c;
        const nodes = kids(content).filter((x) => !(isEl(x) && (nm(x) === 'input' || (nm(x) === 'span' && attr(x, 'contenteditable') === 'false' && !!find(x, (y) => nm(y) === 'input')))));
        items.push({ type: 'taskItem', attrs: { checked }, content: this.itemContent(nodes) });
      } else if ((name === 'ul' || name === 'div') && items.length) {
        items[items.length - 1].content!.push(this.taskListHtml(c));
      }
    }
    return { type: 'taskList', content: items.length ? items : [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph' }] }] };
  }

  decisionList(el: Element): Block {
    const items = elKids(el).filter((c) => nm(c) === 'li' || c.hasAttribute('data-decision-local-id')).map((li) => {
      const content = find(li, (x) => attr(x, 'data-component') === 'content') ?? li;
      return { type: 'decisionItem', content: this.itemContent(kids(content)) };
    });
    return { type: 'decisionList', content: items.length ? items : [{ type: 'decisionItem', content: [{ type: 'paragraph' }] }] };
  }

  /* ── 표 ── */

  table(el: Element): Block[] {
    const rows: Element[] = [];
    const walk = (e: Element) => elKids(e).forEach((c) => {
      const n = nm(c);
      if (n === 'tr') rows.push(c);
      else if (n === 'thead' || n === 'tbody' || n === 'tfoot') walk(c);
    });
    walk(el);
    if (!rows.length) return [];
    // 칸 너비(px) - colgroup 의 col
    const colgroup = elKids(el).find((c) => nm(c) === 'colgroup');
    const widths = (colgroup ? elKids(colgroup).filter((c) => nm(c) === 'col') : []).map((col) => {
      const m = /^([\d.]+)px$/.exec(styleOf(col).width ?? '') ?? /^(\d+)$/.exec(attr(col, 'width') ?? '');
      return m ? Math.round(Number(m[1])) : 0;
    });
    const out: Block[][] = rows.map((tr) => elKids(tr).filter((c) => nm(c) === 'td' || nm(c) === 'th').map((cell) => {
      const header = nm(cell) === 'th';
      const attrs: Record<string, unknown> = {
        colspan: Math.max(1, Math.min(50, Number.parseInt(attr(cell, 'colspan') ?? '1', 10) || 1)),
        rowspan: Math.max(1, Math.min(200, Number.parseInt(attr(cell, 'rowspan') ?? '1', 10) || 1)),
        colwidth: null,
      };
      const bg = cellColor(attr(cell, 'data-highlight-colour') ?? attr(cell, 'data-cell-background')
        ?? classes(cell).find((x) => x.startsWith('highlight-'))?.slice(10) ?? styleOf(cell)['background-color']);
      if (bg) attrs.background = bg;
      const cw = (attr(cell, 'data-colwidth') ?? '').split(',').map((x) => Math.round(Number(x)) || 0);
      if (cw.some((x) => x > 0)) attrs.colwidth = cw;
      const content = this.applyBox(this.nonEmpty(this.blocks(kids(cell))), alignOf(styleOf(cell)['text-align']), 0);
      return { type: header ? 'tableHeader' : 'tableCell', attrs, content };
    })).filter((r) => r.length);
    if (!out.length) return [];
    fixTable(out, widths);
    return [{ type: 'table', content: out.map((cells) => ({ type: 'tableRow', content: cells })) }];
  }

  /* ── 그림 ── */

  /** 저장 형식 그림(ac:image) */
  acImage(el: Element): Block | null {
    const att = kid(el, 'ri:attachment');
    const url = kid(el, 'ri:url');
    const caption = kid(el, 'ac:caption');
    const alt = (caption ? plain(caption) : attr(el, 'ac:alt') ?? attr(el, 'ac:title') ?? '').replace(/\s+/g, ' ').trim() || null;
    const width = Math.round(Number(attr(el, 'ac:width'))) || null;
    const layout = (attr(el, 'ac:layout') ?? '').toLowerCase();
    const alignRaw = (attr(el, 'ac:align') ?? '').toLowerCase();
    const align = layout === 'center' || alignRaw === 'center' ? 'center'
      : /end|right/.test(layout) || alignRaw === 'right' ? 'right' : null;
    // 옛 이모티콘 그림
    const cls = attr(el, 'ac:class') ?? '';
    if (/emoticon/.test(cls)) return null;
    let src: string | null = null;
    let name = '';
    if (att) {
      const filename = attr(att, 'ri:filename') ?? '';
      const pageEl = kid(att, 'ri:page');
      const hit = this.refs.attachment?.({ filename, page: pageEl ? { title: attr(pageEl, 'ri:content-title') ?? undefined, spaceKey: attr(pageEl, 'ri:space-key') ?? undefined } : undefined });
      name = filename;
      if (hit && !hit.image) return { type: 'paragraph', content: [this.fileLink(hit.src, hit.name)] };
      src = hit?.src ?? null;
      if (!src) this.warn('attachment', filename || '이름 없는 그림');
    } else if (url) {
      src = attr(url, 'ri:value');
      name = src ?? '';
    }
    if (!src || !imageOk(src)) return src ? { type: 'paragraph', content: [{ type: 'text', text: `🖼 ${name}`, marks: linkTo(src) ? [{ type: 'link', attrs: { href: src } }] : undefined }] } : missingImage(name);
    const attrs: Record<string, unknown> = { src, alt };
    if (width && width > 0 && width < 4000) attrs.width = width;
    if (align) attrs.align = align;
    return { type: 'image', attrs };
  }

  /** HTML 그림(img) - 첨부 그림 · 밖의 그림. 아이콘 · 이모티콘은 null */
  imageNode(el: Element): Block | null {
    if (hasClass(el, 'emoticon') || el.hasAttribute('data-emoticon-name') || el.hasAttribute('data-emoji-short-name')) return null;
    const src0 = attr(el, 'data-image-src') ?? attr(el, 'src') ?? '';
    // 붙여 넣은 글 안에 실린 그림(data:)은 편집기가 파일로 올린다. 작은 것은 아이콘 · 빈 자리다
    const inline = this.mode === 'clipboard' && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(src0) && src0.length > 400;
    if (!src0 || /\/images\/icons\/|\/s\/[^/]+\/_\/images\//.test(src0) || (/^data:/.test(src0) && !inline)) return null;
    const id = attr(el, 'data-linked-resource-id') ?? undefined;
    // 웹 주소가 아닌 그림(Word 내보내기의 조각 이름 · 내보낸 첨부 경로)도 첨부로 찾는다
    const isAttachment = attr(el, 'data-linked-resource-type') === 'attachment' || /^attachments\//.test(src0) || hasClass(el, 'confluence-embedded-image')
      || (this.mode === 'export' && !/^(https?:|data:|tmfile:|blob:|\/)/i.test(src0));
    let src: string | null = null;
    const filename = attr(el, 'data-linked-resource-default-alias') ?? decodeURIComponent(src0.split('/').pop()?.split('?')[0] ?? '');
    if (isAttachment && !hasClass(el, 'confluence-external-resource')) {
      const hit = this.refs.attachment?.({ id, filename, path: src0.split('?')[0], page: attr(el, 'data-linked-resource-container-id') ? { id: attr(el, 'data-linked-resource-container-id') ?? undefined } : undefined });
      if (hit && !hit.image) return { type: 'paragraph', content: [this.fileLink(hit.src, hit.name)] };
      src = hit?.src ?? null;
      if (!src) {
        this.warn('attachment', filename || '그림');
        return missingImage(filename);
      }
    } else {
      src = src0;
      // Confluence 안의 그림 주소는 로그인해야 보인다 - 옮기지 못한 그림으로 남긴다.
      // 붙여 넣은 Cloud 보기 화면의 그림은 열쇠(token)를 실은 주소라 편집기가 받아 올려 본다(못 받으면 그때 옮기지 못한 그림으로)
      const tokened = this.mode === 'clipboard' && atlassianTokenImage(src);
      if (!tokened && /\/wiki\/download\/|\/download\/(attachments|thumbnails)\/|api\.media\.atlassian\.com|^blob:|\/rest\/|^\/confluence\//.test(src)) {
        this.warn('image', filename || src);
        return missingImage(filename || '그림');
      }
    }
    if (!imageOk(src)) return missingImage(filename);
    const attrs: Record<string, unknown> = { src, alt: (attr(el, 'alt') ?? '').trim() || null };
    if (attrs.alt === filename) attrs.alt = null;
    const width = Number.parseInt(attr(el, 'width') ?? '', 10);
    const wrap = el.parentElement;
    const manual = !!wrap && hasClass(wrap, 'confluence-embedded-manual-size');
    if (width > 0 && width < 4000 && (manual || this.mode !== 'export')) attrs.width = width;
    const cls = `${attr(el, 'class') ?? ''} ${wrap ? attr(wrap, 'class') ?? '' : ''}`;
    if (/image-center/.test(cls)) attrs.align = 'center';
    else if (/image-(?:wrap-)?right|image-right/.test(cls)) attrs.align = 'right';
    return { type: 'image', attrs };
  }

  /** 붙여 넣은 Cloud 그림(media) - 주소가 없어 옮기지 못한다 */
  media(el: Element): Block[] {
    const img = find(el, (x) => nm(x) === 'img');
    if (img) {
      const node = this.imageNode(img);
      if (node) return [node];
    }
    const name = attr(find(el, (x) => x.hasAttribute('data-alt') || x.hasAttribute('data-file-name')) ?? el, 'data-file-name') ?? attr(el, 'data-alt') ?? '그림';
    this.warn('image', name);
    return [missingImage(name)];
  }

  fileLink(src: string, name: string): Block {
    return { type: 'text', text: `📎 ${name}`, marks: [{ type: 'link', attrs: { href: src } }] };
  }

  /** 블록 카드(스마트 링크 · 퍼 온 화면) → 링크 한 줄 */
  card(el: Element): Block[] {
    const url = attr(el, 'data-card-url') ?? attr(el, 'href') ?? attr(find(el, (x) => nm(x) === 'a') ?? el, 'href') ?? '';
    const to = linkTo(url);
    if (!to) return this.blocks(kids(el));
    const text = plain(el).trim() || url;
    return [{ type: 'paragraph', content: [{ type: 'text', text, marks: [{ type: 'link', attrs: { href: to.href } }] }] }];
  }

  /* ── 매크로(저장 형식) ── */

  params(el: Element): { text: Record<string, string>; el: Record<string, Element> } {
    const text: Record<string, string> = {};
    const els: Record<string, Element> = {};
    elKids(el).forEach((c) => {
      if (nm(c) === 'ac:parameter') {
        const k = attr(c, 'ac:name') ?? '';
        text[k] = (c.textContent ?? '').trim();
        els[k] = c;
      } else if (nm(c) === 'ac:default-parameter') {
        text[''] = (c.textContent ?? '').trim();
        els[''] = c;
      }
    });
    return { text, el: els };
  }

  macro(el: Element): Block[] {
    const name = (attr(el, 'ac:name') ?? '').toLowerCase();
    const { text: p, el: pe } = this.params(el);
    const rich = kid(el, 'ac:rich-text-body');
    const plainBody = kid(el, 'ac:plain-text-body');
    const body = () => (rich ? kids(rich) : []);

    switch (name) {
      case 'info': case 'tip': case 'note': case 'warning':
        return [this.callout(PANELS[name], p.title || null, null, p.icon === 'false' ? 'none' : null, body())];
      case 'panel': {
        const icon = p.panelIconText || emoji({ id: p.panelIconId, short: p.panelIcon }) || null;
        const bg = paperOf(p.bgColor);
        return [this.callout('panel', p.title || null, bg, icon, body())];
      }
      case 'code': case 'noformat': {
        const text = plainBody ? plainBody.textContent ?? '' : '';
        return [this.code(text, name === 'code' ? language(p.language) : null, p.title || null, p.linenumbers === 'true')];
      }
      case 'expand':
        return [this.details(p.title || '펼치기', body())];
      case 'toc': {
        const lv = (v: string | undefined) => {
          const n = Number.parseInt(v ?? '', 10);
          return n >= 1 && n <= 6 ? n : null;
        };
        return [{ type: 'toc', attrs: { minLevel: lv(p.minLevel), maxLevel: lv(p.maxLevel) } }];
      }
      case 'children': case 'pagetree': {
        const all = p.all === 'true' || p.allChildren === 'true' || name === 'pagetree';
        const depth = all ? 0 : Math.min(9, Math.max(1, Number.parseInt(p.depth ?? '1', 10) || 1));
        return [{ type: 'childPages', attrs: { depth } }];
      }
      case 'excerpt': case 'details': case 'section-macro': case 'table-filter': case 'table-chart': case 'table-excerpt':
      case 'pivot-table': case 'table-transformer': case 'div': case 'span': case 'center': case 'toc-zone': case 'auimessage':
        return this.blocks(body());
      case 'section': {
        const cols = (rich ? elKids(rich) : []).filter((c) => nm(c) === 'ac:structured-macro' && attr(c, 'ac:name') === 'column');
        if (!cols.length) return this.blocks(body());
        const widths = cols.map((c) => {
          const w = this.params(c).text.width ?? '';
          return /%$/.test(w) ? Number.parseFloat(w) : 0;
        });
        const known = widths.filter((w) => w > 0).reduce((a, b) => a + b, 0);
        const rest = widths.filter((w) => !(w > 0)).length;
        const filled = widths.map((w) => (w > 0 ? w : rest ? Math.max(10, (100 - known) / rest) : 0));
        return this.layout(cols.map((c) => {
          const r = kid(c, 'ac:rich-text-body');
          return r ? kids(r) : [];
        }), filled);
      }
      case 'column':
        return this.blocks(body());
      case 'ui-tabs': case 'localtab-group': case 'deck': case 'tabs-group': case 'horizontal-nav-group': {
        // 탭 - 탭마다 접기 하나(제목 = 탭 이름)
        const tabs = (rich ? elKids(rich) : []).filter((c) => nm(c) === 'ac:structured-macro');
        if (!tabs.length) return this.blocks(body());
        return tabs.map((t) => {
          const tp = this.params(t).text;
          const r = kid(t, 'ac:rich-text-body');
          return this.details(tp.title || tp.name || tp[''] || '탭', r ? kids(r) : []);
        });
      }
      case 'ui-tab': case 'localtab': case 'card': case 'tab-pane': case 'horizontal-nav-item':
        return [this.details(p.title || p.name || p[''] || '탭', body())];
      case 'markdown': {
        const md = plainBody?.textContent ?? '';
        return mdToDoc(md).content ?? [];
      }
      case 'unmigrated-wiki-markup': case 'unmigrated-inline-wiki-markup':
        this.warn('macro', '옮기지 않은 위키 마크업');
        return [this.code(plainBody?.textContent ?? '', null, '옛 위키 마크업', false)];
      case 'mermaid': case 'mermaid-macro': case 'mermaid-cloud': case 'plantuml': case 'plantumlrender': case 'latex': case 'mathblock':
      case 'easy-math-block': case 'math-block':
        return [this.code(plainBody?.textContent ?? p.code ?? '', name.startsWith('mermaid') ? 'mermaid' : name.startsWith('plantuml') ? 'plantuml' : 'latex', null, false)];
      case 'view-file': case 'viewpdf': case 'viewdoc': case 'viewxls': case 'viewppt': case 'view-file-macro': case 'multimedia':
        return [{ type: 'paragraph', content: [this.fileMacro(el)] }];
      case 'widget': case 'iframe': {
        const urlEl = pe.url ?? pe.src;
        const url = urlEl ? attr(kid(urlEl, 'ri:url') ?? urlEl, 'ri:value') ?? p.url ?? p.src : p.url ?? p.src;
        const to = url ? linkTo(url) : null;
        if (to) return [{ type: 'paragraph', content: [{ type: 'text', text: url!, marks: [{ type: 'link', attrs: { href: to.href } }] }] }];
        break;
      }
      case 'drawio': case 'inc-drawio': case 'gliffy': case 'drawio-sketch': {
        const diagram = p.diagramName || p.name || '';
        const png = diagram ? this.refs.attachment?.({ filename: `${diagram}.png` }) : null;
        if (png?.image) return [{ type: 'image', attrs: { src: png.src, alt: diagram } }];
        break;
      }
      case 'include': case 'excerpt-include': {
        const page = this.pageFromParam(pe['']);
        const title = page?.title ?? p[''];
        const hit = page ? this.refs.page?.(page) : null;
        const lead = { type: 'text', text: '이 자리에 넣어 보여 주던 문서: ' };
        if (hit) return [{ type: 'paragraph', content: [lead, { type: 'docLink', attrs: { id: hit.id, title: hit.title } }] }];
        this.warn('link', title || name);
        return [{ type: 'paragraph', content: [lead, { type: 'text', text: title || '(알 수 없는 문서)' }] }];
      }
      case 'attachments': case 'loremipsum': case 'livesearch': case 'create-from-template': case 'pagetreesearch':
        if (name !== 'attachments' && name !== 'loremipsum') this.warn('macro', name);
        return name === 'attachments' || name === 'loremipsum' ? [] : [this.placeholder(name, p)];
      case 'status': case 'anchor': case 'jira': case 'jiraissues': case 'emoticon':
        // 글 안의 매크로가 블록 자리에 혼자 있다 - 문단 하나로
        return this.paragraphs([el], null);
      default:
        break;
    }
    // 그 밖 - 안에 본문이 있으면 내용을 살리고, 없으면 이름 · 값만 남긴다
    if (rich && body().length) {
      this.warn('macro', name || '이름 없는 매크로');
      return this.blocks(body());
    }
    this.warn('macro', name || '이름 없는 매크로');
    return [this.placeholder(name, p)];
  }

  /** 첨부 파일 보기 매크로(view-file · viewpdf · multimedia …) → 파일 링크 한 조각 */
  fileMacro(el: Element): Block {
    const { text: p, el: pe } = this.params(el);
    const att = pe.name ? kid(pe.name, 'ri:attachment') : null;
    const filename = att ? attr(att, 'ri:filename') ?? '' : p.name ?? '';
    const pageEl = att ? kid(att, 'ri:page') : null;
    const hit = this.refs.attachment?.({ filename, page: pageEl ? { title: attr(pageEl, 'ri:content-title') ?? undefined, spaceKey: attr(pageEl, 'ri:space-key') ?? undefined } : undefined });
    if (!hit) {
      this.warn('attachment', filename || (attr(el, 'ac:name') ?? '첨부 파일'));
      return { type: 'text', text: `📎 ${filename || '첨부 파일'} (옮기지 못함)` };
    }
    return this.fileLink(hit.src, hit.name);
  }

  placeholder(name: string, p: Record<string, string>): Block {
    const params: Record<string, string> = {};
    Object.entries(p).forEach(([k, v]) => {
      if (!v || /^(atlassian-macro-output-type|schema-version|macro-id|local-id)$/i.test(k)) return;
      params[k || 'value'] = v.length > 300 ? `${v.slice(0, 300)}…` : v;
    });
    return { type: 'macro', attrs: { name: name || 'macro', params } };
  }

  pageFromParam(param: Element | undefined): PageRef | null {
    if (!param) return null;
    const page = find(param, (x) => nm(x) === 'ri:page');
    if (page) return { title: attr(page, 'ri:content-title') ?? undefined, spaceKey: attr(page, 'ri:space-key') ?? undefined };
    const t = (param.textContent ?? '').trim();
    if (!t) return null;
    // 옛 꼴 - "KEY:제목"
    const m = /^([A-Z0-9~][\w-]*):(.+)$/.exec(t);
    return m ? { spaceKey: m[1], title: m[2] } : { title: t };
  }

  /** Cloud 의 ADF 확장(보라 메모 상자 · 결정 · 탭 …). 대신 그린 것(adf-fallback)은 같은 내용이라 쓰지 않는다 */
  adfExtension(el: Element): Block[] {
    const node = kid(el, 'ac:adf-node');
    const fallback = kid(el, 'ac:adf-fallback');
    if (!node) return fallback ? this.blocks(kids(fallback)) : [];
    const out = this.adfNode(node);
    if (out) return out;
    if (fallback) return this.blocks(kids(fallback));
    this.warn('macro', `Cloud 확장(${attr(node, 'type') ?? '?'})`);
    return [];
  }

  adfAttr(node: Element, key: string): string | null {
    const a = elKids(node).find((c) => nm(c) === 'ac:adf-attribute' && attr(c, 'key') === key);
    return a ? (a.textContent ?? '').trim() : null;
  }

  adfNode(node: Element): Block[] | null {
    const type = attr(node, 'type') ?? '';
    const content = kid(node, 'ac:adf-content');
    if (type === 'panel') {
      const kind = ADF_PANELS[this.adfAttr(node, 'panel-type') ?? 'info'] ?? 'note';
      const icon = this.adfAttr(node, 'panel-icon-text') || emoji({ id: this.adfAttr(node, 'panel-icon-id'), short: this.adfAttr(node, 'panel-icon') }) || null;
      const bg = kind === 'panel' ? paperOf(this.adfAttr(node, 'panel-color')) : null;
      return [this.callout(kind, null, bg, kind === 'panel' ? icon : null, content ? kids(content) : [])];
    }
    if (type === 'decision-list') {
      const items = elKids(node).filter((c) => nm(c) === 'ac:adf-node' && attr(c, 'type') === 'decision-item').map((it) => {
        const c = kid(it, 'ac:adf-content');
        return { type: 'decisionItem', content: this.itemContent(c ? kids(c) : []) };
      });
      return items.length ? [{ type: 'decisionList', content: items }] : [];
    }
    if (type === 'multi-bodied-extension' || type === 'extension-frame') {
      // 탭 - 이름은 parameters 안의 tabs, 내용은 adf-extension-frame 마다
      const params = elKids(node).find((c) => nm(c) === 'ac:adf-attribute' && attr(c, 'key') === 'parameters');
      const titles = params ? findAll(params, (x) => nm(x) === 'ac:adf-parameter' && attr(x, 'key') === 'title').map((x) => (x.textContent ?? '').trim()) : [];
      const frames = content ? elKids(content).filter((c) => nm(c) === 'ac:adf-extension-frame') : [];
      if (!frames.length) return null;
      return frames.map((f, i) => this.details(titles[i] || `탭 ${i + 1}`, kids(f)));
    }
    if (type === 'expand' || type === 'nested-expand') return [this.details(this.adfAttr(node, 'title') ?? '', content ? kids(content) : [])];
    if (type === 'block-card' || type === 'embed-card') {
      const url = this.adfAttr(node, 'url');
      const to = url ? linkTo(url) : null;
      return to ? [{ type: 'paragraph', content: [{ type: 'text', text: url!, marks: [{ type: 'link', attrs: { href: to.href } }] }] }] : null;
    }
    return null;
  }

  /* ── 글 안 ── */

  /** 글 조각들 → 글 노드(+ 꺼낼 블록) */
  inline(nodes: Node[], marks: Mk[]): Piece[] {
    const out: Piece[] = [];
    for (const n of nodes) out.push(...this.inlineNode(n, marks));
    return out;
  }

  /** 꺼낸 블록은 버리고 글만 */
  pieces(ps: Piece[]): Block[] {
    return ps.filter((p): p is Block => !('lift' in p));
  }

  text(t: string, marks: Mk[]): Block[] {
    const s = cleanText(t);
    if (!s) return [];
    const ms = normMarks(marks);
    return [ms.length ? { type: 'text', text: s, marks: ms } : { type: 'text', text: s }];
  }

  inlineNode(n: Node, marks: Mk[]): Piece[] {
    if (n.nodeType === TEXT || n.nodeType === CDATA) {
      // 보기 화면의 줄 · 들여쓰기 공백은 한 칸으로
      return this.text((n.nodeValue ?? '').replace(/[ \t\r\n]+/g, ' '), marks);
    }
    if (!isEl(n)) return [];
    const el = n;
    const name = nm(el);
    const into = (m: Mk[]) => this.inline(kids(el), m);
    const add = (m: Mk) => into(addMark(marks, m));

    // 글 사이의 파일 카드는 그 자리에 링크로(문단을 끊지 않는다)
    if ((name === 'ac:structured-macro' || name === 'ac:macro') && FILE_MACROS.has((attr(el, 'ac:name') ?? '').toLowerCase())) return this.inlineMacro(el, marks);
    if (this.isBlock(el)) return [{ lift: this.block(el) }];

    switch (name) {
      case 'br': return [{ type: 'hardBreak' }];
      case 'b': case 'strong': return add({ type: 'bold' });
      case 'i': case 'em': case 'cite': case 'dfn': case 'var': return add({ type: 'italic' });
      case 'u': case 'ins': return add({ type: 'underline' });
      case 's': case 'del': case 'strike': return add({ type: 'strike' });
      case 'sub': return into(addMark(marks.filter((m) => m.type !== 'superscript'), { type: 'subscript' }));
      case 'sup': return into(addMark(marks.filter((m) => m.type !== 'subscript'), { type: 'superscript' }));
      case 'code': case 'tt': case 'kbd': case 'samp': return this.text(plain(el).replace(/\n/g, ' '), [...marks, { type: 'code' }]);
      case 'mark': return add({ type: 'highlight' });
      case 'small': case 'big': case 'abbr': case 'acronym': case 'q': case 'label': case 'font': {
        const color = name === 'font' ? inkOf(attr(el, 'color')) : null;
        return color ? add({ type: 'color', attrs: { color, bg: null } }) : into(marks);
      }
      case 'time': return this.date(attr(el, 'datetime'), marks, el);
      case 'a': return this.anchor(el, marks);
      case 'img': {
        const name = attr(el, 'data-emoticon-name') ?? /emoticon-([\w-]+)/.exec(attr(el, 'class') ?? '')?.[1] ?? null;
        const e = emoji({ fallback: attr(el, 'data-emoji-fallback'), id: attr(el, 'data-emoji-id'), short: attr(el, 'data-emoji-shortname') ?? attr(el, 'data-emoji-short-name'), name });
        return e ? this.text(e, marks) : [];
      }
      case 'input': case 'button': case 'style': case 'script': case 'svg': case 'select': case 'textarea': case 'noscript': return [];
      case 'ac:link': return this.acLink(el, marks);
      case 'ac:emoticon':
        return this.text(emoji({ fallback: attr(el, 'ac:emoji-fallback'), id: attr(el, 'ac:emoji-id'), short: attr(el, 'ac:emoji-shortname'), name: attr(el, 'ac:name') }), marks);
      case 'ac:structured-macro': case 'ac:macro': return this.inlineMacro(el, marks);
      case 'ac:placeholder': return this.keepPlaceholders ? this.text(el.textContent ?? '', addMark(marks, { type: 'italic' })) : [];
      case 'ac:image': {
        // 옛 이모티콘 그림(ac:class="emoticon emoticon-smile")
        const m = /emoticon-([\w-]+)/.exec(attr(el, 'ac:class') ?? '');
        return m ? this.text(emoji({ name: m[1] }), marks) : [];
      }
      case 'ac:inline-comment-marker': return into(marks);
      case 'ac:task-body': case 'ac:link-body': case 'ac:rich-text-body': return into(marks);
      case 'ac:plain-text-link-body': return this.text(el.textContent ?? '', marks);
      case 'ac:caption': return [];
      case 'at:var': {
        const vname = varName(attr(el, 'at:name')) || '값';
        if (!this.vars) return this.text(`{${vname}}`, marks);
        const def = this.vars.get(vname);
        return [withMarks({ type: 'templateVar', attrs: { name: vname, kind: def?.kind ?? 'string', options: def?.options ?? null } }, marks)];
      }
      case 'at:declarations': return [];
      case 'ri:page': case 'ri:attachment': case 'ri:user': case 'ri:url': case 'ri:space': return [];
      case 'span': return this.span(el, marks);
      default:
        if (name.startsWith('ac:') || name.startsWith('ri:') || name.startsWith('at:')) return into(marks);
        return into(marks);
    }
  }

  /** span - 상태 · 날짜 · 언급 · 이모지 · 책갈피 · 글자 색 · 코드 */
  span(el: Element, marks: Mk[]): Piece[] {
    const into = (m: Mk[]) => this.inline(kids(el), m);
    const nodeType = attr(el, 'data-node-type');
    if (nodeType === 'status' || hasClass(el, 'status-macro')) return this.status(el, marks);
    if (nodeType === 'date') {
      const ts = Number(attr(el, 'data-timestamp'));
      const d = Number.isFinite(ts) && ts > 0 ? new Date(ts).toISOString().slice(0, 10) : null;
      return this.date(d, marks, el);
    }
    if (el.hasAttribute('data-mention-id')) {
      const label = plain(el).trim().replace(/^@/, '');
      return this.mention({ accountId: attr(el, 'data-mention-id') ?? undefined, name: label }, label, marks);
    }
    if (el.hasAttribute('data-emoji-short-name') || el.hasAttribute('data-emoji-id')) {
      return this.text(emoji({ fallback: attr(el, 'data-emoji-text') || plain(el).trim(), id: attr(el, 'data-emoji-id'), short: attr(el, 'data-emoji-short-name') }), marks);
    }
    if (hasClass(el, 'confluence-anchor-link')) {
      // 겹친 span - 안쪽의 id 가 Confluence 에 적힌 이름
      const inner = find(el, (x) => hasClass(x, 'confluence-anchor-link'));
      const id = attr(inner ?? el, 'id') ?? '';
      const name = slugOf(this.stripPagePrefix(id));
      return id ? [{ type: 'anchor', attrs: { name: anchorName(name) } }] : [];
    }
    if (hasClass(el, 'confluence-jim-macro') || hasClass(el, 'jira-issue')) {
      const a = find(el, (x) => nm(x) === 'a' && hasClass(x, 'jira-issue-key'));
      const key = attr(el, 'data-jira-key') ?? (a ? plain(a).trim() : '');
      const summary = find(el, (x) => hasClass(x, 'summary'));
      const href = a ? attr(a, 'href') : null;
      const to = href ? linkTo(href) : null;
      const label = `${key}${summary ? ` ${plain(summary).trim()}` : ''}`;
      return this.text(label, to ? addMark(marks, { type: 'link', attrs: { href: to.href } }) : marks);
    }
    if (hasClass(el, 'code') && this.mode === 'clipboard') return this.text(plain(el), [...marks, { type: 'code' }]);
    if (hasClass(el, 'placeholder-inline-tasks') || hasClass(el, 'inline-comment-marker') || hasClass(el, 'heading-anchor-wrapper')) {
      return hasClass(el, 'heading-anchor-wrapper') ? [] : into(marks);
    }
    // 글자 색 · 바탕색
    const st = styleOf(el);
    const colorId = attr(el, 'data-colorid');
    let color = colorId ? this.colorIds.get(colorId) ?? null : null;
    color ??= inkOf(attr(el, 'data-text-custom-color') ?? (this.mode === 'clipboard' && !hasClass(el, 'fabric-text-color-mark') ? null : st.color));
    if (!color && this.mode === 'clipboard' && st.color) color = PALETTE_INK.has(hexColor(st.color) ?? '') ? hexColor(st.color) : null;
    const bg = paperOf(attr(el, 'data-background-custom-color') ?? st['background-color'] ?? st.background);
    let m = marks;
    if (color || bg) {
      const prev = marks.find((x) => x.type === 'color')?.attrs;
      m = addMark(marks, { type: 'color', attrs: { color: color ?? prev?.color ?? null, bg: bg ?? prev?.bg ?? null } });
    }
    if (/bold|[6-9]00/.test(st['font-weight'] ?? '') && this.mode !== 'clipboard') m = addMark(m, { type: 'bold' });
    if (st['font-style'] === 'italic' && this.mode !== 'clipboard') m = addMark(m, { type: 'italic' });
    const deco = st['text-decoration'] ?? st['text-decoration-line'] ?? '';
    if (/line-through/.test(deco)) m = addMark(m, { type: 'strike' });
    if (/underline/.test(deco)) m = addMark(m, { type: 'underline' });
    return into(m);
  }

  status(el: Element, marks: Mk[]): Piece[] {
    const text = (attr(el, 'data-text') ?? plain(el)).replace(/\s+/g, ' ').trim();
    let color = attr(el, 'data-color');
    if (!color) {
      const c = classes(el);
      color = c.includes('aui-lozenge-success') ? 'green' : c.includes('aui-lozenge-error') ? 'red'
        : c.includes('aui-lozenge-current') || c.includes('aui-lozenge-moved') ? 'yellow' : c.includes('aui-lozenge-complete') ? 'blue'
          : c.includes('aui-lozenge-progress') ? 'purple' : 'grey';
    }
    return [withMarks({ type: 'status', attrs: { text: text.slice(0, 60), color: statusColor(color) } }, marks)];
  }

  date(raw: string | null | undefined, marks: Mk[], el?: Element): Piece[] {
    const d = (raw ?? '').slice(0, 10);
    if (isIsoDate(d)) return [withMarks({ type: 'date', attrs: { date: d } }, marks)];
    return el ? this.inline(kids(el), marks) : [];
  }

  mention(ref: UserRef, label: string, marks: Mk[]): Piece[] {
    const hit = this.refs.user?.(ref);
    const name = (hit?.label || label || ref.name || '').trim() || '사람';
    if (hit?.id) return [withMarks({ type: 'mention', attrs: { id: hit.id, label: name } }, marks)];
    if (!hit) this.warn('user', name);
    return this.text(`@${name}`, marks);
  }

  /** 저장 형식 링크(ac:link) - 문서 · 첨부 · 사람 · 스페이스 · 책갈피 */
  acLink(el: Element, marks: Mk[]): Piece[] {
    const page = kid(el, 'ri:page');
    const blog = kid(el, 'ri:blog-post');
    const att = kid(el, 'ri:attachment');
    const user = kid(el, 'ri:user');
    const space = kid(el, 'ri:space');
    const url = kid(el, 'ri:url');
    const body = kid(el, 'ac:link-body') ?? kid(el, 'ac:plain-text-link-body');
    const bodyPieces = () => (body ? this.inline(nm(body) === 'ac:plain-text-link-body' ? [doc(el).createTextNode(body.textContent ?? '')] : kids(body), marks) : []);
    let anchor = attr(el, 'ac:anchor');
    if (anchor) {
      try { anchor = decodeURIComponent(anchor); } catch { /* 이미 풀린 글자 */ }
    }

    if (user) {
      const ref: UserRef = { accountId: attr(user, 'ri:account-id') ?? undefined, userKey: attr(user, 'ri:userkey') ?? undefined, username: attr(user, 'ri:username') ?? undefined };
      return this.mention(ref, body ? plain(body).trim().replace(/^@/, '') : '', marks);
    }
    if (page || blog) {
      const r = (page ?? blog)!;
      const ref: PageRef = {
        title: attr(r, 'ri:content-title') ?? undefined, spaceKey: attr(r, 'ri:space-key') ?? undefined,
        blog: !!blog, postingDay: blog ? attr(blog, 'ri:posting-day') ?? undefined : undefined,
      };
      return this.pageLink(ref, body ? plain(body).replace(/\s+/g, ' ').trim() : '', bodyPieces, marks);
    }
    if (att) {
      const filename = attr(att, 'ri:filename') ?? '';
      const pageEl = kid(att, 'ri:page');
      const hit = this.refs.attachment?.({ filename, page: pageEl ? { title: attr(pageEl, 'ri:content-title') ?? undefined, spaceKey: attr(pageEl, 'ri:space-key') ?? undefined } : undefined });
      const label = body ? bodyPieces() : this.text(filename, marks);
      if (!hit) {
        this.warn('attachment', filename);
        return label;
      }
      return this.linkPieces(label.length ? label : this.text(filename, marks), hit.src);
    }
    if (space) {
      const key = attr(space, 'ri:space-key') ?? '';
      const label = body ? bodyPieces() : this.text(key, marks);
      return this.refs.baseUrl ? this.linkPieces(label, `${this.refs.baseUrl}/spaces/${encodeURIComponent(key)}`) : label;
    }
    if (url) {
      const v = attr(url, 'ri:value') ?? '';
      return this.linkPieces(body ? bodyPieces() : this.text(v, marks), v);
    }
    if (anchor) {
      const label = body ? bodyPieces() : this.text(anchor, marks);
      return this.linkPieces(label, `#${slugOf(this.stripPagePrefix(anchor))}`);
    }
    return bodyPieces();
  }

  /** 문서 링크 - 글이 제목과 같으면 문서 링크(지금 제목을 따라간다), 다른 글이면 그 글에 링크를 건다 */
  pageLink(ref: PageRef, label: string, pieces: () => Piece[], marks: Mk[]): Piece[] {
    const hit = this.refs.page?.(ref);
    if (hit) {
      if (!label || label === hit.title || label === ref.title) return [withMarks({ type: 'docLink', attrs: { id: hit.id, title: hit.title } }, marks)];
      return this.linkPieces(pieces(), `/hub/?doc=${encodeURIComponent(hit.id)}`);
    }
    const text = label ? pieces() : this.text(ref.title ?? '문서', marks);
    if (this.refs.baseUrl && ref.title) {
      const key = ref.spaceKey ?? '';
      return this.linkPieces(text, `${this.refs.baseUrl}/display/${encodeURIComponent(key)}/${encodeURIComponent(ref.title).replace(/%20/g, '+')}`);
    }
    this.warn('link', ref.title ?? '문서');
    return text;
  }

  /** HTML 링크(a) */
  anchor(el: Element, marks: Mk[]): Piece[] {
    const href = attr(el, 'href') ?? '';
    const type = attr(el, 'data-linked-resource-type');
    const id = attr(el, 'data-linked-resource-id') ?? undefined;
    const label = () => this.inline(kids(el), marks);
    const text = plain(el).replace(/\s+/g, ' ').trim();

    // 책갈피(<a name>) - 글이 없으면 자리만
    if (!href && (attr(el, 'name') || attr(el, 'id')) && !text) {
      const n = anchorName(slugOf(this.stripPagePrefix(attr(el, 'name') ?? attr(el, 'id') ?? '')));
      return n ? [{ type: 'anchor', attrs: { name: n } }] : [];
    }
    if (el.hasAttribute('data-inline-card') || attr(el, 'data-card-appearance') === 'inline') {
      const url = attr(el, 'data-card-url') ?? href;
      return this.linkPieces(text ? label() : this.text(url, marks), url);
    }
    // 사람
    if (hasClass(el, 'confluence-userlink') || hasClass(el, 'user-mention') || type === 'userinfo') {
      return this.mention({ accountId: attr(el, 'data-account-id') ?? undefined, username: attr(el, 'data-username') ?? undefined, name: text }, text, marks);
    }
    // 첨부
    if (type === 'attachment' || hasClass(el, 'confluence-embedded-file') || /^attachments\//.test(href) || /\/download\/attachments\//.test(href)) {
      const filename = attr(el, 'data-linked-resource-default-alias') ?? decodeURIComponent(href.split('/').pop()?.split('?')[0] ?? '');
      const hit = this.refs.attachment?.({ id, filename, path: /^attachments\//.test(href) ? href.split('?')[0] : undefined, page: attr(el, 'data-linked-resource-container-id') ? { id: attr(el, 'data-linked-resource-container-id') ?? undefined } : undefined });
      const lbl = hasClass(el, 'confluence-embedded-file') || !text ? this.text(`📎 ${filename}`, marks) : label();
      if (!hit) {
        this.warn('attachment', filename);
        return this.pieces(lbl);
      }
      return this.linkPieces(lbl, hit.src);
    }
    // 문서
    const pageId = type === 'page' || type === 'blogpost' ? id
      : /^(?:[^/?#]*_)?(\d+)\.html(?:[#?].*)?$/.exec(href)?.[1]
        ?? /\/pages\/(?:viewpage\.action\?pageId=)?(\d+)(?:[/?#]|$)/.exec(href)?.[1]
        ?? /[?&]pageId=(\d+)/.exec(href)?.[1];
    if (pageId && type !== 'folder' && type !== 'whiteboard') {
      const hit = this.refs.page?.({ id: pageId, title: text });
      if (hit) {
        if (!text || text === hit.title) return [withMarks({ type: 'docLink', attrs: { id: hit.id, title: hit.title } }, marks)];
        return this.linkPieces(label(), `/hub/?doc=${encodeURIComponent(hit.id)}`);
      }
    }
    const display = /\/display\/([^/]+)\/([^?#]+)/.exec(href);
    if (display) {
      const hit = this.refs.page?.({ spaceKey: decodeURIComponent(display[1]), title: decodeURIComponent(display[2].replace(/\+/g, ' ')) });
      if (hit) return [withMarks({ type: 'docLink', attrs: { id: hit.id, title: hit.title } }, marks)];
    }
    if (hasClass(el, 'createlink') || hasClass(el, 'unresolved')) return label();
    // 같은 문서 안
    if (href.startsWith('#')) {
      let frag = href.slice(1);
      try { frag = decodeURIComponent(frag); } catch { /* 그대로 */ }
      return this.linkPieces(label(), `#${slugOf(this.stripPagePrefix(frag))}`);
    }
    let to = linkTo(href);
    if (!to && /^\/(wiki|confluence)\//.test(href) && this.refs.baseUrl) to = linkTo(this.refs.baseUrl.replace(/\/(wiki|confluence)$/, '') + href);
    if (!to) return label();
    return this.linkPieces(label(), to.href);
  }

  /** 조각들에 링크를 건다 - 꺼낸 블록은 그대로 */
  linkPieces(ps: Piece[], href: string): Piece[] {
    const to = linkTo(href) ?? (href.startsWith('/hub/') ? { href } : null);
    if (!to) return ps;
    return ps.map((p) => {
      if ('lift' in p || p.type === 'hardBreak') return p;
      const ms = (p.marks ?? []) as Mk[];
      if (ms.some((m) => m.type === 'code') || p.type !== 'text') return p;
      return { ...p, marks: normMarks(addMark(ms, { type: 'link', attrs: { href: to.href } })) };
    });
  }

  /** Confluence 가 제목 앞에 붙인 문서 이름(띄어쓰기 없이)을 뗀다 - #문서이름-제목 → 제목 */
  stripPagePrefix(id: string): string {
    const title = (this.refs.pageTitle ?? '').replace(/\s+/g, '');
    let s = id.replace(/^id-/, '');
    if (title && s.toLowerCase().startsWith(`${title.toLowerCase()}-`)) s = s.slice(title.length + 1);
    return s;
  }

  /** 글 안의 매크로(저장 형식) - 상태 · 책갈피 · Jira · 이모티콘 */
  inlineMacro(el: Element, marks: Mk[]): Piece[] {
    const name = (attr(el, 'ac:name') ?? '').toLowerCase();
    const { text: p } = this.params(el);
    switch (name) {
      case 'status':
        return [withMarks({ type: 'status', attrs: { text: (p.title ?? '').slice(0, 60), color: statusColor(p.colour ?? p.color) } }, marks)];
      case 'anchor': {
        const n = anchorName(slugOf(p[''] ?? p.name ?? ''));
        return n ? [{ type: 'anchor', attrs: { name: n } }] : [];
      }
      case 'jira': case 'jiraissues': {
        if (!p.key) return [{ lift: [this.placeholder(name, p)] }];
        const base = (this.refs.baseUrl ?? '').replace(/\/wiki\/?$/, '');
        return this.text(p.key, base ? addMark(marks, { type: 'link', attrs: { href: `${base}/browse/${encodeURIComponent(p.key)}` } }) : marks);
      }
      case 'emoticon': return this.text(emoji({ name: p.name ?? p[''] }), marks);
      case 'mathinline': case 'easy-math-inline': case 'latex-inline':
        return this.text(p.body ?? kid(el, 'ac:plain-text-body')?.textContent ?? '', [...marks, { type: 'code' }]);
      case 'view-file': case 'viewpdf': case 'viewdoc': case 'viewxls': case 'viewppt': case 'view-file-macro': case 'multimedia': {
        // 글 사이의 파일 카드 - 문단을 끊지 않고 그 자리에 링크로
        const f = this.fileMacro(el);
        return f.marks ? [f] : this.text(f.text ?? '', marks);
      }
      default:
        return [{ lift: this.macro(el) }];
    }
  }
}

/** 글 안에 두는 매크로 - 블록 자리에서도 문단으로 감싼다 */
const INLINE_MACROS = new Set(['status', 'anchor', 'jira', 'jiraissues', 'emoticon', 'mathinline', 'easy-math-inline', 'latex-inline']);
/** 글 사이에 오면 그 자리에 둘 매크로(혼자 있으면 블록) */
const FILE_MACROS = new Set(['view-file', 'viewpdf', 'viewdoc', 'viewxls', 'viewppt', 'view-file-macro', 'multimedia']);

/** 붙여 넣은 글의 색은 Confluence 의 글자 색 표에 있는 것만 받는다(브라우저가 계산해 붙인 색을 거른다) */
const PALETTE_INK = new Set([
  '#172b4d', '#97a0af', '#6554c0', '#00b8d9', '#36b37e', '#ff5630', '#ff991f', '#0747a6', '#403294', '#008da6',
  '#006644', '#bf2600', '#ff8b00', '#4c9aff', '#b3d4ff', '#998dd9', '#79e2f2', '#57d9a3', '#ff8f73', '#ffc400',
  '#c1c7d0', '#e2e2e2', '#8270db', '#1d7afc', '#22a06b', '#e34935', '#d97008', '#0c66e4', '#6e5dc6', '#216e4e', '#ae2e24',
]);

function doc(el: Element): Document {
  return el.ownerDocument ?? document;
}

function alignOf(v: string | null | undefined): 'center' | 'right' | null {
  const s = (v ?? '').trim().toLowerCase();
  return s === 'center' ? 'center' : s === 'right' || s === 'end' ? 'right' : null;
}

/** 본문 그림인가 - 이모티콘 · Confluence 아이콘은 아니다 */
function contentImage(el: Element): boolean {
  if (hasClass(el, 'emoticon') || el.hasAttribute('data-emoticon-name') || el.hasAttribute('data-emoji-short-name') || hasClass(el, 'emoji')) return false;
  // Jira 아이콘 · 첨부 카드의 미리 보기 · PDF 미리 보기 · 사람 사진은 본문 그림이 아니다(로그인해야 보이는 주소)
  if (hasClass(el, 'icon') || el.closest?.('.confluence-jim-macro, .jira-issue, .jira-issues, .office-container, a.confluence-embedded-file, .aui-avatar, .aui-icon, .expand-control')) return false;
  const src = attr(el, 'data-image-src') ?? attr(el, 'src') ?? '';
  return !!src && !/\/images\/icons\/|\/_\/images\/|^data:image\/(svg|gif);/.test(src);
}

function imageOk(src: string): boolean {
  return /^https?:\/\//i.test(src) || /^tmfile:[\w\-./%]+$/.test(src) || /^data:image\/(png|jpe?g|gif|webp);base64,/.test(src);
}

function missingImage(name: string): Block {
  return { type: 'paragraph', content: [{ type: 'text', text: `🖼 ${name || '그림'} (옮기지 못한 그림)`, marks: [{ type: 'italic' }] }] };
}

function addMark(marks: Mk[], m: Mk): Mk[] {
  return [...marks.filter((x) => x.type !== m.type), m];
}

/** 꾸밈 정리 - 코드는 혼자, 빈 색은 버린다 */
function normMarks(marks: Mk[]): Mk[] {
  if (marks.some((m) => m.type === 'code')) return [{ type: 'code' }];
  const seen = new Set<string>();
  return marks.filter((m) => {
    if (seen.has(m.type)) return false;
    seen.add(m.type);
    return m.type !== 'color' || !!(m.attrs?.color || m.attrs?.bg);
  }).map((m) => ({ ...m }));
}

function withMarks(node: Block, marks: Mk[]): Block {
  const ms = normMarks(marks).filter((m) => m.type !== 'code');
  return ms.length ? { ...node, marks: ms } : node;
}

/** 문단 안 정리 - 이웃한 같은 꾸밈의 글을 잇고, 공백을 한 칸으로, 줄 머리 · 끝의 공백과 줄바꿈을 뗀다 */
function tidy(nodes: Block[]): Block[] {
  const out: Block[] = [];
  const same = (a: Block, b: Block) => JSON.stringify(a.marks ?? []) === JSON.stringify(b.marks ?? []);
  for (const n of nodes) {
    if (n.type === 'text') {
      if (!n.text) continue;
      const last = out[out.length - 1];
      if (last?.type === 'text' && same(last, n)) {
        last.text = (last.text ?? '') + n.text;
        continue;
      }
      out.push({ ...n });
    } else out.push(n);
  }
  // 공백 겹침 · 줄바꿈 옆 공백
  for (let i = 0; i < out.length; i += 1) {
    const n = out[i];
    if (n.type !== 'text') continue;
    const code = (n.marks ?? []).some((m) => m.type === 'code');
    if (!code) n.text = (n.text ?? '').replace(/ {2,}/g, ' ');
    const prev = out[i - 1];
    if (!code && (!prev || prev.type === 'hardBreak' || (prev.type === 'text' && /[ \u00a0]$/.test(prev.text ?? '')))) n.text = (n.text ?? '').replace(/^ +/, '');
    const next = out[i + 1];
    if (!code && (!next || next.type === 'hardBreak')) n.text = (n.text ?? '').replace(/[ \u00a0]+$/, '');
  }
  const kept = out.filter((n) => n.type !== 'text' || n.text);
  // 앞뒤의 줄바꿈 · 겹친 줄바꿈
  while (kept.length && kept[0].type === 'hardBreak') kept.shift();
  while (kept.length && kept[kept.length - 1].type === 'hardBreak') kept.pop();
  // 빈 칸 하나뿐인 문단(&nbsp;)은 빈 문단
  if (kept.length === 1 && kept[0].type === 'text' && !(kept[0].text ?? '').replace(/[\s\u00a0]/g, '')) return [];
  // 앞쪽 NBSP 는 공백 자리 표시 - 뗀다
  if (kept[0]?.type === 'text' && !(kept[0].marks ?? []).some((m) => m.type === 'code')) {
    kept[0].text = (kept[0].text ?? '').replace(/^[\s\u00a0]+/, '');
    if (!kept[0].text) kept.shift();
  }
  return kept;
}

/**
 * 표 다듬기 - 합친 칸까지 따져 줄마다 칸 수를 맞추고(모자라면 빈 칸), 칸 너비(colgroup)를 칸에 붙인다.
 * 편집기는 칸 수가 어긋난 표를 고쳐 쓰므로 미리 맞춰 둔다
 */
function fixTable(rows: Block[][], widths: number[]) {
  const taken: boolean[][] = [];
  const place: { cell: Block; col: number }[][] = rows.map(() => []);
  let cols = 0;
  rows.forEach((r, ri) => {
    let ci = 0;
    r.forEach((cell) => {
      while (taken[ri]?.[ci]) ci += 1;
      const cs = Number(cell.attrs?.colspan) || 1;
      const rs = Math.min(Number(cell.attrs?.rowspan) || 1, rows.length - ri);
      if (rs !== (Number(cell.attrs?.rowspan) || 1)) cell.attrs = { ...cell.attrs, rowspan: rs };
      for (let y = 0; y < rs; y += 1) for (let x = 0; x < cs; x += 1) (taken[ri + y] ??= [])[ci + x] = true;
      place[ri].push({ cell, col: ci });
      ci += cs;
      cols = Math.max(cols, ci);
    });
  });
  rows.forEach((r, ri) => {
    const filled = taken[ri] ?? [];
    for (let x = 0; x < cols; x += 1) {
      if (!filled[x]) {
        const cell: Block = { type: r[0]?.type === 'tableHeader' && ri === 0 ? 'tableHeader' : 'tableCell', attrs: { colspan: 1, rowspan: 1, colwidth: null }, content: [{ type: 'paragraph' }] };
        r.push(cell);
        place[ri].push({ cell, col: x });
        filled[x] = true;
      }
    }
  });
  if (widths.some((w) => w > 0)) {
    place.forEach((row) => row.forEach(({ cell, col }) => {
      const cs = Number(cell.attrs?.colspan) || 1;
      const ws = Array.from({ length: cs }, (_, k) => widths[col + k] ?? 0);
      if (ws.some((w) => w > 0) && !(Array.isArray(cell.attrs?.colwidth) && (cell.attrs?.colwidth as number[]).some((w) => w > 0))) {
        cell.attrs = { ...cell.attrs, colwidth: ws };
      }
    }));
  }
}

/** 양식의 칸 선언 - <at:declarations><at:string at:name> · <at:textarea> · <at:list><at:option at:value></at:list> */
function templateDecls(root: Element): Map<string, { kind: VarKind; options: string[] | null }> {
  const out = new Map<string, { kind: VarKind; options: string[] | null }>();
  for (const d of findAll(root, (e) => nm(e) === 'at:declarations')) {
    for (const v of elKids(d)) {
      const name = varName(attr(v, 'at:name'));
      if (!name || out.has(name)) continue;
      const kind = varKind(nm(v).replace(/^at:/, ''));
      const options = kind === 'list' ? varOptions(elKids(v).filter((o) => nm(o) === 'at:option').map((o) => attr(o, 'at:value') ?? '')) : null;
      out.set(name, { kind, options });
    }
  }
  return out;
}

/* ── 밖에서 부르는 것 ─────────────────────────────────── */

/** 저장 형식(XML 내보내기 · 양식) → 문서. template 이면 양식의 안내 글(ac:placeholder)을 기울인 글로 남긴다 */
export function storageToDoc(xhtml: string, refs: ConfluenceRefs = {}, template = false): JSONContent {
  const root = parseStorage(xhtml);
  const c = new Conv(refs, 'storage');
  c.keepPlaceholders = template;
  if (template) c.vars = templateDecls(root);
  return finish(c.blocks(kids(root)));
}

/** 내보낸 HTML 의 본문(#main-content) · 붙여 넣은 HTML → 문서 */
export function htmlToDoc(root: Element, refs: ConfluenceRefs = {}, mode: 'export' | 'clipboard' = 'export'): JSONContent {
  const c = new Conv(refs, mode);
  // Cloud 내보내기는 글자 색을 <style>[data-colorid=…]{color:…}</style> 로 적는다
  findAll(root, (e) => nm(e) === 'style').forEach((s) => {
    for (const m of (s.textContent ?? '').matchAll(/\[data-colorid=["']?([\w-]+)["']?\]\s*\{\s*color\s*:\s*([^;}]+)/g)) {
      if (!/data-color-mode=dark/.test(m[0])) {
        const ink = inkOf(m[2]);
        if (ink && !c.colorIds.has(m[1])) c.colorIds.set(m[1], ink);
      }
    }
  });
  return finish(c.blocks(kids(root)));
}

/** 붙여 넣은 HTML 이 Confluence 에서 온 것인가 */
export function isConfluenceHtml(html: string): boolean {
  return /data-panel-type=|data-node-type="(?:status|date|decisionList|expand|actionList|mediaSingle)"|data-layout-section|data-task-local-id|data-decision-local-id|data-mention-id=|fabric-(?:text|background)-color-mark|confluence-information-macro|class="[^"]*(?:status-macro|confluence-embedded|expand-container|inline-task-list|contentLayout2)|<ac:(?:structured-macro|link|layout|task-list|image)\b/.test(html);
}

/** 맨 위 블록 정리 - 빈 문서는 빈 문단 하나 */
function finish(blocks: Block[]): JSONContent {
  const content = blocks.filter(Boolean);
  // 문서 끝의 빈 문단은 쓸 때 사라지므로 뗀다
  while (content.length > 1 && content[content.length - 1].type === 'paragraph' && !(content[content.length - 1].content ?? []).length && !content[content.length - 1].attrs) content.pop();
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}
