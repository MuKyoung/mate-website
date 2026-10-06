'use client';

import { useMemo, useState } from 'react';
import {
  DOMAINS, MEMBERS, memberById, type DomainKey, type Task,
} from './types';
import { Avatar, DueBadge, PriorityDot, STATUS_STYLE, ghField } from './ui';

/**
 * 로드맵 — 영역 × 시간대 격자.
 *
 * 보드는 "지금 어느 단계냐", 타임라인은 "며칠에 걸쳐 있냐"를 본다.
 * 로드맵은 그 둘 다 아닌 "언제쯤 나가느냐"만 본다. 날짜를 달 단위로
 * 뭉개고 영역별로 줄을 세우면, 어느 영역이 어느 달에 비어 있는지가
 * 한 눈에 들어온다 — 일정 협의와 인력 배치는 이 그림으로 한다.
 */

type Horizon = 'thisWeek' | 'nextWeek' | 'later' | 'none';

const HORIZONS: { id: Horizon; label: string }[] = [
  { id: 'thisWeek', label: '이번 주' },
  { id: 'nextWeek', label: '다음 주' },
  { id: 'later', label: '그 이후' },
  { id: 'none', label: '일정 없음' },
];

const DAY = 86400000;

/** 월요일을 주의 시작으로 본다 */
function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const back = (x.getDay() + 6) % 7;
  return new Date(x.getTime() - back * DAY);
}

/**
 * 마감일이 속한 시간대.
 * 달 단위로 묶으면 이 팀 일감은 전부 한 칸에 몰린다 — 실제 주기가 1~2주라
 * 주 단위로 자른다. 지난 일정은 '이번 주'로 끌어와 눈에 띄게 둔다.
 */
function horizonOf(due: string | null, now: Date): Horizon {
  if (!due) return 'none';
  const d = new Date(`${due}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'none';
  const w0 = weekStart(now).getTime();
  const t = weekStart(d).getTime();
  if (t <= w0) return 'thisWeek';
  if (t === w0 + 7 * DAY) return 'nextWeek';
  return 'later';
}

type GroupBy = 'domain' | 'assignee';

export default function Roadmap({
  tasks, onOpen,
}: {
  tasks: Task[];
  onOpen(id: string): void;
}) {
  const [groupBy, setGroupBy] = useState<GroupBy>('domain');
  const now = useMemo(() => new Date(), []);

  const lanes = useMemo(() => {
    const base =
      groupBy === 'domain'
        ? DOMAINS.map((d) => ({ id: d.id as string, label: d.label }))
        : [
            ...MEMBERS.map((m) => ({ id: m.id, label: `${m.name} · ${m.role}` })),
            { id: '__none', label: '미배정' },
          ];

    return base
      .map((lane) => {
        const mine = tasks.filter((t) =>
          groupBy === 'domain'
            ? t.domain === (lane.id as DomainKey)
            : (t.assignee ?? '__none') === lane.id);

        const cells = HORIZONS.map((h) => ({
          horizon: h.id,
          items: mine
            .filter((t) => horizonOf(t.due, now) === h.id)
            // 마감일 있는 것부터, 같으면 빠른 날짜부터
            .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999')),
        }));

        return { ...lane, total: mine.length, cells };
      })
      // 할 일이 하나도 없는 줄은 격자를 늘리기만 한다
      .filter((lane) => lane.total > 0);
  }, [tasks, groupBy, now]);

  const perHorizon = useMemo(
    () =>
      Object.fromEntries(
        HORIZONS.map((h) => [h.id, tasks.filter((t) => horizonOf(t.due, now) === h.id).length]),
      ) as Record<Horizon, number>,
    [tasks, now],
  );

  /** 'M.D–M.D' — 어느 주를 말하는지 숫자로 못박는다 */
  const weekLabel = (offset: number) => {
    const a = new Date(weekStart(now).getTime() + offset * 7 * DAY);
    const b = new Date(a.getTime() + 6 * DAY);
    return `${a.getMonth() + 1}.${a.getDate()}–${b.getMonth() + 1}.${b.getDate()}`;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 도구 막대 */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gh-border bg-gh-canvas px-4 py-2">
        <label className="sr-only" htmlFor="rm-group">묶는 기준</label>
        <select id="rm-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className={ghField}>
          <option value="domain">영역별</option>
          <option value="assignee">담당자별</option>
        </select>
        <span className="ml-auto text-[12.5px] text-gh-fg-muted">
          마감일 기준입니다 · 지난 일정은 이번 주에 모아 둡니다
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {lanes.length === 0 ? (
          <p className="py-20 text-center text-[14px] text-gh-fg-muted">조건에 맞는 작업이 없습니다.</p>
        ) : (
          <div className="min-w-[860px]">
            {/* 시간대 머리 */}
            <div className="grid grid-cols-[168px_repeat(4,minmax(0,1fr))] gap-3 pb-2">
              <span />
              {HORIZONS.map((h, i) => (
                <div key={h.id} className="flex items-baseline gap-2 px-1">
                  <h2 className="text-[14px] font-semibold text-gh-fg">{h.label}</h2>
                  {i < 2 && (
                    <span className="text-[12px] tabular-nums text-gh-fg-subtle">{weekLabel(i)}</span>
                  )}
                  <span className="ml-auto text-[12px] tabular-nums text-gh-fg-muted">
                    {perHorizon[h.id]}
                  </span>
                </div>
              ))}
            </div>

            {/* 영역 × 시간대 */}
            <div className="space-y-3">
              {lanes.map((lane) => (
                <div key={lane.id}
                  className="grid grid-cols-[168px_repeat(4,minmax(0,1fr))] items-stretch gap-3">
                  <div className="flex items-start gap-2 pt-3">
                    {groupBy === 'domain' ? (
                      <span className={`mt-[5px] h-2 w-2 shrink-0 rounded-sm ${
                        lane.id === 'web' ? 'bg-gh-accent'
                          : lane.id === 'game' ? 'bg-gh-done'
                            : lane.id === 'edu' ? 'bg-gh-attention'
                              : 'bg-gh-neutral'}`} />
                    ) : (
                      <Avatar id={lane.id === '__none' ? null : lane.id} size={18} />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-gh-fg">
                        {groupBy === 'domain' ? lane.label : memberById(lane.id)?.name ?? '미배정'}
                      </p>
                      <p className="text-[12px] tabular-nums text-gh-fg-muted">{lane.total}건</p>
                    </div>
                  </div>

                  {lane.cells.map((cell) => (
                    <div key={cell.horizon}
                      className={`min-h-[76px] rounded-md border p-2 ${
                        cell.items.length
                          ? 'border-gh-border bg-gh-canvas'
                          : 'border-dashed border-gh-border bg-gh-canvas-subtle'}`}>
                      {cell.items.length === 0 ? (
                        <span className="sr-only">없음</span>
                      ) : (
                        <ul className="space-y-1.5">
                          {cell.items.map((t) => (
                            <li key={t.id}>
                              <button onClick={() => onOpen(t.id)}
                                className="group w-full rounded-md border border-gh-border bg-gh-canvas px-2 py-1.5 text-left
                                           transition-colors duration-150 hover:border-gh-border-strong hover:bg-gh-canvas-subtle">
                                <span className="mb-1 flex items-center gap-1.5">
                                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLE[t.status].dot}`} />
                                  <span className="gh-mono text-[11.5px] tabular-nums text-gh-fg-muted">{t.key}</span>
                                  <span className="ml-auto"><PriorityDot p={t.priority} /></span>
                                </span>
                                <span className={`block text-[13px] leading-[1.4] ${
                                  t.status === 'done' ? 'text-gh-fg-muted line-through' : 'text-gh-fg'}`}>
                                  {t.title}
                                </span>
                                <span className="mt-1 flex items-center justify-between gap-2">
                                  <DueBadge due={t.due} done={t.status === 'done'} />
                                  <Avatar id={t.assignee} size={18} />
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
