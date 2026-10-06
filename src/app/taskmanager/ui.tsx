'use client';

import { useEffect, useRef, useState } from 'react';
import { STATUSES, memberById, domainShort, type DomainKey, type Priority, type Status, type Task } from './types';

/**
 * 대화상자·패널 안에 초점을 가둔다.
 *
 * 가두지 않으면 Tab 이 뒤쪽 화면으로 빠져나가 키보드만 쓰는 사람이
 * 열려 있는 대화상자를 잃어버린다. 닫을 때는 열기 전 요소로 되돌린다.
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const prev = document.activeElement as HTMLElement | null;
    const SELECTOR =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => el.offsetParent !== null);

    // 이미 안쪽에 초점이 있으면 건드리지 않는다 (자동 포커스한 입력란을 빼앗지 않기 위해)
    if (!root.contains(document.activeElement)) focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [active]);

  return ref;
}

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

/**
 * 카드에서 바로 상태를 바꾸는 메뉴.
 *
 * HTML5 드래그는 터치 기기에서 아예 동작하지 않는다. 메뉴가 없으면
 * 휴대폰으로는 보드가 읽기 전용이 되므로, 드래그와 같은 일을 하는
 * 손가락용 경로를 따로 둔다.
 */
function StatusMenu({ task, onMove }: { task: Task; onMove(s: Status): void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="상태 바꾸기"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-6 w-6 items-center justify-center rounded text-slate-400 transition
                    hover:bg-slate-100 hover:text-slate-700
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${open ? 'bg-slate-100 text-slate-700' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-[1023px]:opacity-100'}`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="3.5" r="1.3" fill="currentColor" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
          <circle cx="8" cy="12.5" r="1.3" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div role="menu"
          className="absolute right-0 top-7 z-30 w-[132px] overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {STATUSES.map((st) => (
            <button key={st.id} role="menuitem"
              onClick={() => { onMove(st.id); setOpen(false); }}
              disabled={st.id === task.status}
              className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px] transition
                          ${st.id === task.status
                            ? 'cursor-default font-semibold text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${st.id === task.status ? 'bg-blue-600' : 'bg-slate-300'}`} />
              {st.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CardProps {
  task: Task;
  onOpen(): void;
  onDragStart(e: React.DragEvent): void;
  onDragEnd(): void;
  dragging: boolean;
  /** 카드 메뉴와 ←/→ 키로 상태를 옮긴다 */
  onMove(s: Status): void;
  /** 내 작업이면 왼쪽에 표시선을 둔다 */
  mine?: boolean;
}

export function TaskCard({ task, onOpen, onDragStart, onDragEnd, dragging, onMove, mine }: CardProps) {
  const done = task.status === 'done';
  const idx = STATUSES.findIndex((s) => s.id === task.status);
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
        // 드래그 없이도 칼럼을 옮길 수 있어야 한다
        if (e.key === 'ArrowRight' && idx < STATUSES.length - 1) {
          e.preventDefault();
          onMove(STATUSES[idx + 1].id);
        }
        if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          onMove(STATUSES[idx - 1].id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${task.key} ${task.title}`}
      className={`group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-3
                  ${mine ? 'border-l-[3px] border-l-blue-500' : ''}
                  shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition
                  hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
                  ${dragging ? 'opacity-40' : 'active:cursor-grabbing'}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <PriorityDot p={task.priority} />
        <span className="font-mono text-[11px] font-medium text-slate-400 tabular-nums">{task.key}</span>
        <Chip className={`ml-auto ${DOMAIN_STYLE[task.domain]}`}>{domainShort(task.domain)}</Chip>
        <StatusMenu task={task} onMove={onMove} />
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
