'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Domain, DomainKey } from './types';
import { DOMAIN_FILL, Modal, tmBtn, tmIconBtnSm } from './ui';

/*
 * 즐겨찾는 영역 - 왼쪽 메뉴에는 별표한 영역만 보인다(영역이 늘어도 메뉴가 길어지지 않게).
 * 사람마다 따로, 이 브라우저에 적는다. 아직 하나도 고르지 않은 사람(처음)은 모든 영역이 보인다.
 */

const FAV_KEY = 'mate.hub.favDomains.v1';

function readAll(): Record<string, string[]> {
  try {
    const v = JSON.parse(window.localStorage.getItem(FAV_KEY) ?? '{}') as unknown;
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

/** null = 아직 고르지 않음(모두 보임) */
export function useFavDomains(me: string): [string[] | null, (id: DomainKey) => void] {
  const [favs, setFavs] = useState<string[] | null>(null);
  useEffect(() => {
    const list = readAll()[me];
    setFavs(Array.isArray(list) ? list.filter((x) => typeof x === 'string') : null);
  }, [me]);
  const toggle = useCallback((id: DomainKey) => {
    setFavs((prev) => {
      const next = (prev ?? []).includes(id) ? (prev ?? []).filter((x) => x !== id) : [...(prev ?? []), id];
      try {
        const all = readAll();
        all[me] = next;
        window.localStorage.setItem(FAV_KEY, JSON.stringify(all));
      } catch { /* 저장이 막힌 환경 - 이번 화면에서만 */ }
      return next;
    });
  }, [me]);
  return [favs, toggle];
}

export function StarIcon({ on, size = 18 }: { on: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden fill={on ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={1.7} strokeLinejoin="round">
      <path d="M10 2.8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z" />
    </svg>
  );
}

/** 모든 영역 - 눌러 그 영역으로 가고, 별로 즐겨찾기를 고른다 */
export function AllDomainsDialog({ domains, favs, counts, active, onToggle, onGo, onManage, onClose }: {
  domains: Domain[];
  favs: string[] | null;
  /** 영역마다 남은 작업 수(왼쪽 메뉴와 같은 셈) */
  counts: ReadonlyMap<DomainKey, number>;
  active: DomainKey | null;
  onToggle(id: DomainKey): void;
  onGo(id: DomainKey): void;
  /** 영역 관리(이름 · 색 · 순서) - 고칠 수 있는 사람만 */
  onManage?(): void;
  onClose(): void;
}) {
  return (
    <Modal title="모든 영역" sub="별을 누르면 왼쪽 메뉴에 둡니다. 이름을 누르면 그 영역의 작업으로 갑니다." size="sm" onClose={onClose}
      foot={onManage ? (
        <>
          <span className="flex-1" />
          <button type="button" onClick={onManage} className={tmBtn}>영역 관리</button>
        </>
      ) : undefined}>
      {domains.length === 0 ? (
        <p className="py-6 text-center text-[14px] font-semibold text-tm-sub">영역이 없습니다</p>
      ) : (
        <ul className="-mx-1 flex flex-col gap-0.5">
          {domains.map((d) => {
            const on = !!favs?.includes(d.id);
            const n = counts.get(d.id) ?? 0;
            return (
              <li key={d.id} className={`flex items-center gap-1 rounded-tm-sm ${active === d.id ? 'bg-tm-tint' : ''}`}>
                <button type="button" onClick={() => onToggle(d.id)} aria-pressed={on}
                  aria-label={`${d.label} 즐겨찾기${on ? ' 빼기' : ''}`} title={on ? '즐겨찾기에서 빼기' : '즐겨찾기에 두기'}
                  className={`${tmIconBtnSm} flex-none ${on ? 'text-tm-warn' : 'text-tm-sub'}`}>
                  <StarIcon on={on} />
                </button>
                <button type="button" onClick={() => onGo(d.id)} aria-current={active === d.id ? 'page' : undefined}
                  className="flex min-h-[44px] min-w-0 flex-1 items-center gap-2.5 rounded-tm-sm px-2 text-left transition-colors duration-150 hover:bg-tm-tint">
                  <span className={`h-3 w-3 flex-none rounded-[4px] ${DOMAIN_FILL[d.color]}`} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-tm-ink">{d.label}</span>
                  {n > 0 && <span className="flex-none text-[13px] font-bold tabular-nums text-tm-sub">{n}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
