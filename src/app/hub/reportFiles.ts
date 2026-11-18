'use client';

import { isRemote, sb } from './supabase';

/**
 * 보고에 넣는 그림 · PDF · 파일.
 *   · Supabase 모드: 위키와 같은 비공개 저장소(tm-files)의 reports/<연-월>/ 아래. 승인된 팀원만 올리고 받는다(SQL 의 '위키 파일' 블록).
 *     칸 글에는 tmfile:<경로> 로 적고, 볼 때 한 시간짜리 주소를 받는다(50분 동안 다시 쓴다).
 *   · 브라우저 저장 모드: 이 브라우저(localStorage)에 data URL 로 둔다 - 시험용이라 한 파일 2MB 까지.
 */

const FILES = 'tm-files';
export const REPORT_FILE_MAX = 20 * 1024 * 1024;
const LOCAL_MAX = 2 * 1024 * 1024;
const LOCAL_KEY = 'mate.taskmanager.reports.files.v1';

/** 형식을 그대로 두고 올리는 파일 - 버킷이 받는 형식과 같다. 그 밖은 내려받기 전용(octet-stream)으로 */
const FILE_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv', 'text/markdown', 'application/json',
  'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-hwp', 'application/haansofthwp', 'application/vnd.hancom.hwp', 'application/vnd.hancom.hwpx',
  'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/mp4', 'audio/wav',
]);

export const isImageFile = (f: { type: string; name: string }) =>
  /^image\/(png|jpeg|gif|webp)$/.test(f.type) || /\.(png|jpe?g|gif|webp)$/i.test(f.name);

const signed = new Map<string, { url: string; until: number }>();

function readLocal(): Record<string, string> {
  try {
    const v = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? '{}') as unknown;
    return v && typeof v === 'object' ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** 올리고 칸 글에 적을 주소(tmfile:…)를 돌려준다. 실패하면 사람이 읽을 까닭을 던진다 */
export async function uploadReportFile(file: File, scope?: FileScope): Promise<string> {
  if (file.size > REPORT_FILE_MAX) throw new Error(`'${file.name}' 은(는) 20MB 를 넘어 올릴 수 없습니다.`);
  const ext = (/\.([A-Za-z0-9]{1,8})$/.exec(file.name)?.[1] ?? 'bin').toLowerCase();
  const id = crypto.randomUUID();
  if (!isRemote) {
    if (file.size > LOCAL_MAX) throw new Error('이 브라우저에만 저장하는 모드에서는 2MB 까지 넣을 수 있습니다.');
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
      r.readAsDataURL(file);
    });
    const all = readLocal();
    all[id] = data;
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    } catch {
      throw new Error('이 브라우저의 저장 공간이 모자라 파일을 넣지 못했습니다.');
    }
    return `tmfile:local/${id}.${ext}`;
  }
  const d = new Date();
  const path = scope && /^\d{4}-\d{2}-\d{2}$/.test(scope.day)
    ? `reports/${scope.kind}/${scope.day}/${(scope.person ?? 'team').replace(/[^A-Za-z0-9_-]/g, '')}/${id}.${ext}`
    : `reports/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${id}.${ext}`;
  const { error } = await sb().storage.from(FILES).upload(path, file, {
    contentType: FILE_TYPES.has(file.type) ? file.type : 'application/octet-stream', upsert: false,
  });
  if (error) throw new Error(`'${file.name}' 을(를) 올리지 못했습니다. 인터넷 연결을 확인해 주세요.`);
  // 드라이브로 옮길 목록에 적는다 - 못 적어도 파일은 쓴다(표가 아직 없는 DB · 연결 끊김)
  if (scope) {
    const row = { path, name: file.name.slice(0, 200), size: file.size, kind: scope.kind, day: scope.day, person: scope.person, person_name: scope.personName.slice(0, 40) };
    const { error: e1 } = await sb().from('tm_report_files').insert(row);
    if (e1 && !/duplicate|23505/.test(`${e1.code} ${e1.message}`)) await sb().from('tm_report_files').insert(row);
    noteUploaded({ ...row, created_at: new Date().toISOString(), moved_at: null, drive_url: null });
  }
  return `tmfile:${path}`;
}

/** 볼 수 있는 주소 - tmfile: 이 아니면 그대로 */
export async function reportFileUrl(src: string): Promise<string> {
  if (!src.startsWith('tmfile:')) return src;
  const path = src.slice('tmfile:'.length);
  const info = registry.get(path);
  if (info?.moved_at) {
    if (info.drive_url) return info.drive_url;
    throw new Error('드라이브로 옮긴 파일을 찾지 못했습니다.');
  }
  if (path.startsWith('local/')) {
    const id = path.slice('local/'.length).replace(/\.[^.]+$/, '');
    const url = readLocal()[id];
    if (!url) throw new Error('이 브라우저에 없는 파일입니다.');
    return url;
  }
  const hit = signed.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { data, error } = await sb().storage.from(FILES).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error('파일을 열지 못했습니다.');
  signed.set(path, { url: data.signedUrl, until: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}

/** 새 창으로 연다 - 주소를 받는 동안 팝업 막기에 걸리지 않게 창을 먼저 연다 */
export async function openReportFile(src: string): Promise<void> {
  const w = window.open('', '_blank');
  try {
    let url = await reportFileUrl(src);
    // 브라우저는 data: 주소로 새 창을 여는 것을 막는다 - 같은 내용의 blob: 주소로
    if (url.startsWith('data:')) url = URL.createObjectURL(await (await fetch(url)).blob());
    if (w) w.location.href = url;
    else window.location.href = url;
  } catch (e) {
    w?.close();
    throw e;
  }
}

export const sizeLabel = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : n >= 1024 ? `${Math.round(n / 1024)}KB` : `${n}B`;

/* ── 드라이브로 옮기기(2026-11-18) ─────────────────────────────
   올린 첨부는 tm_report_files 에 적고, 올린 지 24시간이 지나거나 '스크럼 종료'를 누르면 드라이브 쪽 웹 앱(Apps Script)이
   팀 구글 드라이브로 옮긴 뒤 서버 파일을 지운다. 옮긴 첨부는 드라이브 주소로 연다 */

/** 첨부가 속한 보고 - 서버 경로와 드라이브 폴더(날 · 사람)를 정한다 */
export interface FileScope {
  kind: 'daily' | 'weekly' | 'team';
  /** 일간은 그날, 주간 · 팀 요약은 그 주 월요일 */
  day: string;
  /** 명단 id - 팀 요약은 null */
  person: string | null;
  personName: string;
}

export interface ReportFileRow {
  path: string;
  name: string;
  size: number;
  kind: string;
  day: string | null;
  person: string | null;
  person_name: string;
  created_at: string;
  moved_at: string | null;
  drive_url: string | null;
}

const registry = new Map<string, ReportFileRow>();
let version = 0;
const listeners = new Set<() => void>();
const changed = () => {
  version += 1;
  listeners.forEach((f) => f());
};

/** 화면이 첨부 상태(옮김 · 기다림)가 바뀔 때 다시 그리게 */
export const subscribeReportFiles = (f: () => void) => {
  listeners.add(f);
  return () => { listeners.delete(f); };
};
export const reportFilesVersion = () => version;

/** tmfile: 주소의 첨부 상태 - 기록이 없으면(예전 · 브라우저 저장 모드) null */
export function reportFileInfo(src: string): ReportFileRow | null {
  return src.startsWith('tmfile:') ? registry.get(src.slice('tmfile:'.length)) ?? null : null;
}

function noteUploaded(row: ReportFileRow) {
  registry.set(row.path, row);
  changed();
}

/** 첨부 기록을 읽는다 - 표가 없으면(SQL 실행 전) null */
export async function loadReportFiles(): Promise<ReportFileRow[] | null> {
  if (!isRemote) return null;
  const { data, error } = await sb().from('tm_report_files')
    .select('path,name,size,kind,day,person,person_name,created_at,moved_at,drive_url')
    .order('created_at', { ascending: false }).limit(2000);
  if (error) return null;
  registry.clear();
  for (const r of (data ?? []) as ReportFileRow[]) registry.set(r.path, r);
  changed();
  return data as ReportFileRow[];
}

/** 드라이브로 옮길 차례인 첨부(올린 지 24시간이 지났는데 아직 서버에 있는 것) */
export const dueReportFiles = () =>
  [...registry.values()].filter((r) => !r.moved_at && Date.now() - new Date(r.created_at).getTime() > 24 * 3600 * 1000);

/** 그날(일간) 서버에 남은 첨부 */
export const pendingOfDay = (day: string, kind: FileScope['kind'] = 'daily') =>
  [...registry.values()].filter((r) => !r.moved_at && r.day === day && r.kind === kind);

let webApp: string | null | undefined;

export type ArchiveResult = { ok: true; moved: number; failed: number; left: boolean } | { ok: false; reason: 'no-webapp' | 'not-member' | 'busy' | 'unreachable' | 'failed'; message?: string };

/**
 * 드라이브 쪽 웹 앱에 '옮겨 달라'고 한다(누른 사람의 로그인 토큰을 실어). day 를 주면 그날 첨부도, 없으면 24시간 지난 것만.
 * text/plain 으로 보내 미리 묻기(CORS preflight) 없이 간다
 */
export async function archiveReportFiles(day?: string, kind?: FileScope['kind']): Promise<ArchiveResult> {
  if (!isRemote) return { ok: false, reason: 'no-webapp' };
  if (webApp === undefined) {
    const { data } = await sb().rpc('tm_drive_webapp');
    webApp = typeof data === 'string' && /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(data) ? data : null;
  }
  if (!webApp) return { ok: false, reason: 'no-webapp' };
  const { data } = await sb().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, reason: 'not-member' };
  let res: Response;
  try {
    res = await fetch(webApp, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'reports', token, day, kind }),
      signal: AbortSignal.timeout(330_000),
    });
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
  try {
    const j = (await res.json()) as { ok?: unknown; moved?: unknown; failed?: unknown; left?: unknown; error?: unknown; count?: unknown };
    // 옮기기를 모르는 예전 판 웹 앱은 드라이브 목록만 새로 받고 count 를 돌려준다
    if (j.ok === true && typeof j.moved === 'number') {
      return { ok: true, moved: j.moved, failed: Number(j.failed) || 0, left: j.left === true };
    }
    if (j.ok === true) return { ok: false, reason: 'failed', message: 'old-webapp' };
    if (j.error === 'not-member' || j.error === 'busy') return { ok: false, reason: j.error };
    return { ok: false, reason: 'failed', message: typeof j.error === 'string' ? j.error : undefined };
  } catch {
    return { ok: false, reason: 'unreachable' };
  }
}
