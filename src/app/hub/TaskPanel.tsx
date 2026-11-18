'use client';

import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  PRIORITIES, STATUSES, ancestorsOf, descendantIds, localDay, statusLabel,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import { assignable, useMember, useMembers } from './members';
import { useDomains } from './domainStore';
import {
  Avatar, DomainChip, IconClose, Modal, PriorityDot, STATUS_STYLE, SubCount,
  tmBtn, tmBtnPrimary, tmCallout, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtn, tmIconBtnSm, tmInput, tmLabel, tmSelect, tmTextarea,
  useConfirm, useFocusTrap, type Confirm,
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
  /** 상위 업무(Task.id) - 없으면 맨 위 업무 */
  parentId: string | null;
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
  parentId: null,
});

/** 상위 · 하위 업무를 다루는 데 필요한 것 - 주지 않으면(Supabase 에 상위 업무 칸이 아직 없을 때) 그 칸들을 숨긴다 */
export interface Family {
  /** 모든 작업 */
  tasks: Task[];
  /** 다른 작업을 이 창에 연다 */
  open(id: string): void;
  /** 다른 작업을 고친다 - 하위 업무 잇기 · 빼기 · 완료 */
  update(id: string, patch: Partial<Task>): void;
  /** 이 작업 아래에 새 하위 업무를 만든다 */
  create(title: string): void;
}

/** 작업 고르기 칸의 항목 - 영역별로 묶고, 영역 안에서는 최근에 만든 것부터 */
function TaskOptions({ tasks }: { tasks: Task[] }) {
  const domains = useDomains();
  const groups = [...domains.map((d) => ({ id: d.id, label: d.label })), { id: '', label: '영역 없음' }]
    .map((g) => ({
      ...g,
      items: tasks
        .filter((t) => (g.id ? t.domain === g.id : !domains.some((d) => d.id === t.domain)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }))
    .filter((g) => g.items.length);
  return (
    <>
      {groups.map((g) => (
        <optgroup key={g.id || '-'} label={g.label}>
          {g.items.map((t) => (
            <option key={t.id} value={t.id}>{`${t.key} ${t.title || '제목 없음'}${t.status === 'done' ? ' (완료)' : ''}`}</option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

/* 날짜 칸에 연도를 치는 동안에는 0002-, 0020- 같은 값이 잠깐 들어온다 - 그때는 다른 날짜를 옮기지 않는다 */
const settled = (v: string) => v >= '1000';

/** 세종 관리자 수정 창의 칸 배치 - 두 줄씩, 좁은 화면에서는 한 줄 */
function Fields({ draft, set, knownLabels = [], parents }: {
  draft: Draft;
  set: (p: Partial<Draft>) => void;
  /** 다른 작업에 이미 쓰인 라벨 - 라벨 칸의 추천 목록 */
  knownLabels?: string[];
  /** 상위 업무로 고를 수 있는 작업(자기 자신 · 자기 하위 업무는 뺀 것) - 주지 않으면 상위 업무 칸을 숨긴다 */
  parents?: Task[];
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

      {parents && (
        <div className="col-span-full">
          <label className={tmLabel} htmlFor="tm-parent">상위 업무</label>
          {/* 지운 작업을 가리키고 있으면 '없음'으로 보인다 - 고르면 그 칸도 비운다 */}
          <select id="tm-parent" className={`${tmSelect} w-full`}
            value={draft.parentId && parents.some((t) => t.id === draft.parentId) ? draft.parentId : ''}
            onChange={(e) => set({ parentId: e.target.value || null })}>
            <option value="">없음 (맨 위 업무)</option>
            <TaskOptions tasks={parents} />
          </select>
        </div>
      )}
    </div>
  );
}

/* ── 새 작업 ──────────────────────────────────────── */

export function NewTaskDialog({
  defaultStatus, defaultDomain, defaultDue, knownLabels, tasks, onCreate, onClose,
}: {
  defaultStatus: Status;
  defaultDomain: DomainKey;
  /** 캘린더에서 날짜를 눌러 들어온 경우 미리 채운다 */
  defaultDue?: string | null;
  /** 이미 쓰인 라벨 - 라벨 칸 추천 목록 */
  knownLabels?: string[];
  /** 상위 업무로 고를 수 있는 작업 - 주지 않으면 상위 업무 칸을 숨긴다 */
  tasks?: Task[];
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
          <Fields draft={draft} set={(p) => setDraft((d) => ({ ...d, ...p }))} knownLabels={knownLabels} parents={tasks} />
        </form>
      </Modal>
      {confirmNode}
    </>
  );
}

/* ── 하위 업무 ────────────────────────────────────────
   진행 막대 · 목록(체크로 완료) · 바로 만들기 · 이미 있는 작업 잇기.
   상태는 저절로 바꾸지 않는다 - 하위가 모두 끝났거나, 이 업무를 끝냈는데 하위가 남았을 때 한 번에 맞추는 단추만 보인다 */

function Subtasks({ task, family, confirm }: { task: Task; family: Family; confirm: Confirm }) {
  const [title, setTitle] = useState('');
  const kids = useMemo(
    () => family.tasks
      .filter((t) => t.parentId === task.id && t.id !== task.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [family.tasks, task.id],
  );
  const done = kids.filter((t) => t.status === 'done').length;
  const left = kids.filter((t) => t.status !== 'done');
  /* 하위로 이을 수 있는 작업 - 자기 자신, 이미 하위인 것, 자기 위의 작업(고리가 된다)은 뺀다.
     다른 작업의 하위인 것은 이 작업 아래로 옮겨 온다 */
  const linkable = useMemo(() => {
    const above = new Set(ancestorsOf(task, new Map(family.tasks.map((t) => [t.id, t]))).map((t) => t.id));
    return family.tasks.filter((t) => t.id !== task.id && t.parentId !== task.id && !above.has(t.id));
  }, [family.tasks, task]);

  const add = () => {
    const v = title.trim();
    if (!v) return;
    family.create(v);
    setTitle('');
  };

  const finishAll = async () => {
    const shown = left.slice(0, 6);
    const yes = await confirm({
      title: `하위 업무 ${left.length}개를 완료로 바꿀까요?`,
      body: (
        <>
          {shown.map((t) => <span key={t.id} className="block"><b>{t.key}</b> {t.title || '제목 없음'}</span>)}
          {left.length > shown.length && <span className="block text-tm-sub">외 {left.length - shown.length}개</span>}
        </>
      ),
      ok: '모두 완료',
    });
    if (yes) left.forEach((t) => family.update(t.id, { status: 'done' }));
  };

  return (
    <section aria-labelledby="tm-sub-head" className="mt-6 border-t border-tm-line pt-[18px]">
      <div className="mb-2.5 flex items-center gap-2.5">
        <h3 id="tm-sub-head" className="text-[14px] font-bold text-tm-ink">하위 업무</h3>
        {kids.length > 0 && (
          <span className="text-[13px] font-semibold tabular-nums text-tm-sub">{kids.length}개 중 {done}개 완료</span>
        )}
      </div>

      {kids.length > 0 && (
        <>
          <div role="progressbar" aria-label="하위 업무 진행" aria-valuemin={0} aria-valuemax={kids.length} aria-valuenow={done}
            className="mb-3 h-1.5 overflow-hidden rounded-full bg-tm-bg ring-1 ring-inset ring-tm-line">
            <div className="h-full rounded-full bg-tm-ok transition-[width] duration-300" style={{ width: `${(done / kids.length) * 100}%` }} />
          </div>
          <ul className="mb-3 rounded-tm-sm border border-tm-line">
            {kids.map((k) => {
              const fin = k.status === 'done';
              return (
                <li key={k.id} className="flex items-center gap-1.5 border-b border-tm-line pr-1.5 last:border-0">
                  {/* 체크 상자는 작아서 둘레까지 누를 수 있게 칸을 키운다. 풀면 할 일로 돌아간다 */}
                  <label className="grid h-11 w-10 flex-none cursor-pointer place-items-center">
                    <input type="checkbox" checked={fin} aria-label={`${k.key} ${k.title} 완료`}
                      onChange={(e) => family.update(k.id, { status: e.target.checked ? 'done' : 'todo' })}
                      className="h-[18px] w-[18px] cursor-pointer accent-tm-blue" />
                  </label>
                  <button type="button" onClick={() => family.open(k.id)}
                    className="group/sub flex min-h-[44px] min-w-0 flex-1 items-center gap-2 text-left">
                    <span className="flex-none text-[13px] font-bold tabular-nums text-tm-sub">{k.key}</span>
                    <span className={`min-w-0 truncate text-[14.5px] font-semibold underline-offset-[3px] group-hover/sub:underline ${
                      fin ? 'text-tm-sub line-through' : 'text-tm-ink'}`}>
                      {k.title || '제목 없음'}
                    </span>
                  </button>
                  <span className={`flex-none whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-bold max-[420px]:hidden ${STATUS_STYLE[k.status].pill}`}>
                    {statusLabel(k.status)}
                  </span>
                  <Avatar id={k.assignee} size={22} />
                  <button type="button" onClick={() => family.update(k.id, { parentId: null })}
                    aria-label={`${k.key} 하위 업무에서 빼기`} title="하위 업무에서 빼기" className={tmIconBtnSm}>
                    <IconClose size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {kids.length > 0 && left.length === 0 && task.status !== 'done' && (
        <div className={`${tmCallout} mb-3`}>
          <span className="min-w-0 flex-1">하위 업무가 모두 끝났습니다.</span>
          <button type="button" onClick={() => family.update(task.id, { status: 'done' })} className={tmGhostBtn}>
            이 업무도 완료
          </button>
        </div>
      )}
      {task.status === 'done' && left.length > 0 && (
        <div className={`${tmCallout} mb-3`}>
          <span className="min-w-0 flex-1">끝나지 않은 하위 업무가 {left.length}개 있습니다.</span>
          <button type="button" onClick={() => void finishAll()} className={tmGhostBtn}>
            모두 완료로
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="tm-sub-new">새 하위 업무 제목</label>
        <input id="tm-sub-new" className={tmInput} placeholder="새 하위 업무 제목 입력 후 Enter"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} disabled={!title.trim()} className={`${tmBtn} flex-none`}>
          추가
        </button>
      </div>
      {linkable.length > 0 && (
        <div className="mt-2.5">
          <label className="sr-only" htmlFor="tm-sub-link">이미 있는 작업을 하위 업무로 잇기</label>
          <select id="tm-sub-link" value="" className={`${tmSelect} w-full`}
            onChange={(e) => { if (e.target.value) family.update(e.target.value, { parentId: task.id }); }}>
            <option value="">이미 있는 작업을 하위 업무로 잇기</option>
            <TaskOptions tasks={linkable} />
          </select>
        </div>
      )}
    </section>
  );
}

/* ── 상세 패널 ────────────────────────────────────────
   보드를 보면서 고치도록 오른쪽에 붙는 패널. 고치는 즉시 저장된다.
   머리 · 본문 · 바닥의 짜임은 세종 관리자의 수정 창과 같다. */

export function TaskPanel({
  task, knownLabels, unsaved, family, onUpdate, onRemove, onClose,
}: {
  task: Task;
  /** 이미 쓰인 라벨 - 라벨 칸 추천 목록 */
  knownLabels?: string[];
  /** 서버에 아직 보내지 못한 변경이 있다 - 바닥 줄도 쪽 머리 알약과 같은 말을 한다 */
  unsaved?: boolean;
  /** 상위 · 하위 업무 - 주지 않으면 그 칸들을 숨긴다 */
  family?: Family;
  onUpdate(patch: Partial<Task>): void;
  onRemove(): void;
  onClose(): void;
}) {
  const trapRef = useFocusTrap<HTMLElement>();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [confirm, confirmNode] = useConfirm();
  const owner = useMember(task.assignee);
  /* 확인 창이 떠 있는 동안의 Esc 는 확인 창 몫이다 */
  const asking = useRef(false);
  asking.current = confirmNode !== null;

  /* 상위 업무 줄(맨 위부터) · 상위로 고를 수 있는 작업(자기 자신과 자기 하위 업무를 빼야 고리가 생기지 않는다) */
  const all = family?.tasks;
  const chain = useMemo(() => (all ? ancestorsOf(task, new Map(all.map((t) => [t.id, t]))).reverse() : []), [all, task]);
  const parents = useMemo(() => {
    if (!all) return undefined;
    const below = descendantIds(task.id, all);
    return all.filter((t) => t.id !== task.id && !below.has(t.id));
  }, [all, task.id]);
  const kids = all ? all.filter((t) => t.parentId === task.id && t.id !== task.id) : [];
  const kidCount = kids.length;
  const kidDone = kids.filter((t) => t.status === 'done').length;

  /* 상위 · 하위 업무를 눌러 다른 작업으로 넘어가면 맨 위부터 보이고, 누른 단추가 사라져 잃은 초점을 창으로 되돌린다 */
  const shown = useRef(task.id);
  useEffect(() => {
    if (shown.current === task.id) return;
    shown.current = task.id;
    bodyRef.current?.scrollTo({ top: 0 });
    if (!trapRef.current?.contains(document.activeElement)) trapRef.current?.focus({ preventScroll: true });
  }, [task.id, trapRef]);

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
          {kidCount > 0 && ` 하위 업무 ${kidCount}개는 지우지 않고 맨 위 업무로 남깁니다(실행 취소하면 다시 이어집니다).`}
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
    parentId: task.parentId ?? null,
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] animate-tm-fade bg-[rgba(15,26,41,0.4)] lg:bg-transparent" onClick={onClose} aria-hidden />
      <aside ref={trapRef} role="dialog" aria-modal="true" aria-label={`${task.key} 상세`} tabIndex={-1}
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[480px] animate-tm-slide flex-col border-l border-tm-line bg-tm-card text-[15.5px] leading-[1.6] shadow-tm-pop outline-none">

        <header className="flex flex-none items-center gap-2.5 border-b border-tm-line py-[18px] pl-[26px] pr-5 max-[720px]:py-3.5 max-[720px]:pl-4 max-[720px]:pr-3">
          <PriorityDot p={task.priority} />
          <span className="text-[16px] font-extrabold tabular-nums text-tm-deep">{task.key}</span>
          <DomainChip id={task.domain} />
          {/* 하위 업무 칸은 아래에 있어 머리에서 알리고, 누르면 그리로 내려간다 */}
          {family && kidCount > 0 && (
            <button type="button" aria-label={`하위 업무 ${kidCount}개 중 ${kidDone}개 완료, 하위 업무 칸으로`}
              onClick={() => document.getElementById('tm-sub-head')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="grid min-h-[30px] place-items-center rounded-lg px-1.5 transition-colors duration-150 hover:bg-tm-tint">
              <SubCount done={kidDone} total={kidCount} />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="닫기" className={`ml-auto ${tmIconBtn}`}>
            <IconClose />
          </button>
        </header>

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto p-[26px] max-[720px]:px-4 max-[720px]:py-[18px]">
          {family && chain.length > 0 && (
            <nav aria-label="상위 업무" className="mb-3 flex min-w-0 flex-wrap items-center gap-x-1.5 text-[13.5px] leading-[1.5]">
              <span className="font-bold text-tm-sub">상위</span>
              {chain.map((p, i) => (
                <Fragment key={p.id}>
                  {i > 0 && <span aria-hidden className="text-tm-sub">›</span>}
                  <button type="button" onClick={() => family.open(p.id)}
                    className="max-w-full truncate rounded py-1 font-semibold text-tm-blue underline-offset-[3px] hover:underline">
                    <span className="tabular-nums">{p.key}</span> {p.title || '제목 없음'}
                  </button>
                </Fragment>
              ))}
            </nav>
          )}

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

          <Fields draft={draft} set={(p) => onUpdate(p as Partial<Task>)} knownLabels={knownLabels} parents={parents} />

          {family && <Subtasks task={task} family={family} confirm={confirm} />}

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
