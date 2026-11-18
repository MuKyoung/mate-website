'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { isRemote } from './supabase';
import { useRemoteReportStore } from './reportRemote';
import {
  LIMITS, addBlocksTo, addDays, blankDaily, blankWeekly, blocksOf, dailyProjects, dailyText, dayLabel, isDailyFilled, isDay,
  isWeeklyFilled, jiraBaseOf, lastDailyBefore, memberOfPerson, mergeWeekly, nextPersonOrder, previousDaily, projectKey, projectLabel, projectNames, reorderPeople,
  stepWorkday, useReportStore, weekLabel, weekOf, weeklyDraft, weeklyText, whenOf, workdaysOf,
  type Block, type ReportStore, type ReportStoreOptions,
} from './reportStore';
import {
  CellText, MeetingView, PersonMark, ProjectsEditor, ProjectsView, RenderProvider, useRenderEnv,
  type Col, type MeetingItem, type RenderEnv,
} from './reportParts';
import { localToday, type DailyEntry, type DailyProject, type Member, type ReportPerson, type Task, type WeeklyEntry, type WeeklyProject } from './types';
import { useMembers } from './members';
import { RichCell } from './reportEditor';
import { CommitInput } from './DomainDialog';
import {
  IconArrow, IconPlus, Modal, PageHead, useConfirm,
  tmBtn, tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtn, tmSelect, tmTab, tmTextBtn,
} from './ui';

/*
 * 일간보고(스크럼) · 주간보고 - 2026-11-17 2판. 팀이 Confluence 에서 쓰던 양식을 그대로 따르고 손이 덜 가게 만든다.
 *
 * 일간: 위에 '내 스크럼'(내 칸을 바로 쓰는 표), 아래에 명단 순서대로 팀 스크럼.
 *   사람마다 프로젝트 줄(완료 · 예정)과 블로커 · 공유사항. 지난 예정을 골라 완료 · 오늘 예정으로 옮긴다.
 *   페이지를 따로 만들 일이 없다 - 날짜만 고르면 그날 보고다. 회의 모드로 한 사람씩 크게 띄운다.
 * 주간: 위에 PM 의 팀 요약과 팀원 요약 모음, '내 주간보고'(요약 · 프로젝트 표 완료 · 진행 중 · 다음 주 계획 · 이슈),
 *   아래에 팀 주간보고와 PM 피드백. 그 주 스크럼을 프로젝트별로 모아 한 번에 채운다(같은 일은 합치고 소요기간을 더한다).
 *
 * 보고를 떠날 때(다른 메뉴 · 단축키 · 작업 열기 · 홈페이지 · 로그아웃)는 기다리는 저장을 보내고, 아직 저장되지 않은 것이
 * 남았으면 이 화면을 그대로 두고 묻는다(Workspace 가 leaveRef 를 부른다).
 */

export type ReportKind = 'daily' | 'weekly';

/** 빌드마다 하나로 정해지므로 렌더 사이에 훅 순서가 바뀌지 않는다 */
const useReports: (opts: ReportStoreOptions) => ReportStore = isRemote ? useRemoteReportStore : useReportStore;

/** 보고 단축키(S · W)를 끈 사람 - Workspace 의 단축키도 이 값을 읽는다 */
export const REPORT_KEYS_KEY = 'mate.taskmanager.reportKeys.v1';
/** 명단과 계정이 이어지지 않았을 때 이 브라우저에서 고른 '나' */
const MINE_KEY = 'mate.taskmanager.reports.mine.v1';
/** 회의 모드에서 전일 보고를 함께 보는가 */
const MEETING_SIDE_KEY = 'mate.taskmanager.reports.meetingSide.v1';
const ON_OFF = ['on', 'off'] as const;

/**
 * 날짜 · 작성 현황 줄 아래의 스크롤 칸. 넓은 화면의 Hub 셸은 본문을 화면 높이에 가두므로 화면마다 제 스크롤 칸이 있어야 한다.
 * 좁은 화면 · 낮은 화면은 셸(.tm-page)이 통째로 스크롤하므로 풀어 둔다(globals.css). 카드 테두리 · 초점 고리가 잘리지 않게 좌우 4px 여유
 */
const scrollBox =
  '-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pt-0.5 max-[900px]:flex-none max-[900px]:overflow-visible '
  + '[@media(max-height:500px)]:flex-none [@media(max-height:500px)]:overflow-visible';

const DAILY_COLS: Col<DailyProject>[] = [
  { key: 'done', label: '완료', hint: '끝낸 일 · 어디까지 했는지 (줄 끝에 · 1일)' },
  { key: 'plan', label: '예정', hint: '오늘 할 일' },
];

const WEEKLY_COLS: Col<WeeklyProject>[] = [
  { key: 'done', label: '완료', hint: '이번 주 끝낸 일 · 소요기간' },
  { key: 'doing', label: '진행 중', hint: '금요일 기준 아직 끝나지 않은 일' },
  { key: 'next', label: '다음 주 계획', hint: '못 한 예정 · 새로 할 일' },
];

const WRITING_HELP =
  '한 줄에 한 가지씩 적습니다. Confluence 처럼 Enter 는 새 항목, Tab · Shift+Tab 은 하위로 · 위로, Ctrl+B · I 는 굵게 · 기울임. '
  + '/ 를 치면 작업을 찾아 넣습니다(내 작업 먼저, 담당자 이름으로도 찾기). 줄 끝의 · 1일은 소요기간, Jira · Hub 작업 번호는 링크로 보입니다.';

/** 오늘(YYYY-MM-DD) - 창으로 돌아올 때 날이 바뀌었으면 따라간다 */
function useTodayISO(): string {
  const [today, setToday] = useState(localToday);
  useEffect(() => {
    const check = () => { if (document.visibilityState === 'visible') setToday(localToday()); };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);
  return today;
}

/** 이 브라우저에 기억하는 고르기 - 저장이 막혀 있어도 화면은 돈다. allowed 가 없으면 아무 글이나 */
function useStoredChoice<T extends string>(key: string, initial: T, allowed?: readonly T[]): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null && (!allowed || (allowed as readonly string[]).includes(v))) setValue(v as T);
    } catch {
      /* 막힌 환경 */
    }
  }, [key, allowed]);
  const set = useCallback((v: T) => {
    setValue(v);
    try { window.localStorage.setItem(key, v); } catch { /* 막힌 환경 */ }
  }, [key]);
  return [value, set];
}

/** 요소의 지금 폭 - 메뉴를 접고 펴거나 창 크기를 바꾸면 다시 잰다 */
function useWidth(): [(el: HTMLElement | null) => void, number] {
  const [width, setWidth] = useState(0);
  const ro = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: HTMLElement | null) => {
    ro.current?.disconnect();
    ro.current = null;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    ro.current = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.current.observe(el);
  }, []);
  useEffect(() => () => ro.current?.disconnect(), []);
  return [ref, width];
}

/** 클립보드에 넣는다 - 막힌 환경(http · 권한)은 예전 방식으로 한 번 더, 그래도 안 되면 거짓 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 아래 예전 방식으로 */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * 요소가 든 가장 가까운 스크롤 칸만 움직여 요소를 보이게 한다. scrollIntoView 는 Hub 셸(body overflow hidden)까지
 * 밀어 올려 메뉴 · 머리가 화면 밖으로 밀린다
 */
function scrollWithin(el: HTMLElement, gap = 16) {
  let box = el.parentElement;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
  if (!box) return;
  const r = el.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  box.scrollTop += r.top - b.top - gap;
}

/** 보고의 글 칸 - Confluence 문서처럼 쓰는 편집 칸(목록 · 들여쓰기 · 글꼴 · '/' 작업 넣기) */
function TextField({ id, value, onChange, placeholder, label, rows = 1 }: {
  id: string; value: string; onChange(v: string): void; placeholder?: string; label: string; rows?: number;
}) {
  const env = useRenderEnv();
  return <RichCell id={id} value={value} onChange={onChange} placeholder={placeholder} label={label} env={env} minLines={rows} />;
}

/** 둘 중 하나를 고르는 알약 줄 */
function Seg<T extends string>({ label, value, options, onPick }: {
  label: string; value: T; options: readonly { id: T; label: string; title?: string }[]; onPick(v: T): void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-none items-center gap-1.5">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} title={o.title} onClick={() => onPick(o.id)} className={tmTab}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 날짜 고르기 - 보이는 것은 단추 모양 글이고, 위에 겹친 날짜 칸이 누름을 받는다(휴대폰은 기기 날짜 고르기) */
function DayPicker({ value, onPick, label, text }: { value: string; onPick(v: string): void; label: string; text: string }) {
  return (
    <span className="relative inline-flex rounded-tm-btn has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tm-blue">
      <span className={`${tmBtn} pointer-events-none min-w-[168px] px-4 tabular-nums max-[420px]:min-w-0 max-[420px]:px-3`} aria-hidden>{text}</span>
      <input type="date" value={value} required aria-label={label}
        onChange={(e) => { if (isDay(e.target.value)) onPick(e.target.value); }}
        onClick={(e) => {
          try {
            (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
          } catch {
            /* 고르기 창을 띄울 수 없는 브라우저 - 칸에 바로 친다 */
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
    </span>
  );
}

const messageCard =
  'flex flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-tm-card px-6 py-16 text-center shadow-tm';

/** 한 사람 칸 - 머리(동그라미 · 이름 · 작성 시각 · 단추)와 몸 */
function PersonCard({ id, person, member, mine, gone, meta, action, children, highlight }: {
  id: string;
  person: ReportPerson;
  member: Member | null;
  mine?: boolean;
  gone?: boolean;
  meta: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <article id={id} aria-label={person.name}
      className={`scroll-mt-4 rounded-tm border bg-tm-card shadow-tm ${highlight ? 'border-tm-blue ring-2 ring-tm-blue/15' : 'border-tm-line'}`}>
      <header className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3 max-[720px]:px-4 ${children ? 'border-b border-tm-line' : ''}`}>
        <PersonMark name={person.name} member={member} size={34} />
        <h3 className="text-[16.5px] font-extrabold text-tm-deep">{person.name}</h3>
        {mine && <span className="rounded-full bg-tm-tint px-2 py-px text-[12px] font-bold text-tm-deep">나</span>}
        {gone && <span className="rounded-full bg-tm-bg px-2 py-px text-[12px] font-bold text-tm-sub">명단에서 빠짐</span>}
        <p className="text-[13.5px] font-semibold text-tm-sub">{meta}</p>
        {action && <div className="ml-auto flex flex-wrap items-center gap-2">{action}</div>}
      </header>
      {children && <div className="px-5 py-4 text-[15px] max-[720px]:px-4">{children}</div>}
    </article>
  );
}

/** 블로커 · 공유사항 · 이슈처럼 눈에 띄어야 하는 글 */
function NoteBox({ title, text, tone = 'warn' }: { title: string; text: string; tone?: 'warn' | 'blue' }) {
  return (
    <div className={`mt-3 rounded-tm-sm border border-l-4 px-4 py-3 ${tone === 'warn' ? 'border-tm-line border-l-tm-warn bg-tm-warn-tint/60' : 'border-tm-line border-l-tm-blue bg-tm-tint/50'}`}>
      <p className="mb-1 text-[0.82em] font-extrabold text-tm-sub">{title}</p>
      <CellText text={text} />
    </div>
  );
}

/** 작성 현황 - 몇 명이 적었는지와 아직 적지 않은 사람(누르면 그 칸으로) */
function WriteStatus({ written, total, missing, onJump }: {
  written: number; total: number; missing: ReportPerson[]; onJump(p: ReportPerson): void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px]">
      <span className={`inline-flex h-7 items-center rounded-full px-3 font-bold tabular-nums ${written === total && total ? 'bg-tm-ok-tint text-tm-ok-deep' : 'bg-tm-tint text-tm-deep'}`}>
        작성 {written}/{total}
      </span>
      {missing.length > 0 && (
        <span className="flex min-w-0 flex-wrap items-center gap-x-1 font-semibold text-tm-sub">
          미작성
          {missing.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onJump(p)} className="font-bold text-tm-ink underline-offset-[3px] hover:text-tm-blue hover:underline">
              {p.name}{i < missing.length - 1 ? ',' : ''}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}

type RowData<E> = { person: ReportPerson; entry: E | undefined; gone: boolean };

/** 그날 · 그 주의 칸 - 명단 순서대로, 그 뒤에 명단에서 빠졌지만 적은 사람 */
function rowsOf<E extends { person: string; name: string }>(
  people: ReportPerson[], entries: E[], filled: (e: E | undefined) => boolean,
): RowData<E>[] {
  const byPerson = new Map(entries.map((e) => [e.person, e]));
  const ids = new Set(people.map((p) => p.id));
  return [
    ...people.map((p) => ({ person: p, entry: byPerson.get(p.id), gone: false })),
    ...entries
      .filter((e) => !ids.has(e.person) && filled(e))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      .map((e) => ({ person: { id: e.person, name: e.name || '이름 없음', member: null, order: Number.MAX_SAFE_INTEGER, hidden: false }, entry: e, gone: true })),
  ];
}

/** 작성 시각 · 대신 고친 사람 */
function metaOf(e: { updatedAt: string; updatedBy: string | null } | undefined, filled: boolean, today: string, member: Member | null,
  nameOf: (id: string | null) => string | null): string {
  if (!e || !filled) return '아직 적지 않음';
  const by = e.updatedBy && member && e.updatedBy !== member.id ? nameOf(e.updatedBy) : null;
  return `${whenOf(e.updatedAt, today)} 저장${by ? ` · ${by} 님이 고침` : ''}`;
}

export default function Reports({
  kind, onKind, me, canEditPeople, tasks, onTaskOpen, onNotice, flushRef, leaveRef,
}: {
  kind: ReportKind;
  onKind(k: ReportKind): void;
  /** 지금 쓰는 사람(Member.id) */
  me: string;
  /** 관리자(PM) - 명단 · 팀 요약 · 피드백을 고친다. Supabase 모드는 관리자만, 브라우저 저장 모드는 누구나 */
  canEditPeople: boolean;
  tasks: Task[];
  /** 작업을 연다(작업 화면으로 옮겨 오른쪽 창) */
  onTaskOpen(id: string): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  /** 로그아웃 전에 기다리는 저장을 보내도록 Workspace 가 부른다 */
  flushRef: React.MutableRefObject<(() => Promise<void>) | null>;
  /** 보고를 떠나기 전에 Workspace 가 부른다 - 저장되지 않은 것이 남았으면 묻고, 떠나도 되면 참 */
  leaveRef: React.MutableRefObject<(() => Promise<boolean>) | null>;
}) {
  const members = useMembers();
  const today = useTodayISO();
  const onError = useCallback((text: string) => onNotice(text, 'err'), [onNotice]);
  const store = useReports({ onError, me });
  const [day, setDay] = useState(today);
  const [week, setWeek] = useState(() => weekOf(today));
  const [rosterOpen, setRosterOpen] = useState(false);
  /** 클립보드가 막혔을 때 직접 고를 수 있게 보여 줄 글 */
  const [manualCopy, setManualCopy] = useState<{ title: string; text: string } | null>(null);
  const [retrying, setRetrying] = useState(false);
  /** 떠나려는데 저장되지 않은 것이 남았다 - 대답을 기다리는 쪽 */
  const [unsaved, setUnsaved] = useState<{ resolve(ok: boolean): void } | null>(null);
  const [checking, setChecking] = useState(false);
  const [keys, setKeys] = useStoredChoice(REPORT_KEYS_KEY, 'on', ON_OFF);
  const [mineChoice, setMineChoice] = useStoredChoice<string>(MINE_KEY, '');

  const nameOf = useCallback((id: string | null) => (id ? members.find((m) => m.id === id)?.name ?? null : null), [members]);
  const usable = store.ready && !store.missing && !store.loadError;

  /* 나 - 계정이 이어진 명단 사람, 없으면 이 브라우저에서 고른 사람 */
  /**
   * 보고에 뜨는 사람 - 관리자가 뺀 사람(hidden)은 빼고, 계정이 이어진 사람은 계정의 지금 이름으로.
   * 뺀 사람이 그날 적은 보고는 맨 아래 '명단에서 빠짐'으로 남는다
   */
  const people = useMemo(() => store.people.filter((p) => !p.hidden).map((p) => {
    const n = memberOfPerson(p, members)?.name.trim();
    return n && n !== p.name ? { ...p, name: n } : p;
  }), [store.people, members]);
  const linked = useMemo(() => people.find((p) => memberOfPerson(p, members)?.id === me) ?? null, [people, members, me]);
  const mine = linked ?? people.find((p) => p.id === mineChoice) ?? null;

  const names = useMemo(() => projectNames(store.daily, store.weekly, today), [store.daily, store.weekly, today]);
  const env = useMemo<RenderEnv>(() => {
    function* texts() {
      for (const e of store.daily) {
        for (const p of e.projects) {
          yield p.done;
          yield p.plan;
        }
        yield e.blocker;
      }
      for (const e of store.weekly) {
        for (const p of e.projects) {
          yield p.done;
          yield p.doing;
          yield p.next;
        }
        yield e.issues;
      }
    }
    return { tasks, members, me, jira: jiraBaseOf(texts()), onTask: onTaskOpen };
  }, [store.daily, store.weekly, tasks, members, me, onTaskOpen]);

  const { flush, settle } = store;
  useEffect(() => {
    flushRef.current = flush;
    return () => { flushRef.current = null; };
  }, [flush, flushRef]);

  /* 떠나기 전 확인 - 저장이 끝났으면 바로 참. 남았으면 이 화면을 두고 묻는다(다시 시도가 되면 그때 참) */
  const settleRef = useRef(settle);
  settleRef.current = settle;
  useEffect(() => {
    leaveRef.current = () => new Promise<boolean>((resolve) => {
      void (async () => {
        setChecking(true);
        const ok = await settleRef.current().catch(() => false);
        setChecking(false);
        if (ok) {
          resolve(true);
          return;
        }
        setUnsaved((prev) => {
          prev?.resolve(false);
          return { resolve };
        });
      })();
    });
    return () => { leaveRef.current = null; };
  }, [leaveRef]);

  /* 링크로 들어왔다(?view=daily&date= · ?view=weekly&week=) - 그 날 · 그 주를 열고 주소에서 지운다 */
  useEffect(() => {
    const url = new URL(window.location.href);
    const d = url.searchParams.get('date');
    const w = url.searchParams.get('week');
    if (isDay(d)) {
      setDay(d);
      setWeek(weekOf(d));
    }
    if (isDay(w)) setWeek(weekOf(w));
    if (!url.searchParams.has('date') && !url.searchParams.has('week')) return;
    url.searchParams.delete('date');
    url.searchParams.delete('week');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  const copy = async (title: string, text: string, done: string) => {
    if (await copyText(text)) onNotice(done, 'ok');
    else setManualCopy({ title, text });
  };

  const linkTo = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(params).toString();
    url.hash = '';
    return url.toString();
  };

  const dailyCopy = () => {
    const rows = rowsOf(people, store.daily.filter((e) => e.day === day), isDailyFilled)
      .filter((r) => !r.gone || isDailyFilled(r.entry));
    return dailyText(day, rows.map((r) => ({ name: r.gone ? `${r.person.name} (명단에서 빠짐)` : r.person.name, entry: r.entry })));
  };

  const weeklyCopy = () => {
    const rows = rowsOf(people, store.weekly.filter((e) => e.week === week), isWeeklyFilled)
      .filter((r) => !r.gone || isWeeklyFilled(r.entry));
    return weeklyText(week, store.teams.find((t) => t.id === week),
      rows.map((r) => ({ name: r.gone ? `${r.person.name} (명단에서 빠짐)` : r.person.name, entry: r.entry })));
  };

  const copyNow = () => (kind === 'daily'
    ? void copy('일간보고 글', dailyCopy(), `${dayLabel(day)} 스크럼을 글로 복사했습니다. 메신저나 메일에 붙여 넣으면 됩니다.`)
    : void copy('주간보고 글', weeklyCopy(), `${weekLabel(week).text} 주간보고를 글로 복사했습니다.`));

  const saved: { tone: 'ok' | 'busy' | 'warn'; text: string } = isRemote
    ? store.sync === 'error'
      ? { tone: 'warn', text: '저장하지 못한 변경이 있습니다' }
      : store.sync === 'saving'
        ? { tone: 'busy', text: '저장 중…' }
        : { tone: 'ok', text: '모두 저장됨 · 팀이 함께 봅니다' }
    : store.saveError
      ? { tone: 'warn', text: '이 브라우저에 저장하지 못했습니다' }
      : { tone: 'ok', text: '이 브라우저에만 저장됩니다' };

  const retryLoad = async () => {
    setRetrying(true);
    try {
      await store.retry();
    } finally {
      setRetrying(false);
    }
  };

  /* 떠나기 확인 창 - 다시 시도가 되면 원래 가려던 곳으로 */
  const stay = () => {
    unsaved?.resolve(false);
    setUnsaved(null);
  };
  const retryLeave = async () => {
    if (!unsaved) return;
    setChecking(true);
    const ok = await store.settle().catch(() => false);
    setChecking(false);
    if (ok) {
      unsaved.resolve(true);
      setUnsaved(null);
    } else {
      onNotice('아직 저장하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.', 'err');
    }
  };

  const head = (
    <PageHead
      title={kind === 'daily' ? '일간보고' : '주간보고'}
      lead={kind === 'daily'
        ? `회의 전에 내 스크럼을 채웁니다. 프로젝트별로 완료 · 예정을 적고, 블로커 · 공유사항은 없으면 비워 둡니다. ${isRemote ? '적는 대로 저장되고 팀 모두에게 바로 보입니다.' : '적는 대로 이 브라우저에 저장됩니다.'}`
        : '금요일 스크럼 전까지 내 주간보고를 채웁니다. 이번 주 스크럼을 프로젝트별로 모아 한 번에 채울 수 있습니다. PM 은 팀원 요약을 읽고 팀 요약을 적습니다.'}
      saved={usable ? saved : undefined}
    >
      {/* 좁은 화면: 일간 · 주간 알약은 다음 줄을 혼자 쓰고, 복사 단추는 제목 옆에 붙는다 */}
      <div className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 max-[720px]:order-1 max-[720px]:basis-full">
        <Seg label="보고 종류" value={kind} onPick={onKind} options={[
          { id: 'daily', label: '일간', title: keys === 'on' ? '일간보고 (S)' : '일간보고' },
          { id: 'weekly', label: '주간', title: keys === 'on' ? '주간보고 (W)' : '주간보고' },
        ]} />
        <button type="button" aria-pressed={keys === 'on'} onClick={() => setKeys(keys === 'on' ? 'off' : 'on')}
          title="S 는 일간보고, W 는 주간보고로 갑니다. 입력 중 · 창이 떠 있을 때는 듣지 않습니다"
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-tm-sub hover:text-tm-blue
                     max-[720px]:hidden [@media(pointer:coarse)]:min-h-11">
          <span aria-hidden className={`inline-block h-4 w-7 rounded-full p-0.5 transition-colors ${keys === 'on' ? 'bg-tm-blue' : 'bg-tm-edge'}`}>
            <span className={`block h-3 w-3 rounded-full bg-tm-card transition-transform ${keys === 'on' ? 'translate-x-3' : ''}`} />
          </span>
          단축키 S · W
        </button>
      </div>
      <button type="button" disabled={!usable} onClick={copyNow} className={`${tmBtn} max-[720px]:ml-auto max-[720px]:px-4`}>
        글로 복사
      </button>
    </PageHead>
  );

  /* 휴대폰: 쪽 머리의 저장 상태 알약이 숨으므로 짧은 한 줄로 */
  const phoneStatus = usable && (
    <p className="-mt-1 mb-3 flex items-center gap-2 text-[13px] font-semibold text-tm-sub min-[721px]:hidden">
      <i aria-hidden className={`h-2 w-2 flex-none rounded-full ${saved.tone === 'ok' ? 'bg-tm-ok' : saved.tone === 'busy' ? 'bg-tm-edge' : 'bg-tm-red'}`} />
      <span className={saved.tone === 'warn' ? 'text-tm-red-deep' : ''}>
        {isRemote
          ? store.sync === 'error' ? '저장하지 못한 변경이 있습니다' : store.sync === 'saving' ? '저장 중…' : '모두 저장됨'
          : store.saveError ? '이 브라우저에 저장하지 못했습니다' : '이 브라우저에만 저장'}
      </span>
    </p>
  );

  let body: React.ReactNode;
  if (!store.ready) {
    body = <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>;
  } else if (store.missing) {
    body = (
      <div role="alert" className={messageCard}>
        <p className="text-[20px] font-extrabold text-tm-deep">보고 기능 준비가 필요합니다</p>
        <p className="max-w-[52ch] text-[15.5px] leading-[1.7] text-tm-ink">관리자에게 문의해 주세요.</p>
        {canEditPeople && (
          <p className="max-w-[56ch] text-[14.5px] leading-[1.7] text-tm-sub">
            관리자: Supabase SQL Editor 에서 저장소의 supabase/taskmanager.sql 중 &lsquo;일간 · 주간보고&rsquo; 블록(끝의 2판 조각까지)을
            실행하면 열립니다. 이미 있는 데이터는 그대로 둡니다.
          </p>
        )}
        <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={`${tmBtn} mt-2`}>
          {retrying ? '확인 중…' : '다시 확인'}
        </button>
      </div>
    );
  } else if (store.loadError) {
    // 읽지 못한 보고를 빈 보고로 보이지 않는다 - 쓰기 · 복사를 막고 다시 읽게 한다
    body = (
      <div role="alert" className={messageCard}>
        <p className="text-[20px] font-extrabold text-tm-deep">보고를 불러오지 못했습니다</p>
        <p className="mb-3 max-w-[48ch] text-[15.5px] leading-[1.7] text-tm-ink">
          {store.loadError} 읽지 못한 동안에는 적기 · 복사를 막아 둡니다.
        </p>
        <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtnPrimary}>
          {retrying ? '다시 읽는 중…' : '다시 시도'}
        </button>
      </div>
    );
  } else {
    const common = {
      store, people, today, members, canAdmin: canEditPeople, mine, mineAuto: !!linked, onMine: setMineChoice, names, nameOf, onNotice,
      onRoster: () => setRosterOpen(true),
    };
    body = kind === 'daily' ? (
      <DailyView {...common} day={day} onDay={setDay}
        onCopyLink={() => void copy('일간보고 링크', linkTo({ view: 'daily', date: day }), `${dayLabel(day)} 스크럼 링크를 복사했습니다.`)} />
    ) : (
      <WeeklyView {...common} week={week} onWeek={setWeek} onOpenDay={(d) => { setDay(d); onKind('daily'); }}
        onCopyLink={() => void copy('주간보고 링크', linkTo({ view: 'weekly', week }), `${weekLabel(week).text} 주간보고 링크를 복사했습니다.`)} />
    );
  }

  return (
    <RenderProvider value={env}>
      {head}
      {phoneStatus}
      {/* 브라우저 저장 모드에서 쓰지 못했다 - 화면의 글은 그대로 두고 다시 저장 · 복사를 준다 */}
      {store.saveError && (
        <div role="alert" className={`${tmCallout} mb-3.5 flex-none border-l-tm-red`}>
          <p className="min-w-0 flex-[1_1_320px]">
            <b className="font-bold text-tm-red-deep">이 브라우저에 저장하지 못했습니다.</b> 저장이 막혀 있거나 공간이 모자랍니다.
            화면의 글은 그대로 있지만 새로고침하면 사라질 수 있습니다. 다시 저장하거나 글을 복사해 두세요.
          </p>
          <div className="flex flex-none gap-2">
            <button type="button" onClick={copyNow} className={tmGhostBtn}>글 복사</button>
            <button type="button" className={tmEditBtn}
              onClick={() => void store.settle().then((ok) => onNotice(ok ? '이 브라우저에 다시 저장했습니다.' : '아직 저장하지 못했습니다.', ok ? 'ok' : 'err'))}>
              다시 저장
            </button>
          </div>
        </div>
      )}
      {checking && !unsaved && (
        <p role="status" className="mb-2 flex-none text-[13.5px] font-semibold text-tm-sub">저장을 확인하는 중…</p>
      )}
      {body}
      {rosterOpen && canEditPeople && usable && (
        <RosterDialog store={store} members={members} local={!isRemote} onClose={() => setRosterOpen(false)} />
      )}
      {unsaved && (
        <Modal title="저장하지 못한 변경이 있습니다"
          sub={isRemote ? '연결 후 다시 시도해 주세요.' : '브라우저 저장을 확인한 뒤 다시 시도해 주세요.'} size="sm" busy={checking} onClose={stay}
          foot={
            <>
              <button type="button" onClick={copyNow} className={tmGhostBtn}>입력 글 복사</button>
              <span className="flex-1" />
              <button type="button" onClick={stay} className={tmBtn}>머무르기</button>
              <button type="button" onClick={() => void retryLeave()} disabled={checking} className={tmBtnPrimary}>
                {checking ? '확인하는 중…' : '다시 시도'}
              </button>
            </>
          }>
          <p className="text-[15.5px] leading-[1.75] text-tm-ink">
            {isRemote
              ? '아직 서버에 닿지 않은 글이 있어 이 화면을 그대로 두었습니다. 지금 떠나면 그 글이 사라질 수 있습니다. 연결을 확인한 뒤 다시 시도하면 저장을 마치고 가려던 곳으로 옮겨 갑니다.'
              : '이 브라우저에 저장하지 못한 글이 있어 이 화면을 그대로 두었습니다. 지금 떠나면 그 글이 사라질 수 있습니다. 저장 공간 · 사이트 데이터 차단을 확인한 뒤 다시 시도하면 저장을 마치고 가려던 곳으로 옮겨 갑니다.'}
            {' '}입력 글을 복사해 둘 수도 있습니다.
          </p>
        </Modal>
      )}
      {manualCopy && (
        <Modal title={manualCopy.title} sub="이 브라우저에서는 바로 복사하지 못했습니다. 글을 모두 골라 복사해 주세요." onClose={() => setManualCopy(null)}
          foot={<><span className="flex-1" /><button type="button" onClick={() => setManualCopy(null)} className={tmBtn}>닫기</button></>}>
          <textarea readOnly value={manualCopy.text} rows={14} aria-label={manualCopy.title}
            onFocus={(e) => e.currentTarget.select()}
            className={`${tmFieldBase} block w-full resize-y px-3.5 py-3 text-[14.5px] leading-[1.6]`} />
        </Modal>
      )}
    </RenderProvider>
  );
}

/* ── 함께 쓰는 것 ─────────────────────────────────────────── */

interface ViewProps {
  store: ReportStore;
  /** 보고에 뜨는 사람(스크럼 순서, 계정 이름) */
  people: ReportPerson[];
  today: string;
  members: Member[];
  canAdmin: boolean;
  /** 나 - 명단과 계정이 이어지지 않았으면 null(고르게 한다) */
  mine: ReportPerson | null;
  /** 계정으로 이어진 나(고르기 칸을 보이지 않는다) */
  mineAuto: boolean;
  onMine(id: string): void;
  names: string[];
  nameOf(id: string | null): string | null;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  onRoster(): void;
  onCopyLink(): void;
}

/** 명단에서 나를 고른다(계정이 이어지지 않았을 때) */
function MinePicker({ people, mine, onMine, id }: { people: ReportPerson[]; mine: ReportPerson | null; onMine(id: string): void; id: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <label htmlFor={id} className="text-[13.5px] font-bold text-tm-sub">나는</label>
      <select id={id} value={mine?.id ?? ''} onChange={(e) => onMine(e.target.value)} className={`${tmSelect} h-10 text-[15px]`}>
        <option value="">명단에서 고르기</option>
        {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </span>
  );
}

function useRemoveAsk() {
  const [confirm, node] = useConfirm();
  const ask = useCallback((row: { project: string }) => confirm({
    title: `'${projectLabel(row.project)}' 줄을 뺄까요?`,
    body: <>이 줄에 적은 글도 함께 사라집니다.</>,
    ok: '빼기',
    tone: 'danger',
  }), [confirm]);
  return [ask, node] as const;
}

/** 쓰는 칸 머리 - 제목 · 저장 상태 · 나 고르기 · 단추 */
function ComposerHead({ title, sub, mine, members, picker, children }: {
  title: string; sub: string; mine: ReportPerson | null; members: Member[]; picker?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-tm-line px-5 py-3.5 max-[720px]:px-4">
      {mine && <PersonMark name={mine.name} member={memberOfPerson(mine, members)} size={36} />}
      <div className="min-w-0">
        <h2 className="text-[17px] font-extrabold text-tm-deep">{title}</h2>
        <p className="text-[13.5px] font-semibold text-tm-sub">{sub}</p>
      </div>
      {picker}
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/* ── 일간보고 ─────────────────────────────────────────────────── */

function DailyRead({ entry, wide }: { entry: DailyEntry; wide: boolean }) {
  return (
    <>
      <ProjectsView rows={dailyProjects(entry)} cols={DAILY_COLS} wide={wide} empty="프로젝트 줄 없음" />
      {entry.blocker.trim() && <NoteBox title="블로커 / 공유사항" text={entry.blocker} />}
    </>
  );
}

function DailyEditor({ idBase, store, day, person, entry, names, wide, onRemoveAsk, lead }: {
  idBase: string;
  store: ReportStore;
  day: string;
  person: ReportPerson;
  entry: DailyEntry | undefined;
  names: string[];
  wide: boolean;
  onRemoveAsk(row: DailyProject): Promise<boolean>;
  lead?: React.ReactNode;
}) {
  return (
    <>
      <ProjectsEditor<DailyProject> idBase={idBase} value={dailyProjects(entry)} cols={DAILY_COLS} names={names} wide={wide}
        blank={() => blankDaily()} nameMax={LIMITS.name} onRemoveAsk={onRemoveAsk} lead={lead}
        onChange={(next) => store.setDaily(day, person, { projects: next })} />
      <div className="mt-4">
        <label htmlFor={`${idBase}-blocker`} className="mb-1.5 block text-[14px] font-bold text-tm-ink">블로커 / 공유사항</label>
        <TextField id={`${idBase}-blocker`} value={entry?.blocker ?? ''} label="블로커 / 공유사항" rows={2}
          placeholder="막힌 것 · 결정이나 도움이 필요한 것 · 팀에 알릴 것. 없으면 비워 둡니다"
          onChange={(v) => store.setDaily(day, person, { blocker: v })} />
      </div>
    </>
  );
}

function DailyView({
  store, people, today, members, canAdmin, mine, mineAuto, onMine, names, nameOf, onNotice, onRoster, onCopyLink, day, onDay,
}: ViewProps & { day: string; onDay(d: string): void }) {
  const uid = useId();
  const [boxRef, width] = useWidth();
  const wide = width >= 860;
  const [editing, setEditing] = useState<string | null>(null);
  const [carry, setCarry] = useState(false);
  const [meeting, setMeeting] = useState(false);
  /** 회의 모드에서 전일 보고를 옆에 함께 보는가 - 이 브라우저에 기억 */
  const [sideOn, setSideOn] = useStoredChoice(MEETING_SIDE_KEY, 'on', ON_OFF);
  const [removeAsk, removeNode] = useRemoveAsk();
  const memberOf = (p: ReportPerson) => (p.order === Number.MAX_SAFE_INTEGER ? null : memberOfPerson(p, members));

  const ofDay = useMemo(() => store.daily.filter((e) => e.day === day), [store.daily, day]);
  const rows = useMemo(() => rowsOf(people, ofDay, isDailyFilled), [people, ofDay]);
  const roster = rows.filter((r) => !r.gone);
  const written = roster.filter((r) => isDailyFilled(r.entry)).length;
  const myEntry = mine ? ofDay.find((e) => e.person === mine.id) : undefined;
  const prev = mine ? previousDaily(store.daily, mine.id, day) : null;

  // 날이 바뀌면 대신 쓰던 칸을 닫는다
  useEffect(() => setEditing(null), [day]);

  const jump = (p: ReportPerson) => {
    const el = document.getElementById(`${uid}-card-${p.id}`);
    if (el) scrollWithin(el);
  };

  const meetingItems: MeetingItem[] = rows.filter((r) => !r.gone || isDailyFilled(r.entry)).map((r) => {
    const filled = isDailyFilled(r.entry);
    const before = lastDailyBefore(store.daily, r.person.id, day);
    return {
      id: r.person.id, name: r.person.name, member: memberOf(r.person), filled,
      meta: metaOf(r.entry, filled, today, memberOf(r.person), nameOf),
      body: filled && r.entry
        ? <DailyRead entry={r.entry} wide={width >= 700} />
        : <p className="text-tm-sub">아직 적지 않았습니다.</p>,
      side: before
        ? { title: `전일 보고 · ${dayLabel(before.day)}`, body: <DailyRead entry={before} wide={false} /> }
        : { title: '전일 보고', body: <p className="text-tm-sub">2주 안에 적은 보고가 없습니다.</p> },
    };
  });

  const isToday = day === today;

  return (
    <div ref={boxRef} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="mb-4 flex flex-none flex-wrap items-center gap-x-2 gap-y-2.5">
        <button type="button" onClick={() => onDay(stepWorkday(day, -1))} aria-label="이전 평일" title="이전 평일" className={tmIconBtn}>
          <IconArrow dir="left" />
        </button>
        <DayPicker value={day} onPick={onDay} label="날짜 고르기" text={`${dayLabel(day)}${isToday ? ' · 오늘' : ''}`} />
        <button type="button" onClick={() => onDay(stepWorkday(day, 1))} aria-label="다음 평일" title="다음 평일" className={tmIconBtn}>
          <IconArrow dir="right" />
        </button>
        {!isToday && <button type="button" onClick={() => onDay(today)} className={tmTextBtn}>오늘로</button>}
        <span className="mx-1 hidden h-6 w-px bg-tm-line min-[721px]:block" aria-hidden />
        <WriteStatus written={written} total={roster.length} onJump={jump}
          missing={roster.filter((r) => !isDailyFilled(r.entry)).map((r) => r.person)} />
        <span className="flex-1" />
        <button type="button" onClick={() => setMeeting(true)} className={tmBtnPrimary} title="한 사람씩 크게 띄웁니다. ← → 로 넘깁니다">
          회의 모드
        </button>
        <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        {canAdmin && <button type="button" onClick={onRoster} className={tmGhostBtn}>명단 관리</button>}
      </div>

      <div className={scrollBox}>
      {/* 내 스크럼 */}
      <section aria-label="내 스크럼" className="mb-6 rounded-tm border border-tm-line bg-tm-card shadow-tm">
        <ComposerHead title={mine ? `내 스크럼 · ${mine.name}` : '내 스크럼'} mine={mine} members={members}
          sub={mine ? `${dayLabel(day)} · ${myEntry && isDailyFilled(myEntry) ? `${whenOf(myEntry.updatedAt, today)} 저장` : '적는 대로 저장됩니다'}` : '명단에서 나를 고르면 내 칸을 바로 씁니다'}
          picker={!mineAuto && <MinePicker id={`${uid}-mine`} people={people} mine={mine} onMine={onMine} />}>
          {mine && (
            <button type="button" onClick={() => setCarry(true)} disabled={!prev} className={tmEditBtn}
              title={prev ? `${dayLabel(prev.day)} 예정을 골라 완료 · 오늘 예정으로 옮깁니다` : '2주 안에 적은 예정이 없습니다'}>
              지난 예정 가져오기{prev ? ` · ${dayLabel(prev.day)}` : ''}
            </button>
          )}
        </ComposerHead>
        <div className="px-5 py-4 max-[720px]:px-4">
          {mine ? (
            <>
              <DailyEditor idBase={`${uid}-mine-${day}`} store={store} day={day} person={mine} entry={myEntry} names={names} wide={wide}
                onRemoveAsk={removeAsk} />
              <p className="mt-3 text-[13px] leading-[1.6] text-tm-sub">{WRITING_HELP}</p>
            </>
          ) : (
            <p className="text-[15px] leading-[1.7] text-tm-ink">
              {people.length
                ? '위의 고르기 칸에서 명단의 내 이름을 골라 주세요. 이 브라우저에 기억합니다. 관리자가 명단에서 계정을 이어 주면 고르지 않아도 됩니다.'
                : '명단이 비어 있습니다. 관리자가 명단 관리에서 사람을 넣어야 합니다.'}
            </p>
          )}
        </div>
      </section>

      {/* 팀 스크럼 */}
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-[18px] font-extrabold text-tm-deep">팀 스크럼</h2>
        <p className="text-[13.5px] font-semibold text-tm-sub">명단 순서 · 발표 순서</p>
      </div>
      <div className="flex flex-col gap-3 pb-8">
        {rows.map((r) => {
          const filled = isDailyFilled(r.entry);
          const member = memberOf(r.person);
          const isMine = !!mine && r.person.id === mine.id;
          const open = editing === r.person.id && !isMine;
          const meta = metaOf(r.entry, filled, today, member, nameOf);
          const action = isMine
            ? null
            : open
              ? <button type="button" onClick={() => setEditing(null)} className={tmEditBtn} data-on="">다 적었어요</button>
              : r.gone ? null : (
                <button type="button" onClick={() => setEditing(r.person.id)} className={tmGhostBtn}>
                  {filled ? '고치기' : '대신 적기'}
                </button>
              );
          return (
            <PersonCard key={r.person.id} id={`${uid}-card-${r.person.id}`} person={r.person} member={member} mine={isMine} gone={r.gone}
              meta={isMine && filled ? `${meta} · 위 내 스크럼에서 고칩니다` : meta} action={action} highlight={open}>
              {open ? (
                <DailyEditor idBase={`${uid}-${r.person.id}-${day}`} store={store} day={day} person={r.person} entry={r.entry} names={names}
                  wide={wide} onRemoveAsk={removeAsk} />
              ) : filled && r.entry ? (
                <DailyRead entry={r.entry} wide={wide} />
              ) : undefined}
            </PersonCard>
          );
        })}
      </div>

      </div>

      {carry && mine && prev && (
        <CarryDialog prev={prev} entry={myEntry} onClose={() => setCarry(false)}
          onApply={(items, field) => {
            let list = dailyProjects(myEntry);
            let added = 0;
            for (const it of items) {
              const r = addBlocksTo(list, it.project, field, [it.block], blankDaily);
              list = r.list;
              added += r.added;
            }
            if (!added) {
              onNotice(field === 'done' ? '고른 줄은 이미 완료에 있습니다.' : '고른 줄은 이미 예정에 있습니다.');
              return;
            }
            if (store.setDaily(day, mine, { projects: list })) {
              onNotice(`${added}줄을 ${field === 'done' ? '완료' : '오늘 예정'}에 넣었습니다.`, 'ok');
            }
          }} />
      )}
      {meeting && (
        <MeetingView title={`${dayLabel(day)} 스크럼`} items={meetingItems} onClose={() => setMeeting(false)}
          side={{ on: sideOn === 'on', label: '전일 보고 함께 보기', onToggle: () => setSideOn(sideOn === 'on' ? 'off' : 'on') }} />
      )}
      {removeNode}
    </div>
  );
}

type CarryItem = { id: string; project: string; block: Block; inDone: boolean; inPlan: boolean };

/** 지난 예정 가져오기 - 고른 덩이만 완료 · 오늘 예정으로. 처음에는 아무것도 고르지 않는다 */
function CarryDialog({ prev, entry, onApply, onClose }: {
  prev: DailyEntry;
  entry: DailyEntry | undefined;
  onApply(items: CarryItem[], field: 'done' | 'plan'): void;
  onClose(): void;
}) {
  const uid = useId();
  const items = useMemo<CarryItem[]>(() => {
    const now = dailyProjects(entry);
    const has = (project: string, field: 'done' | 'plan', key: string) => {
      const row = now.find((p) => projectKey(p.project) === projectKey(project));
      return !!row && blocksOf(row[field]).some((b) => b.key === key);
    };
    return dailyProjects(prev).flatMap((p) => blocksOf(p.plan).filter((b) => b.key).map((b, i) => ({
      id: `${p.id}-${i}`, project: p.project, block: b, inDone: has(p.project, 'done', b.key), inPlan: has(p.project, 'plan', b.key),
    })));
  }, [prev, entry]);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const groups = useMemo(() => {
    const m = new Map<string, CarryItem[]>();
    for (const it of items) {
      const k = projectKey(it.project);
      m.set(k, [...(m.get(k) ?? []), it]);
    }
    return [...m.values()];
  }, [items]);
  const chosen = items.filter((it) => picked.has(it.id));
  const toggle = (id: string) => setPicked((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  const apply = (field: 'done' | 'plan') => {
    onApply(chosen, field);
    onClose();
  };

  return (
    <Modal title="지난 예정 가져오기" sub={`${dayLabel(prev.day)}에 적은 예정입니다. 끝낸 일은 완료로, 이어서 할 일은 오늘 예정으로 옮깁니다.`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className={tmGhostBtn}
            onClick={() => setPicked(chosen.length === items.length ? new Set() : new Set(items.map((x) => x.id)))}>
            {chosen.length === items.length ? '모두 풀기' : '모두 고르기'}
          </button>
          <span className="flex-1" />
          <button type="button" onClick={() => apply('plan')} disabled={!chosen.length} className={tmBtn}>오늘 예정으로</button>
          <button type="button" onClick={() => apply('done')} disabled={!chosen.length} className={tmBtnPrimary}>
            완료로 넣기{chosen.length ? ` (${chosen.length})` : ''}
          </button>
        </>
      }>
      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <fieldset key={g[0].id}>
            <legend className="mb-1.5 text-[14px] font-extrabold text-tm-deep">{projectLabel(g[0].project)}</legend>
            <ul className="flex flex-col gap-1.5">
              {g.map((it) => (
                <li key={it.id}>
                  <label htmlFor={`${uid}-${it.id}`}
                    className="flex cursor-pointer items-start gap-3 rounded-tm-sm border border-tm-line px-3.5 py-2.5 hover:border-tm-blue has-[:checked]:border-tm-blue has-[:checked]:bg-tm-tint/60">
                    <input id={`${uid}-${it.id}`} type="checkbox" checked={picked.has(it.id)} onChange={() => toggle(it.id)}
                      className="mt-1 h-[18px] w-[18px] flex-none accent-tm-blue" />
                    <span className="min-w-0 flex-1 text-[15px]">
                      <CellText text={it.block.lines.join('\n')} />
                      {(it.inDone || it.inPlan) && (
                        <span className="mt-1 block text-[12.5px] font-bold text-tm-sub">
                          {it.inDone ? '이미 오늘 완료에 있음' : '이미 오늘 예정에 있음'}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
    </Modal>
  );
}

/* ── 주간보고 ─────────────────────────────────────────────────── */

function WeeklyRead({ entry, wide, feedback = true }: { entry: WeeklyEntry; wide: boolean; feedback?: boolean }) {
  return (
    <>
      {entry.summary.trim() && (
        <div className="mb-3 flex gap-2.5">
          <span className="mt-[0.1em] flex-none rounded-md bg-tm-tint px-2 py-0.5 text-[0.8em] font-extrabold text-tm-deep">요약</span>
          <div className="min-w-0 flex-1"><CellText text={entry.summary} /></div>
        </div>
      )}
      <ProjectsView rows={entry.projects} cols={WEEKLY_COLS} wide={wide} empty="프로젝트 줄 없음" />
      {entry.issues.trim() && <NoteBox title="이슈 / 요청 사항" text={entry.issues} />}
      {feedback && entry.feedback.trim() && <NoteBox title="PM 피드백" text={entry.feedback} tone="blue" />}
    </>
  );
}


function WeeklyEditor({ idBase, store, week, person, entry, names, wide, onRemoveAsk, lead }: {
  idBase: string;
  store: ReportStore;
  week: string;
  person: ReportPerson;
  entry: WeeklyEntry | undefined;
  names: string[];
  wide: boolean;
  onRemoveAsk(row: WeeklyProject): Promise<boolean>;
  lead?: React.ReactNode;
}) {
  const set = (patch: Parameters<ReportStore['setWeekly']>[2]) => store.setWeekly(week, person, patch);
  return (
    <>
      <label htmlFor={`${idBase}-summary`} className="mb-1.5 block text-[14px] font-bold text-tm-ink">요약</label>
      <TextField id={`${idBase}-summary`} value={entry?.summary ?? ''} label="요약"
        placeholder="이번 주 핵심을 한두 줄로" onChange={(v) => set({ summary: v })} />
      <div className="mt-4">
        <ProjectsEditor<WeeklyProject> idBase={idBase} value={entry?.projects ?? []} cols={WEEKLY_COLS} names={names} wide={wide}
          blank={() => blankWeekly()} nameMax={LIMITS.name} onRemoveAsk={onRemoveAsk} lead={lead}
          onChange={(next) => set({ projects: next })} />
      </div>
      <div className="mt-4">
        <label htmlFor={`${idBase}-issues`} className="mb-1.5 block text-[14px] font-bold text-tm-ink">이슈 / 요청 사항</label>
        <TextField id={`${idBase}-issues`} value={entry?.issues ?? ''} label="이슈 / 요청 사항" rows={2}
          placeholder="아직 풀리지 않은 블로커 · 결정이나 도움이 필요한 것만" onChange={(v) => set({ issues: v })} />
      </div>
    </>
  );
}

function WeeklyView({
  store, people, today, members, canAdmin, mine, mineAuto, onMine, names, nameOf, onNotice, onRoster, onCopyLink, week, onWeek, onOpenDay,
}: ViewProps & { week: string; onWeek(w: string): void; onOpenDay(d: string): void }) {
  const uid = useId();
  const [boxRef, width] = useWidth();
  const wide = width >= 980;
  const [editing, setEditing] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const [undo, setUndo] = useState<{ week: string; person: string; projects: WeeklyProject[]; added: number } | null>(null);
  const [scrumOpen, setScrumOpen] = useState(false);
  const [meeting, setMeeting] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [removeAsk, removeNode] = useRemoveAsk();
  const memberOf = (p: ReportPerson) => (p.order === Number.MAX_SAFE_INTEGER ? null : memberOfPerson(p, members));

  const w = weekLabel(week);
  const thisWeek = weekOf(today);
  const ofWeek = useMemo(() => store.weekly.filter((e) => e.week === week), [store.weekly, week]);
  const rows = useMemo(() => rowsOf(people, ofWeek, isWeeklyFilled), [people, ofWeek]);
  const roster = rows.filter((r) => !r.gone);
  const written = roster.filter((r) => isWeeklyFilled(r.entry)).length;
  const team = store.teams.find((t) => t.id === week);
  const myEntry = mine ? ofWeek.find((e) => e.person === mine.id) : undefined;
  const draft = useMemo(() => (mine ? weeklyDraft(store.daily, mine.id, week) : null), [store.daily, mine, week]);
  const myScrum = useMemo(
    () => (mine ? workdaysOf(week).map((d) => ({ day: d, entry: store.daily.find((e) => e.person === mine.id && e.day === d) })) : []),
    [store.daily, mine, week],
  );

  useEffect(() => {
    setEditing(null);
    setFeedbackOpen(null);
    setUndo(null);
  }, [week]);

  const jump = (p: ReportPerson) => {
    const el = document.getElementById(`${uid}-card-${p.id}`);
    if (el) scrollWithin(el);
  };

  const fill = () => {
    if (!mine || !draft) return;
    const before = myEntry?.projects ?? [];
    const r = mergeWeekly(before, draft.projects);
    setDraftOpen(false);
    if (!r.added) {
      onNotice('더할 줄이 없습니다. 스크럼의 줄이 이미 모두 들어 있습니다.');
      return;
    }
    if (store.setWeekly(week, mine, { projects: r.list })) setUndo({ week, person: mine.id, projects: before, added: r.added });
  };

  const undoFill = () => {
    if (!undo || !mine || undo.person !== mine.id) return;
    if (store.setWeekly(undo.week, mine, { projects: undo.projects })) onNotice('채우기 전으로 되돌렸습니다.', 'ok');
    setUndo(null);
  };

  const reopen = async () => {
    setReopening(true);
    const r = await store.reopenTeam(week);
    setReopening(false);
    onNotice(r.ok ? '팀 요약을 다시 고칠 수 있습니다.' : r.error, r.ok ? 'ok' : 'err');
  };

  const summaries = roster.filter((r) => r.entry?.summary.trim());

  const meetingItems: MeetingItem[] = rows.filter((r) => !r.gone || isWeeklyFilled(r.entry)).map((r) => {
    const filled = isWeeklyFilled(r.entry);
    return {
      id: r.person.id, name: r.person.name, member: memberOf(r.person), filled,
      meta: metaOf(r.entry, filled, today, memberOf(r.person), nameOf),
      body: filled && r.entry ? <WeeklyRead entry={r.entry} wide={width >= 760} /> : <p className="text-tm-sub">아직 적지 않았습니다.</p>,
    };
  });
  if (team?.summary.trim()) {
    meetingItems.unshift({
      id: 'team', name: '팀 요약', member: null, filled: true, meta: 'PM',
      body: <CellText text={team.summary} />,
    });
  }

  return (
    <div ref={boxRef} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="mb-4 flex flex-none flex-wrap items-center gap-x-2 gap-y-2.5">
        <button type="button" onClick={() => onWeek(addDays(week, -7))} aria-label="지난주" title="지난주" className={tmIconBtn}>
          <IconArrow dir="left" />
        </button>
        <DayPicker value={week} onPick={(d) => onWeek(weekOf(d))} label="주 고르기(그 주의 아무 날)"
          text={`${w.text} (${w.range})${week === thisWeek ? ' · 이번 주' : ''}`} />
        <button type="button" onClick={() => onWeek(addDays(week, 7))} aria-label="다음 주" title="다음 주" className={tmIconBtn}>
          <IconArrow dir="right" />
        </button>
        {week !== thisWeek && <button type="button" onClick={() => onWeek(thisWeek)} className={tmTextBtn}>이번 주로</button>}
        <span className="mx-1 hidden h-6 w-px bg-tm-line min-[721px]:block" aria-hidden />
        <WriteStatus written={written} total={roster.length} onJump={jump}
          missing={roster.filter((r) => !isWeeklyFilled(r.entry)).map((r) => r.person)} />
        <span className="flex-1" />
        <button type="button" onClick={() => setMeeting(true)} className={tmBtnPrimary} title="팀 요약부터 한 사람씩 크게 띄웁니다. ← → 로 넘깁니다">
          회의 모드
        </button>
        <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        {canAdmin && <button type="button" onClick={onRoster} className={tmGhostBtn}>명단 관리</button>}
      </div>

      <div className={scrollBox}>
      {/* 팀 요약 - PM */}
      <section aria-labelledby={`${uid}-team`} className="mb-6 rounded-tm border border-tm-line bg-tm-card shadow-tm">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-tm-line px-5 py-3.5 max-[720px]:px-4">
          <h2 id={`${uid}-team`} className="text-[17px] font-extrabold text-tm-deep">팀 요약</h2>
          <p className="text-[13.5px] font-semibold text-tm-sub">
            PM 이 팀원 요약을 읽고 적습니다{team?.summary.trim() ? ` · ${whenOf(team.updatedAt, today)} 저장` : ''}
          </p>
          {team?.status === 'final' && canAdmin && (
            <button type="button" onClick={() => void reopen()} disabled={reopening} className={`${tmGhostBtn} ml-auto`}>
              {reopening ? '여는 중…' : '다시 고치기'}
            </button>
          )}
        </header>
        <div className="grid gap-5 px-5 py-4 max-[720px]:px-4 min-[1100px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            {canAdmin && team?.status !== 'final' ? (
              <TextField id={`${uid}-team-summary`} value={team?.summary ?? ''} rows={3} label="팀 요약"
                placeholder="이번 주 팀 전체의 흐름 · 강조할 것 · 다음 주에 챙길 것"
                onChange={(v) => store.setTeam(week, v)} />
            ) : team?.summary.trim() ? (
              <div className="text-[15px]"><CellText text={team.summary} /></div>
            ) : (
              <p className="text-[15px] text-tm-sub">아직 팀 요약이 없습니다.</p>
            )}
            {team?.status === 'final' && <p className="mt-2 text-[13px] font-semibold text-tm-sub">예전 판에서 확정한 주입니다.</p>}
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-[13.5px] font-bold text-tm-sub">팀원 요약 {summaries.length}/{roster.length}</p>
            {summaries.length ? (
              <ul className="flex flex-col gap-1.5">
                {summaries.map((r) => (
                  <li key={r.person.id} className="flex gap-2.5 text-[14.5px]">
                    <button type="button" onClick={() => jump(r.person)} className="w-14 flex-none truncate text-left font-extrabold text-tm-deep hover:text-tm-blue hover:underline">
                      {r.person.name}
                    </button>
                    <div className="min-w-0 flex-1"><CellText text={r.entry?.summary ?? ''} /></div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14.5px] text-tm-sub">팀원이 요약을 적으면 여기에 모입니다.</p>
            )}
          </div>
        </div>
      </section>

      {/* 내 주간보고 */}
      <section aria-label="내 주간보고" className="mb-6 rounded-tm border border-tm-line bg-tm-card shadow-tm">
        <ComposerHead title={mine ? `내 주간보고 · ${mine.name}` : '내 주간보고'} mine={mine} members={members}
          sub={mine ? `${w.text} (${w.range}) · ${myEntry && isWeeklyFilled(myEntry) ? `${whenOf(myEntry.updatedAt, today)} 저장` : '적는 대로 저장됩니다'}` : '명단에서 나를 고르면 내 칸을 바로 씁니다'}
          picker={!mineAuto && <MinePicker id={`${uid}-mine`} people={people} mine={mine} onMine={onMine} />}>
          {mine && (
            <>
              <button type="button" onClick={() => setScrumOpen((v) => !v)} aria-expanded={scrumOpen} className={tmGhostBtn}>
                이번 주 내 스크럼 {scrumOpen ? '접기' : '보기'}
              </button>
              <button type="button" onClick={() => setDraftOpen(true)} disabled={!draft?.count} className={tmEditBtn}
                title={draft?.count ? '이번 주 스크럼을 프로젝트별로 모아 채웁니다' : '이번 주에 적은 스크럼이 없습니다'}>
                스크럼으로 채우기{draft?.days.length ? ` · ${draft.days.length}일치` : ''}
              </button>
            </>
          )}
        </ComposerHead>
        <div className="px-5 py-4 max-[720px]:px-4">
          {undo && mine && undo.person === mine.id && undo.week === week && (
            <div role="status" className={`${tmCallout} mb-4`}>
              <p className="min-w-0 flex-[1_1_260px]">이번 주 스크럼에서 <b>{undo.added}줄</b>을 넣었습니다. 합친 줄의 소요기간은 더했습니다. 고칠 곳만 고치면 됩니다.</p>
              <span className="flex flex-none gap-2">
                <button type="button" onClick={undoFill} className={tmGhostBtn}>되돌리기</button>
                <button type="button" onClick={() => setUndo(null)} className={tmGhostBtn}>닫기</button>
              </span>
            </div>
          )}
          {scrumOpen && mine && (
            <div className="mb-5 rounded-tm-sm border border-tm-line bg-tm-bg px-4 py-3.5">
              <p className="mb-2.5 text-[13.5px] font-bold text-tm-sub">이번 주 내 스크럼 - 날짜를 누르면 그날 일간보고로 갑니다</p>
              <div className="flex flex-col gap-3">
                {myScrum.map(({ day, entry }) => (
                  <div key={day} className="rounded-tm-sm bg-tm-card px-3.5 py-2.5 text-[14px]">
                    <button type="button" onClick={() => onOpenDay(day)} className="mb-1.5 text-[13.5px] font-extrabold text-tm-deep hover:text-tm-blue hover:underline">
                      {dayLabel(day)}
                    </button>
                    {entry && isDailyFilled(entry) ? <DailyRead entry={entry} wide={wide} /> : <p className="text-tm-sub">적지 않음</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mine ? (
            <>
              <WeeklyEditor idBase={`${uid}-mine-${week}`} store={store} week={week} person={mine} entry={myEntry} names={names} wide={wide}
                onRemoveAsk={removeAsk} />
              {myEntry?.feedback.trim() && <NoteBox title="PM 피드백" text={myEntry.feedback} tone="blue" />}
              <p className="mt-3 text-[13px] leading-[1.6] text-tm-sub">{WRITING_HELP}</p>
            </>
          ) : (
            <p className="text-[15px] leading-[1.7] text-tm-ink">
              {people.length
                ? '위의 고르기 칸에서 명단의 내 이름을 골라 주세요. 이 브라우저에 기억합니다.'
                : '명단이 비어 있습니다. 관리자가 명단 관리에서 사람을 넣어야 합니다.'}
            </p>
          )}
        </div>
      </section>

      {/* 팀 주간보고 */}
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-[18px] font-extrabold text-tm-deep">팀 주간보고</h2>
        <p className="text-[13.5px] font-semibold text-tm-sub">명단 순서</p>
      </div>
      <div className="flex flex-col gap-3 pb-8">
        {rows.map((r) => {
          const filled = isWeeklyFilled(r.entry);
          const member = memberOf(r.person);
          const isMine = !!mine && r.person.id === mine.id;
          const open = editing === r.person.id && !isMine;
          const fbOpen = feedbackOpen === r.person.id;
          const meta = metaOf(r.entry, filled, today, member, nameOf);
          const action = (
            <>
              {canAdmin && !r.gone && (
                <button type="button" onClick={() => setFeedbackOpen(fbOpen ? null : r.person.id)} aria-expanded={fbOpen}
                  className={tmGhostBtn}>
                  {fbOpen ? '피드백 닫기' : r.entry?.feedback.trim() ? '피드백 고치기' : '피드백 남기기'}
                </button>
              )}
              {!isMine && !r.gone && (open
                ? <button type="button" onClick={() => setEditing(null)} className={tmEditBtn} data-on="">다 적었어요</button>
                : <button type="button" onClick={() => setEditing(r.person.id)} className={tmGhostBtn}>{filled ? '고치기' : '대신 적기'}</button>)}
            </>
          );
          const showBody = open || filled || fbOpen;
          return (
            <PersonCard key={r.person.id} id={`${uid}-card-${r.person.id}`} person={r.person} member={member} mine={isMine} gone={r.gone}
              meta={isMine && filled ? `${meta} · 위 내 주간보고에서 고칩니다` : meta} action={action} highlight={open}>
              {showBody ? (
                <>
                  {open ? (
                    <WeeklyEditor idBase={`${uid}-${r.person.id}-${week}`} store={store} week={week} person={r.person} entry={r.entry}
                      names={names} wide={wide} onRemoveAsk={removeAsk} />
                  ) : filled && r.entry ? (
                    <WeeklyRead entry={r.entry} wide={wide} feedback={!fbOpen} />
                  ) : null}
                  {fbOpen && (
                    <div className="mt-4">
                      <label htmlFor={`${uid}-${r.person.id}-fb`} className="mb-1.5 block text-[14px] font-bold text-tm-ink">PM 피드백</label>
                      <TextField id={`${uid}-${r.person.id}-fb`} value={r.entry?.feedback ?? ''} rows={2} label="PM 피드백"
                        placeholder="스크럼 · 주간보고 작성에 대한 의견, 칭찬, 다음에 챙길 것"
                        onChange={(v) => store.setWeekly(week, r.person, { feedback: v })} />
                    </div>
                  )}
                </>
              ) : undefined}
            </PersonCard>
          );
        })}
      </div>

      </div>

      {draftOpen && draft && (
        <Modal title="이번 주 스크럼으로 채우기" size="lg"
          sub={`${draft.days.map((d) => dayLabel(d)).join(' · ')} 스크럼에서 모았습니다. 같은 일은 한 줄로 합쳐 소요기간을 더했고, 이미 적은 줄은 건너뜁니다.`}
          onClose={() => setDraftOpen(false)}
          foot={
            <>
              <span className="flex-1" />
              <button type="button" onClick={() => setDraftOpen(false)} className={tmBtn}>취소</button>
              <button type="button" onClick={fill} className={tmBtnPrimary}>채우기</button>
            </>
          }>
          <div className="text-[15px]">
            <ProjectsView rows={draft.projects} cols={WEEKLY_COLS} wide={width >= 760} />
          </div>
          <p className="mt-3 text-[13.5px] leading-[1.6] text-tm-sub">
            완료는 그 주 스크럼의 완료 줄, 진행 중은 마지막 스크럼의 예정 가운데 완료 기록이 없는 것, 다음 주 계획은 예정이었지만 완료 기록이 없던 나머지입니다.
            채운 뒤 고칠 곳만 고치면 됩니다.
          </p>
        </Modal>
      )}
      {meeting && (
        <MeetingView title={`${w.text} 주간보고`} items={meetingItems} onClose={() => setMeeting(false)} />
      )}
      {removeNode}
    </div>
  );
}

/* ── 명단 ─────────────────────────────────────────────────── */

/**
 * 보고에 뜨는 사람 고르기(관리자). 가입해 승인된 팀원은 저절로 들어오고(Supabase 모드는 서버 트리거 tm_members_report_people),
 * 여기서 빼거나 다시 넣고 발표 순서를 바꾼다. 계정이 없는 사람도 이름으로 넣을 수 있다. 빼도 적은 보고는 지우지 않는다
 */
function RosterDialog({ store, members, local, onClose }: { store: ReportStore; members: Member[]; local: boolean; onClose(): void }) {
  const uid = useId();
  const [confirm, confirmNode] = useConfirm();
  const [fresh, setFresh] = useState<string | null>(null);
  const all = store.people;
  const shown = all.filter((p) => !p.hidden);
  const hidden = all.filter((p) => p.hidden);
  const small = 'mb-1 block text-[12.5px] font-bold text-tm-sub';
  const accountOf = (p: ReportPerson) => memberOfPerson(p, members);
  const label = (p: ReportPerson) => accountOf(p)?.name.trim() || p.name;
  /** 다른 줄에 이어진 계정 - 계정 연결 고르기에서 뺀다 */
  const taken = new Set(all.flatMap((p) => { const a = accountOf(p); return a ? [a.id] : []; }));
  /** 승인됐는데 명단에 줄이 없는 팀원 - Supabase 모드는 서버가 넣으므로 보통 없다(SQL 실행 전 · 브라우저 저장 모드) */
  const missing = members.filter((m) => m.active !== false && !taken.has(m.id));

  const add = () => {
    let name = '새 사람';
    for (let k = 2; all.some((p) => p.name === name); k += 1) name = `새 사람 ${k}`;
    setFresh(store.addPerson(name).id);
  };
  const move = (id: string, dir: -1 | 1) => reorderPeople(shown, id, dir).forEach((p) => store.updatePerson(p.id, { order: p.order }));
  const show = (p: ReportPerson, k = 0) => store.updatePerson(p.id, { hidden: false, order: nextPersonOrder(all) + k * 1000 });
  const remove = async (p: ReportPerson) => {
    const yes = await confirm({
      title: `'${p.name}' 을(를) 명단에서 지울까요?`,
      body: <>계정이 없는 사람의 줄만 지울 수 있습니다. 이미 적은 보고는 지우지 않고, 그날 · 그 주 보고 맨 아래에 <b>명단에서 빠진 사람</b>으로 남습니다.</>,
      ok: '지우기',
      tone: 'danger',
    });
    if (yes) store.removePerson(p.id);
  };

  const who = (p: ReportPerson) => {
    const a = accountOf(p);
    return a
      ? <span className="text-[12.5px] font-semibold text-tm-sub">{a.role || '팀원'}{p.member ? '' : ' · 이름이 같은 계정'}</span>
      : <span className="rounded-full bg-tm-card px-2 py-px text-[12px] font-bold text-tm-sub">계정 없음</span>;
  };

  return (
    <>
      <Modal title="보고에 뜨는 사람"
        sub={local ? '이 브라우저에만 저장됩니다' : '관리자만 고칠 수 있습니다. 고친 것은 팀 모두에게 바로 보입니다.'}
        onClose={onClose}
        foot={
          <>
            <button type="button" onClick={add} className={tmGhostBtn}>
              <IconPlus size={16} />
              계정 없는 사람 추가
            </button>
            <span className="flex-1" />
            <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          </>
        }>
        <div className={`${tmCallout} mb-4`}>
          <p className="min-w-0">
            {local
              ? '이 모드의 팀원이 처음부터 모두 들어 있습니다.'
              : '가입해 승인된 팀원은 저절로 맨 아래에 들어옵니다.'}
            {' '}빼면 일간 · 주간보고 · 회의 모드 · 글 복사에서 빠지고, 이미 적은 보고는 남습니다. 위 · 아래는 발표 순서입니다.
          </p>
        </div>

        <p className="mb-2 text-[13.5px] font-bold text-tm-sub">보고에 뜨는 사람 {shown.length}명</p>
        {shown.length === 0 && <p className="rounded-tm-sm bg-tm-bg px-3.5 py-3 text-[14.5px] text-tm-sub">아무도 뜨지 않습니다. 아래에서 다시 넣어 주세요.</p>}
        <ol className="flex flex-col gap-2">
          {shown.map((p, i) => {
            const a = accountOf(p);
            const others = all.filter((o) => o.id !== p.id).map((o) => o.name);
            const choices = members.filter((m) => m.active !== false && !taken.has(m.id));
            return (
              <li key={p.id} className="rounded-tm-sm bg-tm-bg px-3.5 py-2.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="w-5 flex-none text-center text-[14px] font-bold tabular-nums text-tm-sub" aria-hidden>{i + 1}</span>
                  <PersonMark name={label(p)} member={a} size={32} />
                  {a ? (
                    <div className="min-w-0 flex-[1_1_160px]">
                      <p className="truncate text-[15px] font-bold text-tm-ink">{label(p)}</p>
                      {who(p)}
                    </div>
                  ) : (
                    <div className="flex min-w-0 flex-[1_1_320px] flex-wrap items-end gap-x-3 gap-y-2">
                      <div className="min-w-0 flex-[1_1_140px]">
                        <label className={small} htmlFor={`${uid}-${p.id}-name`}>이름 · 계정 없음</label>
                        <CommitInput id={`${uid}-${p.id}-name`} value={p.name} max={20} autoFocus={fresh === p.id}
                          check={(v) => (!v ? '이름을 적어 주세요' : others.includes(v) ? '같은 이름이 명단에 있습니다' : null)}
                          onSave={(v) => store.updatePerson(p.id, { name: v })} />
                      </div>
                      <div className="min-w-0 flex-[1_1_160px]">
                        <label className={small} htmlFor={`${uid}-${p.id}-member`}>계정 잇기</label>
                        <select id={`${uid}-${p.id}-member`} value="" className={`${tmSelect} h-11 w-full text-[15px]`}
                          onChange={(e) => { if (e.target.value) store.updatePerson(p.id, { member: e.target.value }); }}>
                          <option value="">{choices.length ? '이을 계정 고르기' : '이을 계정이 없습니다'}</option>
                          {choices.map((m) => <option key={m.id} value={m.id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <span className="ml-auto flex flex-none items-center gap-1.5">
                    <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label={`${label(p)} 위로`} title="위로" className={tmIconBtn}>
                      <IconArrow dir="up" />
                    </button>
                    <button type="button" onClick={() => move(p.id, 1)} disabled={i === shown.length - 1} aria-label={`${label(p)} 아래로`} title="아래로" className={tmIconBtn}>
                      <IconArrow dir="down" />
                    </button>
                    <button type="button" onClick={() => store.updatePerson(p.id, { hidden: true })} aria-label={`${label(p)} 보고에서 빼기`} className={tmGhostBtn}>
                      빼기
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {(hidden.length > 0 || missing.length > 0) && (
          <section aria-labelledby={`${uid}-out`} className="mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 id={`${uid}-out`} className="text-[13.5px] font-bold text-tm-sub">보고에서 뺀 사람 {hidden.length + missing.length}명</h3>
              <button type="button" className={`${tmTextBtn} ml-auto`}
                onClick={() => {
                  hidden.forEach((p, k) => show(p, k));
                  missing.forEach((m) => store.addPerson(m.name.trim() || '이름 없음', m.id));
                }}>
                모두 다시 넣기
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {hidden.map((p) => {
                const a = accountOf(p);
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-tm-sm border border-dashed border-tm-line px-3.5 py-2">
                    <PersonMark name={label(p)} member={a} size={28} />
                    <div className="min-w-0 flex-[1_1_160px]">
                      <p className="truncate text-[14.5px] font-bold text-tm-ink">{label(p)}</p>
                      {who(p)}
                    </div>
                    <span className="ml-auto flex flex-none items-center gap-1.5">
                      <button type="button" onClick={() => show(p)} aria-label={`${label(p)} 다시 넣기`} className={tmEditBtn}>다시 넣기</button>
                      {!a && <button type="button" onClick={() => void remove(p)} aria-label={`${p.name} 지우기`} className={tmGhostDanger}>지우기</button>}
                    </span>
                  </li>
                );
              })}
              {missing.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-tm-sm border border-dashed border-tm-line px-3.5 py-2">
                  <PersonMark name={m.name} member={m} size={28} />
                  <div className="min-w-0 flex-[1_1_160px]">
                    <p className="truncate text-[14.5px] font-bold text-tm-ink">{m.name}</p>
                    <span className="text-[12.5px] font-semibold text-tm-sub">{m.role || '팀원'} · 명단에 아직 없음</span>
                  </div>
                  <button type="button" onClick={() => store.addPerson(m.name.trim() || '이름 없음', m.id)} aria-label={`${m.name} 넣기`}
                    className={`${tmEditBtn} ml-auto`}>
                    넣기
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Modal>
      {confirmNode}
    </>
  );
}
