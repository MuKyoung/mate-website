import { FAQ } from '@/types';
import { projects } from '@/data/projects';

/**
 * 자주 묻는 질문.
 *
 * 답변은 고객이 계약 조건처럼 읽는다. 회사가 정한 내용만 적고, 구체적으로
 * 들리게 하려고 조건을 지어 넣지 않는다 (예: '유지보수는 별도 계약',
 * '바뀌면 그 주에 숫자로 정리', '인프라 계정 소유권 인계' 는 회사가 한 말이 아니었다).
 *
 * 덧붙일 수 있는 것은 데이터에서 그대로 계산되는 사실뿐이다. 기간 분포는
 * 공개 포트폴리오의 durationMonths 에서 계산하므로 프로젝트가 늘어도 어긋나지 않는다.
 */

const months = projects.map((p) => p.durationMonths);
const shortest = Math.min(...months);
const longest = Math.max(...months);
const within3 = months.filter((m) => m <= 3).length;
const courseMonths = projects
  .filter((p) => p.category === 'Education Content')
  .map((p) => p.durationMonths);
/** 교육 프로젝트가 하나도 없으면 문장을 덧붙이지 않는다 */
const longestCourse = courseMonths.length ? Math.max(...courseMonths) : null;

export const faqs: FAQ[] = [
  {
    id: '1',
    question: '외주 개발은 어떤 순서로 진행되나요?',
    answer:
      '상담, 기획과 견적, 개발, 테스트, 배포 순서로 진행합니다. 단계마다 진행 상황을 공유합니다.',
    category: '프로세스',
  },
  {
    id: '2',
    question: '개발 기간은 보통 얼마나 걸리나요?',
    answer:
      `규모에 따라 다릅니다. 소규모는 1~2개월, 중규모는 3~6개월 정도입니다. 공개한 포트폴리오 ${projects.length}건은 ${shortest}개월에서 ${longest}개월 사이였고, 그중 ${within3}건이 3개월 안에 끝났습니다. 정확한 기간은 상담에서 정합니다.`,
    category: '일정',
  },
  {
    id: '3',
    question: '비용은 어떻게 산정되나요?',
    answer:
      '프로젝트 규모와 개발 기간, 기술 난이도를 함께 보고 견적을 냅니다. 정확한 견적은 상담 후에 드립니다.',
    category: '비용',
  },
  {
    id: '4',
    question: '소스 코드는 받을 수 있나요?',
    answer:
      '네. 프로젝트가 끝나면 모든 소스 코드와 문서를 드립니다. GitHub로 관리하기 때문에 프로젝트 기간 동안에도 실시간으로 보실 수 있습니다.',
    category: '서비스',
  },
  {
    id: '5',
    question: '진행 중에 요구사항을 바꿀 수 있나요?',
    answer:
      '네. 다만 진행 상황에 따라 일정 조정이 필요할 수 있습니다. 변경이 생기면 바로 말씀드리고 방법을 같이 찾습니다.',
    category: '프로세스',
  },
  {
    id: '6',
    question: '개발이 끝난 뒤 유지보수도 맡길 수 있나요?',
    answer:
      '네. 프로젝트가 끝난 뒤에도 유지보수를 제공합니다. 버그 수정과 기능 추가, 업데이트를 지원합니다.',
    category: '서비스',
  },
  {
    id: '7',
    question: '어떤 기술 스택을 쓰나요?',
    answer:
      'Unity(C#), 웹(React, Next.js), 앱(Flutter), 서버(Python, Node.js)를 다룹니다. 프로젝트 요구사항에 맞는 기술을 고릅니다.',
    category: '기술',
  },
  {
    id: '8',
    question: '강의는 어떤 형태로 진행되나요?',
    answer:
      '온라인과 오프라인 모두 가능합니다. 실무 프로젝트 기반 커리큘럼으로 진행하고, 수강생 수준에 맞춰 조정합니다.' +
      (longestCourse ? ` 가장 길게 진행한 과정은 ${longestCourse}개월입니다.` : ''),
    category: '강의',
  },
  {
    id: '9',
    question: '기획이 아직 정리되지 않았는데 문의해도 되나요?',
    answer:
      '네. 요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일입니다.',
    category: '프로세스',
  },
];
