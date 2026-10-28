'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { DOC_TEMPLATES, localDay, type Doc, type DocComment, type DocVersion } from './types';
import { useMember, useMembers } from './members';
import { diffBlocks, mdToDoc, plainText } from './docMarkdown';
import type { DocStore } from './docStore';
import DocEditor, { keepInView, type WikiRefs } from './DocEditor';
import Markdown from './Markdown';
import {
  Avatar, IconSearch, Modal,
  tmBtn, tmBtnPrimary, tmFieldBase, tmGhostBtn, tmGhostDanger, tmInput, tmLabel, tmTextarea, tmTextBtn,
  useConfirm,
} from './ui';

/*
 * 팀 위키의 창 · 조각 - 빠른 찾기, 기록, 댓글, 휴지통, 옮기기, 아이콘 고르기, 새 문서.
 * 모양은 작업 화면의 창(Modal)과 같은 세종 관리자 결을 따른다.
 */

/* ── 작은 도움 ───────────────────────────────────────── */

/** 화면에 적는 제목 - 예전 편집기가 빈 제목을 저장한 문서도 목록 · 경로에서 빈 줄로 보이지 않게 */
export const titleOf = (d: { title: string }) => d.title.trim() || '제목 없는 문서';

/** 3분 전 · 어제 · 2026-10-02 */
export function ago(stamp: string, now = Date.now()): string {
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

/** 문서 · 본문을 글자로 - 검색할 때마다 다시 풀지 않게 본문이 같으면 둔다 */
const plainMemo = new Map<string, { body: string; text: string }>();
export function plainOf(d: Doc): string {
  const hit = plainMemo.get(d.id);
  if (hit && hit.body === d.body) return hit.text;
  const text = plainText(d.body);
  plainMemo.set(d.id, { body: d.body, text });
  return text;
}

/** 읽는 데 걸리는 시간 - 한글 기준 1분에 500자 */
export function readingLabel(d: Doc): string {
  const n = plainOf(d).replace(/\s/g, '').length;
  if (n === 0) return '';
  const min = Math.round(n / 500);
  return min < 1 ? '1분 안에 읽음' : `읽는 데 약 ${min}분`;
}

/** 찾은 곳 앞뒤 글 */
export function Snippet({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text.slice(0, 90)}</>;
  const from = Math.max(0, i - 30);
  return (
    <>
      {from > 0 && '…'}
      {text.slice(from, i)}
      <mark className="rounded-sm bg-[#ffe066] px-0.5 text-tm-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length, i + q.length + 60)}
    </>
  );
}

/**
 * 이 브라우저에 사람마다 따로 두는 목록(즐겨찾기 · 최근 본 문서 · 펼친 문서). 저장이 막혀 있어도 화면은 돈다.
 * 세 번째 값 = 저장된 목록을 읽었는가(읽기 전에는 빈 목록이다)
 */
export function useStoredList(key: string, max = 50): [string[], (f: (prev: string[]) => string[]) => void, boolean] {
  const [list, setList] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      setList(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
    } catch {
      setList([]);
    }
    setLoaded(true);
  }, [key]);
  const update = useCallback((f: (prev: string[]) => string[]) => {
    setList((prev) => {
      const next = f(prev).slice(0, max);
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* 막혀 있으면 이번 화면에서만 */ }
      return next;
    });
  }, [key, max]);
  return [list, update, loaded];
}

/** 문서 아이콘 - 이모지가 없으면 문서 그림 */
export function DocIcon({ icon, size = 16, className = '' }: { icon?: string; size?: number; className?: string }) {
  if (icon) {
    return <span aria-hidden className={`inline-grid shrink-0 place-items-center leading-none ${className}`} style={{ width: size + 2, fontSize: size - 1 }}>{icon}</span>;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className={`shrink-0 ${className}`}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 3h6l3.5 3.5V17h-9.5z" />
      <path d="M11.5 3v3.5H15" />
    </svg>
  );
}

/** 문서까지의 경로 - 위 문서들의 제목 */
export function pathOf(d: Doc, byId: Map<string, Doc>): string {
  const out: string[] = [];
  let cur = d.parentId ? byId.get(d.parentId) : undefined;
  let guard = 0;
  while (cur && guard < 50) {
    out.unshift(titleOf(cur));
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    guard += 1;
  }
  return out.join(' / ');
}

/* ── 펼침 메뉴 ───────────────────────────────────────── */

export interface MenuEntry {
  label: string;
  onSelect(): void;
  hint?: string;
  danger?: boolean;
  checked?: boolean;
  disabled?: boolean;
  /** 이 항목 앞에 구분선 */
  sep?: boolean;
}

/** 버튼 + 아래로 펼치는 메뉴. ↑ ↓ 로 오가고 Esc · 바깥 누르기 · Tab 으로 닫는다 */
export function DropMenu({ label, items, children, className, align = 'right' }: {
  label: string; items: MenuEntry[]; children: React.ReactNode; className: string; align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', down);
    box.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
    return () => document.removeEventListener('pointerdown', down);
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      btn.current?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const els = [...(box.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [])];
    const i = els.indexOf(document.activeElement as HTMLElement);
    els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
  };

  return (
    <div className="relative">
      <button ref={btn} type="button" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)} className={className}>
        {children}
      </button>
      {open && (
        <div ref={box} role="menu" aria-label={label} onKeyDown={onKey}
          className={`tm-popover ${align === 'right' ? 'right-0' : 'left-0'} w-[236px]`}>
          {items.map((it) => (
            <div key={it.label} className="contents">
              {it.sep && <div className="tm-menu-sep" role="separator" />}
              <button type="button" role={it.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                aria-checked={it.checked} disabled={it.disabled}
                className={`tm-menu-item${it.danger ? ' is-danger' : ''} disabled:opacity-40`}
                onClick={() => { setOpen(false); it.onSelect(); }}>
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.hint && <kbd className="text-[11.5px] font-semibold text-tm-sub">{it.hint}</kbd>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 아이콘 고르기 ───────────────────────────────────── */

const EMOJI = [
  '📘', '📗', '📕', '📙', '📓', '📒', '📄', '📝', '📋', '📌', '📎', '🗂️',
  '📁', '🗃️', '📊', '📈', '🧾', '🗒️', '📅', '⏰', '✅', '☑️', '❗', '❓',
  '💡', '🔥', '⭐', '🎯', '🚀', '🛠️', '⚙️', '🔧', '🧩', '🧪', '🐞', '🔒',
  '🔑', '🌐', '💻', '📱', '🖥️', '🎮', '🕶️', '🎨', '🖼️', '🎬', '🎓', '📚',
  '🧭', '🗺️', '🏗️', '🏢', '🤝', '💬', '📣', '🙋', '👥', '🧑‍💻', '💰', '🧮',
];

export function EmojiPicker({ value, onPick, onClose }: { value: string; onPick(v: string): void; onClose(): void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('keydown', key, true);
    box.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('keydown', key, true);
    };
  }, [onClose]);
  return (
    <div ref={box} role="dialog" aria-label="아이콘 고르기"
      className="absolute left-0 top-[calc(100%+6px)] z-[60] w-[300px] rounded-tm border border-tm-line bg-white p-3 shadow-tm-up">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-bold text-tm-sub">아이콘</p>
        {value && (
          <button type="button" className={tmTextBtn} onClick={() => onPick('')}>아이콘 없애기</button>
        )}
      </div>
      <div className="grid grid-cols-8 gap-1">
        {EMOJI.map((e) => (
          <button key={e} type="button" aria-label={e} aria-pressed={e === value} onClick={() => onPick(e)}
            className="grid h-9 w-9 place-items-center rounded-lg text-[20px] transition-colors hover:bg-tm-tint aria-pressed:bg-tm-tint aria-pressed:ring-2 aria-pressed:ring-tm-blue">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── 새 문서 ─────────────────────────────────────────── */

export function NewDocDialog({
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

/* ── 빠른 찾기(Ctrl K) ───────────────────────────────── */

export function QuickFind({ docs, recent, starred, onOpen, onClose }: {
  /** 살아 있는 문서 */
  docs: Doc[];
  recent: string[];
  starred: string[];
  onOpen(id: string): void;
  onClose(): void;
}) {
  const [q, setQ] = useState('');
  const [at, setAt] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);

  const hits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      // 비어 있으면 최근 본 문서 · 즐겨찾기
      const ids = [...recent, ...starred.filter((s) => !recent.includes(s))];
      return ids.map((id) => byId.get(id)).filter((d): d is Doc => !!d).slice(0, 12).map((d) => ({ d, text: '' }));
    }
    const scored: { d: Doc; text: string; score: number }[] = [];
    docs.forEach((d) => {
      const title = titleOf(d).toLowerCase();
      const body = plainOf(d);
      const labels = d.labels.join(' ').toLowerCase();
      let score = 0;
      if (title === query) score = 100;
      else if (title.startsWith(query)) score = 80;
      else if (title.includes(query)) score = 60;
      else if (labels.includes(query)) score = 40;
      else if (body.toLowerCase().includes(query)) score = 20;
      if (score) scored.push({ d, text: body, score });
    });
    return scored.sort((a, b) => b.score - a.score || Date.parse(b.d.updatedAt) - Date.parse(a.d.updatedAt)).slice(0, 30);
  }, [q, docs, recent, starred, byId]);

  useEffect(() => setAt(0), [q]);
  useEffect(() => {
    // 창 몸통(스크롤 칸) 안에서만 움직인다
    const li = list.current?.querySelector<HTMLElement>(`[data-i="${at}"]`) ?? null;
    keepInView(list.current?.closest<HTMLElement>('.overflow-auto') ?? null, li);
  }, [at]);

  return (
    <Modal title="문서 찾기" sub="제목 · 본문 · 라벨에서 찾습니다" onClose={onClose}>
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch /></span>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} aria-label="찾을 말"
          placeholder="찾을 말을 적으세요" role="combobox" aria-expanded aria-controls="tm-find-list"
          aria-activedescendant={hits[at] ? `tm-find-${hits[at].d.id}` : undefined}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setAt((x) => Math.min(x + 1, hits.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setAt((x) => Math.max(x - 1, 0)); }
            if (e.key === 'Enter' && hits[at]) { e.preventDefault(); onOpen(hits[at].d.id); }
          }}
          className={`${tmInput} pl-11`} />
      </div>
      {!q.trim() && hits.length > 0 && <p className="mb-1.5 text-[13px] font-bold text-tm-sub">최근 본 문서 · 즐겨찾기</p>}
      {hits.length === 0 ? (
        <p className="py-10 text-center text-[15px] text-tm-sub">{q.trim() ? '찾는 문서가 없습니다.' : '최근에 본 문서가 없습니다. 찾을 말을 적으세요.'}</p>
      ) : (
        <ul ref={list} id="tm-find-list" role="listbox" aria-label="찾은 문서" className="-mx-1 space-y-0.5">
          {hits.map(({ d, text }, i) => {
            const path = pathOf(d, byId);
            return (
              <li key={d.id} id={`tm-find-${d.id}`} role="option" aria-selected={i === at} data-i={i}>
                <button type="button" tabIndex={-1} onMouseEnter={() => setAt(i)} onClick={() => onOpen(d.id)}
                  className={`flex w-full items-start gap-3 rounded-tm-sm px-3 py-2.5 text-left transition-colors ${i === at ? 'bg-tm-tint' : ''}`}>
                  <span className="mt-[3px] text-tm-sub"><DocIcon icon={d.icon} size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[15px] font-bold text-tm-ink">{titleOf(d)}</b>
                    {path && <small className="block truncate text-[12.5px] text-tm-sub">{path}</small>}
                    {q.trim() && text && (
                      <span className="mt-0.5 block truncate text-[13.5px] text-tm-ink"><Snippet text={text} q={q.trim()} /></span>
                    )}
                  </span>
                  <span className="mt-0.5 flex-none text-[12.5px] tabular-nums text-tm-sub">{ago(d.updatedAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

/* ── 옮기기 ──────────────────────────────────────────── */

export function MoveDialog({ doc, docs, onMove, onClose }: {
  doc: Doc;
  /** 살아 있는 문서 */
  docs: Doc[];
  onMove(parentId: string | null): void;
  onClose(): void;
}) {
  const [q, setQ] = useState('');
  /* 자기 자신과 그 아래 문서 밑으로는 옮길 수 없다 */
  const blocked = useMemo(() => {
    const out = new Set([doc.id]);
    let grew = true;
    while (grew) {
      grew = false;
      docs.forEach((d) => {
        if (d.parentId && out.has(d.parentId) && !out.has(d.id)) { out.add(d.id); grew = true; }
      });
    }
    return out;
  }, [doc.id, docs]);
  const rows = useMemo(() => {
    const kids = new Map<string | null, Doc[]>();
    docs.forEach((d) => {
      const k = d.parentId && docs.some((x) => x.id === d.parentId) ? d.parentId : null;
      kids.set(k, [...(kids.get(k) ?? []), d]);
    });
    const out: { d: Doc; depth: number }[] = [];
    const walk = (p: string | null, depth: number) => {
      (kids.get(p) ?? []).sort((a, b) => a.order - b.order).forEach((d) => {
        if (blocked.has(d.id)) return;
        out.push({ d, depth });
        walk(d.id, depth + 1);
      });
    };
    walk(null, 0);
    const query = q.trim().toLowerCase();
    return query ? out.filter(({ d }) => titleOf(d).toLowerCase().includes(query)).map((r) => ({ ...r, depth: 0 })) : out;
  }, [docs, blocked, q]);

  return (
    <Modal title="옮기기" sub={`'${titleOf(doc)}' 문서를 어디 아래에 둘까요`} onClose={onClose}>
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch /></span>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="문서 이름으로 찾기" aria-label="옮길 곳 찾기"
          className={`${tmInput} pl-11`} />
      </div>
      <ul className="max-h-[52vh] space-y-0.5 overflow-y-auto">
        {!q.trim() && (
          <li>
            <button type="button" disabled={doc.parentId === null} onClick={() => onMove(null)}
              className="flex min-h-[42px] w-full items-center gap-2.5 rounded-tm-sm px-3 text-left text-[15px] font-bold text-tm-deep transition-colors hover:bg-tm-tint disabled:opacity-45">
              맨 위(최상위 문서로)
              {doc.parentId === null && <span className="text-[12.5px] font-semibold text-tm-sub">지금 자리</span>}
            </button>
          </li>
        )}
        {rows.map(({ d, depth }) => (
          <li key={d.id}>
            <button type="button" disabled={d.id === doc.parentId} onClick={() => onMove(d.id)}
              style={{ paddingLeft: 12 + depth * 18 }}
              className="flex min-h-[42px] w-full items-center gap-2.5 rounded-tm-sm pr-3 text-left text-[15px] font-semibold text-tm-ink transition-colors hover:bg-tm-tint disabled:opacity-45">
              <span className="text-tm-sub"><DocIcon icon={d.icon} /></span>
              <span className="min-w-0 truncate">{titleOf(d)}</span>
              {d.id === doc.parentId && <span className="ml-auto flex-none text-[12.5px] font-semibold text-tm-sub">지금 자리</span>}
            </button>
          </li>
        ))}
        {rows.length === 0 && <li className="py-8 text-center text-[14px] text-tm-sub">옮길 수 있는 문서가 없습니다.</li>}
      </ul>
    </Modal>
  );
}

/* ── 휴지통 ──────────────────────────────────────────── */

export function TrashDialog({ docs, onOpen, onRestore, onPurge, onClose }: {
  /** 휴지통에 넣은 문서(trashedAt 이 있는 것) */
  docs: Doc[];
  onOpen(id: string): void;
  onRestore(id: string): void;
  onPurge(ids: string[]): void;
  onClose(): void;
}) {
  const [confirm, confirmNode] = useConfirm();
  const sorted = [...docs].sort((a, b) => Date.parse(b.trashedAt ?? '') - Date.parse(a.trashedAt ?? ''));
  const purgeAll = async () => {
    const yes = await confirm({
      title: '휴지통을 비울까요?',
      body: <>휴지통의 문서 <b>{docs.length}건</b>과 그 아래 문서가 모두 지워집니다. 기록과 댓글도 함께 사라지고 되돌릴 수 없습니다.</>,
      ok: '모두 영구 삭제',
      tone: 'danger',
    });
    if (yes) onPurge(docs.map((d) => d.id));
  };
  return (
    <Modal title="휴지통" sub="지운 문서는 여기에 남습니다. 되살리면 원래 자리로 돌아갑니다." size="md" onClose={onClose}
      foot={docs.length ? (
        <>
          <button type="button" onClick={() => void purgeAll()} className={tmGhostDanger}>휴지통 비우기</button>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
        </>
      ) : undefined}>
      {sorted.length === 0 ? (
        <p className="py-12 text-center text-[15px] text-tm-sub">휴지통이 비어 있습니다.</p>
      ) : (
        <ul className="divide-y divide-tm-line">
          {sorted.map((d) => (
            <TrashRow key={d.id} doc={d} onOpen={() => onOpen(d.id)} onRestore={() => onRestore(d.id)}
              onPurge={async () => {
                const yes = await confirm({
                  title: '영구 삭제할까요?',
                  body: <><b>{titleOf(d)}</b> 문서와 그 아래 문서가 지워집니다. 되돌릴 수 없습니다.</>,
                  ok: '영구 삭제',
                  tone: 'danger',
                });
                if (yes) onPurge([d.id]);
              }} />
          ))}
        </ul>
      )}
      {confirmNode}
    </Modal>
  );
}

function TrashRow({ doc, onOpen, onRestore, onPurge }: { doc: Doc; onOpen(): void; onRestore(): void; onPurge(): void }) {
  const who = useMember(doc.trashedBy);
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-[1_1_220px] items-center gap-2.5 text-left">
        <span className="text-tm-sub"><DocIcon icon={doc.icon} size={18} /></span>
        <span className="min-w-0">
          <b className="block truncate text-[15px] font-bold text-tm-ink hover:text-tm-blue hover:underline">{titleOf(doc)}</b>
          <small className="block text-[12.5px] text-tm-sub">
            {who ? `${who.name} · ` : ''}{doc.trashedAt ? ago(doc.trashedAt) : ''} 휴지통으로
          </small>
        </span>
      </button>
      <div className="flex flex-none gap-2">
        <button type="button" onClick={onRestore} className={tmGhostBtn}>되살리기</button>
        <button type="button" onClick={onPurge} className={tmGhostDanger}>영구 삭제</button>
      </div>
    </li>
  );
}

/* ── 기록 ────────────────────────────────────────────── */

export function HistoryDialog({ doc, store, refs, onRestore, onClose }: {
  doc: Doc;
  store: DocStore;
  refs: WikiRefs;
  /** 고른 판으로 되돌린다 - 지금 모습은 먼저 기록에 남긴다 */
  onRestore(v: DocVersion): Promise<void>;
  onClose(): void;
}) {
  const members = useMembers();
  const [list, setList] = useState<DocVersion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState<string>('now');
  const [mode, setMode] = useState<'diff' | 'full'>('diff');
  const [busy, setBusy] = useState(false);

  /* 창을 열 때 한 번 읽는다 - 저장소 객체는 그릴 때마다 새로 오므로 함수만 본다 */
  const readVersions = store.versions;
  useEffect(() => {
    let live = true;
    readVersions(doc.id).then((v) => { if (live) setList(v); })
      .catch((e: unknown) => { if (live) setError(e instanceof Error ? e.message : '기록을 불러오지 못했습니다'); });
    return () => { live = false; };
  }, [readVersions, doc.id]);

  const current: DocVersion = { id: 'now', docId: doc.id, title: doc.title, body: doc.body, editedBy: doc.updatedBy, editedAt: doc.updatedAt };
  const versions = [current, ...(list ?? [])];
  const chosen = versions.find((v) => v.id === pick) ?? current;
  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.name ?? '알 수 없음';

  /* 고른 판 → 지금으로 무엇이 바뀌었나(초록 = 그 뒤에 생김, 빨강 = 그 뒤에 사라짐) */
  const view = useMemo(() => {
    if (chosen.id === 'now' || mode === 'full') return { content: mdToDoc(chosen.body), marks: undefined, add: 0, del: 0 };
    const d = diffBlocks(chosen.body, doc.body);
    return {
      content: { type: 'doc', content: d.blocks.length ? d.blocks : [{ type: 'paragraph' }] },
      marks: d.marks,
      add: d.marks.filter((m) => m === 'add').length,
      del: d.marks.filter((m) => m === 'del').length,
    };
  }, [chosen.id, chosen.body, doc.body, mode]);

  const restore = async () => {
    if (chosen.id === 'now') return;
    setBusy(true);
    try {
      await onRestore(chosen);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="문서 기록" sub="고치기 시작할 때마다 그 전 모습을 남깁니다" size="lg" busy={busy} onClose={onClose}
      foot={
        <>
          {chosen.id !== 'now' && (
            <p className="min-w-0 flex-1 text-[13.5px] text-tm-sub">
              되돌려도 지금 모습은 기록에 남아 다시 돌아올 수 있습니다.
            </p>
          )}
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn} disabled={busy}>닫기</button>
          <button type="button" onClick={() => void restore()} disabled={chosen.id === 'now' || busy} className={tmBtnPrimary}>
            {busy ? '되돌리는 중…' : '이 판으로 되돌리기'}
          </button>
        </>
      }>
      <div className="flex min-h-[56vh] gap-5 max-[720px]:flex-col">
        <ol className="w-[248px] flex-none space-y-1 overflow-y-auto max-[720px]:max-h-[30vh] max-[720px]:w-full" aria-label="판 목록">
          {versions.map((v) => (
            <li key={v.id}>
              <button type="button" onClick={() => setPick(v.id)} aria-current={v.id === pick ? 'true' : undefined}
                className={`flex w-full items-center gap-2.5 rounded-tm-sm px-3 py-2.5 text-left transition-colors ${
                  v.id === pick ? 'bg-tm-blue text-white' : 'hover:bg-tm-tint'}`}>
                <Avatar id={v.editedBy} size={26} />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] font-bold">{v.id === 'now' ? '지금' : `${localDay(v.editedAt)} ${new Date(v.editedAt).toTimeString().slice(0, 5)}`}</b>
                  <small className={`block truncate text-[12.5px] ${v.id === pick ? 'text-white/85' : 'text-tm-sub'}`}>
                    {nameOf(v.editedBy)} · {ago(v.editedAt)}
                  </small>
                </span>
              </button>
            </li>
          ))}
          {list === null && !error && <li className="px-3 py-4 text-[13.5px] text-tm-sub">불러오는 중…</li>}
          {error && <li role="alert" className="px-3 py-4 text-[13.5px] font-semibold text-tm-red-deep">{error}</li>}
          {list && list.length === 0 && (
            <li className="px-3 py-4 text-[13.5px] leading-[1.6] text-tm-sub">아직 남은 기록이 없습니다. 다른 사람이 고치거나 10분 넘게 쉬었다가 고치면 그 전 모습이 남습니다.</li>
          )}
        </ol>

        <div className="min-w-0 flex-1 rounded-tm border border-tm-line bg-white">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-tm-line px-5 py-3">
            <b className="mr-auto min-w-0 truncate text-[16px] font-extrabold text-tm-deep">{titleOf(chosen)}</b>
            {chosen.id !== 'now' && (
              <div role="group" aria-label="보기" className="flex gap-1">
                <button type="button" aria-pressed={mode === 'diff'} onClick={() => setMode('diff')}
                  className="h-8 rounded-full border border-tm-edge px-3 text-[13px] font-bold aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white">
                  바뀐 곳
                </button>
                <button type="button" aria-pressed={mode === 'full'} onClick={() => setMode('full')}
                  className="h-8 rounded-full border border-tm-edge px-3 text-[13px] font-bold aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white">
                  그 판 전체
                </button>
              </div>
            )}
          </div>
          {view.marks && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 border-b border-tm-line bg-tm-bg px-5 py-2 text-[13px] font-semibold text-tm-sub">
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-tm-ok align-middle" />그 뒤에 생긴 블록 {view.add}</span>
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-tm-red align-middle" />그 뒤에 사라진 블록 {view.del}</span>
              {chosen.title !== doc.title && <span>제목: {titleOf(chosen)} → {titleOf(doc)}</span>}
            </p>
          )}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5 pl-9">
            {/* 미리 보기는 처음 내용만 그린다 - 판 · 보기 · 지금 문서가 바뀌면 새로 세운다 */}
            <DocEditor key={`${chosen.id}-${mode}-${doc.updatedAt}`} body="" content={view.content} diff={view.marks} editable={false} refs={refs} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── 댓글 ────────────────────────────────────────────── */

export function Comments({ docId, comments, me, canWrite, onAdd, onUpdate, onTaskClick }: {
  docId: string;
  /** 이 문서의 댓글 */
  comments: DocComment[];
  me: string;
  /** 휴지통의 문서에는 쓰지 않는다 */
  canWrite: boolean;
  onAdd(body: string, parentId: string | null): void;
  onUpdate(id: string, patch: Partial<Pick<DocComment, 'body' | 'resolved' | 'removed'>>): void;
  onTaskClick?(key: string): void;
}) {
  const [showResolved, setShowResolved] = useState(false);
  const roots = comments.filter((c) => !c.parentId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const replies = (id: string) => comments.filter((c) => c.parentId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  // 지운 댓글은 답글이 남아 있을 때만 자리를 둔다
  const visible = roots.filter((r) => !r.removed || replies(r.id).some((x) => !x.removed));
  const open = visible.filter((r) => !r.resolved);
  const resolved = visible.filter((r) => r.resolved);
  const count = comments.filter((c) => !c.removed).length;

  return (
    <section id={`comments-${docId}`} aria-labelledby={`comments-title-${docId}`} className="mt-12 border-t border-tm-line pt-7">
      <h3 id={`comments-title-${docId}`} className="mb-4 text-[17px] font-extrabold text-tm-deep">
        댓글 <span className="ml-1 text-[14px] font-bold tabular-nums text-tm-sub">{count}</span>
      </h3>
      {canWrite && <Composer me={me} placeholder="의견이나 질문을 남기세요. Ctrl+Enter 로 남깁니다." onSubmit={(b) => onAdd(b, null)} />}
      <ul className="mt-5 space-y-4">
        {open.map((r) => (
          <Thread key={r.id} root={r} replies={replies(r.id)} me={me} canWrite={canWrite} onAdd={onAdd} onUpdate={onUpdate} onTaskClick={onTaskClick} />
        ))}
      </ul>
      {open.length === 0 && count === 0 && <p className="mt-4 text-[14px] text-tm-sub">아직 댓글이 없습니다.</p>}
      {resolved.length > 0 && (
        <div className="mt-5">
          <button type="button" className={tmTextBtn} aria-expanded={showResolved} onClick={() => setShowResolved((v) => !v)}>
            해결된 댓글 {resolved.length}개 {showResolved ? '접기' : '보기'}
          </button>
          {showResolved && (
            <ul className="mt-3 space-y-4 opacity-90">
              {resolved.map((r) => (
                <Thread key={r.id} root={r} replies={replies(r.id)} me={me} canWrite={canWrite} onAdd={onAdd} onUpdate={onUpdate} onTaskClick={onTaskClick} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function Composer({ me, placeholder, onSubmit, autoFocus, initial = '', submitLabel = '댓글 남기기', onCancel }: {
  me: string; placeholder: string; onSubmit(body: string): void; autoFocus?: boolean; initial?: string;
  submitLabel?: string; onCancel?(): void;
}) {
  const [text, setText] = useState(initial);
  const id = useId();
  const submit = () => {
    const body = text.trim();
    if (!body) return;
    onSubmit(body);
    setText('');
  };
  return (
    <div className="flex items-start gap-3">
      <Avatar id={me} size={30} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={id}>{placeholder}</label>
        <textarea id={id} value={text} autoFocus={autoFocus} rows={2}
          onChange={(e) => setText(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
            if (e.key === 'Escape' && onCancel) { e.preventDefault(); e.stopPropagation(); onCancel(); }
          }}
          className={`${tmTextarea} min-h-[64px] text-[15px]`} />
        <div className="mt-2 flex justify-end gap-2">
          {onCancel && <button type="button" onClick={onCancel} className={tmGhostBtn}>취소</button>}
          <button type="button" onClick={submit} disabled={!text.trim()} className={`${tmBtnPrimary} h-[38px] px-4 text-[14px]`}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Thread({ root, replies, me, canWrite, onAdd, onUpdate, onTaskClick }: {
  root: DocComment; replies: DocComment[]; me: string; canWrite: boolean;
  onAdd(body: string, parentId: string | null): void;
  onUpdate(id: string, patch: Partial<Pick<DocComment, 'body' | 'resolved' | 'removed'>>): void;
  onTaskClick?(key: string): void;
}) {
  const [replying, setReplying] = useState(false);
  return (
    <li className={`rounded-tm border border-tm-line bg-white p-4 ${root.resolved ? 'bg-tm-bg' : ''}`}>
      <CommentItem c={root} me={me} canWrite={canWrite} onUpdate={onUpdate} onTaskClick={onTaskClick}
        extra={canWrite && !root.removed ? (
          <button type="button" className="text-[13px] font-bold text-tm-sub hover:text-tm-blue"
            onClick={() => onUpdate(root.id, { resolved: !root.resolved })}>
            {root.resolved ? '다시 열기' : '해결'}
          </button>
        ) : null} />
      {replies.length > 0 && (
        <ul className="ml-10 mt-3 space-y-3 border-l-2 border-tm-line pl-4">
          {replies.map((c) => (
            <li key={c.id}><CommentItem c={c} me={me} canWrite={canWrite} onUpdate={onUpdate} onTaskClick={onTaskClick} /></li>
          ))}
        </ul>
      )}
      {canWrite && !root.resolved && (
        <div className="ml-10 mt-3">
          {replying ? (
            <Composer me={me} placeholder="답글을 적으세요" autoFocus submitLabel="답글 남기기"
              onSubmit={(b) => { onAdd(b, root.id); setReplying(false); }} onCancel={() => setReplying(false)} />
          ) : (
            <button type="button" className={tmTextBtn} onClick={() => setReplying(true)}>답글</button>
          )}
        </div>
      )}
    </li>
  );
}

function CommentItem({ c, me, canWrite, onUpdate, onTaskClick, extra }: {
  c: DocComment; me: string; canWrite: boolean;
  onUpdate(id: string, patch: Partial<Pick<DocComment, 'body' | 'resolved' | 'removed'>>): void;
  onTaskClick?(key: string): void;
  extra?: React.ReactNode;
}) {
  const who = useMember(c.author);
  const [editing, setEditing] = useState(false);
  const [confirm, confirmNode] = useConfirm();
  const mine = c.author === me;
  const edited = !c.removed && Date.parse(c.updatedAt) - Date.parse(c.createdAt) > 1500;

  if (c.removed) {
    return <p className="text-[14px] italic text-tm-sub">지운 댓글입니다.</p>;
  }
  return (
    <div className="flex items-start gap-3">
      <Avatar id={c.author} size={30} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-[13.5px]">
          <b className="font-bold text-tm-ink">{who?.name ?? '알 수 없음'}</b>
          <span className="tabular-nums text-tm-sub" title={new Date(c.createdAt).toLocaleString('ko-KR')}>{ago(c.createdAt)}</span>
          {edited && <span className="text-tm-sub">(수정됨)</span>}
          <span className="ml-auto flex items-center gap-3">
            {extra}
            {canWrite && mine && !editing && (
              <>
                <button type="button" className="text-[13px] font-bold text-tm-sub hover:text-tm-blue" onClick={() => setEditing(true)}>고치기</button>
                <button type="button" className="text-[13px] font-bold text-tm-sub hover:text-tm-red-deep"
                  onClick={async () => {
                    const yes = await confirm({ title: '댓글을 지울까요?', body: '지운 댓글은 되살릴 수 없습니다.', ok: '지우기', tone: 'danger' });
                    if (yes) onUpdate(c.id, { removed: true });
                  }}>
                  지우기
                </button>
              </>
            )}
          </span>
        </p>
        {editing ? (
          <div className="mt-2">
            <Composer me={me} placeholder="댓글 고치기" initial={c.body} autoFocus submitLabel="저장"
              onSubmit={(b) => { onUpdate(c.id, { body: b }); setEditing(false); }} onCancel={() => setEditing(false)} />
          </div>
        ) : (
          <div className="mt-1 [&_p]:my-1 [&_p]:text-[15px] [&_p]:leading-[1.65] [&_ul]:my-1 [&_ol]:my-1">
            <Markdown source={c.body} onTaskClick={onTaskClick} />
          </div>
        )}
      </div>
      {confirmNode}
    </div>
  );
}

/* ── 제목 칸(편집 중) ───────────────────────────────── */

/* 제목은 빈 채로 저장하지 않는다. 칸의 글자는 따로 들고, 비어 있는 동안은 저장을 건너뛰고
   칸을 떠나면 마지막 제목으로 돌린다. 문서가 바뀌면 key 로 새로 세운다 */
export function TitleField({ saved, onSave, onEnter }: { saved: string; onSave(title: string): void; onEnter?(): void }) {
  const [title, setTitle] = useState(saved);
  const focused = useRef(false);
  useEffect(() => {
    // 치고 있지 않을 때 들어온 제목(다른 팀원의 수정)은 그대로 따른다
    if (!focused.current) setTitle(saved);
  }, [saved]);

  return (
    <>
      <label className="sr-only" htmlFor="doc-edit-title">제목</label>
      <input id="doc-edit-title" value={title} placeholder="제목"
        aria-invalid={!title.trim() || undefined}
        aria-describedby={title.trim() ? undefined : 'doc-edit-title-hint'}
        onFocus={() => { focused.current = true; }}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          if (v.trim()) onSave(v);
        }}
        onKeyDown={(e) => {
          // Enter 는 본문으로 - 노션처럼 제목 다음 줄에서 바로 쓴다
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); onEnter?.(); }
        }}
        onBlur={() => { focused.current = false; setTitle(saved); }}
        className={`${tmFieldBase} block h-auto w-full border-transparent bg-transparent px-2 py-1 -mx-2 text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em] text-tm-deep
                    hover:border-tm-line focus:border-tm-blue max-[720px]:text-[23px]`} />
      {!title.trim() && (
        <p id="doc-edit-title-hint" className="mt-1 text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
          제목은 비워 둘 수 없습니다. 칸을 떠나면 마지막으로 저장된 제목으로 돌아갑니다.
        </p>
      )}
    </>
  );
}

/* ── 라벨 ────────────────────────────────────────────── */

export function LabelEditor({ labels, onChange }: { labels: string[]; onChange(next: string[]): void }) {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim().replace(/^#/, '');
    if (!v || labels.includes(v)) { setText(''); return; }
    onChange([...labels, v].slice(0, 12));
    setText('');
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {labels.map((l) => (
        <span key={l} className="inline-flex items-center gap-1 rounded-full bg-tm-tint py-0.5 pl-2.5 pr-1 text-[12.5px] font-bold text-tm-deep">
          {l}
          <button type="button" aria-label={`라벨 ${l} 빼기`} onClick={() => onChange(labels.filter((x) => x !== l))}
            className="grid h-5 w-5 place-items-center rounded-full text-tm-sub hover:bg-white hover:text-tm-red-deep">×</button>
        </span>
      ))}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="+ 라벨" aria-label="라벨 더하기"
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !text && labels.length) onChange(labels.slice(0, -1));
        }}
        onBlur={add}
        className="h-7 w-[96px] rounded-full border border-dashed border-tm-edge bg-white px-2.5 text-[12.5px] font-semibold text-tm-ink placeholder:text-tm-sub focus:border-tm-blue focus:outline-none" />
    </span>
  );
}

/* ── 영구 삭제 확인(위키 표가 없을 때의 예전 방식) ──────── */

export function useDeleteConfirm() {
  const [confirm, node] = useConfirm();
  const ask = (doc: Doc, hasKids: boolean) => confirm({
    title: '이 문서를 삭제할까요?',
    body: (
      <>
        <b>{titleOf(doc)}</b> 문서{hasKids ? '와 그 아래 문서가 모두' : '가'} 지워집니다. 삭제한 뒤에는 되돌릴 수 없습니다.
      </>
    ),
    ok: '삭제',
    tone: 'danger',
  });
  return [ask, node] as const;
}
