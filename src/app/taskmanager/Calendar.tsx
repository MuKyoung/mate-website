'use client';

import { useMemo, useState } from 'react';
import { DOMAINS, type DomainKey, type Task } from './types';
import { DOMAIN_FILL, IconArrow, IconPlus, tmGhostBtn, tmIconBtn } from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const DOT: Record<DomainKey, string> = DOMAIN_FILL;

const iso = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

/**
 * 월간 캘린더. 마감일을 기준으로 작업을 올린다.
 * 빈 날짜를 누르면 그 날이 마감인 새 작업을 만든다.
 */
export default function Calendar({
  tasks, onOpen, onCreateAt, onReschedule,
}: {
  tasks: Task[];
  onOpen(id: string): void;
  onCreateAt(dueISO: string): void;
  /** 다른 날로 끌어다 놓으면 마감일을 옮긴다 */
  onReschedule(id: string, dueISO: string): void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const todayKey = iso(new Date());

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    // 그 주 일요일부터 시작해 6주(42칸)를 채운다 - 달마다 높이가 변하지 않는다
    const gridStart = new Date(first.getTime() - first.getDay() * DAY);
    return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getTime() + i * DAY));
  }, [cursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.due) return;
      const list = map.get(t.due) ?? [];
      list.push(t);
      map.set(t.due, list);
    });
    // 같은 날 안에서는 우선순위 높은 것부터
    const rank: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    map.forEach((list) => list.sort((a, b) => rank[a.priority] - rank[b.priority]));
    return map;
  }, [tasks]);

  const undated = tasks.filter((t) => !t.due);
  const move = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const toThisMonth = () => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 달 넘기기 */}
      <div className="mb-3.5 flex flex-none flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => move(-1)} className={tmIconBtn} aria-label="이전 달">
          <IconArrow dir="left" />
        </button>
        <button type="button" onClick={() => move(1)} className={tmIconBtn} aria-label="다음 달">
          <IconArrow dir="right" />
        </button>
        <h2 className="mx-1 text-[20px] font-extrabold tabular-nums tracking-[-0.01em] text-tm-deep">
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </h2>
        <button type="button" onClick={toThisMonth} className={tmGhostBtn}>
          이번 달
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm">
          {/* 요일 머리 */}
          <div className="grid grid-cols-7 border-b border-tm-line bg-tm-bg">
            {WEEKDAY.map((w, i) => (
              <div key={w} className={`py-2.5 text-center text-[13px] font-bold ${
                i === 0 ? 'text-tm-red-deep' : i === 6 ? 'text-tm-blue' : 'text-tm-sub'}`}>
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 칸 */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const key = iso(d);
              const items = byDate.get(key) ?? [];
              const outside = d.getMonth() !== cursor.getMonth();
              const isToday = key === todayKey;
              const weekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <div key={key}
                  onClick={(e) => { if (e.target === e.currentTarget) onCreateAt(key); }}
                  onDragOver={(e) => {
                    // 드롭을 허용하려면 매 dragover 마다 필요하다
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (overKey !== key) setOverKey(key);
                  }}
                  onDragLeave={() => setOverKey((k) => (k === key ? null : k))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/plain') || dragId;
                    if (id) onReschedule(id, key);
                    setDragId(null);
                    setOverKey(null);
                  }}
                  className={`group min-h-[120px] cursor-pointer border-b border-r border-tm-line p-2 transition-colors duration-150
                              ${i % 7 === 6 ? 'border-r-0' : ''}
                              ${i >= 35 ? 'border-b-0' : ''}
                              ${overKey === key
                                ? 'bg-tm-tint shadow-[inset_0_0_0_2px_#2644cb]'
                                : outside ? 'bg-tm-bg/60 hover:bg-tm-tint/60' : 'hover:bg-tm-tint/60'}`}>
                  <div className="pointer-events-none mb-1 flex items-center justify-between">
                    <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[13px] tabular-nums ${
                      isToday ? 'bg-tm-blue font-bold text-white'
                        : outside ? 'font-semibold text-tm-edge'
                          : weekend ? (d.getDay() === 0 ? 'font-bold text-tm-red-deep' : 'font-bold text-tm-blue')
                            : 'font-semibold text-tm-ink'}`}>
                      {d.getDate()}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onCreateAt(key); }}
                      aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일에 작업 추가`}
                      className="pointer-events-auto grid h-6 w-6 place-items-center rounded-md text-tm-sub opacity-0 transition
                                 hover:bg-white hover:text-tm-blue focus-visible:opacity-100 group-hover:opacity-100">
                      <IconPlus size={15} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 3).map((t) => {
                      const done = t.status === 'done';
                      const overdue = !done && key < todayKey;
                      return (
                        <button key={t.id} type="button" onClick={(e) => { e.stopPropagation(); onOpen(t.id); }}
                          title={`${t.title} · 다른 날로 끌어다 놓으면 마감일이 바뀝니다`}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', t.id);
                            setDragId(t.id);
                          }}
                          onDragEnd={() => { setDragId(null); setOverKey(null); }}
                          className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[13px] leading-[1.35] transition-colors
                                      hover:bg-white hover:shadow-tm ${done ? 'opacity-55' : ''} ${dragId === t.id ? 'opacity-40' : ''}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[t.domain]}`} />
                          <span className={`truncate ${
                            done ? 'font-semibold text-tm-sub line-through' : overdue ? 'font-bold text-tm-red-deep' : 'font-semibold text-tm-ink'}`}>
                            {t.title}
                          </span>
                        </button>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="pointer-events-none px-1.5 text-[12.5px] font-semibold text-tm-sub">+{items.length - 3}건 더</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 범례 + 마감 없는 작업 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
          {DOMAINS.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-tm-sub">
              <span className={`h-2 w-2 rounded-full ${DOT[d.id]}`} />
              {d.label}
            </span>
          ))}
          {undated.length > 0 && (
            <span className="ml-auto text-[13.5px] text-tm-sub">
              마감일 없는 작업 {undated.length}건은 캘린더에 올라오지 않습니다
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { iso as isoDate };
