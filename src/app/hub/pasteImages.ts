/*
 * 붙여 넣는 그림 - 위키 편집기(DocEditor)의 붙여 넣기가 쓴다. 화면 없이 도는 부분은 Node 로 시험한다.
 *
 * 1. 그림만 복사한 것 - 스크린숏 · 브라우저의 '이미지 복사' · 카카오톡 · 그림판 · 워드에서 그림 하나.
 *    클립보드에 그림 파일이 있고, 함께 오는 HTML 은 그 그림의 주소뿐이다(웹 주소 · 복사한 컴퓨터 안의 file: 주소).
 *    주소는 로그인해야 보이거나(Confluence) 곧 사라지므로(서명 주소) 그림 파일을 올린다.
 * 2. 글과 함께 복사한 그림 - 워드 · 웹 문서 · 메일.
 *    웹 주소(https)는 그대로 둔다. data: 그림은 파일로 바꿔 올리고, 복사한 컴퓨터 안의 주소(file: 등)는
 *    워드가 RTF 에 같은 순서로 실어 둔 그림을 꺼내 올린다. 꺼내지 못한 그림은 자리 표시(🖼)로 남긴다.
 */

export type SrcKind = 'wiki' | 'web' | 'data' | 'local' | 'none';
export type Upload = (file: File) => Promise<string>;

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
const FILE_MAX = 20 * 1024 * 1024;

/** 클립보드의 파일 - files 가 비었으면 items 의 파일 */
export function clipboardFiles(dt: DataTransfer | null | undefined): File[] {
  if (!dt) return [];
  const files = Array.from(dt.files ?? []);
  if (files.length) return files;
  const out: File[] = [];
  for (const it of Array.from(dt.items ?? [])) {
    if (it.kind !== 'file') continue;
    const f = it.getAsFile();
    if (f) out.push(f);
  }
  return out;
}

/**
 * HTML 에 글 · 표가 없고 그림 주소뿐인가 - 스크린숏 · '이미지 복사' · 그림만 고른 복사.
 * 엑셀 · 한글 · 워드는 글(표)과 함께 고른 곳을 그린 그림도 싣는다 - 글이 있으면 글을 넣는다
 */
export function imageOnlyHtml(html: string): boolean {
  if (!html.trim()) return true;
  // 위키 안에서 복사한 것 - 그 블록을 그대로 넣는다
  if (html.includes('data-pm-slice')) return false;
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(head|style|script|title|xml|template)\b[\s\S]*?<\/\1\s*>/gi, '');
  // 표 · 목록 · 줄 · 입력 칸은 내용이다(빈 칸만 복사해도 표로 넣는다)
  if (/<(table|ul|ol|hr|input|textarea|select|iframe|video|audio|object|embed|canvas)\b/i.test(body)) return false;
  const text = body
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|#160|#xa0|zwnj|zwj|#8203|#x200b|#65279|#xfeff);/gi, '')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, 'x');
  return !/[^\s ​‌‍﻿]/.test(text);
}

/** 글이 비었거나, 그림과 함께 오는 주소 · 파일 경로 · 파일 이름뿐인가 */
export function refOnlyText(text: string): boolean {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).every((l) =>
    /^(https?|file|data|blob):\S*$/i.test(l)
    || /^([a-z]:[\\/]|\\\\)[^<>|"*?]*$/i.test(l)
    || /^[^\\/:*?"<>|]{1,255}\.(png|jpe?g|gif|webp|bmp|tiff?|heic|heif|avif|svg|ico)$/i.test(l));
}

/** 클립보드 · 프로그램이 붙인 이름(image.png) - 그림 설명으로 쓰지 않는다 */
export function genericImageName(name: string): boolean {
  return /^(image|img|clipboard|pasted?|untitled|unnamed|blob|picture|그림|이미지)([ _-]?(image|graphic))?([ _-]?\(?\d+\)?)?\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(name.trim());
}

/** 그림 설명 - 오피스가 스스로 붙인 설명("…자동 생성된 설명")과 파일 이름은 뺀다(위키는 설명을 그림 아래에 적는다) */
export function cleanAlt(alt: string | null | undefined): string | null {
  const a = (alt ?? '').replace(/\s+/g, ' ').trim();
  if (!a || genericImageName(a)) return null;
  if (/자동\s*생성된\s*설명|automatically generated|AI[- ]generated|AI\s*생성/i.test(a)) return null;
  return a.slice(0, 300);
}

/** 팀 저장소 파일의 서명 주소(위키 그림을 '이미지 복사' 한 것) → 본문 주소(tmfile:). 다시 올리지 않는다 */
export function ownFile(src: string): string | null {
  const m = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/(?:sign|public|authenticated)\/tm-files\/([^?#]+)/i.exec(src.trim());
  if (!m) return null;
  let path: string;
  try {
    path = decodeURIComponent(m[1]);
  } catch {
    return null;
  }
  return /^[\w\-./]+$/.test(path) && !path.includes('..') ? `tmfile:${path}` : null;
}

/**
 * 그림 주소의 종류. wiki = 위키 파일, web = 웹 주소(그대로 건다), data = 글 안에 실린 그림(올린다),
 * local = 복사한 곳에서만 열리는 주소(file: · blob: · cid: - 다른 데서 꺼내야 한다), none = 빈 자리 · 아이콘(뺀다)
 */
export function srcKind(src: string): SrcKind {
  const s = src.trim();
  if (!s || /^(about:|javascript:|#)/i.test(s)) return 'none';
  if (/^tmfile:[\w\-./%]+$/.test(s)) return 'wiki';
  if (/^(https?:)?\/\//i.test(s)) return 'web';
  // 작은 data: 그림은 늦게 받는 그림의 빈 자리 · 자리 맞춤이다. SVG 는 받지 않는다(스크립트를 품을 수 있다)
  if (/^data:/i.test(s)) return /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(s) && s.length > 400 ? 'data' : 'none';
  return 'local';
}

/** 그림의 진짜 주소 - 늦게 받는 그림은 src 가 빈 자리 그림이고 진짜는 data-src · srcset 에 있다 */
export function realSrc(get: (name: string) => string | null): string {
  let src = (get('src') ?? '').trim();
  if (/^\/\//.test(src)) src = `https:${src}`;
  if (srcKind(src) !== 'none' && srcKind(src) !== 'data') return src;
  const lazy = ['data-src', 'data-original', 'data-lazy-src', 'data-lazy', 'data-actualsrc', 'data-hi-res-src']
    .map((n) => (get(n) ?? '').trim()).find((v) => /^https?:\/\//i.test(v));
  if (lazy) return lazy;
  const set = (get('srcset') || get('data-srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0]).filter((u) => /^https?:\/\//i.test(u));
  if (set.length) return set[set.length - 1];
  return src;
}

/** data:image/…;base64 → 파일 */
export function dataUrlFile(src: string, name: string): File | null {
  const m = /^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(src.trim());
  if (!m) return null;
  let bin: string;
  try {
    bin = atob(m[2].replace(/\s+/g, ''));
  } catch {
    return null;
  }
  const bytes = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k += 1) bytes[k] = bin.charCodeAt(k);
  const t = m[1].toLowerCase();
  const type = t === 'image/jpg' ? 'image/jpeg' : t;
  return new File([bytes], `${name}.${EXT[type]}`, { type });
}

/* ── RTF 의 그림 ─────────────────────────────────── */

export interface RtfPicture {
  /** 브라우저가 그릴 수 있는 그림이면 형식, 아니면 null(EMF · WMF · 비트맵) */
  type: 'image/png' | 'image/jpeg' | null;
  bytes: Uint8Array<ArrayBuffer> | null;
}

interface Pict { kind: string | null; hex: string[]; bin: number[]; parent: string | null }
interface Group { pict: Pict | null; root: boolean; legacy: boolean; first: boolean; name: string | null }

const PICT_KINDS = new Set(['pngblip', 'jpegblip', 'emfblip', 'wmetafile', 'macpict', 'pmmetafile', 'dibitmap', 'wbitmap']);

const hexVal = (c: number) => (c <= 57 ? c - 48 : (c | 32) - 87);

function hexBytes(hex: string): Uint8Array<ArrayBuffer> {
  const h = hex.replace(/[^0-9a-fA-F]/g, '');
  const out = new Uint8Array(h.length >> 1);
  for (let k = 0, j = 0; k < out.length; k += 1, j += 2) out[k] = (hexVal(h.charCodeAt(j)) << 4) | hexVal(h.charCodeAt(j + 1));
  return out;
}

function finishPict(p: Pict): RtfPicture | null {
  const type = p.kind === 'pngblip' ? 'image/png' : p.kind === 'jpegblip' ? 'image/jpeg' : null;
  // 그리지 못하는 그림(EMF 등)은 그림 자리(\shppict · 떠 있는 그림의 \sv)에 있을 때만 하나로 센다 - 그 밖은 부속물이다
  if (!type) return p.parent === 'shppict' || p.parent === 'sv' ? { type: null, bytes: null } : null;
  const bytes = p.bin.length ? Uint8Array.from(p.bin) : hexBytes(p.hex.join(''));
  const ok = type === 'image/png'
    ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    : bytes[0] === 0xff && bytes[1] === 0xd8;
  return ok ? { type, bytes } : { type: null, bytes: null };
}

/**
 * RTF 의 그림 - 문서에 나온 순서대로, 그림 하나에 하나씩.
 * 워드는 그림마다 {\*\shppict{\pict …\pngblip …}} 와 옛 프로그램용 {\nonshppict{\pict …\wmetafile8 …}} 를 함께 싣고,
 * 떠 있는 그림은 {\shp …{\sv {\pict …}}} 뒤에 옛 프로그램용 {\shprslt …} 를 둔다 - 옛 프로그램용은 세지 않는다
 */
export function rtfPictures(rtf: string): RtfPicture[] {
  const out: RtfPicture[] = [];
  const stack: Group[] = [];
  let g: Group = { pict: null, root: false, legacy: false, first: true, name: null };
  const word = /\\([a-zA-Z]{1,32})(-?\d{1,10})? ?/y;
  const text = /[^{}\\]+/y;
  let i = 0;
  while (i < rtf.length) {
    const c = rtf.charCodeAt(i);
    if (c === 123) { // {
      stack.push(g);
      g = { pict: g.pict, root: false, legacy: g.legacy, first: true, name: null };
      i += 1;
    } else if (c === 125) { // }
      if (g.root && g.pict && !g.legacy) {
        const p = finishPict(g.pict);
        if (p) out.push(p);
      }
      g = stack.pop() ?? { pict: null, root: false, legacy: false, first: true, name: null };
      i += 1;
    } else if (c === 92) { // \
      word.lastIndex = i;
      const m = word.exec(rtf);
      if (!m) {
        const next = rtf[i + 1];
        if (next === "'") i += 4; // \'hh - 글자 하나
        else {
          if (next !== '*') g.first = false; // \* 는 다음 낱말이 이 묶음의 이름임을 알린다
          i += 2;
        }
        continue;
      }
      i = word.lastIndex;
      const w = m[1];
      if (g.first) {
        g.first = false;
        g.name = w;
        if (w === 'pict') {
          g.pict = { kind: null, hex: [], bin: [], parent: stack[stack.length - 1]?.name ?? null };
          g.root = true;
        } else if (w === 'nonshppict' || w === 'shprslt') g.legacy = true;
      }
      if (g.root && g.pict && !g.pict.kind && PICT_KINDS.has(w)) g.pict.kind = w;
      if (w === 'bin') {
        // \binN 뒤의 N 바이트는 날것 그대로다
        const n = Math.max(0, Number(m[2] ?? 0));
        if (g.root && g.pict) for (let k = 0; k < n && i + k < rtf.length; k += 1) g.pict.bin.push(rtf.charCodeAt(i + k) & 255);
        i += n;
      }
    } else {
      text.lastIndex = i;
      const m = text.exec(rtf);
      const s = m ? m[0] : rtf[i];
      if (g.root && g.pict) g.pict.hex.push(s);
      i += s.length;
    }
  }
  return out;
}

/* ── 받아 오기 · 줄이기 (브라우저) ───────────────────── */

/** Confluence Cloud 그림 주소 중 열쇠(token)를 함께 싣는 것 - 잠깐은 로그인 없이도 받을 수 있다 */
export function atlassianTokenImage(src: string): boolean {
  return /^https:\/\/(api\.media\.atlassian\.com|media-cdn\.atlassian\.com)\/file\/[\w-]+\/(image|binary)\b/i.test(src) && /[?&]token=/.test(src);
}

/** 다른 곳의 그림을 받아 파일로 - 그곳이 허락(CORS)해야 받힌다 */
export async function fetchImageFile(url: string, name: string, ms = 20000): Promise<File | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctl.signal });
    if (!r.ok) return null;
    const blob = await r.blob();
    const t = (blob.type || r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const type = t === 'image/jpg' ? 'image/jpeg' : t;
    if (!EXT[type] || !blob.size || blob.size > FILE_MAX) return null;
    return new File([blob], `${name}.${EXT[type]}`, { type });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const BIG = 8 * 1024 * 1024;

/** 아주 큰 그림(사진을 '이미지 복사' 하면 수십 MB 의 PNG 가 된다) - 긴 변 4096px 안의 WebP 로 줄인다 */
export async function compactImage(file: File): Promise<File> {
  if (file.size <= BIG || !/^image\/(png|jpeg|webp|bmp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 4096 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.9));
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || '그림'}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
}

/* ── 붙여 넣는 HTML 의 그림 (브라우저) ───────────────── */

export interface CarryResult {
  /** 꺼내지 못한 그림(복사한 곳에서만 열리는 주소) */
  missed: number;
  /** 올리지 못한 그림 */
  failed: number;
  /** 처음 실패한 까닭 */
  why: string | null;
}

export interface PasteJob {
  el: Element;
  kind: 'data' | 'local';
  src: string;
  /** 워드 도형 · 묶음을 그린 그림 - RTF 에 그림으로 없다 */
  drawing: boolean;
}

/** 워드 HTML 의 VML(조건부 주석 안의 도형 · 그림 정보)을 꺼낸다 - tidyImages 가 도형을 가리고 img 없는 그림을 채운다 */
export function unwrapVml(html: string): string {
  return /<!--\[if gte vml 1\]>/i.test(html) ? html.replace(/<!--\[if gte vml 1\]>/gi, '') : html;
}

/**
 * 워드의 VML 을 읽고 지운다. 돌려주는 값은 도형 · 묶음의 id - 그 도형을 그린 img 는 RTF 에 그림으로 없다.
 * img 없이 VML 로만 적힌 그림(v:imagedata)은 그 자리에 img 를 만든다(CKEditor 의 워드 붙여 넣기와 같은 방법)
 */
function readVml(root: ParentNode): Set<string> {
  const drawings = new Set<string>();
  const vml = Array.from(root.querySelectorAll('*')).filter((el) => el.localName.startsWith('v:'));
  if (!vml.length) return drawings;
  for (const el of vml) {
    const id = el.getAttribute('id');
    // o:gfxdata 를 가진 것은 도형이다. 다만 v:shapetype 바로 뒤의 것(그림)과 차트는 그림으로 RTF 에 있다
    if (!id || !el.hasAttribute('o:gfxdata') || el.previousElementSibling?.localName === 'v:shapetype' || /chart/i.test(id)) continue;
    drawings.add(id);
  }
  const imgs = Array.from(root.querySelectorAll('img'));
  const shown = new Set(imgs.flatMap((im) => (im.getAttribute('v:shapes') ?? '').split(/\s+/).filter(Boolean)));
  for (const shape of vml) {
    if (shape.localName !== 'v:shape') continue;
    const id = shape.getAttribute('id') ?? '';
    const data = Array.from(shape.children).find((c) => c.localName === 'v:imagedata' && c.getAttribute('src'));
    if (!data || drawings.has(id) || shown.has(id) || shape.closest('v\\:group')) continue;
    const img = shape.ownerDocument.createElement('img');
    img.setAttribute('src', data.getAttribute('src') ?? '');
    const alt = shape.getAttribute('alt') ?? data.getAttribute('o:title');
    if (alt) img.setAttribute('alt', alt);
    if (id) img.setAttribute('v:shapes', id);
    shape.after(img);
  }
  // 글 상자 · 도형의 VML 은 지운다(그 모습은 HTML 의 img · 표로 따로 실려 있다)
  for (const el of vml) el.remove();
  return drawings;
}

/** '이미지 복사' 한 HTML 의 그림이 모두 이 위키의 그림이면 본문 주소와 설명 - 아니면 빈 목록 */
export function ownImages(root: ParentNode): { src: string; alt: string | null }[] {
  const out: { src: string; alt: string | null }[] = [];
  for (const el of Array.from(root.querySelectorAll('img'))) {
    const own = ownFile(el.getAttribute('src') ?? '');
    if (!own) return [];
    out.push({ src: own, alt: cleanAlt(el.getAttribute('alt')) });
  }
  return out;
}

/**
 * 붙여 넣을 HTML 의 그림을 다듬는다 - 늦게 받는 그림은 진짜 주소로, 위키 그림의 서명 주소는 본문 주소로,
 * 오피스의 자동 설명은 지우고, 빈 자리 그림 · 아이콘(작은 data:)은 뺀다.
 * 올려야 하는 그림(data: · 복사한 곳에서만 열리는 주소)을 문서 순서대로 돌려준다
 */
export function tidyImages(root: ParentNode): PasteJob[] {
  const drawings = readVml(root);
  const jobs: PasteJob[] = [];
  for (const el of Array.from(root.querySelectorAll('img'))) {
    const src = realSrc((n) => el.getAttribute(n));
    const kind = srcKind(src);
    if (kind === 'none') {
      el.remove();
      continue;
    }
    el.setAttribute('src', kind === 'web' ? ownFile(src) ?? src : src);
    el.removeAttribute('srcset');
    const alt = cleanAlt(el.getAttribute('alt'));
    if (alt) el.setAttribute('alt', alt);
    else el.removeAttribute('alt');
    const shapes = (el.getAttribute('v:shapes') ?? '').split(/\s+/).filter(Boolean);
    const drawing = kind === 'local' && shapes.length > 0 && shapes.every((s) => drawings.has(s));
    if (kind === 'data' || kind === 'local') jobs.push({ el, kind, src, drawing });
  }
  return jobs;
}

/**
 * 복사한 곳에서만 열리는 그림 ↔ RTF 그림의 짝. 수가 맞을 때만 순서대로 잇는다(어긋나면 다른 그림이 들어갈 수 있다).
 * 워드 2023 은 그림 일부를 HTML 에 data: 로 싣고 RTF 에도 함께 싣는다 - data: 그림까지 세어 맞으면 그 순서로 잇는다
 */
export function pairRtf(jobs: PasteJob[], rtf: string): Map<PasteJob, RtfPicture> {
  const pairs = new Map<PasteJob, RtfPicture>();
  const cands = jobs.filter((j) => !j.drawing);
  const locals = cands.filter((j) => j.kind === 'local');
  if (!locals.length || !rtf) return pairs;
  const all = rtfPictures(rtf);
  const ok = all.filter((p) => p.type);
  const hit = ([[cands, all], [cands, ok], [locals, all], [locals, ok]] as const).find(([a, b]) => a.length === b.length);
  if (hit) hit[0].forEach((j, i) => { if (j.kind === 'local') pairs.set(j, hit[1][i]); });
  return pairs;
}

/** 여럿을 n 개씩 나눠 돌린다 */
async function pool<T>(items: T[], n: number, run: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      await run(items[i], i);
    }
  }));
}

const reason = (e: unknown) => (e instanceof Error && e.message ? e.message : null);

/** 자리 표시 글 - 그림이 있던 자리 */
export function missingLabel(alt: string | null, what: string) {
  return alt ? `🖼 ${alt} (${what})` : `🖼 ${what}`;
}

/**
 * 붙여 넣을 HTML 의 그림을 올리고 주소를 바꾼다. 복사한 곳에서만 열리는 그림은 RTF 의 그림과 수가 같을 때만
 * 순서대로 짝짓는다(수가 어긋나면 다른 그림이 들어갈 수 있다). 넣지 못한 그림은 자리 표시 글로 바꾼다
 */
export async function carryImages(jobs: PasteJob[], rtf: string, upload: Upload | undefined): Promise<CarryResult> {
  const res: CarryResult = { missed: 0, failed: 0, why: null };
  const pairs = pairRtf(jobs, rtf);
  const swap = (j: PasteJob, what: string) => {
    const em = j.el.ownerDocument.createElement('em');
    em.textContent = missingLabel(cleanAlt(j.el.getAttribute('alt')), what);
    j.el.replaceWith(em);
  };
  await pool(jobs, 3, async (j, i) => {
    let file: File | null = null;
    if (j.kind === 'data') file = dataUrlFile(j.src, `그림 ${i + 1}`);
    else {
      const p = pairs.get(j);
      if (p?.type && p.bytes) file = new File([p.bytes], `그림 ${i + 1}.${EXT[p.type]}`, { type: p.type });
    }
    if (!file) {
      res.missed += 1;
      swap(j, '붙여 넣지 못한 그림');
      return;
    }
    try {
      if (!upload) throw new Error('이 위키에서는 파일을 올릴 수 없습니다');
      j.el.setAttribute('src', await upload(await compactImage(file)));
    } catch (e) {
      res.failed += 1;
      res.why ??= reason(e);
      swap(j, '올리지 못한 그림');
    }
  });
  return res;
}

/* ── 문서 JSON 의 그림 (Confluence 에서 붙여 넣은 것) ──── */

interface JNode { type?: string; attrs?: Record<string, unknown>; content?: JNode[]; [k: string]: unknown }

const carryable = (src: string) => srcKind(src) === 'data' || atlassianTokenImage(src);

/** 문서 JSON 의 그림 중 받아 올릴 것(data: · Confluence 의 열쇠 붙은 주소)의 수 */
export function jsonImageWork(content: JNode[]): number {
  let n = 0;
  const walk = (list: JNode[]) => {
    for (const x of list) {
      if (x.type === 'image' && carryable(String(x.attrs?.src ?? ''))) n += 1;
      else if (x.content) walk(x.content);
    }
  };
  walk(content);
  return n;
}

/** 그 그림들을 받아 올리고 주소를 바꾼다. 못 받거나 못 올린 그림은 '옮기지 못한 그림' 글로 바꾼다 */
export async function carryJsonImages(content: JNode[], upload: Upload | undefined): Promise<CarryResult> {
  const res: CarryResult = { missed: 0, failed: 0, why: null };
  const jobs: { list: JNode[]; i: number; node: JNode }[] = [];
  const walk = (list: JNode[]) => list.forEach((x, i) => {
    if (x.type === 'image' && carryable(String(x.attrs?.src ?? ''))) jobs.push({ list, i, node: x });
    else if (x.content) walk(x.content);
  });
  walk(content);
  const swap = (j: (typeof jobs)[number], alt: string | null) => {
    j.list[j.i] = { type: 'paragraph', content: [{ type: 'text', text: missingLabel(alt, '옮기지 못한 그림'), marks: [{ type: 'italic' }] }] };
  };
  await pool(jobs, 3, async (j, k) => {
    const src = String(j.node.attrs?.src ?? '');
    const alt = cleanAlt(String(j.node.attrs?.alt ?? ''));
    const name = alt?.slice(0, 60).replace(/[\\/:*?"<>|]/g, ' ') || `그림 ${k + 1}`;
    const file = srcKind(src) === 'data' ? dataUrlFile(src, name) : await fetchImageFile(src, name);
    if (!file) {
      res.missed += 1;
      swap(j, alt);
      return;
    }
    try {
      if (!upload) throw new Error('이 위키에서는 파일을 올릴 수 없습니다');
      j.node.attrs = { ...j.node.attrs, src: await upload(await compactImage(file)) };
    } catch (e) {
      res.failed += 1;
      res.why ??= reason(e);
      swap(j, alt);
    }
  });
  return res;
}

/** 붙여 넣은 뒤 알릴 말 - 넣지 못한 그림이 없으면 null */
export function carryNotice(r: CarryResult): string | null {
  const parts: string[] = [];
  if (r.missed) parts.push(`그림 ${r.missed}개는 함께 붙여 넣지 못했습니다. 그 그림만 따로 복사해 🖼 자리에 붙여 넣어 주세요`);
  if (r.failed) {
    // 저장소의 말("'그림 1.png' 을(를) 올리지 못했습니다. 인터넷 연결을…")에서 까닭만 쓴다
    const why = (r.why ?? '').replace(/^'[^']*' 을\(를\) 올리지 못했습니다\.\s*/, '').replace(/[.\s]+$/, '');
    parts.push(`그림 ${r.failed}개를 올리지 못했습니다${why ? `(${why})` : ''}. 🖼 자리에 다시 붙여 넣어 주세요`);
  }
  return parts.length ? parts.join(' · ') : null;
}
