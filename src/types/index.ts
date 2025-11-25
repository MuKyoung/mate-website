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

