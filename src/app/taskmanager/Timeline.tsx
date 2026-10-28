'use client';

import { useEffect, useMemo, useState } from 'react';
import { localToday, type Task } from './types';
import { useMembers } from './members';
import { domainOf, useDomains } from './domainStore';
import { Avatar, DOMAIN_FILL, IconArrow, PriorityDot, tmCount, tmGhostBtn, tmIconBtn, tmSelect, tmTab } from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const parse = (s: string) => new Date(`${s}T00:00:00`);
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

/** 오늘 0시. 탭을 밤새 열어 두었다가 돌아오면 날짜를 다시 잰다 */
function useToday(): Date {
  const [key, setKey] = useState(localToday);
  useEffect(() => {
    const check = () => { if (document.visibilityState === 'visible') setKey(localToday()); };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);
  return useMemo(() => parse(key), [key]);
}

type GroupBy = 'domain' | 'assignee';

/* 왼쪽 열과 격자의 줄 높이 - 둘이 어긋나면 막대가 다른 작업 줄에 붙는다 */
const COL = 36;

/**
 * 간트 타임라인.
 * 시작일이 없는 작업은 마감일 하루짜리 막대로, 둘 다 없으면 별도 묶음으로 내린다.
 */
export default function Timeline({
  tasks, onOpen,
}: {
  tasks: Task[];
  onOpen(id: string): void;
}) {
  const [weeks, setWeeks] = useState(6);
  /** 앞뒤로 넘긴 주 수 - 보이는 기간 밖에 있는 막대도 넘겨서 본다 */
  const [shift, setShift] = useState(0);
  const [groupBy, setGroupBy] = useState<GroupBy>('domain');
  const members = useMembers();
  const domains = useDomains();
  const today = useToday();

  const days = useMemo(() => {
    // 지난 한 주를 함께 보여 줘야 지연된 작업이 화면 밖으로 밀리지 않는다
    const from = new Date(today.getTime() + (shift - 1) * 7 * DAY);
    const total = weeks * 7;
    return Array.from({ length: total }, (_, i) => new Date(from.getTime() + i * DAY));
  }, [weeks, today, shift]);

  const { groups, undated } = useMemo(() => {
    const dated = tasks.filter((t) => t.start || t.due);
    const undatedList = tasks.filter((t) => !t.start && !t.due);

    // 목록에 없는 영역(방금 지워진 것)의 작업도 사라지지 않게 '영역 없음' 줄에 모은다
    const known = new Set(domains.map((d) => d.id));
    const keys = groupBy === 'domain'
      ? [...domains.map((d) => ({ id: d.id, label: d.label })), { id: '__none', label: '영역 없음' }]
      : [...members.map((m) => ({ id: m.id, label: m.role ? `${m.name} · ${m.role}` : m.name })),
         { id: '__none', label: '미배정' }];

    return {
      groups: keys
        .map((k) => ({
          ...k,
          items: dated.filter((t) =>
            groupBy === 'domain' ? (known.has(t.domain) ? t.domain : '__none') === k.id : (t.assignee ?? '__none') === k.id),
        }))
        .filter((g) => g.items.length > 0),
      undated: undatedList,
    };
  }, [tasks, groupBy, members, domains]);

  const first = days[0];
  const span = days.length;

  /** 막대의 시작 칸과 길이를 구한다. 화면 밖이면 null. */
  const bar = (t: Task) => {
    const s = t.start ? parse(t.start) : t.due ? parse(t.due) : null;
    const e = t.due ? parse(t.due) : s;
    if (!s || !e) return null;
    const from = Math.round((s.getTime() - first.getTime()) / DAY);
    const to = Math.round((e.getTime() - first.getTime()) / DAY);
    if (to < 0 || from > span - 1) return null;
    const clampedFrom = Math.max(0, from);
    const clampedTo = Math.min(span - 1, to);
    return {
      left: clampedFrom * COL,
      width: Math.max(COL - 6, (clampedTo - clampedFrom + 1) * COL - 6),
      cutLeft: from < 0,
      cutRight: to > span - 1,
    };
  };

  const todayIdx = Math.round((today.getTime() - first.getTime()) / DAY);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 보기 설정 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-2.5">
        <label className="sr-only" htmlFor="tl-group">묶는 기준</label>
        <select id="tl-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className={tmSelect}>
          <option value="domain">영역별</option>
          <option value="assignee">담당자별</option>
        </select>
        <div role="group" aria-label="보이는 기간" className="flex items-center gap-1.5">
          {[4, 6, 10].map((w) => (
            <button key={w} type="button" onClick={() => setWeeks(w)} aria-pressed={weeks === w} className={tmTab}>
              {w}주
            </button>
          ))}
        </div>
        {/* 기간 넘기기 - 캘린더의 달 넘기기와 같은 꼴 */}
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setShift(shift - weeks)} className={tmIconBtn} aria-label="이전 기간">
            <IconArrow dir="left" />
          </button>
          <button type="button" onClick={() => setShift(shift + weeks)} className={tmIconBtn} aria-label="다음 기간">
            <IconArrow dir="right" />
          </button>
          <button type="button" onClick={() => setShift(0)} className={tmGhostBtn}>
            오늘
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-tm border border-tm-line bg-white shadow-tm">
        <div className="flex min-w-max">
          {/* 왼쪽 고정 열 */}
          <div className="sticky left-0 z-20 w-[260px] shrink-0 border-r border-tm-line bg-white">
            <div className="sticky top-0 z-10 flex h-[52px] items-end border-b border-tm-line bg-white px-4 pb-2.5 text-[13px] font-bold text-tm-sub">
              작업
            </div>
            {groups.map((g) => (
              <div key={g.id}>
                <div className="flex h-9 items-center gap-2 border-b border-tm-line bg-tm-bg px-4">
                  <span className="truncate text-[13.5px] font-extrabold text-tm-deep">{g.label}</span>
                  <span className={tmCount}>{g.items.length}</span>
                </div>
                {g.items.map((t) => (
                  /* 막대가 화면 밖에 있어도 여기서 열 수 있다 - 높이는 격자 줄과 같아야 한다 */
                  <button key={t.id} type="button" onClick={() => onOpen(t.id)}
                    className="flex h-11 w-full items-center gap-2 border-b border-tm-line px-4 text-left transition-colors duration-150 hover:bg-tm-tint">
                    <PriorityDot p={t.priority} />
                    <span className={`truncate text-[14.5px] font-semibold ${t.status === 'done' ? 'text-tm-sub line-through' : 'text-tm-ink'}`}
                      title={t.title}>
                      {t.title}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* 격자 */}
          <div className="relative" style={{ width: span * COL }}>
            {/* 날짜 머리 */}
            <div className="sticky top-0 z-10 flex h-[52px] border-b border-tm-line bg-white">
              {days.map((d, i) => {
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday = i === todayIdx;
                const monthStart = d.getDate() === 1 || i === 0;
                return (
                  <div key={i} style={{ width: COL }}
                    className={`relative flex shrink-0 flex-col items-center justify-end gap-0.5 border-r border-tm-line/60 pb-1.5 ${
                      weekend ? 'bg-tm-bg' : ''}`}>
                    {/* 달이 바뀌는 칸은 요일 자리에 달을 적는다 */}
                    {monthStart ? (
                      <span className="whitespace-nowrap text-[11px] font-extrabold text-tm-deep">{d.getMonth() + 1}월</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-tm-sub">{WEEKDAY[d.getDay()]}</span>
                    )}
                    <span className={`grid h-[22px] w-[22px] place-items-center rounded-full text-[12.5px] tabular-nums ${
                      isToday ? 'bg-tm-blue font-bold text-white' : 'font-semibold text-tm-ink'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 세로 격자 + 오늘 선 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[52px] flex">
              {days.map((d, i) => (
                <div key={i} style={{ width: COL }}
                  className={`shrink-0 border-r border-tm-line/60 ${
                    d.getDay() === 0 || d.getDay() === 6 ? 'bg-tm-bg/70' : ''}`} />
              ))}
            </div>
            {todayIdx >= 0 && todayIdx < span && (
              <div className="pointer-events-none absolute bottom-0 top-[52px] z-[5] w-0.5 -translate-x-1/2 bg-tm-red/70"
                style={{ left: todayIdx * COL + COL / 2 }} />
            )}

            {/* 막대 */}
            {groups.map((g) => (
              <div key={g.id}>
                <div className="h-9 border-b border-tm-line bg-tm-bg/80" />
                {g.items.map((t) => {
                  const b = bar(t);
                  const done = t.status === 'done';
                  return (
                    <div key={t.id} className="relative h-11 border-b border-tm-line">
                      {b && (
                        <button type="button" onClick={() => onOpen(t.id)}
                          title={`${t.title} · ${t.start ?? '시작 미정'} → ${t.due ?? '마감 미정'}`}
                          aria-label={`${t.key} ${t.title}`}
                          style={{ left: b.left + 3, width: b.width }}
                          className={`absolute top-[9px] flex h-[26px] items-center gap-1.5 px-2.5 text-[12.5px] font-bold text-white
                                      shadow-tm transition-[filter,box-shadow] duration-150 hover:shadow-tm-up hover:brightness-110
                                      ${DOMAIN_FILL[domainOf(domains, t.domain).color]} ${done ? 'opacity-45' : ''}
                                      ${b.cutLeft ? 'rounded-l-none' : 'rounded-l-lg'}
                                      ${b.cutRight ? 'rounded-r-none' : 'rounded-r-lg'}`}>
                          <span className="truncate tabular-nums">{t.key}</span>
                          {t.assignee && <span className="ml-auto shrink-0"><Avatar id={t.assignee} size={18} /></span>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 날짜가 없는 작업 */}
        {undated.length > 0 && (
          <div className="border-t border-tm-line bg-white p-5">
            <p className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-tm-deep">
              날짜 없음 <span className={tmCount}>{undated.length}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {undated.map((t) => (
                <button key={t.id} type="button" onClick={() => onOpen(t.id)}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-tm-sm border border-tm-line bg-white px-3 text-[14px] font-semibold text-tm-ink
                             transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint">
                  <PriorityDot p={t.priority} />
                  <span className="text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                  <span className="max-w-[240px] truncate">{t.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13.5px] leading-[1.6] text-tm-sub">
              작업을 열어 시작일과 마감일을 넣으면 위 타임라인에 올라옵니다.
            </p>
          </div>
        )}

        {groups.length === 0 && undated.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="text-[20px] font-extrabold text-tm-deep">조건에 맞는 작업이 없습니다</p>
            <p className="text-[15.5px] text-tm-ink">걸러 보기를 풀거나 다른 범위를 골라 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { parse, startOfToday, useToday, DAY, WEEKDAY };
