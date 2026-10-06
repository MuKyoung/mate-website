'use client';

import { useMemo, useState } from 'react';
import type { DomainKey, Status, Task } from './types';
import { Avatar, PriorityDot, ghBtn } from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const DOT: Record<DomainKey, string> = {
  web: 'bg-gh-accent',
  game: 'bg-gh-done',
  edu: 'bg-gh-attention',
  ops: 'bg-gh-neutral',
};

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

  const navBtn =
    'flex h-8 w-8 items-center justify-center rounded-md border border-gh-border bg-gh-canvas-subtle ' +
    'text-gh-fg-muted transition-colors duration-150 hover:bg-gh-canvas-mute hover:text-gh-fg';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 도구 막대 */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gh-border bg-gh-canvas px-4 py-2">
        <button onClick={() => move(-1)} className={navBtn} aria-label="이전 달">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M9.5 4L5.5 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={() => move(1)} className={navBtn} aria-label="다음 달">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="ml-1 text-[15px] font-semibold tabular-nums text-gh-fg">
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </h2>
        <button onClick={toThisMonth}
          className={ghBtn}>
          이번 달
        </button>
        <span className="ml-auto text-[12.5px] text-gh-fg-muted">
          빈 칸을 누르면 새 작업 · 항목을 끌면 마감일이 바뀝니다
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="overflow-hidden rounded-md border border-gh-border bg-gh-canvas">
          {/* 요일 머리 */}
          <div className="grid grid-cols-7 border-b border-gh-border bg-gh-canvas-subtle">
            {WEEKDAY.map((w, i) => (
              <div key={w} className={`px-2 py-2 text-center text-[12.5px] font-semibold ${
                i === 0 ? 'text-gh-danger-fg' : i === 6 ? 'text-gh-accent-fg' : 'text-gh-fg-muted'}`}>
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
                  className={`group min-h-[126px] cursor-pointer border-b border-r border-gh-border-muted p-1.5 transition
                              last:border-r-0
                              ${i % 7 === 6 ? 'border-r-0' : ''}
                              ${i >= 35 ? 'border-b-0' : ''}
                              ${outside ? 'bg-gh-canvas-subtle/40' : ''}
                              ${overKey === key ? 'bg-gh-accent-subtle ring-1 ring-inset ring-gh-accent-border' : 'hover:bg-gh-canvas-subtle/70'}`}>
                  <div className="mb-1 flex items-center justify-between px-0.5">
                    <span className={`text-[12.5px] tabular-nums ${
                      isToday ? 'flex h-[19px] w-[19px] items-center justify-center rounded-full bg-gh-accent font-semibold text-white'
                        : outside ? 'text-gh-fg-subtle'
                          : weekend ? (d.getDay() === 0 ? 'text-gh-danger-fg' : 'text-gh-accent-fg')
                            : 'text-gh-fg-muted'}`}>
                      {d.getDate()}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); onCreateAt(key); }}
                      aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일에 작업 추가`}
                      className="rounded p-0.5 text-gh-fg-subtle opacity-0 transition group-hover:opacity-100 hover:bg-gh-border hover:text-gh-fg-muted">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 3).map((t) => {
                      const done = t.status === 'done';
                      const overdue = !done && key < todayKey;
                      return (
                        <button key={t.id} onClick={(e) => { e.stopPropagation(); onOpen(t.id); }}
                          title={`${t.title} · 다른 날로 끌어다 놓으면 마감일이 바뀝니다`}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', t.id);
                            setDragId(t.id);
                          }}
                          onDragEnd={() => { setDragId(null); setOverKey(null); }}
                          className={`flex w-full items-center gap-1 rounded px-1 py-[3px] text-left text-[12px] transition
                                      hover:bg-gh-canvas-mute ${done ? 'opacity-50' : ''} ${dragId === t.id ? 'opacity-40' : ''}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[t.domain]}`} />
                          <span className={`truncate ${
                            done ? 'text-gh-fg-muted line-through' : overdue ? 'font-medium text-gh-danger-fg' : 'text-gh-fg'}`}>
                            {t.title}
                          </span>
                        </button>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="px-1 text-[11.5px] text-gh-fg-muted">+{items.length - 3}건 더</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 범례 + 마감 없는 작업 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
          {(Object.keys(DOT) as DomainKey[]).map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-[12.5px] text-gh-fg-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${DOT[d]}`} />
              {d === 'web' ? '웹 · 앱' : d === 'game' ? '게임 · XR' : d === 'edu' ? '교육 · 강의' : '내부 · 운영'}
            </span>
          ))}
          {undated.length > 0 && (
            <span className="ml-auto text-[12.5px] text-gh-fg-muted">
              마감일 없는 작업 {undated.length}건은 캘린더에 올라오지 않습니다
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { iso as isoDate };
