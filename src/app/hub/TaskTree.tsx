'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from './types';
import { useDomains } from './domainStore';
import { IconChevron, IconSearch, tmFieldBase, tmInput } from './ui';

/**
 * 작업 고르기(상위 업무 · 하위로 잇기) - 영역별로 맨 위 업무를 세우고, 하위 업무는 그 상위 업무를 펼치면 아래에 보인다.
 * 찾는 말을 치면 줄기와 상관없이 맞는 작업을 모두 보이고, 상위 업무를 함께 적는다.
 */
export function TaskTreeSelect({ id, tasks, value, onChange, placeholder, noneLabel }: {
  id: string;
  /** 고를 수 있는 작업 */
  tasks: Task[];
  /** 고른 작업 id - 없으면 null */
  value: string | null;
  onChange(id: string | null): void;
  /** 닫혀 있을 때 단추 글자(고른 것이 없을 때) */
  placeholder: string;
  /** '없음'으로 되돌리는 줄 - 주지 않으면 그 줄이 없다(하위로 잇기) */
  noneLabel?: string;
}) {
  const domains = useDomains();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const picked = value ? byId.get(value) ?? null : null;

  /* 줄기 - 고를 수 있는 작업 안에서만 잇는다. 상위가 목록에 없으면(자기 자신 · 지운 작업) 맨 위로 */
  const { roots, kids } = useMemo(() => {
    const k = new Map<string, Task[]>();
    const r: Task[] = [];
    tasks.forEach((t) => {
      const p = t.parentId && t.parentId !== t.id ? byId.get(t.parentId) : undefined;
      if (p) k.set(p.id, [...(k.get(p.id) ?? []), t]);
      else r.push(t);
    });
    // 끝나지 않은 것 먼저, 그 안에서는 최근에 만든 것부터
    const order = (a: Task, b: Task) => Number(a.status === 'done') - Number(b.status === 'done') || b.createdAt.localeCompare(a.createdAt);
    r.sort(order);
    k.forEach((list) => list.sort(order));
    return { roots: r, kids: k };
  }, [tasks, byId]);

  const groups = useMemo(() => {
    const known = new Set(domains.map((d) => d.id));
    return [...domains.map((d) => ({ id: d.id, label: d.label })), { id: '', label: '영역 없음' }]
      .map((g) => ({ ...g, items: roots.filter((t) => (g.id ? t.domain === g.id : !known.has(t.domain))) }))
      .filter((g) => g.items.length);
  }, [domains, roots]);

  /* 열 때 고른 작업이 보이게 그 위를 펼친다 */
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    if (!picked) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      const seen = new Set<string>();
      for (let cur = picked.parentId ? byId.get(picked.parentId) : undefined; cur && !seen.has(cur.id); cur = cur.parentId ? byId.get(cur.parentId) : undefined) {
        seen.add(cur.id);
        next.add(cur.id);
      }
      return next;
    });
  }, [open, picked, byId]);

  /* 바깥을 누르면 닫는다 */
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', off);
    return () => document.removeEventListener('pointerdown', off);
  }, [open]);

  const choose = (v: string | null) => {
    onChange(v);
    setOpen(false);
    setQ('');
  };
  const toggle = (tid: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(tid)) next.delete(tid); else next.add(tid);
    return next;
  });

  const label = (t: Task) => `${t.title || '제목 없음'}${t.status === 'done' ? ' (완료)' : ''}`;

  const row = (t: Task, depth: number, seen: Set<string>): React.ReactNode => {
    const children = kids.get(t.id) ?? [];
    const isOpen = expanded.has(t.id);
    const nextSeen = new Set(seen).add(t.id);
    return (
      <li key={t.id}>
        <div className="flex items-center" style={{ paddingLeft: depth * 18 }}>
          {children.length > 0 ? (
            <button type="button" onClick={() => toggle(t.id)} aria-expanded={isOpen}
              aria-label={`${t.key} 하위 업무 ${children.length}개 ${isOpen ? '접기' : '펼치기'}`}
              className="grid h-8 w-7 flex-none place-items-center rounded-md text-tm-sub transition-colors hover:bg-tm-card hover:text-tm-ink">
              <span className={`transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`}><IconChevron size={15} /></span>
            </button>
          ) : <span className="w-7 flex-none" aria-hidden />}
          <button type="button" onClick={() => choose(t.id)} aria-current={value === t.id || undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-150 ${
              value === t.id ? 'bg-tm-tint' : 'hover:bg-tm-card'}`}>
            <span className="flex-none text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>
            <span className={`min-w-0 truncate text-[14px] font-semibold ${t.status === 'done' ? 'text-tm-sub' : 'text-tm-ink'}`}>{label(t)}</span>
            {children.length > 0 && <span className="ml-auto flex-none text-[12px] font-bold tabular-nums text-tm-sub">하위 {children.length}</span>}
          </button>
        </div>
        {isOpen && children.length > 0 && (
          <ul>{children.filter((c) => !nextSeen.has(c.id)).map((c) => row(c, depth + 1, nextSeen))}</ul>
        )}
      </li>
    );
  };

  const s = q.trim().toLowerCase();
  const hits = s ? tasks.filter((t) => `${t.key} ${t.title}`.toLowerCase().includes(s)).slice(0, 40) : [];

  return (
    <div ref={boxRef}>
      <button type="button" id={id} aria-expanded={open} onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}
        className={`${tmFieldBase} flex h-12 w-full items-center gap-2 px-3.5 text-left text-[16px]`}>
        {picked ? (
          <>
            <span className="flex-none text-[14px] font-bold tabular-nums text-tm-sub">{picked.key}</span>
            <span className="min-w-0 flex-1 truncate">{label(picked)}</span>
          </>
        ) : <span className="min-w-0 flex-1 truncate text-tm-sub">{value ? noneLabel ?? placeholder : placeholder}</span>}
        <span className={`flex-none text-tm-sub transition-transform ${open ? 'rotate-180' : ''}`}><IconChevron /></span>
      </button>
      {open && (
        <div className="mt-1.5 rounded-tm-sm border border-tm-line bg-tm-bg p-2"
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); document.getElementById(id)?.focus(); } }}>
          <div className="relative mb-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={16} /></span>
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="번호 · 제목으로 찾기" aria-label="작업 찾기"
              className={`${tmInput} h-10 pl-9 text-[15px]`} />
          </div>
          <ul className="max-h-[300px] overflow-y-auto">
            {noneLabel && !s && (
              <li>
                <button type="button" onClick={() => choose(null)} aria-current={!value || undefined}
                  className={`ml-7 flex w-[calc(100%-28px)] rounded-md px-2 py-1.5 text-left text-[14px] font-semibold text-tm-sub transition-colors ${
                    !value ? 'bg-tm-tint' : 'hover:bg-tm-card'}`}>
                  {noneLabel}
                </button>
              </li>
            )}
            {s ? (
              hits.length === 0 ? <li className="px-2 py-3 text-center text-[13.5px] font-semibold text-tm-sub">맞는 작업이 없습니다</li>
                : hits.map((t) => {
                  const p = t.parentId ? byId.get(t.parentId) : undefined;
                  return (
                    <li key={t.id}>
                      <button type="button" onClick={() => choose(t.id)}
                        className="flex w-full flex-col rounded-md px-2 py-1.5 text-left transition-colors hover:bg-tm-card">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="flex-none text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                          <span className="min-w-0 truncate text-[14px] font-semibold text-tm-ink">{label(t)}</span>
                        </span>
                        {p && <span className="truncate text-[12.5px] text-tm-sub">상위 {p.key} {p.title}</span>}
                      </button>
                    </li>
                  );
                })
            ) : groups.map((g) => (
              <li key={g.id || '-'}>
                <p className="px-2 pb-0.5 pt-2 text-[12px] font-bold text-tm-sub">{g.label}</p>
                <ul>{g.items.map((t) => row(t, 0, new Set()))}</ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
