'use client';

import { useMemo, useState } from 'react';
import { DOMAINS, MEMBERS, domainLabel, type DomainKey, type Task } from './types';
import { Avatar, PriorityDot } from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const BAR: Record<DomainKey, string> = {
  web: 'bg-blue-500',
  game: 'bg-violet-500',
  edu: 'bg-amber-500',
  ops: 'bg-slate-500',
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const parse = (s: string) => new Date(`${s}T00:00:00`);
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

type GroupBy = 'domain' | 'assignee';

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
  const [groupBy, setGroupBy] = useState<GroupBy>('domain');

  const { days, today } = useMemo(() => {
    const t = startOfToday();
    // 지난 한 주를 함께 보여 줘야 지연된 작업이 화면 밖으로 밀리지 않는다
    const from = new Date(t.getTime() - 7 * DAY);
    const total = weeks * 7;
    return {
      days: Array.from({ length: total }, (_, i) => new Date(from.getTime() + i * DAY)),
      today: t,
    };
  }, [weeks]);

  const COL = 34;

  const { groups, undated } = useMemo(() => {
    const dated = tasks.filter((t) => t.start || t.due);
    const undatedList = tasks.filter((t) => !t.start && !t.due);

    const keys = groupBy === 'domain'
      ? DOMAINS.map((d) => ({ id: d.id as string, label: d.label }))
      : [...MEMBERS.map((m) => ({ id: m.id, label: `${m.name} · ${m.role}` })),
         { id: '__none', label: '미배정' }];

    return {
      groups: keys
        .map((k) => ({
          ...k,
          items: dated.filter((t) =>
            groupBy === 'domain' ? t.domain === k.id : (t.assignee ?? '__none') === k.id),
        }))
        .filter((g) => g.items.length > 0),
      undated: undatedList,
    };
  }, [tasks, groupBy]);

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
      {/* 도구 막대 */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <label className="sr-only" htmlFor="tl-group">묶는 기준</label>
        <select id="tl-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12.5px] text-slate-600 outline-none transition focus:border-blue-500">
          <option value="domain">영역별</option>
          <option value="assignee">담당자별</option>
        </select>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
          {[4, 6, 10].map((w) => (
            <button key={w} onClick={() => setWeeks(w)} aria-pressed={weeks === w}
              className={`rounded px-2.5 py-1 text-[12.5px] font-medium transition ${
                weeks === w ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {w}주
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11.5px] text-slate-400">막대를 누르면 작업이 열립니다</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="flex min-w-max">
          {/* 왼쪽 고정 열 */}
          <div className="sticky left-0 z-20 w-[220px] shrink-0 border-r border-slate-200 bg-white">
            <div className="h-[46px] border-b border-slate-200" />
            {groups.map((g) => (
              <div key={g.id}>
                <div className="flex h-8 items-center gap-2 border-b border-slate-100 bg-slate-50 px-3">
                  <span className="text-[11.5px] font-semibold text-slate-500">{g.label}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">{g.items.length}</span>
                </div>
                {g.items.map((t) => (
                  <div key={t.id} className="flex h-[38px] items-center gap-1.5 border-b border-slate-100 px-3">
                    <PriorityDot p={t.priority} />
                    <span className="truncate text-[12.5px] text-slate-700" title={t.title}>{t.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 격자 */}
          <div className="relative" style={{ width: span * COL }}>
            {/* 날짜 머리 */}
            <div className="sticky top-0 z-10 flex h-[46px] border-b border-slate-200 bg-white">
              {days.map((d, i) => {
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday = i === todayIdx;
                const monthStart = d.getDate() === 1 || i === 0;
                return (
                  <div key={i} style={{ width: COL }}
                    className={`relative flex shrink-0 flex-col items-center justify-center border-r border-slate-100 ${
                      weekend ? 'bg-slate-50' : ''}`}>
                    {monthStart && (
                      <span className="absolute left-1 top-0.5 whitespace-nowrap text-[10px] font-semibold text-slate-400">
                        {d.getMonth() + 1}월
                      </span>
                    )}
                    <span className={`text-[10px] ${weekend ? 'text-slate-400' : 'text-slate-400'}`}>
                      {WEEKDAY[d.getDay()]}
                    </span>
                    <span className={`text-[11.5px] tabular-nums ${
                      isToday ? 'flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-600 font-semibold text-white'
                        : 'text-slate-600'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 세로 격자 + 오늘 선 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[46px] flex">
              {days.map((d, i) => (
                <div key={i} style={{ width: COL }}
                  className={`shrink-0 border-r border-slate-100 ${
                    d.getDay() === 0 || d.getDay() === 6 ? 'bg-slate-50/60' : ''}`} />
              ))}
            </div>
            {todayIdx >= 0 && todayIdx < span && (
              <div className="pointer-events-none absolute bottom-0 top-[46px] z-[5] w-px bg-blue-500/60"
                style={{ left: todayIdx * COL + COL / 2 }} />
            )}

            {/* 막대 */}
            {groups.map((g) => (
              <div key={g.id}>
                <div className="h-8 border-b border-slate-100 bg-slate-50/80" />
                {g.items.map((t) => {
                  const b = bar(t);
                  const done = t.status === 'done';
                  return (
                    <div key={t.id} className="relative h-[38px] border-b border-slate-100">
                      {b && (
                        <button onClick={() => onOpen(t.id)}
                          title={`${t.title} · ${t.start ?? '시작 미정'} → ${t.due ?? '마감 미정'}`}
                          style={{ left: b.left + 3, width: b.width }}
                          className={`absolute top-[7px] flex h-6 items-center gap-1.5 px-2 text-[11px] font-medium text-white
                                      transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                      ${BAR[t.domain]} ${done ? 'opacity-45' : ''}
                                      ${b.cutLeft ? 'rounded-l-none' : 'rounded-l'}
                                      ${b.cutRight ? 'rounded-r-none' : 'rounded-r'}`}>
                          <span className="truncate">{t.key}</span>
                          {t.assignee && <span className="ml-auto shrink-0"><Avatar id={t.assignee} size={16} /></span>}
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
          <div className="border-t border-slate-200 bg-white p-4">
            <p className="mb-2.5 text-[11.5px] font-semibold text-slate-500">
              날짜 없음 <span className="tabular-nums text-slate-400">{undated.length}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {undated.map((t) => (
                <button key={t.id} onClick={() => onOpen(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  <PriorityDot p={t.priority} />
                  <span className="font-mono text-[11px] text-slate-400">{t.key}</span>
                  <span className="max-w-[220px] truncate">{t.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[11.5px] text-slate-400">
              작업을 열어 시작일과 마감일을 넣으면 위 타임라인에 올라옵니다.
            </p>
          </div>
        )}

        {groups.length === 0 && undated.length === 0 && (
          <p className="px-4 py-16 text-center text-[13px] text-slate-400">조건에 맞는 작업이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export { iso, parse, startOfToday, DAY, WEEKDAY, BAR, domainLabel };
