'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TASK_COLORS, isTaskColor, type ColorBy, type DomainColor, type DomainKey, type Task, type TaskColor } from './types';
import { useMembers } from './members';
import { domainOf, useDomains } from './domainStore';
import type { StoreOptions, SyncState } from './store';

/**
 * 사람 · 라벨의 색 저장소.
 *
 * 고른 색은 'member:<팀원 id>' · 'label:<라벨>' 을 열쇠로 둔다. 브라우저 저장 모드는 이 브라우저(localStorage)에,
 * Supabase 모드는 tm_colors 표(remote.ts)에 둬 팀원 모두가 같은 색을 본다. 팀원 누구나 고친다.
 * 고르지 않은 것은 자동 색이다 - 사람은 팀원 목록 순서대로 하나씩, 라벨은 이름에서 정한다(라벨이 늘어도 있던 라벨의 색이 바뀌지 않게).
 */

export interface ColorStore {
  picks: ReadonlyMap<string, TaskColor>;
  /** 고칠 수 있는 저장소인가 - Supabase 에 색 표가 아직 없으면(SQL 을 다시 실행하기 전) 거짓이고 자동 색만 쓴다 */
  editable: boolean;
  /** null 이면 자동 색으로 되돌린다 */
  set(key: string, color: TaskColor | null): void;
  /** Supabase 모드 - 보내는 중 · 실패 */
  sync?: SyncState;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
}

export const memberKey = (id: string) => `member:${id}`;
export const labelKey = (label: string) => `label:${label}`;

/** 고른 색 - Workspace 가 저장소에서 읽어 내려 준다 */
export const ColorsContext = createContext<ReadonlyMap<string, TaskColor>>(new Map());

/** 이름 → 자동 색. 같은 이름은 어느 기기에서나 같은 색 */
function hashColor(s: string): TaskColor {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return TASK_COLORS[h % TASK_COLORS.length].id;
}

/** 영역의 네 색은 같은 이름의 색으로 칠한다 */
const DOMAIN_PAINT: Record<DomainColor, TaskColor> = { blue: 'blue', violet: 'violet', teal: 'teal', gray: 'gray' };

export interface Painter {
  member(id: string): TaskColor;
  label(name: string): TaskColor;
  domain(id: DomainKey): TaskColor;
  /** 작업 바탕 - 담당자 · 라벨이 없으면 null(칠하지 않는다). 라벨이 여럿이면 첫 라벨의 색 */
  task(t: Task, by: ColorBy): TaskColor | null;
}

export function usePainter(): Painter {
  const picks = useContext(ColorsContext);
  const members = useMembers();
  const domains = useDomains();
  return useMemo(() => {
    const member = (id: string) => {
      const picked = picks.get(memberKey(id));
      if (picked) return picked;
      const i = members.findIndex((m) => m.id === id);
      return i < 0 ? hashColor(id) : TASK_COLORS[i % TASK_COLORS.length].id;
    };
    const label = (name: string) => picks.get(labelKey(name)) ?? hashColor(name);
    const domain = (id: DomainKey) => DOMAIN_PAINT[domainOf(domains, id).color];
    const task = (t: Task, by: ColorBy) =>
      by === 'domain' ? domain(t.domain)
        : by === 'member' ? (t.assignee ? member(t.assignee) : null)
          : t.labels[0] ? label(t.labels[0]) : null;
    return { member, label, domain, task };
  }, [picks, members, domains]);
}

/* ── 브라우저 저장 모드 ───────────────────────────────────── */

const KEY = 'mate.taskmanager.colors.v1';

/** 저장본 - 모양이 어긋난 칸은 버린다 */
function parse(raw: string): Map<string, TaskColor> {
  const v: unknown = JSON.parse(raw);
  const out = new Map<string, TaskColor>();
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    Object.entries(v).forEach(([k, c]) => { if (isTaskColor(c)) out.set(k, c); });
  }
  return out;
}

function read(): Map<string, TaskColor> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parse(raw) : new Map();
  } catch {
    // 시크릿 모드 · 사이트 데이터 차단 환경에서는 읽기가 던질 수 있다
    return new Map();
  }
}

function write(picks: ReadonlyMap<string, TaskColor>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(picks)));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

/** _opts 는 Supabase 저장소와 같은 모양으로 부르기 위한 자리 */
export function useColorStore(_opts?: StoreOptions): ColorStore {
  const [picks, setPicks] = useState<ReadonlyMap<string, TaskColor>>(() => new Map());

  useEffect(() => {
    setPicks(read());
    // 다른 탭에서 고친 색을 따라간다
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try {
        setPicks(e.newValue ? parse(e.newValue) : new Map());
      } catch {
        /* 깨진 값은 무시 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const set = useCallback<ColorStore['set']>((key, color) => {
    setPicks((prev) => {
      const next = new Map(prev);
      if (color) next.set(key, color);
      else next.delete(key);
      write(next);
      return next;
    });
  }, []);

  return { picks, editable: true, set };
}
