// 수상/전시 경력 타입
export type AwardType = 'award' | 'exhibition'; // 수상 또는 전시회

export interface Award {
  id: string;
  year: number;
  title: string;
  organization: string;
  description?: string;
  rank?: string; // 대상, 금상, 은상, 인증서 등
  type: AwardType; // 수상 또는 전시회 구분
}

// 연도별 수상/전시 경력
export const awards: Award[] = [
  // ===== 2025년 =====
  {
    id: 'award-2025-1',
    year: 2025,
    title: 'G-STAR',
    organization: '한국게임산업협회',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2025-2',
    year: 2025,
    title: '학생창업유망팀300',
    organization: '교육부',
    rank: '교육부장관 인증서',
    type: 'award',
  },

  // ===== 2024년 =====
  {
    id: 'award-2024-1',
    year: 2024,
    title: '글로벌게임챌린지(GGC) 2024',
    organization: '한국게임학회',
    rank: '우수논문상',
    type: 'award',
  },
  {
    id: 'award-2024-2',
    year: 2024,
    title: '학생창업유망팀300 제품박람회',
    organization: '교육부',
    rank: '교육부장관 인증서',
    type: 'award',
  },
  {
    id: 'award-2024-3',
    year: 2024,
    title: '농림축산식품부 공공데이터 창업경진대회',
    organization: '농림축산식품부',
    rank: '우수상',
    type: 'award',
  },
  {
    id: 'award-2024-4',
    year: 2024,
    title: 'SDGs 소셜벤처 챔피언십',
    organization: 'SDGs',
    rank: '은상',
    type: 'award',
  },
  {
    id: 'award-2024-5',
    year: 2024,
    title: '국방 AI 컨퍼런스',
    organization: '국방부',
    rank: '최우수상',
    type: 'award',
  },
  {
    id: 'award-2024-6',
    year: 2024,
    title: '산학협력 EXPO',
    organization: '과학기술정보통신부',
    rank: '전시 참가',
    type: 'exhibition',
  },

  // ===== 2023년 =====
  {
    id: 'award-2023-1',
    year: 2023,
    title: '글로벌게임챌린지(GGC) 2023',
    organization: '한국게임학회',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2023-2',
    year: 2023,
    title: '디자인씽킹',
    organization: '영남이공대학교 공학기술교육혁신센터',
    rank: '대상',
    type: 'award',
  },
  {
    id: 'award-2023-4',
    year: 2023,
    title: '게임기획 창업 지원사업',
    organization: '한국콘텐츠진흥원',
    rank: '사업 선정',
    type: 'award',
  },
  {
    id: 'award-2023-5',
    year: 2023,
    title: 'G-STAR BTC',
    organization: '한국게임산업협회',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2023-6',
    year: 2023,
    title: '게임 레벨업 쇼케이스(GLS)',
    organization: '한국콘텐츠진흥원',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2023-7',
    year: 2023,
    title: '산학협력 EXPO',
    organization: '과학기술정보통신부',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2023-9',
    year: 2023,
    title: '메타버스 보드게임 프로젝트',
    organization: 'DiveXR (코엑스)',
    rank: '전시 참가',
    type: 'exhibition',
  },
  {
    id: 'award-2023-8',
    year: 2022,
    title: '인디게임지원사업',
    organization: '한국콘텐츠진흥원',
    rank: '전시 참가',
    type: 'exhibition',
  },
  // ===== 2021년 =====
  {
    id: 'award-2021-1',
    year: 2021,
    title: '공학페스티벌 창의적 종합설계 경진대회',
    organization: '산업통상자원부, KIAT',
    rank: '한국산업진흥원장상',
    type: 'award',
  },
  {
    id: 'award-2021-2',
    year: 2021,
    title: '공학페스티벌 창의적 종합설계 경진대회',
    organization: '영남이공대학교 공학기술교육혁신센터',
    rank: '금상',
    type: 'award',
  },
];

// 팀 전체 역량 데이터
export const teamCapabilities = {
  title: 'MATE 팀의 역량',
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
      id: 'outsourcing',
      title: '웹/앱 외주 개발',
      description: '다양한 규모의 프로젝트를 안정적으로 완수하는 경험',
      icon: '🌐',
      skills: ['React', 'Next.js', 'Flutter', 'Python', 'AWS', 'Github'],
      experience: '5년 이상',
      projects: 10,
    },
    {
      id: 'education',
      title: '개발 강의',
      description: '실무 경험을 바탕으로 한 체계적인 개발 교육 서비스',
      icon: '📚',
      skills: ['Unity 개발', '웹/앱 개발', 'AI 활용', '프로그래밍', '실무 프로젝트 지도'],
      experience: '3년 이상',
      projects: 15,
    },
  ],
  stats: {
    totalProjects: 30,
    yearsExperience: 5,
    teamMembers: 4,
    successRate: 100,
  },
};

