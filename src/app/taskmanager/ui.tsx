'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  STATUSES, domainShort, statusLabel,
  type DomainKey, type Priority, type Status, type Task,
} from './types';
import { useMember } from './members';

/*
 * 작업 관리 도구의 화면 부품.
 *
 * 모양은 세종호이스트크레인 리뉴얼 관리자(SejongHoistHomepage 의 admin/(renewal)/_ui)를 옮겼다(2026-10-22).
 * 회색 바탕 위 흰 카드, 14px 모서리, 굵은 제목, 46px 버튼, 가운데 창과 확인 창, 화면 아래 알림.
 * 세종 네이비 자리에는 로고 파랑(tm-blue), 제목 글자에는 짙은 파랑(tm-deep)을 쓴다.
 * 색 · 모서리 · 그림자 값은 tailwind.config.ts 의 tm 한곳에 있다.
 */

/**
 * 옆 패널 안에 초점을 가둔다.
 *
 * 가두지 않으면 Tab 이 뒤쪽 화면으로 빠져나가 키보드만 쓰는 사람이
 * 열려 있는 패널을 잃어버린다. 닫을 때는 열기 전 요소로 되돌린다.
 * (가운데 창은 Modal 이 따로 가둔다)
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const prev = document.activeElement as HTMLElement | null;
    const SELECTOR =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => el.offsetParent !== null);

    // 이미 안쪽에 초점이 있으면 건드리지 않는다 (자동 포커스한 입력란을 빼앗지 않기 위해)
    if (!root.contains(document.activeElement)) focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [active]);

  return ref;
}

/* ── 색 매핑 - 상태 · 우선순위 · 영역 ───────────────────
   세종 관리자에는 없는 갈래라 같은 결(옅은 바탕 + 짙은 글자 알약)로 늘렸다.
   빨강 · 호박색 · 초록은 급함 · 임박 · 끝남의 뜻으로만 쓰고, 영역은 파랑 · 보라 · 청록 · 회색으로 가른다.
   타임라인 막대처럼 흰 글자를 올리는 채움 색은 모두 4.5:1 을 넘긴다. */

export const PRIORITY_STYLE: Record<Priority, { dot: string; text: string }> = {
  urgent: { dot: 'bg-tm-red', text: 'font-bold text-tm-red-deep' },
  high: { dot: 'bg-tm-warn', text: 'font-bold text-tm-warn' },
  normal: { dot: 'bg-tm-edge', text: 'font-semibold text-tm-sub' },
  // 낮음은 속이 빈 점
  low: { dot: 'border-[1.5px] border-tm-edge bg-white', text: 'font-semibold text-tm-sub' },
};

/** 영역 알약 */
export const DOMAIN_STYLE: Record<DomainKey, string> = {
  web: 'bg-tm-tint text-tm-blue',
  game: 'bg-tm-violet-tint text-tm-violet-deep',
  edu: 'bg-tm-teal-tint text-tm-teal-deep',
  ops: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line',
};

/** 영역 채움 - 타임라인 막대 · 캘린더 점 · 메뉴 표식. 흰 글자 대비 5.4:1 이상 */
export const DOMAIN_FILL: Record<DomainKey, string> = {
  web: 'bg-tm-blue',
  game: 'bg-tm-violet',
  edu: 'bg-tm-teal',
  ops: 'bg-tm-sub',
};

/** 상태 - 점과 알약(세종 문의 내역의 상태 알약과 같은 꼴) */
export const STATUS_STYLE: Record<Status, { dot: string; pill: string }> = {
  backlog: { dot: 'bg-tm-edge', pill: 'bg-tm-bg text-tm-sub ring-1 ring-inset ring-tm-line' },
  todo: { dot: 'bg-tm-blue', pill: 'bg-tm-tint text-tm-deep' },
  doing: { dot: 'bg-tm-warn', pill: 'bg-tm-warn-tint text-tm-warn-deep' },
  review: { dot: 'bg-tm-violet', pill: 'bg-tm-violet-tint text-tm-violet-deep' },
  done: { dot: 'bg-tm-ok', pill: 'bg-tm-ok-tint text-tm-ok-deep' },
};

const AVATAR_TONE = [
  'bg-tm-tint text-tm-deep',
  'bg-tm-violet-tint text-tm-violet-deep',
  'bg-tm-ok-tint text-tm-ok-deep',
  'bg-tm-warn-tint text-tm-warn-deep',
  'bg-tm-red-tint text-tm-red-deep',
  'bg-tm-bg text-tm-ink ring-1 ring-inset ring-tm-line',
  'bg-tm-teal-tint text-tm-teal-deep',
];

/* ── 버튼 · 입력 칸 ───────────────────────────────────
   세종 관리자 값 그대로 - 큰 버튼 46px · 12px 모서리, 작은 버튼 38px · 10px.
   테두리는 tm-edge(흰 바탕 3.4:1), 마우스를 올리면 파란 테두리에 옅은 파랑 바탕.
   손가락으로 쓰는 기기에서는 누르는 칸을 44px 로 키운다. */

export const tmBtn =
  'inline-flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-tm-btn border border-tm-edge bg-white px-5 ' +
  'text-[15px] font-bold text-tm-ink transition-colors duration-150 ' +
  'enabled:hover:border-tm-blue enabled:hover:bg-tm-tint disabled:cursor-default disabled:opacity-50';

export const tmBtnPrimary =
  'inline-flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-tm-btn border border-tm-blue bg-tm-blue px-5 ' +
  'text-[15px] font-bold text-white transition-colors duration-150 ' +
  'enabled:hover:border-tm-blue-hover enabled:hover:bg-tm-blue-hover disabled:cursor-default disabled:opacity-50';

export const tmBtnDanger =
  'inline-flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-tm-btn border border-tm-red bg-tm-red px-5 ' +
  'text-[15px] font-bold text-white transition-colors duration-150 ' +
  'enabled:hover:border-tm-red-deep enabled:hover:bg-tm-red-deep disabled:cursor-default disabled:opacity-50';

/** 작은 버튼 - 창 안의 보조 동작, 예시 지우기 같은 것 */
export const tmGhostBtn =
  'inline-flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-tm-sm border border-tm-edge bg-white px-3.5 ' +
  'text-[13.5px] font-semibold text-tm-ink transition-colors duration-150 ' +
  'enabled:hover:border-tm-blue enabled:hover:bg-tm-tint disabled:cursor-default disabled:opacity-50 [@media(pointer:coarse)]:h-11';

export const tmGhostDanger =
  'inline-flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-tm-sm border border-tm-red-line bg-white px-3.5 ' +
  'text-[13.5px] font-semibold text-tm-red-deep transition-colors duration-150 ' +
  'enabled:hover:border-tm-red-deep enabled:hover:bg-tm-red-tint disabled:cursor-default disabled:opacity-50 [@media(pointer:coarse)]:h-11';

/** 옅은 파랑 버튼 - 마우스를 올리면 파랗게 채운다. data-on 이 붙으면 처음부터 채운다(편집 중) */
export const tmEditBtn =
  'inline-flex h-[38px] flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-tm-sm bg-tm-tint px-[18px] ' +
  'text-[14px] font-bold text-tm-deep transition-colors duration-150 hover:bg-tm-blue hover:text-white ' +
  'data-[on]:bg-tm-blue data-[on]:text-white data-[on]:hover:bg-tm-blue-hover [@media(pointer:coarse)]:h-11';

export const tmIconBtn =
  'grid h-[38px] w-[38px] flex-none place-items-center rounded-tm-sm border border-tm-edge bg-white p-0 text-tm-ink ' +
  'transition-colors duration-150 enabled:hover:border-tm-blue enabled:hover:bg-tm-tint disabled:cursor-default disabled:opacity-30 ' +
  '[@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

/** 칸 머리에 붙는 작은 아이콘 버튼(테두리 없음) */
export const tmIconBtnSm =
  'grid h-8 w-8 flex-none place-items-center rounded-lg text-tm-sub transition-colors duration-150 ' +
  'hover:bg-tm-tint hover:text-tm-blue [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11';

/** 둘 이상 중 하나를 고르는 알약 - aria-pressed 인 것을 파랗게 채운다 */
export const tmTab =
  'inline-flex h-[42px] flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-tm-edge bg-white px-4 ' +
  'text-[14.5px] font-bold text-tm-ink transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint ' +
  'aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white [@media(pointer:coarse)]:h-11';

/** 조용한 글자 버튼 - 필터 초기화 같은 것 */
export const tmTextBtn =
  'inline-flex min-h-[38px] items-center px-1 text-[14px] font-bold text-tm-blue underline underline-offset-[3px] ' +
  'transition-colors duration-150 hover:text-tm-deep';

/** 숫자 알약 - 칸 머리의 개수 */
export const tmCount =
  'inline-grid h-[22px] min-w-[26px] place-items-center rounded-full bg-tm-tint px-2 text-[12.5px] font-bold tabular-nums text-tm-deep';

/** 입력 칸 바탕 - 너비 · 높이 · 글자 크기는 쓰는 곳에서 정한다 */
export const tmFieldBase =
  'rounded-tm-sm border border-tm-edge bg-white text-tm-ink transition-[border-color,box-shadow] duration-150 ' +
  'placeholder:text-tm-sub placeholder:opacity-100 focus:border-tm-blue focus:shadow-[0_0_0_3px_rgba(38,68,203,0.2)] ' +
  'aria-[invalid=true]:border-tm-red';
export const tmInput = `${tmFieldBase} h-12 w-full px-3.5 text-[16px]`;
export const tmTextarea = `${tmFieldBase} block min-h-[46px] w-full resize-y px-3.5 py-[11px] text-[16px] leading-[1.6]`;
/** 고르기 칸 - 너비는 쓰는 곳에서(걸러 보기는 내용만큼, 수정 칸은 w-full) */
export const tmSelect = `${tmFieldBase} h-12 cursor-pointer pl-3.5 pr-2 text-[16px]`;

/** 입력 칸 이름 */
export const tmLabel = 'mb-[7px] block text-[14px] font-bold text-tm-ink';

/** 흰 카드 */
export const tmCard = 'rounded-tm border border-tm-line bg-white shadow-tm';

/** 안내 띠 - 왼쪽에 파란 굵은 선. 좁은 화면에서는 글과 버튼을 한 줄에 두도록 줄인다 */
export const tmCallout =
  'flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-tm-sm border border-l-4 border-tm-line border-l-tm-blue bg-white ' +
  'px-[18px] py-3.5 text-[15px] leading-[1.7] text-tm-ink max-[720px]:px-4 max-[720px]:py-3 max-[720px]:text-[14px] max-[720px]:leading-[1.6]';

/* ── 아이콘(선 굵기 1.8 통일 - 세종 관리자와 같은 그림) ───── */
const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function IconPlus({ size = 18 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...svg}><path d="M10 4v12M4 10h12" /></svg>;
}
export function IconClose({ size = 18 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...svg}><path d="M5 5l10 10M15 5L5 15" /></svg>;
}
export function IconArrow({ dir, size = 16 }: { dir: 'left' | 'right' | 'up' | 'down'; size?: number }) {
  const rot = { left: 0, up: 90, right: 180, down: 270 }[dir];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden style={{ transform: `rotate(${rot}deg)` }} {...svg}>
      <path d="M12.5 4.5L7 10l5.5 5.5" />
    </svg>
  );
}
export function IconSearch({ size = 18 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...svg}><circle cx="9" cy="9" r="5.5" /><path d="M13.2 13.2L17 17" /></svg>;
}
export function IconChevron({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...svg}><path d="M5.5 8l4.5 4.5L14.5 8" /></svg>;
}
export function IconCheck({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden {...svg}><path d="M4.5 10.5l3.5 3.5 7.5-8" /></svg>;
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden {...svg} strokeWidth={1.9}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" />
    </svg>
  );
}

/** 메뉴 아이콘 */
export type NavIcon = 'board' | 'mine' | 'wiki' | 'home' | 'menu';
export function IconNav({ name, size = 20 }: { name: NavIcon; size?: number }) {
  const paths: Record<NavIcon, React.ReactNode> = {
    /* 모든 작업 - 보드의 칸 */
    board: (
      <>
        <rect x="3" y="3.5" width="6" height="13" rx="1.2" />
        <rect x="11" y="3.5" width="6" height="8.5" rx="1.2" />
      </>
    ),
    /* 내 작업 - 사람 */
    mine: (
      <>
        <circle cx="10" cy="7" r="3.2" />
        <path d="M4 16.5c.8-3 3.2-4.6 6-4.6s5.2 1.6 6 4.6" />
      </>
    ),
    /* 팀 위키 - 문서 */
    wiki: (
      <>
        <path d="M5.5 3h6l3.5 3.5V17h-9.5z" />
        <path d="M11.5 3v3.5H15M7.8 10h4.4M7.8 13h4.4" />
      </>
    ),
    home: <path d="M3.5 9.5L10 4l6.5 5.5V16a.5.5 0 01-.5.5h-3.5v-4.5h-5v4.5H4a.5.5 0 01-.5-.5z" />,
    menu: <path d="M4 6h12M4 10h12M4 14h12" />,
  };
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="flex-none" {...svg}>
      {paths[name]}
    </svg>
  );
}

/* ── 작은 조각 ─────────────────────────────────────── */

/** 같은 사람은 늘 같은 색 - 자리표시 팀원(m1…)은 번호로, Supabase 계정(uuid)은 글자 값으로 */
const toneOf = (id: string) =>
  (/^m\d+$/.test(id) ? Number(id.slice(1)) : [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0))
  % AVATAR_TONE.length;

export function Avatar({ id, size = 24 }: { id: string | null; size?: number }) {
  const m = useMember(id);
  if (!m) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-tm-edge text-tm-sub"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="미배정"
      >
        ·
      </span>
    );
  }
  const tone = AVATAR_TONE[toneOf(m.id)];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-[-0.02em] ${tone}`}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.38) }}
      title={`${m.name} · ${m.role}`}
    >
      {m.initial}
    </span>
  );
}

/** 알약 - 영역 표시 등. 색은 className 으로 */
export function Chip({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12.5px] font-bold leading-[1.35] ${className}`}>
      {children}
    </span>
  );
}

export function PriorityDot({ p }: { p: Priority }) {
  return <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${PRIORITY_STYLE[p].dot}`} />;
}

/** 상태 알약 */
export function StatusPill({ s }: { s: Status }) {
  return (
    <span className={`inline-flex h-[30px] min-w-[72px] items-center justify-center whitespace-nowrap rounded-full px-3 text-[13px] font-bold ${STATUS_STYLE[s].pill}`}>
      {statusLabel(s)}
    </span>
  );
}

/** 마감일 - 지났으면 빨강, 사흘 안이면 호박색 */
export function DueBadge({ due, done }: { due: string | null; done: boolean }) {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${due}T00:00:00`);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);

  const text =
    days === 0 ? '오늘' : days === 1 ? '내일' : days < 0 ? `${-days}일 지남` : `${days}일 남음`;
  const tone = done
    ? 'font-semibold text-tm-sub'
    : days < 0
      ? 'font-bold text-tm-red-deep'
      : days <= 3
        ? 'font-bold text-tm-warn'
        : 'font-semibold text-tm-sub';

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[13px] tabular-nums ${tone}`}>
      <IconCalendar />
      {text}
    </span>
  );
}

/* ── 쪽 머리 ─────────────────────────────────────────
   큰 제목 + 설명 한 줄 + 저장 상태 알약, 오른쪽에 버튼들. 좁은 화면에서는 설명을 접는다. */
export function PageHead({
  title,
  lead,
  saved,
  children,
}: {
  title: string;
  lead?: React.ReactNode;
  /** 저장 상태 - ok 는 초록 점, busy 는 회색 점(보내는 중), warn 은 빨간 점 */
  saved?: { tone: 'ok' | 'busy' | 'warn'; text: string };
  /** 오른쪽 버튼들 */
  children?: React.ReactNode;
}) {
  return (
    /* 좁은 화면: 오른쪽 묶음을 풀어(contents) 버튼은 제목 옆에 붙인다. 보기 알약처럼 긴 줄은
       쓰는 쪽에서 order · basis-full 을 주어 다음 줄을 다 쓰게 한다 - 버튼 밑에 깔리지 않는다 */
    <div className="mb-6 flex flex-none flex-wrap items-end justify-between gap-x-7 gap-y-4 max-[720px]:mb-4 max-[720px]:items-center">
      <div className="min-w-0 max-w-[68ch] flex-[1_1_360px] max-[720px]:basis-[150px]">
        <h1 className="text-[28px] font-extrabold leading-[1.25] tracking-[-0.02em] text-tm-deep max-[900px]:text-[24px]">{title}</h1>
        {lead && <p className="mt-2 text-[15.5px] leading-[1.7] text-tm-ink max-[720px]:hidden">{lead}</p>}
        {saved && (
          <p
            className={`mt-3.5 inline-flex items-center gap-2 rounded-full border border-tm-line bg-white px-3 py-[5px] text-[13px] font-semibold text-tm-sub ${
              saved.tone === 'warn' ? 'max-[720px]:mt-2.5' : 'max-[720px]:hidden'}`}
          >
            <i className={`h-2 w-2 rounded-full ${
              saved.tone === 'ok' ? 'bg-tm-ok' : saved.tone === 'busy' ? 'bg-tm-edge' : 'bg-tm-red'}`} aria-hidden />
            {saved.text}
          </p>
        )}
      </div>
      {children && <div className="flex min-w-0 max-w-full flex-none items-center gap-2 max-[720px]:contents">{children}</div>}
    </div>
  );
}

/* ── 창(Modal) ───────────────────────────────────────── */
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
/* 여러 창이 겹쳐 뜰 수 있다(새 문서 창 위의 확인 창) - 맨 위 창만 키보드에 반응한다 */
const stack: string[] = [];
let locks = 0;
let bodyOverflow = '';

export function Modal({
  title,
  sub,
  size = 'md',
  busy = false,
  foot,
  onClose,
  children,
}: {
  title: string;
  /** 제목 아래 한 줄 */
  sub?: string;
  /** sm = 확인 창 · 메뉴 / md = 입력 창 / lg = 넓은 창 */
  size?: 'sm' | 'md' | 'lg';
  /** 처리 중 - 닫기를 막는다 */
  busy?: boolean;
  foot?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const downOnOverlay = useRef(false);
  const live = useRef({ onClose, busy });
  useEffect(() => {
    live.current = { onClose, busy };
  });
  /* 열기 전 자리는 처음 그릴 때 잡는다 - effect 때는 안쪽 autoFocus 가 이미 초점을 가져가 있다 */
  const [opener] = useState(() =>
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );

  useEffect(() => {
    stack.push(id);
    if (locks++ === 0) {
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    if (!box.current?.contains(document.activeElement)) box.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id || e.isComposing) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!live.current.busy) live.current.onClose();
        return;
      }
      if (e.key !== 'Tab' || !box.current) return;
      /* Tab 은 이 창 안에서만 돈다 */
      const stops = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      const cur = document.activeElement;
      if (stops.length === 0) {
        e.preventDefault();
        return;
      }
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (e.shiftKey && (cur === first || cur === box.current || !box.current.contains(cur))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (cur === last || !box.current.contains(cur))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (--locks === 0) document.body.style.overflow = bodyOverflow;
      /* 닫히면 열기 전에 있던 자리로 초점을 돌려준다 */
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [id, opener]);

  /* 좁은 화면에서 입력 창은 화면을 다 쓰고, 확인 창은 양옆을 16px 남긴다 */
  const width =
    size === 'sm'
      ? 'w-[min(460px,100%)] max-[720px]:w-[calc(100%-32px)]'
      : `${size === 'lg' ? 'w-[min(1000px,100%)]' : 'w-[min(640px,100%)]'} max-[720px]:h-[100dvh] max-[720px]:max-h-none max-[720px]:w-full max-[720px]:rounded-none`;

  return (
    <div
      className="fixed inset-0 z-[100] grid animate-tm-fade place-items-center bg-[rgba(15,26,41,0.6)] p-6 max-[720px]:p-0"
      /* 바깥을 눌러 닫기 - 안에서 누른 채 끌다가 바깥에서 뗀 경우(글자 고르기)는 닫지 않는다 */
      onMouseDown={(e) => {
        downOnOverlay.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && downOnOverlay.current && !busy) onClose();
      }}
    >
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        className={`flex max-h-[calc(100dvh-48px)] animate-tm-pop flex-col overflow-hidden rounded-tm-lg bg-white text-[15.5px] leading-[1.6] text-tm-ink shadow-tm-pop ${width}`}
      >
        <div className="flex flex-none items-center justify-between gap-4 border-b border-tm-line py-[18px] pl-[26px] pr-5 max-[720px]:py-3.5 max-[720px]:pl-4 max-[720px]:pr-3">
          <div className="min-w-0">
            <h2 className="text-[20px] font-extrabold tracking-[-0.01em] text-tm-deep" id={`${id}-title`}>{title}</h2>
            {sub && <p className="mt-0.5 text-[14px] text-tm-sub">{sub}</p>}
          </div>
          <button type="button" className={tmIconBtn} aria-label="닫기" disabled={busy} onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-[26px] max-[720px]:px-4 max-[720px]:py-[18px]">{children}</div>
        {foot && (
          <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-tm-line bg-tm-bg px-[26px] py-4 max-[720px]:px-4 max-[720px]:py-3">
            {foot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 확인 창 ─────────────────────────────────────────
   브라우저 기본 확인 창(window.confirm) 대신 화면 안의 창을 쓴다 - 문구와 버튼 이름을
   상황에 맞게 적을 수 있고, 어느 브라우저에서나 같은 모양으로 보인다. */
export type ConfirmOptions = {
  title: string;
  body?: React.ReactNode;
  /** 진행 버튼 이름 - "삭제"처럼 하는 일을 그대로 적는다 */
  ok: string;
  cancel?: string;
  tone?: 'danger' | 'primary';
};
export type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

export function useConfirm(): [Confirm, React.ReactNode] {
  const [ask, setAsk] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback<Confirm>((opts) => new Promise<boolean>((resolve) => setAsk({ ...opts, resolve })), []);
  const answer = (v: boolean) => {
    ask?.resolve(v);
    setAsk(null);
  };
  const node = ask ? (
    <Modal
      title={ask.title}
      size="sm"
      onClose={() => answer(false)}
      foot={
        <>
          <span className="flex-1" />
          {/* 되돌릴 수 없는 일은 "취소"에 먼저 초점을 둔다 */}
          <button type="button" className={tmBtn} autoFocus={ask.tone === 'danger'} onClick={() => answer(false)}>
            {ask.cancel ?? '취소'}
          </button>
          <button
            type="button"
            className={ask.tone === 'danger' ? tmBtnDanger : tmBtnPrimary}
            autoFocus={ask.tone !== 'danger'}
            onClick={() => answer(true)}
          >
            {ask.ok}
          </button>
        </>
      }
    >
      {ask.body && <div className="text-[15.5px] leading-[1.75] text-tm-ink [&_b]:font-bold [&_b]:text-tm-deep">{ask.body}</div>}
    </Modal>
  ) : null;
  return [confirm, node];
}

/* ── 알림(화면 아래 가운데) ──────────────────────────── */
export function Toast({
  text,
  tone = 'ok',
  action,
  onClose,
}: {
  text: string | null;
  /** err 는 실패를 알리는 빨간 알림 */
  tone?: 'ok' | 'err';
  /** 알림 안의 버튼 - 실행 취소 같은 것 */
  action?: { label: string; kbd?: string; onClick(): void };
  onClose(): void;
}) {
  return (
    /* 읽어 주는 영역은 늘 있어야 새 알림이 낭독된다 */
    <div
      className="pointer-events-none fixed inset-x-0 bottom-7 z-[200] flex justify-center px-4 max-[900px]:bottom-[calc(84px+env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      {text && (
        <div className={`pointer-events-auto flex max-w-[min(640px,100%)] animate-tm-rise items-center gap-3.5 rounded-tm py-[11px] pl-5 pr-3 text-[15px] font-semibold leading-[1.5] text-white shadow-tm-toast ${
          tone === 'err' ? 'bg-tm-red-deep' : 'bg-tm-deep'}`}>
          {/* 실패 알림은 문장이 길어 줄을 넘기고, 보통 알림은 한 줄로 자른다 */}
          <span className={`min-w-0 ${tone === 'err' ? '' : 'truncate'}`}>{text}</span>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex min-h-[30px] flex-none items-center gap-1.5 whitespace-nowrap font-bold text-white underline underline-offset-[3px] focus-visible:outline-white [@media(pointer:coarse)]:min-h-10"
            >
              {action.label}
              {action.kbd && (
                <kbd className="inline-block rounded border border-white/30 px-1 text-[11px] font-semibold leading-[16px] text-white/70">
                  {action.kbd}
                </kbd>
              )}
            </button>
          )}
          <button
            type="button"
            aria-label="알림 닫기"
            onClick={onClose}
            className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/[0.18] text-white transition-colors hover:bg-white/[0.32] focus-visible:outline-white [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10"
          >
            <IconClose size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 보드 카드 ────────────────────────────────────── */

/**
 * 카드에서 바로 상태를 바꾸는 메뉴.
 *
 * HTML5 드래그는 터치 기기에서 아예 동작하지 않는다. 메뉴가 없으면
 * 휴대폰으로는 보드가 읽기 전용이 되므로, 드래그와 같은 일을 하는
 * 손가락용 경로를 따로 둔다.
 *
 * 메뉴는 body 에 띄워 버튼 자리에 맞춘다(아래가 모자라면 위로). 카드 안에 두면 아래 카드에
 * 덮이고 칸의 스크롤에 잘려, 아래쪽 항목을 누를 수 없었다.
 */
function StatusMenu({ task, onMove }: { task: Task; onMove(s: Status, keyboard: boolean): void }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  /** 키보드로 열었는가 - 그러면 첫 항목에 초점을 둔다 */
  const byKey = useRef(false);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const inside = (t: EventTarget | null) =>
      t instanceof Node && (!!btn.current?.contains(t) || !!menu.current?.contains(t));
    const onDown = (e: MouseEvent) => { if (!inside(e.target)) close(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    // 칸이나 화면이 움직이면 메뉴가 버튼에서 떨어지므로 닫는다
    const onShift = (e: Event) => { if (!inside(e.target)) close(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onShift, true);
    window.addEventListener('resize', onShift);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onShift, true);
      window.removeEventListener('resize', onShift);
    };
  }, [open, close]);

  /* 그려진 직후(칠하기 전)에 자리를 잡는다 */
  const place = useCallback((m: HTMLDivElement | null) => {
    menu.current = m;
    const b = btn.current?.getBoundingClientRect();
    if (!m || !b) return;
    const gap = 4;
    const edge = 8;
    const h = m.offsetHeight;
    const w = m.offsetWidth;
    const below = b.bottom + gap;
    const top = below + h <= window.innerHeight - edge || b.top - gap - h < edge
      ? Math.max(edge, Math.min(below, window.innerHeight - edge - h))
      : b.top - gap - h;
    m.style.top = `${top}px`;
    m.style.left = `${Math.max(edge, Math.min(b.right - w, window.innerWidth - edge - w))}px`;
    if (byKey.current) m.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
  }, []);

  /* ↑/↓ 로 항목을 오가고, Tab 은 메뉴를 닫고 버튼으로 돌아간다 */
  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')];
    const n = items.length;
    if (n === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    const down = e.key === 'ArrowDown';
    items[i < 0 ? (down ? 0 : n - 1) : (i + (down ? 1 : n - 1)) % n].focus();
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btn}
        type="button"
        onClick={(e) => {
          // detail 0 = Enter · Space 로 누른 것
          byKey.current = e.detail === 0;
          setOpen(!open);
        }}
        aria-label="상태 바꾸기"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`grid h-7 w-7 place-items-center rounded-lg text-tm-sub transition-colors duration-150 hover:bg-tm-tint hover:text-tm-ink
                    [@media(pointer:coarse)]:-m-2 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11
                    ${open ? 'bg-tm-tint text-tm-ink' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 max-[900px]:opacity-100 [@media(hover:none)]:opacity-100'}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="3.5" r="1.4" fill="currentColor" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="8" cy="12.5" r="1.4" fill="currentColor" />
        </svg>
      </button>

      {open && createPortal(
        <div ref={place} role="menu" aria-label="상태 바꾸기" onKeyDown={onMenuKey}
          className="fixed left-0 top-0 z-50 w-[156px] animate-tm-fade overflow-hidden rounded-tm border border-tm-line bg-white py-1.5 shadow-tm-up">
          <p className="px-3 pb-1 pt-0.5 text-[12px] font-bold text-tm-sub">상태 바꾸기</p>
          {STATUSES.map((st) => {
            const cur = st.id === task.status;
            return (
              <button
                key={st.id}
                type="button"
                role="menuitem"
                onClick={(e) => { close(false); onMove(st.id, e.detail === 0); }}
                disabled={cur}
                className={`flex min-h-[38px] w-full items-center gap-2.5 px-3 text-left text-[14px] transition-colors [@media(pointer:coarse)]:min-h-11 ${
                  cur ? 'cursor-default font-bold text-tm-deep' : 'font-semibold text-tm-ink hover:bg-tm-tint'}`}
              >
                <span className={`h-2 w-2 flex-none rounded-full ${STATUS_STYLE[st.id].dot}`} />
                {st.label}
                {cur && <span className="ml-auto text-tm-blue"><IconCheck /></span>}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

interface CardProps {
  task: Task;
  onOpen(): void;
  onDragStart(e: React.DragEvent): void;
  onDragEnd(): void;
  dragging: boolean;
  /** 카드 메뉴와 ←/→ 키로 상태를 옮긴다. keyboard = 키보드로 옮겼다(옮긴 카드에 초점을 다시 둘 때) */
  onMove(s: Status, keyboard: boolean): void;
  /** 내 작업이면 왼쪽에 파란 표시선을 둔다 */
  mine?: boolean;
}

export function TaskCard({ task, onOpen, onDragStart, onDragEnd, dragging, onMove, mine }: CardProps) {
  const done = task.status === 'done';
  const idx = STATUSES.findIndex((s) => s.id === task.status);
  return (
    <article
      data-task={task.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        // 안쪽 상태 메뉴의 버튼 · 항목에서 올라온 키는 그쪽 몫이다(Enter 로 패널이 열리거나 ←/→ 로 카드가 옮겨지지 않게)
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
        // 드래그 없이도 칼럼을 옮길 수 있어야 한다. 누르고 있어 되풀이되는 키로는 옮기지 않는다
        // (옮긴 카드가 걸러져 사라지면 초점이 옆 카드로 가서 칸의 카드가 줄줄이 옮겨진다)
        if (e.key === 'ArrowRight' && idx < STATUSES.length - 1) {
          e.preventDefault();
          if (!e.repeat) onMove(STATUSES[idx + 1].id, true);
        }
        if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          if (!e.repeat) onMove(STATUSES[idx - 1].id, true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${task.key} ${task.title}`}
      className={`group relative cursor-pointer rounded-tm-btn border border-tm-line bg-white px-3.5 pb-3.5 pt-3 shadow-tm
                  transition-[border-color,box-shadow,transform] duration-200
                  hover:-translate-y-0.5 hover:border-tm-blue hover:shadow-[0_8px_20px_rgba(22,39,60,0.12)]
                  [@media(hover:none)]:hover:translate-y-0 [@media(hover:none)]:hover:shadow-tm
                  ${mine ? 'before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-tm-blue' : ''}
                  ${dragging ? 'opacity-40' : 'active:cursor-grabbing'}`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <PriorityDot p={task.priority} />
        <span className="whitespace-nowrap text-[13px] font-bold tabular-nums text-tm-sub">{task.key}</span>
        <span className="ml-auto" />
        <StatusMenu task={task} onMove={onMove} />
      </div>

      <p
        className={`mb-3 text-[15.5px] font-bold leading-[1.45] [overflow-wrap:anywhere] ${
          done ? 'text-tm-sub line-through' : 'text-tm-ink'
        }`}
      >
        {task.title}
      </p>

      {/* 영역 알약을 맨 앞에 두고 라벨을 잇는다 - 좁은 칸에서도 번호 줄이 넘치지 않는다 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Chip className={DOMAIN_STYLE[task.domain]}>{domainShort(task.domain)}</Chip>
        {task.labels.map((l) => (
          <span key={l} className="rounded-full bg-tm-bg px-2.5 py-[3px] text-[12.5px] font-semibold leading-[1.35] text-tm-sub">
            {l}
          </span>
        ))}
      </div>

      <div className="flex min-h-[26px] items-center justify-between gap-2">
        <DueBadge due={task.due} done={done} />
        <span className="ml-auto"><Avatar id={task.assignee} size={26} /></span>
      </div>
    </article>
  );
}
