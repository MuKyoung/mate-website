import { Metadata } from 'next';
import { teamMembers } from '@/data/team';
import TeamMemberClient from './TeamMemberClient';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return teamMembers.map((member) => ({
    id: member.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const member = teamMembers.find((m) => m.id === params.id);
  if (!member) {
    return {
      title: '팀원을 찾을 수 없습니다',
    };
  }
  return {
    title: `${member.name} - Mate 외주개발팀`,
    description: member.bio,
  };
}

export default function TeamMemberPage({ params }: PageProps) {
  return <TeamMemberClient params={params} />;
}
