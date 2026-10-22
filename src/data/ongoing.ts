/**
 * 지금 진행 중인 일 - 첫 화면 큐브의 웹 · 앱 · 브랜딩 / 게임 · XR / 교육 · 강의 면에 적는다.
 *
 * 사용자가 알려 준 것만 적는다 (2026-10-19). 끝나면 지우고, 공개할 수 있으면
 * 포트폴리오(projects.ts)로 옮긴다. 자체 게임은 games.ts 에 따로 있다.
 */

export type OngoingStatus = '제작 중' | '진행 중';

export interface OngoingWork {
  title: string;
  status: OngoingStatus;
}

export const ongoing: Record<'web' | 'game' | 'edu', OngoingWork[]> = {
  web: [
    { title: '(주)세종호이스트크레인 웹사이트', status: '제작 중' },
    { title: '우화 웹사이트', status: '제작 중' },
    { title: '고객사 사내 ERD', status: '제작 중' },
    { title: '고객사 사내 툴 허브', status: '제작 중' },
  ],
  game: [
    { title: 'AR 소설 1건', status: '제작 중' },
    { title: '2.5D 게임 1건', status: '제작 중' },
  ],
  edu: [
    { title: '동일공업고등학교 게임개발 강의', status: '진행 중' },
    { title: '성남시학교밖청소년복지센터 게임개발 강의', status: '진행 중' },
  ],
};
