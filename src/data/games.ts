/**
 * 자체 게임 - 외주가 아니라 MATE가 직접 만들어 퍼블리싱하는 타이틀.
 *
 * 외주 포트폴리오(projects.ts)와 섞지 않는다. 발주처가 있는 일과
 * 우리가 판권을 쥐는 일은 성격이 다르고, 공개할 수 있는 정보도 다르다.
 */

export type GameStatus = '제작 중' | '출시';

export interface Game {
  id: string;
  title: string;
  status: GameStatus;
  /** 출시 전에는 비워 둔다. 스토어가 열리면 채운다. */
  storeUrl?: string;
}

export const games: Game[] = [
  { id: 'game-jellymolly', title: '젤리몰리', status: '제작 중' },
  { id: 'game-romanticagent', title: '로맨틱에이전트', status: '제작 중' },
];

export const gamesInProgress = games.filter((g) => g.status === '제작 중');
