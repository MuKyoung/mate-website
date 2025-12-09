export interface TeamMember {
  id: string;
  name: string;
  role: string;
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
  thumbnail: string;
  images: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string; // 유튜브 영상 URL (선택사항) - 있으면 썸네일 대신 영상 표시
  teamMembers: string[]; // member IDs
  durationMonths: number; // 개발 기간 (개월)
  category: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number; // 1-5
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
  icon: string;
  order: number;
}

