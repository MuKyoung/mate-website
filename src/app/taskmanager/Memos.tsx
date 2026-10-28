'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { localISO, localToday, type Memo } from './types';
import type { MemoStore } from './memoStore';
import {
  IconArrow, IconPlus, IconSearch, PageHead,
  tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmGhostDanger,
  useConfirm,
} from './ui';

/*
 * 내 메모 - 쓴 사람만 보는 메모장. 팀 위키와 달리 양식 · 하위 문서 · 편집 단계가 없다.
 * 고르면 바로 고칠 수 있고 적는 대로 저장된다.
 * 넓은 화면(md~): 왼쪽 목록 + 오른쪽 편집. 좁은 화면: 목록과 편집을 하나씩 보고 '목록' 단추로 돌아간다.
 */

/** 본문에서 글이 있는 줄 */
const linesOf = (body: string) => body.split('\n').map((l) => l.trim()).filter(Boolean);

/** 목록에 적는 이름 - 제목을 비워 두면 본문 첫 줄 */
const labelOf = (m: Memo) => m.title.trim() || linesOf(m.body)[0] || '빈 메모';

/** 이름 밑의 한 줄 - 이름으로 쓴 첫 줄은 건너뛴다. 여러 줄을 이어 붙이면 한 문장처럼 읽혀 다음 한 줄만 */
const previewOf = (m: Memo) => linesOf(m.body)[m.title.trim() ? 0 : 1] ?? '';

const isBlank = (m: Memo) => !m.title.trim() && !m.body.trim();

/** 알림 · 확인 창에 넣는 이름 - 본문 첫 줄이 긴 문단일 수 있다 */
const short = (s: string) => (s.length > 40 ? `${s.slice(0, 40)}…` : s);

/** 고친 때 - 오늘이면 시각, 아니면 날짜 */
function whenOf(stamp: string) {
  const d = new Date(stamp);
  if (Number.isNaN(d.getTime())) return stamp.slice(0, 10);
  return localISO(d) === localToday()
    ? d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
    : localISO(d);
}

const messageCard =
  'flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm';

export default function Memos({ store, me }: { store: MemoStore; me: string }) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  /** 좁은 화면에서 목록을 보는 중인가. 넓은 화면은 목록과 편집이 늘 함께 보여 이 값을 쓰지 않는다 */
  const [listing, setListing] = useState(true);
  const [query, setQuery] = useState('');
  const [confirm, confirmNode] = useConfirm();
  /* 보던 메모를 다른 창 · 기기에서 지웠다(Supabase 모드). 지워진 글을 새 메모로 되살릴 수 있게 마지막 모습을 들고 있는다 */
  const [lost, setLost] = useState<{ memo: Memo; unsaved: boolean } | null>(null);
  const lastMemo = useRef<Memo | null>(null);
  const [retrying, setRetrying] = useState(false);

  /** 내 메모 - 최근에 고친 것이 위로. Supabase 모드는 저장소에 내 것만 오지만 브라우저 저장 모드는 '나'를 바꿔 쓸 수 있다 */
  const mine = useMemo(
    () => store.memos
      .filter((m) => m.owner === me)
      .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)),
    [store.memos, me],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? mine.filter((m) => `${m.title}\n${m.body}`.toLowerCase().includes(q)) : mine;
  }, [mine, query]);

  const memo = activeId ? mine.find((m) => m.id === activeId) ?? null : null;

  useEffect(() => {
    if (memo) lastMemo.current = memo;
  }, [memo]);

  /* 고른 메모가 없거나 사라졌으면 맨 위 메모를 고른다 */
  useEffect(() => {
    if (!store.ready || memo) return;
    if (activeId) {
      // 다른 창 · 기기에서 지운 메모였다 - 말없이 다른 메모로 넘어가지 않게 알린다. 빈 메모였으면 남길 것이 없다
      const unsaved = store.deletedElsewhere?.get(activeId);
      const last = lastMemo.current;
      if (unsaved !== undefined && last?.id === activeId && !isBlank(last)) setLost({ memo: last, unsaved });
      setListing(true);
    }
    setActiveId(mine[0]?.id ?? null);
  }, [store.ready, store.deletedElsewhere, memo, activeId, mine]);

  const open = (id: string) => {
    setActiveId(id);
    setListing(false);
  };

  /* 비어 있는 메모가 이미 있으면 그것을 연다 - 누를 때마다 빈 메모가 쌓이지 않게 */
  const newMemo = () => {
    const blank = mine.find(isBlank) ?? store.create(me);
    setQuery('');
    open(blank.id);
    // 다시 그린 뒤 본문 칸에서 시작한다
    requestAnimationFrame(() => bodyRef.current?.focus());
  };

  const keepLost = () => {
    if (!lost) return;
    const created = store.create(me, { title: lost.memo.title, body: lost.memo.body });
    setLost(null);
    setQuery('');
    open(created.id);
  };

  /* 메모에는 실행 취소가 없어 먼저 묻는다. 빈 메모는 묻지 않고 지운다 */
  const removeMemo = async () => {
    if (!memo) return;
    if (!isBlank(memo)) {
      const yes = await confirm({
        title: '이 메모를 삭제할까요?',
        // 이름을 따로 한 줄에 둔다 - '통화 메모 메모가'처럼 이름 끝의 '메모'와 겹치지 않게
        body: (
          <>
            <b className="block [overflow-wrap:anywhere]">{short(labelOf(memo))}</b>
            삭제한 뒤에는 되돌릴 수 없습니다.
          </>
        ),
        ok: '삭제',
        tone: 'danger',
      });
      if (!yes) return;
    }
    store.remove(memo.id);
    setActiveId(null);
    setListing(true);
  };

  /* 처음 목록을 읽지 못했을 때 - 저장소가 저절로도 다시 읽지만 바로 해 볼 수 있게 */
  const retryLoad = async () => {
    setRetrying(true);
    try {
      await store.reload?.();
    } finally {
      setRetrying(false);
    }
  };

  if (!store.ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>
    );
  }

  return (
    <>
      <PageHead title="내 메모" lead="나만 보는 메모입니다. 다른 팀원에게는 보이지 않고, 적는 대로 저장됩니다.">
        <button type="button" onClick={newMemo} className={`${tmBtnPrimary} max-[720px]:ml-auto`}>
          <IconPlus />
          새 메모
        </button>
      </PageHead>

      {/* 보던 메모를 다른 창 · 기기에서 지웠다 - 말없이 사라지지 않게 알린다 */}
      {lost && (
        <div role="alert" className={`${tmCallout} mb-[18px] flex-none max-[720px]:mb-3.5`}>
          <p className="min-w-0 flex-[1_1_320px] max-[720px]:flex-[1_1_180px]">
            보던 메모(<b className="font-bold text-tm-deep">{short(labelOf(lost.memo))}</b>)를 다른 창이나 기기에서 지웠습니다.
            {lost.unsaved && ' 고치던 내용은 저장되지 않았습니다.'} 지워진 글은 새 메모로 되살릴 수 있습니다.
          </p>
          <div className="flex flex-none gap-2">
            <button type="button" onClick={() => setLost(null)} className={tmGhostBtn}>
              닫기
            </button>
            <button type="button" onClick={keepLost} className={tmEditBtn}>
              새 메모로 되살리기
            </button>
          </div>
        </div>
      )}

      {mine.length === 0 ? (
        store.loadError ? (
          /* 처음 목록을 읽지 못했다 - '메모가 없습니다'로 보이면 다 지워진 줄 안다 */
          <div role="alert" className={messageCard}>
            <p className="text-[20px] font-extrabold text-tm-deep">메모를 불러오지 못했습니다</p>
            <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">{store.loadError}</p>
            <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtnPrimary}>
              {retrying ? '다시 읽는 중…' : '다시 시도'}
            </button>
          </div>
        ) : (
          <div className={messageCard}>
            <p className="text-[20px] font-extrabold text-tm-deep">아직 메모가 없습니다</p>
            <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">
              나만 볼 메모를 적어 두는 곳입니다.<br />
              다른 팀원에게는 보이지 않습니다.
            </p>
            <button type="button" onClick={newMemo} className={tmBtnPrimary}>
              <IconPlus />
              첫 메모 쓰기
            </button>
          </div>
        )
      ) : (
        <div className="flex min-h-0 flex-1 gap-5">

          {/* 메모 목록 */}
          <aside className={`${listing ? 'flex' : 'hidden'} min-h-0 w-full flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm
                             md:flex md:w-[300px] md:shrink-0`}>
            <div className="relative flex-none border-b border-tm-line p-3">
              <span className="pointer-events-none absolute left-[26px] top-1/2 -translate-y-1/2 text-tm-sub">
                <IconSearch size={17} />
              </span>
              {/* 좁은 화면에서도 보이는 칸이라 16px - iOS 가 누를 때 화면을 확대하지 않게 */}
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
                placeholder="메모 검색" aria-label="메모 검색"
                className={`${tmFieldBase} h-11 w-full pl-10 pr-3 text-[16px]`} />
            </div>

            <nav aria-label="메모 목록" className="min-h-0 flex-1 overflow-y-auto p-2">
              {shown.length === 0 ? (
                <p className="px-2 py-8 text-center text-[14px] text-tm-sub">찾는 메모가 없습니다.</p>
              ) : (
                <ul className="space-y-0.5">
                  {shown.map((m) => {
                    const on = m.id === memo?.id;
                    const blank = isBlank(m);
                    return (
                      <li key={m.id}>
                        <button type="button" onClick={() => open(m.id)} aria-current={on ? 'page' : undefined}
                          className={`flex w-full flex-col gap-0.5 rounded-tm-sm px-3 py-2.5 text-left transition-colors duration-150 ${
                            on ? 'bg-tm-blue text-white focus-visible:outline-white' : 'text-tm-ink hover:bg-tm-tint'}`}>
                          <span className="flex w-full min-w-0 items-baseline gap-2">
                            <b className={`min-w-0 flex-1 truncate text-[14.5px] ${blank ? 'font-semibold' : 'font-bold'} ${
                              on ? 'text-white' : blank ? 'text-tm-sub' : 'text-tm-ink'}`}>
                              {labelOf(m)}
                            </b>
                            <small className={`flex-none text-[12.5px] font-semibold tabular-nums ${on ? 'text-white/80' : 'text-tm-sub'}`}>
                              {whenOf(m.updatedAt)}
                            </small>
                          </span>
                          <span className={`block w-full truncate text-[13.5px] ${on ? 'text-white/80' : 'text-tm-sub'}`}>
                            {blank ? ' ' : previewOf(m) || '추가 내용 없음'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>
          </aside>

          {/* 편집 - 늘 고칠 수 있는 상태다 */}
          {memo && (
            <div className={`${listing ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm md:flex`}>
              <div className="flex flex-none flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-tm-line px-7 py-3 max-[720px]:px-4">
                <button type="button" onClick={() => setListing(true)} className={`${tmGhostBtn} md:hidden`}>
                  <IconArrow dir="left" />
                  목록
                </button>
                <span className="text-[13.5px] tabular-nums text-tm-sub max-[720px]:hidden">마지막 수정 {whenOf(memo.updatedAt)}</span>
                <span className="ml-auto inline-flex items-center gap-2 text-[13px] font-semibold text-tm-sub" aria-live="polite">
                  <i className={`h-2 w-2 rounded-full ${
                    store.sync === 'error' ? 'bg-tm-red' : store.sync === 'saving' ? 'bg-tm-edge' : 'bg-tm-ok'}`} aria-hidden />
                  {/* error = 아직 서버에 닿지 않은 고침이 있다(저절로 다시 보내는 중이거나 서버가 거절했다) */}
                  {store.sync === 'error' ? '저장하지 못한 변경이 있습니다' : store.sync === 'saving' ? '저장 중…' : '자동 저장됨'}
                </span>
                <button type="button" onClick={() => void removeMemo()} className={tmGhostDanger}>
                  삭제
                </button>
              </div>

              {/* 메모를 바꾸면 칸을 새로 세운다 - 스크롤과 되돌리기 기록이 앞 메모에서 넘어오지 않게 */}
              <div key={memo.id} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-7 py-5 max-[720px]:px-4 max-[720px]:py-4">
                <label className="sr-only" htmlFor="memo-title">제목</label>
                <input id="memo-title" value={memo.title}
                  onChange={(e) => store.update(memo.id, { title: e.target.value })}
                  onKeyDown={(e) => {
                    // 제목은 한 줄이다 - Enter 는 본문으로 넘어간다
                    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
                    e.preventDefault();
                    bodyRef.current?.focus();
                  }}
                  placeholder="제목 (비워 둬도 됩니다)"
                  className={`${tmFieldBase} h-12 w-full flex-none px-3.5 text-[17px] font-bold`} />
                <label className="sr-only" htmlFor="memo-body">메모 내용</label>
                <textarea id="memo-body" ref={bodyRef} value={memo.body}
                  onChange={(e) => store.update(memo.id, { body: e.target.value })}
                  placeholder="적는 대로 저장됩니다. 다른 팀원에게는 보이지 않습니다."
                  spellCheck={false}
                  className={`${tmFieldBase} block min-h-[200px] w-full flex-1 resize-none p-4 text-[16px] leading-[1.7]`} />
              </div>
            </div>
          )}
        </div>
      )}

      {confirmNode}
    </>
  );
}
