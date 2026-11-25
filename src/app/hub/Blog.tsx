'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DocEditor, { type WikiRefs } from './DocEditor';
import { imageSrcOk, plainText } from './docMarkdown';
import { useMembers } from './members';
import { freshPosts, markRead, useUnread } from './reads';
import { isRemote } from './supabase';
import type { Doc, Task } from './types';
import {
  Avatar, IconArrow, IconPlus, IconSearch, Modal, NewMark, tmBtn, tmBtnPrimary, tmCallout, tmCard, tmFieldBase, tmGhostBtn,
  tmGhostDanger, tmIconBtnSm, tmInput, tmLabel, tmSelect, tmTab, tmTextBtn, tmTextarea, useConfirm,
} from './ui';
import {
  COMMENT_MAX, TAG_LEN, TAG_MAX, TITLE_MAX, cleanTags, useBlogStore,
  type BlogCategory, type BlogComment, type BlogPost, type BlogStore, type PostText,
} from './blogStore';

/*
 * 커뮤니티 > 블로그 - 팀원 모두가 함께 쓰는 블로그 하나(네이버 블로그 짜임).
 *   왼쪽: 블로그 소개 · 검색 · 카테고리(전체보기 · 두 단계) · 글쓴이 · 최근 댓글 · 태그
 *   가운데: 글 목록(목록형 · 앨범형, 인기 글 · 공지) → 글 보기(공감 · 댓글 · 이 카테고리의 다른 글) → 글쓰기
 * 본문은 팀 위키 편집기(DocEditor)를 그대로 쓴다 - 마크다운 저장, 그림 붙여 넣기, / 메뉴.
 * 쓰는 중인 글은 이 브라우저에 저절로 임시 저장되어, 다른 화면에 다녀오거나 창을 닫아도 이어 쓴다.
 * 글 주소는 /hub/?post=<id> - 링크 복사로 팀원에게 보낸다.
 */

type Route = { kind: 'list' } | { kind: 'post'; id: string } | { kind: 'write'; id: string | null };
/** cat: null = 전체보기, NONE = 미분류 */
type Filter = { cat: string | null; author: string | null; tag: string | null; q: string };
type ListMode = 'list' | 'album';

const NONE = '__none';
const NO_FILTER: Filter = { cat: null, author: null, tag: null, q: '' };
const MODE_KEY = 'mate.taskmanager.blog.mode.v1';
const DRAFT_KEY = 'mate.taskmanager.blog.drafts.v1';
const PAGE_LIST = 10;
const PAGE_ALBUM = 12;

/** 날짜 칸 스크롤 - 넓은 화면의 Hub 셸은 본문을 화면 높이에 가두므로 제 스크롤 칸이 있어야 한다(좁은 · 낮은 화면은 셸이 스크롤) */
const scrollBox =
  '-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-6 pt-0.5 max-[900px]:flex-none max-[900px]:overflow-visible '
  + '[@media(max-height:500px)]:flex-none [@media(max-height:500px)]:overflow-visible';

/* ── 작은 도움 ─────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, '0');
/** 네이버 블로그처럼 - 하루 안은 'n분 전 · n시간 전', 그 밖은 '2026. 11. 18.' */
function whenOf(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  if (!withTime && diff >= 0 && diff < 24 * 3600 * 1000) {
    if (diff < 60 * 1000) return '방금 전';
    if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)}분 전`;
    return `${Math.floor(diff / 3600000)}시간 전`;
  }
  const day = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
  return withTime ? `${day} ${pad(d.getHours())}:${pad(d.getMinutes())}` : day;
}

/** 본문 → 미리 보기 글 · 첫 그림. 같은 본문은 다시 풀지 않는다(조회수 알림마다 목록이 다시 그려진다) */
const digestCache = new Map<string, { text: string; image: string | null }>();
function digest(body: string): { text: string; image: string | null } {
  const hit = digestCache.get(body);
  if (hit) return hit;
  let text = '';
  try {
    text = plainText(body);
  } catch {
    text = body.replace(/[#>*_`~[\]()!|-]+/g, ' ');
  }
  let image: string | null = null;
  const re = /!\[[^\]]*\]\(([^)\s]+)\)|<img\b[^>]*?\bsrc="([^"]+)"/g;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    let src = m[1] ?? m[2] ?? '';
    try { src = decodeURIComponent(src); } catch { /* 그대로 */ }
    if (imageSrcOk(src)) { image = src; break; }
  }
  const out = { text: text.slice(0, 260), image };
  if (digestCache.size > 500) digestCache.clear();
  digestCache.set(body, out);
  return out;
}

function readMode(): ListMode {
  try {
    return window.localStorage.getItem(MODE_KEY) === 'album' ? 'album' : 'list';
  } catch {
    return 'list';
  }
}

/* 임시 저장 - 사람 · 글(새 글은 new)마다 하나 */
interface Draft extends PostText { savedAt: string }
const draftKey = (me: string, id: string | null) => `${me}:${id ?? 'new'}`;
function readDrafts(): Record<string, Draft> {
  try {
    const v = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? '{}') as unknown;
    return v && typeof v === 'object' ? (v as Record<string, Draft>) : {};
  } catch {
    return {};
  }
}
function writeDraft(key: string, d: Draft | null) {
  try {
    const all = readDrafts();
    if (d) all[key] = d;
    else delete all[key];
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

/* ── 아이콘 ────────────────────────────────────────────── */

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
function IconHeart({ size = 16, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line} fill={filled ? 'currentColor' : 'none'}>
      <path d="M10 16.5s-6.5-3.9-6.5-8.6A3.6 3.6 0 0 1 10 5.6a3.6 3.6 0 0 1 6.5 2.3c0 4.7-6.5 8.6-6.5 8.6z" />
    </svg>
  );
}
function IconBubble({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M4 4.5h12a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1H9l-3.5 3v-3H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" /></svg>;
}
function IconEye({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" /><circle cx="10" cy="10" r="2.4" /></svg>;
}
function IconListMode({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M7 5h10M7 10h10M7 15h10M3.5 5h.01M3.5 10h.01M3.5 15h.01" /></svg>;
}
function IconAlbum({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="11" y="3" width="6" height="6" rx="1" /><rect x="3" y="11" width="6" height="6" rx="1" /><rect x="11" y="11" width="6" height="6" rx="1" /></svg>;
}
function IconLink({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2L10 5.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l1.1-1.1" /></svg>;
}

/* ── 그림 칸 - tmfile: 은 한 시간짜리 주소로 받아 그린다 ───────── */

function Thumb({ src, fileUrl, label, className = '' }: {
  src: string | null; fileUrl(src: string): Promise<string>; label: string; className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  useEffect(() => {
    let live = true;
    setUrl(null);
    setBad(false);
    if (!src) return undefined;
    fileUrl(src).then((u) => { if (live) setUrl(u); }).catch(() => { if (live) setBad(true); });
    return () => { live = false; };
  }, [src, fileUrl]);
  if (!src || bad) {
    return (
      <span className={`grid place-items-center overflow-hidden bg-tm-tint px-3 text-center text-[13px] font-bold text-tm-blue ${className}`}>
        {label}
      </span>
    );
  }
  return (
    <span className={`block overflow-hidden bg-tm-bg ${className}`}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" decoding="async" draggable={false}
          className="h-full w-full object-cover" onError={() => setBad(true)} />
      )}
    </span>
  );
}

/* ── 화면 ─────────────────────────────────────────────── */

export interface BlogProps {
  me: string;
  /** 공지 · 카테고리 · 남의 글 지우기. 브라우저 저장 모드는 계정이 없어 누구나 */
  admin: boolean;
  docs: Doc[];
  tasks: Task[];
  onOpenDoc(id: string): void;
  onTaskOpen(key: string): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
}

export default function Blog({ me, admin, docs, tasks, onOpenDoc, onTaskOpen, onNotice }: BlogProps) {
  const noticeRef = useRef(onNotice);
  noticeRef.current = onNotice;
  const store = useBlogStore({ onError: (text) => noticeRef.current(text, 'err') });
  const members = useMembers();
  const [confirm, confirmNode] = useConfirm();

  const [route, setRouteNow] = useState<Route>(() => {
    if (typeof window === 'undefined') return { kind: 'list' };
    const id = new URLSearchParams(window.location.search).get('post');
    return id ? { kind: 'post', id } : { kind: 'list' };
  });
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [page, setPage] = useState(1);
  const [mode, setModeNow] = useState<ListMode>('list');
  const [manage, setManage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setModeNow(readMode()); }, []);
  const setMode = (m: ListMode) => {
    setModeNow(m);
    setPage(1);
    try { window.localStorage.setItem(MODE_KEY, m); } catch { /* 저장이 막힌 환경 */ }
  };

  const toTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.closest('.tm-page')?.scrollTo({ top: 0 });
  }, []);
  const setRoute = useCallback((r: Route) => {
    setRouteNow(r);
    toTop();
  }, [toTop]);

  /* 글 주소(?post=) - 보는 글을 주소에 적고, 블로그를 떠나면 지운다 */
  useEffect(() => {
    const url = new URL(window.location.href);
    const want = route.kind === 'post' ? route.id : null;
    if (url.searchParams.get('post') === want) return;
    if (want) url.searchParams.set('post', want);
    else url.searchParams.delete('post');
    window.history.replaceState(window.history.state, '', url);
  }, [route]);
  useEffect(() => () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('post')) return;
    url.searchParams.delete('post');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  /* ── 모아 보기 ── */

  const byOrder = (a: BlogCategory, b: BlogCategory) => a.order - b.order || a.name.localeCompare(b.name, 'ko');
  const catById = useMemo(() => new Map(store.categories.map((c) => [c.id, c])), [store.categories]);
  const tops = useMemo(
    () => store.categories.filter((c) => !c.parentId || !catById.has(c.parentId)).sort(byOrder),
    [store.categories, catById],
  );
  const kidsOf = useCallback(
    (id: string) => store.categories.filter((c) => c.parentId === id).sort(byOrder),
    [store.categories],
  );
  /** 없는 카테고리(그사이 지운 것)는 미분류로 본다 */
  const catOf = useCallback((p: BlogPost) => (p.category && catById.has(p.category) ? p.category : null), [catById]);
  const catLabel = useCallback((id: string | null) => {
    const c = id ? catById.get(id) : null;
    if (!c) return '미분류';
    const parent = c.parentId ? catById.get(c.parentId) : null;
    return parent ? `${parent.name} > ${c.name}` : c.name;
  }, [catById]);
  const shortCat = useCallback((id: string | null) => (id && catById.get(id)?.name) || '미분류', [catById]);

  const posts = useMemo(
    () => store.posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [store.posts],
  );
  const likesOf = useMemo(() => {
    const m = new Map<string, string[]>();
    store.likes.forEach((l) => m.set(l.post, [...(m.get(l.post) ?? []), l.member]));
    return m;
  }, [store.likes]);
  const commentCount = useMemo(() => {
    const m = new Map<string, number>();
    store.comments.forEach((c) => { if (!c.removed) m.set(c.post, (m.get(c.post) ?? 0) + 1); });
    return m;
  }, [store.comments]);
  const catCount = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => {
      const id = catOf(p) ?? NONE;
      m.set(id, (m.get(id) ?? 0) + 1);
      const parent = id !== NONE ? catById.get(id)?.parentId : null;
      if (parent && catById.has(parent)) m.set(parent, (m.get(parent) ?? 0) + 1);
    });
    return m;
  }, [posts, catOf, catById]);

  const nameOf = useCallback((id: string | null) => members.find((m) => m.id === id)?.name ?? (id ? '떠난 팀원' : '알 수 없음'), [members]);
  const canEdit = (p: BlogPost) => admin || p.author === me;

  /* ── 걸러 보기 ── */

  const inCat = useCallback((p: BlogPost, cat: string | null) => {
    if (!cat) return true;
    const c = catOf(p);
    if (cat === NONE) return c === null;
    return c === cat || (!!c && catById.get(c)?.parentId === cat);
  }, [catOf, catById]);
  const shown = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return posts.filter((p) => inCat(p, filter.cat)
      && (!filter.author || p.author === filter.author)
      && (!filter.tag || p.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase()))
      && (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
        || digest(p.body).text.toLowerCase().includes(q) || nameOf(p.author).toLowerCase().includes(q)));
  }, [posts, filter, inCat, nameOf]);

  const go = useCallback((f: Partial<Filter>) => {
    setFilter({ ...NO_FILTER, ...f });
    setPage(1);
    setRoute({ kind: 'list' });
  }, [setRoute]);

  const openPost = useCallback((id: string) => setRoute({ kind: 'post', id }), [setRoute]);

  /* 글을 열면 조회수 하나 - 같은 창에서는 한 번만 */
  const viewed = route.kind === 'post' ? route.id : null;
  const exists = viewed ? store.posts.some((p) => p.id === viewed) : false;
  useEffect(() => {
    if (viewed && exists) store.view(viewed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewed, exists]);

  /* 읽음 표시(reads.ts) - 남이 쓴 새 글 중 아직 열어 보지 않은 것에 N. 글을 열면 읽은 것 */
  const blogUnread = useUnread(me, 'blog');
  const fresh = useMemo(() => freshPosts(store.posts, me, blogUnread), [store.posts, me, blogUnread]);
  const freshIds = useMemo(() => new Set(fresh.map((p) => p.id)), [fresh]);
  const viewedFresh = viewed ? fresh.find((p) => p.id === viewed) : undefined;
  useEffect(() => {
    if (viewedFresh) markRead(me, 'blog', { id: viewedFresh.id, at: viewedFresh.createdAt });
  }, [viewedFresh, me]);
  const readAll = () => markRead(me, 'blog', fresh.map((p) => ({ id: p.id, at: p.createdAt })));

  /* ── 위키 편집기에 넘기는 것 ── */

  const docRefs = useMemo(
    () => docs.map((d) => ({ id: d.id, title: d.title || '제목 없음', icon: d.icon, gone: !!d.trashedAt, parentId: d.parentId, order: d.order })),
    [docs],
  );
  const taskRefs = useMemo(() => tasks.map((t) => ({ key: t.key, title: t.title, status: t.status })), [tasks]);
  // 위 화면이 넘기는 함수는 그릴 때마다 새것이라 ref 로 들고, 편집기에 주는 묶음은 바뀌지 않게 둔다
  const jump = useRef({ onOpenDoc, onTaskOpen });
  jump.current = { onOpenDoc, onTaskOpen };
  const refs = useMemo<WikiRefs>(() => ({
    docs: docRefs,
    tasks: taskRefs,
    openDoc: (id) => jump.current.onOpenDoc(id),
    openTask: (key) => jump.current.onTaskOpen(key),
    fileUrl: store.fileUrl,
    notice: (text) => noticeRef.current(text, 'err'),
  }), [docRefs, taskRefs, store.fileUrl]);

  /* ── 동작 ── */

  const removePost = async (p: BlogPost) => {
    const ok = await confirm({
      title: '글을 삭제할까요?',
      body: <>‘<b>{p.title}</b>’ 글과 그 댓글 · 공감이 모두 지워집니다. 되돌릴 수 없습니다.</>,
      ok: '삭제', tone: 'danger',
    });
    if (!ok) return;
    store.removePost(p.id);
    onNotice('글을 삭제했습니다.', 'ok');
    setRoute({ kind: 'list' });
  };

  const copyLink = async (p: BlogPost) => {
    const url = `${window.location.origin}/hub/?post=${p.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onNotice('글 주소를 복사했습니다. 팀원에게 붙여 넣어 보내세요.', 'ok');
    } catch {
      onNotice(`복사하지 못했습니다. 주소: ${url}`, 'err');
    }
  };

  /* ── 상태 화면 ── */

  if (!store.ready) {
    return (
      <div className="grid min-h-[240px] flex-1 place-items-center text-[15px] text-tm-sub" aria-busy>블로그를 불러오는 중…</div>
    );
  }
  if (store.missing) {
    return (
      <div className={`${tmCard} mx-auto mt-6 flex max-w-[620px] flex-col items-start gap-3 p-8`}>
        <p className="text-[20px] font-extrabold text-tm-deep">블로그를 아직 열 수 없습니다</p>
        <p className="text-[15.5px] leading-[1.7] text-tm-ink">
          서버에 블로그 표가 없습니다. 관리자가 <b className="font-bold">supabase/taskmanager.sql</b> 의 ‘팀 블로그’ 블록을
          Supabase SQL Editor 에서 실행하면 바로 쓸 수 있습니다.
        </p>
        <button type="button" className={tmBtn} onClick={() => void store.reload()}>다시 확인</button>
      </div>
    );
  }

  const post = route.kind === 'post' ? store.posts.find((p) => p.id === route.id) ?? null : null;
  const editing = route.kind === 'write' && route.id ? store.posts.find((p) => p.id === route.id) ?? null : null;

  /* ── 왼쪽(좁은 화면에서는 아래) ── */

  const totalComments = store.comments.filter((c) => !c.removed).length;
  const writers = (() => {
    const m = new Map<string, number>();
    posts.forEach((p) => { if (p.author) m.set(p.author, (m.get(p.author) ?? 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1] || nameOf(a[0]).localeCompare(nameOf(b[0]), 'ko'));
  })();
  const tagCloud = (() => {
    const m = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko')).slice(0, 24);
  })();
  const recentComments = store.comments
    .filter((c) => !c.removed && store.posts.some((p) => p.id === c.post))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const catRow = (id: string | null, label: string, count: number, depth: number) => {
    const on = route.kind === 'list' && !filter.author && !filter.tag && !filter.q && filter.cat === id;
    return (
      <li key={id ?? 'all'}>
        <button type="button" onClick={() => go({ cat: id })} aria-current={on ? 'page' : undefined}
          className={`flex w-full items-center gap-1.5 rounded-tm-sm py-[7px] pr-2 text-left text-[14.5px] transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 ${
            depth ? 'pl-7' : 'pl-2.5'} ${on ? 'bg-tm-tint font-bold text-tm-blue' : 'text-tm-ink hover:bg-tm-tint'}`}>
          {depth > 0 && <span aria-hidden className="-ml-3.5 mr-0.5 text-[12px] text-tm-edge">ㄴ</span>}
          <span className={`min-w-0 truncate ${depth === 0 && id ? 'font-bold' : ''}`}>{label}</span>
          <span className={`flex-none text-[13px] tabular-nums ${on ? 'text-tm-blue' : 'text-tm-sub'}`}>({count})</span>
        </button>
      </li>
    );
  };

  const sideCard = 'rounded-tm border border-tm-line bg-tm-card p-4 shadow-tm';
  const sideHead = 'mb-2 flex items-center justify-between gap-2 px-1 text-[13.5px] font-extrabold text-tm-deep';
  const sidebar = (
    <aside aria-label="블로그 메뉴" className="flex min-w-0 flex-col gap-4 max-[1099px]:order-2">
      <section className={sideCard}>
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-12 w-12 flex-none place-items-center rounded-[14px] bg-tm-deep text-[20px] font-extrabold text-white">M</span>
          <div className="min-w-0">
            <p className="truncate text-[16.5px] font-extrabold text-tm-deep">MATE 팀 블로그</p>
            <p className="text-[13px] text-tm-sub">팀원 모두가 함께 쓰는 블로그</p>
          </div>
        </div>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-tm-sub">
          <span>글 <b className="font-bold tabular-nums text-tm-ink">{posts.length}</b></span>
          <span>댓글 <b className="font-bold tabular-nums text-tm-ink">{totalComments}</b></span>
          <span>공감 <b className="font-bold tabular-nums text-tm-ink">{store.likes.length}</b></span>
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button type="button" className={`${tmBtnPrimary} h-[40px] px-3 text-[14px]`} onClick={() => setRoute({ kind: 'write', id: null })}>
            <IconPlus size={16} />글쓰기
          </button>
          <button type="button" className={`${tmGhostBtn} h-[40px]`} onClick={() => go({ author: me })}>내 글</button>
        </div>
      </section>

      <form role="search" className="relative" onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
        go({ q });
      }}>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={17} /></span>
        <input key={filter.q} name="q" defaultValue={filter.q} placeholder="블로그 글 검색" aria-label="블로그 글 검색"
          className={`${tmFieldBase} h-11 w-full pl-10 pr-3 text-[16px]`} />
      </form>

      <section className={sideCard} aria-label="카테고리">
        <div className={sideHead}>
          <span>카테고리</span>
          {admin && (
            <button type="button" onClick={() => setManage(true)} className="-my-1 rounded-md px-2 py-1 text-[12.5px] font-bold text-tm-blue hover:bg-tm-tint">
              관리
            </button>
          )}
        </div>
        <ul className="space-y-px">
          {catRow(null, '전체보기', posts.length, 0)}
          {tops.map((c) => [
            catRow(c.id, c.name, catCount.get(c.id) ?? 0, 0),
            ...kidsOf(c.id).map((k) => catRow(k.id, k.name, catCount.get(k.id) ?? 0, 1)),
          ])}
          {(catCount.get(NONE) ?? 0) > 0 && catRow(NONE, '미분류', catCount.get(NONE) ?? 0, 0)}
        </ul>
      </section>

      {writers.length > 0 && (
        <section className={sideCard} aria-label="글쓴이">
          <p className={sideHead}>글쓴이</p>
          <ul className="space-y-px">
            {writers.map(([id, n]) => (
              <li key={id}>
                <button type="button" onClick={() => go({ author: id })}
                  className={`flex w-full items-center gap-2.5 rounded-tm-sm px-2 py-1.5 text-left text-[14px] hover:bg-tm-tint [@media(pointer:coarse)]:min-h-11 ${
                    filter.author === id && route.kind === 'list' ? 'bg-tm-tint font-bold text-tm-blue' : 'text-tm-ink'}`}>
                  <Avatar id={id} size={24} />
                  <span className="min-w-0 flex-1 truncate">{nameOf(id)}</span>
                  <span className="text-[13px] tabular-nums text-tm-sub">{n}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recentComments.length > 0 && (
        <section className={sideCard} aria-label="최근 댓글">
          <p className={sideHead}>최근 댓글</p>
          <ul className="space-y-1">
            {recentComments.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => openPost(c.post)} className="block w-full rounded-tm-sm px-2 py-1.5 text-left hover:bg-tm-tint">
                  <span className="line-clamp-2 text-[13.5px] leading-[1.5] text-tm-ink">{c.body}</span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-tm-sub">{nameOf(c.author)} · {whenOf(c.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tagCloud.length > 0 && (
        <section className={sideCard} aria-label="태그">
          <p className={sideHead}>태그</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {tagCloud.map(([t, n]) => (
              <button key={t} type="button" onClick={() => go({ tag: t })}
                className={`rounded-full border px-2.5 py-[3px] text-[13px] transition-colors duration-150 ${
                  filter.tag === t && route.kind === 'list' ? 'border-tm-blue bg-tm-blue text-white' : 'border-tm-line text-tm-ink hover:border-tm-blue hover:text-tm-blue'}`}
                title={`${n}개의 글`}>
                #{t}
              </button>
            ))}
          </div>
        </section>
      )}
    </aside>
  );

  /* 좁은 화면 - 카테고리를 글 위에 가로로 */
  const chips = (
    <nav aria-label="카테고리" className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] min-[1100px]:hidden [&::-webkit-scrollbar]:hidden">
      {[{ id: null as string | null, name: '전체보기' }, ...tops.flatMap((c) => [c, ...kidsOf(c.id)])].map((c) => (
        <button key={c.id ?? 'all'} type="button" onClick={() => go({ cat: c.id })}
          aria-pressed={route.kind === 'list' && !filter.author && !filter.tag && !filter.q && filter.cat === c.id}
          className={`${tmTab} h-[38px] px-3.5 text-[13.5px]`}>
          {c.name}
        </button>
      ))}
    </nav>
  );

  let main: React.ReactNode;
  if (route.kind === 'write') {
    main = (
      <Writer key={`${route.id ?? 'new'}`} me={me} admin={admin} post={editing} store={store} refs={refs}
        tops={tops} kidsOf={kidsOf}
        defaultCat={filter.cat && filter.cat !== NONE && catById.has(filter.cat) ? filter.cat : (tops[0] ? (kidsOf(tops[0].id)[0]?.id ?? tops[0].id) : null)}
        confirm={confirm} onNotice={onNotice}
        onDone={(id) => setRoute(id ? { kind: 'post', id } : route.id ? { kind: 'post', id: route.id } : { kind: 'list' })} />
    );
  } else if (route.kind === 'post') {
    main = post ? (
      <PostView post={post} me={me} admin={admin} store={store} refs={refs} canEdit={canEdit(post)}
        catLabel={catLabel} nameOf={nameOf} likes={likesOf.get(post.id) ?? []}
        siblings={posts.filter((p) => catOf(p) === catOf(post))}
        onCat={() => go({ cat: catOf(post) ?? NONE })}
        onAuthor={() => post.author && go({ author: post.author })}
        onTag={(t) => go({ tag: t })}
        onOpen={openPost}
        onBack={() => setRoute({ kind: 'list' })}
        onEdit={() => setRoute({ kind: 'write', id: post.id })}
        onRemove={() => void removePost(post)}
        onCopy={() => void copyLink(post)}
        confirm={confirm} />
    ) : (
      <div className={`${tmCard} flex flex-col items-start gap-3 p-8`}>
        <p className="text-[20px] font-extrabold text-tm-deep">글을 찾을 수 없습니다</p>
        <p className="text-[15.5px] leading-[1.7] text-tm-ink">지워졌거나 주소가 잘못된 글입니다.</p>
        <button type="button" className={tmBtn} onClick={() => go({})}>블로그 처음으로</button>
      </div>
    );
  } else {
    main = (
      <ListView shown={shown} filter={filter} page={page} setPage={(n) => { setPage(n); toTop(); }} mode={mode} setMode={setMode}
        store={store} catLabel={catLabel} shortCat={shortCat} catOf={catOf} nameOf={nameOf} likesOf={likesOf} commentCount={commentCount}
        onOpen={openPost} onClear={() => go({})} onWrite={() => setRoute({ kind: 'write', id: null })}
        all={posts} fresh={freshIds} onReadAll={readAll} />
    );
  }

  return (
    <div ref={scrollRef} className={scrollBox}>
      {store.loadError && (
        <div role="alert" className={`${tmCallout} mb-4`}>
          <p className="min-w-0 flex-1">{store.loadError}</p>
          <button type="button" className={tmGhostBtn} onClick={() => void store.reload()}>다시 시도</button>
        </div>
      )}
      <div className="grid gap-6 min-[1100px]:grid-cols-[256px_minmax(0,1fr)] min-[1500px]:grid-cols-[280px_minmax(0,1fr)]">
        {sidebar}
        <div className="min-w-0 max-[1099px]:order-1">
          {route.kind === 'list' && chips}
          {main}
        </div>
      </div>
      {manage && (
        <CategoryManager store={store} tops={tops} kidsOf={kidsOf} catCount={catCount} confirm={confirm} onClose={() => setManage(false)} />
      )}
      {confirmNode}
    </div>
  );
}

/* ── 글 목록 ───────────────────────────────────────────── */

function Meta({ post, nameOf, likes, comments }: {
  post: BlogPost; nameOf(id: string | null): string; likes: number; comments: number;
}) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-tm-sub">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Avatar id={post.author} size={20} />
        <span className="truncate font-semibold text-tm-ink">{nameOf(post.author)}</span>
      </span>
      <span className="tabular-nums">{whenOf(post.createdAt)}</span>
      <span className="inline-flex items-center gap-1 tabular-nums" title="공감"><IconHeart size={14} />{likes}</span>
      <span className="inline-flex items-center gap-1 tabular-nums" title="댓글"><IconBubble size={14} />{comments}</span>
      <span className="inline-flex items-center gap-1 tabular-nums" title="조회"><IconEye size={14} />{post.views}</span>
    </span>
  );
}

/** 아직 열어 보지 않은 남의 새 글 - 제목 곁 N */
const NewPost = () => <NewMark label="새 글" title="아직 안 본 새 글" className="ml-1.5 align-[3px]" />;

function ListView({
  shown, all, filter, page, setPage, mode, setMode, store, catLabel, shortCat, catOf, nameOf, likesOf, commentCount, onOpen, onClear, onWrite,
  fresh, onReadAll,
}: {
  shown: BlogPost[];
  all: BlogPost[];
  /** 남이 쓴 새 글 중 아직 열어 보지 않은 것 - 제목 곁에 N */
  fresh: ReadonlySet<string>;
  onReadAll(): void;
  filter: Filter;
  page: number;
  setPage(n: number): void;
  mode: ListMode;
  setMode(m: ListMode): void;
  store: BlogStore;
  catLabel(id: string | null): string;
  shortCat(id: string | null): string;
  catOf(p: BlogPost): string | null;
  nameOf(id: string | null): string;
  likesOf: Map<string, string[]>;
  commentCount: Map<string, number>;
  onOpen(id: string): void;
  onClear(): void;
  onWrite(): void;
}) {
  const per = mode === 'album' ? PAGE_ALBUM : PAGE_LIST;
  const pages = Math.max(1, Math.ceil(shown.length / per));
  const cur = Math.min(page, pages);
  const slice = shown.slice((cur - 1) * per, cur * per);
  const plain = !filter.cat && !filter.author && !filter.tag && !filter.q;

  const title = filter.q ? `‘${filter.q}’ 검색 결과`
    : filter.tag ? `#${filter.tag}`
      : filter.author ? `${nameOf(filter.author)} 님의 글`
        : filter.cat === NONE ? '미분류'
          : filter.cat ? catLabel(filter.cat) : '전체보기';

  /* 인기 글 - 최근 60일 글 중 공감 · 댓글 · 조회로 */
  const popular = useMemo(() => {
    if (!plain || cur !== 1) return [];
    const since = Date.now() - 60 * 24 * 3600 * 1000;
    const score = (p: BlogPost) => (likesOf.get(p.id)?.length ?? 0) * 3 + (commentCount.get(p.id) ?? 0) * 2 + p.views;
    return all.filter((p) => new Date(p.createdAt).getTime() >= since && score(p) > 0)
      .sort((a, b) => score(b) - score(a)).slice(0, 4);
  }, [plain, cur, all, likesOf, commentCount]);
  const notices = shown.filter((p) => p.notice).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-[1.25] tracking-[-0.02em] text-tm-deep max-[900px]:text-[22px]">{title}</h1>
          <p className="mt-1 text-[14px] text-tm-sub">
            <b className="font-bold tabular-nums text-tm-ink">{shown.length}</b>개의 글
            {fresh.size > 0 && (
              <>
                {' · '}새 글 <b className="font-bold tabular-nums text-tm-red">{fresh.size}</b>
                <button type="button" onClick={onReadAll} className={`${tmTextBtn} ml-2 min-h-0`}>모두 읽음</button>
              </>
            )}
            {!plain && <button type="button" onClick={onClear} className={`${tmTextBtn} ml-2 min-h-0`}>전체보기로</button>}
          </p>
        </div>
        <div role="group" aria-label="목록 모양" className="flex gap-1.5">
          <button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')} className={`${tmTab} h-[38px] px-3.5 text-[13.5px]`}>
            <IconListMode />목록형
          </button>
          <button type="button" aria-pressed={mode === 'album'} onClick={() => setMode('album')} className={`${tmTab} h-[38px] px-3.5 text-[13.5px]`}>
            <IconAlbum />앨범형
          </button>
        </div>
      </div>

      {notices.length > 0 && cur === 1 && (
        <section aria-label="공지" className={`${tmCard} divide-y divide-tm-line px-4`}>
          {notices.map((p) => (
            <button key={p.id} type="button" onClick={() => onOpen(p.id)} className="flex w-full items-center gap-3 py-2.5 text-left">
              <span className="flex-none rounded-full bg-tm-red-tint px-2.5 py-[2px] text-[12.5px] font-bold text-tm-red">공지</span>
              <span className="min-w-0 truncate text-[15px] font-bold text-tm-ink hover:underline">{p.title}</span>
              {fresh.has(p.id) && <NewPost />}
              <span className="flex-1" />
              <span className="flex-none text-[13px] tabular-nums text-tm-sub max-[600px]:hidden">{whenOf(p.createdAt)}</span>
            </button>
          ))}
        </section>
      )}

      {popular.length > 0 && (
        <section aria-label="인기 글">
          <p className="mb-2.5 text-[15px] font-extrabold text-tm-deep">인기 글</p>
          <ul className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
            {popular.map((p) => {
              const d = digest(p.body);
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => onOpen(p.id)} className={`${tmCard} group block w-full overflow-hidden text-left`}>
                    <Thumb src={d.image} fileUrl={store.fileUrl} label={shortCat(catOf(p))} className="aspect-[16/10] w-full" />
                    <span className="block p-3">
                      <span className="line-clamp-2 text-[14.5px] font-bold leading-[1.45] text-tm-ink group-hover:text-tm-blue">{p.title}</span>
                      <span className="mt-1 flex items-center gap-2 text-[12.5px] text-tm-sub">
                        <span className="truncate">{nameOf(p.author)}</span>
                        <span className="inline-flex items-center gap-0.5 tabular-nums"><IconHeart size={12} />{likesOf.get(p.id)?.length ?? 0}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {shown.length === 0 ? (
        <div className={`${tmCard} flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <p className="text-[19px] font-extrabold text-tm-deep">{plain ? '아직 글이 없습니다' : '찾는 글이 없습니다'}</p>
          <p className="max-w-[42ch] text-[15px] leading-[1.7] text-tm-ink">
            {plain ? '알게 된 것, 해 본 것, 다녀온 곳을 팀원과 나눠 보세요. 첫 글을 기다리고 있습니다.' : '다른 카테고리나 낱말로 찾아보세요.'}
          </p>
          <button type="button" onClick={onWrite} className={tmBtnPrimary}><IconPlus />글쓰기</button>
        </div>
      ) : mode === 'album' ? (
        <ul className="grid grid-cols-2 gap-4 min-[760px]:grid-cols-3 min-[1500px]:grid-cols-4">
          {slice.map((p) => {
            const d = digest(p.body);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onOpen(p.id)} className={`${tmCard} group block h-full w-full overflow-hidden text-left`}>
                  <Thumb src={d.image} fileUrl={store.fileUrl} label={shortCat(catOf(p))} className="aspect-square w-full" />
                  <span className="block p-3">
                    <span className="line-clamp-2 text-[14.5px] font-bold leading-[1.45] text-tm-ink group-hover:text-tm-blue">
                      {p.notice && <span className="mr-1 text-tm-red">[공지]</span>}{p.title}
                      {fresh.has(p.id) && <NewPost />}
                    </span>
                    <span className="mt-1.5 block truncate text-[12.5px] text-tm-sub">{nameOf(p.author)} · {whenOf(p.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className={`${tmCard} divide-y divide-tm-line`}>
          {slice.map((p) => {
            const d = digest(p.body);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onOpen(p.id)}
                  className="group flex w-full gap-5 px-6 py-5 text-left transition-colors duration-150 hover:bg-tm-bg max-[720px]:gap-3.5 max-[720px]:px-4 max-[720px]:py-4">
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-[13px] font-bold text-tm-blue">{catLabel(catOf(p))}</span>
                    <span className="line-clamp-2 text-[18px] font-extrabold leading-[1.4] tracking-[-0.01em] text-tm-ink group-hover:text-tm-blue max-[720px]:text-[16px]">
                      {p.notice && <span className="mr-1.5 text-tm-red">[공지]</span>}{p.title}
                      {fresh.has(p.id) && <NewPost />}
                    </span>
                    {d.text && <span className="line-clamp-2 text-[14.5px] leading-[1.65] text-tm-sub max-[720px]:hidden">{d.text}</span>}
                    <span className="mt-1"><Meta post={p} nameOf={nameOf} likes={likesOf.get(p.id)?.length ?? 0} comments={commentCount.get(p.id) ?? 0} /></span>
                  </span>
                  {d.image && (
                    <Thumb src={d.image} fileUrl={store.fileUrl} label="" className="h-[104px] w-[140px] flex-none self-center rounded-tm-sm max-[720px]:h-[72px] max-[720px]:w-[88px]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-1.5">
          <button type="button" className={tmIconBtnSm} disabled={cur <= 1} aria-label="이전 페이지" onClick={() => setPage(cur - 1)}>
            <IconArrow dir="left" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === pages || Math.abs(n - cur) <= 2)
            .map((n, i, arr) => (
              <span key={n} className="contents">
                {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-tm-sub">…</span>}
                <button type="button" aria-current={n === cur ? 'page' : undefined} onClick={() => setPage(n)}
                  className={`grid h-9 min-w-9 place-items-center rounded-tm-sm px-2 text-[14px] font-bold tabular-nums [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-11 ${
                    n === cur ? 'bg-tm-blue text-white' : 'text-tm-ink hover:bg-tm-tint'}`}>
                  {n}
                </button>
              </span>
            ))}
          <button type="button" className={tmIconBtnSm} disabled={cur >= pages} aria-label="다음 페이지" onClick={() => setPage(cur + 1)}>
            <IconArrow dir="right" />
          </button>
        </nav>
      )}
    </div>
  );
}

/* ── 글 보기 ──────────────────────────────────────────── */

function PostView({
  post, me, admin, store, refs, canEdit, catLabel, nameOf, likes, siblings, onCat, onAuthor, onTag, onOpen, onBack, onEdit, onRemove, onCopy, confirm,
}: {
  post: BlogPost;
  me: string;
  admin: boolean;
  store: BlogStore;
  refs: WikiRefs;
  canEdit: boolean;
  catLabel(id: string | null): string;
  nameOf(id: string | null): string;
  likes: string[];
  /** 같은 카테고리의 글(새 글부터) */
  siblings: BlogPost[];
  onCat(): void;
  onAuthor(): void;
  onTag(t: string): void;
  onOpen(id: string): void;
  onBack(): void;
  onEdit(): void;
  onRemove(): void;
  onCopy(): void;
  confirm: ReturnType<typeof useConfirm>[0];
}) {
  const liked = likes.includes(me);
  const edited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 60 * 1000;
  const at = siblings.findIndex((p) => p.id === post.id);
  const newer = at > 0 ? siblings[at - 1] : null;
  const older = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;
  const around = (() => {
    if (at < 0) return siblings.slice(0, 5);
    const start = Math.max(0, Math.min(at - 2, siblings.length - 5));
    return siblings.slice(start, start + 5);
  })();
  const comments = store.comments.filter((c) => c.post === post.id);

  return (
    <div className="flex flex-col gap-5">
      <article className={`${tmCard} px-10 pb-8 pt-7 max-[900px]:px-6 max-[720px]:px-4 max-[720px]:pb-6 max-[720px]:pt-5`}>
        <div className="mx-auto max-w-[860px]">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onBack} className={`${tmGhostBtn} h-[34px] px-2.5`}>
              <IconArrow dir="left" />목록
            </button>
            <button type="button" onClick={onCat} className="rounded-md px-1.5 py-1 text-[14px] font-bold text-tm-blue hover:underline">
              {catLabel(post.category)}
            </button>
          </div>

          <h1 className="mt-4 text-[30px] font-extrabold leading-[1.35] tracking-[-0.02em] text-tm-ink [overflow-wrap:anywhere] max-[720px]:text-[23px]">
            {post.notice && <span className="mr-2 align-middle text-[14px] font-bold text-tm-red">[공지]</span>}
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-tm-line pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar id={post.author} size={40} />
              <div className="min-w-0">
                <button type="button" onClick={onAuthor} className="block truncate text-[15px] font-bold text-tm-ink hover:underline">
                  {nameOf(post.author)}
                </button>
                <p className="text-[13px] tabular-nums text-tm-sub">
                  {whenOf(post.createdAt, true)}
                  {edited && <span title={`${whenOf(post.updatedAt, true)} 수정`}> · 수정됨</span>}
                  <span> · 조회 {post.views}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={onCopy} className={`${tmGhostBtn} h-[34px] px-3`}><IconLink />링크 복사</button>
              {canEdit && <button type="button" onClick={onEdit} className={`${tmGhostBtn} h-[34px] px-3`}>수정</button>}
              {canEdit && <button type="button" onClick={onRemove} className={`${tmGhostDanger} h-[34px] px-3`}>삭제</button>}
            </div>
          </div>

          {/* 읽기 화면 - 본문이 그림으로 끝나면 편집기가 그 그림을 고른 채로 열려 파란 테두리가 남는다. 읽기에서는 지운다 */}
          <div className="mt-6 min-h-[80px] [&_.ProseMirror-selectednode]:!outline-none [&_.tm-image]:!outline-none">
            {post.body.trim() ? (
              <DocEditor key={post.id} body={post.body} editable={false} refs={refs} />
            ) : (
              <p className="py-4 text-[15px] text-tm-sub">본문이 없는 글입니다.</p>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <button key={t} type="button" onClick={() => onTag(t)}
                  className="rounded-full bg-tm-tint px-3 py-1 text-[13.5px] font-semibold text-tm-blue hover:underline">
                  #{t}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-tm-line pt-5">
            <button type="button" onClick={() => store.toggleLike(post.id, me)} aria-pressed={liked}
              className={`inline-flex h-[42px] items-center gap-2 rounded-full border px-4 text-[14.5px] font-bold transition-colors duration-150 ${
                liked ? 'border-tm-red bg-tm-red-tint text-tm-red' : 'border-tm-edge text-tm-ink hover:border-tm-red hover:text-tm-red'}`}>
              <IconHeart size={18} filled={liked} />
              공감 <span className="tabular-nums">{likes.length}</span>
            </button>
            {likes.length > 0 && (
              <span className="flex items-center" title={likes.map((id) => nameOf(id)).join(', ')}>
                {likes.slice(0, 8).map((id, i) => (
                  <span key={id} className={i ? '-ml-1.5' : ''}><Avatar id={id} size={26} /></span>
                ))}
                {likes.length > 8 && <span className="ml-1.5 text-[13px] text-tm-sub">+{likes.length - 8}</span>}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1.5 text-[14px] text-tm-sub">
              <IconBubble />댓글 <b className="font-bold tabular-nums text-tm-ink">{comments.filter((c) => !c.removed).length}</b>
            </span>
          </div>

          <Comments post={post.id} me={me} admin={admin} comments={comments} store={store} nameOf={nameOf} confirm={confirm} />
        </div>
      </article>

      {siblings.length > 1 && (
        <section aria-label="이 카테고리의 다른 글" className={`${tmCard} px-6 py-5 max-[720px]:px-4`}>
          <p className="mb-2 text-[15px] font-extrabold text-tm-deep">
            ‘{catLabel(post.category)}’ 카테고리의 다른 글
          </p>
          <ul className="divide-y divide-tm-line">
            {around.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onOpen(p.id)} aria-current={p.id === post.id ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 py-2.5 text-left text-[14.5px] ${p.id === post.id ? 'font-bold text-tm-blue' : 'text-tm-ink hover:underline'}`}>
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <span className="flex-none text-[13px] tabular-nums text-tm-sub">{whenOf(p.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap justify-between gap-2">
            {older ? (
              <button type="button" onClick={() => onOpen(older.id)} className={`${tmGhostBtn} max-w-full`}>
                <IconArrow dir="left" /><span className="truncate">이전 글</span>
              </button>
            ) : <span />}
            {newer && (
              <button type="button" onClick={() => onOpen(newer.id)} className={`${tmGhostBtn} max-w-full`}>
                <span className="truncate">다음 글</span><IconArrow dir="right" />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── 댓글 ─────────────────────────────────────────────── */

function Comments({ post, me, admin, comments, store, nameOf, confirm }: {
  post: string;
  me: string;
  admin: boolean;
  comments: BlogComment[];
  store: BlogStore;
  nameOf(id: string | null): string;
  confirm: ReturnType<typeof useConfirm>[0];
}) {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState('');

  const roots = comments.filter((c) => !c.parentId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const send = (body: string, parentId: string | null) => {
    const v = body.trim();
    if (!v) return false;
    store.addComment(post, me, v.slice(0, COMMENT_MAX), parentId);
    return true;
  };
  const remove = async (c: BlogComment) => {
    const ok = await confirm({ title: '댓글을 삭제할까요?', body: '삭제한 댓글은 되돌릴 수 없습니다.', ok: '삭제', tone: 'danger' });
    if (ok) store.removeComment(c.id);
  };
  const keys = (e: React.KeyboardEvent<HTMLTextAreaElement>, run: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
      e.preventDefault();
      run();
    }
  };

  const one = (c: BlogComment, isReply: boolean) => {
    const kids = isReply ? [] : repliesOf(c.id);
    // 지운 댓글은 답글이 있을 때만 자리를 남긴다
    if (c.removed && !kids.some((k) => !k.removed)) return null;
    const mine = c.author === me;
    return (
      <li key={c.id} className={isReply ? 'ml-11 mt-3 max-[720px]:ml-6' : 'py-4'}>
        {c.removed ? (
          <p className="text-[14px] text-tm-sub">삭제된 댓글입니다.</p>
        ) : (
          <div className="flex gap-3">
            <Avatar id={c.author} size={32} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2 text-[13px] text-tm-sub">
                <b className="text-[14px] font-bold text-tm-ink">{nameOf(c.author)}</b>
                <span className="tabular-nums">{whenOf(c.createdAt, true)}</span>
                {c.updatedAt !== c.createdAt && <span>· 수정됨</span>}
              </p>
              {editId === c.id ? (
                <div className="mt-1.5">
                  <textarea value={edit} onChange={(e) => setEdit(e.target.value)} maxLength={COMMENT_MAX} rows={3} autoFocus
                    aria-label="댓글 고치기" className={tmTextarea}
                    onKeyDown={(e) => keys(e, () => { if (edit.trim()) { store.editComment(c.id, edit.trim()); setEditId(null); } })} />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" className={tmGhostBtn} onClick={() => setEditId(null)}>취소</button>
                    <button type="button" className={`${tmBtnPrimary} h-[38px] px-4 text-[14px]`} disabled={!edit.trim()}
                      onClick={() => { store.editComment(c.id, edit.trim()); setEditId(null); }}>저장</button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-[15px] leading-[1.65] text-tm-ink [overflow-wrap:anywhere]">{c.body}</p>
              )}
              {editId !== c.id && (
                <div className="mt-1 flex gap-3 text-[13px] font-semibold text-tm-sub">
                  {!isReply && <button type="button" className="hover:text-tm-blue" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReply(''); }}>답글</button>}
                  {mine && <button type="button" className="hover:text-tm-blue" onClick={() => { setEditId(c.id); setEdit(c.body); }}>수정</button>}
                  {(mine || admin) && <button type="button" className="hover:text-tm-red" onClick={() => void remove(c)}>삭제</button>}
                </div>
              )}
            </div>
          </div>
        )}
        {kids.length > 0 && <ul>{kids.map((k) => one(k, true))}</ul>}
        {replyTo === c.id && (
          <div className="ml-11 mt-3 max-[720px]:ml-6">
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={COMMENT_MAX} rows={2} autoFocus
              placeholder={`${nameOf(c.author)} 님에게 답글`} aria-label="답글" className={tmTextarea}
              onKeyDown={(e) => keys(e, () => { if (send(reply, c.id)) { setReply(''); setReplyTo(null); } })} />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className={tmGhostBtn} onClick={() => setReplyTo(null)}>취소</button>
              <button type="button" className={`${tmBtnPrimary} h-[38px] px-4 text-[14px]`} disabled={!reply.trim()}
                onClick={() => { if (send(reply, c.id)) { setReply(''); setReplyTo(null); } }}>등록</button>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <section aria-label="댓글" className="mt-4">
      <ul className="divide-y divide-tm-line">{roots.map((c) => one(c, false))}</ul>
      <div className="mt-3 rounded-tm-sm border border-tm-line bg-tm-bg p-3">
        <label className="mb-2 flex items-center gap-2 text-[13.5px] font-bold text-tm-ink" htmlFor={`blog-c-${post}`}>
          <Avatar id={me} size={22} />{nameOf(me)}
        </label>
        <textarea id={`blog-c-${post}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={COMMENT_MAX} rows={3}
          placeholder="댓글을 남겨 보세요. Ctrl + Enter 로 등록합니다." className={tmTextarea}
          onKeyDown={(e) => keys(e, () => { if (send(text, null)) setText(''); })} />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[12.5px] tabular-nums text-tm-sub">{text.length} / {COMMENT_MAX}</span>
          <button type="button" className={`${tmBtnPrimary} h-[38px] px-5 text-[14px]`} disabled={!text.trim()}
            onClick={() => { if (send(text, null)) setText(''); }}>등록</button>
        </div>
      </div>
    </section>
  );
}

/* ── 글쓰기 ───────────────────────────────────────────── */

function Writer({ me, admin, post, store, refs, tops, kidsOf, defaultCat, confirm, onNotice, onDone }: {
  me: string;
  admin: boolean;
  /** 고칠 글 - 없으면 새 글 */
  post: BlogPost | null;
  store: BlogStore;
  refs: WikiRefs;
  tops: BlogCategory[];
  kidsOf(id: string): BlogCategory[];
  defaultCat: string | null;
  confirm: ReturnType<typeof useConfirm>[0];
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  /** 올린 글 id - 취소면 null */
  onDone(id: string | null): void;
}) {
  const key = draftKey(me, post?.id ?? null);
  const base: PostText = post
    ? { category: post.category, title: post.title, body: post.body, tags: post.tags, notice: post.notice }
    : { category: defaultCat, title: '', body: '', tags: [], notice: false };
  const [text, setText] = useState<PostText>(base);
  /** 편집기를 새로 세우는 열쇠 - 임시 저장을 불러오면 본문을 갈아 끼운다 */
  const [gen, setGen] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const dirty = useRef(false);
  const latest = useRef(text);
  latest.current = text;

  /* 처음 열 때 - 임시 저장이 있으면 이어 쓸지 묻는다 */
  useEffect(() => {
    const d = readDrafts()[key];
    const newer = d && (!post || d.savedAt > post.updatedAt);
    if (!d || !newer || (!d.title.trim() && !d.body.trim())) {
      titleRef.current?.focus();
      return;
    }
    void confirm({
      title: '임시 저장된 글이 있습니다',
      body: <>{whenOf(d.savedAt, true)}에 저장한 ‘<b>{d.title.trim() || '제목 없음'}</b>’ 을(를) 이어서 쓸까요?</>,
      ok: '이어 쓰기', cancel: post ? '저장된 글로 고치기' : '새로 쓰기',
    }).then((ok) => {
      if (ok) {
        const { savedAt: at, ...rest } = d;
        setText({ ...base, ...rest, tags: cleanTags(rest.tags ?? []) });
        setSavedAt(at);
        setGen((g) => g + 1);
        dirty.current = true;
      } else {
        writeDraft(key, null);
      }
      titleRef.current?.focus();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 고칠 때마다 0.6초 뒤 이 브라우저에 임시 저장 - 화면을 떠날 때도 남긴다 */
  const saveDraft = useCallback(() => {
    if (!dirty.current) return;
    const at = new Date().toISOString();
    if (writeDraft(key, { ...latest.current, savedAt: at })) setSavedAt(at);
  }, [key]);
  useEffect(() => {
    if (!dirty.current) return undefined;
    const t = setTimeout(saveDraft, 600);
    return () => clearTimeout(t);
  }, [text, saveDraft]);
  useEffect(() => () => saveDraft(), [saveDraft]);

  const change = (p: Partial<PostText>) => {
    dirty.current = true;
    setText((t) => ({ ...t, ...p }));
  };

  const addTags = (raw: string) => {
    const more = raw.split(/[,#\s]+/).map((t) => t.trim()).filter(Boolean);
    if (!more.length) return;
    const next = cleanTags([...latest.current.tags, ...more]);
    if (next.length >= TAG_MAX && latest.current.tags.length + more.length > TAG_MAX) onNotice(`태그는 ${TAG_MAX}개까지 달 수 있습니다.`, 'err');
    change({ tags: next });
    setTagInput('');
  };

  const publish = () => {
    const title = text.title.trim();
    if (!title) {
      onNotice('제목을 적어 주세요.', 'err');
      titleRef.current?.focus();
      return;
    }
    setBusy(true);
    const tags = cleanTags([...text.tags, ...tagInput.split(/[,#\s]+/)]);
    const out: PostText = { ...text, title: title.slice(0, TITLE_MAX), tags, notice: admin ? text.notice : (post?.notice ?? false) };
    dirty.current = false;
    writeDraft(key, null);
    if (post) {
      store.updatePost(post.id, out, me);
      onNotice('글을 고쳤습니다.', 'ok');
      onDone(post.id);
    } else {
      const p = store.createPost(me, out);
      onNotice('글을 올렸습니다.', 'ok');
      onDone(p.id);
    }
  };

  const cancel = async () => {
    const changed = dirty.current && (text.title.trim() || text.body.trim());
    if (changed) {
      saveDraft();
      const ok = await confirm({
        title: '글쓰기를 그만둘까요?',
        body: '쓰던 내용은 이 브라우저에 임시 저장되어, 다음에 글쓰기를 누르면 이어 쓸 수 있습니다.',
        ok: '나가기', cancel: '계속 쓰기',
      });
      if (!ok) return;
    }
    dirty.current = false;
    onDone(null);
  };

  const discard = async () => {
    const ok = await confirm({ title: '임시 저장을 지울까요?', body: '쓰던 내용이 모두 사라집니다.', ok: '지우기', tone: 'danger' });
    if (!ok) return;
    dirty.current = false;
    writeDraft(key, null);
    onDone(null);
  };

  return (
    <div className={`${tmCard} px-8 pb-8 pt-6 max-[900px]:px-5 max-[720px]:px-4 max-[720px]:pt-4`}>
      <div className="mx-auto flex max-w-[900px] flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="mr-auto text-[22px] font-extrabold text-tm-deep">{post ? '글 수정' : '글쓰기'}</h1>
          <span className="text-[13px] tabular-nums text-tm-sub" aria-live="polite">
            {savedAt ? `임시 저장 ${whenOf(savedAt, true).split(' ').pop()}` : '쓰는 대로 이 브라우저에 임시 저장됩니다'}
          </span>
          {savedAt && <button type="button" onClick={() => void discard()} className={`${tmGhostDanger} h-[38px]`}>임시 저장 지우기</button>}
          <button type="button" onClick={() => void cancel()} className={`${tmGhostBtn} h-[38px]`}>취소</button>
          <button type="button" onClick={publish} disabled={busy} className={`${tmBtnPrimary} h-[38px] px-5 text-[14px]`}>
            {post ? '저장' : '발행'}
          </button>
        </div>

        <div className="grid gap-3 min-[720px]:grid-cols-[240px_minmax(0,1fr)]">
          <div>
            <label className={tmLabel} htmlFor="blog-cat">카테고리</label>
            <select id="blog-cat" value={text.category ?? ''} onChange={(e) => change({ category: e.target.value || null })}
              className={`${tmSelect} w-full`}>
              {tops.map((c) => [
                <option key={c.id} value={c.id}>{c.name}</option>,
                ...kidsOf(c.id).map((k) => <option key={k.id} value={k.id}>{`  ㄴ ${k.name}`}</option>),
              ])}
              <option value="">미분류</option>
            </select>
          </div>
          <div>
            <label className={tmLabel} htmlFor="blog-title">제목</label>
            <input id="blog-title" ref={titleRef} value={text.title} maxLength={TITLE_MAX}
              onChange={(e) => change({ title: e.target.value })}
              placeholder="제목을 입력하세요" className={`${tmInput} text-[18px] font-bold`} />
          </div>
        </div>

        <div>
          <p className={tmLabel}>본문</p>
          <div className="min-h-[420px] rounded-tm-sm border border-tm-edge bg-tm-card px-6 py-5 focus-within:border-tm-blue max-[720px]:px-3.5 max-[720px]:py-3.5">
            <DocEditor key={gen} body={text.body} editable refs={refs}
              onChange={(md) => change({ body: md })}
              upload={store.upload} allowData={!isRemote}
              onNotice={onNotice} />
          </div>
          <p className="mt-2 text-[13px] leading-[1.6] text-tm-sub">
            / 를 누르면 표 · 그림 · 코드 같은 것을 넣는 메뉴가 열립니다. 그림은 붙여 넣거나 끌어다 놓으면 올라갑니다.
          </p>
        </div>

        <div>
          <label className={tmLabel} htmlFor="blog-tags">태그 <span className="font-normal text-tm-sub">(Enter 나 쉼표로 나눠 {TAG_MAX}개까지)</span></label>
          <div className={`${tmFieldBase} flex min-h-12 flex-wrap items-center gap-1.5 px-2.5 py-2 focus-within:border-tm-blue`}>
            {text.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-tm-tint py-[3px] pl-2.5 pr-1 text-[13.5px] font-semibold text-tm-blue">
                #{t}
                <button type="button" aria-label={`${t} 태그 빼기`} onClick={() => change({ tags: text.tags.filter((x) => x !== t) })}
                  className="grid h-5 w-5 place-items-center rounded-full hover:bg-tm-blue hover:text-white">×</button>
              </span>
            ))}
            <input id="blog-tags" value={tagInput} maxLength={TAG_LEN * 2}
              onChange={(e) => {
                const v = e.target.value;
                if (/[,]/.test(v)) addTags(v);
                else setTagInput(v);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTags(tagInput); }
                if (e.key === 'Backspace' && !tagInput && text.tags.length) change({ tags: text.tags.slice(0, -1) });
              }}
              onBlur={() => addTags(tagInput)}
              placeholder={text.tags.length ? '' : '예: Unity, 셰이더, 회고'}
              className="min-w-[140px] flex-1 bg-transparent px-1 text-[16px] text-tm-ink outline-none placeholder:text-tm-sub" />
          </div>
        </div>

        {admin && (
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px] text-tm-ink">
            <input type="checkbox" checked={text.notice} onChange={(e) => change({ notice: e.target.checked })} className="h-5 w-5 accent-[rgb(var(--tm-blue))]" />
            공지로 올리기 <span className="text-[13px] text-tm-sub">(목록 맨 위에 보입니다. 관리자만)</span>
          </label>
        )}
      </div>
    </div>
  );
}

/* ── 카테고리 관리(관리자) ─────────────────────────────── */

function CategoryManager({ store, tops, kidsOf, catCount, confirm, onClose }: {
  store: BlogStore;
  tops: BlogCategory[];
  kidsOf(id: string): BlogCategory[];
  catCount: Map<string, number>;
  confirm: ReturnType<typeof useConfirm>[0];
  onClose(): void;
}) {
  const [newTop, setNewTop] = useState('');
  const [newKid, setNewKid] = useState<Record<string, string>>({});

  const move = (list: BlogCategory[], i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    // 순서 값을 1, 2, 3 … 으로 다시 매기고 둘을 바꾼다
    const next = list.slice();
    [next[i], next[j]] = [next[j], next[i]];
    next.forEach((c, k) => { if (c.order !== k + 1) store.updateCategory(c.id, { order: k + 1 }); });
  };

  const remove = async (c: BlogCategory) => {
    const kids = kidsOf(c.id);
    const n = catCount.get(c.id) ?? 0;
    const ok = await confirm({
      title: `‘${c.name}’ 카테고리를 삭제할까요?`,
      body: (
        <>
          {kids.length > 0 && <>아래 카테고리 {kids.length}개도 함께 지워집니다. </>}
          {n > 0 ? <>이 카테고리의 글 <b>{n}개</b>는 지워지지 않고 미분류로 옮겨집니다.</> : '이 카테고리에는 글이 없습니다.'}
        </>
      ),
      ok: '삭제', tone: 'danger',
    });
    if (ok) store.removeCategory(c.id);
  };

  const add = (name: string, parentId: string | null) => {
    const v = name.trim().slice(0, 40);
    if (!v) return false;
    store.addCategory(v, parentId);
    return true;
  };

  const row = (c: BlogCategory, list: BlogCategory[], i: number, depth: number) => (
    <div key={c.id} className={`flex items-center gap-1.5 ${depth ? 'pl-7' : ''}`}>
      {depth > 0 && <span aria-hidden className="-ml-4 text-[12px] text-tm-edge">ㄴ</span>}
      <input defaultValue={c.name} maxLength={40} aria-label={`${c.name} 이름`}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== c.name) store.updateCategory(c.id, { name: v });
          else e.target.value = c.name;
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) e.currentTarget.blur(); }}
        className={`${tmFieldBase} h-10 min-w-0 flex-1 px-3 text-[15px] ${depth ? '' : 'font-bold'}`} />
      <span className="w-10 flex-none text-right text-[13px] tabular-nums text-tm-sub" title="글 수">{catCount.get(c.id) ?? 0}</span>
      <button type="button" className={tmIconBtnSm} disabled={i === 0} aria-label="위로" onClick={() => move(list, i, -1)}><IconArrow dir="up" /></button>
      <button type="button" className={tmIconBtnSm} disabled={i === list.length - 1} aria-label="아래로" onClick={() => move(list, i, 1)}><IconArrow dir="down" /></button>
      <button type="button" className={`${tmIconBtnSm} hover:!bg-tm-red-tint hover:!text-tm-red`} aria-label={`${c.name} 삭제`} onClick={() => void remove(c)}>
        <svg viewBox="0 0 20 20" width={16} height={16} aria-hidden {...line}><path d="M4.5 6h11M8 6V4.5h4V6M6 6l.7 10h6.6L14 6" /></svg>
      </button>
    </div>
  );

  return (
    <Modal title="카테고리 관리" sub="이름은 칸을 고치면 바로 저장됩니다. 두 단계까지 둘 수 있습니다." size="lg" onClose={onClose}
      foot={<><span className="flex-1" /><button type="button" className={tmBtnPrimary} onClick={onClose}>닫기</button></>}>
      <div className="flex flex-col gap-4">
        {tops.map((c, i) => {
          const kids = kidsOf(c.id);
          return (
            <div key={c.id} className="flex flex-col gap-1.5 rounded-tm-sm border border-tm-line p-3">
              {row(c, tops, i, 0)}
              {kids.map((k, j) => row(k, kids, j, 1))}
              <form className="flex gap-1.5 pl-7" onSubmit={(e) => {
                e.preventDefault();
                if (add(newKid[c.id] ?? '', c.id)) setNewKid((m) => ({ ...m, [c.id]: '' }));
              }}>
                <input value={newKid[c.id] ?? ''} maxLength={40} onChange={(e) => setNewKid((m) => ({ ...m, [c.id]: e.target.value }))}
                  placeholder={`‘${c.name}’ 아래 카테고리 이름`} aria-label={`${c.name} 아래 카테고리 이름`}
                  className={`${tmFieldBase} h-10 min-w-0 flex-1 px-3 text-[15px]`} />
                <button type="submit" className={`${tmGhostBtn} h-10`} disabled={!(newKid[c.id] ?? '').trim()}>추가</button>
              </form>
            </div>
          );
        })}
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          if (add(newTop, null)) setNewTop('');
        }}>
          <input value={newTop} maxLength={40} onChange={(e) => setNewTop(e.target.value)} placeholder="새 카테고리 이름"
            aria-label="새 카테고리 이름" className={`${tmInput} h-11`} />
          <button type="submit" className={`${tmBtn} h-11`} disabled={!newTop.trim()}><IconPlus size={16} />카테고리 추가</button>
        </form>
      </div>
    </Modal>
  );
}
