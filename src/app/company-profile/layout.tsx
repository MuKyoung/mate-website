import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MATE 회사 소개서',
  description: 'MATE 외주개발팀 회사 소개서 — Unity 게임·AR/VR·웹/앱 개발 및 개발 강의 전문팀',
  robots: { index: false, follow: false },
};

export default function CompanyProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f3f6', paddingBottom: 80 }}>
      {children}
    </div>
  );
}
