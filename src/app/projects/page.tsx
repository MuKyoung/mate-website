import { Metadata } from 'next';
import ProjectsPageClient from './ProjectsPageClient';
import { projects } from '@/data/projects';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '프로젝트 포트폴리오',
  description: '납품이 끝난 프로젝트 12건. 게임 · VR, 웹 · 앱, 강의까지 기간과 기술 구성을 함께 공개합니다.',
  keywords: '유니티 프로젝트, 외주 개발 포트폴리오, Unity 외주, 개발 강의 사례, 게임 개발 교육, 유니티 외주개발 포트폴리오',
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
  openGraph: {
    title: '프로젝트 포트폴리오 | Mate 외주개발팀',
    description: '납품이 끝난 프로젝트 12건. 게임 · VR, 웹 · 앱, 강의까지 기간과 기술 구성을 함께 공개합니다.',
    url: `${siteUrl}/projects`,
    type: 'website',
  },
};

export default function ProjectsPage() {
  return <ProjectsPageClient projects={projects} />;
}
