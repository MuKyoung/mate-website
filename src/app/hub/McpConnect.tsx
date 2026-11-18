'use client';

/*
 * AI 연결(MCP) - Claude Code · Codex · VS Code 같은 AI 도구가 팀 위키를 찾고 읽게 하는 열쇠를 만들고 끊는다.
 * 도구는 사이트의 /api/mcp/ 에 열쇠(Authorization: Bearer mtw_…)를 싣고 붙는다(src/app/api/mcp/route.ts).
 * 열쇠 글자는 만들 때 한 번만 보이고 DB 에는 해시만 남는다(supabase/taskmanager.sql 'AI 도구(MCP) 연결 열쇠').
 * Supabase 없이 도는 브라우저 저장 모드에는 없다 - 밖에서 읽어 갈 서버가 없다
 */
import { useCallback, useEffect, useState } from 'react';
import { isMissingTable, isRemote, sb } from './supabase';
import { Modal, tmBtn, tmBtnPrimary, tmGhostDanger, tmInput, tmLabel, useConfirm } from './ui';

interface KeyRow { id: string; label: string; created_at: string; last_used_at: string | null; revoked_at: string | null }

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
        title="Claude Code · Codex 같은 AI 도구가 팀 위키를 읽게 연결합니다(MCP)"
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
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, confirmNode] = useConfirm();
  const url = `${window.location.origin}/api/mcp/`;

  const load = useCallback(async () => {
    const { data, error } = await sb().from('tm_mcp_tokens').select('id, label, created_at, last_used_at, revoked_at')
      .is('revoked_at', null).order('created_at', { ascending: false });
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
    const { data, error } = await sb().rpc('tm_mcp_issue', { p_label: label.trim() || 'AI 도구' });
    setBusy(false);
    if (error || typeof data !== 'string') {
      if (isMissingTable(error) || error?.code === 'PGRST202') setState('missing');
      setErr(error?.message && /[가-힣]/.test(error.message) ? error.message : '열쇠를 만들지 못했습니다. 인터넷 연결을 확인하고 다시 눌러 주세요');
      return;
    }
    setFresh(data);
    setLabel('');
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

  const token = fresh ?? 'mtw_여기에_열쇠';
  return (
    <Modal title="AI 연결 (MCP)" size="lg" busy={busy} onClose={onClose}
      sub="Claude Code · Codex · VS Code 의 AI 가 팀 위키를 찾고 읽게 합니다(읽기만)"
      foot={<><span className="flex-1" /><button type="button" onClick={onClose} className={tmBtn}>닫기</button></>}>
      {state === 'missing' && <p role="alert" className="mb-4 text-[14.5px] font-semibold leading-[1.65] text-tm-red-deep">{MISSING}</p>}
      {state === 'error' && <p role="alert" className="mb-4 text-[14.5px] font-semibold text-tm-red-deep">열쇠 목록을 읽지 못했습니다. 창을 닫았다가 다시 열어 주세요.</p>}
      {err && <p role="alert" className="mb-4 text-[14.5px] font-semibold text-tm-red-deep">{err}</p>}

      <p className="text-[15px] leading-[1.7] text-tm-ink">
        사람마다 열쇠를 만들어 AI 도구 설정에 넣습니다. 도구는 위키 찾기 · 문서 트리 · 문서 읽기만 할 수 있고, 휴지통 문서는 보이지 않습니다.
        열쇠는 언제든 끊을 수 있고, 팀원 승인이 거두어지면 그 사람 열쇠도 막힙니다.
      </p>

      {fresh ? (
        <div className="mt-5 rounded-tm-sm border border-tm-line bg-tm-tint p-4">
          <p className="text-[14.5px] font-bold text-tm-ink">새 열쇠 - 이 창을 닫으면 다시 볼 수 없습니다. 아래 설정에 이미 넣어 두었습니다</p>
          <div className="mt-2 flex gap-2 max-[520px]:flex-col">
            <input readOnly value={fresh} onFocus={(e) => e.currentTarget.select()} aria-label="새 열쇠"
              className={`${tmInput} tm-mono min-w-0 flex-1 text-[13.5px]`} />
            <button type="button" onClick={() => void copy(fresh, '열쇠를')} className={tmBtnPrimary}>복사</button>
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
        </p>
      </div>

      {state === 'ready' && rows && rows.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[15px] font-bold text-tm-ink">내 열쇠</h3>
          <ul className="mt-2 divide-y divide-tm-line rounded-tm-sm border border-tm-line">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[14.5px] text-tm-ink">{r.label || 'AI 도구'}</b>
                  <small className="text-[12.5px] text-tm-sub">{day(r.created_at)} 만듦 · {r.last_used_at ? `${day(r.last_used_at)} 마지막 사용` : '아직 안 씀'}</small>
                </span>
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
