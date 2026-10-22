'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { localISO, type Task, type Status } from './types';

/**
 * 작업 저장소 - 브라우저 저장 모드.
 *
 * Supabase 키 없이 빌드했을 때 쓴다(로컬 개발 · 미리보기). 데이터는 브라우저의
 * localStorage 에 남고 **기기 밖으로 나가지 않는다.** 같은 탭을 여러 개 열어 두면
 * storage 이벤트로 서로 동기화된다.
 *
 * 팀이 함께 쓰는 저장소는 remote.ts(Supabase) 이고, 둘은 아래 Store 모양을 함께 쓴다.
 */

const KEY = 'mate.taskmanager.v1';
/** Supabase 로 옮길 때 예전 데이터를 찾는 자리 */
export const LOCAL_TASKS_KEY = KEY;
/** 브라우저 저장 모드에서 '나'로 고른 사람 */
export const LOCAL_ME_KEY = 'mate.taskmanager.me';

/** 서버에 보내는 중인지 - Supabase 모드에서만 바뀐다 */
export type SyncState = 'idle' | 'saving' | 'error';
export interface StoreOptions {
  /** 저장 · 불러오기에 실패했을 때 화면에 알릴 문구 */
  onError?(text: string): void;
}

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // 이 기기의 날짜로 - toISOString 은 UTC 라 한국에서 아침 9시 전에는 하루 앞 날짜가 된다
  return localISO(d);
}

/**
 * 예시로 넣어 둔 뒤 아무도 손대지 않은 작업.
 *
 * 초기 데이터는 실제 프로젝트 이름에 지어낸 내용(응답 4초, 빌드 1.8GB 등)을 붙인
 * 것이라, 표시 없이 두면 팀원이 누군가 올린 실제 작업으로 읽는다.
 * 초기 데이터의 id 는 t1, t2… 이고 사람이 만든 것은 t<시각>-<번호> 라 겹치지 않는다.
 * 한 번이라도 고치거나 옮기면 updatedAt 이 바뀌므로, 그런 것은 예시로 세지 않는다 -
 * 사람이 손댄 것을 일괄 삭제에 휩쓸리게 두지 않기 위해서다.
 */
export const isUntouchedSample = (t: Task) => /^t\d+$/.test(t.id) && t.createdAt === t.updatedAt;

/** 처음 열었을 때 빈 화면이 아니라 쓰는 법이 보이도록 하는 초기 데이터 */
function seed(): Task[] {
  const now = new Date().toISOString();
  const base = [
    { t: '논디: 첨삭 응답 지연 개선', d: 'RAG 검색 단계에서 평균 4초. 임베딩 캐시를 붙여 2초 아래로 내린다.', s: 'doing', p: 'high', dom: 'web', a: 'm4', from: -4, due: 3, l: ['성능'] },
    { t: '큐어팜: 예약 취소 플로우', d: '취소 정책과 환불 조건을 화면에 노출하고 확인 단계를 한 번 더 둔다.', s: 'todo', p: 'normal', dom: 'web', a: 'm4', from: 1, due: 7, l: ['기능'] },
    { t: 'Chatudy: 발송 실패 재시도', d: 'LINE API 5xx 응답 시 지수 백오프로 3회까지 재시도.', s: 'review', p: 'normal', dom: 'web', a: 'm2', from: -2, due: 1, l: ['안정성'] },
    { t: '꼬꼬지생: 스테이지 7 밸런싱', d: '테스터 피드백상 난이도가 급격히 뛴다. 적 배치와 체력 수치를 조정한다.', s: 'doing', p: 'normal', dom: 'game', a: 'm1', from: -1, due: 5, l: ['밸런싱'] },
    { t: 'VR 키오스크: Quest 3 대응', d: '컨트롤러 입력 매핑 변경분 반영하고 실기기 테스트.', s: 'todo', p: 'high', dom: 'game', a: 'm3', from: 0, due: 4, l: ['XR'] },
    { t: '영창하세요 마법사님: 빌드 용량 축소', d: '텍스처 아틀라스 재구성. 현재 1.8GB에서 1.2GB 목표.', s: 'backlog', p: 'low', dom: 'game', a: 'm1', from: null, due: null, l: ['최적화'] },
    { t: '21세기 표류기: 튜토리얼 재작성', d: '첫 3분 이탈률이 높다. 손 조작 안내를 단계별로 쪼갠다.', s: 'todo', p: 'high', dom: 'game', a: 'm3', from: 2, due: 6, l: ['UX'] },
    { t: '미래산업과학고: 2학기 커리큘럼 확정', d: '개인 프로젝트 주제 목록과 평가 기준을 정리한다.', s: 'doing', p: 'urgent', dom: 'edu', a: 'm7', from: -6, due: 2, l: ['커리큘럼'] },
    { t: 'AI 활용 과정: 실습 환경 사전 세팅', d: '수강생 노트북에서 바로 돌아가도록 설치 스크립트와 체크리스트를 만든다.', s: 'todo', p: 'normal', dom: 'edu', a: 'm2', from: 4, due: 9, l: ['교육운영'] },
    { t: '대학 특강 제안서 초안', d: '시수·정원·산출물 항목을 기관 양식에 맞춰 채운다.', s: 'review', p: 'high', dom: 'edu', a: 'm7', from: -3, due: 1, l: ['제안'] },
    { t: '포트폴리오 화면 캡처 확보', d: '논디·Chatudy·큐어팜·피오크래프트 4건. 발주처 공개 가능 범위부터 확인.', s: 'todo', p: 'urgent', dom: 'ops', a: 'm5', from: 0, due: 2, l: ['웹사이트'] },
    { t: '사업자 정보 푸터 반영', d: '사업자등록번호·주소·대표자. 발주처 견적 등록에 필요하다.', s: 'todo', p: 'high', dom: 'ops', a: 'm7', from: 1, due: 3, l: ['웹사이트'] },
    { t: '문의 폼 백엔드 연결', d: 'Apps Script 엔드포인트 설정하고 전송 성공 판정 로직을 함께 손본다.', s: 'backlog', p: 'normal', dom: 'ops', a: 'm2', from: null, due: null, l: ['웹사이트'] },
    { t: '도메인 메일 전환', d: '개인 계정 대신 contact@devteammate.co.kr 로 통일.', s: 'backlog', p: 'low', dom: 'ops', a: 'm7', from: null, due: null, l: ['운영'] },
    { t: '3도메인 개편 사이트 배포', d: '웹·앱 / 게임·XR / 교육 분리 구조와 디자인 시스템 적용분.', s: 'done', p: 'high', dom: 'ops', a: 'm5', from: -9, due: -2, l: ['웹사이트'] },
    { t: '이미지 WebP 전환', d: '프로젝트 썸네일 8장. 8.1MB에서 589KB로.', s: 'done', p: 'normal', dom: 'ops', a: 'm4', from: -6, due: -4, l: ['성능'] },
  ] as const;

  const perStatus: Record<string, number> = {};
  return base.map((b, i) => {
    perStatus[b.s] = (perStatus[b.s] ?? 0) + 1;
    return {
      id: `t${i + 1}`,
      key: `MATE-${100 + i}`,
      title: b.t,
      description: b.d,
      status: b.s as Task['status'],
      priority: b.p as Task['priority'],
      domain: b.dom as Task['domain'],
      assignee: b.a,
      start: b.from === null || b.from === undefined ? null : todayISO(b.from),
      due: b.due === null ? null : todayISO(b.due),
      labels: [...b.l],
      order: perStatus[b.s] * 1000,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function read(): Task[] | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // start 는 뒤에 추가된 필드다 - 옛 저장본을 열어도 깨지지 않게 메운다
    return (parsed as Task[]).map((t) => ({ ...t, start: t.start ?? null }));
  } catch {
    // 시크릿 모드·사이트 데이터 차단 환경에서는 읽기가 던질 수 있다
    return null;
  }
}

function write(tasks: Task[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

/** 지운 작업을 원래 자리에 다시 끼운다 - 이미 있는 것은 건너뛰고, 하나도 끼우지 못하면 null */
function restore(cur: Task[], gone: { task: Task; at: number }[]): Task[] | null {
  const next = [...cur];
  let n = 0;
  gone.forEach(({ task, at }) => {
    if (next.some((t) => t.id === task.id)) return;
    next.splice(Math.min(at, next.length), 0, task);
    n += 1;
  });
  return n ? next : null;
}

export interface Store {
  tasks: Task[];
  ready: boolean;
  /** 저장이 막힌 환경인지 - 배너로 알려 준다 */
  persistent: boolean;
  create(input: Partial<Task> & { title: string }): Task;
  /** undoLabel 을 주면 되돌릴 수 있는 동작으로 남긴다(캘린더에서 마감일을 옮길 때) */
  update(id: string, patch: Partial<Task>, undoLabel?: string): void;
  remove(id: string): void;
  /** 드래그로 상태·순서를 함께 바꾼다 */
  move(id: string, status: Status, beforeId: string | null): void;
  reset(): void;
  /** 손대지 않은 예시 작업을 모두 지운다 (되돌릴 수 있다) */
  clearSamples(): void;
  /** 되돌릴 수 있는 마지막 동작의 설명 - 없으면 null */
  undoLabel: string | null;
  /** 되돌릴 동작을 기록할 때마다 1씩 커진다 - 같은 이름의 동작도 구별한다 */
  undoSeq: number;
  /** 마지막 한 동작만 되돌린다. 그사이 그 작업이 바뀌었거나 없으면 손대지 않고 false */
  undo(): boolean;
  /** 기다리는 되돌리기를 잊는다(알림이 닫힐 때) */
  dropUndo(): void;
  /** Supabase 모드 - 보내는 중 · 실패 */
  sync?: SyncState;
  /** Supabase 모드 - 처음 목록을 읽지 못했을 때의 문구. 한 번 읽은 뒤에는 생기지 않는다 */
  loadError?: string | null;
  /** Supabase 모드 - 다른 곳에서 지워 화면에서 뺀 줄 → 보내지 못한 고침이 있었는가 */
  deletedElsewhere?: ReadonlyMap<string, boolean>;
  /** Supabase 모드 - 기다리는 저장을 모두 보낸다(로그아웃 전에) */
  flush?(): Promise<void>;
  /** Supabase 모드 - 서버 목록을 다시 읽는다(가져오기 뒤처럼 실시간을 기다리지 않을 때) */
  reload?(): Promise<void>;
}

/** _opts 는 Supabase 저장소와 같은 모양으로 부르기 위한 자리 - 브라우저 모드에서는 실패할 일이 없다 */
export function useTaskStore(_opts?: StoreOptions): Store {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const seq = useRef(0);

  /* 되돌리기 - 마지막 한 동작(지우기 · 상태 옮기기 · 마감일 옮기기 · 예시 지우기)만, 그 작업만 거꾸로 되돌린다.
     목록 전체를 통째로 되돌리면 그 뒤에 만들거나 고친 것, 다른 탭에서 바꾼 것까지 사라진다.
     revert 는 지금 목록을 받아 되돌린 목록을 주고, 그사이 바뀌어 되돌릴 수 없으면 null 을 준다. */
  const live = useRef(tasks);
  live.current = tasks;
  const last = useRef<((cur: Task[]) => Task[] | null) | null>(null);
  const [undoState, setUndoState] = useState<{ label: string | null; seq: number }>({ label: null, seq: 0 });
  const push = useCallback((label: string, revert: (cur: Task[]) => Task[] | null) => {
    last.current = revert;
    setUndoState((s) => ({ label, seq: s.seq + 1 }));
  }, []);
  const dropUndo = useCallback(() => {
    last.current = null;
    setUndoState((s) => (s.label === null ? s : { ...s, label: null }));
  }, []);

  useEffect(() => {
    const loaded = read() ?? seed();
    setTasks(loaded);
    seq.current = loaded.reduce((max, t) => {
      const n = Number(t.key.split('-')[1]);
      return Number.isFinite(n) && n > max ? n : max;
    }, 100);
    setReady(true);

    try {
      const probe = '__tm_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
    } catch {
      setPersistent(false);
    }

    // 같은 보드를 다른 탭에서 열어 두었을 때 서로 따라가게 한다
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        setTasks(JSON.parse(e.newValue));
      } catch {
        /* 깨진 값은 무시 */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = useCallback((next: Task[]) => {
    setTasks(next);
    write(next);
  }, []);

  const create = useCallback<Store['create']>(
    (input) => {
      seq.current += 1;
      const now = new Date().toISOString();
      const task: Task = {
        id: `t${now}-${seq.current}`,
        key: `MATE-${seq.current}`,
        title: input.title,
        description: input.description ?? '',
        status: input.status ?? 'todo',
        priority: input.priority ?? 'normal',
        domain: input.domain ?? 'ops',
        assignee: input.assignee ?? null,
        start: input.start ?? null,
        due: input.due ?? null,
        labels: input.labels ?? [],
        order: 0, // 새 작업은 해당 칼럼 맨 위로
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => {
        const next = [task, ...prev];
        write(next);
        return next;
      });
      return task;
    },
    [],
  );

  const update = useCallback<Store['update']>((id, patch, undoLabel) => {
    const now = new Date().toISOString();
    const was = undoLabel ? live.current.find((t) => t.id === id) : undefined;
    if (undoLabel && was) {
      const keys = Object.keys(patch) as (keyof Task)[];
      const back = Object.fromEntries(keys.map((k) => [k, was[k]])) as Partial<Task>;
      push(undoLabel, (cur) => {
        const t = cur.find((x) => x.id === id);
        // 그사이 다른 탭에서 그 칸을 또 바꿨거나 지웠으면 되돌리지 않는다
        if (!t || keys.some((k) => t[k] !== patch[k])) return null;
        // 바꾼 뒤 고친 것이 없으면 수정 시각도 되돌린다 - 손대지 않은 예시는 예시로 남는다
        const updatedAt = t.updatedAt === now ? was.updatedAt : t.updatedAt;
        return cur.map((x) => (x.id === id ? { ...x, ...back, updatedAt } : x));
      });
    }
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: now } : t,
      );
      write(next);
      return next;
    });
  }, [push]);

  const remove = useCallback<Store['remove']>((id) => {
    const at = live.current.findIndex((t) => t.id === id);
    if (at >= 0) {
      const gone = live.current[at];
      // 원래 값 · 순서 그대로 다시 끼운다. 그사이 같은 작업이 다시 생겼으면 두 번 넣지 않는다
      push(`'${gone.title || '작업'}' 삭제`, (cur) => restore(cur, [{ task: gone, at }]));
    }
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      write(next);
      return next;
    });
  }, [push]);

  const move = useCallback<Store['move']>((id, status, beforeId) => {
    // 제 카드 위에 놓은 것은 제자리다
    if (beforeId === id) return;
    const now = new Date().toISOString();
    const was = live.current.find((t) => t.id === id);
    if (was && was.status !== status) {
      const back = { status: was.status, order: was.order };
      push(`'${was.title || '작업'}' 상태 변경`, (cur) => {
        const t = cur.find((x) => x.id === id);
        // 그사이 다른 탭에서 다시 옮겼거나 지웠으면 되돌리지 않는다
        if (!t || t.status !== status) return null;
        // 옮긴 뒤 고친 것이 없으면 수정 시각도 되돌린다 - 손대지 않은 예시는 예시로 남는다
        const updatedAt = t.updatedAt === now ? was.updatedAt : t.updatedAt;
        return cur.map((x) => (x.id === id ? { ...x, ...back, updatedAt } : x));
      });
    }

    setTasks((prev) => {
      const moving = prev.find((t) => t.id === id);
      if (!moving) return prev;

      // 목적지 칼럼을 현재 순서대로 세운 뒤, 놓을 자리에 끼워 넣고 다시 번호를 매긴다
      const column = prev
        .filter((t) => t.status === status && t.id !== id)
        .sort((a, b) => a.order - b.order);
      const at = beforeId ? column.findIndex((t) => t.id === beforeId) : column.length;
      const idx = at < 0 ? column.length : at;
      column.splice(idx, 0, { ...moving, status });

      // 같은 칸의 같은 자리면 아무것도 바꾸지 않는다(수정 시각도 그대로)
      if (moving.status === status) {
        const before = prev.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
        if (before.every((t, i) => t.id === column[i]?.id)) return prev;
      }

      const reordered = new Map(column.map((t, i) => [t.id, (i + 1) * 1000]));
      const next = prev.map((t) => {
        if (t.id === id) {
          return { ...t, status, order: reordered.get(id) ?? 0, updatedAt: now };
        }
        const o = reordered.get(t.id);
        return o === undefined ? t : { ...t, order: o };
      });
      write(next);
      return next;
    });
  }, [push]);

  const undo = useCallback(() => {
    const revert = last.current;
    dropUndo();
    if (!revert || !revert(live.current)) return false;
    setTasks((prev) => {
      const next = revert(prev);
      if (!next) return prev;
      write(next);
      return next;
    });
    return true;
  }, [dropUndo]);

  const reset = useCallback(() => {
    const fresh = seed();
    commit(fresh);
  }, [commit]);

  const clearSamples = useCallback(() => {
    const gone = live.current.flatMap((task, at) => (isUntouchedSample(task) ? [{ task, at }] : []));
    if (gone.length === 0) return;
    push(`예시 작업 ${gone.length}건 삭제`, (cur) => restore(cur, gone));
    setTasks((prev) => {
      const next = prev.filter((t) => !isUntouchedSample(t));
      write(next);
      return next;
    });
  }, [push]);

  return {
    tasks, ready, persistent, create, update, remove, move, reset, clearSamples,
    undoLabel: undoState.label, undoSeq: undoState.seq, undo, dropUndo,
  };
}
