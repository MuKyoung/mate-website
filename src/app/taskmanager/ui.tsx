'use client';

import { memberById, domainShort, type DomainKey, type Priority, type Task } from './types';

/* ── 색 매핑 — 도구 전용. 마케팅 사이트 토큰과 공유하지 않는다 ── */

export const PRIORITY_STYLE: Record<Priority, { dot: string; text: string; chip: string }> = {
  urgent: { dot: 'bg-rose-500', text: 'text-rose-600', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  high: { dot: 'bg-amber-500', text: 'text-amber-600', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  normal: { dot: 'bg-slate-400', text: 'text-slate-500', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
  low: { dot: 'bg-slate-300', text: 'text-slate-400', chip: 'bg-slate-50 text-slate-500 ring-slate-200' },
};

export const DOMAIN_STYLE: Record<DomainKey, string> = {
  web: 'bg-blue-50 text-blue-700 ring-blue-200',
  game: 'bg-violet-50 text-violet-700 ring-violet-200',
  edu: 'bg-amber-50 text-amber-700 ring-amber-200',
  ops: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const AVATAR_TONE = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
];

/* ── 조각 ─────────────────────────────────────────── */

export function Avatar({ id, size = 24 }: { id: string | null; size?: number }) {
  const m = memberById(id);
  if (!m) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="미배정"
      >
        —
      </span>
    );
  }
  const tone = AVATAR_TONE[Number(m.id.replace(/\D/g, '')) % AVATAR_TONE.length];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={`${m.name} · ${m.role}`}
    >
      {m.initial}
    </span>
  );
}

export function Chip({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold
                  ring-1 ring-inset whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

export function PriorityDot({ p }: { p: Priority }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${PRIORITY_STYLE[p].dot}`} />;
}

/** 마감일 — 지났으면 빨강, 사흘 안이면 주황 */
export function DueBadge({ due, done }: { due: string | null; done: boolean }) {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${due}T00:00:00`);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);

  const text =
    days === 0 ? '오늘' : days === 1 ? '내일' : days < 0 ? `${-days}일 지남` : `${days}일 남음`;
  const tone = done
    ? 'text-slate-400'
    : days < 0
      ? 'text-rose-600 font-semibold'
      : days <= 3
        ? 'text-amber-600 font-semibold'
        : 'text-slate-500';

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] tabular-nums ${tone}`}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="3.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 7h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {text}
    </span>
  );
}

/* ── 보드 카드 ────────────────────────────────────── */

interface CardProps {
  task: Task;
  onOpen(): void;
  onDragStart(e: React.DragEvent): void;
  onDragEnd(): void;
  dragging: boolean;
}

export function TaskCard({ task, onOpen, onDragStart, onDragEnd, dragging }: CardProps) {
  const done = task.status === 'done';
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${task.key} ${task.title}`}
      className={`group cursor-pointer rounded-lg border border-slate-200 bg-white p-3
                  shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition
                  hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                  ${dragging ? 'opacity-40' : 'active:cursor-grabbing'}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <PriorityDot p={task.priority} />
        <span className="font-mono text-[11px] font-medium text-slate-400 tabular-nums">{task.key}</span>
        <Chip className={`ml-auto ${DOMAIN_STYLE[task.domain]}`}>{domainShort(task.domain)}</Chip>
      </div>

      <p
        className={`mb-2.5 text-[13.5px] font-medium leading-[1.45] ${
          done ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}
      >
        {task.title}
      </p>

      {task.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span key={l} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] text-slate-500">
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <DueBadge due={task.due} done={done} />
        <Avatar id={task.assignee} size={22} />
      </div>
    </article>
  );
}
