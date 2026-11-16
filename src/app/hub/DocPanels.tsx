'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { DOC_TEMPLATES, localDay, localToday, type Doc, type DocComment, type DocVersion } from './types';
import { useMember, useMembers } from './members';
import { diffBlocks, isDateVar, mdToDoc, plainText, type TemplateVarDef } from './docMarkdown';
import type { DocStore, SaveResult } from './docStore';
import DocEditor, { FloatMenu, keepInView, type WikiRefs } from './DocEditor';
import Markdown from './Markdown';
import {
  Avatar, IconSearch, Modal,
  tmBtn, tmBtnPrimary, tmFieldBase, tmGhostBtn, tmGhostDanger, tmInput, tmLabel, tmSelect, tmTextarea, tmTextBtn,
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

/**
 * 버튼 + 펼치는 메뉴. 메뉴는 화면 맨 위 층에 떠서 스크롤 칸에 잘리지 않는다(FloatMenu).
 * ↑ ↓ Home End 로 오가고(체크 항목 포함), Esc 는 닫고 단추로, Tab 은 닫고 다음 칸으로, 바깥을 누르면 닫는다
 */
export function DropMenu({ label, items, children, className, align = 'right' }: {
  label: string; items: MenuEntry[]; children: React.ReactNode; className: string; align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={btn} type="button" aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)} className={className}>
        {children}
      </button>
      {open && (
        <FloatMenu anchor={btn.current} label={label} align={align === 'right' ? 'end' : 'start'} width={236}
          onClose={() => setOpen(false)}>
          {items.map((it) => (
            <div key={it.label} className="contents">
              {it.sep && <div className="tm-menu-sep" role="separator" />}
              <button type="button" role={it.checked === undefined ? 'menuitem' : 'menuitemcheckbox'} tabIndex={-1}
                aria-checked={it.checked} disabled={it.disabled}
                className={`tm-menu-item${it.danger ? ' is-danger' : ''} disabled:opacity-40`}
                onClick={() => {
                  // 고른 뒤 초점은 단추로 - 창을 여는 항목이면 창이 초점을 가져간다
                  btn.current?.focus({ preventScroll: true });
                  setOpen(false);
                  it.onSelect();
                }}>
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                {it.hint && <kbd className="text-[11.5px] font-semibold text-tm-sub">{it.hint}</kbd>}
              </button>
            </div>
          ))}
        </FloatMenu>
      )}
    </>
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
  parentTitle, initialTemplate, teamTemplates = [], onCreate, onClose,
}: {
  parentTitle: string | null;
  /** 처음 골라 둘 양식 - 카테고리(프로젝트 · 개발자) 바로 아래에 만들 때. 없으면 회의록 */
  initialTemplate?: string;
  /** 팀 양식 - '양식' 라벨을 단 문서(Confluence 에서 옮긴 양식). id 는 'doc:문서id' */
  teamTemplates?: { id: string; name: string; hint: string; vars?: TemplateVarDef[] }[];
  /** values - 팀 양식의 칸에 넣을 값(칸 이름 → 값) */
  onCreate(templateId: string, title: string, values?: Record<string, string>): void;
  onClose(): void;
}) {
  const [picked, setPicked] = useState(() => (DOC_TEMPLATES.some((x) => x.id === initialTemplate) ? initialTemplate as string : 'meeting'));
  const [title, setTitle] = useState(() => DOC_TEMPLATES.find((x) => x.id === picked)?.title ?? '');
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

  /** 제목 없이 Enter 를 눌렀다 - 만들기 단추는 막혀 있어 Enter 로만 생긴다 */
  const [missing, setMissing] = useState(false);
  /* 팀 양식의 칸(Confluence 양식의 변수) - 고른 양식이 바뀌면 처음 값으로. 날짜 칸은 오늘, 고르기 칸은 첫 보기 */
  const vars = useMemo(() => teamTemplates.find((t) => t.id === picked)?.vars ?? [], [teamTemplates, picked]);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    setValues(Object.fromEntries(vars.map((v) => [v.name, isDateVar(v.name) ? localToday() : v.kind === 'list' ? v.options?.[0] ?? '' : ''])));
  }, [vars]);
  const create = () => {
    if (title.trim()) onCreate(picked, title.trim(), vars.length ? values : undefined);
    else setMissing(true);
  };

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

      {teamTemplates.length > 0 && (
        <>
          <p className={tmLabel} id="doc-team-template-label">팀 양식 <small className="font-semibold text-tm-sub">· &apos;양식&apos; 라벨을 단 문서</small></p>
          <div role="radiogroup" aria-labelledby="doc-team-template-label" className="mb-[22px] grid max-h-[240px] gap-2.5 overflow-y-auto sm:grid-cols-2"
            onPointerDown={() => { byPointer.current = true; }}
            onKeyDown={() => { byPointer.current = false; }}>
            {teamTemplates.map((t) => {
              const on = picked === t.id;
              return (
                <label key={t.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-tm-sm border p-3.5 transition-[border-color,box-shadow,background-color] duration-150 ${
                    on ? 'border-tm-blue bg-tm-tint shadow-[inset_0_0_0_1px_#2644cb]' : 'border-tm-edge bg-white hover:border-tm-blue'}`}>
                  <input type="radio" name="doc-template" value={t.id} checked={on}
                    onChange={() => { setPicked(t.id); setTitle(t.name); }}
                    className="mt-[3px] h-[18px] w-[18px] flex-none accent-tm-blue" />
                  <span className="min-w-0">
                    <b className="block truncate text-[15px] font-bold text-tm-ink">{t.name}</b>
                    <small className="mt-0.5 line-clamp-2 block text-[13px] leading-[1.5] text-tm-sub">{t.hint || '팀이 만든 양식'}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {vars.length > 0 && (
        <fieldset className="mb-[22px] min-w-0">
          <legend className={tmLabel}>양식 칸 채우기 <small className="font-semibold text-tm-sub">· 비워 두면 그 칸은 지웁니다</small></legend>
          <div className="grid max-h-[300px] gap-3 overflow-y-auto">
            {vars.map((v, i) => {
              const id = `doc-var-${i}`;
              const val = values[v.name] ?? '';
              const set = (x: string) => setValues((prev) => ({ ...prev, [v.name]: x }));
              return (
                <div key={v.name} className="min-w-0">
                  <label htmlFor={id} className="mb-1 block truncate text-[13px] font-bold text-tm-sub">{v.name}</label>
                  {isDateVar(v.name) ? (
                    <input id={id} type="date" value={val} onChange={(e) => set(e.target.value)} className={tmInput} />
                  ) : v.kind === 'list' && v.options?.length ? (
                    <select id={id} value={val} onChange={(e) => set(e.target.value)} className={`${tmSelect} w-full`}>
                      <option value="">비워 두기</option>
                      {v.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : v.kind === 'textarea' ? (
                    <textarea id={id} rows={3} value={val} onChange={(e) => set(e.target.value)} className={tmTextarea} />
                  ) : (
                    <input id={id} value={val} onChange={(e) => set(e.target.value)} className={tmInput}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); create(); } }} />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}

      <label className={tmLabel} htmlFor="doc-title">
        제목 <b className="text-[12.5px] font-bold text-tm-red">필수</b>
      </label>
      {/* Enter 의 기본 동작을 막는다 - 창이 닫히며 초점이 '새 문서' 단추로 돌아간 뒤
          같은 Enter 가 그 단추를 눌러 창을 다시 여는 일이 없게 */}
      <input id="doc-title" ref={titleRef} value={title} onChange={(e) => { setTitle(e.target.value); setMissing(false); }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
          e.preventDefault();
          create();
        }}
        placeholder="검색해서 찾을 수 있는 이름으로"
        aria-invalid={(missing && !title.trim()) || undefined} aria-describedby={missing && !title.trim() ? 'doc-title-missing' : undefined}
        className={tmInput} />
      {missing && !title.trim() && (
        <p id="doc-title-missing" role="alert" className="mt-1.5 text-[13px] font-semibold text-tm-red-deep">
          제목을 적어 주세요. 제목이 비어 있으면 문서를 만들 수 없습니다.
        </p>
      )}
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

/** 옮길 곳 고르기 → 옮긴 뒤의 전체 경로 확인 → '옮기기'. 서버가 받지 않으면 창과 고른 곳을 그대로 둔다 */
export function MoveDialog({ doc, docs, onMove, onClose }: {
  doc: Doc;
  /** 살아 있는 문서 */
  docs: Doc[];
  onMove(parentId: string | null): Promise<SaveResult>;
  onClose(): void;
}) {
  const [q, setQ] = useState('');
  /** 고른 곳 - undefined 아직 안 고름 · null 맨 위 */
  const [dest, setDest] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);
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
  /** 찾는 이름에 맞는 문서 중 자기 · 자기 아래 문서라 뺀 것이 있다 */
  const hiddenHit = useMemo(() => {
    const query = q.trim().toLowerCase();
    return !!query && docs.some((d) => blocked.has(d.id) && titleOf(d).toLowerCase().includes(query));
  }, [docs, blocked, q]);

  /** 옮긴 뒤의 경로 - 위 문서들 / 이 문서 */
  const destDoc = dest ? byId.get(dest) : undefined;
  const destPath = dest === undefined ? null
    : dest === null || !destDoc ? `맨 위 / ${titleOf(doc)}`
      : [pathOf(destDoc, byId), titleOf(destDoc), titleOf(doc)].filter(Boolean).join(' / ');
  const pick = (id: string | null) => {
    setDest(id);
    setFailed(false);
  };
  const confirm = async () => {
    if (dest === undefined || busy) return;
    setBusy(true);
    setFailed(false);
    const r = await onMove(dest);
    // ok 면 부르는 쪽이 창을 닫는다. 받지 않았으면 고른 곳을 그대로 두고 다시 누를 수 있게
    setBusy(false);
    if (r !== 'ok') setFailed(true);
  };
  const row = (id: string | null, label: React.ReactNode, sub: string | null, depth: number, here: boolean, icon?: string) => {
    const on = dest === id;
    return (
      <li key={id ?? '__top'}>
        <button type="button" disabled={here || busy} aria-pressed={on} onClick={() => pick(id)}
          style={{ paddingLeft: 12 + depth * 18 }}
          className={`flex min-h-[42px] w-full items-center gap-2.5 rounded-tm-sm pr-3 text-left transition-colors disabled:opacity-45 [@media(pointer:coarse)]:min-h-11 ${
            on ? 'bg-tm-blue text-white' : 'hover:bg-tm-tint'}`}>
          {id === null ? null : <span className={on ? 'text-white' : 'text-tm-sub'}><DocIcon icon={icon} /></span>}
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-[15px] ${id === null ? 'font-bold' : 'font-semibold'} ${on ? '' : id === null ? 'text-tm-deep' : 'text-tm-ink'}`}>{label}</span>
            {sub && <span className={`block truncate text-[12.5px] ${on ? 'text-white/85' : 'text-tm-sub'}`}>{sub}</span>}
          </span>
          {here && <span className="flex-none text-[12.5px] font-semibold text-tm-sub">지금 자리</span>}
        </button>
      </li>
    );
  };

  return (
    <Modal title="옮기기" sub={`'${titleOf(doc)}' 문서를 어디 아래에 둘까요`} onClose={onClose} busy={busy}
      foot={
        <>
          <p className="min-w-0 basis-full text-[13.5px] leading-[1.5] text-tm-ink sm:flex-1 sm:basis-auto" aria-live="polite">
            {failed ? (
              <b className="font-bold text-tm-red-deep">옮기지 못했습니다. 고른 곳은 그대로이니 다시 눌러 주세요.</b>
            ) : destPath ? (
              <>옮긴 뒤: <b className="font-bold text-tm-deep [overflow-wrap:anywhere]">{destPath}</b></>
            ) : (
              <span className="text-tm-sub">옮길 곳을 고르세요.</span>
            )}
          </p>
          <button type="button" onClick={onClose} disabled={busy} className={`${tmBtn} ml-auto`}>취소</button>
          <button type="button" onClick={() => void confirm()} disabled={dest === undefined || busy} className={tmBtnPrimary}>
            {busy ? '옮기는 중…' : '옮기기'}
          </button>
        </>
      }>
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch /></span>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="문서 이름으로 찾기" aria-label="옮길 곳 찾기"
          className={`${tmInput} pl-11`} />
      </div>
      <ul className="max-h-[48vh] space-y-0.5 overflow-y-auto" aria-label="옮길 곳">
        {!q.trim() && row(null, '맨 위(최상위 문서로)', null, 0, doc.parentId === null)}
        {/* 찾을 때는 들여쓰기가 없어지므로 줄마다 전체 경로를 보인다 */}
        {rows.map(({ d, depth }) => row(d.id, titleOf(d), q.trim() ? pathOf(d, byId) || '맨 위' : null, depth, d.id === doc.parentId, d.icon))}
        {rows.length === 0 && <li className="py-8 text-center text-[14px] text-tm-sub">옮길 수 있는 문서가 없습니다.</li>}
        {/* 찾는 이름이 자기 · 자기 아래 문서라 목록에서 빠졌으면 그렇다고 - 없는 문서로 알지 않게 */}
        {hiddenHit && (
          <li className="px-3 py-2.5 text-[13px] leading-[1.5] text-tm-sub">
            이 문서와 그 아래 문서는 옮길 곳으로 고를 수 없어 목록에서 뺐습니다.
          </li>
        )}
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
  /** 비교 기준 = 목록에서 고른 판(되돌리기도 이 판으로) */
  const [pick, setPick] = useState<string>('now');
  /** 비교 대상 - 처음에는 지금. 옛 판 둘을 견줄 수도 있다 */
  const [target, setTarget] = useState<string>('now');
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
  const against = versions.find((v) => v.id === target) ?? current;
  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.name ?? '알 수 없음';
  /** 판 이름 - 순서 번호가 아니라 그 모습이 저장된 때와 사람 */
  const labelOf = (v: DocVersion) => (v.id === 'now' ? '지금' : `${localDay(v.editedAt)} ${new Date(v.editedAt).toTimeString().slice(0, 5)}`);

  /* 기준 판 → 대상 판으로 무엇이 바뀌었나(초록 = 대상에서 생김, 빨강 = 대상에서 사라짐) */
  const view = useMemo(() => {
    if (chosen.id === 'now' || mode === 'full' || chosen.id === against.id) return { content: mdToDoc(chosen.body), marks: undefined, add: 0, del: 0 };
    const d = diffBlocks(chosen.body, against.body);
    return {
      content: { type: 'doc', content: d.blocks.length ? d.blocks : [{ type: 'paragraph' }] },
      marks: d.marks,
      add: d.marks.filter((m) => m === 'add').length,
      del: d.marks.filter((m) => m === 'del').length,
    };
  }, [chosen.id, chosen.body, against.id, against.body, mode]);

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
    <Modal title="문서 기록" sub="자동으로 남긴 이전 내용을 확인하고 복원합니다" size="lg" busy={busy} onClose={onClose}
      foot={
        <>
          {/* 휴대폰에서는 안내가 한 줄을 다 쓰고 단추는 다음 줄에 - 좁은 칸에서 글자가 한 낱말씩 꺾이지 않게 */}
          {chosen.id !== 'now' ? (
            <p className="min-w-0 basis-full text-[13.5px] leading-[1.5] text-tm-sub sm:flex-1 sm:basis-auto">
              되돌려도 지금 모습은 기록에 남아 다시 돌아올 수 있습니다.
            </p>
          ) : list && list.length > 0 ? (
            // '지금'을 고른 채로는 되돌리기 단추가 막혀 있다 - 무엇을 해야 하는지 알린다
            <p className="min-w-0 basis-full text-[13.5px] leading-[1.5] text-tm-sub sm:flex-1 sm:basis-auto">
              되돌릴 이전 판을 목록에서 고르세요.
            </p>
          ) : null}
          <button type="button" onClick={onClose} className={`${tmBtn} ml-auto`} disabled={busy}>닫기</button>
          <button type="button" onClick={() => void restore()} disabled={chosen.id === 'now' || busy} className={tmBtnPrimary}>
            {busy ? '되돌리는 중…' : '이 판으로 되돌리기'}
          </button>
        </>
      }>
      <div className="flex min-h-[56vh] gap-5 max-[720px]:flex-col">
        <ol className="w-[248px] flex-none space-y-1 overflow-y-auto max-[720px]:max-h-[30vh] max-[720px]:w-full" aria-label="판 목록 - 고른 판이 비교 기준이고 되돌릴 판입니다">
          {versions.map((v) => (
            <li key={v.id}>
              <button type="button" aria-current={v.id === pick ? 'true' : undefined}
                onClick={() => {
                  setPick(v.id);
                  // 기준이 대상과 같아지면 대상은 지금으로
                  if (v.id === target) setTarget('now');
                }}
                className={`flex w-full items-center gap-2.5 rounded-tm-sm px-3 py-2.5 text-left transition-colors ${
                  v.id === pick ? 'bg-tm-blue text-white' : 'hover:bg-tm-tint'}`}>
                <Avatar id={v.editedBy} size={26} />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] font-bold">{labelOf(v)}</b>
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
            <li className="px-3 py-4 text-[13.5px] leading-[1.6] text-tm-sub">
              아직 남은 기록이 없습니다. 고친 사람이 바뀌거나, 10분 넘게 쉬었다가 고치거나, 30분이 지나면 고치기 전 모습이 자동으로 남습니다.
            </li>
          )}
        </ol>

        <div className="min-w-0 flex-1 rounded-tm border border-tm-line bg-white">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-tm-line px-5 py-3">
            <b className="mr-auto min-w-0 truncate text-[16px] font-extrabold text-tm-deep">{titleOf(chosen)}</b>
            {chosen.id !== 'now' && (
              <div role="group" aria-label="보기" className="flex gap-1">
                <button type="button" aria-pressed={mode === 'diff'} onClick={() => setMode('diff')}
                  className="h-8 rounded-full border border-tm-edge px-3 text-[13px] font-bold aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white [@media(pointer:coarse)]:h-11">
                  바뀐 곳
                </button>
                <button type="button" aria-pressed={mode === 'full'} onClick={() => setMode('full')}
                  className="h-8 rounded-full border border-tm-edge px-3 text-[13px] font-bold aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white [@media(pointer:coarse)]:h-11">
                  그 판 전체
                </button>
              </div>
            )}
          </div>
          {/* 무엇과 무엇을 견주는지 - 기준은 목록에서 고른 판, 대상은 고를 수 있다(처음에는 지금) */}
          {chosen.id !== 'now' && mode === 'diff' && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-tm-line px-5 py-2.5 text-[13.5px]">
              <span className="font-bold text-tm-sub">비교</span>
              <span className="rounded-full bg-tm-tint px-2.5 py-0.5 font-bold text-tm-deep">기준 {labelOf(chosen)} · {nameOf(chosen.editedBy)}</span>
              <span aria-hidden className="text-tm-sub">→</span>
              <label className="sr-only" htmlFor="doc-history-target">비교 대상</label>
              <select id="doc-history-target" value={against.id} onChange={(e) => setTarget(e.target.value)}
                className={`${tmFieldBase} h-8 max-w-full px-2 text-[13.5px] font-semibold [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px]`}>
                {versions.filter((v) => v.id !== chosen.id).map((v) => (
                  <option key={v.id} value={v.id}>대상 {labelOf(v)} · {nameOf(v.editedBy)}</option>
                ))}
              </select>
            </div>
          )}
          {view.marks && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 border-b border-tm-line bg-tm-bg px-5 py-2 text-[13px] font-semibold text-tm-sub">
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-tm-ok align-middle" />대상에서 생긴 블록 {view.add}</span>
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-tm-red align-middle" />대상에서 사라진 블록 {view.del}</span>
              {chosen.title !== against.title && <span>제목: {titleOf(chosen)} → {titleOf(against)}</span>}
            </p>
          )}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5 pl-9">
            {/* 미리 보기는 처음 내용만 그린다 - 판 · 대상 · 보기 · 지금 문서가 바뀌면 새로 세운다 */}
            <DocEditor key={`${chosen.id}-${against.id}-${mode}-${doc.updatedAt}`} body="" content={view.content} diff={view.marks} editable={false} refs={refs} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── 댓글 ────────────────────────────────────────────── */

type CommentPatch = Partial<Pick<DocComment, 'body' | 'resolved' | 'removed'>>;

/** 아직 보내지 않은 글 - 사람 · 문서 · 자리(새 댓글 · 답글 · 고치기)마다 따로 둔다. 다른 문서로 갔다 와도 섞이지 않고 남는다 */
const drafts = new Map<string, string>();
const newCommentId = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID() : `c${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

export function Comments({ docId, comments, me, canWrite, onAdd, onUpdate, onTaskClick, panel = false, filter = 'all' }: {
  docId: string;
  /** 이 문서의 댓글 */
  comments: DocComment[];
  me: string;
  /** 휴지통의 문서에는 쓰지 않는다 */
  canWrite: boolean;
  /** 남기고 결과를 돌려준다. id 는 같은 글을 다시 보낼 때 같은 값이다 */
  onAdd(body: string, parentId: string | null, id: string): Promise<SaveResult>;
  onUpdate(id: string, patch: CommentPatch): Promise<SaveResult>;
  onTaskClick?(key: string): void;
  /** 댓글 패널 안 - 제목 · 구역 줄 없이, 거르기(미해결 · 해결 · 전체)대로 보인다 */
  panel?: boolean;
  filter?: 'open' | 'resolved' | 'all';
}) {
  const [showResolved, setShowResolved] = useState(false);
  const roots = comments.filter((c) => !c.parentId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const replies = (id: string) => comments.filter((c) => c.parentId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  // 지운 댓글은 답글이 남아 있을 때만 자리를 둔다
  const visible = roots.filter((r) => !r.removed || replies(r.id).some((x) => !x.removed));
  const open = visible.filter((r) => !r.resolved);
  const resolved = visible.filter((r) => r.resolved);
  const count = comments.filter((c) => !c.removed).length;

  if (panel) {
    const shown = filter === 'open' ? open : filter === 'resolved' ? resolved : [...open, ...resolved];
    return (
      <div>
        {canWrite && filter !== 'resolved' && (
          <Composer key={`${me}:${docId}`} me={me} draftKey={`${me}:${docId}:top`}
            placeholder="의견이나 질문을 남기세요. Ctrl+Enter 로 남깁니다." onSubmit={(b, id) => onAdd(b, null, id)} />
        )}
        <ul className="mt-5 space-y-4">
          {shown.map((r) => (
            <Thread key={r.id} docId={docId} root={r} replies={replies(r.id)} me={me} canWrite={canWrite} onAdd={onAdd} onUpdate={onUpdate} onTaskClick={onTaskClick} />
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="mt-4 text-[14px] text-tm-sub">
            {filter === 'resolved' ? '해결된 댓글이 없습니다.' : filter === 'open' && count ? '해결되지 않은 댓글이 없습니다.' : '아직 댓글이 없습니다.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <section id={`comments-${docId}`} aria-labelledby={`comments-title-${docId}`} className="mt-12 border-t border-tm-line pt-7">
      <h3 id={`comments-title-${docId}`} className="mb-4 text-[17px] font-extrabold text-tm-deep">
        댓글 <span className="ml-1 text-[14px] font-bold tabular-nums text-tm-sub">{count}</span>
      </h3>
      {canWrite && (
        <Composer key={`${me}:${docId}`} me={me} draftKey={`${me}:${docId}:top`}
          placeholder="의견이나 질문을 남기세요. Ctrl+Enter 로 남깁니다." onSubmit={(b, id) => onAdd(b, null, id)} />
      )}
      <ul className="mt-5 space-y-4">
        {open.map((r) => (
          <Thread key={r.id} docId={docId} root={r} replies={replies(r.id)} me={me} canWrite={canWrite} onAdd={onAdd} onUpdate={onUpdate} onTaskClick={onTaskClick} />
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
                <Thread key={r.id} docId={docId} root={r} replies={replies(r.id)} me={me} canWrite={canWrite} onAdd={onAdd} onUpdate={onUpdate} onTaskClick={onTaskClick} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * 댓글 쓰는 칸. 서버가 받을 때까지 '보내는 중…', 받으면 비우고, 받지 않았으면 쓴 글을 그대로 두고
 * '다시 보내기 · 복사'를 보인다. 보내는 동안 다시 누를 수 없고, 같은 글을 다시 보내면 같은 id 로 보낸다
 */
function Composer({ me, draftKey, placeholder, onSubmit, autoFocus, initial = '', submitLabel = '댓글 남기기', onCancel, onSent }: {
  me: string;
  /** 보내지 않은 글을 들고 있을 자리 - 사람 · 문서 · 자리마다 다르다 */
  draftKey: string;
  placeholder: string;
  onSubmit(body: string, id: string): Promise<SaveResult>;
  autoFocus?: boolean; initial?: string; submitLabel?: string; onCancel?(): void;
  /** 서버가 받은 뒤(답글 칸 접기 · 고치기 끝내기) */
  onSent?(): void;
}) {
  const [text, setText] = useState(() => drafts.get(draftKey) ?? initial);
  const [phase, setPhase] = useState<'idle' | 'sending' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);
  /** 보낸 글과 그 id - 같은 글을 다시 보내면 같은 id */
  const sent = useRef<{ id: string; body: string } | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  const id = useId();
  const keep = (v: string) => {
    setText(v);
    if (v.trim() && v !== initial) drafts.set(draftKey, v);
    else drafts.delete(draftKey);
  };
  const submit = async () => {
    const body = text.trim();
    if (!body || phase === 'sending') return;
    if (!sent.current || sent.current.body !== body) sent.current = { id: newCommentId(), body };
    setPhase('sending');
    setCopied(false);
    const r = await onSubmit(body, sent.current.id);
    if (r === 'ok') drafts.delete(draftKey);
    if (!alive.current) return;
    if (r === 'ok') {
      sent.current = null;
      setText('');
      setPhase('idle');
      onSent?.();
    } else setPhase('failed');
  };
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false));
  };
  /* 취소는 쓰던 글을 버린다는 뜻 - 다음에 열 때 되살리지 않는다 */
  const cancel = () => {
    drafts.delete(draftKey);
    onCancel?.();
  };
  const sending = phase === 'sending';
  return (
    <div className="flex items-start gap-3">
      <Avatar id={me} size={30} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={id}>{placeholder}</label>
        <textarea id={id} value={text} autoFocus={autoFocus} rows={2} readOnly={sending} aria-busy={sending || undefined}
          onChange={(e) => {
            keep(e.target.value);
            if (phase === 'failed') setPhase('idle');
          }}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void submit(); }
            if (e.key === 'Escape' && onCancel && !sending) { e.preventDefault(); e.stopPropagation(); cancel(); }
          }}
          className={`${tmTextarea} min-h-[64px] text-[15px] read-only:bg-tm-bg`} />
        {phase === 'failed' && (
          <p role="alert" className="mt-2 text-[13.5px] font-semibold leading-[1.5] text-tm-red-deep">
            보내지 못했습니다. 쓴 글은 그대로 남아 있습니다.
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          {sending && <span role="status" className="mr-auto text-[13px] font-semibold text-tm-sub">보내는 중…</span>}
          {phase === 'failed' && (
            <button type="button" onClick={copy} className={tmGhostBtn}>{copied ? '복사했습니다' : '복사'}</button>
          )}
          {onCancel && <button type="button" onClick={cancel} disabled={sending} className={tmGhostBtn}>취소</button>}
          <button type="button" onClick={() => void submit()} disabled={!text.trim() || sending} className={`${tmBtnPrimary} h-[38px] px-4 text-[14px]`}>
            {sending ? '보내는 중…' : phase === 'failed' ? '다시 보내기' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 해결 · 다시 열기 · 지우기의 결과 - 받지 않았으면 그 자리에 알린다 */
function useCommentAct() {
  const [err, setErr] = useState<string | null>(null);
  const act = async (p: Promise<SaveResult>, what: string) => {
    setErr(null);
    const r = await p;
    if (r !== 'ok') setErr(r === 'gone' ? '다른 곳에서 지운 댓글입니다.' : `${what} 저장하지 못했습니다. 다시 눌러 주세요.`);
  };
  const node = err ? <p role="alert" className="mt-2 text-[13px] font-semibold text-tm-red-deep">{err}</p> : null;
  return [act, node] as const;
}

function Thread({ docId, root, replies, me, canWrite, onAdd, onUpdate, onTaskClick }: {
  docId: string; root: DocComment; replies: DocComment[]; me: string; canWrite: boolean;
  onAdd(body: string, parentId: string | null, id: string): Promise<SaveResult>;
  onUpdate(id: string, patch: CommentPatch): Promise<SaveResult>;
  onTaskClick?(key: string): void;
}) {
  const [replying, setReplying] = useState(false);
  const [act, actNode] = useCommentAct();
  return (
    <li className={`rounded-tm border border-tm-line bg-white p-4 ${root.resolved ? 'bg-tm-bg' : ''}`}>
      <CommentItem c={root} docId={docId} me={me} canWrite={canWrite} onUpdate={onUpdate} onTaskClick={onTaskClick}
        extra={canWrite && !root.removed ? (
          <button type="button" className="text-[13px] font-bold text-tm-sub hover:text-tm-blue"
            onClick={() => void act(onUpdate(root.id, { resolved: !root.resolved }), root.resolved ? '다시 열기를' : '해결 표시를')}>
            {root.resolved ? '다시 열기' : '해결'}
          </button>
        ) : null} />
      {actNode}
      {replies.length > 0 && (
        <ul className="ml-10 mt-3 space-y-3 border-l-2 border-tm-line pl-4">
          {replies.map((c) => (
            <li key={c.id}><CommentItem c={c} docId={docId} me={me} canWrite={canWrite} onUpdate={onUpdate} onTaskClick={onTaskClick} /></li>
          ))}
        </ul>
      )}
      {canWrite && !root.resolved && (
        <div className="ml-10 mt-3">
          {replying ? (
            <Composer me={me} draftKey={`${me}:${docId}:reply:${root.id}`} placeholder="답글을 적으세요" autoFocus submitLabel="답글 남기기"
              onSubmit={(b, id) => onAdd(b, root.id, id)} onSent={() => setReplying(false)} onCancel={() => setReplying(false)} />
          ) : (
            <button type="button" className={tmTextBtn} onClick={() => setReplying(true)}>답글</button>
          )}
        </div>
      )}
    </li>
  );
}

function CommentItem({ c, docId, me, canWrite, onUpdate, onTaskClick, extra }: {
  c: DocComment; docId: string; me: string; canWrite: boolean;
  onUpdate(id: string, patch: CommentPatch): Promise<SaveResult>;
  onTaskClick?(key: string): void;
  extra?: React.ReactNode;
}) {
  const who = useMember(c.author);
  const [editing, setEditing] = useState(false);
  const [confirm, confirmNode] = useConfirm();
  const [act, actNode] = useCommentAct();
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
                    if (yes) await act(onUpdate(c.id, { removed: true }), '지우기를');
                  }}>
                  지우기
                </button>
              </>
            )}
          </span>
        </p>
        {actNode}
        {editing ? (
          <div className="mt-2">
            <Composer me={me} draftKey={`${me}:${docId}:edit:${c.id}`} placeholder="댓글 고치기" initial={c.body} autoFocus submitLabel="저장"
              onSubmit={(b) => onUpdate(c.id, { body: b })} onSent={() => setEditing(false)} onCancel={() => setEditing(false)} />
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
  /** 붙이지 않은 까닭 - 이미 있는 라벨 · 개수 한도 */
  const [hint, setHint] = useState<string | null>(null);
  const add = () => {
    const v = text.trim().replace(/^#/, '');
    if (!v) { setText(''); return; }
    if (labels.includes(v)) { setText(''); setHint(`'${v}' 라벨은 이미 붙어 있습니다`); return; }
    // 쓴 글은 남겨 둔다 - 다른 라벨을 뺀 뒤 그대로 붙일 수 있게
    if (labels.length >= 12) { setHint('라벨은 12개까지 붙일 수 있습니다. 다른 라벨을 빼고 붙여 주세요'); return; }
    onChange([...labels, v]);
    setText('');
    setHint(null);
  };
  const remove = (next: string[]) => {
    onChange(next);
    setHint(null);
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {labels.map((l) => (
        <span key={l} className="inline-flex items-center gap-1 rounded-full bg-tm-tint py-0.5 pl-2.5 pr-1 text-[12.5px] font-bold text-tm-deep">
          {l}
          {/* 손가락 기기에서는 칩 높이는 그대로 두고 누를 자리만 넓힌다 */}
          <button type="button" aria-label={`라벨 ${l} 빼기`} onClick={() => remove(labels.filter((x) => x !== l))}
            className="grid h-5 w-5 place-items-center rounded-full text-tm-sub hover:bg-white hover:text-tm-red-deep
                       [@media(pointer:coarse)]:-my-1.5 [@media(pointer:coarse)]:h-8 [@media(pointer:coarse)]:w-8">×</button>
        </span>
      ))}
      <input value={text} onChange={(e) => { setText(e.target.value); setHint(null); }} placeholder="+ 라벨" aria-label="라벨 더하기"
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !text && labels.length) remove(labels.slice(0, -1));
        }}
        onBlur={add}
        // iPhone · iPad 는 16px 보다 작은 칸을 누르면 화면을 확대한다 - 손가락 기기에서만 키운다
        className="h-7 w-[96px] rounded-full border border-dashed border-tm-edge bg-white px-2.5 text-[12.5px] font-semibold text-tm-ink placeholder:text-tm-sub focus:border-tm-blue focus:outline-none
                   [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-[112px] [@media(pointer:coarse)]:text-[16px]" />
      {/* 읽어 주는 칸은 늘 두고(비면 화면에서 뺀다) 까닭이 생기면 글자를 넣는다 */}
      <span role="status" className={hint ? 'text-[12.5px] font-semibold text-tm-red-deep' : 'sr-only'}>{hint}</span>
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
