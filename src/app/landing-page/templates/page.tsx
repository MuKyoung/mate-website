import { Metadata } from 'next';
import { templateHero } from '@/data/landingService';
import { LANDING_ORIGIN } from '@/lib/shell';
import TemplatesClient from './TemplatesClient';

const siteUrl = 'https://devteammate.co.kr';
/* 하위 도메인에서는 /templates/ 로 열린다(next.config.js) - 대표 주소도 그쪽으로 둔다 */
const pageUrl = `${LANDING_ORIGIN}/templates/`;
const title = '디자인 템플릿';
const ogTitle = '디자인 템플릿 | Mate 외주개발팀';
const description = templateHero.desc;

export const metadata: Metadata = {
  title,
  description,
  keywords: '디자인 템플릿, 프레젠테이션 디자인, 카드뉴스 제작, 상세페이지 디자인, 로고 디자인, 유튜브 썸네일, 인스타그램 피드, 명함 디자인, 포스터 디자인, 전단지 제작, 현수막 디자인',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: ogTitle, description,
    url: pageUrl,
    type: 'website',
    images: [{ url: `${siteUrl}/images/og/og-web.jpg`, width: 1200, height: 630, alt: ogTitle }],
  },
  twitter: { card: 'summary_large_image', title: ogTitle, description, images: [`${siteUrl}/images/og/og-web.jpg`] },
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
