'use client';

import { useMemo, useState } from 'react';
import { DOMAINS, MEMBERS, domainLabel, type DomainKey, type Task } from './types';
import { Avatar, PriorityDot, ghField } from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

// 막대 위에 흰 글자를 올리므로 4.5:1 을 넘는 색조만 쓴다
// (#bf8700 은 3.0:1, #6e7781 은 4.0:1 로 모자라 한 단계씩 내렸다)
const BAR: Record<DomainKey, string> = {
  web: 'bg-gh-accent',
  game: 'bg-gh-done',
  edu: 'bg-gh-attention-fg',
  ops: 'bg-gh-fg-muted',
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
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gh-border bg-gh-canvas px-4 py-2">
        <label className="sr-only" htmlFor="tl-group">묶는 기준</label>
        <select id="tl-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className={ghField}>
          <option value="domain">영역별</option>
          <option value="assignee">담당자별</option>
        </select>
        <div className="flex h-8 items-center rounded-md border border-gh-border bg-gh-canvas-mute p-[3px]">
          {[4, 6, 10].map((w) => (
            <button key={w} onClick={() => setWeeks(w)} aria-pressed={weeks === w}
              className={`rounded-[5px] px-2.5 py-[3px] text-[14px] transition-colors duration-150 ${
                weeks === w
                  ? 'border border-gh-border bg-gh-canvas font-semibold text-gh-fg shadow-gh-sm'
                  : 'border border-transparent font-medium text-gh-fg-muted hover:text-gh-fg'}`}>
              {w}주
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12.5px] text-gh-fg-muted">막대를 누르면 작업이 열립니다</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="flex min-w-max">
          {/* 왼쪽 고정 열 */}
          <div className="sticky left-0 z-20 w-[252px] shrink-0 border-r border-gh-border bg-gh-canvas">
            <div className="h-[46px] border-b border-gh-border" />
            {groups.map((g) => (
              <div key={g.id}>
                <div className="flex h-8 items-center gap-2 border-b border-gh-border-muted bg-gh-canvas-subtle px-3">
                  <span className="text-[12.5px] font-semibold text-gh-fg-muted">{g.label}</span>
                  <span className="text-[12px] tabular-nums text-gh-fg-muted">{g.items.length}</span>
                </div>
                {g.items.map((t) => (
                  <div key={t.id} className="flex h-[38px] items-center gap-1.5 border-b border-gh-border-muted px-3">
                    <PriorityDot p={t.priority} />
                    <span className="truncate text-[13.5px] text-gh-fg" title={t.title}>{t.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 격자 */}
          <div className="relative" style={{ width: span * COL }}>
            {/* 날짜 머리 */}
            <div className="sticky top-0 z-10 flex h-[46px] border-b border-gh-border bg-gh-canvas">
              {days.map((d, i) => {
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday = i === todayIdx;
                const monthStart = d.getDate() === 1 || i === 0;
                return (
                  <div key={i} style={{ width: COL }}
                    className={`relative flex shrink-0 flex-col items-center justify-center border-r border-gh-border-muted pt-4 ${
                      weekend ? 'bg-gh-canvas-subtle' : ''}`}>
                    {monthStart && (
                      <span className="absolute left-1 top-[2px] whitespace-nowrap text-[11px] font-semibold text-gh-fg-muted">
                        {d.getMonth() + 1}월
                      </span>
                    )}
                    <span className={`text-[11px] ${weekend ? 'text-gh-fg-muted' : 'text-gh-fg-muted'}`}>
                      {WEEKDAY[d.getDay()]}
                    </span>
                    <span className={`text-[12.5px] tabular-nums ${
                      isToday ? 'flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gh-accent font-semibold text-white'
                        : 'text-gh-fg-muted'}`}>
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
                  className={`shrink-0 border-r border-gh-border-muted ${
                    d.getDay() === 0 || d.getDay() === 6 ? 'bg-gh-canvas-subtle/60' : ''}`} />
              ))}
            </div>
            {todayIdx >= 0 && todayIdx < span && (
              <div className="pointer-events-none absolute bottom-0 top-[46px] z-[5] w-px bg-gh-accent/60"
                style={{ left: todayIdx * COL + COL / 2 }} />
            )}

            {/* 막대 */}
            {groups.map((g) => (
              <div key={g.id}>
                <div className="h-8 border-b border-gh-border-muted bg-gh-canvas-subtle/80" />
                {g.items.map((t) => {
                  const b = bar(t);
                  const done = t.status === 'done';
                  return (
                    <div key={t.id} className="relative h-[38px] border-b border-gh-border-muted">
                      {b && (
                        <button onClick={() => onOpen(t.id)}
                          title={`${t.title} · ${t.start ?? '시작 미정'} → ${t.due ?? '마감 미정'}`}
                          style={{ left: b.left + 3, width: b.width }}
                          className={`absolute top-[7px] flex h-6 items-center gap-1.5 px-2 text-[12px] font-medium text-white
                                      transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent
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
          <div className="border-t border-gh-border bg-gh-canvas p-4">
            <p className="mb-2.5 text-[12.5px] font-semibold text-gh-fg-muted">
              날짜 없음 <span className="tabular-nums text-gh-fg-muted">{undated.length}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {undated.map((t) => (
                <button key={t.id} onClick={() => onOpen(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gh-border bg-gh-canvas px-2.5 py-1.5 text-[13.5px] text-gh-fg transition hover:border-gh-border-strong hover:bg-gh-canvas-subtle">
                  <PriorityDot p={t.priority} />
                  <span className="gh-mono text-[12px] text-gh-fg-muted">{t.key}</span>
                  <span className="max-w-[220px] truncate">{t.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[12.5px] text-gh-fg-muted">
              작업을 열어 시작일과 마감일을 넣으면 위 타임라인에 올라옵니다.
            </p>
          </div>
        )}

        {groups.length === 0 && undated.length === 0 && (
          <p className="px-4 py-16 text-center text-[14px] text-gh-fg-muted">조건에 맞는 작업이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export { iso, parse, startOfToday, DAY, WEEKDAY, BAR, domainLabel };
