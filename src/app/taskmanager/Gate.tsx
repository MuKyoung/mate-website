'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, signUp } from './team';
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
const switchLink = 'font-bold text-tm-blue underline underline-offset-[3px]';

function ErrorLine({ text }: { text: string }) {
  return (
    <p role="alert" className="rounded-tm-sm border border-tm-red/30 bg-tm-red-tint px-3.5 py-[11px] text-[14px] font-semibold leading-[1.55] text-tm-red-deep">
      {text}
    </p>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-tm-bg text-[15px] font-semibold text-tm-sub">
      불러오는 중…
    </div>
  );
}

/** 로그인 · 가입 요청. sent = 메일 인증을 켜 둔 프로젝트라 인증 메일을 보냈다 */
export function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup' | 'sent'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const go = (next: 'login' | 'signup') => {
    setMode(next);
    setError(null);
    setPassword('');
    setPassword2('');
  };

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

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) return setError('이름을 적어 주세요.');
    if (password.length < 8) return setError('비밀번호는 8자 이상으로 적어 주세요.');
    if (password !== password2) return setError('비밀번호 두 칸이 서로 다릅니다.');
    setBusy(true);
    setError(null);
    const res = await signUp(name, email, password);
    // 바로 로그인되면(in) 이 화면이 사라지고 승인 대기 화면이 뜬다
    if ('error' in res) {
      setError(res.error);
      setBusy(false);
    } else if (res.ok === 'confirm') {
      setBusy(false);
      setMode('sent');
    }
  };

  if (mode === 'sent') {
    return (
      <GateCard title="인증 메일을 보냈습니다">
        <p className={lead}>
          <b className="font-bold text-tm-deep">{email.trim()}</b> 로 보낸 메일의 링크를 누르면 가입 요청이 들어갑니다.
          관리자가 승인하면 작업 관리가 열립니다.
        </p>
        <button type="button" onClick={() => go('login')} className={`${tmBtn} mt-[22px]`}>
          로그인으로
        </button>
      </GateCard>
    );
  }

  if (mode === 'signup') {
    return (
      <GateCard title="가입 요청">
        <p className="mt-1.5 text-[15px] text-tm-sub">관리자가 승인하면 작업 관리를 쓸 수 있습니다.</p>
        <form onSubmit={request} className="mt-6 flex flex-col gap-4">
          <div>
            <label className={tmLabel} htmlFor="tm-join-name">이름</label>
            <input id="tm-join-name" autoComplete="name" required maxLength={40} className={tmInput}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={tmLabel} htmlFor="tm-join-email">이메일</label>
            <input id="tm-join-email" type="email" autoComplete="email" required className={tmInput}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={tmLabel} htmlFor="tm-join-password">비밀번호</label>
            <input id="tm-join-password" type="password" autoComplete="new-password" required minLength={8} className={tmInput}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1.5 text-[13px] text-tm-sub">8자 이상</p>
          </div>
          <div>
            <label className={tmLabel} htmlFor="tm-join-password2">비밀번호 한 번 더</label>
            <input id="tm-join-password2" type="password" autoComplete="new-password" required className={tmInput}
              value={password2} onChange={(e) => setPassword2(e.target.value)} />
          </div>
          {error && <ErrorLine text={error} />}
          <button type="submit" disabled={busy} className={`${tmBtnPrimary} mt-1 w-full`}>
            {busy ? '보내는 중…' : '가입 요청 보내기'}
          </button>
        </form>
        <p className="mt-5 text-[13.5px] leading-[1.6] text-tm-sub">
          이미 계정이 있다면{' '}
          <button type="button" onClick={() => go('login')} className={switchLink}>로그인</button>
        </p>
      </GateCard>
    );
  }

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
        {error && <ErrorLine text={error} />}
        <button type="submit" disabled={busy} className={`${tmBtnPrimary} mt-1 w-full`}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <button type="button" onClick={() => go('signup')} className={`${tmBtn} mt-3 w-full`}>
        가입 요청
      </button>
      <p className="mt-5 text-[13.5px] leading-[1.6] text-tm-sub">
        비밀번호를 잊었다면 관리자에게 요청해 주세요.
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
          ? '가입 요청이 거절되었을 수 있습니다. 다시 요청하려면 로그아웃한 뒤 가입 요청을 보내 주세요.'
          : '가입 요청이 들어갔습니다. 관리자가 팀원 창에서 승인하면 이 화면이 저절로 바뀝니다.'}
      </p>
      <button type="button" onClick={onSignOut} className={`${tmBtn} mt-[22px]`}>
        {missing ? '로그아웃' : '다른 계정으로 로그인'}
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
