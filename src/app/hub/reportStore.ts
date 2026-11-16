'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_REPORT_PEOPLE, isProjectState, localISO,
  type DailyEntry, type DailyField, type Member, type ProjectState, type ReportPerson, type Task,
  type WeeklyItem, type WeeklyReport, type WeeklyStatus, type WeeklyText,
} from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 일간 · 주간보고 저장소.
 *
 * 브라우저 저장 모드는 이 브라우저(localStorage) 한 곳에 명단 · 일간 · 주간을 함께 두고,
 * Supabase 모드는 tm_report_people · tm_daily_reports · tm_weekly_reports · tm_weekly_items 표(remote.ts)를 쓴다.
 * 둘은 아래 ReportStore 모양을 함께 쓴다. 보고 화면(Reports.tsx)을 열 때만 붙는다 - 작업 화면은 이 표를 읽지 않는다.
 *
 * 누가 고치는가
 *   · 명단(이름 · 순서 · 계정 연결)은 관리자만. 화면은 관리자에게만 '명단 관리'를 보이고, 규칙은 DB(RLS)가 지킨다.
 *   · 일간 · 주간보고는 승인된 팀원 누구나 - 스크럼에서 한 사람이 모두의 칸을 적기도 한다. 마지막으로 고친 사람이 남는다.
 */

export type PersonPatch = Partial<Pick<ReportPerson, 'name' | 'member' | 'order'>>;
export type DailyPatch = Partial<Pick<DailyEntry, DailyField>>;
export type WeeklyPatch = Partial<Pick<WeeklyReport, WeeklyText | 'status'>>;
export type ItemPatch = Partial<Pick<WeeklyItem, 'name' | 'state' | 'done' | 'next' | 'issue' | 'order'>>;

export interface ReportStoreOptions extends StoreOptions {
  /** 지금 쓰는 사람(Member.id) - 마지막으로 고친 사람으로 화면에 바로 적는다(Supabase 모드는 DB 가 다시 적는다) */
  me: string;
}

export interface ReportStore {
  /** 명단 · 일간 · 주간을 다 읽었다(못 읽었으면 loadError) */
  ready: boolean;
  /** Supabase 모드 - 보고 표가 아직 DB 에 없다(SQL 을 다시 실행하기 전). 이때는 읽기 · 쓰기를 하지 않는다 */
  missing: boolean;
  /** 스크럼 순서대로 */
  people: ReportPerson[];
  daily: DailyEntry[];
  weekly: WeeklyReport[];
  items: WeeklyItem[];
  sync: SyncState;
  /** 처음 목록을 읽지 못했다 */
  loadError: string | null;
  addPerson(name: string): ReportPerson;
  updatePerson(id: string, patch: PersonPatch): void;
  removePerson(id: string): void;
  /** 그날 그 사람의 칸 - 줄이 없으면 만든다 */
  setDaily(day: string, person: ReportPerson, patch: DailyPatch): void;
  /** 그 주의 보고 - 없으면 만든다 */
  setWeekly(week: string, patch: WeeklyPatch): void;
  addItem(week: string, input?: Omit<ItemPatch, 'order'>): WeeklyItem;
  updateItem(id: string, patch: ItemPatch): void;
  removeItem(id: string): void;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
  /** Supabase 모드 - 서버 목록을 다시 읽는다 */
  reload?(): Promise<void>;
}

/* ── 공통 규칙 ─────────────────────────────────────────── */

export const dailyId = (day: string, person: string) => `${day}:${person}`;

/** 명단 순서 - 순서 값이 같으면 이름 순 */
export const byPersonOrder = (a: ReportPerson, b: ReportPerson) => a.order - b.order || a.name.localeCompare(b.name, 'ko');

/** 맨 아래 순서 값 */
export const nextPersonOrder = (list: { order: number }[]) => list.reduce((max, p) => Math.max(max, p.order), 0) + 1000;

/** id 를 한 칸 위(-1) · 아래(1)로 옮길 때 새 순서 값 - 바뀌는 사람만 돌려준다 */
export function reorderPeople(list: ReportPerson[], id: string, dir: -1 | 1): { id: string; order: number }[] {
  const cur = list.slice().sort(byPersonOrder);
  const i = cur.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= cur.length) return [];
  [cur[i], cur[j]] = [cur[j], cur[i]];
  return cur.flatMap((p, k) => (p.order === (k + 1) * 1000 ? [] : [{ id: p.id, order: (k + 1) * 1000 }]));
}

/** 명단의 사람과 이어진 팀원 계정 - 연결해 둔 계정, 없으면 이름이 같은(승인된) 계정 */
export function memberOfPerson(p: ReportPerson, members: Member[]): Member | null {
  if (p.member) return members.find((m) => m.id === p.member) ?? null;
  const name = p.name.trim();
  return name ? members.find((m) => m.active !== false && m.name.trim() === name) ?? null : null;
}

/** 칸에 글이 하나라도 있는가 */
export const isFilled = (e: Pick<DailyEntry, DailyField> | undefined) => !!e && !!(e.done.trim() || e.plan.trim() || e.blocker.trim());

/** 글을 줄로 - 앞의 '-' · '•' · '·' · 번호는 떼고 빈 줄은 뺀다 */
export function linesOf(text: string): string[] {
  return text.split('\n').map((l) => l.trim().replace(/^([-•·*]|\d+[.)])\s*/, '').trim()).filter(Boolean);
}

/* ── 날짜 ─────────────────────────────────────────────── */

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const WD = ['일', '월', '화', '수', '목', '금', '토'];

/** YYYY-MM-DD → 이 기기 시간대의 그날 0시 */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** 주소에서 받은 날짜가 실제로 있는 날인가(2026-02-30 같은 것은 거른다) */
export const isDay = (s: string | null | undefined): s is string => !!s && DAY_RE.test(s) && localISO(parseDay(s)) === s;

export function addDays(iso: string, n: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + n);
  return localISO(d);
}

export const isWeekend = (iso: string) => {
  const w = parseDay(iso).getDay();
  return w === 0 || w === 6;
};

/** 그 주 월요일 */
export function weekOf(iso: string): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localISO(d);
}

/** 앞(-1) · 뒤(1) 근무일 - 토 · 일은 건너뛴다(공휴일은 모른다) */
export function stepWorkday(iso: string, dir: -1 | 1): string {
  let x = addDays(iso, dir);
  while (isWeekend(x)) x = addDays(x, dir);
  return x;
}

/** 11월 16일 (월) - withYear 면 앞에 2026년 */
export function dayLabel(iso: string, withYear = false): string {
  const d = parseDay(iso);
  return `${withYear ? `${d.getFullYear()}년 ` : ''}${d.getMonth() + 1}월 ${d.getDate()}일 (${WD[d.getDay()]})`;
}

/** 11.16 */
export function dotDay(iso: string): string {
  const d = parseDay(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/** 요일 한 글자 */
export const weekdayOf = (iso: string) => WD[parseDay(iso).getDay()];

/** 그 주의 월 ~ 금 */
export const workdaysOf = (monday: string) => [0, 1, 2, 3, 4].map((i) => addDays(monday, i));

/**
 * 몇 월 몇 주차 - 그 주의 목요일이 든 달로 센다(달이 걸친 주는 목요일이 있는 달의 주).
 * 예: 2026-11-16 주 → 목요일 11-19 → 11월 3주차
 */
export function weekLabel(monday: string): { year: number; month: number; nth: number; text: string; range: string } {
  const th = parseDay(addDays(monday, 3));
  const nth = Math.ceil(th.getDate() / 7);
  const month = th.getMonth() + 1;
  return {
    year: th.getFullYear(), month, nth,
    text: `${month}월 ${nth}주차`,
    range: `${dotDay(monday)} ~ ${dotDay(addDays(monday, 4))}`,
  };
}

/** 고친 때 - 오늘이면 시각, 올해면 월 · 일, 아니면 날짜 */
export function whenOf(stamp: string, today: string): string {
  const d = new Date(stamp);
  if (Number.isNaN(d.getTime())) return stamp.slice(0, 10);
  if (localISO(d) === today) return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  return d.getFullYear() === parseDay(today).getFullYear() ? `${d.getMonth() + 1}월 ${d.getDate()}일` : localISO(d);
}

/** 그 사람이 그날 전에 마지막으로 적은 '예정' - 2주 안에서만 찾는다 */
export function lastPlan(daily: DailyEntry[], person: string, day: string): DailyEntry | null {
  const from = addDays(day, -14);
  let best: DailyEntry | null = null;
  for (const e of daily) {
    if (e.person !== person || e.day >= day || e.day < from || !e.plan.trim()) continue;
    if (!best || e.day > best.day) best = e;
  }
  return best;
}

/* ── 작업 보드에서 모으는 숫자(주간보고) ──────────────────── */

export interface WeekNumbers {
  /** 마감일이 그 주(월 ~ 일)인 작업 */
  dueThisWeek: number;
  /** 그 가운데 지금 완료인 것 */
  dueThisWeekDone: number;
  /** 그 주에 만든 작업 */
  created: number;
  /** 지금 진행 중 · 검토 */
  doing: number;
  /** 지금 마감이 지났는데 끝나지 않은 작업 */
  overdue: number;
  /** 다음 주(월 ~ 일) 마감인 끝나지 않은 작업 - 목록 */
  nextWeek: Task[];
}

export function weekNumbers(tasks: Task[], monday: string, today: string): WeekNumbers {
  const sunday = addDays(monday, 6);
  const nextMon = addDays(monday, 7);
  const nextSun = addDays(monday, 13);
  const inWeek = (d: string | null) => !!d && d >= monday && d <= sunday;
  const due = tasks.filter((t) => inWeek(t.due));
  const created = tasks.filter((t) => {
    const d = new Date(t.createdAt);
    return !Number.isNaN(d.getTime()) && inWeek(localISO(d));
  });
  return {
    dueThisWeek: due.length,
    dueThisWeekDone: due.filter((t) => t.status === 'done').length,
    created: created.length,
    doing: tasks.filter((t) => t.status === 'doing' || t.status === 'review').length,
    overdue: tasks.filter((t) => t.status !== 'done' && !!t.due && t.due < today).length,
    nextWeek: tasks
      .filter((t) => t.status !== 'done' && !!t.due && t.due >= nextMon && t.due <= nextSun)
      .sort((a, b) => (a.due ?? '').localeCompare(b.due ?? '') || a.key.localeCompare(b.key)),
  };
}

/* ── 글로 옮기기(메신저 · 메일에 붙여 넣기) ─────────────────── */

const bullet = (text: string, indent = '') => {
  const lines = linesOf(text);
  return lines.length ? lines.map((l) => `${indent}- ${l}`).join('\n') : `${indent}- 없음`;
};

export function dailyText(day: string, rows: { name: string; entry: DailyEntry | undefined }[]): string {
  const out = [`[MATE 일간보고] ${dayLabel(day, true)}`];
  const written = rows.filter((r) => isFilled(r.entry)).length;
  out.push(`작성 ${written}/${rows.length}명`);
  rows.forEach((r, i) => {
    out.push('', `${i + 1}. ${r.name}`);
    if (!isFilled(r.entry) || !r.entry) {
      out.push('  (아직 적지 않음)');
      return;
    }
    const e = r.entry;
    out.push('  완료', bullet(e.done, '  '), '  예정', bullet(e.plan, '  '));
    if (e.blocker.trim()) out.push('  블로커 & 공유사항', bullet(e.blocker, '  '));
  });
  return out.join('\n');
}

const STATE_TEXT: Record<ProjectState, string> = { good: '순조', watch: '주의', risk: '위험' };

export function weeklyText(input: {
  monday: string;
  report: WeeklyReport | undefined;
  items: WeeklyItem[];
  numbers: WeekNumbers;
  writtenDays: number;
  possibleDays: number;
}): string {
  const { monday, report, items, numbers: n } = input;
  const w = weekLabel(monday);
  const text = (s: string | undefined) => (s && s.trim() ? s.trim() : '(비어 있음)');
  const out = [
    `[MATE 주간보고] ${w.year}년 ${w.text} (${w.range})${report?.status === 'final' ? ' · 확정' : ''}`,
    '',
    '1. 한 주 요약',
    text(report?.summary),
    '',
    '2. 프로젝트별 현황',
  ];
  if (!items.length) out.push('(비어 있음)');
  items.forEach((it) => {
    out.push(`■ ${it.name.trim() || '이름 없는 프로젝트'} [${STATE_TEXT[it.state]}]`);
    out.push('  이번 주', bullet(it.done, '  '), '  다음 주', bullet(it.next, '  '));
    if (it.issue.trim()) out.push('  이슈', bullet(it.issue, '  '));
  });
  out.push(
    '',
    '3. 숫자로 본 한 주 (작업 보드 기준)',
    `- 이번 주 마감 작업 ${n.dueThisWeek}건 중 ${n.dueThisWeekDone}건 완료`,
    `- 새로 만든 작업 ${n.created}건`,
    `- 진행 중 · 검토 ${n.doing}건, 마감 지난 작업 ${n.overdue}건 (보고를 옮긴 때 기준)`,
    `- 다음 주 마감 ${n.nextWeek.length}건`,
    `- 일간보고 작성 ${input.writtenDays}/${input.possibleDays}`,
    '',
    '4. 이슈 · 리스크 · 결정이 필요한 것',
    text(report?.issues),
    '',
    '5. 다음 주 계획',
    text(report?.nextPlan),
  );
  if (report?.notes.trim()) out.push('', '6. 기타 공유', report.notes.trim());
  return out.join('\n');
}

/* ── 브라우저 저장 모드 ───────────────────────────────────── */

const KEY = 'mate.taskmanager.reports.v1';

type Saved = { people: ReportPerson[]; daily: DailyEntry[]; weekly: WeeklyReport[]; items: WeeklyItem[] };

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const has = (o: unknown): o is Record<string, unknown> => !!o && typeof o === 'object' && typeof (o as { id?: unknown }).id === 'string';

/** 마지막으로 고친 사람 · 시각 */
const stampOf = (me: string) => ({ updatedBy: me, updatedAt: new Date().toISOString() });

function defaultPeople(): ReportPerson[] {
  return DEFAULT_REPORT_PEOPLE.map((name, i) => ({ id: `rp-${i + 1}`, name, member: null, order: (i + 1) * 1000 }));
}

/** 저장본 - 모양이 어긋난 줄은 버린다. 명단을 한 번도 고치지 않았으면 처음 명단 */
function parse(raw: string | null): Saved {
  const v: unknown = raw ? JSON.parse(raw) : null;
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const arr = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).filter(has) : null);
  const people = arr('people');
  const now = new Date().toISOString();
  return {
    people: people
      ? people.flatMap((p) => (str(p.name).trim()
        ? [{ id: p.id as string, name: str(p.name), member: typeof p.member === 'string' ? p.member : null, order: num(p.order, 0) }]
        : []))
      : defaultPeople(),
    daily: (arr('daily') ?? []).flatMap((e) => (isDay(str(e.day)) && str(e.person)
      ? [{
        id: e.id as string, day: str(e.day), person: str(e.person), name: str(e.name),
        done: str(e.done), plan: str(e.plan), blocker: str(e.blocker),
        updatedBy: typeof e.updatedBy === 'string' ? e.updatedBy : null, updatedAt: str(e.updatedAt) || now,
      }]
      : [])),
    weekly: (arr('weekly') ?? []).map((w) => ({
      id: w.id as string, summary: str(w.summary), issues: str(w.issues), nextPlan: str(w.nextPlan), notes: str(w.notes),
      status: (w.status === 'final' ? 'final' : 'draft') as WeeklyStatus,
      updatedBy: typeof w.updatedBy === 'string' ? w.updatedBy : null, updatedAt: str(w.updatedAt) || now,
    })),
    items: (arr('items') ?? []).flatMap((it) => (isDay(str(it.week))
      ? [{
        id: it.id as string, week: str(it.week), name: str(it.name), state: isProjectState(it.state) ? it.state : 'good',
        done: str(it.done), next: str(it.next), issue: str(it.issue), order: num(it.order, 0),
        updatedBy: typeof it.updatedBy === 'string' ? it.updatedBy : null, updatedAt: str(it.updatedAt) || now,
      }]
      : [])),
  };
}

function read(): Saved {
  try {
    return parse(window.localStorage.getItem(KEY));
  } catch {
    // 시크릿 모드 · 사이트 데이터 차단 환경에서는 읽기가 던질 수 있다. 깨진 값도 처음부터
    return parse(null);
  }
}

function write(data: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

/** 브라우저 저장 모드 - 계정이 없어 누구나 명단을 고친다 */
export function useReportStore(opts: ReportStoreOptions): ReportStore {
  const [data, setData] = useState<Saved>(() => ({ people: defaultPeople(), daily: [], weekly: [], items: [] }));
  const [ready, setReady] = useState(false);
  const live = useRef(data);
  live.current = data;
  const me = useRef(opts.me);
  me.current = opts.me;

  useEffect(() => {
    setData(read());
    setReady(true);
    // 같은 보고를 다른 탭에서 열어 두었을 때 고친 것을 따라간다
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        setData(parse(e.newValue));
      } catch {
        /* 깨진 값은 무시 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = useCallback((fn: (cur: Saved) => Saved) => {
    setData((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const addPerson = useCallback<ReportStore['addPerson']>((name) => {
    const p: ReportPerson = { id: crypto.randomUUID(), name, member: null, order: nextPersonOrder(live.current.people) };
    commit((cur) => ({ ...cur, people: [...cur.people, p] }));
    return p;
  }, [commit]);

  const updatePerson = useCallback<ReportStore['updatePerson']>((id, patch) => {
    commit((cur) => ({ ...cur, people: cur.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, [commit]);

  const removePerson = useCallback<ReportStore['removePerson']>((id) => {
    commit((cur) => ({ ...cur, people: cur.people.filter((p) => p.id !== id) }));
  }, [commit]);

  const setDaily = useCallback<ReportStore['setDaily']>((day, person, patch) => {
    const id = dailyId(day, person.id);
    commit((cur) => {
      const was = cur.daily.find((e) => e.id === id);
      const next: DailyEntry = was
        ? { ...was, ...patch, ...stampOf(me.current) }
        : { id, day, person: person.id, name: person.name, done: '', plan: '', blocker: '', ...patch, ...stampOf(me.current) };
      return { ...cur, daily: was ? cur.daily.map((e) => (e.id === id ? next : e)) : [...cur.daily, next] };
    });
  }, [commit]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, patch) => {
    commit((cur) => {
      const was = cur.weekly.find((w) => w.id === week);
      const next: WeeklyReport = was
        ? { ...was, ...patch, ...stampOf(me.current) }
        : { id: week, summary: '', issues: '', nextPlan: '', notes: '', status: 'draft', ...patch, ...stampOf(me.current) };
      return { ...cur, weekly: was ? cur.weekly.map((w) => (w.id === week ? next : w)) : [...cur.weekly, next] };
    });
  }, [commit]);

  const addItem = useCallback<ReportStore['addItem']>((week, input = {}) => {
    const it: WeeklyItem = {
      id: crypto.randomUUID(), week, name: '', state: 'good', done: '', next: '', issue: '', ...input,
      order: nextPersonOrder(live.current.items.filter((x) => x.week === week)), ...stampOf(me.current),
    };
    commit((cur) => ({ ...cur, items: [...cur.items, it] }));
    return it;
  }, [commit]);

  const updateItem = useCallback<ReportStore['updateItem']>((id, patch) => {
    commit((cur) => ({ ...cur, items: cur.items.map((x) => (x.id === id ? { ...x, ...patch, ...stampOf(me.current) } : x)) }));
  }, [commit]);

  const removeItem = useCallback<ReportStore['removeItem']>((id) => {
    commit((cur) => ({ ...cur, items: cur.items.filter((x) => x.id !== id) }));
  }, [commit]);

  const people = useMemo(() => data.people.slice().sort(byPersonOrder), [data.people]);

  return {
    ready, missing: false, people, daily: data.daily, weekly: data.weekly, items: data.items, sync: 'idle', loadError: null,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, addItem, updateItem, removeItem,
  };
}
