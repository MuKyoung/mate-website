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
      <FloatingNotice message="수정 중인 페이지입니다" />
    </>
  );
}

