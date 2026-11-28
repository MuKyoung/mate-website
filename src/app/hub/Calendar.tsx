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
/** 한 주 줄에 처음 보이는 막대 줄 수 - 넘치면 날마다 '+n건 더' */
const LANES = 3;

const iso = localISO;
/** 'YYYY-MM-DD' 에 날수를 더한다 - UTC 자정으로 읽고 같은 방식으로 돌려준다(지역 시각을 섞지 않는다) */
const addDays = (key: string, n: number) => new Date(Date.parse(key) + n * DAY).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);
const RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
/** 마감 시각 순 - 시각 있는 것 먼저(이른 시각부터), 없는 것은 뒤로 */
const byTime = (a: Task, b: Task) => (a.dueTime ?? '99:99').localeCompare(b.dueTime ?? '99:99');

/** 캘린더에 오르는 기간 - 시작일이 있고 마감일보다 늦지 않으면 시작일부터, 아니면 마감일 하루 */
const spanOf = (t: Task): [string, string] | null => {
  if (!t.due) return null;
  return [t.start && t.start <= t.due ? t.start : t.due, t.due];
};

/** 한 주 줄의 막대 조각 */
interface Seg {
  t: Task;
  /** 이 주에서 시작 칸(0~6) · 칸 수 */
  col: number;
  span: number;
  lane: number;
  /** 기간이 이 주 앞 · 뒤로 이어지는가 - 막대 끝을 둥글리지 않는다 */
  fromBefore: boolean;
  toAfter: boolean;
}

/**
 * 월간 캘린더. 시작일부터 마감일까지 막대로 이어 올린다(시작일이 없으면 마감일 하루). 주가 바뀌면 다음 줄에서 이어진다.
 * 빈 날짜를 누르면 그 날이 마감인 새 작업을 만든다. 막대를 끌어 다른 날에 놓으면 기간째 같은 날수만큼 옮긴다.
 * 항목 바탕은 고른 색 기준(사람 · 라벨 · 영역)의 색이다. 담당자 · 라벨이 없는 작업은 칠하지 않는다.
 * 휴대폰(~640px)에서는 칸이 45px 남짓이라 제목이 두세 글자만 보였다 - 칸에는 가는 색 막대만 두고,
 * 날을 누르면 그날 걸친 작업을 달력 아래에 줄로 보여 준다(그날 새 작업도 거기서).
 */
export default function Calendar({
  tasks, onOpen, onCreateAt, onReschedule, colorBy, onColorBy, onEditColors,
}: {
  tasks: Task[];
  onOpen(id: string): void;
  onCreateAt(dueISO: string): void;
  /** 다른 날로 끌어다 놓으면 마감일을 옮긴다(시작일도 같은 날수만큼 - 부르는 쪽이 맞춘다) */
  onReschedule(id: string, dueISO: string): void;
  colorBy: ColorBy;
  onColorBy(v: ColorBy): void;
  /** 색 고르기 창 - 고칠 수 없는 저장소면 없다 */
  onEditColors?(): void;
}) {
  const domains = useDomains();
  const members = useMembers();
  const paint = usePainter();
  /** 끌고 있는 작업과, 잡은 날에서 마감일까지의 날수 - 놓은 날 + 이 날수가 새 마감일 */
  const [drag, setDrag] = useState<{ id: string; toDue: number } | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  /** 막대 줄이 넘쳐 펼쳐 둔 주(0~5) */
  const [openWeek, setOpenWeek] = useState<number | null>(null);
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

  /** 6주(42칸) - 그 달 1일이 든 주 일요일부터. 달마다 높이가 변하지 않는다 */
  const weeks = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, i) =>
      new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + i)));
  }, [cursor]);

  const dated = useMemo(() => tasks.filter((t) => t.due), [tasks]);

  /** 주마다 막대 조각과 줄 수 - 앞에서 시작하는 것, 긴 것, 급한 것 순으로 빈 줄 맨 위에 넣는다 */
  const layout = useMemo(() => weeks.map((days) => {
    const keys = days.map(iso);
    const k0 = keys[0], k6 = keys[6];
    const segs: Seg[] = [];
    dated.forEach((t) => {
      const sp = spanOf(t);
      if (!sp || sp[1] < k0 || sp[0] > k6) return;
      const col = sp[0] < k0 ? 0 : keys.indexOf(sp[0]);
      const end = sp[1] > k6 ? 6 : keys.indexOf(sp[1]);
      if (col < 0 || end < col) return;
      segs.push({ t, col, span: end - col + 1, lane: 0, fromBefore: sp[0] < k0, toAfter: sp[1] > k6 });
    });
    // 같은 날 하루짜리는 마감 시각 순(시각 없는 것은 뒤로)
    segs.sort((a, b) => a.col - b.col || b.span - a.span || byTime(a.t, b.t) || RANK[a.t.priority] - RANK[b.t.priority]
      || a.t.title.localeCompare(b.t.title, 'ko'));
    const laneEnd: number[] = [];
    segs.forEach((s) => {
      let lane = laneEnd.findIndex((e) => e < s.col);
      if (lane < 0) { lane = laneEnd.length; laneEnd.push(-1); }
      laneEnd[lane] = s.col + s.span - 1;
      s.lane = lane;
    });
    return { keys, segs, lanes: laneEnd.length };
  }), [weeks, dated]);

  /** 날마다 걸친 작업 - 휴대폰의 그날 목록 */
  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    layout.forEach(({ keys, segs }) => segs.forEach((s) => {
      for (let i = s.col; i < s.col + s.span; i++) map.set(keys[i], [...(map.get(keys[i]) ?? []), s.t]);
    }));
    map.forEach((list) => list.sort((a, b) => byTime(a, b) || RANK[a.priority] - RANK[b.priority]));
    return map;
  }, [layout]);

  const undated = tasks.filter((t) => !t.due);

  /** 범례 - 영역은 모두, 사람 · 라벨은 캘린더에 올라온 작업이 쓰는 것만 */
  const legend = useMemo((): { key: string; label: string; color: TaskColor }[] => {
    if (colorBy === 'domain') return domains.map((d) => ({ key: d.id, label: d.label, color: paint.domain(d.id) }));
    if (colorBy === 'member') {
      return members
        .filter((m) => dated.some((t) => t.assignee === m.id))
        .map((m) => ({ key: m.id, label: m.name, color: paint.member(m.id) }));
    }
    return Array.from(new Set(dated.flatMap((t) => t.labels.slice(0, 1))))
      .sort((a, b) => a.localeCompare(b, 'ko'))
      .map((l) => ({ key: l, label: l, color: paint.label(l) }));
  }, [colorBy, domains, members, dated, paint]);
  const move = (n: number) => { setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1)); setOpenWeek(null); setPicked(null); };
  const toThisMonth = () => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setOpenWeek(null); setPicked(null); };
  const selDate = new Date(`${sel}T00:00:00`);
  const selItems = byDay.get(sel) ?? [];

  const dropAt = (key: string, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || drag?.id;
    const t = id ? tasks.find((x) => x.id === id) : undefined;
    if (t) onReschedule(t.id, addDays(key, drag?.id === t.id ? drag.toDue : 0));
    setDrag(null);
    setOverKey(null);
  };

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
        <div className="flex flex-[1_0_auto] flex-col overflow-hidden rounded-tm border border-tm-line bg-tm-card shadow-tm max-[640px]:flex-none">
          {/* 요일 머리 */}
          <div className="grid grid-cols-7 border-b border-tm-line bg-tm-bg">
            {WEEKDAY.map((w, i) => (
              <div key={w} className={`py-2.5 text-center text-[13px] font-bold ${
                i === 0 ? 'text-tm-red-deep' : i === 6 ? 'text-tm-blue' : 'text-tm-sub'}`}>
                {w}
              </div>
            ))}
          </div>

          {/* 주 줄 - 날짜 칸을 바탕에 깔고, 그 위 같은 격자에 막대를 줄(lane)마다 놓는다 */}
          <div className="flex flex-1 flex-col">
            {layout.map(({ keys, segs, lanes }, w) => {
              const expanded = openWeek === w;
              const cap = compact ? LANES : expanded ? lanes : LANES;
              const shown = Math.min(lanes, cap);
              /** 날마다 숨은 막대 수 */
              const hidden = keys.map((_, i) => segs.filter((s) => s.lane >= cap && s.col <= i && i < s.col + s.span).length);
              const more = !compact && (expanded ? lanes > LANES : hidden.some((n) => n > 0));
              const rows = `${compact ? 28 : 34}px ${shown ? `repeat(${shown}, auto) ` : ''}${more || (compact && hidden.some((n) => n > 0)) ? 'auto ' : ''}1fr`;
              /* 주 줄 높이: 기본은 120px(좁은 화면 60px)에서 남는 높이를 똑같이 나눠 갖고, 막대가 그보다 많으면(+n건 더를 펼친 주)
                 그 내용만큼 길어진다 - min-height 를 auto 로 두어야 내용보다 줄어들지 않는다(예전 min-h-[120px] + flex-1 은
                 펼친 막대가 다음 주 칸 위로 넘쳐 겹쳤다). 늘어난 만큼 달력이 길어지고 바깥이 스크롤된다 */
              return (
                <div key={keys[0]} className={`relative grid grid-cols-7 ${compact ? 'flex-[1_0_60px]' : 'flex-[1_0_120px]'} ${
                  w < 5 ? 'border-b border-tm-line' : ''}`} style={{ gridTemplateRows: rows }}>
                  {/* 날짜 칸 */}
                  {weeks[w].map((d, i) => {
                    const key = keys[i];
                    const count = byDay.get(key)?.length ?? 0;
                    const outside = d.getMonth() !== cursor.getMonth();
                    const isToday = key === todayKey;
                    const weekend = d.getDay() === 0 || d.getDay() === 6;
                    const picked1 = compact && key === sel;
                    return (
                      <div key={key} style={{ gridColumn: i + 1, gridRow: '1 / -1' }}
                        onClick={(e) => {
                          if (compact) setPicked(key);
                          else if (e.target === e.currentTarget) onCreateAt(key);
                        }}
                        {...(compact ? {
                          role: 'button', tabIndex: 0, 'aria-pressed': picked1,
                          'aria-label': `${d.getMonth() + 1}월 ${d.getDate()}일${count ? ` 작업 ${count}건` : ''}`,
                          onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(key); } },
                        } : {})}
                        onDragOver={(e) => {
                          // 드롭을 허용하려면 매 dragover 마다 필요하다
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (overKey !== key) setOverKey(key);
                        }}
                        onDragLeave={() => setOverKey((k) => (k === key ? null : k))}
                        onDrop={(e) => dropAt(key, e)}
                        className={`group cursor-pointer p-2 transition-colors duration-150 max-[640px]:px-1 max-[640px]:pt-1
                                    ${i < 6 ? 'border-r border-tm-line' : ''}
                                    ${overKey === key || picked1
                                      ? 'bg-tm-tint shadow-[inset_0_0_0_2px_rgb(var(--tm-blue))]'
                                      : outside ? 'bg-tm-bg/60 hover:bg-tm-tint/60' : 'hover:bg-tm-tint/60'}`}>
                        <div className="pointer-events-none flex items-center justify-between max-[640px]:justify-center">
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
                                       hover:bg-tm-card hover:text-tm-blue focus-visible:opacity-100 group-hover:opacity-100 max-[640px]:hidden">
                            <IconPlus size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* 막대 */}
                  {segs.filter((s) => s.lane < cap).map((s) => {
                    const { t } = s;
                    const done = t.status === 'done';
                    const overdue = !done && t.due !== null && t.due < todayKey;
                    const c = paint.task(t, colorBy);
                    const p = c ? PAINT[c] : null;
                    const round = `${s.fromBefore ? 'rounded-l-none' : ''} ${s.toAfter ? 'rounded-r-none' : ''}`;
                    const gap = `${s.fromBefore ? 'ml-0' : 'ml-1.5'} ${s.toAfter ? 'mr-0' : 'mr-1.5'}`;
                    const place = { gridColumn: `${s.col + 1} / span ${s.span}`, gridRow: s.lane + 2 };
                    if (compact) {
                      return (
                        <span key={t.id} aria-hidden style={{ ...place, ...(p ? { backgroundColor: p.solid } : {}) }}
                          className={`pointer-events-none z-[1] my-[1.5px] block h-[5px] rounded-full ${p ? '' : 'bg-tm-edge'} ${round} ${
                            s.fromBefore ? '' : 'ml-1'} ${s.toAfter ? '' : 'mr-1'} ${done ? 'opacity-40' : ''}`} />
                      );
                    }
                    const range = t.start && t.start < (t.due ?? '') ? ` · ${t.start.slice(5)}~${t.due?.slice(5)}` : '';
                    /** 마감 시각 - 하루짜리 막대는 제목 앞에, 여러 날 막대는 툴팁에만 */
                    const at = t.due && t.dueTime ? t.dueTime : null;
                    return (
                      <button key={t.id} type="button" onClick={() => onOpen(t.id)}
                        title={`${at && !range ? `${at} ` : ''}${t.title}${range}${at && range ? ` ${at}` : ''} · 다른 날로 끌어다 놓으면 기간째 옮깁니다`}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', t.id);
                          // 막대의 어느 날을 잡았는가 - 그 날을 놓은 날로 옮긴다
                          const r = e.currentTarget.getBoundingClientRect();
                          const at = Math.min(s.span - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * s.span)));
                          setDrag({ id: t.id, toDue: t.due ? daysBetween(keys[s.col + at], t.due) : 0 });
                        }}
                        onDragEnd={() => { setDrag(null); setOverKey(null); }}
                        style={{ ...place, ...(p ? { backgroundColor: p.bg, boxShadow: s.fromBefore ? undefined : `inset 3px 0 0 ${p.solid}` } : {}) }}
                        className={`z-[1] my-[2px] flex min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-left text-[13px] leading-[1.35]
                                    transition-[filter,box-shadow,background-color] [@media(pointer:coarse)]:py-[7px]
                                    ${gap} ${round}
                                    ${p ? 'pl-2.5 hover:brightness-95' : 'bg-tm-bg pl-1.5 ring-1 ring-inset ring-tm-line hover:bg-tm-card hover:shadow-tm'}
                                    ${done ? 'opacity-55' : ''} ${drag ? 'pointer-events-none' : ''} ${drag?.id === t.id ? 'opacity-40' : ''}`}>
                        {/* 칠하지 않은 항목(담당자 · 라벨 없음)은 빈 점 */}
                        {!p && !s.fromBefore && <span className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-inset ring-tm-edge" />}
                        <span className={`truncate ${
                          done ? 'font-semibold text-tm-sub line-through' : overdue ? 'font-bold text-tm-red-deep' : 'font-semibold text-tm-ink'}`}>
                          {s.fromBefore && <span aria-hidden className="mr-0.5 text-tm-sub">‹</span>}
                          {at && !range && <span className="mr-1 font-bold tabular-nums">{at}</span>}
                          {t.title}
                        </span>
                      </button>
                    );
                  })}

                  {/* 넘친 막대 - 날마다 '+n건 더', 펼친 주는 '접기' 하나 */}
                  {compact && hidden.map((n, i) => n > 0 && (
                    <span key={`m${i}`} aria-hidden style={{ gridColumn: i + 1, gridRow: shown + 2 }}
                      className="pointer-events-none z-[1] block pb-1 text-center text-[12px] font-bold leading-none text-tm-sub">+{n}</span>
                  ))}
                  {more && (expanded ? (
                    <button type="button" style={{ gridColumn: '1 / span 7', gridRow: shown + 2 }} aria-expanded
                      onClick={() => setOpenWeek(null)}
                      className={`z-[1] mx-1.5 mb-1 justify-self-start rounded-md px-1.5 py-0.5 text-[12.5px] font-semibold text-tm-sub transition-colors
                                  hover:bg-tm-card hover:text-tm-blue ${drag ? 'pointer-events-none' : ''}`}>
                      접기
                    </button>
                  ) : hidden.map((n, i) => n > 0 && (
                    <button key={`m${i}`} type="button" style={{ gridColumn: i + 1, gridRow: shown + 2 }} aria-expanded={false}
                      aria-label={`${weeks[w][i].getMonth() + 1}월 ${weeks[w][i].getDate()}일 작업 ${n}건 더 보기`}
                      onClick={() => setOpenWeek(w)}
                      className={`z-[1] mx-1.5 mb-1 justify-self-start rounded-md px-1.5 py-0.5 text-[12.5px] font-semibold text-tm-sub transition-colors
                                  hover:bg-tm-card hover:text-tm-blue ${drag ? 'pointer-events-none' : ''}`}>
                      +{n}건 더
                    </button>
                  )))}
                </div>
              );
            })}
          </div>
        </div>

        {compact && (
          <section aria-label={`${selDate.getMonth() + 1}월 ${selDate.getDate()}일 작업`}
            className="mt-3 flex-none rounded-tm border border-tm-line bg-tm-card shadow-tm">
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
              <p className="px-4 py-5 text-center text-[14px] font-semibold text-tm-sub">이날 걸친 작업이 없습니다</p>
            ) : (
              <ul>
                {selItems.map((t) => {
                  const done = t.status === 'done';
                  const overdue = !done && t.due !== null && t.due < todayKey;
                  const c = paint.task(t, colorBy);
                  const multi = t.start && t.due && t.start < t.due;
                  return (
                    <li key={t.id} className="border-b border-tm-line last:border-0">
                      <button type="button" onClick={() => onOpen(t.id)}
                        style={c ? { boxShadow: `inset 4px 0 0 ${PAINT[c].solid}` } : undefined}
                        className="flex w-full items-center gap-3 py-3 pl-4 pr-3 text-left transition-colors duration-150 hover:bg-tm-tint">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-bold tabular-nums text-tm-sub">
                            {t.key}{multi ? ` · ${t.start?.slice(5)}~${t.due?.slice(5)}` : ''}{t.due && t.dueTime ? ` · ${t.dueTime}` : ''}
                          </span>
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
