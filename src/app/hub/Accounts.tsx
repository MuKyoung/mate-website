'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMembers } from './members';
import { localDay } from './types';
import {
  Avatar, IconLock, IconPlus, IconSearch, Modal, PageHead, useConfirm,
  tmBtn, tmBtnPrimary, tmCard, tmFieldBase, tmGhostBtn, tmGhostDanger, tmIconBtnSm, tmInput, tmLabel, tmTextarea,
} from './ui';
import {
  LOGIN_MAX, MISSING_TEXT, NOTE_MAX, PASSWORD_MAX, SERVICE_MAX, URL_MAX, useAccountStore,
  type AccountAction, type AccountInput, type AccountLogEntry, type AccountStore, type SharedAccount,
} from './accountStore';

/*
 * 팀 › 공용계정 - 팀이 같이 쓰는 서비스 계정의 아이디 · 비밀번호를 모아 둔다.
 * 비밀번호는 가려 두고 '보기'(잠깐 보여 주고 다시 가림) · '복사'로만 꺼낸다. 꺼낼 때마다 DB 가 누가 했는지 남기고
 * '기록'에서 본다. 승인된 팀원은 모두 등록 · 고치고, '관리자만' 계정은 관리자에게만 보인다(accountStore.ts).
 */

/** 비밀번호를 보여 두는 시간 - 지나면 다시 가린다 */
const SHOW_MS = 30_000;

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
function IconEye({ off = false, size = 16 }: { off?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...stroke}>
      <path d="M1.8 10s3-5.6 8.2-5.6 8.2 5.6 8.2 5.6-3 5.6-8.2 5.6S1.8 10 1.8 10z" />
      <circle cx="10" cy="10" r="2.6" />
      {off && <path d="M3.5 16.5l13-13" />}
    </svg>
  );
}
function IconCopy({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...stroke}>
      <rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </svg>
  );
}
function IconPen({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...stroke}>
      <path d="M13.5 3.5l3 3L7 16H4v-3z" /><path d="M11.5 5.5l3 3" />
    </svg>
  );
}
function IconHistory({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...stroke}>
      <path d="M3.2 10a6.8 6.8 0 1 0 2-4.8" /><path d="M3 3.5v3.2h3.2" /><path d="M10 6.5V10l2.5 1.8" />
    </svg>
  );
}
function IconOut({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...stroke}>
      <path d="M11 3.5h5.5V9" /><path d="M16.5 3.5L9 11" /><path d="M14 12.5v3a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 3 15.5v-8A1.5 1.5 0 0 1 4.5 6h3" />
    </svg>
  );
}

/** 3분 전 · 어제 · 2026-10-02 */
function ago(stamp: string, now = Date.now()): string {
  const t = Date.parse(stamp);
  if (Number.isNaN(t)) return localDay(stamp);
  const s = Math.max(0, (now - t) / 1000);
  if (s < 60) return '방금';
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  if (s < 86400 * 2) return '어제';
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}일 전`;
  return localDay(stamp);
}
const fullTime = (stamp: string) => {
  const d = new Date(stamp);
  return Number.isNaN(d.getTime()) ? stamp : d.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
};

/** 링크로 열 주소 - http(s) 만 */
const safeHref = (url: string) => (/^https?:\/\/[^\s]+$/i.test(url) ? url : null);
function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}
/** 'figma.com' 처럼 적으면 https:// 를 붙인다 */
function normalizeUrl(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
}

/** 화면에 그대로 보일 실패 문구 */
class Shown extends Error {}

/**
 * 받아 와야 하는 글(비밀번호)을 복사한다. Safari 는 누른 그 순간에 클립보드를 잡아야 해서
 * ClipboardItem 에 받을 약속을 넘기고, 그것이 안 되는 브라우저는 받은 뒤 writeText 로 한다. 받기는 한 번만 한다(기록이 두 번 남지 않게)
 */
async function copyFetched(get: () => Promise<string>): Promise<void> {
  let once: Promise<string> | null = null;
  const value = () => (once ??= get());
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': value().then((t) => new Blob([t], { type: 'text/plain' })) })]);
      return;
    } catch {
      // 받기가 실패했으면 그 문구를 그대로 올린다
      if (once) await once;
    }
  }
  await navigator.clipboard.writeText(await value());
}

export default function Accounts({ me, admin, onNotice }: {
  me: string;
  /** 관리자 - '관리자만' 계정을 보고 정하며, 남이 등록한 계정도 지운다 */
  admin: boolean;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
}) {
  const store: AccountStore = useAccountStore();
  const members = useMembers();
  const nameOf = useCallback((id: string | null) => {
    if (!id) return '알 수 없음';
    return members.find((m) => m.id === id)?.name ?? '지난 팀원';
  }, [members]);

  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return store.list;
    return store.list.filter((a) => [a.service, a.url, a.login, a.note].some((t) => t.toLowerCase().includes(q)));
  }, [query, store.list]);

  const [editing, setEditing] = useState<{ account: SharedAccount | null } | null>(null);
  const [logOf, setLogOf] = useState<{ account: SharedAccount | null } | null>(null);
  const [confirm, confirmNode] = useConfirm();

  /* ── 보이는 비밀번호 - 잠깐만 ── */
  const [revealed, setRevealed] = useState<Map<string, string>>(() => new Map());
  const timers = useRef(new Map<string, number>());
  const [busy, setBusy] = useState<string | null>(null);
  const hide = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) window.clearTimeout(t);
    timers.current.delete(id);
    setRevealed((m) => {
      if (!m.has(id)) return m;
      const n = new Map(m);
      n.delete(id);
      return n;
    });
  }, []);
  const hideAll = useCallback(() => {
    for (const t of timers.current.values()) window.clearTimeout(t);
    timers.current.clear();
    setRevealed((m) => (m.size ? new Map() : m));
  }, []);
  useEffect(() => {
    // 다른 탭 · 앱으로 가면 보이던 비밀번호를 가린다
    const onVis = () => { if (document.visibilityState === 'hidden') hideAll(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      hideAll();
    };
  }, [hideAll]);
  // 비밀번호가 바뀌었거나 목록에서 빠진 계정은 보이던 값을 버린다
  const stamps = useRef(new Map<string, string | null>());
  useEffect(() => {
    const now = new Map(store.list.map((a) => [a.id, a.passwordAt]));
    for (const id of revealed.keys()) {
      if (!now.has(id) || now.get(id) !== stamps.current.get(id)) hide(id);
    }
    stamps.current = now;
  }, [store.list, revealed, hide]);

  const reveal = async (a: SharedAccount) => {
    if (revealed.has(a.id)) {
      hide(a.id);
      return;
    }
    setBusy(`${a.id}:view`);
    const r = await store.secret(a.id, false);
    setBusy(null);
    if ('error' in r) {
      onNotice(r.error, 'err');
      return;
    }
    const value = r.value;
    if (value === null) {
      onNotice('저장된 비밀번호가 없습니다', 'err');
      void store.reload();
      return;
    }
    stamps.current.set(a.id, a.passwordAt);
    setRevealed((m) => new Map(m).set(a.id, value));
    timers.current.set(a.id, window.setTimeout(() => hide(a.id), SHOW_MS));
  };

  const copyPassword = async (a: SharedAccount) => {
    setBusy(`${a.id}:copy`);
    try {
      await copyFetched(async () => {
        const r = await store.secret(a.id, true);
        if ('error' in r) throw new Shown(r.error);
        if (r.value === null) throw new Shown('저장된 비밀번호가 없습니다');
        return r.value;
      });
      onNotice(`${a.service} 비밀번호를 복사했습니다`);
    } catch (e) {
      onNotice(e instanceof Shown ? e.message : '클립보드에 복사하지 못했습니다. 보기를 눌러 직접 옮겨 주세요.', 'err');
    } finally {
      setBusy(null);
    }
  };

  const copyLogin = async (a: SharedAccount) => {
    try {
      await navigator.clipboard.writeText(a.login);
      onNotice(`${a.service} 아이디를 복사했습니다`);
    } catch {
      onNotice('클립보드에 복사하지 못했습니다', 'err');
    }
  };

  const remove = async (a: SharedAccount): Promise<boolean> => {
    const ok = await confirm({
      title: `'${a.service}' 계정을 지울까요?`,
      body: '아이디 · 비밀번호 · 메모가 모두 지워지고 되돌릴 수 없습니다. 지웠다는 기록은 남습니다.',
      ok: '지우기',
      tone: 'danger',
    });
    if (!ok) return false;
    const err = await store.remove(a.id);
    if (err) {
      onNotice(err, 'err');
      return false;
    }
    hide(a.id);
    onNotice(`'${a.service}' 계정을 지웠습니다`);
    return true;
  };

  const ready = store.status === 'ready';
  const searchId = useId();

  let body: React.ReactNode;
  if (store.status === 'local') {
    body = (
      <Notice title="팀 저장소에 연결된 Hub 에서만 씁니다">
        이 Hub 는 이 브라우저에만 저장하는 모드라 비밀번호를 안전하게 보관할 수 없어 공용계정을 꺼 두었습니다.
      </Notice>
    );
  } else if (store.status === 'loading') {
    body = <Notice title="공용계정을 읽는 중…" />;
  } else if (store.status === 'missing') {
    body = <Notice title="공용계정 표 설정 전입니다">{MISSING_TEXT}</Notice>;
  } else if (store.status === 'error') {
    body = (
      <Notice title="공용계정을 읽지 못했습니다">
        {store.message}
        <button type="button" onClick={() => void store.reload()} className={`${tmBtn} mt-5`}>다시 읽기</button>
      </Notice>
    );
  } else if (store.list.length === 0) {
    body = (
      <Notice title="아직 등록한 공용계정이 없습니다">
        팀이 같이 쓰는 서비스의 아이디와 비밀번호를 등록해 두면 팀원 모두가 여기서 보고 복사합니다.
        <button type="button" onClick={() => setEditing({ account: null })} className={`${tmBtnPrimary} mt-5`}>
          <IconPlus /> 첫 계정 등록
        </button>
      </Notice>
    );
  } else {
    body = (
      <div className="tm-fill flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex flex-none flex-wrap items-center gap-3">
          <label htmlFor={searchId} className="sr-only">공용계정 찾기</label>
          <div className="relative w-[min(360px,100%)]">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch /></span>
            <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="서비스 · 아이디 · 메모로 찾기" autoComplete="off"
              className={`${tmFieldBase} h-11 w-full pl-11 pr-3.5 text-[15px]`} />
          </div>
          <p className="text-[14px] text-tm-sub" aria-live="polite">
            {query.trim() ? `${shown.length} / ${store.list.length}개` : `${store.list.length}개`}
          </p>
        </div>
        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">
          {shown.length === 0 ? (
            <p className="py-16 text-center text-[15px] text-tm-sub">찾는 계정이 없습니다.</p>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-4" aria-label="공용계정 목록">
              {shown.map((a) => (
                <AccountCard key={a.id} a={a} nameOf={nameOf}
                  shown={revealed.get(a.id) ?? null}
                  busy={busy?.startsWith(`${a.id}:`) ? (busy.endsWith(':view') ? 'view' : 'copy') : null}
                  onReveal={() => void reveal(a)} onCopyPassword={() => void copyPassword(a)} onCopyLogin={() => void copyLogin(a)}
                  onEdit={() => setEditing({ account: a })} onLog={() => setLogOf({ account: a })} />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title="공용계정"
        lead="팀이 같이 쓰는 서비스 계정의 아이디와 비밀번호입니다. 비밀번호는 암호화해 보관하고, 보거나 복사할 때마다 누가 했는지 기록에 남습니다."
        saved={store.status === 'missing' ? { tone: 'warn', text: '공용계정 표 설정 전' }
          : store.status === 'error' ? { tone: 'warn', text: '공용계정을 읽지 못했습니다' } : undefined}
      >
        {ready && admin && (
          <button type="button" onClick={() => setLogOf({ account: null })} className={`${tmGhostBtn} h-[46px]`}>
            <IconHistory /> 전체 기록
          </button>
        )}
        {ready && (
          <button type="button" onClick={() => setEditing({ account: null })} className={tmBtnPrimary}>
            <IconPlus /> 계정 추가
          </button>
        )}
      </PageHead>

      {body}

      {editing && (
        <AccountEditor
          account={editing.account}
          admin={admin}
          nameOf={nameOf}
          canRemove={!!editing.account && (admin || editing.account.createdBy === me)}
          onSave={async (input) => {
            const r = await store.save(editing.account?.id ?? null, input);
            if ('error' in r) return r.error;
            if (editing.account) hide(editing.account.id);
            onNotice(editing.account ? `'${input.service}' 계정을 고쳤습니다` : `'${input.service}' 계정을 등록했습니다`);
            setEditing(null);
            return null;
          }}
          onRemove={async () => {
            if (editing.account && await remove(editing.account)) setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {logOf && <AccountLog account={logOf.account} store={store} nameOf={nameOf} onClose={() => setLogOf(null)} />}
      {confirmNode}
    </>
  );
}

/** 목록 자리를 채우는 안내(읽는 중 · 표 없음 · 빈 목록) */
function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className={`${tmCard} tm-fill flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center`}>
      <p className="text-[17px] font-bold text-tm-deep">{title}</p>
      {children && <div className="mt-2 flex max-w-[520px] flex-col items-center text-[15px] leading-[1.7] text-tm-sub">{children}</div>}
    </div>
  );
}

function AccountCard({ a, nameOf, shown, busy, onReveal, onCopyPassword, onCopyLogin, onEdit, onLog }: {
  a: SharedAccount;
  nameOf(id: string | null): string;
  /** 보기로 꺼낸 비밀번호 - 가려 둔 동안은 null */
  shown: string | null;
  busy: 'view' | 'copy' | null;
  onReveal(): void;
  onCopyPassword(): void;
  onCopyLogin(): void;
  onEdit(): void;
  onLog(): void;
}) {
  const href = safeHref(a.url);
  return (
    <li className={`${tmCard} flex min-w-0 flex-col p-5 max-[720px]:p-4`}>
      <div className="flex items-start gap-3">
        <span aria-hidden
          className="grid h-10 w-10 flex-none place-items-center rounded-tm-sm bg-tm-tint text-[17px] font-extrabold text-tm-deep">
          {Array.from(a.service.trim())[0]?.toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[17px] font-bold leading-[1.35] text-tm-deep" title={a.service}>{a.service}</h2>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer"
              className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[13.5px] font-semibold text-tm-blue hover:underline">
              <span className="truncate">{hostOf(href)}</span><IconOut />
            </a>
          ) : a.url ? (
            <p className="mt-0.5 truncate text-[13.5px] text-tm-sub">{a.url}</p>
          ) : null}
        </div>
        {a.adminOnly && (
          <span className="inline-flex flex-none items-center gap-1 rounded-full bg-tm-warn-tint px-2.5 py-1 text-[12.5px] font-bold text-tm-warn"
            title="관리자에게만 보이는 계정">
            <IconLock size={12} /> 관리자만
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-2">
        <div className="flex min-h-[40px] items-center gap-2 rounded-tm-sm bg-tm-bg py-1 pl-3 pr-1">
          <dt className="w-[60px] flex-none text-[13px] font-bold text-tm-sub">아이디</dt>
          <dd className="flex min-w-0 flex-1 items-center gap-1">
            {a.login ? (
              <>
                <span className="tm-mono min-w-0 flex-1 truncate text-[14.5px] text-tm-ink" title={a.login}>{a.login}</span>
                <button type="button" onClick={onCopyLogin} className={tmIconBtnSm} aria-label={`${a.service} 아이디 복사`} title="아이디 복사">
                  <IconCopy />
                </button>
              </>
            ) : <span className="text-[14px] text-tm-sub">적지 않음</span>}
          </dd>
        </div>
        <div className="flex min-h-[40px] items-center gap-2 rounded-tm-sm bg-tm-bg py-1 pl-3 pr-1">
          <dt className="w-[60px] flex-none text-[13px] font-bold text-tm-sub">비밀번호</dt>
          <dd className="flex min-w-0 flex-1 items-center gap-1">
            {a.hasPassword ? (
              <>
                {shown !== null ? (
                  <span className="tm-mono min-w-0 flex-1 select-all break-all text-[14.5px] text-tm-ink">{shown}</span>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-[14px] tracking-[0.18em] text-tm-sub" aria-label="가려 둔 비밀번호">●●●●●●●●</span>
                )}
                <button type="button" onClick={onReveal} disabled={busy !== null} className={`${tmIconBtnSm} disabled:opacity-40`}
                  aria-label={shown !== null ? `${a.service} 비밀번호 가리기` : `${a.service} 비밀번호 보기`}
                  aria-pressed={shown !== null} title={shown !== null ? '가리기' : '보기(30초 뒤 다시 가림)'}>
                  {busy === 'view' ? <Spinner /> : <IconEye off={shown !== null} />}
                </button>
                <button type="button" onClick={onCopyPassword} disabled={busy !== null} className={`${tmIconBtnSm} disabled:opacity-40`}
                  aria-label={`${a.service} 비밀번호 복사`} title="비밀번호 복사">
                  {busy === 'copy' ? <Spinner /> : <IconCopy />}
                </button>
              </>
            ) : <span className="text-[14px] text-tm-sub">저장하지 않음</span>}
          </dd>
        </div>
      </dl>

      {a.note && (
        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.6] text-tm-ink [overflow-wrap:anywhere]">{a.note}</p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] text-tm-sub" title={fullTime(a.updatedAt)}>
          <Avatar id={a.updatedBy} size={20} />
          <span className="truncate">{nameOf(a.updatedBy)} · {ago(a.updatedAt)}</span>
        </p>
        <button type="button" onClick={onLog} className={tmGhostBtn} aria-label={`${a.service} 기록`}>
          <IconHistory /> 기록
        </button>
        <button type="button" onClick={onEdit} className={tmGhostBtn} aria-label={`${a.service} 고치기`}>
          <IconPen /> 고치기
        </button>
      </div>
    </li>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-tm-line border-t-tm-blue" aria-label="꺼내는 중" />;
}

type PwMode = 'keep' | 'change' | 'clear';

function AccountEditor({ account, admin, nameOf, canRemove, onSave, onRemove, onClose }: {
  account: SharedAccount | null;
  admin: boolean;
  nameOf(id: string | null): string;
  canRemove: boolean;
  /** 실패하면 문구, 성공하면 null(창은 부르는 쪽이 닫는다) */
  onSave(input: AccountInput): Promise<string | null>;
  onRemove(): Promise<void>;
  onClose(): void;
}) {
  const id = useId();
  const [service, setService] = useState(account?.service ?? '');
  const [url, setUrl] = useState(account?.url ?? '');
  const [login, setLogin] = useState(account?.login ?? '');
  const [note, setNote] = useState(account?.note ?? '');
  const [adminOnly, setAdminOnly] = useState(account?.adminOnly ?? false);
  /** 저장된 비밀번호가 있을 때만 keep · clear 가 있다 */
  const [mode, setMode] = useState<PwMode>(account?.hasPassword ? 'keep' : 'change');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const submit = async () => {
    if (busy) return;
    const name = service.trim();
    if (!name) {
      setMissing(true);
      setError('서비스 이름을 적어 주세요.');
      return;
    }
    const link = normalizeUrl(url);
    if (link && !safeHref(link)) {
      setError('주소는 http:// 나 https:// 로 시작하는 웹 주소로 적어 주세요.');
      return;
    }
    const password = mode === 'clear' ? '' : mode === 'change' && pw !== '' ? pw : null;
    setBusy(true);
    setError(null);
    const err = await onSave({ service: name, url: link, login: login.trim(), note, adminOnly, password });
    setBusy(false);
    if (err) setError(err);
  };

  const remove = async () => {
    setBusy(true);
    await onRemove();
    setBusy(false);
  };

  const pwField = (
    <div className="relative">
      {/* 비밀번호 칸(type=password)으로 두면 브라우저가 이것을 Hub 로그인 비밀번호로 저장하려 든다 - 글자 칸을 가려서 쓴다 */}
      <input id={`${id}-pw`} type="text" value={pw} onChange={(e) => setPw(e.target.value)} maxLength={PASSWORD_MAX}
        autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} data-1p-ignore data-lpignore="true" data-form-type="other"
        placeholder={account?.hasPassword ? '새 비밀번호' : '비밀번호(비워 두면 저장하지 않음)'}
        className={`${tmInput} tm-mono pr-12 ${showPw ? '' : '[-webkit-text-security:disc]'}`} />
      <button type="button" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}
        aria-label={showPw ? '비밀번호 가리기' : '적은 비밀번호 보기'}
        className={`${tmIconBtnSm} absolute right-1.5 top-1/2 -translate-y-1/2`}>
        <IconEye off={showPw} />
      </button>
    </div>
  );

  return (
    <Modal
      title={account ? '공용계정 고치기' : '공용계정 등록'}
      sub={account ? account.service : '팀원 모두가 보고 복사할 수 있습니다'}
      busy={busy}
      onClose={onClose}
      foot={(
        <>
          {account && canRemove && (
            <button type="button" onClick={() => void remove()} disabled={busy} className={`${tmGhostDanger} h-[46px]`}>지우기</button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={onClose} disabled={busy} className={tmBtn}>취소</button>
            <button type="button" onClick={() => void submit()} disabled={busy} className={tmBtnPrimary}>
              {busy ? '저장하는 중…' : account ? '저장' : '등록'}
            </button>
          </div>
        </>
      )}
    >
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void submit(); }} autoComplete="off"
        onKeyDown={(e) => {
          // 한 줄 칸에서 Enter 로 저장(메모 칸은 줄바꿈, 한글 조합 중은 그대로)
          if (e.key !== 'Enter' || e.nativeEvent.isComposing || !(e.target instanceof HTMLInputElement) || e.target.type === 'checkbox') return;
          e.preventDefault();
          void submit();
        }}>
        <div>
          <label htmlFor={`${id}-svc`} className={tmLabel}>서비스 이름 <span className="text-tm-red">*</span></label>
          <input id={`${id}-svc`} value={service} maxLength={SERVICE_MAX} autoFocus={!account} autoComplete="off"
            aria-invalid={missing && !service.trim()} onChange={(e) => { setService(e.target.value); setMissing(false); }}
            placeholder="예: Figma, 네이버 웍스, 앱스토어 커넥트" className={tmInput} />
        </div>
        <div>
          <label htmlFor={`${id}-url`} className={tmLabel}>로그인 주소</label>
          <input id={`${id}-url`} value={url} maxLength={URL_MAX} autoComplete="off" inputMode="url" spellCheck={false}
            onChange={(e) => setUrl(e.target.value)} placeholder="https://" className={tmInput} />
        </div>
        <div>
          <label htmlFor={`${id}-login`} className={tmLabel}>아이디</label>
          <input id={`${id}-login`} value={login} maxLength={LOGIN_MAX} spellCheck={false} autoCapitalize="off" autoCorrect="off"
            autoComplete="off" data-1p-ignore data-lpignore="true" data-form-type="other"
            onChange={(e) => setLogin(e.target.value)} placeholder="아이디 또는 메일" className={`${tmInput} tm-mono`} />
        </div>
        <div>
          <label htmlFor={`${id}-pw`} className={tmLabel}>비밀번호</label>
          {account?.hasPassword && mode !== 'change' ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-tm-sm border border-tm-line bg-tm-bg px-3.5 py-2.5">
              <p className="min-w-0 flex-1 text-[14px] leading-[1.6] text-tm-ink">
                {mode === 'clear' ? (
                  <b className="font-bold text-tm-red">저장하면 비밀번호를 지웁니다.</b>
                ) : (
                  <>저장된 비밀번호가 있습니다{account.passwordAt ? ` · ${nameOf(account.passwordBy)}, ${ago(account.passwordAt)}` : ''}</>
                )}
              </p>
              {mode === 'clear' ? (
                <button type="button" onClick={() => setMode('keep')} className={tmGhostBtn}>그대로 두기</button>
              ) : (
                <>
                  <button type="button" onClick={() => { setMode('change'); setPw(''); }} className={tmGhostBtn}>바꾸기</button>
                  <button type="button" onClick={() => setMode('clear')} className={tmGhostDanger}>지우기</button>
                </>
              )}
            </div>
          ) : (
            <>
              {pwField}
              {account?.hasPassword && (
                <button type="button" onClick={() => { setMode('keep'); setPw(''); }} className={`${tmGhostBtn} mt-2`}>바꾸지 않기</button>
              )}
            </>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-note`} className={tmLabel}>메모</label>
          <textarea id={`${id}-note`} value={note} maxLength={NOTE_MAX} rows={3} onChange={(e) => setNote(e.target.value)}
            placeholder="2단계 인증 받는 사람, 결제 카드, 쓰는 곳 같은 것" className={tmTextarea} />
        </div>
        {admin && (
          <label className="flex cursor-pointer items-start gap-3 rounded-tm-sm border border-tm-line px-3.5 py-3">
            <input type="checkbox" checked={adminOnly} onChange={(e) => setAdminOnly(e.target.checked)}
              className="mt-[3px] h-[18px] w-[18px] flex-none accent-[rgb(var(--tm-blue))]" />
            <span className="text-[14.5px] leading-[1.6] text-tm-ink">
              <b className="font-bold">관리자만 보기</b>
              <span className="block text-[13.5px] text-tm-sub">관리자가 아닌 팀원의 목록에는 나오지 않고 비밀번호도 꺼낼 수 없습니다.</span>
            </span>
          </label>
        )}
        {error && <p role="alert" className="text-[14px] font-semibold leading-[1.5] text-tm-red-deep">{error}</p>}
      </form>
    </Modal>
  );
}

const ACTION: Record<AccountAction, { label: string; tone: string }> = {
  view: { label: '비밀번호 보기', tone: 'bg-tm-tint text-tm-deep' },
  copy: { label: '비밀번호 복사', tone: 'bg-tm-tint text-tm-deep' },
  create: { label: '등록', tone: 'bg-tm-ok-tint text-tm-ok' },
  edit: { label: '정보 고침', tone: 'bg-tm-violet-tint text-tm-violet' },
  password: { label: '비밀번호 바꿈', tone: 'bg-tm-warn-tint text-tm-warn' },
  remove: { label: '지움', tone: 'bg-tm-red-tint text-tm-red' },
};

function AccountLog({ account, store, nameOf, onClose }: {
  /** null 이면 모든 계정(관리자) */
  account: SharedAccount | null;
  store: AccountStore;
  nameOf(id: string | null): string;
  onClose(): void;
}) {
  const [state, setState] = useState<{ list: AccountLogEntry[] } | { error: string } | null>(null);
  const { log } = store;
  const target = account?.id ?? null;
  useEffect(() => {
    let on = true;
    void log(target, account ? 100 : 200).then((r) => { if (on) setState(r); });
    return () => { on = false; };
  }, [log, target, account]);

  return (
    <Modal title={account ? `${account.service} 기록` : '공용계정 전체 기록'}
      sub={account ? '누가 언제 보고 · 복사하고 · 고쳤는지 (최근 100건)' : '모든 계정의 최근 200건 - 지운 계정도 남습니다'}
      onClose={onClose}
      foot={<button type="button" onClick={onClose} className={`${tmBtn} ml-auto`}>닫기</button>}>
      {state === null ? (
        <p className="py-8 text-center text-[15px] text-tm-sub">기록을 읽는 중…</p>
      ) : 'error' in state ? (
        <p role="alert" className="py-8 text-center text-[15px] font-semibold text-tm-red-deep">{state.error}</p>
      ) : state.list.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-tm-sub">아직 기록이 없습니다.</p>
      ) : (
        <ol className="divide-y divide-tm-line">
          {state.list.map((l) => {
            const act = ACTION[l.action] ?? { label: l.action, tone: 'bg-tm-bg text-tm-sub' };
            return (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <Avatar id={l.member} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14.5px] text-tm-ink">
                    <b className="font-bold">{nameOf(l.member)}</b>
                    <span className={`rounded-full px-2 py-0.5 text-[12.5px] font-bold ${act.tone}`}>{act.label}</span>
                    {!account && <span className="min-w-0 truncate text-tm-sub">{l.service}</span>}
                  </p>
                </div>
                <time dateTime={l.at} title={fullTime(l.at)} className="flex-none text-[13px] tabular-nums text-tm-sub">{ago(l.at)}</time>
              </li>
            );
          })}
        </ol>
      )}
    </Modal>
  );
}
