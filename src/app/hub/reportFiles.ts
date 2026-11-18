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
export async function uploadReportFile(file: File): Promise<string> {
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
  const path = `reports/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}/${id}.${ext}`;
  const { error } = await sb().storage.from(FILES).upload(path, file, {
    contentType: FILE_TYPES.has(file.type) ? file.type : 'application/octet-stream', upsert: false,
  });
  if (error) throw new Error(`'${file.name}' 을(를) 올리지 못했습니다. 인터넷 연결을 확인해 주세요.`);
  return `tmfile:${path}`;
}

/** 볼 수 있는 주소 - tmfile: 이 아니면 그대로 */
export async function reportFileUrl(src: string): Promise<string> {
  if (!src.startsWith('tmfile:')) return src;
  const path = src.slice('tmfile:'.length);
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
