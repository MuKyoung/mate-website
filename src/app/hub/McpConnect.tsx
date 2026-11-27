'use client';

/*
 * AI 연결(MCP) - Claude Code · Codex · VS Code 같은 AI 도구가 팀 위키를 찾고 읽게 하는 열쇠를 만들고 끊는다.
 * '쓰기 허용'을 켠 열쇠는 문서를 만들고 · 고치고 · 휴지통에 넣는다(2026-11-27, 기본 꺼짐 · 열쇠마다 켜고 끈다).
 * 도구는 사이트의 /api/mcp/ 에 열쇠(Authorization: Bearer mtw_…)를 싣고 붙는다(src/app/api/mcp/route.ts).
 * 열쇠 글자는 만들 때 한 번만 보이고 DB 에는 해시만 남는다(supabase/taskmanager.sql 'AI 도구(MCP) 연결 열쇠').
 * Supabase 없이 도는 브라우저 저장 모드에는 없다 - 밖에서 읽어 갈 서버가 없다
 */
import { useCallback, useEffect, useState } from 'react';
import { isMissingTable, isRemote, sb } from './supabase';
import { Modal, tmBtn, tmBtnPrimary, tmGhostBtn, tmGhostDanger, tmInput, tmLabel, useConfirm } from './ui';

interface KeyRow { id: string; label: string; created_at: string; last_used_at: string | null; revoked_at: string | null; can_write?: boolean }

const MISSING = "AI 연결 표가 아직 없습니다. 관리자가 supabase/taskmanager.sql 의 'AI 도구(MCP) 연결 열쇠' 부분을 실행해야 합니다";
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }) : '');

/** 설정 글 - 열쇠 자리에 받은 열쇠(없으면 자리 표시)를 넣는다 */
function snippets(url: string, token: string) {
  return [
    {
      id: 'claude',
      name: 'Claude Code',
      where: '터미널(또는 VS Code 의 터미널)에서 한 번 실행합니다. 모든 프로젝트에서 쓰도록 사용자 범위로 넣습니다.',
      text: `claude mcp add --scope user --transport http mate-wiki ${url} --header "Authorization: Bearer ${token}"`,
    },
    {
      id: 'codex',
      name: 'Codex',
      where: '~/.codex/config.toml 에 붙여 넣고, 열쇠는 환경 변수로 둡니다(Windows: setx MATE_WIKI_TOKEN 열쇠 → VS Code 다시 열기).',
      text: `[mcp_servers.mate-wiki]\nurl = "${url}"\nbearer_token_env_var = "MATE_WIKI_TOKEN"`,
    },
    {
      id: 'vscode',
      name: 'VS Code (mcp.json)',
      where: '프로젝트의 .vscode/mcp.json 또는 사용자 설정의 mcp.json 에 넣습니다. 열쇠가 든 파일은 저장소에 올리지 마세요.',
      text: JSON.stringify({ servers: { 'mate-wiki': { type: 'http', url, headers: { Authorization: `Bearer ${token}` } } } }, null, 2),
    },
  ];
}

export default function McpConnect({ onNotice }: { onNotice?(text: string, tone?: 'ok' | 'err'): void }) {
  const [open, setOpen] = useState(false);
  if (!isRemote) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        title="Claude Code · Codex 같은 AI 도구가 팀 위키를 읽고 고치게 연결합니다(MCP)"
        className="flex min-h-[38px] items-center gap-2 rounded-tm-sm px-2.5 text-[14px] font-semibold text-tm-ink transition-colors hover:bg-tm-tint [@media(pointer:coarse)]:min-h-11">
        AI 연결
      </button>
      {open && <McpDialog onNotice={onNotice} onClose={() => setOpen(false)} />}
    </>
  );
}

function McpDialog({ onNotice, onClose }: { onNotice?(text: string, tone?: 'ok' | 'err'): void; onClose(): void }) {
  const [rows, setRows] = useState<KeyRow[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [label, setLabel] = useState('');
  const [allowWrite, setAllowWrite] = useState(false);
  /** DB 에 쓰기 칸(can_write)이 있는가 - 운영 SQL 을 아직 실행하지 않았으면 읽기만(쓰기 스위치를 숨긴다) */
  const [writable, setWritable] = useState(true);
  const [fresh, setFresh] = useState<{ token: string; write: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, confirmNode] = useConfirm();
  const url = `${window.location.origin}/api/mcp/`;

  const load = useCallback(async () => {
    const base = 'id, label, created_at, last_used_at, revoked_at';
    const read = (cols: string) => sb().from('tm_mcp_tokens').select(cols)
      .is('revoked_at', null).order('created_at', { ascending: false })
      .then(({ data: d, error: e }) => ({ data: d as unknown as KeyRow[] | null, error: e }));
    let { data, error } = await read(`${base}, can_write`);
    // 42703 = 칸 없음(쓰기 SQL 전), 42501 = 그 칸을 읽을 권한 없음(같은 까닭)
    if (error && (error.code === '42703' || error.code === '42501')) {
      setWritable(false);
      ({ data, error } = await read(base));
    } else if (!error) setWritable(true);
    if (error) {
      setState(isMissingTable(error) ? 'missing' : 'error');
      return;
    }
    setRows(data as KeyRow[]);
    setState('ready');
  }, []);
  useEffect(() => { void load(); }, [load]);

  const issue = async () => {
    setBusy(true);
    setErr(null);
    const write = writable && allowWrite;
    const { data, error } = await sb().rpc('tm_mcp_issue', { p_label: label.trim() || 'AI 도구', ...(write ? { p_write: true } : {}) });
    setBusy(false);
    if (error || typeof data !== 'string') {
      if (isMissingTable(error) || (error?.code === 'PGRST202' && !write)) setState('missing');
      setErr(error?.code === 'PGRST202' && write
        ? '쓰기 허용 열쇠는 아직 만들 수 없습니다(DB 준비 전). 쓰기 허용을 끄고 만들어 주세요'
        : error?.message && /[가-힣]/.test(error.message) ? error.message : '열쇠를 만들지 못했습니다. 인터넷 연결을 확인하고 다시 눌러 주세요');
      return;
    }
    setFresh({ token: data, write });
    setLabel('');
    setAllowWrite(false);
    void load();
  };

  const setWrite = async (r: KeyRow, on: boolean) => {
    if (on) {
      const yes = await confirm({
        title: '이 열쇠에 쓰기를 허용할까요?',
        body: (
          <>
            <b>{r.label || 'AI 도구'}</b> 열쇠로 연결한 AI 가 팀 위키 문서를 만들고 · 고치고 · 휴지통에 넣을 수 있습니다.
            고친 사람은 나로 적히고, 고치기 전 모습은 문서 기록에 남아 되돌릴 수 있습니다. AI 도구 설정은 바꾸지 않아도 됩니다.
          </>
        ),
        ok: '쓰기 허용',
      });
      if (!yes) return;
    }
    setErr(null);
    const { data, error } = await sb().rpc('tm_mcp_set_write', { p_id: r.id, p_on: on });
    if (error || data !== true) setErr(error?.code === 'PGRST202' ? '쓰기 허용은 아직 쓸 수 없습니다(DB 준비 전)' : '바꾸지 못했습니다. 다시 눌러 주세요');
    else onNotice?.(on ? '쓰기를 허용했습니다' : '읽기만 하게 바꿨습니다', 'ok');
    void load();
  };

  const revoke = async (r: KeyRow) => {
    const yes = await confirm({
      title: '이 열쇠를 끊을까요?',
      body: <><b>{r.label || 'AI 도구'}</b> 열쇠로 연결한 도구는 바로 팀 위키를 읽지 못합니다. 다시 쓰려면 새 열쇠를 만들어 설정을 바꿔야 합니다.</>,
      ok: '열쇠 끊기',
      tone: 'danger',
    });
    if (!yes) return;
    const { error } = await sb().rpc('tm_mcp_revoke', { p_id: r.id });
    if (error) setErr('열쇠를 끊지 못했습니다. 다시 눌러 주세요');
    else onNotice?.('열쇠를 끊었습니다', 'ok');
    void load();
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotice?.(`${what} 복사했습니다`, 'ok');
    } catch {
      setErr('복사하지 못했습니다. 칸의 글을 골라 직접 복사해 주세요');
    }
  };

  const token = fresh?.token ?? 'mtw_여기에_열쇠';
  return (
    <Modal title="AI 연결 (MCP)" size="lg" busy={busy} onClose={onClose}
      sub="Claude Code · Codex · VS Code 의 AI 가 팀 위키를 찾고 읽게 합니다. 쓰기를 허용한 열쇠는 문서도 고칩니다"
      foot={<><span className="flex-1" /><button type="button" onClick={onClose} className={tmBtn}>닫기</button></>}>
      {state === 'missing' && <p role="alert" className="mb-4 text-[14.5px] font-semibold leading-[1.65] text-tm-red-deep">{MISSING}</p>}
      {state === 'error' && <p role="alert" className="mb-4 text-[14.5px] font-semibold text-tm-red-deep">열쇠 목록을 읽지 못했습니다. 창을 닫았다가 다시 열어 주세요.</p>}
      {err && <p role="alert" className="mb-4 text-[14.5px] font-semibold text-tm-red-deep">{err}</p>}

      <p className="text-[15px] leading-[1.7] text-tm-ink">
        사람마다 열쇠를 만들어 AI 도구 설정에 넣습니다. 도구는 위키 찾기 · 문서 트리 · 문서 읽기를 하고,
        {writable ? <> <b className="font-bold">쓰기 허용</b>을 켠 열쇠는 문서 만들기 · 고치기 · 휴지통에 넣기도 합니다.</> : ' 지금은 읽기만 됩니다.'}
        {' '}휴지통 문서는 보이지 않습니다. 열쇠는 언제든 끊을 수 있고, 팀원 승인이 거두어지면 그 사람 열쇠도 막힙니다.
      </p>

      {fresh ? (
        <div className="mt-5 rounded-tm-sm border border-tm-line bg-tm-tint p-4">
          <p className="text-[14.5px] font-bold text-tm-ink">
            새 열쇠({fresh.write ? '읽기 · 쓰기' : '읽기만'}) - 이 창을 닫으면 다시 볼 수 없습니다. 아래 설정에 이미 넣어 두었습니다
          </p>
          <div className="mt-2 flex gap-2 max-[520px]:flex-col">
            <input readOnly value={fresh.token} onFocus={(e) => e.currentTarget.select()} aria-label="새 열쇠"
              className={`${tmInput} tm-mono min-w-0 flex-1 text-[13.5px]`} />
            <button type="button" onClick={() => void copy(fresh.token, '열쇠를')} className={tmBtnPrimary}>복사</button>
          </div>
        </div>
      ) : state === 'ready' && (
        <div className="mt-5">
          <label htmlFor="mcp-label" className={tmLabel}>열쇠 이름 <span className="font-semibold text-tm-sub">(어느 기기 · 도구인지)</span></label>
          <div className="flex gap-2 max-[520px]:flex-col">
            <input id="mcp-label" value={label} maxLength={60} placeholder="예: 회사 노트북 Claude Code" onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) void issue(); }}
              className={`${tmInput} min-w-0 flex-1`} />
            <button type="button" onClick={() => void issue()} disabled={busy} className={tmBtnPrimary}>{busy ? '만드는 중…' : '열쇠 만들기'}</button>
          </div>
          {writable && (
            <label className="mt-2.5 flex cursor-pointer items-start gap-3 rounded-tm-sm border border-tm-line px-3.5 py-3">
              <input type="checkbox" checked={allowWrite} onChange={(e) => setAllowWrite(e.target.checked)}
                className="mt-[3px] h-[18px] w-[18px] flex-none accent-[rgb(var(--tm-blue))]" />
              <span className="text-[14.5px] leading-[1.6] text-tm-ink">
                <b className="font-bold">쓰기 허용</b>
                <span className="block text-[13.5px] text-tm-sub">
                  AI 가 문서를 만들고 · 고치고 · 휴지통에 넣을 수 있습니다. 고친 사람은 나로 적히고 고치기 전 모습은 문서 기록에 남습니다.
                  나중에 아래 목록에서 켜고 끌 수 있습니다.
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {snippets(url, token).map((s) => (
          <section key={s.id} aria-labelledby={`mcp-${s.id}`}>
            <div className="flex items-center gap-2">
              <h3 id={`mcp-${s.id}`} className="text-[15px] font-bold text-tm-ink">{s.name}</h3>
              <button type="button" onClick={() => void copy(s.text, `${s.name} 설정을`)} className="ml-auto rounded-tm-sm px-2.5 py-1 text-[13px] font-semibold text-tm-blue hover:bg-tm-tint">복사</button>
            </div>
            <p className="mt-1 text-[13px] leading-[1.6] text-tm-sub">{s.where}</p>
            <pre className="tm-mono mt-1.5 overflow-x-auto whitespace-pre rounded-tm-sm border border-tm-line bg-tm-bg p-3 text-[12.5px] leading-[1.6] text-tm-ink">{s.text}</pre>
          </section>
        ))}
        <p className="text-[13px] leading-[1.6] text-tm-sub">
          연결한 뒤 AI 에게 &quot;팀 위키에서 ○○ 찾아 줘&quot;처럼 물으면 wiki_search · wiki_read 도구로 문서를 읽고 답합니다.
          {writable && <> 쓰기를 허용한 열쇠라면 &quot;○○ 문서에 오늘 회의 내용 덧붙여 줘&quot;처럼 시키면 wiki_create · wiki_update 로 고칩니다.</>}
        </p>
      </div>

      {state === 'ready' && rows && rows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[15px] font-bold text-tm-ink">내 열쇠</h3>
          <ul className="mt-2 divide-y divide-tm-line rounded-tm-sm border border-tm-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <b className="truncate text-[14.5px] text-tm-ink">{r.label || 'AI 도구'}</b>
                    <span className={`flex-none rounded-full px-2 py-[1px] text-[12px] font-bold ${
                      r.can_write ? 'bg-tm-tint text-tm-blue' : 'border border-tm-line text-tm-sub'}`}>
                      {r.can_write ? '읽기 · 쓰기' : '읽기만'}
                    </span>
                  </span>
                  <small className="text-[12.5px] text-tm-sub">{day(r.created_at)} 만듦 · {r.last_used_at ? `${day(r.last_used_at)} 마지막 사용` : '아직 안 씀'}</small>
                </span>
                {writable && (
                  <button type="button" onClick={() => void setWrite(r, !r.can_write)} aria-pressed={!!r.can_write}
                    className={`${tmGhostBtn} h-[36px] px-3 text-[13.5px]`}>
                    {r.can_write ? '읽기만 하게' : '쓰기 허용'}
                  </button>
                )}
                <button type="button" onClick={() => void revoke(r)} className={tmGhostDanger}>끊기</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {confirmNode}
    </Modal>
  );
}
