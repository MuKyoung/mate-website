import type { JSONContent } from '@tiptap/core';
import { docToMd } from './docMarkdown';
import { htmlToDoc, storageToDoc, type ConfluenceRefs, type PageRef, type UserRef, type WarnKind } from './confluence';
import { isWebImage, mimeOf, type CfExport, type CfPage, type CfUser } from './confluenceZip';
import type { DocStore } from './docStore';
import { localDay, type Doc, type Member } from './types';

/*
 * Confluence 가져오기의 실행 - 읽은 내보내기(CfExport)를 위키 문서로 만든다. 화면(ConfluenceImport.tsx)과 떼어 둔 까닭은
 * 브라우저 시험에서 가짜 저장소로 바로 돌려 보기 위해서다.
 *
 *   1. 첨부 파일을 팀 저장소에 올린다(문서 id 를 미리 정해 경로에 쓴다)
 *   2. 본문을 바꾼다 - 문서 링크 → 위키 문서, 첨부 → 올린 파일, 사람 → 이은 팀원. 본문에 안 쓰인 첨부는 끝에 목록으로
 *   3. 위 문서부터 단계마다 만들고 서버에 닿을 때까지 기다린다(아래 문서가 위 문서 id 를 가리킨다)
 *   4. 댓글을 옮긴다(쓴 사람 · 날짜를 첫 줄에)
 */

export const FILE_MAX = 20 * 1024 * 1024;
export const LABEL_MAX = 12;

export type Place = 'home' | 'root' | string;

export interface ImportOptions {
  place: Place;
  attachments: boolean;
  comments: boolean;
  labels: boolean;
  blogs: boolean;
  templates: boolean;
  meta: boolean;
}

export type WarnBucket = WarnKind | 'note' | 'fail';

export interface ImportReport {
  docs: number;
  files: number;
  comments: number;
  rootId: string | null;
  warns: Map<WarnBucket, Map<string, number>>;
}

export interface ImportCtx {
  store: Pick<DocStore, 'create' | 'upload' | 'settled' | 'addComment' | 'updateComment' | 'features'>;
  me: string;
  /** 휴지통에 들지 않은 문서 - 넣을 자리의 끝 순서를 셈한다 */
  docs: Doc[];
  /** 첨부 파일을 올릴 수 있는가(Supabase 모드) */
  canFiles: boolean;
  /** 팀 양식 라벨 */
  templateLabel: string;
  /** 문서 꼴 검사 - 맞지 않으면 던진다(편집기 스키마) */
  validate?(json: JSONContent): void;
}

/** 같은 위 문서 아래 순서 - 끝에 붙인다 */
const after = (last: number | undefined) => (last === undefined ? 1000 : last + 1000);

export function personLabel(u: CfUser): string {
  return u.displayName || u.email || u.name || u.accountId || '알 수 없는 사람';
}

/** 메일 · 이름이 같은 팀원을 먼저 이어 둔다 */
export function autoMatch(users: Map<string, CfUser>, members: Member[]): Record<string, string> {
  const out: Record<string, string> = {};
  const norm = (s: string | undefined) => (s ?? '').trim().toLowerCase().replace(/\s+/g, '');
  users.forEach((u) => {
    const email = norm(u.email ?? (u.name?.includes('@') ? u.name : undefined));
    const hit = members.find((m) => m.active !== false && ((email && norm(m.email) === email)
      || (u.displayName && norm(m.name) === norm(u.displayName))
      || (u.name && !u.name.includes('@') && norm(m.name) === norm(u.name))));
    if (hit) out[u.key] = hit.id;
  });
  return out;
}

/** 위 문서 → 아래 문서들(Confluence 순서, 순서가 없으면 제목 순) */
export function childrenMap(pages: CfPage[]): Map<string | null, CfPage[]> {
  const ids = new Set(pages.map((p) => p.id));
  const map = new Map<string | null, CfPage[]>();
  pages.forEach((p) => {
    const key = p.parentId && ids.has(p.parentId) ? p.parentId : null;
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  });
  map.forEach((list) => list.sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title, 'ko')));
  return map;
}

/** 트리 미리 보기 - 위 문서 아래로 차례대로 */
export function previewTree(m: CfExport): { id: string; title: string; depth: number; kind: CfPage['kind'] }[] {
  const out: { id: string; title: string; depth: number; kind: CfPage['kind'] }[] = [];
  const kids = childrenMap(m.pages.filter((p) => p.kind !== 'blog'));
  const walk = (pid: string | null, depth: number) => {
    (kids.get(pid) ?? []).forEach((p) => {
      out.push({ id: p.id, title: p.title, depth, kind: p.kind });
      if (depth < 12) walk(p.id, depth + 1);
    });
  };
  walk(null, 0);
  m.pages.filter((p) => p.kind === 'blog').forEach((p) => out.push({ id: p.id, title: p.title, depth: 0, kind: 'blog' }));
  return out;
}

/** Confluence 날짜(2025-02-10 10:17:29.180 · Sep 22, 2026) → 2025-02-10 */
export function shortDate(raw: string | null): string | null {
  if (!raw) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) return localDay(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
  const t = Date.parse(raw);
  return Number.isFinite(t) ? localDay(new Date(t).toISOString()) : raw;
}

const escMd = (s: string) => s.replace(/[\\`*_[\]<>|]/g, '\\$&');

export async function runImport(
  model: CfExport, opt: ImportOptions, people: Record<string, string>, members: Member[], ctx: ImportCtx,
  progress: (done: number, total: number, text: string) => void,
): Promise<ImportReport> {
  const { store, me } = ctx;
  const warns: ImportReport['warns'] = new Map();
  const warn = (kind: WarnBucket, what: string) => {
    const m = warns.get(kind) ?? new Map<string, number>();
    m.set(what, (m.get(what) ?? 0) + 1);
    warns.set(kind, m);
  };
  model.notes.forEach((n) => warn('note', n));

  const pages = model.pages.filter((p) => p.kind !== 'blog' || opt.blogs);
  const docId = new Map<string, string>();
  pages.forEach((p) => docId.set(p.id, crypto.randomUUID()));
  const titleOf = new Map(pages.map((p) => [p.id, p.title]));

  /* 사람 */
  const userIndex = new Map<string, CfUser>();
  model.users.forEach((u) => {
    userIndex.set(u.key, u);
    if (u.accountId) userIndex.set(u.accountId, u);
    if (u.name) userIndex.set(`name:${u.name.toLowerCase()}`, u);
  });
  const findUser = (r: UserRef) => (r.accountId && userIndex.get(r.accountId)) || (r.userKey && userIndex.get(r.userKey))
    || (r.username && userIndex.get(`name:${r.username.toLowerCase()}`)) || null;
  const memberName = (id: string) => members.find((m) => m.id === id)?.name;
  const nameOfKey = (key: string | null) => {
    if (!key) return null;
    const u = userIndex.get(key) ?? userIndex.get(`name:${key.toLowerCase()}`);
    const mapped = u ? people[u.key] : undefined;
    return (mapped && memberName(mapped)) || (u ? personLabel(u) : key);
  };

  /* 넣을 자리 - 모은 문서(스페이스 첫 문서나 새 문서) 아래로, 아니면 맨 위 · 고른 문서 아래 */
  const homePage = model.space.homeId && docId.has(model.space.homeId) ? model.space.homeId : null;
  const siblings = (pid: string | null) => ctx.docs.filter((d) => (d.parentId ?? null) === pid && !d.trashedAt).sort((a, b) => a.order - b.order);
  const basePid = opt.place === 'home' || opt.place === 'root' ? null : opt.place;
  const containerId: string | null = opt.place !== 'root' ? (homePage ? docId.get(homePage)! : crypto.randomUUID()) : null;

  /* 1. 첨부 올리기 */
  const atts = model.attachments.filter((a) => docId.has(a.pageId));
  const uploaded = new Map<string, { src: string; name: string; image: boolean }>();
  const upload = opt.attachments && ctx.canFiles;
  if (!upload && atts.length) warn('note', ctx.canFiles ? '첨부 파일은 옮기지 않기로 했습니다' : '이 브라우저 저장 모드에서는 첨부 파일을 옮기지 않습니다');
  const commentTotal = opt.comments && store.features.wiki ? model.comments.filter((c) => docId.has(c.pageId)).length : 0;
  // 진행 표시의 전체 - 문서 수는 모은 문서 · 블로그 · 양식 문서를 더해 아래에서 다시 센다
  let total = (upload ? atts.length : 0) + pages.length + (opt.templates ? model.templates.length : 0) + commentTotal;
  let done = 0;
  if (upload) {
    let i = 0;
    const next = async (): Promise<void> => {
      const a = atts[i++];
      if (!a) return;
      progress(done, total, `첨부 파일 올리는 중… ${Math.min(i, atts.length)}/${atts.length} · ${a.filename}`);
      if (!a.path) warn('attachment', `${a.filename} (내보내기에 파일이 없음)`);
      else if (a.size > FILE_MAX) warn('attachment', `${a.filename} (20MB 넘음)`);
      else {
        try {
          const mime = a.mime && a.mime !== 'application/octet-stream' ? a.mime : mimeOf(a.filename);
          const blob = await model.zip.blob(a.path, mime);
          const src = await store.upload(new File([blob], a.filename, { type: mime }), docId.get(a.pageId)!);
          uploaded.set(a.id, { src, name: a.filename, image: isWebImage(mime) });
        } catch (e) {
          warn('attachment', `${a.filename} (${e instanceof Error ? e.message : '올리지 못함'})`);
        }
      }
      done += 1;
      return next();
    };
    await Promise.all([next(), next(), next()]);
  }

  /* 2. 본문 바꾸기 */
  const byTitle = new Map<string, CfPage>();
  pages.forEach((p) => {
    byTitle.set(p.title, p);
    if (!byTitle.has(p.title.toLowerCase())) byTitle.set(p.title.toLowerCase(), p);
  });
  const findPage = (ref: PageRef) => {
    if (ref.id && docId.has(ref.id)) return pages.find((p) => p.id === ref.id) ?? null;
    if (!ref.title) return null;
    if (ref.spaceKey && model.space.key && ref.spaceKey !== model.space.key) return null;
    const hit = byTitle.get(ref.title) ?? byTitle.get(ref.title.toLowerCase()) ?? null;
    return hit && (!ref.blog || hit.kind === 'blog') ? hit : null;
  };
  const used = new Map<string, Set<string>>();
  const convert = (p: { id: string; title: string; body: string; format: 'storage' | 'html' }, template = false): string => {
    const seen = new Set<string>();
    used.set(p.id, seen);
    const refs: ConfluenceRefs = {
      page: (ref) => {
        const hit = findPage(ref);
        return hit ? { id: docId.get(hit.id)!, title: hit.title } : null;
      },
      attachment: (ref) => {
        const pageId = ref.page?.id ?? (ref.page ? findPage(ref.page)?.id : p.id);
        const a = (ref.id && atts.find((x) => x.id === ref.id))
          || (ref.path && atts.find((x) => x.path && (x.path === ref.path || x.path.endsWith(`/${ref.path}`) || ref.path!.endsWith(x.path.replace(/^[^/]*\//, '')))))
          || atts.find((x) => x.pageId === pageId && x.filename === ref.filename)
          || (ref.filename ? atts.find((x) => x.filename === ref.filename) : undefined);
        if (!a) return null;
        seen.add(a.id);
        return uploaded.get(a.id) ?? null;
      },
      user: (ref) => {
        const u = findUser(ref);
        if (!u) return ref.name ? { id: null, label: ref.name } : null;
        const mapped = people[u.key];
        if (mapped) return { id: mapped, label: memberName(mapped) ?? personLabel(u) };
        return { id: null, label: u.displayName ?? (ref.name || personLabel(u)) };
      },
      pageTitle: p.title,
      baseUrl: model.baseUrl ?? undefined,
      warn: (kind, detail) => warn(kind, detail),
    };
    let json: JSONContent;
    try {
      if (p.format === 'storage') json = storageToDoc(p.body, refs, template);
      else {
        const holder = new DOMParser().parseFromString(`<!doctype html><body><div id="cf-main">${p.body}</div>`, 'text/html').getElementById('cf-main');
        json = holder ? htmlToDoc(holder, refs, 'export') : { type: 'doc', content: [] };
      }
      ctx.validate?.(json);
    } catch {
      // 모양을 살리지 못하면 글만이라도
      warn('content', p.title);
      const text = new DOMParser().parseFromString(p.body.replace(/<\/(p|div|h\d|li|tr)>/gi, '\n'), 'text/html').body.textContent ?? '';
      json = { type: 'doc', content: text.split(/\n+/).map((t) => t.trim()).filter(Boolean).map((t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] })) };
    }
    return docToMd(json);
  };

  const meta = (p: CfPage) => {
    if (!opt.meta) return '';
    const parts = ['Confluence 에서 옮김'];
    const creator = nameOfKey(p.creator);
    const created = shortDate(p.created);
    if (creator || created) parts.push(`처음 쓴 사람 ${creator ?? '알 수 없음'}${created ? ` · ${created}` : ''}`);
    const modifier = nameOfKey(p.modifier);
    const modified = shortDate(p.modified);
    if ((modifier && modifier !== creator) || (modified && modified !== created)) parts.push(`마지막 수정 ${modifier ?? '알 수 없음'}${modified ? ` · ${modified}` : ''}`);
    return `\n\n---\n\n_${escMd(parts.join(' · '))}_`;
  };

  const bodies = new Map<string, string>();
  pages.forEach((p) => {
    progress(done, total, `문서를 바꾸는 중… ${p.title}`);
    let md = p.kind === 'folder' ? '' : convert(p);
    // 본문에 쓰이지 않은 첨부는 끝에 모아 둔다(Confluence 의 첨부 목록)
    const rest = atts.filter((a) => a.pageId === p.id && !used.get(p.id)?.has(a.id) && uploaded.has(a.id));
    if (rest.length) {
      const list = rest.map((a) => `- [📎 ${escMd(a.filename)}](${uploaded.get(a.id)!.src})`).join('\n');
      md = `${md}${md ? '\n\n' : ''}#### 첨부 파일\n\n${list}`;
    }
    if (p.kind === 'blog' && p.postingDay) md = `_${escMd(p.postingDay.replace(/\//g, '-'))} 블로그 글_\n\n${md}`;
    md += p.kind === 'folder' ? '' : meta(p);
    bodies.set(p.id, md.replace(/^\s+/, ''));
  });

  /* 3. 문서 만들기 - 위 문서가 서버에 들어간 뒤 아래 문서를 넣는다 */
  const kids = childrenMap(pages.filter((p) => p.kind !== 'blog'));
  type Job = { id: string; title: string; body: string; parentId: string | null; order: number; labels: string[]; icon?: string };
  const levels: Job[][] = [];
  const push = (depth: number, job: Job) => {
    (levels[depth] ??= []).push(job);
  };
  const labelsOf = (p: CfPage) => (opt.labels ? p.labels.slice(0, LABEL_MAX) : []);
  const lastOrder = (pid: string | null) => siblings(pid).at(-1)?.order;
  const place = (pid: string | null, parentDoc: string | null, depth: number) => {
    (kids.get(pid) ?? []).forEach((p, i) => {
      const id = docId.get(p.id)!;
      push(depth, { id, title: p.title, body: bodies.get(p.id) ?? '', parentId: parentDoc, order: (i + 1) * 1000, labels: labelsOf(p), icon: p.icon });
      place(p.id, id, depth + 1);
    });
  };
  const roots = kids.get(null) ?? [];
  let depth0 = 0;
  if (containerId) {
    const home = homePage ? pages.find((p) => p.id === homePage)! : null;
    push(0, {
      id: containerId, title: home?.title ?? model.space.name,
      body: home ? bodies.get(home.id) ?? '' : `Confluence 스페이스 '${escMd(model.space.name)}'${model.space.key ? `(${escMd(model.space.key)})` : ''} 에서 옮긴 문서입니다.`,
      parentId: basePid, order: after(lastOrder(basePid)), labels: home ? labelsOf(home) : [], icon: home?.icon,
    });
    depth0 = 1;
    // 첫 문서의 아래 문서 → 모은 문서 바로 아래, 그 밖의 맨 위 문서(고아)는 그 뒤에
    if (homePage) place(homePage, containerId, 1);
    let i = 0;
    roots.forEach((p) => {
      if (p.id === homePage) return;
      i += 1;
      const id = docId.get(p.id)!;
      push(1, { id, title: p.title, body: bodies.get(p.id) ?? '', parentId: containerId, order: 900000 + i * 1000, labels: labelsOf(p), icon: p.icon });
      place(p.id, id, 2);
    });
  } else {
    let o = lastOrder(basePid);
    roots.forEach((p) => {
      o = after(o);
      const id = docId.get(p.id)!;
      push(0, { id, title: p.title, body: bodies.get(p.id) ?? '', parentId: basePid, order: o, labels: labelsOf(p), icon: p.icon });
      place(p.id, id, 1);
    });
  }
  // 블로그 · 양식 - 모은 문서(없으면 고른 자리) 아래 문서 하나에 모은다
  const groupParent = containerId ?? basePid;
  let groupOrder = containerId ? 990000 : lastOrder(basePid) ?? 0;
  const groupDoc = (title: string, body: string, list: Job[]) => {
    if (!list.length) return;
    const gid = crypto.randomUUID();
    groupOrder += 1000;
    push(depth0, { id: gid, title, body, parentId: groupParent, order: groupOrder, labels: [] });
    list.forEach((j) => push(depth0 + 1, { ...j, parentId: gid }));
  };
  if (opt.blogs) {
    const blogs = pages.filter((p) => p.kind === 'blog').sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
    groupDoc('블로그', 'Confluence 블로그 글을 옮겨 둔 곳입니다.', blogs.map((p, i) => ({
      id: docId.get(p.id)!, title: p.title, body: bodies.get(p.id) ?? '', parentId: null, order: (i + 1) * 1000, labels: labelsOf(p), icon: p.icon,
    })));
  }
  if (opt.templates && model.templates.length) {
    const jobs = model.templates.map((t, i) => {
      progress(done, total, `양식을 바꾸는 중… ${t.name}`);
      const desc = t.description ? `> [!NOTE] 양식 설명\n> ${escMd(t.description.replace(/\s+/g, ' '))}\n\n` : '';
      const body = desc + convert({ id: `tpl-${t.id}`, title: t.name, body: t.body, format: 'storage' }, true);
      return { id: crypto.randomUUID(), title: t.name, body, parentId: null, order: (i + 1) * 1000, labels: [ctx.templateLabel, ...t.labels.filter((l) => l !== ctx.templateLabel)].slice(0, LABEL_MAX) };
    });
    groupDoc('양식', `Confluence 스페이스의 양식입니다. '${ctx.templateLabel}' 라벨이 붙은 문서는 새 문서를 만들 때 양식으로 고를 수 있습니다.`, jobs);
  }

  const failed = new Set<string>();
  let made = 0;
  total = done + levels.reduce((n, l) => n + (l?.length ?? 0), 0) + commentTotal;
  for (let d = 0; d < levels.length; d += 1) {
    const level = levels[d] ?? [];
    const sent: Job[] = [];
    level.forEach((j) => {
      if (j.parentId && failed.has(j.parentId)) {
        failed.add(j.id);
        warn('fail', `${j.title} (위 문서를 만들지 못해서)`);
        return;
      }
      progress(done, total, `문서를 만드는 중… ${j.title}`);
      store.create({ id: j.id, title: j.title, body: j.body, parentId: j.parentId, author: me, order: j.order, labels: j.labels, ...(j.icon ? { icon: j.icon } : {}) });
      sent.push(j);
    });
    // 서버에 닿을 때까지 기다린다 - 아래 단계가 이 문서들을 위 문서로 가리킨다
    const results = await Promise.all(sent.map((j) => (store.settled ? store.settled(j.id) : Promise.resolve('ok' as const))));
    results.forEach((r, k) => {
      if (r !== 'ok') {
        failed.add(sent[k].id);
        warn('fail', sent[k].title);
      } else made += 1;
      done += 1;
    });
    progress(done, total, `문서 ${made}건을 만들었습니다`);
  }

  /* 4. 댓글 - 쓴 사람 · 날짜를 첫 줄에. 답글의 답글은 맨 위 댓글 아래로 */
  let commentCount = 0;
  if (opt.comments && store.features.wiki) {
    const list = model.comments.filter((c) => docId.has(c.pageId) && !failed.has(docId.get(c.pageId)!))
      .sort((a, b) => (a.created ?? '').localeCompare(b.created ?? ''));
    const ids = new Map<string, string>();
    const byId = new Map(list.map((c) => [c.id, c]));
    const topOf = (c: { parentId: string | null }): string | null => {
      let cur = c.parentId;
      for (let guard = 0; cur && guard < 50; guard += 1) {
        const parent = byId.get(cur);
        if (!parent?.parentId) return cur;
        cur = parent.parentId;
      }
      return cur;
    };
    for (const c of list) {
      progress(done, total, `댓글을 옮기는 중… ${titleOf.get(c.pageId) ?? ''}`);
      const id = crypto.randomUUID();
      ids.set(c.id, id);
      const top = topOf(c);
      const head = `**${escMd(nameOfKey(c.author) ?? '알 수 없는 사람')}** · ${shortDate(c.created) ?? ''} · Confluence 댓글`;
      const quote = c.selection ? `\n\n> ${escMd(c.selection.replace(/\s+/g, ' '))}` : '';
      const body = `${head}${quote}\n\n${convert({ id: `c-${c.id}`, title: titleOf.get(c.pageId) ?? '', body: c.body, format: 'storage' })}`;
      const r = await store.addComment({ id, docId: docId.get(c.pageId)!, parentId: top ? ids.get(top) ?? null : null, body, author: me });
      if (r === 'ok') {
        commentCount += 1;
        if (c.resolved && !top) await store.updateComment(id, { resolved: true });
      } else warn('fail', `댓글 (${titleOf.get(c.pageId) ?? ''})`);
      done += 1;
    }
  }

  return { docs: made, files: uploaded.size, comments: commentCount, rootId: containerId ?? levels[0]?.[0]?.id ?? null, warns };
}
