'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MEMBERS, localISO,
  type DailyEntry, type DailyProject, type Member, type ReportPerson, type WeeklyEntry, type WeeklyProject, type WeeklyTeam,
} from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 일간 · 주간보고 저장소(2026-11-17 2판).
 *
 * 브라우저 저장 모드는 이 브라우저(localStorage) 한 곳에 명단 · 일간 · 주간 · 팀 요약을 함께 두고,
 * Supabase 모드는 tm_report_people · tm_daily_reports · tm_weekly_entries · tm_weekly_reports 표(reportRemote.ts)를 쓴다.
 * 둘은 아래 ReportStore 모양을 함께 쓴다. 보고 화면(Reports.tsx)을 열 때만 붙는다 - 작업 화면은 이 표를 읽지 않는다.
 *
 * 누가 고치는가
 *   · 명단(이름 · 순서 · 계정 연결)은 관리자만. 화면은 관리자에게만 '명단 관리'를 보이고, 규칙은 DB(RLS)가 지킨다.
 *   · 일간 · 주간보고는 승인된 팀원 누구나(스크럼에서 대신 적기도 한다). 마지막으로 고친 사람이 남는다.
 *   · 팀 요약 · 피드백은 화면이 PM(관리자)에게만 고칠 칸을 보인다.
 *
 * 칸 글의 약속(화면 · 글 복사 · 주간 초안이 함께 쓴다)
 *   · 한 줄에 한 가지. 앞 공백 두 칸(또는 Tab)마다 한 단계 하위 줄. 맨 앞 '-', '•' 같은 머리표는 떼고 본다.
 *   · '→', '->' 로 시작하면 덧붙이는 말. 줄 끝의 '· 1일', '- 2일', '~ 3일', '· 1일차' 는 소요기간.
 *   · 맨 위 단계 줄 하나와 그 밑의 하위 줄이 한 덩이(Block) - 지난 예정 가져오기 · 주간 초안은 덩이로 옮긴다.
 */

export type PersonPatch = Partial<Pick<ReportPerson, 'name' | 'member' | 'order' | 'hidden'>>;
export type DailyPatch = Partial<Pick<DailyEntry, 'projects' | 'blocker'>>;
export type WeeklyPatch = Partial<Pick<WeeklyEntry, 'summary' | 'projects' | 'issues' | 'feedback'>>;
export type SaveOutcome = { ok: true } | { ok: false; error: string };

export interface ReportStoreOptions extends StoreOptions {
  /** 지금 쓰는 사람(Member.id) - 마지막으로 고친 사람으로 화면에 바로 적는다(Supabase 모드는 DB 가 다시 적는다) */
  me: string;
}

export interface ReportStore {
  /** 읽기를 마쳤다 - 실패했어도 참(그때는 loadError · missing) */
  ready: boolean;
  /** Supabase 모드 - 보고 표 · 칸이 DB 에 없다(SQL 실행 전). 연결 실패와는 다르다 */
  missing: boolean;
  /** 스크럼 순서대로 */
  people: ReportPerson[];
  daily: DailyEntry[];
  weekly: WeeklyEntry[];
  teams: WeeklyTeam[];
  sync: SyncState;
  /** 처음 읽기 · 표 확인이 실패했다(연결). 이때 화면은 쓰기 · 복사를 막는다 */
  loadError: string | null;
  /** 브라우저 저장 모드 - 이 브라우저에 쓰지 못했다(저장 차단 · 공간 부족). 화면의 글은 그대로다 */
  saveError: boolean;
  /** 계정 없는 사람(member 없음) 또는 계정을 이은 사람을 맨 아래에 넣는다 */
  addPerson(name: string, member?: string | null): ReportPerson;
  updatePerson(id: string, patch: PersonPatch): void;
  removePerson(id: string): void;
  /** 그날 그 사람의 보고 - 없으면 만든다. 한도를 넘으면 저장하지 않고 거짓 */
  setDaily(day: string, person: ReportPerson, patch: DailyPatch): boolean;
  /** 그 주 그 사람의 주간보고 - 없으면 만든다 */
  setWeekly(week: string, person: ReportPerson, patch: WeeklyPatch): boolean;
  /** 그 주의 팀 요약 - 예전 판에서 확정한 주면 거짓(먼저 reopenTeam) */
  setTeam(week: string, summary: string): boolean;
  /** 예전 판에서 확정한 팀 요약을 다시 연다 */
  reopenTeam(week: string): Promise<SaveOutcome>;
  /** 기다리는 저장을 보내고, 저장되지 않은 것이 남았으면 거짓 - 보고를 떠나기 전에 부른다 */
  settle(): Promise<boolean>;
  /** 기다리는 저장을 보낸다(로그아웃 전에) */
  flush(): Promise<void>;
  /** 표 확인부터 다시 읽는다 */
  retry(): Promise<void>;
}

/* ── 한도 - SQL 의 check 보다 조금 낮게 ───────────────────── */

export const LIMITS = {
  /** 프로젝트 이름 */
  name: 40,
  /** 프로젝트 줄의 칸 하나 */
  cell: 3000,
  /** 한 사람 보고의 프로젝트 줄 수 */
  rows: 20,
  /** 프로젝트 줄 전체(JSON 글자 수) - DB 는 20000 */
  json: 16000,
  blocker: 4000,
  summary: 2000,
  issues: 4000,
  feedback: 4000,
  team: 8000,
} as const;

export const limitText = (len: number, max: number) => `${max}자까지 입력할 수 있습니다. 현재 ${len}자입니다.`;

function checkText(v: string | undefined, max: number): string | null {
  return v !== undefined && v.length > max ? limitText(v.length, max) : null;
}

function checkProjects(list: readonly (DailyProject | WeeklyProject)[] | undefined, fields: readonly string[]): string | null {
  if (!list) return null;
  if (list.length > LIMITS.rows) return `프로젝트 줄은 ${LIMITS.rows}개까지 둘 수 있습니다.`;
  for (const p of list) {
    if (p.project.length > LIMITS.name) return `프로젝트 이름은 ${limitText(p.project.length, LIMITS.name)}`;
    for (const f of fields) {
      const v = (p as unknown as Record<string, unknown>)[f];
      if (typeof v === 'string' && v.length > LIMITS.cell) return limitText(v.length, LIMITS.cell);
    }
  }
  if (JSON.stringify(list).length > LIMITS.json) return '한 사람의 보고가 너무 깁니다. 긴 줄을 줄이거나 나눠 주세요.';
  return null;
}

export const checkDaily = (p: DailyPatch) =>
  checkProjects(p.projects, ['done', 'plan']) ?? checkText(p.blocker, LIMITS.blocker);

export const checkWeekly = (p: WeeklyPatch) =>
  checkProjects(p.projects, ['done', 'doing', 'next'])
  ?? checkText(p.summary, LIMITS.summary) ?? checkText(p.issues, LIMITS.issues) ?? checkText(p.feedback, LIMITS.feedback);

/* ── 공통 규칙 ─────────────────────────────────────────── */

export const dailyId = (day: string, person: string) => `${day}:${person}`;
export const weeklyId = (week: string, person: string) => `${week}:${person}`;

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

/** 프로젝트 줄 id - 한 사람의 보고 안에서만 겹치지 않으면 된다 */
export const newRowId = () => Math.random().toString(36).slice(2, 10);

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const rec = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';

/** DB · 저장본의 프로젝트 줄 - 모양이 어긋난 줄은 버린다 */
export function parseDailyProjects(v: unknown): DailyProject[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((x, i) => (rec(x) ? [{ id: str(x.id) || `p${i}`, project: str(x.project), done: str(x.done), plan: str(x.plan) }] : []));
}

export function parseWeeklyProjects(v: unknown): WeeklyProject[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((x, i) => (rec(x)
    ? [{ id: str(x.id) || `p${i}`, project: str(x.project), done: str(x.done), doing: str(x.doing), next: str(x.next) }]
    : []));
}

/** 그 보고의 프로젝트 줄 - 2026-11-16 판의 완료 · 예정 글만 있으면 이름 없는 한 줄로 */
export function dailyProjects(e: DailyEntry | undefined): DailyProject[] {
  if (!e) return [];
  if (e.projects.length) return e.projects;
  if (e.done.trim() || e.plan.trim()) return [{ id: 'legacy', project: '', done: e.done, plan: e.plan }];
  return [];
}

const filled = (s: string) => s.trim().length > 0;

/** 무엇이라도 적었는가(프로젝트 이름만 적은 줄은 빼고) */
export const isDailyFilled = (e: DailyEntry | undefined) =>
  !!e && (dailyProjects(e).some((p) => filled(p.done) || filled(p.plan)) || filled(e.blocker));

export const isWeeklyFilled = (e: WeeklyEntry | undefined) =>
  !!e && (filled(e.summary) || filled(e.issues) || e.projects.some((p) => filled(p.done) || filled(p.doing) || filled(p.next)));

/** 프로젝트 이름 견주기 - 대소문자 · 띄어쓰기만 무시한다 */
export const projectKey = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export const projectLabel = (s: string) => s.trim() || '기타';

/* ── 칸 글 읽기 ───────────────────────────────────────── */

export type DurUnit = '일' | '일차' | '시간';
export interface Dur { n: number; unit: DurUnit; approx: boolean }

export interface Line {
  /** 0 = 맨 위 단계 */
  depth: number;
  /** 머리표 · 소요기간을 뗀 글 */
  text: string;
  /** '→' 로 시작하는 덧붙이는 말 */
  note: boolean;
  dur: Dur | null;
  /** 적은 그대로(들여쓰기 포함) */
  raw: string;
}

const ARROW = /^(?:->|=>|→|⇒)\s*/;
/** '-' 는 숫자(-1일) · 화살표(->) 앞이 아닐 때만, '*' 는 뒤에 공백이 있을 때만(**굵게** 와 가른다) 머리표로 본다 */
const BULLET = /^(?:[•·▪◦‣■□▶▷]\s*|\*\s+|-(?![\d>])\s*|\d{1,2}[.)]\s+)/;
/** 편집 칸이 줄을 읽을 때도 같은 머리표 규칙 */
export const stripBullet = (s: string) => s.replace(BULLET, '');
const DUR_RE = /\s*([·•\-~(])\s*(~?)\s*(\d+(?:\.\d+)?)\s*(일차|일|시간)\s*\)?\s*$/;

/** 줄 끝의 소요기간을 뗀다 - 구분 글자(· - ~ 괄호) 없이 끝나는 '2일'(날짜일 수 있다)은 보지 않는다 */
export function splitDur(text: string): { body: string; dur: Dur | null } {
  const m = DUR_RE.exec(text);
  if (!m || m.index === 0) return { body: text, dur: null };
  return {
    body: text.slice(0, m.index).trimEnd(),
    dur: { n: Number(m[3]), unit: m[4] as DurUnit, approx: m[1] === '~' || m[2] === '~' },
  };
}

const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));
export const durLabel = (d: Dur) => `${d.approx ? '~' : ''}${fmtNum(d.n)}${d.unit}`;

export function parseLines(text: string): Line[] {
  const out: Line[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    const lead = /^[ \t　]*/.exec(raw)?.[0] ?? '';
    let width = 0;
    for (const c of lead) width += c === ' ' ? 1 : 2;
    const depth = Math.min(4, Math.floor(width / 2));
    let rest = raw.slice(lead.length).trimEnd();
    const note = ARROW.test(rest);
    rest = note ? rest.replace(ARROW, '') : rest.replace(BULLET, '');
    const { body, dur } = splitDur(rest);
    out.push({ depth, text: body, note, dur, raw: raw.replace(/\s+$/, '') });
  }
  return out;
}

/** 같은 일인지 견주는 열쇠 - 소요기간 · 머리표 · 띄어쓰기 · 문장부호 · 글꼴 표시(**)를 무시한다 */
export const itemKey = (text: string) =>
  splitDur(plainOf(text.trim().replace(BULLET, ''))).body.toLowerCase().replace(/[\s·•.,:;!?'"`~\-–—()[\]{}*]+/g, ' ').trim();

/* ── 줄 안의 글꼴 - 편집 칸(Confluence 처럼 쓰기)이 저장하는 짧은 표시 ───────────
   **굵게** · *기울임* · ~~취소선~~ · `코드` · [글](https://주소). 줄 · 들여쓰기 약속은 위와 같다 */

export interface Span { text: string; bold?: boolean; italic?: boolean; strike?: boolean; code?: boolean; href?: string }

const MARK_RE = /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+?)\*\*|~~([^~\n]+?)~~|(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\*)/g;

/** 한 줄을 글꼴 조각으로 - 굵게 · 취소선 · 기울임 안의 글꼴은 겹쳐 붙인다 */
export function spansOf(text: string, base: Omit<Span, 'text'> = {}): Span[] {
  const out: Span[] = [];
  let at = 0;
  const push = (t: string, extra: Omit<Span, 'text'> = {}) => { if (t) out.push({ ...base, ...extra, text: t }); };
  for (const m of text.matchAll(MARK_RE)) {
    const pre = m[6] ?? '';
    const start = (m.index ?? 0) + pre.length;
    push(text.slice(at, start));
    if (m[1] !== undefined) push(m[1], { code: true });
    else if (m[2] !== undefined) push(m[2], { href: m[3] });
    else if (m[4] !== undefined) out.push(...spansOf(m[4], { ...base, bold: true }));
    else if (m[5] !== undefined) out.push(...spansOf(m[5], { ...base, strike: true }));
    else if (m[7] !== undefined) out.push(...spansOf(m[7], { ...base, italic: true }));
    at = (m.index ?? 0) + m[0].length;
  }
  push(text.slice(at));
  return out;
}

/** 글꼴 표시를 뗀 글 - 메신저 · 메일로 복사할 때, 같은 일 견주기 */
export const plainOf = (text: string) =>
  spansOf(text).map((s) => (s.href && s.href !== s.text ? `${s.text} (${s.href})` : s.text)).join('');

/** 맨 위 단계 줄 하나와 그 밑의 하위 줄 */
export interface Block { key: string; head: Line; lines: string[] }

export function blocksOf(text: string): Block[] {
  const out: Block[] = [];
  for (const l of parseLines(text)) {
    const last = out[out.length - 1];
    if (last && (l.depth > 0 || l.note)) last.lines.push(l.raw);
    else out.push({ key: itemKey(l.text), head: l, lines: [l.raw] });
  }
  return out;
}

/** 덩이를 칸 끝에 붙인다 - 같은 일(열쇠)이 이미 있으면 건너뛴다 */
export function appendBlocks(text: string, blocks: Block[]): { text: string; added: number } {
  const have = new Set(blocksOf(text).map((b) => b.key));
  const fresh: Block[] = [];
  for (const b of blocks) {
    if (!b.key || have.has(b.key)) continue;
    have.add(b.key);
    fresh.push(b);
  }
  if (!fresh.length) return { text, added: 0 };
  const base = text.replace(/\s+$/, '');
  return { text: `${base}${base ? '\n' : ''}${fresh.map((b) => b.lines.join('\n')).join('\n')}`, added: fresh.length };
}

/** 프로젝트 줄에 덩이를 넣는다 - 같은 이름의 줄이 없으면 맨 아래에 만든다 */
export function addBlocksTo<T extends { id: string; project: string }>(
  list: T[], project: string, field: keyof T & string, blocks: Block[], blank: (project: string) => T,
): { list: T[]; added: number } {
  const k = projectKey(project);
  const i = list.findIndex((p) => projectKey(p.project) === k);
  const cur = i >= 0 ? list[i] : blank(project.trim());
  const was = (cur as unknown as Record<string, unknown>)[field];
  const r = appendBlocks(typeof was === 'string' ? was : '', blocks);
  if (!r.added) return { list, added: 0 };
  const next = { ...cur, [field]: r.text } as T;
  return { list: i >= 0 ? list.map((p, j) => (j === i ? next : p)) : [...list, next], added: r.added };
}

export const blankDaily = (project = ''): DailyProject => ({ id: newRowId(), project, done: '', plan: '' });
export const blankWeekly = (project = ''): WeeklyProject => ({ id: newRowId(), project, done: '', doing: '', next: '' });

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
 * 예: 2026-11-16 주 → 목요일 11-19 → 11월 3주차 (Confluence 의 '11월 3주차 주간 보고 (11/16~11/20)' 와 같다)
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

/** 그 사람이 그날 전에 마지막으로 적은 보고(예정이 있는 것) - 2주 안에서만 찾는다 */
export function previousDaily(daily: DailyEntry[], person: string, day: string): DailyEntry | null {
  const from = addDays(day, -14);
  let best: DailyEntry | null = null;
  for (const e of daily) {
    if (e.person !== person || e.day >= day || e.day < from) continue;
    if (!dailyProjects(e).some((p) => filled(p.plan))) continue;
    if (!best || e.day > best.day) best = e;
  }
  return best;
}

/** 그 사람이 그날 전에 마지막으로 적은 보고(무엇이라도 적은 것) - 회의 모드의 전일 보고. 2주 안에서만 찾는다 */
export function lastDailyBefore(daily: DailyEntry[], person: string, day: string): DailyEntry | null {
  const from = addDays(day, -14);
  let best: DailyEntry | null = null;
  for (const e of daily) {
    if (e.person !== person || e.day >= day || e.day < from || !isDailyFilled(e)) continue;
    if (!best || e.day > best.day) best = e;
  }
  return best;
}

/* ── 주간 초안 - 그 주의 스크럼을 프로젝트별로 모은다 ────────────
   Confluence 작성법 그대로: 완료는 프로젝트별로 모으고 같은 일이 여러 날 나오면 한 줄로 합쳐 소요기간을 더한다.
   진행 중은 그 주 마지막 스크럼의 예정 가운데 끝나지 않은 것, 다음 주 계획은 예정이었지만 완료 기록이 없던 나머지 */

function sumDurs(durs: Dur[]): Dur | null {
  if (!durs.length) return null;
  const unit = durs[durs.length - 1].unit;
  if (unit === '일차' || durs.some((d) => d.unit !== unit)) return durs[durs.length - 1];
  return { n: durs.reduce((s, d) => s + d.n, 0), unit, approx: durs.some((d) => d.approx) };
}

/** 예정 덩이가 이미 끝낸 일인가 - 열쇠가 같거나, 긴 쪽이 짧은 쪽을 품는다(짧은 쪽 6글자 이상) */
function matchesAny(key: string, keys: Iterable<string>): boolean {
  for (const k of keys) {
    if (k === key) return true;
    const [short, long] = k.length < key.length ? [k, key] : [key, k];
    if (short.length >= 6 && long.includes(short)) return true;
  }
  return false;
}

export interface WeeklyDraft {
  projects: WeeklyProject[];
  /** 모은 스크럼의 날 */
  days: string[];
  /** 넣을 덩이 수 */
  count: number;
}

export function weeklyDraft(daily: DailyEntry[], person: string, week: string): WeeklyDraft {
  const end = addDays(week, 6);
  const mine = daily
    .filter((e) => e.person === person && e.day >= week && e.day <= end && isDailyFilled(e))
    .sort((a, b) => a.day.localeCompare(b.day));
  type Done = { head: Line; lines: string[]; durs: Dur[] };
  type Acc = { name: string; done: Map<string, Done>; doing: Block[]; later: Block[] };
  const acc = new Map<string, Acc>();
  const get = (name: string) => {
    const k = projectKey(name);
    let a = acc.get(k);
    if (!a) {
      a = { name: name.trim(), done: new Map(), doing: [], later: [] };
      acc.set(k, a);
    }
    return a;
  };
  for (const e of mine) {
    for (const p of dailyProjects(e)) {
      for (const b of blocksOf(p.done)) {
        if (!b.key) continue;
        const a = get(p.project);
        const d = a.done.get(b.key);
        if (!d) {
          a.done.set(b.key, { head: b.head, lines: [...b.lines], durs: b.head.dur ? [b.head.dur] : [] });
          continue;
        }
        if (b.head.dur) d.durs.push(b.head.dur);
        for (const l of b.lines.slice(1)) if (!d.lines.includes(l)) d.lines.push(l);
      }
    }
  }
  const last = mine.length ? mine[mine.length - 1] : null;
  for (const e of mine) {
    for (const p of dailyProjects(e)) {
      for (const b of blocksOf(p.plan)) {
        if (!b.key) continue;
        const a = get(p.project);
        if (matchesAny(b.key, a.done.keys())) continue;
        const into = e === last ? a.doing : a.later;
        if (!into.some((x) => x.key === b.key)) into.push(b);
      }
    }
  }
  let count = 0;
  const projects: WeeklyProject[] = [];
  for (const a of acc.values()) {
    const done = [...a.done.values()].map((d) => {
      if (d.durs.length < 2) return d.lines.join('\n');
      const sum = sumDurs(d.durs);
      const head = `${d.head.text}${sum ? ` · ${durLabel(sum)}` : ''}`;
      return [head, ...d.lines.slice(1)].join('\n');
    });
    const doing = a.doing.map((b) => b.lines.join('\n'));
    const next = a.later.filter((b) => !a.doing.some((x) => x.key === b.key)).map((b) => b.lines.join('\n'));
    if (!done.length && !doing.length && !next.length) continue;
    count += done.length + doing.length + next.length;
    projects.push({ id: newRowId(), project: a.name, done: done.join('\n'), doing: doing.join('\n'), next: next.join('\n') });
  }
  return { projects, days: mine.map((e) => e.day), count };
}

/** 초안을 지금 주간보고에 더한다 - 이미 적은 줄은 건너뛴다 */
export function mergeWeekly(cur: WeeklyProject[], draft: WeeklyProject[]): { list: WeeklyProject[]; added: number } {
  let list = cur;
  let added = 0;
  for (const d of draft) {
    for (const f of ['done', 'doing', 'next'] as const) {
      const r = addBlocksTo(list, d.project, f, blocksOf(d[f]), blankWeekly);
      list = r.list;
      added += r.added;
    }
  }
  return { list, added };
}

/* ── 고르기 도움 ─────────────────────────────────────── */

/** 최근(45일) 보고에 나온 프로젝트 이름 - 자주 쓴 것부터 */
export function projectNames(daily: DailyEntry[], weekly: WeeklyEntry[], today: string): string[] {
  const from = addDays(today, -45);
  const count = new Map<string, { name: string; n: number; at: string }>();
  const add = (name: string, at: string) => {
    const n = name.trim();
    if (!n) return;
    const k = projectKey(n);
    const c = count.get(k);
    if (!c) count.set(k, { name: n, n: 1, at });
    else {
      c.n += 1;
      if (at > c.at) {
        c.at = at;
        c.name = n;
      }
    }
  };
  for (const e of daily) if (e.day >= from) for (const p of e.projects) add(p.project, e.day);
  for (const e of weekly) if (e.week >= from) for (const p of e.projects) add(p.project, e.week);
  return [...count.values()].sort((a, b) => b.n - a.n || b.at.localeCompare(a.at)).map((c) => c.name);
}

/** 보고 글에 붙여 넣은 Jira 주소에서 사이트를 배운다 - 번호만 적은 줄(JM-7)도 그곳으로 잇는다 */
export function jiraBaseOf(texts: Iterable<string>): string | null {
  const re = /https:\/\/([a-z0-9-]+)\.atlassian\.net\/browse\//i;
  for (const t of texts) {
    const m = re.exec(t);
    if (m) return `https://${m[1].toLowerCase()}.atlassian.net`;
  }
  return null;
}

/* ── 글로 옮기기(메신저 · 메일 · Confluence 에 붙여 넣기) ──────── */

/** '- 프로젝트: 한 일 · 1일' 꼴 - 하위 줄은 네 칸씩 더 들인다 */
function linesFor(project: string, text: string, indent: string): string[] {
  const name = project.trim();
  return parseLines(text).map((l) => {
    const body = `${l.note ? '→ ' : ''}${plainOf(l.text)}${l.dur ? ` · ${durLabel(l.dur)}` : ''}`;
    if (l.depth === 0 && !l.note) return `${indent}- ${name ? `${name}: ` : ''}${body}`;
    return `${indent}${'    '.repeat(Math.max(1, l.depth))}${body}`;
  });
}

/** 제목 줄과 그 밑의 줄 - 줄은 제목보다 두 칸 더 들인다 */
function section(out: string[], title: string, projects: { project: string; text: string }[]) {
  const pad = `${/^ */.exec(title)?.[0] ?? ''}  `;
  const lines = projects.flatMap((p) => linesFor(p.project, p.text, pad));
  out.push(title, ...(lines.length ? lines : [`${pad}(없음)`]));
}

export function dailyText(day: string, rows: { name: string; entry: DailyEntry | undefined }[]): string {
  const written = rows.filter((r) => isDailyFilled(r.entry)).length;
  const out = [`[MATE 스크럼] ${dayLabel(day, true)} · 작성 ${written}/${rows.length}명`];
  rows.forEach((r, i) => {
    out.push('', `${i + 1}. ${r.name}`);
    const e = r.entry;
    if (!e || !isDailyFilled(e)) {
      out.push('  (미작성)');
      return;
    }
    const ps = dailyProjects(e);
    section(out, '  완료', ps.map((p) => ({ project: p.project, text: p.done })));
    section(out, '  예정', ps.map((p) => ({ project: p.project, text: p.plan })));
    if (e.blocker.trim()) section(out, '  블로커 / 공유사항', [{ project: '', text: e.blocker }]);
  });
  return out.join('\n');
}

export function weeklyText(week: string, team: WeeklyTeam | undefined, rows: { name: string; entry: WeeklyEntry | undefined }[]): string {
  const w = weekLabel(week);
  const written = rows.filter((r) => isWeeklyFilled(r.entry)).length;
  const out = [`[MATE 주간보고] ${w.year}년 ${w.text} (${w.range}) · 작성 ${written}/${rows.length}명`];
  out.push('', '[팀 요약]', team?.summary.trim() || '(미작성)');
  rows.forEach((r, i) => {
    out.push('', `${i + 1}. ${r.name}`);
    const e = r.entry;
    if (!e || !isWeeklyFilled(e)) {
      out.push('  (미작성)');
      return;
    }
    out.push(`  요약: ${e.summary.trim().replace(/\n+/g, ' / ') || '(없음)'}`);
    for (const p of e.projects) {
      if (!filled(p.done) && !filled(p.doing) && !filled(p.next)) continue;
      out.push(`  [${projectLabel(p.project)}]`);
      if (filled(p.done)) section(out, '    완료', [{ project: '', text: p.done }]);
      if (filled(p.doing)) section(out, '    진행 중', [{ project: '', text: p.doing }]);
      if (filled(p.next)) section(out, '    다음 주 계획', [{ project: '', text: p.next }]);
    }
    if (e.issues.trim()) section(out, '  이슈 / 요청 사항', [{ project: '', text: e.issues }]);
    if (e.feedback.trim()) section(out, '  PM 피드백', [{ project: '', text: e.feedback }]);
  });
  return out.join('\n');
}

/* ── 브라우저 저장 모드 ───────────────────────────────────── */

const KEY = 'mate.taskmanager.reports.v1';

type Saved = { people: ReportPerson[]; daily: DailyEntry[]; weekly: WeeklyEntry[]; teams: WeeklyTeam[] };

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const has = (o: unknown): o is Record<string, unknown> => rec(o) && typeof o.id === 'string';

/** 마지막으로 고친 사람 · 시각 */
const stampOf = (me: string) => ({ updatedBy: me, updatedAt: new Date().toISOString() });

/** 처음 명단 - 이 모드의 팀원(자리표시 계정) 모두. Supabase 모드는 서버가 승인된 팀원으로 채운다 */
function defaultPeople(): ReportPerson[] {
  return MEMBERS.map((m, i) => ({ id: `rp-${m.id}`, name: m.name, member: m.id, order: (i + 1) * 1000, hidden: false }));
}

/**
 * 저장본 - 모양이 어긋난 줄은 버린다. 명단을 한 번도 고치지 않았으면 처음 명단.
 * 1판의 주간 장(weekly · summary)은 팀 요약으로 읽는다 - 1판 프로젝트 줄은 2판 화면이 쓰지 않는다
 */
function parse(raw: string | null): Saved {
  const v: unknown = raw ? JSON.parse(raw) : null;
  const o = rec(v) ? v : {};
  const arr = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]).filter(has) : null);
  const people = arr('people');
  const now = new Date().toISOString();
  const by = (x: Record<string, unknown>) => (typeof x.updatedBy === 'string' ? x.updatedBy : null);
  return {
    people: people
      ? people.flatMap((p) => (str(p.name).trim()
        ? [{ id: p.id as string, name: str(p.name), member: typeof p.member === 'string' ? p.member : null, order: num(p.order, 0), hidden: p.hidden === true }]
        : []))
      : defaultPeople(),
    daily: (arr('daily') ?? []).flatMap((e) => (isDay(str(e.day)) && str(e.person)
      ? [{
        id: e.id as string, day: str(e.day), person: str(e.person), name: str(e.name),
        projects: parseDailyProjects(e.projects), done: str(e.done), plan: str(e.plan), blocker: str(e.blocker),
        updatedBy: by(e), updatedAt: str(e.updatedAt) || now,
      }]
      : [])),
    weekly: (arr('entries') ?? []).flatMap((e) => (isDay(str(e.week)) && str(e.person)
      ? [{
        id: e.id as string, week: str(e.week), person: str(e.person), name: str(e.name),
        summary: str(e.summary), projects: parseWeeklyProjects(e.projects), issues: str(e.issues), feedback: str(e.feedback),
        updatedBy: by(e), updatedAt: str(e.updatedAt) || now,
      }]
      : [])),
    teams: (arr('weekly') ?? []).map((w) => ({
      id: w.id as string, summary: str(w.summary), status: w.status === 'final' ? 'final' as const : 'draft' as const,
      updatedBy: by(w), updatedAt: str(w.updatedAt) || now,
    })),
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
    const { people, daily, weekly, teams } = data;
    window.localStorage.setItem(KEY, JSON.stringify({ people, daily, entries: weekly, weekly: teams }));
    return true;
  } catch {
    return false;
  }
}

export const TEAM_LOCKED = '예전 판에서 확정한 주라 팀 요약을 고칠 수 없습니다. 다시 고치기를 먼저 눌러 주세요.';

/** 1판 글을 2판 프로젝트 줄로 옮길 때 비운다 */
export function legacyClear(cur: DailyEntry | undefined, patch: DailyPatch): Partial<DailyEntry> {
  return patch.projects !== undefined && cur && (cur.done || cur.plan) ? { done: '', plan: '' } : {};
}

/** 브라우저 저장 모드 - 계정이 없어 누구나 명단을 고친다 */
export function useReportStore(opts: ReportStoreOptions): ReportStore {
  const [data, setData] = useState<Saved>(() => ({ people: defaultPeople(), daily: [], weekly: [], teams: [] }));
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

  /** 바꾸고 쓴다. 쓰지 못했으면 화면의 글은 두고 saveError 를 세운다 */
  const commit = useCallback((fn: (cur: Saved) => Saved) => {
    const next = fn(live.current);
    live.current = next;
    setData(next);
    const ok = write(next);
    setSaveError(!ok);
    return ok;
  }, []);

  const fail = useCallback((text: string) => {
    onError.current?.(text);
    return false;
  }, []);

  const addPerson = useCallback<ReportStore['addPerson']>((name, member = null) => {
    const p: ReportPerson = { id: crypto.randomUUID(), name, member, order: nextPersonOrder(live.current.people), hidden: false };
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
    const err = checkDaily(patch);
    if (err) return fail(err);
    const id = dailyId(day, person.id);
    commit((cur) => {
      const was = cur.daily.find((e) => e.id === id);
      const next: DailyEntry = was
        ? { ...was, ...patch, ...legacyClear(was, patch), ...stampOf(me.current) }
        : { id, day, person: person.id, name: person.name, projects: [], done: '', plan: '', blocker: '', ...patch, ...stampOf(me.current) };
      return { ...cur, daily: was ? cur.daily.map((e) => (e.id === id ? next : e)) : [...cur.daily, next] };
    });
    return true;
  }, [commit, fail]);

  const setWeekly = useCallback<ReportStore['setWeekly']>((week, person, patch) => {
    const err = checkWeekly(patch);
    if (err) return fail(err);
    const id = weeklyId(week, person.id);
    commit((cur) => {
      const was = cur.weekly.find((e) => e.id === id);
      const next: WeeklyEntry = was
        ? { ...was, ...patch, ...stampOf(me.current) }
        : {
          id, week, person: person.id, name: person.name, summary: '', projects: [], issues: '', feedback: '',
          ...patch, ...stampOf(me.current),
        };
      return { ...cur, weekly: was ? cur.weekly.map((e) => (e.id === id ? next : e)) : [...cur.weekly, next] };
    });
    return true;
  }, [commit, fail]);

  const setTeam = useCallback<ReportStore['setTeam']>((week, summary) => {
    if (live.current.teams.find((t) => t.id === week)?.status === 'final') return fail(TEAM_LOCKED);
    const err = checkText(summary, LIMITS.team);
    if (err) return fail(err);
    commit((cur) => {
      const was = cur.teams.find((t) => t.id === week);
      const next: WeeklyTeam = { id: week, status: 'draft', ...was, summary, ...stampOf(me.current) };
      return { ...cur, teams: was ? cur.teams.map((t) => (t.id === week ? next : t)) : [...cur.teams, next] };
    });
    return true;
  }, [commit, fail]);

  const reopenTeam = useCallback<ReportStore['reopenTeam']>(async (week) => {
    const ok = commit((cur) => ({ ...cur, teams: cur.teams.map((t) => (t.id === week ? { ...t, status: 'draft' as const } : t)) }));
    return ok ? { ok: true } : { ok: false, error: '이 브라우저에 저장하지 못했습니다.' };
  }, [commit]);

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
    ready, missing: false, people, daily: data.daily, weekly: data.weekly, teams: data.teams,
    sync: saveError ? 'error' : 'idle', loadError: null, saveError,
    addPerson, updatePerson, removePerson, setDaily, setWeekly, setTeam, reopenTeam, settle, flush, retry,
  };
}
