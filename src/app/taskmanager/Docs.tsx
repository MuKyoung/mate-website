'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { DOC_TEMPLATES, localDay, type Doc, type DocVersion, type Task } from './types';
import { useMember, useMembers } from './members';
import { isUntouchedSampleDoc, type DocStore } from './docStore';
import { docLinkIds } from './docMarkdown';
import { isRemote } from './supabase';
import { useNoPresence, useRemotePresence, type Presence } from './remote';
import DocEditor, { focusEditor, scrollToPos, scrollWithin, type WikiHeading, type WikiRefs } from './DocEditor';
import DocTree, { FlatRow, buildTree, type DropZone } from './DocTree';
import {
  Comments, DocIcon, DropMenu, EmojiPicker, HistoryDialog, LabelEditor, MoveDialog, NewDocDialog, QuickFind, Snippet,
  TitleField, TrashDialog, ago, pathOf, plainOf, readingLabel, titleOf, useDeleteConfirm, useStoredList,
  type MenuEntry,
} from './DocPanels';
import {
  Avatar, IconPlus, IconSearch, PageHead,
  tmBtn, tmBtnPrimary, tmCallout, tmEditBtn, tmFieldBase, tmGhostBtn, tmIconBtn, tmSelect,
} from './ui';

/*
 * 팀 위키 - 노션 · Confluence 처럼 쓰는 문서 화면.
 *
 * 왼쪽은 문서 트리(끌어서 옮기기, 즐겨찾기, 휴지통), 가운데는 보이는 그대로 고치는 편집기(DocEditor),
 * 오른쪽은 목차. 문서 머리에는 아이콘 · 제목 · 라벨 · 고친 사람이, 아래에는 하위 문서 · 이 문서를 링크한 문서 ·
 * 댓글이 붙는다. 기록(예전 판 비교 · 되돌리기), 옮기기, 사본, 내보내기, 인쇄는 문서 메뉴(⋯)에 있다.
 * 주소에 ?doc=<id> 가 붙어 링크로 문서를 나눌 수 있다.
 */

const usePresence: (me: string, doc: string | null, editing: boolean, enabled: boolean) => Presence =
  isRemote ? useRemotePresence : useNoPresence;

/** 같은 위 문서 아래 순서 - 둘 사이 값 하나만 고친다 */
function between(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) return 1000;
  if (a === undefined) return (b as number) - 1000;
  if (b === undefined) return a + 1000;
  return (a + b) / 2;
}

const WIDE_KEY = 'mate.taskmanager.docs.wide.v1';

export default function Docs({ store, me, tasks, onTaskClick, onNotice }: {
  store: DocStore;
  me: string;
  /** 작업 목록 - 본문의 MATE-### 칩 제목 · 상태와 [[ 고르기에 쓴다 */
  tasks: Task[];
  /** 본문의 MATE-### 를 눌렀을 때 - 해당 작업을 연다 */
  onTaskClick?(key: string): void;
  /** 화면 아래 알림 */
  onNotice?(text: string, tone?: 'ok' | 'err'): void;
}) {
  const members = useMembers();
  const [activeId, setActiveId] = useState<string | null>(null);
  /* 편집 중인 문서 - 다른 문서를 고르면 저절로 편집이 풀린다 */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingUnder, setCreatingUnder] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<null | 'find' | 'move' | 'trash' | 'history'>(null);
  const [iconOpen, setIconOpen] = useState(false);
  const [headings, setHeadings] = useState<WikiHeading[]>([]);
  const [here, setHere] = useState<number | null>(null);
  const [wide, setWide] = useState(false);
  const [retrying, setRetrying] = useState(false);
  /* 보던 문서를 다른 팀원이 영구 삭제했다(Supabase 모드). 쓰던 글을 새 문서로 남길 수 있게 마지막 모습을 들고 있는다 */
  const [lost, setLost] = useState<{ doc: Doc; unsaved: boolean; editing: boolean } | null>(null);
  /** 새로 만든 문서는 본문에 커서를 두고 연다 */
  const [focusFor, setFocusFor] = useState<string | null>(null);
  const lastDoc = useRef<Doc | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  /** 들어온 주소의 ?doc= - 위키를 떠날 때 주소에서 지우므로 처음 그릴 때 읽어 둔다 */
  const [urlDoc] = useState(() => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('doc')));
  const [askDelete, deleteNode] = useDeleteConfirm();

  const [starred, setStarred] = useStoredList(`mate.taskmanager.docs.stars.v1:${me}`);
  const [recent, setRecent, recentLoaded] = useStoredList(`mate.taskmanager.docs.recent.v1:${me}`, 15);
  const [openList, setOpenList, openLoaded] = useStoredList(`mate.taskmanager.docs.open.v1:${me}`, 400);
  const openSet = useMemo(() => new Set(openList), [openList]);

  const wikiOn = store.features.wiki;
  const byId = useMemo(() => new Map(store.docs.map((d) => [d.id, d])), [store.docs]);

  /** 휴지통에 든 문서와 그 아래 문서 - 트리 · 검색에서 뺀다 */
  const hidden = useMemo(() => {
    const out = new Set<string>();
    store.docs.forEach((d) => {
      let cur: Doc | undefined = d;
      let guard = 0;
      while (cur && guard < 60) {
        if (cur.trashedAt) { out.add(d.id); return; }
        cur = cur.parentId ? byId.get(cur.parentId) : undefined;
        guard += 1;
      }
    });
    return out;
  }, [store.docs, byId]);
  const live = useMemo(() => store.docs.filter((d) => !hidden.has(d.id)), [store.docs, hidden]);
  const trashed = useMemo(() => store.docs.filter((d) => d.trashedAt), [store.docs]);
  const tree = useMemo(() => buildTree(live), [live]);

  /** 아무도 고치지 않은 예시 문서 수 - 안내 띠를 띄울지 정한다 */
  const sampleCount = useMemo(() => store.docs.filter(isUntouchedSampleDoc).length, [store.docs]);

  const doc = activeId ? byId.get(activeId) ?? null : null;
  const canEdit = !!doc && !hidden.has(doc.id);
  const editing = editingId !== null && editingId === activeId && canEdit;
  const presence = usePresence(me, canEdit ? activeId : null, editing, wikiOn);
  const watched = useMemo(() => new Set(presence.byDoc.keys()), [presence]);
  const here2 = doc ? presence.byDoc.get(doc.id) ?? [] : [];
  const othersEditing = here2.filter((p) => p.editing);

  /** 트리를 평탄화한 목록 - 좁은 화면의 선택기 */
  const flat = useMemo(() => {
    const out: { id: string; label: string }[] = [];
    const walk = (ns: ReturnType<typeof buildTree>, depth: number) => {
      ns.forEach((n) => {
        out.push({ id: n.id, label: `${'  '.repeat(depth)}${depth ? '└ ' : ''}${n.icon ? `${n.icon} ` : ''}${titleOf(n)}` });
        walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return out;
  }, [tree]);

  /* ── 처음 고를 문서 · 사라진 문서 ── */
  useEffect(() => {
    // 마지막으로 본 문서를 알려면 이 브라우저에 남긴 목록을 먼저 읽어야 한다
    if (!store.ready || !recentLoaded) return;
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
    // 고른 문서가 없으면 - 들어온 주소의 ?doc= → 마지막으로 본 문서 → 맨 위 문서.
    // 몇 번을 다시 돌아도 같은 답이 나오게 둔다(개발 모드는 효과를 두 번 돌린다)
    const want = [urlDoc, ...recent].find((id) => !!id && store.docs.some((d) => d.id === id && (id === urlDoc || !hidden.has(id))));
    if (want) { setActiveId(want); return; }
    const firstRoot = tree.find((n) => !n.parentId) ?? tree[0];
    if (firstRoot) setActiveId(firstRoot.id);
  }, [store.ready, store.docs, store.deletedElsewhere, tree, activeId, editingId, recent, recentLoaded, hidden, urlDoc]);

  useEffect(() => {
    if (doc) lastDoc.current = doc;
  }, [doc]);

  /* 주소에 고른 문서를 적는다 - 링크로 나눌 수 있게. 위키를 떠나면 지운다 */
  useEffect(() => {
    if (!activeId) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('doc') === activeId) return;
    url.searchParams.set('doc', activeId);
    window.history.replaceState(window.history.state, '', url);
  }, [activeId]);
  useEffect(() => () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('doc')) return;
    url.searchParams.delete('doc');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  /* 최근 본 문서 · 고른 문서의 위 문서는 펼쳐 둔다 */
  useEffect(() => {
    if (!activeId || hidden.has(activeId)) return;
    setRecent((prev) => (prev[0] === activeId ? prev : [activeId, ...prev.filter((x) => x !== activeId)]));
    const ups: string[] = [];
    let cur = byId.get(activeId)?.parentId ?? null;
    let guard = 0;
    while (cur && guard < 50) {
      ups.push(cur);
      cur = byId.get(cur)?.parentId ?? null;
      guard += 1;
    }
    if (ups.some((u) => !openSet.has(u))) setOpenList((prev) => [...new Set([...prev, ...ups])]);
  }, [activeId, hidden, byId, openSet, setRecent, setOpenList]);

  /* 처음 쓰는 사람은 맨 위 문서들을 펼친 채로 시작한다 - 저장된 펼침을 읽은 뒤에, 비어 있을 때만 */
  const seeded = useRef(false);
  useEffect(() => {
    if (!store.ready || !openLoaded || seeded.current || !tree.length) return;
    seeded.current = true;
    setOpenList((prev) => (prev.length ? prev : tree.map((n) => n.id)));
  }, [store.ready, openLoaded, tree, setOpenList]);

  useEffect(() => {
    try { setWide(window.localStorage.getItem(WIDE_KEY) === '1'); } catch { /* 저장이 막힌 환경 */ }
  }, []);
  const toggleWide = () => {
    setWide((v) => {
      try { window.localStorage.setItem(WIDE_KEY, v ? '0' : '1'); } catch { /* noop */ }
      return !v;
    });
  };

  /* 다른 문서로 가면 목차 · 맨 위 자리를 새로 */
  useEffect(() => {
    setHeadings([]);
    setHere(null);
    setIconOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

  /* 목차 - 지금 읽는 자리의 제목을 표시한다 */
  useEffect(() => {
    const box = scrollRef.current;
    if (!box || headings.length < 2) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ed = editorRef.current;
        if (!ed || ed.isDestroyed) return;
        const top = box.getBoundingClientRect().top + 96;
        let cur: number | null = null;
        for (const h of headings) {
          const el = ed.view.nodeDOM(h.pos) as HTMLElement | null;
          if (el?.getBoundingClientRect && el.getBoundingClientRect().top <= top) cur = h.pos;
        }
        setHere(cur);
      });
    };
    onScroll();
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      box.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [headings]);

  /* ── 단축키 - Ctrl(⌘)+K 찾기, E 편집 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        // 편집기에서 글을 고른 채 누른 것은 링크 - 편집기가 먼저 받는다
        if (e.defaultPrevented) return;
        if (document.querySelector('[aria-modal="true"]')) return;
        e.preventDefault();
        setDialog('find');
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (typing || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('[aria-modal="true"]')) return;
      if ((e.key === 'e' || e.code === 'KeyE') && doc && canEdit) {
        e.preventDefault();
        setEditingId((v) => (v === doc.id ? null : doc.id));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doc, canEdit]);

  const breadcrumb = useMemo(() => {
    const out: Doc[] = [];
    let cur = doc;
    let guard = 0;
    while (cur && guard < 50) {
      out.unshift(cur);
      cur = cur.parentId ? byId.get(cur.parentId) ?? null : null;
      guard += 1;
    }
    return out;
  }, [doc, byId]);

  /** 휴지통에 든 위 문서 - 이 문서는 그 문서와 함께 숨어 있다 */
  const trashedAbove = useMemo(() => {
    if (!doc || doc.trashedAt || !hidden.has(doc.id)) return null;
    return [...breadcrumb].reverse().find((d) => d.trashedAt) ?? null;
  }, [doc, hidden, breadcrumb]);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // #라벨 로 찾으면 라벨만 본다
    if (q.startsWith('#') && q.length > 1) {
      const label = q.slice(1);
      return live.filter((d) => d.labels.some((l) => l.toLowerCase().includes(label))).map((d) => ({ d, text: '' }));
    }
    return live
      .map((d) => ({ d, text: plainOf(d) }))
      .filter(({ d, text }) => `${d.title} ${d.labels.join(' ')} ${text}`.toLowerCase().includes(q));
  }, [query, live]);

  const children = useMemo(
    () => (doc ? live.filter((d) => d.parentId === doc.id).sort((a, b) => a.order - b.order) : []),
    [doc, live],
  );
  const backlinks = useMemo(
    () => (doc ? live.filter((d) => d.id !== doc.id && d.body.includes(`(doc:${doc.id})`) && docLinkIds(d.body).includes(doc.id)) : []),
    [doc, live],
  );
  const docComments = useMemo(() => (doc ? store.comments.filter((c) => c.docId === doc.id) : []), [doc, store.comments]);
  const commentCount = docComments.filter((c) => !c.removed).length;

  /* 편집기에 넘기는 것 - 바뀐 것이 있을 때만 새로 만든다(작업 칩 · 문서 링크를 다시 그리는 기준) */
  const taskClick = useRef(onTaskClick);
  taskClick.current = onTaskClick;
  const docRefs = useMemo(
    () => store.docs.map((d) => ({ id: d.id, title: titleOf(d), icon: d.icon, gone: hidden.has(d.id) })),
    [store.docs, hidden],
  );
  const taskRefs = useMemo(() => tasks.map((t) => ({ key: t.key, title: t.title, status: t.status })), [tasks]);
  const fileUrl = store.fileUrl;
  const refs = useMemo<WikiRefs>(() => ({
    docs: docRefs,
    tasks: taskRefs,
    openDoc: (id) => { setActiveId(id); setQuery(''); },
    openTask: (key) => taskClick.current?.(key),
    fileUrl,
  }), [docRefs, taskRefs, fileUrl]);

  /* ── 동작 ── */

  const select = (id: string) => {
    setActiveId(id);
    setQuery('');
    setDialog(null);
  };

  const toggleOpen = (id: string) =>
    setOpenList((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const siblingsOf = useCallback((parentId: string | null, except?: string) =>
    live.filter((d) => (d.parentId ?? null) === parentId && d.id !== except).sort((a, b) => a.order - b.order), [live]);

  const handleCreate = (templateId: string, title: string) => {
    const tpl = DOC_TEMPLATES.find((t) => t.id === templateId);
    const parentId = creatingUnder ?? null;
    const last = siblingsOf(parentId).at(-1);
    const created = store.create({ title, body: tpl?.body ?? '', parentId, author: me, order: between(last?.order, undefined) });
    if (parentId) setOpenList((prev) => [...new Set([...prev, parentId])]);
    setCreatingUnder(undefined);
    setActiveId(created.id);
    setEditingId(created.id);
    setFocusFor(created.id);
  };

  /** [[ 목록의 '새 문서' - 지금 문서 아래에 빈 문서를 만든다 */
  const createSub = (title: string) => {
    if (!doc) return null;
    const last = siblingsOf(doc.id).at(-1);
    const made = store.create({ title, body: '', parentId: doc.id, author: me, order: between(last?.order, undefined) });
    setOpenList((prev) => [...new Set([...prev, doc.id])]);
    onNotice?.(`'${title}' 문서를 만들었습니다`, 'ok');
    return { id: made.id, title: made.title };
  };

  /* 지워진 문서의 마지막 글을 새 문서로 남긴다. 위 문서도 지워졌으면 맨 위에 둔다 */
  const keepLost = () => {
    if (!lost) return;
    const { doc: d } = lost;
    const parentId = d.parentId && byId.has(d.parentId) && !hidden.has(d.parentId) ? d.parentId : null;
    const created = store.create({ title: d.title.trim() || '제목 없는 문서', body: d.body, parentId, author: me, icon: d.icon, labels: d.labels });
    if (parentId) setOpenList((prev) => [...new Set([...prev, parentId])]);
    setLost(null);
    setActiveId(created.id);
    setEditingId(created.id);
    setFocusFor(created.id);
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

  /** 휴지통으로 - 위키 표가 없으면(예전 표) 예전처럼 묻고 바로 지운다 */
  const trashDoc = async (d: Doc) => {
    if (!wikiOn) {
      const yes = await askDelete(d, store.docs.some((x) => x.parentId === d.id));
      if (yes) store.remove(d.id);
      return;
    }
    if (editingId === d.id) setEditingId(null);
    store.update(d.id, { trashedAt: new Date().toISOString(), trashedBy: me });
    onNotice?.(`'${titleOf(d)}' 문서를 휴지통으로 옮겼습니다. 휴지통에서 되살릴 수 있습니다`, 'ok');
  };

  /** 되살리기 - 위 문서가 없거나 아직 휴지통에 있으면 맨 위로 */
  const restoreDoc = (id: string) => {
    const d = byId.get(id);
    if (!d) return;
    const parentOk = !d.parentId || (byId.has(d.parentId) && !hidden.has(d.parentId));
    store.update(id, { trashedAt: null, trashedBy: null, ...(parentOk ? {} : { parentId: null }) });
    onNotice?.(`'${titleOf(d)}' 문서를 되살렸습니다`, 'ok');
  };

  const purge = (ids: string[]) => {
    ids.forEach((id) => store.remove(id));
    onNotice?.(ids.length > 1 ? `문서 ${ids.length}건을 영구 삭제했습니다` : '문서를 영구 삭제했습니다', 'ok');
  };

  const duplicate = (d: Doc) => {
    const sibs = siblingsOf(d.parentId ?? null);
    const next = sibs[sibs.findIndex((x) => x.id === d.id) + 1];
    const made = store.create({
      title: `${titleOf(d)} (사본)`, body: d.body, parentId: d.parentId, author: me, icon: d.icon, labels: d.labels,
      order: between(d.order, next?.order),
    });
    setActiveId(made.id);
    onNotice?.('사본을 만들었습니다', 'ok');
  };

  const moveTo = (d: Doc, parentId: string | null) => {
    const last = siblingsOf(parentId, d.id).at(-1);
    store.update(d.id, { parentId, order: between(last?.order, undefined) });
    if (parentId) setOpenList((prev) => [...new Set([...prev, parentId])]);
    setDialog(null);
    onNotice?.(parentId ? `'${titleOf(byId.get(parentId) ?? d)}' 아래로 옮겼습니다` : '맨 위 문서로 옮겼습니다', 'ok');
  };

  /** 트리에서 끌어 놓기 */
  const onDrop = (id: string, target: string | null, zone: DropZone) => {
    const d = byId.get(id);
    if (!d) return;
    if (target === null) {
      moveTo(d, null);
      return;
    }
    const t = byId.get(target);
    if (!t || t.id === id) return;
    if (zone === 'inside') {
      if (t.id === d.parentId) return;
      moveTo(d, t.id);
      return;
    }
    const parentId = t.parentId ?? null;
    const sibs = siblingsOf(parentId, id);
    const at = sibs.findIndex((x) => x.id === t.id);
    const prev = zone === 'before' ? sibs[at - 1] : t;
    const next = zone === 'before' ? t : sibs[at + 1];
    let order = between(prev?.order, next?.order);
    if (prev && next && Math.abs(next.order - prev.order) < 1e-6) {
      // 같은 자리에 수십 번 끼워 넣어 사이가 바닥나면 그때만 형제 전체를 다시 매긴다
      const list = [...sibs];
      list.splice(zone === 'before' ? at : at + 1, 0, d);
      list.forEach((x, i) => {
        const o = (i + 1) * 1000;
        if (x.id === id) order = o;
        else if (x.order !== o) store.update(x.id, { order: o });
      });
    }
    store.update(id, { parentId, order });
  };

  const copyLink = async (d: Doc) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('doc', d.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      onNotice?.('문서 링크를 복사했습니다', 'ok');
    } catch {
      onNotice?.('링크를 복사하지 못했습니다. 주소창의 주소를 복사해 주세요', 'err');
    }
  };

  const exportMd = (d: Doc) => {
    const blob = new Blob([`# ${titleOf(d)}\n\n${d.body}\n`], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${titleOf(d).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  /** 인쇄 · PDF - 본문을 복사해 인쇄 전용 칸에 놓고 나머지 화면은 인쇄에서 뺀다(wiki.css) */
  const printDoc = (d: Doc) => {
    const ed = editorRef.current;
    if (!ed || ed.isDestroyed) return;
    const root = document.createElement('div');
    root.className = 'tm-print-root';
    const h = document.createElement('h1');
    h.textContent = `${d.icon ? `${d.icon} ` : ''}${titleOf(d)}`;
    const meta = document.createElement('p');
    meta.className = 'tm-print-meta';
    const who = members.find((m) => m.id === d.updatedBy)?.name;
    meta.textContent = `${who ? `${who} · ` : ''}마지막 수정 ${localDay(d.updatedAt)}`;
    const body = ed.view.dom.cloneNode(true) as HTMLElement;
    body.removeAttribute('contenteditable');
    root.append(h, meta, body);
    document.body.appendChild(root);
    const done = () => {
      root.remove();
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
  };

  /** 마크다운 파일 가져오기 - 첫 줄의 # 제목을 문서 제목으로 */
  const importFiles = async (files: File[]) => {
    let last: string | null = null;
    for (const f of files) {
      if (f.size > 2 * 1024 * 1024) {
        onNotice?.(`'${f.name}' 은(는) 2MB 가 넘어 가져오지 않았습니다`, 'err');
        continue;
      }
      const text = (await f.text()).replace(/^﻿/, '');
      const m = /^#\s+(.+)\n+/.exec(text);
      const title = (m?.[1] ?? f.name.replace(/\.(md|markdown|txt)$/i, '')).trim() || '가져온 문서';
      const lastRoot = siblingsOf(null).at(-1);
      last = store.create({ title, body: m ? text.slice(m[0].length) : text, parentId: null, author: me, order: between(lastRoot?.order, undefined) }).id;
    }
    if (last) {
      setActiveId(last);
      onNotice?.(files.length > 1 ? `문서 ${files.length}건을 가져왔습니다` : '문서를 가져왔습니다', 'ok');
    }
  };

  const restoreVersion = async (v: DocVersion) => {
    if (!doc) return;
    try {
      await store.snapshot(doc.id);
    } catch (e) {
      onNotice?.(e instanceof Error ? e.message : '되돌리지 못했습니다', 'err');
      return;
    }
    // 되돌린 모습은 보기 모드로 보여 준다(편집기가 다른 사람의 저장으로 바뀐 것처럼 알리지 않게)
    setEditingId(null);
    store.update(doc.id, { title: v.title.trim() || doc.title, body: v.body, updatedBy: me });
    setDialog(null);
    onNotice?.(`${localDay(v.editedAt)} 판으로 되돌렸습니다. 되돌리기 전 모습은 기록에 남았습니다`, 'ok');
  };

  const toggleStar = (id: string) =>
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));

  /* 휴지통으로 간 문서는 편집을 푼다 */
  useEffect(() => {
    if (editingId && hidden.has(editingId)) setEditingId(null);
  }, [editingId, hidden]);

  if (!store.ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>
    );
  }

  const starredDocs = starred.map((id) => byId.get(id)).filter((d): d is Doc => !!d && !hidden.has(d.id));
  const menu: MenuEntry[] = doc ? [
    { label: starred.includes(doc.id) ? '즐겨찾기에서 빼기' : '즐겨찾기에 넣기', onSelect: () => toggleStar(doc.id), disabled: !canEdit },
    { label: '링크 복사', onSelect: () => void copyLink(doc) },
    { label: '아래에 새 문서', onSelect: () => setCreatingUnder(doc.id), disabled: !canEdit, sep: true },
    { label: '사본 만들기', onSelect: () => duplicate(doc), disabled: !canEdit },
    { label: '옮기기', onSelect: () => setDialog('move'), disabled: !canEdit },
    ...(wikiOn ? [{ label: '기록 · 예전 판', onSelect: () => setDialog('history'), sep: true }] : []),
    { label: '마크다운으로 내려받기', onSelect: () => exportMd(doc), sep: !wikiOn },
    { label: '인쇄 · PDF', onSelect: () => printDoc(doc) },
    { label: '넓게 보기', onSelect: toggleWide, checked: wide, sep: true },
    ...(canEdit ? [{ label: wikiOn ? '휴지통으로 옮기기' : '문서 삭제', onSelect: () => void trashDoc(doc), danger: true, sep: true }] : []),
  ] : [];

  return (
    <>
      <PageHead
        title="팀 위키"
        lead="회의록, 요구사항, 인수인계처럼 팀이 함께 보는 문서를 모읍니다. 편집에서 / 를 누르면 표 · 목록 · 알림 상자를, [[ 를 치면 다른 문서나 작업을 넣습니다."
      >
        <button type="button" onClick={() => setDialog('find')} className={`${tmBtn} max-[720px]:ml-auto max-[720px]:px-3.5`} title="문서 찾기 (Ctrl+K)">
          <IconSearch />
          <span className="max-[720px]:sr-only">찾기</span>
          <kbd className="rounded-md border border-tm-line bg-tm-bg px-1.5 text-[11.5px] font-bold text-tm-sub max-[720px]:hidden">Ctrl K</kbd>
        </button>
        <button type="button" onClick={() => setCreatingUnder(null)} className={tmBtnPrimary}>
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

        {/* ── 문서 트리 ── */}
        <aside className="hidden w-[272px] shrink-0 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm md:flex">
          <div className="relative flex-none border-b border-tm-line p-3">
            <span className="pointer-events-none absolute left-[26px] top-1/2 -translate-y-1/2 text-tm-sub">
              <IconSearch size={17} />
            </span>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); } }}
              placeholder="문서 검색 · #라벨" aria-label="문서 검색"
              className={`${tmFieldBase} h-11 w-full pl-10 pr-3 text-[15px]`} />
          </div>

          <nav aria-label="문서 목록" className="min-h-0 flex-1 overflow-y-auto p-2">
            {searchHits ? (
              searchHits.length === 0 ? (
                <p className="px-2 py-8 text-center text-[14px] text-tm-sub">찾는 문서가 없습니다.</p>
              ) : (
                <ul className="space-y-0.5">
                  {searchHits.map(({ d, text }) => (
                    <li key={d.id}>
                      <FlatRow doc={d} active={d.id === activeId} onSelect={() => select(d.id)}
                        sub={text && !titleOf(d).toLowerCase().includes(query.trim().toLowerCase())
                          ? <Snippet text={text} q={query.trim()} /> : pathOf(d, byId) || undefined} />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                {starredDocs.length > 0 && (
                  <div className="mb-2 border-b border-tm-line pb-2">
                    <p className="mx-2 mb-1 mt-1 text-[12.5px] font-bold text-tm-sub">즐겨찾기</p>
                    <ul className="space-y-0.5">
                      {starredDocs.map((d) => (
                        <li key={d.id}><FlatRow doc={d} active={d.id === activeId} onSelect={() => select(d.id)} /></li>
                      ))}
                    </ul>
                  </div>
                )}
                <DocTree roots={tree} activeId={activeId} openSet={openSet} onToggle={toggleOpen} onSelect={select}
                  onAddChild={(id) => setCreatingUnder(id)} onDrop={onDrop} canDrag watched={watched} />
              </>
            )}
          </nav>

          <div className="flex flex-none items-center gap-1 border-t border-tm-line p-2">
            {wikiOn && (
              <button type="button" onClick={() => setDialog('trash')}
                className="flex min-h-[38px] flex-1 items-center gap-2 rounded-tm-sm px-2.5 text-[14px] font-semibold text-tm-ink transition-colors hover:bg-tm-tint">
                <TrashGlyph />
                휴지통
                {trashed.length > 0 && <span className="ml-auto rounded-full bg-tm-bg px-2 text-[12.5px] font-bold tabular-nums text-tm-sub">{trashed.length}</span>}
              </button>
            )}
            <button type="button" onClick={() => importRef.current?.click()} title="마크다운(.md) 파일을 문서로 가져옵니다"
              className="flex min-h-[38px] items-center gap-2 rounded-tm-sm px-2.5 text-[14px] font-semibold text-tm-ink transition-colors hover:bg-tm-tint">
              가져오기
            </button>
            <input ref={importRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" multiple hidden
              onChange={(e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = '';
                void importFiles(files);
              }} />
          </div>
        </aside>

        {/* ── 본문 ── */}
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
            {/* 문서 막대 - 경로 · 함께 보는 사람 · 동작 */}
            <div className="flex flex-none flex-wrap items-center gap-2 border-b border-tm-line px-5 py-2.5 max-[720px]:px-3">
              <div className="min-w-0 flex-1 basis-full md:hidden">
                <label className="sr-only" htmlFor="doc-pick">문서 고르기</label>
                <select id="doc-pick" value={hidden.has(doc.id) ? '' : doc.id} onChange={(e) => select(e.target.value)}
                  className={`${tmSelect} h-10 w-full text-[15px]`}>
                  {hidden.has(doc.id) && <option value="">{titleOf(doc)} (휴지통)</option>}
                  {flat.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <nav aria-label="문서 경로" className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 text-[13.5px] font-semibold text-tm-sub md:flex">
                {breadcrumb.map((b, i) => (
                  <span key={b.id} className="flex min-w-0 items-center gap-1">
                    {i > 0 && <span className="text-tm-edge" aria-hidden>/</span>}
                    <button type="button" onClick={() => select(b.id)} aria-current={i === breadcrumb.length - 1 ? 'page' : undefined}
                      className={`flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 ${i === breadcrumb.length - 1 ? 'text-tm-ink' : 'transition-colors hover:bg-tm-tint hover:text-tm-blue'}`}>
                      {b.icon && <span aria-hidden>{b.icon}</span>}
                      <span className="max-w-[220px] truncate">{titleOf(b)}</span>
                    </button>
                  </span>
                ))}
              </nav>

              <div className="flex flex-none items-center gap-1.5 max-md:ml-auto">
                {here2.length > 0 && (
                  <span className="mr-1 flex items-center -space-x-1.5" aria-label={`함께 보는 사람 ${here2.length}명`}>
                    {here2.slice(0, 4).map((p) => (
                      <span key={p.member} className={`rounded-full ring-2 ${p.editing ? 'ring-tm-ok' : 'ring-white'}`}>
                        <Avatar id={p.member} size={26} />
                      </span>
                    ))}
                  </span>
                )}
                {wikiOn && (
                  <button type="button" title="댓글로 가기" aria-label={`댓글 ${commentCount}개`}
                    className="inline-flex h-[38px] items-center gap-1.5 rounded-tm-sm border border-tm-edge bg-white px-2.5 text-[13.5px] font-bold text-tm-ink transition-colors
                               hover:border-tm-blue hover:bg-tm-tint [@media(pointer:coarse)]:h-11"
                    onClick={() => scrollWithin(document.getElementById(`comments-${doc.id}`))}>
                    <CommentGlyph />
                    <span className="tabular-nums">{commentCount}</span>
                  </button>
                )}
                {canEdit && (
                  <button type="button" className={tmIconBtn} aria-pressed={starred.includes(doc.id)}
                    title={starred.includes(doc.id) ? '즐겨찾기에서 빼기' : '즐겨찾기에 넣기'}
                    aria-label={starred.includes(doc.id) ? '즐겨찾기에서 빼기' : '즐겨찾기에 넣기'}
                    onClick={() => toggleStar(doc.id)}>
                    <StarGlyph on={starred.includes(doc.id)} />
                  </button>
                )}
                {canEdit && (
                  <button type="button" onClick={() => setEditingId(editing ? null : doc.id)} data-on={editing ? '' : undefined}
                    className={tmEditBtn} title="편집 (E)">
                    {editing ? '편집 끝내기' : '편집'}
                  </button>
                )}
                <DropMenu label="문서 메뉴" items={menu} className={tmIconBtn}>
                  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="currentColor">
                    <circle cx="4.5" cy="10" r="1.6" /><circle cx="10" cy="10" r="1.6" /><circle cx="15.5" cy="10" r="1.6" />
                  </svg>
                </DropMenu>
              </div>
            </div>

            {/* 본문 + 목차 */}
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
              <div className={`mx-auto flex gap-8 px-7 pb-16 pt-6 max-[720px]:px-4 max-[720px]:pt-4 md:pl-[66px] ${wide ? 'max-w-none' : 'max-w-[1120px]'}`}>
                <article className="min-w-0 flex-1">
                  {/* 휴지통 · 함께 편집 알림 */}
                  {doc.trashedAt && (
                    <TrashBanner doc={doc} onRestore={() => restoreDoc(doc.id)}
                      onPurge={async () => {
                        const yes = await askDelete(doc, store.docs.some((x) => x.parentId === doc.id));
                        if (yes) purge([doc.id]);
                      }} />
                  )}
                  {trashedAbove && (
                    <div role="status" className={`${tmCallout} mb-5 border-l-tm-red`}>
                      <p className="min-w-0 flex-[1_1_280px]">
                        위 문서 <b className="font-bold text-tm-deep">{titleOf(trashedAbove)}</b> 와 함께 휴지통에 있습니다. 읽기만 할 수 있습니다.
                      </p>
                      <button type="button" className={tmGhostBtn} onClick={() => restoreDoc(trashedAbove.id)}>위 문서째 되살리기</button>
                    </div>
                  )}
                  {othersEditing.length > 0 && (
                    <div role="status" className={`${tmCallout} mb-5 border-l-tm-warn`}>
                      <p className="min-w-0 flex-[1_1_280px]">
                        <b className="font-bold text-tm-deep">{othersEditing.map((p) => members.find((m) => m.id === p.member)?.name ?? '팀원').join(', ')}</b>
                        님이 이 문서를 편집하고 있습니다. 같은 곳을 함께 고치면 나중에 저장한 쪽이 남으니 말을 맞추세요. 덮인 내용은 기록에서 찾을 수 있습니다.
                      </p>
                    </div>
                  )}

                  {/* 아이콘 · 제목 */}
                  <div className="relative mb-1">
                    {wikiOn && editing ? (
                      <div className="relative mb-1">
                        <button type="button" onClick={() => setIconOpen((v) => !v)} aria-expanded={iconOpen}
                          className={doc.icon
                            ? 'grid h-14 w-14 place-items-center rounded-tm-sm text-[40px] leading-none transition-colors hover:bg-tm-tint'
                            : 'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13.5px] font-semibold text-tm-sub transition-colors hover:bg-tm-tint hover:text-tm-blue'}
                          aria-label={doc.icon ? '아이콘 바꾸기' : '아이콘 넣기'}>
                          {doc.icon || <>☺ 아이콘 넣기</>}
                        </button>
                        {iconOpen && (
                          <EmojiPicker value={doc.icon} onClose={() => setIconOpen(false)}
                            onPick={(v) => { store.update(doc.id, { icon: v }); setIconOpen(false); }} />
                        )}
                      </div>
                    ) : doc.icon ? (
                      <div className="mb-1 text-[40px] leading-[1.2]" aria-hidden>{doc.icon}</div>
                    ) : null}
                    {editing ? (
                      <TitleField key={doc.id} saved={doc.title}
                        onSave={(title) => store.update(doc.id, { title, updatedBy: me })}
                        onEnter={() => focusEditor(editorRef.current, 'start')} />
                    ) : (
                      <h2 className="text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em] text-tm-deep [overflow-wrap:anywhere] max-[720px]:text-[23px]">
                        {titleOf(doc)}
                      </h2>
                    )}
                  </div>

                  <DocMeta doc={doc} editing={editing} onLabels={(labels) => store.update(doc.id, { labels })}
                    onLabelClick={(l) => setQuery(`#${l}`)} sync={editing ? store.sync : undefined} />

                  <div className="mt-6">
                    <DocEditor key={doc.id}
                      body={doc.body}
                      editable={editing}
                      checkable={canEdit}
                      onChange={(md) => store.update(doc.id, { body: md, updatedBy: me })}
                      refs={refs}
                      selfId={doc.id}
                      upload={store.features.files ? (f) => store.upload(f, doc.id) : undefined}
                      allowData={!isRemote}
                      onCreateDoc={canEdit ? createSub : undefined}
                      onNotice={onNotice}
                      onHeadings={setHeadings}
                      editorRef={editorRef}
                      autoFocus={focusFor === doc.id}
                      onRequestEdit={canEdit ? () => setEditingId(doc.id) : undefined}
                      className={canEdit ? '' : 'tm-readonly-checks'} />
                  </div>

                  {!editing && !doc.body.trim() && (
                    <p className="py-6 text-[15.5px] text-tm-sub">
                      내용이 비어 있습니다.{canEdit ? ' 편집을 눌러 작성하세요.' : ''}
                    </p>
                  )}

                  {editing && (
                    <p className="mt-6 text-[13.5px] leading-[1.6] text-tm-sub">
                      / 블록 넣기 · [[ 문서 · 작업 링크 · @ 사람 언급 · 그림은 붙여 넣거나 끌어다 놓기 · 고친 내용은 저절로 저장됩니다.
                      {' '}본문에 <code className="tm-mono rounded-md bg-tm-tint px-1.5 py-0.5 text-[12.5px] text-tm-deep">MATE-104</code> 처럼 적으면 그 작업으로 가는 링크가 됩니다.
                    </p>
                  )}

                  {/* 하위 문서 · 이 문서를 링크한 문서 */}
                  {(children.length > 0 || backlinks.length > 0) && !editing && (
                    <div className="mt-12 grid gap-6 border-t border-tm-line pt-7 lg:grid-cols-2">
                      {children.length > 0 && (
                        <section aria-labelledby={`kids-${doc.id}`}>
                          <h3 id={`kids-${doc.id}`} className="mb-2.5 text-[14px] font-bold text-tm-sub">하위 문서 {children.length}</h3>
                          <ul className="space-y-1">
                            {children.map((c) => (
                              <li key={c.id}>
                                <button type="button" onClick={() => select(c.id)}
                                  className="flex w-full items-center gap-2.5 rounded-tm-sm border border-tm-line px-3 py-2.5 text-left transition-colors hover:border-tm-blue hover:bg-tm-tint">
                                  <span className="text-tm-sub"><DocIcon icon={c.icon} size={18} /></span>
                                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-tm-ink">{titleOf(c)}</span>
                                  <span className="flex-none text-[12.5px] tabular-nums text-tm-sub">{ago(c.updatedAt)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {backlinks.length > 0 && (
                        <section aria-labelledby={`backs-${doc.id}`}>
                          <h3 id={`backs-${doc.id}`} className="mb-2.5 text-[14px] font-bold text-tm-sub">이 문서를 링크한 문서 {backlinks.length}</h3>
                          <ul className="space-y-1">
                            {backlinks.map((b) => (
                              <li key={b.id}>
                                <button type="button" onClick={() => select(b.id)}
                                  className="flex w-full items-center gap-2.5 rounded-tm-sm px-3 py-2 text-left transition-colors hover:bg-tm-tint">
                                  <span className="text-tm-sub"><DocIcon icon={b.icon} size={18} /></span>
                                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-tm-blue underline underline-offset-[3px]">{titleOf(b)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}

                  {wikiOn && (
                    <Comments docId={doc.id} comments={docComments} me={me} canWrite={canEdit}
                      onAdd={(body, parentId) => store.addComment({ docId: doc.id, parentId, body, author: me })}
                      onUpdate={(id, patch) => store.updateComment(id, patch)}
                      onTaskClick={onTaskClick} />
                  )}
                </article>

                {/* 목차 */}
                {headings.length > 1 && (
                  <nav aria-label="목차" className="hidden w-[188px] shrink-0 xl:block">
                    <div className="sticky top-0 max-h-[calc(100dvh-220px)] overflow-y-auto pt-1">
                      <p className="mb-2.5 text-[13px] font-bold text-tm-sub">이 문서에서</p>
                      <ul className="space-y-0.5 border-l-2 border-tm-line">
                        {headings.map((h) => (
                          <li key={h.pos}>
                            <button type="button" onClick={() => scrollToPos(editorRef.current, h.pos)}
                              aria-current={here === h.pos ? 'location' : undefined}
                              className={`-ml-0.5 block w-full border-l-2 py-1 text-left text-[13.5px] font-semibold leading-snug transition-colors duration-150 ${
                                here === h.pos ? 'border-tm-blue text-tm-blue' : 'border-transparent text-tm-sub hover:border-tm-blue hover:text-tm-ink'}`}
                              style={{ paddingLeft: 12 + (h.level - 1) * 10 }}>
                              {h.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </nav>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {creatingUnder !== undefined && (
        <NewDocDialog
          parentTitle={creatingUnder ? titleOf(byId.get(creatingUnder) ?? { title: '' }) : null}
          onCreate={handleCreate}
          onClose={() => setCreatingUnder(undefined)} />
      )}
      {dialog === 'find' && (
        <QuickFind docs={live} recent={recent} starred={starred} onOpen={select} onClose={() => setDialog(null)} />
      )}
      {dialog === 'move' && doc && (
        <MoveDialog doc={doc} docs={live} onMove={(p) => moveTo(doc, p)} onClose={() => setDialog(null)} />
      )}
      {dialog === 'trash' && (
        <TrashDialog docs={trashed} onOpen={select} onRestore={restoreDoc} onPurge={purge} onClose={() => setDialog(null)} />
      )}
      {dialog === 'history' && doc && (
        <HistoryDialog doc={doc} store={store} refs={refs} onRestore={restoreVersion} onClose={() => setDialog(null)} />
      )}
      {deleteNode}
    </>
  );
}

/** 쓴 사람 · 고친 사람 · 읽는 시간 · 라벨 */
function DocMeta({ doc, editing, onLabels, onLabelClick, sync }: {
  doc: Doc; editing: boolean; onLabels(labels: string[]): void; onLabelClick(l: string): void; sync?: DocStore['sync'];
}) {
  const author = useMember(doc.author);
  const editor = useMember(doc.updatedBy);
  const reading = readingLabel(doc);
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13.5px] text-tm-sub">
      <span className="inline-flex items-center gap-2 font-semibold">
        <Avatar id={doc.author} size={22} />
        {author?.name ?? '알 수 없음'}
      </span>
      <span className="tabular-nums" title={new Date(doc.updatedAt).toLocaleString('ko-KR')}>
        {editor && editor.id !== author?.id ? `${editor.name} · ` : ''}{ago(doc.updatedAt)} 고침
      </span>
      {reading && <span>{reading}</span>}
      {editing ? (
        <LabelEditor labels={doc.labels} onChange={onLabels} />
      ) : (
        doc.labels.map((l) => (
          <button key={l} type="button" onClick={() => onLabelClick(l)} title={`'${l}' 라벨이 붙은 문서 보기`}
            className="rounded-full bg-tm-tint px-2.5 py-0.5 text-[12.5px] font-bold text-tm-deep transition-colors hover:bg-tm-blue hover:text-white">
            {l}
          </button>
        ))
      )}
      {editing && sync !== undefined && (
        <span className="ml-auto inline-flex items-center gap-2 text-[13px] font-semibold" aria-live="polite">
          <i className={`h-2 w-2 rounded-full ${sync === 'error' ? 'bg-tm-red' : sync === 'saving' ? 'bg-tm-edge' : 'bg-tm-ok'}`} aria-hidden />
          {/* error = 아직 서버에 닿지 않은 고침이 있다(저절로 다시 보내는 중이거나 서버가 거절했다) */}
          {sync === 'error' ? '저장하지 못한 변경이 있습니다' : sync === 'saving' ? '저장 중…' : '자동 저장됨'}
        </span>
      )}
    </div>
  );
}

function TrashBanner({ doc, onRestore, onPurge }: { doc: Doc; onRestore(): void; onPurge(): void }) {
  const who = useMember(doc.trashedBy);
  return (
    <div role="status" className={`${tmCallout} mb-5 border-l-tm-red`}>
      <p className="min-w-0 flex-[1_1_280px]">
        <b className="font-bold text-tm-red-deep">휴지통에 있는 문서입니다.</b>{' '}
        {who ? `${who.name}님이 ` : ''}{doc.trashedAt ? ago(doc.trashedAt) : ''} 옮겼습니다. 읽기만 할 수 있습니다.
      </p>
      <div className="flex flex-none gap-2">
        <button type="button" className={tmEditBtn} onClick={onRestore}>되살리기</button>
        <button type="button" className={`${tmGhostBtn} text-tm-red-deep`} onClick={onPurge}>영구 삭제</button>
      </div>
    </div>
  );
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-tm-sub">
      <path d="M3.5 5.5h13M8 5.5V3.8h4v1.7M5 5.5l.8 11h8.4l.8-11M8.5 9v4.5M11.5 9v4.5" />
    </svg>
  );
}

function CommentGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12v9H9l-4 3v-3H4z" />
    </svg>
  );
}

function StarGlyph({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill={on ? '#f5b800' : 'none'} stroke={on ? '#c48f00' : 'currentColor'} strokeWidth="1.7" strokeLinejoin="round">
      <path d="M10 2.8l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 8.1l5-.7z" />
    </svg>
  );
}
