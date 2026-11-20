'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { REF_TYPE_LABEL, refTypeOf, type Doc, type RefType, type TaskRef } from './types';
import { isWikiHome } from './docStore';
import { DRIVE_FOLDER, driveUrl, loadDrive, type DriveItem } from './driveTree';
import { IconClose, IconNav, IconPlus, IconSearch, tmBtn, tmGhostBtn, tmIconBtnSm, tmInput, tmLabel } from './ui';

/**
 * 작업의 '참고자료' 칸 - 설명과 따로, 무엇인지 아이콘으로 보인다.
 *   위키 문서(누르면 위키에서 열림) · 구글 드라이브 파일(팀 드라이브 목록에서 찾기) · 파일 올리기(PDF · 한글 …) · 링크.
 * 예) 몰리 스윙 (PDF) · 몰리 스윙 (기획 문서)
 */

/** 아이콘 - 갈래마다 색 다른 네모에 짧은 글자. 위키 · 폴더 · 링크는 그림 */
const ICON: Record<RefType, { text?: string; cls: string }> = {
  wiki: { cls: 'bg-tm-tint text-tm-blue' },
  pdf: { text: 'PDF', cls: 'bg-tm-red-tint text-tm-red-deep' },
  hwp: { text: 'HWP', cls: 'bg-tm-teal-tint text-tm-teal-deep' },
  doc: { text: 'DOC', cls: 'bg-tm-tint text-tm-blue' },
  sheet: { text: 'XLS', cls: 'bg-tm-ok-tint text-tm-ok-deep' },
  slide: { text: 'PPT', cls: 'bg-tm-warn-tint text-tm-warn-deep' },
  image: { text: 'IMG', cls: 'bg-tm-violet-tint text-tm-violet-deep' },
  video: { text: 'VID', cls: 'bg-tm-violet-tint text-tm-violet-deep' },
  archive: { text: 'ZIP', cls: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line' },
  folder: { cls: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line' },
  link: { cls: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line' },
  file: { text: 'FILE', cls: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line' },
};

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function RefIcon({ type, size = 30 }: { type: RefType; size?: number }) {
  const ic = ICON[type];
  return (
    <span aria-hidden style={{ width: size, height: size }}
      className={`grid flex-none place-items-center rounded-[7px] text-[10px] font-extrabold tracking-[-0.02em] ${ic.cls}`}>
      {ic.text ?? (type === 'wiki' ? <IconNav name="wiki" size={17} />
        : type === 'folder' ? (
          <svg viewBox="0 0 20 20" width={16} height={16} {...svg}><path d="M2.5 5.5h5l1.5 2h8.5v8.5h-15z" /></svg>
        ) : (
          <svg viewBox="0 0 20 20" width={16} height={16} {...svg}>
            <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-1 1M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l1-1" />
          </svg>
        ))}
    </span>
  );
}

type Adding = null | 'wiki' | 'drive' | 'link';

const FILE_ACCEPT = '.pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md,.zip,.7z,image/*,video/*';

export function TaskRefs({ refs, docs, onChange, onOpenDoc, onNotice, idPrefix = 'tm-ref' }: {
  refs: TaskRef[];
  /** 위키 문서 - 고르기 목록 · 지금 제목 */
  docs: Doc[];
  onChange(next: TaskRef[]): void;
  /** 위키 문서를 연다 - 없으면 누를 수 없다(새 작업 창) */
  onOpenDoc?(id: string): void;
  onNotice?(text: string): void;
  idPrefix?: string;
}) {
  const [adding, setAdding] = useState<Adding>(null);
  const [busy, setBusy] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const live = useMemo(() => docs.filter((d) => !d.trashedAt && !isWikiHome(d.id)), [docs]);
  const docById = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);

  const add = (r: TaskRef) => {
    // 같은 것을 두 번 넣지 않는다
    if (refs.some((x) => x.kind === r.kind && x.target === r.target)) return;
    onChange([...refs, r]);
  };
  const remove = (i: number) => onChange(refs.filter((_, j) => j !== i));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setBusy((n) => n + list.length);
    const { uploadReportFile } = await import('./reportFiles');
    const added: TaskRef[] = [];
    for (const f of list) {
      try {
        const target = await uploadReportFile(f, undefined, 'tasks');
        added.push({ kind: 'file', title: f.name, target, ...(f.type ? { mime: f.type } : {}) });
      } catch (e) {
        onNotice?.(e instanceof Error ? e.message : `'${f.name}' 을(를) 올리지 못했습니다.`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (added.length) onChange([...refs, ...added]);
  };

  const open = async (r: TaskRef) => {
    if (r.kind === 'wiki') return onOpenDoc?.(r.target);
    if (r.kind === 'file') {
      try {
        const { openReportFile } = await import('./reportFiles');
        await openReportFile(r.target);
      } catch (e) {
        onNotice?.(e instanceof Error ? e.message : '파일을 열지 못했습니다.');
      }
      return;
    }
    if (/^https?:\/\//i.test(r.target)) window.open(r.target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <p className={tmLabel} id={`${idPrefix}-head`}>참고자료</p>
      {refs.length > 0 && (
        <ul aria-labelledby={`${idPrefix}-head`} className="mb-2.5 overflow-hidden rounded-tm-sm border border-tm-line">
          {refs.map((r, i) => {
            const doc = r.kind === 'wiki' ? docById.get(r.target) : undefined;
            const gone = r.kind === 'wiki' && (!doc || !!doc.trashedAt);
            const title = (doc?.title || r.title || '제목 없음').trim();
            const type = refTypeOf(r);
            const canOpen = r.kind === 'wiki' ? !!onOpenDoc && !gone : true;
            return (
              <li key={`${r.kind}:${r.target}`} className="flex items-center gap-1 border-b border-tm-line bg-tm-card last:border-b-0">
                <button type="button" disabled={!canOpen} onClick={() => void open(r)}
                  title={canOpen ? (r.kind === 'wiki' ? '위키에서 열기' : '새 창으로 열기') : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 enabled:hover:bg-tm-tint disabled:cursor-default">
                  <RefIcon type={type} />
                  <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-tm-ink">
                    {title}
                    <span className="ml-1 font-medium text-tm-sub">({gone ? '지운 문서' : REF_TYPE_LABEL[type]})</span>
                  </span>
                </button>
                <button type="button" onClick={() => remove(i)} aria-label={`참고자료 ${title} 빼기`} className={`${tmIconBtnSm} mr-1.5 flex-none`}>
                  <IconClose size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-1.5">
        <button type="button" aria-expanded={adding === 'wiki'} onClick={() => setAdding(adding === 'wiki' ? null : 'wiki')} className={tmGhostBtn}>
          <IconPlus size={15} /> 위키 문서
        </button>
        <button type="button" aria-expanded={adding === 'drive'} onClick={() => setAdding(adding === 'drive' ? null : 'drive')} className={tmGhostBtn}>
          <IconPlus size={15} /> 구글 드라이브
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy > 0} className={tmGhostBtn}>
          <IconPlus size={15} /> {busy > 0 ? `올리는 중 ${busy}` : '파일 올리기'}
        </button>
        <button type="button" aria-expanded={adding === 'link'} onClick={() => setAdding(adding === 'link' ? null : 'link')} className={tmGhostBtn}>
          <IconPlus size={15} /> 링크
        </button>
        <input ref={fileRef} type="file" multiple accept={FILE_ACCEPT} className="hidden"
          onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} />
      </div>

      {adding === 'wiki' && (
        <WikiPick docs={live} picked={refs} onPick={(d) => { add({ kind: 'wiki', title: d.title, target: d.id }); setAdding(null); }}
          onClose={() => setAdding(null)} />
      )}
      {adding === 'drive' && (
        <DrivePick picked={refs} onPick={(it) => { add({ kind: 'drive', title: it.name, target: driveUrl(it), mime: it.mime }); setAdding(null); }}
          onClose={() => setAdding(null)} />
      )}
      {adding === 'link' && <LinkForm onAdd={(r) => { add(r); setAdding(null); }} onClose={() => setAdding(null)} />}
    </div>
  );
}

/** 찾기 칸 + 결과 줄 - 위키 · 드라이브 고르기가 같이 쓴다 */
function PickBox({ label, query, onQuery, onClose, children }: {
  label: string; query: string; onQuery(v: string): void; onClose(): void; children: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="mt-2.5 rounded-tm-sm border border-tm-line bg-tm-bg p-2.5">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={16} /></span>
        <input ref={ref} value={query} onChange={(e) => onQuery(e.target.value)} aria-label={label} placeholder={label}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
          className={`${tmInput} h-11 pl-9`} />
      </div>
      <ul className="mt-2 max-h-[264px] overflow-y-auto">{children}</ul>
    </div>
  );
}

function PickRow({ type, title, sub, disabled, onPick }: { type: RefType; title: string; sub?: string; disabled?: boolean; onPick(): void }) {
  return (
    <li>
      <button type="button" disabled={disabled} onClick={onPick}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 enabled:hover:bg-tm-card disabled:opacity-50">
        <RefIcon type={type} size={26} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-tm-ink">{title}</span>
          {sub && <span className="block truncate text-[12.5px] text-tm-sub">{sub}</span>}
        </span>
        {disabled && <span className="flex-none text-[12.5px] font-semibold text-tm-sub">넣음</span>}
      </button>
    </li>
  );
}

const Empty = ({ text }: { text: string }) => <li className="px-2 py-3 text-center text-[13.5px] font-semibold text-tm-sub">{text}</li>;

function WikiPick({ docs, picked, onPick, onClose }: { docs: Doc[]; picked: TaskRef[]; onPick(d: Doc): void; onClose(): void }) {
  const [q, setQ] = useState('');
  const byId = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return docs
      .filter((d) => !s || `${d.title} ${d.labels.join(' ')}`.toLowerCase().includes(s))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 30);
  }, [docs, q]);
  return (
    <PickBox label="위키 문서 찾기" query={q} onQuery={setQ} onClose={onClose}>
      {hits.length === 0 ? <Empty text={docs.length ? '맞는 문서가 없습니다' : '위키 문서가 없습니다'} /> : hits.map((d) => {
        const up = d.parentId ? byId.get(d.parentId) : undefined;
        return (
          <PickRow key={d.id} type="wiki" title={`${d.icon ? `${d.icon} ` : ''}${d.title || '제목 없음'}`}
            sub={up ? `${up.title || '제목 없음'} 아래` : undefined}
            disabled={picked.some((r) => r.kind === 'wiki' && r.target === d.id)} onPick={() => onPick(d)} />
        );
      })}
    </PickBox>
  );
}

type DriveState = { kind: 'loading' } | { kind: 'none'; text: string } | { kind: 'ok'; items: DriveItem[] };

function DrivePick({ picked, onPick, onClose }: { picked: TaskRef[]; onPick(it: DriveItem): void; onClose(): void }) {
  const [q, setQ] = useState('');
  const [st, setSt] = useState<DriveState>({ kind: 'loading' });
  useEffect(() => {
    let alive = true;
    void loadDrive().then((r) => {
      if (!alive) return;
      if (r.kind === 'ok') setSt({ kind: 'ok', items: r.snapshot.items.filter((it) => it.id !== r.snapshot.rootId) });
      else setSt({ kind: 'none', text: r.kind === 'local' ? '브라우저 저장 모드에서는 드라이브 목록이 없습니다' : r.kind === 'error' ? '드라이브 목록을 읽지 못했습니다' : '드라이브 목록이 아직 없습니다' });
    }).catch(() => alive && setSt({ kind: 'none', text: '드라이브 목록을 읽지 못했습니다' }));
    return () => { alive = false; };
  }, []);
  const hits = useMemo(() => {
    if (st.kind !== 'ok') return [];
    const s = q.trim().toLowerCase();
    // 찾는 말이 없으면 최근에 바뀐 파일부터(폴더는 찾을 때만)
    return st.items
      .filter((it) => (s ? it.name.toLowerCase().includes(s) : it.mime !== DRIVE_FOLDER))
      .sort((a, b) => (b.modified ?? '').localeCompare(a.modified ?? ''))
      .slice(0, 30);
  }, [st, q]);
  return (
    <PickBox label="드라이브 파일 찾기" query={q} onQuery={setQ} onClose={onClose}>
      {st.kind === 'loading' ? <Empty text="드라이브 목록을 읽는 중" />
        : st.kind === 'none' ? <Empty text={st.text} />
          : hits.length === 0 ? <Empty text="맞는 파일이 없습니다" />
            : hits.map((it) => {
              const target = driveUrl(it);
              return (
                <PickRow key={it.id} type={refTypeOf({ kind: 'drive', title: it.name, target, mime: it.mime })} title={it.name}
                  sub={it.modified ? `${it.modified.slice(0, 10)} 수정` : undefined}
                  disabled={picked.some((r) => r.kind === 'drive' && r.target === target)} onPick={() => onPick(it)} />
              );
            })}
    </PickBox>
  );
}

function LinkForm({ onAdd, onClose }: { onAdd(r: TaskRef): void; onClose(): void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const clean = url.trim();
  const ok = /^https?:\/\/[^\s]+$/i.test(clean);
  const submit = () => {
    if (!ok) return;
    let name = title.trim();
    if (!name) {
      try {
        const u = new URL(clean);
        name = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() ?? '') || u.hostname;
      } catch {
        name = clean;
      }
    }
    onAdd({ kind: /(^|\.)google\.com$/.test(safeHost(clean)) ? 'drive' : 'link', title: name.slice(0, 200), target: clean });
  };
  const keys = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
  };
  return (
    <div className="mt-2.5 grid gap-2 rounded-tm-sm border border-tm-line bg-tm-bg p-2.5">
      <label className="sr-only" htmlFor={`${id}-u`}>주소</label>
      <input id={`${id}-u`} ref={ref} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={keys}
        placeholder="https:// 주소" inputMode="url" className={`${tmInput} h-11`} aria-invalid={(!!clean && !ok) || undefined} />
      <label className="sr-only" htmlFor={`${id}-t`}>이름</label>
      <input id={`${id}-t`} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={keys}
        placeholder="이름 (비우면 주소에서)" className={`${tmInput} h-11`} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={tmGhostBtn}>취소</button>
        <button type="button" onClick={submit} disabled={!ok} className={tmBtn}>넣기</button>
      </div>
    </div>
  );
}

function safeHost(u: string): string {
  try {
    return new URL(u).hostname;
  } catch {
    return '';
  }
}
