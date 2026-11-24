'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOCAL_ME_KEY, isUntouchedSample, useTaskStore, type Store, type StoreOptions } from './store';
import { liveDocCount, useDocStore, type DocStore } from './docStore';
import { useMemoStore, type MemoStore } from './memoStore';
import { DomainsContext, defaultDomain, domainOf, useDomainStore, type DomainStore } from './domainStore';
import { ColorsContext, useColorStore, type ColorStore } from './colorStore';
import {
  COLOR_BYS, MEMBERS, PRIORITIES, STATUSES,
  localISO, memberById, parentOf, priorityLabel, visibleTo,
  type ColorBy, type DomainColor, type DomainKey, type Member, type Priority, type Status, type Task,
} from './types';
import {
  Avatar, DOMAIN_FILL, DomainChip, DueBadge, IconChevron, IconNav, IconPlus, IconSearch, Modal, ThemeCycle, ThemeSwitch,
  PRIORITY_STYLE, PageHead, ParentLine, PriorityDot, STATUS_STYLE, StatusPill, SubCount, TaskCard, TaskMarks, Toast,
  tmBtn, tmBtnPrimary, tmCallout, tmCount, tmEditBtn, tmGhostBtn, tmIconBtnSm, tmInput, tmSelect, tmTab, tmTextBtn,
  useMediaQuery, type NavIcon,
} from './ui';
import { NewTaskDialog, TaskPanel, type Draft, type Extras } from './TaskPanel';
import Timeline, { useToday } from './Timeline';
import Calendar from './Calendar';
import Roadmap from './Roadmap';
/* 위키 편집기(TipTap)는 크다 - 위키를 열 때만 받아 작업 보드의 첫 로딩을 가볍게 둔다 */
const Docs = dynamic(() => import('./Docs'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
/* 일간 · 주간보고는 열 때만 받고, 그때 보고 표에 붙는다 - 작업 화면의 첫 로딩은 그대로 */
const Reports = dynamic(() => import('./Reports'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
/* 구글 드라이브 트리도 열 때만 받고, 그때 드라이브 목록 표를 읽는다 */
/* 빌드 파일도 열 때만 받고, 그때 드라이브 목록 · 안내 · 댓글 표를 읽는다 */
const Builds = dynamic(() => import('./Builds'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
const Drive = dynamic(() => import('./Drive'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
/* 조직도도 열 때만 받고, 그때 조직도 · 드라이브 목록 표를 읽는다 */
const Org = dynamic(() => import('./Org'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
/* 커뮤니티 > 블로그도 열 때만 받고, 그때 블로그 표에 붙는다 */
const Blog = dynamic(() => import('./Blog'), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-[15px] font-semibold text-tm-sub">불러오는 중…</div>,
});
import Memos from './Memos';
import { isRemote } from './supabase';
import {
  RETRY, importLocal, localLeftovers, skipImport,
  useRemoteColorStore, useRemoteDocStore, useRemoteDomainStore, useRemoteMemoStore, useRemoteTaskStore,
} from './remote';
import { signOut, useAuth, useTeam, type MemberPatch } from './team';
import { MembersContext, useMembers } from './members';
import { LoadingScreen, LoginScreen, PendingScreen, TroubleScreen } from './Gate';
import { TeamDialog } from './TeamDialog';
import { DomainDialog } from './DomainDialog';
import { AllDomainsDialog, useFavDomains } from './DomainFavorites';
import { ColorDialog } from './ColorDialog';

/*
 * 작업 관리 도구의 틀 - 세종호이스트크레인 리뉴얼 관리자의 틀을 옮겼다(2026-10-22).
 * 넓은 화면: 왼쪽 흰 메뉴(로고 · 범위 · 영역 · 위키, 아래에 홈페이지와 지금 쓰는 사람) + 오른쪽 본문.
 * 좁은 화면(900 이하): 위쪽 띠(로고 · 사람 메뉴) + 본문 + 아래쪽 메뉴(자주 쓰는 셋 + 전체 메뉴 창).
 * 본문은 화면 높이에 맞춰 두고, 보드 칸 · 표 · 타임라인이 저마다 안에서 스크롤한다.
 *
 * 저장소는 빌드할 때 정해진다(supabase.ts 의 isRemote).
 *   · Supabase 키가 있으면 로그인 → 승인 확인을 거쳐 팀이 함께 쓰는 표(remote.ts)를 읽고 쓴다.
 *     로그인한 계정이 곧 '나'이고, 담당자 목록은 승인된 팀원이다.
 *   · 없으면 예전처럼 이 브라우저에만 저장하고, 자리표시 팀원 가운데 '나'를 고른다(로컬 개발용).
 */

/** 빌드마다 하나로 정해지므로 렌더 사이에 훅 순서가 바뀌지 않는다 */
const useTasks: (opts: StoreOptions) => Store = isRemote ? useRemoteTaskStore : useTaskStore;
const useDocs: (opts: StoreOptions) => DocStore = isRemote ? useRemoteDocStore : useDocStore;
const useMemos: (opts: StoreOptions) => MemoStore = isRemote ? useRemoteMemoStore : useMemoStore;
const useDomainList: (opts: StoreOptions) => DomainStore = isRemote ? useRemoteDomainStore : useDomainStore;
const useColorList: (opts: StoreOptions) => ColorStore = isRemote ? useRemoteColorStore : useColorStore;

/** Supabase 모드에서 로그인한 사람 */
interface Account {
  me: Member;
  members: Member[];
  update(id: string, patch: MemberPatch): Promise<string | null>;
  reject(id: string): Promise<string | null>;
  setAvatar(id: string, photo: Blob | null): Promise<string | null>;
  /** 비밀번호 재설정 메일의 링크로 들어왔다 - 팀원 창을 열어 새 비밀번호를 정하게 한다 */
  recovery?: boolean;
}

type View = 'board' | 'list' | 'timeline' | 'calendar' | 'roadmap';
type Section = 'tasks' | 'org' | 'drive' | 'builds' | 'docs' | 'memos' | 'daily' | 'weekly' | 'blog';

/** 보기 - hint 는 쪽 머리의 설명 줄에 나온다 */
const VIEWS: { id: View; label: string; key: string; hint: string }[] = [
  { id: 'board', label: '보드', key: 'b', hint: '카드를 끌어 다른 단계로 옮깁니다. 카드를 누르면 오른쪽에서 자세히 고칩니다.' },
  { id: 'list', label: '목록', key: 'l', hint: '열 이름을 누르면 그 순서로 줄을 세웁니다.' },
  { id: 'timeline', label: '타임라인', key: 't', hint: '시작일부터 마감일까지를 막대로 봅니다. 막대를 누르면 작업이 열립니다.' },
  { id: 'calendar', label: '캘린더', key: 'c', hint: '시작일부터 마감일까지 막대로 이어집니다. 빈 칸을 누르면 그날 마감인 작업을 만들고, 막대를 끌어 놓으면 기간째 옮깁니다.' },
  { id: 'roadmap', label: '로드맵', key: 'r', hint: '마감일을 주 단위로 나눠 봅니다. 지난 일정은 이번 주에 모아 둡니다. 지난주까지 마감된 완료 작업은 올리지 않습니다.' },
];
type Scope = { kind: 'all' } | { kind: 'mine' } | { kind: 'domain'; id: DomainKey };

/** count 가 없으면 숫자 알약을 그리지 않는다(보고처럼 셀 것이 없는 메뉴) */
type NavItem = { key: string; label: string; icon?: NavIcon; dot?: DomainColor; count?: number; active: boolean; go(): void };
/** 메뉴 묶음 - action 은 묶음 이름 옆의 글자 버튼(영역 '관리') */
type NavGroup = { label?: string; action?: { text: string; label: string; go(): void }; items: NavItem[] };

const PREF_KEY = 'mate.taskmanager.prefs.v1';

/** 보고 화면의 '보고 단축키 S · W'를 끈 사람인가 - Reports.tsx 의 REPORT_KEYS_KEY 와 같은 이름(보고 코드를 첫 짐에 싣지 않으려고 따로 적는다) */
function reportKeysOff(): boolean {
  try {
    return window.localStorage.getItem('mate.taskmanager.reportKeys.v1') === 'off';
  } catch {
    return false;
  }
}

/** 담당자로 걸러 보기 - 'all' 모두 · 'none' 미배정 · 그 밖에는 팀원 id */
type AssigneeFilter = 'all' | 'none' | string;

type Prefs = {
  section: Section; view: View; scope: Scope; priority: Priority | 'all'; hideDone: boolean;
  assignee: AssigneeFilter; colorBy: ColorBy;
  /** 넓은 화면의 왼쪽 메뉴를 아이콘 줄로 접었는지 */
  rail: boolean;
  /** 상위 작업만(하위 업무를 숨김) */
  topOnly: boolean;
};

function readPrefs(): Partial<Prefs> | null {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** 지금 쓰는 사람 - 이름 칸 전체가 고르기 칸이다(보이지 않는 select 를 위에 겹쳤다) */
function MePicker({ me, onPick, id }: { me: string; onPick(id: string): void; id: string }) {
  const m = memberById(me);
  return (
    <div className="relative flex items-center gap-2.5 rounded-tm-sm px-2.5 py-1.5 transition-colors duration-150 hover:bg-tm-tint
                    has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tm-blue">
      <Avatar id={me} size={36} />
      <span className="flex min-w-0 flex-col leading-[1.35]">
        <b className="truncate text-[14.5px] font-bold text-tm-ink">{m?.name ?? '사용자'}</b>
        <small className="text-[12.5px] text-tm-sub">{m ? `${m.role} · ` : ''}바꾸기</small>
      </span>
      <span className="ml-auto flex-none text-tm-sub"><IconChevron /></span>
      <label className="sr-only" htmlFor={id}>지금 쓰는 사람</label>
      <select id={id} value={me} onChange={(e) => onPick(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0">
        {MEMBERS.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.role}</option>)}
      </select>
    </div>
  );
}

/** 로그인한 사람 - 누르면 팀원 창(내 정보 · 비밀번호 · 승인). 승인 대기가 있으면 빨간 숫자 */
function AccountButton({ member, pending, onOpen }: { member: Member; pending: number; onOpen(): void }) {
  return (
    <button type="button" onClick={onOpen} aria-haspopup="dialog"
      className="flex w-full items-center gap-2.5 rounded-tm-sm px-2.5 py-1.5 text-left transition-colors duration-150 hover:bg-tm-tint">
      <span className="relative flex-none">
        <Avatar id={member.id} size={36} />
        {pending > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-tm-red px-1 text-[11px] font-bold leading-none text-white ring-2 ring-tm-card">
            {pending}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col leading-[1.35]">
        <b className="truncate text-[14.5px] font-bold text-tm-ink">{member.name}</b>
        <small className="truncate text-[12.5px] text-tm-sub">
          {pending > 0 ? `승인 대기 ${pending}명 · 팀원` : member.role ? `${member.role} · 팀원` : '팀원 · 내 정보'}
        </small>
      </span>
      <span className="ml-auto flex-none -rotate-90 text-tm-sub"><IconChevron /></span>
    </button>
  );
}

/** 접힌 왼쪽 메뉴의 아래 칸(위젯 앱 · 홈페이지) - 아이콘 위, 짧은 이름 아래 */
const railItem =
  'flex min-h-[50px] w-full flex-col items-center justify-center gap-1 rounded-tm-sm px-1 text-[12px] font-semibold leading-tight text-tm-ink ' +
  'transition-colors duration-150 hover:bg-tm-tint';

const logoutBtn =
  'h-[42px] w-full rounded-tm-sm border border-tm-edge bg-tm-card text-[14px] font-semibold text-tm-ink transition-colors duration-150 ' +
  'hover:border-tm-blue hover:bg-tm-tint disabled:cursor-default disabled:opacity-50 [@media(pointer:coarse)]:h-11';

/* 위젯 앱(android-widget/)을 다시 빌드하면 이 파일도 새 APK 로 바꾼다 */
const WIDGET_APK = '/downloads/mate-today.apk';

/** 갤럭시 위젯 앱 받기 - 설치 순서를 보여 주고 APK 를 내려받는다 */
function WidgetAppDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="갤럭시 위젯 앱 'MATE 오늘'" sub="오늘이 마감일인 작업을 홈 화면 위젯으로 봅니다. 안드로이드 전용입니다."
      size="sm" onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          <a href={WIDGET_APK} download className={`${tmBtnPrimary} hover:border-tm-blue-hover hover:bg-tm-blue-hover`}>
            APK 받기
          </a>
        </>
      }>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-[14.5px] leading-[1.65] text-tm-ink marker:font-bold marker:text-tm-blue">
        <li>휴대폰에서 받습니다. PC 에서 받았다면 카카오톡 나에게 보내기 같은 방법으로 휴대폰에 옮깁니다.</li>
        <li>파일을 열면 묻는 &lsquo;출처를 알 수 없는 앱&rsquo; 설치를 허용합니다.</li>
        <li>Play 프로텍트 안내가 나오면 <b>자세히</b>를 눌러 <b>무시하고 설치</b>합니다. 스토어에 올리지 않은 사내 앱이라 나오는 안내입니다.</li>
        <li>앱을 열어 Hub 와 같은 메일 · 비밀번호로 로그인합니다.</li>
        <li>홈 화면 빈 곳을 길게 눌러 <b>위젯</b>에서 <b>MATE 오늘</b>을 놓고, 내 작업과 팀 전체 중 하나를 고릅니다.</li>
        <li>새 판이 나오면 앱이 저절로 받아 바꿉니다. 처음 한 번은 안드로이드가 확인을 받으니 위젯의 <b>눌러서 업데이트</b>를 누르고 <b>업데이트</b>를 눌러 주세요. 1.0 을 쓰고 있으면 여기서 APK 를 한 번 다시 받아 깝니다.</li>
      </ol>
    </Modal>
  );
}

/* 바탕화면 위젯(windows-widget/)을 다시 빌드하면 windows-widget/tools/release.ps1 이 이 파일과 mate-calendar.json 을 바꾼다 */
const WIN_WIDGET = '/downloads/MATE-Calendar-Setup.exe';

/** Windows 바탕화면 캘린더 위젯 받기 - 설치 순서를 보여 주고 설치 파일을 내려받는다 */
function WindowsWidgetDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Windows 위젯 'MATE 캘린더'" sub="내 작업을 바탕화면 캘린더 위젯으로 봅니다. Windows 10 · 11 용입니다."
      size="sm" onClose={onClose}
      foot={
        <>
          <span className="flex-1" />
          <button type="button" onClick={onClose} className={tmBtn}>닫기</button>
          <a href={WIN_WIDGET} download className={`${tmBtnPrimary} hover:border-tm-blue-hover hover:bg-tm-blue-hover`}>
            설치 파일 받기
          </a>
        </>
      }>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-[14.5px] leading-[1.65] text-tm-ink marker:font-bold marker:text-tm-blue">
        <li>PC 에서 받습니다. 브라우저가 &lsquo;흔히 받는 파일이 아님&rsquo;이라고 하면 <b>유지</b>를 누릅니다.</li>
        <li>받은 파일을 엽니다. &lsquo;Windows의 PC 보호&rsquo; 창이 나오면 <b>추가 정보</b>를 눌러 <b>실행</b>합니다. 코드 서명을 하지 않은 사내 프로그램이라 나오는 안내입니다.</li>
        <li><b>설치</b>를 누릅니다. 내 Windows 계정에만 깔려 관리자 권한이 필요 없습니다.</li>
        <li>Hub 와 같은 메일 · 비밀번호로 로그인하면 바탕화면 오른쪽 위에 캘린더가 뜹니다. 달 이름을 끌어 옮기고, <b>가장자리 · 아래 모서리를 끌어</b> 크기를 바꿉니다. 화살표 단추로 <b>넓게 펼쳐</b> 큰 달력과 목록을 나란히 봅니다. &hellip; 메뉴에서 크기 · 모양 · 팀 전체 보기를 바꿉니다.</li>
        <li>새 판이 나오면 위젯이 <b>저절로</b> 받아 바꿉니다(잠깐 꺼졌다가 다시 뜹니다). 바로 바꾸려면 위젯의 파란 <b>업데이트 설치</b> 단추를 누릅니다. &hellip; 메뉴의 자동 업데이트로 끌 수 있습니다.</li>
      </ol>
    </Modal>
  );
}

export default function TaskManagerClient() {
  return isRemote ? <RemoteApp /> : <Workspace />;
}

/** Supabase 모드의 문 - 로그인 → 표가 있는지 → 승인됐는지를 차례로 확인한다 */
function RemoteApp() {
  const auth = useAuth();
  const userId = auth.status === 'in' ? auth.user.id : null;
  const team = useTeam(userId);
  const leave = () => void signOut();

  /* 승인 대기 중에는 실시간 알림과 별도로 10초마다 다시 확인한다 - 알림이 끊겨도 승인되면 열린다 */
  const waiting = team.status === 'ready' && !!team.me && !team.me.active;
  const { reload } = team;
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => void reload(), 10000);
    return () => clearInterval(t);
  }, [waiting, reload]);

  if (auth.status === 'loading') return <LoadingScreen />;
  if (auth.status === 'out') return <LoginScreen />;
  if (team.status === 'loading') return <LoadingScreen />;
  if (team.status === 'missing' || team.status === 'error') {
    return <TroubleScreen kind={team.status} onRetry={() => void team.reload()} onSignOut={leave} />;
  }
  const email = auth.user.email ?? '';
  if (!team.me) return <PendingScreen email={email} missing onSignOut={leave} />;
  if (!team.me.active) return <PendingScreen email={email} onSignOut={leave} />;

  return (
    <MembersContext.Provider value={team.members}>
      <Workspace account={{ me: team.me, members: team.members, update: team.update, reject: team.reject, setAvatar: team.setAvatar, recovery: auth.recovery }} />
    </MembersContext.Provider>
  );
}

function Workspace({ account }: { account?: Account }) {
  /** undo 에 번호(저장소의 undoSeq)가 있으면 그 동작의 '실행 취소'를 함께 띄운다. err 는 저장 실패 같은 빨간 알림 */
  const [toast, setToast] = useState<{ text: string; undo: number | false; tone?: 'ok' | 'err' } | null>(null);
  const notify = useCallback((text: string) => setToast({ text, undo: false, tone: 'err' }), []);
  const store = useTasks({ onError: notify });
  const docStore = useDocs({ onError: notify });
  const memoStore = useMemos({ onError: notify });
  const domainStore = useDomainList({ onError: notify });
  const domains = domainStore.domains;
  const colorStore = useColorList({ onError: notify });

  const [section, setSectionNow] = useState<Section>('tasks');
  /** 보고 화면이 열려 있으면 떠나기 전에 부르는 확인 - 아직 저장되지 않은 글이 남았으면 거짓(보고가 그대로 남는다) */
  const reportsLeave = useRef<(() => Promise<boolean>) | null>(null);
  const sectionRef = useRef(section);
  sectionRef.current = section;
  /**
   * 화면 바꾸기. 보고를 떠날 때만 보고에 먼저 묻고, 떠나도 되면 바꾼 뒤 then 을 부른다
   * (작업 열기 · 보기 바꾸기처럼 화면을 옮긴 뒤에 할 일). 일간 ↔ 주간은 같은 보고라 묻지 않는다
   */
  const setSection = useCallback((next: Section, then?: () => void) => {
    const cur = sectionRef.current;
    const leaving = (cur === 'daily' || cur === 'weekly') && next !== 'daily' && next !== 'weekly';
    const guard = reportsLeave.current;
    if (!leaving || !guard) {
      setSectionNow(next);
      then?.();
      return;
    }
    void guard().then((ok) => {
      if (!ok) return;
      setSectionNow(next);
      then?.();
    });
  }, []);
  /* 홈페이지 링크 - 보고에서 나갈 때도 먼저 묻는다 */
  const router = useRouter();
  const leaveHub = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const cur = sectionRef.current;
    const guard = reportsLeave.current;
    if ((cur !== 'daily' && cur !== 'weekly') || !guard || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    void guard().then((ok) => { if (ok) router.push('/'); });
  };
  const [view, setView] = useState<View>('board');
  const [scope, setScope] = useState<Scope>({ kind: 'all' });
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [hideDone, setHideDone] = useState(false);
  /** 상위 작업만 - 다른 작업의 하위 업무는 숨긴다 */
  const [topOnly, setTopOnly] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  /** 캘린더 · 타임라인에서 작업 바탕을 칠하는 기준 */
  const [colorBy, setColorBy] = useState<ColorBy>('member');
  const [colorsOpen, setColorsOpen] = useState(false);
  /** 브라우저 저장 모드에서 고른 '나'. Supabase 모드에서는 로그인한 계정이 '나'다 */
  const [localMe, setLocalMe] = useState<string>('m7');
  const me = account ? account.me.id : localMe;
  /* 나만 보기 작업은 만든 사람에게만 - Supabase 는 RLS 가 이미 빼고 주지만, 브라우저 저장 모드('나'를 바꿔 씀) · 늦은 알림에도 지킨다.
     조직도 · 위키 · 블로그 · 보고처럼 팀이 함께 보는 화면에는 내 나만 보기 작업도 넘기지 않는다 */
  const [favs, toggleFav] = useFavDomains(me);
  const tasksAll = useMemo(() => store.tasks.filter((t) => visibleTo(t, me)), [store.tasks, me]);
  const teamTasks = useMemo(() => tasksAll.filter((t) => !t.private), [tasksAll]);

  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState<Status | null>(null);
  const [creatingDue, setCreatingDue] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ by: 'title' | 'status' | 'priority' | 'domain' | 'due' | 'assignee'; dir: 1 | -1 } | null>(null);
  const [dropAt, setDropAt] = useState<{ status: Status; beforeId: string | null } | null>(null);
  /** 키보드로 옮긴 카드 - 다시 그린 뒤 초점을 돌려준다. alt 는 그 카드가 걸러져 사라졌을 때 갈 원래 칸의 옆 카드 */
  const [refocus, setRefocus] = useState<{ id: string; alt: string | null } | null>(null);
  /** 좁은 화면의 전체 메뉴 창 */
  const [menu, setMenu] = useState(false);
  /** 넓은 화면의 왼쪽 메뉴를 아이콘 줄(88px)로 접었다 - 처음 오면 1200px 아래 화면(작은 노트북 · 가로 태블릿)에서 접어 둔다 */
  const [rail, setRail] = useState(false);
  /** 휴대폰: 걸러 보기 칸(우선순위 · 담당자 · 완료 숨기기)을 펼쳤다 - 접어 두면 검색 한 줄만 남는다 */
  const [filtersOpen, setFiltersOpen] = useState(false);
  /** 걸러 보기를 단추 하나로 접는 화면 - 휴대폰, 그리고 가로로 든 휴대폰(높이 500 아래) */
  const compactFilters = useMediaQuery('(max-width: 720px), (max-height: 500px)');
  /** Supabase 모드 - 팀원 창 */
  const [teamOpen, setTeamOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);
  /** Windows 바탕화면 위젯 받기 창 */
  const [winOpen, setWinOpen] = useState(false);
  /** 영역 관리 창 */
  const [domainsOpen, setDomainsOpen] = useState(false);
  /** 모든 영역(즐겨찾기 고르기) 창 */
  const [allDomainsOpen, setAllDomainsOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  /** Supabase 모드 - 이 브라우저에 남은 예전 데이터 */
  const [leftover, setLeftover] = useState<{ tasks: number; docs: number } | null>(null);
  const [importing, setImporting] = useState(false);
  /** Supabase 모드 - 처음 목록 읽기를 다시 시도하는 중 */
  const [retrying, setRetrying] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  /** 문서 화면에서 / 를 눌러 작업 화면으로 왔다 - 검색 칸이 그려지면 초점을 준다 */
  const searchNext = useRef(false);
  const viewTabs = useRef<HTMLDivElement>(null);
  /** 좁은 화면의 사람 메뉴 - 다른 곳을 누르거나 Esc, 화면을 바꾸면 닫는다 */
  const acct = useRef<HTMLDetailsElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;
  /** 보고 화면이 열려 있으면 그 저장소의 '기다리는 저장 보내기' - 로그아웃 전에 부른다 */
  const reportsFlush = useRef<(() => Promise<void>) | null>(null);
  /** 지금 떠 있는 알림 - 단축키 Z 는 실행 취소 알림이 떠 있을 때만 듣는다 */
  const toastRef = useRef(toast);

  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCAL_ME_KEY);
      if (saved && MEMBERS.some((m) => m.id === saved)) setLocalMe(saved);
    } catch { /* 저장이 막힌 환경 */ }

    // 마지막으로 보던 화면으로 돌아온다
    const p = readPrefs();
    if (p) {
      if (p.section) setSection(p.section);
      if (p.view) setView(p.view);
      if (p.scope) setScope(p.scope);
      if (p.priority) setPriorityFilter(p.priority);
      if (typeof p.hideDone === 'boolean') setHideDone(p.hideDone);
      if (typeof p.topOnly === 'boolean') setTopOnly(p.topOnly);
      if (typeof p.assignee === 'string' && p.assignee) setAssigneeFilter(p.assignee);
      if (COLOR_BYS.some((c) => c.id === p.colorBy)) setColorBy(p.colorBy as ColorBy);
    }
    setRail(typeof p?.rail === 'boolean' ? p.rail : window.innerWidth < 1200);
    // 위키 문서 링크(?doc=)로 들어왔으면 위키를 연다
    const q = new URLSearchParams(window.location.search);
    if (q.has('doc')) setSection('docs');
    // 갤럭시 홈 화면 위젯('MATE 오늘' 앱, android-widget/)에서 들어왔다 - ?view=calendar 는 그 보기로,
    // ?task=<id> 는 작업 화면으로 와서 목록을 읽은 뒤 그 작업을 연다(아래 효과)
    const v = q.get('view');
    if (v && VIEWS.some((x) => x.id === v)) { setSection('tasks'); setView(v as View); }
    // 보고 링크(?view=daily&date= · ?view=weekly&week=) - 날짜 · 주는 보고 화면이 읽는다
    if (v === 'daily' || v === 'weekly') setSection(v);
    // 블로그 글 링크(?post=<id>) · ?view=blog - 글은 블로그 화면이 읽는다
    if (v === 'blog' || q.has('post')) setSection('blog');
    if (q.has('task')) setSection('tasks');
    setPrefsLoaded(true);
  }, [setSection]);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify(
        { section, view, scope, priority: priorityFilter, hideDone, assignee: assigneeFilter, colorBy, rail, topOnly } satisfies Prefs));
    } catch { /* noop */ }
  }, [prefsLoaded, section, view, scope, priorityFilter, hideDone, assigneeFilter, colorBy, rail, topOnly]);

  const pickMe = (id: string) => {
    setLocalMe(id);
    try { window.localStorage.setItem(LOCAL_ME_KEY, id); } catch { /* noop */ }
  };

  /* Supabase 모드 - 예전에 이 브라우저에 쓴 작업 · 문서가 남아 있으면 옮길지 묻는다 */
  const accountId = account?.me.id;
  useEffect(() => {
    if (!accountId) return;
    const left = localLeftovers();
    setLeftover(left ? { tasks: left.tasks.length, docs: left.docs.length } : null);
  }, [accountId]);

  const runImport = async () => {
    if (!accountId || importing) return;
    setImporting(true);
    try {
      const done = await importLocal(accountId);
      setLeftover(null);
      // 실시간 알림을 기다리지 않고 바로 다시 읽어 옮긴 것을 보여 준다
      await Promise.all([store.reload?.(), docStore.reload?.()]);
      setToast({ text: `작업 ${done.tasks}건 · 문서 ${done.docs}건을 팀 저장소로 옮겼습니다.`, undo: false });
    } catch {
      notify('옮기지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요. 이미 옮긴 것은 두 번 올리지 않습니다.');
      const left = localLeftovers();
      setLeftover(left ? { tasks: left.tasks.length, docs: left.docs.length } : null);
    } finally {
      setImporting(false);
    }
  };

  /* 로그아웃 - 아직 보내지 못한 저장을 먼저 끝낸다(로그인이 풀리면 더는 보낼 수 없다) */
  const logout = async () => {
    if (leaving) return;
    // 보고 화면에 아직 저장되지 않은 글이 남았으면 묻고, 머무르면 로그아웃하지 않는다(로그인이 풀리면 더는 보낼 수 없다)
    if (reportsLeave.current && !(await reportsLeave.current())) return;
    setLeaving(true);
    await Promise.all([store.flush?.(), docStore.flush?.(), memoStore.flush?.(), domainStore.flush?.(), colorStore.flush?.(), reportsFlush.current?.()])
      .catch(() => {});
    await signOut();
  };

  /* 승인은 관리자만 하므로 승인 대기 숫자도 관리자에게만 보인다 */
  const pendingCount = account?.me.isAdmin ? account.members.filter((m) => m.active === false).length : 0;

  /* 영역 고치기 - Supabase 모드는 영역을 맡은 사람만(관리자와 따로 SQL Editor 에서 정하고, DB 도 그 사람 것만 받는다).
     브라우저 저장 모드는 계정이 없어 누구나 */
  const canEditDomains = domainStore.editable && (!account || account.me.domainEditor === true);

  /* 영역 지우기 - 그 영역의 작업은 고른 영역으로 옮긴다 */
  const removeDomain = async (id: DomainKey, to: DomainKey) => {
    const gone = domainOf(domains, id);
    const n = store.tasks.filter((t) => t.domain === id).length;
    // 브라우저 저장 모드는 작업을 먼저 옮긴다. Supabase 모드는 DB 가 지우면서 한 번에 옮긴다
    if (!isRemote) store.tasks.filter((t) => t.domain === id).forEach((t) => store.update(t.id, { domain: to }));
    const ok = await domainStore.remove(id, to);
    if (!ok) return false;
    // 실시간 알림을 기다리지 않고 옮겨진 작업을 바로 받는다
    if (isRemote) await store.reload?.();
    setToast({
      text: n ? `'${gone.label}' 영역을 지웠습니다. 작업 ${n}건은 '${domainOf(domains, to).label}' 영역으로 옮겼습니다.` : `'${gone.label}' 영역을 지웠습니다.`,
      undo: false,
    });
    return true;
  };

  /* 비밀번호 재설정 링크로 들어왔으면 팀원 창(새 비밀번호 칸)을 연다 */
  const recovery = account?.recovery;
  useEffect(() => {
    if (recovery) setTeamOpen(true);
  }, [recovery]);

  /* 되돌릴 수 있는 동작이 생기면 알린다 - 이름이 같은 동작이 이어져도 번호(undoSeq)로 가른다 */
  const { undoSeq, undoLabel } = store;
  useEffect(() => {
    if (!undoSeq || !undoLabel) return;
    setToast({ text: undoLabel, undo: undoSeq });
  }, [undoSeq, undoLabel]);

  /* 실행 취소 알림이 닫히거나 다른 알림으로 바뀌면 그 되돌리기는 잊는다 - 알림 없이 Z 로 옛 동작을 되돌리지 않게 */
  useEffect(() => {
    const was = toastRef.current;
    toastRef.current = toast;
    if (was?.undo && was !== toast && storeRef.current.undoSeq === was.undo) storeRef.current.dropUndo();
  }, [toast]);

  /* 실행 취소 - 알림이 떠 있는 동안만 부른다. 그사이 바뀌어 되돌리지 못했으면 그렇다고 알린다 */
  const runUndo = useCallback(() => {
    const ok = storeRef.current.undo();
    setToast(ok ? null : { text: '그 사이 바뀌어서 되돌리지 않았습니다', undo: false });
  }, []);

  /* 저장 상태 알약 - 브라우저 저장인지, 팀 저장소에 다 들어갔는지(작업 · 문서 · 메모 · 영역 · 색을 함께 본다) */
  const syncs = [store.sync, docStore.sync, memoStore.sync, domainStore.sync, colorStore.sync];
  const sync = syncs.includes('error') ? 'error' : syncs.includes('saving') ? 'saving' : 'idle';
  const saved: { tone: 'ok' | 'busy' | 'warn'; text: string } = account
    ? sync === 'error'
      ? { tone: 'warn', text: '저장하지 못한 변경이 있습니다' }
      : sync === 'saving'
        ? { tone: 'busy', text: '저장 중…' }
        : { tone: 'ok', text: '모두 저장됨 · 팀이 함께 봅니다' }
    : store.persistent
      ? { tone: 'ok', text: '이 브라우저에만 저장됩니다' }
      : { tone: 'warn', text: '브라우저 저장이 막혀 있어 새로고침하면 사라집니다' };

  /* 연결이 돌아와 다 보냈으면 '아직 저장하지 못했습니다' 알림은 바로 거둔다 - 알약과 어긋나지 않게 */
  useEffect(() => {
    if (sync === 'idle') setToast((t) => (t?.text === RETRY ? null : t));
  }, [sync]);

  /* 알림은 잠시 뒤 거둔다 */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (acct.current) acct.current.open = false;
  }, [section, scope, view]);
  useEffect(() => {
    const close = (e: PointerEvent | KeyboardEvent) => {
      const el = acct.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  /* ── 단축키 - 입력 중(한글 조합 중 포함)이거나 창이 떠 있으면 가로채지 않는다 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (typing || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      // 한글 자판 · Shift · Caps Lock 에서도 같은 글쇠로 받는다. 라틴 글자는 e.key 를 먼저 봐서 다른 배열에서도 표시와 맞춘다
      const k = /^[a-z/]$/i.test(e.key) ? e.key.toLowerCase()
        : e.code.startsWith('Key') ? e.code.slice(3).toLowerCase()
          : e.code === 'Slash' ? '/' : '';
      if (!k) return;

      if (k === 'n') { e.preventDefault(); setCreatingDue(null); setCreating('todo'); }
      if (k === '/') {
        e.preventDefault();
        // 문서 · 메모 화면에서는 그 화면의 검색으로. 그 칸이 없거나(좁은 화면) 숨어 있으면 작업 화면으로 가서 그려진 뒤 검색 칸에
        const docSearch = document.querySelector<HTMLInputElement>('input[aria-label="문서 검색"], input[aria-label="메모 검색"], input[aria-label="드라이브 검색"]');
        if (docSearch?.offsetParent) docSearch.focus();
        else if (searchRef.current) searchRef.current.focus();
        else { searchNext.current = true; setSection('tasks'); }
      }
      const v = VIEWS.find((x) => x.key === k);
      if (v) setSection('tasks', () => setView(v.id));
      if (k === 'd') setSection('docs');
      if (k === 'm') setSection('memos');
      // 보고 - S 는 스크럼(일간), W 는 주간
      // 보고 화면의 '보고 단축키 S · W'를 끈 사람에게는 듣지 않는다
      if ((k === 's' || k === 'w') && reportKeysOff()) return;
      if (k === 's') setSection('daily');
      if (k === 'w') setSection('weekly');
      // Ctrl/Cmd 조합은 위에서 걸러지므로 되돌리기는 여기서 따로 받는다 - 실행 취소 알림이 떠 있을 때만
      if (k === 'z' && toastRef.current?.undo) {
        e.preventDefault();
        runUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runUndo, setSection]);

  useEffect(() => {
    if (section !== 'tasks' || !searchNext.current || !searchRef.current) return;
    searchNext.current = false;
    searchRef.current.focus();
  }, [section, store.ready]);

  /* 좁은 화면에서 보기 알약 줄이 넘치면 고른 보기가 보이게 그만큼만 민다(새로고침한 뒤에도) */
  useEffect(() => {
    const row = viewTabs.current;
    const on = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !on) return;
    const r = row.getBoundingClientRect();
    const b = on.getBoundingClientRect();
    if (b.left < r.left) row.scrollLeft -= r.left - b.left;
    else if (b.right > r.right) row.scrollLeft += b.right - r.right;
  }, [view, section, store.ready]);

  /* ── 필터 ── */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 상위 작업만 - 상위 업무 칸이 있을 때만. 지운 작업을 가리키는 하위는 맨 위 업무로 본다
    const byId = topOnly && store.hierarchy ? new Map(tasksAll.map((t) => [t.id, t])) : null;
    return tasksAll
      .filter((t) => {
        if (byId && parentOf(t, byId)) return false;
        if (scope.kind === 'mine' && t.assignee !== me) return false;
        if (scope.kind === 'domain' && t.domain !== scope.id) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        // '내 작업'에서는 담당자 걸러 보기를 쓰지 않는다(칸도 숨긴다)
        if (scope.kind !== 'mine' && assigneeFilter !== 'all'
          && t.assignee !== (assigneeFilter === 'none' ? null : assigneeFilter)) return false;
        if (hideDone && t.status === 'done') return false;
        if (q) {
          const hay = `${t.key} ${t.title} ${t.description} ${t.labels.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [tasksAll, scope, me, priorityFilter, assigneeFilter, hideDone, query, topOnly, store.hierarchy]);

  /** 목록 보기 정렬 - 열 이름을 누르면 그 열 기준으로 선다 */
  const members = useMembers();
  const sorted = useMemo(() => {
    const statusRank = Object.fromEntries(STATUSES.map((s2, i) => [s2.id, i])) as Record<Status, number>;
    // 고르지 않았을 때는 보드와 같은 순서 - 상태 순, 같은 상태 안에서는 칸 안의 순서. 같은 값끼리도 이 순서로 선다
    const base = [...visible].sort((a, b) => statusRank[a.status] - statusRank[b.status] || a.order - b.order);
    if (!sort) return base;
    const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as Record<Priority, number>;
    const domainRank = new Map(domains.map((d, i) => [d.id, i]));
    const key = (t: Task): string | number => {
      switch (sort.by) {
        case 'title': return t.title;
        case 'status': return statusRank[t.status];
        case 'priority': return rank[t.priority];
        // 메뉴에 놓인 영역 순서대로. 목록에 없는 영역은 뒤로
        case 'domain': return domainRank.get(t.domain) ?? domains.length;
        // 마감일 없는 것은 항상 뒤로
        case 'due': return t.due ?? '9999-12-31';
        // 담당자 이름 순. 미배정 · 없어진 계정은 뒤로
        case 'assignee': return (t.assignee && members.find((m) => m.id === t.assignee)?.name) || '￿';
      }
    };
    return base.sort((a, b) => {
      const x = key(a), y = key(b);
      const d = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y, 'ko') : Number(x) - Number(y);
      return d * sort.dir;
    });
  }, [visible, sort, members, domains]);

  const toggleSort = (by: NonNullable<typeof sort>['by']) =>
    setSort((prev) => (prev?.by === by ? (prev.dir === 1 ? { by, dir: -1 } : null) : { by, dir: 1 }));

  const byStatus = useMemo(() => {
    const map = {} as Record<Status, Task[]>;
    STATUSES.forEach((s) => { map[s.id] = []; });
    visible.forEach((t) => map[t.status].push(t));
    return map;
  }, [visible]);

  /** 아무도 손대지 않은 예시 작업 수 - 안내 띠를 띄울지 정한다 */
  const sampleCount = useMemo(() => tasksAll.filter(isUntouchedSample).length, [tasksAll]);

  /** 이미 쓰인 라벨 - 라벨 칸의 제안 목록 */
  const knownLabels = useMemo(
    () => Array.from(new Set(tasksAll.flatMap((t) => t.labels))).sort((a, b) => a.localeCompare(b, 'ko')),
    [tasksAll],
  );

  /* 상위 · 하위 업무 - Supabase 에 상위 업무 칸(SQL)이 아직 없으면 쓰지 않는다. 지운 작업을 가리키는 칸은 맨 위 업무로 본다.
     걸러 보기와 상관없이 모든 작업으로 센다(상위 업무가 걸러져도 하위 카드에 상위가 보이게) */
  const hierarchy = !!store.hierarchy;
  const kin = useMemo(() => {
    const byId = new Map(tasksAll.map((t) => [t.id, t]));
    const sub = new Map<string, { done: number; total: number }>();
    if (hierarchy) {
      tasksAll.forEach((t) => {
        const p = parentOf(t, byId);
        if (!p) return;
        const s = sub.get(p.id) ?? { done: 0, total: 0 };
        s.total += 1;
        if (t.status === 'done') s.done += 1;
        sub.set(p.id, s);
      });
    }
    return { byId, sub };
  }, [tasksAll, hierarchy]);
  const parentFor = (t: Task) => (hierarchy ? parentOf(t, kin.byId) : null);
  /** 목록 줄의 상위 업무 한 줄 · 하위 업무 진행 - 없으면 그리지 않는다 */
  const parentLine = (t: Task, className?: string) => {
    const p = parentFor(t);
    return p ? <ParentLine parent={p} className={className} /> : null;
  };
  const subCount = (t: Task) => {
    const s = kin.sub.get(t.id);
    return s ? <SubCount done={s.done} total={s.total} /> : null;
  };

  /** 오늘(이 기기 날짜) - 탭을 밤새 열어 두었다가 돌아와도 다시 잰다 */
  const todayKey = localISO(useToday());
  const counts = useMemo(() => {
    /* 왼쪽 메뉴의 숫자(모든 작업 · 내 작업 · 영역)는 기간이 지난 작업(마감일이 오늘보다 앞)을 빼고 센다. 오늘 마감은 센다 */
    const counted = (t: Task) => t.status !== 'done' && !(t.due && t.due < todayKey);
    const mine = tasksAll.filter((t) => t.assignee === me && counted(t)).length;
    const perDomain = new Map<DomainKey, number>();
    tasksAll.forEach((t) => {
      if (counted(t)) perDomain.set(t.domain, (perDomain.get(t.domain) ?? 0) + 1);
    });
    const open = tasksAll.filter(counted).length;
    return { mine, perDomain, open, total: tasksAll.length };
  }, [tasksAll, me, todayKey]);

  /* 보던 영역이 지워졌으면(다른 곳에서 지웠거나 저장해 둔 화면의 영역이 없어졌으면) 모든 작업으로 */
  const scopeGone = scope.kind === 'domain' && domainStore.ready && !domains.some((d) => d.id === scope.id);
  useEffect(() => {
    if (scopeGone) setScope({ kind: 'all' });
  }, [scopeGone]);

  const open = openId ? tasksAll.find((t) => t.id === openId) ?? null : null;

  /* 위젯에서 누른 작업(?task=<id>)을 연다 - 목록을 읽은 뒤 한 번만. ?task · ?view 는 주소에서 지워
     새로고침하거나 다른 보기로 옮겨도 다시 열리지 않게 한다 */
  const linkDone = useRef(false);
  useEffect(() => {
    if (!store.ready || store.loadError || linkDone.current) return;
    linkDone.current = true;
    const url = new URL(window.location.href);
    const id = url.searchParams.get('task');
    if (!id && !url.searchParams.has('view')) return;
    url.searchParams.delete('task');
    url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url);
    if (!id) return;
    if (tasksAll.some((t) => t.id === id)) setOpenId(id);
    else setToast({ text: '위젯에서 고른 작업을 찾지 못했습니다. 그사이 지워졌을 수 있습니다.', undo: false });
  }, [store.ready, store.loadError, tasksAll]);

  /* 열어 둔 작업이 다른 곳에서 지워지면 창을 닫고 알린다. openId 도 비워 나중에 되살아나도 저절로 열리지 않게 한다 */
  const openMissing = !!openId && store.ready && !open;
  const deletedElsewhere = store.deletedElsewhere;
  useEffect(() => {
    if (!openMissing || !openId) return;
    setOpenId(null);
    // Supabase 모드에서 지운 기록이 없으면 서버가 만들기를 받지 않은 줄이다 - 저장소가 이미 알렸다
    if (isRemote && !deletedElsewhere?.has(openId)) return;
    setToast({
      text: isRemote
        ? `다른 팀원이 이 작업을 지웠습니다.${deletedElsewhere?.get(openId) ? ' 고치던 내용은 저장되지 않았습니다.' : ''}`
        : '다른 탭에서 이 작업을 지웠습니다.',
      undo: false,
      tone: 'err',
    });
  }, [openMissing, openId, deletedElsewhere]);

  /* 키보드로 옮긴 카드에 초점을 돌려준다 - 다른 칸으로 가며 새로 그려져 초점을 잃기 때문에 이어서 옮길 수 없었다 */
  useEffect(() => {
    if (!refocus) return;
    setRefocus(null);
    const card = (id: string | null) => (id ? document.querySelector<HTMLElement>(`[data-task="${CSS.escape(id)}"]`) : null);
    (card(refocus.id) ?? card(refocus.alt))?.focus();
  }, [refocus]);

  const handleCreate = useCallback((d: Draft) => {
    const t = store.create({ ...d, owner: me });
    setCreating(null);
    setCreatingDue(null);
    setOpenId(t.id);
  }, [store, me]);

  /** 캘린더에서 날짜를 눌러 만들 때 - 그 날을 마감일로 미리 채운다 */
  const createAt = useCallback((dueISO: string) => {
    setCreatingDue(dueISO);
    setCreating('todo');
  }, []);

  const newTask = () => { setCreatingDue(null); setCreating('todo'); };

  /* 새 작업의 처음 값 - 보고 있는 영역, 담당은 나(담당자로 걸러 보는 중이면 그 사람, 미배정으로 걸러 보면 비움) */
  const newDomain = scope.kind === 'domain' && domains.some((d) => d.id === scope.id) ? scope.id : defaultDomain(domains);
  const newAssignee = scope.kind === 'mine' || assigneeFilter === 'all' ? me : assigneeFilter === 'none' ? null : assigneeFilter;

  /** 나만 보기 · 참고자료 - Supabase 에 그 칸(SQL)이 아직 없으면 숨긴다 */
  const taskExtras: Extras | undefined = store.extras ? {
    me,
    docs: docStore.docs,
    onOpenDoc: (id) => {
      // 위키는 열 때 주소의 ?doc= 를 읽는다
      const url = new URL(window.location.href);
      url.searchParams.set('doc', id);
      window.history.replaceState(window.history.state, '', url);
      setOpenId(null);
      setSection('docs');
    },
    onNotice: (text) => setToast({ text, undo: false, tone: 'err' }),
  } : undefined;

  /* 범위(왼쪽 메뉴)는 걸러 보기가 아니라 지금 있는 곳이라 초기화에 넣지 않는다 */
  const assigneeOn = scope.kind !== 'mine' && assigneeFilter !== 'all';
  const topOn = topOnly && !!store.hierarchy;
  const filtersOn = query.trim() !== '' || priorityFilter !== 'all' || assigneeOn || hideDone || topOn;
  /** 휴대폰의 '걸러 보기' 단추에 적는 켜진 수(검색 말고 고르기 칸) */
  const filterCount = Number(priorityFilter !== 'all') + Number(assigneeOn) + Number(hideDone) + Number(topOn);
  const clearFilters = () => {
    setQuery(''); setPriorityFilter('all'); setAssigneeFilter('all'); setHideDone(false); setTopOnly(false);
  };

  /** 담당자로 고를 수 있는 사람 - 승인된 팀원, 그리고 승인이 풀렸어도 작업을 맡고 있는 사람 */
  const people = useMemo(
    () => members.filter((m) => m.active !== false || tasksAll.some((t) => t.assignee === m.id)),
    [members, tasksAll],
  );
  /** 색 바꾸기 창 - Supabase 에 색 표가 아직 없으면 자동 색만 쓰고 단추를 숨긴다 */
  const editColors = colorStore.editable ? () => setColorsOpen(true) : undefined;

  /* 걸러 보던 사람이 목록에서 빠졌으면(계정을 지움) 모두로 돌린다 */
  useEffect(() => {
    if (assigneeFilter !== 'all' && assigneeFilter !== 'none' && members.length && !members.some((m) => m.id === assigneeFilter)) {
      setAssigneeFilter('all');
    }
  }, [assigneeFilter, members]);

  /** 걸러 보기 중에 지금 범위의 작업이 하나라도 있는 상태 - 그 칸이 비어 보이면 걸러 보기가 가린 것이라 '작업 추가' 대신 그렇다고 적는다 */
  const hiddenIn = useMemo(() => {
    const out = new Set<Status>();
    if (!filtersOn) return out;
    tasksAll.forEach((t) => {
      if (scope.kind === 'mine' && t.assignee !== me) return;
      if (scope.kind === 'domain' && t.domain !== scope.id) return;
      out.add(t.status);
    });
    return out;
  }, [filtersOn, tasksAll, scope, me]);

  /* Supabase 모드 - 처음 목록을 읽지 못했으면 빈 보드 대신 그 까닭과 다시 시도를 보인다 */
  const slot: View | 'error' = store.loadError ? 'error' : view;
  const retryLoad = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await store.reload?.();
    } finally {
      setRetrying(false);
    }
  };

  /* 보이는 작업이 없을 때 - 목록과 보드(걸러 보기 중)가 같은 안내를 쓴다 */
  const emptyState = (
    <div className="flex flex-col items-center gap-2.5 px-6 py-[72px] text-center">
      <p className="text-[20px] font-extrabold text-tm-deep">
        {filtersOn ? '조건에 맞는 작업이 없습니다' : '아직 작업이 없습니다'}
      </p>
      <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">
        {filtersOn ? '걸러 보기를 풀면 다른 작업도 다시 보입니다.' : '새 작업을 만들면 여기에 줄로 쌓입니다.'}
      </p>
      <button type="button" onClick={() => (filtersOn ? clearFilters() : newTask())}
        className={filtersOn ? tmBtn : tmBtnPrimary}>
        {filtersOn ? '필터 초기화' : '새 작업 만들기'}
      </button>
    </div>
  );

  /* 캘린더에서 끌어 마감일을 바꿀 때 - 시작일이 마감일보다 늦어지지 않게 기간째 같은 날수만큼 민다 */
  const reschedule = (id: string, due: string) => {
    const t = tasksAll.find((x) => x.id === id);
    if (!t || t.due === due) return;
    let start = t.start;
    // 'YYYY-MM-DD' 는 UTC 자정으로 읽히고 toISOString 으로 같은 날짜가 돌아온다 - 지역 시각 Date 를 섞지 않는다
    const shift = t.due ? Date.parse(due) - Date.parse(t.due) : NaN;
    const from = start ? Date.parse(start) : NaN;
    if (Number.isFinite(shift) && Number.isFinite(from)) start = new Date(from + shift).toISOString().slice(0, 10);
    // 마감일이 없던 작업이거나 이미 어긋나 있던 것은 시작일을 마감일로 맞춘다
    if (start && start > due) start = due;
    // 바뀌지 않은 시작일은 보내지 않는다 - 그사이 다른 팀원이 고친 시작일을 덮지 않게
    store.update(id, start === t.start ? { due } : { due, start }, `'${t.title || '작업'}' 마감일 변경`);
  };

  /* ── 드래그 ── */
  const onColumnDragOver = (e: React.DragEvent, status: Status, beforeId: string | null) => {
    // 드롭을 허용하려면 dragover 마다 preventDefault 가 필요하다.
    // 상태(dragId)를 조건으로 걸면 첫 프레임에 드롭이 거부된다.
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropAt((prev) =>
      prev?.status === status && prev?.beforeId === beforeId ? prev : { status, beforeId });
  };

  const onDrop = (e: React.DragEvent, status: Status, beforeId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    // dataTransfer 를 1순위로 읽는다 - 리렌더 타이밍과 무관하게 집은 카드를 알 수 있다
    const id = e.dataTransfer.getData('text/plain') || dragId;
    // 제 카드 위에 놓은 것은 제자리다 - 칸 끝으로 밀려나지 않게
    if (id && id !== beforeId) store.move(id, status, beforeId);
    setDragId(null);
    setDropAt(null);
  };

  const scopeTitle =
    scope.kind === 'all' ? '모든 작업'
      : scope.kind === 'mine' ? '내 작업'
        : domainOf(domains, scope.id).label;
  const currentView = VIEWS.find((v) => v.id === view) ?? VIEWS[0];

  /* ── 메뉴 ── */
  const goTasks = (s: Scope) => setSection('tasks', () => setScope(s));
  const nav: NavGroup[] = [
    {
      items: [
        { key: 'all', label: '모든 작업', icon: 'board', count: counts.open,
          active: section === 'tasks' && scope.kind === 'all', go: () => goTasks({ kind: 'all' }) },
        { key: 'mine', label: '내 작업', icon: 'mine', count: counts.mine,
          active: section === 'tasks' && scope.kind === 'mine', go: () => goTasks({ kind: 'mine' }) },
      ],
    },
    {
      // 즐겨찾는 영역만(처음엔 모두). 지금 보고 있는 영역은 즐겨찾기가 아니어도 잠깐 보인다. '전체'에서 모든 영역 · 별 · 관리
      label: favs ? '즐겨찾기' : '영역',
      action: { text: '전체', label: '모든 영역', go: () => setAllDomainsOpen(true) },
      items: [
        ...domains
          .filter((d) => !favs || favs.includes(d.id) || (section === 'tasks' && scope.kind === 'domain' && scope.id === d.id))
          .map((d): NavItem => ({
            key: d.id, label: d.label, dot: d.color, count: counts.perDomain.get(d.id) ?? 0,
            active: section === 'tasks' && scope.kind === 'domain' && scope.id === d.id,
            go: () => goTasks({ kind: 'domain', id: d.id }),
          })),
        ...(favs && !domains.some((d) => favs.includes(d.id))
          ? [{ key: 'fav-pick', label: '즐겨찾기 고르기', icon: 'star' as const, active: false, go: () => setAllDomainsOpen(true) }]
          : []),
      ],
    },
    {
      // 팀 구성 · 맡은 일 · 도구 · 담당 폴더 - 열 때 표를 읽으므로 숫자를 달지 않는다
      label: '팀',
      items: [
        { key: 'org', label: '조직도', icon: 'org', active: section === 'org', go: () => setSection('org') },
      ],
    },
    {
      label: '문서',
      items: [
        // 팀 구글 드라이브 트리 - 열 때 목록을 읽으므로 숫자를 달지 않는다
        { key: 'drive', label: '구글 드라이브', icon: 'drive', active: section === 'drive', go: () => setSection('drive') },
        // 프로젝트별 드라이브 '빌드파일' 폴더의 파일 - 드라이브 목록에서 뽑는다
        { key: 'builds', label: '빌드 파일', icon: 'build', active: section === 'builds', go: () => setSection('builds') },
        { key: 'docs', label: '팀 위키', icon: 'wiki', count: liveDocCount(docStore.docs),
          active: section === 'docs', go: () => setSection('docs') },
        // 나만 보는 메모 - 브라우저 저장 모드는 '나'를 바꿔 쓸 수 있어 쓴 사람으로 센다
        { key: 'memos', label: '내 메모', icon: 'memo', count: memoStore.memos.filter((m) => m.owner === me).length,
          active: section === 'memos', go: () => setSection('memos') },
      ],
    },
    {
      // 보고는 열 때만 표를 읽으므로 숫자를 달지 않는다
      label: '보고',
      items: [
        { key: 'daily', label: '일간보고', icon: 'daily', active: section === 'daily', go: () => setSection('daily') },
        { key: 'weekly', label: '주간보고', icon: 'weekly', active: section === 'weekly', go: () => setSection('weekly') },
      ],
    },
    {
      // 팀원 모두가 함께 쓰는 블로그 하나 - 열 때 표를 읽으므로 숫자를 달지 않는다
      label: '커뮤니티',
      items: [
        { key: 'blog', label: '블로그', icon: 'blog', active: section === 'blog', go: () => setSection('blog') },
      ],
    },
  ];

  const navLinks = (after?: () => void, compact = false) =>
    nav.map((g, gi) => (
      <div key={gi} className="contents">
        {/* 접힌 메뉴: 묶음 이름 대신 가는 선. 영역 '관리'는 메뉴를 펼쳐서 쓴다 */}
        {g.label && compact && <hr className="mx-2 my-1.5 border-tm-line" />}
        {g.label && !compact && (
          <div className="mx-3 mb-1 mt-3 flex items-center justify-between gap-2">
            <p className="text-[12.5px] font-bold text-tm-sub">{g.label}</p>
            {g.action && (
              <button type="button" aria-label={g.action.label} onClick={() => { after?.(); g.action?.go(); }}
                className="-my-1 -mr-2 rounded-md px-2 py-1 text-[12.5px] font-bold text-tm-blue transition-colors duration-150 hover:bg-tm-tint
                           [@media(pointer:coarse)]:min-h-11">
                {g.action.text}
              </button>
            )}
          </div>
        )}
        {g.items.map((it) => compact ? (
          <button key={it.key} type="button" aria-current={it.active ? 'page' : undefined}
            onClick={() => { it.go(); after?.(); }}
            title={it.count === undefined ? it.label : `${it.label} ${it.count}건`}
            aria-label={it.count === undefined ? it.label : `${it.label} ${it.count}건`}
            className={`flex min-h-[54px] w-full flex-col items-center justify-center gap-1 rounded-tm-sm px-1 py-1.5 text-[12px] leading-tight
                        transition-colors duration-150 ${
              it.active ? 'bg-tm-blue font-bold text-white' : 'font-semibold text-tm-ink hover:bg-tm-tint'}`}>
            <span className="relative grid h-6 w-6 place-items-center" aria-hidden>
              {it.icon ? <IconNav name={it.icon} /> : (
                <span className={`h-3 w-3 rounded-[4px] ${it.dot ? DOMAIN_FILL[it.dot] : ''} ${it.active ? 'ring-2 ring-white' : ''}`} />
              )}
              {(it.count ?? 0) > 0 && (
                <span className={`absolute -right-3 -top-1.5 inline-grid h-[18px] min-w-[20px] place-items-center rounded-full px-1 text-[12px] font-bold leading-none tabular-nums ${
                  it.active ? 'bg-tm-card text-tm-blue' : 'bg-tm-tint text-tm-deep'}`}>
                  {it.count}
                </span>
              )}
            </span>
            <span className="block w-full truncate text-center" aria-hidden>{it.label}</span>
          </button>
        ) : (
          <button key={it.key} type="button" aria-current={it.active ? 'page' : undefined}
            onClick={() => { it.go(); after?.(); }}
            className={`group flex min-h-[42px] w-full items-center gap-3 rounded-tm-sm px-3 text-left text-[15px] transition-colors duration-150
                        [@media(pointer:coarse)]:min-h-11 ${
              it.active ? 'bg-tm-blue font-bold text-white' : 'font-semibold text-tm-ink hover:bg-tm-tint'}`}>
            {it.icon ? <IconNav name={it.icon} /> : (
              <span className="grid h-5 w-5 flex-none place-items-center" aria-hidden>
                <span className={`h-2.5 w-2.5 rounded-[3px] ${it.dot ? DOMAIN_FILL[it.dot] : ''} ${it.active ? 'ring-2 ring-white' : ''}`} />
              </span>
            )}
            <span className="min-w-0 truncate">{it.label}</span>
            {it.count !== undefined && (
              <span className={`ml-auto inline-grid h-[22px] min-w-[26px] flex-none place-items-center rounded-full px-2 text-[12.5px] font-bold tabular-nums ${
                it.active ? 'bg-white/20 text-white' : 'bg-tm-tint text-tm-deep group-hover:bg-tm-card'}`}>
                {it.count}
              </span>
            )}
          </button>
        ))}
        {/* 접힌 메뉴에는 묶음 이름 옆 단추가 없어 '모든 영역'을 아이콘 칸으로 둔다 */}
        {compact && g.action && !g.items.some((it) => it.key === 'fav-pick') && (
          <button type="button" onClick={() => { after?.(); g.action?.go(); }} title={g.action.label} aria-label={g.action.label}
            className="flex min-h-[54px] w-full flex-col items-center justify-center gap-1 rounded-tm-sm px-1 py-1.5 text-[12px] font-semibold leading-tight
                       text-tm-sub transition-colors duration-150 hover:bg-tm-tint">
            <IconNav name="star" />
            {g.action.text}
          </button>
        )}
      </div>
    ));

  /* 좁은 화면 아래쪽 - 자주 쓰는 셋 + 전체 메뉴 */
  const tabs = nav.flatMap((g) => g.items).filter((it) => it.key === 'all' || it.key === 'mine' || it.key === 'docs');
  const inTabs = tabs.some((t) => t.active);
  /* 가로로 든 휴대폰처럼 낮은 화면에서는 그림과 글자를 한 줄에 두어 본문 자리를 늘린다 */
  const tabItem = (active: boolean) =>
    `flex min-h-[54px] flex-col items-center justify-center gap-[3px] rounded-tm-sm text-[12.5px]
     [@media(max-height:500px)]:min-h-10 [@media(max-height:500px)]:flex-row [@media(max-height:500px)]:gap-1.5 ${
      active ? 'bg-tm-tint font-bold text-tm-blue' : 'font-semibold text-tm-sub'}`;

  /* 영역도 받은 뒤에 그린다 - 바꾼 영역 이름 대신 처음 이름이 잠깐 보이지 않게. 작업을 못 읽었으면 그 안내를 먼저 */
  if (!store.ready || (!domainStore.ready && !store.loadError)) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-tm-bg text-[15px] font-semibold text-tm-sub">
        불러오는 중…
      </div>
    );
  }

  const page = (
    <div className={`grid h-[100dvh] grid-rows-[minmax(0,1fr)] overflow-hidden bg-tm-bg text-[15.5px] leading-[1.6] text-tm-ink
                    transition-[grid-template-columns] duration-200 max-[900px]:grid-cols-[minmax(0,1fr)] ${
                    rail ? 'grid-cols-[88px_minmax(0,1fr)]' : 'grid-cols-[268px_minmax(0,1fr)]'}`}>

      {/* ── 넓은 화면: 왼쪽 메뉴 ── */}
      <aside className={`flex min-h-0 flex-col overflow-y-auto overflow-x-hidden border-r border-tm-line bg-tm-card pb-3.5 max-[900px]:hidden ${
        rail ? 'px-2 pt-4' : 'px-4 pt-[22px]'}`}>
        {rail ? (
          <div className="mb-2 flex flex-col items-center gap-1.5">
            <button type="button" onClick={() => goTasks({ kind: 'all' })} aria-label="Hub 처음 화면"
              className="grid min-h-11 place-items-center rounded-tm-sm px-1.5">
              <Image src="/images/logo.png" alt="" width={64} height={16} priority className="h-auto w-[64px]" />
            </button>
            <button type="button" onClick={() => setRail(false)} aria-expanded={false} aria-label="메뉴 펼치기" title="메뉴 펼치기"
              className={tmIconBtnSm}>
              <IconNav name="sidebar" />
            </button>
          </div>
        ) : (
          <div className="mb-1 flex items-start justify-between gap-2">
            <button type="button" onClick={() => goTasks({ kind: 'all' })} aria-label="Hub 처음 화면"
              className="flex flex-col items-start gap-2.5 rounded-tm-sm px-2.5 pb-3.5 text-left">
              <Image src="/images/logo.png" alt="" width={124} height={31} priority className="h-auto w-[124px]" />
              <span className="rounded-full bg-tm-tint px-[11px] py-[3px] text-[12.5px] font-bold text-tm-deep">Hub</span>
            </button>
            <button type="button" onClick={() => setRail(true)} aria-expanded aria-label="메뉴 접기" title="메뉴 접기"
              className={`-mr-1.5 ${tmIconBtnSm}`}>
              <IconNav name="sidebar" />
            </button>
          </div>
        )}

        <nav className={`flex flex-col ${rail ? 'gap-0.5' : 'gap-1'}`} aria-label="Hub 메뉴">
          {navLinks(undefined, rail)}
        </nav>

        {rail ? (
          <div className="mt-auto flex flex-col gap-0.5 border-t border-tm-line pt-2">
            <button type="button" onClick={() => setAppOpen(true)} title="갤럭시 위젯 앱" aria-label="갤럭시 위젯 앱" className={railItem}>
              <IconNav name="phone" />
              <span aria-hidden>위젯 앱</span>
            </button>
            <button type="button" onClick={() => setWinOpen(true)} title="Windows 위젯" aria-label="Windows 위젯" className={railItem}>
              <IconNav name="monitor" />
              <span aria-hidden>PC 위젯</span>
            </button>
            <Link href="/" onClick={leaveHub} title="홈페이지로" aria-label="홈페이지로" className={railItem}>
              <IconNav name="home" />
              <span aria-hidden>홈페이지</span>
            </Link>
            <ThemeCycle className={railItem} />
            {/* 로그인했으면 팀원 창(내 정보), 아니면 '지금 쓰는 사람'을 고르도록 메뉴를 편다. 로그아웃도 펼친 메뉴에 있다 */}
            <button type="button" onClick={() => (account ? setTeamOpen(true) : setRail(false))}
              aria-haspopup={account ? 'dialog' : undefined}
              title={account ? '내 정보 · 팀원 (로그아웃은 메뉴를 펼쳐서)' : '지금 쓰는 사람 바꾸기'}
              aria-label={account ? '내 정보 · 팀원' : '지금 쓰는 사람 바꾸기'}
              className="relative mx-auto mt-1 grid h-12 w-12 place-items-center rounded-full transition-colors duration-150 hover:bg-tm-tint">
              <Avatar id={me} size={36} />
              {pendingCount > 0 && (
                <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-tm-red ring-2 ring-tm-card" aria-label={`승인 대기 ${pendingCount}명`} />
              )}
            </button>
          </div>
        ) : (
        <div className="mt-auto flex flex-col gap-1.5 border-t border-tm-line pt-2.5">
          <button type="button" onClick={() => setAppOpen(true)}
            className="flex min-h-[42px] items-center gap-3 rounded-tm-sm px-3 text-left text-[15px] font-semibold text-tm-ink transition-colors duration-150 hover:bg-tm-tint">
            <IconNav name="phone" />
            <span>갤럭시 위젯 앱</span>
          </button>
          <button type="button" onClick={() => setWinOpen(true)}
            className="flex min-h-[42px] items-center gap-3 rounded-tm-sm px-3 text-left text-[15px] font-semibold text-tm-ink transition-colors duration-150 hover:bg-tm-tint">
            <IconNav name="monitor" />
            <span>Windows 위젯</span>
          </button>
          <Link href="/" onClick={leaveHub}
            className="flex min-h-[42px] items-center gap-3 rounded-tm-sm px-3 text-[15px] font-semibold text-tm-ink transition-colors duration-150 hover:bg-tm-tint">
            <IconNav name="home" />
            <span>홈페이지로</span>
          </Link>
          <ThemeSwitch />
          {account ? (
            <>
              <AccountButton member={account.me} pending={pendingCount} onOpen={() => setTeamOpen(true)} />
              <button type="button" onClick={() => void logout()} disabled={leaving} className={logoutBtn}>
                {leaving ? '로그아웃 중…' : '로그아웃'}
              </button>
            </>
          ) : (
            <MePicker me={me} onPick={pickMe} id="tm-me" />
          )}
        </div>
        )}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col">

        {/* ── 좁은 화면: 위쪽 띠 ── */}
        <header className="relative z-30 flex h-[58px] flex-none items-center justify-between gap-3 border-b border-tm-line bg-tm-card px-4 min-[901px]:hidden
                           [@media(max-height:500px)]:h-12">
          <button type="button" onClick={() => goTasks({ kind: 'all' })} aria-label="Hub 처음 화면"
            className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-tm-sm">
            <Image src="/images/logo.png" alt="" width={96} height={24} className="h-auto w-[96px]" />
            <span className="whitespace-nowrap rounded-full bg-tm-tint px-[9px] py-0.5 text-[12px] font-bold text-tm-deep">Hub</span>
          </button>
          <details ref={acct} className="relative">
            <summary aria-label="사람 메뉴"
              className="relative grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full [&::-webkit-details-marker]:hidden">
              <Avatar id={me} size={34} />
              {pendingCount > 0 && (
                <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-tm-red ring-2 ring-tm-card" aria-label={`승인 대기 ${pendingCount}명`} />
              )}
            </summary>
            <div className="absolute right-0 top-[50px] z-40 flex w-[256px] flex-col gap-3 rounded-tm border border-tm-line bg-tm-card p-4 shadow-tm-up">
              {account ? (
                <AccountButton member={account.me} pending={pendingCount}
                  onOpen={() => { if (acct.current) acct.current.open = false; setTeamOpen(true); }} />
              ) : (
                <MePicker me={me} onPick={pickMe} id="tm-me-m" />
              )}
              <Link href="/" onClick={leaveHub}
                className="flex min-h-[44px] items-center justify-between gap-2 rounded-tm-sm bg-tm-tint px-3 text-[14px] font-semibold text-tm-ink">
                홈페이지로 <IconNav name="home" size={18} />
              </Link>
              <button type="button" onClick={() => { if (acct.current) acct.current.open = false; setAppOpen(true); }}
                className="flex min-h-[44px] items-center justify-between gap-2 rounded-tm-sm bg-tm-tint px-3 text-left text-[14px] font-semibold text-tm-ink">
                갤럭시 위젯 앱 <IconNav name="phone" size={18} />
              </button>
              <ThemeSwitch />
              {account && (
                <button type="button" onClick={() => void logout()} disabled={leaving} className={logoutBtn}>
                  {leaving ? '로그아웃 중…' : '로그아웃'}
                </button>
              )}
            </div>
          </details>
        </header>

        {/* ── 본문 - 좁거나 낮은 화면에서는 쪽 머리째 스크롤한다(globals.css 의 tm-page · tm-fill) ── */}
        <div className="tm-page flex min-h-0 flex-1 flex-col px-11 pb-7 pt-10 max-[1500px]:px-8 max-[900px]:px-4 max-[900px]:pb-4 max-[900px]:pt-5">
          <div className="tm-page-inner mx-auto flex min-h-0 w-full max-w-[1560px] flex-1 flex-col min-[1800px]:max-w-[2200px]">

            {section === 'drive' ? (
              /* 빈 새 폴더 지우기는 관리자만(드라이브 쪽 웹 앱도 다시 본다) */
              <Drive me={me} admin={!!account && account.me.isAdmin === true} />
            ) : section === 'builds' ? (
              <Builds me={me} admin={!!account && account.me.isAdmin === true} />
            ) : section === 'org' ? (
              <Org me={me} tasks={teamTasks}
                /* 소속 · 상위와 남의 카드는 관리자만(DB 도 그렇게 받는다). 브라우저 저장 모드는 계정이 없어 누구나 */
                admin={!account || account.me.isAdmin === true}
                onRole={account ? (id, role) => account.update(id, { role }) : undefined}
                onTasks={(id) => setSection('tasks', () => { setScope({ kind: 'all' }); setAssigneeFilter(id); })}
                onNotice={(text, tone) => setToast({ text, undo: false, tone: tone === 'err' ? 'err' : undefined })} />
            ) : section === 'docs' ? (
              <Docs store={docStore} me={me} tasks={tasksAll}
                onTaskClick={(key) => {
                  const hit = tasksAll.find((t) => t.key === key);
                  if (hit) setSection('tasks', () => setOpenId(hit.id));
                  else setToast({ text: `${key} 작업을 찾을 수 없습니다`, undo: false });
                }}
                onNotice={(text, tone) => setToast({ text, undo: false, tone: tone === 'err' ? 'err' : undefined })} />
            ) : section === 'memos' ? (
              <Memos store={memoStore} me={me} />
            ) : section === 'blog' ? (
              <Blog me={me} docs={docStore.docs} tasks={teamTasks}
                /* 공지 · 카테고리 · 남의 글 지우기는 관리자만(DB 도 그렇게 받는다). 브라우저 저장 모드는 계정이 없어 누구나 */
                admin={!account || account.me.isAdmin === true}
                onOpenDoc={(id) => {
                  // 위키는 열 때 주소의 ?doc= 를 읽는다
                  const url = new URL(window.location.href);
                  url.searchParams.delete('post');
                  url.searchParams.set('doc', id);
                  window.history.replaceState(window.history.state, '', url);
                  setSection('docs');
                }}
                onTaskOpen={(key) => {
                  const hit = tasksAll.find((t) => t.key === key);
                  if (hit) setSection('tasks', () => setOpenId(hit.id));
                  else setToast({ text: `${key} 작업을 찾을 수 없습니다`, undo: false });
                }}
                onNotice={(text, tone) => setToast({ text, undo: false, tone: tone === 'err' ? 'err' : undefined })} />
            ) : section === 'daily' || section === 'weekly' ? (
              <Reports kind={section} onKind={setSection} me={me} tasks={teamTasks} flushRef={reportsFlush} leaveRef={reportsLeave}
                /* 명단은 Supabase 모드에서 관리자만(DB 도 관리자 것만 받는다). 브라우저 저장 모드는 계정이 없어 누구나 */
                canEditPeople={!account || account.me.isAdmin === true}
                onTaskOpen={(id) => setSection('tasks', () => setOpenId(id))}
                onNotice={(text, tone) => setToast({ text, undo: false, tone: tone === 'err' ? 'err' : undefined })} />
            ) : (
              <>
                <PageHead
                  title={scopeTitle}
                  lead={currentView.hint}
                  saved={saved}
                >
                  {/* 좁은 화면: 새 작업 버튼은 제목 옆으로 가고, 보기 알약은 아래 줄을 혼자 다 쓴다(넘치면 가로로 민다) */}
                  <div ref={viewTabs} role="group" aria-label="보기"
                    className="no-scrollbar -my-1 flex min-w-0 items-center gap-1.5 overflow-x-auto py-1 max-[720px]:order-1 max-[720px]:basis-full">
                    {VIEWS.map((v) => (
                      <button key={v.id} type="button" onClick={() => setView(v.id)}
                        aria-pressed={view === v.id}
                        title={`${v.label} (${v.key.toUpperCase()})`}
                        className={tmTab}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={newTask} className={`${tmBtnPrimary} flex-none max-[720px]:px-4`}>
                    <IconPlus />
                    새 작업
                  </button>
                </PageHead>

                {/* 찾기 · 걸러 보기 */}
                <div className="mb-[18px] flex flex-none flex-wrap items-center gap-2.5 max-[720px]:mb-3.5">
                  <div className="relative min-w-0 max-w-[420px] flex-[1_1_260px] max-[720px]:max-w-none max-[720px]:flex-[1_1_150px]">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-sub">
                      <IconSearch />
                    </span>
                    <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur(); }
                      }}
                      placeholder="작업 검색"
                      aria-label="작업 검색"
                      className={`${tmInput} pl-11 pr-12`} />
                    <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-tm-line bg-tm-bg px-2 py-0.5 text-[12px] font-bold text-tm-sub sm:block">
                      /
                    </kbd>
                  </div>

                  {compactFilters && (
                  <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="tm-filters"
                    className="inline-flex h-12 flex-none items-center gap-2 rounded-tm-sm border border-tm-edge bg-tm-card px-3.5 text-[15px] font-bold text-tm-ink
                               transition-colors duration-150 aria-expanded:border-tm-blue aria-expanded:bg-tm-tint">
                    <IconNav name="filter" size={18} />
                    걸러 보기
                    {filterCount > 0 && <span className={tmCount} aria-label={`${filterCount}개 켜짐`}>{filterCount}</span>}
                  </button>
                  )}

                  <div id="tm-filters" className={compactFilters && !filtersOpen ? 'hidden' : 'contents'}>
                  <label className="sr-only" htmlFor="tm-filter-priority">우선순위로 걸러 보기</label>
                  <select id="tm-filter-priority" value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                    className={`${tmSelect} min-w-0 flex-[0_1_200px] max-[720px]:flex-[1_1_140px]`}>
                    <option value="all">우선순위 전체</option>
                    {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>

                  {scope.kind !== 'mine' && (
                    <>
                      <label className="sr-only" htmlFor="tm-filter-assignee">담당자로 걸러 보기</label>
                      <select id="tm-filter-assignee" value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className={`${tmSelect} min-w-0 flex-[0_1_200px] max-[720px]:flex-[1_1_140px]`}>
                        <option value="all">담당자 전체</option>
                        {people.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        <option value="none">미배정</option>
                      </select>
                    </>
                  )}

                  <button type="button" onClick={() => setHideDone(!hideDone)} aria-pressed={hideDone} className={tmTab}>
                    완료 숨기기
                  </button>
                  {hierarchy && (
                    <button type="button" onClick={() => setTopOnly(!topOnly)} aria-pressed={topOnly} className={tmTab}
                      title="다른 작업의 하위 업무는 숨기고 상위 작업만 봅니다">
                      상위 작업만
                    </button>
                  )}
                  </div>

                  {filtersOn && (
                    <button type="button" onClick={clearFilters} className={tmTextBtn}>
                      필터 초기화
                    </button>
                  )}

                  <span className="ml-auto text-[14px] font-semibold tabular-nums text-tm-sub max-[720px]:hidden">{visible.length}건 표시</span>
                </div>

                {/* Supabase 모드 - 예전에 이 브라우저에 쓴 것을 팀 저장소로 옮길지 */}
                {leftover && (
                  <div role="status" className={`${tmCallout} mb-[18px] flex-none max-[720px]:mb-3.5`}>
                    <p className="min-w-0 flex-[1_1_320px] max-[720px]:flex-[1_1_180px]">
                      이 브라우저에 예전에 쓴{' '}
                      <b className="font-bold text-tm-deep">
                        {[leftover.tasks && `작업 ${leftover.tasks}건`, leftover.docs && `문서 ${leftover.docs}건`].filter(Boolean).join(' · ')}
                      </b>
                      이 남아 있습니다.<span className="max-[720px]:hidden"> 옮기면 팀원 모두가 함께 봅니다. 예시 데이터는 옮기지 않습니다.</span>
                    </p>
                    <div className="flex flex-none gap-2">
                      <button type="button" onClick={() => { skipImport(); setLeftover(null); }} disabled={importing} className={tmGhostBtn}>
                        그만 보기
                      </button>
                      <button type="button" onClick={() => void runImport()} disabled={importing} className={tmEditBtn}>
                        {importing ? '옮기는 중…' : '가져오기'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 예시 작업 안내 - 실제 프로젝트 이름이 들어 있어, 말해 주지 않으면 진짜 작업으로 읽힌다 */}
                {sampleCount > 0 && (
                  <div role="status" className={`${tmCallout} mb-[18px] flex-none max-[720px]:mb-3.5`}>
                    <p className="min-w-0 flex-[1_1_320px] max-[720px]:flex-[1_1_180px]">
                      <b className="font-bold text-tm-deep">예시 작업 {sampleCount}건</b>이 들어 있습니다.{' '}
                      <span className="max-[720px]:hidden">쓰는 법을 보여 주려고 넣어 둔 것이고 </span>실제 작업이 아닙니다.
                    </p>
                    <button type="button" onClick={store.clearSamples} className={tmGhostBtn}>
                      예시 지우기
                    </button>
                  </div>
                )}

                {/* 보기 자리 - 넓은 화면에서는 남은 높이를, 휴대폰에서는 화면 한 장 높이를 쓴다 */}
                <div className="tm-fill flex min-h-0 flex-1 flex-col">

                {/* ── 목록을 읽지 못함(Supabase 모드) - 빈 보드처럼 보이지 않게 ── */}
                {slot === 'error' && (
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-tm border border-tm-line bg-tm-card px-6 py-16 text-center shadow-tm">
                    <p className="text-[20px] font-extrabold text-tm-deep">작업을 불러오지 못했습니다</p>
                    <p className="mb-3 max-w-[44ch] text-[15.5px] leading-[1.7] text-tm-ink">{store.loadError}</p>
                    <button type="button" onClick={() => void retryLoad()} disabled={retrying} className={tmBtn}>
                      {retrying ? '다시 읽는 중…' : '다시 시도'}
                    </button>
                  </div>
                )}

                {/* ── 타임라인 ── */}
                {slot === 'timeline' && (
                  <Timeline tasks={visible} onOpen={setOpenId} colorBy={colorBy} onColorBy={setColorBy} onEditColors={editColors} />
                )}

                {/* ── 캘린더 ── */}
                {slot === 'calendar' && (
                  <Calendar tasks={visible} onOpen={setOpenId} onCreateAt={createAt} onReschedule={reschedule}
                    colorBy={colorBy} onColorBy={setColorBy} onEditColors={editColors} />
                )}

                {/* ── 로드맵 ── */}
                {slot === 'roadmap' && <Roadmap tasks={visible} onOpen={setOpenId} />}

                {/* ── 보드 - 걸러 보기에 맞는 것이 하나도 없으면 칸마다 '작업 추가'를 늘어놓지 않고 한 번만 알린다 ── */}
                {slot === 'board' && filtersOn && visible.length === 0 && (
                  <div className="min-h-0 flex-1 overflow-auto rounded-tm border border-tm-line bg-tm-card shadow-tm">{emptyState}</div>
                )}
                {slot === 'board' && !(filtersOn && visible.length === 0) && (
                  <div className="-mx-1 -mb-1 min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-1 pb-1
                                  max-[900px]:snap-x max-[900px]:snap-mandatory max-[900px]:scroll-px-1">
                    {/* 넓은 화면(1280~)에서는 다섯 칸을 나눠 채운다 - 1366 노트북에서도 가로 스크롤 없이 다 보이게 */}
                    <div className="flex h-full min-w-max items-stretch gap-3 xl:min-w-0">
                      {STATUSES.map((s) => {
                        const items = byStatus[s.id];
                        const active = dropAt?.status === s.id;
                        return (
                          <section key={s.id} aria-label={s.label}
                            onDragOver={(e) => onColumnDragOver(e, s.id, null)}
                            onDrop={(e) => onDrop(e, s.id, null)}
                            className={`flex h-full min-h-0 w-[288px] shrink-0 flex-col rounded-tm border shadow-tm transition-colors duration-150
                                        max-[900px]:w-[272px] max-[900px]:snap-start max-[560px]:w-[calc(100vw-72px)] xl:w-auto xl:min-w-[196px] xl:flex-1 ${
                              active ? 'border-tm-blue bg-tm-tint' : 'border-tm-line bg-tm-card'
                            }`}>
                            <div className="flex flex-none items-center gap-2.5 py-3 pl-4 pr-2.5">
                              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLE[s.id].dot}`} aria-hidden />
                              <h2 className="text-[16px] font-extrabold text-tm-deep">{s.label}</h2>
                              <span className={tmCount}>{items.length}</span>
                              <button type="button" onClick={() => setCreating(s.id)}
                                aria-label={`${s.label}에 작업 추가`}
                                className={`ml-auto ${tmIconBtnSm}`}>
                                <IconPlus size={17} />
                              </button>
                            </div>

                            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-3 pt-1">
                              {items.map((t, i) => (
                                /* 삽입 표시선은 absolute 로 띄운다 - 레이아웃을 밀면 드롭 직전에
                                   커서 아래 요소가 바뀌어 drop 이 취소된다 */
                                <div key={t.id} className="relative"
                                  onDragOver={(e) => { e.stopPropagation(); onColumnDragOver(e, s.id, t.id); }}
                                  onDrop={(e) => onDrop(e, s.id, t.id)}>
                                  {active && dropAt?.beforeId === t.id && (
                                    <span className="pointer-events-none absolute -top-[7px] left-1 right-1 h-[3px] rounded-full bg-tm-blue" />
                                  )}
                                  <TaskCard task={t} dragging={dragId === t.id}
                                    mine={t.assignee === me}
                                    parent={parentFor(t)} sub={kin.sub.get(t.id)}
                                    onMove={(st, keyboard) => {
                                      store.move(t.id, st, null);
                                      // 키보드로 옮겼으면 옮겨 간 카드에 초점을 다시 둔다 - 이어서 또 옮길 수 있게
                                      if (keyboard) setRefocus({ id: t.id, alt: (items[i + 1] ?? items[i - 1])?.id ?? null });
                                    }}
                                    onOpen={() => setOpenId(t.id)}
                                    onDragStart={(e) => {
                                      e.dataTransfer.effectAllowed = 'move';
                                      e.dataTransfer.setData('text/plain', t.id);
                                      setDragId(t.id);
                                    }}
                                    onDragEnd={() => { setDragId(null); setDropAt(null); }} />
                                </div>
                              ))}

                              {/* 걸러 보기로 비었으면 '작업 추가' 대신 그렇다고만 적는다 - 정말 빈 칸처럼 보이지 않게 */}
                              {items.length === 0 && !active && hiddenIn.has(s.id) && (
                                <p className="rounded-tm-btn border-2 border-dashed border-tm-edge/50 px-3 py-6 text-center text-[13.5px] font-semibold text-tm-sub">
                                  {s.id === 'done' && hideDone ? '완료 숨기기가 켜져 있습니다' : '조건에 맞는 작업 없음'}
                                </p>
                              )}
                              {items.length === 0 && !active && !hiddenIn.has(s.id) && (
                                <button type="button" onClick={() => setCreating(s.id)}
                                  className="flex w-full flex-col items-center gap-1.5 rounded-tm-btn border-2 border-dashed border-tm-edge/50 px-3 py-6 text-center
                                             transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint">
                                  <span className="mb-1 grid h-8 w-8 place-items-center rounded-full bg-tm-blue text-white">
                                    <IconPlus size={16} />
                                  </span>
                                  <span className="text-[14.5px] font-bold text-tm-blue">작업 추가</span>
                                  <span className="text-[13px] text-tm-sub">{s.hint}</span>
                                </button>
                              )}

                              {/* 칼럼 끝에 놓을 자리 - 항상 자리를 차지해 레이아웃이 흔들리지 않는다 */}
                              <div className="relative h-6"
                                onDragOver={(e) => { e.stopPropagation(); onColumnDragOver(e, s.id, null); }}
                                onDrop={(e) => onDrop(e, s.id, null)}>
                                {active && dropAt?.beforeId === null && (
                                  <span className="pointer-events-none absolute left-1 right-1 top-1 h-[3px] rounded-full bg-tm-blue" />
                                )}
                              </div>
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── 목록 ── */}
                {slot === 'list' && (
                  <div className="min-h-0 flex-1 overflow-auto rounded-tm border border-tm-line bg-tm-card shadow-tm max-[640px]:hidden">
                    <table className="w-full min-w-[780px] border-collapse text-[15px]">
                      <thead>
                        <tr className="text-left text-[13px] text-tm-sub">
                          {([
                            ['title', '작업', ''],
                            ['status', '상태', 'w-[118px]'],
                            ['priority', '우선순위', 'w-[110px]'],
                            ['domain', '영역', 'w-[132px]'],
                            ['due', '마감', 'w-[118px]'],
                            ['assignee', '담당', 'w-[72px] text-center'],
                          ] as const).map(([by, label, cls]) => (
                            <th key={by}
                              className={`sticky top-0 z-10 bg-tm-bg px-4 py-3 font-bold shadow-[inset_0_-1px_0_rgb(var(--tm-line))] ${cls}`}
                              aria-sort={sort?.by === by ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                              {/* 손가락 기기에서는 칸 높이만큼 누를 자리를 넓힌다 - 글자 높이(21px)로는 잘 안 눌린다 */}
                              <button type="button" onClick={() => toggleSort(by)}
                                className="group/sort inline-flex items-center gap-1 rounded-md transition-colors duration-150 hover:text-tm-ink
                                           [@media(pointer:coarse)]:-my-3 [@media(pointer:coarse)]:py-3 [@media(pointer:coarse)]:-mx-2 [@media(pointer:coarse)]:px-2">
                                {label}
                                {/* 정렬 표시는 고른 열에만 - 흐린 화살표를 모든 열에 두면 어느 열 기준인지 안 보인다 */}
                                <span className={`text-[10px] leading-none text-tm-blue transition-opacity duration-150 ${
                                  sort?.by === by ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-50'}`}>
                                  {sort?.by === by && sort.dir === -1 ? '▼' : '▲'}
                                </span>
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((t) => (
                          <tr key={t.id} onClick={() => setOpenId(t.id)} tabIndex={0}
                            onKeyDown={(e) => {
                              // 기본 동작을 막아야 같은 Enter 가 새로 열린 패널의 닫기 단추를 누르지 않는다
                              if (e.key === 'Enter') { e.preventDefault(); setOpenId(t.id); }
                            }}
                            className="cursor-pointer border-b border-tm-line transition-colors duration-150 last:border-0 hover:bg-tm-tint
                                       focus-visible:bg-tm-tint focus-visible:outline-offset-[-2px]">
                            <td className="px-4 py-3.5">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span className="flex-none text-[13px] font-bold tabular-nums text-tm-sub">{t.key}</span>
                                <TaskMarks task={t} />
                                <span className={`min-w-0 font-semibold ${t.status === 'done' ? 'text-tm-sub line-through' : 'text-tm-ink'}`}>
                                  {t.title}
                                </span>
                                {subCount(t)}
                              </div>
                              {parentLine(t, 'mt-0.5')}
                            </td>
                            <td className="px-4 py-3.5"><StatusPill s={t.status} /></td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[14px] ${PRIORITY_STYLE[t.priority].text}`}>
                                <PriorityDot p={t.priority} />
                                {priorityLabel(t.priority)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <DomainChip id={t.domain} />
                            </td>
                            <td className="px-4 py-3.5">
                              <DueBadge due={t.due} done={t.status === 'done'} />
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex"><Avatar id={t.assignee} size={28} /></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {visible.length === 0 && emptyState}
                  </div>
                )}
                {/* 휴대폰: 표는 가로로 밀어야 상태 뒤 칸이 보였다 - 한 작업을 두 줄 카드로, 정렬은 고르기 칸으로 */}
                {slot === 'list' && (
                  <div className="hidden min-h-0 flex-1 flex-col max-[640px]:flex">
                    <div className="mb-2.5 flex flex-none items-center gap-2.5">
                      <label className="sr-only" htmlFor="tm-list-sort">줄 세우기</label>
                      <select id="tm-list-sort" value={sort ? `${sort.by}:${sort.dir}` : 'none'}
                        onChange={(e) => {
                          const [by, dir] = e.target.value.split(':');
                          setSort(by === 'none' ? null : { by: by as NonNullable<typeof sort>['by'], dir: dir === '-1' ? -1 : 1 });
                        }}
                        className={`${tmSelect} min-w-0 flex-1`}>
                        <option value="none">상태 순(보드와 같은 순서)</option>
                        <option value="due:1">마감 빠른 순</option>
                        <option value="priority:1">우선순위 높은 순</option>
                        <option value="title:1">제목 가나다순</option>
                        <option value="domain:1">영역 순</option>
                        <option value="assignee:1">담당자 이름 순</option>
                      </select>
                      <span className="flex-none text-[14px] font-semibold tabular-nums text-tm-sub">{visible.length}건</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-auto rounded-tm border border-tm-line bg-tm-card shadow-tm">
                      <ul>
                        {sorted.map((t) => (
                          <li key={t.id} className="border-b border-tm-line last:border-0">
                            <button type="button" onClick={() => setOpenId(t.id)}
                              className="flex w-full flex-col gap-2 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-tm-tint">
                              <span className="flex w-full min-w-0 items-start gap-3">
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 text-[13px] font-bold tabular-nums text-tm-sub">{t.key}<TaskMarks task={t} /></span>
                                  <span className={`block text-[15px] font-semibold leading-[1.45] ${
                                    t.status === 'done' ? 'text-tm-sub line-through' : 'text-tm-ink'}`}>
                                    {t.title}
                                  </span>
                                  {parentLine(t, 'mt-0.5')}
                                </span>
                                <Avatar id={t.assignee} size={28} />
                              </span>
                              <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <StatusPill s={t.status} />
                                <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[13.5px] ${PRIORITY_STYLE[t.priority].text}`}>
                                  <PriorityDot p={t.priority} />
                                  {priorityLabel(t.priority)}
                                </span>
                                <DomainChip id={t.domain} />
                                <DueBadge due={t.due} done={t.status === 'done'} />
                                {subCount(t)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {visible.length === 0 && emptyState}
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── 좁은 화면: 아래쪽 메뉴 ── */}
        <nav aria-label="Hub 메뉴"
          className="grid flex-none grid-cols-4 gap-1 border-t border-tm-line bg-tm-card px-2 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5 min-[901px]:hidden">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={t.go} aria-current={t.active ? 'page' : undefined} className={tabItem(t.active)}>
              {t.icon && <IconNav name={t.icon} />}
              <span>{t.label}</span>
            </button>
          ))}
          <button type="button" aria-haspopup="dialog" aria-current={!inTabs ? 'page' : undefined}
            onClick={() => setMenu(true)} className={tabItem(!inTabs)}>
            <IconNav name="menu" />
            <span>전체 메뉴</span>
          </button>
        </nav>
      </div>

      {open && (
        <TaskPanel task={open} knownLabels={knownLabels} unsaved={sync === 'error'}
          family={hierarchy ? {
            tasks: tasksAll,
            open: setOpenId,
            update: (id, patch) => store.update(id, patch),
            // 새 하위 업무는 상위 업무의 영역으로, 할 일 칸에. 창은 상위 업무에 그대로 둬 이어서 여러 개를 적게 한다
            // 담당자는 상위 업무의 담당자를 그대로 물려받는다(상세 창에서 바꿀 수 있다)
            // 나만 보기 업무의 하위도 나만 보기(남에게 상위 없이 보이지 않게)
            create: (title) => {
              store.create({
                title, parentId: open.id, domain: open.domain, status: 'todo', owner: me, assignee: open.assignee ?? null,
                ...(open.private ? { private: true, assignee: me } : {}),
              });
            },
          } : undefined}
          extras={taskExtras}
          onUpdate={(patch) => store.update(open.id, patch)}
          onRemove={() => { store.remove(open.id); setOpenId(null); }}
          onClose={() => setOpenId(null)} />
      )}

      <Toast
        text={toast?.text ?? null}
        tone={toast?.tone}
        action={toast?.undo ? { label: '실행 취소', kbd: 'Z', onClick: runUndo } : undefined}
        onClose={() => setToast(null)} />

      {account && teamOpen && (
        <TeamDialog me={account.me} members={account.members} recovery={account.recovery}
          onUpdate={account.update} onReject={account.reject} onPhoto={account.setAvatar} onClose={() => setTeamOpen(false)} />
      )}

      {creating && (
        <NewTaskDialog defaultStatus={creating} defaultDomain={newDomain} defaultAssignee={newAssignee}
          defaultDue={creatingDue} knownLabels={knownLabels} extras={taskExtras}
          tasks={hierarchy ? tasksAll : undefined}
          onCreate={handleCreate}
          onClose={() => { setCreating(null); setCreatingDue(null); }} />
      )}

      {menu && (
        <Modal title="전체 메뉴" size="sm" onClose={() => setMenu(false)}>
          <nav className="flex flex-col gap-1" aria-label="전체 메뉴">
            {navLinks(() => setMenu(false))}
          </nav>
        </Modal>
      )}

      {appOpen && <WidgetAppDialog onClose={() => setAppOpen(false)} />}
      {winOpen && <WindowsWidgetDialog onClose={() => setWinOpen(false)} />}

      {colorsOpen && colorStore.editable && (
        <ColorDialog members={members.filter((m) => m.active !== false)} labels={knownLabels} picks={colorStore.picks}
          local={!isRemote} start={colorBy} onPick={colorStore.set} onClose={() => setColorsOpen(false)} />
      )}

      {allDomainsOpen && (
        <AllDomainsDialog domains={domains} favs={favs} counts={counts.perDomain}
          active={section === 'tasks' && scope.kind === 'domain' ? scope.id : null}
          onToggle={toggleFav}
          onGo={(id) => { setAllDomainsOpen(false); setMenu(false); goTasks({ kind: 'domain', id }); }}
          onManage={canEditDomains ? () => { setAllDomainsOpen(false); setDomainsOpen(true); } : undefined}
          onClose={() => setAllDomainsOpen(false)} />
      )}

      {/* 맡은 사람에서 빠지면(다른 창에서 바뀌면) 창도 닫힌다 */}
      {domainsOpen && canEditDomains && (
        <DomainDialog domains={domains} tasks={store.tasks} local={!isRemote}
          onCreate={domainStore.create} onUpdate={domainStore.update} onRemove={removeDomain}
          onClose={() => setDomainsOpen(false)} />
      )}
    </div>
  );

  /* 카드 · 목록 · 보기 · 작업 창이 영역 이름과 색, 사람 · 라벨 색을 여기서 읽는다 */
  return (
    <DomainsContext.Provider value={domains}>
      <ColorsContext.Provider value={colorStore.picks}>{page}</ColorsContext.Provider>
    </DomainsContext.Provider>
  );
}
