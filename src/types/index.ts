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
  liveUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string; // 유튜브 영상 URL (선택사항) - 있으면 썸네일 대신 영상 표시
  // 개발 기간, 참여 인원, 기술 스택은 두지 않는다 - 사이트에 노출하지 않기로 했다
  category: string;
}

export interface Testimonial {
  id: string;
  /** 직함 - 실명 대신 노출한다 */
  role: string;
  /** 업종 - 사명 대신 노출한다 */
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
  /** 공정 원의 단계 이름 아래 한 줄 - 회사소개서의 단계 설명을 줄인 것 */
  keywords: string;
  order: number;
}


/* ── 도메인 (사업 영역) ─────────────────────────────── */

/** MATE의 3개 사업 도메인 */
export type DomainKey = 'web' | 'game' | 'edu';

/** 도메인 공통 메타 - 허브/네비/카드에서 쓰인다 */
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
  /** 홈 전용 - 이 영역을 찾게 되는 상황 */
  trigger: string;
  /** 허브 카드용 요약 */
  summary: string;
  /** 대표 지표 3개 */
  stats: { value: string; label: string }[];
  /** 취급 범위 요약 태그 */
  tags: string[];
}

/** 단일 랜딩페이지 제작 - 갤러리 디자인의 출처 표시(외부 디자인 기반 · KRDS 기반) */
export interface LandingCredit {
  text: string;
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

/** 디자인 템플릿 사진 출처 - Unsplash 사진가 */
export interface TemplateCredit {
  name: string;
  /** 사진가 프로필 */
  url: string;
  /** 사진 페이지 */
  photoUrl: string;
}

/** 디자인 템플릿 라이브러리 - 템플릿 하나 (src/data/templateLibrary.ts) */
export interface TemplateItem {
  /** 'PT-01' 꼴 */
  id: string;
  title: string;
  summary: string;
  /** 종류 열쇠 (pt · cn · dc ...) */
  format: string;
  formatLabel: string;
  spec: string;
  /** 업종 묶음 번호 1~10 */
  field: number;
  fieldLabel: string;
  genre: string;
  genreLabel: string;
  /** 쓰임 (예: 카페 가맹 안내서) */
  business: string;
  /** 쪽마다 원래 크기 [너비, 높이] px */
  pages: number[][];
  /** 영상 길이(초). 영상이 아니면 0 */
  video: number;
  /** 바꿔 넣는 것 */
  swap: string;
  fonts: string[];
  /** 샘플이 갖춘 파일 형식 */
  outputs: string[];
  credits: TemplateCredit[];
}

/** 단일 랜딩페이지 제작 - 갤러리 디자인 하나 (src/data/landingDesigns.ts) */
export interface LandingDesign {
  /** 'LP-001' 꼴 */
  id: string;
  title: string;
  /** 업종 묶음 번호 1~10 */
  field: number;
  fieldLabel: string;
  industries: string[];
  purposes: string[];
  moods: string[];
  visualStyles: string[];
  /** template = 외부 디자인 기반 제작 스타일 샘플, mate = MATE 시안 */
  kind: 'template' | 'mate';
  kindLabel: string;
  summary: string;
  thumb: string;
  desktop: string;
  mobile: string;
  /** 모바일 첫 화면(390×844 비율) - 갤러리를 모바일로 볼 때 카드 그림 */
  mobileThumb: string;
  credit: LandingCredit | null;
  /** 사진 자리에 예시로 넣은 Unsplash 사진의 사진가 (없으면 빈 배열) */
  photoCredits: TemplateCredit[];
}
