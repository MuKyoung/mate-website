'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getSchema, type JSONContent } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';
import { wikiSchema } from './docSchema';
import { readConfluenceZip, readSingleFile, type CfExport } from './confluenceZip';
import {
  FILE_MAX, LABEL_MAX, autoMatch, personLabel, previewTree, runImport, type ImportOptions, type ImportReport,
} from './confluenceRun';
import { TEMPLATE_LABEL, type DocStore } from './docStore';
import type { Doc } from './types';
import { useMembers } from './members';
import { Modal, tmBtn, tmBtnPrimary, tmLabel, tmSelect } from './ui';

/*
 * Confluence 가져오기 창 - 스페이스 내보내기 ZIP(XML · HTML) · 문서 한 개(HTML · Word .doc · 저장 형식 .xml)를
 * 미리 보고(문서 트리 · 첨부 · 사람 잇기 · 넣을 자리 · 고를 것) 위키 문서로 옮긴다. 옮기는 일은 confluenceRun.ts 가 한다.
 * 옮기지 못한 것(Confluence 안에서만 열리는 그림 · 다른 스페이스 링크 · 그리지 못하는 매크로)은 끝에 보고서로 알린다.
 */

type Phase = 'reading' | 'preview' | 'running' | 'done' | 'error';

let schemaCache: Schema | null = null;
/** 편집기와 같은 문서 꼴로 검사한다 - 맞지 않으면 그 문서는 글만 옮긴다 */
const validate = (json: JSONContent) => {
  schemaCache ??= getSchema(wikiSchema());
  schemaCache.nodeFromJSON(json).check();
};

export default function ConfluenceImport({ file, store, me, remote, docs, onOpen, onClose, onNotice }: {
  file: File;
  store: DocStore;
  me: string;
  /** Supabase 모드인가 - 첨부 파일은 팀 저장소에만 올린다 */
  remote: boolean;
  /** 휴지통에 들지 않은 문서 - 넣을 자리 고르기 */
  docs: Doc[];
  onOpen(id: string): void;
  onClose(): void;
  onNotice?(text: string, tone?: 'ok' | 'err'): void;
}) {
  const members = useMembers();
  const [phase, setPhase] = useState<Phase>('reading');
  const [status, setStatus] = useState('파일을 여는 중…');
  const [model, setModel] = useState<CfExport | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0, text: '' });
  const [report, setReport] = useState<ImportReport | null>(null);
  const canFiles = remote && store.features.files;
  const [opt, setOpt] = useState<ImportOptions>({
    place: 'home', attachments: canFiles, comments: store.features.wiki, labels: true, blogs: true, templates: true, meta: true,
  });
  const [people, setPeople] = useState<Record<string, string>>({});
  const started = useRef(false);

  /* 파일 읽기 - 한 번만 */
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const m = /\.zip$/i.test(file.name) ? await readConfluenceZip(file, setStatus) : await readSingleFile(file);
        setModel(m);
        setPeople(autoMatch(m.users, members));
        setPhase('preview');
      } catch (e) {
        setError(e instanceof Error ? e.message : '파일을 읽지 못했습니다');
        setPhase('error');
      }
    })();
  }, [file, members]);

  const counts = useMemo(() => {
    if (!model) return null;
    const size = model.attachments.reduce((s, a) => s + (a.path ? a.size : 0), 0);
    return {
      pages: model.pages.filter((p) => p.kind !== 'blog').length,
      blogs: model.pages.filter((p) => p.kind === 'blog').length,
      files: model.attachments.filter((a) => a.path).length,
      big: model.attachments.filter((a) => a.size > FILE_MAX).length,
      size,
      comments: model.comments.length,
      templates: model.templates.length,
      labels: new Set(model.pages.flatMap((p) => p.labels)).size,
    };
  }, [model]);

  const tree = useMemo(() => (model ? previewTree(model) : []), [model]);
  /** 언급된 사람 - Confluence 앱 계정(…@connect.atlassian.com)은 뺀다 */
  const peopleList = useMemo(() => (model ? [...model.users.values()].filter((u) => !/@connect\.atlassian\.com$/.test(u.name ?? '')) : []), [model]);
  const placeOptions = useMemo(() => docs.filter((d) => !d.trashedAt).slice(0, 400), [docs]);

  const start = async () => {
    if (!model) return;
    setPhase('running');
    try {
      const r = await runImport(model, opt, people, members, { store, me, docs, canFiles, templateLabel: TEMPLATE_LABEL, validate },
        (done, total, text) => setProgress({ done, total, text }));
      setReport(r);
      setPhase('done');
      onNotice?.(`Confluence 에서 문서 ${r.docs}건을 가져왔습니다`, 'ok');
    } catch (e) {
      setError(e instanceof Error ? e.message : '가져오다 멈췄습니다');
      setPhase('error');
    }
  };

  const set = <K extends keyof ImportOptions>(k: K, v: ImportOptions[K]) => setOpt((o) => ({ ...o, [k]: v }));
  const docCount = (counts?.pages ?? 0) + (opt.blogs ? counts?.blogs ?? 0 : 0) + (opt.templates ? counts?.templates ?? 0 : 0);

  return (
    <Modal
      title="Confluence 가져오기"
      sub={file.name}
      size="lg"
      busy={phase === 'running'}
      onClose={onClose}
      foot={phase === 'preview' ? (
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>취소</button>
          <button type="button" onClick={() => void start()} className={tmBtnPrimary}>가져오기 · 문서 {docCount}건</button>
        </>
      ) : phase === 'done' && report ? (
        <>
          <button type="button" className={tmBtn}
            onClick={() => void navigator.clipboard.writeText(reportText(report, model)).then(
              () => onNotice?.('보고서를 복사했습니다', 'ok'),
              () => onNotice?.('보고서를 복사하지 못했습니다', 'err'),
            )}>
            보고서 복사
          </button>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          {report.rootId && (
            <button type="button" onClick={() => { onOpen(report.rootId!); onClose(); }} className={tmBtnPrimary}>가져온 문서 열기</button>
          )}
        </>
      ) : phase === 'error' ? (
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
        </>
      ) : undefined}
    >
      {phase === 'reading' && <Busy text={status} />}
      {phase === 'error' && (
        <p role="alert" className="rounded-tm-sm border border-[#f0c1bd] bg-[#fdeeec] px-4 py-3 text-[15px] font-semibold text-[#a81f1b]">{error}</p>
      )}
      {phase === 'running' && (
        <div className="py-6" aria-live="polite">
          <p className="mb-2 truncate text-[15px] font-bold text-tm-ink">{progress.text || '옮기는 중…'}</p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-tm-bg" role="progressbar" aria-label="가져오기 진행"
            aria-valuemin={0} aria-valuemax={progress.total || 1} aria-valuenow={progress.done}>
            <div className="h-full rounded-full bg-tm-blue transition-[width] duration-200"
              style={{ width: `${progress.total ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 5}%` }} />
          </div>
          <p className="mt-2 text-[13.5px] text-tm-sub">창을 닫지 말고 기다려 주세요. 문서가 많으면 몇 분 걸릴 수 있습니다.</p>
        </div>
      )}
      {phase === 'done' && report && <ReportView report={report} />}
      {phase === 'preview' && model && counts && (
        <div className="space-y-5">
          <section className="rounded-tm-sm border border-tm-line bg-tm-bg px-4 py-3">
            <p className="text-[15.5px] font-extrabold text-tm-ink">
              {model.space.name}
              {model.space.key && <span className="ml-1.5 text-[13.5px] font-bold text-tm-sub">({model.space.key})</span>}
            </p>
            <p className="mt-0.5 text-[13.5px] font-semibold text-tm-sub">
              {model.format === 'xml' ? 'XML 스페이스 내보내기' : model.format === 'html' ? 'HTML 스페이스 내보내기' : '문서 한 개'}
              {model.source === 'cloud' ? ' · Confluence Cloud' : model.source === 'server' ? ' · Confluence Data Center' : ''}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-semibold text-tm-ink">
              <li>문서 {counts.pages}</li>
              {counts.blogs > 0 && <li>블로그 글 {counts.blogs}</li>}
              <li>첨부 {counts.files}{counts.size ? ` · ${mb(counts.size)}` : ''}</li>
              {counts.comments > 0 && <li>댓글 {counts.comments}</li>}
              {counts.labels > 0 && <li>라벨 {counts.labels}</li>}
              {counts.templates > 0 && <li>양식 {counts.templates}</li>}
            </ul>
          </section>

          {model.notes.length > 0 && (
            <ul className="space-y-1 text-[13.5px] text-tm-sub">
              {model.notes.map((n) => <li key={n}>· {n}</li>)}
            </ul>
          )}

          <section>
            <p className={tmLabel}>문서 트리 미리 보기</p>
            <ul className="max-h-[220px] overflow-y-auto rounded-tm-sm border border-tm-line px-3 py-2 text-[14px]">
              {tree.slice(0, 300).map((t) => (
                <li key={t.id} className="truncate py-0.5" style={{ paddingLeft: t.depth * 16 }}>
                  <span className="text-tm-sub" aria-hidden>{t.kind === 'folder' ? '📁 ' : t.kind === 'blog' ? '📰 ' : ''}</span>
                  {t.title}
                </li>
              ))}
              {tree.length > 300 && <li className="py-0.5 text-tm-sub">… {tree.length - 300}개 더</li>}
            </ul>
          </section>

          <section>
            <label className={tmLabel} htmlFor="cf-place">넣을 자리</label>
            <select id="cf-place" className={`${tmSelect} w-full`} value={opt.place} onChange={(e) => set('place', e.target.value)}>
              <option value="home">한 문서 아래에 모으기 · {model.space.homeId ? '스페이스 첫 문서를' : `새 문서 '${model.space.name}'를`} 맨 위에</option>
              <option value="root">위키 맨 위에 그대로</option>
              {placeOptions.length > 0 && (
                <optgroup label="이 문서 아래에 모으기">
                  {placeOptions.map((d) => <option key={d.id} value={d.id}>{d.title || '제목 없는 문서'}</option>)}
                </optgroup>
              )}
            </select>
          </section>

          <section className="grid gap-2 sm:grid-cols-2">
            <Check on={opt.attachments} disabled={!canFiles || !counts.files} onChange={(v) => set('attachments', v)}
              label="첨부 파일 · 그림 옮기기"
              hint={!canFiles ? '이 브라우저 저장 모드에서는 옮기지 않습니다' : counts.big ? `20MB 넘는 파일 ${counts.big}개는 빼고 옮깁니다` : '팀 저장소에 올립니다'} />
            <Check on={opt.meta} onChange={(v) => set('meta', v)} label="원래 쓴 사람 · 날짜 남기기" hint="문서 맨 아래에 한 줄" />
            {model.format === 'xml' && (
              <>
                <Check on={opt.comments} disabled={!store.features.wiki || !counts.comments} onChange={(v) => set('comments', v)}
                  label="댓글 옮기기" hint="쓴 사람 · 날짜를 댓글 첫 줄에 적습니다" />
                <Check on={opt.labels} disabled={!counts.labels} onChange={(v) => set('labels', v)} label="라벨 옮기기" hint={`문서마다 ${LABEL_MAX}개까지`} />
                <Check on={opt.blogs} disabled={!counts.blogs} onChange={(v) => set('blogs', v)} label="블로그 글 옮기기" hint="'블로그' 문서 아래에" />
                <Check on={opt.templates} disabled={!counts.templates} onChange={(v) => set('templates', v)}
                  label="양식 옮기기" hint="'양식' 문서 아래에 · 새 문서 창에서 고를 수 있습니다" />
              </>
            )}
          </section>

          {peopleList.length > 0 && (
            <section>
              <p className={tmLabel}>사람 잇기</p>
              <p className="-mt-1 mb-2 text-[13.5px] text-tm-sub">
                Confluence 의 사람을 팀원과 이으면 언급(@)이 팀원 언급으로 들어옵니다. 잇지 않으면 이름을 글로 남깁니다.
              </p>
              <div className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
                {peopleList.map((u) => (
                  <div key={u.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-tm-ink" title={[u.displayName, u.email ?? u.name].filter(Boolean).join(' · ')}>
                      {personLabel(u)}
                    </span>
                    <select aria-label={`${personLabel(u)} 잇기`} className={`${tmSelect} h-10 w-full text-[14px]`} value={people[u.key] ?? ''}
                      onChange={(e) => setPeople((p) => ({ ...p, [u.key]: e.target.value }))}>
                      <option value="">이름을 글로 남기기</option>
                      {members.filter((m) => m.active !== false).map((m) => (
                        <option key={m.id} value={m.id}>{m.name}{m.email ? ` · ${m.email}` : ''}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}

function Busy({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-8" aria-live="polite">
      <span className="tm-upload-spin" aria-hidden />
      <span className="text-[15px] font-semibold text-tm-ink">{text}</span>
    </div>
  );
}

function Check({ on, disabled, onChange, label, hint }: {
  on: boolean; disabled?: boolean; onChange(v: boolean): void; label: string; hint?: string;
}) {
  return (
    <label className={`flex items-start gap-2.5 rounded-tm-sm border border-tm-line px-3 py-2.5 ${disabled ? 'opacity-55' : 'cursor-pointer hover:bg-tm-tint'}`}>
      <input type="checkbox" className="mt-1 h-4 w-4 flex-none accent-[#2644cb]" checked={on && !disabled} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} />
      <span className="min-w-0">
        <b className="block text-[14px] font-bold text-tm-ink">{label}</b>
        {hint && <small className="block text-[12.5px] text-tm-sub">{hint}</small>}
      </span>
    </label>
  );
}

const WARN_TITLES: Record<string, string> = {
  fail: '만들지 못한 문서 · 댓글',
  note: '알림',
  macro: '그대로 그리지 못한 매크로 - 내용은 살리고, 내용이 없는 것은 이름 · 값만 남겼습니다',
  attachment: '옮기지 못한 첨부 파일',
  image: 'Confluence 안에서만 열리는 그림(옮기지 못함)',
  link: '찾지 못한 링크 - 옮기지 않은 문서 · 다른 스페이스라 글로 남겼습니다',
  user: '팀원과 잇지 않은 사람 - 이름을 글로 남겼습니다',
  content: '모양을 다 살리지 못하고 글로만 옮긴 문서',
};

function ReportView({ report }: { report: ImportReport }) {
  const groups = [...report.warns.entries()].filter(([, m]) => m.size);
  return (
    <div className="space-y-4">
      <p className="rounded-tm-sm border border-[#b5dfca] bg-[#e3f4ec] px-4 py-3 text-[15px] font-bold text-[#0f6b47]">
        문서 {report.docs}건 · 첨부 {report.files}건{report.comments ? ` · 댓글 ${report.comments}건` : ''}을 옮겼습니다
      </p>
      {groups.length === 0 ? <p className="text-[14px] text-tm-sub">빠진 것 없이 옮겼습니다.</p> : groups.map(([kind, m]) => (
        <section key={kind}>
          <p className="mb-1 text-[14px] font-bold text-tm-ink">{WARN_TITLES[kind] ?? kind}</p>
          <ul className="max-h-[160px] overflow-y-auto rounded-tm-sm border border-tm-line px-3 py-2 text-[13.5px] text-tm-ink">
            {[...m.entries()].sort((a, b) => b[1] - a[1]).map(([what, n]) => (
              <li key={what} className="py-0.5">{what}{n > 1 ? <span className="text-tm-sub"> × {n}</span> : null}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-[13px] text-tm-sub">Confluence 의 예전 판 기록 · 보기 권한 · 좋아요는 옮기지 않습니다.</p>
    </div>
  );
}

function reportText(r: ImportReport, model: CfExport | null): string {
  const lines = [`Confluence 가져오기 · ${model?.space.name ?? ''}`, `문서 ${r.docs} · 첨부 ${r.files} · 댓글 ${r.comments}`];
  r.warns.forEach((m, kind) => {
    if (!m.size) return;
    lines.push('', WARN_TITLES[kind] ?? kind);
    [...m.entries()].forEach(([what, n]) => lines.push(`- ${what}${n > 1 ? ` × ${n}` : ''}`));
  });
  return lines.join('\n');
}

const mb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
