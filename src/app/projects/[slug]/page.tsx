import { Metadata } from 'next';
import { projects } from '@/data/projects';
import ProjectDetailClient from './ProjectDetailClient';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.id,
  }));
}

const siteUrl = 'https://devteammate.co.kr';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) {
    return {
      title: '프로젝트를 찾을 수 없습니다',
    };
  }
  const projectUrl = `${siteUrl}/projects/${project.id}`;
  return {
    title: `${project.title} - Mate 외주개발팀`,
    description: `${project.description} | 유니티 외주 개발, 개발 강의 전문`,
    keywords: `유니티, Unity, 외주개발, 개발 강의, ${project.techStack.join(', ')}, 유니티 외주개발`,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${project.title} - Mate 외주개발팀`,
      description: project.description,
      url: projectUrl,
      type: 'website',
      images: project.thumbnail ? [
        {
          url: project.thumbnail.startsWith('http') ? project.thumbnail : `${siteUrl}${project.thumbnail}`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ] : [],
    },
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectDetailClient params={params} />;
}
