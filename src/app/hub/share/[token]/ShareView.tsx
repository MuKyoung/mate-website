'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { WikiRefs } from '../../DocEditor';
import { MembersContext } from '../../members';
import type { Member } from '../../types';
import { Toast, tmBtn } from '../../ui';

/*
 * 공유 링크로 연 문서(읽기 전용). page.tsx 가 서버에서 읽어 온 제목 · 본문을 받아 위키와 같은 편집기로 그리되
 * 고칠 수 없게(editable false) 두고, 다른 문서 · 작업 · Hub 로 가는 링크는 열지 않는다(WikiRefs.shared).
 * 본문의 그림 · 첨부는 로그인하지 않은 연결로 받는다 - DB 가 공유 중인 문서에 든 파일만 내준다(tm_files_shared_read)
 */

export interface SharedDoc {
  title: string;
  icon: string;
  body: string;
  updatedAt: string;
}

/** ok = 문서 · gone = 끊긴 링크 · 휴지통 · 잘못된 주소 · off = 팀 저장소 설정이 없는 빌드 · error = 저장소가 답하지 않음 */
export type SharedResult = { kind: 'ok'; doc: SharedDoc } | { kind: 'gone' } | { kind: 'off' } | { kind: 'error' };

/* 편집기는 브라우저에서만 그린다 - 제목 · 날짜는 서버가 먼저 그려 두어 링크를 열자마자 보인다 */
const DocEditor = dynamic(() => import('../../DocEditor'), {
  ssr: false,
  loading: () => <p className="py-8 text-[15px] font-semibold text-tm-sub" aria-busy>문서를 펼치는 중…</p>,
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
/** 팀 저장소 버킷 - remote.ts 의 FILES 와 같다 */
const FILES = 'tm-files';
const ONLY_THIS = '공유 링크로는 이 문서만 볼 수 있습니다';
/** 팀원 목록은 내려 주지 않는다 - 언급(@)은 본문에 적힌 이름 그대로 */
const NO_MEMBERS: Member[] = [];

let anon: SupabaseClient | null = null;
/** 로그인하지 않은 연결 - 이 브라우저에 Hub 로그인이 있어도 쓰지 않는다(링크를 받은 사람과 같은 권한으로 본다) */
function anonClient(): SupabaseClient {
  if (!anon) {
    anon = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'mate.share.auth' },
    });
  }
  return anon;
}

const signed = new Map<string, { url: string; until: number }>();
/** 본문의 tmfile: 주소 → 한 시간짜리 받을 주소 */
async function fileUrl(src: string): Promise<string> {
  if (!src.startsWith('tmfile:')) return src;
  const path = src.slice('tmfile:'.length);
  const hit = signed.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('파일을 열지 못했습니다');
  const { data, error } = await anonClient().storage.from(FILES).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error('파일을 열지 못했습니다');
  signed.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}

export default function ShareView({ result }: { result: SharedResult }) {
  return (
    // Hub 셸은 페이지 전체 스크롤을 끈다(body overflow hidden) - 이 화면이 스스로 스크롤한다
    <div className="h-[100dvh] overflow-y-auto bg-tm-bg text-[15.5px] leading-[1.6] text-tm-ink">
      <header className="border-b border-tm-line bg-tm-card">
        <div className="mx-auto flex h-14 max-w-[860px] items-center gap-3 px-7 max-[720px]:px-4">
          <span className="text-[15px] font-extrabold tracking-[-0.01em] text-tm-deep">MATE 팀 위키</span>
          <span className="ml-auto rounded-full bg-tm-tint px-2.5 py-1 text-[12.5px] font-bold text-tm-deep">읽기 전용</span>
        </div>
      </header>
      <div className="mx-auto max-w-[860px] px-7 pb-16 pt-8 max-[720px]:px-4 max-[720px]:pt-4">
        {result.kind === 'ok' ? <SharedArticle doc={result.doc} /> : <Blocked kind={result.kind} />}
      </div>
    </div>
  );
}

function SharedArticle({ doc }: { doc: SharedDoc }) {
  const [note, setNote] = useState<{ text: string; n: number } | null>(null);
  const notify = useCallback((text: string) => setNote((p) => ({ text, n: (p?.n ?? 0) + 1 })), []);
  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 4000);
    return () => clearTimeout(t);
  }, [note]);

  const refs = useMemo<WikiRefs>(() => ({
    docs: [],
    tasks: [],
    shared: true,
    openDoc: () => notify(ONLY_THIS),
    openTask: () => notify(ONLY_THIS),
    fileUrl,
    notice: notify,
  }), [notify]);

  const title = doc.title.trim() || '제목 없는 문서';
  // 서버와 브라우저가 같은 날을 적게 시간대를 정한다
  const day = new Date(doc.updatedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <article className="rounded-tm border border-tm-line bg-tm-card px-10 pb-12 pt-9 shadow-tm max-[720px]:px-4 max-[720px]:pb-8 max-[720px]:pt-6">
        {doc.icon && <div className="mb-1 text-[40px] leading-[1.2]" aria-hidden>{doc.icon}</div>}
        <h1 className="text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em] text-tm-deep [overflow-wrap:anywhere] max-[720px]:text-[23px]">
          {title}
        </h1>
        <p className="mt-2.5 text-[13.5px] text-tm-sub">
          마지막 수정 <time dateTime={doc.updatedAt}>{day}</time>
        </p>
        <div className="mt-6">
          {doc.body.trim() ? (
            <MembersContext.Provider value={NO_MEMBERS}>
              <DocEditor body={doc.body} editable={false} refs={refs} onNotice={notify} className="tm-readonly-checks" />
            </MembersContext.Provider>
          ) : (
            <p className="py-6 text-[15.5px] text-tm-sub">내용이 비어 있습니다.</p>
          )}
        </div>
      </article>
      <p className="mt-5 text-center text-[13px] text-tm-sub">MATE 팀 위키에서 링크로 공유한 문서입니다.</p>
      <Toast text={note?.text ?? null} onClose={() => setNote(null)} />
    </>
  );
}

const BLOCKED = {
  gone: {
    title: '문서를 열 수 없습니다',
    body: '공유가 끊겼거나, 문서가 휴지통으로 옮겨졌거나, 주소가 잘못되었습니다. 링크를 보낸 사람에게 다시 받아 주세요.',
  },
  error: {
    title: '문서를 불러오지 못했습니다',
    body: '잠시 뒤 다시 열어 주세요. 계속 열리지 않으면 링크를 보낸 사람에게 알려 주세요.',
  },
  off: {
    title: '공유 링크를 쓸 수 없습니다',
    body: '이 사이트가 팀 저장소에 연결되어 있지 않아 공유한 문서를 읽을 수 없습니다.',
  },
} as const;

function Blocked({ kind }: { kind: keyof typeof BLOCKED }) {
  const copy = BLOCKED[kind];
  return (
    <section className="rounded-tm border border-tm-line bg-tm-card px-7 py-12 text-center shadow-tm max-[720px]:px-4 max-[720px]:py-10">
      <h1 className="text-[22px] font-extrabold leading-[1.35] text-tm-deep">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-[460px] text-[15px] leading-[1.7] text-tm-sub">{copy.body}</p>
      {kind === 'error' && (
        <button type="button" onClick={() => window.location.reload()} className={`${tmBtn} mt-6`}>다시 열기</button>
      )}
    </section>
  );
}
