'use client';

import { createContext, useContext } from 'react';
import { MEMBERS, type Member } from './types';

/**
 * 팀원 목록.
 *
 * 브라우저 저장 모드에서는 코드에 적힌 자리표시 목록(MEMBERS)이고,
 * Supabase 모드에서는 tm_members 표를 TaskManagerClient 가 읽어 Provider 로 내려 준다.
 * 아바타 · 담당자 고르기 · 담당자별 묶기는 모두 여기서 읽는다.
 */
export const MembersContext = createContext<Member[]>(MEMBERS);

export function useMembers(): Member[] {
  return useContext(MembersContext);
}

export function useMember(id: string | null): Member | null {
  const list = useMembers();
  return id ? list.find((m) => m.id === id) ?? null : null;
}

/** 담당자로 고를 수 있는 사람 - 승인 대기 중인 계정은 빼고, 이미 맡고 있는 사람은 남긴다 */
export function assignable(list: Member[], current: string | null): Member[] {
  return list.filter((m) => m.active !== false || m.id === current);
}
