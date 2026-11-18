'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DRIVE_ACCOUNT, DRIVE_FOLDER, ancestorsOf, buildDriveTree, driveUrl, loadDrive,
  type DriveItem, type DriveLoad, type DriveNode, type DriveTree,
} from './driveTree';
import {
  DUTIES_MAX, FOLDERS_MAX, NO_UNIT, STUDIO_APPS, STUDIO_GROUPS, UNIT_MAX,
  blankEntry, buildOrg, dutyLines, folderIdFrom, recommend, reportsUnder, shortName, toolsOf, useOrgStore,
  type OrgEntry, type OrgFolder, type OrgNode, type OrgPatch, type OrgStore, type OrgView, type StudioApp, type Suggestion,
} from './orgChart';
import { isRemote } from './supabase';
import { useMembers } from './members';
import type { Member, Task } from './types';
import type { CanvasApi } from './wikiGraph';
import type { MindDetails } from './OrgMind';
import {
  Avatar, IconClose, IconNav, IconPlus, IconSearch, Modal, PageHead,
  tmBtn, tmBtnPrimary, tmFieldBase, tmGhostBtn, tmIconBtn, tmIconBtnSm, tmInput, tmLabel, tmSelect, tmTextarea, useMediaQuery,
} from './ui';

/*
 * 조직도 - 팀원의 소속 · 보고 체계 · 맡은 일 · 쓰면 좋은 MATE Studio 도구 · 담당 구글 드라이브 폴더를 한 장에.
 * 위에서 아래로 뻗는 트리(회사 → 팀 → 사람, 또는 회사 → 상위 → 아래 사람)를 판 위에 그리고, 카드를 누르면 옆 칸
 * (좁은 화면은 아래에서 올라오는 칸)에 자세히 보인다. 아래가 모두 끝 사람이고 셋 이상이면 세로로 쌓아 판이 옆으로 퍼지지 않게 한다.
 * 맡은 일 · 도구 · 폴더는 본인과 관리자가, 소속 · 상위는 관리자가 '고치기' 창에서 바꾼다(데이터는 orgChart.ts).
 * 폴더는 구글 드라이브 화면과 같은 목록(tm_drive_snapshot)에서 고르거나 드라이브 주소를 붙여 넣는다.
 * 판은 드라이브 트리와 같이 움직인다 - 손가락 · 휠은 스크롤, 마우스는 빈 곳을 끌어 옮기고 Ctrl+휠로 키운다.
 */

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.6;
const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
const PREFS_KEY = 'mate.taskmanager.org.v1';

/* 마인드맵 모양은 위키와 같은 엔진(Mind Elixir)을 쓴다 - 고를 때만 불러온다 */
const OrgMind = dynamic(() => import('./OrgMind'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center bg-tm-bg text-[15px] font-semibold text-tm-sub">마인드맵을 불러오는 중…</div>,
});

/** 모양 - 위에서 아래로 뻗는 트리 · 가운데에서 가지로 펼치는 마인드맵 */
type Shape = 'tree' | 'mind';
const ALL_DETAILS: MindDetails = { duties: true, tools: true, folders: true };
const DETAIL_TOGGLES: { id: keyof MindDetails; label: string; hint: string }[] = [
  { id: 'duties', label: '맡은 일', hint: '사람마다 맡은 역할과 책임 가지' },
  { id: 'tools', label: '도구', hint: '사람마다 MATE Studio 도구 가지(쓰는 것 · 추천)' },
  { id: 'folders', label: '폴더', hint: '사람마다 담당 구글 폴더 가지' },
];

interface Prefs { view: OrgView; zoom: number | null; shape: Shape; details: MindDetails }

function readPrefs(me: string): Prefs {
  try {
    const raw = window.localStorage.getItem(`${PREFS_KEY}:${me}`);
    const p = (raw ? JSON.parse(raw) : {}) as { view?: unknown; zoom?: unknown; shape?: unknown; details?: Partial<Record<keyof MindDetails, unknown>> };
    const d = p.details && typeof p.details === 'object' ? p.details : {};
    return {
      view: p.view === 'report' ? 'report' : 'team',
      zoom: typeof p.zoom === 'number' && Number.isFinite(p.zoom) ? clampZoom(p.zoom) : null,
      shape: p.shape === 'mind' ? 'mind' : 'tree',
      details: { duties: d.duties !== false, tools: d.tools !== false, folders: d.folders !== false },
    };
  } catch {
    return { view: 'team', zoom: null, shape: 'tree', details: ALL_DETAILS };
  }
}

function writePrefs(me: string, p: Prefs) {
  try {
    window.localStorage.setItem(`${PREFS_KEY}:${me}`, JSON.stringify(p));
  } catch { /* 저장이 막힌 환경 */ }
}

/* ── 판 위의 자리 ─────────────────────────────────── */

interface Dims {
  w: number; personH: number; groupH: number; hGap: number; vGap: number; stackGap: number; indent: number; pad: number;
  /** 좁은 화면 - 아이가 둘 이상이면 모두 세로로 쌓아 목록처럼 내려가게(옆으로 퍼지면 글자가 읽히지 않을 만큼 줄여야 한다) */
  outline: boolean;
}
const dimsOf = (narrow: boolean): Dims => ({
  w: narrow ? 220 : 236, personH: 124, groupH: 60, hGap: narrow ? 20 : 28, vGap: 48, stackGap: 12, indent: narrow ? 22 : 28,
  pad: narrow ? 14 : 28, outline: narrow,
});

interface Box { node: OrgNode; x: number; y: number; w: number; h: number }
interface Layout { boxes: Box[]; edges: { key: string; d: string }[]; width: number; height: number; byKey: Map<string, Box> }

/** 아래가 모두 끝 사람이고 이 수 이상이면 옆으로 늘어놓지 않고 세로로 쌓는다(좁은 화면은 둘 이상이면 늘) */
const STACK_MIN = 3;

function layoutOf(root: OrgNode, closed: Set<string>, d: Dims): Layout {
  const hOf = (n: OrgNode) => (n.kind === 'person' ? d.personH : d.groupH);
  const kidsOf = (n: OrgNode) => (closed.has(n.key) ? [] : n.kids);
  const stacked = (n: OrgNode) => {
    const k = kidsOf(n);
    if (d.outline) return k.length >= 2;
    return k.length >= STACK_MIN && k.every((c) => kidsOf(c).length === 0);
  };
  const sizes = new Map<string, { w: number; h: number }>();
  const size = (n: OrgNode): { w: number; h: number } => {
    const hit = sizes.get(n.key);
    if (hit) return hit;
    const kids = kidsOf(n);
    let s: { w: number; h: number };
    if (kids.length === 0) {
      s = { w: d.w, h: hOf(n) };
    } else if (stacked(n)) {
      const ks = kids.map(size);
      s = {
        w: Math.max(d.w, d.indent + Math.max(...ks.map((k) => k.w))),
        h: hOf(n) + d.vGap / 2 + ks.reduce((t, k) => t + k.h, 0) + (ks.length - 1) * d.stackGap,
      };
    } else {
      const ks = kids.map(size);
      s = {
        w: Math.max(d.w, ks.reduce((t, k) => t + k.w, 0) + (ks.length - 1) * d.hGap),
        h: hOf(n) + d.vGap + Math.max(...ks.map((k) => k.h)),
      };
    }
    sizes.set(n.key, s);
    return s;
  };

  const boxes: Box[] = [];
  const edges: { key: string; d: string }[] = [];
  const byKey = new Map<string, Box>();
  const push = (b: Box) => {
    boxes.push(b);
    byKey.set(b.node.key, b);
    return b;
  };
  /** x 는 이 노드 아래 전체가 차지하는 칸의 왼쪽 */
  const place = (n: OrgNode, x: number, y: number): Box => {
    const s = size(n);
    const h = hOf(n);
    const kids = kidsOf(n);
    if (kids.length > 0 && stacked(n)) {
      // 세로로 쌓기 - 카드 왼쪽 아래에서 내려오는 줄기에 아이(그 아래까지 한 덩이)들이 매달린다
      const box = push({ node: n, x, y, w: d.w, h });
      const tx = x + d.indent / 2;
      let cy = y + h + d.vGap / 2;
      for (const k of kids) {
        const kb = place(k, x + d.indent, cy);
        edges.push({ key: k.key, d: `M${tx},${y + h}V${kb.y + kb.h / 2}H${kb.x}` });
        cy += size(k).h + d.stackGap;
      }
      return box;
    }
    // 좁은 화면(목록형)은 모두 왼쪽에 붙인다 - 여기 오는 것은 아이가 하나뿐일 때라 곧게 내려간다
    const box = push({ node: n, x: d.outline ? x : x + (s.w - d.w) / 2, y, w: d.w, h });
    if (kids.length === 0) return box;
    const ks = kids.map(size);
    const rowW = ks.reduce((t, k) => t + k.w, 0) + (ks.length - 1) * d.hGap;
    let cx = d.outline ? x : x + (s.w - rowW) / 2;
    const kbs = kids.map((k, i) => {
      const kb = place(k, cx, y + h + d.vGap);
      cx += ks[i].w + d.hGap;
      return kb;
    });
    // 위 칸은 첫 아이와 끝 아이 카드의 가운데 위에 - 세로로 쌓은 아이(카드가 덩이 왼쪽)로 선이 꺾이지 않게
    if (!d.outline) {
      const mid = (kbs[0].x + kbs[kbs.length - 1].x + d.w) / 2;
      box.x = Math.min(x + s.w - d.w, Math.max(x, mid - d.w / 2));
    }
    const px = box.x + d.w / 2;
    const my = y + h + d.vGap / 2;
    kids.forEach((k, i) => {
      const kb = kbs[i];
      edges.push({ key: k.key, d: `M${px},${y + h}V${my}H${kb.x + kb.w / 2}V${kb.y}` });
    });
    return box;
  };
  place(root, d.pad, d.pad);
  const s = size(root);
  return { boxes, edges, width: s.w + d.pad * 2, height: s.h + d.pad * 2, byKey };
}

/* ── 글 · 그림 ───────────────────────────────────── */

const norm = (s: string) => s.normalize('NFC').toLowerCase();

function dayText(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' });
}

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Svg = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...line}>{children}</svg>
);
const IconFolder = ({ size = 16 }: { size?: number }) => (
  <Svg size={size}><path d="M2.6 5.2c0-.6.4-1 1-1h4.1l1.7 1.9h7c.6 0 1 .4 1 1v8.1c0 .6-.4 1-1 1H3.6c-.6 0-1-.4-1-1z" fill="currentColor" fillOpacity={0.14} /></Svg>
);
const IconFile = ({ size = 15 }: { size?: number }) => (
  <Svg size={size}><path d="M5.5 2.8h6l3.6 3.6v10.8h-9.6z" /><path d="M8 10h5M8 12.8h5" /></Svg>
);
const IconTask = ({ size = 15 }: { size?: number }) => (
  <Svg size={size}><rect x="3.5" y="3.5" width="13" height="13" rx="2.6" /><path d="M7 10.2l2.1 2.1L13.3 8" /></Svg>
);
const IconPen = ({ size = 16 }: { size?: number }) => (
  <Svg size={size}><path d="M4.2 15.8l.9-3.6 8.4-8.4 2.7 2.7-8.4 8.4zM11.8 5.5l2.7 2.7" /></Svg>
);
const IconOpen = ({ size = 15 }: { size?: number }) => (
  <Svg size={size}><path d="M11.5 3.5h5v5M16.5 3.5l-7.2 7.2M14.5 11.6v4.2c0 .4-.3.7-.7.7H4.2c-.4 0-.7-.3-.7-.7V6.2c0-.4.3-.7.7-.7h4.2" /></Svg>
);
const IconMinus = ({ size = 18 }: { size?: number }) => <Svg size={size}><path d="M4.5 10h11" /></Svg>;
const IconFit = ({ size = 18 }: { size?: number }) => <Svg size={size}><path d="M3 7.2V3h4.2M12.8 3H17v4.2M17 12.8V17h-4.2M7.2 17H3v-4.2" /></Svg>;

/** 하나를 고르는 알약 - aria-pressed 면 파랗게 */
const seg =
  'inline-flex h-[38px] flex-none items-center whitespace-nowrap rounded-full border border-tm-edge bg-tm-card px-3.5 text-[14px] font-bold text-tm-ink ' +
  'transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white ' +
  '[@media(pointer:coarse)]:h-11';
/** 도구 이름 알약(카드 · 칸) */
const toolChip = 'inline-flex h-[22px] flex-none items-center rounded-md px-1.5 text-[12px] font-bold leading-none';
const chipPinned = `${toolChip} bg-tm-blue text-white`;
const chipSuggested = `${toolChip} border border-tm-blue/40 bg-tm-tint text-tm-deep`;
const sectionHead = 'mb-2 flex items-center justify-between gap-2 text-[13px] font-bold text-tm-sub';

/* ── 드라이브 폴더 ───────────────────────────────── */

interface FolderView { id: string; name: string; path: string; url: string; node: DriveNode | null }

function folderView(f: OrgFolder, dtree: DriveTree | null): FolderView {
  const node = dtree?.byId.get(f.id) ?? null;
  const item: DriveItem = node?.item ?? { id: f.id, parent: null, name: f.name, mime: DRIVE_FOLDER, url: '', modified: null };
  return {
    id: f.id,
    name: node ? node.item.name : f.name || '드라이브 폴더',
    path: node ? ['팀 드라이브', ...ancestorsOf(node).map((a) => a.item.name)].join(' › ') : '',
    url: driveUrl(item),
    node,
  };
}

/** 폴더 아래 모든 단계에서 최근에 고친 파일 */
function recentFiles(n: DriveNode, limit: number): DriveNode[] {
  const out: DriveNode[] = [];
  const stack = [n];
  while (stack.length) {
    const c = stack.pop()!;
    out.push(...c.files);
    stack.push(...c.folders);
  }
  return out
    .filter((f) => f.item.modified)
    .sort((a, b) => (b.item.modified ?? '').localeCompare(a.item.modified ?? ''))
    .slice(0, limit);
}

/** 연결된 폴더 한 칸 - 이름 · 위치 · 수, 드라이브에서 열기, 최근 파일 */
function FolderCard({ f, dtree, owner }: { f: OrgFolder; dtree: DriveTree | null; owner?: string }) {
  const v = folderView(f, dtree);
  const recent = v.node ? recentFiles(v.node, 3) : [];
  return (
    <li className="rounded-tm-sm border border-tm-line bg-tm-card">
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span className="mt-0.5 text-tm-blue"><IconFolder size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-[14.5px] font-bold text-tm-ink">{v.name}</p>
          <p className="break-words text-[12.5px] leading-[1.5] text-tm-sub">
            {v.node
              ? `${v.path} · 파일 ${v.node.fileTotal.toLocaleString('ko-KR')}`
              : dtree ? '드라이브 목록에 없습니다(옮겼거나 지웠을 수 있음)' : '드라이브 폴더'}
            {owner ? ` · ${owner}` : ''}
          </p>
        </div>
        <a href={v.url} target="_blank" rel="noopener noreferrer"
          className={`${tmGhostBtn} h-[34px] px-2.5 hover:border-tm-blue hover:bg-tm-tint`}
          title="드라이브에서 폴더를 엽니다. 파일은 그 폴더에 끌어 놓아 올립니다">
          열기 <IconOpen size={14} />
        </a>
      </div>
      {recent.length > 0 && (
        <ul className="border-t border-tm-line px-1.5 py-1">
          {recent.map((r) => (
            <li key={r.item.id}>
              <a href={driveUrl(r.item)} target="_blank" rel="noopener noreferrer"
                className="flex min-h-[32px] items-center gap-2 rounded-md px-1.5 text-[13px] text-tm-ink transition-colors duration-150 hover:bg-tm-tint
                           [@media(pointer:coarse)]:min-h-11">
                <span className="text-tm-sub"><IconFile size={14} /></span>
                <span className="min-w-0 flex-1 truncate">{r.item.name}</span>
                <span className="flex-none text-[12px] tabular-nums text-tm-sub">{dayText(r.item.modified)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── 도구 ─────────────────────────────────────── */

function ToolRow({ app, pinned, why }: { app: StudioApp; pinned: boolean; why?: string[] }) {
  return (
    <li className="flex items-start gap-2.5 rounded-tm-sm border border-tm-line bg-tm-card px-3 py-2.5">
      <span className={`${pinned ? chipPinned : chipSuggested} mt-0.5 min-w-[54px] justify-center`}>{shortName(app)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-tm-ink">
          {app.name}
          {app.replaces && <span className="ml-1.5 text-[12.5px] font-semibold text-tm-sub">{app.replaces} 대신</span>}
        </p>
        <p className="text-[13px] leading-[1.55] text-tm-sub">{app.does}</p>
        {!pinned && why && why.length > 0 && (
          <p className="mt-0.5 text-[12.5px] font-semibold text-tm-deep">추천 까닭: {why.join(' · ')} 일에 맞습니다</p>
        )}
      </div>
    </li>
  );
}

/* ── 옆 칸 ─────────────────────────────────────── */

interface PanelProps {
  me: string;
  tree: ReturnType<typeof buildOrg>;
  dtree: DriveTree | null;
  openTasks: Map<string, number>;
  canEdit(id: string): boolean;
  onPick(key: string): void;
  onEdit(id: string): void;
  onTasks(id: string): void;
  onTool(id: string): void;
  onClose?: () => void;
}

function PanelHead({ title, sub, onClose, children }: { title: React.ReactNode; sub?: React.ReactNode; onClose?: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex-none border-b border-tm-line px-5 pb-4 pt-4 max-[720px]:px-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{title}</div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="자세히 닫기" title="닫기" className={`${tmIconBtnSm} -mr-1.5 -mt-1`}>
            <IconClose />
          </button>
        )}
      </div>
      {sub && <div className="mt-1.5 text-[13px] leading-[1.6] text-tm-sub">{sub}</div>}
      {children && <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

function PersonPanel({ n, p }: { n: OrgNode; p: PanelProps }) {
  const m = n.member!;
  const e = n.entry ?? blankEntry(m.id);
  const boss = e.manager ? p.tree.byKey.get(e.manager) : undefined;
  const reports = p.tree.people.filter((x) => x.entry?.manager === m.id);
  const duties = dutyLines(e.duties);
  const { pinned, suggested } = toolsOf(m, e);
  const tasks = p.openTasks.get(m.id) ?? 0;
  const editable = p.canEdit(m.id);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHead onClose={p.onClose}
        title={
          <div className="flex items-center gap-3">
            <Avatar id={m.id} size={48} />
            <div className="min-w-0">
              <h2 className="break-words text-[19px] font-extrabold leading-[1.35] text-tm-deep">
                {m.name}{m.id === p.me && <span className="ml-2 align-middle text-[12px] font-bold text-tm-blue">나</span>}
              </h2>
              <p className="text-[14px] text-tm-ink">{m.role || '직무 미정'}</p>
            </div>
          </div>
        }
        sub={
          <>
            <button type="button" onClick={() => p.onPick(e.unit.trim() ? `unit:${e.unit.trim()}` : `unit:${NO_UNIT}`)}
              className="font-semibold text-tm-deep hover:underline">{e.unit.trim() || NO_UNIT}</button>
            {boss?.member && (
              <> · 상위 <button type="button" onClick={() => p.onPick(boss.key)} className="font-semibold text-tm-deep hover:underline">{boss.member.name}</button></>
            )}
            {reports.length > 0 && <> · 아래 {reports.map((r) => r.member?.name).join(', ')}</>}
          </>
        }>
        {editable && (
          <button type="button" onClick={() => p.onEdit(m.id)} className={`${tmGhostBtn} hover:border-tm-blue hover:bg-tm-tint`}>
            <IconPen size={15} /> 고치기
          </button>
        )}
        <button type="button" onClick={() => p.onTasks(m.id)} className={`${tmGhostBtn} hover:border-tm-blue hover:bg-tm-tint`}
          title="작업 화면에서 이 사람이 맡은 작업만 봅니다">
          <IconTask /> 맡은 작업 {tasks}건
        </button>
      </PanelHead>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 max-[720px]:px-4">
        <section>
          <h3 className={sectionHead}>맡은 역할과 책임</h3>
          {duties.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {duties.map((d, i) => (
                <li key={i} className="flex gap-2 text-[14.5px] leading-[1.6] text-tm-ink">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-tm-blue" />
                  <span className="min-w-0 break-words">{d}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-tm-sub">
              아직 적지 않았습니다.{editable && <> <button type="button" onClick={() => p.onEdit(m.id)} className="font-bold text-tm-blue underline underline-offset-2">적기</button></>}
            </p>
          )}
        </section>

        <section className="mt-6">
          <h3 className={sectionHead}>
            <span>MATE Studio 도구</span>
            <span className="text-[12px] font-semibold">
              <span className={`${chipPinned} mr-1 h-[18px] px-1`}>쓰는 것</span>
              <span className={`${chipSuggested} h-[18px] px-1`}>추천</span>
            </span>
          </h3>
          <ul className="flex flex-col gap-2">
            {pinned.map((a) => <ToolRow key={a.id} app={a} pinned />)}
            {suggested.map((s) => <ToolRow key={s.app.id} app={s.app} pinned={false} why={s.why} />)}
          </ul>
          {pinned.length === 0 && (
            <p className="mt-2 text-[12.5px] leading-[1.6] text-tm-sub">직무 · 소속 · 맡은 일에 적힌 낱말로 골랐습니다. &apos;고치기&apos;에서 쓰는 도구를 직접 고르면 그것이 먼저 나옵니다.</p>
          )}
        </section>

        <section className="mt-6">
          <h3 className={sectionHead}>
            <span>담당 구글 폴더</span>
            {editable && (
              <button type="button" onClick={() => p.onEdit(m.id)} className="text-[12.5px] font-bold text-tm-blue hover:underline">폴더 연결</button>
            )}
          </h3>
          {e.folders.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {e.folders.map((f) => <FolderCard key={f.id} f={f} dtree={p.dtree} />)}
            </ul>
          ) : (
            <p className="text-[14px] text-tm-sub">연결한 폴더가 없습니다.</p>
          )}
          {e.folders.length > 0 && (
            <p className="mt-2 text-[12.5px] leading-[1.6] text-tm-sub">
              파일은 &apos;열기&apos;로 드라이브 폴더를 열고 끌어 놓아 올립니다. 열리지 않으면 브라우저의 구글 계정을 {DRIVE_ACCOUNT} 로 바꿔 보세요.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function UnitPanel({ name, p }: { name: string; p: PanelProps }) {
  const people = p.tree.people.filter((x) => (x.entry?.unit.trim() || NO_UNIT) === name);
  const folders = people.flatMap((x) => (x.entry?.folders ?? []).map((f) => ({ f, owner: x.member?.name ?? '' })));
  const tools = new Map<string, { app: StudioApp; who: string[] }>();
  for (const x of people) {
    if (!x.member || !x.entry) continue;
    const { pinned, suggested } = toolsOf(x.member, x.entry);
    for (const a of [...pinned, ...suggested.map((s) => s.app)]) {
      const t = tools.get(a.id) ?? { app: a, who: [] };
      t.who.push(x.member.name);
      tools.set(a.id, t);
    }
  }
  const toolList = [...tools.values()].sort((a, b) => b.who.length - a.who.length);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHead onClose={p.onClose}
        title={<h2 className="break-words text-[19px] font-extrabold leading-[1.35] text-tm-deep">{name}</h2>}
        sub={name === NO_UNIT ? '관리자가 고치기 창에서 소속을 정하면 그 팀 아래로 옮겨 갑니다.' : '같은 소속을 적은 팀원이 모입니다.'} />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 max-[720px]:px-4">
        <section>
          <h3 className={sectionHead}>팀원</h3>
          <ul className="flex flex-col gap-1">
            {people.map((x) => (
              <li key={x.key}>
                <button type="button" onClick={() => p.onPick(x.key)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-tm-tint
                             [@media(pointer:coarse)]:min-h-11">
                  <Avatar id={x.key} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-bold text-tm-ink">{x.label}</span>
                    <span className="block truncate text-[12.5px] text-tm-sub">{x.member?.role || '직무 미정'}</span>
                  </span>
                  <span className="flex-none text-[12px] tabular-nums text-tm-sub">작업 {p.openTasks.get(x.key) ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        {toolList.length > 0 && (
          <section className="mt-6">
            <h3 className={sectionHead}>팀이 쓰는 도구</h3>
            <ul className="flex flex-wrap gap-1.5">
              {toolList.map((t) => (
                <li key={t.app.id}>
                  <button type="button" onClick={() => p.onTool(t.app.id)} title={`${t.who.join(', ')} · 누르면 조직도에서 짚습니다`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-tm-line bg-tm-card px-3 text-[13px] font-semibold text-tm-ink
                               transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint [@media(pointer:coarse)]:h-11">
                    {shortName(t.app)} <span className="tabular-nums text-tm-sub">{t.who.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="mt-6">
          <h3 className={sectionHead}>팀원이 맡은 구글 폴더</h3>
          {folders.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {folders.map(({ f, owner }) => <FolderCard key={`${owner}:${f.id}`} f={f} dtree={p.dtree} owner={owner} />)}
            </ul>
          ) : (
            <p className="text-[14px] text-tm-sub">연결한 폴더가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function RootPanel({ p, missing }: { p: PanelProps; missing: boolean }) {
  const units = new Map<string, OrgNode[]>();
  for (const x of p.tree.people) {
    const u = x.entry?.unit.trim() || NO_UNIT;
    units.set(u, [...(units.get(u) ?? []), x]);
  }
  const unitNames = [...p.tree.units, ...(units.has(NO_UNIT) ? [NO_UNIT] : [])];
  const tools = new Map<string, { app: StudioApp; who: OrgNode[] }>();
  for (const x of p.tree.people) {
    if (!x.member || !x.entry) continue;
    const { pinned, suggested } = toolsOf(x.member, x.entry);
    for (const a of [...pinned, ...suggested.map((s) => s.app)]) {
      const t = tools.get(a.id) ?? { app: a, who: [] };
      t.who.push(x);
      tools.set(a.id, t);
    }
  }
  const toolList = [...tools.values()].sort((a, b) => b.who.length - a.who.length || a.app.name.localeCompare(b.app.name));
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHead onClose={p.onClose}
        title={<h2 className="text-[19px] font-extrabold leading-[1.35] text-tm-deep">MATE 조직도</h2>}
        sub="카드를 누르면 그 사람의 맡은 일 · 도구 · 폴더가 여기에 보입니다." />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 max-[720px]:px-4">
        {missing && (
          <p className="mb-5 rounded-tm-sm border border-tm-warn/40 bg-tm-warn-tint px-3 py-2.5 text-[13px] leading-[1.6] text-tm-warn-deep">
            조직도 표가 아직 DB 에 없어 팀원 목록과 직무만으로 그렸습니다. 소속 · 맡은 일 · 폴더는 표를 만든 뒤에 저장됩니다.
          </p>
        )}
        <section>
          <h3 className={sectionHead}>팀</h3>
          <ul className="flex flex-col gap-1">
            {unitNames.map((u) => (
              <li key={u}>
                <button type="button" onClick={() => p.onPick(`unit:${u}`)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-tm-tint
                             [@media(pointer:coarse)]:min-h-11">
                  <span className={`min-w-0 flex-1 truncate text-[14.5px] font-bold ${u === NO_UNIT ? 'text-tm-sub' : 'text-tm-ink'}`}>{u}</span>
                  <span className="flex flex-none -space-x-1.5">
                    {(units.get(u) ?? []).slice(0, 5).map((x) => (
                      <span key={x.key} className="rounded-full ring-2 ring-tm-card"><Avatar id={x.key} size={24} /></span>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-6">
          <h3 className={sectionHead}><span>도구별로 보기</span><span className="text-[12px] font-semibold">누르면 조직도에서 짚습니다</span></h3>
          <ul className="flex flex-col gap-1">
            {toolList.map((t) => (
              <li key={t.app.id}>
                <button type="button" onClick={() => p.onTool(t.app.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-tm-tint
                             [@media(pointer:coarse)]:min-h-11">
                  <span className={`${chipSuggested} min-w-[64px] justify-center`}>{shortName(t.app)}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-tm-sub">{t.app.replaces ? `${t.app.replaces} 대신` : t.app.does}</span>
                  <span className="flex flex-none -space-x-1.5">
                    {t.who.slice(0, 4).map((x) => (
                      <span key={x.key} className="rounded-full ring-2 ring-tm-card"><Avatar id={x.key} size={22} /></span>
                    ))}
                  </span>
                  {t.who.length > 4 && <span className="flex-none text-[12px] font-semibold text-tm-sub">+{t.who.length - 4}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ── 고치기 창 ─────────────────────────────────── */

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

function OrgEditor({ member, entry, members, entries, units, dtree, driveNote, canPlace, onRole, onSave, onClose }: {
  member: Member;
  entry: OrgEntry;
  members: Member[];
  entries: Map<string, OrgEntry>;
  units: string[];
  dtree: DriveTree | null;
  /** 드라이브 목록을 못 쓸 때의 안내 - 그때는 주소로만 넣는다 */
  driveNote: string | null;
  canPlace: boolean;
  onRole?: (role: string) => Promise<string | null>;
  onSave(patch: OrgPatch): Promise<string | null>;
  onClose(): void;
}) {
  const [role, setRole] = useState(member.role);
  const [unit, setUnit] = useState(entry.unit);
  const [manager, setManager] = useState(entry.manager ?? '');
  const [duties, setDuties] = useState(entry.duties);
  const [tools, setTools] = useState<string[]>(entry.tools);
  const [folders, setFolders] = useState<OrgFolder[]>(entry.folders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [find, setFind] = useState('');
  const [paste, setPaste] = useState('');
  const [pasteError, setPasteError] = useState('');

  const under = useMemo(() => reportsUnder(member.id, members, entries), [member.id, members, entries]);
  const bosses = members.filter((m) => m.id !== member.id && !under.has(m.id));
  const live = useMemo(() => recommend([role, unit, duties].filter(Boolean).join('\n')), [role, unit, duties]);
  const liveIds = new Set(live.map((s) => s.app.id));

  const q = norm(find.trim());
  const found = useMemo(() => {
    if (!dtree || !q) return [];
    return dtree.all
      .filter((n) => n.item.mime === DRIVE_FOLDER && norm(n.item.name).includes(q))
      .sort((a, b) => a.depth - b.depth || a.item.name.localeCompare(b.item.name, 'ko', { numeric: true }))
      .slice(0, 30);
  }, [dtree, q]);

  const addFolder = (f: OrgFolder) => {
    setFolders((list) => (list.some((x) => x.id === f.id) || list.length >= FOLDERS_MAX ? list : [...list, f]));
  };
  const addPasted = () => {
    const id = folderIdFrom(paste);
    if (!id) {
      setPasteError('드라이브 폴더 주소(…/folders/…)나 폴더 id 를 넣어 주세요.');
      return;
    }
    const node = dtree?.byId.get(id);
    if (node && node.item.mime !== DRIVE_FOLDER) {
      setPasteError('폴더가 아니라 파일 주소입니다. 파일이 든 폴더를 넣어 주세요.');
      return;
    }
    addFolder({ id, name: node?.item.name ?? '드라이브 폴더' });
    setPaste('');
    setPasteError('');
  };
  const toggleTool = (id: string) => setTools((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const save = async () => {
    setBusy(true);
    setError('');
    const patch: OrgPatch = {};
    if (duties !== entry.duties) patch.duties = duties;
    if (!sameList(tools, entry.tools)) patch.tools = tools;
    if (!sameList(folders.map((f) => f.id), entry.folders.map((f) => f.id))) patch.folders = folders;
    if (canPlace) {
      if (unit.trim() !== entry.unit) patch.unit = unit.trim();
      if ((manager || null) !== entry.manager) patch.manager = manager || null;
    }
    let err: string | null = null;
    if (onRole && role.trim() !== member.role) err = await onRole(role.trim());
    if (!err && Object.keys(patch).length > 0) err = await onSave(patch);
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <Modal title={`${member.name} 조직도 고치기`} sub="소속 · 상위는 관리자만, 나머지는 본인과 관리자가 고칩니다." size="lg" busy={busy} onClose={onClose}
      foot={
        <>
          {error && <p role="alert" className="mr-auto max-w-[60ch] text-[14px] font-semibold text-tm-red-deep">{error}</p>}
          <button type="button" onClick={onClose} disabled={busy} className={`${tmBtn} ${error ? '' : 'ml-auto'}`}>닫기</button>
          <button type="button" onClick={() => void save()} disabled={busy} className={tmBtnPrimary}>{busy ? '저장 중…' : '저장'}</button>
        </>
      }>
      <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
        <div>
          <label htmlFor="org-role" className={tmLabel}>직무</label>
          <input id="org-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={40} disabled={!onRole}
            placeholder="예: 클라이언트 개발" className={`${tmInput} disabled:bg-tm-bg disabled:text-tm-sub`} />
          {!onRole && <p className="mt-1 text-[12.5px] text-tm-sub">직무는 팀원 창에서 고칩니다.</p>}
        </div>
        <div>
          <label htmlFor="org-unit" className={tmLabel}>소속(팀 · 파트)</label>
          <input id="org-unit" list="org-units" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={UNIT_MAX} disabled={!canPlace}
            placeholder="예: 개발팀" className={`${tmInput} disabled:bg-tm-bg disabled:text-tm-sub`} />
          <datalist id="org-units">{units.map((u) => <option key={u} value={u} />)}</datalist>
        </div>
        <div>
          <label htmlFor="org-boss" className={tmLabel}>상위(보고 대상)</label>
          <select id="org-boss" value={manager} onChange={(e) => setManager(e.target.value)} disabled={!canPlace}
            className={`${tmSelect} w-full disabled:bg-tm-bg disabled:text-tm-sub`}>
            <option value="">없음(맨 위)</option>
            {bosses.map((m) => <option key={m.id} value={m.id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>)}
          </select>
        </div>
      </div>
      {!canPlace && <p className="mt-1.5 text-[12.5px] text-tm-sub">소속 · 상위는 관리자에게 부탁해 주세요.</p>}

      <div className="mt-5">
        <label htmlFor="org-duties" className={tmLabel}>맡은 역할과 책임 <span className="font-semibold text-tm-sub">(한 줄에 하나)</span></label>
        <textarea id="org-duties" value={duties} onChange={(e) => setDuties(e.target.value)} rows={5} maxLength={DUTIES_MAX}
          placeholder={'예:\n유니티 클라이언트 개발 · 빌드 관리\n아트 리소스 받아 엔진에 넣기'} className={tmTextarea} />
      </div>

      <fieldset className="mt-5">
        <legend className={`${tmLabel} flex w-full flex-wrap items-center justify-between gap-2`}>
          <span>MATE Studio 도구 <span className="font-semibold text-tm-sub">(고른 것이 카드 앞에 나옵니다)</span></span>
          <span className="flex gap-1.5">
            <button type="button" onClick={() => setTools(live.map((s) => s.app.id))} className={`${tmGhostBtn} h-[32px] px-2.5`}>추천대로 고르기</button>
            {tools.length > 0 && <button type="button" onClick={() => setTools([])} className={`${tmGhostBtn} h-[32px] px-2.5`}>모두 풀기</button>}
          </span>
        </legend>
        <div className="flex flex-col gap-3">
          {STUDIO_GROUPS.map((g) => (
            <div key={g.id}>
              <p className="mb-1.5 text-[12.5px] font-bold text-tm-sub">{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {STUDIO_APPS.filter((a) => a.group === g.id).map((a) => (
                  <button key={a.id} type="button" aria-pressed={tools.includes(a.id)} onClick={() => toggleTool(a.id)}
                    title={`${a.name}${a.replaces ? ` · ${a.replaces} 대신` : ''}\n${a.does}`}
                    className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-tm-edge bg-tm-card px-3 text-[13.5px] font-semibold text-tm-ink
                               transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint aria-pressed:border-tm-blue aria-pressed:bg-tm-blue
                               aria-pressed:text-white [@media(pointer:coarse)]:h-11">
                    {shortName(a)}
                    {liveIds.has(a.id) && <span className="text-[11px] font-bold opacity-80">추천</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={tmLabel}>담당 구글 폴더 <span className="font-semibold text-tm-sub">(맡아서 관리하고 파일을 올리는 곳)</span></legend>
        {folders.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-1.5">
            {folders.map((f) => {
              const v = folderView(f, dtree);
              return (
                <li key={f.id} className="flex items-center gap-2 rounded-tm-sm border border-tm-line bg-tm-card py-1.5 pl-3 pr-1.5">
                  <span className="text-tm-blue"><IconFolder /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-tm-ink">{v.name}</span>
                    {v.path && <span className="block truncate text-[12px] text-tm-sub">{v.path}</span>}
                  </span>
                  <button type="button" onClick={() => setFolders((l) => l.filter((x) => x.id !== f.id))}
                    aria-label={`${v.name} 연결 풀기`} title="연결 풀기(드라이브의 폴더는 그대로)" className={tmIconBtnSm}>
                    <IconClose size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mb-3 text-[14px] text-tm-sub">아직 연결한 폴더가 없습니다.</p>
        )}
        {dtree ? (
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-[23px] -translate-y-1/2 text-tm-sub"><IconSearch size={17} /></span>
            <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="팀 드라이브에서 폴더 이름 찾기" aria-label="드라이브 폴더 찾기"
              className={`${tmInput} pl-10`} />
            {q && (
              <ul className="mt-1.5 max-h-[240px] overflow-y-auto rounded-tm-sm border border-tm-line bg-tm-card py-1">
                {found.length === 0 && <li className="px-3 py-2 text-[13.5px] text-tm-sub">찾은 폴더가 없습니다</li>}
                {found.map((n) => {
                  const linked = folders.some((f) => f.id === n.item.id);
                  return (
                    <li key={n.item.id}>
                      <button type="button" disabled={linked} onClick={() => addFolder({ id: n.item.id, name: n.item.name })}
                        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-150 enabled:hover:bg-tm-tint
                                   disabled:opacity-50 [@media(pointer:coarse)]:min-h-11">
                        <span className="text-tm-blue"><IconFolder /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold text-tm-ink">{n.item.name}</span>
                          <span className="block truncate text-[12px] text-tm-sub">
                            {['팀 드라이브', ...ancestorsOf(n).map((a) => a.item.name)].join(' › ')} · 파일 {n.fileTotal.toLocaleString('ko-KR')}
                          </span>
                        </span>
                        <span className="flex-none text-[12.5px] font-bold text-tm-blue">{linked ? '연결됨' : '연결'}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : driveNote && (
          <p className="text-[13px] leading-[1.6] text-tm-sub">{driveNote}</p>
        )}
        <div className="mt-2.5 flex gap-2 max-[720px]:flex-col">
          <input value={paste} onChange={(e) => { setPaste(e.target.value); setPasteError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addPasted(); } }}
            placeholder="또는 드라이브 폴더 주소 붙여 넣기" aria-label="드라이브 폴더 주소" aria-invalid={pasteError ? true : undefined}
            className={`${tmFieldBase} h-11 min-w-0 flex-1 px-3.5 text-[15px]`} />
          <button type="button" onClick={addPasted} className={tmGhostBtn}><IconPlus size={16} /> 주소로 연결</button>
        </div>
        {pasteError && <p role="alert" className="mt-1.5 text-[13px] font-semibold text-tm-red-deep">{pasteError}</p>}
      </fieldset>
    </Modal>
  );
}

/* ── 화면 ─────────────────────────────────────── */

export default function Org({ me, admin, tasks, onRole, onTasks, onNotice }: {
  me: string;
  /** 관리자(브라우저 저장 모드는 누구나) - 모든 사람의 조직도와 소속 · 상위를 고친다 */
  admin: boolean;
  tasks: Task[];
  /** 직무(tm_members.role) 고치기 - 로그인한 모드에서만 */
  onRole?: (id: string, role: string) => Promise<string | null>;
  /** 작업 화면에서 그 사람의 작업만 */
  onTasks(id: string): void;
  onNotice(text: string, tone?: 'ok' | 'err'): void;
}) {
  const all = useMembers();
  const members = useMemo(() => all.filter((m) => m.active !== false), [all]);
  const store: OrgStore = useOrgStore();

  /* 구글 드라이브 목록 - 폴더 이름 · 위치 · 최근 파일, 폴더 고르기에 쓴다 */
  const [drive, setDrive] = useState<DriveLoad | null>(null);
  useEffect(() => {
    let on = true;
    loadDrive()
      .then((l) => { if (on) setDrive(l); })
      .catch((e: unknown) => { if (on) setDrive({ kind: 'error', message: e instanceof Error ? e.message : '' }); });
    return () => { on = false; };
  }, []);
  const dtree = useMemo(() => (drive?.kind === 'ok' ? buildDriveTree(drive.snapshot) : null), [drive]);
  const driveNote = drive === null ? '드라이브 목록을 읽는 중입니다. 주소로는 지금 넣을 수 있습니다.'
    : drive.kind === 'local' ? '이 Hub 는 팀 서버에 연결되지 않아 드라이브 목록이 없습니다. 드라이브 폴더 주소로 넣어 주세요.'
      : drive.kind === 'ok' ? null : '드라이브 목록을 쓸 수 없어 주소로만 넣습니다.';

  const [prefs, setPrefs] = useState<Prefs>(() => readPrefs(me));
  const view = prefs.view;
  const savePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      writePrefs(me, next);
      return next;
    });
  }, [me]);

  const tree = useMemo(() => buildOrg(members, store.entries, view), [members, store.entries, view]);
  const openTasks = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tasks) if (t.assignee && t.status !== 'done') m.set(t.assignee, (m.get(t.assignee) ?? 0) + 1);
    return m;
  }, [tasks]);

  const canEdit = useCallback((id: string) => !isRemote || admin || id === me, [admin, me]);
  const [editing, setEditing] = useState<string | null>(null);
  const editMember = editing ? members.find((m) => m.id === editing) ?? null : null;

  return (
    <>
      <PageHead
        title="조직도"
        lead="팀원의 소속과 맡은 일, 쓰면 좋은 MATE Studio 도구, 담당 구글 폴더를 한 장에 봅니다. 카드를 누르면 옆에 자세히 보이고, 본인과 관리자는 '고치기'로 바꿉니다."
        saved={store.status === 'missing' ? { tone: 'warn', text: '조직도 표 설정 전 · 보기만' }
          : store.status === 'error' ? { tone: 'warn', text: '조직도를 읽지 못했습니다' } : undefined}
      >
        {members.some((m) => m.id === me) && (
          <button type="button" onClick={() => setEditing(me)} className={`${tmGhostBtn} hover:border-tm-blue hover:bg-tm-tint`}>
            <IconPen size={15} /> 내 카드 고치기
          </button>
        )}
      </PageHead>

      {store.status === 'loading' ? (
        <div className="tm-fill flex min-h-0 flex-1 items-center justify-center rounded-tm border border-tm-line bg-tm-card shadow-tm">
          <p className="text-[15px] font-semibold text-tm-sub">조직도를 읽는 중…</p>
        </div>
      ) : (
        <OrgMap tree={tree} me={me} view={view} prefs={prefs} savePrefs={savePrefs} dtree={dtree} openTasks={openTasks}
          missing={store.status === 'missing'} canEdit={canEdit} onEdit={setEditing} onTasks={onTasks} />
      )}

      {editMember && (
        <OrgEditor
          member={editMember}
          entry={store.entries.get(editMember.id) ?? blankEntry(editMember.id)}
          members={members}
          entries={store.entries}
          units={tree.units}
          dtree={dtree}
          driveNote={driveNote}
          canPlace={!isRemote || admin}
          onRole={onRole && (admin || editMember.id === me) ? (role) => onRole(editMember.id, role) : undefined}
          onSave={async (patch) => {
            const err = await store.save(editMember.id, patch);
            if (!err) onNotice(`${editMember.name} 조직도를 저장했습니다`, 'ok');
            return err;
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function OrgMap({ tree, me, view, prefs, savePrefs, dtree, openTasks, missing, canEdit, onEdit, onTasks }: {
  tree: ReturnType<typeof buildOrg>;
  me: string;
  view: OrgView;
  prefs: Prefs;
  savePrefs(patch: Partial<Prefs>): void;
  dtree: DriveTree | null;
  openTasks: Map<string, number>;
  missing: boolean;
  canEdit(id: string): boolean;
  onEdit(id: string): void;
  onTasks(id: string): void;
}) {
  const narrow = useMediaQuery('(max-width: 720px)');
  const wide = useMediaQuery('(min-width: 1180px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const d = useMemo(() => dimsOf(narrow), [narrow]);

  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  /* 마인드맵 모양 - 엔진의 크기 단추 · 지금 크기, 사람마다 붙일 가지 */
  const shape = prefs.shape;
  const mind = shape === 'mind';
  const details = prefs.details;
  const mindApi = useRef<CanvasApi | null>(null);
  const [mindZoom, setMindZoom] = useState(1);
  const layout = useMemo(() => layoutOf(tree.root, closed, d), [tree, closed, d]);

  const [selected, setSelected] = useState('root');
  const [sheet, setSheet] = useState(false);

  /* ── 찾기 · 도구로 짚기 ── */
  const [query, setQuery] = useState('');
  const [tool, setTool] = useState('');
  const q = norm(query.trim());
  const hits = useMemo(() => {
    if (!q && !tool) return null;
    const out = new Set<string>();
    for (const n of tree.people) {
      const m = n.member!;
      const e = n.entry ?? blankEntry(m.id);
      const { pinned, suggested } = toolsOf(m, e);
      const apps = [...pinned, ...suggested.map((s) => s.app)];
      if (tool && !apps.some((a) => a.id === tool)) continue;
      if (q) {
        const text = norm([m.name, m.role, e.unit, e.duties, ...apps.map((a) => a.name)].join('\n'));
        if (!text.includes(q)) continue;
      }
      out.add(n.key);
    }
    return out;
  }, [tree, q, tool]);

  /* ── 크기 · 스크롤 (드라이브 트리와 같다) ── */
  const scroller = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(prefs.zoom ?? 1);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const after = useRef<{ kind: 'center'; key: string; smooth: boolean } | { kind: 'scroll'; left: number; top: number } | { kind: 'fit' } | null>(
    prefs.zoom === null ? { kind: 'fit' } : { kind: 'center', key: 'root', smooth: false });
  const [tick, setTick] = useState(0);
  const request = (a: NonNullable<typeof after.current>) => {
    after.current = a;
    setTick((t) => t + 1);
  };

  const fitZoom = useCallback(() => {
    const el = scroller.current;
    if (!el) return 1;
    return clampZoom(Math.min(1, (el.clientWidth - 8) / layout.width));
  }, [layout.width]);

  useLayoutEffect(() => {
    const a = after.current;
    const el = scroller.current;
    if (!a || !el) return;
    if (a.kind === 'fit') {
      const z = fitZoom();
      after.current = { kind: 'center', key: 'root', smooth: false };
      if (z !== zoomRef.current) {
        setZoom(z);
        return;
      }
    }
    const b = after.current;
    after.current = null;
    if (!b || b.kind === 'fit') return;
    if (b.kind === 'scroll') {
      el.scrollLeft = b.left;
      el.scrollTop = b.top;
      return;
    }
    const box = layout.byKey.get(b.key);
    if (!box) return;
    const left = Math.max(0, (box.x + box.w / 2) * zoom - el.clientWidth / 2);
    const top = b.key === 'root' ? 0 : Math.max(0, (box.y + box.h / 2) * zoom - el.clientHeight * (sheet && !wide ? 0.2 : 0.4));
    el.scrollTo({ left, top, behavior: b.smooth && !reduced ? 'smooth' : 'auto' });
  }, [layout, zoom, tick, fitZoom, reduced, sheet, wide, shape]);

  const zoomTo = useCallback((z: number, at?: { x: number; y: number }) => {
    const el = scroller.current;
    const cur = zoomRef.current;
    const next = clampZoom(z);
    if (!el || next === cur) return;
    const ax = at?.x ?? el.clientWidth / 2;
    const ay = at?.y ?? el.clientHeight / 2;
    after.current = { kind: 'scroll', left: ((el.scrollLeft + ax) / cur) * next - ax, top: ((el.scrollTop + ay) / cur) * next - ay };
    setZoom(next);
    savePrefs({ zoom: next });
  }, [savePrefs]);

  const fit = () => {
    const z = fitZoom();
    after.current = { kind: 'center', key: 'root', smooth: false };
    setZoom(z);
    setTick((t) => t + 1);
    savePrefs({ zoom: z });
  };

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
  }, [zoomTo, shape]);

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

  /* ── 고르기 ── */
  const pick = (key: string, center = false) => {
    setSelected(key);
    if (!wide) {
      setSheet(true);
      // 휴대폰은 쪽 머리째 스크롤한다 - 칸이 잘리지 않게 카드를 화면 위로
      const card = cardRef.current;
      const page = card?.closest<HTMLElement>('.tm-page');
      if (card && page && page.scrollHeight > page.clientHeight + 1) {
        const gap = card.getBoundingClientRect().top - page.getBoundingClientRect().top;
        if (gap > 8) page.scrollBy({ top: gap, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    if (center || !wide) {
      // 접힌 곳 안에 있으면 위를 편다
      const n = tree.byKey.get(key);
      const ups: string[] = [];
      for (let p = n?.parent; p; p = p.parent) if (closed.has(p.key)) ups.push(p.key);
      if (ups.length) setClosed((s) => { const x = new Set(s); ups.forEach((u) => x.delete(u)); return x; });
      request({ kind: 'center', key, smooth: true });
    }
  };
  const toggle = (key: string) => setClosed((s) => {
    const x = new Set(s);
    if (x.has(key)) x.delete(key);
    else x.add(key);
    return x;
  });
  const setView = (v: OrgView) => {
    if (v === view) return;
    setClosed(new Set());
    savePrefs({ view: v });
    request({ kind: 'center', key: 'root', smooth: false });
  };
  /** 트리 ↔ 마인드맵 - 트리로 돌아오면 맨 위를 화면에 둔다 */
  const setShape = (next: Shape) => {
    if (next === shape) return;
    savePrefs({ shape: next });
    if (next === 'tree') request({ kind: 'center', key: 'root', smooth: false });
  };
  const pickTool = (id: string) => {
    setTool(id);
    if (!wide) setSheet(false);
  };

  const panelProps: PanelProps = {
    me, tree, dtree, openTasks, canEdit,
    onPick: (k) => pick(k, true), onEdit, onTasks, onTool: pickTool,
  };
  const selNode = tree.byKey.get(selected);
  const unitName = selected.startsWith('unit:') ? selected.slice(5) : null;
  const panel = (onClose?: () => void) => {
    const p = { ...panelProps, onClose };
    if (selNode?.kind === 'person') return <PersonPanel key={selNode.key} n={selNode} p={p} />;
    if (unitName !== null && tree.people.some((x) => (x.entry?.unit.trim() || NO_UNIT) === unitName)) {
      return <UnitPanel key={unitName} name={unitName} p={p} />;
    }
    return <RootPanel p={p} missing={missing} />;
  };

  const hitCount = hits?.size ?? 0;
  const brokenNames = tree.broken.map((id) => tree.byKey.get(id)?.label).filter(Boolean);

  return (
    <div ref={cardRef} className="tm-fill flex min-h-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-tm-card shadow-tm">
      {/* ── 막대: 찾기 · 도구 · 보기 · 크기 ── */}
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-tm-line px-4 py-3 max-[720px]:px-3">
        <div className="relative min-w-0 max-w-[300px] flex-[1_1_200px] max-[720px]:max-w-none">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={17} /></span>
          <input type="text" inputMode="search" enterKeyHint="search" autoComplete="off" value={query}
            onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
            placeholder="이름 · 직무 · 맡은 일 찾기" aria-label="조직도 검색"
            className={`${tmFieldBase} h-[38px] w-full pl-9 pr-9 text-[15px] [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:text-[16px]`} />
          {query && (
            <button type="button" aria-label="검색어 지우기" onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-tm-sub transition-colors duration-150
                         hover:bg-tm-tint hover:text-tm-blue [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10">
              <IconClose size={16} />
            </button>
          )}
        </div>
        <select value={tool} onChange={(e) => setTool(e.target.value)} aria-label="도구로 짚기"
          className={`${tmFieldBase} h-[38px] max-w-[220px] cursor-pointer pl-3 pr-2 text-[14.5px] font-semibold [@media(pointer:coarse)]:h-11`}>
          <option value="">모든 도구</option>
          {STUDIO_GROUPS.map((g) => (
            <optgroup key={g.id} label={g.label}>
              {STUDIO_APPS.filter((a) => a.group === g.id).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </optgroup>
          ))}
        </select>
        {hits && (
          <p className="text-[13px] font-semibold text-tm-sub" aria-live="polite">
            {hitCount === 0 ? '맞는 사람이 없습니다' : `${hitCount}명 짚음`}
            {tool && <button type="button" onClick={() => setTool('')} className="ml-2 font-bold text-tm-blue hover:underline">도구 풀기</button>}
          </p>
        )}

        <div role="group" aria-label="모양" className="flex items-center gap-1">
          <button type="button" aria-pressed={shape === 'tree'} onClick={() => setShape('tree')} className={`${seg} gap-1.5 pl-3`}
            title="위에서 아래로 뻗는 조직도 - 카드에 도구 · 폴더 · 작업 수까지"><IconNav name="org" size={16} />트리</button>
          <button type="button" aria-pressed={shape === 'mind'} onClick={() => setShape('mind')} className={`${seg} gap-1.5 pl-3`}
            title="팀 위키 마인드맵처럼 가운데에서 가지로 - 사람마다 맡은 일 · 도구 · 폴더 가지"><IconNav name="mindmap" size={16} />마인드맵</button>
        </div>

        <div role="group" aria-label="보기" className="flex items-center gap-1">
          <button type="button" aria-pressed={view === 'team'} onClick={() => setView('team')} className={seg}
            title="회사 → 팀 → 사람. 같은 팀 안에서는 상위 아래에 둡니다">팀별</button>
          <button type="button" aria-pressed={view === 'report'} onClick={() => setView('report')} className={seg}
            title="회사 → 상위 → 아래 사람. 팀이 달라도 보고 대상 아래에 둡니다">보고 체계</button>
        </div>

        {mind && (
          <div role="group" aria-label="사람 가지" className="flex items-center gap-1">
            {DETAIL_TOGGLES.map((t) => (
              <button key={t.id} type="button" aria-pressed={details[t.id]} title={t.hint} className={seg}
                onClick={() => savePrefs({ details: { ...details, [t.id]: !details[t.id] } })}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div role="group" aria-label="크기" className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => (mind ? mindApi.current?.zoomOut() : zoomTo(zoom - 0.1))} disabled={!mind && zoom <= ZOOM_MIN}
            aria-label="작게 보기" title={mind ? '작게 (-)' : '작게 (Ctrl+휠)'} className={tmIconBtn}>
            <IconMinus />
          </button>
          <button type="button" onClick={() => (mind ? mindApi.current?.fit() : zoomTo(1))} title={mind ? '화면에 맞추기' : '원래 크기로'}
            className="h-[38px] min-w-[54px] rounded-tm-sm px-1 text-[13.5px] font-bold tabular-nums text-tm-ink transition-colors duration-150 hover:bg-tm-tint
                       [@media(pointer:coarse)]:h-11">
            {Math.round((mind ? mindZoom : zoom) * 100)}%
          </button>
          <button type="button" onClick={() => (mind ? mindApi.current?.zoomIn() : zoomTo(zoom + 0.1))} disabled={!mind && zoom >= ZOOM_MAX}
            aria-label="크게 보기" title={mind ? '크게 (+)' : '크게 (Ctrl+휠)'} className={tmIconBtn}>
            <IconPlus />
          </button>
          <button type="button" onClick={() => (mind ? mindApi.current?.fit() : fit())} aria-label="화면에 맞추기"
            title={mind ? '마인드맵 전체가 보이게 맞춥니다' : '조직도 전체를 화면 너비에 맞춥니다'} className={tmIconBtn}>
            <IconFit />
          </button>
        </div>
      </div>

      {/* ── 판 + 옆 칸 ── */}
      <div className="relative flex min-h-0 flex-1">
        {mind ? (
          <div className="relative min-h-0 min-w-0 flex-1 bg-tm-bg">
            <OrgMind tree={tree} view={view} me={me} dtree={dtree} openTasks={openTasks} hits={hits} selected={selected}
              details={details} narrow={narrow} onPick={(k) => pick(k)} api={mindApi} onZoom={setMindZoom} />
          </div>
        ) : (
        <div ref={scroller} role="region" aria-label="조직도" tabIndex={0} onPointerDown={onPointerDown}
          className={`relative min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-tm-bg outline-none
                      focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tm-blue ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}>
          <div className="relative" style={{ width: layout.width * zoom, height: layout.height * zoom + (sheet && !wide ? 360 : 0) }}>
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})` }}>
              <svg className="pointer-events-none absolute left-0 top-0" width={layout.width} height={layout.height} aria-hidden>
                <g fill="none" stroke="#7f8b9e" strokeOpacity={0.6} strokeWidth={1.5}>
                  {layout.edges.map((e) => <path key={e.key} d={e.d} />)}
                </g>
              </svg>
              {layout.boxes.map((b) => (
                <NodeCard key={b.node.key} b={b} me={me} view={view} openTasks={openTasks}
                  selected={selected === b.node.key} dim={hits !== null && b.node.kind === 'person' && !hits.has(b.node.key)}
                  hit={hits !== null && hits.has(b.node.key)} closed={closed.has(b.node.key)}
                  onPick={() => pick(b.node.key)} onToggle={() => toggle(b.node.key)} />
              ))}
            </div>
          </div>
        </div>
        )}
        {wide ? (
          <aside aria-label="자세히" className="flex w-[400px] flex-none flex-col border-l border-tm-line bg-tm-card min-[1600px]:w-[440px]">
            {panel()}
          </aside>
        ) : sheet && (
          <aside aria-label="자세히" onKeyDown={(e) => { if (e.key === 'Escape') setSheet(false); }}
            className="absolute inset-x-0 bottom-0 z-20 flex h-[62%] flex-col overflow-hidden rounded-t-[18px] border-t border-tm-line bg-tm-card
                       shadow-tm-pop animate-tm-rise max-[720px]:h-[80%]">
            {panel(() => setSheet(false))}
          </aside>
        )}
      </div>

      {/* ── 아래 줄 ── */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-tm-line px-4 py-2.5 text-[13px] leading-[1.6]
                      text-tm-sub max-[720px]:px-3">
        <span>
          <span className={`${chipPinned} mr-1 h-[18px] px-1`}>Photo</span> 직접 고른 도구
          <span className={`${chipSuggested} ml-3 mr-1 h-[18px] px-1`}>Photo</span> 직무로 추천한 도구
        </span>
        {brokenNames.length > 0 ? (
          <span className="font-semibold text-tm-red-deep">상위가 서로 이어져 돌고 돌아 맨 위에 둔 사람: {brokenNames.join(', ')}</span>
        ) : (
          <span className="max-[720px]:hidden">
            {mind ? '노드를 누르면 자세히 · 빈 곳을 끌어 옮기고, 가지 끝 동그라미로 접고 펼칩니다'
              : '카드를 누르면 자세히 · 빈 곳을 끌어 옮기고 Ctrl+휠로 크기를 바꿉니다'}
          </span>
        )}
      </div>
    </div>
  );
}

/** 카드 아래 줄의 도구 알약 폭(어림, 캡처로 잼) - 12px 굵은 글자: 한글 10.5 · 영문 대문자 7.5 · 숫자 7 · 그 밖 6, 안쪽 여백 12 · 사이 4 */
const chipWidth = (label: string) =>
  [...label].reduce((t, c) => t + (/[가-힣]/.test(c) ? 10.5 : /[A-Z]/.test(c) ? 7.5 : /[0-9]/.test(c) ? 7 : 6), 0) + 16;

/** 판 위의 칸 하나 - 회사 · 팀 · 사람 */
function NodeCard({ b, me, view, openTasks, selected, dim, hit, closed, onPick, onToggle }: {
  b: Box;
  me: string;
  view: OrgView;
  openTasks: Map<string, number>;
  selected: boolean;
  dim: boolean;
  hit: boolean;
  closed: boolean;
  onPick(): void;
  onToggle(): void;
}) {
  const n = b.node;
  const ring = selected ? 'ring-2 ring-tm-blue ring-offset-2 ring-offset-tm-bg' : '';
  const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tm-blue';
  const style = { left: b.x, top: b.y, width: b.w, height: b.h };
  const folds = n.kind !== 'root' && n.kids.length > 0;
  const toggleBtn = folds && (
    <button type="button" onClick={onToggle} aria-expanded={!closed}
      aria-label={closed ? `${n.label} 아래 펼치기, ${n.below}명` : `${n.label} 아래 접기`} title={closed ? `펼치기 (아래 ${n.below}명)` : '접기'}
      className="absolute left-1/2 top-full z-[1] grid h-6 min-w-[24px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border
                 border-tm-edge bg-tm-card px-1.5 text-[11.5px] font-bold tabular-nums text-tm-sub transition-colors duration-150
                 hover:border-tm-blue hover:text-tm-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-tm-blue [@media(pointer:coarse)]:h-8 [@media(pointer:coarse)]:min-w-[32px]">
      {closed ? n.below : <IconMinus size={12} />}
    </button>
  );

  if (n.kind === 'root') {
    return (
      <div className="absolute" style={style}>
        <button type="button" onClick={onPick} aria-current={selected ? 'true' : undefined} aria-label="MATE 조직도 전체 보기"
          className={`flex h-full w-full flex-col items-center justify-center rounded-tm-sm border border-tm-blue bg-tm-blue text-white transition-colors
                      duration-150 hover:bg-tm-blue-hover ${focus} ${ring}`}>
          <span className="text-[17px] font-extrabold tracking-[0.02em]">{n.label}</span>
          <span className="text-[12px] font-semibold text-white/80">조직도</span>
        </button>
      </div>
    );
  }

  if (n.kind === 'unit') {
    const people = n.kids.filter((k) => k.kind === 'person');
    const none = n.label === NO_UNIT;
    return (
      <div className={`absolute transition-opacity duration-150 ${dim ? 'opacity-40' : ''}`} style={style}>
        <button type="button" onClick={onPick} aria-current={selected ? 'true' : undefined}
          aria-label={`${n.label}, 팀원 ${n.below}명, 누르면 옆에 자세히`}
          className={`flex h-full w-full items-center gap-2 rounded-tm-sm border px-3 text-left transition-colors duration-150 ${focus} ${ring} ${
            none ? 'border-dashed border-tm-edge bg-tm-card text-tm-sub hover:border-tm-blue hover:bg-tm-tint'
              : 'border-tm-blue/50 bg-tm-card text-tm-deep hover:border-tm-blue hover:bg-tm-tint'}`}>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-extrabold">{n.label}</span>
            <span className="block text-[12px] font-semibold text-tm-sub">{n.below}명</span>
          </span>
          <span className="flex flex-none -space-x-1.5" aria-hidden>
            {people.slice(0, 4).map((k) => (
              <span key={k.key} className="rounded-full ring-2 ring-tm-card"><Avatar id={k.key} size={24} /></span>
            ))}
          </span>
        </button>
        {toggleBtn}
      </div>
    );
  }

  const m = n.member!;
  const e = n.entry ?? blankEntry(m.id);
  const first = dutyLines(e.duties)[0];
  const { pinned, suggested } = toolsOf(m, e);
  const chips = [...pinned.map((a) => ({ a, pinned: true })), ...suggested.map((s: Suggestion) => ({ a: s.app, pinned: false }))];
  const tasks = openTasks.get(m.id) ?? 0;
  /* 카드 폭 안에 들어가는 만큼만 - 폴더 · 작업 수 자리와 '+N' 자리를 먼저 뺀다 */
  const iconW = [e.folders.length, tasks].filter((x) => x > 0).map((x) => (x > 9 ? 31 : 24));
  // 26 = 안쪽 여백 · 테두리, 4 = 어림의 여유
  const room = b.w - 30 - (iconW.length ? iconW.reduce((t, w) => t + w, 0) + (iconW.length - 1) * 8 + 8 : 0);
  let used = 0;
  let fit = 0;
  for (const c of chips.slice(0, 3)) {
    const w = chipWidth(shortName(c.a));
    const reserve = fit + 1 < chips.length ? 22 : 0;
    if (used + w + reserve > room) break;
    used += w;
    fit += 1;
  }
  const shown = chips.slice(0, Math.max(1, fit));
  return (
    <div className={`absolute transition-opacity duration-150 ${dim ? 'opacity-40' : ''}`} style={style}>
      <button type="button" onClick={onPick} aria-current={selected ? 'true' : undefined}
        aria-label={`${m.name}, ${m.role || '직무 미정'}${e.unit ? `, ${e.unit}` : ''}, 누르면 옆에 자세히`}
        className={`flex h-full w-full flex-col gap-2 rounded-tm-sm border bg-tm-card px-3 py-3 text-left transition-colors duration-150 hover:border-tm-blue
                    ${hit ? 'border-tm-blue bg-tm-tint' : 'border-tm-line'} ${focus} ${ring}`}>
        <span className="flex w-full items-center gap-2.5">
          <Avatar id={m.id} size={38} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-extrabold text-tm-ink">{m.name}</span>
              {m.id === me && <span className="flex-none rounded-full bg-tm-tint px-1.5 text-[11px] font-bold text-tm-blue">나</span>}
            </span>
            <span className="block truncate text-[12.5px] text-tm-sub">
              {m.role || '직무 미정'}{view === 'report' && e.unit ? ` · ${e.unit}` : ''}
            </span>
          </span>
        </span>
        <span className={`block w-full truncate text-[13px] ${first ? 'text-tm-ink' : 'text-tm-sub'}`}>
          {first ?? '맡은 일을 아직 적지 않았습니다'}
        </span>
        <span className="mt-auto flex w-full items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1">
            <span className="flex min-w-0 items-center gap-1 overflow-hidden">
              {shown.map(({ a, pinned: p }) => (
                <span key={a.id} className={p ? chipPinned : chipSuggested} title={`${a.name}${p ? '' : ' (추천)'}`}>{shortName(a)}</span>
              ))}
            </span>
            {chips.length > shown.length && <span className="flex-none text-[12px] font-semibold text-tm-sub">+{chips.length - shown.length}</span>}
          </span>
          <span className="flex flex-none items-center gap-2 text-[12px] font-semibold tabular-nums text-tm-sub">
            {e.folders.length > 0 && <span className="flex items-center gap-0.5" title={`담당 폴더 ${e.folders.length}개`}><IconFolder size={14} />{e.folders.length}</span>}
            {tasks > 0 && <span className="flex items-center gap-0.5" title={`맡은 작업 ${tasks}건`}><IconTask size={14} />{tasks}</span>}
          </span>
        </span>
      </button>
      {toggleBtn}
    </div>
  );
}
