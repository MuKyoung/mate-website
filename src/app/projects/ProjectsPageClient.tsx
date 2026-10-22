'use client';

import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import { domainOf } from '@/data/projects';
import { Project } from '@/types';
import { container } from '@/lib/styles';

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  // 머리 문구의 숫자가 목록과 어긋나지 않도록 실제 데이터에서 센다
  const count = (d: string) => projects.filter((p) => domainOf(p.category) === d).length;

  return (
    <>
      <PageHeader eyebrow="Portfolio" title="프로젝트 포트폴리오"
        desc={`게임 · VR ${count('game')}건, 웹 · 앱 ${count('web')}건, 강의 ${count('edu')}건. 전부 납품이 끝난 것들입니다.`} />

      <section data-header="light" className="bg-white py-20 sm:py-24 xl:pb-40 xl:pt-28">
        <div className={container}>
          <ProjectFilter projects={projects} />
        </div>
      </section>
    </>
  );
}
