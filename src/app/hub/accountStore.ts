'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isMissingTable, isRemote, sb } from './supabase';

/*
 * 공용계정(팀 › 공용계정)의 데이터 - 팀이 같이 쓰는 서비스 계정의 아이디 · 비밀번호.
 * 비밀번호는 목록에 실리지 않는다. DB 가 Supabase Vault 에 암호화해 두고, '보기' · '복사' 때 tm_account_secret 으로
 * 한 개씩 꺼내며 그때마다 기록(tm_account_log)을 남긴다. 쓰기는 모두 DB 함수로 한다(supabase/taskmanager.sql '공용계정').
 * 브라우저 저장 모드(팀 저장소 없이 도는 빌드)에서는 쓰지 않는다 - 비밀번호를 이 브라우저에 그대로 둘 수 없다.
 * 화면은 Accounts.tsx - 공용계정을 열 때만 이 파일을 받는다.
 */

export interface SharedAccount {
  id: string;
  service: string;
  url: string;
  login: string;
  note: string;
  /** 관리자만 보는 계정 */
  adminOnly: boolean;
  hasPassword: boolean;
  passwordAt: string | null;
  passwordBy: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
}

export type AccountAction = 'view' | 'copy' | 'create' | 'edit' | 'password' | 'remove';

export interface AccountLogEntry {
  id: number;
  account: string;
  /** 그때의 서비스 이름 - 지운 계정도 이름으로 남는다 */
  service: string;
  member: string | null;
  action: AccountAction;
  at: string;
}

export interface AccountInput {
  service: string;
  url: string;
  login: string;
  note: string;
  adminOnly: boolean;
  /** null = 그대로, '' = 지우기, 그 밖 = 바꾸기 */
  password: string | null;
}

export const SERVICE_MAX = 80;
export const URL_MAX = 500;
export const LOGIN_MAX = 200;
export const NOTE_MAX = 2000;
export const PASSWORD_MAX = 500;

/* secret_id 는 읽을 권한이 없다 - 칸을 하나하나 적는다('*' 는 거절된다) */
const COLS = 'id, service, url, login, note, admin_only, has_password, password_at, password_by, created_by, created_at, updated_by, updated_at';

interface AccountRow {
  id: string;
  service: string;
  url: string;
  login: string;
  note: string;
  admin_only: boolean;
  has_password: boolean;
  password_at: string | null;
  password_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

const fromRow = (r: AccountRow): SharedAccount => ({
  id: r.id,
  service: r.service,
  url: r.url,
  login: r.login,
  note: r.note,
  adminOnly: r.admin_only,
  hasPassword: r.has_password,
  passwordAt: r.password_at,
  passwordBy: r.password_by,
  createdBy: r.created_by,
  createdAt: r.created_at,
  updatedBy: r.updated_by,
  updatedAt: r.updated_at,
});

const byService = (a: SharedAccount, b: SharedAccount) =>
  a.service.localeCompare(b.service, 'ko', { sensitivity: 'base', numeric: true }) || a.createdAt.localeCompare(b.createdAt);

/** local = 브라우저 저장 모드(쓰지 않음) · missing = 표가 아직 DB 에 없다(SQL 을 실행하기 전) */
export type AccountStatus = 'loading' | 'ready' | 'missing' | 'error' | 'local';

export const MISSING_TEXT = '공용계정 표가 아직 DB 에 없습니다. supabase/taskmanager.sql 의 \'공용계정\' 블록을 Supabase SQL Editor 에서 실행해 주세요.';

function friendly(e: { code?: string; message?: string }, fallback: string): string {
  if (isMissingTable(e)) return MISSING_TEXT;
  // DB 함수가 올린 우리말 문구는 그대로(서비스 이름을 적어 주세요 · 등록한 사람과 관리자만 지웁니다 …)
  if (e.message && /[가-힣]/.test(e.message)) return e.message;
  if (/fetch|network/i.test(e.message ?? '')) return '인터넷 연결을 확인해 주세요.';
  return fallback;
}

export interface AccountStore {
  status: AccountStatus;
  message: string;
  list: SharedAccount[];
  reload(): Promise<void>;
  save(id: string | null, input: AccountInput): Promise<{ id: string } | { error: string }>;
  /** 비밀번호 하나 꺼내기 - DB 가 꺼낸 사람을 기록한다. 비밀번호가 없으면 value null */
  secret(id: string, copy: boolean): Promise<{ value: string | null } | { error: string }>;
  /** 실패하면 화면에 보일 문구, 성공하면 null */
  remove(id: string): Promise<string | null>;
  /** account 가 null 이면 모든 계정(관리자 화면) */
  log(account: string | null, limit?: number): Promise<{ list: AccountLogEntry[] } | { error: string }>;
}

export function useAccountStore(): AccountStore {
  const [state, setState] = useState<{ status: AccountStatus; message: string; list: SharedAccount[] }>(
    { status: isRemote ? 'loading' : 'local', message: '', list: [] });
  const alive = useRef(true);

  const reload = useCallback(async () => {
    if (!isRemote) return;
    try {
      const { data, error } = await sb().from('tm_accounts').select(COLS);
      if (!alive.current) return;
      if (error) {
        // 한 번 읽은 뒤의 실패로는 보던 목록을 지우지 않는다
        setState((s) => (s.status === 'ready' ? s
          : { status: isMissingTable(error) ? 'missing' : 'error', message: friendly(error, '공용계정을 읽지 못했습니다.'), list: [] }));
        return;
      }
      const list = ((data ?? []) as AccountRow[]).map(fromRow).sort(byService);
      setState({ status: 'ready', message: '', list });
    } catch {
      if (alive.current) setState((s) => (s.status === 'ready' ? s : { status: 'error', message: '인터넷 연결을 확인해 주세요.', list: [] }));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!isRemote) return () => { alive.current = false; };
    void reload();
    const client = sb();
    // 다른 사람이 등록 · 고친 것도 새로고침 없이 - 줄이 적어 바뀔 때마다 통째로 다시 읽는다(비밀번호는 이 표에 없다)
    const channel = client
      .channel(`tm-accounts-${Math.random().toString(36).slice(2, 10)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_accounts' }, () => { void reload(); })
      .subscribe();
    return () => {
      alive.current = false;
      void client.removeChannel(channel);
    };
  }, [reload]);

  const save = useCallback(async (id: string | null, input: AccountInput): Promise<{ id: string } | { error: string }> => {
    if (!isRemote) return { error: '팀 저장소에 연결된 Hub 에서만 씁니다.' };
    try {
      const { data, error } = await sb().rpc('tm_account_save', {
        p_id: id,
        p_service: input.service,
        p_url: input.url,
        p_login: input.login,
        p_note: input.note,
        p_admin_only: input.adminOnly,
        p_password: input.password,
      });
      if (error) return { error: friendly(error, '저장하지 못했습니다. 잠시 뒤 다시 해 주세요.') };
      void reload();
      return { id: String(data) };
    } catch {
      return { error: '인터넷 연결을 확인해 주세요.' };
    }
  }, [reload]);

  const secret = useCallback(async (id: string, copy: boolean): Promise<{ value: string | null } | { error: string }> => {
    if (!isRemote) return { error: '팀 저장소에 연결된 Hub 에서만 씁니다.' };
    try {
      const { data, error } = await sb().rpc('tm_account_secret', { p_id: id, p_copy: copy });
      if (error) return { error: friendly(error, '비밀번호를 꺼내지 못했습니다. 잠시 뒤 다시 해 주세요.') };
      return { value: typeof data === 'string' ? data : null };
    } catch {
      return { error: '인터넷 연결을 확인해 주세요.' };
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<string | null> => {
    if (!isRemote) return '팀 저장소에 연결된 Hub 에서만 씁니다.';
    try {
      const { error } = await sb().rpc('tm_account_remove', { p_id: id });
      if (error) return friendly(error, '지우지 못했습니다. 잠시 뒤 다시 해 주세요.');
      setState((s) => ({ ...s, list: s.list.filter((a) => a.id !== id) }));
      void reload();
      return null;
    } catch {
      return '인터넷 연결을 확인해 주세요.';
    }
  }, [reload]);

  const log = useCallback(async (account: string | null, limit = 100): Promise<{ list: AccountLogEntry[] } | { error: string }> => {
    if (!isRemote) return { list: [] };
    try {
      let q = sb().from('tm_account_log').select('id, account, service, member, action, at').order('at', { ascending: false }).limit(limit);
      if (account) q = q.eq('account', account);
      const { data, error } = await q;
      if (error) return { error: friendly(error, '기록을 읽지 못했습니다.') };
      return { list: (data ?? []) as AccountLogEntry[] };
    } catch {
      return { error: '인터넷 연결을 확인해 주세요.' };
    }
  }, []);

  return { ...state, reload, save, secret, remove, log };
}
