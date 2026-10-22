/**
 * 일하는 방식 - 홈과 회사소개가 같이 쓴다.
 *
 * 회사가 FAQ와 진행 절차(faq.ts, process.ts)에 밝혀 둔 것만 적는다.
 * 고객은 이 목록을 약속으로 읽으므로, 듣기 좋은 조건을 지어 넣지 않는다.
 */
export interface WorkPromise {
  id: 'repo' | 'weekly' | 'handover' | 'monitor';
  title: string;
  desc: string;
}

export const promises: WorkPromise[] = [
  { id: 'repo', title: '열린 저장소', desc: 'GitHub로 관리합니다. 프로젝트 기간 동안 진행 상황을 실시간으로 보실 수 있습니다.' },
  { id: 'weekly', title: '주간 공유', desc: '개발 단계에서는 주 단위로 공유하고, 코드 리뷰를 거쳐 올립니다.' },
  { id: 'handover', title: '소스 · 문서 인계', desc: '프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다.' },
  { id: 'monitor', title: '배포 후 모니터링', desc: '배포한 뒤에도 모니터링으로 안정성을 확인합니다.' },
];
