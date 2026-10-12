import { ProcessStep } from '@/types';

/**
 * 공통 진행 단계.
 * 설명은 '무엇을 하는지'가 아니라 '그 단계 끝에 고객 손에 남는 것'을 적는다.
 */
export const processSteps: ProcessStep[] = [
  {
    id: '1',
    title: '상담',
    description:
      '만들려는 것과 예산 범위를 듣습니다. 저희가 맡기 어려운 부분이면 그 자리에서 말씀드립니다.',
    order: 1,
  },
  {
    id: '2',
    title: '기획',
    description:
      '요구사항 정의서와 화면 흐름도를 씁니다. 여기서 나온 견적과 일정이 그대로 계약 내용이 됩니다.',
    order: 2,
  },
  {
    id: '3',
    title: '개발',
    description:
      '저장소를 열어 두고 진행합니다. 진행률을 물어보실 필요 없이 커밋으로 직접 확인하실 수 있습니다.',
    order: 3,
  },
  {
    id: '4',
    title: '테스트',
    description:
      '실기기로 돌립니다. 발견한 문제는 이슈로 남기고, 이번에 잡을 것과 다음으로 넘길 것을 같이 정합니다.',
    order: 4,
  },
  {
    id: '5',
    title: '배포',
    description:
      '최종 검수 후 올립니다. 소스 코드와 문서, 인프라 계정 소유권을 이때 넘겨드립니다.',
    order: 5,
  },
];
