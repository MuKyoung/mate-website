'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTaskStore } from './store';
import {
  DOMAINS, MEMBERS, PRIORITIES, STATUSES,
  domainLabel, priorityLabel,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import { Avatar, Chip, DOMAIN_STYLE, DueBadge, PRIORITY_STYLE, PriorityDot, TaskCard } from './ui';
import { NewTaskDialog, TaskPanel, type Draft } from './TaskPanel';
import Timeline from './Timeline';
import Calendar from './Calendar';
import Docs from './Docs';
import { useDocStore } from './docStore';

type View = 'board' | 'list' | 'timeline' | 'calendar';
type Section = 'tasks' | 'docs';

const VIEWS: { id: View; label: string; key: string }[] = [
  { id: 'board', label: '보드', key: 'b' },
  { id: 'list', label: '목록', key: 'l' },
  { id: 'timeline', label: '타임라인', key: 't' },
  { id: 'calendar', label: '캘린더', key: 'c' },
];
type Scope = { kind: 'all' } | { kind: 'mine' } | { kind: 'domain'; id: DomainKey };

const ME_KEY = 'mate.taskmanager.me';
const PREF_KEY = 'mate.taskmanager.prefs.v1';

type Prefs = { section: Section; view: View; scope: Scope; priority: Priority | 'all'; hideDone: boolean };

function readPrefs(): Partial<Prefs> | null {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function TaskManagerClient() {
  const store = useTaskStore();
  const docStore = useDocStore();

  const [section, setSection] = useState<Section>('tasks');
  const [view, setView] = useState<View>('board');
  const [scope, setScope] = useState<Scope>({ kind: 'all' });
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [hideDone, setHideDone] = useState(false);
  const [me, setMe] = useState<string>('m7');

  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState<Status | null>(null);
  const [creatingDue, setCreatingDue] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ by: 'title' | 'status' | 'priority' | 'domain' | 'due' | 'assignee'; dir: 1 | -1 } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dropAt, setDropAt] = useState<{ status: Status; beforeId: string | null } | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ME_KEY);
      if (saved && MEMBERS.some((m) => m.id === saved)) setMe(saved);
    } catch { /* 저장이 막힌 환경 */ }

    // 마지막으로 보던 화면으로 돌아온다
    const p = readPrefs();
    if (p) {
      if (p.section) setSection(p.section);
      if (p.view) setView(p.view);
      if (p.scope) setScope(p.scope);
      if (p.priority) setPriorityFilter(p.priority);
      if (typeof p.hideDone === 'boolean') setHideDone(p.hideDone);
    }
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(
        { section, view, scope, priority: priorityFilter, hideDone } satisfies Prefs));
    } catch { /* noop */ }
  }, [prefsLoaded, section, view, scope, priorityFilter, hideDone]);

  const pickMe = (id: string) => {
    setMe(id);
    try { window.localStorage.setItem(ME_KEY, id); } catch { /* noop */ }
  };

  /* 되돌릴 수 있는 동작이 생기면 알리고, 잠시 뒤 거둔다 */
  useEffect(() => {
    if (!store.undoLabel) return;
    setToast(store.undoLabel);
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [store.undoLabel]);

  /* ── 단축키 — 입력 중에는 가로채지 않는다 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n') { e.preventDefault(); setCreatingDue(null); setCreating('todo'); }
      if (e.key === '/') { e.preventDefault(); setSection('tasks'); searchRef.current?.focus(); }
      const v = VIEWS.find((x) => x.key === e.key);
      if (v) { setSection('tasks'); setView(v.id); }
      if (e.key === 'd') setSection('docs');
      // Ctrl/Cmd 조합은 위에서 걸러지므로 되돌리기는 여기서 따로 받는다
      if (e.key === 'z' && storeRef.current.undoLabel) {
        e.preventDefault();
        storeRef.current.undo();
        setToast(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── 필터 ── */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.tasks
      .filter((t) => {
        if (scope.kind === 'mine' && t.assignee !== me) return false;
        if (scope.kind === 'domain' && t.domain !== scope.id) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (hideDone && t.status === 'done') return false;
        if (q) {
          const hay = `${t.key} ${t.title} ${t.description} ${t.labels.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [store.tasks, scope, me, priorityFilter, hideDone, query]);

  /** 목록 뷰 정렬 — 머리글을 누르면 그 열 기준으로 선다 */
  const sorted = useMemo(() => {
    if (!sort) return visible;
    const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as Record<Priority, number>;
    const statusRank = Object.fromEntries(STATUSES.map((s2, i) => [s2.id, i])) as Record<Status, number>;
    const key = (t: Task) => {
      switch (sort.by) {
        case 'title': return t.title;
        case 'status': return statusRank[t.status];
        case 'priority': return rank[t.priority];
        case 'domain': return t.domain;
        // 마감일 없는 것은 항상 뒤로
        case 'due': return t.due ?? '9999-12-31';
        case 'assignee': return t.assignee ?? 'zzz';
      }
    };
    return [...visible].sort((a, b) => {
      const x = key(a), y = key(b);
      if (x === y) return 0;
      return (x < y ? -1 : 1) * sort.dir;
    });
  }, [visible, sort]);

  const toggleSort = (by: NonNullable<typeof sort>['by']) =>
    setSort((prev) => (prev?.by === by ? (prev.dir === 1 ? { by, dir: -1 } : null) : { by, dir: 1 }));

  const byStatus = useMemo(() => {
    const map = {} as Record<Status, Task[]>;
    STATUSES.forEach((s) => { map[s.id] = []; });
    visible.forEach((t) => map[t.status].push(t));
    return map;
  }, [visible]);

  const counts = useMemo(() => {
    const mine = store.tasks.filter((t) => t.assignee === me && t.status !== 'done').length;
    const perDomain = Object.fromEntries(
      DOMAINS.map((d) => [d.id, store.tasks.filter((t) => t.domain === d.id && t.status !== 'done').length]),
    ) as Record<DomainKey, number>;
    const open = store.tasks.filter((t) => t.status !== 'done').length;
    return { mine, perDomain, open, total: store.tasks.length };
  }, [store.tasks, me]);

  const open = openId ? store.tasks.find((t) => t.id === openId) ?? null : null;

  const handleCreate = useCallback((d: Draft) => {
    const t = store.create(d);
    setCreating(null);
    setCreatingDue(null);
    setOpenId(t.id);
  }, [store]);

  /** 캘린더에서 날짜를 눌러 만들 때 — 그 날을 마감일로 미리 채운다 */
  const createAt = useCallback((dueISO: string) => {
    setCreatingDue(dueISO);
    setCreating('todo');
  }, []);

  const filtersOn = query.trim() !== '' || priorityFilter !== 'all' || hideDone || scope.kind !== 'all';
  const clearFilters = () => {
    setQuery(''); setPriorityFilter('all'); setHideDone(false); setScope({ kind: 'all' });
  };

  /* ── 드래그 ── */
  const onColumnDragOver = (e: React.DragEvent, status: Status, beforeId: string | null) => {
    // 드롭을 허용하려면 dragover 마다 preventDefault 가 필요하다.
    // 상태(dragId)를 조건으로 걸면 첫 프레임에 드롭이 거부된다.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropAt((prev) =>
      prev?.status === status && prev?.beforeId === beforeId ? prev : { status, beforeId });
  };

  const onDrop = (e: React.DragEvent, status: Status, beforeId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    // dataTransfer 를 1순위로 읽는다 — 리렌더 타이밍과 무관하게 집은 카드를 알 수 있다
    const id = e.dataTransfer.getData('text/plain') || dragId;
    if (id) store.move(id, status, beforeId);
    setDragId(null);
    setDropAt(null);
  };

  const scopeTitle =
    scope.kind === 'all' ? '모든 작업'
      : scope.kind === 'mine' ? '내 작업'
        : domainLabel(scope.id);

  const navItem = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-[13px] transition ${
      active ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  if (!store.ready) {
    return (
      <div className="flex h-screen items-center justify-center text-[13px] text-slate-400">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f9] text-slate-800">

      {/* ── 사이드바 ── */}
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-bold text-white">M</span>
          <span className="text-[13.5px] font-semibold tracking-tight text-slate-900">MATE Tasks</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <button className={navItem(section === 'tasks' && scope.kind === 'all')}
            onClick={() => { setSection('tasks'); setScope({ kind: 'all' }); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="2.5" width="5" height="11" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
              <rect x="9" y="2.5" width="5" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            모든 작업
            <span className="ml-auto text-[11px] tabular-nums text-slate-400">{counts.open}</span>
          </button>
          <button className={navItem(section === 'tasks' && scope.kind === 'mine')}
            onClick={() => { setSection('tasks'); setScope({ kind: 'mine' }); }}>
            <Avatar id={me} size={14} />
            내 작업
            <span className="ml-auto text-[11px] tabular-nums text-slate-400">{counts.mine}</span>
          </button>

          <p className="mb-1.5 mt-5 px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">영역</p>
          {DOMAINS.map((d) => (
            <button key={d.id} className={navItem(section === 'tasks' && scope.kind === 'domain' && scope.id === d.id)}
              onClick={() => { setSection('tasks'); setScope({ kind: 'domain', id: d.id }); }}>
              <span className={`h-2 w-2 shrink-0 rounded-sm ${
                d.id === 'web' ? 'bg-blue-500' : d.id === 'game' ? 'bg-violet-500'
                  : d.id === 'edu' ? 'bg-amber-500' : 'bg-slate-400'}`} />
              {d.label}
              <span className="ml-auto text-[11px] tabular-nums text-slate-400">{counts.perDomain[d.id]}</span>
            </button>
          ))}

          <p className="mb-1.5 mt-5 px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">문서</p>
          <button className={navItem(section === 'docs')} onClick={() => setSection('docs')}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            팀 위키
            <span className="ml-auto text-[11px] tabular-nums text-slate-400">{docStore.docs.length}</span>
          </button>

          <p className="mb-1.5 mt-5 px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">나</p>
          <div className="px-1">
            <label className="sr-only" htmlFor="tm-me">현재 사용자</label>
            <select id="tm-me" value={me} onChange={(e) => pickMe(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12.5px] text-slate-700 outline-none transition focus:border-blue-500">
              {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
            </select>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-slate-400 transition hover:text-slate-700">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            홈페이지로
          </Link>
        </div>
      </aside>

      {/* ── 본문 ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* 상단 바 */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <div className={`relative min-w-0 flex-1 max-w-md ${section === 'docs' ? 'hidden' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); }
              }}
              placeholder="작업 검색"
              aria-label="작업 검색"
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-[7px] pl-8 pr-14 text-[13px] text-slate-800
                         placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15" />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:block">
              /
            </kbd>
          </div>

          {section === 'docs' && (
            <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-900">팀 위키</p>
          )}

          <div className="ml-auto flex items-center gap-2">
            {section === 'tasks' && (
              <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
                {VIEWS.map((v) => (
                  <button key={v.id} onClick={() => setView(v.id)}
                    aria-pressed={view === v.id}
                    title={`${v.label} (${v.key})`}
                    className={`rounded px-2.5 py-1 text-[12.5px] font-medium transition ${
                      view === v.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
            {section === 'tasks' && (
              <button onClick={() => { setCreatingDue(null); setCreating('todo'); }}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-[7px] text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                새 작업
              </button>
            )}
          </div>
        </header>

        {/* 제목 + 필터 — 작업 섹션에서만 */}
        {section === 'tasks' && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
          <h1 className="mr-1 text-[14px] font-semibold text-slate-900">{scopeTitle}</h1>
          <span className="text-[12px] tabular-nums text-slate-400">{visible.length}건 표시</span>

          <div className="ml-2 flex flex-wrap items-center gap-1.5">
            {/* 사이드바가 숨는 구간에서도 범위를 바꿀 수 있어야 한다 */}
            <label className="sr-only" htmlFor="tm-scope">범위</label>
            <select id="tm-scope" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12.5px] text-slate-600 outline-none transition focus:border-blue-500 lg:hidden"
              value={scope.kind === 'domain' ? scope.id : scope.kind}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'all' || v === 'mine') setScope({ kind: v });
                else setScope({ kind: 'domain', id: v as DomainKey });
              }}>
              <option value="all">모든 작업</option>
              <option value="mine">내 작업</option>
              {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>

            <label className="sr-only" htmlFor="tm-filter-priority">우선순위 필터</label>
            <select id="tm-filter-priority" value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12.5px] text-slate-600 outline-none transition focus:border-blue-500">
              <option value="all">우선순위 전체</option>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>

            <button onClick={() => setHideDone(!hideDone)}
              aria-pressed={hideDone}
              className={`rounded-md border px-2.5 py-1 text-[12.5px] font-medium transition ${
                hideDone ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              완료 숨기기
            </button>

            {filtersOn && (
              <button onClick={clearFilters}
                className="rounded-md px-2 py-1 text-[12.5px] text-slate-400 transition hover:text-slate-700">
                초기화
              </button>
            )}
          </div>

          {!store.persistent && (
            <span className="ml-auto rounded bg-amber-50 px-2 py-1 text-[11.5px] text-amber-700 ring-1 ring-inset ring-amber-200">
              브라우저 저장이 막혀 있어 새로고침하면 사라집니다
            </span>
          )}
        </div>
        )}

        {/* ── 문서 ── */}
        {section === 'docs' && (
          <Docs store={docStore} me={me}
            onTaskClick={(key) => {
              const hit = store.tasks.find((t) => t.key === key);
              if (hit) { setSection('tasks'); setOpenId(hit.id); }
              else setToast(`${key} 작업을 찾을 수 없습니다`);
            }} />
        )}

        {/* ── 타임라인 ── */}
        {section === 'tasks' && view === 'timeline' && (
          <Timeline tasks={visible} onOpen={setOpenId} />
        )}

        {/* ── 캘린더 ── */}
        {section === 'tasks' && view === 'calendar' && (
          <Calendar tasks={visible} onOpen={setOpenId} onCreateAt={createAt}
            onReschedule={(id, due) => store.update(id, { due })} />
        )}

        {/* ── 보드 ── */}
        {section === 'tasks' && view === 'board' ? (
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full min-w-max items-stretch gap-3 p-4">
              {STATUSES.map((s) => {
                const items = byStatus[s.id];
                const active = dropAt?.status === s.id;
                return (
                  <section key={s.id}
                    onDragOver={(e) => onColumnDragOver(e, s.id, null)}
                    onDrop={(e) => onDrop(e, s.id, null)}
                    className={`flex h-full min-h-0 w-[244px] shrink-0 flex-col rounded-lg border bg-slate-50/70 transition sm:w-[278px] ${
                      active ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'
                    }`}>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <h2 className="text-[12.5px] font-semibold text-slate-700">{s.label}</h2>
                      <span className="rounded bg-slate-200/70 px-1.5 text-[11px] font-medium tabular-nums text-slate-500">
                        {items.length}
                      </span>
                      <button onClick={() => setCreating(s.id)}
                        aria-label={`${s.label}에 작업 추가`}
                        className="ml-auto rounded p-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-3">
                      {items.map((t) => (
                        /* 삽입 표시선은 absolute 로 띄운다 — 레이아웃을 밀면 드롭 직전에
                           커서 아래 요소가 바뀌어 drop 이 취소된다 */
                        <div key={t.id} className="relative"
                          onDragOver={(e) => { e.stopPropagation(); onColumnDragOver(e, s.id, t.id); }}
                          onDrop={(e) => onDrop(e, s.id, t.id)}>
                          {active && dropAt?.beforeId === t.id && (
                            <span className="pointer-events-none absolute -top-[5px] left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                          )}
                          <TaskCard task={t} dragging={dragId === t.id}
                            mine={t.assignee === me}
                            onMove={(st) => store.move(t.id, st, null)}
                            onOpen={() => setOpenId(t.id)}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', t.id);
                              setDragId(t.id);
                            }}
                            onDragEnd={() => { setDragId(null); setDropAt(null); }} />
                        </div>
                      ))}

                      {/* 칼럼 끝에 놓을 자리 — 항상 자리를 차지해 레이아웃이 흔들리지 않는다 */}
                      <div className="relative h-6"
                        onDragOver={(e) => { e.stopPropagation(); onColumnDragOver(e, s.id, null); }}
                        onDrop={(e) => onDrop(e, s.id, null)}>
                        {active && dropAt?.beforeId === null && (
                          <span className="pointer-events-none absolute left-0 right-0 top-1 h-0.5 rounded-full bg-blue-500" />
                        )}
                      </div>

                      {items.length === 0 && !active && (
                        <button onClick={() => setCreating(s.id)}
                          className="w-full rounded-md border border-dashed border-slate-300 px-1 py-5 text-center text-[12px] leading-relaxed text-slate-400 transition hover:border-slate-400 hover:bg-white hover:text-slate-600">
                          {s.hint}
                        </button>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : section === 'tasks' && view === 'list' ? (
          /* ── 목록 ── */
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400">
                    {([
                      ['title', '작업', ''],
                      ['status', '상태', 'w-[92px]'],
                      ['priority', '우선순위', 'w-[84px]'],
                      ['domain', '영역', 'w-[96px]'],
                      ['due', '마감', 'w-[96px]'],
                      ['assignee', '담당', 'w-[56px] text-center'],
                    ] as const).map(([by, label, cls]) => (
                      <th key={by} className={`px-3 py-2.5 font-semibold ${cls}`}
                        aria-sort={sort?.by === by ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                        <button onClick={() => toggleSort(by)}
                          className="inline-flex items-center gap-1 transition hover:text-slate-700">
                          {label}
                          <span className={`text-[9px] leading-none transition ${
                            sort?.by === by ? 'text-blue-600' : 'text-slate-300'}`}>
                            {sort?.by === by && sort.dir === -1 ? '▼' : '▲'}
                          </span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => (
                    <tr key={t.id} onClick={() => setOpenId(t.id)} tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(t.id); }}
                      className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50
                                 focus:outline-none focus-visible:bg-blue-50">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] tabular-nums text-slate-400">{t.key}</span>
                          <span className={t.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}>
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-slate-600">
                        {STATUSES.find((s) => s.id === t.status)?.label}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-[12px] ${PRIORITY_STYLE[t.priority].text}`}>
                          <PriorityDot p={t.priority} />
                          {priorityLabel(t.priority)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Chip className={DOMAIN_STYLE[t.domain]}>{domainLabel(t.domain)}</Chip>
                      </td>
                      <td className="px-3 py-2.5">
                        <DueBadge due={t.due} done={t.status === 'done'} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Avatar id={t.assignee} size={22} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {visible.length === 0 && (
                <div className="px-4 py-14 text-center">
                  <p className="text-[13px] text-slate-500">
                    {filtersOn ? '조건에 맞는 작업이 없습니다.' : '아직 작업이 없습니다.'}
                  </p>
                  <button onClick={() => (filtersOn ? clearFilters() : setCreating('todo'))}
                    className="mt-3 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-medium text-slate-700 transition hover:bg-slate-50">
                    {filtersOn ? '필터 초기화' : '첫 작업 만들기'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {open && (
        <TaskPanel task={open}
          onUpdate={(patch) => store.update(open.id, patch)}
          onRemove={() => { store.remove(open.id); setOpenId(null); }}
          onClose={() => setOpenId(null)} />
      )}

      {toast && (
        <div role="status" aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-[13px] text-white shadow-xl">
          <span className="max-w-[320px] truncate">{toast}</span>
          <button onClick={() => { store.undo(); setToast(null); }}
            className="shrink-0 rounded px-2 py-1 text-[12.5px] font-semibold text-blue-300 transition hover:bg-white/10 hover:text-blue-200">
            실행 취소
            <kbd className="ml-1.5 rounded border border-white/20 px-1 text-[10px] font-medium text-white/50">Z</kbd>
          </button>
          <button onClick={() => setToast(null)} aria-label="알림 닫기"
            className="shrink-0 rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {creating && (
        <NewTaskDialog defaultStatus={creating} defaultDue={creatingDue}
          onCreate={handleCreate}
          onClose={() => { setCreating(null); setCreatingDue(null); }} />
      )}
    </div>
  );
}
