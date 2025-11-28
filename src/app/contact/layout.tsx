import { Metadata } from 'next';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '문의 - Mate 외주개발팀',
  description: '유니티 외주 개발, 개발 강의 문의는 Mate 팀으로 연락주세요.',
  keywords: '외주, 개발, 유니티, 강의, 문의, 개발 외주, 개발 강의, 개발 문의, 외주개발 문의, 유니티 개발 문의, 개발 강의 상담, 유니티 강의 문의',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: '문의 - Mate 외주개발팀',
    description: '유니티 외주 개발, 개발 강의 문의는 Mate 팀으로 연락주세요.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

