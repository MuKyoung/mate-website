import { isMissingTable, isRemote, sb } from './supabase';

/*
 * 구글 드라이브 지도의 데이터 - 팀 구글 드라이브(contact@devteammate.co.kr 의 내 드라이브)의 폴더 · 파일 목록.
 * 드라이브 계정의 Apps Script(supabase/drive-sync.gs)가 1분마다 드라이브에 바뀐 것이 있는지 보고, 바뀌었으면
 * (아니어도 30분마다) tm_drive_snapshot 한 줄을 통째로 바꾼다. Hub 는 그 줄을 읽어 트리로 만들고(Drive.tsx),
 * 화면이 열려 있는 동안 1분마다 갱신 시각만 보고 바뀌었으면 다시 읽는다.
 * 승인된 팀원만 읽는다(RLS). 브라우저 저장 모드에는 목록이 없다.
 */

export const DRIVE_FOLDER = 'application/vnd.google-apps.folder';
/** 드라이브 계정 - 링크는 이 계정으로 로그인한 브라우저에서 열린다 */
export const DRIVE_ACCOUNT = 'contact@devteammate.co.kr';
/** 바뀐 것이 없어도 통째로 다시 보내는 간격(분) - drive-sync.gs 의 FULL_MINUTES 와 같다. 이 세 배를 넘기면 '멈췄다' */
export const DRIVE_SYNC_MINUTES = 30;

/** 표에 담긴 한 줄 - drive-sync.gs 가 만든다 */
export interface DriveItem {
  id: string;
  parent: string | null;
  name: string;
  mime: string;
  url: string;
  modified: string | null;
}

export interface DriveSnapshot {
  rootId: string;
  items: DriveItem[];
  /** 넣은 쪽 - 'apps-script'(자동) · 'claude'(손으로) */
  source: string;
  syncedAt: string;
  /** 바로 확인 주소(드라이브 쪽 웹 앱) - 스크립트가 설정 줄 '#refresh' 로 보낸다. 없으면 '드라이브 확인' 단추 대신 '다시 읽기' */
  refreshUrl: string | null;
}

export type DriveLoad =
  | { kind: 'local' }
  | { kind: 'missing' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; snapshot: DriveSnapshot };

export interface SnapshotRow {
  root_id: string;
  items: unknown;
  source: string | null;
  synced_at: string;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** 표의 목록을 믿지 않고 한 줄씩 모양을 맞춘다 - 모양이 틀린 줄은 버린다 */
function cleanItems(raw: unknown): DriveItem[] {
  if (!Array.isArray(raw)) return [];
  const out: DriveItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const id = str(o.id);
    // # 로 시작하는 줄은 드라이브 항목이 아니라 스크립트의 설정 줄이다(refreshUrlOf)
    if (!id || id.startsWith('#')) continue;
    out.push({
      id,
      parent: str(o.parent) || null,
      name: str(o.name) || '(이름 없음)',
      mime: str(o.mime),
      url: str(o.url),
      modified: str(o.modified) || null,
    });
  }
  return out;
}

/** 갱신 시각만 - 화면이 열려 있는 동안 새 목록이 왔는지 가볍게 본다(못 읽으면 null) */
export async function loadDriveStamp(): Promise<string | null> {
  if (!isRemote) return null;
  const { data, error } = await sb()
    .from('tm_drive_snapshot')
    .select('synced_at')
    .eq('id', 1)
    .maybeSingle<{ synced_at: string }>();
  return error || !data ? null : data.synced_at;
}

export async function loadDrive(): Promise<DriveLoad> {
  if (!isRemote) return { kind: 'local' };
  const { data, error } = await sb()
    .from('tm_drive_snapshot')
    .select('root_id, items, source, synced_at')
    .eq('id', 1)
    .maybeSingle<SnapshotRow>();
  if (error) return isMissingTable(error) ? { kind: 'missing' } : { kind: 'error', message: error.message };
  if (!data) return { kind: 'empty' };
  return { kind: 'ok', snapshot: snapshotFrom(data) };
}

/** 드라이브 쪽 웹 앱 주소만 받는다 - Hub 가 그대로 부르므로 모양을 엄격히 본다 */
const WEBAPP_RE = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

function refreshUrlOf(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  const meta = raw.find((r): r is Record<string, unknown> => !!r && typeof r === 'object' && (r as Record<string, unknown>).id === '#refresh');
  const url = meta ? str(meta.url) : '';
  return WEBAPP_RE.test(url) ? url : null;
}

export function snapshotFrom(row: SnapshotRow): DriveSnapshot {
  return {
    rootId: row.root_id,
    items: cleanItems(row.items),
    source: row.source ?? '',
    syncedAt: row.synced_at,
    refreshUrl: refreshUrlOf(row.items),
  };
}

/* ── 바로 확인 ─────────────────────────────────────── */

export type DriveCheck =
  | { ok: true; skipped: boolean }
  | { ok: false; reason: 'not-member' | 'busy' | 'unreachable' | 'failed'; message?: string };

/**
 * 드라이브 쪽 웹 앱을 깨워 지금 목록을 받게 한다(10초 남짓). 누른 사람의 Hub 로그인 토큰을 실어 보내고,
 * 웹 앱은 승인된 팀원인지 본 뒤 30초 안에 받은 것이 있으면 새로 받지 않는다(skipped).
 * text/plain 으로 보내 미리 묻기(CORS preflight) 없이 간다 - 답은 구글이 넘겨 준 주소에서 온다
 */
export async function requestDriveCheck(url: string): Promise<DriveCheck> {
  if (!isRemote || !WEBAPP_RE.test(url)) return { ok: false, reason: 'failed' };
  const { data } = await sb().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, reason: 'not-member' };
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
  try {
    const j = (await res.json()) as { ok?: unknown; skipped?: unknown; error?: unknown };
    if (j.ok === true) return { ok: true, skipped: j.skipped === true };
    if (j.error === 'not-member' || j.error === 'busy') return { ok: false, reason: j.error };
    return { ok: false, reason: 'failed', message: typeof j.error === 'string' ? j.error : undefined };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}

/** 두 목록 사이에 늘어난 것 · 빠진 것 · 바뀐 것(이름 · 위치 · 수정 시각) - 바로 확인 뒤 알림에 쓴다 */
export function diffSnapshots(a: DriveSnapshot, b: DriveSnapshot): { added: number; removed: number; changed: number } {
  const before = new Map(a.items.map((i) => [i.id, i]));
  let added = 0;
  let changed = 0;
  for (const i of b.items) {
    const o = before.get(i.id);
    if (!o) added++;
    else if (o.name !== i.name || o.parent !== i.parent || o.modified !== i.modified) changed++;
    before.delete(i.id);
  }
  return { added, removed: before.size, changed };
}

/* ── 트리 ─────────────────────────────────────────── */

export interface DriveNode {
  item: DriveItem;
  depth: number;
  parent: DriveNode | null;
  /** 바로 아래 폴더 · 파일 - 이름순(숫자는 크기순) */
  folders: DriveNode[];
  files: DriveNode[];
  /** 이 아래 모든 단계의 폴더 · 파일 수 */
  folderTotal: number;
  fileTotal: number;
}

export interface DriveTree {
  root: DriveNode;
  byId: Map<string, DriveNode>;
  /** 맨 위를 뺀 모든 폴더 · 파일 - 찾기에 쓴다 */
  all: DriveNode[];
  maxDepth: number;
}

/** 맨 위(내 드라이브) - 이름은 화면에서 '팀 드라이브' */
export const DRIVE_ROOT_NAME = '팀 드라이브';

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
const byName = (a: DriveNode, b: DriveNode) => collator.compare(a.item.name, b.item.name);

export function buildDriveTree(snap: DriveSnapshot): DriveTree {
  const rootItem: DriveItem = { id: snap.rootId, parent: null, name: DRIVE_ROOT_NAME, mime: DRIVE_FOLDER, url: '', modified: null };
  const kids = new Map<string, DriveItem[]>();
  for (const it of snap.items) {
    if (!it.parent || it.id === snap.rootId) continue;
    const list = kids.get(it.parent);
    if (list) list.push(it);
    else kids.set(it.parent, [it]);
  }
  const node = (item: DriveItem, parent: DriveNode | null): DriveNode => ({
    item, parent, depth: parent ? parent.depth + 1 : 0, folders: [], files: [], folderTotal: 0, fileTotal: 0,
  });
  const root = node(rootItem, null);
  const byId = new Map<string, DriveNode>([[root.item.id, root]]);
  const all: DriveNode[] = [];
  let maxDepth = 0;
  /* 맨 위에서 닿는 것만 - 같은 id 가 두 번 나오거나 고리가 있어도 한 번만 */
  const queue: DriveNode[] = [root];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const it of kids.get(p.item.id) ?? []) {
      if (byId.has(it.id)) continue;
      const n = node(it, p);
      byId.set(it.id, n);
      all.push(n);
      maxDepth = Math.max(maxDepth, n.depth);
      if (it.mime === DRIVE_FOLDER) {
        p.folders.push(n);
        queue.push(n);
      } else {
        p.files.push(n);
      }
    }
  }
  /* 이름순으로 세우고, 아래에서부터 수를 모은다(queue 는 위에서 아래 순서) */
  for (let i = queue.length - 1; i >= 0; i--) {
    const n = queue[i];
    n.folders.sort(byName);
    n.files.sort(byName);
    n.folderTotal = n.folders.length + n.folders.reduce((s, c) => s + c.folderTotal, 0);
    n.fileTotal = n.files.length + n.folders.reduce((s, c) => s + c.fileTotal, 0);
  }
  return { root, byId, all, maxDepth };
}

/** 위 폴더들 - 맨 위(팀 드라이브)는 빼고, 가까운 것이 뒤 */
export function ancestorsOf(n: DriveNode): DriveNode[] {
  const out: DriveNode[] = [];
  for (let p = n.parent; p && p.parent; p = p.parent) out.unshift(p);
  return out;
}

/* ── 링크 ─────────────────────────────────────────── */

const SAFE_HOST = /(^|\.)google\.com$/;

/** 드라이브 계정을 짚은 주소 - 구글 계정이 여럿 로그인된 브라우저에서도 그 계정으로 열고, 없으면 그 계정 로그인을 묻는다 */
function withAccount(href: string): string {
  const u = new URL(href);
  u.searchParams.set('authuser', DRIVE_ACCOUNT);
  return u.href;
}

/** 여는 주소 - 구글 주소(https)만 그대로 쓰고, 아니면 id 로 드라이브 주소를 만든다 */
export function driveUrl(it: DriveItem): string {
  try {
    const u = new URL(it.url);
    if (u.protocol === 'https:' && SAFE_HOST.test(u.hostname)) return withAccount(u.href);
  } catch {
    /* 아래 주소로 */
  }
  const id = encodeURIComponent(it.id);
  return withAccount(it.mime === DRIVE_FOLDER ? `https://drive.google.com/drive/folders/${id}` : `https://drive.google.com/open?id=${id}`);
}

/** 옆 칸에 끼워 넣는 드라이브 미리보기 주소 - 폴더 · 설문지 · 바로가기 같은 구글 형식은 없다(null) */
export function previewUrl(it: DriveItem): string | null {
  const id = encodeURIComponent(it.id);
  const g = 'application/vnd.google-apps.';
  if (it.mime === `${g}document`) return withAccount(`https://docs.google.com/document/d/${id}/preview`);
  if (it.mime === `${g}spreadsheet`) return withAccount(`https://docs.google.com/spreadsheets/d/${id}/preview`);
  if (it.mime === `${g}presentation`) return withAccount(`https://docs.google.com/presentation/d/${id}/preview`);
  if (it.mime.startsWith(g)) return null;
  return withAccount(`https://drive.google.com/file/d/${id}/preview`);
}

/* ── 파일 종류 ─────────────────────────────────────── */

export type DriveKind =
  | 'folder' | 'doc' | 'sheet' | 'slide' | 'form' | 'pdf' | 'image' | 'video' | 'audio' | 'archive' | 'model' | 'shortcut' | 'file';

export const KIND_LABEL: Record<DriveKind, string> = {
  folder: '폴더', doc: '문서', sheet: '스프레드시트', slide: '프레젠테이션', form: '설문지', pdf: 'PDF',
  image: '이미지', video: '동영상', audio: '오디오', archive: '압축 파일', model: '3D 모델', shortcut: '바로가기', file: '파일',
};

export function kindOf(mime: string, name = ''): DriveKind {
  const m = mime.toLowerCase();
  if (m === DRIVE_FOLDER) return 'folder';
  if (m === 'application/vnd.google-apps.shortcut') return 'shortcut';
  if (m === 'application/vnd.google-apps.document' || /wordprocessingml|msword|hwp|^text\/(plain|markdown)$/.test(m)) return 'doc';
  if (m === 'application/vnd.google-apps.spreadsheet' || /spreadsheetml|ms-excel|text\/csv/.test(m)) return 'sheet';
  if (m === 'application/vnd.google-apps.presentation' || /presentationml|ms-powerpoint/.test(m)) return 'slide';
  if (m === 'application/vnd.google-apps.form') return 'form';
  if (m === 'application/pdf') return 'pdf';
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (/zip|gzip|x-rar|x-7z|x-tar/.test(m)) return 'archive';
  if (/fbx|^model\//.test(m) || /\.(fbx|obj|glb|gltf|blend|max|ma|mb)$/i.test(name)) return 'model';
  return 'file';
}
