import { Metadata } from 'next';
import ProjectCard from '@/components/ProjectCard';
import PageHeader from '@/components/PageHeader';
import { projects } from '@/data/projects';

export const metadata: Metadata = {
  title: '프로젝트 포트폴리오 - Mate 외주개발팀',
  description: '유니티 게임 개발, AR/VR 등 다양한 프로젝트 포트폴리오를 소개합니다.',
  keywords: '유니티 프로젝트, 게임 개발 포트폴리오, AR/VR 프로젝트, Unity 게임, 외주 개발 사례',
};

export default function ProjectsPage() {
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <div className="pt-20">
      <PageHeader
        title="프로젝트 포트폴리오"
        description="다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다"
      />

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <p className="text-gray-600">
              총 <span className="font-semibold text-purple-600">{projects.length}</span>개의 프로젝트
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

