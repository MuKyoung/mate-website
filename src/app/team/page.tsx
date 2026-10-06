import { Metadata } from 'next';
import TeamPageClient from './TeamPageClient';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '팀 역량',
  description: '개발 4 · 디자인 2 · 운영 1, 일곱 명이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역의 역량과 수상 · 전시 이력을 공개합니다.',
  keywords: '외주개발팀, 개발 외주, 웹 앱 외주, 유니티 외주, 게임 외주 개발, 개발 강의, 외주 개발사, 소프트웨어 외주',
  alternates: {
    canonical: `${siteUrl}/team`,
  },
  openGraph: {
    title: '팀 역량 | Mate 외주개발팀',
    description: '개발 4 · 디자인 2 · 운영 1, 일곱 명이 하나의 팀으로 움직입니다. 웹 · 앱, 게임 · XR, 교육 세 영역의 역량과 수상 · 전시 이력을 공개합니다.',
    url: `${siteUrl}/team`,
    type: 'website',
  },
};

export default function TeamPage() {
  return <TeamPageClient />;
}
