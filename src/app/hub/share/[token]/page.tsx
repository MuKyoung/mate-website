import type { Metadata } from 'next';
import { cache } from 'react';
import ShareView, { type SharedResult } from './ShareView';

/*
 * 팀 위키 공유 링크 - 로그인 없이 문서 하나만 읽는 화면(/hub/share/<열쇠>/).
 * 열쇠로 DB 함수 tm_shared_doc 을 불러 그 문서의 제목 · 아이콘 · 본문만 받는다(supabase/taskmanager.sql '위키 문서 링크 공유').
 * 끊은 링크 · 휴지통에 넣은 문서가 바로 막히도록 열 때마다 새로 읽는다(캐시하지 않는다).
 * Hub 레이아웃 안이라 사이트 머리말 · 꼬리말이 빠지고 검색에 올리지 않는다
 */
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/** DB 가 만드는 열쇠 모양(0-9 a-f 글자 32개) - 다른 모양은 DB 에 묻지도 않는다 */
const TOKEN = /^[0-9a-f]{32}$/;

interface Row { title: string | null; icon: string | null; body: string | null; updated_at: string }

/** 한 번 여는 동안 제목(머리글)과 본문이 같은 답을 쓴다 */
const readShared = cache(async (token: string): Promise<SharedResult> => {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { kind: 'off' };
  if (!TOKEN.test(token)) return { kind: 'gone' };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/tm_shared_doc`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        // 예전 형식(JWT) 키만 Authorization 에도 싣는다 - 새 publishable 키는 apikey 머리만
        ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ p_token: token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { kind: 'error' };
    const rows = (await res.json()) as Row[];
    const r = Array.isArray(rows) ? rows[0] : undefined;
    if (!r) return { kind: 'gone' };
    return { kind: 'ok', doc: { title: r.title ?? '', icon: r.icon ?? '', body: r.body ?? '', updatedAt: r.updated_at } };
  } catch {
    return { kind: 'error' };
  }
});

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const r = await readShared(params.token);
  const title = r.kind === 'ok' ? r.doc.title.trim() || '제목 없는 문서' : '공유 문서';
  const description = '팀 위키에서 링크로 공유한 문서입니다. 읽기만 할 수 있습니다.';
  return {
    // Hub 레이아웃의 제목(Hub)이 사이트 제목 틀을 끊는다 - 탭에는 어디 문서인지 붙여 적는다
    title: { absolute: `${title} | MATE 팀 위키` },
    description,
    robots: { index: false, follow: false, nocache: true },
    // 문서 속 링크를 눌러 나갈 때 이 주소(열쇠)를 상대에게 넘기지 않는다
    referrer: 'no-referrer',
    alternates: null,
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      siteName: 'Mate 외주개발팀',
      title,
      description,
      images: [{ url: '/images/og/og-default.jpg', width: 1200, height: 630, alt: 'Mate 외주개발팀' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedDocPage({ params }: { params: { token: string } }) {
  return <ShareView result={await readShared(params.token)} />;
}
