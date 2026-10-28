'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DOMAINS, DOMAIN_COLORS, isDomainColor, type Domain, type DomainColor, type DomainKey } from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 영역 저장소 - 작업을 가르는 갈래의 이름 · 짧은 이름 · 색 · 순서.
 *
 * 브라우저 저장 모드는 이 브라우저(localStorage)에 두고, Supabase 모드는 tm_domains 표(remote.ts)를 쓴다.
 * Supabase 모드에서 고치기는 영역을 맡은 사람(tm_members.domain_editor - 관리자와 따로 SQL Editor 에서 정한다)만 한다.
 * 화면은 그 사람에게만 '관리'를 보이고, 규칙은 DB(RLS · tm_domain_remove)가 지킨다.
 * 브라우저 저장 모드는 계정이 없고 이 브라우저 밖으로 나가지 않으므로 누구나 고친다.
 */

export interface DomainStore {
  /** 메뉴 순서대로 */
  domains: Domain[];
  ready: boolean;
  /** 고칠 수 있는 저장소인가 - Supabase 에 영역 표가 아직 없으면(SQL 을 다시 실행하기 전) 거짓 */
  editable: boolean;
  create(input: { label: string; short?: string; color: DomainColor }): Domain;
  update(id: DomainKey, patch: Partial<Pick<Domain, 'label' | 'short' | 'color' | 'order'>>): void;
  /**
   * 영역을 지운다. 됐으면 참.
   * Supabase 모드는 그 영역의 작업을 moveTo 로 옮기는 것까지 DB 가 한 번에 한다. 브라우저 저장 모드는 부르는 쪽이 먼저 옮긴다
   */
  remove(id: DomainKey, moveTo: DomainKey): Promise<boolean>;
  /** Supabase 모드 - 보내는 중 · 실패 */
  sync?: SyncState;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
}

/** 메뉴 순서 - 순서 값이 같으면 이름 순 */
export const byOrder = (a: Domain, b: Domain) => a.order - b.order || a.label.localeCompare(b.label, 'ko');

/** 새 영역은 맨 아래로 */
export const nextOrder = (list: Domain[]) => list.reduce((max, d) => Math.max(max, d.order), 0) + 1000;

/** 새 영역의 색 - 가장 적게 쓰인 색 */
export function leastUsedColor(list: Domain[]): DomainColor {
  const used = (c: DomainColor) => list.filter((d) => d.color === c).length;
  return DOMAIN_COLORS.reduce((best, c) => (used(c.id) < used(best) ? c.id : best), DOMAIN_COLORS[0].id);
}

/** id 를 한 칸 위(-1) · 아래(1)로 옮길 때 새 순서 값 - 바뀌는 영역만 돌려준다 */
export function reorder(list: Domain[], id: DomainKey, dir: -1 | 1): { id: DomainKey; order: number }[] {
  const cur = list.slice().sort(byOrder);
  const i = cur.findIndex((d) => d.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= cur.length) return [];
  [cur[i], cur[j]] = [cur[j], cur[i]];
  return cur.flatMap((d, k) => (d.order === (k + 1) * 1000 ? [] : [{ id: d.id, order: (k + 1) * 1000 }]));
}

/** 새 작업의 영역 - 예전처럼 '내부 · 운영', 그 영역이 지워졌으면 맨 위 영역 */
export function defaultDomain(list: Domain[]): DomainKey {
  return list.some((d) => d.id === 'ops') ? 'ops' : list[0]?.id ?? 'ops';
}

/**
 * 영역 목록 - Workspace 가 저장소에서 읽어 내려 준다.
 * 카드 · 목록 · 타임라인 · 캘린더 · 로드맵 · 작업 창은 모두 여기서 이름과 색을 읽는다
 */
export const DomainsContext = createContext<Domain[]>(DEFAULT_DOMAINS);

export function useDomains(): Domain[] {
  return useContext(DomainsContext);
}

/** 목록에 없는 영역(방금 지워졌거나 아직 받지 못한 것)은 회색 '영역 없음'으로 보인다 */
export function domainOf(list: Domain[], id: DomainKey): Domain {
  return list.find((d) => d.id === id) ?? { id, label: '영역 없음', short: '영역 없음', color: 'gray', order: Number.MAX_SAFE_INTEGER };
}

export function useDomain(id: DomainKey): Domain {
  return domainOf(useDomains(), id);
}

/* ── 브라우저 저장 모드 ───────────────────────────────────── */

const KEY = 'mate.taskmanager.domains.v1';

/** 저장본 - 모양이 어긋난 줄은 버리고, 하나도 남지 않으면 null(처음 값을 쓴다) */
function parse(raw: string): Domain[] | null {
  const v: unknown = JSON.parse(raw);
  if (!Array.isArray(v)) return null;
  const list = v.flatMap((d): Domain[] =>
    d && typeof d.id === 'string' && typeof d.label === 'string' && d.label.trim() && typeof d.order === 'number' && isDomainColor(d.color)
      ? [{ id: d.id, label: d.label, short: typeof d.short === 'string' ? d.short : '', color: d.color, order: d.order }]
      : []);
  return list.length ? list : null;
}

function read(): Domain[] | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parse(raw) : null;
  } catch {
    // 시크릿 모드 · 사이트 데이터 차단 환경에서는 읽기가 던질 수 있다
    return null;
  }
}

function write(list: Domain[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

/** _opts 는 Supabase 저장소와 같은 모양으로 부르기 위한 자리 */
export function useDomainStore(_opts?: StoreOptions): DomainStore {
  const [list, setList] = useState<Domain[]>(DEFAULT_DOMAINS);
  const [ready, setReady] = useState(false);
  const live = useRef(list);
  live.current = list;

  useEffect(() => {
    const saved = read();
    if (saved) setList(saved);
    setReady(true);
    // 같은 보드를 다른 탭에서 열어 두었을 때 고친 영역을 따라간다
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const next = parse(e.newValue);
        if (next) setList(next);
      } catch {
        /* 깨진 값은 무시 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = useCallback((fn: (cur: Domain[]) => Domain[]) => {
    setList((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const create = useCallback<DomainStore['create']>((input) => {
    const d: Domain = {
      id: crypto.randomUUID(), label: input.label, short: input.short ?? '', color: input.color, order: nextOrder(live.current),
    };
    commit((cur) => [...cur, d]);
    return d;
  }, [commit]);

  const update = useCallback<DomainStore['update']>((id, patch) => {
    commit((cur) => cur.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, [commit]);

  const remove = useCallback<DomainStore['remove']>(async (id, moveTo) => {
    if (id === moveTo || !live.current.some((d) => d.id === moveTo)) return false;
    commit((cur) => cur.filter((d) => d.id !== id));
    return true;
  }, [commit]);

  const domains = useMemo(() => list.slice().sort(byOrder), [list]);
  return { domains, ready, editable: true, create, update, remove };
}
