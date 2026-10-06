'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Task, Status } from './types';

/**
 * 작업 저장소.
 *
 * 이 사이트는 `output: 'export'` 정적 배포라 서버도 DB도 없다.
 * 따라서 데이터는 브라우저의 localStorage 에 남고 **기기 밖으로 나가지 않는다.**
 * 같은 탭을 여러 개 열어 두면 storage 이벤트로 서로 동기화된다.
 *
 * 여러 사람이 같은 보드를 보려면 원격 저장소가 필요하다 —
 * 아래 read/write 두 지점만 교체하면 되도록 입출력을 한곳에 모아 두었다.
 */

const KEY = 'mate.taskmanager.v1';

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** 처음 열었을 때 빈 화면이 아니라 쓰는 법이 보이도록 하는 초기 데이터 */
function seed(): Task[] {
  const now = new Date().toISOString();
  const base = [
    { t: '논디 — 첨삭 응답 지연 개선', d: 'RAG 검색 단계에서 평균 4초. 임베딩 캐시를 붙여 2초 아래로 내린다.', s: 'doing', p: 'high', dom: 'web', a: 'm4', from: -4, due: 3, l: ['성능'] },
    { t: '큐어팜 — 예약 취소 플로우', d: '취소 정책과 환불 조건을 화면에 노출하고 확인 단계를 한 번 더 둔다.', s: 'todo', p: 'normal', dom: 'web', a: 'm4', from: 1, due: 7, l: ['기능'] },
    { t: 'Chatudy — 발송 실패 재시도', d: 'LINE API 5xx 응답 시 지수 백오프로 3회까지 재시도.', s: 'review', p: 'normal', dom: 'web', a: 'm2', from: -2, due: 1, l: ['안정성'] },
    { t: '꼬꼬지생 — 스테이지 7 밸런싱', d: '테스터 피드백상 난이도가 급격히 뛴다. 적 배치와 체력 수치를 조정한다.', s: 'doing', p: 'normal', dom: 'game', a: 'm1', from: -1, due: 5, l: ['밸런싱'] },
    { t: 'VR 키오스크 — Quest 3 대응', d: '컨트롤러 입력 매핑 변경분 반영하고 실기기 테스트.', s: 'todo', p: 'high', dom: 'game', a: 'm3', from: 0, due: 4, l: ['XR'] },
    { t: '영창하세요 마법사님 — 빌드 용량 축소', d: '텍스처 아틀라스 재구성. 현재 1.8GB에서 1.2GB 목표.', s: 'backlog', p: 'low', dom: 'game', a: 'm1', from: null, due: null, l: ['최적화'] },
    { t: '21세기 표류기 — 튜토리얼 재작성', d: '첫 3분 이탈률이 높다. 손 조작 안내를 단계별로 쪼갠다.', s: 'todo', p: 'high', dom: 'game', a: 'm3', from: 2, due: 6, l: ['UX'] },
    { t: '미래산업과학고 — 2학기 커리큘럼 확정', d: '10~12주차 개인 프로젝트 주제 목록과 평가 기준을 정리한다.', s: 'doing', p: 'urgent', dom: 'edu', a: 'm7', from: -6, due: 2, l: ['커리큘럼'] },
    { t: 'AI 활용 과정 — 실습 환경 사전 세팅', d: '수강생 노트북에서 바로 돌아가도록 설치 스크립트와 체크리스트를 만든다.', s: 'todo', p: 'normal', dom: 'edu', a: 'm2', from: 4, due: 9, l: ['교육운영'] },
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
    // start 는 뒤에 추가된 필드다 — 옛 저장본을 열어도 깨지지 않게 메운다
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

export interface Store {
  tasks: Task[];
  ready: boolean;
  /** 저장이 막힌 환경인지 — 배너로 알려 준다 */
  persistent: boolean;
  create(input: Partial<Task> & { title: string }): Task;
  update(id: string, patch: Partial<Task>): void;
  remove(id: string): void;
  /** 드래그로 상태·순서를 함께 바꾼다 */
  move(id: string, status: Status, beforeId: string | null): void;
  reset(): void;
  /** 되돌릴 수 있는 마지막 동작의 설명 — 없으면 null */
  undoLabel: string | null;
  undo(): void;
}

export function useTaskStore(): Store {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const seq = useRef(0);

  /* 되돌리기 — 지우거나 옮기는 동작 직전의 전체 상태를 쌓아 둔다.
     양이 적은 데이터라 스냅샷이 가장 단순하고 틀릴 여지가 없다. */
  const [history, setHistory] = useState<{ label: string; tasks: Task[] }[]>([]);
  const pushHistory = useCallback((label: string, snapshot: Task[]) => {
    setHistory((prev) => [...prev.slice(-19), { label, tasks: snapshot }]);
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

  const update = useCallback<Store['update']>((id, patch) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
      );
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback<Store['remove']>((id) => {
    setTasks((prev) => {
      const gone = prev.find((t) => t.id === id);
      pushHistory(`'${gone?.title ?? '작업'}' 삭제`, prev);
      const next = prev.filter((t) => t.id !== id);
      write(next);
      return next;
    });
  }, [pushHistory]);

  const move = useCallback<Store['move']>((id, status, beforeId) => {
    setTasks((prev) => {
      const moving = prev.find((t) => t.id === id);
      if (!moving) return prev;
      if (moving.status !== status) {
        pushHistory(`'${moving.title}' 상태 변경`, prev);
      }

      // 목적지 칼럼을 현재 순서대로 세운 뒤, 놓을 자리에 끼워 넣고 다시 번호를 매긴다
      const column = prev
        .filter((t) => t.status === status && t.id !== id)
        .sort((a, b) => a.order - b.order);
      const at = beforeId ? column.findIndex((t) => t.id === beforeId) : column.length;
      const idx = at < 0 ? column.length : at;
      column.splice(idx, 0, { ...moving, status });

      const reordered = new Map(column.map((t, i) => [t.id, (i + 1) * 1000]));
      const next = prev.map((t) => {
        if (t.id === id) {
          return { ...t, status, order: reordered.get(id) ?? 0, updatedAt: new Date().toISOString() };
        }
        const o = reordered.get(t.id);
        return o === undefined ? t : { ...t, order: o };
      });
      write(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setTasks(last.tasks);
      write(last.tasks);
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = seed();
    commit(fresh);
  }, [commit]);

  return {
    tasks, ready, persistent, create, update, remove, move, reset,
    undoLabel: history.length ? history[history.length - 1].label : null,
    undo,
  };
}
