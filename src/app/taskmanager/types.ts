/** 작업 관리 도구 - 마케팅 사이트의 타입과 공유하지 않는 독립 모델 */

export type Status = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type DomainKey = 'web' | 'game' | 'edu' | 'ops';

export interface Member {
  id: string;
  name: string;
  /** 아바타에 쓰는 이니셜 */
  initial: string;
  role: string;
  /** Supabase 계정일 때만 - 로그인 메일 */
  email?: string;
  /** Supabase 계정일 때만 - 다른 팀원이 승인했는지. 브라우저 저장 모드의 자리표시 목록은 늘 참으로 본다 */
  active?: boolean;
  /** Supabase 계정일 때만 - 승인 · 승인 취소 · 관리자 지정을 할 수 있는지 */
  isAdmin?: boolean;
}

/** 이름에서 아바타 글자를 만든다 - 한글은 이름 두 글자(박무경 → 무경), 영문은 머리글자 */
export function initialOf(name: string): string {
  const n = name.trim();
  if (!n) return '?';
  if (/[가-힣]/.test(n)) return n.length >= 3 ? n.slice(-2) : n;
  const words = n.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : n.slice(0, 2)).toUpperCase();
}

export interface Task {
  id: string;
  /** MATE-12 처럼 보이는 사람이 부르는 번호 */
  key: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  domain: DomainKey;
  /** Member.id - 미배정이면 null */
  assignee: string | null;
  /** YYYY-MM-DD, 없으면 null - 타임라인 막대의 시작 */
  start: string | null;
  /** YYYY-MM-DD, 없으면 null */
  due: string | null;
  labels: string[];
  /** 같은 상태 안에서의 정렬 순서. 작을수록 위. */
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const STATUSES: { id: Status; label: string; hint: string }[] = [
  { id: 'backlog', label: '백로그', hint: '아직 착수하지 않음' },
  { id: 'todo', label: '할 일', hint: '이번 주기에 할 것' },
  { id: 'doing', label: '진행 중', hint: '지금 손대고 있는 것' },
  { id: 'review', label: '리뷰', hint: '확인·검수 대기' },
  { id: 'done', label: '완료', hint: '끝난 것' },
];

export const PRIORITIES: { id: Priority; label: string; rank: number }[] = [
  { id: 'urgent', label: '긴급', rank: 0 },
  { id: 'high', label: '높음', rank: 1 },
  { id: 'normal', label: '보통', rank: 2 },
  { id: 'low', label: '낮음', rank: 3 },
];

export const DOMAINS: { id: DomainKey; label: string; short: string }[] = [
  { id: 'web', label: '웹 · 앱', short: 'WEB' },
  { id: 'game', label: '게임 · XR', short: 'GAME' },
  { id: 'edu', label: '교육 · 강의', short: 'EDU' },
  { id: 'ops', label: '내부 · 운영', short: 'OPS' },
];

export const MEMBERS: Member[] = [
  { id: 'm1', name: '개발 1', initial: 'D1', role: '클라이언트' },
  { id: 'm2', name: '개발 2', initial: 'D2', role: '서버' },
  { id: 'm3', name: '개발 3', initial: 'D3', role: 'XR' },
  { id: 'm4', name: '개발 4', initial: 'D4', role: '웹' },
  { id: 'm5', name: '디자인 1', initial: 'G1', role: 'UI/UX' },
  { id: 'm6', name: '디자인 2', initial: 'G2', role: '그래픽' },
  { id: 'm7', name: '운영 1', initial: 'O1', role: 'PM' },
];

export const memberById = (id: string | null) =>
  id ? MEMBERS.find((m) => m.id === id) ?? null : null;

export const statusLabel = (s: Status) => STATUSES.find((x) => x.id === s)?.label ?? s;
export const priorityLabel = (p: Priority) => PRIORITIES.find((x) => x.id === p)?.label ?? p;
export const domainLabel = (d: DomainKey) => DOMAINS.find((x) => x.id === d)?.label ?? d;
export const domainShort = (d: DomainKey) => DOMAINS.find((x) => x.id === d)?.short ?? d;

/* ── 날짜 ─────────────────────────────────────────── */

/** Date → 이 기기 시간대의 YYYY-MM-DD. toISOString 은 UTC 라 한국에서는 오전 9시 전이 전날로 나온다 */
export const localISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 오늘(이 기기 시간대) YYYY-MM-DD */
export const localToday = () => localISO(new Date());

/** createdAt · updatedAt 같은 시각 문자열 → 이 기기 시간대의 날짜. 읽지 못하면 앞 10글자 */
export const localDay = (stamp: string) => {
  const d = new Date(stamp);
  return Number.isNaN(d.getTime()) ? stamp.slice(0, 10) : localISO(d);
};

/* ── 문서 ─────────────────────────────────────────── */

export interface Doc {
  id: string;
  title: string;
  /** 상위 문서 id - 최상위는 null */
  parentId: string | null;
  /** 마크다운 본문 - 문법은 docMarkdown.ts */
  body: string;
  /** Member.id */
  author: string;
  labels: string[];
  /** 같은 깊이에서의 정렬 */
  order: number;
  createdAt: string;
  updatedAt: string;
  /** 제목 앞의 이모지. 없으면 '' */
  icon: string;
  /** 마지막으로 제목 · 본문을 고친 사람(Member.id). 모르면 null */
  updatedBy: string | null;
  /** 휴지통에 넣은 시각 - null 이면 살아 있는 문서. 아래 문서는 함께 숨는다 */
  trashedAt: string | null;
  trashedBy: string | null;
}

/** 문서의 예전 모습 - 새로 고치기 시작하기 직전의 제목 · 본문 */
export interface DocVersion {
  id: string;
  docId: string;
  title: string;
  body: string;
  /** 이 모습으로 마지막에 고친 사람 */
  editedBy: string | null;
  /** 이 모습이 저장된 시각 */
  editedAt: string;
}

/** 문서 댓글 - parentId 가 있으면 그 댓글의 답글(한 단계만) */
export interface DocComment {
  id: string;
  docId: string;
  parentId: string | null;
  author: string;
  body: string;
  /** 맨 위 댓글만 - 해결되어 접어 둔 스레드 */
  resolved: boolean;
  /** 지운 댓글 - 답글이 이어지게 자리만 남긴다 */
  removed: boolean;
  createdAt: string;
  /** 본문을 고친 시각. createdAt 과 다르면 '수정됨' */
  updatedAt: string;
}

/** 새 문서를 만들 때 고르는 양식 */
export interface DocTemplate {
  id: string;
  name: string;
  hint: string;
  title: string;
  body: string;
}

const dateLine = '작성일 · 작성자를 채우고 시작하세요.';

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 'blank',
    name: '빈 문서',
    hint: '아무 틀 없이 시작',
    title: '제목 없는 문서',
    body: '',
  },
  {
    id: 'meeting',
    name: '회의록',
    hint: '참석자 · 논의 · 결정 · 액션 아이템',
    title: '회의록',
    body: [
      '## 개요', '', '| 항목 | 내용 |', '| --- | --- |', '| 일시 |  |',
      '| 참석 |  |', '| 안건 |  |', '', '## 논의', '', '- ', '',
      '## 결정', '', '> 결정된 내용만 적습니다. 논의 중인 것은 위에 둡니다.', '',
      '- ', '', '## 할 일', '', '| 내용 | 담당 | 기한 |', '| --- | --- | --- |',
      '|  |  |  |', '',
    ].join('\n'),
  },
  {
    id: 'spec',
    name: '요구사항 정의서',
    hint: '배경 · 범위 · 화면 · 완료 조건',
    title: '요구사항 정의서',
    body: [
      '## 배경', '', '무엇 때문에 만드는지 한 문단으로.', '',
      '## 범위', '', '### 포함', '', '- ', '', '### 제외', '', '- ', '',
      '## 화면', '', '| 화면 | 설명 | 비고 |', '| --- | --- | --- |', '|  |  |  |', '',
      '## 완료 조건', '', '> 이 항목이 전부 참이면 끝난 것으로 본다.', '', '- [ ] ', '',
      '## 열린 질문', '', '- ', '',
    ].join('\n'),
  },
  {
    id: 'adr',
    name: '기술 결정 기록',
    hint: '맥락 · 선택지 · 결정 · 결과',
    title: '기술 결정 기록',
    body: [
      '> 상태: 제안 | 채택 | 폐기', '', '## 맥락', '',
      '어떤 상황에서 이 결정이 필요해졌는지.', '',
      '## 검토한 선택지', '', '| 안 | 장점 | 단점 |', '| --- | --- | --- |',
      '|  |  |  |', '', '## 결정', '', '채택한 안과 그 이유.', '',
      '## 결과', '', '이 결정으로 무엇이 쉬워지고 무엇이 어려워지는지.', '',
    ].join('\n'),
  },
  {
    id: 'handover',
    name: '인수인계 문서',
    hint: '구성 · 배포 · 계정 · 주의점',
    title: '인수인계 문서',
    body: [
      '## 저장소', '', '| 항목 | 값 |', '| --- | --- |', '| 저장소 |  |',
      '| 기본 브랜치 |  |', '', '## 실행', '', '```', 'npm install', 'npm run dev',
      '```', '', '## 배포', '', '- ', '', '## 계정 · 권한', '',
      '> 비밀번호와 키는 이 문서에 적지 않습니다. 보관 위치만 적습니다.', '', '- ', '',
      '## 알아둘 점', '', '- ', '',
    ].join('\n'),
  },
  {
    id: 'retro',
    name: '회고',
    hint: '잘된 것 · 아쉬운 것 · 다음에 할 것',
    title: '회고',
    body: [
      '## 돌아보는 기간', '', dateLine, '', '## 잘된 것', '', '- ', '',
      '## 아쉬운 것', '', '- ', '', '## 다음에 바꿀 것', '',
      '> 다음 주기에 실제로 실행할 것만 적습니다.', '', '- ', '',
    ].join('\n'),
  },
];

/* ── 개인 메모 ────────────────────────────────────── */

/** 쓴 사람만 보는 메모 - 팀 위키와 달리 다른 팀원에게 보이지 않는다 */
export interface Memo {
  id: string;
  /** Member.id - 쓴 사람. Supabase 모드에서는 이 사람만 읽고 쓴다(RLS) */
  owner: string;
  /** 비워 둘 수 있다 - 목록에는 본문 첫 줄이 대신 나온다 */
  title: string;
  /** 꾸밈 없는 글 */
  body: string;
  createdAt: string;
  updatedAt: string;
}
