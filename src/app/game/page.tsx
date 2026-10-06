import { Metadata } from 'next';
import GameClient from './GameClient';

const siteUrl = 'https://devteammate.co.kr';
const title = '게임 · XR 개발 외주';
/* 공유 카드에는 브랜드를 붙인다 — 루트 template 은 문서 제목에만 적용되므로 */
const ogTitle = '게임 · XR 개발 외주 | Mate 외주개발팀';
const description =
  'Unity 기반 2D · 3D 게임과 VR · AR 콘텐츠를 만듭니다. G-STAR 전시, 한국콘텐츠진흥원 지원사업을 거친 팀이 기획부터 출시까지 맡습니다.';

export const metadata: Metadata = {
  title,
  description,
  keywords:
    '유니티 외주, Unity 외주개발, 게임 외주 개발, 2D 게임 개발, 3D 게임 개발, VR 개발, AR 개발, 메타퀘스트, 시뮬레이션 개발, 게임 프로토타입, 모바일 게임 외주',
  alternates: { canonical: `${siteUrl}/game` },
  openGraph: {
    title: ogTitle, description,
    url: `${siteUrl}/game`,
    type: 'website',
    images: [{ url: `${siteUrl}/images/og/og-game.jpg`, width: 1200, height: 630, alt: ogTitle }],
  },
  twitter: { card: 'summary_large_image', title: ogTitle, description, images: [`${siteUrl}/images/og/og-game.jpg`] },
};

export default function GamePage() {
  return <GameClient />;
}
