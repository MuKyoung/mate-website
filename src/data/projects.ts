import { Project } from '@/types';

/**
 * 공개 포트폴리오.
 *
 * 개발 기간과 참여 인원은 적지 않는다 (사용자 요청, 2026-10-16). 설명 문장에도 넣지 않는다.
 * 교육 과정의 길이(정규 수업 몇 개월)는 개발 기간이 아니라 강의 내용이라 남겨 둔다.
 *
 * 만들 때 쓴 기술(언어, 엔진, 프레임워크, 기기, 배포처)도 적지 않는다 (사용자 요청, 2026-10-16).
 * 강의 사례에서 가르친 과목(C#, 유니티)은 강의 내용이라 남겨 둔다.
 */

export const projects: Project[] = [
  {
    id: '1',
    title: '미래산업과학고등학교 강의',
    description: '특성화고 정규 수업으로 9개월. C# 문법 기초에서 시작해 유니티로 각자 게임을 만드는 데까지 갔습니다.',
    longDescription:
      '특성화고 정보 계열 정규 교과로 편성해 9개월간 이어간 과정입니다. C# 문법을 화면에 띄워 설명하는 것으로 시작해, 유니티 에디터 조작과 컴포넌트 구조를 거쳐 학생이 각자 게임을 만드는 데까지 갔습니다.\n\n커리큘럼과 실습 과제를 직접 설계했습니다.',
    thumbnail: '/images/projects/미래산업과학고.webp',
    images: [
      '/images/projects/미래산업과학고.webp',
    ],
    category: 'Education Content',
  },
  {
    id: '2',
    title: 'VR 키오스크 시뮬레이션',
    description: '무인 키오스크 주문 화면을 VR로 옮긴 훈련 콘텐츠. 상품 스캔부터 결제까지 실제 조작 순서를 그대로 밟게 만들었습니다.',
    longDescription:
      '무인 키오스크 앞에서 당황하지 않도록, 주문 화면 전체를 VR로 옮겼습니다. 상품을 고르고 수량을 확인하고 결제까지 가는 실제 조작 순서를 그대로 밟게 만들어, 손이 먼저 익도록 했습니다.\n\n컨트롤러 조작에 맞춰 UI 거리와 크기를 조정했습니다.',
    thumbnail: '/images/projects/VR 키오스크 시뮬레이션.webp',
    images: [
      '/images/projects/VR 키오스크 시뮬레이션.webp',
    ],
    // youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID', // 유튜브 링크 (선택사항)
    category: 'VR Application',
  },
  {
    id: '3',
    title: '영창하세요 마법사님',
    description: '주문을 외워 마법을 쓰는 2D 캐주얼 게임. 주문을 외우는 리듬에서 재미가 나오도록 만들었습니다.',
    longDescription:
      '주문을 외워 마법을 쓰는 2D 캐주얼 게임입니다. 조작이 단순한 대신 주문을 외우는 리듬에서 재미가 나오도록 코어 루프를 잡았습니다.',
    thumbnail: '/images/projects/영창하세요마법사님.webp',
    images: [
      '/images/projects/영창하세요마법사님.webp',
    ],
    category: 'Game Application',
  },
  {
    id: '4',
    title: 'ITLand',
    description: '저소득층 아동을 위한 VR 코딩 교육 프로그램.',
    longDescription:
      '저소득층 아동이 코딩을 처음 접하는 자리를 VR로 만들었습니다. 화면 앞에 앉아 타이핑하는 대신, 블록을 직접 집어 옮기며 순서와 반복을 몸으로 익히게 했습니다.',
    thumbnail: '/images/projects/햄부기.webp',
    images: [
      '/images/projects/햄부기.webp',
    ],
    category: 'VR Application',
  },
  {
    id: '5',
    title: '잘라라 재료',
    description: '팔 재활 훈련을 게임으로 옮긴 2D 프로그램. 재료를 자르는 동작으로 반복 운동을 유도합니다.',
    longDescription:
      '팔 재활 훈련은 같은 동작을 반복해야 해서 지루해지기 쉽습니다. 재료를 자르는 동작에 훈련 궤적을 얹어, 게임을 하는 동안 필요한 운동이 나오도록 설계했습니다.',
    thumbnail: '/images/projects/잘라라 재료.webp',
    images: [
      '/images/projects/잘라라 재료.webp',
    ],
    category: 'Game Application',
  },
  {
    id: '6',
    title: '21세기 표류기',
    description: '한강 노루섬에 표류한 사람이 생존 과학 지식으로 버티는 VR 콘텐츠.',
    longDescription:
      '한강 노루섬에 표류한 상황을 VR로 재현했습니다. 불을 피우고 식수를 확보하는 과제를 손으로 직접 해결하게 만들어, 생존 과학 지식이 설명이 아니라 경험으로 남게 했습니다.',
    thumbnail: '/images/projects/21세기 표류기.webp',
    images: [
      '/images/projects/21세기 표류기.webp',
    ],
    category: 'VR Application',
  },
  {
    id: '7',
    title: '논디',
    description: '논술 답안을 첨삭하는 웹·앱. 검색으로 근거를 찾아 첨삭 의견에 붙입니다.',
    longDescription:
      '논술 답안을 받아 첨삭 의견을 돌려주는 웹·앱입니다. 모델이 답을 지어내지 않도록 검색으로 찾은 근거를 첨삭 의견에 함께 제시하게 구성했습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    category: 'Web Application',
  },
  {
    id: '8',
    title: 'Chatudy',
    description: 'LINE 단체 메시지 발송 시스템. 대상을 추리고 발송하고 결과를 확인하는 흐름을 한 화면에서 끝냅니다.',
    longDescription:
      'LINE으로 단체 메시지를 보내야 하는 업무를 시스템으로 옮겼습니다. 대상을 추리고 발송하고 결과를 확인하는 흐름을 한 화면에서 끝내도록 만들었습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    category: 'Web Application',
  },
  {
    id: '9',
    title: '꼬꼬지생',
    description: '옛 산골을 배경으로 한 2D 게임. 아트 비중을 크게 잡고 캐릭터 애니메이션과 컷신을 만들었습니다.',
    longDescription:
      '옛 산골을 배경으로 한 2D 게임입니다. 배경과 캐릭터의 결을 살리기 위해 아트 비중을 크게 잡았고, 캐릭터 애니메이션과 컷신을 만들었습니다.',
    thumbnail: '/images/projects/꼬꼬지생.webp',
    images: [
      '/images/projects/꼬꼬지생.webp',
    ],
    category: 'Game Application',
  },
  {
    id: '10',
    title: '피오크래프트',
    description: '코어 플레이 하나에 집중한 2D 프로토타입. 플레이 가능한 빌드에서 끊었습니다.',
    longDescription:
      '기능을 늘리는 대신 코어 플레이 하나를 다듬어 플레이 가능한 빌드에서 끊었습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    category: 'Game Application',
  },
  {
    id: '11',
    title: 'VR 중고차 구매 가이드',
    description: '중고차를 살 때 볼 것들을 VR에서 직접 따라 해 보는 가이드. 외관·내부·엔진룸 점검을 순서대로 구성했습니다.',
    longDescription:
      '중고차를 살 때 무엇을 봐야 하는지 글로 읽어도 현장에서는 기억나지 않습니다. 외관과 내부, 엔진룸까지 확인 지점을 순서대로 밟아가며 직접 살펴보게 구성했습니다.',
    thumbnail: '/images/projects/VR 중고차 구매 가이드.webp',
    images: [
      '/images/projects/VR 중고차 구매 가이드.webp',
    ],
    category: 'VR Application',
  },
  {
    id: '12',
    title: '큐어팜',
    description: '치유농업 서비스를 위한 웹과 앱. 웹과 앱이 같은 데이터를 함께 쓰도록 만들었습니다.',
    longDescription:
      '치유농업 서비스를 웹과 앱 양쪽에서 쓸 수 있도록 만들었습니다. 같은 데이터를 두 채널이 함께 쓰도록 백엔드를 한 벌로 두고 프론트를 나눴습니다.',
    thumbnail: undefined, // 공개 가능한 화면 캡처 없음
    images: [],
    category: 'Web Application',
  },
  {
    id: '13',
    title: '세종호이스트크레인 홈페이지',
    description: '크레인과 호이스트를 설계 · 제작 · 설치하는 (주)세종호이스트크레인의 회사 홈페이지. 회사소개, 사업영역, 시공사례, 견적문의를 한 사이트에 담았습니다.',
    longDescription:
      '크레인과 호이스트를 설계 · 제작 · 설치하는 (주)세종호이스트크레인의 회사 홈페이지입니다.\n\n회사소개(인사말, 연혁, 기술 · 인증, 수상이력, 오시는 길), 전기 · 전력부터 일반 제조까지 다섯 갈래의 사업영역, 시공사례, 뉴스, 견적문의와 문의현황 조회로 구성했고 영문 페이지를 함께 두었습니다.',
    // 공개된 사이트의 첫 화면을 찍은 것이다
    thumbnail: '/images/projects/세종호이스트크레인.webp',
    images: [
      '/images/projects/세종호이스트크레인.webp',
    ],
    liveUrl: 'https://www.sjhoistcrane.com',
    category: 'Website',
  },
];
