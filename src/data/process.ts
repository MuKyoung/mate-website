import { ProcessStep } from '@/types';

export const processSteps: ProcessStep[] = [
  {
    id: '1',
    title: '상담',
    description: '프로젝트 요구사항을 파악하고 목표를 명확히 정의합니다. 초기 상담을 통해 프로젝트의 방향성을 설정합니다.',
    icon: '💬',
    order: 1,
  },
  {
    id: '2',
    title: '기획',
    description: '상세 기획서 작성 및 기술 스택 선정, 일정 수립을 진행합니다. 프로젝트의 전체적인 로드맵을 설계합니다.',
    icon: '📋',
    order: 2,
  },
  {
    id: '3',
    title: '개발',
    description: '정기적인 소통과 코드 리뷰를 통해 고품질의 결과물을 만들어갑니다. 주간 진행 상황을 공유합니다.',
    icon: '💻',
    order: 3,
  },
  {
    id: '4',
    title: '테스트',
    description: '철저한 테스트를 통해 버그를 발견하고 수정합니다. 사용자 테스트를 통해 UX를 개선합니다.',
    icon: '🧪',
    order: 4,
  },
  {
    id: '5',
    title: '배포',
    description: '최종 검수 후 배포를 진행하고, 배포 후 모니터링을 통해 안정성을 확인합니다.',
    icon: '🚀',
    order: 5,
  },
];

