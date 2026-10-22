'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { initialOf, type Doc, type DomainKey, type Member, type Priority, type Status, type Task } from './types';

/*
 * 팀이 함께 쓰는 저장소(Supabase) 연결.
 *
 * 빌드할 때 아래 두 값이 있으면 작업 · 문서 · 팀원을 Supabase 에 두고 로그인해서 쓴다.
 * 없으면 예전처럼 이 브라우저(localStorage)에만 저장한다 - 키 없이 돌리는 로컬 개발용.
 * NEXT_PUBLIC_ 값은 빌드할 때 코드에 박히므로, Vercel 에 넣은 뒤에는 다시 배포해야 한다.
 *
 * anon(publishable) 키는 브라우저에 실려도 되는 키다. 누가 무엇을 읽고 쓰는지는 DB 의 RLS 가 정한다
 * (supabase/taskmanager.sql). service_role 키는 이 사이트 어디에도 넣지 않는다.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isRemote = SUPABASE_URL !== '' && SUPABASE_KEY !== '';

let client: SupabaseClient | null = null;

/** 브라우저에서만 부른다 - 첫 호출 때 만든다(서버에서 미리 그릴 때는 만들지 않는다) */
export function sb(): SupabaseClient {
  if (!isRemote) throw new Error('Supabase 가 설정되지 않았습니다');
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'mate.taskmanager.auth' },
    });
  }
  return client;
}

/** 표가 아직 없을 때(SQL 을 실행하지 않았을 때)의 응답인가 */
export function isMissingTable(e: { code?: string; message?: string } | null | undefined): boolean {
  if (!e) return false;
  return e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache/i.test(e.message ?? '');
}

/* ── 표의 한 줄 ↔ 화면의 모양 ─────────────────────────────── */

export interface TaskRow {
  id: string;
  num: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  domain: DomainKey;
  assignee: string | null;
  start_date: string | null;
  due_date: string | null;
  labels: string[] | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface DocRow {
  id: string;
  parent_id: string | null;
  title: string;
  body: string;
  author: string | null;
  labels: string[] | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface MemberRow {
  id: string;
  email: string;
  name: string;
  role: string;
  initial: string;
  active: boolean;
  /** 승인 · 승인 취소 · 관리자 지정을 할 수 있다. SQL 을 다시 실행하기 전의 표에는 없다 */
  is_admin?: boolean;
  created_at: string;
}

/** 아직 번호를 받지 못한(저장 중인) 새 작업의 번호 자리 */
export const PENDING_KEY = 'MATE-…';

export function taskFromRow(r: TaskRow): Task {
  return {
    id: r.id,
    key: `MATE-${r.num}`,
    title: r.title,
    description: r.description,
    status: r.status,
    priority: r.priority,
    domain: r.domain,
    assignee: r.assignee,
    start: r.start_date,
    due: r.due_date,
    labels: r.labels ?? [],
    order: r.sort,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** 바뀐 칸만 표의 칸 이름으로 옮긴다. id · key · 시각은 DB 가 맡는다 */
export function taskToRow(p: Partial<Task>): Partial<TaskRow> {
  const r: Partial<TaskRow> = {};
  if (p.title !== undefined) r.title = p.title;
  if (p.description !== undefined) r.description = p.description;
  if (p.status !== undefined) r.status = p.status;
  if (p.priority !== undefined) r.priority = p.priority;
  if (p.domain !== undefined) r.domain = p.domain;
  if (p.assignee !== undefined) r.assignee = p.assignee;
  if (p.start !== undefined) r.start_date = p.start;
  if (p.due !== undefined) r.due_date = p.due;
  if (p.labels !== undefined) r.labels = p.labels;
  if (p.order !== undefined) r.sort = p.order;
  return r;
}

export function docFromRow(r: DocRow): Doc {
  return {
    id: r.id,
    parentId: r.parent_id,
    title: r.title,
    body: r.body,
    author: r.author ?? '',
    labels: r.labels ?? [],
    order: r.sort,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function docToRow(p: Partial<Doc>): Partial<DocRow> {
  const r: Partial<DocRow> = {};
  if (p.parentId !== undefined) r.parent_id = p.parentId;
  if (p.title !== undefined) r.title = p.title;
  if (p.body !== undefined) r.body = p.body;
  if (p.author !== undefined) r.author = p.author || null;
  if (p.labels !== undefined) r.labels = p.labels;
  if (p.order !== undefined) r.sort = p.order;
  return r;
}

export function memberFromRow(r: MemberRow): Member {
  const name = r.name.trim() || r.email.split('@')[0] || '이름 없음';
  return {
    id: r.id,
    name,
    role: r.role,
    initial: r.initial.trim() || initialOf(name),
    email: r.email,
    active: r.active,
    isAdmin: r.is_admin === true,
  };
}
