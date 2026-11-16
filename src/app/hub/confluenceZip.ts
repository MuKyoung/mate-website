/*
 * Confluence 내보내기 읽기 - ZIP(라이브러리 없이 브라우저의 DecompressionStream 으로 푼다)과
 * 스페이스 내보내기 두 가지(XML · HTML)를 읽어 문서 트리 · 첨부 · 댓글 · 라벨 · 양식 · 사람으로 정리한다.
 *
 *   XML  entities.xml(+ exportDescriptor.properties, attachments/<문서>/<첨부>/<판>) - 저장 형식 본문, 라벨 · 댓글 · 양식까지
 *   HTML index.html(트리) + 문서마다 .html(#main-content) + attachments/<문서>/<첨부>.<확장자> - 사람 이름이 들어 있다
 * Cloud 의 CSV 내보내기는 읽지 않는다(알림으로 XML · HTML 로 다시 내보내 달라고 한다).
 */

/* ── ZIP ───────────────────────────────────────────────── */

export interface ZipEntry {
  name: string;
  method: number;
  compSize: number;
  size: number;
  offset: number;
  flags: number;
}

const u16 = (v: DataView, at: number) => v.getUint16(at, true);
const u32 = (v: DataView, at: number) => v.getUint32(at, true);
const u64 = (v: DataView, at: number) => Number(v.getBigUint64(at, true));

async function slice(file: Blob, from: number, to: number): Promise<DataView> {
  return new DataView(await file.slice(from, to).arrayBuffer());
}

export class Zip {
  private constructor(readonly file: Blob, readonly entries: Map<string, ZipEntry>) {}

  /** 가운데 목록(central directory)을 읽는다 - 4GB 넘는 ZIP64 도 */
  static async open(file: Blob): Promise<Zip> {
    const tailSize = Math.min(file.size, 65557 + 20);
    const tail = await slice(file, file.size - tailSize, file.size);
    let eocd = -1;
    for (let i = tail.byteLength - 22; i >= 0; i -= 1) {
      if (u32(tail, i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('ZIP 파일이 아니거나 깨진 파일입니다');
    let count = u16(tail, eocd + 10);
    let cdSize = u32(tail, eocd + 12);
    let cdOffset = u32(tail, eocd + 16);
    if (cdOffset === 0xffffffff || count === 0xffff || cdSize === 0xffffffff) {
      // ZIP64 - EOCD 바로 앞의 위치 표시(locator)가 ZIP64 EOCD 를 가리킨다
      const loc = eocd - 20;
      if (loc >= 0 && u32(tail, loc) === 0x07064b50) {
        const at = u64(tail, loc + 8);
        const z = await slice(file, at, at + 56);
        if (u32(z, 0) === 0x06064b50) {
          count = u64(z, 32);
          cdSize = u64(z, 40);
          cdOffset = u64(z, 48);
        }
      }
    }
    const cd = await slice(file, cdOffset, cdOffset + cdSize);
    const dec = new TextDecoder('utf-8');
    const entries = new Map<string, ZipEntry>();
    let p = 0;
    for (let n = 0; n < count && p + 46 <= cd.byteLength; n += 1) {
      if (u32(cd, p) !== 0x02014b50) break;
      const flags = u16(cd, p + 8);
      const method = u16(cd, p + 10);
      let compSize = u32(cd, p + 20);
      let size = u32(cd, p + 24);
      const nameLen = u16(cd, p + 28);
      const extraLen = u16(cd, p + 30);
      const commentLen = u16(cd, p + 32);
      let offset = u32(cd, p + 42);
      const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nameLen));
      // ZIP64 덧붙임(0x0001) - 넘친 값만 차례로 들어 있다
      let e = p + 46 + nameLen;
      const end = e + extraLen;
      while (e + 4 <= end) {
        const id = u16(cd, e);
        const len = u16(cd, e + 2);
        if (id === 0x0001) {
          let q = e + 4;
          if (size === 0xffffffff) { size = u64(cd, q); q += 8; }
          if (compSize === 0xffffffff) { compSize = u64(cd, q); q += 8; }
          if (offset === 0xffffffff) { offset = u64(cd, q); q += 8; }
        }
        e += 4 + len;
      }
      p = end + commentLen;
      // 폴더 · Cloud 가 넣는 '/' 한 줄은 건너뛴다
      if (name.endsWith('/') || !name.trim()) continue;
      entries.set(name.replace(/\\/g, '/').replace(/^\.?\//, ''), { name, method, compSize, size, offset, flags });
    }
    if (!entries.size) throw new Error('ZIP 안에 파일이 없습니다');
    return new Zip(file, entries);
  }

  /** 이름(대소문자 · 앞의 공백 무시)으로 찾는다 */
  find(test: (name: string) => boolean): string | undefined {
    for (const k of this.entries.keys()) if (test(k)) return k;
    return undefined;
  }

  has(name: string) {
    return this.entries.has(name);
  }

  /** 압축을 풀며 읽는 흐름 */
  async stream(name: string): Promise<ReadableStream<Uint8Array>> {
    const e = this.entries.get(name);
    if (!e) throw new Error(`ZIP 안에 ${name} 이(가) 없습니다`);
    if (e.flags & 1) throw new Error('암호가 걸린 ZIP 은 읽을 수 없습니다');
    const head = await slice(this.file, e.offset, e.offset + 30);
    if (u32(head, 0) !== 0x04034b50) throw new Error(`${name} 을(를) 읽지 못했습니다(깨진 ZIP)`);
    const start = e.offset + 30 + u16(head, 26) + u16(head, 28);
    const raw = this.file.slice(start, start + e.compSize).stream() as ReadableStream<Uint8Array>;
    if (e.method === 0) return raw;
    if (e.method === 8) return raw.pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
    throw new Error(`${name} 은(는) 이 브라우저가 풀 수 없는 방식으로 압축됐습니다`);
  }

  async blob(name: string, type = ''): Promise<Blob> {
    return new Response(await this.stream(name)).blob().then((b) => (type ? new Blob([b], { type }) : b));
  }

  /** UTF-8 글 - Response 가 바이트를 글로 푼다 */
  async text(name: string): Promise<string> {
    return new Response(await this.stream(name)).text();
  }
}

/* ── 정리한 모습 ───────────────────────────────────────── */

export interface CfUser {
  key: string;
  /** 보이는 이름 - HTML 내보내기에만 있다 */
  displayName?: string;
  /** Cloud 는 메일, DC 는 사용자 이름 */
  name?: string;
  email?: string;
  accountId?: string;
}

export interface CfAttachment {
  id: string;
  /** 붙어 있는 문서(Confluence id) */
  pageId: string;
  filename: string;
  mime: string;
  size: number;
  /** ZIP 안의 경로 - 못 찾았으면 null */
  path: string | null;
}

export interface CfComment {
  id: string;
  pageId: string;
  parentId: string | null;
  author: string | null;
  created: string | null;
  body: string;
  /** 본문 조각에 단 댓글 - 고른 글 */
  selection?: string;
  resolved?: boolean;
}

export interface CfPage {
  id: string;
  title: string;
  kind: 'page' | 'blog' | 'folder';
  parentId: string | null;
  position: number | null;
  /** XML 내보내기: 저장 형식 · HTML 내보내기: #main-content 의 HTML. 폴더는 '' */
  body: string;
  format: 'storage' | 'html';
  labels: string[];
  creator: string | null;
  created: string | null;
  modifier: string | null;
  modified: string | null;
  /** 블로그 글을 쓴 날(YYYY/MM/DD) - ri:blog-post 링크를 찾을 때 */
  postingDay?: string;
  /** 문서 제목 이모지(Cloud) - 위키 문서의 아이콘으로 */
  icon?: string;
}

export interface CfTemplate {
  id: string;
  name: string;
  description: string;
  body: string;
  labels: string[];
}

export interface CfSpace {
  key: string;
  name: string;
  homeId: string | null;
}

/** 첨부 파일을 꺼내는 곳 - ZIP, 또는 Word 내보내기(.doc) 안의 조각 */
export interface FileSource {
  blob(path: string, type?: string): Promise<Blob>;
}

export interface CfExport {
  format: 'xml' | 'html' | 'page';
  source: 'cloud' | 'server' | 'unknown';
  space: CfSpace;
  pages: CfPage[];
  attachments: CfAttachment[];
  comments: CfComment[];
  templates: CfTemplate[];
  users: Map<string, CfUser>;
  /** Confluence 주소(내보낸 HTML 의 data-base-url) - 옮기지 않은 링크를 그쪽으로 */
  baseUrl: string | null;
  zip: FileSource;
  /** 읽으며 생긴 일 */
  notes: string[];
}

/** ZIP 하나 → 내보내기. Confluence 내보내기가 아니면 까닭을 담은 오류 */
export async function readConfluenceZip(file: Blob, progress?: (text: string) => void): Promise<CfExport> {
  const zip = await Zip.open(file);
  const entities = zip.find((n) => /(^|\/)\s*entities\.xml$/i.test(n));
  if (entities) return readXml(zip, entities, progress);
  const csv = zip.find((n) => /(^|\/)(content|spaces)\.csv(\.gz)?$/i.test(n));
  if (csv) throw new Error('Confluence 의 CSV 내보내기는 읽지 못합니다. 스페이스 설정 > 내보내기에서 XML(권장) 이나 HTML 로 내보내 주세요');
  const index = [...zip.entries.keys()].filter((n) => /(^|\/)index\.html$/i.test(n)).sort((a, b) => a.split('/').length - b.split('/').length)[0];
  if (index) return readHtml(zip, index, progress);
  throw new Error('Confluence 스페이스 내보내기(XML · HTML) ZIP 이 아닙니다. entities.xml 이나 index.html 이 없습니다');
}

/* ── XML 내보내기 ──────────────────────────────────────── */

type Ref = { cls: string; id: string };
interface Obj {
  cls: string;
  id: string;
  props: Map<string, string>;
  refs: Map<string, Ref>;
  colls: Map<string, Ref[]>;
}

/** 쓰는 객체만 남긴다 */
const KEEP = new Set([
  'Space', 'Page', 'BlogPost', 'BodyContent', 'Attachment', 'Comment', 'ContentProperty', 'Labelling', 'Label',
  'ConfluenceUserImpl', 'PageTemplate',
]);

const XML_TEXT_ENT: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
const xmlText = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|amp|quot|apos);/gi, (_, e: string) => {
  if (e[0] === '#') {
    const cp = e[1] === 'x' || e[1] === 'X' ? Number.parseInt(e.slice(2), 16) : Number.parseInt(e.slice(1), 10);
    try { return String.fromCodePoint(cp); } catch { return ''; }
  }
  return XML_TEXT_ENT[e.toLowerCase()] ?? '';
});

/** 값 하나 - CDATA 가 여러 조각으로 나뉘었거나(]]]]><![CDATA[>) 글자 그대로일 수 있다 */
function readValue(xml: string, from: number, closeTag: string): { value: string; end: number } {
  let j = from;
  let value = '';
  for (;;) {
    while (j < xml.length && /\s/.test(xml[j])) j += 1;
    if (xml.startsWith('<![CDATA[', j)) {
      const end = xml.indexOf(']]>', j + 9);
      if (end < 0) return { value: value + xml.slice(j + 9), end: xml.length };
      value += xml.slice(j + 9, end);
      j = end + 3;
      continue;
    }
    break;
  }
  const close = xml.indexOf(closeTag, j);
  if (close < 0) return { value, end: xml.length };
  if (!value) value = xmlText(xml.slice(from, close).trim());
  return { value, end: close + closeTag.length };
}

/** <object> 하나 → 객체(속성 · 참조 · 모음) */
function parseObject(xml: string): Obj | null {
  const head = /^<object\s+class="([^"]+)"/.exec(xml);
  if (!head) return null;
  const obj: Obj = { cls: head[1], id: '', props: new Map(), refs: new Map(), colls: new Map() };
  let i = xml.indexOf('>') + 1;
  while (i < xml.length) {
    const lt = xml.indexOf('<', i);
    if (lt < 0) break;
    if (xml.startsWith('<id', lt) && !obj.id) {
      const gt = xml.indexOf('>', lt);
      const { value, end } = readValue(xml, gt + 1, '</id>');
      obj.id = value.trim();
      i = end;
      continue;
    }
    if (xml.startsWith('<property', lt)) {
      const gt = xml.indexOf('>', lt);
      const tag = xml.slice(lt, gt + 1);
      const name = /\sname="([^"]*)"/.exec(tag)?.[1] ?? '';
      if (tag.endsWith('/>')) {
        obj.props.set(name, '');
        i = gt + 1;
        continue;
      }
      const cls = /\sclass="([^"]*)"/.exec(tag)?.[1];
      if (cls && !tag.includes('enum-class')) {
        const idAt = xml.indexOf('<id', gt);
        const close = xml.indexOf('</property>', gt);
        if (idAt >= 0 && idAt < close) {
          const idGt = xml.indexOf('>', idAt);
          const { value } = readValue(xml, idGt + 1, '</id>');
          obj.refs.set(name, { cls, id: value.trim() });
        }
        i = close < 0 ? xml.length : close + 11;
        continue;
      }
      const { value, end } = readValue(xml, gt + 1, '</property>');
      obj.props.set(name, value);
      i = end;
      continue;
    }
    if (xml.startsWith('<collection', lt)) {
      const gt = xml.indexOf('>', lt);
      const tag = xml.slice(lt, gt + 1);
      const name = /\sname="([^"]*)"/.exec(tag)?.[1] ?? '';
      if (tag.endsWith('/>')) {
        i = gt + 1;
        continue;
      }
      const close = xml.indexOf('</collection>', gt);
      const inner = xml.slice(gt + 1, close < 0 ? xml.length : close);
      const items: Ref[] = [];
      for (const m of inner.matchAll(/<element\s+class="([^"]+)"[^>]*>\s*<id[^>]*>\s*(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))\s*<\/id>/g)) {
        items.push({ cls: m[1], id: (m[2] ?? m[3] ?? '').trim() });
      }
      obj.colls.set(name, items);
      i = close < 0 ? xml.length : close + 13;
      continue;
    }
    i = lt + 1;
  }
  return obj.id ? obj : null;
}

/** entities.xml 을 흘려 읽으며 <object> 마다 부른다 - 수백 MB 여도 한꺼번에 쥐지 않는다 */
async function scanObjects(stream: ReadableStream<Uint8Array>, each: (obj: Obj) => void, progress?: (n: number) => void) {
  const reader = stream.pipeThrough(new TextDecoderStream() as unknown as ReadableWritablePair<string, Uint8Array>).getReader();
  let buf = '';
  let count = 0;
  /** 객체의 끝 - CDATA 안의 </object> 는 건너뛴다 */
  const endOf = (from: number): number => {
    let k = from;
    for (;;) {
      const close = buf.indexOf('</object>', k);
      const cdata = buf.indexOf('<![CDATA[', k);
      if (close < 0) return -1;
      if (cdata >= 0 && cdata < close) {
        const cEnd = buf.indexOf(']]>', cdata + 9);
        if (cEnd < 0) return -1;
        k = cEnd + 3;
        continue;
      }
      return close;
    }
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buf += value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
    for (;;) {
      const start = buf.indexOf('<object ');
      if (start < 0) {
        if (buf.length > 1024) buf = buf.slice(-1024);
        break;
      }
      const end = endOf(start);
      if (end < 0) {
        if (start > 0) buf = buf.slice(start);
        break;
      }
      const xml = buf.slice(start, end + 9);
      buf = buf.slice(end + 9);
      const cls = /^<object\s+class="([^"]+)"/.exec(xml)?.[1];
      if (cls && KEEP.has(cls)) {
        const obj = parseObject(xml);
        if (obj) each(obj);
      }
      count += 1;
      if (count % 2000 === 0) progress?.(count);
    }
    if (done) break;
  }
}

const isCurrent = (o: Obj) => {
  const status = (o.props.get('contentStatus') ?? 'current').trim();
  return status === 'current' && !o.refs.has('originalVersion') && !(o.props.get('originalVersionId') ?? '').trim();
};

async function readXml(zip: Zip, entities: string, progress?: (text: string) => void): Promise<CfExport> {
  const notes: string[] = [];
  const descName = zip.find((n) => /(^|\/)exportDescriptor\.properties$/i.test(n));
  const desc: Record<string, string> = {};
  if (descName) {
    (await zip.text(descName)).split(/\r?\n/).forEach((l) => {
      const m = /^([\w.]+)\s*=\s*(.*)$/.exec(l);
      if (m) desc[m[1]] = m[2].trim();
    });
  }
  const byCls = new Map<string, Map<string, Obj>>();
  progress?.('entities.xml 을 읽는 중…');
  await scanObjects(await zip.stream(entities), (o) => {
    let m = byCls.get(o.cls);
    if (!m) { m = new Map(); byCls.set(o.cls, m); }
    m.set(o.id, o);
  }, (n) => progress?.(`entities.xml 을 읽는 중… 항목 ${n.toLocaleString('ko-KR')}개`));
  const all = (cls: string) => [...(byCls.get(cls)?.values() ?? [])];
  const get = (cls: string, id: string | undefined) => (id ? byCls.get(cls)?.get(id) : undefined);

  // 스페이스 - 설명서의 키를 고른다(하나의 내보내기에 여러 개가 섞이는 버그가 있다)
  const spaces = all('Space');
  const spaceObj = spaces.find((s) => (s.props.get('key') ?? '') === desc.spaceKey) ?? spaces[0];
  if (!spaceObj) throw new Error('entities.xml 에 스페이스가 없습니다');
  const space: CfSpace = {
    key: spaceObj.props.get('key') ?? desc.spaceKey ?? '',
    name: spaceObj.props.get('name') ?? spaceObj.props.get('key') ?? '스페이스',
    homeId: spaceObj.refs.get('homePage')?.id ?? null,
  };
  const inSpace = (o: Obj) => !o.refs.get('space') || o.refs.get('space')!.id === spaceObj.id;

  // 본문 - BodyContent.content 가 주인을 가리킨다
  const bodies = new Map<string, { body: string; type: string }>();
  all('BodyContent').forEach((b) => {
    const owner = b.refs.get('content')?.id;
    if (!owner) return;
    const type = (b.props.get('bodyType') ?? '2').trim();
    // 중첩 CDATA 는 ']] >' 로 적혀 있다
    bodies.set(owner, { body: (b.props.get('body') ?? '').replace(/\]\] >/g, ']]>'), type });
  });
  const bodyOf = (o: Obj) => {
    const direct = bodies.get(o.id);
    if (direct) return direct;
    for (const r of o.colls.get('bodyContents') ?? []) {
      const b = get('BodyContent', r.id);
      if (b) return { body: (b.props.get('body') ?? '').replace(/\]\] >/g, ']]>'), type: (b.props.get('bodyType') ?? '2').trim() };
    }
    return { body: '', type: '2' };
  };
  const storageOf = (o: Obj, title: string) => {
    const { body, type } = bodyOf(o);
    if (type === '0') {
      notes.push(`'${title}' 은(는) 옛 위키 마크업으로 저장된 문서라 글자 그대로 옮겼습니다`);
      return `<ac:structured-macro ac:name="unmigrated-wiki-markup"><ac:plain-text-body><![CDATA[${body.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-body></ac:structured-macro>`;
    }
    return body;
  };

  // 라벨 - Labelling(내용 ↔ 라벨). 개인 라벨(my:)과 스페이스 분류(team:)는 뺀다
  const labelsOf = new Map<string, string[]>();
  all('Labelling').forEach((l) => {
    const label = get('Label', l.refs.get('label')?.id);
    const target = l.refs.get('content')?.id ?? l.refs.get('pageTemplate')?.id ?? (l.props.get('labelableId') ?? '').trim();
    if (!label || !target) return;
    const ns = (label.props.get('namespace') ?? 'global').trim();
    if (ns !== 'global') return;
    const name = (label.props.get('name') ?? '').trim();
    if (!name) return;
    const list = labelsOf.get(target) ?? [];
    if (!list.includes(name)) list.push(name);
    labelsOf.set(target, list);
  });

  // 문서의 속성(ContentProperty) - 문서 쪽 모음(contentProperties)이나 속성 쪽 content 로 잇는다
  const cpByOwner = new Map<string, Record<string, string>>();
  all('ContentProperty').forEach((cp) => {
    const owner = cp.refs.get('content')?.id;
    const name = (cp.props.get('name') ?? '').trim();
    if (!owner || !name) return;
    const rec = cpByOwner.get(owner) ?? {};
    rec[name] = (cp.props.get('stringValue') ?? '').trim();
    cpByOwner.set(owner, rec);
  });
  const pageEmoji = (o: Obj) => {
    for (const r of o.colls.get('contentProperties') ?? []) {
      const cp = get('ContentProperty', r.id);
      if (cp && (cp.props.get('name') ?? '').trim() === 'emoji-title-published') return emojiFromProp(cp.props.get('stringValue'));
    }
    return emojiFromProp(cpByOwner.get(o.id)?.['emoji-title-published']);
  };

  const userKey = (o: Obj, ref: string, old: string) => o.refs.get(ref)?.id ?? (o.props.get(old) ?? '').trim() ?? null;
  const date = (o: Obj, name: string) => (o.props.get(name) ?? '').trim() || null;

  // 문서 · 블로그 - 지금 판만(옛 판 · 초안 · 지운 것 · 보관한 것은 뺀다)
  const pages: CfPage[] = [];
  const pageIds = new Set<string>();
  for (const cls of ['Page', 'BlogPost'] as const) {
    all(cls).filter((o) => isCurrent(o) && inSpace(o)).forEach((o) => {
      const title = (o.props.get('title') ?? '').trim() || '제목 없는 문서';
      const pos = Number.parseInt(o.props.get('position') ?? '', 10);
      const created = date(o, 'creationDate');
      pages.push({
        id: o.id, title, kind: cls === 'Page' ? 'page' : 'blog',
        parentId: cls === 'Page' ? o.refs.get('parent')?.id ?? null : null,
        position: Number.isFinite(pos) ? pos : null,
        body: storageOf(o, title), format: 'storage',
        labels: labelsOf.get(o.id) ?? [],
        creator: userKey(o, 'creator', 'creatorName'), created,
        modifier: userKey(o, 'lastModifier', 'lastModifierName'), modified: date(o, 'lastModificationDate'),
        postingDay: cls === 'BlogPost' && created ? created.slice(0, 10).replace(/-/g, '/') : undefined,
        icon: pageEmoji(o),
      });
      pageIds.add(o.id);
    });
  }
  // 위 문서가 빠진 쪽(children · childrens 에만 적힌 관계)을 메운다
  all('Page').filter((o) => pageIds.has(o.id)).forEach((o) => {
    [...(o.colls.get('children') ?? []), ...(o.colls.get('childrens') ?? [])].forEach((c) => {
      const child = pages.find((p) => p.id === c.id);
      if (child && !child.parentId) child.parentId = o.id;
    });
  });
  pages.forEach((p) => {
    if (p.parentId && !pageIds.has(p.parentId)) p.parentId = null;
  });

  // 첨부 - 지금 판, 문서에 붙은 것. 파일은 attachments/<문서>/<첨부>/<판> (옛 꼴은 판 없이)
  const propsOf = (o: Obj) => {
    const out: Record<string, string> = {};
    (o.colls.get('contentProperties') ?? []).forEach((r) => {
      const cp = get('ContentProperty', r.id);
      if (!cp) return;
      const name = (cp.props.get('name') ?? '').trim();
      const v = (cp.props.get('stringValue') ?? '').trim() || (cp.props.get('longValue') ?? '').trim();
      if (name) out[name] = v;
    });
    return out;
  };
  const attachments: CfAttachment[] = [];
  all('Attachment').filter((o) => isCurrent(o)).forEach((o) => {
    const pageId = o.refs.get('containerContent')?.id ?? o.refs.get('content')?.id ?? '';
    if (!pageIds.has(pageId)) return;
    const cp = propsOf(o);
    const filename = (o.props.get('title') ?? o.props.get('fileName') ?? '').trim();
    const version = (o.props.get('version') ?? o.props.get('attachmentVersion') ?? '1').trim() || '1';
    const base = `attachments/${pageId}/${o.id}`;
    let path: string | null = null;
    const prefix = zip.find((n) => n.endsWith(`${base}/${version}`)) ?? zip.find((n) => n.endsWith(base));
    if (prefix) path = prefix;
    else {
      // 판 번호가 다를 때 - 그 첨부 폴더의 가장 큰 판
      const vers = [...zip.entries.keys()].filter((n) => n.includes(`${base}/`)).sort((a, b) => Number(b.split('/').pop()) - Number(a.split('/').pop()));
      path = vers[0] ?? null;
    }
    attachments.push({
      id: o.id, pageId, filename: filename || `첨부-${o.id}`,
      mime: (cp.MEDIA_TYPE || o.props.get('contentType') || '').trim() || mimeOf(filename),
      size: Number(cp.FILESIZE || o.props.get('fileSize') || 0) || (path ? zip.entries.get(path)?.size ?? 0 : 0),
      path,
    });
  });
  if (desc.backupAttachments === 'false') notes.push('첨부 파일을 빼고 내보낸 ZIP 입니다. 첨부 파일은 옮기지 못합니다');

  // 댓글 - 지금 판. 본문 조각에 단 댓글은 고른 글 · 해결 여부를 함께
  const comments: CfComment[] = [];
  all('Comment').filter((o) => isCurrent(o)).forEach((o) => {
    const pageId = o.refs.get('containerContent')?.id ?? o.refs.get('owner')?.id ?? '';
    if (!pageIds.has(pageId)) return;
    const cp = propsOf(o);
    const inline = cp['inline-comment'] === 'true' || cp.actualCommentType === 'inline';
    comments.push({
      id: o.id, pageId, parentId: o.refs.get('parent')?.id ?? null,
      author: userKey(o, 'creator', 'creatorName'), created: date(o, 'creationDate'),
      body: bodyOf(o).body,
      ...(inline ? { selection: cp['inline-original-selection'] ?? '', resolved: cp.status === 'resolved' } : {}),
    });
  });

  // 양식 - 이름마다 가장 새 판
  const tByName = new Map<string, Obj>();
  all('PageTemplate').filter(inSpace).forEach((o) => {
    const name = (o.props.get('name') ?? '').trim();
    if (!name || (o.props.get('originalVersionId') ?? '').trim() || o.refs.has('originalVersion')) return;
    const prev = tByName.get(name);
    if (!prev || Number(o.props.get('version') ?? 0) > Number(prev.props.get('version') ?? 0)) tByName.set(name, o);
  });
  const templates: CfTemplate[] = [...tByName.values()].map((o) => ({
    id: o.id, name: (o.props.get('name') ?? '').trim(), description: (o.props.get('description') ?? '').trim(),
    body: (o.props.get('content') ?? '').replace(/\]\] >/g, ']]>'), labels: labelsOf.get(o.id) ?? [],
  }));

  // 사람 - Cloud 는 메일(name) · 계정 id, DC 는 사용자 이름 · 메일. 보이는 이름은 없다
  const users = new Map<string, CfUser>();
  all('ConfluenceUserImpl').forEach((o) => {
    const name = (o.props.get('name') ?? '').trim();
    users.set(o.id, {
      key: o.id, name: name || undefined,
      email: (o.props.get('email') ?? '').trim() || (name.includes('@') ? name : undefined),
      accountId: (o.props.get('atlassianAccountId') ?? '').trim() || undefined,
    });
  });

  return {
    format: 'xml', source: desc.source === 'cloud' ? 'cloud' : desc.source === 'server' ? 'server' : 'unknown',
    space, pages, attachments, comments, templates, users, baseUrl: null, zip, notes,
  };
}

/* ── HTML 내보내기 ─────────────────────────────────────── */

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const idOfFile = (href: string) => /(?:^|[/_])(\d+)\.html(?:[#?].*)?$/.exec(href)?.[1] ?? null;

async function readHtml(zip: Zip, indexName: string, progress?: (text: string) => void): Promise<CfExport> {
  const notes: string[] = [];
  const root = indexName.slice(0, indexName.length - 'index.html'.length);
  const index = parseHtml(await zip.text(indexName));

  // 스페이스 이름 · 키 - 정보 표(Key · Name), 없으면 <title> 'KEY (이름)'
  const info: Record<string, string> = {};
  index.querySelectorAll('#main-content table tr').forEach((tr) => {
    const th = tr.querySelector('th')?.textContent?.trim();
    const td = tr.querySelector('td')?.textContent?.trim();
    if (th && td) info[th.toLowerCase()] = td;
  });
  const titleM = /^(.+?)\s*\((.+)\)\s*$/.exec(index.title.trim());
  const space: CfSpace = {
    key: info.key ?? titleM?.[1] ?? root.replace(/\/$/, ''),
    name: info.name ?? titleM?.[2] ?? root.replace(/\/$/, '') ?? '스페이스',
    homeId: null,
  };

  // 트리 - "Available Pages" 아래의 겹친 목록. 아래 문서마다 따로 <ul> 이 붙는다
  const order: { id: string; title: string; parentId: string | null; position: number }[] = [];
  const heading = [...index.querySelectorAll('h2')].find((h) => /Available Pages|사용 가능한 페이지|페이지/i.test(h.textContent ?? ''));
  const section = heading?.closest('.pageSection') ?? heading?.parentElement?.parentElement ?? index.body;
  const walk = (ul: Element, parentId: string | null) => {
    Array.from(ul.children).filter((li) => li.nodeName === 'LI').forEach((li) => {
      const a = Array.from(li.children).find((c) => c.nodeName === 'A') as HTMLAnchorElement | undefined;
      const id = a ? idOfFile(a.getAttribute('href') ?? '') : null;
      if (id && !order.some((o) => o.id === id)) {
        order.push({ id, title: (a!.textContent ?? '').trim(), parentId, position: order.length });
        if (!space.homeId && li.querySelector(':scope > img[src*="home_page"]')) space.homeId = id;
      }
      Array.from(li.children).filter((c) => c.nodeName === 'UL').forEach((sub) => walk(sub, id ?? parentId));
    });
  };
  Array.from(section.querySelectorAll(':scope ul')).filter((ul) => !ul.parentElement?.closest('ul')).forEach((ul) => walk(ul, null));

  // 트리에 없는 문서 파일(고아 문서)도 맨 위에
  const files = [...zip.entries.keys()].filter((n) => n.startsWith(root) && !n.slice(root.length).includes('/') && /\.html$/i.test(n) && !/index\.html$/i.test(n));
  files.forEach((f) => {
    const id = idOfFile(f);
    if (id && !order.some((o) => o.id === id)) order.push({ id, title: '', parentId: null, position: order.length });
  });

  const users = new Map<string, CfUser>();
  const pages: CfPage[] = [];
  const attachments: CfAttachment[] = [];
  let baseUrl: string | null = null;
  const fileOf = (id: string) => files.find((f) => idOfFile(f) === id);
  let n = 0;
  for (const o of order) {
    n += 1;
    progress?.(`문서를 읽는 중… ${n}/${order.length}`);
    const f = fileOf(o.id);
    if (!f) continue;
    const doc = parseHtml(await zip.text(f));
    const titleText = (doc.querySelector('#title-text')?.textContent ?? doc.title ?? '').replace(/\s+/g, ' ').trim();
    const prefix = `${space.name} : `;
    const title = (o.title || (titleText.startsWith(prefix) ? titleText.slice(prefix.length) : titleText.replace(/^.*? : /, ''))).trim() || '제목 없는 문서';
    const main = doc.querySelector('#main-content');
    // 폴더는 본문이 없다. 화이트보드 · 데이터베이스는 빈 안내만 있다
    const placeholder = !!doc.querySelector('#main-content-2');
    if (placeholder) notes.push(`'${title}' 은(는) Confluence 화이트보드 · 데이터베이스라 내용을 옮기지 못했습니다`);
    // 부모 - 트리가 없으면 이동 경로(breadcrumbs)의 마지막
    let parentId = o.parentId;
    if (!parentId && !order.some((x) => x.id === o.id && x.title)) {
      const crumbs = [...doc.querySelectorAll('#breadcrumbs a')].map((a) => idOfFile(a.getAttribute('href') ?? '')).filter(Boolean) as string[];
      parentId = crumbs.at(-1) ?? null;
    }
    // 사람 - 언급의 보이는 이름 · 계정 id
    doc.querySelectorAll('a.confluence-userlink, a.user-mention, a[data-linked-resource-type="userinfo"]').forEach((a) => {
      const key = a.getAttribute('data-account-id') ?? a.getAttribute('data-username') ?? '';
      const name = (a.textContent ?? '').trim();
      if (key && name && !users.has(key)) users.set(key, { key, displayName: name, accountId: a.getAttribute('data-account-id') ?? undefined, name: a.getAttribute('data-username') ?? undefined });
    });
    baseUrl ??= doc.querySelector('[data-base-url]')?.getAttribute('data-base-url') ?? null;
    // 첨부 - "Attachments:" 목록이 진짜 파일 이름을 들고 있다
    const attHead = doc.querySelector('#attachments');
    const attSection = attHead?.closest('.pageSection');
    attSection?.querySelectorAll('a[href]').forEach((a) => {
      const href = (a.getAttribute('href') ?? '').split('?')[0];
      const m = /^attachments\/(\d+)\/(\d+)(\.[^/]*)?$/.exec(href);
      if (!m) return;
      const after = a.nextSibling?.textContent ?? '';
      const mime = /\(([\w.+-]+\/[\w.+-]+)\)/.exec(after)?.[1] ?? mimeOf(a.textContent ?? '');
      const path = `${root}${href}`;
      if (attachments.some((x) => x.id === m[2])) return;
      attachments.push({
        id: m[2], pageId: o.id, filename: (a.textContent ?? '').trim() || m[2], mime,
        size: zip.entries.get(path)?.size ?? 0, path: zip.has(path) ? path : null,
      });
    });
    const author = doc.querySelector('.page-metadata .author')?.textContent?.trim() || null;
    const editor = doc.querySelector('.page-metadata .editor')?.textContent?.trim() || null;
    const when = /\bon\s+(.+?)\s*$/.exec((doc.querySelector('.page-metadata')?.textContent ?? '').replace(/\s+/g, ' ').trim())?.[1] ?? null;
    pages.push({
      id: o.id, title, kind: main ? 'page' : 'folder', parentId: parentId && parentId !== o.id ? parentId : null, position: o.position,
      body: main && !placeholder ? main.innerHTML : '', format: 'html', labels: [],
      creator: author, created: null, modifier: editor ?? author, modified: when,
    });
  }
  const ids = new Set(pages.map((p) => p.id));
  pages.forEach((p) => {
    if (p.parentId && !ids.has(p.parentId)) p.parentId = null;
  });
  // 본문에만 나오는 첨부(다른 문서의 그림 등) - 경로로 찾는다
  [...zip.entries.keys()].filter((k) => k.startsWith(`${root}attachments/`)).forEach((k) => {
    const m = /attachments\/(\d+)\/(\d+)(\.[^/]*)?$/.exec(k);
    if (!m || attachments.some((x) => x.id === m[2])) return;
    attachments.push({ id: m[2], pageId: m[1], filename: `${m[2]}${m[3] ?? ''}`, mime: mimeOf(k), size: zip.entries.get(k)?.size ?? 0, path: k });
  });
  if (!pages.length) throw new Error('HTML 내보내기에서 문서를 찾지 못했습니다');
  notes.push('HTML 내보내기에는 라벨 · 댓글 · 블로그 글 · 양식이 들어 있지 않습니다. 함께 옮기려면 XML 로 내보내 주세요');
  return {
    format: 'html', source: baseUrl && /atlassian\.net/.test(baseUrl) ? 'cloud' : 'unknown',
    space, pages, attachments, comments: [], templates: [], users, baseUrl, zip, notes,
  };
}

/* ── 문서 한 개 - HTML · Word(.doc) · 저장 형식(.xml) ─────── */

const NO_FILES: FileSource = { blob: () => Promise.reject(new Error('파일이 없습니다')) };

/** 한 문서짜리 내보내기 */
function onePage(title: string, body: string, format: 'storage' | 'html', extra: Partial<CfExport> = {}): CfExport {
  const id = 'page-1';
  return {
    format: 'page', source: 'unknown', space: { key: '', name: title, homeId: null },
    pages: [{ id, title, kind: 'page', parentId: null, position: 0, body, format, labels: [], creator: null, created: null, modifier: null, modified: null }],
    attachments: [], comments: [], templates: [], users: new Map(), baseUrl: null, zip: NO_FILES, notes: [], ...extra,
  };
}

/**
 * 문서 한 개 - Confluence 의 문서 HTML(내보낸 .html), Word 로 내보내기(.doc = 여러 조각을 담은 MIME 문서),
 * 저장 형식 조각(.xml). 그림은 Word 내보내기에만 함께 들어 있다
 */
export async function readSingleFile(file: File): Promise<CfExport> {
  const text = await file.text();
  const head = text.slice(0, 2000);
  if (/^\s*(MIME-Version:|Date:|From:|Content-Type:\s*multipart\/related)/im.test(head) && /multipart\/related/i.test(head)) {
    return readMhtml(text, file.name);
  }
  if (/\.(xml|txt)$/i.test(file.name) || /^\s*<(ac:|ri:|p[\s>]|h[1-6][\s>]|table[\s>]|ul[\s>]|ol[\s>])/i.test(text)) {
    if (/<hibernate-generic/i.test(head)) throw new Error('entities.xml 만으로는 읽지 못합니다. Confluence 가 만든 내보내기 ZIP 파일을 그대로 넣어 주세요');
    return onePage(file.name.replace(/\.[^.]+$/, '') || '가져온 문서', text, 'storage');
  }
  const doc = parseHtml(text);
  const main = doc.querySelector('#main-content') ?? doc.body;
  const titleText = (doc.querySelector('#title-text')?.textContent ?? doc.title ?? '').replace(/\s+/g, ' ').trim();
  const title = titleText.replace(/^.*? : /, '') || file.name.replace(/\.[^.]+$/, '') || '가져온 문서';
  const out = onePage(title, main.innerHTML, 'html', { baseUrl: doc.querySelector('[data-base-url]')?.getAttribute('data-base-url') ?? null });
  if (/attachments\//.test(main.innerHTML)) out.notes.push('문서 파일만 넣어 그림 · 첨부 파일은 옮기지 못합니다. 스페이스 내보내기 ZIP 을 넣으면 함께 옮깁니다');
  return out;
}

/** quoted-printable → 바이트 */
function qpBytes(s: string): Uint8Array {
  const body = s.replace(/=\r?\n/g, '');
  const out: number[] = [];
  const enc = new TextEncoder();
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i];
    if (c === '=' && /^[0-9A-Fa-f]{2}$/.test(body.slice(i + 1, i + 3))) {
      out.push(Number.parseInt(body.slice(i + 1, i + 3), 16));
      i += 2;
    } else out.push(...enc.encode(c));
  }
  return new Uint8Array(out);
}

function b64Bytes(s: string): Uint8Array {
  const bin = atob(s.replace(/[^A-Za-z0-9+/=]/g, ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/** Word 로 내보낸 Confluence 문서(MIME) - HTML 조각과 그림 조각 */
function readMhtml(text: string, fileName: string): CfExport {
  const boundary = /boundary="?([^";\r\n]+)"?/i.exec(text)?.[1];
  if (!boundary) throw new Error('Word 로 내보낸 Confluence 문서를 읽지 못했습니다');
  const parts = text.split(`--${boundary}`).slice(1);
  const files = new Map<string, { type: string; bytes: Uint8Array }>();
  let html = '';
  parts.forEach((part) => {
    const split = part.search(/\r?\n\r?\n/);
    if (split < 0) return;
    const headers = part.slice(0, split).replace(/\r?\n[ \t]+/g, ' ');
    const body = part.slice(split).replace(/^\r?\n\r?\n/, '');
    const h = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, 'im').exec(headers)?.[1]?.trim() ?? '';
    const type = h('Content-Type').split(';')[0].toLowerCase();
    const encoding = h('Content-Transfer-Encoding').toLowerCase();
    const location = h('Content-Location') || h('Content-ID').replace(/^<|>$/g, '');
    const bytes = encoding === 'base64' ? b64Bytes(body) : encoding === 'quoted-printable' ? qpBytes(body) : new TextEncoder().encode(body);
    if (type === 'text/html' && !html) {
      const charset = /charset="?([\w-]+)"?/i.exec(h('Content-Type'))?.[1] ?? 'utf-8';
      try { html = new TextDecoder(charset).decode(bytes); } catch { html = new TextDecoder('utf-8').decode(bytes); }
    } else if (location) files.set(location, { type, bytes });
  });
  if (!html) throw new Error('Word 로 내보낸 문서에서 본문을 찾지 못했습니다');
  const doc = parseHtml(html);
  const title = (doc.title || fileName.replace(/\.[^.]+$/, '')).replace(/^.*? : /, '').trim() || '가져온 문서';
  const attachments: CfAttachment[] = [...files.entries()].map(([loc, f], i) => ({
    id: `part-${i}`, pageId: 'page-1', filename: decodeURIComponent(loc.split(/[\\/]/).pop() ?? `file-${i}`), mime: f.type || mimeOf(loc), size: f.bytes.length, path: loc,
  }));
  const source: FileSource = {
    blob: async (path, type) => {
      const f = files.get(path);
      if (!f) throw new Error('파일이 없습니다');
      return new Blob([f.bytes as BlobPart], { type: type || f.type });
    },
  };
  return onePage(title, doc.body.innerHTML, 'html', { attachments, zip: source });
}

/* ── 파일 형식 ─────────────────────────────────────────── */

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  bmp: 'image/bmp', pdf: 'application/pdf', txt: 'text/plain', csv: 'text/csv', md: 'text/markdown', json: 'application/json',
  zip: 'application/zip', '7z': 'application/x-7z-compressed', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', hwp: 'application/x-hwp',
  hwpx: 'application/vnd.hancom.hwpx', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg',
  m4a: 'audio/mp4', wav: 'audio/wav', xml: 'text/xml', html: 'text/html', drawio: 'application/octet-stream',
};

export function mimeOf(name: string): string {
  const ext = /\.([a-z0-9]{1,8})$/i.exec(name.trim())?.[1]?.toLowerCase() ?? '';
  return MIME[ext] ?? 'application/octet-stream';
}

/** 위키 그림으로 보일 수 있는 형식 */
export const isWebImage = (mime: string) => /^image\/(png|jpe?g|gif|webp)$/.test(mime);

/**
 * Cloud 문서 제목 이모지 - ContentProperty 'emoji-title-published' 의 값은 코드 포인트(1f680),
 * 이어 붙인 것(1f469-200d-1f4bb · 1f1f0-1f1f7), 또는 그것을 따옴표로 감싼 JSON 글이다. 이모지가 아니면 버린다
 */
export function emojiFromProp(raw: string | undefined): string | undefined {
  const v = (raw ?? '').trim().replace(/^"+|"+$/g, '');
  if (!/^[0-9a-f]{2,6}(?:-[0-9a-f]{2,6}){0,7}$/i.test(v)) return undefined;
  try {
    const s = String.fromCodePoint(...v.split('-').map((h) => Number.parseInt(h, 16)));
    // 키캡(#️⃣)은 그림 글자가 아닌 글자 + 둘러싸는 표시(20e3)로 된다
    return /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(s) || s.includes(String.fromCharCode(0x20e3)) ? s : undefined;
  } catch {
    return undefined;
  }
}
