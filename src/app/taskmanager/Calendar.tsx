'use client';

import { useMemo, useState } from 'react';
import { localISO, type ColorBy, type Task, type TaskColor } from './types';
import { useDomains } from './domainStore';
import { useMembers } from './members';
import { usePainter } from './colorStore';
import {
  Avatar, ColorByPicker, IconArrow, IconPlus, PAINT, StatusPill, Swatch, tmCount, tmGhostBtn, tmIconBtn, useMediaQuery,
} from './ui';

const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const iso = localISO;

/**
 * 월간 캘린더. 마감일을 기준으로 작업을 올린다.
 * 빈 날짜를 누르면 그 날이 마감인 새 작업을 만든다.
 * 항목 바탕은 고른 색 기준(사람 · 라벨 · 영역)의 색이다. 담당자 · 라벨이 없는 작업은 칠하지 않는다.
 * 휴대폰(~640px)에서는 칸이 45px 남짓이라 제목이 두세 글자만 보였다 - 칸에는 색 막대만 두고,
 * 날을 누르면 그날 마감인 작업을 달력 아래에 줄로 보여 준다(그날 새 작업도 거기서).
 */
export default function Calendar({
  tasks, onOpen, onCreateAt, onReschedule, colorBy, onColorBy, onEditColors,
}: {
  tasks: Task[];
  onOpen(id: string): void;
  onCreateAt(dueISO: string): void;
  /** 다른 날로 끌어다 놓으면 마감일을 옮긴다 */
  onReschedule(id: string, dueISO: string): void;
  colorBy: ColorBy;
  onColorBy(v: ColorBy): void;
  /** 색 고르기 창 - 고칠 수 없는 저장소면 없다 */
  onEditColors?(): void;
}) {
  const domains = useDomains();
  const members = useMembers();
  const paint = usePainter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  /** 세 건 넘는 날 중 펼쳐 둔 날 */
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  /** 휴대폰 - 칸에는 색 막대만, 고른 날의 작업은 아래 줄로 */
  const compact = useMediaQuery('(max-width: 640px)');
  /** 휴대폰에서 고른 날 - 없으면 이번 달은 오늘, 다른 달은 1일 */
  const [picked, setPicked] = useState<string | null>(null);

  const todayKey = iso(new Date());
  const shownMonth = iso(cursor).slice(0, 7);
  const sel = picked ?? (todayKey.startsWith(shownMonth) ? todayKey : iso(cursor));

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

  /** 범례 - 영역은 모두, 사람 · 라벨은 캘린더에 올라온 작업이 쓰는 것만 */
  const legend = useMemo((): { key: string; label: string; color: TaskColor }[] => {
    if (colorBy === 'domain') return domains.map((d) => ({ key: d.id, label: d.label, color: paint.domain(d.id) }));
    const dated = tasks.filter((t) => t.due);
    if (colorBy === 'member') {
      return members
        .filter((m) => dated.some((t) => t.assignee === m.id))
        .map((m) => ({ key: m.id, label: m.name, color: paint.member(m.id) }));
    }
    return Array.from(new Set(dated.flatMap((t) => t.labels.slice(0, 1))))
      .sort((a, b) => a.localeCompare(b, 'ko'))
      .map((l) => ({ key: l, label: l, color: paint.label(l) }));
  }, [colorBy, domains, members, tasks, paint]);
  const move = (n: number) => { setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1)); setOpenDay(null); setPicked(null); };
  const toThisMonth = () => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setOpenDay(null); setPicked(null); };
  const selDate = new Date(`${sel}T00:00:00`);
  const selItems = byDate.get(sel) ?? [];

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
        <div className="ml-auto max-[720px]:ml-0">
          <ColorByPicker id="cal-color" value={colorBy} onChange={onColorBy} onEdit={onEditColors} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="flex flex-[1_0_auto] flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm max-[640px]:flex-none">
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
          <div className="grid flex-1 auto-rows-fr grid-cols-7">
            {cells.map((d, i) => {
              const key = iso(d);
              const items = byDate.get(key) ?? [];
              const outside = d.getMonth() !== cursor.getMonth();
              const isToday = key === todayKey;
              const weekend = d.getDay() === 0 || d.getDay() === 6;

              const picked1 = compact && key === sel;

              return (
                <div key={key}
                  onClick={(e) => {
                    if (compact) setPicked(key);
                    else if (e.target === e.currentTarget) onCreateAt(key);
                  }}
                  {...(compact ? {
                    role: 'button', tabIndex: 0, 'aria-pressed': picked1,
                    'aria-label': `${d.getMonth() + 1}월 ${d.getDate()}일${items.length ? ` 작업 ${items.length}건` : ''}`,
                    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(key); } },
                  } : {})}
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
                              max-[640px]:min-h-[60px] max-[640px]:px-1 max-[640px]:pb-1.5 max-[640px]:pt-1
                              ${i % 7 === 6 ? 'border-r-0' : ''}
                              ${i >= 35 ? 'border-b-0' : ''}
                              ${overKey === key || picked1
                                ? 'bg-tm-tint shadow-[inset_0_0_0_2px_#2644cb]'
                                : outside ? 'bg-tm-bg/60 hover:bg-tm-tint/60' : 'hover:bg-tm-tint/60'}`}>
                  <div className="pointer-events-none mb-1 flex items-center justify-between max-[640px]:justify-center">
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
                                 hover:bg-white hover:text-tm-blue focus-visible:opacity-100 group-hover:opacity-100 max-[640px]:hidden">
                      <IconPlus size={15} />
                    </button>
                  </div>

                  {/* 휴대폰: 작업마다 색 막대 하나(세 개까지) + 남은 수 */}
                  {compact && items.length > 0 && (
                    <div className="pointer-events-none space-y-[3px] px-0.5" aria-hidden>
                      {items.slice(0, 3).map((t) => {
                        const c = paint.task(t, colorBy);
                        return (
                          <span key={t.id} className={`block h-[5px] rounded-full ${c ? '' : 'bg-tm-edge'} ${t.status === 'done' ? 'opacity-40' : ''}`}
                            style={c ? { backgroundColor: PAINT[c].solid } : undefined} />
                        );
                      })}
                      {items.length > 3 && (
                        <span className="block text-center text-[12px] font-bold leading-none text-tm-sub">+{items.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className={`space-y-1 ${compact ? 'hidden' : ''}`}>
                    {(openDay === key ? items : items.slice(0, 3)).map((t) => {
                      const done = t.status === 'done';
                      const overdue = !done && key < todayKey;
                      const c = paint.task(t, colorBy);
                      const p = c ? PAINT[c] : null;
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
                          style={p ? { backgroundColor: p.tint, boxShadow: `inset 3px 0 0 ${p.solid}` } : undefined}
                          className={`flex w-full items-center gap-1.5 rounded-md py-1 pr-1.5 text-left text-[13px] leading-[1.35] transition-[filter,box-shadow,background-color]
                                      [@media(pointer:coarse)]:py-[7px]
                                      ${p ? 'pl-2.5 hover:brightness-95' : 'pl-1.5 hover:bg-white hover:shadow-tm'}
                                      ${done ? 'opacity-55' : ''} ${dragId === t.id ? 'opacity-40' : ''}`}>
                          {/* 칠하지 않은 항목(담당자 · 라벨 없음)은 빈 점 */}
                          {!p && <span className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-inset ring-tm-edge" />}
                          <span className={`truncate ${
                            done ? 'font-semibold text-tm-sub line-through' : overdue ? 'font-bold text-tm-red-deep' : 'font-semibold text-tm-ink'}`}>
                            {t.title}
                          </span>
                        </button>
                      );
                    })}
                    {items.length > 3 && (
                      /* 칸을 누르면 새 작업이 열리므로 여기서 멈춘다 */
                      <button type="button" aria-expanded={openDay === key}
                        aria-label={openDay === key
                          ? `${d.getMonth() + 1}월 ${d.getDate()}일 작업 접기`
                          : `${d.getMonth() + 1}월 ${d.getDate()}일 작업 ${items.length - 3}건 더 보기`}
                        onClick={(e) => { e.stopPropagation(); setOpenDay(openDay === key ? null : key); }}
                        className="block rounded-md px-1.5 py-0.5 text-[12.5px] font-semibold text-tm-sub transition-colors
                                   hover:bg-white hover:text-tm-blue">
                        {openDay === key ? '접기' : `+${items.length - 3}건 더`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {compact && (
          <section aria-label={`${selDate.getMonth() + 1}월 ${selDate.getDate()}일 작업`}
            className="mt-3 flex-none rounded-tm border border-tm-line bg-white shadow-tm">
            <div className="flex items-center gap-2 border-b border-tm-line py-2 pl-4 pr-2">
              <h3 className="text-[16px] font-extrabold tabular-nums text-tm-deep">
                {selDate.getMonth() + 1}월 {selDate.getDate()}일 ({WEEKDAY[selDate.getDay()]})
              </h3>
              <span className={tmCount}>{selItems.length}</span>
              <button type="button" onClick={() => onCreateAt(sel)} className={`ml-auto ${tmGhostBtn}`}>
                <IconPlus size={16} />
                작업 추가
              </button>
            </div>
            {selItems.length === 0 ? (
              <p className="px-4 py-5 text-center text-[14px] font-semibold text-tm-sub">이날 마감인 작업이 없습니다</p>
            ) : (
              <ul>
                {selItems.map((t) => {
                  const done = t.status === 'done';
                  const overdue = !done && sel < todayKey;
                  const c = paint.task(t, colorBy);
                  return (
                    <li key={t.id} className="border-b border-tm-line last:border-0">
                      <button type="button" onClick={() => onOpen(t.id)}
                        style={c ? { boxShadow: `inset 4px 0 0 ${PAINT[c].solid}` } : undefined}
                        className="flex w-full items-center gap-3 py-3 pl-4 pr-3 text-left transition-colors duration-150 hover:bg-tm-tint">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                          <span className={`block text-[15px] leading-[1.45] ${
                            done ? 'font-semibold text-tm-sub line-through' : overdue ? 'font-bold text-tm-red-deep' : 'font-semibold text-tm-ink'}`}>
                            {t.title}
                          </span>
                        </span>
                        <StatusPill s={t.status} />
                        <Avatar id={t.assignee} size={28} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* 범례 + 마감 없는 작업 */}
        <div className="mt-3 flex flex-none flex-wrap items-center gap-x-5 gap-y-2 px-1">
          {legend.map((l) => (
            <span key={l.key} className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-tm-sub">
              <Swatch color={l.color} />
              {l.label}
            </span>
          ))}
          {colorBy === 'label' && legend.length > 0 && (
            <span className="text-[13px] text-tm-sub">라벨이 여럿이면 첫 라벨의 색입니다</span>
          )}
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
