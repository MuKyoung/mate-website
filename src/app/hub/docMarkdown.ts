import type { JSONContent } from '@tiptap/core';

/**
 * 팀 위키 본문 - 마크다운 ↔ 편집기 문서(ProseMirror JSON).
 *
 * 본문은 예전처럼 마크다운 글자로 저장한다(검색 · 작업 번호 바꿔 적기 · 내보내기가 글자를 그대로 쓴다).
 * 편집기는 열 때 이 글을 문서 모양으로 읽고, 고칠 때마다 다시 글로 적는다.
 * 외부 마크다운 라이브러리를 쓰지 않는다 - 문법을 여기서 정하고, 적은 것을 그대로 다시 읽는지
 * (왕복해도 같은지) 이 파일 하나로 맞춘다. HTML 은 아래에 적은 몇 꼴만 알아보고 나머지는 글자로 둔다.
 *
 * 블록
 *   # ~ ######              제목(편집기의 제목 1~6)
 *   문단                     줄바꿈 한 번은 문단 안의 줄바꿈. 빈 줄이 문단을 나눈다.
 *                            줄바꿈 없는 공백(U+00A0) 한 글자뿐인 줄 = 빈 줄 · 빈 문단(편집기에서 Enter 로 띄운 자리)
 *   - * +  /  1. 1)          목록. 들여쓰기로 겹친다. - [ ] / - [x] 는 할 일, - [d] 는 결정
 *   > 글                     강조 패널(인용)
 *   > [!NOTE] 제목            알림 상자 - NOTE 정보 · TIP 팁 · IMPORTANT 중요 · WARNING 주의 · CAUTION 위험 · PANEL 패널.
 *                            ] 뒤의 글은 상자 제목. [!PANEL bg=#e3fcef icon=😀] 처럼 바탕색 · 아이콘을 붙인다(icon=none 은 아이콘 없음)
 *   ```언어 title="이름" linenumbers=true   코드 블록 - 제목 · 줄 번호는 없어도 된다
 *   ---                      구분선
 *   | 표 |                   첫 줄이 머리, 둘째 줄이 | --- |. 칸 안의 줄바꿈은 <br>
 *   <table> <tr> <td>        | 표로 적을 수 없는 표 - 칸 합치기 · 머리 칸 · 칸 색 · 칸 너비 · 칸 안의 목록 같은 블록.
 *                            태그는 한 줄에 하나. 칸 안이 문단 하나면 <td>글</td>, 블록이면 빈 줄을 두고 마크다운으로 적는다
 *   <details> <summary>      접기(토글)
 *   ![설명](주소)             그림 - 한 줄을 혼자 차지할 때만. 너비 · 자리가 있으면 <img src alt width align>
 *   <div align="center" data-indent="1">   가운데 · 오른쪽 맞춤과 들여쓰기(문단 · 제목). 안쪽은 빈 줄을 두고 마크다운
 *   <div data-layout="columns"> 안에 <div data-column="50">   단 나누기(너비는 %)
 *   [TOC]  [CHILDREN]        목차 · 하위 문서 목록. [TOC minLevel=1 maxLevel=3] · [CHILDREN depth=0](0 = 모든 깊이)
 *   [MACRO 이름 키=값]        이 위키가 그리지 못하는 Confluence 매크로의 자리(가져온 문서)
 *
 * 글 안
 *   **굵게** *기울임*(_기울임_) ~~취소선~~ ==형광펜== `코드` [글](주소) <주소> 맨 주소
 *   <u>밑줄</u> <sub>아래 첨자</sub> <sup>위 첨자</sup>
 *   <span style="color: #rrggbb; background-color: #rrggbb">글자 색 · 바탕색</span>
 *   <span data-status="green">완료</span>   상태 배지(grey · blue · green · yellow · red · purple)
 *   <time datetime="2026-11-16">…</time>   날짜
 *   <var name="이름" data-kind="list" data-options="[…]">이름</var>   양식 칸 - 양식으로 새 문서를 만들 때 값을 묻는다
 *                            (kind: string 한 줄 · textarea 여러 줄 · list 고르기. Confluence 양식의 at:var)
 *   <a id="이름"></a>         책갈피 - 본문 안 링크 #이름 이 가는 곳
 *   [@이름](mention:팀원id)   사람 언급
 *   [제목](doc:문서id)        다른 문서로 가는 링크
 *   tmfile:경로              팀 저장소에 올린 파일(그림 · 첨부) 주소
 *   \ 뒤의 기호는 글자 그대로. MATE-123 은 글자로 두고 화면이 작업 링크로 보여 준다.
 */

export type Block = JSONContent;
type Mk = { type: string; attrs?: Record<string, unknown> };

export const NBSP = ' ';

/* ── 링크 주소 ───────────────────────────────────────── */

/**
 * 링크로 둘 주소 - http(s) · mailto · tel, 이 사이트 안의 경로(/…), 문서 안 목차(#…), 팀 저장소 파일(tmfile:)만.
 * 브라우저와 같은 규칙(URL)으로 읽어 고른다. //host, /\host, 중간에 탭을 끼운 주소처럼
 * 경로로 보이지만 밖으로 나가는 것과 javascript: 같은 스킴은 링크로 만들지 않는다.
 */
export function linkTo(raw: string): { href: string; external: boolean } | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith('#')) return { href: s, external: false };
  if (/^tmfile:[\w\-./%]+$/.test(s) && !s.includes('..')) return { href: s, external: false };
  const here = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
  let url: URL;
  try {
    url = new URL(s, here);
  } catch {
    return null;
  }
  const web = url.protocol === 'http:' || url.protocol === 'https:';
  // http(s) 를 적은 주소는 새 탭에서 연다(대문자 스킴도). 적은 그대로 두어 다시 저장해도 글자가 바뀌지 않게 한다
  if (/^https?:/i.test(s) && web) return { href: s, external: true };
  if (/^(mailto|tel):/i.test(s)) return { href: s, external: false };
  // 경로는 이 사이트 안에 머물 때만. 앞의 / 를 하나로 줄여 //host 로 읽힐 틈을 없앤다
  if (s.startsWith('/') && web && url.origin === here) {
    return { href: `/${url.pathname.replace(/^\/+/, '')}${url.search}${url.hash}`, external: false };
  }
  return null;
}

/** 그림으로 둘 주소 - 웹 주소, 팀 저장소 파일, 이 브라우저 저장 모드의 data:image */
export function imageSrcOk(src: string): boolean {
  return /^https?:\/\//i.test(src) || /^tmfile:[\w\-./%]+$/.test(src) || /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(src);
}

/* ── 알림 상자 ───────────────────────────────────────── */

export type CalloutKind = 'note' | 'tip' | 'important' | 'warning' | 'caution' | 'panel';

export const CALLOUTS: { kind: CalloutKind; label: string; tag: string }[] = [
  { kind: 'note', label: '정보', tag: 'NOTE' },
  { kind: 'tip', label: '팁', tag: 'TIP' },
  { kind: 'important', label: '중요', tag: 'IMPORTANT' },
  { kind: 'warning', label: '주의', tag: 'WARNING' },
  { kind: 'caution', label: '위험', tag: 'CAUTION' },
  { kind: 'panel', label: '패널', tag: 'PANEL' },
];

/** [!…] 표시 → 종류. Confluence · Obsidian 에서 쓰는 이름도 받는다 */
const KIND_OF: Record<string, CalloutKind> = {
  note: 'note', info: 'note', tip: 'tip', success: 'tip', hint: 'tip', important: 'important',
  warning: 'warning', caution: 'caution', danger: 'caution', error: 'caution', panel: 'panel', custom: 'panel',
};

/* ── 색 · 상태 · 날짜 · 책갈피 ───────────────────────── */

const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff', yellow: '#ffff00',
  orange: '#ffa500', purple: '#800080', gray: '#808080', grey: '#808080', navy: '#000080', teal: '#008080',
  maroon: '#800000', olive: '#808000', silver: '#c0c0c0', lime: '#00ff00', aqua: '#00ffff', fuchsia: '#ff00ff',
};

/** 색 값(#rgb · #rrggbb · rgb() · 이름) → #rrggbb. 모르는 값 · 투명은 null */
export function hexColor(raw: unknown): string | null {
  const s = String(raw ?? '').trim().toLowerCase().replace(/\s*!important$/, '');
  if (!s) return null;
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) return `#${m[1].split('').map((c) => c + c).join('')}`;
  m = /^#([0-9a-f]{6})(?:([0-9a-f]{2}))?$/.exec(s);
  if (m) return m[2] === '00' ? null : `#${m[1]}`;
  m = /^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(s);
  if (m) {
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
    return `#${[m[1], m[2], m[3]].map((v) => Math.min(255, Math.round(Number(v))).toString(16).padStart(2, '0')).join('')}`;
  }
  return NAMED_COLORS[s] ?? null;
}

/** 상태 배지 색 - Confluence 상태 매크로의 여섯 색 */
export const STATUS_COLORS = ['grey', 'blue', 'green', 'yellow', 'red', 'purple'] as const;
export type StatusColor = (typeof STATUS_COLORS)[number];

/** 색 이름 → 상태 배지 색(Confluence 의 Grey · Green … · neutral 도 받는다). 모르면 grey */
export function statusColor(raw: unknown): StatusColor {
  const s = String(raw ?? '').trim().toLowerCase();
  const alias: Record<string, StatusColor> = { gray: 'grey', neutral: 'grey', default: 'grey', success: 'green', removed: 'red', error: 'red', inprogress: 'blue', moved: 'yellow', new: 'purple' };
  return (STATUS_COLORS as readonly string[]).includes(s) ? s as StatusColor : alias[s] ?? 'grey';
}

/** 2026-11-16 꼴의 날짜인가 */
export function isIsoDate(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** 책갈피 이름 - 글자 · 숫자 · - _ . : 만, 띄어쓰기는 - */
export function anchorName(raw: unknown): string {
  return String(raw ?? '').trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_.:-]/gu, '').slice(0, 80);
}

/** 들여쓰기 단계 0~6 */
const indentOf6 = (v: unknown) => Math.max(0, Math.min(6, Math.round(Number(v) || 0)));
/** 맞춤 - 왼쪽(기본)은 null */
function alignOf(v: unknown): 'center' | 'right' | null {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'center' ? 'center' : s === 'right' || s === 'end' ? 'right' : null;
}

/* ── HTML 꼴 조각 읽고 쓰기 ── */

export const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** &#숫자; 도 푼다 - 양식 칸은 이름 · 보기의 기호를 이렇게 적는다(numAttr) */
const unescAttr = (s: string) => s.replace(/&quot;/g, '"')
  .replace(/&#(\d{1,7});/g, (m, d: string) => (Number(d) <= 0x10ffff ? String.fromCodePoint(Number(d)) : m))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/**
 * 글자 · 숫자 · 빈칸 · 마침표 · 쉼표 · 붙임표 밖의 기호는 &#숫자; 로 - 속성 안의 _ * [ ` | 같은 기호를
 * 바깥 꾸밈(기울임 · 링크 · 표 칸)이 제 짝으로 잘못 읽지 않게. 사람이 지은 이름이 들어가는 양식 칸 속성에 쓴다
 */
const numAttr = (s: string) => s.replace(/[^\p{L}\p{N} .,-]/gu, (c) => `&#${c.codePointAt(0)};`);

/* ── 양식 칸(Confluence 양식의 at:var) ─────────────────── */

/** 양식 칸의 종류 - 한 줄 글 · 여러 줄 글 · 고르기 */
export type VarKind = 'string' | 'textarea' | 'list';
export interface TemplateVarDef {
  name: string;
  kind: VarKind;
  /** 고르기 칸의 보기 */
  options: string[] | null;
}

export function varKind(raw: unknown): VarKind {
  return raw === 'textarea' || raw === 'list' ? raw : 'string';
}

/** 칸 이름 - 앞뒤 빈칸을 떼고 줄바꿈은 빈칸으로, 60자까지 */
export function varName(raw: unknown): string {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
}

/** 고르기 칸의 보기 - 글 배열(JSON) 또는 배열. 빈 보기는 뺀다 */
export function varOptions(raw: unknown): string[] | null {
  let v: unknown = raw;
  if (typeof raw === 'string') {
    try {
      v = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(v)) return null;
  const list = v.filter((x): x is string => typeof x === 'string').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 50);
  return list.length ? list : null;
}

/** 날짜를 받는 칸인가 - Confluence 회의록 양식의 currentDateLozenge 처럼 이름으로 알아본다 */
export function isDateVar(name: string): boolean {
  return /date|lozenge|날짜|일자/i.test(name);
}

/** 태그 안의 속성들 - 이름은 작은 글자로 */
function tagAttrs(s: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of (s ?? '').matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = unescAttr(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}

/** style 속성 → { 'background-color': … } */
function styleOf(s: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  (s ?? '').split(';').forEach((part) => {
    const at = part.indexOf(':');
    if (at > 0) out[part.slice(0, at).trim().toLowerCase()] = part.slice(at + 1).trim();
  });
  return out;
}

/** [TOC 키=값 …] · [!PANEL bg=…] 의 값들. 따옴표 값은 JSON 글자. 값 없는 낱말은 bare 로 */
function argsOf(s: string | undefined): { bare: string[]; kv: Record<string, string> } {
  const bare: string[] = [];
  const kv: Record<string, string> = {};
  for (const m of (s ?? '').matchAll(/([^\s"\]=]+)(?:=("(?:[^"\\\n]|\\.)*"|[^\s"\]]+))?/g)) {
    if (m[2] === undefined) bare.push(m[1]);
    else if (m[2].startsWith('"')) {
      try { kv[m[1]] = String(JSON.parse(m[2])); } catch { kv[m[1]] = m[2].slice(1, -1); }
    } else kv[m[1]] = m[2];
  }
  return { bare, kv };
}

/** 값 하나 - 기호 없는 낱말은 그대로, 나머지는 따옴표(JSON) */
const argValue = (v: string) => (/^[\p{L}\p{N}_.#:/+@,-]+$/u.test(v) ? v : JSON.stringify(v));
const argKey = (k: string) => k.replace(/[^\w.:-]/g, '-') || 'x';

/* ── 읽기: 블록 ──────────────────────────────────────── */

const BLANK = /^[ \t]*$/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/;
const HR = /^ {0,3}(?:-[ \t]*){3,}$|^ {0,3}(?:\*[ \t]*){3,}$|^ {0,3}(?:_[ \t]*){3,}$/;
/** 코드 블록 여는 줄 - 3 은 언어 · 제목 같은 덧붙임 글(info) 전체 */
const FENCE = /^( {0,3})(`{3,}|~{3,})[ \t]*([^`]*)$/;
const QUOTE = /^ {0,3}>/;
const LIST = /^( *)([-*+]|\d{1,9}[.)])(?:([ \t]+)(.*)|[ \t]*)$/;
const TABLE_ROW = /^ {0,3}\|/;
const TABLE_SEP = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;
const DETAILS_OPEN = /^ {0,3}<details(\s+open)?\s*>\s*$/i;
const DETAILS_CLOSE = /^ {0,3}<\/details\s*>\s*$/i;
const SUMMARY = /^ {0,3}<summary>(.*)<\/summary>\s*$/i;
const IMAGE_LINE = /^ {0,3}!\[((?:\\.|[^\]\\])*)\]\(\s*<?([^\s<>()]+)>?\s*\)\s*$/;
/** 맞춤 · 단 나누기 상자 */
const DIV_OPEN = /^ {0,3}<div((?:\s+[\w:-]+(?:\s*=\s*"[^"]*")?)*)\s*>\s*$/i;
const DIV_CLOSE = /^ {0,3}<\/div\s*>\s*$/i;
/** | 로 적을 수 없는 표 */
const TABLE_OPEN = /^ {0,3}<table(?:\s[^>]*)?>\s*$/i;
const TABLE_CLOSE = /^ {0,3}<\/table\s*>\s*$/i;
const TABLE_PART = /^ {0,3}<\/?(?:tr|td|th|thead|tbody|tfoot|colgroup)\b[^>]*>/i;
/** 너비 · 자리가 있는 그림 */
const IMG_TAG = /^ {0,3}<img\s([^<>]*?)\/?>\s*$/i;
/** 목차 · 하위 문서 · 매크로 자리 */
const MACRO_LINE = /^ {0,3}\[(TOC|CHILDREN|MACRO)((?:[ \t]+[^\s"\]=]+(?:=(?:"(?:[^"\\\n]|\\.)*"|[^\s"\]]+))?)*)[ \t]*\]\s*$/;

const indentOf = (line: string) => /^ */.exec(line)![0].length;

/** 문단을 끊는 줄인가 - 문단의 둘째 줄부터 본다(첫 줄은 무엇이든 글로 받는다) */
function startsBlock(line: string): boolean {
  return HEADING.test(line) || HR.test(line) || FENCE.test(line) || QUOTE.test(line) || LIST.test(line) ||
    TABLE_ROW.test(line) || DETAILS_OPEN.test(line) || DETAILS_CLOSE.test(line) || IMAGE_LINE.test(line) ||
    DIV_OPEN.test(line) || DIV_CLOSE.test(line) || TABLE_OPEN.test(line) || TABLE_CLOSE.test(line) || TABLE_PART.test(line) ||
    IMG_TAG.test(line) || MACRO_LINE.test(line);
}

/**
 * 여는 줄 다음부터 짝이 맞는 닫는 줄까지 - 안쪽의 같은 꼴은 짝을 센다. 코드 블록 안의 줄은 세지 않는다
 * (HTML 예제 코드의 </div> 에서 닫히지 않게). 닫는 줄이 없으면 끝까지
 */
function collect(lines: string[], from: number, open: RegExp, close: RegExp): { inner: string[]; next: number } {
  const inner: string[] = [];
  let depth = 1;
  let fence: string | null = null;
  for (let i = from; i < lines.length; i += 1) {
    const l = lines[i];
    const f = /^ {0,3}(`{3,}|~{3,})/.exec(l);
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^\s*[`~]+\s*$/.test(l)) fence = null;
    } else if (f) {
      fence = f[1];
    } else if (open.test(l)) {
      depth += 1;
    } else if (close.test(l)) {
      depth -= 1;
      if (depth === 0) return { inner, next: i + 1 };
    }
    inner.push(l);
  }
  return { inner, next: lines.length };
}

/** 마크다운 → 편집기 문서 */
export function mdToDoc(md: string): JSONContent {
  const content = parseBlocks(expandTabs(md.replace(/\r\n?/g, '\n').split('\n')));
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

/** 줄 머리의 탭은 들여쓰기(공백 4칸)로 읽는다 - 코드 블록 안의 줄은 글자 그대로 둔다(Makefile 의 탭) */
function expandTabs(lines: string[]): string[] {
  let fence: string | null = null;
  return lines.map((l) => {
    const f = /^\s*(`{3,}|~{3,})/.exec(l);
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^\s*[`~]+\s*$/.test(l)) fence = null;
      return l;
    }
    if (f) fence = f[1];
    return l.replace(/^\t+/, (t) => '    '.repeat(t.length));
  });
}

function parseBlocks(lines: string[]): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (BLANK.test(line)) { i += 1; continue; }

    // 코드 블록 - 같은 기호로 같은 길이 이상인 줄에서 닫는다. 닫지 않았으면 끝까지
    const fence = FENCE.exec(line);
    if (fence) {
      const [, pad, mark, info] = fence;
      const close = new RegExp(`^ {0,3}${mark[0] === '`' ? '`' : '~'}{${mark.length},}[ \\t]*$`);
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !close.test(lines[i])) {
        // 여는 줄만큼 들여 쓴 칸은 덜어 낸다
        buf.push(lines[i].replace(new RegExp(`^ {0,${pad.length}}`), ''));
        i += 1;
      }
      i += 1;
      const text = buf.join('\n');
      // 첫 낱말이 언어(= 가 없을 때), 나머지는 title="…" · linenumbers=true
      const words = info.trim();
      const lang = /^[^\s=]+(?=\s|$)/.exec(words)?.[0] ?? '';
      const { kv } = argsOf(lang ? words.slice(lang.length) : words);
      const attrs: Record<string, unknown> = { language: lang || null };
      if (kv.title?.trim()) attrs.title = kv.title.trim();
      if (kv.linenumbers === 'true') attrs.lineNumbers = true;
      out.push({ type: 'codeBlock', attrs, ...(text ? { content: [{ type: 'text', text }] } : {}) });
      continue;
    }

    const h = HEADING.exec(line);
    if (h) {
      const text = (h[2] ?? '').replace(/[ \t]+#+$/, '');
      const inl = parseInline(text, 'heading');
      out.push({ type: 'heading', attrs: { level: h[1].length }, ...(inl.length ? { content: inl } : {}) });
      i += 1;
      continue;
    }

    if (HR.test(line)) {
      out.push({ type: 'horizontalRule' });
      i += 1;
      continue;
    }

    // 표 - 머리 줄 다음에 구분 줄이 있어야 표로 본다
    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = cellsOf(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) { rows.push(cellsOf(lines[i])); i += 1; }
      const width = head.length;
      const row = (cells: string[], type: string): Block => ({
        type: 'tableRow',
        content: Array.from({ length: width }, (_, n) => ({
          type,
          attrs: { colspan: 1, rowspan: 1, colwidth: null },
          content: [paragraph(parseInline(cells[n] ?? '', 'cell'))],
        })),
      });
      out.push({ type: 'table', content: [row(head, 'tableHeader'), ...rows.map((r) => row(r, 'tableCell'))] });
      continue;
    }

    // | 로 적을 수 없는 표 - 안쪽의 <table> 은 짝을 세어 넘긴다
    if (TABLE_OPEN.test(line)) {
      const { inner, next } = collect(lines, i + 1, TABLE_OPEN, TABLE_CLOSE);
      const t = htmlTable(inner);
      if (t) out.push(t);
      i = next;
      continue;
    }

    // 접기 - 안쪽의 <details> 는 짝을 세어 넘긴다
    if (DETAILS_OPEN.test(line)) {
      i += 1;
      while (i < lines.length && BLANK.test(lines[i])) i += 1;
      let summary = '';
      const s = i < lines.length ? SUMMARY.exec(lines[i]) : null;
      if (s) { summary = s[1]; i += 1; }
      const { inner, next } = collect(lines, i, DETAILS_OPEN, DETAILS_CLOSE);
      i = next;
      const sum = parseInline(summary, 'summary');
      const body = parseBlocks(inner);
      out.push({
        type: 'details',
        content: [
          { type: 'detailsSummary', ...(sum.length ? { content: sum } : {}) },
          { type: 'detailsContent', content: body.length ? body : [{ type: 'paragraph' }] },
        ],
      });
      continue;
    }

    // 맞춤 · 들여쓰기 · 단 나누기 상자
    const div = DIV_OPEN.exec(line);
    if (div) {
      const { inner, next } = collect(lines, i + 1, DIV_OPEN, DIV_CLOSE);
      out.push(...divBlocks(tagAttrs(div[1]), inner));
      i = next;
      continue;
    }

    // 목차 · 하위 문서 · 매크로 자리
    const mac = MACRO_LINE.exec(line);
    if (mac) {
      out.push(macroBlock(mac[1], mac[2]));
      i += 1;
      continue;
    }

    // 너비 · 자리가 있는 그림 - 주소가 그림으로 둘 수 없으면 글로 둔다
    const imgTag = IMG_TAG.exec(line);
    if (imgTag) {
      const node = imageFromAttrs(tagAttrs(imgTag[1]));
      if (node) {
        out.push(node);
        i += 1;
        continue;
      }
    }

    // 인용 · 알림 상자 - 줄마다 > 가 있어야 한다
    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        inner.push(lines[i].replace(/^ {0,3}> ?/, ''));
        i += 1;
      }
      // [!KIND 키=값] 제목 - 제목 · 바탕색 · 아이콘은 없어도 된다(GitHub 의 [!NOTE] 와 같은 꼴)
      const mark = /^\[!([A-Za-z]+)((?:[ \t]+[a-z]+=(?:"(?:[^"\\\n]|\\.)*"|[^\s"\]]+))*)\][ \t]*(.*)$/.exec(inner[0] ?? '');
      const kind = mark ? KIND_OF[mark[1].toLowerCase()] : undefined;
      const attrs: Record<string, unknown> = { kind };
      if (mark && kind) {
        inner.shift();
        const { kv } = argsOf(mark[2]);
        const title = mark[3].trim();
        if (title) attrs.title = title;
        const bg = hexColor(kv.bg);
        if (bg) attrs.bg = bg;
        if (kv.icon?.trim()) attrs.icon = kv.icon.trim();
      }
      const body = parseBlocks(inner);
      const content = body.length ? body : [{ type: 'paragraph' }];
      out.push(kind ? { type: 'callout', attrs, content } : { type: 'blockquote', content });
      continue;
    }

    if (LIST.test(line)) {
      const { nodes, next } = parseList(lines, i);
      out.push(...nodes);
      i = next;
      continue;
    }

    // 문단 - 빈 줄이나 다른 블록이 시작하는 줄까지. 첫 줄은 위 갈래 어디에도 맞지 않았으니 무엇이든 글로 받는다
    const buf: string[] = [line];
    i += 1;
    while (i < lines.length && !BLANK.test(lines[i]) && !startsBlock(lines[i])) {
      buf.push(lines[i]);
      i += 1;
    }
    const img = buf.length === 1 ? IMAGE_LINE.exec(buf[0]) : null;
    if (img && imageSrcOk(img[2])) {
      out.push({ type: 'image', attrs: { src: img[2], alt: unescapeText(img[1]) || null } });
      continue;
    }
    out.push(paragraphFromLines(buf));
  }
  return out;
}

function paragraph(content: Block[]): Block {
  return content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
}

/** 맞춤 · 들여쓰기 상자는 안쪽 문단 · 제목에 붙이고, 단 나누기는 단으로 */
function divBlocks(a: Record<string, string>, inner: string[]): Block[] {
  if ('data-layout' in a) return layoutBlocks(inner);
  const blocks = parseBlocks(inner);
  const align = alignOf(a.align ?? styleOf(a.style)['text-align']);
  const indent = indentOf6(a['data-indent']);
  if (!align && !indent) return blocks;
  return blocks.map((b) => {
    if (b.type !== 'paragraph' && b.type !== 'heading') return b;
    const attrs: Record<string, unknown> = { ...(b.attrs ?? {}) };
    if (align && !attrs.textAlign) attrs.textAlign = align;
    if (indent && !attrs.indent) attrs.indent = indent;
    return { ...b, attrs };
  });
}

/** 단 나누기 - <div data-column="너비%"> 마다 한 단. 단 밖에 적힌 블록은 마지막 단에 넣는다 */
function layoutBlocks(inner: string[]): Block[] {
  const cols: Block[] = [];
  const stray: string[] = [];
  let i = 0;
  while (i < inner.length) {
    const d = DIV_OPEN.exec(inner[i]);
    const a = d ? tagAttrs(d[1]) : null;
    if (a && 'data-column' in a) {
      const { inner: body, next } = collect(inner, i + 1, DIV_OPEN, DIV_CLOSE);
      const blocks = parseBlocks(body);
      const w = Number.parseFloat(a['data-column']);
      cols.push({ type: 'layoutColumn', attrs: { width: Number.isFinite(w) && w > 0 ? Math.round(w * 100) / 100 : null }, content: blocks.length ? blocks : [{ type: 'paragraph' }] });
      i = next;
      continue;
    }
    stray.push(inner[i]);
    i += 1;
  }
  const extra = parseBlocks(stray);
  if (!cols.length) return extra;
  if (extra.length) {
    const last = cols[cols.length - 1];
    last.content = [...(last.content ?? []), ...extra];
  }
  return [{ type: 'layoutSection', content: cols }];
}

/** [TOC] · [CHILDREN] · [MACRO 이름 …] */
function macroBlock(kind: string, rest: string): Block {
  const { bare, kv } = argsOf(rest);
  const level = (v: string | undefined) => {
    const n = Number.parseInt(v ?? '', 10);
    return n >= 1 && n <= 6 ? n : null;
  };
  if (kind === 'TOC') return { type: 'toc', attrs: { minLevel: level(kv.minLevel), maxLevel: level(kv.maxLevel) } };
  if (kind === 'CHILDREN') {
    const d = Number.parseInt(kv.depth ?? '1', 10);
    return { type: 'childPages', attrs: { depth: Number.isFinite(d) && d >= 0 ? Math.min(d, 9) : 1 } };
  }
  return { type: 'macro', attrs: { name: bare[0] ?? 'macro', params: kv } };
}

/** <img src alt width align> → 그림. 그림으로 둘 수 없는 주소면 null */
function imageFromAttrs(a: Record<string, string>): Block | null {
  const src = (a.src ?? '').trim();
  if (!imageSrcOk(src)) return null;
  const attrs: Record<string, unknown> = { src, alt: a.alt?.trim() || null };
  const w = Number.parseInt(a.width ?? '', 10);
  if (w > 0) attrs.width = Math.min(w, 4000);
  const align = a.align === 'left' ? 'left' : alignOf(a.align);
  if (align) attrs.align = align;
  return { type: 'image', attrs };
}

/** <table> 안쪽 줄 → 표. 태그는 줄마다 하나. 칸이 한 줄이면 글, 아니면 빈 줄 사이의 블록 */
function htmlTable(inner: string[]): Block | null {
  const rows: Block[][] = [];
  let widths: number[] = [];
  let row: Block[] | null = null;
  const cellOf = (tag: string, a: Record<string, string>, content: Block[]): Block => {
    const attrs: Record<string, unknown> = {
      colspan: Math.max(1, Math.min(50, Number.parseInt(a.colspan ?? '1', 10) || 1)),
      rowspan: Math.max(1, Math.min(200, Number.parseInt(a.rowspan ?? '1', 10) || 1)),
      colwidth: null,
    };
    const bg = hexColor(styleOf(a.style)['background-color'] ?? a['data-bg'] ?? a.bgcolor);
    if (bg) attrs.background = bg;
    return { type: tag === 'th' ? 'tableHeader' : 'tableCell', attrs, content };
  };
  const add = (cell: Block) => {
    if (!row) { row = []; rows.push(row); }
    row.push(cell);
  };
  let i = 0;
  while (i < inner.length) {
    const l = inner[i].trim();
    let m: RegExpExecArray | null;
    if (!l || /^<\/?(?:thead|tbody|tfoot)\b[^>]*>$/i.test(l)) { i += 1; continue; }
    if ((m = /^<colgroup\b[^>]*>(.*)<\/colgroup>$/i.exec(l))) {
      widths = [...m[1].matchAll(/<col\b([^>]*)>/gi)].map((c) => {
        const a = tagAttrs(c[1]);
        const px = Number.parseFloat(styleOf(a.style).width ?? a.width ?? '');
        return Number.isFinite(px) && px > 0 ? Math.round(px) : 0;
      });
      i += 1;
      continue;
    }
    if (/^<tr\b[^>]*>$/i.test(l)) { row = []; rows.push(row); i += 1; continue; }
    if (/^<\/tr>$/i.test(l)) { row = null; i += 1; continue; }
    if ((m = /^<(td|th)\b([^>]*)>(.*)<\/\1\s*>$/i.exec(l))) {
      add(cellOf(m[1].toLowerCase(), tagAttrs(m[2]), [paragraph(parseInline(m[3].replace(/^[ \t]+|[ \t]+$/g, ''), 'cell'))]));
      i += 1;
      continue;
    }
    if ((m = /^<(td|th)\b([^>]*)>$/i.exec(l))) {
      const tag = m[1].toLowerCase();
      // 칸 안의 표는 짝을 세어 넘기고, 이 칸을 닫는 줄을 찾는다
      const close = new RegExp(`^ {0,3}<\\/${tag}\\s*>\\s*$`, 'i');
      const body: string[] = [];
      let depth = 0;
      let fence: string | null = null;
      let j = i + 1;
      for (; j < inner.length; j += 1) {
        const x = inner[j];
        const f = /^ {0,3}(`{3,}|~{3,})/.exec(x);
        if (fence) {
          if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^\s*[`~]+\s*$/.test(x)) fence = null;
        } else if (f) fence = f[1];
        else if (TABLE_OPEN.test(x)) depth += 1;
        else if (TABLE_CLOSE.test(x)) depth -= 1;
        else if (depth === 0 && close.test(x)) break;
        body.push(x);
      }
      const blocks = parseBlocks(body);
      add(cellOf(tag, tagAttrs(m[2]), blocks.length ? blocks : [{ type: 'paragraph' }]));
      i = j + 1;
      continue;
    }
    i += 1;
  }
  const full = rows.filter((r) => r.length);
  if (!full.length) return null;
  // 칸 너비 - 합친 칸까지 따져 칸마다 몇째 줄(열)인지 찾아 그 열들의 너비를 붙인다
  if (widths.some((w) => w > 0)) {
    const taken: boolean[][] = [];
    full.forEach((r, ri) => {
      let ci = 0;
      r.forEach((cell) => {
        while (taken[ri]?.[ci]) ci += 1;
        const cs = Number(cell.attrs?.colspan) || 1;
        const rs = Number(cell.attrs?.rowspan) || 1;
        for (let y = 0; y < rs; y += 1) for (let x = 0; x < cs; x += 1) (taken[ri + y] ??= [])[ci + x] = true;
        const ws = Array.from({ length: cs }, (_, k) => widths[ci + k] ?? 0);
        if (ws.some((w) => w > 0)) cell.attrs = { ...cell.attrs, colwidth: ws };
        ci += cs;
      });
    });
  }
  return { type: 'table', content: full.map((r) => ({ type: 'tableRow', content: r })) };
}

/** 문단의 줄들 - 줄 사이는 줄바꿈. 줄바꿈 없는 공백 한 글자뿐인 줄은 빈 줄이다 */
function paragraphFromLines(lines: string[]): Block {
  const content: Block[] = [];
  lines.forEach((raw, n) => {
    if (n > 0) content.push({ type: 'hardBreak' });
    // 마크다운의 줄 끝 줄바꿈 표시(공백 둘)는 덜어 낸다 - 여기서는 줄바꿈 한 번이 이미 줄바꿈이다
    const line = raw.replace(/^ +/, '').replace(/ {2,}$/, '');
    if (line === NBSP || line === '&nbsp;') return;
    content.push(...parseInline(line, 'text'));
  });
  // 빈 문단 표시 하나뿐이면 빈 문단
  return paragraph(content);
}

/** 표의 한 줄 → 칸들. \| 는 칸 나눔이 아닌 글자 | 다(코드 조각 안에서도 - GFM 과 같다) */
function cellsOf(row: string): string[] {
  let s = row.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (s[i] === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}

type ListKind = 'bullet' | 'ordered' | 'task' | 'decision';

/** 목록 - 같은 들여쓰기의 항목을 모은다. 항목 안의 더 들여 쓴 줄은 그 항목의 내용(겹친 목록 · 이어지는 문단) */
function parseList(lines: string[], start: number): { nodes: Block[]; next: number } {
  const base = indentOf(lines[start]);
  const nodes: Block[] = [];
  /* fam = 표시 갈래(- * + 또는 . ) ) - 갈래가 바뀌면 새 목록이다(붙어 있는 두 목록을 이렇게 가른다, CommonMark 와 같다) */
  let cur: { kind: ListKind; fam: string; node: Block } | null = null;
  let i = start;

  while (i < lines.length) {
    const m = LIST.exec(lines[i]);
    if (!m || m[1].length !== base) break;
    const marker = m[2];
    const ordered = /\d/.test(marker[0]);
    const gap = m[3] ?? '';
    let text = m[4] ?? '';
    let kind: ListKind = ordered ? 'ordered' : 'bullet';
    let checked = false;
    const box = ordered ? null : /^\[([ xXd])\](?:[ \t]+(.*)|[ \t]*)$/.exec(text);
    if (box) {
      kind = box[1] === 'd' ? 'decision' : 'task';
      checked = box[1] === 'x' || box[1] === 'X';
      text = box[2] ?? '';
    }
    // 표시 바로 뒤의 표시는 글로 읽는다(2026. 10. 28.) - 한 줄 안에서 목록을 겹치지 않는다
    if (LIST.test(text)) text = text.replace(/^(\d{1,9})([.)])/, '$1\\$2').replace(/^([-*+])/, '\\$1');
    // 내용이 시작하는 칸 - 표시 뒤 공백이 다섯 칸 이상이면 한 칸으로 본다
    const contentIndent = base + marker.length + (gap.length >= 1 && gap.length <= 4 ? gap.length : 1);
    const item: string[] = [text];
    i += 1;
    while (i < lines.length) {
      const ln = lines[i];
      if (BLANK.test(ln)) {
        // 빈 줄 뒤에 더 들여 쓴 줄이 오면 이 항목이 이어진다
        let j = i + 1;
        while (j < lines.length && BLANK.test(lines[j])) j += 1;
        if (j < lines.length && indentOf(lines[j]) >= contentIndent) {
          for (; i < j; i += 1) item.push('');
          continue;
        }
        break;
      }
      const ind = indentOf(ln);
      if (ind >= contentIndent) { item.push(ln.slice(contentIndent)); i += 1; continue; }
      // 덜 들여 썼어도 기준보다 깊은 목록 줄은 이 항목 아래의 목록이다
      if (ind > base && LIST.test(ln)) { item.push(ln.slice(ind)); i += 1; continue; }
      // 기준보다 깊은 글 줄은 앞 줄에 이어지는 글
      if (ind > base && !startsBlock(ln.slice(ind))) { item.push(ln.slice(ind)); i += 1; continue; }
      break;
    }
    const content = parseBlocks(item);
    if (!content.length || content[0].type !== 'paragraph') content.unshift({ type: 'paragraph' });
    const node: Block = kind === 'task' ? { type: 'taskItem', attrs: { checked }, content }
      : kind === 'decision' ? { type: 'decisionItem', content }
        : { type: 'listItem', content };
    const fam = ordered ? marker.slice(-1) : marker;
    if (!cur || cur.kind !== kind || cur.fam !== fam) {
      cur = {
        kind,
        fam,
        node: kind === 'task' ? { type: 'taskList', content: [] }
          : kind === 'decision' ? { type: 'decisionList', content: [] }
            : kind === 'ordered' ? { type: 'orderedList', attrs: { start: Math.min(Number.parseInt(marker, 10), 999999999) }, content: [] }
              : { type: 'bulletList', content: [] },
      };
      nodes.push(cur.node);
    }
    cur.node.content!.push(node);
    // 항목 사이의 빈 줄 - 다음 줄이 같은 들여쓰기의 항목이면 같은 목록이 이어진다
    let j = i;
    while (j < lines.length && BLANK.test(lines[j])) j += 1;
    if (j > i) {
      const nm = j < lines.length ? LIST.exec(lines[j]) : null;
      if (nm && nm[1].length === base) { i = j; continue; }
      break;
    }
  }
  return { nodes, next: i };
}

/* ── 읽기: 글 안 ─────────────────────────────────────── */

const PUNCT = /[!-/:-@[-`{-~]/;
const WORD = /[\p{L}\p{N}]/u;
/** 맨 주소로 읽는 글자 - * 는 넣지 않는다(바로 뒤의 **굵게** 를 주소로 먹지 않게) */
const URL_CHARS = /^https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()+,;=%]+/i;

const isWord = (c: string | undefined) => !!c && WORD.test(c);
const isSpace = (c: string | undefined) => !c || /\s/.test(c);

/** 문장 끝 기호 · 꾸밈 기호 · 짝 없는 닫는 괄호는 주소에서 뺀다 */
function trimUrl(url: string): string {
  let u = url.replace(/[.,:;!?'"_~=]+$/, '');
  while (u.endsWith(')') && (u.match(/\(/g)?.length ?? 0) < (u.match(/\)/g)?.length ?? 0)) u = u.slice(0, -1);
  while (u.endsWith(']') && (u.match(/\[/g)?.length ?? 0) < (u.match(/\]/g)?.length ?? 0)) u = u.slice(0, -1);
  return u;
}

export function unescapeText(s: string): string {
  return s.replace(/\\([!-/:-@[-`{-~])/g, '$1');
}

/** 코드 조각의 닫는 표시 - 길이가 같은 ` 줄기 */
function codeClose(src: string, from: number, run: string): number {
  let k = from;
  while (k < src.length) {
    const at = src.indexOf(run, k);
    if (at < 0) return -1;
    if (src[at + run.length] !== '`' && src[at - 1] !== '`') return at;
    k = at + 1;
    while (src[k] === '`') k += 1;
  }
  return -1;
}

/** from ~ to 사이의 * 줄기 - 한 개짜리(기울임) · 두 개짜리(굵게)가 몇 번 나왔는지. 세 개 이상은 둘 다로 센다 */
function starRuns(src: string, from: number, to: number): { one: number; two: number } {
  let one = 0;
  let two = 0;
  let k = from;
  while (k < to) {
    const c = src[k];
    if (c === '\\') { k += 2; continue; }
    if (c === '`') {
      const run = /^`+/.exec(src.slice(k))![0];
      const end = codeClose(src, k + run.length, run);
      k = end < 0 || end >= to ? k + run.length : end + run.length;
      continue;
    }
    if (c === '*') {
      let n = 0;
      while (src[k + n] === '*') n += 1;
      if (n === 1 || n >= 3) one += 1;
      if (n >= 2) two += 1;
      k += n;
      continue;
    }
    k += 1;
  }
  return { one, two };
}

/** 닫는 표시를 찾는다 - \ 로 막은 기호와 코드 조각은 건너뛴다 */
function findClose(src: string, from: number, delim: string, ok: (at: number) => boolean): number {
  let k = from;
  while (k < src.length) {
    const c = src[k];
    if (c === '\\') { k += 2; continue; }
    if (c === '`') {
      const run = /^`+/.exec(src.slice(k))![0];
      const end = codeClose(src, k + run.length, run);
      k = end < 0 ? k + run.length : end + run.length;
      continue;
    }
    if ((delim === '*' || delim === '**') && c === '*') {
      let n = 0;
      while (src[k + n] === '*') n += 1;
      if (delim === '*') {
        // 기울임 닫기 - ** 는 그 안의 굵게. *** 는 안에서 연 굵게가 남아 있으면 굵게부터 닫고(**+*), 아니면 기울임을 닫고 굵게를 연다(*+**)
        if (n === 1 && ok(k)) return k;
        if (n >= 3) {
          const open = starRuns(src, from, k).two % 2 === 1;
          const at = open ? k + n - 1 : k;
          if (ok(at)) return at;
        }
      } else if (n >= 2) {
        // 굵게 닫기 - *** 는 안에서 연 기울임이 남아 있으면 기울임부터 닫고(*+**), 아니면 굵게를 닫고 기울임을 연다(**+*)
        const open = n >= 3 && starRuns(src, from, k).one % 2 === 1;
        const at = open ? k + n - 2 : k;
        if (ok(at)) return at;
      }
      k += n;
      continue;
    }
    if (src.startsWith(delim, k) && ok(k)) return k;
    k += 1;
  }
  return -1;
}

/** 글이 놓이는 곳 - cell 은 | 표의 칸(| 를 막는다), html 은 <td>…</td> 한 줄 칸(줄바꿈은 <br>, | 는 그대로) */
type Ctx = 'text' | 'heading' | 'cell' | 'html' | 'summary';

function addMark(marks: Mk[], m: Mk): Mk[] {
  return [...marks.filter((x) => x.type !== m.type), m];
}

function pushText(out: Block[], text: string, marks: Mk[]) {
  if (!text) return;
  // 코드 조각에는 다른 표시를 얹지 않는다(편집기의 규칙)
  const ms = marks.some((m) => m.type === 'code') ? [{ type: 'code' }] : marks;
  const last = out[out.length - 1];
  if (last && last.type === 'text' && sameMarks(last.marks as Mk[] | undefined, ms)) {
    last.text = (last.text ?? '') + text;
    return;
  }
  out.push(ms.length ? { type: 'text', text, marks: ms.map((m) => ({ ...m })) } : { type: 'text', text });
}

function sameMarks(a: Mk[] | undefined, b: Mk[]): boolean {
  const x = a ?? [];
  if (x.length !== b.length) return false;
  return x.every((m) => b.some((n) => n.type === m.type && JSON.stringify(n.attrs ?? null) === JSON.stringify(m.attrs ?? null)));
}

/** 글 안의 꾸밈 · 링크 · 언급 */
export function parseInline(src: string, ctx: Ctx = 'text'): Block[] {
  const out: Block[] = [];
  walk(src, [], out, ctx);
  // 접기 제목에는 글자만 들어간다
  if (ctx === 'summary') {
    const text = (n: Block): Block[] => {
      const t = n.type === 'mention' ? `@${n.attrs?.label ?? ''}`
        : n.type === 'docLink' ? String(n.attrs?.title ?? '')
          : n.type === 'status' ? String(n.attrs?.text ?? '')
            : n.type === 'date' ? String(n.attrs?.date ?? '') : '';
      return t ? [{ type: 'text', text: t }] : [];
    };
    const flat: Block[] = [];
    out.forEach((n) => (n.type === 'text' ? [n] : text(n)).forEach((x) => pushText(flat, x.text ?? '', (x.marks as Mk[] | undefined) ?? [])));
    return flat;
  }
  if (ctx === 'heading') return out.filter((n) => n.type !== 'hardBreak');
  return out;
}

/** 글 안에서 알아보는 HTML 태그 - 밑줄 · 첨자 · 색 · 상태 배지 · 날짜 · 책갈피(그 밖은 붙여 넣은 글을 위해) */
const INLINE_TAG = /^<(u|ins|sub|sup|span|mark|b|strong|i|em|s|del|strike|time|var|a)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*>/i;

/** 짝이 맞는 닫는 태그 - \ 로 막은 기호와 코드 조각은 건너뛰고, 안쪽의 같은 태그는 짝을 센다 */
function findTag(src: string, from: number, name: string): { at: number; len: number } | null {
  const open = new RegExp(`^<${name}(?=[\\s>])`, 'i');
  const close = new RegExp(`^<\\/${name}\\s*>`, 'i');
  let depth = 0;
  let k = from;
  while (k < src.length) {
    const c = src[k];
    if (c === '\\') { k += 2; continue; }
    if (c === '`') {
      const run = /^`+/.exec(src.slice(k))![0];
      const end = codeClose(src, k + run.length, run);
      k = end < 0 ? k + run.length : end + run.length;
      continue;
    }
    if (c === '<') {
      const r = src.slice(k);
      const cl = close.exec(r);
      if (cl) {
        if (depth === 0) return { at: k, len: cl[0].length };
        depth -= 1;
        k += cl[0].length;
        continue;
      }
      if (open.test(r)) depth += 1;
    }
    k += 1;
  }
  return null;
}

/** 태그 하나를 읽는다 - 꾸밈은 안쪽을 다시 읽고, 상태 · 날짜 · 책갈피는 한 덩어리로. 못 읽으면 false(글자로 둔다) */
function inlineTag(name: string, a: Record<string, string>, inner: string, marks: Mk[], out: Block[], ctx: Ctx, flush: () => void): boolean {
  const into = (m: Mk[]) => {
    flush();
    walk(inner, m, out, ctx);
    return true;
  };
  switch (name) {
    case 'u': case 'ins': return into(addMark(marks, { type: 'underline' }));
    case 'sub': return into(addMark(marks.filter((m) => m.type !== 'superscript'), { type: 'subscript' }));
    case 'sup': return into(addMark(marks.filter((m) => m.type !== 'subscript'), { type: 'superscript' }));
    case 'b': case 'strong': return into(addMark(marks, { type: 'bold' }));
    case 'i': case 'em': return into(addMark(marks, { type: 'italic' }));
    case 's': case 'del': case 'strike': return into(addMark(marks, { type: 'strike' }));
    case 'mark': return into(addMark(marks, { type: 'highlight' }));
    case 'time': {
      const d = (a.datetime ?? '').slice(0, 10);
      if (!isIsoDate(d)) return into(marks);
      flush();
      out.push(withMarks({ type: 'date', attrs: { date: d } }, marks));
      return true;
    }
    case 'var': {
      const name = varName(a.name ?? unescapeText(inner));
      if (!name) return into(marks);
      flush();
      const kind = varKind(a['data-kind']);
      out.push(withMarks({ type: 'templateVar', attrs: { name, kind, options: kind === 'list' ? varOptions(a['data-options']) : null } }, marks));
      return true;
    }
    case 'a': {
      const id = anchorName(a.id ?? a.name);
      if (id && !inner.trim()) {
        flush();
        out.push(withMarks({ type: 'anchor', attrs: { name: id } }, marks));
        return true;
      }
      const to = a.href ? linkTo(a.href) : null;
      return into(to ? addMark(marks, linkMark(to)) : marks);
    }
    case 'span': {
      if ('data-status' in a) {
        flush();
        out.push(withMarks({ type: 'status', attrs: { text: unescapeText(inner), color: statusColor(a['data-status']) } }, marks));
        return true;
      }
      const st = styleOf(a.style);
      const color = hexColor(st.color);
      const bg = hexColor(st['background-color'] ?? st.background);
      if (!color && !bg) return into(marks);
      // 겹친 span(글자 색 안의 바탕색)은 한 꾸밈으로 합친다
      const prev = marks.find((m) => m.type === 'color')?.attrs;
      return into(addMark(marks, { type: 'color', attrs: { color: color ?? prev?.color ?? null, bg: bg ?? prev?.bg ?? null } }));
    }
    default:
      return false;
  }
}

function walk(src: string, marks: Mk[], out: Block[], ctx: Ctx) {
  let buf = '';
  const flush = () => {
    pushText(out, buf, marks);
    buf = '';
  };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const rest = () => src.slice(i);

    if (c === '\\' && i + 1 < src.length && PUNCT.test(src[i + 1])) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    if (c === '<') {
      const br = /^<br\s*\/?>/i.exec(rest());
      if (br && ctx !== 'summary') {
        flush();
        out.push({ type: 'hardBreak' });
        i += br[0].length;
        continue;
      }
      const auto = /^<((?:https?|mailto):[^\s<>]+)>/i.exec(rest());
      const to = auto ? linkTo(auto[1]) : null;
      if (auto && to) {
        flush();
        pushText(out, auto[1], addMark(marks, linkMark(to)));
        i += auto[0].length;
        continue;
      }
      // <u> · <sub> · <sup> · <span …> · <time …> · <a id> - 짝이 맞는 닫는 태그가 있을 때만
      const tag = INLINE_TAG.exec(rest());
      if (tag) {
        const name = tag[1].toLowerCase();
        const end = findTag(src, i + tag[0].length, name);
        if (end) {
          const inner = src.slice(i + tag[0].length, end.at);
          const handled = inlineTag(name, tagAttrs(tag[2]), inner, marks, out, ctx, flush);
          if (handled) {
            i = end.at + end.len;
            continue;
          }
        }
      }
    }

    if (c === '`') {
      const run = /^`+/.exec(rest())![0];
      const end = codeClose(src, i + run.length, run);
      if (end >= 0) {
        flush();
        let code = src.slice(i + run.length, end);
        if (code.length > 2 && code.startsWith(' ') && code.endsWith(' ') && code.trim()) code = code.slice(1, -1);
        pushText(out, code, [...marks, { type: 'code' }]);
        i = end + run.length;
        continue;
      }
      buf += run;
      i += run.length;
      continue;
    }

    if (c === '[') {
      const m = matchLink(src, i);
      if (m) {
        flush();
        if (m.href.startsWith('mention:')) {
          out.push(withMarks({ type: 'mention', attrs: { id: m.href.slice(8), label: unescapeText(m.text).replace(/^@/, '') } }, marks));
        } else if (m.href.startsWith('doc:')) {
          out.push(withMarks({ type: 'docLink', attrs: { id: m.href.slice(4), title: unescapeText(m.text) } }, marks));
        } else {
          const to = linkTo(m.href);
          walk(m.text, to ? addMark(marks, linkMark(to)) : marks, out, ctx);
        }
        i = m.end;
        continue;
      }
    }

    if (src.startsWith('**', i) && !isSpace(src[i + 2])) {
      const end = findClose(src, i + 2, '**', (k) => !isSpace(src[k - 1]));
      if (end > i + 2) {
        flush();
        walk(src.slice(i + 2, end), addMark(marks, { type: 'bold' }), out, ctx);
        i = end + 2;
        continue;
      }
    }
    if (src.startsWith('~~', i) && !isSpace(src[i + 2])) {
      const end = findClose(src, i + 2, '~~', (k) => !isSpace(src[k - 1]));
      if (end > i + 2) {
        flush();
        walk(src.slice(i + 2, end), addMark(marks, { type: 'strike' }), out, ctx);
        i = end + 2;
        continue;
      }
    }
    if (src.startsWith('==', i) && !isSpace(src[i + 2])) {
      const end = findClose(src, i + 2, '==', (k) => !isSpace(src[k - 1]));
      if (end > i + 2) {
        flush();
        walk(src.slice(i + 2, end), addMark(marks, { type: 'highlight' }), out, ctx);
        i = end + 2;
        continue;
      }
    }
    if (c === '*' && src[i + 1] !== '*' && !isSpace(src[i + 1])) {
      const end = findClose(src, i + 1, '*', (k) => !isSpace(src[k - 1]));
      if (end > i + 1) {
        flush();
        walk(src.slice(i + 1, end), addMark(marks, { type: 'italic' }), out, ctx);
        i = end + 1;
        continue;
      }
    }
    // _기울임_ - 낱말 속의 _ 는 글자다(snake_case)
    if (c === '_' && !isWord(src[i - 1]) && src[i + 1] !== '_' && !isSpace(src[i + 1])) {
      const end = findClose(src, i + 1, '_', (k) => !isSpace(src[k - 1]) && !isWord(src[k + 1]) && src[k + 1] !== '_');
      if (end > i + 1) {
        flush();
        walk(src.slice(i + 1, end), addMark(marks, { type: 'italic' }), out, ctx);
        i = end + 1;
        continue;
      }
    }

    // 맨 주소
    if ((c === 'h' || c === 'H') && !isWord(src[i - 1]) && !marks.some((m) => m.type === 'link')) {
      const u = URL_CHARS.exec(rest());
      if (u) {
        const url = trimUrl(u[0]);
        const to = linkTo(url);
        if (to && url.length > 8) {
          flush();
          pushText(out, url, addMark(marks, linkMark(to)));
          i += url.length;
          continue;
        }
      }
    }

    if (c === '&' && src.startsWith('&nbsp;', i)) {
      buf += NBSP;
      i += 6;
      continue;
    }

    buf += c;
    i += 1;
  }
  flush();
}

function withMarks(node: Block, marks: Mk[]): Block {
  const ms = marks.filter((m) => m.type !== 'code');
  return ms.length ? { ...node, marks: ms.map((m) => ({ ...m })) } : node;
}

/** 새 탭으로 열지는 화면이 주소를 보고 정한다 - 링크에는 주소만 둔다 */
function linkMark(to: { href: string }): Mk {
  return { type: 'link', attrs: { href: to.href } };
}

/** [글](주소) - 글 안의 [ ] 짝과 주소 안의 ( ) 짝을 센다 */
function matchLink(src: string, at: number): { text: string; href: string; end: number } | null {
  let j = at + 1;
  let depth = 0;
  for (; j < src.length; j += 1) {
    const ch = src[j];
    if (ch === '\\') { j += 1; continue; }
    if (ch === '`') {
      const run = /^`+/.exec(src.slice(j))![0];
      const end = codeClose(src, j + run.length, run);
      if (end >= 0) j = end + run.length - 1;
      continue;
    }
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      if (depth === 0) break;
      depth -= 1;
    }
  }
  if (j >= src.length || src[j + 1] !== '(' || j === at + 1) return null;
  let k = j + 2;
  let p = 0;
  for (; k < src.length; k += 1) {
    const ch = src[k];
    if (ch === '\\') { k += 1; continue; }
    if (ch === '(') p += 1;
    else if (ch === ')') {
      if (p === 0) break;
      p -= 1;
    }
  }
  if (k >= src.length) return null;
  let href = src.slice(j + 2, k).trim();
  const titled = /^(\S+)\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/.exec(href);
  if (titled) href = titled[1];
  if (href.startsWith('<') && href.endsWith('>')) href = href.slice(1, -1);
  if (!href || /\s/.test(href)) return null;
  return { text: src.slice(at + 1, j), href: unescapeText(href), end: k + 1 };
}

/* ── 쓰기 ────────────────────────────────────────────── */

/** 편집기 문서 → 마크다운. 끝에 남은 빈 문단(편집기가 늘 붙여 두는 자리)은 적지 않는다 */
export function docToMd(doc: JSONContent): string {
  const blocks = [...(doc.content ?? [])];
  while (blocks.length && isEmptyParagraph(blocks[blocks.length - 1])) blocks.pop();
  return blocksToMd(blocks);
}

function isEmptyParagraph(b: Block): boolean {
  return b.type === 'paragraph' && !(b.content ?? []).length;
}

function blocksToMd(blocks: Block[]): string {
  return blockParts(blocks).join('\n\n');
}

/** 문단 · 제목의 맞춤 · 들여쓰기 - 기본(왼쪽 · 0)이면 '' */
function boxFmt(b: Block): string {
  if (b.type !== 'paragraph' && b.type !== 'heading') return '';
  const align = alignOf(b.attrs?.textAlign);
  const indent = indentOf6(b.attrs?.indent);
  return align || indent ? `${align ?? ''}|${indent}` : '';
}

/**
 * 블록마다 마크다운 - 같은 종류의 목록이 바로 이어지면 표시를 번갈아 써서 다시 읽을 때 한 목록으로 합쳐지지 않게 한다.
 * 맞춤 · 들여쓰기가 같은 문단 · 제목이 이어지면 <div> 하나로 감싼다
 */
function blockParts(blocks: Block[]): string[] {
  const out: string[] = [];
  let alt = false;
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    const fmt = boxFmt(b);
    if (fmt) {
      let j = i;
      while (j < blocks.length && boxFmt(blocks[j]) === fmt) j += 1;
      const [align, indent] = fmt.split('|');
      const attrs = `${align ? ` align="${align}"` : ''}${Number(indent) ? ` data-indent="${indent}"` : ''}`;
      const inner = blocks.slice(i, j).map((x) => blockToMd(x)).join('\n\n');
      out.push(`<div${attrs}>\n\n${inner}\n\n</div>`);
      alt = false;
      i = j;
      continue;
    }
    const prev = blocks[i - 1];
    alt = !!prev && prev.type === b.type && /List$/.test(b.type ?? '') ? !alt : false;
    out.push(blockToMd(b, alt));
    i += 1;
  }
  return out;
}

/** 블록 하나 → 마크다운(여러 줄일 수 있다). alt = 목록 표시를 다른 갈래로(* · 1)) */
export function blockToMd(b: Block, alt = false): string {
  switch (b.type) {
    case 'paragraph':
      return paragraphToMd(b.content ?? []);
    case 'heading': {
      const level = Math.min(Math.max(Number(b.attrs?.level) || 1, 1), 6);
      // 끝의 ' #' 은 제목 닫는 표시로 읽히므로 막는다
      const text = inlineToMd(flatten(b.content ?? []), 'heading').trim()
        .replace(/(\s)(#+)$/, (_, sp: string, hs: string) => sp + hs.replace(/#/g, '\\#'));
      // 제목 글 머리의 기호는 블록으로 읽히지 않는다(## 1. 개요) - 머리의 # 하나만 막는다(## # 태그)
      return `${'#'.repeat(level)}${text ? ` ${text.replace(/^#/, '\\#')}` : ''}`;
    }
    case 'codeBlock': {
      const text = (b.content ?? []).map((t) => t.text ?? '').join('');
      const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((r) => r.length));
      const fence = '`'.repeat(longest + 1);
      const lang = String(b.attrs?.language ?? '').replace(/[`\s=]/g, '');
      // 제목의 ` 는 코드 블록 여는 줄에 쓸 수 없어 ' 로 바꾼다
      const title = String(b.attrs?.title ?? '').replace(/`/g, "'").replace(/\s+/g, ' ').trim();
      const extra = `${title ? ` title=${JSON.stringify(title)}` : ''}${b.attrs?.lineNumbers ? ' linenumbers=true' : ''}`;
      return `${fence}${lang}${extra}\n${text}${text ? '\n' : ''}${fence}`;
    }
    case 'horizontalRule':
      return '---';
    case 'blockquote':
      return quote(blocksToMd(b.content ?? []));
    case 'callout': {
      const kind = CALLOUTS.find((k) => k.kind === b.attrs?.kind) ?? CALLOUTS[0];
      const bg = hexColor(b.attrs?.bg);
      const icon = String(b.attrs?.icon ?? '').trim();
      const title = String(b.attrs?.title ?? '').replace(/\s+/g, ' ').trim();
      const args = `${bg ? ` bg=${bg}` : ''}${icon ? ` icon=${argValue(icon)}` : ''}`;
      const inner = blocksToMd(b.content ?? []);
      return `> [!${kind.tag}${args}]${title ? ` ${title}` : ''}\n${quote(inner)}`;
    }
    case 'bulletList':
    case 'orderedList':
    case 'taskList':
    case 'decisionList':
      return listToMd(b, alt);
    case 'table':
      return tableToMd(b);
    case 'details': {
      const [summary, content] = b.content ?? [];
      const title = inlineToMd(summary?.content ?? [], 'summary');
      const inner = blocksToMd(content?.content ?? []);
      return `<details>\n<summary>${title}</summary>\n\n${inner}\n\n</details>`;
    }
    case 'image': {
      const src = String(b.attrs?.src ?? '');
      const width = Math.round(Number(b.attrs?.width) || 0);
      const align = b.attrs?.align === 'left' ? 'left' : alignOf(b.attrs?.align);
      if (width > 0 || align) {
        const altText = String(b.attrs?.alt ?? '').replace(/\s+/g, ' ').trim();
        return `<img src="${escAttr(src)}" alt="${escAttr(altText)}"${width > 0 ? ` width="${width}"` : ''}${align ? ` align="${align}"` : ''}>`;
      }
      const alt = escapeText(String(b.attrs?.alt ?? ''), 'text').replace(/\n/g, ' ');
      return `![${alt}](${src.replace(/[()\s]/g, (ch) => encodeURIComponent(ch))})`;
    }
    case 'layoutSection': {
      const cols = (b.content ?? []).map((c) => {
        const w = Number(c.attrs?.width);
        const width = Number.isFinite(w) && w > 0 ? ` data-column="${Math.round(w * 100) / 100}"` : ' data-column=""';
        return `<div${width}>\n\n${blocksToMd(c.content ?? [])}\n\n</div>`;
      });
      return `<div data-layout="columns">\n${cols.join('\n')}\n</div>`;
    }
    case 'layoutColumn':
      // 단 밖에 홀로 남은 단(있을 수 없지만) - 안쪽 블록만
      return blocksToMd(b.content ?? []);
    case 'toc': {
      const lv = (v: unknown) => (Number(v) >= 1 && Number(v) <= 6 ? Number(v) : null);
      const min = lv(b.attrs?.minLevel);
      const max = lv(b.attrs?.maxLevel);
      return `[TOC${min ? ` minLevel=${min}` : ''}${max ? ` maxLevel=${max}` : ''}]`;
    }
    case 'childPages': {
      const d = Number(b.attrs?.depth);
      return `[CHILDREN${Number.isFinite(d) && d !== 1 && d >= 0 ? ` depth=${Math.min(Math.round(d), 9)}` : ''}]`;
    }
    case 'macro': {
      const name = String(b.attrs?.name ?? '').replace(/[^\w.:-]/g, '-') || 'macro';
      const params = (b.attrs?.params ?? {}) as Record<string, unknown>;
      const args = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => ` ${argKey(k)}=${argValue(String(v))}`).join('');
      return `[MACRO ${name}${args}]`;
    }
    default:
      // 모르는 블록은 글자만 남긴다
      return paragraphToMd(flatten(b.content ?? []));
  }
}

/** 글 안의 한 덩어리 요소 */
const INLINE_ATOMS = new Set(['mention', 'docLink', 'status', 'date', 'anchor', 'templateVar']);

/** 표 · 목록 안에서도 글만 꺼낼 수 있게 블록을 펴서 글 조각으로 */
function flatten(nodes: Block[]): Block[] {
  const out: Block[] = [];
  nodes.forEach((n, i) => {
    if (n.type === 'text' || n.type === 'hardBreak' || INLINE_ATOMS.has(n.type ?? '')) out.push(n);
    else {
      if (i > 0 && out.length) out.push({ type: 'hardBreak' });
      out.push(...flatten(n.content ?? []));
    }
  });
  return out;
}

const quote = (md: string) => md.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n');

/** 문단 - 줄바꿈마다 줄을 나누고, 빈 줄과 빈 문단은 줄바꿈 없는 공백 하나로 적는다 */
function paragraphToMd(content: Block[]): string {
  if (!content.length) return NBSP;
  const lines: Block[][] = [[]];
  content.forEach((n) => {
    if (n.type === 'hardBreak') lines.push([]);
    else lines[lines.length - 1].push(n);
  });
  return lines.map((ln) => {
    const md = inlineToMd(ln, 'text');
    if (!md) return NBSP;
    // 글 '!' 바로 뒤 링크 하나뿐인 줄은 그림 줄로 읽힌다 - 느낌표를 막는다
    return IMAGE_LINE.test(md) ? `\\${md}` : escapeLineStart(md);
  }).join('\n');
}

/** 줄 머리에 오면 블록으로 읽히는 기호를 막는다 */
function escapeLineStart(line: string): string {
  // 앞의 공백은 들여쓰기로 읽히지 않게 줄바꿈 없는 공백으로
  let s = line.replace(/^ +/, (sp) => NBSP.repeat(sp.length));
  if (/^(#{1,6}(\s|$)|>|[-+](\s|$)|\||(-[ \t]*){3,}$|(_[ \t]*){3,}$)/.test(s)) s = `\\${s}`;
  else if (/^\d{1,9}[.)](\s|$)/.test(s)) s = s.replace(/^(\d{1,9})([.)])/, '$1\\$2');
  else if (s === '&nbsp;') s = '\\&nbsp;';
  return s;
}

/**
 * 글 속의 기호 막기 - 읽을 때 꾸밈 · 링크로 읽히지 않게.
 * 링크가 아닌 글자 속 주소는 : 를 막아 둔다 - 링크를 풀어 둔 주소가 다시 열 때 링크로 돌아오지 않게
 */
function escapeText(s: string, ctx: Ctx, inLink = false): string {
  let t = s
    .replace(/[\\`*[\]]/g, '\\$&')
    .replace(/~~/g, '\\~\\~')
    .replace(/==/g, '\\=\\=')
    // 조각 끝의 ~ · = 는 바로 붙는 꾸밈 기호(~~ · ==)와 이어져 다르게 읽힌다
    .replace(/^[~=]|(?<!\\)[~=]$/g, '\\$&')
    // 밑줄은 앞뒤가 모두 글자일 때(snake_case)만 그대로 둔다 - 낱말 머리 · 끝의 _ 는 기울임을 열고 닫는 기호로 읽힌다
    .replace(/_/g, (m, at: number, str: string) => (isWord(str[at - 1]) && isWord(str[at + 1]) ? m : '\\_'))
    .replace(/<(?=[A-Za-z/!])/g, '\\<')
    .replace(/&nbsp;/g, '\\&nbsp;');
  if (!inLink) t = t.replace(/(https?):(?=\/\/)/gi, '$1\\:');
  if (ctx === 'cell') t = t.replace(/\|/g, '\\|');
  return t;
}

const MARK_RANK: Record<string, number> = {
  link: 0, bold: 1, italic: 2, strike: 3, underline: 4, highlight: 5, color: 6, subscript: 7, superscript: 8, code: 9,
};

/** 글자 색 꾸밈의 style - 색이 하나도 없으면 '' */
function colorCss(m: Mk): string {
  const color = hexColor(m.attrs?.color);
  const bg = hexColor(m.attrs?.bg);
  return [color ? `color: ${color}` : '', bg ? `background-color: ${bg}` : ''].filter(Boolean).join('; ');
}

function canon(marks: Mk[] | undefined): Mk[] {
  return [...(marks ?? [])]
    .filter((m) => m.type in MARK_RANK && m.type !== 'code' && (m.type !== 'color' || colorCss(m)))
    .sort((a, b) => MARK_RANK[a.type] - MARK_RANK[b.type]);
}

const sameMark = (a: Mk, b: Mk) =>
  a.type === b.type && (a.type === 'link' ? a.attrs?.href === b.attrs?.href : a.type === 'color' ? colorCss(a) === colorCss(b) : true);

function openDelim(m: Mk, italic: string): string {
  switch (m.type) {
    case 'link': return '[';
    case 'bold': return '**';
    case 'italic': return italic;
    case 'strike': return '~~';
    case 'underline': return '<u>';
    case 'color': return `<span style="${colorCss(m)}">`;
    case 'subscript': return '<sub>';
    case 'superscript': return '<sup>';
    default: return '==';
  }
}

function closeDelim(m: Mk, italic: string): string {
  switch (m.type) {
    case 'link': {
      const href = String(m.attrs?.href ?? '').replace(/[()\s<>]/g, (ch) => encodeURIComponent(ch));
      return `](${href})`;
    }
    case 'underline': return '</u>';
    case 'color': return '</span>';
    case 'subscript': return '</sub>';
    case 'superscript': return '</sup>';
    default: return openDelim(m, italic);
  }
}

function codeSpan(text: string, ctx: Ctx): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((r) => r.length));
  const fence = '`'.repeat(longest + 1);
  const pad = text.startsWith('`') || text.endsWith('`') || (text.startsWith(' ') && text.endsWith(' ') && text.trim()) ? ' ' : '';
  const body = ctx === 'cell' ? text.replace(/\|/g, '\\|') : text;
  return `${fence}${pad}${body}${pad}${fence}`;
}

function atomToMd(n: Block, ctx: Ctx): string {
  if (n.type === 'mention') {
    const label = escapeText(String(n.attrs?.label ?? ''), ctx);
    return `[@${label}](mention:${String(n.attrs?.id ?? '')})`;
  }
  if (n.type === 'docLink') {
    const title = escapeText(String(n.attrs?.title ?? '') || '문서', ctx);
    return `[${title}](doc:${String(n.attrs?.id ?? '')})`;
  }
  if (n.type === 'status') {
    return `<span data-status="${statusColor(n.attrs?.color)}">${escapeText(String(n.attrs?.text ?? ''), ctx)}</span>`;
  }
  if (n.type === 'date') {
    const d = isIsoDate(n.attrs?.date) ? n.attrs?.date as string : '';
    return d ? `<time datetime="${d}">${d}</time>` : '';
  }
  if (n.type === 'templateVar') {
    const name = varName(n.attrs?.name);
    if (!name) return '';
    const kind = varKind(n.attrs?.kind);
    const options = kind === 'list' ? varOptions(n.attrs?.options) : null;
    return `<var name="${numAttr(name)}"${kind !== 'string' ? ` data-kind="${kind}"` : ''}${options ? ` data-options="${numAttr(JSON.stringify(options))}"` : ''}>${escapeText(name, ctx)}</var>`;
  }
  if (n.type === 'anchor') {
    const name = anchorName(n.attrs?.name);
    return name ? `<a id="${escAttr(name)}"></a>` : '';
  }
  return '';
}

/**
 * 글 조각들 → 마크다운. 표시는 링크 > 굵게 > 기울임 > 취소선 > 형광펜 순으로 겹친다.
 * 앞 조각과 같은 표시는 이어 두고, 달라진 곳부터 닫고 연다. 표시 안쪽 끝의 공백은 표시 밖으로 뺀다
 * (** 글 ** 처럼 공백에 붙은 표시는 다른 곳에서 꾸밈으로 읽지 않는다).
 */
function inlineToMd(nodes: Block[], ctx: Ctx): string {
  // 기울임 표시 - 앞뒤가 글자에 붙으면 *, 아니면 _ (굵게의 ** 와 붙어 *** 가 되는 것을 피한다)
  const whole = italicPlan(nodes, false);
  const a = inlineWith(nodes, ctx, whole);
  if (!(whole as Plan).risky) return a;
  /* 굵게가 바뀌는 기울임 구간 - 예전처럼 한 구간으로 적은 글이 바르게 읽히면 그대로 둔다(예전 문서를 다시 저장해도 글이 바뀌지 않게).
     다르게 읽히면 나눠 적은 글을 쓴다 */
  const b = inlineWith(nodes, ctx, italicPlan(nodes, true));
  if (a === b) return a;
  const read = (md: string) => JSON.stringify(parseInline(md, ctx === 'html' ? 'cell' : ctx));
  return read(a) === read(b) ? a : b;
}

type Plan = Map<Mk, string> & { objs?: (Mk | null)[]; risky?: boolean };

function inlineWith(nodes: Block[], ctx: Ctx, italicDelim: Plan): string {
  let out = '';
  const stack: Mk[] = [];
  let trail = '';
  const close = (to: number) => {
    while (stack.length > to) {
      const m = stack.pop()!;
      out += closeDelim(m, italicDelim.get(m) ?? '_');
    }
  };

  nodes.forEach((n, idx) => {
    if (n.type === 'hardBreak') {
      close(0);
      out += trail;
      trail = '';
      out += ctx === 'cell' || ctx === 'html' ? '<br>' : ' ';
      return;
    }
    const isText = n.type === 'text';
    const code = isText && (n.marks ?? []).some((m) => m.type === 'code');
    const text = isText ? n.text ?? '' : '';
    let lead = '';
    let core = text;
    let tail = '';
    if (isText && !code) {
      const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
      [, lead, core, tail] = m;
    }
    const want = isText && !code && !core ? [] : canonWithPlan(n.marks as Mk[] | undefined, italicDelim, idx);
    let p = 0;
    while (p < stack.length && p < want.length && sameMark(stack[p], want[p])) p += 1;
    close(p);
    out += trail;
    trail = '';
    if (isText && !code && !core) {
      out += lead + tail;
      return;
    }
    out += lead;

    // 글자가 곧 주소인 링크는 주소만 적는다(앞뒤 글자와 붙으면 <주소>)
    const link = want.find((m) => m.type === 'link');
    if (link && p === 0 && want.length === 1 && isText && !code && core === link.attrs?.href &&
        !(nodes[idx + 1]?.marks ?? []).some((m) => sameMark(m as Mk, link)) && /^https?:\/\//i.test(core)) {
      const before = out.slice(-1);
      const after = (nodes[idx + 1]?.text ?? '')[0] ?? '';
      const bare = !isWord(before) && !/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]/.test(after) && trimUrl(core) === core;
      out += bare ? core : `<${core}>`;
      trail = tail;
      return;
    }

    for (let k = p; k < want.length; k += 1) {
      out += openDelim(want[k], italicDelim.get(want[k]) ?? '_');
      stack.push(want[k]);
    }
    if (code) out += codeSpan(text, ctx);
    else if (isText) out += escapeText(core, ctx, stack.some((m) => m.type === 'link'));
    else out += atomToMd(n, ctx);
    trail = tail;
  });
  close(0);
  out += trail;
  return out;
}

/* 기울임 표시 고르기 - 기울임이 이어지는 구간마다 앞뒤를 보고 정한다. _ 는 글자에 붙으면 꾸밈으로 읽히지 않으므로
   앞뒤가 공백 · 기호이거나 다른 꾸밈의 기호가 바로 붙을 때만 쓰고, 아니면 * 를 쓴다.
   같은 구간의 조각은 같은 표시 객체를 쓰게 해 열고 닫는 기호가 어긋나지 않게 한다.
   split 이면 굵게만 바뀌는 곳(아래 risky)에서 구간을 나눈다. 돌려준 계획의 risky = 그런 곳이 있었는가 */
function italicPlan(nodes: Block[], split: boolean): Plan {
  const plan: Plan = new Map<Mk, string>();
  plan.risky = false;
  const objs: (Mk | null)[] = nodes.map(() => null);
  const marksOf = (n: Block | undefined) => (n ? canon(n.marks as Mk[] | undefined) : []);
  const keeps = (m: Mk, list: Mk[]) => list.some((x) => sameMark(m, x));
  const outer = (m: Mk) => MARK_RANK[m.type] < MARK_RANK.italic;
  const has = (n: Block) => (n.marks ?? []).some((m) => m.type === 'italic') && !(n.marks ?? []).some((m) => m.type === 'code');
  /** i ~ j 를 한 구간으로 볼 때의 표시 */
  const choose = (i: number, j: number) => {
    const prev = nodes[i - 1];
    const next = nodes[j + 1];
    const before = prev?.type === 'text' ? (prev.text ?? '').slice(-1) : '';
    const after = next?.type === 'text' ? (next.text ?? '')[0] ?? '' : '';
    const firstText = nodes[i].type === 'text' ? nodes[i].text ?? '' : 'x';
    const lastText = nodes[j].type === 'text' ? nodes[j].text ?? '' : 'x';
    const [pm, fm, lm, nm] = [marksOf(prev), marksOf(nodes[i]), marksOf(nodes[j]), marksOf(next)];
    // 앞: 앞 조각의 꾸밈이 여기서 닫히거나, 바깥 꾸밈(링크 · 굵게)이 먼저 열리면 그 기호가 붙는다
    const leftMark = !!prev && (pm.some((m) => !keeps(m, fm)) || fm.some((m) => outer(m) && !keeps(m, pm)));
    // 뒤: 바깥 꾸밈이 뒤이어 닫히거나, 다음 조각의 꾸밈이 열리면 그 기호가 붙는다
    const rightMark = !!next && (lm.some((m) => outer(m) && !keeps(m, nm)) || nm.some((m) => !keeps(m, lm)));
    // 앞뒤 공백은 표시 밖으로 빠지므로 그 공백이 곧 경계다
    const leftOpen = /^\s/.test(firstText) || !isWord(before) || leftMark;
    const rightOpen = /\s$/.test(lastText) || !isWord(after) || rightMark;
    return leftOpen && rightOpen ? '_' : '*';
  };
  const assign = (i: number, j: number, delim: string) => {
    const m: Mk = { type: 'italic' };
    plan.set(m, delim);
    for (let k = i; k <= j; k += 1) objs[k] = m;
  };
  const bold = (n: Block) => marksOf(n).some((m) => m.type === 'bold');
  const link = (n: Block) => String(marksOf(n).find((m) => m.type === 'link')?.attrs?.href ?? '');
  let i = 0;
  while (i < nodes.length) {
    if (!has(nodes[i])) { i += 1; continue; }
    let j = i;
    while (j + 1 < nodes.length && has(nodes[j + 1])) j += 1;
    const whole = choose(i, j);
    /* 링크는 그대로인데 굵게만 바뀌는 곳에서는 기울임을 닫았다 곧바로 다시 연다 - * 로 쓰면 *기울임****굵은 기울임* 처럼
       * 가 넷 붙어 다르게 읽힌다. 그런 구간은 굵게 · 링크가 바뀌는 곳마다 나눠 따로 고른다(_**_ 는 바르게 읽힌다) */
    const risky = whole === '*' && Array.from({ length: j - i }, (_, k) => i + k)
      .some((k) => bold(nodes[k]) !== bold(nodes[k + 1]) && link(nodes[k]) === link(nodes[k + 1]));
    if (risky) plan.risky = true;
    if (!risky || !split) assign(i, j, whole);
    else {
      let s = i;
      for (let k = i; k <= j; k += 1) {
        if (k === j || bold(nodes[k]) !== bold(nodes[k + 1]) || link(nodes[k]) !== link(nodes[k + 1])) {
          assign(s, k, choose(s, k));
          s = k + 1;
        }
      }
    }
    i = j + 1;
  }
  plan.objs = objs;
  return plan;
}

function canonWithPlan(marks: Mk[] | undefined, plan: Plan, idx: number): Mk[] {
  const objs = plan.objs ?? [];
  return canon(marks).map((m) => (m.type === 'italic' && objs[idx] ? objs[idx]! : m));
}

/** 목록 - 항목의 첫 블록은 표시 옆에, 나머지는 표시 너비만큼 들여 쓴다 */
function listToMd(list: Block, alt = false): string {
  const items = list.content ?? [];
  let n = Number(list.attrs?.start) || 1;
  const loose = items.some((it) => (it.content ?? []).filter((c) => c.type === 'paragraph').length > 1);
  const bullet = alt ? '*' : '-';
  return items.map((it) => {
    const marker = list.type === 'orderedList' ? `${n++}${alt ? ')' : '.'} `
      : list.type === 'taskList' ? `${bullet} [${it.attrs?.checked ? 'x' : ' '}] `
        : list.type === 'decisionList' ? `${bullet} [d] ` : `${bullet} `;
    const pad = ' '.repeat(list.type === 'orderedList' ? marker.length : 2);
    // 항목 첫 줄의 빈 문단은 비워 둔다(빈 할 일)
    const parts = blockParts(it.content ?? []).map((md, k) => (k === 0 && isEmptyParagraph((it.content ?? [])[0]) ? '' : md));
    const [first = '', ...more] = parts;
    const firstLines = first.split('\n');
    // 맞춤 상자(<div>)는 줄 머리에 있어야 짝을 센다 - 표시 다음 줄부터 들여 쓴다
    const boxed = DIV_OPEN.test(firstLines[0]);
    let md = boxed ? `${marker.trimEnd()}\n${pad}${firstLines[0]}` : `${marker}${firstLines[0]}`;
    if (firstLines.length > 1) md += `\n${firstLines.slice(1).map((l) => (l ? pad + l : l)).join('\n')}`;
    more.forEach((p, k) => {
      const prevType = it.content?.[k]?.type;
      const thisType = it.content?.[k + 1]?.type;
      // 문단 뒤 문단은 빈 줄로 나눈다(붙이면 한 문단이 된다). 겹친 목록은 바로 붙인다
      const sep = thisType === 'paragraph' || prevType !== 'paragraph' || loose ? '\n\n' : '\n';
      md += sep + p.split('\n').map((l) => (l ? pad + l : l)).join('\n');
    });
    return md;
  }).join(loose ? '\n\n' : '\n');
}

/** 칸 너비가 적혀 있는가(0 은 정하지 않은 너비) */
const hasWidth = (cw: unknown) => Array.isArray(cw) && cw.some((x) => Number(x) > 0);
/** 맞춤 · 들여쓰기가 없는 문단 */
const plainParagraph = (b: Block | undefined) => !!b && b.type === 'paragraph' && !boxFmt(b);

/**
 * | 표로 적을 수 있는가 - 첫 줄만 머리 칸, 칸 합치기 · 칸 색 · 칸 너비 없음, 칸마다 꾸밈 없는 문단 하나, 줄마다 칸 수가 같다
 */
function isSimpleTable(table: Block): boolean {
  const rows = table.content ?? [];
  const width = (rows[0]?.content ?? []).length;
  return rows.length > 0 && width > 0 && rows.every((r, ri) => (r.content ?? []).length === width && (r.content ?? []).every((c) =>
    c.type === (ri === 0 ? 'tableHeader' : 'tableCell')
    && (Number(c.attrs?.colspan) || 1) === 1 && (Number(c.attrs?.rowspan) || 1) === 1
    && !hexColor(c.attrs?.background) && !hasWidth(c.attrs?.colwidth)
    && (c.content ?? []).length === 1 && plainParagraph(c.content?.[0])));
}

function tableToMd(table: Block): string {
  return isSimpleTable(table) ? pipeTable(table) : tagTable(table);
}

/** <table> 꼴 - 줄마다 태그 하나. 칸이 꾸밈 없는 문단 하나면 한 줄, 아니면 빈 줄 사이에 블록 */
function tagTable(table: Block): string {
  const rows = table.content ?? [];
  // 열마다 너비 - 합친 칸까지 따져 칸이 덮는 열을 찾는다
  const widths: number[] = [];
  const taken: boolean[][] = [];
  rows.forEach((r, ri) => {
    let ci = 0;
    (r.content ?? []).forEach((cell) => {
      while (taken[ri]?.[ci]) ci += 1;
      const cs = Math.max(1, Number(cell.attrs?.colspan) || 1);
      const rs = Math.max(1, Number(cell.attrs?.rowspan) || 1);
      for (let y = 0; y < rs; y += 1) for (let x = 0; x < cs; x += 1) (taken[ri + y] ??= [])[ci + x] = true;
      const cw = Array.isArray(cell.attrs?.colwidth) ? cell.attrs?.colwidth as unknown[] : [];
      for (let x = 0; x < cs; x += 1) {
        const w = Math.round(Number(cw[x]) || 0);
        if (w > 0 && !widths[ci + x]) widths[ci + x] = w;
      }
      ci += cs;
    });
  });
  const cols = Math.max(0, ...taken.map((t) => t.length));
  const out = ['<table>'];
  if (widths.some((w) => w > 0)) {
    out.push(`<colgroup>${Array.from({ length: Math.max(cols, widths.length) }, (_, k) => (widths[k] > 0 ? `<col style="width: ${widths[k]}px">` : '<col>')).join('')}</colgroup>`);
  }
  rows.forEach((r) => {
    out.push('<tr>');
    (r.content ?? []).forEach((c) => {
      const tag = c.type === 'tableHeader' ? 'th' : 'td';
      const cs = Math.max(1, Number(c.attrs?.colspan) || 1);
      const rs = Math.max(1, Number(c.attrs?.rowspan) || 1);
      const bg = hexColor(c.attrs?.background);
      const attrs = `${cs > 1 ? ` colspan="${cs}"` : ''}${rs > 1 ? ` rowspan="${rs}"` : ''}${bg ? ` style="background-color: ${bg}"` : ''}`;
      const blocks = c.content ?? [];
      if (blocks.length === 1 && plainParagraph(blocks[0])) {
        out.push(`<${tag}${attrs}>${inlineToMd(blocks[0].content ?? [], 'html').replace(/^[ \t]+|[ \t]+$/g, '')}</${tag}>`);
      } else {
        out.push(`<${tag}${attrs}>`, '', blocksToMd(blocks), '', `</${tag}>`);
      }
    });
    out.push('</tr>');
  });
  out.push('</table>');
  return out.join('\n');
}

/** | 표 */
function pipeTable(table: Block): string {
  // 마크다운 표에는 칸 합치기가 없다 - 붙여 넣은 표의 합친 칸(colspan · rowspan)은 펼쳐 자리를 맞추고 나머지 칸은 비운다
  const rows: string[][] = [];
  (table.content ?? []).forEach((r, ri) => {
    rows[ri] ??= [];
    let ci = 0;
    (r.content ?? []).forEach((cell) => {
      while (rows[ri][ci] !== undefined) ci += 1;
      const cs = Math.max(1, Number(cell.attrs?.colspan) || 1);
      const rs = Math.max(1, Number(cell.attrs?.rowspan) || 1);
      const md = inlineToMd(flatten(cell.content ?? []), 'cell').trim() || ' ';
      for (let y = 0; y < rs; y += 1) {
        rows[ri + y] ??= [];
        for (let x = 0; x < cs; x += 1) rows[ri + y][ci + x] = x === 0 && y === 0 ? md : ' ';
      }
      ci += cs;
    });
  });
  for (let ri = 0; ri < rows.length; ri += 1) rows[ri] = Array.from(rows[ri] ?? [], (c) => c ?? ' ');
  const width = Math.max(1, ...rows.map((r) => r.length));
  const line = (cells: string[]) => `| ${Array.from({ length: width }, (_, k) => cells[k] ?? ' ').join(' | ')} |`;
  const [head = [], ...body] = rows;
  return [line(head), `| ${Array.from({ length: width }, () => '---').join(' | ')} |`, ...body.map(line)].join('\n');
}

/* ── 검색 · 미리 보기 ────────────────────────────────── */

/** 마크다운에서 글자만 - 검색 · 문서 조각 미리 보기에 쓴다 */
export function plainText(md: string): string {
  const parts: string[] = [];
  const walkNode = (n: JSONContent) => {
    if (n.type === 'text') parts.push(n.text ?? '');
    else if (n.type === 'mention') parts.push(`@${n.attrs?.label ?? ''}`);
    else if (n.type === 'docLink') parts.push(String(n.attrs?.title ?? ''));
    else if (n.type === 'status') parts.push(` ${String(n.attrs?.text ?? '')} `);
    else if (n.type === 'date') parts.push(` ${String(n.attrs?.date ?? '')} `);
    else if (n.type === 'templateVar') parts.push(` ${String(n.attrs?.name ?? '')} `);
    else if (n.type === 'hardBreak') parts.push(' ');
    (n.content ?? []).forEach(walkNode);
    if (n.type !== 'text' && !INLINE_ATOMS.has(n.type ?? '') && n.type !== 'hardBreak') parts.push(' ');
  };
  walkNode(mdToDoc(md));
  return parts.join('').replace(/[\s ]+/g, ' ').trim();
}

/* ── 양식 ───────────────────────────────────────────── */

/** 양식의 칸들 - 처음 나온 차례로, 같은 이름은 하나로 */
export function templateVars(md: string): TemplateVarDef[] {
  if (!/<var\b/i.test(md)) return [];
  const seen = new Map<string, TemplateVarDef>();
  const walkNode = (n: JSONContent) => {
    if (n.type === 'templateVar') {
      const name = varName(n.attrs?.name);
      if (name && !seen.has(name)) {
        const kind = varKind(n.attrs?.kind);
        seen.set(name, { name, kind, options: kind === 'list' ? varOptions(n.attrs?.options) : null });
      }
    }
    (n.content ?? []).forEach(walkNode);
  };
  walkNode(mdToDoc(md));
  return [...seen.values()];
}

/** 붙은 글 조각 중 꾸밈이 같은 것을 하나로 */
function mergeText(nodes: JSONContent[]): JSONContent[] {
  const out: JSONContent[] = [];
  for (const n of nodes) {
    const prev = out[out.length - 1];
    if (prev?.type === 'text' && n.type === 'text' && JSON.stringify(prev.marks ?? []) === JSON.stringify(n.marks ?? [])) {
      out[out.length - 1] = { ...prev, text: (prev.text ?? '') + (n.text ?? '') };
    } else out.push(n);
  }
  return out;
}

/**
 * 양식으로 새 문서 - 칸을 받은 값으로 바꾼다. 날짜 칸에 날짜(YYYY-MM-DD)를 주면 날짜로, 여러 줄 칸은 줄바꿈을 살린다.
 * 값이 없는 칸은 지운다(Confluence 와 같다)
 */
export function fillTemplate(md: string, values: Record<string, string>): string {
  if (!/<var\b/i.test(md)) return md;
  const fill = (nodes: JSONContent[]): JSONContent[] => {
    const out: JSONContent[] = [];
    for (const n of nodes) {
      if (n.type !== 'templateVar') {
        out.push(n.content ? { ...n, content: fill(n.content) } : n);
        continue;
      }
      const name = varName(n.attrs?.name);
      const v = (values[name] ?? '').replace(/\r\n?/g, '\n');
      const marks = (n.marks ?? []) as Mk[];
      if (isDateVar(name) && isIsoDate(v.trim())) {
        out.push(withMarks({ type: 'date', attrs: { date: v.trim() } }, marks));
        continue;
      }
      if (!v.trim()) continue;
      const lines = varKind(n.attrs?.kind) === 'textarea' ? v.split('\n') : [v.replace(/\n/g, ' ')];
      lines.forEach((line, i) => {
        if (i) out.push({ type: 'hardBreak' });
        if (line) out.push(withMarks({ type: 'text', text: line }, marks));
      });
    }
    return mergeText(out);
  };
  const doc = mdToDoc(md);
  return docToMd({ ...doc, content: fill(doc.content ?? []) });
}

/** 본문이 가리키는 다른 문서 id - 이 문서를 링크한 문서(되짚기)를 찾는 데 쓴다 */
export function docLinkIds(md: string): string[] {
  const ids = new Set<string>();
  // 브라우저 저장 모드의 id 는 시각이 들어가 : · . 이 섞인다(d2026-10-28T08:01:38.300Z-8)
  for (const m of md.matchAll(/\]\(doc:([^)\s]+)\)/g)) ids.add(m[1]);
  // 글을 바꿔 단 문서 링크(Confluence 에서 옮긴 "여기" 같은 링크) - [글](/hub/?doc=id)
  for (const m of md.matchAll(/\]\(\/(?:hub|taskmanager)\/\?doc=([^)\s&#]+)/g)) {
    try { ids.add(decodeURIComponent(m[1])); } catch { ids.add(m[1]); }
  }
  return [...ids];
}

/* ── 기록 비교 ───────────────────────────────────────── */

export type DiffMark = 'same' | 'add' | 'del';

/**
 * 두 판을 블록 단위로 비교한다(가장 긴 공통 부분열). 그대로인 블록 · 새로 생긴 블록 · 사라진 블록을
 * 문서 차례대로 늘어놓아 한 문서로 보여 줄 수 있게 돌려준다.
 */
export function diffBlocks(oldMd: string, newMd: string): { blocks: Block[]; marks: DiffMark[] } {
  const a = (mdToDoc(oldMd).content ?? []).filter((b) => !isEmptyParagraph(b));
  const b = (mdToDoc(newMd).content ?? []).filter((x) => !isEmptyParagraph(x));
  const ka = a.map((x) => blockToMd(x));
  const kb = b.map((x) => blockToMd(x));
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = ka[i] === kb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const blocks: Block[] = [];
  const marks: DiffMark[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ka[i] === kb[j]) {
      blocks.push(b[j]);
      marks.push('same');
      i += 1;
      j += 1;
    } else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) {
      blocks.push(b[j]);
      marks.push('add');
      j += 1;
    } else {
      blocks.push(a[i]);
      marks.push('del');
      i += 1;
    }
  }
  return { blocks, marks };
}
