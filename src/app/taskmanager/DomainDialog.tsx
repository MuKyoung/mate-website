'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { DOMAIN_COLORS, type Domain, type DomainKey, type Task } from './types';
import { defaultDomain, leastUsedColor, reorder, type DomainStore } from './domainStore';
import {
  Chip, DOMAIN_FILL, DOMAIN_STYLE, IconArrow, IconPlus, Modal, useConfirm,
  tmBtn, tmCallout, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtn, tmLabel, tmSelect,
} from './ui';

/*
 * 영역 관리 창 - Supabase 모드에서는 영역을 맡은 사람만 연다(브라우저 저장 모드는 계정이 없어 누구나).
 * 이름 · 짧은 이름 · 색 · 순서를 고치고 영역을 더하거나 지운다. 고친 것은 바로 저장되고 팀 모두에게 보인다.
 * 지울 때는 그 영역의 작업을 옮길 영역을 고른다. 규칙은 DB 가 지킨다(맡은 사람만 고치고, 지우기는 작업을 옮기면서만).
 */

const NAME_MAX = 20;
const SHORT_MAX = 10;
const small = 'mb-1 block text-[12.5px] font-bold text-tm-sub';
const field = `${tmFieldBase} h-11 w-full px-3 text-[16px]`;

/**
 * 칸을 떠날 때 · Enter · 창을 닫을 때 저장하는 글자 칸. 치는 동안 저장하면 '웹 · 앱'을 치다 만 '웹 ·' 같은 이름이 남는다.
 * check 가 문제를 돌려주면 치는 동안 알리고, 그대로 떠나면 저장하지 않고 저장된 값으로 돌린다.
 * 치는 동안 들어온 다른 곳의 고침은 칸을 떠난 뒤에 따른다
 */
function CommitInput({ id, value, max, placeholder, autoFocus, check, onSave }: {
  id: string;
  value: string;
  max: number;
  placeholder?: string;
  autoFocus?: boolean;
  check?(v: string): string | null;
  onSave(v: string): void;
}) {
  const [text, setText] = useState(value);
  const focused = useRef(false);
  /** 방금 더한 영역 - 처음 초점을 받을 때만 이름을 통째로 골라 두어 바로 고쳐 칠 수 있게 */
  const pick = useRef(!!autoFocus);
  useEffect(() => {
    if (!focused.current) setText(value);
  }, [value]);
  /** 저장할 값 - 바뀌었고 문제가 없으면 다듬은 값, 아니면 null */
  const pending = (t: string) => {
    const v = t.trim();
    return v !== value && !check?.(v) ? v : null;
  };
  // Esc 로 창을 닫으면 칸을 떠나는 일 없이 사라진다 - 그때도 친 것을 저장한다
  const last = useRef<() => void>(() => {});
  last.current = () => {
    const v = focused.current ? pending(text) : null;
    if (v !== null) onSave(v);
  };
  useEffect(() => () => last.current(), []);

  const problem = check?.(text.trim()) ?? null;
  return (
    <>
      <input id={id} value={text} maxLength={max} placeholder={placeholder} autoFocus={autoFocus} className={field}
        aria-invalid={!!problem || undefined} aria-describedby={problem ? `${id}-err` : undefined}
        onFocus={(e) => {
          focused.current = true;
          if (pick.current) e.currentTarget.select();
          pick.current = false;
        }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        onBlur={() => {
          focused.current = false;
          const v = pending(text);
          if (v !== null) onSave(v);
          setText(v ?? value);
        }} />
      {problem && <p id={`${id}-err`} role="alert" className="mt-1 text-[12.5px] font-semibold text-tm-red-deep">{problem}</p>}
    </>
  );
}

export function DomainDialog({
  domains, tasks, local, onCreate, onUpdate, onRemove, onClose,
}: {
  /** 메뉴 순서대로 */
  domains: Domain[];
  /** 영역마다 작업 수를 센다 */
  tasks: Task[];
  /** 브라우저 저장 모드 - 이 브라우저에만 저장된다 */
  local: boolean;
  onCreate: DomainStore['create'];
  onUpdate: DomainStore['update'];
  onRemove(id: DomainKey, moveTo: DomainKey): Promise<boolean>;
  onClose(): void;
}) {
  const uid = useId();
  const [confirm, confirmNode] = useConfirm();
  /** 방금 더한 영역 - 이름 칸에 초점을 준다 */
  const [fresh, setFresh] = useState<DomainKey | null>(null);
  const [busy, setBusy] = useState<DomainKey | null>(null);
  /** 지우기 확인 창에서 고른 옮길 영역 */
  const moveTo = useRef<DomainKey>('');

  const count = (id: DomainKey) => tasks.filter((t) => t.domain === id).length;

  const add = () => {
    let label = '새 영역';
    for (let k = 2; domains.some((d) => d.label === label); k += 1) label = `새 영역 ${k}`;
    setFresh(onCreate({ label, color: leastUsedColor(domains) }).id);
  };

  const move = (id: DomainKey, dir: -1 | 1) => {
    reorder(domains, id, dir).forEach((p) => onUpdate(p.id, { order: p.order }));
  };

  const remove = async (d: Domain) => {
    const others = domains.filter((o) => o.id !== d.id);
    const n = count(d.id);
    moveTo.current = defaultDomain(others);
    const yes = await confirm({
      title: `'${d.label}' 영역을 지울까요?`,
      body: n === 0 ? (
        <>이 영역에는 작업이 없습니다. 지우면 메뉴와 고르기 칸에서 빠집니다.</>
      ) : (
        <>
          <p>이 영역의 작업 <b>{n}건</b>은 아래 영역으로 옮기고 지웁니다. 되돌리기는 없습니다.</p>
          <label className={`${tmLabel} mt-4`} htmlFor={`${uid}-move`}>작업을 옮길 영역</label>
          <select id={`${uid}-move`} defaultValue={moveTo.current} className={`${tmSelect} w-full`}
            onChange={(e) => { moveTo.current = e.target.value; }}>
            {others.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </>
      ),
      ok: '지우기',
      tone: 'danger',
    });
    if (!yes) return;
    setBusy(d.id);
    await onRemove(d.id, moveTo.current);
    setBusy(null);
  };

  return (
    <>
      <Modal
        title="영역 관리"
        sub={local ? '이 브라우저에만 저장됩니다' : '영역은 맡은 사람만 고칠 수 있습니다'}
        onClose={onClose}
        foot={
          <>
            <span className="flex-1" />
            <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          </>
        }
      >
        <ul className="flex flex-col gap-2.5">
          {domains.map((d, i) => {
            const others = domains.filter((o) => o.id !== d.id).map((o) => o.label);
            const n = count(d.id);
            const off = busy === d.id;
            return (
              <li key={d.id} className="rounded-tm-sm bg-tm-bg px-3.5 py-3">
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2.5">
                  <div className="min-w-0 flex-[1_1_220px]">
                    <label className={small} htmlFor={`${uid}-${d.id}-name`}>이름</label>
                    <CommitInput id={`${uid}-${d.id}-name`} value={d.label} max={NAME_MAX} autoFocus={fresh === d.id}
                      check={(v) => (!v ? '이름을 적어 주세요' : others.includes(v) ? '같은 이름의 영역이 있습니다' : null)}
                      onSave={(v) => onUpdate(d.id, { label: v })} />
                  </div>
                  <div className="w-[140px] flex-none max-[480px]:flex-[1_1_140px]">
                    <label className={small} htmlFor={`${uid}-${d.id}-short`}>짧은 이름</label>
                    <CommitInput id={`${uid}-${d.id}-short`} value={d.short} max={SHORT_MAX} placeholder={d.label}
                      onSave={(v) => onUpdate(d.id, { short: v })} />
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                  <div role="group" aria-label={`${d.label} 색`} className="flex items-center">
                    {DOMAIN_COLORS.map((c) => {
                      const on = d.color === c.id;
                      return (
                        <button key={c.id} type="button" aria-pressed={on} aria-label={c.label} title={c.label}
                          onClick={() => { if (!on) onUpdate(d.id, { color: c.id }); }}
                          className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 hover:bg-white
                                     [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11">
                          <span className={`h-5 w-5 rounded-full ${DOMAIN_FILL[c.id]} ${on ? 'ring-2 ring-tm-ink ring-offset-2 ring-offset-tm-bg' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                  {/* 보드 카드에서 보일 모양 */}
                  <Chip className={DOMAIN_STYLE[d.color]}>{d.short || d.label}</Chip>
                  <span className="text-[13px] font-semibold tabular-nums text-tm-sub">작업 {n}건</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <button type="button" onClick={() => move(d.id, -1)} disabled={i === 0 || off}
                      aria-label={`${d.label} 위로`} title="위로" className={tmIconBtn}>
                      <IconArrow dir="up" />
                    </button>
                    <button type="button" onClick={() => move(d.id, 1)} disabled={i === domains.length - 1 || off}
                      aria-label={`${d.label} 아래로`} title="아래로" className={tmIconBtn}>
                      <IconArrow dir="down" />
                    </button>
                    <button type="button" onClick={() => void remove(d)} disabled={domains.length <= 1 || off}
                      title={domains.length <= 1 ? '영역은 하나 이상 있어야 합니다' : undefined} className={tmGhostDanger}>
                      {off ? '지우는 중…' : '지우기'}
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <button type="button" onClick={add} className={`${tmGhostBtn} mt-3`}>
          <IconPlus size={16} />
          영역 추가
        </button>

        <div className={`${tmCallout} mt-5`}>
          <p className="min-w-0">
            이름은 칸을 떠나거나 Enter 를 누르면 저장되고, 메뉴 · 보드 · 타임라인 · 캘린더 · 로드맵에 바로 반영됩니다.
            짧은 이름은 보드 카드의 알약에 쓰고, 비워 두면 이름을 씁니다.
            {local ? '' : ' 팀원 모두에게 같은 영역이 보입니다.'}
          </p>
        </div>
      </Modal>
      {confirmNode}
    </>
  );
}
