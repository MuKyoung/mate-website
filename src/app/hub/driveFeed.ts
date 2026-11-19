import { isMissingTable, isRemote, sb } from './supabase';
import { DRIVE_FOLDER, ancestorsOf, kindOf, type DriveNode, type DriveTree } from './driveTree';

/*
 * 구글 드라이브의 '최근 올라온 것'과 '구글 시트' - 둘 다 이미 받아 둔 드라이브 목록(tm_drive_snapshot)에서 셈한다.
 * 새 표 · 새 서버 호출 없이 화면에서만 고르므로 Supabase · Vercel 비용이 늘지 않는다.
 * 담당자는 조직도(tm_org)의 '담당 구글 폴더'를 화면을 열 때 한 번 읽어 붙인다(팀원 수만큼의 작은 줄).
 * 사람마다 다른 것(기간 · 내 담당만 · 마지막으로 본 때 · 고정한 시트)은 그 브라우저에만 둔다.
 */

/** 이 이름이 들어간 폴더 아래는 지난 것 - 최근 · 시트 목록에서 뺀다(빌드 목록과 같은 규칙) */
const ARCHIVE = /보관/;
/** Hub 가 보고 첨부를 옮겨 두는 폴더(drive-sync.gs 의 REPORT_FOLDER) - 매일 쌓여 최근 목록을 덮으므로 뺀다 */
const REPORT_FOLDER = 'MATE Hub 보고 첨부';

export const isHidden = (n: DriveNode) =>
  [n, ...ancestorsOf(n)].some((a) => a.item.mime === DRIVE_FOLDER && (ARCHIVE.test(a.item.name) || a.item.name === REPORT_FOLDER));

const DAY = 86_400_000;
const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) || 0 : 0);

/* ── 담당자 ─────────────────────────────────────── */

/** 폴더 id → 그 폴더를 맡은 팀원 id 들 */
export type FolderOwners = Map<string, string[]>;

export async function loadFolderOwners(): Promise<FolderOwners> {
  const out: FolderOwners = new Map();
  if (!isRemote) return out;
  const { data, error } = await sb().from('tm_org').select('member, folders');
  if (error || !data) {
    if (error && !isMissingTable(error)) console.warn('[drive] 담당 폴더를 읽지 못했습니다', error.message);
    return out;
  }
  for (const row of data as { member: string; folders: unknown }[]) {
    if (!Array.isArray(row.folders)) continue;
    for (const f of row.folders) {
      const id = f && typeof f === 'object' ? (f as { id?: unknown }).id : null;
      if (typeof id !== 'string' || !id) continue;
      const list = out.get(id) ?? [];
      if (!list.includes(row.member)) list.push(row.member);
      out.set(id, list);
    }
  }
  return out;
}

/** 가장 가까운 위 폴더(자기 포함)의 담당자 - 없으면 빈 목록 */
export function ownersOf(n: DriveNode, owners: FolderOwners): string[] {
  if (!owners.size) return [];
  for (let a: DriveNode | null = n; a; a = a.parent) {
    const o = owners.get(a.item.id);
    if (o?.length) return o;
  }
  return [];
}

/* ── 최근 올라온 것 ─────────────────────────────────── */

export type RecentRange = 1 | 3 | 7 | 30;
export const RECENT_RANGES: { id: RecentRange; label: string }[] = [
  { id: 1, label: '하루' },
  { id: 3, label: '3일' },
  { id: 7, label: '7일' },
  { id: 30, label: '30일' },
];

export interface RecentFile {
  node: DriveNode;
  /** 올린 시각(새로 올림) 또는 고친 시각 */
  at: number;
  added: boolean;
}

/** 한 폴더에 모인 최근 파일 - 애니메이션 여러 개를 한 번에 올리면 한 묶음으로 보인다 */
export interface RecentGroup {
  folder: DriveNode;
  files: RecentFile[];
  /** 묶음에서 가장 늦은 시각 */
  at: number;
}

/**
 * 기간 안에 새로 올라오거나 고친 파일을 폴더별로 묶는다(새것 위).
 * 만든 시각이 기간 안이면 '새로 올림', 아니면 고친 시각이 기간 안일 때 '고침'.
 * mine 이 있으면 그 폴더들 아래만
 */
export function recentGroups(tree: DriveTree, now: number, days: number, mine?: Set<string> | null): RecentGroup[] {
  const since = now - days * DAY;
  const groups = new Map<string, RecentGroup>();
  for (const n of tree.all) {
    if (n.item.mime === DRIVE_FOLDER || !n.parent) continue;
    const created = time(n.item.created);
    const modified = time(n.item.modified);
    const added = created >= since;
    // 올린 직후의 수정 시각(1분 안)은 '고침'으로 보지 않는다
    const changed = !added && modified >= since && modified - created > 60_000;
    if (!added && !changed) continue;
    if (isHidden(n)) continue;
    if (mine && ![n, ...ancestorsOf(n)].some((a) => mine.has(a.item.id))) continue;
    const at = added ? created : modified;
    const g = groups.get(n.parent.item.id) ?? { folder: n.parent, files: [], at: 0 };
    g.files.push({ node: n, at, added });
    g.at = Math.max(g.at, at);
    groups.set(n.parent.item.id, g);
  }
  const out = [...groups.values()];
  for (const g of out) g.files.sort((a, b) => b.at - a.at);
  return out.sort((a, b) => b.at - a.at);
}

/* ── 구글 시트 ────────────────────────────────────── */

export type Freshness = 'fresh' | 'aging' | 'stale';
/** 이 날수 안에 고쳤으면 '최신' */
export const FRESH_DAYS = 7;
/** 이 날수 넘게 그대로면 '오래됨' - 확인하고 고치거나 보관함으로 옮기라는 표시 */
export const STALE_DAYS = 30;

export function freshnessOf(n: DriveNode, now: number): { tone: Freshness; days: number } {
  const t = time(n.item.modified) || time(n.item.created);
  const days = t ? Math.max(0, Math.floor((now - t) / DAY)) : Number.POSITIVE_INFINITY;
  return { tone: days <= FRESH_DAYS ? 'fresh' : days <= STALE_DAYS ? 'aging' : 'stale', days };
}

export const isSheet = (n: DriveNode) => kindOf(n.item.mime, n.item.name) === 'sheet';

/** 보관함 밖의 시트(구글 시트 · 엑셀 · CSV) - 최근에 고친 것 위 */
export function sheetsOf(tree: DriveTree): DriveNode[] {
  return tree.all
    .filter((n) => isSheet(n) && !isHidden(n))
    .sort((a, b) => (time(b.item.modified) || time(b.item.created)) - (time(a.item.modified) || time(a.item.created)));
}

/* ── 사람마다 기억하는 것(이 브라우저만) ───────────────────── */

const FEED_KEY = 'mate.taskmanager.drive.feed.v1';

export interface FeedPrefs {
  range: RecentRange;
  /** 내 담당 폴더 아래만 */
  mine: boolean;
  /** 최근 목록을 마지막으로 연 때(ms) - 이 뒤에 올라온 것이 단추의 숫자. 0 이면 처음 */
  seen: number;
  /** 위에 고정한 시트 id */
  pins: string[];
  /** 시트 목록 - 오래된 것만 */
  staleOnly: boolean;
}

export function readFeedPrefs(me: string): FeedPrefs {
  const fallback: FeedPrefs = { range: 3, mine: false, seen: 0, pins: [], staleOnly: false };
  try {
    const raw = window.localStorage.getItem(`${FEED_KEY}:${me}`);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Record<keyof FeedPrefs, unknown>>;
    return {
      range: RECENT_RANGES.some((r) => r.id === p.range) ? (p.range as RecentRange) : fallback.range,
      mine: typeof p.mine === 'boolean' ? p.mine : fallback.mine,
      seen: typeof p.seen === 'number' && Number.isFinite(p.seen) ? p.seen : 0,
      pins: Array.isArray(p.pins) ? p.pins.filter((x): x is string => typeof x === 'string').slice(0, 50) : [],
      staleOnly: typeof p.staleOnly === 'boolean' ? p.staleOnly : false,
    };
  } catch {
    return fallback;
  }
}

export function writeFeedPrefs(me: string, p: FeedPrefs) {
  try {
    window.localStorage.setItem(`${FEED_KEY}:${me}`, JSON.stringify(p));
  } catch {
    /* 저장 못 해도 이번 보기는 그대로 */
  }
}
