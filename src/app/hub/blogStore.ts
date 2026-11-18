'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StoreOptions, SyncState } from './store';
import { shrinkImage } from './docStore';
import { useRowSync, useTablesExist } from './remote';
import { isRemote, sb } from './supabase';

/**
 * 팀 블로그(커뮤니티 > 블로그, 2026-11-18) - 네이버 블로그처럼 카테고리 · 글 · 공감 · 댓글 · 조회수.
 * 블로그는 하나이고 팀원 모두가 함께 쓴다. 블로그 화면(Blog.tsx)을 열 때만 받는다 - Hub 첫 짐에는 실리지 않는다.
 *
 *   · Supabase 모드: 표 tm_blog_categories · tm_blog_posts · tm_blog_likes · tm_blog_comments
 *     (supabase/taskmanager.sql 의 '팀 블로그' 블록). 표가 아직 없으면 missing 을 세우고 아무것도 읽지 않는다.
 *   · 브라우저 저장 모드: 이 브라우저(localStorage)에 한 덩어리로 둔다 - 시험용.
 *
 * 처음 카테고리는 팀 위키 '팀 블로그' 아래 구조를 따른다(SQL 의 처음 카테고리와 같은 id).
 */

/* ── 모양 ─────────────────────────────────────────────── */

export interface BlogCategory {
  id: string;
  /** 위 카테고리 - 두 단계까지 */
  parentId: string | null;
  name: string;
  order: number;
}

export interface BlogPost {
  id: string;
  /** 카테고리를 지우면 null(미분류) */
  category: string | null;
  title: string;
  /** 위키와 같은 마크다운 */
  body: string;
  tags: string[];
  /** 공지 - 목록 맨 위. 관리자만 정한다 */
  notice: boolean;
  author: string | null;
  views: number;
  createdAt: string;
  /** 글을 고친 시각 - 조회수 · 공지로는 바뀌지 않는다 */
  updatedAt: string;
  updatedBy: string | null;
}

export interface BlogComment {
  id: string;
  post: string;
  /** 답글이면 맨 위 댓글 */
  parentId: string | null;
  author: string | null;
  body: string;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogLike {
  /** '<글 id>:<팀원 id>' */
  id: string;
  post: string;
  member: string;
  createdAt: string;
}

/** 글쓰기 화면이 보내는 칸 */
export type PostText = Pick<BlogPost, 'category' | 'title' | 'body' | 'tags' | 'notice'>;

export interface BlogStore {
  ready: boolean;
  /** Supabase 모드 - 블로그 표가 아직 없다(SQL 을 아직 돌리지 않았다) */
  missing: boolean;
  loadError: string | null;
  sync: SyncState;
  categories: BlogCategory[];
  posts: BlogPost[];
  comments: BlogComment[];
  likes: BlogLike[];
  addCategory(name: string, parentId: string | null): BlogCategory;
  updateCategory(id: string, patch: Partial<Pick<BlogCategory, 'name' | 'parentId' | 'order'>>): void;
  /** 아래 카테고리도 함께 지운다. 그 글들은 미분류가 된다 */
  removeCategory(id: string): void;
  createPost(author: string, text: PostText): BlogPost;
  updatePost(id: string, text: Partial<PostText>, by: string): void;
  removePost(id: string): void;
  addComment(post: string, author: string, body: string, parentId: string | null): void;
  editComment(id: string, body: string): void;
  removeComment(id: string): void;
  toggleLike(post: string, member: string): void;
  /** 조회수 - 같은 창에서 같은 글은 한 번만 센다 */
  view(post: string): void;
  /** 그림 · 파일을 올리고 본문에 넣을 주소를 돌려준다 */
  upload(file: File): Promise<string>;
  /** tmfile: 주소 → 볼 수 있는 주소 */
  fileUrl(src: string): Promise<string>;
  /** 기다리는 저장을 모두 보낸다 */
  flush(): Promise<void>;
  reload(): Promise<void>;
}

/** 팀 위키 '팀 블로그' 아래 구조 - SQL 의 처음 카테고리와 같다 */
export const DEFAULT_CATEGORIES: BlogCategory[] = [
  { id: 'info', parentId: null, name: '정보 공유', order: 1 },
  { id: 'info-ai', parentId: 'info', name: 'AI', order: 1 },
  { id: 'info-dev', parentId: 'info', name: '개발', order: 2 },
  { id: 'info-design', parentId: 'info', name: '디자인', order: 3 },
  { id: 'info-sound', parentId: 'info', name: '사운드', order: 4 },
  { id: 'info-game', parentId: 'info', name: '게임', order: 5 },
  { id: 'activity', parentId: null, name: '활동 공유', order: 2 },
];

export const TAG_MAX = 20;
export const TAG_LEN = 30;
export const TITLE_MAX = 200;
export const COMMENT_MAX = 4000;
const FILE_MAX = 20 * 1024 * 1024;

/** 태그 정리 - 앞의 # · 공백을 떼고, 같은 것은 하나로 */
export function cleanTags(tags: string[]): string[] {
  const out: string[] = [];
  tags.forEach((t) => {
    const v = t.replace(/^#+/, '').trim().slice(0, TAG_LEN);
    if (v && !out.some((x) => x.toLowerCase() === v.toLowerCase())) out.push(v);
  });
  return out.slice(0, TAG_MAX);
}

const newId = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID() : `b${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

/** 조회수를 이미 센 글 - 이 창(탭)에서만 */
const SEEN_KEY = 'mate.taskmanager.blog.seen.v1';
function firstView(post: string): boolean {
  try {
    const seen = new Set<string>(JSON.parse(window.sessionStorage.getItem(SEEN_KEY) ?? '[]') as string[]);
    if (seen.has(post)) return false;
    seen.add(post);
    window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-500)));
    return true;
  } catch {
    return true;
  }
}

/* ── 브라우저 저장 모드 ─────────────────────────────────── */

const KEY = 'mate.taskmanager.blog.v1';

interface LocalBlog {
  categories: BlogCategory[];
  posts: BlogPost[];
  comments: BlogComment[];
  likes: BlogLike[];
}

const EMPTY: LocalBlog = { categories: DEFAULT_CATEGORIES, posts: [], comments: [], likes: [] };

function readLocal(): LocalBlog {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<LocalBlog>) : null;
    if (!v) return EMPTY;
    return {
      categories: Array.isArray(v.categories) ? v.categories : DEFAULT_CATEGORIES,
      posts: Array.isArray(v.posts) ? v.posts : [],
      comments: Array.isArray(v.comments) ? v.comments : [],
      likes: Array.isArray(v.likes) ? v.likes : [],
    };
  } catch {
    return EMPTY;
  }
}

/** 그림만, data URL 로 - 함수가 늘 같아야 그림 칸이 다시 받지 않는다 */
async function localUpload(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
    throw new Error('이 브라우저 저장 모드에서는 그림(png · jpg · gif · webp)만 넣을 수 있습니다');
  }
  if (file.size > 15 * 1024 * 1024) throw new Error('15MB 넘는 그림은 넣을 수 없습니다');
  const url = await shrinkImage(file);
  if (url.length > 2_500_000) throw new Error('그림이 너무 큽니다. 더 작은 그림을 넣어 주세요');
  return url;
}
const passThrough = async (src: string) => src;
const now = () => new Date().toISOString();

function useLocalBlogStore(): BlogStore {
  const [data, setData] = useState<LocalBlog>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(readLocal());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setData(readLocal());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const change = useCallback((fn: (d: LocalBlog) => LocalBlog) => {
    setData((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch { /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */ }
      return next;
    });
  }, []);

  return useMemo<BlogStore>(() => ({
    ready, missing: false, loadError: null, sync: 'idle',
    ...data,
    addCategory: (name, parentId) => {
      const c: BlogCategory = { id: newId(), parentId, name: name.trim().slice(0, 40), order: Date.now() };
      change((d) => ({ ...d, categories: [...d.categories, c] }));
      return c;
    },
    updateCategory: (id, patch) => change((d) => ({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    removeCategory: (id) => change((d) => {
      const gone = new Set([id, ...d.categories.filter((c) => c.parentId === id).map((c) => c.id)]);
      return {
        ...d,
        categories: d.categories.filter((c) => !gone.has(c.id)),
        posts: d.posts.map((p) => (p.category && gone.has(p.category) ? { ...p, category: null } : p)),
      };
    }),
    createPost: (author, text) => {
      const t = now();
      const p: BlogPost = { id: newId(), ...text, tags: cleanTags(text.tags), author, views: 0, createdAt: t, updatedAt: t, updatedBy: author };
      change((d) => ({ ...d, posts: [p, ...d.posts] }));
      return p;
    },
    updatePost: (id, text, by) => change((d) => ({
      ...d,
      posts: d.posts.map((p) => (p.id === id
        ? { ...p, ...text, ...(text.tags ? { tags: cleanTags(text.tags) } : {}), updatedAt: now(), updatedBy: by } : p)),
    })),
    removePost: (id) => change((d) => ({
      ...d,
      posts: d.posts.filter((p) => p.id !== id),
      comments: d.comments.filter((c) => c.post !== id),
      likes: d.likes.filter((l) => l.post !== id),
    })),
    addComment: (post, author, body, parentId) => {
      const t = now();
      change((d) => ({ ...d, comments: [...d.comments, { id: newId(), post, parentId, author, body, removed: false, createdAt: t, updatedAt: t }] }));
    },
    editComment: (id, body) => change((d) => ({ ...d, comments: d.comments.map((c) => (c.id === id ? { ...c, body, updatedAt: now() } : c)) })),
    removeComment: (id) => change((d) => ({ ...d, comments: d.comments.map((c) => (c.id === id ? { ...c, body: '', removed: true } : c)) })),
    toggleLike: (post, member) => change((d) => {
      const id = `${post}:${member}`;
      return d.likes.some((l) => l.id === id)
        ? { ...d, likes: d.likes.filter((l) => l.id !== id) }
        : { ...d, likes: [...d.likes, { id, post, member, createdAt: now() }] };
    }),
    view: (post) => {
      if (!firstView(post)) return;
      change((d) => ({ ...d, posts: d.posts.map((p) => (p.id === post ? { ...p, views: p.views + 1 } : p)) }));
    },
    upload: localUpload,
    fileUrl: passThrough,
    flush: async () => {},
    reload: async () => setData(readLocal()),
  }), [ready, data, change]);
}

/* ── Supabase 모드 ────────────────────────────────────── */

interface CategoryRow { id: string; parent_id: string | null; name: string; sort: number; created_at: string; updated_at: string }
interface PostRow {
  id: string; category: string | null; title: string; body: string; tags: string[]; notice: boolean;
  author: string | null; views: number; updated_by: string | null; created_at: string; updated_at: string;
}
interface LikeRow { id: string; post: string; member: string; created_at: string }
interface CommentRow {
  id: string; post: string; parent_id: string | null; author: string | null; body: string; removed: boolean;
  created_at: string; updated_at: string;
}

const categoryFromRow = (r: CategoryRow): BlogCategory => ({ id: r.id, parentId: r.parent_id ?? null, name: r.name, order: r.sort });
function categoryToRow(p: Partial<BlogCategory>): Partial<CategoryRow> {
  const r: Partial<CategoryRow> = {};
  if (p.parentId !== undefined) r.parent_id = p.parentId;
  if (p.name !== undefined) r.name = p.name;
  if (p.order !== undefined) r.sort = p.order;
  return r;
}

/** 실시간 알림에서 빠진 칸(바뀌지 않은 긴 본문)은 undefined 로 둔다 - 화면에 있던 값이 남는다 */
const postFromRow = (r: PostRow): BlogPost => ({
  id: r.id, category: r.category ?? null, title: r.title, body: r.body,
  tags: r.tags === undefined ? (undefined as unknown as string[]) : (r.tags ?? []),
  notice: r.notice, author: r.author ?? null, views: r.views,
  createdAt: r.created_at, updatedAt: r.updated_at, updatedBy: r.updated_by ?? null,
});
/** 글 칸만 보낸다 - 쓴 사람 · 시각 · 조회수는 DB 가 적는다 */
function postToRow(p: Partial<BlogPost>): Partial<PostRow> {
  const r: Partial<PostRow> = {};
  if (p.category !== undefined) r.category = p.category;
  if (p.title !== undefined) r.title = p.title;
  if (p.body !== undefined) r.body = p.body;
  if (p.tags !== undefined) r.tags = p.tags;
  if (p.notice !== undefined) r.notice = p.notice;
  return r;
}

const likeFromRow = (r: LikeRow): BlogLike => ({ id: r.id, post: r.post, member: r.member, createdAt: r.created_at });
const likeToRow = (): Partial<LikeRow> => ({});

const commentFromRow = (r: CommentRow): BlogComment => ({
  id: r.id, post: r.post, parentId: r.parent_id ?? null, author: r.author ?? null, body: r.body,
  removed: r.removed, createdAt: r.created_at, updatedAt: r.updated_at,
});
function commentToRow(p: Partial<BlogComment>): Partial<CommentRow> {
  const r: Partial<CommentRow> = {};
  if (p.body !== undefined) r.body = p.body;
  if (p.removed !== undefined) r.removed = p.removed;
  return r;
}

/** 블로그 표가 있는가 - 모듈 수준에 두어 useTablesExist 가 한 번만 묻게 한다 */
const blogProbe = () => [
  sb().from('tm_blog_categories').select('id').limit(1),
  sb().from('tm_blog_posts').select('id,views').limit(1),
  sb().from('tm_blog_likes').select('id').limit(1),
  sb().from('tm_blog_comments').select('id').limit(1),
];

const FILES = 'tm-files';
const FILE_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv', 'text/markdown', 'application/json',
  'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-hwp', 'application/haansofthwp', 'application/vnd.hancom.hwp', 'application/vnd.hancom.hwpx',
  'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/wav',
]);
const signed = new Map<string, { url: string; until: number }>();

function useRemoteBlogStore(opts: StoreOptions): BlogStore {
  const onError = opts.onError;
  const exists = useTablesExist(blogProbe);
  const off = exists !== true;
  const cats = useRowSync<BlogCategory, CategoryRow>({
    table: 'tm_blog_categories', fromRow: categoryFromRow, toRow: categoryToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 카테고리라 고치던 내용을 저장하지 못했습니다.',
      createFail: ({ name }) => `'${name}' 카테고리를 만들지 못했습니다. 카테고리는 관리자만 고칠 수 있습니다.`,
    },
  });
  const posts = useRowSync<BlogPost, PostRow>({
    table: 'tm_blog_posts', fromRow: postFromRow, toRow: postToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 글이라 고치던 내용을 저장하지 못했습니다.',
      createFail: ({ title }) => `'${title}' 글을 올리지 못했습니다. 쓴 내용은 임시 저장에 남아 있습니다.`,
    },
  });
  const likes = useRowSync<BlogLike, LikeRow>({
    table: 'tm_blog_likes', fromRow: likeFromRow, toRow: likeToRow, onError, disabled: off,
    texts: { gone: '공감을 저장하지 못했습니다.', createFail: () => '공감을 저장하지 못했습니다.' },
  });
  const notes = useRowSync<BlogComment, CommentRow>({
    table: 'tm_blog_comments', fromRow: commentFromRow, toRow: commentToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 댓글이라 고친 내용을 저장하지 못했습니다.',
      createFail: () => '댓글을 남기지 못했습니다. 서버가 받아 주지 않았습니다.',
    },
  });

  const ce = cats.eng;
  const pe = posts.eng;
  const le = likes.eng;
  const ne = notes.eng;

  const syncs = [cats.sync, posts.sync, likes.sync, notes.sync];
  const sync: SyncState = syncs.includes('error') ? 'error' : syncs.includes('saving') ? 'saving' : 'idle';

  const addCategory = useCallback<BlogStore['addCategory']>((name, parentId) => {
    const c: BlogCategory = { id: newId(), parentId, name: name.trim().slice(0, 40), order: Date.now() };
    ce.create(c, { id: c.id, ...categoryToRow(c) });
    return c;
  }, [ce]);
  const updateCategory = useCallback<BlogStore['updateCategory']>((id, patch) => ce.patch(id, patch, true), [ce]);
  const removeCategory = useCallback<BlogStore['removeCategory']>((id) => {
    const ids = [id, ...ce.items.filter((c) => c.parentId === id).map((c) => c.id)];
    // 글의 카테고리는 DB 가 비우고(on delete set null) 실시간으로 온다. 그사이 화면은 없는 카테고리를 미분류로 본다
    ce.remove(ids, id);
  }, [ce]);

  const createPost = useCallback<BlogStore['createPost']>((author, text) => {
    const t = new Date().toISOString();
    const p: BlogPost = { id: newId(), ...text, tags: cleanTags(text.tags), author, views: 0, createdAt: t, updatedAt: t, updatedBy: author };
    pe.create(p, { id: p.id, ...postToRow(p) });
    return p;
  }, [pe]);
  const updatePost = useCallback<BlogStore['updatePost']>((id, text, by) => {
    pe.patch(id, { ...text, ...(text.tags ? { tags: cleanTags(text.tags) } : {}), updatedAt: new Date().toISOString(), updatedBy: by }, true);
  }, [pe]);
  const removePost = useCallback<BlogStore['removePost']>((id) => pe.remove([id], id), [pe]);

  const addComment = useCallback<BlogStore['addComment']>((post, author, body, parentId) => {
    const t = new Date().toISOString();
    const c: BlogComment = { id: newId(), post, parentId, author, body, removed: false, createdAt: t, updatedAt: t };
    ne.create(c, { id: c.id, post, parent_id: parentId, body });
  }, [ne]);
  const editComment = useCallback<BlogStore['editComment']>((id, body) => ne.patch(id, { body, updatedAt: new Date().toISOString() }, true), [ne]);
  const removeComment = useCallback<BlogStore['removeComment']>((id) => ne.patch(id, { removed: true, body: '' }, true), [ne]);

  const toggleLike = useCallback<BlogStore['toggleLike']>((post, member) => {
    const id = `${post}:${member}`;
    if (le.items.some((l) => l.id === id)) le.remove([id], id);
    else le.create({ id, post, member, createdAt: new Date().toISOString() }, { id, post, member });
  }, [le]);

  const view = useCallback<BlogStore['view']>((post) => {
    if (!firstView(post)) return;
    // 올라간 숫자는 실시간 알림으로 온다
    void (async () => {
      try {
        await sb().rpc('tm_blog_view', { post_id: post });
      } catch { /* 조회수는 못 세도 글은 보인다 */ }
    })();
  }, []);

  const upload = useCallback<BlogStore['upload']>(async (file) => {
    if (file.size > FILE_MAX) throw new Error('20MB 넘는 파일은 올릴 수 없습니다');
    const ext = (/\.([A-Za-z0-9]{1,8})$/.exec(file.name)?.[1] ?? 'bin').toLowerCase();
    const d = new Date();
    const path = `blog/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${newId()}.${ext}`;
    const { error } = await sb().storage.from(FILES).upload(path, file, {
      contentType: FILE_TYPES.has(file.type) ? file.type : 'application/octet-stream', upsert: false,
    });
    if (error) throw new Error(`'${file.name}' 을(를) 올리지 못했습니다. 인터넷 연결을 확인해 주세요.`);
    return `tmfile:${path}`;
  }, []);

  const fileUrl = useCallback<BlogStore['fileUrl']>(async (src) => {
    if (!src.startsWith('tmfile:')) return src;
    const path = src.slice('tmfile:'.length);
    const hit = signed.get(path);
    if (hit && hit.until > Date.now()) return hit.url;
    const { data, error } = await sb().storage.from(FILES).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) throw new Error('파일을 열지 못했습니다');
    signed.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60 * 1000 });
    return data.signedUrl;
  }, []);

  const flush = useCallback(async () => {
    await Promise.all([ce.flushAll(), pe.flushAll(), le.flushAll(), ne.flushAll()]);
  }, [ce, pe, le, ne]);
  const reload = useCallback(async () => {
    await Promise.all([ce.reload(), pe.reload(), le.reload(), ne.reload()]);
  }, [ce, pe, le, ne]);

  const ready = exists === false || (exists === true && cats.ready && posts.ready && likes.ready && notes.ready);
  return {
    ready,
    missing: exists === false,
    loadError: cats.loadError ?? posts.loadError ?? notes.loadError ?? likes.loadError ?? null,
    sync,
    categories: cats.items, posts: posts.items, comments: notes.items, likes: likes.items,
    addCategory, updateCategory, removeCategory, createPost, updatePost, removePost,
    addComment, editComment, removeComment, toggleLike, view, upload, fileUrl, flush, reload,
  };
}

/** 키가 있으면 Supabase, 없으면 이 브라우저 - 빌드할 때 정해지므로 훅 순서는 바뀌지 않는다 */
export const useBlogStore: (opts: StoreOptions) => BlogStore = isRemote
  ? useRemoteBlogStore
  : () => useLocalBlogStore();
