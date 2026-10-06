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

/** 분류에 맞는 공유 카드 — 상세 페이지는 자체 카드가 없으므로 도메인 카드를 쓴다 */
function ogCardFor(category: string): string {
  if (/Web|Mobile/.test(category)) return 'og-web.jpg';
  if (/Education/.test(category)) return 'og-education.jpg';
  return 'og-game.jpg';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = projects.find((p) => p.id === params.slug);
  if (!project) {
    return {
      title: '프로젝트를 찾을 수 없습니다',
    };
  }
  const projectUrl = `${siteUrl}/projects/${project.id}`;
  return {
    title: project.title,
    description: `${project.description} | 유니티 외주 개발, 개발 강의 전문`,
    keywords: `외주 개발, ${project.category}, ${project.techStack.join(', ')}`,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${project.title} | Mate 외주개발팀`,
      description: project.description,
      url: projectUrl,
      type: 'website',
      /* 썸네일은 WebP 라 카카오톡 미리보기가 렌더하지 않는다.
         분류에 맞는 JPG 공유 카드를 쓴다. */
      images: [
        {
          url: `${siteUrl}/images/og/${ogCardFor(project.category)}`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectDetailClient params={params} />;
}
