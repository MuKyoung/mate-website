'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useRowSync, useTablesExist } from './remote';
import { sb } from './supabase';
import { byPersonOrder, dailyId, nextPersonOrder, type ReportStore, type ReportStoreOptions } from './reportStore';
import { isProjectState, type DailyEntry, type ReportPerson, type WeeklyItem, type WeeklyReport } from './types';

/*
 * 일간 · 주간보고의 Supabase 저장소 - 보고 화면(Reports.tsx)과 함께 따로 받는다.
 * 작업 화면의 첫 로딩(remote.ts · supabase.ts)에는 보고 코드가 실리지 않는다.
 *
 * 명단은 팀원 모두 읽고 관리자만 고친다(RLS). 일간 · 주간보고는 팀원 누구나 읽고 쓴다.
 * 일간 줄과 주간 장은 id 가 정해져 있어(날짜:사람 · 그 주 월요일) 처음 적을 때 upsert 로 넣는다 - 두 사람이 같은 칸을
 * 동시에 처음 적어도 한 줄로 모이고, 보낸 칸만 덮는다. 보고 표가 없는 DB(SQL 을 다시 실행하기 전)에서는 붙지 않는다.
 * 표 · 권한은 supabase/taskmanager.sql 의 '일간 · 주간보고' 블록.
 */

/* ── 표의 한 줄 ↔ 화면의 모양 ─────────────────────────────────
   고친 사람(updated_by) · 고친 시각은 DB 가 적는다 - 화면은 보내지 않는다.
   실시간 알림에서 빠진 칸(긴 글은 바뀌지 않았으면 Postgres 가 싣지 않는다)은 undefined 로 두어 화면 값이 남게 한다 */

interface ReportPersonRow {
  id: string;
  name: string;
  member: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

interface DailyRow {
  id: string;
  day: string;
  person: string;
  name: string;
  done: string;
  plan: string;
  blocker: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface WeeklyRow {
  id: string;
  summary: string;
  issues: string;
  next_plan: string;
  notes: string;
  status: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface WeeklyItemRow {
  id: string;
  week: string;
  name: string;
  state: string;
  done: string;
  next_plan: string;
  issue: string;
  sort: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

const personFromRow = (r: ReportPersonRow): ReportPerson => ({ id: r.id, name: r.name, member: r.member ?? null, order: r.sort });

/** 바뀐 칸만 옮긴다. id 는 만들 때 한 번만 보낸다 */
function personToRow(p: Partial<ReportPerson>): Partial<ReportPersonRow> {
  const r: Partial<ReportPersonRow> = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.member !== undefined) r.member = p.member;
  if (p.order !== undefined) r.sort = p.order;
  return r;
}

const dailyFromRow = (r: DailyRow): DailyEntry => ({
  id: r.id, day: r.day, person: r.person, name: r.name,
  done: r.done, plan: r.plan, blocker: r.blocker,
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

/** 글 칸만 고친다 - 날짜 · 사람 · 이름은 만들 때 정한다 */
function dailyToRow(p: Partial<DailyEntry>): Partial<DailyRow> {
  const r: Partial<DailyRow> = {};
  if (p.done !== undefined) r.done = p.done;
  if (p.plan !== undefined) r.plan = p.plan;
  if (p.blocker !== undefined) r.blocker = p.blocker;
  return r;
}

const weeklyFromRow = (r: WeeklyRow): WeeklyReport => ({
  id: r.id, summary: r.summary, issues: r.issues, nextPlan: r.next_plan, notes: r.notes,
  status: r.status === undefined ? (undefined as unknown as WeeklyReport['status']) : r.status === 'final' ? 'final' : 'draft',
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

function weeklyToRow(p: Partial<WeeklyReport>): Partial<WeeklyRow> {
  const r: Partial<WeeklyRow> = {};
  if (p.summary !== undefined) r.summary = p.summary;
  if (p.issues !== undefined) r.issues = p.issues;
  if (p.nextPlan !== undefined) r.next_plan = p.nextPlan;
  if (p.notes !== undefined) r.notes = p.notes;
  if (p.status !== undefined) r.status = p.status;
  return r;
}

const itemFromRow = (r: WeeklyItemRow): WeeklyItem => ({
  id: r.id, week: r.week, name: r.name,
  state: r.state === undefined ? (undefined as unknown as WeeklyItem['state']) : isProjectState(r.state) ? r.state : 'good',
  done: r.done, next: r.next_plan, issue: r.issue, order: r.sort,
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

/** 주는 만들 때 정한다 */
function itemToRow(p: Partial<WeeklyItem>): Partial<WeeklyItemRow> {
  const r: Partial<WeeklyItemRow> = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.state !== undefined) r.state = p.state;
  if (p.done !== undefined) r.done = p.done;
  if (p.next !== undefined) r.next_plan = p.next;
  if (p.issue !== undefined) r.issue = p.issue;
  if (p.order !== undefined) r.sort = p.order;
  return r;
}

/** 보고 표(명단 · 일간 · 주간 · 프로젝트 줄) */
const reportProbe = () => [
  sb().from('tm_report_people').select('id').limit(1),
  sb().from('tm_daily_reports').select('id').limit(1),
  sb().from('tm_weekly_reports').select('id').limit(1),
  sb().from('tm_weekly_items').select('id').limit(1),
];

export function useRemoteReportStore(opts: ReportStoreOptions): ReportStore {
  const { onError } = opts;
  const table = useTablesExist(reportProbe);
  const off = table !== true;
  const me = useRef(opts.me);
  me.current = opts.me;
  const people = useRowSync<ReportPerson, ReportPersonRow>({
    table: 'tm_report_people', fromRow: personFromRow, toRow: personToRow, onError, disabled: off,
    texts: {
      gone: '그사이 명단에서 빠진 사람이라 고치던 내용을 저장하지 못했습니다.',
      createFail: ({ name }) => `'${name}' 을(를) 명단에 넣지 못했습니다. 명단은 관리자만 고칠 수 있습니다.`,
    },
  });
  const daily = useRowSync<DailyEntry, DailyRow>({
    table: 'tm_daily_reports', fromRow: dailyFromRow, toRow: dailyToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 일간보고라 고치던 내용을 저장하지 못했습니다.',
      createFail: ({ name }) => `${name} 님의 일간보고를 저장하지 못했습니다. 서버가 받아 주지 않아 화면에서 뺐습니다.`,
    },
  });
  const weekly = useRowSync<WeeklyReport, WeeklyRow>({
    table: 'tm_weekly_reports', fromRow: weeklyFromRow, toRow: weeklyToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 주간보고라 고치던 내용을 저장하지 못했습니다.',
      createFail: () => '주간보고를 저장하지 못했습니다. 서버가 받아 주지 않아 화면에서 뺐습니다.',
    },
  });
  const items = useRowSync<WeeklyItem, WeeklyItemRow>({
    table: 'tm_weekly_items', fromRow: itemFromRow, toRow: itemToRow, onError, disabled: off,
    texts: {
      gone: '다른 팀원이 지운 프로젝트 줄이라 고치던 내용을 저장하지 못했습니다.',
      createFail: () => '프로젝트 줄을 더하지 못했습니다. 서버가 받아 주지 않아 화면에서 뺐습니다.',
    },
  });
  const pe = people.eng;
  const de = daily.eng;
  const we = weekly.eng;
  const ie = items.eng;

  const addPerson = useCallback<ReportStore['addPerson']>((name) => {
    const p: ReportPerson = { id: crypto.randomUUID(), name, member: null, order: nextPersonOrder(pe.items) };
    pe.create(p, { id: p.id, ...personToRow(p) });
    return p;
  }, [pe]);
  const updatePerson = useCallback<ReportStore['updatePerson']>((id, patch) => pe.patch(id, patch), [pe]);
  const removePerson = useCallback<ReportStore['removePerson']>((id) => pe.remove([id], id), [pe]);

  const setDaily = useCallback<ReportStore['setDaily']>((day, person, patch) => {
    const id = dailyId(day, person.id);
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (de.items.some((e) => e.id === id)) {
      de.patch(id, { ...patch, ...at });
      return;
    }
    const entry: DailyEntry = { id, day, person: person.id, name: person.name, done: '', plan: '', blocker: '', ...patch, ...at };
    de.create(entry, { id, day, person: person.id, name: person.name, ...dailyToRow(patch) }, true);
  }, [de]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, patch) => {
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (we.items.some((w) => w.id === week)) {
      we.patch(week, { ...patch, ...at });
      return;
    }
    const report: WeeklyReport = { id: week, summary: '', issues: '', nextPlan: '', notes: '', status: 'draft', ...patch, ...at };
    we.create(report, { id: week, ...weeklyToRow(patch) }, true);
  }, [we]);

  const addItem = useCallback<ReportStore['addItem']>((week, input = {}) => {
    const it: WeeklyItem = {
      id: crypto.randomUUID(), week, name: '', state: 'good', done: '', next: '', issue: '', ...input,
      order: nextPersonOrder(ie.items.filter((x) => x.week === week)),
      updatedBy: me.current, updatedAt: new Date().toISOString(),
    };
    ie.create(it, { id: it.id, week, ...itemToRow(it) });
    return it;
  }, [ie]);
  const updateItem = useCallback<ReportStore['updateItem']>((id, patch) => {
    ie.patch(id, { ...patch, updatedBy: me.current, updatedAt: new Date().toISOString() });
  }, [ie]);
  const removeItem = useCallback<ReportStore['removeItem']>((id) => ie.remove([id], id), [ie]);

  const flush = useCallback(async () => {
    await Promise.all([pe.flushAll(), de.flushAll(), we.flushAll(), ie.flushAll()]);
  }, [pe, de, we, ie]);
  const reload = useCallback(async () => {
    await Promise.all([pe.reload(), de.reload(), we.reload(), ie.reload()]);
  }, [pe, de, we, ie]);

  const list = useMemo(() => people.items.slice().sort(byPersonOrder), [people.items]);
  const syncs = [people.sync, daily.sync, weekly.sync, items.sync];
  return {
    ready: table === false || (table === true && people.ready && daily.ready && weekly.ready && items.ready),
    missing: table === false,
    people: list, daily: daily.items, weekly: weekly.items, items: items.items,
    sync: syncs.includes('error') ? 'error' : syncs.includes('saving') ? 'saving' : 'idle',
    loadError: people.loadError ?? daily.loadError ?? weekly.loadError ?? items.loadError,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, addItem, updateItem, removeItem, flush, reload,
  };
}
