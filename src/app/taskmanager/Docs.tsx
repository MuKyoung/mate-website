'use client';

import { useEffect, useMemo, useState } from 'react';
import { DOC_TEMPLATES, MEMBERS, memberById, type Doc } from './types';
import type { DocStore } from './docStore';
import Markdown, { extractHeadings } from './Markdown';
import { Avatar } from './ui';

/* ── 문서 트리 ────────────────────────────────────── */

interface Node extends Doc { children: Node[] }

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
        className={`group flex items-center gap-0.5 rounded-md pr-1 transition ${
          active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
        style={{ paddingLeft: depth * 12 }}
      >
        {hasKids ? (
          <button onClick={() => onToggle(node.id)}
            aria-label={expanded ? '접기' : '펼치기'} aria-expanded={expanded}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <button onClick={() => onSelect(node.id)}
          className={`flex min-w-0 flex-1 items-center gap-1.5 py-[5px] text-left text-[12.5px] transition ${
            active ? 'font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-slate-400">
            <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{node.title}</span>
        </button>
      </div>
      {hasKids && expanded && (
        <ul>
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
  const [title, setTitle] = useState('');

  useEffect(() => {
    const t = DOC_TEMPLATES.find((x) => x.id === picked);
    if (t) setTitle(t.title);
  }, [picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-[8vh] backdrop-blur-[2px]"
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="새 문서"
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">새 문서</h2>
          {parentTitle && (
            <p className="mt-0.5 text-[12px] text-slate-400">{parentTitle} 아래에 만듭니다</p>
          )}
        </div>

        <div className="px-5 py-5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">양식</p>
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {DOC_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setPicked(t.id)}
                aria-pressed={picked === t.id}
                className={`rounded-lg border p-3 text-left transition ${
                  picked === t.id
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}>
                <p className="text-[13px] font-semibold text-slate-800">{t.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">{t.hint}</p>
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400" htmlFor="doc-title">
            제목
          </label>
          <input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onCreate(picked, title.trim()); }}
            placeholder="검색해서 찾을 수 있는 이름으로"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[13.5px] text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <button onClick={onClose}
            className="rounded-md px-3.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-200/60">
            취소
          </button>
          <button onClick={() => title.trim() && onCreate(picked, title.trim())} disabled={!title.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            만들기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 본체 ─────────────────────────────────────────── */

export default function Docs({ store, me }: { store: DocStore; me: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [creatingUnder, setCreatingUnder] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState(false);

  const tree = useMemo(() => buildTree(store.docs), [store.docs]);

  /** 트리를 평탄화한 목록 — 좁은 화면의 선택기에 쓴다 */
  const flat = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    const walk = (ns: Node[], depth: number) => {
      ns.forEach((n) => {
        out.push({ id: n.id, label: `${'  '.repeat(depth)}${depth ? '└ ' : ''}${n.title}` });
        walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return out;
  }, [tree]);

  useEffect(() => {
    if (!store.ready) return;
    if (activeId && store.docs.some((d) => d.id === activeId)) return;
    const firstRoot = tree[0];
    if (firstRoot) {
      setActiveId(firstRoot.id);
      setOpenSet(new Set(store.docs.filter((d) => !d.parentId).map((d) => d.id)));
    }
  }, [store.ready, store.docs, tree, activeId]);

  const doc = activeId ? store.docs.find((d) => d.id === activeId) ?? null : null;

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
    setEditing(true);
  };

  useEffect(() => { setEditing(false); setConfirming(false); }, [activeId]);

  if (!store.ready) {
    return <div className="flex flex-1 items-center justify-center text-[13px] text-slate-400">불러오는 중…</div>;
  }

  const author = memberById(doc?.author ?? null);

  return (
    <div className="flex min-h-0 flex-1">

      {/* 문서 트리 */}
      <aside className="hidden w-[244px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
            placeholder="문서 검색" aria-label="문서 검색"
            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12.5px] text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white" />
          <button onClick={() => setCreatingUnder(null)} aria-label="새 문서"
            className="shrink-0 rounded-md bg-blue-600 p-1.5 text-white transition hover:bg-blue-700">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {searchHits ? (
            searchHits.length === 0 ? (
              <p className="px-2 py-6 text-center text-[12px] text-slate-400">찾는 문서가 없습니다.</p>
            ) : (
              <ul className="space-y-0.5">
                {searchHits.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => { setActiveId(d.id); setQuery(''); }}
                      className={`w-full truncate rounded-md px-2 py-[6px] text-left text-[12.5px] transition ${
                        d.id === activeId ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {d.title}
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul>
              {tree.map((n) => (
                <TreeItem key={n.id} node={n} depth={0} activeId={activeId}
                  openSet={openSet} onToggle={toggle} onSelect={setActiveId} />
              ))}
            </ul>
          )}
        </nav>
      </aside>

      {/* 본문 */}
      {!doc ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <p className="text-[13.5px] text-slate-500">문서가 없습니다.</p>
            <button onClick={() => setCreatingUnder(null)}
              className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-700">
              첫 문서 만들기
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 문서 머리 */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
            {/* 트리가 숨는 구간에서의 이동 수단 */}
            <div className="mb-2 md:hidden">
              <label className="sr-only" htmlFor="doc-pick">문서 선택</label>
              <select id="doc-pick" aria-label="문서 선택" value={doc.id}
                onChange={(e) => setActiveId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12.5px] text-slate-700 outline-none transition focus:border-blue-500">
                {flat.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>

            <nav aria-label="문서 경로" className="mb-2 hidden flex-wrap items-center gap-1 text-[11.5px] text-slate-400 md:flex">
              {breadcrumb.map((b, i) => (
                <span key={b.id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-300">/</span>}
                  <button onClick={() => setActiveId(b.id)}
                    className={i === breadcrumb.length - 1 ? 'text-slate-600' : 'transition hover:text-slate-700'}>
                    {b.title}
                  </button>
                </span>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="mr-auto min-w-0 truncate text-[19px] font-semibold tracking-tight text-slate-900">
                {doc.title}
              </h1>
              <button onClick={() => setCreatingUnder(doc.id)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-50">
                하위 문서
              </button>
              <button onClick={() => setEditing(!editing)}
                className={`rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition ${
                  editing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {editing ? '편집 끝내기' : '편집'}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Avatar id={doc.author} size={16} />
                {author?.name ?? '알 수 없음'}
              </span>
              <span className="tabular-nums">마지막 수정 {doc.updatedAt.slice(0, 10)}</span>
              {doc.labels.map((l) => (
                <span key={l} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] text-slate-500">{l}</span>
              ))}
            </div>
          </div>

          {/* 본문 + 목차 */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {editing ? (
              <div className="mx-auto max-w-[900px] p-5">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400" htmlFor="doc-edit-title">
                  제목
                </label>
                <input id="doc-edit-title" value={doc.title}
                  onChange={(e) => store.update(doc.id, { title: e.target.value })}
                  className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[15px] font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />

                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400" htmlFor="doc-edit-body">
                  본문
                </label>
                <textarea id="doc-edit-body" value={doc.body}
                  onChange={(e) => store.update(doc.id, { body: e.target.value })}
                  spellCheck={false}
                  className="min-h-[52vh] w-full resize-y rounded-md border border-slate-300 bg-white p-3.5 font-mono text-[12.5px] leading-[1.75] text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />

                <p className="mt-2 text-[11.5px] leading-relaxed text-slate-400">
                  <code className="rounded bg-slate-100 px-1">## 제목</code>{' · '}
                  <code className="rounded bg-slate-100 px-1">- 목록</code>{' · '}
                  <code className="rounded bg-slate-100 px-1">- [ ] 체크</code>{' · '}
                  <code className="rounded bg-slate-100 px-1">&gt; 강조 패널</code>{' · '}
                  <code className="rounded bg-slate-100 px-1">| 표 |</code>{' · '}
                  <code className="rounded bg-slate-100 px-1">**굵게**</code>
                  {' — 입력하는 대로 저장됩니다.'}
                </p>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  {confirming ? (
                    <div className="flex items-center gap-2">
                      <span className="mr-auto text-[12.5px] text-slate-600">
                        이 문서와 하위 문서를 모두 지울까요?
                      </span>
                      <button onClick={() => setConfirming(false)}
                        className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-100">
                        취소
                      </button>
                      <button onClick={() => { store.remove(doc.id); setActiveId(null); }}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-rose-700">
                        삭제
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirming(true)}
                      className="text-[12.5px] font-medium text-slate-500 transition hover:text-rose-600">
                      문서 삭제
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-[1100px] gap-8 p-5 lg:p-8">
                <article className="min-w-0 flex-1">
                  <Markdown source={doc.body} />
                </article>

                {headings.length > 1 && (
                  <nav aria-label="목차" className="hidden w-[180px] shrink-0 xl:block">
                    <div className="sticky top-0">
                      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                        이 문서에서
                      </p>
                      <ul className="space-y-1 border-l border-slate-200">
                        {headings.map((h) => (
                          <li key={h.id}>
                            <a href={`#${h.id}`}
                              className="-ml-px block border-l border-transparent py-0.5 text-[12px] leading-snug text-slate-500 transition hover:border-slate-400 hover:text-slate-800"
                              style={{ paddingLeft: 10 + (h.level - 1) * 10 }}>
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

      {creatingUnder !== undefined && (
        <NewDocDialog
          parentTitle={creatingUnder ? store.docs.find((d) => d.id === creatingUnder)?.title ?? null : null}
          onCreate={handleCreate}
          onClose={() => setCreatingUnder(undefined)} />
      )}
    </div>
  );
}

export { MEMBERS };
