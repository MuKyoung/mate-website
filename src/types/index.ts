/** 조직 부서 구분 */
export type Department = 'development' | 'design' | 'operations';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  bio: string;
  profileImage: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  email: string;
  projects: string[]; // project IDs
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  /** 공개 가능한 대표 이미지. 없으면 ThumbFallback 이 대신 선다 */
  thumbnail?: string;
  images: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string; // 유튜브 영상 URL (선택사항) - 있으면 썸네일 대신 영상 표시
  teamMembers: string[]; // member IDs
  durationMonths: number; // 개발 기간 (개월)
  category: string;
}

export interface Testimonial {
  id: string;
  /** 직함 — 실명 대신 노출한다 */
  role: string;
  /** 업종 — 사명 대신 노출한다 */
  company?: string;
  content: string;
  projectId?: string; // 관련 프로젝트 ID
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  order: number;
}


/* ── 도메인 (사업 영역) ─────────────────────────────── */

/** MATE의 3개 사업 도메인 */
export type DomainKey = 'web' | 'game' | 'edu';

/** 도메인 공통 메타 — 허브/네비/카드에서 쓰인다 */
export interface DomainMeta {
  key: DomainKey;
  /** 라우트 세그먼트 */
  slug: string;
  /** 영문 디스플레이 명 */
  en: string;
  /** 국문 명 */
  kr: string;
  /** 한 줄 포지셔닝 */
  lead: string;
  /** 홈 전용 — 이 영역을 찾게 되는 상황 */
  trigger: string;
  /** 허브 카드용 요약 */
  summary: string;
  /** 대표 지표 3개 */
  stats: { value: string; label: string }[];
  /** 취급 범위 요약 태그 */
  tags: string[];
}
