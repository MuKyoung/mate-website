import { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '서비스 - Mate 외주개발팀',
  description: '유니티 외주 개발과 개발 강의 서비스를 제공합니다. 실무 경험 기반 교육과 안정적인 외주 개발 전문.',
  keywords: '외주개발, 유니티 개발, 개발 강의, Unity 외주, 유니티 강의, 게임 개발 교육, 유니티 외주개발, Unity 외주개발',
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: '서비스 - Mate 외주개발팀',
    description: '유니티 외주 개발과 개발 강의 서비스를 제공합니다. 실무 경험 기반 교육과 안정적인 외주 개발 전문.',
    url: `${siteUrl}/services`,
    type: 'website',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
