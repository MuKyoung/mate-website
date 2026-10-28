'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Doc, DocComment, DocVersion } from './types';
import type { StoreOptions, SyncState } from './store';

/**
 * 문서 저장소 - 브라우저 저장 모드.
 * 작업 저장소(store.ts)와 같은 처지다 - Supabase 키 없이 빌드했을 때 localStorage 에만 남는다.
 * 팀이 함께 쓰는 저장소는 remote.ts 이고, 둘은 아래 DocStore 모양을 함께 쓴다.
 */

const KEY = 'mate.taskmanager.docs.v1';
const VERSIONS_KEY = 'mate.taskmanager.docs.versions.v1';
const COMMENTS_KEY = 'mate.taskmanager.docs.comments.v1';
/** Supabase 로 옮길 때 예전 데이터를 찾는 자리 */
export const LOCAL_DOCS_KEY = KEY;

/** 기록을 새로 남기는 때 - Supabase 의 트리거(tm_docs_history)와 같은 규칙 */
export const HISTORY_IDLE_MS = 10 * 60 * 1000;
export const HISTORY_EVERY_MS = 30 * 60 * 1000;
/** 브라우저에 남기는 판 수 - 저장 칸(보통 5MB)을 다 쓰지 않게 */
const LOCAL_VERSIONS_PER_DOC = 30;

const NL = '\n';
const lines = (...xs: string[]) => xs.join(NL);

/**
 * 예시로 넣어 둔 뒤 아무도 고치지 않은 문서.
 * 초기 문서는 '개발 규칙', '외주 진행 절차' 처럼 팀이 정한 규칙의 모양을 하고
 * 있지만 쓰는 법을 보여 주려고 채운 글이다. 표시 없이 두면 실제 규칙으로 읽힌다.
 * 초기 문서의 id 는 d1, d2… 이고 사람이 만든 것은 d<시각>-<번호> 라 겹치지 않는다.
 */
export const isUntouchedSampleDoc = (d: Doc) => /^d\d+$/.test(d.id) && d.createdAt === d.updatedAt;

/** 휴지통에 들지 않은 문서 수 - 휴지통에 든 문서의 아래 문서도 뺀다(메뉴의 숫자) */
export function liveDocCount(docs: Doc[]): number {
  const byId = new Map(docs.map((d) => [d.id, d]));
  return docs.filter((d) => {
    let cur: Doc | undefined = d;
    let guard = 0;
    while (cur && guard < 60) {
      if (cur.trashedAt) return false;
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
      guard += 1;
    }
    return true;
  }).length;
}

/** 예전에 저장한 문서에는 위키 칸이 없다 - 빈 값으로 채운다 */
function normalize(d: Partial<Doc> & { id: string }): Doc {
  return {
    id: d.id,
    title: d.title ?? '',
    parentId: d.parentId ?? null,
    body: d.body ?? '',
    author: d.author ?? '',
    labels: Array.isArray(d.labels) ? d.labels : [],
    order: typeof d.order === 'number' ? d.order : 0,
    createdAt: d.createdAt ?? new Date(0).toISOString(),
    updatedAt: d.updatedAt ?? d.createdAt ?? new Date(0).toISOString(),
    icon: d.icon ?? '',
    updatedBy: d.updatedBy ?? d.author ?? null,
    trashedAt: d.trashedAt ?? null,
    trashedBy: d.trashedBy ?? null,
  };
}

function seed(): Doc[] {
  const now = new Date().toISOString();
  const mk = (
    id: string, icon: string, title: string, parentId: string | null, order: number,
    author: string, labels: string[], body: string,
  ): Doc => normalize({ id, icon, title, parentId, order, author, labels, body, createdAt: now, updatedAt: now });

  return [
    mk('d1', '📘', '팀 위키', null, 1, 'm7', ['안내'], lines(
      'MATE가 일하면서 쌓이는 것들을 여기에 둡니다. 작업은 보드에, 결정과 기록은 문서에 남깁니다.',
      '',
      '## 어디에 무엇을 적나',
      '',
      '| 성격 | 어디에 |',
      '| --- | --- |',
      '| 이번 주기에 끝낼 일 | 작업 보드 |',
      '| 왜 그렇게 정했는지 | [기술 결정 기록](doc:d4) |',
      '| 무엇을 만들기로 했는지 | 요구사항 정의서 |',
      '| 누가 무엇을 하기로 했는지 | 회의록 |',
      '',
      '> 보드 카드의 설명란은 "무엇을 해야 하는지"까지만 적습니다.',
      '> 배경과 판단 근거가 길어지면 문서로 빼고 카드에서 링크합니다.',
      '',
      '## 쓰는 법',
      '',
      '- 편집을 누르고 바로 씁니다. 빈 줄에서 `/` 를 누르면 제목 · 목록 · 표 · 알림 상자 · 접기를 넣을 수 있습니다.',
      '- `[[` 를 치면 다른 문서나 작업을 골라 링크합니다. `@` 를 치면 팀원을 부릅니다.',
      '- 그림은 붙여 넣거나 끌어다 놓습니다. 고친 내용은 저절로 저장되고, 예전 판은 기록에서 볼 수 있습니다.',
      '',
      '> [!TIP]',
      '> 본문에 작업 번호를 그대로 적으면 그 작업으로 가는 링크가 됩니다. 예: MATE-110.',
      '',
      '<details>',
      '<summary>문서를 쓸 때</summary>',
      '',
      '- 제목은 검색해서 찾을 말로 짓습니다. "회의록"보다 "10월 2주 교육 일정 회의".',
      '- 결정은 결론부터 적습니다. 과정은 그 아래.',
      '- 비밀번호와 키는 적지 않습니다. 보관 위치만 적습니다.',
      '',
      '</details>',
    )),

    mk('d2', '🛠️', '개발 규칙', 'd1', 1, 'm2', ['개발'], lines(
      '## 저장소',
      '',
      '- 기본 브랜치는 `main`. 직접 푸시하지 않고 PR로 들어갑니다.',
      '- 브랜치 이름은 `feat/`, `fix/`, `chore/` 로 시작합니다.',
      '- 커밋 메시지 첫 줄은 50자 안쪽, 무엇을 why와 함께.',
      '',
      '## 리뷰',
      '',
      '- 리뷰어 1명 승인 후 머지합니다.',
      '- 하루 넘게 멈춰 있는 PR은 작성자가 먼저 찔러 봅니다.',
      '',
      '## 배포 전 확인',
      '',
      '```',
      'npm run lint',
      'npx tsc --noEmit',
      'npm run build',
      '```',
      '',
      '> [!WARNING]',
      '> 셋 중 하나라도 실패하면 배포하지 않습니다.',
    )),

    mk('d3', '🧭', '외주 진행 절차', 'd1', 2, 'm7', ['프로세스'], lines(
      '상담에서 배포까지 다섯 단계로 갑니다. 내용은 사이트의 진행 절차(process.ts)와 같습니다.',
      '',
      '| 단계 | 하는 일 |',
      '| --- | --- |',
      '| 상담 | 만들려는 것과 목표를 듣고 방향을 같이 잡습니다 |',
      '| 기획 | 상세 기획서, 기술 스택, 견적과 일정 |',
      '| 개발 | 주 단위 진행 공유, 코드 리뷰 |',
      '| 테스트 | 버그 수정, 사용자 테스트로 사용성 개선 |',
      '| 배포 | 최종 검수 후 배포, 배포 후 모니터링 |',
      '',
      '## 견적',
      '',
      '프로젝트 규모와 개발 기간, 기술 난이도를 함께 보고 냅니다. 정확한 견적은 상담 후에 드립니다.',
      '',
      '## 범위가 바뀌면',
      '',
      '진행 상황에 따라 일정 조정이 필요할 수 있습니다. 변경이 생기면 바로 말씀드리고 방법을 같이 찾습니다.',
    )),

    mk('d4', '🧩', '기술 결정 기록', 'd1', 3, 'm4', ['ADR'], lines(
      '큰 선택을 할 때마다 한 장씩 남깁니다. 나중에 "왜 이렇게 했지"를 다시 묻지 않기 위해서입니다.',
      '',
      '| 결정 | 관련 작업 |',
      '| --- | --- |',
      '| [웹사이트를 정적 배포로 유지한다](doc:d5) | MATE-112 |',
      '| [이미지는 WebP로 통일한다](doc:d6) | MATE-115 |',
      '',
      '> 새 결정은 이 문서 아래에 하위 문서로 추가합니다.',
    )),

    mk('d5', '', '웹사이트를 정적 배포로 유지한다', 'd4', 1, 'm4', ['ADR', '웹사이트'], lines(
      '> 상태: 채택',
      '',
      '## 맥락',
      '',
      '회사 홈페이지에 문의 폼과 포트폴리오가 있습니다. 서버를 둘지, 정적으로 내보낼지 정해야 했습니다.',
      '',
      '## 검토한 선택지',
      '',
      '| 안 | 장점 | 단점 |',
      '| --- | --- | --- |',
      '| 정적 내보내기 | 운영 비용 0, 장애 지점 없음 | 서버 기능 불가 |',
      '| Node 서버 | 폼 처리, DB 연동 자유 | 상시 운영과 비용 |',
      '',
      '## 결정',
      '',
      '정적 내보내기를 유지합니다. 홈페이지에서 서버가 꼭 필요한 기능은 문의 폼 하나뿐이고,',
      '그건 외부 서비스로 처리할 수 있습니다.',
      '',
      '## 결과',
      '',
      '- 배포가 단순해지고 운영 비용이 들지 않습니다.',
      '- 대신 사내 도구에 서버가 필요해지면 그때 별도로 분리해야 합니다.',
      '- 문의 폼은 외부 엔드포인트를 붙일 때까지 메일 초안으로 대신합니다 (MATE-112).',
    )),

    mk('d6', '', '이미지는 WebP로 통일한다', 'd4', 2, 'm4', ['ADR', '성능'], lines(
      '> 상태: 채택',
      '',
      '## 맥락',
      '',
      '프로젝트 썸네일 8장이 PNG로 8.1MB였습니다. `images.unoptimized` 설정이라 원본이 그대로 나갑니다.',
      '',
      '## 결정',
      '',
      '가로 1600px 상한으로 줄이고 WebP 품질 84로 변환합니다. 합계 589KB가 됐습니다.',
      '',
      '## 결과',
      '',
      '- 첫 로딩이 눈에 띄게 빨라졌습니다.',
      '- 다만 공유 카드(og:image)는 WebP를 렌더하지 않는 메신저가 있어 JPG를 따로 둡니다.',
      '- 남은 작업은 MATE-110 에서 이어집니다.',
    )),

    mk('d7', '🎓', '교육 과정 운영 안내', 'd1', 4, 'm7', ['교육'], lines(
      '## 표준 과정',
      '',
      '| 과정 | 대상 |',
      '| --- | --- |',
      '| Unity 게임 개발 | 입문 ~ 중급 |',
      '| 웹 · 앱 개발 | 입문 ~ 중급 |',
      '| AI 활용 개발 | 개발 경험자 |',
      '',
      '## 기관과 조율할 것',
      '',
      '- [ ] 시수와 정원, 실습 환경',
      '- [ ] 평가 방식과 산출물 범위',
      '- [ ] 담당 강사 고정 여부',
      '',
      '## 진행 중',
      '',
      '| 내용 | 작업 |',
      '| --- | --- |',
      '| 2학기 커리큘럼 확정 | MATE-107 |',
      '| AI 활용 과정 실습 환경 | MATE-108 |',
    )),
  ];
}

function readJson<V>(key: string): V | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as V) : null;
  } catch {
    return null;
  }
}

/** 저장이 막혀 있어도 화면은 계속 동작해야 한다 - 칸이 꽉 찼으면 거짓 */
function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function read(): Doc[] | null {
  const parsed = readJson<unknown>(KEY);
  return Array.isArray(parsed) ? (parsed as Doc[]).filter((d) => d && typeof d.id === 'string').map(normalize) : null;
}

/** 브라우저 저장 모드의 기록 - 판마다 남긴 시각(savedAt)으로 30분 규칙을 따진다 */
type LocalVersion = DocVersion & { savedAt: string };

export interface DocStore {
  /** 휴지통에 든 문서도 들어 있다(trashedAt) - 화면이 가려 쓴다 */
  docs: Doc[];
  ready: boolean;
  create(input: {
    title: string; body: string; parentId: string | null; author: string;
    icon?: string; labels?: string[]; order?: number;
  }): Doc;
  update(id: string, patch: Partial<Doc>): void;
  /** 영구 삭제 - 하위 문서까지 함께 지운다 */
  remove(id: string): void;
  /** 손대지 않은 예시 문서를 지운다. 그 아래에 사람이 쓴 문서가 있으면 위로 올려 남긴다 */
  clearSamples(): void;
  /**
   * 저장소가 받쳐 주는 위키 기능. Supabase 에 위키 표를 아직 만들지 않았으면(SQL 을 다시 실행하기 전)
   * 아이콘 · 휴지통 · 기록 · 댓글 · 파일을 쓰지 않고 예전처럼 문서만 쓴다
   */
  features: { wiki: boolean; files: boolean };
  /** 문서의 예전 모습 - 새것부터 */
  versions(docId: string): Promise<DocVersion[]>;
  /** 지금 모습을 기록에 남긴다 - 예전 판으로 되돌리기 직전에 */
  snapshot(docId: string): Promise<void>;
  comments: DocComment[];
  addComment(input: { docId: string; parentId: string | null; body: string; author: string }): void;
  updateComment(id: string, patch: Partial<Pick<DocComment, 'body' | 'resolved' | 'removed'>>): void;
  /** 파일을 올리고 본문에 넣을 주소를 돌려준다 */
  upload(file: File, docId: string): Promise<string>;
  /** 본문의 파일 주소(tmfile:) → 볼 수 있는 주소 */
  fileUrl(src: string): Promise<string>;
  /** Supabase 모드 - 보내는 중 · 실패 */
  sync?: SyncState;
  /** Supabase 모드 - 처음 목록을 읽지 못했을 때의 문구. 한 번 읽은 뒤에는 생기지 않는다 */
  loadError?: string | null;
  /** Supabase 모드 - 다른 곳에서 지워 화면에서 뺀 문서 → 보내지 못한 고침이 있었는가 */
  deletedElsewhere?: ReadonlyMap<string, boolean>;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
  /** Supabase 모드 - 서버 목록을 다시 읽는다 */
  reload?(): Promise<void>;
}

/* ── 그림 줄이기 - 브라우저 저장 모드는 그림을 본문에 data: 로 넣는다 ── */

const MAX_EDGE = 1600;

/** 가로 · 세로 1600px 안으로 줄여 WebP(못 하면 JPEG)로. 움직이는 GIF 는 그대로 둔다 */
export async function shrinkImage(file: File): Promise<string> {
  const asDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('그림을 읽지 못했습니다'));
    r.readAsDataURL(blob);
  });
  if (file.type === 'image/gif') return asDataUrl(file);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('그림을 열지 못했습니다'));
      i.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const webp = canvas.toDataURL('image/webp', 0.86);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function useDocStore(opts?: StoreOptions): DocStore {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [comments, setComments] = useState<DocComment[]>([]);
  const [ready, setReady] = useState(false);
  const seq = useRef(0);
  /* 지금 목록 - 한 동작에서 여러 번 고쳐도 앞의 고침 위에 쌓이게 바로 읽는다(기록 · 저장은 갱신 함수 밖에서) */
  const docsRef = useRef<Doc[]>([]);
  const commentsRef = useRef<DocComment[]>([]);
  /** 기록 - 고칠 때마다 저장소에서 다시 읽지 않게 들고 있는다(그림이 든 본문이면 수 MB) */
  const versionsRef = useRef<Record<string, LocalVersion[]>>({});
  const onError = useRef(opts?.onError);
  onError.current = opts?.onError;
  /** 저장 칸이 꽉 찼다고 이미 알렸는가 - 칠 때마다 알리지 않는다 */
  const full = useRef(false);
  const warnFull = useCallback((ok: boolean) => {
    if (ok) { full.current = false; return; }
    if (full.current) return;
    full.current = true;
    onError.current?.('브라우저 저장 공간이 꽉 차 저장하지 못했습니다. 그림이 많은 문서를 줄이거나 휴지통을 비워 주세요.');
  }, []);
  const commitDocs = useCallback((next: Doc[]) => {
    docsRef.current = next;
    setDocs(next);
    warnFull(writeJson(KEY, next));
  }, [warnFull]);
  const commitComments = useCallback((next: DocComment[]) => {
    commentsRef.current = next;
    setComments(next);
    warnFull(writeJson(COMMENTS_KEY, next));
  }, [warnFull]);
  /** 기록 저장 - 칸이 모자라면 문서마다 최근 5판만 남기고, 그래도 안 되면 기록을 비운다(문서 본문이 먼저다) */
  const commitVersions = useCallback((all: Record<string, LocalVersion[]>) => {
    versionsRef.current = all;
    if (writeJson(VERSIONS_KEY, all)) return;
    const slim = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.slice(0, 5)]));
    versionsRef.current = slim;
    if (writeJson(VERSIONS_KEY, slim)) return;
    versionsRef.current = {};
    writeJson(VERSIONS_KEY, {});
  }, []);

  useEffect(() => {
    const loaded = read() ?? seed();
    docsRef.current = loaded;
    setDocs(loaded);
    seq.current = loaded.length;
    commentsRef.current = readJson<DocComment[]>(COMMENTS_KEY) ?? [];
    setComments(commentsRef.current);
    versionsRef.current = readJson<Record<string, LocalVersion[]>>(VERSIONS_KEY) ?? {};
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === KEY) {
          docsRef.current = (JSON.parse(e.newValue) as Doc[]).map(normalize);
          setDocs(docsRef.current);
        }
        if (e.key === COMMENTS_KEY) {
          commentsRef.current = JSON.parse(e.newValue) as DocComment[];
          setComments(commentsRef.current);
        }
        if (e.key === VERSIONS_KEY) versionsRef.current = JSON.parse(e.newValue) as Record<string, LocalVersion[]>;
      } catch { /* 깨진 값은 무시 */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const create = useCallback<DocStore['create']>((input) => {
    seq.current += 1;
    const now = new Date().toISOString();
    const doc = normalize({
      id: `d${now}-${seq.current}`,
      title: input.title,
      parentId: input.parentId,
      body: input.body,
      author: input.author,
      labels: input.labels ?? [],
      order: input.order ?? Date.now(),
      icon: input.icon ?? '',
      updatedBy: input.author,
      createdAt: now,
      updatedAt: now,
    });
    commitDocs([...docsRef.current, doc]);
    return doc;
  }, [commitDocs]);

  const update = useCallback<DocStore['update']>((id, patch) => {
    const prev = docsRef.current;
    const old = prev.find((d) => d.id === id);
    if (!old) return;
    const now = new Date().toISOString();
    const content = (patch.title !== undefined && patch.title !== old.title) || (patch.body !== undefined && patch.body !== old.body);
    if (content) {
      // 새로 고치기 시작했으면 고치기 전 모습을 남긴다 - 고친 사람이 바뀌었거나, 10분 쉬었거나, 30분마다
      const list = versionsRef.current[id] ?? [];
      const editor = patch.updatedBy ?? old.updatedBy;
      const idle = Date.now() - Date.parse(old.updatedAt) > HISTORY_IDLE_MS;
      const stale = !list.length || Date.now() - Date.parse(list[0].savedAt) > HISTORY_EVERY_MS;
      const same = list[0] && list[0].title === old.title && list[0].body === old.body;
      if ((editor !== old.updatedBy || idle || stale) && !same) {
        const v: LocalVersion = {
          id: `v${now}-${list.length}`, docId: id, title: old.title, body: old.body,
          editedBy: old.updatedBy, editedAt: old.updatedAt, savedAt: now,
        };
        commitVersions({ ...versionsRef.current, [id]: [v, ...list].slice(0, LOCAL_VERSIONS_PER_DOC) });
      }
    }
    commitDocs(prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: now } : d)));
  }, [commitDocs, commitVersions]);

  const remove = useCallback<DocStore['remove']>((id) => {
    const prev = docsRef.current;
    // 하위 문서가 고아로 남지 않도록 가지째 지운다
    const doomed = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      prev.forEach((d) => {
        if (d.parentId && doomed.has(d.parentId) && !doomed.has(d.id)) {
          doomed.add(d.id);
          grew = true;
        }
      });
    }
    commitDocs(prev.filter((d) => !doomed.has(d.id)));
    // 지운 문서의 기록 · 댓글도 함께(Supabase 에서는 DB 가 함께 지운다)
    const all = { ...versionsRef.current };
    doomed.forEach((d) => { delete all[d]; });
    commitVersions(all);
    const kept = commentsRef.current.filter((c) => !doomed.has(c.docId));
    if (kept.length !== commentsRef.current.length) commitComments(kept);
  }, [commitDocs, commitComments, commitVersions]);

  const clearSamples = useCallback(() => {
    const prev = docsRef.current;
    const gone = new Set(prev.filter(isUntouchedSampleDoc).map((d) => d.id));
    if (gone.size === 0) return;
    const byId = new Map(prev.map((d) => [d.id, d]));
    // 지워지는 문서 밑에 사람이 쓴 문서가 달려 있을 수 있다. 같이 지우지 않고,
    // 살아남는 가장 가까운 조상 밑으로(없으면 최상위로) 옮긴다.
    const survivingParent = (id: string | null): string | null => {
      let cur = id;
      while (cur && gone.has(cur)) cur = byId.get(cur)?.parentId ?? null;
      return cur;
    };
    commitDocs(prev
      .filter((d) => !gone.has(d.id))
      .map((d) => (d.parentId && gone.has(d.parentId) ? { ...d, parentId: survivingParent(d.parentId) } : d)));
  }, [commitDocs]);

  const versions = useCallback<DocStore['versions']>(async (docId) =>
    (versionsRef.current[docId] ?? []).map(({ savedAt: _saved, ...v }) => v), []);

  const snapshot = useCallback<DocStore['snapshot']>(async (docId) => {
    const d = docsRef.current.find((x) => x.id === docId);
    if (!d) return;
    const list = versionsRef.current[docId] ?? [];
    if (list[0] && list[0].body === d.body && list[0].title === d.title) return;
    const now = new Date().toISOString();
    commitVersions({
      ...versionsRef.current,
      [docId]: [{
        id: `v${now}-${list.length}`, docId, title: d.title, body: d.body, editedBy: d.updatedBy, editedAt: d.updatedAt, savedAt: now,
      }, ...list].slice(0, LOCAL_VERSIONS_PER_DOC),
    });
  }, [commitVersions]);

  const addComment = useCallback<DocStore['addComment']>((input) => {
    const now = new Date().toISOString();
    const c: DocComment = {
      id: `c${now}-${Math.random().toString(36).slice(2, 7)}`,
      docId: input.docId, parentId: input.parentId, author: input.author, body: input.body,
      resolved: false, removed: false, createdAt: now, updatedAt: now,
    };
    commitComments([...commentsRef.current, c]);
  }, [commitComments]);

  const updateComment = useCallback<DocStore['updateComment']>((id, patch) => {
    const now = new Date().toISOString();
    commitComments(commentsRef.current.map((c) => {
      if (c.id !== id) return c;
      const body = patch.removed ? '' : patch.body ?? c.body;
      return { ...c, ...patch, body, updatedAt: patch.body !== undefined && !patch.removed ? now : c.updatedAt };
    }));
  }, [commitComments]);

  const upload = useCallback<DocStore['upload']>(async (file) => {
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      throw new Error('이 브라우저 저장 모드에서는 그림(png · jpg · gif · webp)만 넣을 수 있습니다');
    }
    if (file.size > 15 * 1024 * 1024) throw new Error('15MB 넘는 그림은 넣을 수 없습니다');
    const data = await shrinkImage(file);
    if (data.length > 2_500_000) throw new Error('그림이 너무 큽니다. 더 작은 그림을 넣어 주세요');
    return data;
  }, []);

  const fileUrl = useCallback<DocStore['fileUrl']>(async (src) => src, []);

  return {
    docs, ready, create, update, remove, clearSamples,
    features: { wiki: true, files: true },
    versions, snapshot, comments, addComment, updateComment, upload, fileUrl,
  };
}
