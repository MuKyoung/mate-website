'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DRIVE_ACCOUNT, buildDriveTree, buildFilesOf, driveUrl, folderHint, loadDrive, loadDriveStamp, plainName, sizeText,
  type BuildFile, type DriveLoad,
} from './driveTree';
import {
  addComment, loadBuildMarks, loadComments, loadNote, removeComment, saveNote,
  type DriveComment, type DriveNote,
} from './driveNotes';
import { useMember } from './members';
import {
  Avatar, IconClose, IconSearch, PageHead, tmBtn, tmBtnPrimary, tmFieldBase, tmGhostBtn, tmIconBtnSm, tmTextarea, useConfirm, useMediaQuery,
} from './ui';

/*
 * 빌드 파일 - 팀 구글 드라이브의 프로젝트별 '빌드파일' 폴더(예: 00. 젤리몰리 › 99. 빌드파일)에 올라온 파일을 모아 보여 준다.
 * 목록은 구글 드라이브 화면과 같은 드라이브 목록 한 벌(tm_drive_snapshot)에서 뽑는다 - 따로 드라이브를 부르지 않는다.
 * 파일을 누르면 옆 칸에 빌드 안내(팀원 누구나 고침) · 드라이브로 가는 단추 · 댓글. 안내 · 댓글은 driveNotes.ts.
 * 파일 자체는 드라이브에만 있다(Hub 서버에 올리지 않는다).
 */

const DAY = 86_400_000;
const FRESH_DAYS = 3;
const STAMP_EVERY = 120_000;

const chip =
  'inline-flex h-[34px] flex-none items-center whitespace-nowrap rounded-full border border-tm-edge bg-tm-card px-3 text-[13.5px] font-bold text-tm-ink ' +
  'transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white ' +
  '[@media(pointer:coarse)]:h-11';
const messageCard =
  'tm-fill flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-tm border border-tm-line bg-tm-card px-6 py-16 text-center shadow-tm';

const norm = (s: string) => s.normalize('NFC').toLowerCase();
const num = (n: number) => n.toLocaleString('ko-KR');

function whenText(ms: number, now: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const days = Math.floor((now - ms) / DAY);
  const md = `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return days < 1 ? `오늘 ${md.slice(md.indexOf('일') + 2)}` : days < 2 ? `어제 ${md.slice(md.indexOf('일') + 2)}` : md;
}

/** 빌드 폴더 아래 첫 폴더(배포용 · QA용 · 기능 개발 테스트용 …) - 목록 거르기에 쓴다 */
const stageOf = (f: BuildFile) => (f.trail[0] ? folderHint(f.trail[0].item.name).title : '기타');
const trailText = (f: BuildFile) => f.trail.map((t) => folderHint(t.item.name).title).join(' › ');

export default function Builds({ me, admin = false }: { me: string; admin?: boolean }) {
  const [load, setLoad] = useState<DriveLoad | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const next = await loadDrive().catch((e: unknown) => ({ kind: 'error', message: e instanceof Error ? e.message : String(e) }) as DriveLoad);
    setLoad(next);
    setStamp(next.kind === 'ok' ? next.snapshot.syncedAt : null);
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  /* 새 빌드가 올라오면 - 화면이 보이는 동안 2분마다 갱신 시각만 보고, 바뀌었으면 다시 읽는다 */
  useEffect(() => {
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      const s = await loadDriveStamp().catch(() => null);
      if (s && s !== stamp) void reload();
    };
    const id = window.setInterval(() => void check(), STAMP_EVERY);
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [reload, stamp]);

  const files = useMemo(() => (load?.kind === 'ok' ? buildFilesOf(buildDriveTree(load.snapshot)) : []), [load]);

  return (
    <>
      <PageHead
        title="빌드 파일"
        lead="프로젝트마다 구글 드라이브의 '빌드파일' 폴더에 올라온 파일입니다. 파일을 누르면 빌드 안내와 댓글이 보이고, 드라이브에서 받습니다. 드라이브에 올리면 1~2분 안에 여기에 나옵니다."
      />
      {load === null ? (
        <div className={messageCard}><p className="text-[15px] font-semibold text-tm-sub">빌드 파일을 읽는 중…</p></div>
      ) : load.kind === 'local' ? (
        <div className={messageCard}><p className="text-[17px] font-bold text-tm-ink">팀 서버에 연결된 Hub 에서만 보입니다</p></div>
      ) : load.kind !== 'ok' ? (
        <div className={messageCard} role="alert">
          <p className="text-[17px] font-bold text-tm-ink">드라이브 목록을 읽지 못했습니다</p>
          {load.kind === 'error' && <p className="max-w-[60ch] break-words text-[14px] leading-[1.7] text-tm-sub">{load.message}</p>}
          <button type="button" onClick={() => void reload()} className={tmGhostBtn}>다시 읽기</button>
        </div>
      ) : files.length === 0 ? (
        <div className={messageCard}>
          <p className="text-[17px] font-bold text-tm-ink">빌드 파일이 없습니다</p>
          <p className="max-w-[56ch] text-[14.5px] leading-[1.7] text-tm-sub">
            프로젝트 폴더 아래 &apos;NN. 빌드파일&apos; 폴더에 올리면 여기에 모입니다(보관함 아래는 빼고).
          </p>
        </div>
      ) : (
        <BuildBoard files={files} me={me} admin={admin} />
      )}
    </>
  );
}

function BuildBoard({ files, me, admin }: { files: BuildFile[]; me: string; admin: boolean }) {
  const wide = useMediaQuery('(min-width: 1180px)');
  const now = Date.now();
  const projects = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; count: number }>();
    for (const f of files) {
      const p = seen.get(f.project.item.id);
      if (p) p.count++;
      else seen.set(f.project.item.id, { id: f.project.item.id, name: plainName(f.project.item.name), count: 1 });
    }
    return [...seen.values()];
  }, [files]);
  const [project, setProject] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const inProject = files.filter((f) => !project || f.project.item.id === project);
  const stages = [...new Set(inProject.map(stageOf))];
  const q = norm(query.trim());
  const shown = inProject.filter((f) => (!stage || stageOf(f) === stage)
    && (!q || norm(`${f.node.item.name} ${trailText(f)} ${f.project.item.name}`).includes(q)));

  const [picked, setPicked] = useState<string | null>(null);
  const current = files.find((f) => f.node.item.id === picked) ?? null;

  /* 안내가 있는 파일 · 댓글 수 - 목록 표시용, 열 때 한 번 · 쓴 뒤에 다시 */
  const [marks, setMarks] = useState<{ notes: Set<string>; comments: Map<string, number> } | null>(null);
  const [marksOn, setMarksOn] = useState(true);
  const refreshMarks = useCallback(() => {
    void loadBuildMarks().then((r) => {
      setMarksOn(r.kind === 'ok');
      if (r.kind === 'ok') setMarks(r.value);
    });
  }, []);
  useEffect(() => { refreshMarks(); }, [refreshMarks]);

  return (
    <div className="tm-fill flex min-h-0 flex-1 overflow-hidden rounded-tm border border-tm-line bg-tm-card shadow-tm">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-none flex-col gap-2.5 border-b border-tm-line px-4 py-3 max-[720px]:px-3">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="프로젝트">
            <button type="button" aria-pressed={!project} onClick={() => { setProject(null); setStage(null); }} className={chip}>
              전체 <span className="ml-1 tabular-nums opacity-80">{num(files.length)}</span>
            </button>
            {projects.map((p) => (
              <button key={p.id} type="button" aria-pressed={project === p.id} onClick={() => { setProject(p.id); setStage(null); }} className={chip}>
                {p.name} <span className="ml-1 tabular-nums opacity-80">{num(p.count)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative min-w-0 flex-[1_1_200px] max-w-[300px] max-[720px]:max-w-none">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={16} /></span>
              <input type="text" inputMode="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="파일 이름 찾기"
                aria-label="빌드 파일 찾기"
                className={`${tmFieldBase} h-[34px] w-full pl-9 pr-3 text-[14.5px] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px]`} />
            </div>
            {stages.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="빌드 종류">
                <button type="button" aria-pressed={!stage} onClick={() => setStage(null)} className={chip}>모든 종류</button>
                {stages.map((s) => (
                  <button key={s} type="button" aria-pressed={stage === s} onClick={() => setStage(s)} className={chip}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2" aria-label="빌드 파일 목록">
          {shown.length === 0 && <li className="px-3 py-10 text-center text-[14px] text-tm-sub">맞는 빌드 파일이 없습니다</li>}
          {shown.map((f) => {
            const id = f.node.item.id;
            const cs = marks?.comments.get(id) ?? 0;
            const fresh = f.at && now - f.at < FRESH_DAYS * DAY;
            return (
              <li key={id}>
                <button type="button" onClick={() => setPicked(id)} aria-current={picked === id ? 'true' : undefined}
                  className={`flex w-full items-start gap-3 rounded-tm-sm px-3 py-2.5 text-left transition-colors duration-150 hover:bg-tm-tint
                              [@media(pointer:coarse)]:py-3 ${picked === id ? 'bg-tm-tint ring-1 ring-inset ring-tm-blue' : ''}`}>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[14.5px] font-semibold text-tm-ink">{f.node.item.name}</span>
                      {fresh ? <span className="flex-none rounded-full bg-tm-blue px-1.5 py-[1px] text-[11px] font-bold text-white">새 빌드</span> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-tm-sub">
                      {plainName(f.project.item.name)}{f.trail.length ? ` › ${trailText(f)}` : ''}
                    </span>
                  </span>
                  <span className="flex flex-none flex-col items-end gap-0.5 text-[12px] tabular-nums text-tm-sub">
                    <span>{whenText(f.at, now)}</span>
                    <span className="flex items-center gap-1.5">
                      {f.node.item.size != null && <span>{sizeText(f.node.item.size)}</span>}
                      {marks?.notes.has(id) && <span className="font-semibold text-tm-blue">안내</span>}
                      {cs > 0 && <span className="font-semibold text-tm-ink">댓글 {num(cs)}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="flex-none border-t border-tm-line px-4 py-2.5 text-[12.5px] leading-[1.6] text-tm-sub">
          받기 링크가 열리지 않으면 브라우저의 구글 계정을 {DRIVE_ACCOUNT} 로 바꿔 보세요
        </p>
      </div>
      {current && (wide ? (
        <aside aria-label="빌드 안내" className="flex w-[440px] flex-none flex-col border-l border-tm-line bg-tm-card min-[1600px]:w-[520px]">
          <BuildPanel key={current.node.item.id} f={current} me={me} admin={admin} marksOn={marksOn} onChanged={refreshMarks} onClose={() => setPicked(null)} />
        </aside>
      ) : (
        <>
        <button type="button" aria-label="빌드 안내 닫기" onClick={() => setPicked(null)} className="fixed inset-0 z-30 bg-black/35" />
        <aside aria-label="빌드 안내" onKeyDown={(e) => { if (e.key === 'Escape') setPicked(null); }}
          className="fixed inset-x-0 bottom-0 z-40 flex h-[82dvh] flex-col overflow-hidden rounded-t-[18px] border-t border-tm-line bg-tm-card shadow-tm-pop animate-tm-rise">
          <BuildPanel key={current.node.item.id} f={current} me={me} admin={admin} marksOn={marksOn} onChanged={refreshMarks} onClose={() => setPicked(null)} />
        </aside>
        </>
      ))}
    </div>
  );
}

/** 고른 빌드 - 폴더의 시험 방법, 빌드 안내(누구나 고침), 받기 · 폴더 열기, 댓글 */
function BuildPanel({ f, me, admin, marksOn, onChanged, onClose }: {
  f: BuildFile; me: string; admin: boolean; marksOn: boolean; onChanged(): void; onClose(): void;
}) {
  const id = f.node.item.id;
  const stageHint = f.trail.map((t) => folderHint(t.item.name).hint).filter(Boolean).join(' · ');
  const folder = f.trail.at(-1) ?? f.buildFolder;

  const [note, setNote] = useState<DriveNote | null>(null);
  const [noteState, setNoteState] = useState<'loading' | 'ok' | 'off'>('loading');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<DriveComment[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [ask, confirmNode] = useConfirm();

  useEffect(() => {
    let alive = true;
    void Promise.all([loadNote(id), loadComments(id)]).then(([n, c]) => {
      if (!alive) return;
      setNoteState(n.kind === 'ok' ? 'ok' : 'off');
      setNote(n.kind === 'ok' ? n.value : null);
      setComments(c.kind === 'ok' ? c.value : []);
    });
    return () => { alive = false; };
  }, [id]);

  const editor = useMember(note?.updatedBy ?? null);
  const save = async () => {
    setSaving(true);
    const r = await saveNote(id, draft.trim());
    setSaving(false);
    if (!r) { setErr('안내를 저장하지 못했습니다. 잠시 뒤 다시 해 주세요'); return; }
    setNote(r);
    setEditing(false);
    setErr('');
    onChanged();
  };
  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const c = await addComment(id, body);
    setSending(false);
    if (!c) { setErr('댓글을 올리지 못했습니다. 잠시 뒤 다시 해 주세요'); return; }
    setComments((l) => [...l, c]);
    setText('');
    setErr('');
    onChanged();
  };
  const drop = async (c: DriveComment) => {
    const yes = await ask({ title: '댓글을 지울까요?', body: '지운 댓글은 되살릴 수 없습니다.', ok: '지우기', tone: 'danger' });
    if (!yes) return;
    if (await removeComment(c.id)) {
      setComments((l) => l.filter((x) => x.id !== c.id));
      onChanged();
    } else setErr('댓글을 지우지 못했습니다');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-none border-b border-tm-line px-5 pb-4 pt-4 max-[720px]:px-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] text-tm-sub">{plainName(f.project.item.name)}{f.trail.length ? ` › ${trailText(f)}` : ''}</p>
            <h2 className="mt-0.5 break-words text-[18px] font-extrabold leading-[1.4] text-tm-deep">{f.node.item.name}</h2>
            <p className="mt-1 text-[13px] text-tm-sub">
              {[whenText(f.at, Date.now()) && `${whenText(f.at, Date.now())} 올림`, sizeText(f.node.item.size)].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="빌드 안내 닫기" title="닫기" className={`${tmIconBtnSm} -mr-1.5 -mt-1`}><IconClose /></button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <a href={driveUrl(f.node.item)} target="_blank" rel="noopener noreferrer" className={tmBtnPrimary}>구글 드라이브에서 받기</a>
          <a href={driveUrl(folder.item)} target="_blank" rel="noopener noreferrer" className={tmGhostBtn}>폴더 열기</a>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 max-[720px]:px-4">
        {stageHint && (
          <p className="mb-4 rounded-tm-sm border border-tm-line bg-tm-bg px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-tm-ink">
            <b className="text-tm-deep">시험 방법</b> · {stageHint}
          </p>
        )}

        <section aria-label="빌드 안내">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="flex-1 text-[15px] font-bold text-tm-deep">빌드 안내</h3>
            {noteState === 'ok' && !editing && (
              <button type="button" onClick={() => { setDraft(note?.body ?? ''); setEditing(true); }} className="text-[13px] font-semibold text-tm-blue hover:underline">
                {note?.body ? '고치기' : '쓰기'}
              </button>
            )}
          </div>
          {noteState === 'loading' ? (
            <p className="text-[13.5px] text-tm-sub">읽는 중…</p>
          ) : noteState === 'off' ? (
            <p className="text-[13.5px] text-tm-sub">안내 · 댓글 표가 아직 없습니다(DB 반영 전). 받기는 그대로 됩니다.</p>
          ) : editing ? (
            <div>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} maxLength={20000} autoFocus aria-label="빌드 안내"
                placeholder={'무엇이 바뀌었나 · 무엇을 시험하나 · 실행 방법 · 알려진 문제\n예) 퍼즐 1장 2인용. 압축을 풀고 JellyMolly.exe 실행, 2번 퍼즐의 되돌리기만 봐 주세요.'}
                className={`${tmTextarea} min-h-[160px]`} />
              <div className="mt-2 flex justify-end gap-1.5">
                <button type="button" onClick={() => setEditing(false)} className={tmBtn}>취소</button>
                <button type="button" onClick={() => void save()} disabled={saving} className={tmBtnPrimary}>{saving ? '저장 중…' : '저장'}</button>
              </div>
            </div>
          ) : note?.body ? (
            <>
              <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.75] text-tm-ink">{note.body}</p>
              <p className="mt-1.5 text-[12px] text-tm-sub">{editor ? `${editor.name} · ` : ''}{whenText(Date.parse(note.updatedAt) || 0, Date.now())} 고침</p>
            </>
          ) : (
            <p className="text-[13.5px] leading-[1.6] text-tm-sub">아직 안내가 없습니다. 올린 사람이 무엇을 어떻게 시험할지 적어 주세요.</p>
          )}
        </section>

        {marksOn && noteState === 'ok' && (
          <section aria-label="댓글" className="mt-6 border-t border-tm-line pt-4">
            <h3 className="mb-2.5 text-[15px] font-bold text-tm-deep">댓글 {comments.length ? num(comments.length) : ''}</h3>
            <ul className="space-y-3">
              {comments.map((c) => <CommentRow key={c.id} c={c} canDrop={c.author === me || admin} onDrop={() => void drop(c)} />)}
            </ul>
            <div className="mt-3">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={4000} aria-label="댓글 쓰기"
                placeholder="시험 결과 · 버그 · 질문 (Ctrl+Enter 로 올리기)"
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }}
                className={tmTextarea} />
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={() => void send()} disabled={!text.trim() || sending} className={tmBtnPrimary}>
                  {sending ? '올리는 중…' : '댓글 올리기'}
                </button>
              </div>
            </div>
          </section>
        )}
        {err && <p role="alert" className="mt-3 text-[13px] font-semibold text-tm-red">{err}</p>}
      </div>
      {confirmNode}
    </div>
  );
}

function CommentRow({ c, canDrop, onDrop }: { c: DriveComment; canDrop: boolean; onDrop(): void }) {
  const m = useMember(c.author);
  return (
    <li className="flex gap-2.5">
      <Avatar id={c.author} size={28} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[12.5px] text-tm-sub">
          <b className="text-[13.5px] text-tm-ink">{m?.name ?? '팀원'}</b>
          <span>{whenText(Date.parse(c.createdAt) || 0, Date.now())}</span>
          {canDrop && <button type="button" onClick={onDrop} className="ml-auto font-semibold text-tm-sub hover:text-tm-red">지우기</button>}
        </p>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.65] text-tm-ink">{c.body}</p>
      </div>
    </li>
  );
}
