'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRowSync } from './remote';
import { isMissingTable, sb } from './supabase';
import {
  LIMITS, TEAM_LOCKED, byPersonOrder, checkDaily, checkWeekly, dailyId, legacyClear, limitText, nextPersonOrder,
  parseDailyProjects, parseWeeklyProjects, weeklyId,
  type ReportStore, type ReportStoreOptions,
} from './reportStore';
import type { DailyEntry, ReportPerson, WeeklyEntry, WeeklyTeam } from './types';

/*
 * 일간 · 주간보고의 Supabase 저장소(2026-11-17 2판) - 보고 화면(Reports.tsx)과 함께 따로 받는다.
 * 작업 화면의 첫 로딩(remote.ts · supabase.ts)에는 보고 코드가 실리지 않는다.
 *
 * 명단은 팀원 모두 읽고 관리자만 고친다(RLS). 일간 · 주간보고 · 팀 요약은 팀원 누구나 읽고 쓴다.
 * 일간(날짜:사람) · 주간(월요일:사람) · 팀 요약(월요일)은 id 가 정해져 있어 처음 적을 때 upsert 로 넣는다 -
 * 두 사람이 같은 칸을 동시에 처음 적어도 한 줄로 모이고, 보낸 칸만 덮는다.
 * 표 · 권한은 supabase/taskmanager.sql 의 '일간 · 주간보고' 블록과 그 끝의 '2판' 조각.
 */

/* ── 표의 한 줄 ↔ 화면의 모양 ─────────────────────────────────
   고친 사람(updated_by) · 고친 시각은 DB 가 적는다 - 화면은 보내지 않는다.
   실시간 알림에서 빠진 칸(긴 글 · jsonb 는 바뀌지 않았으면 Postgres 가 싣지 않는다)은 undefined 로 두어 화면 값이 남게 한다 */

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
  projects: unknown;
  done: string;
  plan: string;
  blocker: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface WeeklyRow {
  id: string;
  week: string;
  person: string;
  name: string;
  summary: string;
  projects: unknown;
  issues: string;
  feedback: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamRow {
  id: string;
  summary: string;
  status: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** 빠진 칸(실시간 알림)은 undefined 로 둔다 - 화면에 있던 값이 남는다 */
const keep = <T,>(v: T | undefined, map: (x: T) => unknown) => (v === undefined ? undefined : map(v));

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
  projects: keep(r.projects, parseDailyProjects) as DailyEntry['projects'],
  done: r.done, plan: r.plan, blocker: r.blocker,
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

/** 글 칸만 고친다 - 날짜 · 사람 · 이름은 만들 때 정한다 */
function dailyToRow(p: Partial<DailyEntry>): Partial<DailyRow> {
  const r: Partial<DailyRow> = {};
  if (p.projects !== undefined) r.projects = p.projects;
  if (p.done !== undefined) r.done = p.done;
  if (p.plan !== undefined) r.plan = p.plan;
  if (p.blocker !== undefined) r.blocker = p.blocker;
  return r;
}

const weeklyFromRow = (r: WeeklyRow): WeeklyEntry => ({
  id: r.id, week: r.week, person: r.person, name: r.name,
  summary: r.summary, projects: keep(r.projects, parseWeeklyProjects) as WeeklyEntry['projects'],
  issues: r.issues, feedback: r.feedback,
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

function weeklyToRow(p: Partial<WeeklyEntry>): Partial<WeeklyRow> {
  const r: Partial<WeeklyRow> = {};
  if (p.summary !== undefined) r.summary = p.summary;
  if (p.projects !== undefined) r.projects = p.projects;
  if (p.issues !== undefined) r.issues = p.issues;
  if (p.feedback !== undefined) r.feedback = p.feedback;
  return r;
}

const teamFromRow = (r: TeamRow): WeeklyTeam => ({
  id: r.id, summary: r.summary,
  status: keep(r.status, (s) => (s === 'final' ? 'final' : 'draft')) as WeeklyTeam['status'],
  updatedBy: r.updated_by ?? null, updatedAt: r.updated_at,
});

/** 요약 칸만 - 상태는 RPC 만 바꾼다(SQL 도 그 칸의 권한을 주지 않는다) */
function teamToRow(p: Partial<WeeklyTeam>): Partial<TeamRow> {
  const r: Partial<TeamRow> = {};
  if (p.summary !== undefined) r.summary = p.summary;
  return r;
}

/* ── 보고 표가 있는가 ─────────────────────────────────────────
   표 · 칸이 없다는 답(42P01 · 42703 · PGRST2xx)과 연결 실패를 가른다. 연결 실패는 '표 없음'으로 굳히지 않고 다시 확인할 수 있게 둔다 */

type Probe = 'checking' | 'ok' | 'missing' | 'error';
type DbError = { message?: string; code?: string } | null;

const reportProbe = () => [
  sb().from('tm_report_people').select('id').limit(1),
  sb().from('tm_daily_reports').select('id,projects').limit(1),
  sb().from('tm_weekly_entries').select('id,projects,feedback').limit(1),
  sb().from('tm_weekly_reports').select('id,status').limit(1),
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
  const weekly = useRowSync<WeeklyEntry, WeeklyRow>({
    table: 'tm_weekly_entries', fromRow: weeklyFromRow, toRow: weeklyToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 주간보고라 고치던 내용을 저장하지 못했습니다.',
      createFail: ({ name }) => `${name} 님의 주간보고를 저장하지 못했습니다. 서버가 받아 주지 않아 화면에서 뺐습니다.`,
    },
  });
  const teams = useRowSync<WeeklyTeam, TeamRow>({
    table: 'tm_weekly_reports', fromRow: teamFromRow, toRow: teamToRow, onError, disabled: off,
    texts: {
      gone: '그사이 지워진 팀 요약이라 고치던 내용을 저장하지 못했습니다.',
      createFail: () => '팀 요약을 저장하지 못했습니다. 서버가 받아 주지 않아 화면을 저장된 내용으로 되돌렸습니다.',
    },
  });
  const pe = people.eng;
  const de = daily.eng;
  const we = weekly.eng;
  const te = teams.eng;
  const engs = useMemo(() => [pe, de, we, te] as const, [pe, de, we, te]);
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
    const err = checkDaily(patch);
    if (err) return fail(err);
    const id = dailyId(day, person.id);
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    const cur = de.items.find((e) => e.id === id);
    if (cur) {
      de.patch(id, { ...patch, ...legacyClear(cur, patch), ...at });
      return true;
    }
    const entry: DailyEntry = { id, day, person: person.id, name: person.name, projects: [], done: '', plan: '', blocker: '', ...patch, ...at };
    de.create(entry, { id, day, person: person.id, name: person.name, ...dailyToRow(patch) }, true);
    return true;
  }, [de, fail]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, person, patch) => {
    const err = checkWeekly(patch);
    if (err) return fail(err);
    const id = weeklyId(week, person.id);
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (we.items.some((e) => e.id === id)) {
      we.patch(id, { ...patch, ...at });
      return true;
    }
    const entry: WeeklyEntry = {
      id, week, person: person.id, name: person.name, summary: '', projects: [], issues: '', feedback: '', ...patch, ...at,
    };
    we.create(entry, { id, week, person: person.id, name: person.name, ...weeklyToRow(patch) }, true);
    return true;
  }, [we, fail]);

  const setTeam = useCallback<ReportStore['setTeam']>((week, summary) => {
    const cur = te.items.find((t) => t.id === week);
    if (cur?.status === 'final') return fail(TEAM_LOCKED);
    if (summary.length > LIMITS.team) return fail(limitText(summary.length, LIMITS.team));
    const at = { updatedBy: me.current, updatedAt: new Date().toISOString() };
    if (cur) {
      te.patch(week, { summary, ...at });
      return true;
    }
    te.create({ id: week, summary, status: 'draft', ...at }, { id: week, summary }, true);
    return true;
  }, [te, fail]);

  const reopenTeam = useCallback<ReportStore['reopenTeam']>(async (week) => {
    const { error } = await sb().rpc('tm_weekly_reopen', { target: week });
    await te.reload(true);
    if (error) return { ok: false, error: error.code === 'P0001' && error.message ? error.message : '다시 열지 못했습니다. 인터넷 연결을 확인해 주세요.' };
    return { ok: true };
  }, [te]);

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

  const list = useMemo(() => people.items.slice().sort(byPersonOrder), [people.items]);
  const syncs = [people.sync, daily.sync, weekly.sync, teams.sync];
  const engineError = people.loadError ?? daily.loadError ?? weekly.loadError ?? teams.loadError;
  return {
    ready: probe === 'missing' || probe === 'error' || (probe === 'ok' && people.ready && daily.ready && weekly.ready && teams.ready),
    missing: probe === 'missing',
    people: list, daily: daily.items, weekly: weekly.items, teams: teams.items,
    sync: syncs.includes('error') ? 'error' : syncs.includes('saving') ? 'saving' : 'idle',
    loadError: probe === 'error' ? PROBE_FAIL : probe === 'ok' ? engineError : null,
    saveError: false,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, setTeam, reopenTeam, settle, flush, retry,
  };
}
