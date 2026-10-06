import { Metadata } from 'next';
import EducationClient from './EducationClient';

const siteUrl = 'https://devteammate.co.kr';
const title = '개발 교육 · 강의';
/* 공유 카드에는 브랜드를 붙인다 — 루트 template 은 문서 제목에만 적용되므로 */
const ogTitle = '개발 교육 · 강의 | Mate 외주개발팀';
const description =
  'Unity 게임 개발, 웹 · 앱 개발, AI 활용 개발 커리큘럼. 고등학교 · 대학교 · 기관 대상으로 실무 기반 과정을 기관 목표에 맞춰 재구성해 진행합니다.';

export const metadata: Metadata = {
  title,
  description,
  keywords:
    '개발 강의, 유니티 강의, Unity 교육, 코딩 교육, 웹 개발 강의, 앱 개발 강의, AI 강의, 특성화고 강의, 대학 특강, 캡스톤 지도, 사내 개발 교육',
  alternates: { canonical: `${siteUrl}/education` },
  openGraph: {
    title: ogTitle, description,
    url: `${siteUrl}/education`,
    type: 'website',
    images: [{ url: `${siteUrl}/images/og/og-education.jpg`, width: 1200, height: 630, alt: ogTitle }],
  },
  twitter: { card: 'summary_large_image', title: ogTitle, description, images: [`${siteUrl}/images/og/og-education.jpg`] },
};

export default function EducationPage() {
  return <EducationClient />;
}
