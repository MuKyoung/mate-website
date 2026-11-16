'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_REPORT_PEOPLE, isProjectState, localISO,
  type DailyEntry, type DailyField, type Member, type ProjectState, type ReportPerson, type Task,
  type WeeklyItem, type WeeklyReport, type WeeklySnapshot, type WeeklyStatus, type WeeklyText,
} from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 일간 · 주간보고 저장소.
 *
 * 브라우저 저장 모드는 이 브라우저(localStorage) 한 곳에 명단 · 일간 · 주간을 함께 두고,
 * Supabase 모드는 tm_report_people · tm_daily_reports · tm_weekly_reports · tm_weekly_items 표(reportRemote.ts)를 쓴다.
 * 둘은 아래 ReportStore 모양을 함께 쓴다. 보고 화면(Reports.tsx)을 열 때만 붙는다 - 작업 화면은 이 표를 읽지 않는다.
 *
 * 누가 고치는가
 *   · 명단(이름 · 순서 · 계정 연결)은 관리자만. 화면은 관리자에게만 '명단 관리'를 보이고, 규칙은 DB(RLS)가 지킨다.
 *   · 일간 · 주간보고는 승인된 팀원 누구나 - 스크럼에서 한 사람이 모두의 칸을 적기도 한다. 마지막으로 고친 사람이 남는다.
 *   · 확정 · 다시 열기도 팀원 누구나. Supabase 모드는 서버가 확정자 · 시각 · 저장본을 남기고 확정 중의 고침을 막는다.
 */

export type PersonPatch = Partial<Pick<ReportPerson, 'name' | 'member' | 'order'>>;
export type DailyPatch = Partial<Pick<DailyEntry, DailyField>>;
/** 주간 본문 칸 - 확정 · 다시 열기는 finalize · reopen 으로만 */
export type WeeklyPatch = Partial<Pick<WeeklyReport, WeeklyText>>;
export type ItemPatch = Partial<Pick<WeeklyItem, 'name' | 'state' | 'done' | 'next' | 'issue' | 'order'>>;
/** 확정 · 다시 열기의 결과 - 서버가 받아 준 뒤에만 ok */
export type SaveOutcome = { ok: true } | { ok: false; error: string };

export interface ReportStoreOptions extends StoreOptions {
  /** 지금 쓰는 사람(Member.id) - 마지막으로 고친 사람으로 화면에 바로 적는다(Supabase 모드는 DB 가 다시 적는다) */
  me: string;
}

export interface ReportStore {
  /** 읽기를 마쳤다 - 실패했어도 참(그때는 loadError · missing) */
  ready: boolean;
  /** Supabase 모드 - 보고 표가 DB 에 없다(SQL 실행 전). 연결 실패와는 다르다 */
  missing: boolean;
  /** 스크럼 순서대로 */
  people: ReportPerson[];
  daily: DailyEntry[];
  weekly: WeeklyReport[];
  items: WeeklyItem[];
  sync: SyncState;
  /** 처음 읽기 · 표 확인이 실패했다(연결). 이때 화면은 쓰기 · 복사 · 확정을 막는다 */
  loadError: string | null;
  /** 브라우저 저장 모드 - 이 브라우저에 쓰지 못했다(저장 차단 · 공간 부족). 화면의 글은 그대로다 */
  saveError: boolean;
  addPerson(name: string): ReportPerson;
  updatePerson(id: string, patch: PersonPatch): void;
  removePerson(id: string): void;
  /** 그날 그 사람의 칸 - 줄이 없으면 만든다. 글자 수를 넘으면 저장하지 않고 거짓 */
  setDaily(day: string, person: ReportPerson, patch: DailyPatch): boolean;
  /** 그 주의 본문 - 없으면 만든다. 글자 수를 넘거나 확정된 주면 거짓 */
  setWeekly(week: string, patch: WeeklyPatch): boolean;
  /** 확정된 주면 null */
  addItem(week: string, input?: Omit<ItemPatch, 'order'>): WeeklyItem | null;
  updateItem(id: string, patch: ItemPatch): boolean;
  removeItem(id: string): void;
  /** 확정 - local 은 브라우저 저장 모드에서 쓸 저장본(Supabase 모드는 서버가 만들고 이 값은 쓰지 않는다) */
  finalize(week: string, local: WeeklySnapshot): Promise<SaveOutcome>;
  reopen(week: string): Promise<SaveOutcome>;
  /** 기다리는 저장을 보내고, 저장되지 않은 것이 남았으면 거짓 - 보고를 떠나기 전에 부른다 */
  settle(): Promise<boolean>;
  /** 기다리는 저장을 보낸다(로그아웃 전에) */
  flush(): Promise<void>;
  /** 표 확인부터 다시 읽는다 */
  retry(): Promise<void>;
}

/* ── 글자 수 - SQL 의 check 와 같은 값 ─────────────────────── */

export const DAILY_MAX = 4000;
export const ITEM_MAX = 4000;
export const WEEKLY_MAX = 8000;
export const ITEM_NAME_MAX = 60;

export const limitText = (len: number, max: number) => `${max}자까지 입력할 수 있습니다. 현재 ${len}자입니다.`;

/** 넘는 칸이 있으면 그 길이 - 칸은 모두 같은 한도 */
export function overLimit(patch: Record<string, unknown>, keys: readonly string[], max: number): number | null {
  for (const k of keys) {
    const v = patch[k];
    if (typeof v === 'string' && v.length > max) return v.length;
  }
  return null;
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

/** 머리표(-, •, ·, *, 1.) */
const BULLET = /^([-•·*]|\d+[.)])\s*/;

/** 글을 줄로 - 앞의 머리표는 떼고 빈 줄은 뺀다 */
export function linesOf(text: string): string[] {
  return text.split('\n').map((l) => l.trim().replace(BULLET, '').trim()).filter(Boolean);
}

/** 글에 작업 번호가 온전히 들어 있는가 - MATE-100 이 있어도 MATE-10 은 없는 것으로 본다 */
export function hasTaskKey(text: string, key: string): boolean {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9-])${k}(?![0-9])`).test(text);
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

/** 앞(-1) · 뒤(1) 평일 - 토 · 일만 건너뛴다(공휴일 · 휴가는 모른다) */
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

/** 2026.11.16 오후 4:59 - 확정 시각처럼 기록으로 남기는 때 */
export function stampLabel(stamp: string): string {
  const d = new Date(stamp);
  if (Number.isNaN(d.getTime())) return stamp;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}`;
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

/**
 * 한 주의 근거를 저장본 모양으로 모은다 - 브라우저 저장 모드의 확정 저장본이자, 확정 전 · '현재 참고' 화면의 자료.
 * Supabase 모드의 확정 저장본은 서버가 같은 모양으로 만든다(supabase/taskmanager.sql 의 tm_weekly_finalize)
 */
export function makeSnapshot(input: {
  week: string; today: string; at: string; tasks: Task[]; people: ReportPerson[]; daily: DailyEntry[];
}): WeeklySnapshot {
  const { week, today, at, tasks, people, daily } = input;
  const n = weekNumbers(tasks, week, today);
  const end = addDays(week, 6);
  const ofWeek = daily.filter((e) => e.day >= week && e.day <= end);
  const order = new Map(people.map((p, i) => [p.id, i]));
  const names = new Map(people.map((p) => [p.id, p.name]));
  const nameOf = (e: DailyEntry) => names.get(e.person) ?? (e.name || '이름 없음');
  const sort = (a: DailyEntry, b: DailyEntry) =>
    a.day.localeCompare(b.day) || (order.get(a.person) ?? 1e9) - (order.get(b.person) ?? 1e9) || nameOf(a).localeCompare(nameOf(b), 'ko');
  const rows = ofWeek.slice().sort(sort);
  return {
    v: 1, at, today,
    numbers: { dueThisWeek: n.dueThisWeek, dueThisWeekDone: n.dueThisWeekDone, created: n.created, doing: n.doing, overdue: n.overdue },
    nextWeek: n.nextWeek.map((t) => ({ id: t.id, key: t.key, title: t.title, due: t.due ?? '', assignee: t.assignee })),
    people: people.map((p) => ({ id: p.id, name: p.name })),
    written: rows.filter((e) => isFilled(e)).map((e) => ({ person: e.person, name: nameOf(e), day: e.day })),
    blockers: rows.filter((e) => e.blocker.trim()).map((e) => ({ person: e.person, name: nameOf(e), day: e.day, text: e.blocker.trim() })),
    done: rows.filter((e) => e.done.trim()).map((e) => ({ person: e.person, name: nameOf(e), day: e.day, text: e.done.trim() })),
  };
}

/** 저장해 둔 저장본을 읽는다 - 모양이 어긋나면 null(저장본 없음으로 본다) */
export function parseSnapshot(v: unknown): WeeklySnapshot | null {
  if (!v || typeof v !== 'object') return null;
  const s = v as Record<string, unknown>;
  const arr = (k: string) => (Array.isArray(s[k]) ? (s[k] as Record<string, unknown>[]) : null);
  const nums = s.numbers as Record<string, unknown> | undefined;
  if (s.v !== 1 || typeof s.at !== 'string' || typeof s.today !== 'string' || !nums || typeof nums !== 'object') return null;
  const people = arr('people');
  const written = arr('written');
  const blockers = arr('blockers');
  const done = arr('done');
  const nextWeek = arr('nextWeek');
  if (!people || !written || !blockers || !done || !nextWeek) return null;
  const str = (x: unknown) => (typeof x === 'string' ? x : x == null ? '' : String(x));
  const int = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : Number(x) || 0);
  const ref = (r: Record<string, unknown>) => ({ person: str(r.person), name: str(r.name), day: str(r.day).slice(0, 10) });
  return {
    v: 1, at: s.at, today: s.today.slice(0, 10),
    numbers: {
      dueThisWeek: int(nums.dueThisWeek), dueThisWeekDone: int(nums.dueThisWeekDone), created: int(nums.created),
      doing: int(nums.doing), overdue: int(nums.overdue),
    },
    nextWeek: nextWeek.map((t) => ({
      id: str(t.id), key: str(t.key), title: str(t.title), due: str(t.due).slice(0, 10), assignee: typeof t.assignee === 'string' ? t.assignee : null,
    })),
    people: people.map((p) => ({ id: str(p.id), name: str(p.name) })),
    written: written.map(ref),
    blockers: blockers.map((b) => ({ ...ref(b), text: str(b.text) })),
    done: done.map((d) => ({ ...ref(d), text: str(d.text) })),
  };
}

/** 저장본의 작성 현황 - 명단 × 월 ~ 금(확정한 날까지)에서 무엇이라도 적은 칸. 휴일 · 휴가는 모른다 */
export function writtenCount(s: WeeklySnapshot, monday: string): { written: number; possible: number } {
  const days = workdaysOf(monday).filter((d) => d <= s.today);
  const ids = new Set(s.people.map((p) => p.id));
  const seen = new Set(s.written.filter((w) => ids.has(w.person) && days.includes(w.day)).map((w) => `${w.person}:${w.day}`));
  return { written: seen.size, possible: s.people.length * days.length };
}

/* ── 글로 옮기기(메신저 · 메일에 붙여 넣기) ─────────────────── */

/** 비어 있으면 (미작성) - 사람이 직접 적은 '없음'은 그대로 둔다 */
const bullet = (text: string, indent = '') => {
  const lines = linesOf(text);
  return lines.length ? lines.map((l) => `${indent}- ${l}`).join('\n') : `${indent}(미작성)`;
};

/** rows = 지금 명단 순서, gone = 명단에서 빠졌지만 그날 적은 사람 */
export function dailyText(
  day: string,
  rows: { name: string; entry: DailyEntry | undefined }[],
  gone: { name: string; entry: DailyEntry }[] = [],
): string {
  const out = [`[MATE 일간보고] ${dayLabel(day, true)}`];
  const written = rows.filter((r) => isFilled(r.entry)).length;
  out.push(`작성 ${written}/${rows.length}명 (지금 명단 기준)`);
  const one = (n: number, name: string, e: DailyEntry | undefined) => {
    out.push('', `${n}. ${name}`);
    if (!e || !isFilled(e)) {
      out.push('  (미작성)');
      return;
    }
    out.push('  완료', bullet(e.done, '  '), '  예정', bullet(e.plan, '  '));
    if (e.blocker.trim()) out.push('  블로커 & 공유사항', bullet(e.blocker, '  '));
  };
  rows.forEach((r, i) => one(i + 1, r.name, r.entry));
  if (gone.length) {
    out.push('', '[명단에서 빠진 사람의 보고]');
    gone.forEach((g, i) => one(i + 1, g.name, g.entry));
  }
  return out.join('\n');
}

const STATE_TEXT: Record<ProjectState, string> = { good: '순조', watch: '주의', risk: '위험' };

/**
 * data = 확정 저장본(확정한 보고) 또는 지금 모은 자료(초안 · 예전 확정본). stage = 머리에 붙일 상태 글
 * (예: '확정 · 2026.11.16 오후 4:59 · 박무경', '초안', '확정 · 확정 시점 자료 없음')
 */
export function weeklyText(input: {
  monday: string;
  report: WeeklyReport | undefined;
  items: WeeklyItem[];
  data: WeeklySnapshot;
  fromSnapshot: boolean;
  stage: string;
}): string {
  const { monday, report, items, data, fromSnapshot, stage } = input;
  const w = weekLabel(monday);
  const n = data.numbers;
  const count = writtenCount(data, monday);
  const text = (s: string | undefined) => (s && s.trim() ? s.trim() : '(미작성)');
  const out = [
    `[MATE 주간보고] ${w.year}년 ${w.text} (${w.range}) · ${stage}`,
    '',
    '1. 한 주 요약',
    text(report?.summary),
    '',
    '2. 프로젝트별 현황',
  ];
  if (!items.length) out.push('(미작성)');
  items.forEach((it) => {
    out.push(`■ ${it.name.trim() || '이름 없는 프로젝트'} [${STATE_TEXT[it.state]}]`);
    out.push('  이번 주', bullet(it.done, '  '), '  다음 주', bullet(it.next, '  '));
    if (it.issue.trim()) out.push('  이슈', bullet(it.issue, '  '));
  });
  out.push(
    '',
    fromSnapshot ? `3. 숫자로 본 한 주 (작업 보드 · 확정 시점 ${stampLabel(data.at)})` : '3. 숫자로 본 한 주 (작업 보드 · 지금 기준)',
    `- 이번 주 마감 작업 ${n.dueThisWeek}건 중 ${fromSnapshot ? '확정 때' : '지금'} 완료 ${n.dueThisWeekDone}건`,
    `- 새로 만든 작업 ${n.created}건`,
    `- 진행 중 · 검토 ${n.doing}건, 마감 지난 작업 ${n.overdue}건`,
    `- 다음 주 마감 ${data.nextWeek.length}건`,
    `- 일간보고 작성 기록 ${count.written}/${count.possible} (명단 × 평일, 휴일 · 휴가 미반영)`,
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
      finalizedBy: typeof w.finalizedBy === 'string' ? w.finalizedBy : null,
      finalizedAt: typeof w.finalizedAt === 'string' ? w.finalizedAt : null,
      snapshot: parseSnapshot(w.snapshot),
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

/** 썼으면 참 - 저장이 막혔거나 공간이 모자라면 거짓(화면의 글은 그대로 둔다) */
function write(data: Saved): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

const EMPTY_REPORT = (week: string): WeeklyReport => ({
  id: week, summary: '', issues: '', nextPlan: '', notes: '', status: 'draft',
  finalizedBy: null, finalizedAt: null, snapshot: null, updatedBy: null, updatedAt: new Date().toISOString(),
});

/** 확정할 내용이 있는가 - 본문 한 칸이나 프로젝트 한 줄 */
export const hasWeeklyContent = (report: WeeklyReport | undefined, items: WeeklyItem[]) =>
  !!(report && (report.summary.trim() || report.issues.trim() || report.nextPlan.trim() || report.notes.trim())) || items.length > 0;

export const NOTHING_TO_FINALIZE = '확정할 내용이 없습니다. 요약이나 프로젝트를 먼저 적어 주세요.';
const LOCKED = '확정된 주간보고입니다. 고치려면 다시 고치기를 먼저 눌러 주세요.';

const isFinal = (s: Saved, week: string) => s.weekly.find((w) => w.id === week)?.status === 'final';

/** 브라우저 저장 모드 - 계정이 없어 누구나 명단을 고친다 */
export function useReportStore(opts: ReportStoreOptions): ReportStore {
  const [data, setData] = useState<Saved>(() => ({ people: defaultPeople(), daily: [], weekly: [], items: [] }));
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  /** 지금 자료 - 한 틱에 여러 번 고쳐도 앞 고침 위에 쌓이게 바로 바꾼다 */
  const live = useRef(data);
  const me = useRef(opts.me);
  me.current = opts.me;
  const onError = useRef(opts.onError);
  onError.current = opts.onError;

  useEffect(() => {
    const first = read();
    live.current = first;
    setData(first);
    setReady(true);
    // 같은 보고를 다른 탭에서 열어 두었을 때 고친 것을 따라간다
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const next = parse(e.newValue);
        live.current = next;
        setData(next);
      } catch {
        /* 깨진 값은 무시 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** 바꾸고 쓴다. 쓰지 못했으면 화면의 글은 두고 saveError 를 세운다. 썼으면 참 */
  const commit = useCallback((fn: (cur: Saved) => Saved) => {
    const next = fn(live.current);
    live.current = next;
    setData(next);
    const ok = write(next);
    setSaveError(!ok);
    return ok;
  }, []);

  const weekFinal = useCallback((week: string) => isFinal(live.current, week), []);

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
    const over = overLimit(patch, ['done', 'plan', 'blocker'], DAILY_MAX);
    if (over !== null) {
      onError.current?.(limitText(over, DAILY_MAX));
      return false;
    }
    const id = dailyId(day, person.id);
    commit((cur) => {
      const was = cur.daily.find((e) => e.id === id);
      const next: DailyEntry = was
        ? { ...was, ...patch, ...stampOf(me.current) }
        : { id, day, person: person.id, name: person.name, done: '', plan: '', blocker: '', ...patch, ...stampOf(me.current) };
      return { ...cur, daily: was ? cur.daily.map((e) => (e.id === id ? next : e)) : [...cur.daily, next] };
    });
    return true;
  }, [commit]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, patch) => {
    if (weekFinal(week)) {
      onError.current?.(LOCKED);
      return false;
    }
    const over = overLimit(patch, ['summary', 'issues', 'nextPlan', 'notes'], WEEKLY_MAX);
    if (over !== null) {
      onError.current?.(limitText(over, WEEKLY_MAX));
      return false;
    }
    commit((cur) => {
      const was = cur.weekly.find((w) => w.id === week);
      const next: WeeklyReport = { ...(was ?? EMPTY_REPORT(week)), ...patch, ...stampOf(me.current) };
      return { ...cur, weekly: was ? cur.weekly.map((w) => (w.id === week ? next : w)) : [...cur.weekly, next] };
    });
    return true;
  }, [commit, weekFinal]);

  const addItem = useCallback<ReportStore['addItem']>((week, input = {}) => {
    if (weekFinal(week)) {
      onError.current?.(LOCKED);
      return null;
    }
    const it: WeeklyItem = {
      id: crypto.randomUUID(), week, name: '', state: 'good', done: '', next: '', issue: '', ...input,
      order: nextPersonOrder(live.current.items.filter((x) => x.week === week)), ...stampOf(me.current),
    };
    commit((cur) => ({ ...cur, items: [...cur.items, it] }));
    return it;
  }, [commit, weekFinal]);

  const updateItem = useCallback<ReportStore['updateItem']>((id, patch) => {
    const it = live.current.items.find((x) => x.id === id);
    if (it && weekFinal(it.week)) {
      onError.current?.(LOCKED);
      return false;
    }
    const over = overLimit(patch, ['done', 'next', 'issue'], ITEM_MAX) ?? overLimit(patch, ['name'], ITEM_NAME_MAX);
    if (over !== null) {
      onError.current?.(limitText(over, over > ITEM_MAX ? ITEM_MAX : ITEM_NAME_MAX));
      return false;
    }
    commit((cur) => ({ ...cur, items: cur.items.map((x) => (x.id === id ? { ...x, ...patch, ...stampOf(me.current) } : x)) }));
    return true;
  }, [commit, weekFinal]);

  const removeItem = useCallback<ReportStore['removeItem']>((id) => {
    const it = live.current.items.find((x) => x.id === id);
    if (it && weekFinal(it.week)) {
      onError.current?.(LOCKED);
      return;
    }
    commit((cur) => ({ ...cur, items: cur.items.filter((x) => x.id !== id) }));
  }, [commit, weekFinal]);

  const finalize = useCallback<ReportStore['finalize']>(async (week, local) => {
    const report = live.current.weekly.find((w) => w.id === week);
    if (report?.status === 'final') return { ok: false, error: '이미 확정된 주간보고입니다.' };
    if (!hasWeeklyContent(report, live.current.items.filter((x) => x.week === week))) return { ok: false, error: NOTHING_TO_FINALIZE };
    const ok = commit((cur) => {
      const was = cur.weekly.find((w) => w.id === week) ?? EMPTY_REPORT(week);
      const next: WeeklyReport = { ...was, status: 'final', finalizedBy: me.current, finalizedAt: local.at, snapshot: local, ...stampOf(me.current) };
      return { ...cur, weekly: cur.weekly.some((w) => w.id === week) ? cur.weekly.map((w) => (w.id === week ? next : w)) : [...cur.weekly, next] };
    });
    return ok ? { ok: true } : { ok: false, error: '이 브라우저에 저장하지 못했습니다. 확정이 새로고침 뒤에 남지 않을 수 있습니다.' };
  }, [commit]);

  const reopen = useCallback<ReportStore['reopen']>(async (week) => {
    if (!weekFinal(week)) return { ok: false, error: '확정된 주간보고가 아닙니다.' };
    const ok = commit((cur) => ({ ...cur, weekly: cur.weekly.map((w) => (w.id === week ? { ...w, status: 'draft', ...stampOf(me.current) } : w)) }));
    return ok ? { ok: true } : { ok: false, error: '이 브라우저에 저장하지 못했습니다.' };
  }, [commit, weekFinal]);

  /** 다시 써 본다 - 썼으면 저장 실패 표시를 거둔다 */
  const settle = useCallback(async () => {
    const ok = write(live.current);
    setSaveError(!ok);
    return ok;
  }, []);
  const flush = useCallback(async () => { await settle(); }, [settle]);
  const retry = useCallback(async () => { await settle(); }, [settle]);

  const people = useMemo(() => data.people.slice().sort(byPersonOrder), [data.people]);

  return {
    ready, missing: false, people, daily: data.daily, weekly: data.weekly, items: data.items,
    sync: saveError ? 'error' : 'idle', loadError: null, saveError,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, addItem, updateItem, removeItem,
    finalize, reopen, settle, flush, retry,
  };
}
