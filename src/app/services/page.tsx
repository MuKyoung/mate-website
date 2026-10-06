import { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '서비스',
  description: '웹 · 앱, 게임 · XR, 교육 세 영역의 작업 범위와 진행 방식을 각각 정리했습니다. 영역마다 필요한 사람도 판단 기준도 다릅니다.',
  keywords: '외주 개발, 웹 앱 외주 개발, 게임 외주 개발, 유니티 외주, XR 개발, 개발 강의, 외주 개발사, 소프트웨어 외주',
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: '서비스 | Mate 외주개발팀',
    description: '웹 · 앱, 게임 · XR, 교육 세 영역의 작업 범위와 진행 방식을 각각 정리했습니다. 영역마다 필요한 사람도 판단 기준도 다릅니다.',
    url: `${siteUrl}/services`,
    type: 'website',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
