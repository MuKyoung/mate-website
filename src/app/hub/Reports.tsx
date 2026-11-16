'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isRemote } from './supabase';
import { useRemoteReportStore } from './reportRemote';
import {
  DAILY_MAX, ITEM_MAX, ITEM_NAME_MAX, WEEKLY_MAX,
  addDays, dailyText, dayLabel, dotDay, hasTaskKey, isDay, isFilled, lastPlan, limitText, linesOf, makeSnapshot, memberOfPerson,
  reorderPeople, stampLabel, stepWorkday, useReportStore, weekLabel, weekOf, weekdayOf, weeklyText, whenOf, workdaysOf, writtenCount,
  type DailyPatch, type ItemPatch, type ReportStore, type ReportStoreOptions, type WeeklyPatch,
} from './reportStore';
import {
  DAILY_FIELDS, PROJECT_STATES, initialOf, localDay, localToday,
  type DailyEntry, type DailyField, type Member, type ProjectState, type ReportPerson, type Task, type WeeklyItem, type WeeklyReport,
  type WeeklySnapshot, type WeeklyText,
} from './types';
import { useMembers } from './members';
import { CommitInput } from './DomainDialog';
import {
  Avatar, DueBadge, IconArrow, IconPlus, Modal, PageHead, StatusPill, useConfirm, useMediaQuery,
  tmBtn, tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtn, tmSelect, tmTab,
} from './ui';

/*
 * 일간보고(스크럼) · 주간보고.
 *
 * 일간보고: 명단 순서대로 한 사람에 한 줄 - 이름 · 완료 · 예정 · 블로커 & 공유사항. 칸은 적는 대로 저장되고
 *   팀 모두에게 바로 보인다(Supabase 모드). 명단(이름 · 순서 · 계정 연결)은 관리자만 고친다.
 *   작성 보기(늘 고칠 수 있는 칸)와 읽기 보기(글만, 스크럼 진행)를 오간다. 넓이에 따라 표 · 카드로 바뀐다.
 *   도움: 지난 예정 확인(고른 줄만 완료로), 작업에서 넣기(고른 작업만), 내 줄로, 메신저에 붙일 글로 복사.
 * 주간보고: 직접 쓰는 칸(한 주 요약 · 프로젝트별 현황 · 이슈 · 다음 주 계획 · 기타)과
 *   저절로 모은 근거(작업 보드의 숫자 · 일간보고 작성 · 블로커 모음 · 사람별 완료 · 다음 주 마감)를 함께 본다.
 *   확정하면 칸이 잠기고 그때의 근거가 저장본으로 남는다(Supabase 모드는 서버가 만든다). 누구나 '다시 고치기'로 연다.
 *
 * 보고를 떠날 때(다른 메뉴 · 단축키 · 작업 열기 · 홈페이지)는 기다리는 저장을 보내고, 아직 저장되지 않은 것이 남았으면
 * 이 화면을 그대로 두고 묻는다(Workspace 가 leaveRef 를 부른다).
 */

export type ReportKind = 'daily' | 'weekly';

/** 빌드마다 하나로 정해지므로 렌더 사이에 훅 순서가 바뀌지 않는다 */
const useReports: (opts: ReportStoreOptions) => ReportStore = isRemote ? useRemoteReportStore : useReportStore;

/** 보고 단축키(S · W)를 끈 사람 - Workspace 의 단축키도 이 값을 읽는다 */
export const REPORT_KEYS_KEY = 'mate.taskmanager.reportKeys.v1';
const DAILY_VIEW_KEY = 'mate.taskmanager.reports.dailyView.v1';
const ON_OFF = ['on', 'off'] as const;
const VIEWS = ['write', 'read'] as const;

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

/** 이 브라우저에 기억하는 고르기 - 저장이 막혀 있어도 화면은 돈다 */
function useStoredChoice<T extends string>(key: string, initial: T, allowed: readonly T[]): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(key);
      if (v && (allowed as readonly string[]).includes(v)) setValue(v as T);
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
 * 밀어 올려 메뉴 · 머리가 화면 밖으로 밀린다. 넓은 화면의 표 머리(44px)는 붙어 있으므로 그만큼 띄운다
 */
function scrollWithin(el: HTMLElement, gap = 52) {
  let box = el.parentElement;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
  if (!box) return;
  const r = el.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const top = b.top + gap;
  if (r.top < top) box.scrollTop -= top - r.top;
  else if (r.bottom > b.bottom - 8) box.scrollTop += Math.min(r.bottom - b.bottom + 8, r.top - top);
}

/**
 * 글을 줄 끝에 붙인다 - 이미 있는 줄은 건너뛴다. 붙이는 줄의 머리표는 칸의 줄을 따른다
 * (칸에 머리표 없는 줄만 있으면 그대로, 아니면 '- ')
 */
function appendLines(text: string, add: string[]): string {
  const have = new Set(linesOf(text));
  const fresh = add.filter((l) => !have.has(l));
  if (!fresh.length) return text;
  const base = text.replace(/\s+$/, '');
  const rows = base.split('\n').map((l) => l.trim()).filter(Boolean);
  const plain = rows.length > 0 && rows.every((l) => !/^([-•·*]|\d+[.)])\s/.test(l));
  return `${base}${base ? '\n' : ''}${fresh.map((l) => (plain ? l : `- ${l}`)).join('\n')}`;
}

/** 글에 맞춰 키가 자라는 칸. 폭이 바뀌면(창 크기 · 메뉴 접기) 다시 잰다 */
function AutoText({ id, value, onChange, placeholder, readOnly, rows = 2, max, className, inputRef }: {
  id: string;
  value: string;
  onChange(v: string): void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  max: number;
  className: string;
  inputRef?: (el: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    // 테두리까지 넣는다(box-sizing: border-box)
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, []);
  useLayoutEffect(fit, [value, fit]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);
  return (
    <textarea ref={(el) => { ref.current = el; inputRef?.(el); }} id={id} value={value} rows={rows} readOnly={readOnly}
      maxLength={max} placeholder={placeholder} spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      className={className} />
  );
}

/** 표 칸 - 칸 선 안에 테두리 없이. 올리면 회색, 누르면 파란 테두리 */
const cellTable =
  'block w-full resize-none overflow-hidden rounded-tm-sm border border-transparent bg-transparent px-2.5 py-2 text-[15px] leading-[1.6] text-tm-ink ' +
  'transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-tm-sub placeholder:opacity-0 ' +
  'hover:bg-tm-bg focus:border-tm-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(38,68,203,0.2)] focus:placeholder:opacity-100';

/** 카드 칸 - 입력 칸처럼(휴대폰 16px - iOS 가 누를 때 확대하지 않게) */
const cellCard =
  `${tmFieldBase} block w-full resize-none overflow-hidden px-3 py-2 text-[16px] leading-[1.6] min-[761px]:text-[15px]`;

/** 주간보고의 글 칸 */
const fieldText =
  `${tmFieldBase} block w-full resize-none overflow-hidden px-3.5 py-2.5 text-[15.5px] leading-[1.7] read-only:bg-tm-bg max-[760px]:text-[16px]`;

/** 링크처럼 보이는 작은 글자 단추 */
const linkBtn =
  'inline-flex min-h-[28px] items-center text-left text-[13px] font-bold text-tm-blue underline-offset-[3px] hover:underline ' +
  'disabled:cursor-default disabled:text-tm-sub disabled:no-underline [@media(pointer:coarse)]:min-h-10';

/** 명단 사람의 동그라미 - 계정이 이어져 있으면 그 사람 아바타(색), 아니면 이름 글자 */
function PersonMark({ name, member, size = 32 }: { name: string; member: Member | null; size?: number }) {
  if (member) return <Avatar id={member.id} size={size} />;
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-full border border-tm-line bg-tm-bg font-bold text-tm-sub"
      style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initialOf(name)}
    </span>
  );
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
      <span className={`${tmBtn} pointer-events-none min-w-[150px] px-4 tabular-nums max-[420px]:min-w-0 max-[420px]:px-3`} aria-hidden>{text}</span>
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

function Card({ title, sub, action, id, children }: { title: string; sub?: string; action?: React.ReactNode; id?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id ? `${id}-h` : undefined} className="rounded-tm border border-tm-line bg-white shadow-tm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-tm-line px-5 py-3.5 max-[720px]:px-4">
        <h2 id={id ? `${id}-h` : undefined} className="text-[16.5px] font-extrabold text-tm-deep">{title}</h2>
        {sub && <p className="text-[13.5px] text-tm-sub">{sub}</p>}
        {action && <div className="ml-auto flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      <div className="px-5 py-4 max-[720px]:px-4">{children}</div>
    </section>
  );
}

const messageCard =
  'flex flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm';

/* ═══════════════════════════════════════════════════════════════ */

type DailyRowData = { person: ReportPerson; entry: DailyEntry | undefined; gone: boolean };

/** 그날의 줄 - 명단 순서대로, 그 뒤에 명단에서 빠졌지만 그날 적은 사람 */
function dailyRows(people: ReportPerson[], daily: DailyEntry[], day: string): DailyRowData[] {
  const ofDay = daily.filter((e) => e.day === day);
  const byPerson = new Map(ofDay.map((e) => [e.person, e]));
  const ids = new Set(people.map((p) => p.id));
  return [
    ...people.map((p) => ({ person: p, entry: byPerson.get(p.id), gone: false })),
    ...ofDay
      .filter((e) => !ids.has(e.person) && isFilled(e))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      .map((e) => ({ person: { id: e.person, name: e.name || '이름 없음', member: null, order: Number.MAX_SAFE_INTEGER }, entry: e, gone: true })),
  ];
}

/** 확정 상태 글(글 복사 머리 · 화면) */
function stageOf(report: WeeklyReport | undefined, nameOf: (id: string | null) => string | null): string {
  if (report?.status !== 'final') return '초안';
  if (!report.snapshot || !report.finalizedAt) return '확정 · 확정 시점 자료 없음(숫자는 지금 기준)';
  const who = nameOf(report.finalizedBy);
  return `확정 · ${stampLabel(report.finalizedAt)}${who ? ` · ${who}` : ''}`;
}

export default function Reports({
  kind, onKind, me, canEditPeople, tasks, onTaskOpen, onNotice, flushRef, leaveRef,
}: {
  kind: ReportKind;
  onKind(k: ReportKind): void;
  /** 지금 쓰는 사람(Member.id) */
  me: string;
  /** 명단을 고칠 수 있다 - Supabase 모드는 관리자만, 브라우저 저장 모드는 누구나 */
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

  const nameOf = useCallback((id: string | null) => (id ? members.find((m) => m.id === id)?.name ?? null : null), [members]);
  const usable = store.ready && !store.missing && !store.loadError;

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

  /** 지금 보는 일간보고 글 - 명단 사람과 명단에서 빠진 사람을 나눠 센다 */
  const dailyCopy = () => {
    const rows = dailyRows(store.people, store.daily, day);
    return dailyText(
      day,
      rows.filter((r) => !r.gone).map((r) => ({ name: r.person.name, entry: r.entry })),
      rows.filter((r) => r.gone && r.entry).map((r) => ({ name: r.person.name, entry: r.entry as DailyEntry })),
    );
  };

  /** 지금 보는 주간보고 글 - 확정했으면 그때의 저장본, 아니면 지금 모은 자료 */
  const weeklyCopy = () => {
    const report = store.weekly.find((w) => w.id === week);
    const fromSnapshot = report?.status === 'final' && !!report.snapshot;
    const data = fromSnapshot && report?.snapshot
      ? report.snapshot
      : makeSnapshot({ week, today, at: new Date().toISOString(), tasks, people: store.people, daily: store.daily });
    return weeklyText({
      monday: week, report,
      items: store.items.filter((x) => x.week === week).sort((a, b) => a.order - b.order),
      data, fromSnapshot, stage: stageOf(report, nameOf),
    });
  };

  const copyNow = () => (kind === 'daily'
    ? void copy('일간보고 글', dailyCopy(), `${dayLabel(day)} 일간보고를 글로 복사했습니다. 메신저나 메일에 붙여 넣으면 됩니다.`)
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
        ? `스크럼 순서대로 한 사람씩 완료 · 예정 · 블로커 & 공유사항을 적습니다. ${isRemote ? '적는 대로 저장되고 팀 모두에게 바로 보입니다.' : '적는 대로 이 브라우저에 저장됩니다.'}`
        : '한 주를 정리합니다. 직접 쓰는 칸과, 작업 보드 · 일간보고에서 저절로 모은 근거를 함께 봅니다.'}
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
                     [@media(pointer:coarse)]:min-h-11">
          <span aria-hidden className={`inline-block h-4 w-7 rounded-full p-0.5 transition-colors ${keys === 'on' ? 'bg-tm-blue' : 'bg-tm-edge'}`}>
            <span className={`block h-3 w-3 rounded-full bg-white transition-transform ${keys === 'on' ? 'translate-x-3' : ''}`} />
          </span>
          보고 단축키 S · W
        </button>
      </div>
      <button type="button" disabled={!usable} onClick={copyNow} className={`${tmBtnPrimary} max-[720px]:ml-auto max-[720px]:px-4`}>
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
            관리자: Supabase SQL Editor 에서 저장소의 supabase/taskmanager.sql 중 &lsquo;일간 · 주간보고&rsquo; 블록을 실행하면 열립니다.
            이미 있는 데이터는 그대로 둡니다.
          </p>
        )}
        <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={`${tmBtn} mt-2`}>
          {retrying ? '확인 중…' : '다시 확인'}
        </button>
      </div>
    );
  } else if (store.loadError) {
    // 읽지 못한 보고를 빈 보고로 보이지 않는다 - 쓰기 · 복사 · 확정을 막고 다시 읽게 한다
    body = (
      <div role="alert" className={messageCard}>
        <p className="text-[20px] font-extrabold text-tm-deep">보고를 불러오지 못했습니다</p>
        <p className="mb-3 max-w-[48ch] text-[15.5px] leading-[1.7] text-tm-ink">
          {store.loadError} 읽지 못한 동안에는 적기 · 복사 · 확정을 막아 둡니다.
        </p>
        <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtnPrimary}>
          {retrying ? '다시 읽는 중…' : '다시 시도'}
        </button>
      </div>
    );
  } else if (kind === 'daily') {
    body = (
      <DailyView store={store} day={day} today={today} me={me} members={members} tasks={tasks} canEditPeople={canEditPeople}
        onDay={setDay} onRoster={() => setRosterOpen(true)} onNotice={onNotice}
        onCopyLink={() => void copy('일간보고 링크', linkTo({ view: 'daily', date: day }), `${dayLabel(day)} 일간보고 링크를 복사했습니다.`)} />
    );
  } else {
    body = (
      <WeeklyView store={store} week={week} today={today} tasks={tasks} nameOf={nameOf}
        onWeek={setWeek} onTaskOpen={onTaskOpen} onOpenDay={(d) => { setDay(d); onKind('daily'); }} onNotice={onNotice}
        onCopyLink={() => void copy('주간보고 링크', linkTo({ view: 'weekly', week }), `${weekLabel(week).text} 주간보고 링크를 복사했습니다.`)} />
    );
  }

  return (
    <>
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
    </>
  );
}

/* ── 일간보고 ─────────────────────────────────────────────────── */

function DailyView({
  store, day, today, me, members, tasks, canEditPeople, onDay, onRoster, onCopyLink, onNotice,
}: {
  store: ReportStore;
  day: string;
  today: string;
  me: string;
  members: Member[];
  tasks: Task[];
  canEditPeople: boolean;
  onDay(d: string): void;
  onRoster(): void;
  onCopyLink(): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
}) {
  const uid = useId();
  const [view, setView] = useStoredChoice(DAILY_VIEW_KEY, 'write', VIEWS);
  const [picking, setPicking] = useState<{ person: ReportPerson; member: Member } | null>(null);
  const [planFor, setPlanFor] = useState<{ person: ReportPerson; prev: DailyEntry } | null>(null);
  /** 스크럼 진행 - 지금 말하는 사람(명단 줄 순번). 이 기기에서만, 저장하지 않는다 */
  const [speaker, setSpeaker] = useState<number | null>(null);
  const [boxRef, width] = useWidth();
  const rows = useMemo(() => dailyRows(store.people, store.daily, day), [store.people, store.daily, day]);
  const inRoster = rows.filter((r) => !r.gone);
  const gone = rows.filter((r) => r.gone);
  const written = inRoster.filter((r) => isFilled(r.entry));
  const waiting = inRoster.filter((r) => !isFilled(r.entry));
  const nameOf = (id: string | null) => (id ? members.find((m) => m.id === id)?.name ?? null : null);
  const set = (person: ReportPerson, patch: DailyPatch) => store.setDaily(day, person, patch);
  /** 넓으면 표(이름 + 세 칸), 좁으면 사람마다 카드. 카드 안 세 칸은 640 이상이면 나란히 */
  const table = width === 0 || width >= 900;
  const cardCols = width >= 640;
  const mine = inRoster.filter((r) => memberOfPerson(r.person, members)?.id === me);
  const fieldRefs = useRef(new Map<string, HTMLElement>());

  /* 날짜를 바꾸면 스크럼 진행을 멈춘다. 명단이 줄면 순번을 맞춘다 */
  useEffect(() => { setSpeaker(null); }, [day]);
  useEffect(() => {
    if (speaker !== null && speaker >= inRoster.length) setSpeaker(inRoster.length ? inRoster.length - 1 : null);
  }, [speaker, inRoster.length]);
  useEffect(() => { if (view === 'write') setSpeaker(null); }, [view]);

  /** 그 사람 줄로 - 작성 보기는 완료 칸에 초점, 읽기 보기는 이름 제목에 */
  const goTo = useCallback((id: string) => {
    const el = fieldRefs.current.get(id);
    if (!el) return;
    el.focus({ preventScroll: true });
    scrollWithin(el.closest('[data-person]') as HTMLElement ?? el, table ? 52 : 8);
  }, [table]);

  useEffect(() => {
    if (speaker === null) return;
    const r = inRoster[speaker];
    if (r) goTo(r.person.id);
    // 순번이 바뀔 때만 옮긴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaker]);

  const refFor = (id: string) => (el: HTMLElement | null) => {
    if (el) fieldRefs.current.set(id, el);
    else fieldRefs.current.delete(id);
  };

  return (
    <>
      {/* 날짜 · 작성 현황 · 보기 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-x-3 gap-y-2.5">
        <div role="group" aria-label="날짜" className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => onDay(stepWorkday(day, -1))} aria-label="이전 평일" title="이전 평일(토 · 일 건너뜀)" className={tmIconBtn}>
            <IconArrow dir="left" />
          </button>
          <DayPicker value={day} onPick={onDay} text={dayLabel(day)} label={`날짜 고르기, 지금 ${dayLabel(day, true)}`} />
          <button type="button" onClick={() => onDay(stepWorkday(day, 1))} aria-label="다음 평일" title="다음 평일(토 · 일 건너뜀)" className={tmIconBtn}>
            <IconArrow dir="right" />
          </button>
          {day !== today && <button type="button" onClick={() => onDay(today)} className={tmGhostBtn}>오늘</button>}
        </div>
        <p className="min-w-0 flex-[1_1_300px] text-[14.5px] leading-[1.6] text-tm-sub" aria-live="polite">
          <b className="font-bold text-tm-ink">작성 {written.length}/{inRoster.length}명</b>
          {waiting.length > 0 && inRoster.length > 0 && (
            <>
              <span aria-hidden> · </span>아직 안 쓴 사람{' '}
              {waiting.map((r, i) => (
                <span key={r.person.id}>
                  {i > 0 && <span aria-hidden> · </span>}
                  <button type="button" onClick={() => goTo(r.person.id)}
                    className="font-semibold text-tm-blue underline-offset-[3px] hover:underline [@media(pointer:coarse)]:py-2">
                    {r.person.name}
                  </button>
                </span>
              ))}
            </>
          )}
          {waiting.length === 0 && inRoster.length > 0 && <span> · 모두 적었습니다</span>}
          {gone.length > 0 && <span> · 명단에서 빠진 사람의 보고 {gone.length}건</span>}
        </p>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <Seg label="일간보고 보기" value={view} onPick={setView} options={[
            { id: 'write', label: '작성', title: '칸에 바로 적습니다' },
            { id: 'read', label: '읽기', title: '글만 봅니다. 스크럼을 함께 볼 때' },
          ]} />
          {view === 'read' && inRoster.length > 0 && speaker === null && (
            <button type="button" onClick={() => setSpeaker(0)} className={tmGhostBtn}>스크럼 진행</button>
          )}
          {mine.length === 1 && (
            <button type="button" onClick={() => goTo(mine[0].person.id)} className={tmGhostBtn}>내 줄로</button>
          )}
          {mine.length > 1 && (
            <>
              <label htmlFor={`${uid}-mine`} className="sr-only">내 줄로</label>
              <select id={`${uid}-mine`} value="" onChange={(e) => { if (e.target.value) goTo(e.target.value); }}
                className={`${tmSelect} h-[38px] text-[14px] [@media(pointer:coarse)]:h-11`}>
                <option value="">내 줄로</option>
                {mine.map((r) => <option key={r.person.id} value={r.person.id}>{r.person.name}</option>)}
              </select>
            </>
          )}
          {canEditPeople && <button type="button" onClick={onRoster} className={tmGhostBtn}>명단 관리</button>}
          <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        </div>
      </div>

      {/* 스크럼 진행 막대 - 읽기 보기에서만 */}
      {view === 'read' && speaker !== null && inRoster[speaker] && (
        <div role="group" aria-label="스크럼 진행"
          className="mb-3 flex flex-none flex-wrap items-center gap-2 rounded-tm-sm border border-tm-blue bg-tm-tint px-3.5 py-2.5">
          <p className="min-w-0 flex-[1_1_200px] text-[14.5px] font-bold text-tm-deep" aria-live="polite">
            지금 {inRoster[speaker].person.name} <span className="font-semibold text-tm-sub">({speaker + 1}/{inRoster.length})</span>
          </p>
          <button type="button" onClick={() => setSpeaker(speaker - 1)} disabled={speaker === 0} className={tmGhostBtn}>이전 사람</button>
          <button type="button" onClick={() => setSpeaker(speaker + 1)} disabled={speaker >= inRoster.length - 1} className={tmGhostBtn}>다음 사람</button>
          <button type="button" onClick={() => setSpeaker(null)} className={tmGhostBtn}>진행 종료</button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className={messageCard}>
          <p className="text-[20px] font-extrabold text-tm-deep">명단이 비어 있습니다</p>
          <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">
            {canEditPeople ? '일간보고를 쓸 사람을 명단에 넣어 주세요.' : '관리자가 명단을 채우면 여기에 한 사람씩 줄이 생깁니다.'}
          </p>
          {canEditPeople && <button type="button" onClick={onRoster} className={tmBtnPrimary}>명단 관리</button>}
        </div>
      ) : (
        <div ref={boxRef}
          className={`min-h-0 flex-1 overflow-y-auto max-[900px]:flex-none max-[900px]:overflow-visible ${
            view === 'write' && table ? 'rounded-tm border border-tm-line bg-white shadow-tm' : 'p-0.5'}`}>
          {view === 'write' ? (
            <>
              {table && (
                <div aria-hidden
                  className="sticky top-0 z-10 grid grid-cols-[minmax(150px,190px)_repeat(3,minmax(0,1fr))] divide-x divide-tm-line border-b border-tm-line bg-tm-bg
                             text-[13.5px] font-bold text-tm-ink">
                  <div className="px-4 py-2.5">이름</div>
                  {DAILY_FIELDS.map((f) => (
                    <div key={f.id} className="min-w-0 px-4 py-2.5">
                      {f.label}
                      <span className="ml-1.5 font-semibold text-tm-sub max-[1180px]:hidden">{f.hint}</span>
                    </div>
                  ))}
                </div>
              )}
              <ol className={table ? '' : 'flex flex-col gap-3'}>
                {rows.map((r) => {
                  const member = r.gone ? null : memberOfPerson(r.person, members);
                  const isMe = !!member && member.id === me;
                  const prev = lastPlan(store.daily, r.person.id, day);
                  const prevLeft = prev ? linesOf(prev.plan).filter((l) => !linesOf(r.entry?.done ?? '').includes(l)) : [];
                  const editor = nameOf(r.entry?.updatedBy ?? null);
                  const hid = `${uid}-${r.person.id}-h`;
                  return (
                    <li key={r.person.id} data-person aria-labelledby={hid}
                      className={table
                        ? `grid grid-cols-[minmax(150px,190px)_repeat(3,minmax(0,1fr))] divide-x divide-tm-line border-b border-tm-line last:border-b-0 ${isMe ? 'bg-tm-tint' : ''}`
                        : `rounded-tm border bg-white shadow-tm ${isMe ? 'border-tm-blue' : 'border-tm-line'}`}>
                      <div className={`flex min-w-0 items-start gap-3 px-4 ${table ? 'py-3' : 'border-b border-tm-line py-3'} ${!table && isMe ? 'bg-tm-tint' : ''}`}>
                        <PersonMark name={r.person.name} member={member} />
                        <div className="min-w-0 flex-1">
                          <h3 id={hid} className="flex min-w-0 items-center gap-1.5 text-[15px] font-bold leading-[1.4] text-tm-ink">
                            <span className="truncate">{r.person.name}</span>
                            {isMe && <span className="flex-none rounded-full bg-tm-blue px-2 py-px text-[11.5px] font-bold text-white">나</span>}
                          </h3>
                          <p className="mt-0.5 text-[12.5px] leading-[1.45] text-tm-sub">
                            {r.gone
                              ? '명단에서 빠진 사람'
                              : isFilled(r.entry) && r.entry
                                ? `${whenOf(r.entry.updatedAt, today)}${editor ? ` · ${editor}` : ''}${editor && member && r.entry.updatedBy !== member.id ? ' 님이 대신 적음' : ''}`
                                : '아직 안 씀'}
                          </p>
                          {member && (
                            <button type="button" onClick={() => setPicking({ person: r.person, member })} className={`${linkBtn} mt-1`}>
                              작업에서 넣기
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={table ? 'contents' : `grid gap-3 px-4 py-3 ${cardCols ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {DAILY_FIELDS.map((f) => {
                          const id = `${uid}-${r.person.id}-${f.id}`;
                          return (
                            <div key={f.id} className={`min-w-0 ${table ? 'p-1.5' : ''}`}>
                              <label htmlFor={id} className={table ? 'sr-only' : 'mb-1 block text-[13px] font-bold text-tm-sub'}>
                                <span className="sr-only">{r.person.name} </span>{f.label}
                              </label>
                              <AutoText id={id} value={r.entry?.[f.id] ?? ''} placeholder={f.hint} max={DAILY_MAX}
                                className={table ? cellTable : cellCard}
                                inputRef={f.id === 'done' ? refFor(r.person.id) : undefined}
                                onChange={(v) => set(r.person, { [f.id]: v } as DailyPatch)} />
                              {f.id === 'done' && prev && prevLeft.length > 0 && (
                                <button type="button" onClick={() => setPlanFor({ person: r.person, prev })}
                                  className={`${linkBtn} ${table ? 'mx-2.5 mb-1' : 'mt-1'}`}>
                                  지난 예정 확인 · {dotDay(prev.day)}({weekdayOf(prev.day)})
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <ol className="flex flex-col gap-3" aria-label={`${dayLabel(day)} 일간보고`}>
              {rows.map((r, i) => {
                const member = r.gone ? null : memberOfPerson(r.person, members);
                const isMe = !!member && member.id === me;
                const now = speaker !== null && !r.gone && i === speaker;
                const hid = `${uid}-${r.person.id}-rh`;
                const filled = isFilled(r.entry);
                return (
                  <li key={r.person.id} data-person aria-labelledby={hid} aria-current={now ? 'step' : undefined}
                    className={`rounded-tm border bg-white px-5 py-3.5 shadow-tm max-[720px]:px-4 ${
                      now ? 'border-tm-blue bg-tm-tint ring-2 ring-tm-blue' : isMe ? 'border-tm-blue' : 'border-tm-line'}`}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <PersonMark name={r.person.name} member={member} size={28} />
                      <h3 id={hid} ref={refFor(r.person.id)} tabIndex={-1} className="text-[16px] font-extrabold text-tm-deep focus:outline-none">
                        {r.person.name}
                        {r.gone && <span className="ml-1.5 text-[13px] font-semibold text-tm-sub">(명단에서 빠진 사람)</span>}
                      </h3>
                      {now && <span className="rounded-full bg-tm-blue px-2 py-px text-[12px] font-bold text-white">지금</span>}
                      {!filled && <span className="text-[14px] font-semibold text-tm-sub">미작성</span>}
                    </div>
                    {filled && r.entry && (
                      <dl className={`mt-2 grid gap-x-6 gap-y-2 ${width >= 760 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {DAILY_FIELDS.map((f) => {
                          const text = (r.entry as DailyEntry)[f.id as DailyField].trim();
                          return (
                            <div key={f.id} className="min-w-0">
                              <dt className="text-[13px] font-bold text-tm-sub">{f.label}</dt>
                              <dd className={`mt-0.5 whitespace-pre-line text-[15px] leading-[1.65] [overflow-wrap:anywhere] ${text ? 'text-tm-ink' : 'text-tm-sub'}`}>
                                {text || '(미작성)'}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {planFor && (
        <PlanDialog person={planFor.person} prev={planFor.prev}
          entry={store.daily.find((e) => e.day === day && e.person === planFor.person.id)}
          onAdd={(done) => set(planFor.person, { done })}
          onNotice={onNotice}
          onClose={() => setPlanFor(null)} />
      )}
      {picking && (
        <PickDialog person={picking.person} member={picking.member} day={day} today={today} tasks={tasks}
          entry={store.daily.find((e) => e.day === day && e.person === picking.person.id)}
          onAdd={(patch) => set(picking.person, patch)}
          onNotice={onNotice}
          onClose={() => setPicking(null)} />
      )}
    </>
  );
}

/** 지난 예정 확인 - 지난 근무일에 적은 예정 가운데 실제로 끝낸 줄만 골라 완료 칸에 붙인다(기본은 아무것도 고르지 않음) */
function PlanDialog({ person, prev, entry, onAdd, onNotice, onClose }: {
  person: ReportPerson;
  prev: DailyEntry;
  entry: DailyEntry | undefined;
  onAdd(done: string): boolean;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  onClose(): void;
}) {
  const uid = useId();
  const lines = linesOf(prev.plan);
  const have = new Set(linesOf(entry?.done ?? ''));
  const [pick, setPick] = useState<Set<number>>(() => new Set());
  const chosen = lines.filter((l, i) => pick.has(i) && !have.has(l));
  const submit = () => {
    const next = appendLines(entry?.done ?? '', chosen);
    if (next.length > DAILY_MAX) {
      onNotice(limitText(next.length, DAILY_MAX), 'err');
      return;
    }
    if (onAdd(next)) onClose();
  };
  return (
    <Modal title={`${person.name} · 지난 예정 확인`} sub={`${dayLabel(prev.day)}에 적은 예정입니다. 실제로 끝낸 것만 골라 완료 칸에 붙입니다.`}
      onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>취소</button>
          <button type="button" onClick={submit} disabled={chosen.length === 0} className={tmBtnPrimary}>
            {chosen.length ? `선택한 완료 넣기 (${chosen.length})` : '선택한 완료 넣기'}
          </button>
        </>
      }>
      <p className={`${tmCallout} mb-4`}>예정은 계획입니다. 끝내지 못한 일은 고르지 마세요. 고르지 않으면 아무것도 바뀌지 않습니다.</p>
      <ul className="flex flex-col gap-1">
        {lines.map((l, i) => {
          const already = have.has(l);
          const id = `${uid}-${i}`;
          return (
            <li key={i}>
              <label htmlFor={id}
                className={`flex cursor-pointer items-start gap-3 rounded-tm-sm px-3 py-2.5 transition-colors duration-150 hover:bg-tm-tint ${already ? 'opacity-60' : ''}`}>
                <input id={id} type="checkbox" checked={!already && pick.has(i)} disabled={already}
                  onChange={() => setPick((s) => {
                    const n = new Set(s);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    return n;
                  })}
                  className="mt-1 h-4 w-4 flex-none accent-[#2644cb]" />
                <span className="min-w-0 flex-1 text-[15px] leading-[1.55] text-tm-ink [overflow-wrap:anywhere]">
                  {l}
                  {already && <span className="ml-2 text-[12.5px] font-semibold text-tm-sub">이미 완료 칸에 있음</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

/** 작업에서 넣기 - 그 사람이 맡은 작업 가운데 실제로 끝낸 것 · 할 것을 골라 칸 끝에 붙인다(기본은 아무것도 고르지 않음) */
function PickDialog({ person, member, day, today, tasks, entry, onAdd, onNotice, onClose }: {
  person: ReportPerson;
  member: Member;
  day: string;
  today: string;
  tasks: Task[];
  entry: DailyEntry | undefined;
  onAdd(patch: DailyPatch): boolean;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  onClose(): void;
}) {
  const uid = useId();
  /** 지난 평일부터 그날까지 완료 상태로 마지막으로 고친 작업 - 완료한 날짜가 아닐 수 있다 */
  const since = stepWorkday(day, -1);
  const mine = tasks.filter((t) => t.assignee === member.id);
  const doneList = mine
    .filter((t) => t.status === 'done' && localDay(t.updatedAt) >= since && localDay(t.updatedAt) <= day)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  /** 진행 중 · 검토, 그리고 사흘 안에 마감인 할 일 - 지금 작업 상태 기준 */
  const soon = addDays(day, 3);
  const planList = mine
    .filter((t) => t.status !== 'done' && (t.status === 'doing' || t.status === 'review' || (!!t.due && t.due <= soon)))
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.key.localeCompare(b.key));
  const lineOf = (t: Task) => `${t.key} ${t.title.trim() || '제목 없음'}`;
  const inText = (text: string | undefined, t: Task) => !!text && hasTaskKey(text, t.key);
  const [pick, setPick] = useState<Set<string>>(() => new Set());
  const toggle = (k: string) => setPick((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  /* 넣기 직전의 최신 글로 다시 거른다 - 창을 연 사이 다른 사람이 같은 작업을 적었을 수 있다 */
  const chosen = (field: 'done' | 'plan', list: Task[]) =>
    list.filter((t) => pick.has(`${field}:${t.id}`) && !inText(field === 'done' ? entry?.done : entry?.plan, t)).map(lineOf);
  const count = chosen('done', doneList).length + chosen('plan', planList).length;
  const submit = () => {
    const done = chosen('done', doneList);
    const plan = chosen('plan', planList);
    const patch: DailyPatch = {};
    if (done.length) patch.done = appendLines(entry?.done ?? '', done);
    if (plan.length) patch.plan = appendLines(entry?.plan ?? '', plan);
    const over = Math.max(patch.done?.length ?? 0, patch.plan?.length ?? 0);
    if (over > DAILY_MAX) {
      onNotice(limitText(over, DAILY_MAX), 'err');
      return;
    }
    if (!Object.keys(patch).length || onAdd(patch)) onClose();
  };

  const list = (field: 'done' | 'plan', items: Task[], empty: string) => (
    items.length === 0 ? (
      <p className="rounded-tm-sm bg-tm-bg px-3.5 py-3 text-[14px] text-tm-sub">{empty}</p>
    ) : (
      <ul className="flex flex-col gap-1">
        {items.map((t) => {
          const k = `${field}:${t.id}`;
          const already = inText(field === 'done' ? entry?.done : entry?.plan, t);
          return (
            <li key={t.id}>
              <label htmlFor={`${uid}-${k}`}
                className={`flex cursor-pointer items-start gap-3 rounded-tm-sm px-3 py-2.5 transition-colors duration-150 hover:bg-tm-tint ${already ? 'opacity-60' : ''}`}>
                <input id={`${uid}-${k}`} type="checkbox" checked={!already && pick.has(k)} disabled={already} onChange={() => toggle(k)}
                  className="mt-1 h-4 w-4 flex-none accent-[#2644cb]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold leading-[1.5] text-tm-ink">
                    <span className="mr-1.5 text-[13px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                    {t.title || '제목 없음'}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusPill s={t.status} />
                    <DueBadge due={t.due} done={t.status === 'done'} />
                    {field === 'done' && <span className="text-[12.5px] font-semibold text-tm-sub">마지막 수정 {dotDay(localDay(t.updatedAt))}</span>}
                    {already && <span className="text-[12.5px] font-semibold text-tm-sub">이미 칸에 있음</span>}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    )
  );

  return (
    <Modal title={`${person.name} · 작업에서 넣기`} sub={`${member.name} 님이 맡은 작업입니다. 고른 작업만 칸 끝에 한 줄씩 붙입니다.`}
      onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>취소</button>
          <button type="button" onClick={submit} disabled={count === 0} className={tmBtnPrimary}>
            {count ? `${count}개 넣기` : '넣기'}
          </button>
        </>
      }>
      <h3 className="mb-1 text-[15px] font-extrabold text-tm-deep">완료 칸 후보 <span className="font-semibold text-tm-sub">· 완료 상태인 최근 수정 작업</span></h3>
      <p className="mb-2 text-[13.5px] leading-[1.6] text-tm-sub">
        {dotDay(since)}({weekdayOf(since)}) ~ {dotDay(day)}({weekdayOf(day)})에 마지막으로 고친 완료 작업입니다.
        완료한 날짜가 아닐 수 있습니다. 실제로 끝낸 작업을 골라 주세요.
      </p>
      {list('done', doneList, '이 기간에 고친 완료 작업이 없습니다.')}
      <h3 className="mb-1 mt-5 text-[15px] font-extrabold text-tm-deep">예정 칸 후보 <span className="font-semibold text-tm-sub">· 진행 중 · 검토, 사흘 안 마감</span></h3>
      {day < today && <p className="mb-2 text-[13.5px] leading-[1.6] text-tm-sub">지난 날짜의 보고입니다. 후보는 그날이 아닌 지금 작업 상태를 따릅니다.</p>}
      {list('plan', planList, '진행 중이거나 곧 마감인 작업이 없습니다.')}
    </Modal>
  );
}

/** 명단 관리 - 관리자만 연다. 이름 · 순서 · 계정 연결을 고치고 사람을 더하거나 뺀다 */
function RosterDialog({ store, members, local, onClose }: { store: ReportStore; members: Member[]; local: boolean; onClose(): void }) {
  const uid = useId();
  const [confirm, confirmNode] = useConfirm();
  const [fresh, setFresh] = useState<string | null>(null);
  const people = store.people;
  const small = 'mb-1 block text-[12.5px] font-bold text-tm-sub';

  const add = () => {
    let name = '새 사람';
    for (let k = 2; people.some((p) => p.name === name); k += 1) name = `새 사람 ${k}`;
    setFresh(store.addPerson(name).id);
  };
  const move = (id: string, dir: -1 | 1) => reorderPeople(people, id, dir).forEach((p) => store.updatePerson(p.id, { order: p.order }));
  const remove = async (p: ReportPerson) => {
    const yes = await confirm({
      title: `'${p.name}' 을(를) 명단에서 뺄까요?`,
      body: <>이미 적은 일간보고는 지우지 않습니다. 그날 보고 맨 아래에 <b>명단에서 빠진 사람</b>으로 남습니다.</>,
      ok: '빼기',
      tone: 'danger',
    });
    if (yes) store.removePerson(p.id);
  };

  return (
    <>
      <Modal title="일간보고 명단" sub={local ? '이 브라우저에만 저장됩니다' : '관리자만 고칠 수 있습니다. 고친 것은 팀 모두에게 바로 보입니다.'}
        onClose={onClose}
        foot={<><span className="flex-1" /><button type="button" onClick={onClose} className={tmBtn}>닫기</button></>}>
        {people.length === 0 && <p className="rounded-tm-sm bg-tm-bg px-3.5 py-3 text-[14.5px] text-tm-sub">명단이 비어 있습니다. 아래에서 사람을 넣어 주세요.</p>}
        <ol className="flex flex-col gap-2">
          {people.map((p, i) => {
            const others = people.filter((o) => o.id !== p.id).map((o) => o.name);
            const auto = p.member ? null : memberOfPerson(p, members);
            const choices = members.filter((m) => m.active !== false || m.id === p.member);
            return (
              <li key={p.id} className="rounded-tm-sm bg-tm-bg px-3.5 py-3">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2.5">
                  <span className="w-6 flex-none pb-2.5 text-center text-[14px] font-bold tabular-nums text-tm-sub" aria-hidden>{i + 1}</span>
                  <div className="min-w-0 flex-[1_1_150px]">
                    <label className={small} htmlFor={`${uid}-${p.id}-name`}>이름</label>
                    <CommitInput id={`${uid}-${p.id}-name`} value={p.name} max={20} autoFocus={fresh === p.id}
                      check={(v) => (!v ? '이름을 적어 주세요' : others.includes(v) ? '같은 이름이 명단에 있습니다' : null)}
                      onSave={(v) => store.updatePerson(p.id, { name: v })} />
                  </div>
                  <div className="min-w-0 flex-[1_1_190px]">
                    <label className={small} htmlFor={`${uid}-${p.id}-member`}>계정 연결</label>
                    <select id={`${uid}-${p.id}-member`} value={p.member ?? ''} className={`${tmSelect} h-11 w-full text-[15px]`}
                      onChange={(e) => store.updatePerson(p.id, { member: e.target.value || null })}>
                      <option value="">{auto ? `자동 · ${auto.name}` : '연결 안 함'}</option>
                      {choices.map((m) => <option key={m.id} value={m.id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>)}
                    </select>
                  </div>
                  <span className="ml-auto flex flex-none items-center gap-1.5">
                    <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0} aria-label={`${p.name} 위로`} title="위로" className={tmIconBtn}>
                      <IconArrow dir="up" />
                    </button>
                    <button type="button" onClick={() => move(p.id, 1)} disabled={i === people.length - 1} aria-label={`${p.name} 아래로`} title="아래로" className={tmIconBtn}>
                      <IconArrow dir="down" />
                    </button>
                    <button type="button" onClick={() => void remove(p)} aria-label={`${p.name} 빼기`} className={tmGhostDanger}>빼기</button>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <button type="button" onClick={add} className={`${tmGhostBtn} mt-3`}>
          <IconPlus size={16} />
          사람 추가
        </button>
        <div className={`${tmCallout} mt-5`}>
          <p className="min-w-0">
            스크럼 순서대로 줄을 세웁니다. 이름은 칸을 떠나거나 Enter 를 누르면 저장됩니다.
            계정을 연결하면 그 사람 줄에 &lsquo;나&rsquo; 표시 · &lsquo;내 줄로&rsquo; · &lsquo;작업에서 넣기&rsquo;가 생깁니다. 자동이면 이름이 같은 계정을 씁니다.
          </p>
        </div>
      </Modal>
      {confirmNode}
    </>
  );
}

/* ── 주간보고 ─────────────────────────────────────────────────── */

const STATE_STYLE: Record<ProjectState, string> = {
  good: 'aria-pressed:border-tm-ok aria-pressed:bg-tm-ok aria-pressed:text-white',
  watch: 'aria-pressed:border-tm-warn aria-pressed:bg-tm-warn aria-pressed:text-white',
  risk: 'aria-pressed:border-tm-red aria-pressed:bg-tm-red aria-pressed:text-white',
};
const STATE_DOT: Record<ProjectState, string> = { good: 'bg-tm-ok', watch: 'bg-tm-warn', risk: 'bg-tm-red' };
const STATE_NAME: Record<ProjectState, string> = { good: '순조', watch: '주의', risk: '위험' };

function WeeklyView({
  store, week, today, tasks, nameOf, onWeek, onTaskOpen, onOpenDay, onNotice, onCopyLink,
}: {
  store: ReportStore;
  week: string;
  today: string;
  tasks: Task[];
  nameOf(id: string | null): string | null;
  onWeek(w: string): void;
  onTaskOpen(id: string): void;
  onOpenDay(day: string): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  onCopyLink(): void;
}) {
  const uid = useId();
  const [confirm, confirmNode] = useConfirm();
  /** 1200 아래에서는 작성과 근거를 탭으로 오간다 */
  const narrow = useMediaQuery('(max-width: 1199px)');
  const [tab, setTab] = useState<'write' | 'evidence'>('write');
  /** 확정한 보고에서 지금 작업 보드 값을 따로 본다 */
  const [showLive, setShowLive] = useState(false);
  const [busy, setBusy] = useState<'finalize' | 'reopen' | null>(null);
  /** 방금 이슈 칸에 붙인 블로커 - 좁은 화면에서 '이슈 칸 보기'를 붙인다 */
  const [pasted, setPasted] = useState<string | null>(null);
  const issuesRef = useRef<HTMLTextAreaElement | null>(null);
  /* 주를 바꾸면 맨 위부터 - 다른 주의 글이라 보던 자리가 이어지지 않는다 */
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
    setShowLive(false);
    setPasted(null);
  }, [week]);

  const report = store.weekly.find((w) => w.id === week);
  const final = report?.status === 'final';
  const items = useMemo(() => store.items.filter((x) => x.week === week).sort((a, b) => a.order - b.order), [store.items, week]);
  const prevWeek = addDays(week, -7);
  const prevItems = useMemo(() => store.items.filter((x) => x.week === prevWeek).sort((a, b) => a.order - b.order), [store.items, prevWeek]);
  const label = weekLabel(week);
  const prevLabel = weekLabel(prevWeek);
  const thisWeek = weekOf(today);
  const live = useMemo(
    () => makeSnapshot({ week, today, at: new Date().toISOString(), tasks, people: store.people, daily: store.daily }),
    [week, today, tasks, store.people, store.daily],
  );
  const fromSnapshot = final && !!report?.snapshot && !showLive;
  const data: WeeklySnapshot = fromSnapshot && report?.snapshot ? report.snapshot : live;
  const days = workdaysOf(week);
  const count = writtenCount(data, week);

  /* 마지막 수정 - 본문과 이 주 프로젝트 줄 가운데 가장 늦은 것(확정 정보와는 따로) */
  const lastEdit = [report, ...items]
    .filter((x): x is WeeklyReport | WeeklyItem => !!x)
    .reduce<{ at: string; by: string | null } | null>((best, x) => (!best || x.updatedAt > best.at ? { at: x.updatedAt, by: x.updatedBy } : best), null);

  const setText = (k: WeeklyText, v: string) => store.setWeekly(week, { [k]: v } as WeeklyPatch);

  const toIssues = (b: { person: string; name: string; day: string; text: string }) => {
    const line = `${b.name} · ${dotDay(b.day)}(${weekdayOf(b.day)}): ${linesOf(b.text).join(' / ')}`;
    const cur = report?.issues ?? '';
    const next = appendLines(cur, [line]);
    if (next === cur) {
      onNotice('이미 이슈 칸에 있는 내용입니다.', 'err');
      return;
    }
    if (next.length > WEEKLY_MAX) {
      onNotice(limitText(next.length, WEEKLY_MAX), 'err');
      return;
    }
    if (!setText('issues', next)) return;
    setPasted(`${b.person}:${b.day}`);
    onNotice('이슈 · 리스크 칸 끝에 붙였습니다.', 'ok');
  };

  const showIssues = () => {
    setTab('write');
    requestAnimationFrame(() => {
      const el = issuesRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      scrollWithin(el, 16);
    });
  };

  const carryOver = () => {
    let n = 0;
    prevItems.forEach((it) => { if (store.addItem(week, { name: it.name, state: it.state })) n += 1; });
    if (n) onNotice(`지난주 프로젝트 ${n}개의 이름 · 상태를 가져왔습니다. 지난주 계획은 줄마다 '지난주 계획 참고'에서 볼 수 있습니다.`, 'ok');
  };

  const removeItem = async (it: WeeklyItem, name: string) => {
    const filled = !!(it.name.trim() || it.done.trim() || it.next.trim() || it.issue.trim());
    if (filled) {
      const yes = await confirm({ title: `'${name}' 줄을 지울까요?`, body: '지운 줄은 되돌릴 수 없습니다.', ok: '지우기', tone: 'danger' });
      if (!yes) return;
    }
    store.removeItem(it.id);
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const cur = items.slice();
    [cur[i], cur[j]] = [cur[j], cur[i]];
    cur.forEach((x, k) => { if (x.order !== (k + 1) * 1000) store.updateItem(x.id, { order: (k + 1) * 1000 }); });
  };

  const doFinalize = async () => {
    setBusy('finalize');
    const r = await store.finalize(week, makeSnapshot({ week, today, at: new Date().toISOString(), tasks, people: store.people, daily: store.daily }));
    setBusy(null);
    if (r.ok) onNotice(`${label.text} 주간보고를 확정했습니다. 칸이 잠기고 지금의 근거가 확정 자료로 남습니다.`, 'ok');
    else onNotice(r.error, 'err');
  };
  const doReopen = async () => {
    setBusy('reopen');
    const r = await store.reopen(week);
    setBusy(null);
    if (r.ok) onNotice('다시 고칠 수 있습니다. 근거는 지금 기준으로 다시 모입니다.', 'ok');
    else onNotice(r.error, 'err');
  };

  const textCard = (k: WeeklyText, title: string, hint: string, placeholder: string, rows = 3) => (
    <Card id={`${uid}-${k}`} title={title} sub={hint}>
      <label htmlFor={`${uid}-${k}-t`} className="sr-only">{title}</label>
      <AutoText id={`${uid}-${k}-t`} value={report?.[k] ?? ''} rows={rows} max={WEEKLY_MAX} readOnly={final}
        inputRef={k === 'issues' ? (el) => { issuesRef.current = el; } : undefined}
        placeholder={placeholder} className={fieldText} onChange={(v) => setText(k, v)} />
    </Card>
  );

  const finalizer = nameOf(report?.finalizedBy ?? null);
  const showWrite = !narrow || tab === 'write';
  const showEvidence = !narrow || tab === 'evidence';

  /* 사람별 완료 - 저장본(또는 지금 모은 것)의 완료 줄을 사람마다. 명단 순서 뒤에 명단에서 빠진 사람 */
  const doneBy = useMemo(() => {
    const order = new Map(data.people.map((p, i) => [p.id, i]));
    const groups = new Map<string, { person: string; name: string; gone: boolean; lines: { day: string; text: string }[] }>();
    data.done.forEach((d) => {
      const g = groups.get(d.person) ?? { person: d.person, name: d.name, gone: !order.has(d.person), lines: [] };
      linesOf(d.text).forEach((l) => g.lines.push({ day: d.day, text: l }));
      groups.set(d.person, g);
    });
    return [...groups.values()].sort((a, b) => (order.get(a.person) ?? 1e9) - (order.get(b.person) ?? 1e9) || a.name.localeCompare(b.name, 'ko'));
  }, [data]);
  const writtenSet = useMemo(() => new Set(data.written.map((w) => `${w.person}:${w.day}`)), [data]);

  return (
    <>
      {/* 주 고르기 · 확정 */}
      <div className="mb-3 flex flex-none flex-wrap items-center gap-x-3 gap-y-2.5">
        <div role="group" aria-label="주" className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => onWeek(addDays(week, -7))} aria-label="지난주" title="지난주" className={tmIconBtn}>
            <IconArrow dir="left" />
          </button>
          <DayPicker value={week} onPick={(d) => onWeek(weekOf(d))} label={`주 고르기, 지금 ${label.year}년 ${label.text}`}
            text={`${label.text} · ${label.range}`} />
          <button type="button" onClick={() => onWeek(addDays(week, 7))} aria-label="다음 주" title="다음 주" className={tmIconBtn}>
            <IconArrow dir="right" />
          </button>
          {week !== thisWeek && <button type="button" onClick={() => onWeek(thisWeek)} className={tmGhostBtn}>이번 주</button>}
        </div>
        <p className="min-w-0 flex-[1_1_220px] text-[14px] text-tm-sub">
          {lastEdit
            ? <>마지막 수정 {whenOf(lastEdit.at, today)}{nameOf(lastEdit.by) ? ` · ${nameOf(lastEdit.by)}` : ''}</>
            : '아직 아무도 쓰지 않았습니다'}
        </p>
        <span className="flex flex-none flex-wrap items-center gap-2">
          {final ? (
            <>
              <span className="inline-flex h-[38px] items-center gap-1.5 rounded-full bg-tm-ok-tint px-3.5 text-[13.5px] font-bold text-tm-ok-deep">
                <i className="h-2 w-2 rounded-full bg-tm-ok" aria-hidden />확정됨
              </span>
              <button type="button" onClick={() => void doReopen()} disabled={busy !== null} className={tmGhostBtn}>
                {busy === 'reopen' ? '여는 중…' : '다시 고치기'}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => void doFinalize()} disabled={busy !== null} className={tmEditBtn}>
              {busy === 'finalize' ? '확정하는 중…' : '확정하기'}
            </button>
          )}
          <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        </span>
      </div>

      {/* 확정 정보 - 서버(또는 이 브라우저)가 남긴 확정자 · 시각 */}
      {(final || report?.finalizedAt) && (
        <p className="mb-3 flex-none text-[14px] font-semibold text-tm-ink" aria-live="polite">
          {final
            ? report?.snapshot && report.finalizedAt
              ? <>확정 · {stampLabel(report.finalizedAt)}{finalizer ? ` · ${finalizer}` : ''}</>
              : <>확정됨 · <span className="text-tm-red-deep">확정 시점 자료 없음</span> · 아래 근거는 지금 기준입니다</>
            : report?.finalizedAt
              ? <>작성 중 · <span className="font-normal text-tm-sub">직전 확정 {stampLabel(report.finalizedAt)}{finalizer ? ` · ${finalizer}` : ''}</span></>
              : null}
        </p>
      )}

      {narrow && (
        <div className="mb-3 flex-none">
          <Seg<'write' | 'evidence'> label="주간보고 보기" value={tab} onPick={setTab} options={[
            { id: 'write', label: '보고 작성' },
            { id: 'evidence', label: '근거 보기' },
          ]} />
        </div>
      )}

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto max-[900px]:flex-none max-[900px]:overflow-visible">
        {final && showWrite && (
          <div className={`${tmCallout} mb-4`}>
            <p className="min-w-0 flex-[1_1_320px]">확정된 주간보고입니다. 칸이 잠겨 있습니다. 고치려면 &lsquo;다시 고치기&rsquo;를 누르세요.</p>
          </div>
        )}
        <div className="grid items-start gap-5 min-[1200px]:grid-cols-[minmax(0,1fr)_380px]">
          {/* 직접 쓰는 칸 */}
          {showWrite && (
            <div className="flex min-w-0 flex-col gap-5">
              {textCard('summary', '한 주 요약', '대표와 팀이 먼저 읽는 칸', '이번 주 가장 중요한 결과를 세 줄 안으로 적습니다.')}

              <Card id={`${uid}-items`} title="프로젝트별 현황" sub="프로젝트마다 상태 · 한 일 · 다음 주 할 일 · 이슈"
                action={!final && (
                  <>
                    {items.length === 0 && prevItems.length > 0 && (
                      <button type="button" onClick={carryOver} className={tmGhostBtn}>지난주에서 이어 쓰기 ({prevItems.length})</button>
                    )}
                    <button type="button" onClick={() => store.addItem(week)} className={tmGhostBtn}>
                      <IconPlus size={16} />
                      프로젝트 추가
                    </button>
                  </>
                )}>
                {items.length === 0 ? (
                  <p className="rounded-tm-sm bg-tm-bg px-4 py-3.5 text-[14.5px] leading-[1.65] text-tm-sub">
                    아직 프로젝트 줄이 없습니다.
                    {!final && (prevItems.length > 0
                      ? ' 지난주 줄의 이름 · 상태를 이어 쓰거나 새로 추가합니다.'
                      : ' 진행 중인 프로젝트마다 한 줄씩 추가합니다.')}
                  </p>
                ) : (
                  <ol className="flex flex-col gap-3">
                    {items.map((it, i) => {
                      const name = it.name.trim() || `${i + 1}번째 프로젝트`;
                      const before = prevItems.find((p) => p.name.trim() && p.name.trim() === it.name.trim() && p.next.trim());
                      return (
                        <li key={it.id} aria-label={`프로젝트 ${name}`} className="rounded-tm-sm border border-tm-line p-3.5 max-[720px]:p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <i className={`h-2.5 w-2.5 flex-none rounded-full ${STATE_DOT[it.state]}`} aria-hidden />
                            <label htmlFor={`${uid}-${it.id}-name`} className="sr-only">{`${i + 1}번째 프로젝트 이름`}</label>
                            <input id={`${uid}-${it.id}-name`} value={it.name} maxLength={ITEM_NAME_MAX} readOnly={final} placeholder="프로젝트 이름"
                              onChange={(e) => store.updateItem(it.id, { name: e.target.value })}
                              className={`${tmFieldBase} h-11 min-w-0 flex-[1_1_200px] px-3 text-[16px] font-bold read-only:bg-tm-bg`} />
                            <div role="group" aria-label={`${name} 상태, 지금 ${STATE_NAME[it.state]}`} className="flex flex-none items-center gap-1">
                              {PROJECT_STATES.map((s) => (
                                <button key={s.id} type="button" aria-pressed={it.state === s.id} disabled={final}
                                  onClick={() => { if (it.state !== s.id) store.updateItem(it.id, { state: s.id }); }}
                                  className={`inline-flex h-9 items-center rounded-full border border-tm-edge bg-white px-3 text-[13.5px] font-bold text-tm-ink
                                              transition-colors duration-150 enabled:hover:border-tm-blue disabled:cursor-default ${STATE_STYLE[s.id]}
                                              [@media(pointer:coarse)]:h-11`}>
                                  {s.label}
                                </button>
                              ))}
                            </div>
                            {!final && (
                              <span className="ml-auto flex flex-none items-center gap-1.5">
                                <button type="button" onClick={() => moveItem(it.id, -1)} disabled={i === 0} aria-label={`${name} 위로`} title="위로" className={tmIconBtn}>
                                  <IconArrow dir="up" />
                                </button>
                                <button type="button" onClick={() => moveItem(it.id, 1)} disabled={i === items.length - 1} aria-label={`${name} 아래로`} title="아래로" className={tmIconBtn}>
                                  <IconArrow dir="down" />
                                </button>
                                <button type="button" onClick={() => void removeItem(it, name)} aria-label={`${name} 지우기`} className={tmGhostDanger}>지우기</button>
                              </span>
                            )}
                          </div>
                          <div className="mt-2.5 grid gap-2.5 min-[900px]:grid-cols-3">
                            {([['done', '이번 주 한 일', ITEM_MAX], ['next', '다음 주 할 일', ITEM_MAX], ['issue', '이슈', ITEM_MAX]] as const).map(([k, field, max]) => (
                              <div key={k} className="min-w-0">
                                <label htmlFor={`${uid}-${it.id}-${k}`} className="mb-1 block text-[13px] font-bold text-tm-sub">
                                  <span className="sr-only">{name} </span>{field}
                                </label>
                                <AutoText id={`${uid}-${it.id}-${k}`} value={it[k]} readOnly={final} className={fieldText} max={max}
                                  onChange={(v) => store.updateItem(it.id, { [k]: v } as ItemPatch)} />
                              </div>
                            ))}
                          </div>
                          {before && (
                            <details className="mt-2 rounded-tm-sm bg-tm-bg px-3 py-2">
                              <summary className="cursor-pointer text-[13px] font-bold text-tm-sub">지난주 계획 참고 · {prevLabel.text}({prevLabel.range})</summary>
                              <p className="mt-1.5 whitespace-pre-line text-[14px] leading-[1.6] text-tm-ink [overflow-wrap:anywhere]">{before.next.trim()}</p>
                            </details>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>

              {textCard('issues', '이슈 · 리스크 · 결정이 필요한 것', '근거의 블로커 모음에서 붙일 수 있습니다', '누가 무엇을 언제까지 정해야 하는지 적습니다.')}
              {textCard('nextPlan', '다음 주 계획', '팀 단위로 굵게', '다음 주에 꼭 끝낼 것과 일정을 적습니다.')}
              {textCard('notes', '기타 공유', '일정 · 휴가 · 안내', '팀이 알아야 할 것을 적습니다.', 2)}
            </div>
          )}

          {/* 저절로 모은 근거 - 확정한 보고는 그때의 저장본 */}
          {showEvidence && (
            <aside className="flex min-w-0 flex-col gap-5" aria-label="저절로 모은 근거">
              {final && (
                <div className="flex flex-wrap items-center gap-2 rounded-tm-sm border border-tm-line bg-white px-4 py-2.5 text-[13.5px] text-tm-sub">
                  <span className="min-w-0 flex-1">
                    {report?.snapshot
                      ? showLive ? '지금 작업 보드 · 일간보고 기준(현재 참고)' : `확정 시점 자료 · ${stampLabel(report.snapshot.at)}`
                      : '확정 시점 자료가 없는 예전 확정본입니다. 지금 기준으로 보입니다.'}
                  </span>
                  {report?.snapshot && (
                    <button type="button" onClick={() => setShowLive(!showLive)} aria-pressed={showLive} className={linkBtn}>
                      {showLive ? '확정 자료 보기' : '현재 참고 보기'}
                    </button>
                  )}
                </div>
              )}

              <Card title="숫자로 본 한 주" sub={fromSnapshot ? '확정 시점 · 작업 보드' : '지금 기준 · 작업 보드'}>
                <dl className="divide-y divide-tm-line text-[14.5px]">
                  {[
                    ['이번 주 마감 작업', `${data.numbers.dueThisWeek}건 중 ${data.numbers.dueThisWeekDone}건 완료`],
                    ['새로 만든 작업', `${data.numbers.created}건`],
                    ['진행 중 · 검토', `${data.numbers.doing}건`],
                    ['마감 지난 작업', `${data.numbers.overdue}건`],
                    ['다음 주 마감', `${data.nextWeek.length}건`],
                    ['일간보고 작성 기록', `${count.written}/${count.possible}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                      <dt className="text-tm-sub">{k}</dt>
                      <dd className="text-right font-bold tabular-nums text-tm-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2.5 text-[12.5px] leading-[1.55] text-tm-sub">
                  완료 수는 {fromSnapshot ? '확정 때' : '지금'} 상태입니다. 작성 기록은 {fromSnapshot ? '확정 때 명단' : '지금 명단'} × 평일({fromSnapshot ? '확정한 날' : '오늘'}까지)에서
                  무엇이라도 적은 칸이며, 휴일 · 휴가는 반영하지 않습니다.
                </p>
              </Card>

              <Card title="일간보고 작성" sub="월 ~ 금 · 요일을 누르면 그날 보고">
                {data.people.length === 0 ? (
                  <p className="text-[14px] text-tm-sub">명단이 비어 있습니다.</p>
                ) : (
                  <table className="w-full border-separate border-spacing-y-1 text-[14px]">
                    <caption className="sr-only">사람마다 월요일부터 금요일까지 일간보고를 적은 날</caption>
                    <thead>
                      <tr>
                        <th className="text-left text-[12.5px] font-bold text-tm-sub"><span className="sr-only">이름</span></th>
                        {days.map((d) => (
                          <th key={d} className="w-9 text-center text-[12.5px] font-bold text-tm-sub" scope="col">
                            <button type="button" onClick={() => onOpenDay(d)} title={`${dayLabel(d)} 일간보고`} aria-label={`${dayLabel(d)} 일간보고 열기`}
                              className="rounded px-1 hover:text-tm-blue">{weekdayOf(d)}</button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.people.map((p) => (
                        <tr key={p.id}>
                          <th scope="row" className="max-w-[120px] truncate pr-2 text-left font-semibold text-tm-ink">{p.name}</th>
                          {days.map((d) => {
                            const ok = writtenSet.has(`${p.id}:${d}`);
                            const future = d > data.today;
                            return (
                              <td key={d} className="text-center">
                                <span title={`${dayLabel(d)} ${ok ? '적음' : future ? '아직 오지 않은 날' : '기록 없음'}`}
                                  className={`inline-block h-4 w-4 rounded-[5px] align-middle ${
                                    ok ? 'bg-tm-blue' : future ? 'border border-dashed border-tm-line' : 'border border-tm-edge bg-white'}`} />
                                <span className="sr-only">{ok ? '적음' : future ? '아직' : '기록 없음'}</span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              <Card title="블로커 · 공유사항 모음" sub={`일간보고에서 · ${data.blockers.length}건`}>
                {data.blockers.length === 0 ? (
                  <p className="text-[14px] text-tm-sub">이 주 일간보고에 적힌 블로커 · 공유사항이 없습니다.</p>
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {data.blockers.map((b) => (
                      <li key={`${b.person}:${b.day}`} className="rounded-tm-sm bg-tm-bg px-3.5 py-2.5">
                        <p className="text-[12.5px] font-bold text-tm-sub">{b.name} · {dotDay(b.day)}({weekdayOf(b.day)})</p>
                        <p className="mt-0.5 whitespace-pre-line text-[14px] leading-[1.6] text-tm-ink [overflow-wrap:anywhere]">{b.text}</p>
                        {!final && (
                          <span className="mt-1 flex flex-wrap items-center gap-x-3">
                            <button type="button" onClick={() => toIssues(b)} className={linkBtn}>이슈 칸에 붙이기</button>
                            {narrow && pasted === `${b.person}:${b.day}` && (
                              <button type="button" onClick={showIssues} className={linkBtn}>이슈 칸 보기</button>
                            )}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="사람별 완료" sub="일간보고의 완료 칸">
                {doneBy.length === 0 ? (
                  <p className="text-[14px] text-tm-sub">이 주 일간보고에 적힌 완료가 없습니다.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {doneBy.map((g) => (
                      <details key={g.person} className="group rounded-tm-sm open:bg-tm-bg">
                        <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-2 rounded-tm-sm px-3 text-[14.5px] font-bold text-tm-ink
                                            hover:bg-tm-tint [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0 truncate">
                            {g.name}
                            {g.gone && <span className="ml-1.5 text-[12.5px] font-semibold text-tm-sub">명단에서 빠진 사람</span>}
                          </span>
                          <span className="flex flex-none items-center gap-2 text-[13px] font-semibold text-tm-sub">
                            {g.lines.length}줄
                            <span className="transition-transform duration-150 group-open:rotate-180" aria-hidden>▾</span>
                          </span>
                        </summary>
                        <ul className="flex flex-col gap-1 px-3 pb-3 pt-1">
                          {g.lines.map((l, k) => (
                            <li key={k} className="text-[14px] leading-[1.55] text-tm-ink [overflow-wrap:anywhere]">
                              <span className="mr-1.5 text-[12.5px] font-bold text-tm-sub">{weekdayOf(l.day)}</span>{l.text}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="다음 주 마감 작업" sub={`${dotDay(addDays(week, 7))} ~ ${dotDay(addDays(week, 13))}`}>
                {data.nextWeek.length === 0 ? (
                  <p className="text-[14px] text-tm-sub">다음 주에 마감인 작업이 없습니다.</p>
                ) : (
                  <ul className="flex flex-col">
                    {data.nextWeek.slice(0, 12).map((t) => {
                      const exists = tasks.some((x) => x.id === t.id);
                      return (
                        <li key={t.id}>
                          <button type="button" onClick={() => onTaskOpen(t.id)} disabled={!exists} title={exists ? undefined : '지금은 없는 작업입니다'}
                            className="flex w-full items-center gap-2.5 rounded-tm-sm px-2 py-2 text-left transition-colors duration-150 enabled:hover:bg-tm-tint disabled:cursor-default">
                            <span className="min-w-0 flex-1">
                              <span className={`block truncate text-[14px] font-semibold ${exists ? 'text-tm-ink' : 'text-tm-sub line-through'}`}>
                                <span className="mr-1.5 text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>{t.title || '제목 없음'}
                              </span>
                            </span>
                            {t.due && <span className="flex-none text-[12.5px] font-semibold tabular-nums text-tm-sub">{dotDay(t.due)}({weekdayOf(t.due)})</span>}
                            <Avatar id={t.assignee} size={24} />
                          </button>
                        </li>
                      );
                    })}
                    {data.nextWeek.length > 12 && <li className="px-2 pt-1 text-[13px] text-tm-sub">외 {data.nextWeek.length - 12}건</li>}
                  </ul>
                )}
              </Card>
            </aside>
          )}
        </div>
      </div>
      {confirmNode}
    </>
  );
}
