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
  startDate: string;
  endDate?: string;
  category: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

