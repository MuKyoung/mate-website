import { TeamMember } from '@/types';

/**
 * 팀 구성원 로스터.
 *
 * 실명·프로필 이미지·개인 소개는 사이트에 노출하지 않는 방침이므로
 * 여기에는 식별 정보를 두지 않는다. 프로젝트별 참여 인원은
 * `src/data/organization.ts`의 부서 매핑으로 집계해 표시한다.
 *
 * (개인 정보를 다시 노출하려면 이 파일이 아니라 별도 비공개 소스를 사용할 것.)
 */
export const teamMembers: TeamMember[] = [];
