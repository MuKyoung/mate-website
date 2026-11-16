'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { isRemote } from './supabase';
import { useRemoteReportStore } from './reportRemote';
import {
  addDays, dailyText, dayLabel, dotDay, isDay, isFilled, lastPlan, linesOf, memberOfPerson, reorderPeople,
  stepWorkday, useReportStore, weekLabel, weekNumbers, weekOf, weekdayOf, weeklyText, whenOf, workdaysOf,
  type DailyPatch, type ItemPatch, type ReportStore, type ReportStoreOptions, type WeeklyPatch,
} from './reportStore';
import {
  DAILY_FIELDS, PROJECT_STATES, initialOf, localDay, localToday,
  type DailyEntry, type Member, type ProjectState, type ReportPerson, type Task, type WeeklyItem, type WeeklyText,
} from './types';
import { useMembers } from './members';
import { CommitInput } from './DomainDialog';
import {
  Avatar, DueBadge, IconArrow, IconPlus, Modal, PageHead, StatusPill, useConfirm,
  tmBtn, tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtn, tmSelect, tmTab,
} from './ui';

/*
 * 일간보고(스크럼) · 주간보고.
 *
 * 일간보고: 명단 순서대로 한 사람에 한 줄 - 이름 · 완료 · 예정 · 블로커 & 공유사항. 칸은 적는 대로 저장되고
 *   팀 모두에게 바로 보인다(Supabase 모드). 명단(이름 · 순서 · 계정 연결)은 관리자만 고친다.
 *   도움: 지난 근무일의 '예정'을 '완료'로 가져오기, 연결된 계정의 작업을 골라 넣기, 메신저에 붙일 글로 복사.
 * 주간보고: 직접 쓰는 칸(한 주 요약 · 프로젝트별 현황 · 이슈 · 다음 주 계획 · 기타)과
 *   화면이 모으는 칸(작업 보드의 숫자 · 일간보고 작성 · 블로커 모음 · 사람별 완료 · 다음 주 마감)을 나란히 둔다.
 *   확정하면 칸을 잠근다(누구나 '다시 고치기'로 푼다).
 *
 * 넓은 화면: 일간보고는 표, 주간보고는 왼쪽 쓰기 + 오른쪽 모은 것. 좁은 화면(760 이하): 사람마다 카드, 주간은 한 줄로 쌓는다.
 */

export type ReportKind = 'daily' | 'weekly';

/** 빌드마다 하나로 정해지므로 렌더 사이에 훅 순서가 바뀌지 않는다 */
const useReports: (opts: ReportStoreOptions) => ReportStore = isRemote ? useRemoteReportStore : useReportStore;

const TEXT_MAX = 4000;
const WEEKLY_MAX = 8000;

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
function scrollWithin(el: HTMLElement) {
  let box = el.parentElement;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
  if (!box) return;
  const r = el.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const top = b.top + 52;
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

/**
 * 글에 맞춰 키가 자라는 칸. 폭이 바뀌면(창 크기 · 메뉴 접기) 다시 잰다
 */
function AutoText({ id, value, onChange, placeholder, readOnly, rows = 2, max = TEXT_MAX, className, describedBy }: {
  id: string;
  value: string;
  onChange(v: string): void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  max?: number;
  className: string;
  describedBy?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
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
    <textarea ref={ref} id={id} value={value} rows={rows} readOnly={readOnly} maxLength={max} placeholder={placeholder}
      aria-describedby={describedBy} spellCheck={false}
      onChange={(e) => onChange(e.target.value)}
      className={className} />
  );
}

/** 표 칸 - 넓은 화면은 칸 선 안에 테두리 없이, 좁은 화면은 입력 칸처럼 */
const cellText =
  'block w-full resize-none overflow-hidden rounded-tm-sm border border-transparent bg-transparent px-2.5 py-2 text-[15px] leading-[1.6] text-tm-ink ' +
  'transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-tm-sub placeholder:opacity-0 ' +
  'hover:bg-tm-bg focus:border-tm-blue focus:bg-white focus:shadow-[0_0_0_3px_rgba(38,68,203,0.2)] focus:placeholder:opacity-100 ' +
  'read-only:hover:bg-transparent ' +
  'max-[760px]:border-tm-edge max-[760px]:bg-white max-[760px]:px-3 max-[760px]:text-[16px] max-[760px]:placeholder:opacity-100';

/** 주간보고의 글 칸 */
const fieldText =
  `${tmFieldBase} block w-full resize-none overflow-hidden px-3.5 py-2.5 text-[15.5px] leading-[1.7] read-only:bg-tm-bg max-[760px]:text-[16px]`;

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

/* ═══════════════════════════════════════════════════════════════ */

export default function Reports({
  kind, onKind, me, canEditPeople, tasks, onTaskOpen, onNotice, flushRef,
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

  const { flush } = store;
  useEffect(() => {
    flushRef.current = flush ?? null;
    return () => { flushRef.current = null; };
  }, [flush, flushRef]);

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

  const saved: { tone: 'ok' | 'busy' | 'warn'; text: string } = isRemote
    ? store.sync === 'error'
      ? { tone: 'warn', text: '저장하지 못한 변경이 있습니다' }
      : store.sync === 'saving'
        ? { tone: 'busy', text: '저장 중…' }
        : { tone: 'ok', text: '모두 저장됨 · 팀이 함께 봅니다' }
    : { tone: 'ok', text: '이 브라우저에만 저장됩니다' };

  const retryLoad = async () => {
    setRetrying(true);
    try {
      await store.reload?.();
    } finally {
      setRetrying(false);
    }
  };

  const head = (
    <PageHead
      title={kind === 'daily' ? '일간보고' : '주간보고'}
      lead={kind === 'daily'
        ? `스크럼 순서대로 한 사람씩 완료 · 예정 · 블로커 & 공유사항을 적습니다. ${isRemote ? '적는 대로 저장되고 팀 모두에게 바로 보입니다.' : '적는 대로 이 브라우저에 저장됩니다.'}`
        : '한 주를 정리합니다. 왼쪽은 직접 쓰고, 오른쪽은 작업 보드와 일간보고에서 저절로 모읍니다.'}
      saved={store.ready && !store.missing ? saved : undefined}
    >
      {/* 좁은 화면: 일간 · 주간 알약은 다음 줄을 혼자 쓰고, 단추는 제목 옆에 붙는다 */}
      <div role="group" aria-label="보고 종류" className="flex flex-none items-center gap-1.5 max-[720px]:order-1 max-[720px]:basis-full">
        <button type="button" aria-pressed={kind === 'daily'} onClick={() => onKind('daily')} className={tmTab} title="일간보고 (S)">일간</button>
        <button type="button" aria-pressed={kind === 'weekly'} onClick={() => onKind('weekly')} className={tmTab} title="주간보고 (W)">주간</button>
      </div>
      {store.ready && !store.missing && (kind === 'daily' ? (
        <>
          <button type="button" className={`${tmBtnPrimary} max-[720px]:ml-auto max-[720px]:px-4`}
            onClick={() => {
              const rows = dailyRows(store.people, store.daily, day);
              void copy('일간보고 글', dailyText(day, rows.map((r) => ({ name: r.person.name, entry: r.entry }))),
                `${dayLabel(day)} 일간보고를 글로 복사했습니다. 메신저나 메일에 붙여 넣으면 됩니다.`);
            }}>
            글로 복사
          </button>
        </>
      ) : (
        <button type="button" className={`${tmBtnPrimary} max-[720px]:ml-auto max-[720px]:px-4`}
          onClick={() => {
            const days = workdaysOf(week).filter((d) => d <= today);
            const written = store.people.reduce((n, p) => n + days.filter((d) => isFilled(store.daily.find((e) => e.person === p.id && e.day === d))).length, 0);
            void copy('주간보고 글', weeklyText({
              monday: week,
              report: store.weekly.find((w) => w.id === week),
              items: store.items.filter((x) => x.week === week).sort((a, b) => a.order - b.order),
              numbers: weekNumbers(tasks, week, today),
              writtenDays: written,
              possibleDays: store.people.length * days.length,
            }), `${weekLabel(week).text} 주간보고를 글로 복사했습니다.`);
          }}>
          글로 복사
        </button>
      ))}
    </PageHead>
  );

  let body: React.ReactNode;
  if (!store.ready) {
    body = <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>;
  } else if (store.missing) {
    body = (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm">
        <p className="text-[20px] font-extrabold text-tm-deep">보고 표를 찾지 못했습니다</p>
        <p className="max-w-[52ch] text-[15.5px] leading-[1.7] text-tm-ink">
          DB 에 보고 표가 아직 없거나 인터넷 연결이 끊겼습니다. 표가 없다면 관리자가 Supabase SQL Editor 에서
          저장소의 supabase/taskmanager.sql 을 다시 실행하면 열립니다(이미 있는 데이터는 그대로 둡니다).
        </p>
      </div>
    );
  } else if (store.loadError && !store.people.length) {
    body = (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm">
        <p className="text-[20px] font-extrabold text-tm-deep">보고를 불러오지 못했습니다</p>
        <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">{store.loadError}</p>
        <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtnPrimary}>
          {retrying ? '다시 읽는 중…' : '다시 시도'}
        </button>
      </div>
    );
  } else if (kind === 'daily') {
    body = (
      <DailyView store={store} day={day} today={today} me={me} members={members} tasks={tasks} canEditPeople={canEditPeople}
        onDay={setDay} onRoster={() => setRosterOpen(true)}
        onCopyLink={() => void copy('일간보고 링크', linkTo({ view: 'daily', date: day }), `${dayLabel(day)} 일간보고 링크를 복사했습니다.`)} />
    );
  } else {
    body = (
      <WeeklyView store={store} week={week} today={today} members={members} tasks={tasks}
        onWeek={setWeek} onTaskOpen={onTaskOpen} onOpenDay={(d) => { setDay(d); onKind('daily'); }} onNotice={onNotice}
        onCopyLink={() => void copy('주간보고 링크', linkTo({ view: 'weekly', week }), `${weekLabel(week).text} 주간보고 링크를 복사했습니다.`)} />
    );
  }

  return (
    <>
      {head}
      {body}
      {rosterOpen && canEditPeople && store.ready && !store.missing && (
        <RosterDialog store={store} members={members} local={!isRemote} onClose={() => setRosterOpen(false)} />
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

/** 날짜 고르기 - 보이는 것은 단추 모양 글이고, 위에 겹친 날짜 칸이 누름을 받는다(휴대폰은 기기 날짜 고르기) */
function DayPicker({ value, onPick, label, text }: { value: string; onPick(v: string): void; label: string; text: string }) {
  return (
    <span className="relative inline-flex rounded-tm-btn has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tm-blue">
      <span className={`${tmBtn} pointer-events-none min-w-[164px] px-4 tabular-nums`} aria-hidden>{text}</span>
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

function DailyView({
  store, day, today, me, members, tasks, canEditPeople, onDay, onRoster, onCopyLink,
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
}) {
  const uid = useId();
  const [picking, setPicking] = useState<{ person: ReportPerson; member: Member } | null>(null);
  const rows = useMemo(() => dailyRows(store.people, store.daily, day), [store.people, store.daily, day]);
  const inRoster = rows.filter((r) => !r.gone);
  const written = inRoster.filter((r) => isFilled(r.entry));
  const waiting = inRoster.filter((r) => !isFilled(r.entry));
  const nameOf = (id: string | null) => (id ? members.find((m) => m.id === id)?.name ?? null : null);
  const set = (person: ReportPerson, patch: DailyPatch) => store.setDaily(day, person, patch);

  /* 아직 안 쓴 사람의 이름을 누르면 그 사람의 첫 칸으로 */
  const focusRow = (id: string) => {
    const el = document.getElementById(`${uid}-${id}-done`);
    if (!el) return;
    el.focus({ preventScroll: true });
    const row = el.closest('li');
    if (row) scrollWithin(row);
  };

  return (
    <>
      {/* 날짜 · 작성 현황 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-x-3 gap-y-2.5">
        <div role="group" aria-label="날짜" className="flex items-center gap-1.5">
          <button type="button" onClick={() => onDay(stepWorkday(day, -1))} aria-label="이전 근무일" title="이전 근무일" className={tmIconBtn}>
            <IconArrow dir="left" />
          </button>
          <DayPicker value={day} onPick={onDay} text={dayLabel(day)} label={`날짜 고르기, 지금 ${dayLabel(day, true)}`} />
          <button type="button" onClick={() => onDay(stepWorkday(day, 1))} aria-label="다음 근무일" title="다음 근무일" className={tmIconBtn}>
            <IconArrow dir="right" />
          </button>
          {day !== today && (
            <button type="button" onClick={() => onDay(today)} className={tmGhostBtn}>오늘</button>
          )}
        </div>
        <p className="min-w-0 flex-[1_1_320px] text-[14.5px] leading-[1.6] text-tm-sub" aria-live="polite">
          <b className="font-bold text-tm-ink">작성 {written.length}/{inRoster.length}명</b>
          {waiting.length > 0 && inRoster.length > 0 && (
            <>
              <span aria-hidden> · </span>아직 안 쓴 사람{' '}
              {waiting.map((r, i) => (
                <span key={r.person.id}>
                  {i > 0 && <span aria-hidden> · </span>}
                  <button type="button" onClick={() => focusRow(r.person.id)}
                    className="font-semibold text-tm-blue underline-offset-[3px] hover:underline [@media(pointer:coarse)]:py-2">
                    {r.person.name}
                  </button>
                </span>
              ))}
            </>
          )}
          {waiting.length === 0 && inRoster.length > 0 && <span> · 모두 적었습니다</span>}
        </p>
        <span className="flex flex-none items-center gap-2">
          {canEditPeople && <button type="button" onClick={onRoster} className={tmGhostBtn}>명단 관리</button>}
          <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        </span>
      </div>

      {inRoster.length === 0 && !rows.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm">
          <p className="text-[20px] font-extrabold text-tm-deep">명단이 비어 있습니다</p>
          <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">
            {canEditPeople ? '일간보고를 쓸 사람을 명단에 넣어 주세요.' : '관리자가 명단을 채우면 여기에 한 사람씩 줄이 생깁니다.'}
          </p>
          {canEditPeople && <button type="button" onClick={onRoster} className={tmBtnPrimary}>명단 관리</button>}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-tm border border-tm-line bg-white shadow-tm max-[900px]:flex-none max-[900px]:overflow-visible">
          {/* 칸 머리 - 좁은 화면에서는 칸마다 이름표가 붙는다 */}
          <div aria-hidden
            className="sticky top-0 z-10 grid grid-cols-[minmax(150px,200px)_repeat(3,minmax(0,1fr))] divide-x divide-tm-line border-b border-tm-line bg-tm-bg
                       text-[13.5px] font-bold text-tm-ink max-[760px]:hidden">
            <div className="px-4 py-2.5">이름</div>
            {DAILY_FIELDS.map((f) => (
              <div key={f.id} className="min-w-0 px-4 py-2.5">
                {f.label}
                <span className="ml-1.5 font-semibold text-tm-sub max-[1100px]:hidden">{f.hint}</span>
              </div>
            ))}
          </div>
          <ol>
            {rows.map((r) => {
              const member = r.gone ? null : memberOfPerson(r.person, members);
              const mine = !!member && member.id === me;
              const prev = r.entry?.done.trim() ? null : lastPlan(store.daily, r.person.id, day);
              const editor = nameOf(r.entry?.updatedBy ?? null);
              return (
                <li key={r.person.id}
                  className={`grid grid-cols-[minmax(150px,200px)_repeat(3,minmax(0,1fr))] divide-x divide-tm-line border-b border-tm-line last:border-b-0
                              max-[760px]:grid-cols-1 max-[760px]:divide-x-0 max-[760px]:pb-3 ${mine ? 'bg-tm-tint' : ''}`}>
                  <div className="flex min-w-0 items-start gap-3 px-4 py-3 max-[760px]:pb-1.5">
                    <PersonMark name={r.person.name} member={member} />
                    <div className="min-w-0 flex-1">
                      <p className="flex min-w-0 items-center gap-1.5 text-[15px] font-bold leading-[1.4] text-tm-ink">
                        <span className="truncate">{r.person.name}</span>
                        {mine && <span className="flex-none rounded-full bg-tm-blue px-2 py-px text-[11.5px] font-bold text-white">나</span>}
                      </p>
                      <p className="mt-0.5 text-[12.5px] leading-[1.45] text-tm-sub">
                        {r.gone
                          ? '명단에서 빠진 사람'
                          : isFilled(r.entry) && r.entry
                            ? `${whenOf(r.entry.updatedAt, today)}${editor ? ` · ${editor}` : ''}`
                            : '아직 안 씀'}
                      </p>
                      {member && (
                        <button type="button" onClick={() => setPicking({ person: r.person, member })}
                          className="mt-1 inline-flex min-h-[28px] items-center text-[13px] font-bold text-tm-blue underline-offset-[3px] hover:underline
                                     [@media(pointer:coarse)]:min-h-10">
                          작업에서 넣기
                        </button>
                      )}
                    </div>
                  </div>
                  {DAILY_FIELDS.map((f) => {
                    const id = `${uid}-${r.person.id}-${f.id}`;
                    return (
                      <div key={f.id} className="min-w-0 p-1.5 max-[760px]:px-4 max-[760px]:py-1">
                        <label htmlFor={id} className="mb-1 block text-[13px] font-bold text-tm-sub min-[761px]:sr-only">
                          <span className="sr-only">{r.person.name} </span>{f.label}
                        </label>
                        <AutoText id={id} value={r.entry?.[f.id] ?? ''} placeholder={f.hint} className={cellText}
                          onChange={(v) => set(r.person, { [f.id]: v } as DailyPatch)} />
                        {f.id === 'done' && prev && (
                          <button type="button" onClick={() => set(r.person, { done: prev.plan })}
                            className="mx-2.5 mb-1 inline-flex min-h-[28px] items-center text-left text-[13px] font-bold text-tm-blue underline-offset-[3px] hover:underline
                                       max-[760px]:mx-0 [@media(pointer:coarse)]:min-h-10">
                            {dotDay(prev.day)}({weekdayOf(prev.day)}) 예정 가져오기
                          </button>
                        )}
                      </div>
                    );
                  })}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {picking && (
        <PickDialog person={picking.person} member={picking.member} day={day} tasks={tasks}
          entry={store.daily.find((e) => e.day === day && e.person === picking.person.id)}
          onAdd={(patch) => set(picking.person, patch)}
          onClose={() => setPicking(null)} />
      )}
    </>
  );
}

/** 작업에서 넣기 - 그 사람이 맡은 작업 가운데 완료 칸 · 예정 칸에 넣을 것을 고른다 */
function PickDialog({ person, member, day, tasks, entry, onAdd, onClose }: {
  person: ReportPerson;
  member: Member;
  day: string;
  tasks: Task[];
  entry: DailyEntry | undefined;
  onAdd(patch: DailyPatch): void;
  onClose(): void;
}) {
  const uid = useId();
  /** 지난 근무일부터 그날까지 완료로 바뀐(완료 상태로 고친) 작업 */
  const since = stepWorkday(day, -1);
  const mine = tasks.filter((t) => t.assignee === member.id);
  const doneList = mine
    .filter((t) => t.status === 'done' && localDay(t.updatedAt) >= since && localDay(t.updatedAt) <= day)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  /** 진행 중 · 검토, 그리고 사흘 안에 마감인 할 일 */
  const soon = addDays(day, 3);
  const planList = mine
    .filter((t) => t.status !== 'done' && (t.status === 'doing' || t.status === 'review' || (!!t.due && t.due <= soon)))
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.key.localeCompare(b.key));
  const lineOf = (t: Task) => `${t.key} ${t.title.trim() || '제목 없음'}`;
  const inText = (text: string | undefined, t: Task) => !!text && text.includes(t.key);
  const [pick, setPick] = useState<Set<string>>(() => new Set([
    ...doneList.filter((t) => !inText(entry?.done, t)).map((t) => `done:${t.id}`),
    ...planList.filter((t) => !inText(entry?.plan, t)).map((t) => `plan:${t.id}`),
  ]));
  const toggle = (k: string) => setPick((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  const submit = () => {
    const done = doneList.filter((t) => pick.has(`done:${t.id}`)).map(lineOf);
    const plan = planList.filter((t) => pick.has(`plan:${t.id}`)).map(lineOf);
    const patch: DailyPatch = {};
    if (done.length) patch.done = appendLines(entry?.done ?? '', done);
    if (plan.length) patch.plan = appendLines(entry?.plan ?? '', plan);
    if (Object.keys(patch).length) onAdd(patch);
    onClose();
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

  const count = [...pick].filter((k) => {
    const [field, id] = k.split(':');
    const t = tasks.find((x) => x.id === id);
    return !!t && !inText(field === 'done' ? entry?.done : entry?.plan, t);
  }).length;

  return (
    <Modal title={`${person.name} · 작업에서 넣기`} sub={`${member.name} 님이 맡은 작업입니다. 고른 작업을 칸 끝에 한 줄씩 붙입니다.`}
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
      <h3 className="mb-2 text-[15px] font-extrabold text-tm-deep">완료 칸에 <span className="font-semibold text-tm-sub">· {dotDay(since)} 뒤에 완료한 작업</span></h3>
      {list('done', doneList, '그사이 완료한 작업이 없습니다.')}
      <h3 className="mb-2 mt-5 text-[15px] font-extrabold text-tm-deep">예정 칸에 <span className="font-semibold text-tm-sub">· 진행 중 · 검토, 사흘 안 마감</span></h3>
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
                    <button type="button" onClick={() => void remove(p)} className={tmGhostDanger}>빼기</button>
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
            계정을 연결하면 그 사람 줄에 &lsquo;나&rsquo; 표시와 &lsquo;작업에서 넣기&rsquo;가 생깁니다. 자동이면 이름이 같은 계정을 씁니다.
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

function Card({ title, sub, action, children }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-tm border border-tm-line bg-white shadow-tm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-tm-line px-5 py-3.5 max-[720px]:px-4">
        <h2 className="text-[16.5px] font-extrabold text-tm-deep">{title}</h2>
        {sub && <p className="text-[13.5px] text-tm-sub">{sub}</p>}
        {action && <div className="ml-auto flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      <div className="px-5 py-4 max-[720px]:px-4">{children}</div>
    </section>
  );
}

function WeeklyView({
  store, week, today, members, tasks, onWeek, onTaskOpen, onOpenDay, onNotice, onCopyLink,
}: {
  store: ReportStore;
  week: string;
  today: string;
  members: Member[];
  tasks: Task[];
  onWeek(w: string): void;
  onTaskOpen(id: string): void;
  onOpenDay(day: string): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
  onCopyLink(): void;
}) {
  const uid = useId();
  const [confirm, confirmNode] = useConfirm();
  /* 주를 바꾸면 맨 위부터 - 다른 주의 글이라 보던 자리가 이어지지 않는다 */
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [week]);
  const report = store.weekly.find((w) => w.id === week);
  const final = report?.status === 'final';
  const items = useMemo(() => store.items.filter((x) => x.week === week).sort((a, b) => a.order - b.order), [store.items, week]);
  const prevWeek = addDays(week, -7);
  const prevItems = useMemo(() => store.items.filter((x) => x.week === prevWeek).sort((a, b) => a.order - b.order), [store.items, prevWeek]);
  const label = weekLabel(week);
  const thisWeek = weekOf(today);
  const numbers = useMemo(() => weekNumbers(tasks, week, today), [tasks, week, today]);
  const days = workdaysOf(week);
  const passed = days.filter((d) => d <= today);
  const editor = report?.updatedBy ? members.find((m) => m.id === report.updatedBy)?.name : undefined;

  /* 일간보고에서 모은 것 */
  const ofWeek = useMemo(() => store.daily.filter((e) => e.day >= week && e.day <= addDays(week, 6)), [store.daily, week]);
  const people = store.people;
  const grid = people.map((p) => ({ person: p, days: days.map((d) => ofWeek.find((e) => e.person === p.id && e.day === d)) }));
  const writtenDays = grid.reduce((n, r) => n + r.days.filter((e, i) => days[i] <= today && isFilled(e)).length, 0);
  const order = new Map(people.map((p, i) => [p.id, i]));
  const rank = (e: DailyEntry) => order.get(e.person) ?? people.length;
  const blockers = ofWeek.filter((e) => e.blocker.trim()).sort((a, b) => a.day.localeCompare(b.day) || rank(a) - rank(b));
  const nameOfEntry = (e: DailyEntry) => people.find((p) => p.id === e.person)?.name ?? e.name;
  const doneBy = grid
    .map((r) => ({ person: r.person, lines: r.days.flatMap((e, i) => (e ? linesOf(e.done).map((l) => ({ day: days[i], text: l })) : [])) }))
    .filter((r) => r.lines.length);

  const setText = (k: WeeklyText, v: string) => store.setWeekly(week, { [k]: v } as WeeklyPatch);

  const toIssues = (e: DailyEntry) => {
    const line = `${nameOfEntry(e)}: ${linesOf(e.blocker).join(' / ')}`;
    const next = appendLines(report?.issues ?? '', [line]);
    if (next === (report?.issues ?? '')) {
      onNotice('이미 이슈 칸에 있는 내용입니다.', 'err');
      return;
    }
    setText('issues', next);
    onNotice('이슈 · 리스크 칸 끝에 붙였습니다.', 'ok');
  };

  const carryOver = () => {
    prevItems.forEach((it) => store.addItem(week, { name: it.name, state: it.state, done: it.next, next: '', issue: '' }));
    onNotice(`지난주 프로젝트 ${prevItems.length}개를 가져왔습니다. 지난주 '다음 주 할 일'을 이번 주 '한 일' 칸에 옮겼으니 실제로 한 일로 고쳐 주세요.`, 'ok');
  };

  const removeItem = async (it: WeeklyItem) => {
    const filled = !!(it.name.trim() || it.done.trim() || it.next.trim() || it.issue.trim());
    if (filled) {
      const yes = await confirm({
        title: `'${it.name.trim() || '이름 없는 프로젝트'}' 줄을 지울까요?`,
        body: '지운 줄은 되돌릴 수 없습니다.',
        ok: '지우기',
        tone: 'danger',
      });
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

  const textCard = (k: WeeklyText, title: string, hint: string, placeholder: string, rows = 3) => (
    <Card title={title} sub={hint}>
      <label htmlFor={`${uid}-${k}`} className="sr-only">{title}</label>
      <AutoText id={`${uid}-${k}`} value={report?.[k] ?? ''} rows={rows} max={WEEKLY_MAX} readOnly={final}
        placeholder={placeholder} className={fieldText} onChange={(v) => setText(k, v)} />
    </Card>
  );

  return (
    <>
      {/* 주 고르기 · 확정 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-x-3 gap-y-2.5">
        <div role="group" aria-label="주" className="flex items-center gap-1.5">
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
        <p className="min-w-0 flex-[1_1_240px] text-[14px] text-tm-sub">
          {report
            ? <>마지막 수정 {whenOf(report.updatedAt, today)}{editor ? ` · ${editor}` : ''}</>
            : '아직 아무도 쓰지 않았습니다'}
        </p>
        <span className="flex flex-none items-center gap-2">
          {final ? (
            <>
              <span className="inline-flex h-[38px] items-center gap-1.5 rounded-full bg-tm-ok-tint px-3.5 text-[13.5px] font-bold text-tm-ok-deep">
                <i className="h-2 w-2 rounded-full bg-tm-ok" aria-hidden />확정됨
              </span>
              <button type="button" onClick={() => store.setWeekly(week, { status: 'draft' })} className={tmGhostBtn}>다시 고치기</button>
            </>
          ) : (
            <button type="button" onClick={() => { store.setWeekly(week, { status: 'final' }); onNotice(`${label.text} 주간보고를 확정했습니다. 칸이 잠깁니다.`, 'ok'); }}
              className={tmEditBtn}>
              확정하기
            </button>
          )}
          <button type="button" onClick={onCopyLink} className={tmGhostBtn}>링크 복사</button>
        </span>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto max-[900px]:flex-none max-[900px]:overflow-visible">
        {final && (
          <div className={`${tmCallout} mb-4`}>
            <p className="min-w-0 flex-[1_1_320px]">확정된 주간보고입니다. 칸이 잠겨 있습니다. 고치려면 &lsquo;다시 고치기&rsquo;를 누르세요.</p>
          </div>
        )}
        <div className="grid items-start gap-5 min-[1200px]:grid-cols-[minmax(0,1fr)_380px]">
          {/* 직접 쓰는 칸 */}
          <div className="flex min-w-0 flex-col gap-5">
            {textCard('summary', '한 주 요약', '대표와 팀이 먼저 읽는 칸', '이번 주 가장 중요한 결과를 세 줄 안으로 적습니다.')}

            <Card title="프로젝트별 현황" sub="프로젝트마다 상태 · 한 일 · 다음 주 할 일 · 이슈"
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
                    ? ' 지난주 줄을 이어 쓰거나 새로 추가합니다.'
                    : ' 진행 중인 프로젝트마다 한 줄씩 추가합니다.')}
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {items.map((it, i) => (
                    <li key={it.id} className="rounded-tm-sm border border-tm-line p-3.5 max-[720px]:p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <i className={`h-2.5 w-2.5 flex-none rounded-full ${STATE_DOT[it.state]}`} aria-hidden />
                        <label htmlFor={`${uid}-${it.id}-name`} className="sr-only">프로젝트 이름</label>
                        <input id={`${uid}-${it.id}-name`} value={it.name} maxLength={60} readOnly={final} placeholder="프로젝트 이름"
                          onChange={(e) => store.updateItem(it.id, { name: e.target.value })}
                          className={`${tmFieldBase} h-11 min-w-0 flex-[1_1_200px] px-3 text-[16px] font-bold read-only:bg-tm-bg`} />
                        <div role="group" aria-label={`${it.name || '프로젝트'} 상태`} className="flex flex-none items-center gap-1">
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
                            <button type="button" onClick={() => moveItem(it.id, -1)} disabled={i === 0} aria-label="위로" title="위로" className={tmIconBtn}>
                              <IconArrow dir="up" />
                            </button>
                            <button type="button" onClick={() => moveItem(it.id, 1)} disabled={i === items.length - 1} aria-label="아래로" title="아래로" className={tmIconBtn}>
                              <IconArrow dir="down" />
                            </button>
                            <button type="button" onClick={() => void removeItem(it)} className={tmGhostDanger}>지우기</button>
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 grid gap-2.5 min-[900px]:grid-cols-3">
                        {([['done', '이번 주 한 일'], ['next', '다음 주 할 일'], ['issue', '이슈']] as const).map(([k, name]) => (
                          <div key={k} className="min-w-0">
                            <label htmlFor={`${uid}-${it.id}-${k}`} className="mb-1 block text-[13px] font-bold text-tm-sub">{name}</label>
                            <AutoText id={`${uid}-${it.id}-${k}`} value={it[k]} readOnly={final} className={fieldText}
                              onChange={(v) => store.updateItem(it.id, { [k]: v } as ItemPatch)} />
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            {textCard('issues', '이슈 · 리스크 · 결정이 필요한 것', '오른쪽 블로커 모음에서 붙일 수 있습니다', '누가 무엇을 언제까지 정해야 하는지 적습니다.')}
            {textCard('nextPlan', '다음 주 계획', '팀 단위로 굵게', '다음 주에 꼭 끝낼 것과 일정을 적습니다.')}
            {textCard('notes', '기타 공유', '일정 · 휴가 · 안내', '팀이 알아야 할 것을 적습니다.', 2)}
          </div>

          {/* 저절로 모은 칸 */}
          <aside className="flex min-w-0 flex-col gap-5" aria-label="저절로 모은 내용">
            <Card title="숫자로 본 한 주" sub="작업 보드 기준">
              <dl className="divide-y divide-tm-line text-[14.5px]">
                {[
                  ['이번 주 마감 작업', `${numbers.dueThisWeek}건 중 ${numbers.dueThisWeekDone}건 완료`],
                  ['새로 만든 작업', `${numbers.created}건`],
                  ['진행 중 · 검토', `${numbers.doing}건 (지금)`],
                  ['마감 지난 작업', `${numbers.overdue}건 (지금)`],
                  ['다음 주 마감', `${numbers.nextWeek.length}건`],
                  ['일간보고 작성', `${writtenDays}/${people.length * passed.length}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <dt className="text-tm-sub">{k}</dt>
                    <dd className="text-right font-bold tabular-nums text-tm-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="일간보고 작성" sub="월 ~ 금 · 누르면 그날 보고">
              {people.length === 0 ? (
                <p className="text-[14px] text-tm-sub">명단이 비어 있습니다.</p>
              ) : (
                <table className="w-full border-separate border-spacing-y-1 text-[14px]">
                  <thead>
                    <tr>
                      <th className="text-left text-[12.5px] font-bold text-tm-sub"><span className="sr-only">이름</span></th>
                      {days.map((d) => (
                        <th key={d} className="w-9 text-center text-[12.5px] font-bold text-tm-sub" scope="col">
                          <button type="button" onClick={() => onOpenDay(d)} title={`${dayLabel(d)} 일간보고`}
                            className="rounded px-1 hover:text-tm-blue">{weekdayOf(d)}</button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((r) => (
                      <tr key={r.person.id}>
                        <th scope="row" className="max-w-[120px] truncate pr-2 text-left font-semibold text-tm-ink">{r.person.name}</th>
                        {r.days.map((e, i) => {
                          const d = days[i];
                          const ok = isFilled(e);
                          const future = d > today;
                          return (
                            <td key={d} className="text-center">
                              <span title={`${dayLabel(d)} ${ok ? '적음' : future ? '아직 오지 않은 날' : '안 씀'}`}
                                className={`inline-block h-4 w-4 rounded-[5px] align-middle ${
                                  ok ? 'bg-tm-blue' : future ? 'border border-dashed border-tm-line' : 'border border-tm-edge bg-white'}`} />
                              <span className="sr-only">{ok ? '적음' : future ? '아직' : '안 씀'}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card title="블로커 · 공유사항 모음" sub={`일간보고에서 · ${blockers.length}건`}>
              {blockers.length === 0 ? (
                <p className="text-[14px] text-tm-sub">이번 주 일간보고에 적힌 블로커 · 공유사항이 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {blockers.map((e) => (
                    <li key={e.id} className="rounded-tm-sm bg-tm-bg px-3.5 py-2.5">
                      <p className="text-[12.5px] font-bold text-tm-sub">{nameOfEntry(e)} · {dotDay(e.day)}({weekdayOf(e.day)})</p>
                      <p className="mt-0.5 whitespace-pre-line text-[14px] leading-[1.6] text-tm-ink [overflow-wrap:anywhere]">{e.blocker.trim()}</p>
                      {!final && (
                        <button type="button" onClick={() => toIssues(e)}
                          className="mt-1 inline-flex min-h-[28px] items-center text-[13px] font-bold text-tm-blue underline-offset-[3px] hover:underline [@media(pointer:coarse)]:min-h-10">
                          이슈 칸에 붙이기
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="사람별 완료" sub="일간보고의 완료 칸">
              {doneBy.length === 0 ? (
                <p className="text-[14px] text-tm-sub">이번 주 일간보고에 적힌 완료가 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {doneBy.map((r) => (
                    <details key={r.person.id} className="group rounded-tm-sm open:bg-tm-bg">
                      <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-2 rounded-tm-sm px-3 text-[14.5px] font-bold text-tm-ink
                                          hover:bg-tm-tint [&::-webkit-details-marker]:hidden">
                        {r.person.name}
                        <span className="flex items-center gap-2 text-[13px] font-semibold text-tm-sub">
                          {r.lines.length}줄
                          <span className="transition-transform duration-150 group-open:rotate-180" aria-hidden>▾</span>
                        </span>
                      </summary>
                      <ul className="flex flex-col gap-1 px-3 pb-3 pt-1">
                        {r.lines.map((l, k) => (
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
              {numbers.nextWeek.length === 0 ? (
                <p className="text-[14px] text-tm-sub">다음 주에 마감인 작업이 없습니다.</p>
              ) : (
                <ul className="flex flex-col">
                  {numbers.nextWeek.slice(0, 12).map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => onTaskOpen(t.id)}
                        className="flex w-full items-center gap-2.5 rounded-tm-sm px-2 py-2 text-left transition-colors duration-150 hover:bg-tm-tint">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold text-tm-ink">
                            <span className="mr-1.5 text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>{t.title || '제목 없음'}
                          </span>
                        </span>
                        <span className="flex-none text-[12.5px] font-semibold tabular-nums text-tm-sub">{dotDay(t.due ?? '')}({weekdayOf(t.due ?? '')})</span>
                        <Avatar id={t.assignee} size={24} />
                      </button>
                    </li>
                  ))}
                  {numbers.nextWeek.length > 12 && (
                    <li className="px-2 pt-1 text-[13px] text-tm-sub">외 {numbers.nextWeek.length - 12}건</li>
                  )}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      </div>
      {confirmNode}
    </>
  );
}
