import { affiliations } from '@/data/teamCapabilities';

/**
 * 함께한 곳 - 홈의 Partners 칸.
 *
 * 로고 이미지가 없어 이름과 관계만 글자로 적는다. 사이트에 이미 공개된 사실에서만 가져온다.
 *   고객 · 강의처 - 포트폴리오(projects.ts)와 진행 중인 일(ongoing.ts)
 *   소속          - teamCapabilities.ts 의 affiliations
 * 상과 전시를 주관한 기관은 넣지 않는다. 함께 일한 곳이 아니다.
 */

export interface Partner {
  name: string;
  /** 무엇을 함께 했는지 */
  role: string;
}

export const partners: Partner[] = [
  { name: '(주)세종호이스트크레인', role: '웹사이트 제작' },
  { name: '우화', role: '웹사이트 제작' },
  { name: '미래산업과학고등학교', role: '정규 수업' },
  { name: '동일공업고등학교', role: '게임개발 강의' },
  { name: '성남시학교밖청소년복지센터', role: '게임개발 강의' },
  ...affiliations.map((a) => ({ name: a.name, role: a.role })),
];
