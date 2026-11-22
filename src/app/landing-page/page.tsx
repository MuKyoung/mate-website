import { Metadata } from 'next';
import { LANDING_ORIGIN } from '@/lib/shell';
import LandingClient from './LandingClient';

const siteUrl = 'https://devteammate.co.kr';
/* 이 화면은 하위 도메인의 첫 화면이다(next.config.js) - 대표 주소도 그쪽으로 둔다 */
const pageUrl = `${LANDING_ORIGIN}/`;
const title = '단일 랜딩페이지 제작';
/* 공유 카드에는 브랜드를 붙인다 - 루트 template 은 문서 제목에만 적용되므로 */
const ogTitle = '단일 랜딩페이지 제작 | Mate 외주개발팀';
const description =
  '마음에 드는 스타일을 고르면 매장과 사람, 제품에 맞춰 다시 디자인합니다. 디자인 시안, 촬영, 반응형 웹 구현, 기능 고도화를 필요한 만큼 맡길 수 있습니다.';

export const metadata: Metadata = {
  title,
  description,
  keywords: '랜딩페이지 제작, 원페이지 홈페이지, 랜딩페이지 디자인, 매장 홈페이지 제작, 반응형 웹 제작, 제품 촬영, 랜딩페이지 템플릿 디자인',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: ogTitle, description,
    url: pageUrl,
    type: 'website',
    images: [{ url: `${siteUrl}/images/og/og-web.jpg`, width: 1200, height: 630, alt: ogTitle }],
  },
  twitter: { card: 'summary_large_image', title: ogTitle, description, images: [`${siteUrl}/images/og/og-web.jpg`] },
};

export default function LandingPage() {
  return <LandingClient />;
}
