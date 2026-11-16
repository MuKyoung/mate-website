import { isMissingTable, isRemote, sb } from './supabase';

/*
 * 구글 드라이브 지도의 데이터 - 팀 구글 드라이브(contact@devteammate.co.kr 의 내 드라이브)의 폴더 · 파일 목록.
 * 드라이브 계정의 Apps Script(supabase/drive-sync.gs)가 30분마다 tm_drive_snapshot 한 줄을 통째로 바꾸고,
 * Hub 는 그 줄을 읽어 트리로 만든다(Drive.tsx). 승인된 팀원만 읽는다(RLS). 브라우저 저장 모드에는 목록이 없다.
 */

export const DRIVE_FOLDER = 'application/vnd.google-apps.folder';
/** 드라이브 계정 - 링크는 이 계정으로 로그인한 브라우저에서 열린다 */
export const DRIVE_ACCOUNT = 'contact@devteammate.co.kr';
/** 자동 갱신 간격(분) - drive-sync.gs 의 EVERY_MINUTES 와 같다 */
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
}

export type DriveLoad =
  | { kind: 'local' }
  | { kind: 'missing' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; snapshot: DriveSnapshot };

interface SnapshotRow {
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
    if (!id) continue;
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

export async function loadDrive(): Promise<DriveLoad> {
  if (!isRemote) return { kind: 'local' };
  const { data, error } = await sb()
    .from('tm_drive_snapshot')
    .select('root_id, items, source, synced_at')
    .eq('id', 1)
    .maybeSingle<SnapshotRow>();
  if (error) return isMissingTable(error) ? { kind: 'missing' } : { kind: 'error', message: error.message };
  if (!data) return { kind: 'empty' };
  return {
    kind: 'ok',
    snapshot: { rootId: data.root_id, items: cleanItems(data.items), source: data.source ?? '', syncedAt: data.synced_at },
  };
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

/** 여는 주소 - 구글 주소(https)만 그대로 쓰고, 아니면 id 로 드라이브 주소를 만든다 */
export function driveUrl(it: DriveItem): string {
  try {
    const u = new URL(it.url);
    if (u.protocol === 'https:' && SAFE_HOST.test(u.hostname)) return u.href;
  } catch {
    /* 아래 주소로 */
  }
  const id = encodeURIComponent(it.id);
  return it.mime === DRIVE_FOLDER ? `https://drive.google.com/drive/folders/${id}` : `https://drive.google.com/open?id=${id}`;
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
