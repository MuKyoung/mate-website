'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRowSync } from './remote';
import { isMissingTable, sb } from './supabase';
import {
  DAILY_MAX, ITEM_MAX, ITEM_NAME_MAX, NOTHING_TO_FINALIZE, WEEKLY_MAX,
  byPersonOrder, dailyId, hasWeeklyContent, limitText, nextPersonOrder, overLimit, parseSnapshot,
  type ReportStore, type ReportStoreOptions,
} from './reportStore';
import { isProjectState, type DailyEntry, type ReportPerson, type WeeklyItem, type WeeklyReport } from './types';

/*
 * 일간 · 주간보고의 Supabase 저장소 - 보고 화면(Reports.tsx)과 함께 따로 받는다.
 * 작업 화면의 첫 로딩(remote.ts · supabase.ts)에는 보고 코드가 실리지 않는다.
 *
 * 명단은 팀원 모두 읽고 관리자만 고친다(RLS). 일간 · 주간보고는 팀원 누구나 읽고 쓴다.
 * 일간 줄과 주간 장은 id 가 정해져 있어(날짜:사람 · 그 주 월요일) 처음 적을 때 upsert 로 넣는다 - 두 사람이 같은 칸을
 * 동시에 처음 적어도 한 줄로 모이고, 보낸 칸만 덮는다.
 * 확정 · 다시 열기는 RPC(tm_weekly_finalize · tm_weekly_reopen)로만 한다 - 서버가 확정자 · 시각 · 저장본을 남기고,
 * 확정 중에는 본문 · 프로젝트 줄 고침을 거절한다. 표 · 권한은 supabase/taskmanager.sql 의 '일간 · 주간보고' 블록.
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
  finalized_by: string | null;
  finalized_at: string | null;
  snapshot: unknown;
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

/** 빠진 칸(실시간 알림)은 undefined 로 둔다 - 화면에 있던 값이 남는다 */
const keep = <T,>(v: T | undefined, map: (x: T) => unknown) => (v === undefined ? undefined : map(v));

const weeklyFromRow = (r: WeeklyRow): WeeklyReport => ({
  id: r.id, summary: r.summary, issues: r.issues, nextPlan: r.next_plan, notes: r.notes,
  status: keep(r.status, (s) => (s === 'final' ? 'final' : 'draft')) as WeeklyReport['status'],
  finalizedBy: keep(r.finalized_by, (x) => x ?? null) as WeeklyReport['finalizedBy'],
  finalizedAt: keep(r.finalized_at, (x) => x ?? null) as WeeklyReport['finalizedAt'],
  snapshot: keep(r.snapshot, (x) => parseSnapshot(x)) as WeeklyReport['snapshot'],
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

/** 본문 칸만 - 상태 · 확정 칸은 RPC 만 바꾼다(SQL 도 그 칸의 권한을 주지 않는다) */
function weeklyToRow(p: Partial<WeeklyReport>): Partial<WeeklyRow> {
  const r: Partial<WeeklyRow> = {};
  if (p.summary !== undefined) r.summary = p.summary;
  if (p.issues !== undefined) r.issues = p.issues;
  if (p.nextPlan !== undefined) r.next_plan = p.nextPlan;
  if (p.notes !== undefined) r.notes = p.notes;
  return r;
}

const itemFromRow = (r: WeeklyItemRow): WeeklyItem => ({
  id: r.id, week: r.week, name: r.name,
  state: keep(r.state, (s) => (isProjectState(s) ? s : 'good')) as WeeklyItem['state'],
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

/* ── 보고 표가 있는가 ─────────────────────────────────────────
   표가 없다는 답(42P01 · PGRST2xx)과 연결 실패를 가른다. 연결 실패는 '표 없음'으로 굳히지 않고 다시 확인할 수 있게 둔다 */

type Probe = 'checking' | 'ok' | 'missing' | 'error';
type DbError = { message?: string; code?: string } | null;

const reportProbe = () => [
  sb().from('tm_report_people').select('id').limit(1),
  sb().from('tm_daily_reports').select('id').limit(1),
  sb().from('tm_weekly_reports').select('id,finalized_at,snapshot').limit(1),
  sb().from('tm_weekly_items').select('id').limit(1),
];

/**
 * 읽기 요청은 Supabase 라이브러리(postgrest-js)가 연결 오류 · 503 일 때 이미 세 번까지 다시 보낸다(약 7초).
 * 그 위에 또 다시 묻지 않는다 - 실패하면 바로 '확인하지 못함'을 보이고 다시 시도 단추에 맡긴다
 */
function useReportTables(): [Probe, () => void] {
  const [state, setState] = useState<Probe>('checking');
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let live = true;
    const ask = async () => {
      let errs: { message?: string; code?: string }[] = [];
      try {
        const res = await Promise.all(reportProbe());
        errs = res.map((r) => r.error as DbError).filter((e): e is { message?: string; code?: string } => !!e);
      } catch (e) {
        errs = [{ message: e instanceof Error ? e.message : String(e) }];
      }
      if (!live) return;
      if (errs.some((e) => isMissingTable(e) || e.code === '42703' || e.code?.startsWith('PGRST2'))) setState('missing');
      else setState(errs.length ? 'error' : 'ok');
    };
    setState('checking');
    void ask();
    return () => { live = false; };
  }, [nonce]);
  return [state, useCallback(() => setNonce((n) => n + 1), [])];
}

const LOCKED = '확정된 주간보고입니다. 고치려면 다시 고치기를 먼저 눌러 주세요.';
const PROBE_FAIL = '보고 표를 확인하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.';
/** 떠나기 전에 저장이 끝나기를 기다리는 시간 - 넘으면 아직 보내지 못한 것으로 본다(연결 끊김 · 다시 보내는 중) */
const SETTLE_MS = 5000;

export function useRemoteReportStore(opts: ReportStoreOptions): ReportStore {
  const onError = opts.onError;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [probe, reprobe] = useReportTables();
  const off = probe !== 'ok';
  const me = useRef(opts.me);
  me.current = opts.me;
  /** 이 화면에서 지운 줄 - 지우기가 아직 서버에 닿지 않았을 수 있어 떠나기 전에 함께 기다린다 */
  const removed = useRef(new Set<string>());
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
      createFail: () => '주간보고를 저장하지 못했습니다. 확정된 주이거나 서버가 받아 주지 않아 화면을 저장된 내용으로 되돌렸습니다.',
    },
  });
  const items = useRowSync<WeeklyItem, WeeklyItemRow>({
    table: 'tm_weekly_items', fromRow: itemFromRow, toRow: itemToRow, onError, disabled: off,
    texts: {
      gone: '다른 팀원이 지운 프로젝트 줄이라 고치던 내용을 저장하지 못했습니다.',
      createFail: () => '프로젝트 줄을 더하지 못했습니다. 확정된 주이거나 서버가 받아 주지 않아 화면에서 뺐습니다.',
    },
  });
  const pe = people.eng;
  const de = daily.eng;
  const we = weekly.eng;
  const ie = items.eng;
  const engs = useMemo(() => [pe, de, we, ie] as const, [pe, de, we, ie]);
  const weekFinal = useCallback((week: string) => we.items.find((w) => w.id === week)?.status === 'final', [we]);
  const fail = useCallback((text: string) => {
    onErrorRef.current?.(text);
    return false;
  }, []);

  const addPerson = useCallback<ReportStore['addPerson']>((name) => {
    const p: ReportPerson = { id: crypto.randomUUID(), name, member: null, order: nextPersonOrder(pe.items) };
    pe.create(p, { id: p.id, ...personToRow(p) });
    return p;
  }, [pe]);
  const updatePerson = useCallback<ReportStore['updatePerson']>((id, patch) => pe.patch(id, patch), [pe]);
  const removePerson = useCallback<ReportStore['removePerson']>((id) => {
    removed.current.add(id);
    pe.remove([id], id);
  }, [pe]);

  const setDaily = useCallback<ReportStore['setDaily']>((day, person, patch) => {
    const over = overLimit(patch, ['done', 'plan', 'blocker'], DAILY_MAX);
    if (over !== null) return fail(limitText(over, DAILY_MAX));
    const id = dailyId(day, person.id);
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (de.items.some((e) => e.id === id)) {
      de.patch(id, { ...patch, ...at });
      return true;
    }
    const entry: DailyEntry = { id, day, person: person.id, name: person.name, done: '', plan: '', blocker: '', ...patch, ...at };
    de.create(entry, { id, day, person: person.id, name: person.name, ...dailyToRow(patch) }, true);
    return true;
  }, [de, fail]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, patch) => {
    if (weekFinal(week)) return fail(LOCKED);
    const over = overLimit(patch, ['summary', 'issues', 'nextPlan', 'notes'], WEEKLY_MAX);
    if (over !== null) return fail(limitText(over, WEEKLY_MAX));
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (we.items.some((w) => w.id === week)) {
      we.patch(week, { ...patch, ...at });
      return true;
    }
    const report: WeeklyReport = {
      id: week, summary: '', issues: '', nextPlan: '', notes: '', status: 'draft',
      finalizedBy: null, finalizedAt: null, snapshot: null, ...patch, ...at,
    };
    we.create(report, { id: week, ...weeklyToRow(patch) }, true);
    return true;
  }, [we, weekFinal, fail]);

  const addItem = useCallback<ReportStore['addItem']>((week, input = {}) => {
    if (weekFinal(week)) {
      fail(LOCKED);
      return null;
    }
    const it: WeeklyItem = {
      id: crypto.randomUUID(), week, name: '', state: 'good', done: '', next: '', issue: '', ...input,
      order: nextPersonOrder(ie.items.filter((x) => x.week === week)),
      updatedBy: me.current, updatedAt: new Date().toISOString(),
    };
    ie.create(it, { id: it.id, week, ...itemToRow(it) });
    return it;
  }, [ie, weekFinal, fail]);

  const updateItem = useCallback<ReportStore['updateItem']>((id, patch) => {
    const cur = ie.items.find((x) => x.id === id);
    if (cur && weekFinal(cur.week)) return fail(LOCKED);
    const over = overLimit(patch, ['done', 'next', 'issue'], ITEM_MAX);
    if (over !== null) return fail(limitText(over, ITEM_MAX));
    const overName = overLimit(patch, ['name'], ITEM_NAME_MAX);
    if (overName !== null) return fail(limitText(overName, ITEM_NAME_MAX));
    ie.patch(id, { ...patch, updatedBy: me.current, updatedAt: new Date().toISOString() });
    return true;
  }, [ie, weekFinal, fail]);

  const removeItem = useCallback<ReportStore['removeItem']>((id) => {
    const cur = ie.items.find((x) => x.id === id);
    if (cur && weekFinal(cur.week)) {
      fail(LOCKED);
      return;
    }
    removed.current.add(id);
    ie.remove([id], id);
  }, [ie, weekFinal, fail]);

  /**
   * 기다리는 저장을 보내고, 줄마다 서버에서 끝났는지 본다. 연결이 끊겨 다시 보내는 중이면 SETTLE_MS 안에 끝나지 않는다 → 거짓.
   * 서버가 거절한 것(fail)은 엔진이 이미 알리고 화면을 서버 값으로 되돌렸으므로 남은 것이 없다고 본다
   */
  const settle = useCallback(async () => {
    if (off) return true;
    await Promise.all(engs.map((e) => e.flushAll()));
    const waits = engs.flatMap((e) => [...e.items.map((x) => x.id), ...removed.current].map((id) => e.whenSettled(id)));
    let timer: ReturnType<typeof setTimeout> | null = null;
    const done = await Promise.race([
      Promise.all(waits).then(() => true),
      new Promise<boolean>((resolve) => { timer = setTimeout(() => resolve(false), SETTLE_MS); }),
    ]);
    if (timer) clearTimeout(timer);
    if (done) removed.current.clear();
    return done;
  }, [off, engs]);

  const flush = useCallback(async () => {
    await Promise.all(engs.map((e) => e.flushAll()));
  }, [engs]);

  const retry = useCallback(async () => {
    if (probe !== 'ok') {
      reprobe();
      return;
    }
    await Promise.all(engs.map((e) => e.reload()));
  }, [probe, reprobe, engs]);

  const finalize = useCallback<ReportStore['finalize']>(async (week) => {
    if (weekFinal(week)) return { ok: false, error: '이미 확정된 주간보고입니다.' };
    if (!hasWeeklyContent(we.items.find((w) => w.id === week), ie.items.filter((x) => x.week === week))) {
      return { ok: false, error: NOTHING_TO_FINALIZE };
    }
    // 고치던 것이 서버에 다 들어간 뒤에 확정한다 - 확정된 뒤에 늦게 닿은 고침은 서버가 거절한다
    if (!(await settle())) return { ok: false, error: '아직 저장하지 못한 변경이 있어 확정하지 않았습니다. 연결을 확인한 뒤 다시 눌러 주세요.' };
    const { error } = await sb().rpc('tm_weekly_finalize', { target: week });
    if (error) {
      await we.reload(true);
      return { ok: false, error: error.code === 'P0001' && error.message ? error.message : '확정하지 못했습니다. 인터넷 연결을 확인해 주세요.' };
    }
    // 서버가 적은 확정자 · 시각 · 저장본을 다시 읽는다(실시간 알림을 기다리지 않는다)
    await we.reload(true);
    return { ok: true };
  }, [we, ie, weekFinal, settle]);

  const reopen = useCallback<ReportStore['reopen']>(async (week) => {
    const { error } = await sb().rpc('tm_weekly_reopen', { target: week });
    await we.reload(true);
    if (error) return { ok: false, error: error.code === 'P0001' && error.message ? error.message : '다시 열지 못했습니다. 인터넷 연결을 확인해 주세요.' };
    return { ok: true };
  }, [we]);

  const list = useMemo(() => people.items.slice().sort(byPersonOrder), [people.items]);
  const syncs = [people.sync, daily.sync, weekly.sync, items.sync];
  const engineError = people.loadError ?? daily.loadError ?? weekly.loadError ?? items.loadError;
  return {
    ready: probe === 'missing' || probe === 'error' || (probe === 'ok' && people.ready && daily.ready && weekly.ready && items.ready),
    missing: probe === 'missing',
    people: list, daily: daily.items, weekly: weekly.items, items: items.items,
    sync: syncs.includes('error') ? 'error' : syncs.includes('saving') ? 'saving' : 'idle',
    loadError: probe === 'error' ? PROBE_FAIL : probe === 'ok' ? engineError : null,
    saveError: false,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, addItem, updateItem, removeItem,
    finalize, reopen, settle, flush, retry,
  };
}
