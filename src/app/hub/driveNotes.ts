import { isMissingTable, isRemote, sb } from './supabase';

/*
 * 드라이브 항목(폴더 · 파일 id)에 붙는 팀 기록 - 새 폴더 '확인함', 빌드 파일 안내 · 댓글.
 * 표는 supabase/taskmanager.sql 의 '드라이브 새 폴더 확인 · 빌드 파일 안내 · 댓글' 블록. 쓴 사람 · 때는 DB 가 정한다.
 * 실시간 구독 없이 화면을 열 때 · 쓸 때만 읽는다(요금 · 연결 수를 늘리지 않게).
 * 표가 없으면(SQL 반영 전) 'missing' - 화면은 기록 없이 목록만 보여 준다.
 */

export type Loaded<T> = { kind: 'ok'; value: T } | { kind: 'missing' } | { kind: 'local' } | { kind: 'error'; message: string };

export interface DriveNote { body: string; updatedBy: string | null; updatedAt: string }
export interface DriveComment { id: string; itemId: string; author: string; body: string; createdAt: string }

const errOf = <T,>(e: { code?: string; message?: string }): Loaded<T> =>
  isMissingTable(e) ? { kind: 'missing' } : { kind: 'error', message: e.message ?? '읽지 못했습니다' };

/* ── 새 폴더 확인함 ── */

export async function loadReviews(): Promise<Loaded<Set<string>>> {
  if (!isRemote) return { kind: 'local' };
  const { data, error } = await sb().from('tm_drive_reviews').select('item_id').limit(5000);
  if (error) return errOf(error);
  return { kind: 'ok', value: new Set((data as { item_id: string }[]).map((r) => r.item_id)) };
}

export async function setReviewed(itemId: string, on: boolean): Promise<boolean> {
  if (!isRemote) return false;
  const t = sb().from('tm_drive_reviews');
  const { error } = on
    ? await t.upsert({ item_id: itemId }, { onConflict: 'item_id', ignoreDuplicates: true })
    : await t.delete().eq('item_id', itemId);
  return !error;
}

/* ── 빌드 파일 안내 ── */

/** 안내가 있는 파일 · 댓글 수 - 목록의 표시용(본문은 읽지 않는다) */
export async function loadBuildMarks(): Promise<Loaded<{ notes: Set<string>; comments: Map<string, number> }>> {
  if (!isRemote) return { kind: 'local' };
  const [n, c] = await Promise.all([
    sb().from('tm_drive_notes').select('item_id').neq('body', '').limit(5000),
    sb().from('tm_drive_comments').select('item_id').limit(20000),
  ]);
  if (n.error) return errOf(n.error);
  if (c.error) return errOf(c.error);
  const comments = new Map<string, number>();
  for (const r of c.data as { item_id: string }[]) comments.set(r.item_id, (comments.get(r.item_id) ?? 0) + 1);
  return { kind: 'ok', value: { notes: new Set((n.data as { item_id: string }[]).map((r) => r.item_id)), comments } };
}

export async function loadNote(itemId: string): Promise<Loaded<DriveNote | null>> {
  if (!isRemote) return { kind: 'local' };
  const { data, error } = await sb().from('tm_drive_notes')
    .select('body, updated_by, updated_at').eq('item_id', itemId)
    .maybeSingle<{ body: string; updated_by: string | null; updated_at: string }>();
  if (error) return errOf(error);
  return { kind: 'ok', value: data ? { body: data.body, updatedBy: data.updated_by, updatedAt: data.updated_at } : null };
}

export async function saveNote(itemId: string, body: string): Promise<DriveNote | null> {
  if (!isRemote) return null;
  const { data, error } = await sb().from('tm_drive_notes')
    .upsert({ item_id: itemId, body }, { onConflict: 'item_id' })
    .select('body, updated_by, updated_at')
    .single<{ body: string; updated_by: string | null; updated_at: string }>();
  if (error || !data) return null;
  return { body: data.body, updatedBy: data.updated_by, updatedAt: data.updated_at };
}

/* ── 댓글 ── */

interface CommentRow { id: string; item_id: string; author: string; body: string; created_at: string }
const commentOf = (r: CommentRow): DriveComment => ({ id: r.id, itemId: r.item_id, author: r.author, body: r.body, createdAt: r.created_at });

export async function loadComments(itemId: string): Promise<Loaded<DriveComment[]>> {
  if (!isRemote) return { kind: 'local' };
  const { data, error } = await sb().from('tm_drive_comments')
    .select('id, item_id, author, body, created_at').eq('item_id', itemId).order('created_at').limit(500);
  if (error) return errOf(error);
  return { kind: 'ok', value: (data as CommentRow[]).map(commentOf) };
}

export async function addComment(itemId: string, body: string): Promise<DriveComment | null> {
  if (!isRemote) return null;
  const { data, error } = await sb().from('tm_drive_comments')
    .insert({ item_id: itemId, body })
    .select('id, item_id, author, body, created_at')
    .single<CommentRow>();
  return error || !data ? null : commentOf(data);
}

export async function removeComment(id: string): Promise<boolean> {
  if (!isRemote) return false;
  const { error, count } = await sb().from('tm_drive_comments').delete({ count: 'exact' }).eq('id', id);
  return !error && count === 1;
}
