'use client';

import { Fragment, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DRIVE_ACCOUNT, DRIVE_FOLDER, DRIVE_SYNC_MINUTES, KIND_LABEL,
  ancestorsOf, buildDriveTree, driveUrl, kindOf, loadDrive, loadDriveStamp, previewUrl,
  type DriveKind, type DriveLoad, type DriveNode, type DriveSnapshot, type DriveTree,
} from './driveTree';
import { IconClose, IconPlus, IconSearch, PageHead, tmFieldBase, tmGhostBtn, tmIconBtn, tmIconBtnSm, useMediaQuery } from './ui';

/*
 * 구글 드라이브 - 팀 구글 드라이브의 폴더 · 파일을 왼쪽에서 오른쪽으로 뻗는 트리로 그린다.
 * 이름(노드)을 누르면 옆 칸(좁은 화면은 아래에서 올라오는 칸)에 안의 내용이 보인다 - 폴더는 안의 폴더 · 파일 목록,
 * 파일은 드라이브 미리보기. 드라이브로 가는 것은 그 칸의 '드라이브에서 열기'나 노드를 두 번 누를 때다.
 * 노드 끝의 동그라미로 접고 펼친다.
 * 목록은 드라이브 쪽 Apps Script 가 드라이브가 바뀌면 1분쯤 뒤에(아니어도 30분마다) Hub 표로 보낸다(driveTree.ts).
 * 이 화면은 읽기만 하고, 열려 있는 동안 새 목록이 오면 바꿔 끼운다.
 * 그림은 스크롤 칸 안의 큰 판이다 - 손가락 · 휠은 그대로 스크롤, 마우스는 빈 곳을 끌어 옮기고 Ctrl+휠로 키운다.
 */

type Level = 'auto' | 1 | 2 | 3 | 'all';
const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'auto', label: '기본', hint: '하위 폴더가 많은 폴더(보관함 등)만 접고 나머지는 모두 펼칩니다' },
  { id: 1, label: '1단', hint: '맨 위 폴더까지 봅니다' },
  { id: 2, label: '2단', hint: '맨 위 폴더와 그 아래 한 단계까지 봅니다' },
  { id: 3, label: '3단', hint: '세 단계까지 봅니다' },
  { id: 'all', label: '모두', hint: '모든 폴더를 펼칩니다' },
];
/** 기본 보기에서 접어 두는 폴더 - 이 아래 폴더가 이보다 많으면 */
const BIG = 40;
/** 파일을 볼 때 한 폴더에서 그리는 파일 수 - 나머지는 '더 보기' 한 칸(누르면 옆 칸에 그 폴더의 파일이 모두 보인다) */
const FILE_CAP = 20;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.6;
const PREFS_KEY = 'mate.taskmanager.drive.v1';

/* ── 판 위의 자리 ─────────────────────────────────── */

interface Dims { nodeW: number; nodeH: number; col: number; row: number; pad: number }
const dimsOf = (narrow: boolean, coarse: boolean): Dims => {
  const nodeW = narrow ? 188 : 248;
  const nodeH = coarse ? 44 : 36;
  return { nodeW, nodeH, col: nodeW + 56, row: nodeH + (coarse ? 10 : 8), pad: 24 };
};

interface Placed {
  key: string;
  node: DriveNode;
  /** 0 보다 크면 node(폴더)의 나머지 파일 수를 나타내는 '더 보기' 칸 */
  more: number;
  x: number;
  y: number;
}
interface Layout { placed: Placed[]; edges: [Placed, Placed][]; width: number; height: number; byKey: Map<string, Placed> }

type Kid = { node: DriveNode } | { more: number };

/** 펼친 폴더 아래에 그릴 것 - 폴더 다음 파일. pin 은 찾기로 고른 파일(파일을 끈 때도, 앞 20개 밖이어도 보인다) */
function kidsOf(n: DriveNode, files: boolean, pin: DriveNode | null): Kid[] {
  const out: Kid[] = n.folders.map((node) => ({ node }));
  const pinned = pin && pin.parent === n && pin.item.mime !== DRIVE_FOLDER ? pin : null;
  if (files) {
    const shown = n.files.slice(0, FILE_CAP);
    if (pinned && !shown.includes(pinned)) shown.push(pinned);
    for (const node of shown) out.push({ node });
    const rest = n.files.length - shown.length;
    if (rest > 0) out.push({ more: rest });
  } else if (pinned) {
    out.push({ node: pinned });
  }
  return out;
}

/** 접힌 폴더의 동그라미에 적는 수 - 펼치면 바로 아래에 생길 칸 수 */
const hiddenOf = (n: DriveNode, files: boolean) => n.folders.length + (files ? n.files.length : 0);

/** 잎은 위에서 아래로 한 줄씩, 폴더는 첫 아이와 끝 아이의 가운데 - 단계마다 한 칸(왼쪽 → 오른쪽) */
function layoutOf(root: DriveNode, open: Set<string>, files: boolean, pin: DriveNode | null, d: Dims): Layout {
  const placed: Placed[] = [];
  const edges: [Placed, Placed][] = [];
  let row = 0;
  let deepest = 0;
  const nextRow = () => d.pad + (row++) * d.row;
  const visit = (n: DriveNode): Placed => {
    const me: Placed = { key: n.item.id, node: n, more: 0, x: d.pad + n.depth * d.col, y: 0 };
    placed.push(me);
    deepest = Math.max(deepest, n.depth);
    const kids = n === root || open.has(n.item.id) ? kidsOf(n, files, pin) : [];
    if (kids.length === 0) {
      me.y = nextRow();
      return me;
    }
    let first = 0;
    let last = 0;
    kids.forEach((k, i) => {
      let c: Placed;
      if ('node' in k) {
        c = visit(k.node);
      } else {
        c = { key: `${n.item.id}:more`, node: n, more: k.more, x: d.pad + (n.depth + 1) * d.col, y: nextRow() };
        placed.push(c);
        deepest = Math.max(deepest, n.depth + 1);
      }
      edges.push([me, c]);
      if (i === 0) first = c.y;
      last = c.y;
    });
    me.y = (first + last) / 2;
    return me;
  };
  visit(root);
  return {
    placed,
    edges,
    // +16 - 펼침 동그라미가 노드 오른쪽 끝에 반쯤 나온다
    width: d.pad * 2 + deepest * d.col + d.nodeW + 16,
    height: d.pad * 2 + Math.max(0, row - 1) * d.row + d.nodeH,
    byKey: new Map(placed.map((p) => [p.key, p])),
  };
}

/** 미리 정한 단계로 펼칠 폴더들 - 맨 위(팀 드라이브)는 늘 펼친다 */
function presetOpen(tree: DriveTree, level: Level): Set<string> {
  const s = new Set<string>();
  for (const n of tree.all) {
    if (n.item.mime !== DRIVE_FOLDER) continue;
    if (level === 'all' || (level === 'auto' ? n.folderTotal <= BIG : n.depth < level)) s.add(n.item.id);
  }
  return s;
}

/* ── 사람마다 기억하는 보기 ───────────────────────────── */

interface Prefs { level: Level; files: boolean; zoom: number }
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 10) / 10));

function readPrefs(me: string): Prefs {
  const fallback: Prefs = { level: 'auto', files: false, zoom: 1 };
  try {
    const raw = window.localStorage.getItem(`${PREFS_KEY}:${me}`);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Record<keyof Prefs, unknown>>;
    return {
      level: LEVELS.some((l) => l.id === p.level) ? (p.level as Level) : fallback.level,
      files: typeof p.files === 'boolean' ? p.files : fallback.files,
      zoom: typeof p.zoom === 'number' && Number.isFinite(p.zoom) ? clampZoom(p.zoom) : fallback.zoom,
    };
  } catch {
    return fallback;
  }
}
function writePrefs(me: string, p: Prefs) {
  try {
    window.localStorage.setItem(`${PREFS_KEY}:${me}`, JSON.stringify(p));
  } catch {
    /* 저장 못 해도 이번 보기는 그대로 */
  }
}

/* ── 글 ─────────────────────────────────────────── */

const num = (n: number) => n.toLocaleString('ko-KR');
const norm = (s: string) => s.normalize('NFC').toLowerCase();

function agoText(ms: number): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/** 쪽 머리의 갱신 알약 - 자동 갱신이 세 번 넘게 걸렀으면 빨간 점 */
function syncBadge(s: DriveSnapshot, now: number): { tone: 'ok' | 'busy' | 'warn'; text: string } {
  const t = Date.parse(s.syncedAt);
  const age = Number.isNaN(t) ? Number.POSITIVE_INFINITY : Math.max(0, now - t);
  const ago = Number.isFinite(age) ? agoText(age) : '언제인지 모름';
  if (s.source !== 'apps-script') return { tone: 'busy', text: `${ago} 받은 목록 · 자동 갱신 설정 전` };
  if (age > DRIVE_SYNC_MINUTES * 3 * 60_000) return { tone: 'warn', text: `${ago} 갱신 · 자동 갱신이 멈췄습니다` };
  return { tone: 'ok', text: `${ago} 갱신` };
}

function dayText(iso: string | null, short = false): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return short ? d.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' }) : d.toLocaleDateString('ko-KR');
}

/** 노드에 마우스를 올리면 보이는 설명 */
function tipOf(n: DriveNode): string {
  const kind = kindOf(n.item.mime, n.item.name);
  const parts: string[] = [KIND_LABEL[kind]];
  if (kind === 'folder') parts.push(`폴더 ${num(n.folderTotal)}`, `파일 ${num(n.fileTotal)}`);
  const day = dayText(n.item.modified);
  if (day) parts.push(`수정 ${day}`);
  return `${n.item.name}\n${parts.join(' · ')}\n누르면 옆에 안의 내용, 두 번 누르면 드라이브에서 엽니다`;
}

/** 찾기 결과의 둘째 줄 - 위 폴더들 */
const pathOf = (n: DriveNode) => ancestorsOf(n).map((a) => a.item.name).join(' › ');

/* ── 그림 ───────────────────────────────────────── */

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function KindIcon({ kind, size = 17 }: { kind: DriveKind; size?: number }) {
  const page = <path d="M5.5 2.8h6l3.6 3.6v10.8h-9.6z" />;
  const paths: Record<DriveKind, React.ReactNode> = {
    folder: <path d="M2.6 5.2c0-.6.4-1 1-1h4.1l1.7 1.9h7c.6 0 1 .4 1 1v8.1c0 .6-.4 1-1 1H3.6c-.6 0-1-.4-1-1z" fill="currentColor" fillOpacity={0.14} />,
    doc: <>{page}<path d="M8 10h5M8 12.8h5" /></>,
    sheet: <><rect x="3.5" y="3.5" width="13" height="13" rx="1.6" /><path d="M3.5 8h13M3.5 12.4h13M8.2 8v8.5" /></>,
    slide: <><rect x="2.8" y="4.2" width="14.4" height="10" rx="1.6" /><path d="M10 14.2v2.6M7 16.8h6" /></>,
    form: <><rect x="3.5" y="3" width="13" height="14" rx="1.6" /><path d="M6.6 7.6h1.2M10 7.6h3.6M6.6 11h1.2M10 11h3.6M6.6 14.2h1.2M10 14.2h3.6" /></>,
    pdf: <>{page}<path d="M7.6 11.6h4.8M7.6 14.2h3" /></>,
    image: <><rect x="3" y="3.8" width="14" height="12.4" rx="1.6" /><circle cx="7.4" cy="8" r="1.3" /><path d="M3.4 14.6l4.2-4 3 2.8 2.2-2 3.8 3.4" /></>,
    video: <><rect x="2.8" y="4.2" width="14.4" height="11.6" rx="1.8" /><path d="M8.6 7.6l3.8 2.4-3.8 2.4z" /></>,
    audio: <><path d="M8 14.6V5l7-1.6v9.6" /><circle cx="6" cy="14.6" r="2" /><circle cx="13" cy="13" r="2" /></>,
    archive: <>{page}<path d="M9.4 3v1.6M9.4 6.2v1.6M9.4 9.4v1.6M8.6 12.4h1.6v2.2H8.6z" /></>,
    model: <><path d="M10 2.8l6.2 3.5v7.4L10 17.2l-6.2-3.5V6.3z" /><path d="M3.8 6.3L10 9.8l6.2-3.5M10 9.8v7.4" /></>,
    shortcut: <><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7.6 12.6l5-5M8.6 7.4h4v4" /></>,
    file: page,
  };
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...line}>{paths[kind]}</svg>;
}
const IconMinus = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M4.5 10h11" /></svg>
);
/** 새 탭으로 열기 */
const IconOpen = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><path d="M11.5 3.5h5v5M16.5 3.5l-7.2 7.2M14.5 11.6v4.2c0 .4-.3.7-.7.7H4.2c-.4 0-.7-.3-.7-.7V6.2c0-.4.3-.7.7-.7h4.2" /></svg>
);
/** 맨 위로 가기 */
const IconTarget = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...line}><circle cx="10" cy="10" r="5.6" /><circle cx="10" cy="10" r="1.6" /><path d="M10 1.8v2.6M10 15.6v2.6M1.8 10h2.6M15.6 10h2.6" /></svg>
);

/** 단계 · 파일 알약 - aria-pressed 면 파랗게 채운다 */
const seg =
  'inline-flex h-[38px] flex-none items-center whitespace-nowrap rounded-full border border-tm-edge bg-white px-3.5 text-[14px] font-bold text-tm-ink ' +
  'transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white ' +
  '[@media(pointer:coarse)]:h-11';

const messageCard =
  'tm-fill flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-tm border border-tm-line bg-white px-6 py-16 text-center shadow-tm';

/* ── 옆 칸 - 고른 노드의 안 ─────────────────────────── */

/** 폴더 안 목록의 한 줄 - 누르면 그 항목을 옆 칸에(트리에서도 짚는다), 오른쪽 그림은 드라이브에서 열기 */
function PanelRow({ n, onPick }: { n: DriveNode; onPick(n: DriveNode): void }) {
  const kind = kindOf(n.item.mime, n.item.name);
  const folder = kind === 'folder';
  return (
    <li className="flex items-center gap-1">
      <button type="button" onClick={() => onPick(n)} title={n.item.name}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-[7px] text-left transition-colors duration-150 hover:bg-tm-tint
                   focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tm-blue
                   [@media(pointer:coarse)]:min-h-11">
        <span className={folder ? 'text-tm-blue' : 'text-tm-sub'}><KindIcon kind={kind} /></span>
        <span className={`min-w-0 flex-1 truncate text-[14px] text-tm-ink ${folder ? 'font-semibold' : ''}`}>{n.item.name}</span>
        <span className="flex-none text-[12px] tabular-nums text-tm-sub">
          {folder ? (n.fileTotal > 0 ? `파일 ${num(n.fileTotal)}` : '') : dayText(n.item.modified, true)}
        </span>
      </button>
      <a href={driveUrl(n.item)} target="_blank" rel="noopener noreferrer" className={tmIconBtnSm}
        aria-label={`${n.item.name} 드라이브에서 열기`} title="드라이브에서 열기">
        <IconOpen size={15} />
      </a>
    </li>
  );
}

/** 파일 - 드라이브 미리보기를 끼워 넣는다. 그 브라우저가 드라이브 계정으로 로그인돼 있어야 보인다 */
function FilePreview({ node }: { node: DriveNode }) {
  const url = previewUrl(node.item);
  const [loaded, setLoaded] = useState(false);
  if (!url) {
    return (
      <p className="px-5 py-6 text-[14px] leading-[1.7] text-tm-sub max-[720px]:px-4">
        이 종류는 여기서 미리 볼 수 없습니다. 드라이브에서 열어 보세요.
      </p>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <div className="relative min-h-[240px] flex-1 overflow-hidden rounded-tm-sm border border-tm-line bg-white">
        <iframe src={url} title={`${node.item.name} 미리보기`} onLoad={() => setLoaded(true)} allow="autoplay; fullscreen" allowFullScreen
          className="absolute inset-0 h-full w-full border-0" />
        {!loaded && (
          <p className="absolute inset-0 grid place-items-center bg-tm-bg px-4 text-center text-[13.5px] font-semibold text-tm-sub">
            미리보기를 불러오는 중…
          </p>
        )}
      </div>
      <p className="px-1 text-[12.5px] leading-[1.6] text-tm-sub">
        미리보기가 비거나 로그인 · 권한 안내가 뜨면 이 브라우저에서 {DRIVE_ACCOUNT} 로 구글에 로그인해 주세요.
      </p>
    </div>
  );
}

/** 고른 노드 - 위 폴더 길, 이름 · 수, 드라이브에서 열기, 그리고 폴더면 안의 목록 · 파일이면 미리보기 */
function DrivePanel({ tree, node, onPick, onClose }: {
  tree: DriveTree;
  node: DriveNode;
  onPick(n: DriveNode): void;
  /** 좁은 화면의 아래 칸만 - 닫기 단추 */
  onClose?: () => void;
}) {
  const kind = kindOf(node.item.mime, node.item.name);
  const folder = kind === 'folder';
  const ups = node === tree.root ? [] : [tree.root, ...ancestorsOf(node)];
  const day = dayText(node.item.modified);
  const meta = folder
    ? [`폴더 ${num(node.folders.length)}`, `파일 ${num(node.files.length)}`,
      ...(node.fileTotal > node.files.length ? [`아래 전체 파일 ${num(node.fileTotal)}`] : []),
      ...(day ? [`수정 ${day}`] : [])]
    : [KIND_LABEL[kind], ...(day ? [`수정 ${day}`] : [])];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-none border-b border-tm-line px-5 pb-4 pt-4 max-[720px]:px-4">
        {ups.length > 0 && (
          <nav aria-label="위 폴더" className="mb-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12.5px] leading-[1.5] text-tm-sub">
            {ups.map((a, i) => (
              <Fragment key={a.item.id}>
                {i > 0 && <span aria-hidden>›</span>}
                <button type="button" onClick={() => onPick(a)}
                  className="max-w-[18ch] truncate rounded-sm transition-colors duration-150 hover:text-tm-blue hover:underline">
                  {a.item.name}
                </button>
              </Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-start gap-2.5">
          <span className={`mt-[3px] ${folder ? 'text-tm-blue' : 'text-tm-sub'}`}><KindIcon kind={kind} size={22} /></span>
          <h2 className="min-w-0 flex-1 break-words text-[18px] font-extrabold leading-[1.4] text-tm-deep">{node.item.name}</h2>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="미리보기 닫기" title="닫기" className={`${tmIconBtnSm} -mr-1.5 -mt-1`}>
              <IconClose />
            </button>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-[1.6] text-tm-sub">{meta.join(' · ')}</p>
        <a href={driveUrl(node.item)} target="_blank" rel="noopener noreferrer"
          className={`${tmGhostBtn} mt-3 hover:border-tm-blue hover:bg-tm-tint`}>
          드라이브에서 열기 <IconOpen />
        </a>
      </div>
      {folder ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2.5">
          {node.folders.length + node.files.length === 0 && (
            <p className="px-2 py-8 text-center text-[14px] text-tm-sub">비어 있는 폴더입니다</p>
          )}
          {node.folders.length > 0 && (
            <section>
              <h3 className="px-2 pb-1 pt-1.5 text-[12.5px] font-bold text-tm-sub">폴더 {num(node.folders.length)}</h3>
              <ul>{node.folders.map((c) => <PanelRow key={c.item.id} n={c} onPick={onPick} />)}</ul>
            </section>
          )}
          {node.files.length > 0 && (
            <section className={node.folders.length ? 'mt-2' : ''}>
              <h3 className="px-2 pb-1 pt-1.5 text-[12.5px] font-bold text-tm-sub">파일 {num(node.files.length)}</h3>
              <ul>{node.files.map((c) => <PanelRow key={c.item.id} n={c} onPick={onPick} />)}</ul>
            </section>
          )}
        </div>
      ) : (
        <FilePreview key={node.item.id} node={node} />
      )}
    </div>
  );
}

function useNow(every: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(t);
  }, [every]);
  return now;
}

/* ── 화면 ───────────────────────────────────────── */

export default function Drive({ me }: { me: string }) {
  /** null - 처음 읽는 중 */
  const [load, setLoad] = useState<DriveLoad | null>(null);
  const [busy, setBusy] = useState(false);

  /** 지금 보이는 목록의 갱신 시각 - 새 목록이 왔는지 견준다 */
  const shownStamp = useRef<string | null>(null);
  /** quiet - 화면이 알아서 다시 읽는 것. 못 읽어도 보던 목록을 그대로 두고, 단추 글자도 바꾸지 않는다 */
  const reload = useCallback(async (quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      const next = await loadDrive();
      if (!quiet || next.kind === 'ok') {
        shownStamp.current = next.kind === 'ok' ? next.snapshot.syncedAt : null;
        setLoad(next);
      }
    } catch (e) {
      if (!quiet) setLoad({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
    } finally {
      if (!quiet) setBusy(false);
    }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  /* 드라이브가 바뀌면 1~2분 안에 새 목록이 온다 - 화면이 보이는 동안 1분마다(다른 탭에서 돌아오면 바로) 갱신 시각만 보고
     바뀌었으면 다시 읽는다. 펼친 것 · 고른 것은 그대로 남는다 */
  useEffect(() => {
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      const stamp = await loadDriveStamp().catch(() => null);
      if (stamp && stamp !== shownStamp.current) void reload(true);
    };
    const timer = window.setInterval(() => void check(), 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reload]);

  const snap = load?.kind === 'ok' ? load.snapshot : null;
  const tree = useMemo(() => (snap ? buildDriveTree(snap) : null), [snap]);
  const now = useNow(60_000);

  return (
    <>
      <PageHead
        title="구글 드라이브"
        lead={`팀 구글 드라이브의 폴더 구조입니다. 이름을 누르면 옆에 안의 내용이 보이고, 두 번 누르면 드라이브에서 열립니다. 이름 끝의 동그라미로 접고 펼칩니다. 드라이브가 바뀌면 1~2분 안에 새 목록이 들어옵니다.`}
        saved={snap ? syncBadge(snap, now) : undefined}
      >
        <button type="button" onClick={() => void reload()} disabled={busy} className={tmGhostBtn}>
          {busy ? '읽는 중…' : '다시 읽기'}
        </button>
        {tree && (
          <a href={driveUrl(tree.root.item)} target="_blank" rel="noopener noreferrer"
            className={`${tmGhostBtn} hover:border-tm-blue hover:bg-tm-tint`}>
            드라이브 열기 <IconOpen />
          </a>
        )}
      </PageHead>

      {load === null ? (
        <div className={messageCard}><p className="text-[15px] font-semibold text-tm-sub">드라이브 목록을 읽는 중…</p></div>
      ) : load.kind === 'local' ? (
        <div className={messageCard}>
          <p className="text-[17px] font-bold text-tm-ink">팀 서버에 연결된 Hub 에서만 보입니다</p>
          <p className="max-w-[52ch] text-[14.5px] leading-[1.7] text-tm-sub">
            지금 Hub 는 이 브라우저에만 저장하는 모드라 드라이브 목록을 받을 곳이 없습니다.
          </p>
        </div>
      ) : load.kind === 'missing' ? (
        <div className={messageCard}>
          <p className="text-[17px] font-bold text-tm-ink">드라이브 목록 표가 아직 없습니다</p>
          <p className="max-w-[52ch] text-[14.5px] leading-[1.7] text-tm-sub">
            supabase/taskmanager.sql 의 &apos;구글 드라이브 지도&apos; 블록을 Supabase SQL Editor 에서 실행해 주세요.
          </p>
        </div>
      ) : load.kind === 'empty' ? (
        <div className={messageCard}>
          <p className="text-[17px] font-bold text-tm-ink">아직 받은 드라이브 목록이 없습니다</p>
          <p className="max-w-[52ch] text-[14.5px] leading-[1.7] text-tm-sub">
            {DRIVE_ACCOUNT} 계정의 Apps Script(supabase/drive-sync.gs)에서 install 을 실행하면 바로 채워집니다.
          </p>
        </div>
      ) : load.kind === 'error' ? (
        <div className={messageCard} role="alert">
          <p className="text-[17px] font-bold text-tm-ink">드라이브 목록을 읽지 못했습니다</p>
          <p className="max-w-[60ch] break-words text-[14px] leading-[1.7] text-tm-sub">{load.message}</p>
          <button type="button" onClick={() => void reload()} disabled={busy} className={tmGhostBtn}>다시 읽기</button>
        </div>
      ) : tree && tree.all.length === 0 ? (
        <div className={messageCard}><p className="text-[15px] font-semibold text-tm-sub">드라이브가 비어 있습니다</p></div>
      ) : tree ? (
        <DriveMap tree={tree} me={me} />
      ) : null}
    </>
  );
}

function DriveMap({ tree, me }: { tree: DriveTree; me: string }) {
  const narrow = useMediaQuery('(max-width: 720px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  /** 넓으면 오른쪽에 늘 있는 칸, 좁으면 노드를 누를 때 아래에서 올라오는 칸 */
  const wide = useMediaQuery('(min-width: 1180px)');
  const d = useMemo(() => dimsOf(narrow, coarse), [narrow, coarse]);

  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs(me));
  /** null - 동그라미로 직접 접고 펼쳐 단계 단추와 달라졌다 */
  const [level, setLevel] = useState<Level | null>(prefs.level);
  const [open, setOpen] = useState<Set<string>>(() => presetOpen(tree, prefs.level));
  const files = prefs.files;
  const zoom = prefs.zoom;
  const [pin, setPin] = useState<DriveNode | null>(null);
  /** 옆 칸에 보이는 노드 - 처음에는 맨 위(팀 드라이브). 트리에서는 테두리로 짚는다 */
  const [selectedId, setSelectedId] = useState(tree.root.item.id);
  /** 좁은 화면의 아래 칸이 올라와 있나 */
  const [sheet, setSheet] = useState(false);
  const sheetUp = !wide && sheet;
  /* 아래 칸이 올라와 있으면 그 높이만큼 판 아래에 여백을 둔다 - 트리 아래쪽 노드도 칸 위로 올릴 수 있게 */
  const [viewH, setViewH] = useState(0);
  /** 아래 칸 높이(트리 칸에 대한 몫) - 휴대폰은 칸 머리가 자리를 많이 써서 더 높게 */
  const sheetFrac = narrow ? 0.78 : 0.58;
  const spare = sheetUp ? Math.round(viewH * sheetFrac) : 0;

  const savePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      writePrefs(me, next);
      return next;
    });
  }, [me]);

  /* 목록이 새로 오면(다시 읽기 · 자동 갱신) 같은 id 의 노드로 바꿔 끼운다. 펼친 것 · 고른 것은 id 라 그대로 둔다 */
  const [shownTree, setShownTree] = useState(tree);
  if (shownTree !== tree) {
    setShownTree(tree);
    setPin((p) => (p ? tree.byId.get(p.item.id) ?? null : null));
    if (level) setOpen(presetOpen(tree, level));
  }

  const layout = useMemo(() => layoutOf(tree.root, open, files, pin, d), [tree, open, files, pin, d]);

  /* ── 스크롤 · 크기 ── */
  const cardRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  /** 다음 그림 뒤에 할 일 - 노드를 화면 가운데로(center), 접고 펼친 노드를 제자리에(keep), 크기를 바꾼 뒤 스크롤(scroll) */
  const after = useRef<
    | { kind: 'center'; key: string; focus: boolean }
    | { kind: 'keep'; key: string; top: number; left: number }
    | { kind: 'scroll'; left: number; top: number }
    | null
  >({ kind: 'center', key: tree.root.item.id, focus: false });
  /* 그림이 그대로여도(이미 보이는 노드를 찾기로 고름) 할 일이 돌게 한 번씩 센다 */
  const [afterTick, setAfterTick] = useState(0);
  const request = (a: NonNullable<typeof after.current>) => {
    after.current = a;
    setAfterTick((t) => t + 1);
  };

  useLayoutEffect(() => {
    const a = after.current;
    const el = scroller.current;
    if (!a || !el) return;
    after.current = null;
    if (a.kind === 'scroll') {
      el.scrollLeft = a.left;
      el.scrollTop = a.top;
      return;
    }
    const p = layout.byKey.get(a.key);
    if (!p) return;
    if (a.kind === 'keep') {
      el.scrollTop = p.y * zoom - a.top;
      el.scrollLeft = p.x * zoom - a.left;
      return;
    }
    const left = a.key === tree.root.item.id ? 0 : Math.max(0, (p.x + d.nodeW / 2) * zoom - el.clientWidth / 2);
    // 아래 칸이 올라와 있으면 그 위에 남은 자리의 가운데로
    const top = Math.max(0, (p.y + d.nodeH / 2) * zoom - el.clientHeight * (sheetUp ? (1 - sheetFrac) / 2 : 0.5));
    el.scrollTo({ left, top, behavior: a.focus && !reduced ? 'smooth' : 'auto' });
    if (a.focus) el.querySelector<HTMLElement>(`[data-key="${CSS.escape(a.key)}"] button`)?.focus({ preventScroll: true });
  }, [layout, zoom, d, reduced, tree, afterTick, sheetUp, sheetFrac]);

  const zoomTo = useCallback((z: number, at?: { x: number; y: number }) => {
    const el = scroller.current;
    const cur = zoomRef.current;
    const next = clampZoom(z);
    if (!el || next === cur) return;
    const ax = at?.x ?? el.clientWidth / 2;
    const ay = at?.y ?? el.clientHeight / 2;
    // 짚은 곳(없으면 화면 가운데) 아래의 판 위 자리가 그대로 있게
    after.current = { kind: 'scroll', left: ((el.scrollLeft + ax) / cur) * next - ax, top: ((el.scrollTop + ay) / cur) * next - ay };
    setAfterTick((t) => t + 1);
    savePrefs({ zoom: next });
  }, [savePrefs]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Ctrl(⌘)+휠 - 크기. 그냥 휠은 스크롤 */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomTo(zoomRef.current * (e.deltaY < 0 ? 1.1 : 1 / 1.1), { x: e.clientX - r.left, y: e.clientY - r.top });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  /* 마우스로 빈 곳을 끌면 판을 옮긴다. 손가락은 원래 스크롤 */
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    const el = e.currentTarget;
    const sx = e.clientX;
    const sy = e.clientY;
    const sl = el.scrollLeft;
    const st = el.scrollTop;
    el.setPointerCapture(e.pointerId);
    setDragging(true);
    const move = (ev: PointerEvent) => {
      el.scrollLeft = sl - (ev.clientX - sx);
      el.scrollTop = st - (ev.clientY - sy);
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      setDragging(false);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  /* ── 접고 펼치기 ── */
  const toggle = (n: DriveNode) => {
    const el = scroller.current;
    const p = layout.byKey.get(n.item.id);
    if (el && p) request({ kind: 'keep', key: p.key, top: p.y * zoom - el.scrollTop, left: p.x * zoom - el.scrollLeft });
    setOpen((prev) => {
      const s = new Set(prev);
      if (s.has(n.item.id)) s.delete(n.item.id);
      else s.add(n.item.id);
      return s;
    });
    setLevel(null);
  };
  const applyLevel = (l: Level) => {
    setOpen(presetOpen(tree, l));
    setLevel(l);
    setPin(null);
    savePrefs({ level: l });
    request({ kind: 'center', key: tree.root.item.id, focus: false });
  };
  const toggleFiles = () => {
    const el = scroller.current;
    const p = layout.byKey.get(tree.root.item.id);
    if (el && p) request({ kind: 'keep', key: p.key, top: p.y * zoom - el.scrollTop, left: p.x * zoom - el.scrollLeft });
    savePrefs({ files: !files });
  };
  const goRoot = () => request({ kind: 'center', key: tree.root.item.id, focus: true });

  /* ── 고르기 - 트리에서 누르면 옆 칸에, 두 번 누르면 드라이브에서 ── */
  const select = (n: DriveNode) => {
    setSelectedId(n.item.id);
    if (!wide) openSheet(n);
  };
  /**
   * 좁은 화면 - 아래 칸을 올리고, 누른 노드는 칸에 가리지 않게 위쪽으로 옮긴다.
   * 휴대폰은 쪽 머리째 스크롤하는 화면이라(globals.css 의 tm-page) 카드를 화면 위로 올려 칸이 잘리지 않게 한다
   */
  const openSheet = (n: DriveNode) => {
    setSheet(true);
    request({ kind: 'center', key: n.item.id, focus: false });
    const card = cardRef.current;
    const page = card?.closest<HTMLElement>('.tm-page');
    if (card && page && page.scrollHeight > page.clientHeight + 1) {
      const gap = card.getBoundingClientRect().top - page.getBoundingClientRect().top;
      if (gap > 8) page.scrollBy({ top: gap, behavior: reduced ? 'auto' : 'smooth' });
    }
  };
  const openInDrive = (n: DriveNode) => {
    window.open(driveUrl(n.item), '_blank', 'noopener,noreferrer');
  };

  /* ── 찾기 ── */
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState(false);
  const searchBox = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const q = norm(query.trim());
  const results = useMemo(() => {
    if (!q) return [];
    return tree.all
      .filter((n) => norm(n.item.name).includes(q))
      .sort((a, b) =>
        Number(a.item.mime !== DRIVE_FOLDER) - Number(b.item.mime !== DRIVE_FOLDER)
        || a.depth - b.depth
        || a.item.name.localeCompare(b.item.name, 'ko', { numeric: true }));
  }, [tree, q]);
  /* 판의 노드 칠하기는 늦춰도 된다 - 글자를 칠 때마다 판 전체를 다시 그리지 않게 */
  const deferredQ = useDeferredValue(q);
  const hits = useMemo(() => {
    if (!deferredQ) return null;
    return new Set(tree.all.filter((n) => norm(n.item.name).includes(deferredQ)).map((n) => n.item.id));
  }, [tree, deferredQ]);

  useEffect(() => {
    if (!panel) return;
    const away = (e: PointerEvent) => {
      if (!searchBox.current?.contains(e.target as Node)) setPanel(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [panel]);

  /** 트리에 없던 것(찾기 · 옆 칸 목록)을 고른다 - 위 폴더를 펼치고 그 노드를 화면에 둔다 */
  const reveal = (n: DriveNode, focus = true) => {
    const ups = ancestorsOf(n);
    if (ups.some((a) => !open.has(a.item.id))) {
      setOpen((prev) => {
        const s = new Set(prev);
        for (const a of ups) s.add(a.item.id);
        return s;
      });
      setLevel(null);
    }
    setPin(n.item.mime === DRIVE_FOLDER ? null : n);
    setSelectedId(n.item.id);
    setPanel(false);
    if (!wide) openSheet(n);
    request({ kind: 'center', key: n.item.id, focus });
  };
  /** 옆 칸의 목록 · 위 폴더 길에서 고름 - 초점은 옆 칸에 둔다 */
  const pick = (n: DriveNode) => reveal(n, false);

  const resultButtons = () => searchBox.current?.querySelectorAll<HTMLButtonElement>('button[data-result]') ?? [];
  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (panel && q) setPanel(false);
      else setQuery('');
    } else if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setPanel(true);
      requestAnimationFrame(() => resultButtons()[0]?.focus());
    } else if (e.key === 'Enter' && results.length && !e.nativeEvent.isComposing) {
      e.preventDefault();
      reveal(results[0]);
    }
  };
  const onResultKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const list = [...resultButtons()];
    const i = list.indexOf(e.currentTarget);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      list[Math.min(list.length - 1, i + 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (i <= 0) searchInput.current?.focus();
      else list[i - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setPanel(false);
      searchInput.current?.focus();
    }
  };

  const shown = results.slice(0, 50);
  const selected = tree.byId.get(selectedId) ?? tree.root;

  return (
    <div ref={cardRef} className="tm-fill flex min-h-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-white shadow-tm">
      {/* ── 막대: 찾기 · 단계 · 파일 · 크기 ── */}
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-tm-line px-4 py-3 max-[720px]:px-3">
        <div ref={searchBox} className="relative min-w-0 flex-[1_1_220px] max-w-[340px] max-[720px]:max-w-none">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={17} /></span>
          <input
            ref={searchInput}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPanel(true); }}
            onFocus={() => setPanel(true)}
            onKeyDown={onSearchKey}
            placeholder="폴더 · 파일 이름 찾기"
            aria-label="드라이브 검색"
            className={`${tmFieldBase} h-[38px] w-full pl-9 pr-9 text-[15px] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px]`}
          />
          {query && (
            <button type="button" aria-label="검색어 지우기" onClick={() => { setQuery(''); searchInput.current?.focus(); }}
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-tm-sub transition-colors duration-150
                         hover:bg-tm-tint hover:text-tm-blue [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10">
              <IconClose size={16} />
            </button>
          )}
          {panel && q && (
            <div id="drive-results"
              className="absolute left-0 top-[calc(100%+6px)] z-20 w-[min(560px,calc(100vw-48px))] overflow-hidden rounded-tm-sm border border-tm-line bg-white shadow-tm-up">
              <p className="border-b border-tm-line px-3.5 py-2 text-[13px] font-semibold text-tm-sub" aria-live="polite">
                {results.length === 0 ? '찾은 것이 없습니다'
                  : results.length > shown.length ? `${num(results.length)}개 찾음 · 앞의 ${shown.length}개`
                    : `${num(results.length)}개 찾음`}
              </p>
              {shown.length > 0 && (
                <ul className="max-h-[min(55vh,420px)] overflow-y-auto py-1">
                  {shown.map((n, i) => {
                    const kind = kindOf(n.item.mime, n.item.name);
                    return (
                      <li key={n.item.id} className="flex items-center gap-1 px-1.5">
                        <button type="button" data-result={i} onClick={() => reveal(n)} onKeyDown={onResultKey}
                          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors duration-150
                                     hover:bg-tm-tint focus-visible:bg-tm-tint focus-visible:outline-none">
                          <span className={kind === 'folder' ? 'text-tm-blue' : 'text-tm-sub'}><KindIcon kind={kind} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-semibold text-tm-ink">{n.item.name}</span>
                            <span className="block truncate text-[12.5px] text-tm-sub">{pathOf(n) || '팀 드라이브 바로 아래'}</span>
                          </span>
                        </button>
                        <a href={driveUrl(n.item)} target="_blank" rel="noopener noreferrer" className={tmIconBtnSm}
                          aria-label={`${n.item.name} 드라이브에서 열기`} title="드라이브에서 열기">
                          <IconOpen />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div role="group" aria-label="펼칠 단계" className="flex flex-wrap items-center gap-1">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" aria-pressed={level === l.id} title={l.hint} onClick={() => applyLevel(l.id)} className={seg}>
              {l.label}
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={files} onClick={toggleFiles} className={seg}
          title={`폴더 안의 파일도 그립니다. 한 폴더에 ${FILE_CAP}개까지 그리고 나머지는 드라이브에서 봅니다`}>
          파일도 보기
        </button>

        <div role="group" aria-label="크기" className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => zoomTo(zoom - 0.1)} disabled={zoom <= ZOOM_MIN} aria-label="작게 보기" title="작게 (Ctrl+휠)" className={tmIconBtn}>
            <IconMinus />
          </button>
          <button type="button" onClick={() => zoomTo(1)} title="원래 크기로"
            className="h-[38px] min-w-[54px] rounded-tm-sm px-1 text-[13.5px] font-bold tabular-nums text-tm-ink transition-colors duration-150 hover:bg-tm-tint
                       [@media(pointer:coarse)]:h-11">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" onClick={() => zoomTo(zoom + 0.1)} disabled={zoom >= ZOOM_MAX} aria-label="크게 보기" title="크게 (Ctrl+휠)" className={tmIconBtn}>
            <IconPlus />
          </button>
          <button type="button" onClick={goRoot} aria-label="맨 위로 가기" title="팀 드라이브(맨 위)를 화면에 둡니다" className={tmIconBtn}>
            <IconTarget />
          </button>
        </div>
      </div>

      {/* ── 트리 + 옆 칸(넓으면 오른쪽, 좁으면 아래에서 올라온다) ── */}
      <div className="relative flex min-h-0 flex-1">
      <div
        ref={scroller}
        role="region"
        aria-label="구글 드라이브 트리"
        tabIndex={0}
        onPointerDown={onPointerDown}
        className={`relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-tm-bg outline-none
                    focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tm-blue ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <div className="relative" style={{ width: layout.width * zoom, height: layout.height * zoom + spare }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}>
            <svg className="pointer-events-none absolute left-0 top-0" width={layout.width} height={layout.height} aria-hidden>
              <g fill="none" stroke="#7f8b9e" strokeOpacity={0.55} strokeWidth={1.5}>
                {layout.edges.map(([a, b]) => {
                  const x1 = a.x + d.nodeW;
                  const y1 = a.y + d.nodeH / 2;
                  const x2 = b.x;
                  const y2 = b.y + d.nodeH / 2;
                  const mx = (x1 + x2) / 2;
                  return <path key={b.key} d={`M${x1},${y1}C${mx},${y1} ${mx},${y2} ${x2},${y2}`} />;
                })}
              </g>
            </svg>

            {layout.placed.map((p) => {
              const n = p.node;
              const style = { left: p.x, top: p.y, width: d.nodeW, height: d.nodeH };
              if (p.more > 0) {
                return (
                  <div key={p.key} data-key={p.key} className="absolute" style={style}>
                    <button type="button" onClick={() => select(n)}
                      title={`${n.item.name} 의 파일 ${num(n.files.length)}개를 옆 칸에서 모두 봅니다`}
                      className="flex h-full w-full items-center gap-2 rounded-tm-sm border border-dashed border-tm-edge px-2.5 text-left text-[13.5px] font-semibold
                                 text-tm-sub transition-colors duration-150 hover:border-tm-blue hover:bg-white hover:text-tm-blue
                                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tm-blue">
                      <span className="min-w-0 flex-1 truncate">파일 {num(p.more)}개 더 보기</span>
                    </button>
                  </div>
                );
              }
              const isRoot = n === tree.root;
              const kind = kindOf(n.item.mime, n.item.name);
              const folder = kind === 'folder';
              const isOpen = isRoot || open.has(n.item.id);
              const hidden = folder && !isRoot ? hiddenOf(n, files) : 0;
              const hit = hits?.has(n.item.id) ?? false;
              const box = isRoot
                ? 'border-tm-blue bg-tm-blue font-bold text-white hover:border-tm-blue-hover hover:bg-tm-blue-hover'
                : hit
                  ? 'border-tm-blue bg-tm-tint text-tm-deep hover:bg-white'
                  : n.depth === 1
                    ? 'border-tm-blue/50 bg-white font-bold text-tm-deep hover:border-tm-blue hover:bg-tm-tint'
                    : 'border-tm-line bg-white text-tm-ink hover:border-tm-blue hover:bg-tm-tint';
              const weight = isRoot || n.depth === 1 ? '' : folder || hit ? 'font-semibold' : 'font-normal';
              return (
                <div key={p.key} data-key={p.key} className="absolute" style={style}>
                  <button type="button" title={tipOf(n)} onClick={() => select(n)} onDoubleClick={() => openInDrive(n)}
                    onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); openInDrive(n); } }}
                    aria-current={selected === n ? 'true' : undefined}
                    aria-label={`${n.item.name}, ${KIND_LABEL[kind]}${folder && n.fileTotal ? `, 파일 ${num(n.fileTotal)}개` : ''}, 누르면 옆에 안의 내용`}
                    className={`flex h-full w-full items-center gap-2 rounded-tm-sm border px-2.5 text-left text-[14px] transition-colors duration-150
                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tm-blue
                                max-[720px]:text-[13.5px] ${box} ${weight} ${
                                  selected === n ? 'ring-2 ring-tm-blue ring-offset-2 ring-offset-tm-bg' : ''}`}>
                    <span className={isRoot ? 'text-white' : folder ? 'text-tm-blue' : 'text-tm-sub'}>
                      <KindIcon kind={kind} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{n.item.name}</span>
                    {folder && n.fileTotal > 0 && (
                      <span aria-hidden className={`flex-none text-[12px] font-semibold tabular-nums ${isRoot ? 'text-white/80' : 'text-tm-sub'} ${
                        hidden > 0 ? 'mr-2.5' : ''}`}>
                        {num(n.fileTotal)}
                      </span>
                    )}
                  </button>
                  {hidden > 0 && (
                    <button type="button" onClick={() => toggle(n)} aria-expanded={isOpen}
                      aria-label={isOpen ? `${n.item.name} 접기` : `${n.item.name} 펼치기, 아래 ${hidden}개`}
                      title={isOpen ? '접기' : `펼치기 (아래 ${hidden}개)`}
                      className="absolute left-full top-1/2 z-[1] grid h-6 min-w-[24px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border
                                 border-tm-edge bg-white px-1.5 text-[11.5px] font-bold tabular-nums text-tm-sub transition-colors duration-150
                                 hover:border-tm-blue hover:text-tm-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                                 focus-visible:outline-tm-blue [@media(pointer:coarse)]:h-8 [@media(pointer:coarse)]:min-w-[32px]">
                      {isOpen ? <IconMinus size={12} /> : num(hidden)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {wide ? (
        <aside aria-label="미리보기" className="flex w-[380px] flex-none flex-col border-l border-tm-line bg-white min-[1600px]:w-[440px]">
          <DrivePanel tree={tree} node={selected} onPick={pick} />
        </aside>
      ) : sheet && (
        <aside aria-label="미리보기" onKeyDown={(e) => { if (e.key === 'Escape') setSheet(false); }}
          className="absolute inset-x-0 bottom-0 z-20 flex h-[58%] flex-col overflow-hidden rounded-t-[18px] border-t border-tm-line bg-white
                     shadow-tm-pop animate-tm-rise max-[720px]:h-[78%]">
          <DrivePanel tree={tree} node={selected} onPick={pick} onClose={() => setSheet(false)} />
        </aside>
      )}
      </div>

      {/* ── 아래 줄: 수 · 여는 계정 ── */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-tm-line px-4 py-2.5 text-[13px] leading-[1.6]
                      text-tm-sub max-[720px]:px-3">
        <span>
          폴더 {num(tree.root.folderTotal)} · 파일 {num(tree.root.fileTotal)}
          <span className="max-[720px]:hidden"> · 폴더 이름 옆 숫자는 그 안의 파일 수</span>
        </span>
        <span>링크가 열리지 않으면 브라우저의 구글 계정을 {DRIVE_ACCOUNT} 로 바꿔 보세요</span>
      </div>
    </div>
  );
}
