import { Metadata } from 'next';
import TeamPageClient from './TeamPageClient';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '팀 역량 - Mate 외주개발팀',
  description: '유니티 외주 개발과 개발 강의에 특화된 Mate 팀의 역량을 소개합니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다.',
  keywords: '외주개발, 유니티 개발, 개발 강의, Unity 외주, 게임 개발 교육, 유니티 강의, 유니티 외주개발 팀',
  alternates: {
    canonical: `${siteUrl}/team`,
  },
  openGraph: {
    title: '팀 역량 - Mate 외주개발팀',
    description: '유니티 외주 개발과 개발 강의에 특화된 Mate 팀의 역량을 소개합니다. 5년 이상의 경험과 30개 이상의 완료 프로젝트를 보유하고 있습니다.',
    url: `${siteUrl}/team`,
    type: 'website',
  },
};

export default function TeamPage() {
  return <TeamPageClient />;
}
