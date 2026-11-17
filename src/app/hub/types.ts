/** 작업 관리 도구 - 마케팅 사이트의 타입과 공유하지 않는 독립 모델 */

export type Status = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
/** 영역 id - 처음 네 개(web · game · edu · ops) 말고는 관리자가 만든 영역이다(tm_domains) */
export type DomainKey = string;
/** 영역 색 - 빨강 · 호박색 · 초록은 급함 · 임박 · 끝남의 뜻으로만 써서 영역에는 주지 않는다 */
export type DomainColor = 'blue' | 'violet' | 'teal' | 'gray';

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
  /** Supabase 계정일 때만 - 영역을 고칠 수 있는지. 관리자와 따로, SQL Editor 에서만 정한다 */
  domainEditor?: boolean;
  /** Supabase 계정일 때만 - 프로필 사진 주소(공개 저장소의 256px 정사각 그림). 없으면 이니셜을 그린다 */
  avatar?: string;
}

/** 작업을 가르는 갈래(웹 · 앱, 게임 · XR …). 메뉴 · 보드 · 타임라인 · 로드맵이 이 순서로 줄을 세운다 */
export interface Domain {
  id: DomainKey;
  label: string;
  /** 보드 카드의 알약에 쓰는 짧은 이름 - 비어 있으면 이름을 쓴다 */
  short: string;
  color: DomainColor;
  /** 메뉴 순서. 작을수록 위 */
  order: number;
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
  /**
   * 상위 업무(Task.id) - 없으면 맨 위 업무. 상위 업무를 지워도 이 칸은 그대로 두어 실행 취소로 되살리면 다시 이어진다.
   * 그래서 없는 작업을 가리킬 수 있고, 화면은 그때 맨 위 업무로 본다(parentOf). 예전 저장본 · 칸이 없는 DB 에서는 비어 있다
   */
  parentId?: string | null;
  /** 같은 상태 안에서의 정렬 순서. 작을수록 위. */
  order: number;
  createdAt: string;
  updatedAt: string;
}

/* ── 상위 · 하위 업무 ── 고리(서로가 서로의 상위)는 화면과 DB(tm_tasks_guard)가 막지만, 두 사람이 동시에 고치면
   생길 수 있어 위아래로 따라갈 때는 늘 지나온 작업을 센다 */

/** 상위 업무 - 지운 작업 · 자기 자신을 가리키면 없는 것으로 본다 */
export function parentOf(t: Task, byId: ReadonlyMap<string, Task>): Task | null {
  const p = t.parentId ? byId.get(t.parentId) : undefined;
  return p && p.id !== t.id ? p : null;
}

/** 위로 따라간 상위 업무들 - 가까운 것부터 */
export function ancestorsOf(t: Task, byId: ReadonlyMap<string, Task>): Task[] {
  const out: Task[] = [];
  const seen = new Set([t.id]);
  for (let cur = parentOf(t, byId); cur && !seen.has(cur.id); cur = parentOf(cur, byId)) {
    out.push(cur);
    seen.add(cur.id);
  }
  return out;
}

/** 아래로 따라간 모든 하위 업무의 id - 이 작업의 상위로 고르면 고리가 되는 것들 */
export function descendantIds(id: string, tasks: readonly Task[]): Set<string> {
  const kids = new Map<string, string[]>();
  tasks.forEach((t) => {
    if (t.parentId) kids.set(t.parentId, [...(kids.get(t.parentId) ?? []), t.id]);
  });
  const out = new Set<string>();
  const stack = [id];
  while (stack.length) {
    (kids.get(stack.pop() as string) ?? []).forEach((k) => {
      if (k !== id && !out.has(k)) {
        out.add(k);
        stack.push(k);
      }
    });
  }
  return out;
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

/** 처음 네 영역 - 브라우저 저장 모드의 처음 값이자, 영역 표(tm_domains)가 아직 없는 DB 에서 쓰는 값 */
export const DEFAULT_DOMAINS: Domain[] = [
  { id: 'web', label: '웹 · 앱', short: 'WEB', color: 'blue', order: 1000 },
  { id: 'game', label: '게임 · XR', short: 'GAME', color: 'violet', order: 2000 },
  { id: 'edu', label: '교육 · 강의', short: 'EDU', color: 'teal', order: 3000 },
  { id: 'ops', label: '내부 · 운영', short: 'OPS', color: 'gray', order: 4000 },
];

export const DOMAIN_COLORS: { id: DomainColor; label: string }[] = [
  { id: 'blue', label: '파랑' },
  { id: 'violet', label: '보라' },
  { id: 'teal', label: '청록' },
  { id: 'gray', label: '회색' },
];

export const isDomainColor = (v: unknown): v is DomainColor => DOMAIN_COLORS.some((c) => c.id === v);

/**
 * 사람 · 라벨의 색 - 캘린더 · 타임라인의 작업 바탕과 아바타. 영역 색처럼 빨강 · 호박색 · 초록은 주지 않는다.
 * 이 순서가 곧 자동 색의 순서다(팀원은 목록 순서대로 하나씩)
 */
export type TaskColor = 'blue' | 'violet' | 'teal' | 'pink' | 'sky' | 'plum' | 'brown' | 'gray';

export const TASK_COLORS: { id: TaskColor; label: string }[] = [
  { id: 'blue', label: '파랑' },
  { id: 'violet', label: '보라' },
  { id: 'teal', label: '청록' },
  { id: 'pink', label: '분홍' },
  { id: 'sky', label: '하늘' },
  { id: 'plum', label: '자주' },
  { id: 'brown', label: '갈색' },
  { id: 'gray', label: '회색' },
];

export const isTaskColor = (v: unknown): v is TaskColor => TASK_COLORS.some((c) => c.id === v);

/** 고른 색 한 줄 - id 는 'member:<팀원 id>' · 'label:<라벨>' */
export interface ColorPick {
  id: string;
  color: TaskColor;
}

/** 캘린더 · 타임라인에서 작업 바탕을 무엇의 색으로 칠할지 */
export type ColorBy = 'member' | 'label' | 'domain';
export const COLOR_BYS: { id: ColorBy; label: string }[] = [
  { id: 'member', label: '사람 색' },
  { id: 'label', label: '라벨 색' },
  { id: 'domain', label: '영역 색' },
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
  {
    id: 'project',
    name: '프로젝트 정보',
    hint: '개요 · 고객 · 담당 개발자 · 관련 작업',
    title: '프로젝트 이름',
    body: [
      '## 개요', '', '무엇을 누구에게 만들어 주는지 한 문단으로.', '',
      '## 고객 · 연락 창구', '', '| 항목 | 내용 |', '| --- | --- |', '| 고객 |  |', '| 연락 창구 |  |', '',
      '## 담당 개발자', '', '> 개발자 문서를 문서 링크로 걸면 마인드맵에서 이 문서와 점선으로 이어집니다.', '', '- ', '',
      '## 관련 작업', '', '> 작업 번호를 적으면 마인드맵에서 이 문서에 작업이 붙습니다.', '', '- ', '',
      '## 주요 결정 · 회의록', '', '> 회의록 · 요구사항은 이 문서 아래에 하위 문서로 만듭니다.', '', '- ', '',
    ].join('\n'),
  },
  {
    id: 'people',
    name: '개발자 정보',
    hint: '역할 · 맡은 프로젝트 · 기술 · 연락',
    title: '팀원 이름',
    body: [
      '> 제목을 팀원 이름과 똑같이 쓰면 마인드맵에 그 사람이 맡은 작업 수가 붙습니다.', '',
      '## 역할', '', '- ', '',
      '## 맡은 프로젝트', '', '> 프로젝트 문서를 문서 링크로 걸면 마인드맵에서 점선으로 이어집니다.', '', '- ', '',
      '## 다루는 기술 · 도구', '', '- ', '',
      '## 연락 · 일하는 시간', '', '| 항목 | 내용 |', '| --- | --- |', '| 연락 |  |', '| 일하는 시간 |  |', '',
      '## 인수인계 메모', '', '- ', '',
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

/* ── 보고(일간 · 주간) ────────────────────────────── */

/** 일간보고 명단의 한 사람 - 관리자가 이름 · 순서를 고친다. 계정이 없는 사람도 넣을 수 있다 */
export interface ReportPerson {
  id: string;
  name: string;
  /** 연결한 팀원 계정(Member.id). 비워 두면 이름이 같은 계정을 쓴다 */
  member: string | null;
  /** 스크럼 순서. 작을수록 위 */
  order: number;
}

/** 처음 명단 - 2026-11-16 에 정한 스크럼 순서. 그 뒤로는 관리자가 화면에서 고친다 */
export const DEFAULT_REPORT_PEOPLE = ['박무경', '정성권', '전승원', '박예형', '강민정', '김학동', '조현민', '이지영', '박수현'];

export type DailyField = 'done' | 'plan' | 'blocker';

/** 일간보고 칸 - 이 순서로 보인다(이름 다음) */
export const DAILY_FIELDS: { id: DailyField; label: string; hint: string }[] = [
  { id: 'done', label: '완료', hint: '지난 보고 뒤에 끝낸 일' },
  { id: 'plan', label: '예정', hint: '오늘 할 일' },
  { id: 'blocker', label: '블로커 & 공유사항', hint: '막힌 것 · 도움 요청 · 알릴 것' },
];

/** 일간보고 한 줄 - 하루 · 한 사람에 하나. 칸마다 한 줄에 한 가지씩 적는다 */
export interface DailyEntry {
  /** `${day}:${person}` - 두 사람이 같은 칸을 처음 적어도 한 줄로 모인다 */
  id: string;
  /** YYYY-MM-DD */
  day: string;
  /** ReportPerson.id */
  person: string;
  /** 적을 때의 이름 - 명단에서 빠져도 그날 보고에 남는다 */
  name: string;
  done: string;
  plan: string;
  blocker: string;
  /** 마지막으로 고친 팀원(Member.id) - Supabase 모드에서는 DB 가 적는다 */
  updatedBy: string | null;
  updatedAt: string;
}

export type WeeklyStatus = 'draft' | 'final';
export type WeeklyText = 'summary' | 'issues' | 'nextPlan' | 'notes';

/**
 * 확정 시점 저장본 - 확정할 때의 숫자 · 명단 · 일간 근거를 그대로 남긴다(Supabase 모드는 서버가 만든다).
 * 확정한 보고의 화면과 글 복사는 이것을 쓰고, 그 뒤의 작업 보드 값은 '현재 참고'로 따로 본다
 */
export interface WeeklySnapshot {
  v: 1;
  /** 확정한 시각 */
  at: string;
  /** 확정한 날(한국 시간) YYYY-MM-DD - 작성 현황의 '지난 평일'을 이 날까지로 센다 */
  today: string;
  numbers: { dueThisWeek: number; dueThisWeekDone: number; created: number; doing: number; overdue: number };
  nextWeek: { id: string; key: string; title: string; due: string; assignee: string | null }[];
  /** 확정 때 명단(순서대로) */
  people: { id: string; name: string }[];
  /** 무엇이라도 적은 날 - 명단에서 빠진 사람도 들어간다 */
  written: { person: string; name: string; day: string }[];
  blockers: { person: string; name: string; day: string; text: string }[];
  done: { person: string; name: string; day: string; text: string }[];
}

/** 주간보고 한 장 - 직접 쓰는 칸. 숫자 · 사람별 실적 · 블로커 모음은 화면이 작업 보드와 일간보고에서 모은다 */
export interface WeeklyReport {
  /** 그 주 월요일 YYYY-MM-DD */
  id: string;
  summary: string;
  issues: string;
  nextPlan: string;
  notes: string;
  /** 확정하면 칸이 잠긴다(Supabase 모드는 서버도 막는다). 승인된 팀원 누구나 '다시 고치기'로 연다 */
  status: WeeklyStatus;
  /** 마지막으로 확정한 사람 · 시각 · 저장본 - 다시 고쳐도 '직전 확정'으로 남는다. 예전 확정본에는 없다 */
  finalizedBy: string | null;
  finalizedAt: string | null;
  snapshot: WeeklySnapshot | null;
  updatedBy: string | null;
  updatedAt: string;
}

/** 프로젝트 상태 - 초록 · 호박색 · 빨강은 작업 관리에서 끝남 · 임박 · 급함의 뜻이라 그대로 쓴다 */
export type ProjectState = 'good' | 'watch' | 'risk';
export const PROJECT_STATES: { id: ProjectState; label: string }[] = [
  { id: 'good', label: '순조' },
  { id: 'watch', label: '주의' },
  { id: 'risk', label: '위험' },
];
export const isProjectState = (v: unknown): v is ProjectState => PROJECT_STATES.some((s) => s.id === v);

/** 주간보고의 프로젝트별 현황 한 줄 - 줄마다 따로 저장해 두 사람이 다른 줄을 함께 고쳐도 덮지 않는다 */
export interface WeeklyItem {
  id: string;
  /** 그 주 월요일 */
  week: string;
  name: string;
  state: ProjectState;
  /** 이번 주 한 일 */
  done: string;
  /** 다음 주 할 일 */
  next: string;
  issue: string;
  order: number;
  updatedBy: string | null;
  updatedAt: string;
}
