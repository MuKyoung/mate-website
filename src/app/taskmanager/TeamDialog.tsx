'use client';

import { useState } from 'react';
import type { Member } from './types';
import { changePassword, type MemberPatch } from './team';
import {
  Avatar, Modal, useConfirm,
  tmBtn, tmCallout, tmEditBtn, tmGhostBtn, tmGhostDanger, tmInput, tmLabel,
} from './ui';

/*
 * 팀원 창 - Supabase 모드에서 내 계정 블록을 누르면 열린다.
 * 내 이름 · 역할 고치기, 비밀번호 바꾸기. 관리자는 가입 요청 승인 · 거절, 승인 취소, 관리자 지정도 한다.
 * 규칙은 DB 가 지킨다(관리자만 남의 승인을 바꾸고, 자기 것은 못 바꾸고, 마지막 관리자는 내릴 수 없다).
 */

const section = 'mt-7 border-t border-tm-line pt-6';
const heading = 'mb-3.5 text-[16.5px] font-extrabold text-tm-deep';
const okLine = 'text-[13.5px] font-semibold text-tm-ok-deep';
const errLine = 'text-[13.5px] font-semibold text-tm-red-deep';

export function TeamDialog({
  me, members, recovery, onUpdate, onReject, onClose,
}: {
  me: Member;
  members: Member[];
  /** 비밀번호 재설정 링크로 들어왔다 - 새 비밀번호 칸부터 연다 */
  recovery?: boolean;
  onUpdate(id: string, patch: MemberPatch): Promise<string | null>;
  /** 승인 대기 계정을 계정째 지운다 */
  onReject(id: string): Promise<string | null>;
  onClose(): void;
}) {
  const [confirm, confirmNode] = useConfirm();
  const admin = me.isAdmin === true;

  const [name, setName] = useState(me.name);
  const [role, setRole] = useState(me.role);
  const [profile, setProfile] = useState<{ busy?: boolean; ok?: string; err?: string }>({});
  const changed = name.trim() !== me.name || role.trim() !== me.role;

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pass, setPass] = useState<{ busy?: boolean; ok?: string; err?: string }>({});

  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowErr, setRowErr] = useState<string | null>(null);

  const saveProfile = async () => {
    if (!name.trim()) return setProfile({ err: '이름을 적어 주세요.' });
    setProfile({ busy: true });
    // 아바타 글자는 이름에서 다시 만든다
    const err = await onUpdate(me.id, { name: name.trim(), role: role.trim(), initial: '' });
    setProfile(err ? { err } : { ok: '저장했습니다.' });
  };

  const savePassword = async () => {
    if (pw.length < 8) return setPass({ err: '8자 이상으로 적어 주세요.' });
    if (pw !== pw2) return setPass({ err: '두 칸이 서로 다릅니다.' });
    setPass({ busy: true });
    const err = await changePassword(pw);
    if (err) return setPass({ err });
    setPw('');
    setPw2('');
    setPass({ ok: '바꿨습니다. 다음 로그인부터 새 비밀번호를 씁니다.' });
  };

  const setActive = async (m: Member, active: boolean) => {
    if (!active) {
      const yes = await confirm({
        title: '승인을 취소할까요?',
        body: (
          <>
            <b>{m.name}</b> 님은 바로 작업과 문서를 볼 수 없게 됩니다.
            {m.isAdmin ? ' 관리자에서도 빠지고, 다시 승인해도 관리자는 따로 정해야 합니다.' : ' 다시 승인하면 그대로 돌아옵니다.'}
          </>
        ),
        ok: '승인 취소',
        tone: 'danger',
      });
      if (!yes) return;
    }
    setRowBusy(m.id);
    setRowErr(null);
    const err = await onUpdate(m.id, { active });
    if (err) setRowErr(err);
    setRowBusy(null);
  };

  const reject = async (m: Member) => {
    const yes = await confirm({
      title: '가입 요청을 거절할까요?',
      body: (
        <>
          <b>{m.name}</b> 님({m.email})의 계정을 지웁니다. 같은 메일로 다시 가입 요청을 보낼 수 있습니다.
        </>
      ),
      ok: '거절',
      tone: 'danger',
    });
    if (!yes) return;
    setRowBusy(m.id);
    setRowErr(null);
    const err = await onReject(m.id);
    if (err) setRowErr(err);
    setRowBusy(null);
  };

  const setAdmin = async (m: Member, isAdmin: boolean) => {
    if (isAdmin) {
      const yes = await confirm({
        title: '관리자로 정할까요?',
        body: (
          <>
            <b>{m.name}</b> 님도 새 계정을 승인하고, 승인을 취소하고, 관리자를 정할 수 있게 됩니다.
          </>
        ),
        ok: '관리자로 정하기',
      });
      if (!yes) return;
    }
    setRowBusy(m.id);
    setRowErr(null);
    const err = await onUpdate(m.id, { is_admin: isAdmin });
    if (err) setRowErr(err);
    setRowBusy(null);
  };

  // 승인 대기를 맨 위로, 나머지는 이름 순
  const list = members.slice().sort((a, b) =>
    Number(a.active !== false) - Number(b.active !== false) || a.name.localeCompare(b.name, 'ko'));

  return (
    <>
      <Modal
        title="팀원"
        onClose={onClose}
        foot={
          <>
            <span className="flex-1" />
            <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          </>
        }
      >
        {/* ── 내 정보 ── */}
        <h3 className={heading}>내 정보</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-[18px] max-[480px]:grid-cols-1">
          <div>
            <label className={tmLabel} htmlFor="tm-me-name">이름</label>
            <input id="tm-me-name" className={tmInput} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={tmLabel} htmlFor="tm-me-role">역할</label>
            <input id="tm-me-role" className={tmInput} placeholder="예: 웹 개발, PM" value={role}
              onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <p className="mt-2.5 text-[13.5px] text-tm-sub">로그인 메일 {me.email}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void saveProfile()} disabled={!changed || profile.busy} className={tmGhostBtn}>
            {profile.busy ? '저장 중…' : '내 정보 저장'}
          </button>
          {profile.ok && !changed && <span className={okLine}>{profile.ok}</span>}
          {profile.err && <span role="alert" className={errLine}>{profile.err}</span>}
        </div>

        {/* ── 비밀번호 ── */}
        <div className={section}>
          <h3 className={heading}>비밀번호 바꾸기</h3>
          {recovery && (
            <div className={`${tmCallout} mb-4`}>
              <p className="min-w-0">비밀번호 재설정 링크로 들어왔습니다. 새 비밀번호를 정해 주세요.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-[18px] max-[480px]:grid-cols-1">
            <div>
              <label className={tmLabel} htmlFor="tm-pw">새 비밀번호</label>
              <input id="tm-pw" type="password" autoComplete="new-password" className={tmInput} autoFocus={recovery}
                value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>
            <div>
              <label className={tmLabel} htmlFor="tm-pw2">한 번 더</label>
              <input id="tm-pw2" type="password" autoComplete="new-password" className={tmInput}
                value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
          </div>
          <p className="mt-2.5 text-[13px] leading-[1.6] text-tm-sub">8자 이상. 관리자가 처음 정해 준 비밀번호는 여기서 바꿔 주세요.</p>
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void savePassword()} disabled={!pw || !pw2 || pass.busy} className={tmGhostBtn}>
              {pass.busy ? '바꾸는 중…' : '비밀번호 바꾸기'}
            </button>
            {pass.ok && <span className={okLine}>{pass.ok}</span>}
            {pass.err && <span role="alert" className={errLine}>{pass.err}</span>}
          </div>
        </div>

        {/* ── 팀원 목록 ── */}
        <div className={section}>
          <h3 className={heading}>
            팀원 <span className="ml-1 text-[14px] font-semibold text-tm-sub">{members.length}명</span>
          </h3>
          {rowErr && <p role="alert" className={`${errLine} mb-3`}>{rowErr}</p>}
          <ul className="flex flex-col gap-2">
            {list.map((m) => {
              const pending = m.active === false;
              const busy = rowBusy === m.id;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-tm-sm bg-tm-bg px-3.5 py-3">
                  <Avatar id={m.id} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-tm-ink">
                      {m.name}
                      {m.id === me.id && <span className="ml-1.5 text-[13px] font-semibold text-tm-sub">나</span>}
                      {m.isAdmin && <span className="ml-1.5 text-[13px] font-semibold text-tm-blue">관리자</span>}
                      {m.domainEditor && <span className="ml-1.5 text-[13px] font-semibold text-tm-blue">영역 관리</span>}
                    </p>
                    <p className="truncate text-[13px] text-tm-sub">{[m.role, m.email].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className={`inline-flex h-[28px] items-center rounded-full px-3 text-[12.5px] font-bold ${
                    pending ? 'bg-tm-red-tint text-tm-red-deep' : 'bg-tm-ok-tint text-tm-ok-deep'}`}>
                    {pending ? '승인 대기' : '승인됨'}
                  </span>
                  {admin && m.id !== me.id && (
                    pending ? (
                      <>
                        <button type="button" onClick={() => void setActive(m, true)} disabled={busy} className={tmEditBtn}>
                          {busy ? '처리 중…' : '승인'}
                        </button>
                        <button type="button" onClick={() => void reject(m)} disabled={busy} className={tmGhostDanger}>
                          거절
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => void setAdmin(m, !m.isAdmin)} disabled={busy} className={tmGhostBtn}>
                          {m.isAdmin ? '관리자 해제' : '관리자로'}
                        </button>
                        <button type="button" onClick={() => void setActive(m, false)} disabled={busy} className={tmGhostDanger}>
                          승인 취소
                        </button>
                      </>
                    )
                  )}
                </li>
              );
            })}
          </ul>
          <div className={`${tmCallout} mt-4`}>
            <p className="min-w-0">
              새 팀원이 로그인 화면에서 <b className="font-bold text-tm-deep">가입 요청</b>을 보내면 여기에 승인 대기로 나타납니다.
              {admin ? ' 모르는 사람이면 거절합니다.' : ' 승인과 거절은 관리자가 합니다.'}
            </p>
          </div>
        </div>
      </Modal>
      {confirmNode}
    </>
  );
}
