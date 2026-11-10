'use client';

import { useState } from 'react';
import { TASK_COLORS, type ColorBy, type Member, type TaskColor } from './types';
import { labelKey, memberKey, usePainter } from './colorStore';
import { Avatar, Modal, PAINT, tmBtn, tmCallout, tmTab } from './ui';

/*
 * 색 바꾸기 창 - 사람 · 라벨마다 캘린더 · 타임라인의 작업 바탕 색을 고른다.
 * 고른 것은 바로 저장되고(Supabase 모드는 팀원 모두에게 같은 색), '자동'을 누르면 고르기 전의 자동 색으로 돌아간다.
 */

function ColorRow({ name, picked, onPick, children }: {
  name: string;
  /** 고른 색 - 없으면 자동 */
  picked: TaskColor | undefined;
  onPick(c: TaskColor | null): void;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-tm-sm bg-tm-bg px-3.5 py-2.5">
      <span className="flex min-w-0 flex-[1_1_150px] items-center gap-2.5">{children}</span>
      <div role="group" aria-label={`${name} 색`} className="flex flex-wrap items-center">
        {TASK_COLORS.map((c) => {
          const on = picked === c.id;
          return (
            <button key={c.id} type="button" aria-pressed={on} aria-label={c.label} title={c.label}
              onClick={() => onPick(on ? null : c.id)}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 hover:bg-white
                         [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11">
              <span className={`h-5 w-5 rounded-full ${on ? 'ring-2 ring-tm-ink ring-offset-2 ring-offset-tm-bg' : ''}`}
                style={{ backgroundColor: PAINT[c.id].solid }} />
            </button>
          );
        })}
        <button type="button" aria-pressed={!picked} onClick={() => onPick(null)} title="고르지 않은 자동 색"
          className="ml-1 h-9 rounded-full px-3 text-[13px] font-bold text-tm-sub transition-colors duration-150 hover:bg-white
                     aria-pressed:bg-white aria-pressed:text-tm-ink aria-pressed:ring-1 aria-pressed:ring-inset aria-pressed:ring-tm-edge
                     [@media(pointer:coarse)]:h-11">
          자동
        </button>
      </div>
    </li>
  );
}

export function ColorDialog({ members, labels, picks, local, start, onPick, onClose }: {
  /** 색을 고를 팀원 - 승인 대기 중인 계정은 부르는 쪽이 뺀다 */
  members: Member[];
  /** 작업에 쓰인 라벨 */
  labels: string[];
  picks: ReadonlyMap<string, TaskColor>;
  /** 브라우저 저장 모드 */
  local: boolean;
  /** 처음 펼칠 쪽 - 지금 보는 색 기준 */
  start: ColorBy;
  onPick(key: string, color: TaskColor | null): void;
  onClose(): void;
}) {
  const [tab, setTab] = useState<'member' | 'label'>(start === 'label' ? 'label' : 'member');
  const paint = usePainter();

  return (
    <Modal
      title="색 바꾸기"
      sub={local ? '이 브라우저에만 저장됩니다' : '팀원 모두에게 같은 색이 보입니다'}
      onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
        </>
      }
    >
      <div role="group" aria-label="색을 고를 것" className="mb-3.5 flex gap-1.5">
        <button type="button" onClick={() => setTab('member')} aria-pressed={tab === 'member'} className={tmTab}>
          사람 {members.length}
        </button>
        <button type="button" onClick={() => setTab('label')} aria-pressed={tab === 'label'} className={tmTab}>
          라벨 {labels.length}
        </button>
      </div>

      {tab === 'member' ? (
        <ul className="flex flex-col gap-2">
          {members.map((m) => {
            const key = memberKey(m.id);
            return (
              <ColorRow key={m.id} name={m.name} picked={picks.get(key)} onPick={(c) => onPick(key, c)}>
                <Avatar id={m.id} size={28} />
                <span className="truncate text-[14.5px] font-semibold text-tm-ink">{m.name}</span>
                {m.role && <span className="truncate text-[13px] text-tm-sub">{m.role}</span>}
              </ColorRow>
            );
          })}
        </ul>
      ) : labels.length ? (
        <ul className="flex flex-col gap-2">
          {labels.map((l) => {
            const key = labelKey(l);
            const c = paint.label(l);
            return (
              <ColorRow key={l} name={l} picked={picks.get(key)} onPick={(next) => onPick(key, next)}>
                {/* 캘린더에서 보일 모양 */}
                <span className="min-w-0 truncate rounded-md py-1 pl-2.5 pr-2 text-[13.5px] font-semibold text-tm-ink"
                  style={{ backgroundColor: PAINT[c].tint, boxShadow: `inset 3px 0 0 ${PAINT[c].solid}` }}>
                  {l}
                </span>
              </ColorRow>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-tm-sm bg-tm-bg px-4 py-6 text-center text-[14.5px] text-tm-sub">
          아직 라벨을 단 작업이 없습니다. 작업 창에서 라벨을 달면 여기에 나옵니다.
        </p>
      )}

      <div className={`${tmCallout} mt-5`}>
        <p className="min-w-0">
          캘린더 · 타임라인에서 색 기준을 사람이나 라벨로 고르면 작업 바탕이 이 색으로 칠해집니다.
          라벨이 여럿인 작업은 첫 라벨의 색이고, 담당자 · 라벨이 없는 작업은 칠하지 않습니다.
          {tab === 'member' ? ' 아바타도 이 색입니다.' : ''}
        </p>
      </div>
    </Modal>
  );
}
