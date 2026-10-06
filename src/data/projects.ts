import { Project } from '@/types';

export const projects: Project[] = [
  {
    id: '1',
    title: '미래산업과학고등학교 강의',
    description: '특성화고 정규 수업으로 9개월. C# 문법 기초에서 시작해 유니티로 각자 게임을 만드는 데까지 갔습니다.',
    longDescription:
      '특성화고 정보 계열 정규 교과로 편성해 9개월간 이어간 과정입니다. C# 문법을 화면에 띄워 설명하는 것으로 시작해, 유니티 에디터 조작과 컴포넌트 구조를 거쳐 학생이 각자 게임을 만드는 데까지 갔습니다.\n\n커리큘럼과 실습 과제를 직접 설계했고, 9개월 내내 같은 강사가 담당했습니다. GitHub으로 학생들의 진행 상황을 관리했습니다.',
    thumbnail: '/images/projects/미래산업과학고.webp',
    images: [
      '/images/projects/미래산업과학고.webp',
    ],
    techStack: ['Unity', 'C#', 'Github'],
    teamMembers: ['1'],
    durationMonths: 9,
    category: 'Education Content',
  },
  {
    id: '2',
    title: 'VR 키오스크 시뮬레이션',
    description: '무인 키오스크 주문 화면을 VR로 옮긴 훈련 콘텐츠. 상품 스캔부터 결제까지 실제 조작 순서를 그대로 밟게 만들었습니다.',
    longDescription:
      '무인 키오스크 앞에서 당황하지 않도록, 주문 화면 전체를 VR로 옮겼습니다. 상품을 고르고 수량을 확인하고 결제까지 가는 실제 조작 순서를 그대로 밟게 만들어, 손이 먼저 익도록 했습니다.\n\nMeta Quest 2에서 동작하며 컨트롤러 조작에 맞춰 UI 거리와 크기를 조정했습니다. 개발 3명이 3개월간 작업했습니다.',
    thumbnail: '/images/projects/VR 키오스크 시뮬레이션.webp',
    images: [
      '/images/projects/VR 키오스크 시뮬레이션.webp',
    ],
    techStack: ['Unity', 'C#', 'OculusQuest2', 'Github'],
    // youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID', // 유튜브 링크 (선택사항)
    teamMembers: ['1', '2', '3'],
    durationMonths: 3,
    category: 'VR Application',
  },
  {
    id: '3',
    title: '영창하세요 마법사님',
    description: '주문을 외워 마법을 쓰는 2D 캐주얼 게임. 기획부터 빌드까지 7개월 걸렸습니다.',
    longDescription:
      '주문을 외워 마법을 쓰는 2D 캐주얼 게임입니다. 조작이 단순한 대신 주문을 외우는 리듬에서 재미가 나오도록 코어 루프를 잡았습니다.\n\n기획과 아트 방향을 정하는 단계부터 플레이 가능한 빌드가 나오기까지 7개월이 걸렸습니다. 유니티와 C#으로 구현했습니다.',
    thumbnail: '/images/projects/영창하세요마법사님.webp',
    images: [
      '/images/projects/영창하세요마법사님.webp',
    ],
    techStack: ['Unity', 'C#', 'Github'],
    teamMembers: ['2'],
    durationMonths: 7,
    category: 'Game Application',
  },
  {
    id: '4',
    title: 'ITLand-Unity',
    description: '저소득층 아동을 위한 VR 코딩 교육 프로그램.',
    longDescription:
      '저소득층 아동이 코딩을 처음 접하는 자리를 VR로 만들었습니다. 화면 앞에 앉아 타이핑하는 대신, 블록을 직접 집어 옮기며 순서와 반복을 몸으로 익히게 했습니다.\n\n유니티 기반 VR 콘텐츠로 3개월간 제작했습니다.',
    thumbnail: '/images/projects/햄부기.webp',
    images: [
      '/images/projects/햄부기.webp',
    ],
    techStack: ['Unity', 'C#', 'VR'],
    teamMembers: ['3'],
    durationMonths: 3,
    category: 'VR Application',
  },
  {
    id: '5',
    title: '잘라라 재료',
    description: '팔 재활 훈련을 게임으로 옮긴 유니티 2D 프로그램. 재료를 자르는 동작으로 반복 운동을 유도합니다.',
    longDescription:
      '팔 재활 훈련은 같은 동작을 반복해야 해서 지루해지기 쉽습니다. 재료를 자르는 동작에 훈련 궤적을 얹어, 게임을 하는 동안 필요한 운동이 나오도록 설계했습니다.\n\n유니티 2D로 만들었고 개발 2명이 3개월간 작업했습니다.',
    thumbnail: '/images/projects/잘라라 재료.webp',
    images: [
      '/images/projects/잘라라 재료.webp',
    ],
    techStack: ['Unity', 'C#', 'Github'],
    teamMembers: ['1', '3'],
    durationMonths: 3,
    category: 'Game Application',
  },
  {
    id: '6',
    title: '21세기 표류기',
    description: '한강 노루섬에 표류한 사람이 생존 과학 지식으로 버티는 VR 콘텐츠.',
    longDescription:
      '한강 노루섬에 표류한 상황을 VR로 재현했습니다. 불을 피우고 식수를 확보하는 과제를 손으로 직접 해결하게 만들어, 생존 과학 지식이 설명이 아니라 경험으로 남게 했습니다.\n\n유니티 기반 VR 콘텐츠로 3개월간 제작했습니다.',
    thumbnail: '/images/projects/21세기 표류기.webp',
    images: [
      '/images/projects/21세기 표류기.webp',
    ],
    techStack: ['Unity', 'C#', 'VR'],
    teamMembers: ['3'],
    durationMonths: 3,
    category: 'VR Application',
  },
  {
    id: '7',
    title: '논디',
    description: 'RAG로 논술 답안을 첨삭하는 웹·앱. 검색으로 근거를 찾아 첨삭 의견에 붙입니다.',
    longDescription:
      '논술 답안을 받아 첨삭 의견을 돌려주는 웹·앱입니다. 모델이 답을 지어내지 않도록 RAG를 붙여, 검색으로 찾은 근거를 첨삭 의견에 함께 제시하도록 구성했습니다.\n\nNext.js 프론트엔드에 Flutter 앱, Python 백엔드를 얹고 AWS에 배포했습니다. 3개월간 작업했습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Flutter', 'Python', 'AWS', 'Github'],
    teamMembers: ['1'],
    durationMonths: 3,
    category: 'Web Application',
  },
  {
    id: '8',
    title: 'Chatudy',
    description: 'LINE 단체 메시지 발송 시스템. 한 달 만에 기획부터 배포까지 마쳤습니다.',
    longDescription:
      'LINE으로 단체 메시지를 보내야 하는 업무를 시스템으로 옮겼습니다. 대상을 추리고 발송하고 결과를 확인하는 흐름을 한 화면에서 끝내도록 만들었습니다.\n\n기획부터 배포까지 한 달 만에 마쳤습니다. Next.js와 Python, AWS 구성입니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Flutter', 'Python', 'AWS', 'Github'],
    teamMembers: ['1'],
    durationMonths: 1,
    category: 'Web Application',
  },
  {
    id: '9',
    title: '꼬꼬지생',
    description: '옛 산골을 배경으로 한 2D 게임. Spine으로 캐릭터를 움직였고 제작에 10개월을 썼습니다.',
    longDescription:
      '옛 산골을 배경으로 한 2D 게임입니다. 배경과 캐릭터의 결을 살리기 위해 아트 비중을 크게 잡았고, Spine으로 캐릭터 애니메이션과 컷신을 만들었습니다.\n\n스테이지를 쌓아 올리는 데 10개월이 걸렸습니다. 공개한 프로젝트 가운데 기간이 가장 깁니다.',
    thumbnail: '/images/projects/꼬꼬지생.webp',
    images: [
      '/images/projects/꼬꼬지생.webp',
    ],
    techStack: ['Unity', 'C#', 'Spine', 'Github'],
    teamMembers: ['1'],
    durationMonths: 10,
    category: 'Game Application',
  },
  {
    id: '10',
    title: '피오크래프트',
    description: '한 달짜리 단기 제작. 코어 플레이만 남긴 2D 프로토타입에서 끊었습니다.',
    longDescription:
      '한 달이라는 기간을 먼저 정해 두고 시작한 단기 제작입니다. 기능을 늘리는 대신 코어 플레이 하나를 다듬어 플레이 가능한 빌드에서 끊었습니다.\n\n개발 3명이 참여했고 Spine으로 캐릭터를 움직였습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    techStack: ['Unity', 'C#', 'Spine', 'Github'],
    teamMembers: ['1', '2', '3'],
    durationMonths: 1,
    category: 'Game Application',
  },
  {
    id: '11',
    title: 'VR 중고차 구매 가이드',
    description: '중고차를 살 때 볼 것들을 VR에서 직접 따라 해 보는 가이드. 외관·내부·엔진룸 점검을 순서대로 구성했습니다.',
    longDescription:
      '중고차를 살 때 무엇을 봐야 하는지 글로 읽어도 현장에서는 기억나지 않습니다. 외관과 내부, 엔진룸까지 확인 지점을 순서대로 밟아가며 직접 살펴보게 구성했습니다.\n\nMeta Quest 2용으로 만들었고 개발 2명이 3개월간 작업했습니다.',
    thumbnail: '/images/projects/VR 중고차 구매 가이드.webp',
    images: [
      '/images/projects/VR 중고차 구매 가이드.webp',
    ],
    techStack: ['Unity', 'C#', 'OculusQuest2', 'Github'],
    teamMembers: [ '2', '3'],
    durationMonths: 3,
    category: 'VR Application',
  },
  {
    id: '12',
    title: '큐어팜',
    description: '치유농업 서비스를 위한 웹과 앱. React·Next.js 프론트, Python 백엔드, Flutter 앱을 한 번에 얹었습니다.',
    longDescription:
      '치유농업 서비스를 웹과 앱 양쪽에서 쓸 수 있도록 만들었습니다. 같은 데이터를 두 채널이 함께 쓰도록 백엔드를 한 벌로 두고 프론트를 나눴습니다.\n\nReact·Next.js 프론트엔드, Flutter 앱, Python 백엔드를 AWS에 올렸습니다. 3개월간 작업했습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Flutter', 'Python', 'AWS', 'Github'],
    teamMembers: ['1'],
    durationMonths: 3,
    category: 'Web Application',
  },
];
