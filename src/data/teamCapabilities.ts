// 수상 경력 타입
export interface Award {
  id: string;
  year: number;
  title: string;
  organization: string;
  description?: string;
  rank?: string; // 대상, 금상, 은상 등
}

// 연도별 수상 경력
export const awards: Award[] = [
  {
    id: 'award-1',
    year: 2024,
    title: '유니티 게임 개발 공모전',
    organization: '한국게임학회',
    description: 'VR 키오스크 시뮬레이션 프로젝트',
    rank: '대상',
  },
  {
    id: 'award-2',
    year: 2024,
    title: '메타버스 콘텐츠 경진대회',
    organization: '과학기술정보통신부',
    description: '몰입형 교육 콘텐츠 개발',
    rank: '우수상',
  },
  {
    id: 'award-3',
    year: 2023,
    title: '인디게임 개발 챌린지',
    organization: '게임산업협회',
    description: '영창하세요 마법사님',
    rank: '금상',
  },
  {
    id: 'award-4',
    year: 2023,
    title: '에듀테크 혁신 어워드',
    organization: '교육부',
    description: '게임 기반 교육 솔루션',
    rank: '장려상',
  },
  {
    id: 'award-5',
    year: 2022,
    title: 'XR 콘텐츠 공모전',
    organization: '한국콘텐츠진흥원',
    description: 'AR 인터랙티브 체험 콘텐츠',
    rank: '은상',
  },
];

// 팀 전체 역량 데이터
export const teamCapabilities = {
  title: 'Mate 팀의 역량',
  description: '유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다',
  capabilities: [
    {
      id: 'unity',
      title: '유니티 외주 개발',
      description: '2D/3D 게임, AR/VR 콘텐츠 외주 개발에 전문성을 가진 팀입니다',
      icon: '🎮',
      skills: ['Unity', 'C#', '2D 게임', '3D 게임', 'AR/VR', '모바일 게임'],
      experience: '5년 이상',
      projects: 20,
    },
    {
      id: 'client',
      title: '클라이언트 개발',
      description: '고성능 게임 클라이언트와 사용자 인터페이스 개발',
      icon: '💻',
      skills: ['Unity Client', 'UI/UX', '최적화', '크로스 플랫폼'],
      experience: '5년 이상',
      projects: 15,
    },
    {
      id: 'server',
      title: '서버 개발',
      description: '확장 가능한 게임 서버 아키텍처 설계 및 개발',
      icon: '🖥️',
      skills: ['게임 서버', '네트워크', '데이터베이스', 'API 개발'],
      experience: '3년 이상',
      projects: 10,
    },
    {
      id: 'outsourcing',
      title: '외주 개발',
      description: '다양한 규모의 프로젝트를 안정적으로 완수하는 경험',
      icon: '🤝',
      skills: ['프로젝트 관리', '품질 보증', '일정 관리', '커뮤니케이션'],
      experience: '5년 이상',
      projects: 30,
    },
    {
      id: 'education',
      title: '개발 강의',
      description: '실무 경험을 바탕으로 한 체계적인 개발 교육 서비스',
      icon: '📚',
      skills: ['Unity 강의', 'C# 프로그래밍', '게임 개발 교육', '실무 프로젝트 지도'],
      experience: '3년 이상',
      projects: 15,
    },
  ],
  stats: {
    totalProjects: 30,
    yearsExperience: 4,
    teamMembers: 4,
    successRate: 100,
  },
};

