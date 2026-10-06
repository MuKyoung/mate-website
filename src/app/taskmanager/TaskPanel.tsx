'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DOMAINS, MEMBERS, PRIORITIES, STATUSES,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import { Avatar, Chip, DOMAIN_STYLE, PriorityDot } from './ui';

/* ── 폼 입력 ──────────────────────────────────────── */

const fieldLabel = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400';
const input =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[13.5px] text-slate-800 ' +
  'placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const select = `${input} appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9`;
const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'%3E%3Cpath d='M4 6.5L8 10.5L12 6.5' stroke='%2394a3b8' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

interface Draft {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  domain: DomainKey;
  assignee: string | null;
  start: string | null;
  due: string | null;
  labels: string[];
}

const emptyDraft = (status: Status = 'todo'): Draft => ({
  title: '',
  description: '',
  status,
  priority: 'normal',
  domain: 'ops',
  assignee: null,
  start: null,
  due: null,
  labels: [],
});

function Fields({ draft, set }: { draft: Draft; set: (p: Partial<Draft>) => void }) {
  const [labelInput, setLabelInput] = useState('');

  const addLabel = () => {
    const v = labelInput.trim();
    if (!v || draft.labels.includes(v)) return setLabelInput('');
    set({ labels: [...draft.labels, v] });
    setLabelInput('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabel} htmlFor="tm-status">상태</label>
          <select id="tm-status" className={select} style={{ backgroundImage: CARET }}
            value={draft.status} onChange={(e) => set({ status: e.target.value as Status })}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="tm-priority">우선순위</label>
          <select id="tm-priority" className={select} style={{ backgroundImage: CARET }}
            value={draft.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
            {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="tm-domain">영역</label>
          <select id="tm-domain" className={select} style={{ backgroundImage: CARET }}
            value={draft.domain} onChange={(e) => set({ domain: e.target.value as DomainKey })}>
            {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className={fieldLabel} htmlFor="tm-assignee">담당</label>
          <select id="tm-assignee" className={select} style={{ backgroundImage: CARET }}
            value={draft.assignee ?? ''} onChange={(e) => set({ assignee: e.target.value || null })}>
            <option value="">미배정</option>
            {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={fieldLabel} htmlFor="tm-start">시작일</label>
          <input id="tm-start" type="date" className={input}
            value={draft.start ?? ''} onChange={(e) => set({ start: e.target.value || null })} />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="tm-due">마감일</label>
          <input id="tm-due" type="date" className={input}
            value={draft.due ?? ''} onChange={(e) => set({ due: e.target.value || null })} />
        </div>
      </div>
      {draft.start && draft.due && draft.start > draft.due && (
        <p className="-mt-2 text-[11.5px] text-rose-600">시작일이 마감일보다 늦습니다.</p>
      )}

      <div>
        <label className={fieldLabel} htmlFor="tm-label">라벨</label>
        <div className="flex gap-2">
          <input id="tm-label" className={input} placeholder="입력 후 Enter"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }} />
          <button type="button" onClick={addLabel}
            className="shrink-0 rounded-md border border-slate-300 px-3 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50">
            추가
          </button>
        </div>
        {draft.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.labels.map((l) => (
              <button key={l} type="button"
                onClick={() => set({ labels: draft.labels.filter((x) => x !== l) })}
                className="group inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11.5px] text-slate-600 transition hover:bg-rose-50 hover:text-rose-600">
                {l}
                <span className="text-slate-400 group-hover:text-rose-500">×</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 새 작업 ──────────────────────────────────────── */

export function NewTaskDialog({
  defaultStatus, defaultDue, onCreate, onClose,
}: {
  defaultStatus: Status;
  /** 캘린더에서 날짜를 눌러 들어온 경우 미리 채운다 */
  defaultDue?: string | null;
  onCreate(d: Draft): void;
  onClose(): void;
}) {
  const [draft, setDraft] = useState<Draft>(() => ({ ...emptyDraft(defaultStatus), due: defaultDue ?? null }));
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onCreate({ ...draft, title: draft.title.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-[8vh] backdrop-blur-[2px]"
      onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="새 작업"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">새 작업</h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className={fieldLabel} htmlFor="tm-title">제목</label>
            <input id="tm-title" ref={titleRef} className={input} required
              placeholder="무엇을 해야 하나요?"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="tm-desc">설명</label>
            <textarea id="tm-desc" rows={3} className={`${input} resize-y leading-[1.6]`}
              placeholder="배경, 완료 조건, 참고 링크"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <Fields draft={draft} set={(p) => setDraft({ ...draft, ...p })} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <button type="button" onClick={onClose}
            className="rounded-md px-3.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-200/60">
            취소
          </button>
          <button type="submit" disabled={!draft.title.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition
                       hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            만들기
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── 상세 패널 ────────────────────────────────────── */

export function TaskPanel({
  task, onUpdate, onRemove, onClose,
}: {
  task: Task;
  onUpdate(patch: Partial<Task>): void;
  onRemove(): void;
  onClose(): void;
}) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => { setConfirming(false); }, [task.id]);

  const draft: Draft = {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    domain: task.domain,
    assignee: task.assignee,
    start: task.start,
    due: task.due,
    labels: task.labels,
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 lg:bg-transparent" onClick={onClose} aria-hidden />
      <aside role="dialog" aria-modal="true" aria-label={`${task.key} 상세`}
        className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-2xl lg:shadow-xl">

        <header className="flex items-center gap-2 border-b border-slate-200 px-5 py-3.5">
          <PriorityDot p={task.priority} />
          <span className="font-mono text-[12px] font-medium text-slate-400 tabular-nums">{task.key}</span>
          <Chip className={`ml-1 ${DOMAIN_STYLE[task.domain]}`}>{DOMAINS.find((d) => d.id === task.domain)?.label}</Chip>
          <button onClick={onClose} aria-label="닫기"
            className="ml-auto rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <label className="sr-only" htmlFor="tm-edit-title">제목</label>
          <input id="tm-edit-title"
            className="mb-4 w-full rounded-md border border-transparent px-2 py-1.5 -mx-2 text-[17px] font-semibold leading-snug text-slate-900
                       outline-none transition hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })} />

          <label className={fieldLabel} htmlFor="tm-edit-desc">설명</label>
          <textarea id="tm-edit-desc" rows={5}
            className={`${input} mb-6 resize-y leading-[1.7]`}
            placeholder="배경, 완료 조건, 참고 링크"
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })} />

          <Fields draft={draft} set={(p) => onUpdate(p as Partial<Task>)} />

          <dl className="mt-6 space-y-1.5 border-t border-slate-200 pt-4 text-[11.5px] text-slate-400">
            <div className="flex justify-between gap-4">
              <dt>담당</dt>
              <dd className="flex items-center gap-1.5 text-slate-600">
                <Avatar id={task.assignee} size={18} />
                {MEMBERS.find((m) => m.id === task.assignee)?.name ?? '미배정'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>만든 날</dt>
              <dd className="tabular-nums">{task.createdAt.slice(0, 10)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>마지막 수정</dt>
              <dd className="tabular-nums">{task.updatedAt.slice(0, 10)}</dd>
            </div>
          </dl>
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="mr-auto text-[12.5px] text-slate-600">이 작업을 지울까요?</span>
              <button onClick={() => setConfirming(false)}
                className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-200/60">
                취소
              </button>
              <button onClick={onRemove}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-rose-700">
                삭제
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
              className="text-[12.5px] font-medium text-slate-500 transition hover:text-rose-600">
              작업 삭제
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}

export type { Draft };
