'use client';

import { useMemo, useState } from 'react';
import { DOMAINS, type DomainKey, type Task } from './types';
import { useMembers } from './members';
import { useToday } from './Timeline';
import { Avatar, DOMAIN_FILL, DueBadge, PriorityDot, STATUS_STYLE, tmCount, tmSelect } from './ui';

/**
 * 로드맵 - 영역 × 시간대 격자.
 *
 * 보드는 "지금 어느 단계냐", 타임라인은 "며칠에 걸쳐 있냐"를 본다.
 * 로드맵은 그 둘 다 아닌 "언제쯤 나가느냐"만 본다. 날짜를 주 단위로
 * 뭉개고 영역별로 줄을 세우면, 어느 영역이 어느 주에 비어 있는지가
 * 한 눈에 들어온다 - 일정 협의와 인력 배치는 이 그림으로 한다.
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
 * 달 단위로 묶으면 이 팀 일감은 전부 한 칸에 몰린다 - 실제 주기가 1~2주라
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
  const now = useToday();
  const members = useMembers();

  /* 지난주까지 마감된 완료 작업은 '이번 주'에 계속 쌓이므로 올리지 않는다 */
  const shown = useMemo(() => {
    const w0 = weekStart(now).getTime();
    return tasks.filter((t) => !(t.status === 'done' && t.due && new Date(`${t.due}T00:00:00`).getTime() < w0));
  }, [tasks, now]);
  const hiddenDone = tasks.length - shown.length;

  const lanes = useMemo(() => {
    const base =
      groupBy === 'domain'
        ? DOMAINS.map((d) => ({ id: d.id as string, label: d.label }))
        : [
            ...members.map((m) => ({ id: m.id, label: m.name })),
            { id: '__none', label: '미배정' },
          ];

    return base
      .map((lane) => {
        const mine = shown.filter((t) =>
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
  }, [shown, groupBy, now, members]);

  const perHorizon = useMemo(
    () =>
      Object.fromEntries(
        HORIZONS.map((h) => [h.id, shown.filter((t) => horizonOf(t.due, now) === h.id).length]),
      ) as Record<Horizon, number>,
    [shown, now],
  );

  /** 'M.D~M.D' - 어느 주를 말하는지 숫자로 못박는다 */
  const weekLabel = (offset: number) => {
    const a = new Date(weekStart(now).getTime() + offset * 7 * DAY);
    const b = new Date(a.getTime() + 6 * DAY);
    return `${a.getMonth() + 1}.${a.getDate()}~${b.getMonth() + 1}.${b.getDate()}`;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 보기 설정 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-2.5">
        <label className="sr-only" htmlFor="rm-group">묶는 기준</label>
        <select id="rm-group" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          className={tmSelect}>
          <option value="domain">영역별</option>
          <option value="assignee">담당자별</option>
        </select>
        {hiddenDone > 0 && (
          <span className="ml-auto text-[13.5px] text-tm-sub">
            지난주까지 마감된 완료 작업 {hiddenDone}건은 로드맵에 올라오지 않습니다
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {lanes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-tm border border-tm-line bg-white px-6 py-[72px] text-center shadow-tm">
            <p className="text-[20px] font-extrabold text-tm-deep">조건에 맞는 작업이 없습니다</p>
            <p className="text-[15.5px] text-tm-ink">
              {hiddenDone > 0
                ? '지난주까지 마감된 완료 작업만 남아 있습니다. 보드나 목록에서 볼 수 있습니다.'
                : '걸러 보기를 풀거나 다른 범위를 골라 보세요.'}
            </p>
          </div>
        ) : (
          <div className="min-w-[900px] pb-1">
            {/* 시간대 머리 */}
            <div className="grid grid-cols-[184px_repeat(4,minmax(0,1fr))] gap-3.5 pb-2.5">
              <span />
              {HORIZONS.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2 px-1">
                  <h2 className="text-[15.5px] font-extrabold text-tm-deep">{h.label}</h2>
                  {i < 2 && (
                    <span className="text-[13px] font-semibold tabular-nums text-tm-sub">{weekLabel(i)}</span>
                  )}
                  <span className={`ml-auto ${tmCount}`}>{perHorizon[h.id]}</span>
                </div>
              ))}
            </div>

            {/* 영역 × 시간대 */}
            <div className="space-y-3.5">
              {lanes.map((lane) => (
                <div key={lane.id}
                  className="grid grid-cols-[184px_repeat(4,minmax(0,1fr))] items-stretch gap-3.5">
                  <div className="flex items-start gap-2.5 pt-3.5">
                    {groupBy === 'domain' ? (
                      <span className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-[3px] ${DOMAIN_FILL[lane.id as DomainKey]}`} />
                    ) : (
                      <Avatar id={lane.id === '__none' ? null : lane.id} size={26} />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-tm-ink">
                        {lane.label}
                      </p>
                      <p className="text-[13px] font-semibold tabular-nums text-tm-sub">{lane.total}건</p>
                    </div>
                  </div>

                  {lane.cells.map((cell) => (
                    <div key={cell.horizon}
                      className={`min-h-[84px] rounded-tm p-2 ${
                        cell.items.length
                          ? 'border border-tm-line bg-white shadow-tm'
                          : 'border-2 border-dashed border-tm-line'}`}>
                      {cell.items.length === 0 ? (
                        <span className="sr-only">없음</span>
                      ) : (
                        <ul className="space-y-1.5">
                          {cell.items.map((t) => (
                            <li key={t.id}>
                              {/* 흰 칸 안의 항목은 세종 관리자 홈의 할 일 줄처럼 회색 바탕 */}
                              <button type="button" onClick={() => onOpen(t.id)}
                                className="w-full rounded-tm-sm bg-tm-bg px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150
                                           hover:bg-tm-tint hover:shadow-[inset_0_0_0_1px_#2644cb]">
                                <span className="mb-1 flex items-center gap-2">
                                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLE[t.status].dot}`} />
                                  <span className="text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                                  <span className="ml-auto"><PriorityDot p={t.priority} /></span>
                                </span>
                                <span className={`block text-[14px] font-bold leading-[1.45] ${
                                  t.status === 'done' ? 'text-tm-sub line-through' : 'text-tm-ink'}`}>
                                  {t.title}
                                </span>
                                <span className="mt-1.5 flex min-h-[22px] items-center justify-between gap-2">
                                  <DueBadge due={t.due} done={t.status === 'done'} />
                                  <span className="ml-auto"><Avatar id={t.assignee} size={22} /></span>
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
