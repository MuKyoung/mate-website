'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Doc } from './types';

/**
 * 문서 저장소.
 * 작업과 같은 제약을 따른다 - 정적 배포라 브라우저 localStorage 에만 남는다.
 * 원격으로 옮길 때는 read/write 두 함수만 교체하면 된다.
 */

const KEY = 'mate.taskmanager.docs.v1';

const NL = '\n';
const lines = (...xs: string[]) => xs.join(NL);

function seed(): Doc[] {
  const now = new Date().toISOString();
  const mk = (
    id: string, title: string, parentId: string | null, order: number,
    author: string, labels: string[], body: string,
  ): Doc => ({ id, title, parentId, order, author, labels, body, createdAt: now, updatedAt: now });

  return [
    mk('d1', '팀 위키', null, 1, 'm7', ['안내'], lines(
      'MATE가 일하면서 쌓이는 것들을 여기에 둡니다. 작업은 보드에, 결정과 기록은 문서에 남깁니다.',
      '',
      '## 어디에 무엇을 적나',
      '',
      '| 성격 | 어디에 |',
      '| --- | --- |',
      '| 이번 주기에 끝낼 일 | 작업 보드 |',
      '| 왜 그렇게 정했는지 | 기술 결정 기록 |',
      '| 무엇을 만들기로 했는지 | 요구사항 정의서 |',
      '| 누가 무엇을 하기로 했는지 | 회의록 |',
      '',
      '> 보드 카드의 설명란은 "무엇을 해야 하는지"까지만 적습니다.',
      '> 배경과 판단 근거가 길어지면 문서로 빼고 카드에서 링크합니다.',
      '',
      '## 작업을 가리킬 때',
      '',
      '본문에 작업 번호를 그대로 적으면 그 작업으로 가는 링크가 됩니다. 예: MATE-110.',
      '회의록의 할 일이나 결정 문서의 후속 작업을 이렇게 걸어 두면 보드와 문서가 서로 끊기지 않습니다.',
      '',
      '## 문서를 쓸 때',
      '',
      '- 제목은 검색해서 찾을 말로 짓습니다. "회의록"보다 "10월 2주 교육 일정 회의".',
      '- 결정은 결론부터 적습니다. 과정은 그 아래.',
      '- 비밀번호와 키는 적지 않습니다. 보관 위치만 적습니다.',
    )),

    mk('d2', '개발 규칙', 'd1', 1, 'm2', ['개발'], lines(
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
      '> 셋 중 하나라도 실패하면 배포하지 않습니다.',
    )),

    mk('d3', '외주 진행 절차', 'd1', 2, 'm7', ['프로세스'], lines(
      '상담에서 배포까지 다섯 단계로 갑니다. 단계마다 고객 손에 남는 것이 있어야 다음으로 넘어갑니다.',
      '',
      '| 단계 | 끝나면 남는 것 |',
      '| --- | --- |',
      '| 상담 | 범위와 예산대 합의 |',
      '| 기획 | 요구사항 정의서, 화면 흐름도, 견적과 일정 |',
      '| 개발 | 눌러볼 수 있는 링크 |',
      '| 테스트 | 이슈 목록과 처리 여부 |',
      '| 배포 | 소스, 문서, 인프라 계정 소유권 |',
      '',
      '## 견적을 내기 전에',
      '',
      '요구사항 정의서 없이 숫자를 먼저 내지 않습니다. 근거가 없는 견적은 서로 손해입니다.',
      '',
      '## 범위가 바뀌면',
      '',
      '바꾸자는 얘기가 나온 그 주에 무엇이 밀리는지 정리해 드리고, 그 다음에 진행 여부를 정합니다.',
    )),

    mk('d4', '기술 결정 기록', 'd1', 3, 'm4', ['ADR'], lines(
      '큰 선택을 할 때마다 한 장씩 남깁니다. 나중에 "왜 이렇게 했지"를 다시 묻지 않기 위해서입니다.',
      '',
      '| 결정 | 관련 작업 |',
      '| --- | --- |',
      '| 웹사이트를 정적 배포로 유지한다 | MATE-112 |',
      '| 이미지는 WebP로 통일한다 | MATE-115 |',
      '',
      '> 새 결정은 이 문서 아래에 하위 문서로 추가합니다.',
    )),

    mk('d5', '웹사이트를 정적 배포로 유지한다', 'd4', 1, 'm4', ['ADR', '웹사이트'], lines(
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

    mk('d6', '이미지는 WebP로 통일한다', 'd4', 2, 'm4', ['ADR', '성능'], lines(
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

    mk('d7', '교육 과정 운영 안내', 'd1', 4, 'm7', ['교육'], lines(
      '## 표준 과정',
      '',
      '| 과정 | 기간 | 대상 |',
      '| --- | --- | --- |',
      '| Unity 게임 개발 | 12주 · 주 1회 3시간 | 입문 ~ 중급 |',
      '| 웹 · 앱 개발 | 12주 · 주 1회 3시간 | 입문 ~ 중급 |',
      '| AI 활용 개발 | 8주 · 주 1회 3시간 | 개발 경험자 |',
      '',
      '## 기관과 조율할 것',
      '',
      '- 시수와 정원, 실습 환경',
      '- 평가 방식과 산출물 범위',
      '- 담당 강사 고정 여부',
      '',
      '> 미래산업과학고는 9개월 연속 과정으로 운영했고 강사를 바꾸지 않았습니다.',
      '> 기관 입장에서는 이게 가장 큰 차이라고 들었습니다.',
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

function read(): Doc[] | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Doc[]) : null;
  } catch {
    return null;
  }
}

function write(docs: Doc[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(docs));
  } catch {
    /* 저장이 막혀 있어도 화면은 계속 동작해야 한다 */
  }
}

export interface DocStore {
  docs: Doc[];
  ready: boolean;
  create(input: { title: string; body: string; parentId: string | null; author: string }): Doc;
  update(id: string, patch: Partial<Doc>): void;
  /** 하위 문서까지 함께 지운다 */
  remove(id: string): void;
}

export function useDocStore(): DocStore {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [ready, setReady] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const loaded = read() ?? seed();
    setDocs(loaded);
    seq.current = loaded.length;
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try { setDocs(JSON.parse(e.newValue)); } catch { /* 깨진 값은 무시 */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const create = useCallback<DocStore['create']>((input) => {
    seq.current += 1;
    const now = new Date().toISOString();
    const doc: Doc = {
      id: `d${now}-${seq.current}`,
      title: input.title,
      parentId: input.parentId,
      body: input.body,
      author: input.author,
      labels: [],
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setDocs((prev) => {
      const next = [...prev, doc];
      write(next);
      return next;
    });
    return doc;
  }, []);

  const update = useCallback<DocStore['update']>((id, patch) => {
    setDocs((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback<DocStore['remove']>((id) => {
    setDocs((prev) => {
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
      const next = prev.filter((d) => !doomed.has(d.id));
      write(next);
      return next;
    });
  }, []);

  return { docs, ready, create, update, remove };
}
