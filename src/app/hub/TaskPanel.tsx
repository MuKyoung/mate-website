'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  PRIORITIES, STATUSES, localDay,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import { assignable, useMember, useMembers } from './members';
import { useDomains } from './domainStore';
import {
  Avatar, DomainChip, IconClose, Modal, PriorityDot,
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

const emptyDraft = (status: Status, domain: DomainKey): Draft => ({
  title: '',
  description: '',
  status,
  priority: 'normal',
  domain,
  assignee: null,
  start: null,
  due: null,
  labels: [],
});

/* 날짜 칸에 연도를 치는 동안에는 0002-, 0020- 같은 값이 잠깐 들어온다 - 그때는 다른 날짜를 옮기지 않는다 */
const settled = (v: string) => v >= '1000';

/** 세종 관리자 수정 창의 칸 배치 - 두 줄씩, 좁은 화면에서는 한 줄 */
function Fields({ draft, set, knownLabels = [] }: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
  /** 다른 작업에 이미 쓰인 라벨 - 라벨 칸의 추천 목록 */
  knownLabels?: string[];
}) {
  const [labelInput, setLabelInput] = useState('');
  /** 거꾸로 된 기간을 막으려고 옮긴 쪽 */
  const [moved, setMoved] = useState<'start' | 'due' | null>(null);
  const people = assignable(useMembers(), draft.assignee);
  const domains = useDomains();
  const listId = useId();
  const suggest = knownLabels.filter((l) => !draft.labels.includes(l));

  const addLabel = () => {
    const v = labelInput.trim();
    if (!v || draft.labels.includes(v)) return setLabelInput('');
    set({ labels: [...draft.labels, v] });
    setLabelInput('');
  };

  /* 시작일이 마감일을 넘어가면 다른 쪽을 같은 날로 맞춘다.
     날짜는 한 자리 칠 때마다 들어온다(18일을 치면 1일이 먼저 온다). 그래서 다른 쪽을 옮겼으면 옮기기 전 날짜를
     칸을 떠날 때까지 들고 있다가, 뒤이어 들어온 날짜와 맞으면 그 날짜로 되돌린다 */
  const before = useRef<{ field: 'start' | 'due'; other: string } | null>(null);
  const setStart = (v: string | null) => {
    const held = before.current?.field === 'start' ? before.current.other : null;
    const due = held ?? draft.due;
    const flip = !!(v && due && settled(v) && v > due);
    if (flip && !held && draft.due) before.current = { field: 'start', other: draft.due };
    const nextDue = flip ? v : due;
    set(nextDue === draft.due ? { start: v } : { start: v, due: nextDue });
    setMoved(flip ? 'due' : null);
  };
  const setDue = (v: string | null) => {
    const held = before.current?.field === 'due' ? before.current.other : null;
    const start = held ?? draft.start;
    const flip = !!(v && start && settled(v) && v < start);
    if (flip && !held && draft.start) before.current = { field: 'due', other: draft.start };
    const nextStart = flip ? v : start;
    set(nextStart === draft.start ? { due: v } : { due: v, start: nextStart });
    setMoved(flip ? 'start' : null);
  };
  const release = () => { before.current = null; };

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
          value={draft.domain} onChange={(e) => set({ domain: e.target.value })}>
          {domains.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          {/* 방금 지워진 영역 - 고르기 칸이 엉뚱한 영역을 보이지 않게 */}
          {!domains.some((d) => d.id === draft.domain) && <option value={draft.domain} disabled>영역 없음</option>}
        </select>
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-assignee">담당</label>
        <select id="tm-assignee" className={`${tmSelect} w-full`}
          value={draft.assignee ?? ''} onChange={(e) => set({ assignee: e.target.value || null })}>
          <option value="">미배정</option>
          {people.map((m) => <option key={m.id} value={m.id}>{m.role ? `${m.name} · ${m.role}` : m.name}</option>)}
        </select>
      </div>

      <div>
        <label className={tmLabel} htmlFor="tm-start">시작일</label>
        <input id="tm-start" type="date" className={tmInput} aria-invalid={badRange || undefined}
          value={draft.start ?? ''} onChange={(e) => setStart(e.target.value || null)} onBlur={release} />
      </div>
      <div>
        <label className={tmLabel} htmlFor="tm-due">마감일</label>
        <input id="tm-due" type="date" className={tmInput} aria-invalid={badRange || undefined}
          value={draft.due ?? ''} onChange={(e) => setDue(e.target.value || null)} onBlur={release} />
      </div>
      {badRange ? (
        <p className="col-span-full -mt-2 text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
          시작일이 마감일보다 늦습니다. 둘 중 한 날짜를 다시 고르면 맞춰집니다.
        </p>
      ) : moved && (
        <p role="status" className="col-span-full -mt-2 text-[13.5px] font-semibold leading-[1.5] text-tm-sub">
          {moved === 'due' ? '마감일을 시작일과 같은 날로 옮겼습니다.' : '시작일을 마감일과 같은 날로 옮겼습니다.'}
        </p>
      )}

      <div className="col-span-full">
        <label className={tmLabel} htmlFor="tm-label">라벨</label>
        <div className="flex items-center gap-2">
          {/* 치다가 칸을 떠나면(만들기 · 닫기를 눌러도) 그대로 붙인다 */}
          <input id="tm-label" className={tmInput} placeholder="입력 후 Enter"
            list={suggest.length ? listId : undefined}
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onBlur={addLabel}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addLabel(); } }} />
          {suggest.length > 0 && (
            <datalist id={listId}>
              {suggest.map((l) => <option key={l} value={l} />)}
            </datalist>
          )}
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
  defaultStatus, defaultDomain, defaultDue, knownLabels, onCreate, onClose,
}: {
  defaultStatus: Status;
  defaultDomain: DomainKey;
  /** 캘린더에서 날짜를 눌러 들어온 경우 미리 채운다 */
  defaultDue?: string | null;
  /** 이미 쓰인 라벨 - 라벨 칸 추천 목록 */
  knownLabels?: string[];
  onCreate(d: Draft): void;
  onClose(): void;
}) {
  const [draft, setDraft] = useState<Draft>(() => ({ ...emptyDraft(defaultStatus, defaultDomain), due: defaultDue ?? null }));
  const titleRef = useRef<HTMLInputElement>(null);
  const formId = useId();
  const [confirm, confirmNode] = useConfirm();

  useEffect(() => { titleRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onCreate({ ...draft, title: draft.title.trim() });
  };

  /* 적은 제목 · 설명이 있으면 묻고 닫는다. 미리 채운 상태 · 마감일은 적은 것으로 보지 않는다 */
  const tryClose = async () => {
    if (!draft.title.trim() && !draft.description.trim()) return onClose();
    const yes = await confirm({
      title: '작성 중인 작업을 버릴까요?',
      body: '지금까지 적은 내용이 지워집니다.',
      ok: '버리기',
      cancel: '계속 쓰기',
      tone: 'danger',
    });
    if (yes) onClose();
  };

  return (
    <>
      <Modal
        title="새 작업"
        onClose={() => void tryClose()}
        foot={
          <>
            <span className="flex-1" />
            <button type="button" onClick={() => void tryClose()} className={tmBtn}>
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
          <Fields draft={draft} set={(p) => setDraft((d) => ({ ...d, ...p }))} knownLabels={knownLabels} />
        </form>
      </Modal>
      {confirmNode}
    </>
  );
}

/* ── 상세 패널 ────────────────────────────────────────
   보드를 보면서 고치도록 오른쪽에 붙는 패널. 고치는 즉시 저장된다.
   머리 · 본문 · 바닥의 짜임은 세종 관리자의 수정 창과 같다. */

export function TaskPanel({
  task, knownLabels, unsaved, onUpdate, onRemove, onClose,
}: {
  task: Task;
  /** 이미 쓰인 라벨 - 라벨 칸 추천 목록 */
  knownLabels?: string[];
  /** 서버에 아직 보내지 못한 변경이 있다 - 바닥 줄도 쪽 머리 알약과 같은 말을 한다 */
  unsaved?: boolean;
  onUpdate(patch: Partial<Task>): void;
  onRemove(): void;
  onClose(): void;
}) {
  const trapRef = useFocusTrap<HTMLElement>();
  const [confirm, confirmNode] = useConfirm();
  const owner = useMember(task.assignee);
  /* 확인 창이 떠 있는 동안의 Esc 는 확인 창 몫이다 */
  const asking = useRef(false);
  asking.current = confirmNode !== null;

  /* 제목은 빈 채로 저장하지 않는다. 칸의 글자는 따로 들고, 비어 있는 동안은 저장을 건너뛰고
     칸을 떠나면 마지막 제목으로 돌린다 */
  const [title, setTitle] = useState(task.title);
  const titleFocused = useRef(false);
  const titleFor = useRef(task.id);
  useEffect(() => {
    // 다른 작업을 열었거나, 치고 있지 않을 때 들어온 제목(다른 팀원의 수정)은 그대로 따른다
    if (titleFor.current !== task.id || !titleFocused.current) setTitle(task.title);
    titleFor.current = task.id;
  }, [task.id, task.title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || asking.current) return;
      // 칸에서 먼저 빠져나와 치던 라벨을 붙이고 빈 제목을 되돌린 뒤 닫는다
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      onClose();
    };
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
          <DomainChip id={task.domain} />
          <button type="button" onClick={onClose} aria-label="닫기" className={`ml-auto ${tmIconBtn}`}>
            <IconClose />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-[26px] max-[720px]:px-4 max-[720px]:py-[18px]">
          <label className={tmLabel} htmlFor="tm-edit-title">제목</label>
          <input id="tm-edit-title"
            className={`${tmFieldBase} mb-[18px] block h-auto w-full px-3.5 py-2.5 text-[19px] font-bold leading-[1.4]`}
            aria-invalid={!title.trim() || undefined}
            aria-describedby={title.trim() ? undefined : 'tm-edit-title-hint'}
            value={title}
            onFocus={() => { titleFocused.current = true; }}
            onChange={(e) => {
              const v = e.target.value;
              setTitle(v);
              if (v.trim()) onUpdate({ title: v });
            }}
            onBlur={() => { titleFocused.current = false; setTitle(task.title); }} />
          {!title.trim() && (
            <p id="tm-edit-title-hint" className="-mt-3 mb-[18px] text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
              제목은 비워 둘 수 없습니다. 칸을 떠나면 마지막으로 저장된 제목으로 돌아갑니다.
            </p>
          )}

          <label className={tmLabel} htmlFor="tm-edit-desc">설명</label>
          <textarea id="tm-edit-desc" rows={5}
            className={`${tmTextarea} mb-6`}
            placeholder="배경, 완료 조건, 참고 링크"
            value={task.description}
            onChange={(e) => onUpdate({ description: e.target.value })} />

          <Fields draft={draft} set={(p) => onUpdate(p as Partial<Task>)} knownLabels={knownLabels} />

          <dl className="mt-6 grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-t border-tm-line pt-[18px] text-[14.5px] leading-[1.6]">
            <dt className="font-bold text-tm-sub">담당</dt>
            <dd className="flex min-w-0 items-center gap-2 text-tm-ink">
              <Avatar id={task.assignee} size={22} />
              {owner?.name ?? '미배정'}
            </dd>
            <dt className="font-bold text-tm-sub">만든 날</dt>
            <dd className="tabular-nums text-tm-ink">{localDay(task.createdAt)}</dd>
            <dt className="font-bold text-tm-sub">마지막 수정</dt>
            <dd className="tabular-nums text-tm-ink">{localDay(task.updatedAt)}</dd>
          </dl>
        </div>

        <footer className="flex flex-none flex-wrap items-center gap-2.5 border-t border-tm-line bg-tm-bg px-[26px] py-4 max-[720px]:px-4 max-[720px]:py-3">
          <button type="button" onClick={() => void remove()} className={tmGhostDanger}>
            작업 삭제
          </button>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-tm-sub max-[480px]:hidden">
            <i className={`h-2 w-2 rounded-full ${unsaved ? 'bg-tm-red' : 'bg-tm-ok'}`} aria-hidden />
            {unsaved ? '저장하지 못한 변경이 있습니다' : '고치면 바로 저장됩니다'}
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
