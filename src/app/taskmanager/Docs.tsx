'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DOC_TEMPLATES, MEMBERS, localDay, type Doc } from './types';
import { useMember } from './members';
import { isUntouchedSampleDoc, type DocStore } from './docStore';
import Markdown, { extractHeadings } from './Markdown';
import {
  Avatar, IconPlus, IconSearch, Modal, PageHead,
  tmBtn, tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmGhostDanger, tmInput, tmLabel, tmSelect,
  useConfirm,
} from './ui';

/* ── 문서 트리 ────────────────────────────────────── */

interface Node extends Doc { children: Node[] }

/** 화면에 적는 제목 - 예전 편집기가 빈 제목을 저장한 문서도 목록 · 경로에서 빈 줄로 보이지 않게 */
const titleOf = (d: { title: string }) => d.title.trim() || '제목 없는 문서';

function buildTree(docs: Doc[]): Node[] {
  const byId = new Map<string, Node>(docs.map((d) => [d.id, { ...d, children: [] }]));
  const roots: Node[] = [];
  byId.forEach((n) => {
    const parent = n.parentId ? byId.get(n.parentId) : null;
    if (parent) parent.children.push(n);
    else roots.push(n);
  });
  const sort = (ns: Node[]) => {
    ns.sort((a, b) => a.order - b.order);
    ns.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

const docIcon = (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 3h6l3.5 3.5V17h-9.5z" />
    <path d="M11.5 3v3.5H15" />
  </svg>
);

/** 트리 한 줄 - 고른 문서는 왼쪽 메뉴처럼 파랗게 채운다 */
function TreeItem({
  node, depth, activeId, openSet, onToggle, onSelect,
}: {
  node: Node; depth: number; activeId: string | null;
  openSet: Set<string>; onToggle(id: string): void; onSelect(id: string): void;
}) {
  const hasKids = node.children.length > 0;
  const expanded = openSet.has(node.id);
  const active = node.id === activeId;

  return (
    <li>
      <div
        className={`flex min-h-[38px] items-center gap-0.5 rounded-tm-sm pr-2 transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 ${
          active ? 'bg-tm-blue text-white' : 'text-tm-ink hover:bg-tm-tint'}`}
        style={{ paddingLeft: 4 + depth * 14 }}
      >
        {hasKids ? (
          <button type="button" onClick={() => onToggle(node.id)}
            aria-label={expanded ? '접기' : '펼치기'} aria-expanded={expanded}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-150 ${
              active ? 'text-white hover:bg-white/20 focus-visible:outline-white' : 'text-tm-sub hover:bg-white hover:text-tm-ink'}`}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden
              className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="h-7 w-7 shrink-0" />
        )}
        <button type="button" onClick={() => onSelect(node.id)} aria-current={active ? 'page' : undefined}
          className={`flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-md text-left text-[14.5px] ${
            active ? 'font-bold focus-visible:outline-white' : 'font-semibold'}`}>
          <span className={active ? 'text-white' : 'text-tm-sub'}>{docIcon}</span>
          <span className="truncate">{titleOf(node)}</span>
        </button>
      </div>
      {hasKids && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((c) => (
            <TreeItem key={c.id} node={c} depth={depth + 1} activeId={activeId}
              openSet={openSet} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── 새 문서 ──────────────────────────────────────── */

function NewDocDialog({
  parentTitle, onCreate, onClose,
}: {
  parentTitle: string | null;
  onCreate(templateId: string, title: string): void;
  onClose(): void;
}) {
  const [picked, setPicked] = useState('meeting');
  const [title, setTitle] = useState(() => DOC_TEMPLATES.find((x) => x.id === 'meeting')?.title ?? '');
  const titleRef = useRef<HTMLInputElement>(null);
  /* 양식을 마우스 · 손가락으로 골랐는가. 화살표로 양식을 넘겨 보는 중에는 초점을 옮기지 않는다
     (그때는 Tab 으로 제목 칸에 들어오면 브라우저가 글자를 모두 골라 준다) */
  const byPointer = useRef(true);

  /* 창을 열 때와 양식을 고를 때 - 양식이 채운 제목을 골라 둔다. 그대로 치면 바뀐다 */
  useEffect(() => {
    const el = titleRef.current;
    if (!el || !byPointer.current) return;
    el.focus();
    el.select();
  }, [picked]);

  const create = () => { if (title.trim()) onCreate(picked, title.trim()); };

  return (
    <Modal
      title="새 문서"
      sub={parentTitle ? `${parentTitle} 아래에 만듭니다` : undefined}
      onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>
            취소
          </button>
          <button type="button" onClick={create} disabled={!title.trim()} className={tmBtnPrimary}>
            만들기
          </button>
        </>
      }
    >
      <p className={tmLabel} id="doc-template-label">양식</p>
      {/* 세종 관리자의 분류 고르기 칸 - 고른 것은 파란 테두리에 옅은 파랑 바탕 */}
      <div role="radiogroup" aria-labelledby="doc-template-label" className="mb-[22px] grid gap-2.5 sm:grid-cols-2"
        onPointerDown={() => { byPointer.current = true; }}
        onKeyDown={() => { byPointer.current = false; }}>
        {DOC_TEMPLATES.map((t) => {
          const on = picked === t.id;
          return (
            <label key={t.id}
              className={`flex cursor-pointer items-start gap-2.5 rounded-tm-sm border p-3.5 transition-[border-color,box-shadow,background-color] duration-150 ${
                on ? 'border-tm-blue bg-tm-tint shadow-[inset_0_0_0_1px_#2644cb]' : 'border-tm-edge bg-white hover:border-tm-blue'}`}>
              <input type="radio" name="doc-template" value={t.id} checked={on}
                onChange={() => { setPicked(t.id); setTitle(t.title); }}
                className="mt-[3px] h-[18px] w-[18px] flex-none accent-tm-blue" />
              <span className="min-w-0">
                <b className="block text-[15px] font-bold text-tm-ink">{t.name}</b>
                <small className="mt-0.5 block text-[13px] leading-[1.5] text-tm-sub">{t.hint}</small>
              </span>
            </label>
          );
        })}
      </div>

      <label className={tmLabel} htmlFor="doc-title">
        제목 <b className="text-[12.5px] font-bold text-tm-red">필수</b>
      </label>
      {/* Enter 의 기본 동작을 막는다 - 창이 닫히며 초점이 '새 문서' 단추로 돌아간 뒤
          같은 Enter 가 그 단추를 눌러 창을 다시 여는 일이 없게 */}
      <input id="doc-title" ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
          e.preventDefault();
          create();
        }}
        placeholder="검색해서 찾을 수 있는 이름으로"
        className={tmInput} />
    </Modal>
  );
}

/* ── 편집기 제목 칸 ───────────────────────────────── */

/* 제목은 빈 채로 저장하지 않는다. 칸의 글자는 따로 들고, 비어 있는 동안은 저장을 건너뛰고
   칸을 떠나면 마지막 제목으로 돌린다. 문서가 바뀌면 key 로 새로 세운다 */
function TitleField({ saved, onSave }: { saved: string; onSave(title: string): void }) {
  const [title, setTitle] = useState(saved);
  const focused = useRef(false);
  useEffect(() => {
    // 치고 있지 않을 때 들어온 제목(다른 팀원의 수정)은 그대로 따른다
    if (!focused.current) setTitle(saved);
  }, [saved]);

  return (
    <>
      <input id="doc-edit-title" value={title}
        aria-invalid={!title.trim() || undefined}
        aria-describedby={title.trim() ? undefined : 'doc-edit-title-hint'}
        onFocus={() => { focused.current = true; }}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          if (v.trim()) onSave(v);
        }}
        onBlur={() => { focused.current = false; setTitle(saved); }}
        className={`${tmFieldBase} mb-[18px] block h-12 w-full px-3.5 text-[17px] font-bold`} />
      {!title.trim() && (
        <p id="doc-edit-title-hint" className="-mt-3 mb-[18px] text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
          제목은 비워 둘 수 없습니다. 칸을 떠나면 마지막으로 저장된 제목으로 돌아갑니다.
        </p>
      )}
    </>
  );
}

/* ── 본체 ─────────────────────────────────────────── */

/** 편집기 서식 버튼 - 마크다운을 몰라도 쓸 수 있어야 한다 */
const TOOLS: { label: string; title: string; wrap?: [string, string]; line?: string; block?: string }[] = [
  { label: 'H2', title: '제목', line: '## ' },
  { label: 'H3', title: '작은 제목', line: '### ' },
  { label: 'B', title: '굵게', wrap: ['**', '**'] },
  { label: '목록', title: '목록', line: '- ' },
  { label: '체크', title: '체크박스', line: '- [ ] ' },
  { label: '패널', title: '강조 패널', line: '> ' },
  { label: '표', title: '표', block: '| 항목 | 내용 |\n| --- | --- |\n|  |  |' },
  { label: '코드', title: '코드 블록', block: '```\n\n```' },
  { label: '구분', title: '구분선', block: '---' },
];

export default function Docs({ store, me, onTaskClick }: {
  store: DocStore;
  me: string;
  /** 본문의 MATE-### 를 눌렀을 때 - 해당 작업을 연다 */
  onTaskClick?(key: string): void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  /* 편집 중인 문서 - 다른 문서를 고르면 저절로 편집이 풀린다.
     (예전에는 고른 문서가 바뀔 때 편집을 끄는 효과가 새 문서를 만들자마자 연 편집기까지 닫았다) */
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = editingId !== null && editingId === activeId;
  const [creatingUnder, setCreatingUnder] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [confirm, confirmNode] = useConfirm();
  const author = useMember(store.docs.find((d) => d.id === activeId)?.author ?? null);
  /* 보던 문서를 다른 팀원이 지웠다(Supabase 모드). 쓰던 글을 새 문서로 남길 수 있게 마지막 모습을 들고 있는다 */
  const [lost, setLost] = useState<{ doc: Doc; unsaved: boolean; editing: boolean } | null>(null);
  const lastDoc = useRef<Doc | null>(null);
  /** 새로 만든 문서는 편집기 본문에서 시작한다 */
  const focusBody = useRef(false);
  const [retrying, setRetrying] = useState(false);

  const tree = useMemo(() => buildTree(store.docs), [store.docs]);

  /** 아무도 고치지 않은 예시 문서 수 - 안내 띠를 띄울지 정한다 */
  const sampleCount = useMemo(() => store.docs.filter(isUntouchedSampleDoc).length, [store.docs]);

  /** 트리를 평탄화한 목록 - 좁은 화면의 선택기에 쓴다 */
  const flat = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    const walk = (ns: Node[], depth: number) => {
      ns.forEach((n) => {
        out.push({ id: n.id, label: `${'  '.repeat(depth)}${depth ? '└ ' : ''}${titleOf(n)}` });
        walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return out;
  }, [tree]);

  useEffect(() => {
    if (!store.ready) return;
    if (activeId && store.docs.some((d) => d.id === activeId)) return;
    // 다른 곳에서 지운 문서였다 - 알리고 편집을 푼다. 고른 것도 비워 같은 일을 두 번 알리지 않는다
    const unsaved = activeId ? store.deletedElsewhere?.get(activeId) : undefined;
    if (activeId && unsaved !== undefined) {
      const last = lastDoc.current;
      if (last?.id === activeId) {
        const next = { doc: last, unsaved, editing: editingId === activeId };
        // 쓰던 글을 남길 수 있는 알림은 보기만 하던 문서의 알림으로 덮지 않는다(위 문서를 지우면 아래 문서가 줄줄이 지워진다)
        setLost((prev) => (prev && (prev.unsaved || prev.editing) && !next.unsaved && !next.editing ? prev : next));
      }
      setEditingId(null);
      setActiveId(null);
    }
    // 위 문서가 먼저 지워져 떠 있는 아래 문서보다 진짜 맨 위 문서로 간다 - 곧 함께 지워질 문서로 가지 않게
    const firstRoot = tree.find((n) => !n.parentId) ?? tree[0];
    if (firstRoot) {
      setActiveId(firstRoot.id);
      setOpenSet(new Set(store.docs.filter((d) => !d.parentId).map((d) => d.id)));
    }
  }, [store.ready, store.docs, store.deletedElsewhere, tree, activeId, editingId]);

  const doc = activeId ? store.docs.find((d) => d.id === activeId) ?? null : null;

  useEffect(() => {
    if (doc) lastDoc.current = doc;
  }, [doc]);

  /* 새 문서 창이 닫히면 초점이 '새 문서' 단추로 돌아온다. 편집기 본문으로 옮겨 그 단추가 다시 눌리지 않게 한다 */
  useEffect(() => {
    if (!focusBody.current || !editing) return;
    focusBody.current = false;
    bodyRef.current?.focus();
  }, [editing, editingId]);

  const breadcrumb = useMemo(() => {
    const out: Doc[] = [];
    let cur = doc;
    while (cur) {
      out.unshift(cur);
      cur = cur.parentId ? store.docs.find((d) => d.id === cur!.parentId) ?? null : null;
    }
    return out;
  }, [doc, store.docs]);

  const headings = useMemo(() => (doc ? extractHeadings(doc.body) : []), [doc]);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return store.docs.filter((d) =>
      `${d.title} ${d.body} ${d.labels.join(' ')}`.toLowerCase().includes(q));
  }, [query, store.docs]);

  const toggle = (id: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleCreate = (templateId: string, title: string) => {
    const tpl = DOC_TEMPLATES.find((t) => t.id === templateId);
    const created = store.create({
      title,
      body: tpl?.body ?? '',
      parentId: creatingUnder ?? null,
      author: me,
    });
    if (creatingUnder) setOpenSet((prev) => new Set(prev).add(creatingUnder));
    setCreatingUnder(undefined);
    setActiveId(created.id);
    setEditingId(created.id);
    focusBody.current = true;
  };

  /* 지워진 문서의 마지막 글을 새 문서로 남긴다. 위 문서도 지워졌으면 맨 위에 둔다 */
  const keepLost = () => {
    if (!lost) return;
    const { doc: d } = lost;
    const parentId = d.parentId && store.docs.some((x) => x.id === d.parentId) ? d.parentId : null;
    const created = store.create({ title: d.title.trim() || '제목 없는 문서', body: d.body, parentId, author: me });
    if (parentId) setOpenSet((prev) => new Set(prev).add(parentId));
    setLost(null);
    setActiveId(created.id);
    setEditingId(created.id);
    focusBody.current = true;
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


  /* 하위 문서가 고아로 남지 않게 저장소가 가지째 지운다 - 문서에는 실행 취소가 없어 먼저 묻는다 */
  const removeDoc = async () => {
    if (!doc) return;
    const hasKids = store.docs.some((d) => d.parentId === doc.id);
    const yes = await confirm({
      title: '이 문서를 삭제할까요?',
      body: (
        <>
          <b>{titleOf(doc)}</b> 문서{hasKids ? '와 그 아래 문서가 모두' : '가'} 지워집니다. 삭제한 뒤에는 되돌릴 수 없습니다.
        </>
      ),
      ok: '삭제',
      tone: 'danger',
    });
    if (!yes) return;
    store.remove(doc.id);
    setActiveId(null);
  };

  const applyTool = (tool: (typeof TOOLS)[number]) => {
    const el = bodyRef.current;
    if (!el || !doc) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    let next: string;
    let caret: number;

    if (tool.wrap) {
      const [l, r] = tool.wrap;
      next = value.slice(0, a) + l + value.slice(a, b) + r + value.slice(b);
      caret = b + l.length + (a === b ? 0 : r.length);
    } else if (tool.line) {
      // 선택한 모든 줄의 머리에 붙인다
      const lineStart = value.lastIndexOf('\n', a - 1) + 1;
      const target = value.slice(lineStart, b);
      const prefixed = target.split('\n').map((ln) => tool.line + ln).join('\n');
      next = value.slice(0, lineStart) + prefixed + value.slice(b);
      caret = lineStart + prefixed.length;
    } else {
      const pad = a > 0 && value[a - 1] !== '\n' ? '\n' : '';
      next = value.slice(0, a) + pad + tool.block + '\n' + value.slice(b);
      caret = a + pad.length + (tool.block ?? '').length + 1;
    }

    store.update(doc.id, { body: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  if (!store.ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>
    );
  }

  return (
    <>
      <PageHead
        title="팀 위키"
        lead="회의록, 요구사항, 인수인계처럼 팀이 함께 보는 문서를 모읍니다. 본문에 MATE-104 처럼 적으면 그 작업으로 가는 링크가 됩니다."
      >
        <button type="button" onClick={() => setCreatingUnder(null)} className={`${tmBtnPrimary} max-[720px]:ml-auto`}>
          <IconPlus />
          새 문서
        </button>
      </PageHead>

      {/* 예시 문서 안내 - 규칙 문서의 모양을 하고 있어, 말해 주지 않으면 팀이 정한 규칙으로 읽힌다 */}
      {sampleCount > 0 && (
        <div role="status" className={`${tmCallout} mb-[18px] flex-none max-[720px]:mb-3.5`}>
          <p className="min-w-0 flex-[1_1_320px] max-[720px]:flex-[1_1_180px]">
            <b className="font-bold text-tm-deep">예시 문서 {sampleCount}건</b>이 들어 있습니다.{' '}
            <span className="max-[720px]:hidden">쓰는 법을 보여 주려고 채운 글이고 </span>팀이 정한 규칙이 아닙니다.
            <span className="max-[720px]:hidden"> 고쳐 쓰면 그 문서는 예시에서 빠집니다.</span>
          </p>
          <button type="button" onClick={() => { store.clearSamples(); setActiveId(null); }} className={tmGhostBtn}>
            예시 지우기
          </button>
        </div>
      )}

      {/* 보던 문서를 다른 팀원이 지웠다 - 말없이 다른 문서로 넘어가지 않게 알린다 */}
      {lost && (
        <div role="alert" className={`${tmCallout} mb-[18px] flex-none max-[720px]:mb-3.5`}>
          <p className="min-w-0 flex-[1_1_320px] max-[720px]:flex-[1_1_180px]">
            다른 팀원이 <b className="font-bold text-tm-deep">{lost.doc.title.trim() || '제목 없는 문서'}</b> 문서를 지웠습니다.
            {lost.unsaved && ' 고치던 내용은 저장되지 않았습니다.'}
            {(lost.editing || lost.unsaved) && ' 쓰던 글은 새 문서로 남길 수 있습니다.'}
          </p>
          <div className="flex flex-none gap-2">
            <button type="button" onClick={() => setLost(null)} className={tmGhostBtn}>
              닫기
            </button>
            {(lost.editing || lost.unsaved) && (
              <button type="button" onClick={keepLost} className={tmEditBtn}>
                새 문서로 남기기
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-5">

        {/* 문서 트리 */}
        <aside className="hidden w-[272px] shrink-0 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm md:flex">
          <div className="relative flex-none border-b border-tm-line p-3">
            <span className="pointer-events-none absolute left-[26px] top-1/2 -translate-y-1/2 text-tm-sub">
              <IconSearch size={17} />
            </span>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
              placeholder="문서 검색" aria-label="문서 검색"
              className={`${tmFieldBase} h-11 w-full pl-10 pr-3 text-[15px]`} />
          </div>

          <nav aria-label="문서 목록" className="min-h-0 flex-1 overflow-y-auto p-2">
            {searchHits ? (
              searchHits.length === 0 ? (
                <p className="px-2 py-8 text-center text-[14px] text-tm-sub">찾는 문서가 없습니다.</p>
              ) : (
                <ul className="space-y-0.5">
                  {searchHits.map((d) => (
                    <li key={d.id}>
                      <button type="button" onClick={() => { setActiveId(d.id); setQuery(''); }}
                        className={`flex min-h-[38px] w-full items-center gap-2 rounded-tm-sm px-2.5 text-left text-[14.5px] transition-colors duration-150 ${
                          d.id === activeId ? 'bg-tm-blue font-bold text-white focus-visible:outline-white' : 'font-semibold text-tm-ink hover:bg-tm-tint'}`}>
                        <span className={d.id === activeId ? 'text-white' : 'text-tm-sub'}>{docIcon}</span>
                        <span className="truncate">{titleOf(d)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <ul className="space-y-0.5">
                {tree.map((n) => (
                  <TreeItem key={n.id} node={n} depth={0} activeId={activeId}
                    openSet={openSet} onToggle={toggle} onSelect={setActiveId} />
                ))}
              </ul>
            )}
          </nav>
        </aside>

        {/* 본문 */}
        {!doc && store.loadError ? (
          /* 처음 목록을 읽지 못했다 - '문서가 없습니다'로 보이면 다 지워진 줄 안다 */
          <div role="alert" className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm">
            <p className="text-[20px] font-extrabold text-tm-deep">문서를 불러오지 못했습니다</p>
            <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">{store.loadError}</p>
            <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtnPrimary}>
              {retrying ? '다시 읽는 중…' : '다시 시도'}
            </button>
          </div>
        ) : !doc ? (
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm">
            <p className="text-[20px] font-extrabold text-tm-deep">문서가 없습니다</p>
            <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">
              회의록이나 요구사항 정의서 같은 양식을 골라 첫 문서를 만들어 보세요.
            </p>
            <button type="button" onClick={() => setCreatingUnder(null)} className={tmBtnPrimary}>
              <IconPlus />
              첫 문서 만들기
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm">
            {/* 문서 머리 */}
            <div className="flex-none border-b border-tm-line px-7 pb-[18px] pt-5 max-[720px]:px-4 max-[720px]:pt-4">
              {/* 트리가 숨는 구간에서의 이동 수단 */}
              <div className="mb-3 md:hidden">
                <label className="sr-only" htmlFor="doc-pick">문서 고르기</label>
                <select id="doc-pick" value={doc.id} onChange={(e) => setActiveId(e.target.value)}
                  className={`${tmSelect} w-full`}>
                  {flat.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>

              <nav aria-label="문서 경로" className="mb-1.5 hidden flex-wrap items-center gap-1 text-[13px] font-semibold text-tm-sub md:flex">
                {breadcrumb.map((b, i) => (
                  <span key={b.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-tm-edge" aria-hidden>/</span>}
                    <button type="button" onClick={() => setActiveId(b.id)}
                      className={`rounded-md ${i === breadcrumb.length - 1 ? 'text-tm-sub' : 'transition-colors hover:text-tm-blue hover:underline'}`}>
                      {titleOf(b)}
                    </button>
                  </span>
                ))}
              </nav>

              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="mr-auto min-w-0 text-[22px] font-extrabold leading-[1.3] tracking-[-0.01em] text-tm-deep [overflow-wrap:anywhere]">
                  {titleOf(doc)}
                </h2>
                <button type="button" onClick={() => setCreatingUnder(doc.id)} className={tmGhostBtn}>
                  <IconPlus size={16} />
                  하위 문서
                </button>
                <button type="button" onClick={() => setEditingId(editing ? null : doc.id)} data-on={editing ? '' : undefined} className={tmEditBtn}>
                  {editing ? '편집 끝내기' : '편집'}
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13.5px] text-tm-sub">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Avatar id={doc.author} size={22} />
                  {author?.name ?? '알 수 없음'}
                </span>
                <span className="tabular-nums">마지막 수정 {localDay(doc.updatedAt)}</span>
                {doc.labels.map((l) => (
                  <span key={l} className="rounded-full bg-tm-tint px-2.5 py-0.5 text-[12.5px] font-bold text-tm-deep">{l}</span>
                ))}
              </div>
            </div>

            {/* 본문 + 목차 */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {editing ? (
                <div className="mx-auto max-w-[920px] px-7 py-6 max-[720px]:px-4 max-[720px]:py-5">
                  <label className={tmLabel} htmlFor="doc-edit-title">제목</label>
                  <TitleField key={doc.id} saved={doc.title} onSave={(title) => store.update(doc.id, { title })} />

                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <label className="mr-1.5 text-[14px] font-bold text-tm-ink" htmlFor="doc-edit-body">
                      본문
                    </label>
                    {TOOLS.map((t) => (
                      <button key={t.label} type="button" title={t.title} onClick={() => applyTool(t)}
                        className="inline-flex h-8 items-center rounded-lg border border-tm-edge bg-white px-2.5 text-[13px] font-bold text-tm-ink
                                   transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint [@media(pointer:coarse)]:h-10">
                        {t.label}
                      </button>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-2 text-[13px] font-semibold text-tm-sub" aria-live="polite">
                      <i className={`h-2 w-2 rounded-full ${
                        store.sync === 'error' ? 'bg-tm-red' : store.sync === 'saving' ? 'bg-tm-edge' : 'bg-tm-ok'}`} aria-hidden />
                      {/* error = 아직 서버에 닿지 않은 고침이 있다(저절로 다시 보내는 중이거나 서버가 거절했다) */}
                      {store.sync === 'error' ? '저장하지 못한 변경이 있습니다' : store.sync === 'saving' ? '저장 중…' : '자동 저장됨'}
                    </span>
                  </div>
                  <textarea id="doc-edit-body" ref={bodyRef} value={doc.body}
                    onChange={(e) => store.update(doc.id, { body: e.target.value })}
                    spellCheck={false}
                    className={`${tmFieldBase} tm-mono block min-h-[52vh] w-full resize-y p-4 text-[14px] leading-[1.65]`} />

                  <p className="mt-2.5 text-[13.5px] leading-[1.6] text-tm-sub">
                    본문에 <code className="tm-mono rounded-md bg-tm-tint px-1.5 py-0.5 text-[12.5px] text-tm-deep">MATE-104</code> 처럼 적으면
                    그 작업으로 가는 링크가 됩니다.
                  </p>

                  <div className="mt-7 border-t border-tm-line pt-5">
                    <button type="button" onClick={() => void removeDoc()} className={tmGhostDanger}>
                      문서 삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-[1100px] gap-10 px-7 py-6 max-[720px]:px-4 max-[720px]:py-5 lg:px-10 lg:py-8">
                  <article className="min-w-0 flex-1">
                    <Markdown source={doc.body} onTaskClick={onTaskClick} />
                  </article>

                  {headings.length > 1 && (
                    <nav aria-label="목차" className="hidden w-[196px] shrink-0 xl:block">
                      <div className="sticky top-0">
                        <p className="mb-2.5 text-[13px] font-bold text-tm-sub">이 문서에서</p>
                        <ul className="space-y-0.5 border-l-2 border-tm-line">
                          {headings.map((h) => (
                            <li key={h.id}>
                              <a href={`#${h.id}`}
                                className="-ml-0.5 block border-l-2 border-transparent py-1 text-[13.5px] font-semibold leading-snug text-tm-sub
                                           transition-colors duration-150 hover:border-tm-blue hover:text-tm-ink"
                                style={{ paddingLeft: 12 + (h.level - 1) * 10 }}>
                                {h.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </nav>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {creatingUnder !== undefined && (
        <NewDocDialog
          parentTitle={store.docs.filter((d) => d.id === creatingUnder).map(titleOf)[0] ?? null}
          onCreate={handleCreate}
          onClose={() => setCreatingUnder(undefined)} />
      )}
      {confirmNode}
    </>
  );
}

export { MEMBERS };
