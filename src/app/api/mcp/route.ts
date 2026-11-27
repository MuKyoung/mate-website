/**
 * 팀 위키 MCP 서버 - Claude Code · Codex · VS Code 같은 AI 도구가 팀 위키를 찾고 읽고, 허용한 열쇠는 고친다.
 *
 *   주소      https://devteammate.co.kr/api/mcp/   (이 사이트는 주소 끝에 / 를 붙인다)
 *   열쇠      Authorization: Bearer mtw_…   - Hub 위키 왼쪽 아래 'AI 연결'에서 사람마다 만든다(McpConnect.tsx)
 *   방식      MCP Streamable HTTP. 요청마다 JSON 으로 바로 답한다(세션 · SSE 없음)
 *   읽기      wiki_search(낱말로 찾기) · wiki_list(문서 트리) · wiki_read(문서 하나의 본문)
 *   쓰기      wiki_create(새 문서) · wiki_update(고치기 · 덧붙이기 · 옮기기) · wiki_trash(휴지통) - '쓰기 허용'을 켠 열쇠만
 *
 * 열쇠 확인과 읽기 · 쓰기는 DB 함수(tm_mcp_*)가 한다 - supabase/taskmanager.sql 'AI 도구(MCP) 연결 열쇠'.
 * 서버는 공개 키(anon)로 그 함수만 부르고, 끊은 열쇠 · 읽기 전용 열쇠 · 휴지통 문서 · 그사이 바뀐 문서는 DB 가 막는다
 */

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const TOKEN = /^mtw_[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** 맨 위 문서(팀 위키 자체) - 트리의 뿌리 */
const HOME = '00000000-0000-4000-8000-000000000001';
/** 한 번에 돌려줄 본문 길이 - 넘으면 이어 읽을 자리(offset)를 알려 준다 */
const CHUNK = 60_000;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
interface RpcMsg { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> }
interface DocRow { id: string; parent_id: string | null; title: string; icon: string; labels: string[]; sort: number; updated_at: string; size: number }
interface FullDoc { id: string; parent_id: string | null; title: string; icon: string; labels: string[]; body: string; updated_at: string; updated_by: string }
interface SearchRow { id: string; title: string; icon: string; snippet: string; updated_at: string }
interface Saved { id: string; updated_at: string }

class AuthError extends Error {}

const WRITES = new Set(['tm_mcp_create', 'tm_mcp_update', 'tm_mcp_trash']);

/** DB 함수 부르기. 열쇠가 맞지 않으면 AuthError, DB 가 까닭을 알린 오류(P0001)는 그 글 그대로 */
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (res.ok) return (await res.json()) as T;
  const err = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
  const write = WRITES.has(fn);
  if (err?.code === '28000') throw new AuthError(err.message ?? '연결 열쇠가 맞지 않습니다');
  if (err?.code === 'PGRST202' || err?.code === '42883') {
    throw new Error(write
      ? '팀 위키 쓰기가 아직 준비되지 않았습니다(DB 함수 없음). 관리자가 supabase/taskmanager.sql 의 \'AI 도구(MCP) 연결 열쇠\' 블록을 다시 실행해야 합니다'
      : '팀 위키 MCP 가 아직 준비되지 않았습니다(DB 함수 없음). 관리자에게 알려 주세요');
  }
  if (err?.code === 'P0001' && err.message) throw new Error(err.message);
  if (err?.code === '22P02' || err?.code === '22007' || err?.code === '22008') throw new Error('id 나 판(expected_updated_at) 값의 모양이 맞지 않습니다');
  throw new Error(`팀 위키를 ${write ? '고치지' : '읽지'} 못했습니다(${res.status})`);
}

const titleOf = (d: { title: string }) => d.title.trim() || '제목 없음';
const day = (iso: string) => iso.slice(0, 10);

/** 문서 목록 → 부모별 자식(정렬 순서대로) */
function childrenMap(docs: DocRow[]) {
  const ids = new Set(docs.map((d) => d.id));
  const kids = new Map<string, DocRow[]>();
  for (const d of docs) {
    if (d.id === HOME) continue;
    // 부모가 보이지 않으면(맨 위 · 이상한 자리) 맨 위 문서 아래로 본다
    const p = d.parent_id && ids.has(d.parent_id) ? d.parent_id : HOME;
    kids.set(p, [...(kids.get(p) ?? []), d]);
  }
  return kids;
}

function pathOf(docs: DocRow[], id: string): string {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const names: string[] = [];
  let cur = byId.get(id);
  for (let i = 0; cur && i < 64; i += 1) {
    names.unshift(titleOf(cur));
    cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
  }
  return names.join(' / ');
}

/* ── 도구 ─────────────────────────────────────────────── */

const TOOLS = [
  {
    name: 'wiki_search',
    title: '팀 위키 찾기',
    description: 'MATE 팀 위키에서 낱말로 문서를 찾는다. 제목 · 라벨 · 본문에 낱말이 모두 든 문서를 제목에 든 것 먼저, 최근 고친 순으로 돌려준다(id · 제목 · 본문 일부). 찾은 문서의 전체 내용은 wiki_read 로 읽는다.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '찾을 낱말(띄어 쓰면 모두 든 문서). 한국어 · 영어' },
        limit: { type: 'integer', minimum: 1, maximum: 50, description: '최대 결과 수(기본 20)' },
      },
      required: ['query'],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'wiki_list',
    title: '팀 위키 문서 트리',
    description: 'MATE 팀 위키의 문서 트리(제목 · id · 고친 날)를 들여쓰기로 돌려준다. parent_id 를 주면 그 문서 아래만.',
    inputSchema: {
      type: 'object',
      properties: {
        parent_id: { type: 'string', description: '이 문서 아래만 보기(문서 id). 비우면 전체' },
        depth: { type: 'integer', minimum: 1, maximum: 20, description: '보여 줄 깊이(기본 전체)' },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'wiki_read',
    title: '팀 위키 문서 읽기',
    description: 'MATE 팀 위키 문서 하나의 본문(마크다운)과 위치 · 라벨 · 고친 사람 · 하위 문서 · 판(updated_at)을 돌려준다. id 를 모르면 title 로 찾는다(같거나 비슷한 제목). 본문이 길면 offset 으로 이어 읽는다. 고치기 전에 읽고, 판을 wiki_update 의 expected_updated_at 으로 넘긴다.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '문서 id(wiki_search · wiki_list 결과)' },
        title: { type: 'string', description: 'id 대신 제목으로 찾기' },
        offset: { type: 'integer', minimum: 0, description: '본문을 이 글자부터(긴 문서 이어 읽기)' },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'wiki_create',
    title: '팀 위키 문서 만들기',
    description: 'MATE 팀 위키에 새 문서를 만든다. 위 문서(parent_id 또는 parent_title) 아래 맨 끝에 놓이고, 둘 다 비우면 맨 위(카테고리)에 만든다. 본문은 마크다운(# 제목, 목록, 표, 코드 블록, 링크). 만든 사람은 열쇠 주인으로 적힌다. \'쓰기 허용\'을 켠 열쇠만 된다. 만들기 전에 wiki_search · wiki_list 로 같은 문서가 이미 있는지, 어디에 둘지 확인한다.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '문서 제목(200자까지)' },
        body: { type: 'string', description: '본문(마크다운). 비우면 빈 문서' },
        parent_id: { type: 'string', description: '위 문서 id. 비우면 맨 위' },
        parent_title: { type: 'string', description: 'parent_id 대신 위 문서 제목(같은 제목이 하나일 때)' },
        icon: { type: 'string', description: '문서 아이콘(이모지 하나, 예: 📘)' },
        labels: { type: 'array', items: { type: 'string' }, description: '라벨(20개까지)' },
      },
      required: ['title'],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'wiki_update',
    title: '팀 위키 문서 고치기',
    description: 'MATE 팀 위키 문서 하나를 고친다. 본문은 셋 중 하나로: body(통째로 바꾸기 - expected_updated_at 필수), append(끝에 덧붙이기), replace(본문의 글을 찾아 바꾸기 - 긴 문서의 일부만 고칠 때). title · icon · labels 는 준 것만 바꾸고, parent_id 를 주면 그 문서 아래 맨 끝으로 옮긴다("top" 이면 맨 위). wiki_read 의 판을 expected_updated_at 으로 주면 그사이 누가 고쳤을 때 덮어쓰지 않고 알린다(append · replace 는 읽은 판을 저절로 쓴다). 고치기 전 모습은 문서 기록에 남는다. \'쓰기 허용\'을 켠 열쇠만 된다.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '고칠 문서 id' },
        expected_updated_at: { type: 'string', description: 'wiki_read 가 준 판(updated_at) 그대로' },
        title: { type: 'string', description: '새 제목' },
        body: { type: 'string', description: '새 본문 전체(마크다운)' },
        append: { type: 'string', description: '본문 끝에 덧붙일 글(마크다운, 빈 줄 하나를 두고 붙인다)' },
        replace: {
          type: 'array',
          description: '본문에서 찾아 바꾸기(차례로). old 는 본문에 그대로 있는 글이고 한 곳이어야 한다(여러 곳이면 all: true)',
          items: {
            type: 'object',
            properties: {
              old: { type: 'string', description: '찾을 글(본문 그대로)' },
              new: { type: 'string', description: '바꿀 글(빈 글이면 지우기)' },
              all: { type: 'boolean', description: '여러 곳을 모두 바꾸기' },
            },
            required: ['old', 'new'],
          },
        },
        icon: { type: 'string', description: '새 아이콘(빈 글이면 지우기)' },
        labels: { type: 'array', items: { type: 'string' }, description: '새 라벨 전체(빈 배열이면 모두 지우기)' },
        parent_id: { type: 'string', description: '옮길 위 문서 id, 맨 위로는 "top"' },
      },
      required: ['id'],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'wiki_trash',
    title: '팀 위키 문서 휴지통에 넣기',
    description: 'MATE 팀 위키 문서를 휴지통에 넣는다. 그 아래 문서도 함께 보이지 않게 되고, 사람이 Hub 위키의 휴지통에서 되살릴 수 있다(아주 지우지는 않는다). 사용자가 지우라고 한 문서에만 쓴다. \'쓰기 허용\'을 켠 열쇠만 된다.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: '휴지통에 넣을 문서 id' } },
      required: ['id'],
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  },
] as const;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const int = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.trunc(n))) : dflt;
};

async function wikiSearch(token: string, args: Record<string, unknown>): Promise<string> {
  const query = str(args.query);
  if (!query) return '찾을 낱말(query)을 주세요.';
  const rows = await rpc<SearchRow[]>('tm_mcp_search', { p_token: token, p_query: query, p_limit: int(args.limit, 1, 50, 20) });
  if (!rows.length) return `'${query}' 가 든 문서가 없습니다. 다른 낱말로 찾거나 wiki_list 로 트리를 보세요.`;
  return [
    `'${query}' 찾은 문서 ${rows.length}개:`,
    ...rows.map((r) => `- ${r.icon ? `${r.icon} ` : ''}${titleOf(r)} (id: ${r.id}, 고친 날 ${day(r.updated_at)})\n  ${r.snippet || '(본문 없음)'}`),
  ].join('\n');
}

async function wikiList(token: string, args: Record<string, unknown>): Promise<string> {
  const docs = await rpc<DocRow[]>('tm_mcp_docs', { p_token: token });
  const kids = childrenMap(docs);
  const start = str(args.parent_id) || HOME;
  const maxDepth = int(args.depth, 1, 20, 20);
  const root = docs.find((d) => d.id === start);
  if (start !== HOME && !root) return `id ${start} 문서가 없거나 휴지통에 있습니다.`;
  const lines: string[] = [`${root ? titleOf(root) : '팀 위키'} (id: ${start}) - 문서 ${docs.length - (docs.some((d) => d.id === HOME) ? 1 : 0)}개 중 이 아래`];
  const walk = (id: string, depth: number) => {
    for (const d of kids.get(id) ?? []) {
      lines.push(`${'  '.repeat(depth)}- ${d.icon ? `${d.icon} ` : ''}${titleOf(d)} (id: ${d.id}, ${day(d.updated_at)}${d.size ? '' : ', 빈 문서'})`);
      if (depth < maxDepth) walk(d.id, depth + 1);
    }
  };
  walk(start, 1);
  if (lines.length === 1) lines.push('  (하위 문서 없음)');
  return lines.join('\n');
}

async function wikiRead(token: string, args: Record<string, unknown>): Promise<string> {
  let id = str(args.id);
  const title = str(args.title);
  let docs: DocRow[] | null = null;
  if (!id && title) {
    docs = await rpc<DocRow[]>('tm_mcp_docs', { p_token: token });
    const t = title.toLowerCase();
    const exact = docs.filter((d) => d.title.trim().toLowerCase() === t);
    const part = exact.length ? exact : docs.filter((d) => d.title.toLowerCase().includes(t));
    if (!part.length) return `제목이 '${title}' 인 문서가 없습니다. wiki_search 로 찾아 보세요.`;
    if (part.length > 1 && !exact.length) {
      return [`제목에 '${title}' 가 든 문서가 여럿입니다. id 로 다시 읽어 주세요:`, ...part.slice(0, 20).map((d) => `- ${titleOf(d)} (id: ${d.id})`)].join('\n');
    }
    id = part[0].id;
  }
  if (!UUID.test(id)) return '읽을 문서의 id(또는 title)를 주세요.';
  const [rows, all] = await Promise.all([
    rpc<FullDoc[]>('tm_mcp_doc', { p_token: token, p_id: id }),
    docs ? Promise.resolve(docs) : rpc<DocRow[]>('tm_mcp_docs', { p_token: token }),
  ]);
  const doc = rows[0];
  if (!doc) return `id ${id} 문서가 없거나 휴지통에 있습니다.`;
  const kids = childrenMap(all).get(doc.id) ?? [];
  const offset = int(args.offset, 0, Math.max(0, doc.body.length), 0);
  const part = doc.body.slice(offset, offset + CHUNK);
  const more = offset + CHUNK < doc.body.length;
  return [
    `# ${doc.icon ? `${doc.icon} ` : ''}${titleOf(doc)}`,
    `- id: ${doc.id}`,
    `- 위치: ${pathOf(all, doc.id) || titleOf(doc)}`,
    doc.labels.length ? `- 라벨: ${doc.labels.join(', ')}` : '',
    `- 고친 날: ${day(doc.updated_at)}${doc.updated_by ? ` · ${doc.updated_by}` : ''}`,
    `- 판(updated_at): ${doc.updated_at}`,
    kids.length ? `- 하위 문서: ${kids.map((k) => `${titleOf(k)} (id: ${k.id})`).join(' · ')}` : '',
    offset || more ? `- 본문 ${offset}~${offset + part.length} / ${doc.body.length}자${more ? ` · 이어 읽기: offset ${offset + CHUNK}` : ''}` : '',
    '',
    '---',
    '',
    part || '(본문 없음)',
  ].filter((l, i) => l !== '' || i >= 8).join('\n');
}

/* ── 쓰기 ─────────────────────────────────────────────── */

/** 문자열 배열만(라벨) - 주지 않았으면 undefined */
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined);
const link = (origin: string, id: string) => `${origin}/hub/?doc=${id}`;

/** 위 문서 - id 그대로, "top" · 맨 위 문서 = 맨 위, 제목이면 하나일 때만 */
async function parentOf(token: string, args: Record<string, unknown>): Promise<{ id: string | null; error?: string }> {
  const id = str(args.parent_id);
  if (id) {
    if (/^(top|root|home)$/i.test(id) || id === HOME) return { id: HOME };
    return UUID.test(id) ? { id } : { id: null, error: `parent_id '${id}' 는 문서 id 모양이 아닙니다(맨 위는 "top").` };
  }
  const title = str(args.parent_title);
  if (!title) return { id: null };
  const docs = await rpc<DocRow[]>('tm_mcp_docs', { p_token: token });
  const hits = docs.filter((d) => d.title.trim().toLowerCase() === title.toLowerCase());
  if (hits.length === 1) return { id: hits[0].id };
  if (!hits.length) return { id: null, error: `제목이 '${title}' 인 위 문서가 없습니다. wiki_list 로 id 를 찾아 parent_id 로 주세요.` };
  return { id: null, error: [`제목이 '${title}' 인 문서가 여럿입니다. parent_id 로 다시 주세요:`, ...hits.slice(0, 20).map((d) => `- ${pathOf(docs, d.id)} (id: ${d.id})`)].join('\n') };
}

async function wikiCreate(token: string, args: Record<string, unknown>, origin: string): Promise<string> {
  const title = str(args.title);
  if (!title) return '문서 제목(title)을 주세요.';
  const parent = await parentOf(token, args);
  if (parent.error) return parent.error;
  const body = typeof args.body === 'string' ? args.body : '';
  const rows = await rpc<Saved[]>('tm_mcp_create', {
    p_token: token, p_parent: parent.id, p_title: title, p_body: body, p_icon: str(args.icon), p_labels: strList(args.labels) ?? [],
  });
  const made = rows[0];
  const docs = await rpc<DocRow[]>('tm_mcp_docs', { p_token: token });
  return [
    `만들었습니다: ${title}`,
    `- id: ${made.id}`,
    `- 위치: ${pathOf(docs, made.id) || title}`,
    `- 판(updated_at): ${made.updated_at}`,
    `- 본문: ${body.length}자`,
    `- Hub 에서 열기: ${link(origin, made.id)}`,
  ].join('\n');
}

async function wikiUpdate(token: string, args: Record<string, unknown>, origin: string): Promise<string> {
  const id = str(args.id);
  if (!UUID.test(id)) return '고칠 문서의 id 를 주세요(wiki_search · wiki_list · wiki_read 결과).';
  const modes = ['body', 'append', 'replace'].filter((k) => args[k] !== undefined && args[k] !== null);
  if (modes.length > 1) return `본문은 body · append · replace 중 하나로만 고칩니다(받은 것: ${modes.join(', ')}).`;
  let expected = str(args.expected_updated_at) || null;
  let body: string | null = null;
  let note = '';
  const doc = (await rpc<FullDoc[]>('tm_mcp_doc', { p_token: token, p_id: id }))[0];
  if (!doc) return `id ${id} 문서가 없거나 휴지통에 있습니다.`;

  if (modes[0] === 'body') {
    if (typeof args.body !== 'string') return 'body 는 글이어야 합니다.';
    if (!expected) {
      return '본문을 통째로 바꿀 때는 expected_updated_at 이 필요합니다. wiki_read 로 지금 본문과 판(updated_at)을 읽고 다시 주세요'
        + ` (지금 판: ${doc.updated_at}). 끝에 덧붙이기만 할 때는 append, 일부만 고칠 때는 replace 를 쓰세요.`;
    }
    body = args.body;
    note = `본문 통째로 (${doc.body.length}자 → ${body.length}자)`;
  } else if (modes[0] === 'append') {
    const add = typeof args.append === 'string' ? args.append : '';
    if (!add.trim()) return 'append 에 덧붙일 글을 주세요.';
    const head = doc.body.replace(/\s+$/, '');
    body = head ? `${head}\n\n${add.replace(/^\s*\n/, '')}` : add;
    expected ??= doc.updated_at;
    note = `본문 끝에 ${add.length}자 덧붙임`;
  } else if (modes[0] === 'replace') {
    if (!Array.isArray(args.replace) || !args.replace.length) return 'replace 는 { old, new } 의 배열이어야 합니다.';
    let text = doc.body;
    let n = 0;
    for (const [i, raw] of args.replace.entries()) {
      const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
      const from = typeof r.old === 'string' ? r.old : '';
      const to = typeof r.new === 'string' ? r.new : null;
      if (!from || to === null) return `replace[${i}] 에 old(찾을 글) 와 new(바꿀 글)를 주세요.`;
      const count = text.split(from).length - 1;
      if (!count) return `replace[${i}] 의 old 를 본문에서 찾지 못했습니다. wiki_read 로 본문을 다시 읽고 그대로 옮겨 주세요: ${JSON.stringify(from.slice(0, 120))}`;
      if (count > 1 && r.all !== true) return `replace[${i}] 의 old 가 본문에 ${count}곳 있습니다. 앞뒤 글을 더 붙여 한 곳만 가리키거나 all: true 로 모두 바꾸세요.`;
      text = text.split(from).join(to);
      n += count;
    }
    body = text;
    expected ??= doc.updated_at;
    note = `본문 ${n}곳 바꿈 (${doc.body.length}자 → ${body.length}자)`;
  }

  let parent: string | null = null;
  if (args.parent_id !== undefined && args.parent_id !== null) {
    const p = await parentOf(token, { parent_id: args.parent_id });
    if (p.error) return p.error;
    parent = p.id;
  }
  const title = args.title === undefined || args.title === null ? null : str(args.title);
  if (title === '') return '제목을 비울 수 없습니다.';
  const icon = typeof args.icon === 'string' ? args.icon.trim() : null;
  const labels = strList(args.labels) ?? null;

  const rows = await rpc<Saved[]>('tm_mcp_update', {
    p_token: token, p_id: id, p_expected: expected, p_title: title, p_body: body, p_icon: icon, p_labels: labels, p_parent: parent,
  });
  const saved = rows[0];
  const changed = [
    note,
    title !== null && title !== doc.title.trim() ? `제목 '${titleOf(doc)}' → '${title}'` : '',
    icon !== null && icon !== doc.icon ? '아이콘' : '',
    labels !== null ? '라벨' : '',
    parent !== null ? '위치' : '',
  ].filter(Boolean);
  const same = saved.updated_at === doc.updated_at;
  const docs = parent !== null ? await rpc<DocRow[]>('tm_mcp_docs', { p_token: token }) : null;
  return [
    same ? `바뀐 것이 없습니다: ${titleOf(doc)}` : `고쳤습니다: ${title ?? titleOf(doc)}`,
    `- id: ${id}`,
    docs ? `- 위치: ${pathOf(docs, id)}` : '',
    !same && changed.length ? `- 바뀐 것: ${changed.join(' · ')}` : '',
    `- 판(updated_at): ${saved.updated_at}`,
    `- Hub 에서 열기: ${link(origin, id)}`,
  ].filter(Boolean).join('\n');
}

async function wikiTrash(token: string, args: Record<string, unknown>): Promise<string> {
  const id = str(args.id);
  if (!UUID.test(id)) return '휴지통에 넣을 문서의 id 를 주세요.';
  const rows = await rpc<{ id: string; title: string }[]>('tm_mcp_trash', { p_token: token, p_id: id });
  return `휴지통에 넣었습니다: ${titleOf(rows[0] ?? { title: '' })} (id: ${id}). 아래 문서도 함께 보이지 않습니다. Hub 팀 위키의 휴지통에서 되살릴 수 있습니다.`;
}

/* ── JSON-RPC ─────────────────────────────────────────── */

const ok = (id: RpcMsg['id'], result: Json) => ({ jsonrpc: '2.0', id: id ?? null, result });
const err = (id: RpcMsg['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

type Run = (token: string, args: Record<string, unknown>, origin: string) => Promise<string>;
const RUN: Record<string, Run> = {
  wiki_search: wikiSearch, wiki_list: wikiList, wiki_read: wikiRead,
  wiki_create: wikiCreate, wiki_update: wikiUpdate, wiki_trash: wikiTrash,
};

async function handle(msg: RpcMsg, token: string, name: string, origin: string) {
  const { id, method } = msg;
  const params = msg.params ?? {};
  switch (method) {
    case 'initialize': {
      const want = str(params.protocolVersion);
      return ok(id, {
        protocolVersion: PROTOCOLS.includes(want) ? want : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'mate-wiki', title: 'MATE 팀 위키', version: '1.1.0' },
        instructions: `MATE 팀 위키(사내 문서)를 읽고 고치는 도구입니다. ${name ? `${name} 님의 열쇠로 연결됐습니다. ` : ''}`
          + '질문에 답하기 전에 wiki_search 로 관련 문서를 찾고 wiki_read 로 본문을 읽으세요. 문서 구조는 wiki_list 로 봅니다. '
          + '사용자가 위키에 쓰거나 고치라고 할 때만 wiki_create · wiki_update · wiki_trash 를 쓰고, 고치기 전에는 wiki_read 로 지금 본문과 판을 읽으세요. '
          + '쓰기는 Hub 위키 \'AI 연결\'에서 \'쓰기 허용\'을 켠 열쇠만 됩니다(읽기 전용이면 도구가 그렇게 알립니다).',
      });
    }
    case 'ping':
      return ok(id, {});
    case 'tools/list':
      return ok(id, { tools: TOOLS as unknown as Json });
    case 'tools/call': {
      const tool = str(params.name);
      const args = (params.arguments && typeof params.arguments === 'object' ? params.arguments : {}) as Record<string, unknown>;
      const run = Object.prototype.hasOwnProperty.call(RUN, tool) ? RUN[tool] : null;
      if (!run) return err(id, -32602, `모르는 도구: ${tool}`);
      try {
        return ok(id, { content: [{ type: 'text', text: await run(token, args, origin) }] });
      } catch (e) {
        if (e instanceof AuthError) throw e;
        return ok(id, { content: [{ type: 'text', text: e instanceof Error ? e.message : '팀 위키 요청이 실패했습니다' }], isError: true });
      }
    }
    default:
      return err(id, -32601, `지원하지 않는 요청: ${method ?? '(없음)'}`);
  }
}

const unauthorized = (message: string) => Response.json(err(null, -32001, message), {
  status: 401,
  headers: { 'WWW-Authenticate': 'Bearer realm="mate-wiki"' },
});

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return Response.json(err(null, -32000, '이 사이트에는 팀 저장소(Supabase)가 연결되어 있지 않습니다'), { status: 503 });
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.get('authorization') ?? '');
  const token = m?.[1] ?? '';
  if (!TOKEN.test(token)) return unauthorized('연결 열쇠가 없습니다. Hub 위키의 \'AI 연결\'에서 열쇠를 만들어 Authorization: Bearer 머리에 넣어 주세요');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(err(null, -32700, 'JSON 을 읽지 못했습니다'), { status: 400 });
  }
  const batch = Array.isArray(body);
  const msgs = (batch ? body : [body]) as RpcMsg[];
  if (!msgs.length || msgs.some((x) => !x || typeof x !== 'object')) return Response.json(err(null, -32600, '잘못된 요청'), { status: 400 });

  // 연결할 때 열쇠를 한 번 확인한다 - 틀리면 AI 도구가 바로 '인증 실패'로 알린다
  let name = '';
  try {
    if (msgs.some((x) => x.method === 'initialize')) {
      const who = await rpc<{ name: string }[]>('tm_mcp_whoami', { p_token: token });
      if (!who.length) return unauthorized('연결 열쇠가 맞지 않거나 끊겼습니다. Hub 위키의 \'AI 연결\'에서 새 열쇠를 만들어 주세요');
      name = who[0].name ?? '';
    }
    const out = [];
    for (const x of msgs) {
      // 알림(id 없음)에는 답하지 않는다
      if (x.id === undefined || x.id === null) continue;
      out.push(await handle(x, token, name, new URL(req.url).origin));
    }
    if (!out.length) return new Response(null, { status: 202 });
    return Response.json(batch ? out : out[0]);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized(e.message);
    return Response.json(err(null, -32603, e instanceof Error ? e.message : '서버 오류'), { status: 500 });
  }
}

/* 서버에서 먼저 보내는 흐름(SSE)과 세션은 두지 않는다 */
const notAllowed = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });
export const GET = notAllowed;
export const DELETE = notAllowed;
