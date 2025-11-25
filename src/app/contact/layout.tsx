import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연락처 - Mate 외주개발팀',
  description: '유니티 게임 개발, 외주 개발 문의는 Mate 팀으로 연락주세요.',
  keywords: '외주개발 문의, 유니티 개발 문의, 게임 개발 상담',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

