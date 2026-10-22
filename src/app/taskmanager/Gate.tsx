'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from './team';
import { tmBtn, tmBtnPrimary, tmInput, tmLabel } from './ui';

/*
 * 작업 관리 도구의 문 - 로그인 · 승인 대기 · 설정 안내.
 * 세종 리뉴얼 관리자의 안내 화면(Gate)과 같은 꼴: 회색 바탕 가운데 흰 카드, 로고, 굵은 제목.
 */

function GateCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // 휴대폰에서 자판이 올라와도 카드가 잘리지 않게 바깥이 스크롤한다
    <div className="h-[100dvh] overflow-y-auto bg-tm-bg text-[15.5px] leading-[1.6] text-tm-ink">
      <div className="flex min-h-full items-center justify-center p-6 max-[480px]:p-4">
        <div className="w-[min(440px,100%)] rounded-tm-lg border border-tm-line bg-white px-8 py-9 shadow-tm-up max-[480px]:px-5 max-[480px]:py-7">
          <div className="mb-[22px] flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="MATE" width={112} height={28} priority className="h-auto w-[112px]" />
            <span className="rounded-full bg-tm-tint px-[11px] py-[3px] text-[12.5px] font-bold text-tm-deep">작업 관리</span>
          </div>
          <h1 className="text-[22px] font-extrabold leading-[1.35] tracking-[-0.01em] text-tm-deep">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

const lead = 'mt-2.5 text-[15px] leading-[1.75] text-tm-ink';

export function LoadingScreen() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-tm-bg text-[15px] font-semibold text-tm-sub">
      불러오는 중…
    </div>
  );
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const err = await signIn(email, password);
    // 성공하면 이 화면이 통째로 사라진다(로그인 상태를 지켜보는 쪽이 작업 화면으로 바꾼다)
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <GateCard title="작업 관리 로그인">
      <p className="mt-1.5 text-[15px] text-tm-sub">MATE 팀원 계정으로 들어갑니다.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className={tmLabel} htmlFor="tm-login-email">이메일</label>
          <input id="tm-login-email" type="email" autoComplete="username" required className={tmInput}
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={tmLabel} htmlFor="tm-login-password">비밀번호</label>
          <input id="tm-login-password" type="password" autoComplete="current-password" required className={tmInput}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="rounded-tm-sm border border-tm-red/30 bg-tm-red-tint px-3.5 py-[11px] text-[14px] font-semibold leading-[1.55] text-tm-red-deep">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${tmBtnPrimary} mt-1 w-full`}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="mt-5 text-[13.5px] leading-[1.6] text-tm-sub">
        계정이 없거나 비밀번호를 잊었다면 관리자에게 요청해 주세요.
      </p>
      <Link href="/" className="mt-1.5 inline-block py-1 text-[13.5px] font-bold text-tm-blue underline underline-offset-[3px]">
        홈페이지로
      </Link>
    </GateCard>
  );
}

/** 로그인은 했지만 아직 승인되지 않았거나(pending), 팀원 목록에 줄이 없을 때(missing) */
export function PendingScreen({ email, missing, onSignOut }: { email: string; missing?: boolean; onSignOut(): void }) {
  return (
    <GateCard title={missing ? '팀원 목록에 이 계정이 없습니다' : '승인을 기다리고 있습니다'}>
      <p className={lead}>
        <b className="font-bold text-tm-deep">{email}</b> 계정으로 로그인했습니다.{' '}
        {missing
          ? '관리자가 Supabase 의 SQL Editor 에서 supabase/taskmanager.sql 을 한 번 더 실행하면 목록에 들어갑니다.'
          : '관리자가 작업 관리의 팀원 창에서 승인하면 이 화면이 저절로 바뀝니다. 첫 관리자 계정이라면 TASKMANAGER_SETUP.md 4단계의 SQL 로 승인합니다.'}
      </p>
      <button type="button" onClick={onSignOut} className={`${tmBtn} mt-[22px]`}>
        다른 계정으로 로그인
      </button>
    </GateCard>
  );
}

/** 표가 없거나(SQL 을 아직 실행하지 않았다) 불러오지 못했을 때 */
export function TroubleScreen({ kind, onRetry, onSignOut }: { kind: 'missing' | 'error'; onRetry(): void; onSignOut(): void }) {
  return (
    <GateCard title={kind === 'missing' ? 'Supabase 에 작업 관리 표가 아직 없습니다' : '팀원 목록을 불러오지 못했습니다'}>
      <p className={lead}>
        {kind === 'missing'
          ? 'Supabase 대시보드의 SQL Editor 에서 저장소의 supabase/taskmanager.sql 을 한 번 실행해 주세요. 자세한 절차는 TASKMANAGER_SETUP.md 에 있습니다.'
          : '인터넷 연결을 확인한 뒤 다시 시도해 주세요.'}
      </p>
      <div className="mt-[22px] flex flex-wrap gap-2.5">
        <button type="button" onClick={onRetry} className={tmBtnPrimary}>다시 확인</button>
        <button type="button" onClick={onSignOut} className={tmBtn}>로그아웃</button>
      </div>
    </GateCard>
  );
}
