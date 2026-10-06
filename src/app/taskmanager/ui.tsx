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
  urgent: { dot: 'bg-gh-danger', text: 'text-gh-danger-fg', chip: 'border-gh-danger-border text-gh-danger-fg' },
  high: { dot: 'bg-gh-attention', text: 'text-gh-attention-fg', chip: 'border-gh-attention-border text-gh-attention-fg' },
  normal: { dot: 'bg-gh-neutral', text: 'text-gh-fg-muted', chip: 'border-gh-border text-gh-fg-muted' },
  low: { dot: 'bg-gh-border-strong', text: 'text-gh-fg-muted', chip: 'border-gh-border text-gh-fg-subtle' },
};

export const DOMAIN_STYLE: Record<DomainKey, string> = {
  web: 'border-gh-accent-border text-gh-accent-fg',
  game: 'border-gh-done-border text-gh-done-fg',
  edu: 'border-gh-attention-border text-gh-attention-fg',
  ops: 'border-gh-border text-gh-fg-muted',
};

/** 상태 — GitHub 의 Open/Merged 배지처럼 꽉 채우고 흰 글자를 올린다 */
export const STATUS_STYLE: Record<Status, { fill: string; dot: string }> = {
  // fill 은 흰 글자를 올리므로 4.5:1 을 넘는 색만 쓴다 (#6e7781 은 4.0:1 로 모자람).
  // dot 은 글자가 아니라 라벨 옆 표식이라 원래 색조를 그대로 둔다.
  backlog: { fill: 'bg-gh-fg-muted', dot: 'bg-gh-neutral' },
  todo: { fill: 'bg-gh-accent', dot: 'bg-gh-accent' },
  doing: { fill: 'bg-gh-attention-fg', dot: 'bg-gh-attention' },
  review: { fill: 'bg-gh-done', dot: 'bg-gh-done' },
  done: { fill: 'bg-gh-success-hover', dot: 'bg-gh-success' },
};

const AVATAR_TONE = [
  'bg-gh-accent-subtle text-gh-accent-fg',
  'bg-gh-done-subtle text-gh-done-fg',
  'bg-gh-success-subtle text-gh-success-fg',
  'bg-gh-attention-subtle text-gh-attention-fg',
  'bg-gh-danger-subtle text-gh-danger-fg',
  'bg-[#dbf4ff] text-[#0550ae]',
  'bg-[#e6e1ff] text-[#4c3ba6]',
];

/* ── 버튼·폼 레시피 ───────────────────────────────────
   GitHub 버튼은 높이 32px, 반경 6px, 1px 테두리에 아주 연한 바탕이다.
   눌리는 느낌은 그림자가 아니라 바탕색 한 단계로만 준다. */

export const ghBtn =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-gh-border ' +
  'bg-gh-canvas-subtle px-3 text-[14px] font-medium text-gh-fg ' +
  'transition-colors duration-150 hover:bg-gh-canvas-mute active:bg-gh-border ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/** 주 동작 — GitHub 의 New 버튼처럼 초록 */
export const ghBtnPrimary =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#1f883d26] ' +
  'bg-gh-success px-3 text-[14px] font-medium text-white ' +
  'transition-colors duration-150 hover:bg-gh-success-hover active:shadow-gh-inset';

export const ghBtnDanger =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-gh-border ' +
  'bg-gh-canvas-subtle px-3 text-[14px] font-medium text-gh-danger-fg ' +
  'transition-colors duration-150 hover:border-gh-danger hover:bg-gh-danger hover:text-white';

/** 아이콘만 있는 투명 버튼 */
export const ghBtnGhost =
  'inline-flex h-7 w-7 items-center justify-center rounded-md text-gh-fg-muted ' +
  'transition-colors duration-150 hover:bg-gh-canvas-mute hover:text-gh-fg';

export const ghField =
  'h-8 rounded-md border border-gh-border bg-gh-canvas px-2 text-[14px] text-gh-fg outline-none ' +
  'transition-shadow duration-150 focus:border-gh-accent focus:shadow-[0_0_0_3px_rgba(9,105,218,0.1)]';

/** 숫자 배지 — GitHub 의 Counter */
export const ghCounter =
  'inline-flex min-w-[20px] items-center justify-center rounded-full bg-gh-neutral-muted ' +
  'px-[6px] text-[12px] font-medium tabular-nums text-gh-fg-muted';

/* ── 조각 ─────────────────────────────────────────── */

export function Avatar({ id, size = 24 }: { id: string | null; size?: number }) {
  const m = memberById(id);
  if (!m) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full border border-dashed border-gh-border-strong text-gh-fg-muted"
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
      className={`inline-flex items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-gh-fg/[0.08] ${tone}`}
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
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border
                  px-2 py-0 text-[12px] font-medium leading-[18px] ${className}`}
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
    ? 'text-gh-fg-muted'
    : days < 0
      ? 'text-gh-danger-fg font-semibold'
      : days <= 3
        ? 'text-gh-attention-fg font-semibold'
        : 'text-gh-fg-muted';

  return (
    <span className={`inline-flex items-center gap-1 text-[12px] tabular-nums ${tone}`}>
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
        className={`flex h-6 w-6 items-center justify-center rounded text-gh-fg-muted transition
                    hover:bg-gh-canvas-mute hover:text-gh-fg
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent
                    ${open ? 'bg-gh-canvas-mute text-gh-fg' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 max-[1023px]:opacity-100'}`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="3.5" r="1.3" fill="currentColor" />
          <circle cx="8" cy="8" r="1.3" fill="currentColor" />
          <circle cx="8" cy="12.5" r="1.3" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div role="menu"
          className="absolute right-0 top-7 z-30 w-[136px] overflow-hidden rounded-xl border border-gh-border bg-gh-canvas py-1 shadow-gh-lg">
          {STATUSES.map((st) => (
            <button key={st.id} role="menuitem"
              onClick={() => { onMove(st.id); setOpen(false); }}
              disabled={st.id === task.status}
              className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13.5px] transition
                          ${st.id === task.status
                            ? 'cursor-default font-semibold text-gh-fg'
                            : 'text-gh-fg-muted hover:bg-gh-canvas-subtle hover:text-gh-fg'}`}>
              <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[st.id].dot}`} />
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
      className={`group relative cursor-pointer rounded-md border border-gh-border bg-gh-canvas p-3.5
                  ${mine ? 'border-l-[3px] border-l-gh-accent' : ''}
                  transition-colors duration-150
                  hover:border-gh-border-strong hover:bg-gh-canvas-subtle
                  ${dragging ? 'opacity-40' : 'active:cursor-grabbing'}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <PriorityDot p={task.priority} />
        <span className="gh-mono text-[12px] font-medium tabular-nums text-gh-fg-muted">{task.key}</span>
        <Chip className={`ml-auto ${DOMAIN_STYLE[task.domain]}`}>{domainShort(task.domain)}</Chip>
        <StatusMenu task={task} onMove={onMove} />
      </div>

      <p
        className={`mb-2.5 text-[14.5px] font-medium leading-[1.45] ${
          done ? 'text-gh-fg-muted line-through' : 'text-gh-fg'
        }`}
      >
        {task.title}
      </p>

      {task.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span key={l} className="rounded-full border border-gh-border bg-gh-canvas-subtle px-2 py-0 text-[11.5px] leading-[18px] text-gh-fg-muted">
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
