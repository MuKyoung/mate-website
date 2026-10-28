'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Memo } from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 개인 메모 저장소 - 브라우저 저장 모드.
 * 문서 저장소(docStore.ts)와 같은 처지다 - Supabase 키 없이 빌드했을 때 localStorage 에만 남는다.
 * 팀 저장소는 remote.ts 이고, 둘은 아래 MemoStore 모양을 함께 쓴다.
 * 개인 메모장이라 예시는 넣지 않고 빈 채로 시작한다.
 */

const KEY = 'mate.taskmanager.memos.v1';

function read(): Memo[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Memo[]) : [];
  } catch {
    return [];
  }
}

function write(memos: Memo[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memos));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

/** 고칠 수 있는 칸 - 주인은 만들 때 정하고 바꾸지 않는다 */
export type MemoText = Partial<Pick<Memo, 'title' | 'body'>>;

export interface MemoStore {
  /** 저장소가 들고 있는 메모. Supabase 모드에서는 RLS 가 내 것만 돌려준다 */
  memos: Memo[];
  ready: boolean;
  /** 새 메모 - text 를 주지 않으면 빈 메모 */
  create(owner: string, text?: MemoText): Memo;
  update(id: string, patch: MemoText): void;
  remove(id: string): void;
  /** Supabase 모드 - 보내는 중 · 실패 */
  sync?: SyncState;
  /** Supabase 모드 - 처음 목록을 읽지 못했을 때의 문구 */
  loadError?: string | null;
  /** Supabase 모드 - 다른 창 · 기기에서 지워 화면에서 뺀 메모 → 보내지 못한 고침이 있었는가 */
  deletedElsewhere?: ReadonlyMap<string, boolean>;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
  /** Supabase 모드 - 서버 목록을 다시 읽는다 */
  reload?(): Promise<void>;
}

/** _opts 는 Supabase 저장소와 같은 모양으로 부르기 위한 자리 */
export function useMemoStore(_opts?: StoreOptions): MemoStore {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [ready, setReady] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    setMemos(read());
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try { setMemos(JSON.parse(e.newValue)); } catch { /* 깨진 값은 무시 */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const create = useCallback<MemoStore['create']>((owner, text = {}) => {
    seq.current += 1;
    const now = new Date().toISOString();
    const memo: Memo = {
      id: `n${Date.now()}-${seq.current}`, owner, title: text.title ?? '', body: text.body ?? '', createdAt: now, updatedAt: now,
    };
    setMemos((prev) => {
      const next = [memo, ...prev];
      write(next);
      return next;
    });
    return memo;
  }, []);

  const update = useCallback<MemoStore['update']>((id, patch) => {
    setMemos((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m));
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback<MemoStore['remove']>((id) => {
    setMemos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      write(next);
      return next;
    });
  }, []);

  return { memos, ready, create, update, remove };
}
