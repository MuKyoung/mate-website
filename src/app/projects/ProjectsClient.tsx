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
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <ProjectFilter projects={projects} />
        </div>
      </section>
      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
