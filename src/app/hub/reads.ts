'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Doc, Task } from './types';
import { isUntouchedSample, type Store } from './store';
import { inTrash, isUntouchedSampleDoc } from './docStore';
import { isRemote, sb } from './supabase';

/*
 * 읽음 표시(2026-11-25) - 왼쪽 메뉴의 알림 숫자(내 작업 · 팀 위키 · 블로그)는 '아직 안 본 것'만 센다. 열어 보면 줄어든다.
 *
 *   · 내 작업: 나에게 맡겨진 작업(완료 빼고) 중 남이 만들거나 고친 뒤 아직 열어 보지 않은 것
 *   · 팀 위키: 남이 만들거나 고친 문서(휴지통 빼고) 중 그 뒤로 아직 열어 보지 않은 것
 *   · 블로그: 남이 쓴 새 글 중 아직 열어 보지 않은 것
 *
 * 사람마다 이 브라우저(localStorage)에 적는다 - 다른 기기와는 맞추지 않는다.
 * 처음 쓰는 사람은 위키 · 블로그는 최근 7일 것부터, 작업은 지금부터 센다
 * (작업에는 누가 고쳤는지 칸이 없어 지난 변경이 내 것인지 남의 것인지 가리지 못한다). 30일이 넘은 것은 알리지 않는다.
 */

export type ReadKind = 'task' | 'doc' | 'blog';

const DAY = 24 * 3600 * 1000;
const FIRST_BACK: Record<ReadKind, number> = { task: 0, doc: 7 * DAY, blog: 7 * DAY };
const KEEP = 30 * DAY;
const KEY = 'mate.hub.reads.v1';

/** since 이후에 바뀐 것만 알린다. seen[id] = 그 항목을 마지막으로 본 시각 */
interface Book { since: number; seen: Record<string, number> }

let shelf: Record<string, Book> | null = null;
let ver = 0;
const subs = new Set<() => void>();

function load(): Record<string, Book> {
  if (shelf) return shelf;
  const out: Record<string, Book> = {};
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as unknown;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.entries(v as Record<string, Partial<Book> | null>).forEach(([k, b]) => {
        if (!b || typeof b.since !== 'number' || !b.seen || typeof b.seen !== 'object') return;
        const seen: Record<string, number> = {};
        Object.entries(b.seen).forEach(([id, at]) => { if (typeof at === 'number') seen[id] = at; });
        out[k] = { since: b.since, seen };
      });
    }
  } catch { /* 깨진 값 · 저장이 막힌 환경 - 빈 것으로 */ }
  shelf = out;
  return out;
}

function bump() {
  ver += 1;
  subs.forEach((f) => f());
}

let pending: ReturnType<typeof setTimeout> | null = null;

function write() {
  const all = load();
  // 30일 넘게 지난 기록은 버린다 - 그보다 오래된 변경은 어차피 알리지 않는다
  const old = Date.now() - KEEP;
  Object.values(all).forEach((b) => {
    Object.keys(b.seen).forEach((id) => { if (b.seen[id] < old) delete b.seen[id]; });
  });
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* 저장이 막힌 환경 - 이번 화면에서만 */ }
}

function save() {
  if (pending) clearTimeout(pending);
  pending = null;
  write();
  bump();
}

/** 화면을 다시 그리지 않고 조금 뒤에 적는다 - 글자를 칠 때마다 고치는 내 작업처럼 자주 오는 것 */
function saveQuiet() {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    write();
  }, 800);
}

/** 다른 탭에서 읽은 것도 바로 반영한다 */
function onStorage(e: StorageEvent) {
  if (e.key !== KEY && e.key !== null) return;
  shelf = null;
  bump();
}

function subscribe(fn: () => void) {
  subs.add(fn);
  if (subs.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    subs.delete(fn);
    if (subs.size === 0) window.removeEventListener('storage', onStorage);
  };
}

function ensure(me: string, kind: ReadKind): Book {
  const all = load();
  const k = `${me}|${kind}`;
  if (!all[k]) {
    all[k] = { since: Date.now() - FIRST_BACK[kind], seen: {} };
    save();
  }
  return all[k];
}

export interface ReadMark { id: string; at: string }

/** 읽었다 - at 은 그 항목이 마지막으로 바뀐 시각(다른 기기의 시계가 조금 빨라도 다시 '새것'이 되지 않게) */
export function markRead(me: string, kind: ReadKind, marks: ReadMark | ReadMark[]) {
  if (!me || typeof window === 'undefined') return;
  const b = ensure(me, kind);
  const now = Date.now();
  let changed = false;
  (Array.isArray(marks) ? marks : [marks]).forEach(({ id, at }) => {
    const t = Date.parse(at);
    if (!Number.isFinite(t) || t <= Math.max(b.since, b.seen[id] ?? 0)) return;
    b.seen[id] = Math.max(now, t);
    changed = true;
  });
  if (changed) save();
}

/**
 * 내가 지금 고치는 것 - 앞으로 ms 동안 바뀌는 것은 읽은 것으로 둔다(서버가 고친 시각을 새로 찍어 돌려주는 것까지).
 * 화면은 다시 그리지 않는다: 고친 내용이 어차피 화면을 다시 그리고, 그때 이 값을 읽는다
 */
function holdRead(me: string, kind: ReadKind, id: string, ms: number) {
  if (!me || typeof window === 'undefined') return;
  const b = ensure(me, kind);
  b.seen[id] = Math.max(b.seen[id] ?? 0, Date.now() + ms);
  saveQuiet();
}

export type UnreadTest = (id: string, at: string) => boolean;
const NONE: UnreadTest = () => false;

/** 아직 안 본 것인지 - 서버에서 그릴 때와 저장한 것을 읽기 전에는 모두 '본 것' */
export function useUnread(me: string, kind: ReadKind): UnreadTest {
  const v = useSyncExternalStore(subscribe, () => ver, () => -1);
  useEffect(() => {
    if (me) ensure(me, kind);
  }, [me, kind]);
  return useMemo(() => {
    if (v < 0 || !me) return NONE;
    const b = load()[`${me}|${kind}`];
    if (!b) return NONE;
    const floor = Math.max(b.since, Date.now() - KEEP);
    // b.seen 을 그대로 읽는다 - holdRead 가 화면을 다시 그리지 않고 적은 것도 보이게
    return (id, at) => {
      const t = Date.parse(at);
      return Number.isFinite(t) && t > floor && t > (b.seen[id] ?? 0);
    };
  }, [v, me, kind]);
}

/* ── 무엇이 새것인가 ───────────────────────────────────── */

/**
 * 나에게 맡겨진 작업(완료 빼고) 중 아직 안 본 변경이 있는 것. 내가 만들고 아무도 고치지 않은 것,
 * 브라우저 저장 모드의 손대지 않은 예시(열 때마다 지금 시각으로 다시 만든다)는 뺀다
 */
export function freshTasks(tasks: Task[], me: string, unread: UnreadTest): Task[] {
  return tasks.filter((t) => t.assignee === me && t.status !== 'done' && !isUntouchedSample(t)
    && !(t.owner === me && t.createdAt === t.updatedAt) && unread(t.id, t.updatedAt));
}

/** 남이 만들거나 고친 뒤 내가 아직 열어 보지 않은 문서 - 휴지통 것 · 손대지 않은 예시는 빼고, 최근 것부터 */
export function freshDocs(docs: Doc[], me: string, unread: UnreadTest): Doc[] {
  const byId = new Map(docs.map((d) => [d.id, d]));
  return docs
    .filter((d) => (d.updatedBy ?? d.author) !== me && unread(d.id, d.updatedAt) && !isUntouchedSampleDoc(d) && !inTrash(d, byId))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

/* ── 작업: 내가 고친 것은 바로 읽은 것으로 ──────────────── */

/** 서버가 고친 시각을 다시 찍어 돌려줄 때까지 기다리는 시간 */
const GRACE = 20_000;

/**
 * 작업에는 누가 고쳤는지 칸이 없다. 그래서 이 화면에서 만들거나 고치거나 옮긴 작업은 잠시(서버가 고친 시각을 새로 찍어
 * 돌려줄 때까지) 바뀌어도 읽은 것으로 둔다 - 내가 카드를 옮겼다고 내 작업에 알림이 뜨지 않게
 */
export function useOwnTaskEdits(store: Store, me: string): Store {
  /** 되돌리기 - 어느 작업이 바뀔지 모르므로 잠시 바뀌는 것을 모두 내 것으로 */
  const undoUntil = useRef(0);
  const wrapped = useMemo<Store>(() => {
    const hold = (id: string) => holdRead(me, 'task', id, GRACE);
    return {
      ...store,
      create: (input) => {
        const t = store.create(input);
        hold(t.id);
        return t;
      },
      update: (id, patch, label) => {
        hold(id);
        store.update(id, patch, label);
      },
      move: (id, status, beforeId) => {
        hold(id);
        store.move(id, status, beforeId);
      },
      undo: () => {
        undoUntil.current = Date.now() + GRACE;
        return store.undo();
      },
    };
  }, [store, me]);

  const last = useRef<Map<string, string> | null>(null);
  useEffect(() => {
    const before = last.current;
    last.current = new Map(store.tasks.map((t) => [t.id, t.updatedAt]));
    if (!before || !me || undoUntil.current <= Date.now()) return;
    const changed = store.tasks.filter((t) => before.get(t.id) !== t.updatedAt);
    if (changed.length > 0) markRead(me, 'task', changed.map((t) => ({ id: t.id, at: t.updatedAt })));
  }, [store.tasks, me]);

  return wrapped;
}

/* ── 블로그: 메뉴 숫자용 새 글 목록 ──────────────────────── */

export interface FeedPost { id: string; author: string | null; createdAt: string }

/** blogStore.ts 의 브라우저 저장 키 - 블로그 화면 코드를 Hub 첫 짐에 싣지 않으려고 따로 적는다 */
const BLOG_LOCAL_KEY = 'mate.taskmanager.blog.v1';

function localFeed(): FeedPost[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(BLOG_LOCAL_KEY) ?? 'null') as { posts?: unknown } | null;
    const posts = Array.isArray(v?.posts) ? (v.posts as Partial<FeedPost>[]) : [];
    return posts.flatMap((p) => (p && typeof p.id === 'string' && typeof p.createdAt === 'string'
      ? [{ id: p.id, author: typeof p.author === 'string' ? p.author : null, createdAt: p.createdAt }] : []));
  } catch {
    return [];
  }
}

/**
 * 최근 30일 블로그 글(번호 · 쓴 사람 · 쓴 시각만) - 블로그 화면을 열지 않아도 메뉴에 새 글 수를 단다.
 * 새 글 · 지운 글은 실시간으로, 그 밖에는 탭으로 돌아올 때와 5분마다 다시 읽는다
 */
export function useBlogFeed(me: string): FeedPost[] {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  useEffect(() => {
    if (!me) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const read = async () => {
      if (!isRemote) {
        setPosts(localFeed());
        return;
      }
      const floor = new Date(Date.now() - KEEP).toISOString();
      const { data, error } = await sb().from('tm_blog_posts').select('id, author, created_at')
        .gt('created_at', floor).order('created_at', { ascending: false }).limit(300);
      // 표가 없거나(블로그 SQL 전) 연결 문제면 그대로 둔다
      if (!alive || error || !data) return;
      setPosts((data as { id: string; author: string | null; created_at: string }[])
        .map((r) => ({ id: r.id, author: r.author ?? null, createdAt: r.created_at })));
    };
    const soon = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void read(), 600);
    };
    void read();
    const every = setInterval(() => void read(), 5 * 60_000);
    const onShow = () => { if (document.visibilityState === 'visible') soon(); };
    document.addEventListener('visibilitychange', onShow);
    const client = isRemote ? sb() : null;
    // 조회수 · 공감으로 바뀌는 것(UPDATE)은 듣지 않는다 - 숫자에는 새 글 · 지운 글만 쓴다
    const channel = client
      ?.channel(`tm-blog-feed-${Math.random().toString(36).slice(2, 10)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tm_blog_posts' }, soon)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tm_blog_posts' }, soon)
      .subscribe();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      clearInterval(every);
      document.removeEventListener('visibilitychange', onShow);
      if (client && channel) void client.removeChannel(channel);
    };
  }, [me]);
  return posts;
}

/** 남이 쓴 글 중 아직 열어 보지 않은 것 */
export function freshPosts<P extends FeedPost>(posts: P[], me: string, unread: UnreadTest): P[] {
  return posts.filter((p) => p.author !== me && unread(p.id, p.createdAt));
}
