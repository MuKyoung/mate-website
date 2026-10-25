'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Member } from './types';
import { isMissingTable, memberFromRow, sb, type MemberRow } from './supabase';

/*
 * 로그인과 팀원 - Supabase 모드에서만 쓴다.
 * 계정은 로그인 화면의 가입 요청이나 Supabase 대시보드에서 생긴다. 새 계정은 늘 승인 대기로 생겨
 * 관리자가 '팀원' 창에서 승인해야 작업과 문서가 보인다(supabase/taskmanager.sql).
 * 첫 관리자는 SQL Editor 에서 정한다(TASKMANAGER_SETUP.md 4단계).
 */

/** recovery = 비밀번호 재설정 메일의 링크로 들어왔고 아직 새 비밀번호를 정하지 않았다 */
export type AuthState = { status: 'loading' } | { status: 'out' } | { status: 'in'; user: User; recovery: boolean };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  useEffect(() => {
    const client = sb();
    let alive = true;
    let recovering = false;
    const set = (user: User | null | undefined) => {
      if (alive) setState(user ? { status: 'in', user, recovery: recovering } : { status: 'out' });
    };
    client.auth.getSession().then(
      ({ data }) => set(data.session?.user),
      () => set(null),
    );
    // 이 콜백 안에서는 다른 Supabase 호출을 기다리지 않는다(라이브러리가 막힐 수 있다)
    const { data } = client.auth.onAuthStateChange((event, session) => {
      // 재설정 링크라는 표시는 라이브러리가 처음 뜰 때 한 번만 보낸다 - 새 비밀번호를 정하거나 나갈 때까지 들고 있는다
      if (event === 'PASSWORD_RECOVERY') recovering = true;
      else if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') recovering = false;
      set(session?.user);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return state;
}

/** 실패하면 화면에 보일 문구, 성공하면 null */
export async function signIn(email: string, password: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    // 인증 전 · 막힌 계정도 상태는 400 이라 코드를 먼저 본다
    if (error.code === 'email_not_confirmed') return '메일 인증이 끝나지 않은 계정입니다. 관리자에게 알려 주세요.';
    if (error.code === 'user_banned') return '사용이 막힌 계정입니다. 관리자에게 알려 주세요.';
    if (error.code === 'over_request_rate_limit' || error.status === 429) return '시도가 너무 많습니다. 잠시 뒤 다시 해 주세요.';
    if (error.code === 'invalid_credentials' || error.status === 400) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    return '로그인하지 못했습니다. 잠시 뒤 다시 해 주세요.';
  } catch {
    return '로그인하지 못했습니다. 인터넷 연결을 확인해 주세요.';
  }
}

/**
 * 가입 요청 - 계정을 만들면 DB 가 승인 대기 팀원 줄을 붙인다(이름은 metadata 의 name).
 * in = 바로 로그인됐다(승인 대기 화면으로 간다), confirm = 메일 인증을 켜 둔 프로젝트라 인증 메일을 보냈다
 */
export async function signUp(name: string, email: string, password: string): Promise<{ ok: 'in' | 'confirm' } | { error: string }> {
  try {
    const { data, error } = await sb().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/taskmanager/` },
    });
    if (error) {
      if (error.code === 'user_already_exists' || error.code === 'email_exists') return { error: '이미 가입한 메일입니다. 로그인해 주세요.' };
      if (error.code === 'weak_password') return { error: '비밀번호가 너무 쉽습니다. 더 길게 만들어 주세요.' };
      if (error.code === 'email_address_invalid' || error.code === 'validation_failed') return { error: '메일 주소를 다시 확인해 주세요.' };
      if (error.code === 'signup_disabled' || error.code === 'email_address_not_authorized') {
        return { error: '지금은 가입 요청을 받을 수 없습니다. 관리자에게 알려 주세요.' };
      }
      if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit' || error.status === 429) {
        return { error: '요청이 너무 많습니다. 잠시 뒤 다시 해 주세요.' };
      }
      return { error: '가입 요청을 보내지 못했습니다. 잠시 뒤 다시 해 주세요.' };
    }
    // 메일 인증을 켜 둔 프로젝트는 이미 있는 메일에도 오류 대신 신원(identities)이 빈 계정을 돌려준다
    if (data.user && data.user.identities?.length === 0) return { error: '이미 가입한 메일입니다. 로그인해 주세요.' };
    return { ok: data.session ? 'in' : 'confirm' };
  } catch {
    return { error: '가입 요청을 보내지 못했습니다. 인터넷 연결을 확인해 주세요.' };
  }
}

export async function signOut(): Promise<void> {
  try {
    await sb().auth.signOut();
  } catch {
    /* 연결이 끊겨도 이 브라우저의 로그인은 지운다 */
    await sb().auth.signOut({ scope: 'local' }).catch(() => {});
  }
}

export async function changePassword(password: string): Promise<string | null> {
  try {
    const { error } = await sb().auth.updateUser({ password });
    if (!error) return null;
    if (error.code === 'same_password') return '지금 쓰는 비밀번호와 같습니다.';
    if (error.code === 'weak_password') return '비밀번호가 너무 쉽습니다. 더 길게 만들어 주세요.';
    if (error.code === 'reauthentication_needed') return '보안을 위해 다시 로그인한 뒤 바꿔 주세요.';
    return '비밀번호를 바꾸지 못했습니다. 잠시 뒤 다시 해 주세요.';
  } catch {
    return '비밀번호를 바꾸지 못했습니다. 인터넷 연결을 확인해 주세요.';
  }
}

/** 승인(active) · 관리자(is_admin)는 관리자만 다른 사람 것을 바꿀 수 있다 - DB 가 지킨다 */
export type MemberPatch = Partial<Pick<MemberRow, 'name' | 'role' | 'initial' | 'active' | 'is_admin'>>;

export interface Team {
  /** missing = 표가 없다(SQL 을 아직 실행하지 않았다), error = 불러오지 못했다 */
  status: 'loading' | 'ready' | 'missing' | 'error';
  members: Member[];
  me: Member | null;
  reload(): Promise<void>;
  /** 실패하면 화면에 보일 문구(DB 의 규칙 문구 그대로), 성공하면 null */
  update(id: string, patch: MemberPatch): Promise<string | null>;
  /** 승인 대기 계정을 계정째 지운다(가입 요청 거절). 관리자만 - DB 가 지킨다 */
  reject(id: string): Promise<string | null>;
}

export function useTeam(userId: string | null): Team {
  const [state, setState] = useState<Pick<Team, 'status' | 'members' | 'me'>>({ status: 'loading', members: [], me: null });

  const reload = useCallback(async () => {
    if (!userId) return;
    // 한 번 읽은 뒤의 실패(잠에서 깬 직후 등)로는 작업 화면에서 내보내지 않는다 - 목록은 다음에 읽을 때 맞춘다
    try {
      const { data, error } = await sb().from('tm_members').select('*').order('created_at');
      if (error) {
        setState((s) => (s.status === 'ready' ? s : { ...s, status: isMissingTable(error) ? 'missing' : 'error' }));
        return;
      }
      const members = (data as MemberRow[]).map(memberFromRow);
      setState({ status: 'ready', members, me: members.find((m) => m.id === userId) ?? null });
    } catch {
      setState((s) => (s.status === 'ready' ? s : { ...s, status: 'error' }));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setState({ status: 'loading', members: [], me: null });
      return;
    }
    const client = sb();
    void reload();
    // 승인 · 이름 바꾸기가 다른 화면에도 바로 보이게 - 팀원 목록은 작아서 바뀔 때마다 통째로 다시 읽는다
    const channel = client
      .channel(`tm-members-${Math.random().toString(36).slice(2, 10)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_members' }, () => {
        void reload();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void reload();
      });
    return () => {
      void client.removeChannel(channel);
    };
  }, [userId, reload]);

  const update = useCallback(async (id: string, patch: MemberPatch) => {
    try {
      const { error } = await sb().from('tm_members').update(patch).eq('id', id);
      if (error) return error.message || '저장하지 못했습니다.';
      await reload();
      return null;
    } catch {
      return '저장하지 못했습니다. 인터넷 연결을 확인해 주세요.';
    }
  }, [reload]);

  const reject = useCallback(async (id: string) => {
    try {
      const { error } = await sb().rpc('tm_reject_member', { target: id });
      // 함수가 생기기 전의 DB(SQL 을 다시 실행하지 않았다)
      if (error?.code === 'PGRST202') return '거절 기능이 아직 DB 에 없습니다. supabase/taskmanager.sql 을 다시 실행해 주세요.';
      if (error) return error.message || '거절하지 못했습니다.';
      await reload();
      return null;
    } catch {
      return '거절하지 못했습니다. 인터넷 연결을 확인해 주세요.';
    }
  }, [reload]);

  return { ...state, reload, update, reject };
}
