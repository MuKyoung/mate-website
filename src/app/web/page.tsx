import { Metadata } from 'next';
import WebClient from './WebClient';

const siteUrl = 'https://devteammate.co.kr';
const title = '웹 · 앱 개발 외주';
/* 공유 카드에는 브랜드를 붙인다 - 루트 template 은 문서 제목에만 적용되므로 */
const ogTitle = '웹 · 앱 개발 외주 | Mate 외주개발팀';
const description =
  '요구사항 정의부터 화면 설계, 구현, 배포, 운영까지 한 팀이 끝까지 맡습니다. Next.js · Flutter · Python · AWS 기반 웹/앱 외주 개발.';

export const metadata: Metadata = {
  title,
  description,
  keywords:
    '웹 외주 개발, 앱 외주 개발, 홈페이지 제작, Next.js 외주, React 외주, Flutter 앱 개발, 반응형 웹, 관리자 페이지 개발, API 개발, AWS 배포',
  alternates: { canonical: `${siteUrl}/web` },
  openGraph: {
    title: ogTitle, description,
    url: `${siteUrl}/web`,
    type: 'website',
    images: [{ url: `${siteUrl}/images/og/og-web.jpg`, width: 1200, height: 630, alt: ogTitle }],
  },
  twitter: { card: 'summary_large_image', title: ogTitle, description, images: [`${siteUrl}/images/og/og-web.jpg`] },
};

export default function WebPage() {
  return <WebClient />;
}
