'use client';

import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  return (
    <>
      <ProjectFilter projects={projects} />
      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}

