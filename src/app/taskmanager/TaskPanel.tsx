'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  DOMAINS, MEMBERS, PRIORITIES, STATUSES,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import {
  Avatar, Chip, DOMAIN_STYLE, IconClose, Modal, PriorityDot,
  tmBtn, tmBtnPrimary, tmFieldBase, tmGhostDanger, tmIconBtn, tmInput, tmLabel, tmSelect, tmTextarea,
  useConfirm, useFocusTrap,
} from './ui';

/* ── 폼 입력 ──────────────────────────────────────── */

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

/** 세종 관리자 수정 창의 칸 배치 - 두 줄씩, 좁은 화면에서는 한 줄 */
function Fields({ draft, set }: { draft: Draft; set: (p: Partial<Draft>) => void }) {
  const [labelInput, setLabelInput] = useState('');

  const addLabel = () => {
    const v = labelInput.trim();
    if (!v || draft.labels.includes(v)) return setLabelInput('');
    set({ labels: [...draft.labels, v] });
    setLabelInput('');
  };

  const badRange = !!(draft.start && draft.due && draft.start > draft.due);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-[18px] max-[480px]:grid-cols-1">
      <div>
        <label className={tmLabel} htmlFor="tm-status">상태</label>
        <select id="tm-status" className={`${tmSelect} w-full`}
          value={draft.status} onChange={(e) => set({ status: e.target.value as Status })}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-priority">우선순위</label>
        <select id="tm-priority" className={`${tmSelect} w-full`}
          value={draft.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
          {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-domain">영역</label>
        <select id="tm-domain" className={`${tmSelect} w-full`}
          value={draft.domain} onChange={(e) => set({ domain: e.target.value as DomainKey })}>
          {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-assignee">담당</label>
        <select id="tm-assignee" className={`${tmSelect} w-full`}
          value={draft.assignee ?? ''} onChange={(e) => set({ assignee: e.target.value || null })}>
          <option value="">미배정</option>
          {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
        </select>
      </div>

      <div>
        <label className={tmLabel} htmlFor="tm-start">시작일</label>
        <input id="tm-start" type="date" className={tmInput} aria-invalid={badRange || undefined}
          value={draft.start ?? ''} onChange={(e) => set({ start: e.target.value || null })} />
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-due">마감일</label>
        <input id="tm-due" type="date" className={tmInput} aria-invalid={badRange || undefined}
          value={draft.due ?? ''} onChange={(e) => set({ due: e.target.value || null })} />
      </div>
      {badRange && (
        <p className="col-span-full -mt-2 text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
          시작일이 마감일보다 늦습니다.
        </p>
      )}

      <div className="col-span-full">
        <label className={tmLabel} htmlFor="tm-label">라벨</label>
        <div className="flex items-center gap-2">
          <input id="tm-label" className={tmInput} placeholder="입력 후 Enter"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }} />
          <button type="button" onClick={addLabel} className={`${tmBtn} flex-none`}>
            추가
          </button>
        </div>
        {draft.labels.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {draft.labels.map((l) => (
              <button key={l} type="button" aria-label={`${l} 라벨 빼기`}
                onClick={() => set({ labels: draft.labels.filter((x) => x !== l) })}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-tm-tint pl-3 pr-2.5 text-[13px] font-bold text-tm-deep
                           transition-colors duration-150 hover:bg-tm-red-tint hover:text-tm-red-deep [@media(pointer:coarse)]:h-10">
                {l}
                <IconClose size={13} />
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
  const formId = useId();

  useEffect(() => { titleRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onCreate({ ...draft, title: draft.title.trim() });
  };

  return (
    <Modal
      title="새 작업"
      onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>
            취소
          </button>
          <button type="submit" form={formId} disabled={!draft.title.trim()} className={tmBtnPrimary}>
            만들기
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-[18px]">
        <div>
          <label className={tmLabel} htmlFor="tm-title">
            제목 <b className="text-[12.5px] font-bold text-tm-red">필수</b>
          </label>
          <input id="tm-title" ref={titleRef} className={tmInput} required
            placeholder="무엇을 해야 하나요?"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </div>
        <div>
          <label className={tmLabel} htmlFor="tm-desc">
            설명 <em className="text-[12.5px] font-medium not-italic text-tm-sub">선택</em>
          </label>
          <textarea id="tm-desc" rows={3} className={tmTextarea}
            placeholder="배경, 완료 조건, 참고 링크"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <Fields draft={draft} set={(p) => setDraft({ ...draft, ...p })} />
      </form>
    </Modal>
  );
}

/* ── 상세 패널 ────────────────────────────────────────
   보드를 보면서 고치도록 오른쪽에 붙는 패널. 고치는 즉시 저장된다.
   머리 · 본문 · 바닥의 짜임은 세종 관리자의 수정 창과 같다. */

export function TaskPanel({
  task, onUpdate, onRemove, onClose,
}: {
  task: Task;
  onUpdate(patch: Partial<Task>): void;
  onRemove(): void;
  onClose(): void;
}) {
  const trapRef = useFocusTrap<HTMLElement>();
  const [confirm, confirmNode] = useConfirm();
  /* 확인 창이 떠 있는 동안의 Esc 는 확인 창 몫이다 */
  const asking = useRef(false);
  asking.current = confirmNode !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !asking.current) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const remove = async () => {
    const yes = await confirm({
      title: '이 작업을 삭제할까요?',
      body: (
        <>
          <b>{task.key} {task.title}</b> 작업이 지워집니다. 지운 직후에는 화면 아래 알림의 실행 취소로 되돌릴 수 있습니다.
        </>
      ),
      ok: '삭제',
      tone: 'danger',
    });
    if (yes) onRemove();
  };

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
      <div className="fixed inset-0 z-[60] animate-tm-fade bg-[rgba(15,26,41,0.4)] lg:bg-transparent" onClick={onClose} aria-hidden />
      <aside ref={trapRef} role="dialog" aria-modal="true" aria-label={`${task.key} 상세`}
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[480px] animate-tm-slide flex-col border-l border-tm-line bg-white text-[15.5px] leading-[1.6] shadow-tm-pop">

        <header className="flex flex-none items-center gap-2.5 border-b border-tm-line py-[18px] pl-[26px] pr-5 max-[720px]:py-3.5 max-[720px]:pl-4 max-[720px]:pr-3">
          <PriorityDot p={task.priority} />
          <span className="text-[16px] font-extrabold tabular-nums text-tm-deep">{task.key}</span>
          <Chip className={DOMAIN_STYLE[task.domain]}>{DOMAINS.find((d) => d.id === task.domain)?.label}</Chip>
          <button type="button" onClick={onClose} aria-label="닫기" className={`ml-auto ${tmIconBtn}`}>
            <IconClose />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-[26px] max-[720px]:px-4 max-[720px]:py-[18px]">
          <label className={tmLabel} htmlFor="tm-edit-title">제목</label>
          <input id="tm-edit-title"
            className={`${tmFieldBase} mb-[18px] block h-auto w-full px-3.5 py-2.5 text-[19px] font-bold leading-[1.4]`}
            value={task.title}
            onChange={(e) => onUpdate({ title: e.target.value })} />

          <label className={tmLabel} htmlFor="tm-edit-desc">설명</label>
          <textarea id="tm-edit-desc" rows={5}
            className={`${tmTextarea} mb-6`}
            placeholder="배경, 완료 조건, 참고 링크"
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })} />

          <Fields draft={draft} set={(p) => onUpdate(p as Partial<Task>)} />

          <dl className="mt-6 grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-t border-tm-line pt-[18px] text-[14.5px] leading-[1.6]">
            <dt className="font-bold text-tm-sub">담당</dt>
            <dd className="flex min-w-0 items-center gap-2 text-tm-ink">
              <Avatar id={task.assignee} size={22} />
              {MEMBERS.find((m) => m.id === task.assignee)?.name ?? '미배정'}
            </dd>
            <dt className="font-bold text-tm-sub">만든 날</dt>
            <dd className="tabular-nums text-tm-ink">{task.createdAt.slice(0, 10)}</dd>
            <dt className="font-bold text-tm-sub">마지막 수정</dt>
            <dd className="tabular-nums text-tm-ink">{task.updatedAt.slice(0, 10)}</dd>
          </dl>
        </div>

        <footer className="flex flex-none flex-wrap items-center gap-2.5 border-t border-tm-line bg-tm-bg px-[26px] py-4 max-[720px]:px-4 max-[720px]:py-3">
          <button type="button" onClick={() => void remove()} className={tmGhostDanger}>
            작업 삭제
          </button>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-tm-sub max-[480px]:hidden">
            <i className="h-2 w-2 rounded-full bg-tm-ok" aria-hidden />
            고치면 바로 저장됩니다
          </span>
          <button type="button" onClick={onClose} className={tmBtn}>
            닫기
          </button>
        </footer>
      </aside>
      {confirmNode}
    </>
  );
}

export type { Draft };
