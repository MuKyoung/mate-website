'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PANEL_KINDS, dateChip, durLabel, parseLines, projectLabel, spansOf, type Dur, type Line, type PanelKind } from './reportStore';
import { openReportFile, reportFileUrl, sizeLabel } from './reportFiles';
import { RichCell } from './reportEditor';
import { STATUSES, initialOf, type Member, type Task } from './types';
import { Avatar, IconArrow, IconClose, IconPlus, tmGhostBtn, tmIconBtn } from './ui';

/*
 * 보고 화면의 부품 - 칸 글 보기(링크 · Jira · Hub 작업 · 소요기간), 줄 글 칸(들여쓰기),
 * 프로젝트 표(쓰기 · 보기), 회의 모드(한 사람씩 크게). Reports.tsx 가 쓴다.
 */

/* ── 칸 글 보기 ─────────────────────────────────────────── */

export interface RenderEnv {
  tasks: Task[];
  /** 팀원 - '/' 작업 찾기의 담당자 이름 */
  members: Member[];
  /** 지금 쓰는 사람(Member.id) - '/' 작업 찾기에서 내 작업이 먼저 */
  me: string;
  /** 보고 글에서 배운 Jira 사이트 - 번호만 적은 줄도 그곳으로 잇는다 */
  jira: string | null;
  onTask(id: string): void;
}

const Env = createContext<RenderEnv>({ tasks: [], members: [], me: '', jira: null, onTask: () => {} });
export const RenderProvider = Env.Provider;
/** 보고 화면의 팀원 · 작업 · 나 - 편집 칸('/' 작업 찾기)에 넘긴다 */
export const useRenderEnv = () => useContext(Env);

const URL_RE = /https?:\/\/[^\s<>"']+/g;
const KEY_RE = /(^|[^A-Za-z0-9-])([A-Z][A-Z0-9]{1,9}-\d{1,6})(?![A-Za-z0-9])/g;

/** 주소 끝의 문장부호는 떼어 낸다 - 여는 괄호가 없으면 닫는 괄호도 */
function trimUrl(u: string): string {
  let s = u;
  for (;;) {
    const last = s[s.length - 1];
    if ('.,;:!?\'"'.includes(last)) s = s.slice(0, -1);
    else if (last === ')' && !s.includes('(')) s = s.slice(0, -1);
    else return s;
  }
}

function linkLabel(href: string): { label: string; jira: string | null } {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, '');
    const key = /\/browse\/([A-Z][A-Z0-9]+-\d+)/.exec(u.pathname)?.[1] ?? null;
    if (host.endsWith('.atlassian.net') && key) return { label: key, jira: key };
    if (host.endsWith('.atlassian.net') && u.pathname.startsWith('/wiki')) return { label: 'Confluence', jira: null };
    if (host === 'devteammate.co.kr' && /^\/(hub|taskmanager)/.test(u.pathname)) {
      return { label: u.searchParams.get('doc') ? '팀 위키 문서' : 'MATE Hub', jira: null };
    }
    if (host === 'claude.ai' && u.pathname.startsWith('/artifact')) return { label: 'Claude 아티팩트', jira: null };
    if (host === 'docs.google.com' || host === 'drive.google.com') return { label: '구글 드라이브', jira: null };
    const path = u.pathname.replace(/\/$/, '');
    return { label: `${host}${path.length > 1 ? (path.length > 22 ? `${path.slice(0, 20)}…` : path) : ''}`, jira: null };
  } catch {
    return { label: href, jira: null };
  }
}

const chip =
  'mx-[1px] inline-flex max-w-full items-center gap-1 rounded-md border border-tm-line bg-tm-bg px-1.5 align-baseline text-[0.86em] ' +
  'font-bold leading-[1.55] text-tm-blue transition-colors hover:border-tm-blue hover:bg-tm-tint';

function KeyChip({ k }: { k: string }) {
  const env = useContext(Env);
  const task = env.tasks.find((t) => t.key === k);
  if (task) {
    const st = STATUSES.find((s) => s.id === task.status)?.label ?? '';
    return (
      <button type="button" onClick={() => env.onTask(task.id)} title={`${k} ${task.title} - Hub 작업 열기`} className={chip}>
        {k}<span className="font-semibold text-tm-sub">· {st}</span>
      </button>
    );
  }
  if (env.jira) {
    return <a href={`${env.jira}/browse/${k}`} target="_blank" rel="noreferrer" title={`Jira ${k} 열기`} className={chip}>{k}</a>;
  }
  return <span className={`${chip} text-tm-deep hover:border-tm-line hover:bg-tm-bg`}>{k}</span>;
}

/** 한 줄 - 글꼴 · 사람 · 상태 · 날짜 · 그림 · 파일 · 줄 바꿈을 입히고, 그 안의 주소 · 업무 번호는 칩으로 */
function Inline({ text }: { text: string }) {
  const env = useContext(Env);
  const spans = useMemo(() => spansOf(text), [text]);
  return (
    <>
      {spans.map((s, i) => {
        if (s.br) return <br key={i} />;
        if (s.mention) return <span key={i} className={`tm-rmention ${s.mention.id === env.me ? 'is-me' : ''}`}>@{s.mention.label}</span>;
        if (s.status) return <span key={i} className={`tm-rstatus tm-rstatus-${s.status.color}`}>{s.status.text}</span>;
        if (s.date) return <span key={i} className="tm-rdate">{dateChip(s.date)}</span>;
        if (s.img) return <ReportImage key={i} src={s.img.src} name={s.img.name} />;
        if (s.file) return <ReportFile key={i} src={s.file.src} name={s.file.name} size={s.file.size} />;
        if (s.code) return <code key={i} className="rounded-[5px] bg-tm-bg px-1 text-[0.92em]">{s.text}</code>;
        let node: React.ReactNode = s.href
          ? <a href={s.href} target="_blank" rel="noreferrer" title={s.href} className="text-tm-blue underline underline-offset-[3px]">{s.text}</a>
          : <Chips text={s.text} />;
        if (s.strike) node = <s className="text-tm-sub">{node}</s>;
        if (s.italic) node = <em>{node}</em>;
        if (s.bold) node = <strong className="font-extrabold">{node}</strong>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

/** 보고에 넣은 그림 - 누르면 원본을 새 창으로 */
function ReportImage({ src, name }: { src: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    let live = true;
    reportFileUrl(src).then((u) => { if (live) setUrl(u); }, () => { if (live) setFail(true); });
    return () => { live = false; };
  }, [src]);
  return (
    <button type="button" onClick={() => void openReportFile(src).catch(() => {})} title={`${name} - 원본 보기`}
      className="my-1 block max-w-full overflow-hidden rounded-lg border border-tm-line bg-tm-bg text-left align-top">
      {/* 비공개 저장소의 한 시간짜리 주소 · data URL 이라 next/image 로 줄이지 않는다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? <img src={url} alt={name} className="block max-h-[260px] max-w-full" />
        : <span className="block px-3 py-2 text-[0.85em] text-tm-sub">{fail ? `그림을 불러오지 못했습니다 · ${name}` : '그림 불러오는 중…'}</span>}
    </button>
  );
}

/** 보고에 넣은 파일 · PDF - 누르면 새 창으로 연다 */
function ReportFile({ src, name, size }: { src: string; name: string; size: number }) {
  return (
    <button type="button" onClick={() => void openReportFile(src).catch(() => {})} title={`${name} 열기`}
      className="mx-[1px] inline-flex max-w-full items-center gap-1.5 rounded-md border border-tm-line bg-tm-bg px-2 align-baseline text-[0.88em] font-bold leading-[1.7] text-tm-ink hover:border-tm-blue hover:bg-tm-tint">
      <span aria-hidden>{/\.pdf$/i.test(name) ? '📄' : '📎'}</span>
      <span className="truncate">{name}</span>
      {size > 0 && <span className="font-semibold text-tm-sub">{sizeLabel(size)}</span>}
    </button>
  );
}

/** 글 안의 주소 · 업무 번호를 칩으로 */
function Chips({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const keys = (s: string, base: number) => {
    let at = 0;
    for (const m of s.matchAll(KEY_RE)) {
      const start = (m.index ?? 0) + m[1].length;
      if (start > at) parts.push(s.slice(at, start));
      parts.push(<KeyChip key={`k${base + start}`} k={m[2]} />);
      at = start + m[2].length;
    }
    if (at < s.length) parts.push(s.slice(at));
  };
  let at = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    const href = trimUrl(m[0]);
    keys(text.slice(at, start), at);
    const { label, jira } = linkLabel(href);
    parts.push(jira
      ? <KeyChip key={`u${start}`} k={jira} />
      : <a key={`u${start}`} href={href} target="_blank" rel="noreferrer" title={href} className={chip}>{label}</a>);
    at = start + href.length;
  }
  keys(text.slice(at), at);
  return <>{parts}</>;
}

export function DurPill({ d }: { d: Dur }) {
  return (
    <span className="ml-1.5 inline-flex items-center whitespace-nowrap rounded-full bg-tm-tint px-2 align-[0.08em] text-[0.8em] font-bold leading-[1.6] tabular-nums text-tm-deep"
      title={d.unit === '일차' ? '진행한 날 수' : '소요기간'}>
      {durLabel(d)}
    </span>
  );
}

const PANEL_STYLE: Record<PanelKind, string> = {
  info: 'border-l-tm-blue bg-tm-tint', note: 'border-l-tm-violet bg-tm-violet-tint', success: 'border-l-tm-ok bg-tm-ok-tint',
  warning: 'border-l-tm-warn bg-tm-warn-tint', error: 'border-l-tm-red bg-tm-red-tint',
};

/** 줄 머리 - 종류마다 글머리표 · 번호 · 체크 상자 · 결정 표시 */
function Marker({ l }: { l: Line }) {
  if (l.note) return <span aria-hidden className="flex-none text-tm-sub">→</span>;
  if (l.kind === 'num') return <span aria-hidden className="flex-none font-bold tabular-nums text-tm-sub">{l.num ?? 1}.</span>;
  if (l.kind === 'task' || l.kind === 'done') {
    return (
      <span role="img" aria-label={l.kind === 'done' ? '끝낸 작업 항목' : '작업 항목'}
        className={`mt-[0.28em] grid h-[1.05em] w-[1.05em] flex-none place-items-center rounded-[4px] border-[1.5px] text-[0.8em] leading-none ${
          l.kind === 'done' ? 'border-tm-blue bg-tm-blue text-white' : 'border-tm-edge'}`}>
        {l.kind === 'done' ? '✓' : ''}
      </span>
    );
  }
  if (l.kind === 'decision') return <span aria-label="결정" role="img" className="flex-none text-[0.9em] text-tm-ok-text">◆</span>;
  return <span aria-hidden className={`mt-[0.66em] h-[0.34em] w-[0.34em] flex-none rounded-full ${l.depth ? 'border-[1.5px] border-tm-sub' : 'bg-tm-ink/75'}`} />;
}

/** 칸 글 - 한 줄에 한 가지, 들여쓴 줄은 하위 줄. 제목 · 인용 · 패널 · 구분선 · 작업 항목 · 결정도. 글자 크기는 둘레(em)를 따른다 */
export function CellText({ text, empty = '없음' }: { text: string; empty?: string }) {
  const lines = useMemo(() => parseLines(text), [text]);
  if (!lines.length) return <p className="text-[0.92em] text-tm-sub">{empty}</p>;
  return (
    <ul className="flex flex-col gap-[0.18em] leading-[1.6]">
      {lines.map((l, i) => {
        const pad = { paddingLeft: `${l.depth * 1.15}em` };
        const body = (
          <>
            <Inline text={l.text} />
            {l.dur && <DurPill d={l.dur} />}
          </>
        );
        if (l.kind === 'divider') return <li key={i} role="separator" className="my-1 border-t border-tm-line" style={pad} />;
        if (l.kind === 'h1' || l.kind === 'h2' || l.kind === 'h3') {
          return (
            <li key={i} className={`mt-[0.3em] font-extrabold leading-[1.35] text-tm-deep [overflow-wrap:anywhere] ${
              l.kind === 'h1' ? 'text-[1.3em]' : l.kind === 'h2' ? 'text-[1.15em]' : 'text-[1.03em]'}`} style={pad}>{body}</li>
          );
        }
        if (l.kind === 'quote') {
          return <li key={i} className="border-l-[3px] border-tm-line pl-[0.75em] text-tm-sub [overflow-wrap:anywhere]" style={{ marginLeft: pad.paddingLeft }}>{body}</li>;
        }
        if (l.kind === 'panel') {
          const p = PANEL_KINDS.find((x) => x.id === l.panel) ?? PANEL_KINDS[0];
          return (
            <li key={i} className={`my-[0.15em] flex gap-[0.55em] rounded-lg border-l-4 px-[0.7em] py-[0.35em] ${PANEL_STYLE[p.id]}`} style={{ marginLeft: pad.paddingLeft }}>
              <span role="img" aria-label={`${p.label} 패널`} className="flex-none">{p.icon}</span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{body}</span>
            </li>
          );
        }
        return (
          <li key={i} className="flex gap-[0.55em]" style={pad}>
            <Marker l={l} />
            <span className={`min-w-0 flex-1 [overflow-wrap:anywhere] ${l.note ? 'text-tm-sub' : ''} ${l.kind === 'done' ? 'text-tm-sub' : ''}`}>{body}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── 프로젝트 표 ─────────────────────────────────────────── */

export interface Col<T> {
  key: keyof T & string;
  label: string;
  /** 빈 칸에 흐리게 보이는 도움말 */
  hint: string;
}

type Row = { id: string; project: string };

const projectInput =
  'w-full min-w-0 rounded-tm-sm border border-transparent bg-transparent px-2.5 py-2 text-[15px] font-extrabold text-tm-deep ' +
  'transition-[border-color,background-color,box-shadow] duration-150 placeholder:font-semibold placeholder:text-tm-sub ' +
  'hover:bg-tm-bg focus:border-tm-blue focus:bg-tm-card focus:shadow-[0_0_0_3px_rgba(38,68,203,0.2)] max-[760px]:text-[16px]';

const rowBtn =
  'grid h-7 w-7 flex-none place-items-center rounded-md text-tm-sub transition-colors hover:bg-tm-tint hover:text-tm-blue ' +
  'disabled:opacity-30 disabled:hover:bg-transparent [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10';

export function ProjectsEditor<T extends Row>({
  idBase, value, cols, onChange, blank, names, wide, onRemoveAsk, nameMax, lead,
}: {
  idBase: string;
  value: T[];
  cols: Col<T>[];
  onChange(next: T[]): void;
  blank(): T;
  /** 프로젝트 이름 고르기 목록 */
  names: string[];
  wide: boolean;
  /** 글이 있는 줄을 빼기 전에 묻는다 - 참이면 뺀다 */
  onRemoveAsk(row: T): Promise<boolean>;
  nameMax: number;
  /** 표 위 오른쪽에 둘 단추 */
  lead?: React.ReactNode;
}) {
  /** 줄이 하나도 없을 때 보이는 빈 줄 - 글을 치면 그때 저장한다(같은 id 라 초점이 그대로 남는다) */
  const [phantom] = useState(blank);
  const env = useContext(Env);
  const rows = value.length ? value : [phantom];
  const focusNext = useRef<string | null>(null);
  useEffect(() => {
    if (!focusNext.current) return;
    document.getElementById(`${idBase}-${focusNext.current}-project`)?.focus();
    focusNext.current = null;
  });

  const patch = (row: T, p: Partial<T>) => {
    const next = value.length ? value.map((r) => (r.id === row.id ? { ...r, ...p } : r)) : [{ ...phantom, ...p }];
    onChange(next);
  };
  const add = () => {
    const r = blank();
    focusNext.current = r.id;
    onChange([...value, r]);
  };
  const move = (row: T, dir: -1 | 1) => {
    const i = value.findIndex((r) => r.id === row.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = async (row: T) => {
    if (!value.some((r) => r.id === row.id)) return;
    const hasText = cols.some((c) => String(row[c.key] ?? '').trim()) || row.project.trim();
    if (hasText && !(await onRemoveAsk(row))) return;
    onChange(value.filter((r) => r.id !== row.id));
  };

  const listId = `${idBase}-names`;
  const datalist = (
    <datalist id={listId}>
      {names.slice(0, 50).map((n) => <option key={n} value={n} />)}
    </datalist>
  );

  const actions = (row: T, i: number) => {
    const name = row.project.trim() || `${i + 1}번째 프로젝트`;
    return (
      <span className="flex flex-none items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100
                       [@media(pointer:coarse)]:opacity-100 max-[760px]:opacity-100">
        <button type="button" onClick={() => move(row, -1)} disabled={i === 0 || !value.length} aria-label={`${name} 위로`} title="위로" className={rowBtn}>
          <IconArrow dir="up" size={14} />
        </button>
        <button type="button" onClick={() => move(row, 1)} disabled={i >= value.length - 1} aria-label={`${name} 아래로`} title="아래로" className={rowBtn}>
          <IconArrow dir="down" size={14} />
        </button>
        <button type="button" onClick={() => void remove(row)} disabled={!value.length} aria-label={`${name} 줄 빼기`} title="줄 빼기"
          className={`${rowBtn} hover:!bg-tm-red-tint hover:!text-tm-red-deep`}>
          <IconClose size={14} />
        </button>
      </span>
    );
  };

  const nameField = (row: T, i: number) => (
    <input id={`${idBase}-${row.id}-project`} value={row.project} maxLength={nameMax} list={listId} autoComplete="off"
      placeholder="프로젝트" aria-label={`${i + 1}번째 줄 프로젝트 이름`}
      onChange={(e) => patch(row, { project: e.target.value } as Partial<T>)}
      className={projectInput} />
  );

  const addBtn = (
    <button type="button" onClick={add} className={`${tmGhostBtn} border-dashed`}>
      <IconPlus size={15} />
      프로젝트 줄 추가
    </button>
  );

  if (wide) {
    const tpl = { gridTemplateColumns: `minmax(130px, 176px) repeat(${cols.length}, minmax(0, 1fr))` };
    return (
      <div>
        {datalist}
        <div role="table" aria-label="프로젝트별" className="overflow-hidden rounded-tm-sm border border-tm-line">
          <div role="row" className="grid border-b border-tm-line bg-tm-bg" style={tpl}>
            <span role="columnheader" className="px-3.5 py-2 text-[13px] font-bold text-tm-sub">프로젝트</span>
            {cols.map((c) => (
              <span key={c.key} role="columnheader" className="border-l border-tm-line px-3.5 py-2 text-[13px] font-bold text-tm-sub">{c.label}</span>
            ))}
          </div>
          {rows.map((row, i) => (
            <div key={row.id} role="row" className="group/row grid border-b border-tm-line bg-tm-card last:border-b-0" style={tpl}>
              <div role="cell" className="flex min-w-0 flex-col gap-1 p-1">
                {nameField(row, i)}
                <span className="px-1">{actions(row, i)}</span>
              </div>
              {cols.map((c) => (
                <div key={c.key} role="cell" className="min-w-0 border-l border-tm-line p-1">
                  <RichCell id={`${idBase}-${row.id}-${c.key}`} value={String(row[c.key] ?? '')} env={env} variant="cell" minLines={2}
                    label={`${row.project.trim() || `${i + 1}번째 프로젝트`} ${c.label}`} placeholder={c.hint}
                    onChange={(v) => patch(row, { [c.key]: v } as Partial<T>)} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {addBtn}
          {lead}
        </div>
      </div>
    );
  }

  return (
    <div>
      {datalist}
      <ol className="flex flex-col gap-2.5">
        {rows.map((row, i) => (
          <li key={row.id} className="group/row rounded-tm-sm border border-tm-line bg-tm-card p-2.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div className="min-w-0 flex-1">{nameField(row, i)}</div>
              {actions(row, i)}
            </div>
            <div className="grid gap-2.5 min-[640px]:grid-cols-2">
              {cols.map((c) => (
                <div key={c.key} className="min-w-0">
                  <p aria-hidden className="mb-1 text-[13px] font-bold text-tm-sub">{c.label}</p>
                  <RichCell id={`${idBase}-${row.id}-${c.key}`} value={String(row[c.key] ?? '')} env={env} placeholder={c.hint}
                    label={`${row.project.trim() || `${i + 1}번째 프로젝트`} ${c.label}`}
                    onChange={(v) => patch(row, { [c.key]: v } as Partial<T>)} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {addBtn}
        {lead}
      </div>
    </div>
  );
}

/** 프로젝트 표 보기 - 글이 하나도 없는 줄은 뺀다. 글자 크기는 둘레(em)를 따른다 */
export function ProjectsView<T extends Row>({ rows, cols, wide, empty = '적은 프로젝트가 없습니다' }: {
  rows: T[];
  cols: Col<T>[];
  wide: boolean;
  empty?: string;
}) {
  const shown = rows.filter((r) => cols.some((c) => String(r[c.key] ?? '').trim()));
  if (!shown.length) return <p className="text-[0.92em] text-tm-sub">{empty}</p>;
  if (wide) {
    const tpl = { gridTemplateColumns: `minmax(110px, 160px) repeat(${cols.length}, minmax(0, 1fr))` };
    return (
      <div role="table" className="overflow-hidden rounded-tm-sm border border-tm-line">
        <div role="row" className="grid border-b border-tm-line bg-tm-bg" style={tpl}>
          <span role="columnheader" className="px-3 py-1.5 text-[0.8em] font-bold text-tm-sub">프로젝트</span>
          {cols.map((c) => <span key={c.key} role="columnheader" className="border-l border-tm-line px-3 py-1.5 text-[0.8em] font-bold text-tm-sub">{c.label}</span>)}
        </div>
        {shown.map((r) => (
          <div key={r.id} role="row" className="grid border-b border-tm-line last:border-b-0" style={tpl}>
            <span role="rowheader" className="min-w-0 px-3 py-2 font-extrabold text-tm-deep [overflow-wrap:anywhere]">{projectLabel(r.project)}</span>
            {cols.map((c) => (
              <div key={c.key} role="cell" className="min-w-0 border-l border-tm-line px-3 py-2">
                <CellText text={String(r[c.key] ?? '')} empty="-" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {shown.map((r) => (
        <section key={r.id} className="rounded-tm-sm border border-tm-line px-3.5 py-2.5">
          <h4 className="mb-1.5 font-extrabold text-tm-deep [overflow-wrap:anywhere]">{projectLabel(r.project)}</h4>
          <div className="flex flex-col gap-2">
            {cols.filter((c) => String(r[c.key] ?? '').trim()).map((c) => (
              <div key={c.key}>
                <p className="mb-0.5 text-[0.8em] font-bold text-tm-sub">{c.label}</p>
                <CellText text={String(r[c.key] ?? '')} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── 사람 표시 ───────────────────────────────────────── */

/** 명단 사람의 동그라미 - 계정이 이어져 있으면 그 사람 아바타(사진 · 색), 아니면 이름 글자 */
export function PersonMark({ name, member, size = 32 }: { name: string; member: Member | null; size?: number }) {
  if (member) return <Avatar id={member.id} size={size} />;
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-full border border-tm-line bg-tm-bg font-bold text-tm-sub"
      style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initialOf(name)}
    </span>
  );
}

/* ── 회의 모드 ─────────────────────────────────────────────
   회의 때 화면에 띄워 한 사람씩 크게 본다. ← → 로 넘기고 Esc 로 닫는다. 위의 이름을 누르면 그 사람으로.
   사람마다 머문 시간을 잰다(이 기기에서만) */

export interface MeetingItem {
  id: string;
  name: string;
  member: Member | null;
  filled: boolean;
  /** 이름 옆 작은 글(작성 시각 등) */
  meta?: string;
  body: React.ReactNode;
  /** 옆에 함께 볼 것(일간: 그 사람의 전일 보고) */
  side?: { title: string; body: React.ReactNode };
}

/** 옆 칸 켜고 끄기 - 쓰는 쪽이 이 브라우저에 기억한다 */
export interface MeetingSide { on: boolean; label: string; onToggle(): void }

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function MeetingView({ title, items, onClose, side }: { title: string; items: MeetingItem[]; onClose(): void; side?: MeetingSide }) {
  const [idx, setIdx] = useState(() => Math.max(0, items.findIndex((x) => x.filled)));
  const [since, setSince] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [total] = useState(() => Date.now());
  const box = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const cur = items[Math.min(idx, items.length - 1)];

  const go = useCallback((i: number) => {
    setIdx(Math.max(0, Math.min(items.length - 1, i)));
    setSince(Date.now());
    body.current?.scrollTo({ top: 0 });
  }, [items.length]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(idx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(idx - 1);
      } else if ((e.key === 'p' || e.key === 'P' || e.code === 'KeyP') && side && !e.isComposing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        side.onToggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, idx, onClose, side]);

  if (!cur) return null;
  const done = items.filter((x) => x.filled).length;
  const showSide = !!side?.on && items.some((x) => x.side);

  return (
    <div ref={box} role="dialog" aria-modal="true" aria-label={`${title} 회의 모드`} tabIndex={-1}
      className="fixed inset-0 z-[80] flex flex-col bg-tm-bg outline-none animate-tm-fade">
      <header className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-b border-tm-line bg-tm-card px-6 py-3 max-[720px]:px-4">
        <p className="text-[17px] font-extrabold text-tm-deep">{title}</p>
        <p className="text-[13.5px] font-semibold text-tm-sub">작성 {done}/{items.length}명 · 회의 {clock(now - total)}</p>
        <span className="flex-1" />
        <p className="text-[13.5px] font-semibold tabular-nums text-tm-sub" aria-live="off">이 사람 {clock(now - since)}</p>
        {side && (
          <button type="button" aria-pressed={side.on} onClick={side.onToggle} title={`${side.label} (P)`}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-tm-sub hover:text-tm-blue [@media(pointer:coarse)]:min-h-11">
            <span aria-hidden className={`inline-block h-4 w-7 rounded-full p-0.5 transition-colors ${side.on ? 'bg-tm-blue' : 'bg-tm-edge'}`}>
              <span className={`block h-3 w-3 rounded-full bg-tm-card transition-transform ${side.on ? 'translate-x-3' : ''}`} />
            </span>
            {side.label}
          </button>
        )}
        <button type="button" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="앞 사람" title="앞 사람 (←)" className={tmIconBtn}>
          <IconArrow dir="left" />
        </button>
        <span className="min-w-[52px] text-center text-[14px] font-bold tabular-nums text-tm-ink">{idx + 1} / {items.length}</span>
        <button type="button" onClick={() => go(idx + 1)} disabled={idx >= items.length - 1} aria-label="다음 사람" title="다음 사람 (→)" className={tmIconBtn}>
          <IconArrow dir="right" />
        </button>
        <button type="button" onClick={onClose} className={tmGhostBtn} title="닫기 (Esc)">회의 모드 닫기</button>
      </header>
      <nav aria-label="사람" className="flex flex-none gap-1.5 overflow-x-auto border-b border-tm-line bg-tm-card px-6 py-2 max-[720px]:px-4">
        {items.map((x, i) => (
          <button key={x.id} type="button" onClick={() => go(i)} aria-current={i === idx ? 'true' : undefined}
            className={`inline-flex h-9 flex-none items-center gap-1.5 rounded-full border px-3 text-[13.5px] font-bold transition-colors ${
              i === idx ? 'border-tm-blue bg-tm-blue text-white'
                : x.filled ? 'border-tm-line bg-tm-card text-tm-ink hover:border-tm-blue' : 'border-dashed border-tm-edge bg-tm-card text-tm-sub hover:border-tm-blue'}`}>
            <i aria-hidden className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-tm-card' : x.filled ? 'bg-tm-ok' : 'bg-tm-edge'}`} />
            {x.name}
            {!x.filled && <span className="sr-only">(미작성)</span>}
          </button>
        ))}
      </nav>
      <div ref={body} className="min-h-0 flex-1 overflow-y-auto px-6 py-6 max-[720px]:px-4">
        {/* 전일 보고를 켜면 넓은 화면은 오른쪽에 나란히, 좁은 화면은 아래에 */}
        <div className={`mx-auto grid items-start gap-5 ${showSide ? 'max-w-[1680px] min-[1180px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]' : 'max-w-[1280px]'}`}>
          <article className="min-w-0 rounded-tm border border-tm-line bg-tm-card px-8 py-7 text-[18px] shadow-tm max-[720px]:px-4 max-[720px]:py-5 max-[720px]:text-[16px]">
            <div className="mb-5 flex items-center gap-3.5">
              <PersonMark name={cur.name} member={cur.member} size={48} />
              <div className="min-w-0">
                <h2 className="text-[28px] font-extrabold leading-tight text-tm-deep max-[720px]:text-[22px]">{cur.name}</h2>
                {cur.meta && <p className="text-[14px] font-semibold text-tm-sub">{cur.meta}</p>}
              </div>
            </div>
            {cur.body}
          </article>
          {showSide && cur.side && (
            <aside aria-label={cur.side.title}
              className="min-w-0 rounded-tm border border-dashed border-tm-edge bg-tm-card/70 px-6 py-5 text-[16px] max-[720px]:px-4 max-[720px]:text-[15px]">
              <p className="mb-3 text-[15px] font-extrabold text-tm-sub">{cur.side.title}</p>
              {cur.side.body}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
