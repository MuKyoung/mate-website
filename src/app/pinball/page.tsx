import type { Metadata, Viewport } from 'next';
import PinballClient from './PinballClient';

const title = 'MATE 핀볼';
const description = '이름을 넣고 구슬을 떨어뜨려 당첨자를 뽑는 사내 내기 게임';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  // 사내 도구는 검색에 노출하지 않는다
  robots: { index: false, follow: false, nocache: true },
  // 메신저에 주소를 붙였을 때 회사 소개 미리보기가 아니라 게임 이름이 뜨게 한다
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://pinball.devteammate.co.kr',
    siteName: 'MATE',
    title,
    description,
  },
  twitter: { card: 'summary', title, description },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

/**
 * 사내 핀볼 게임. pinball.devteammate.co.kr 의 첫 화면이 이 경로로 다시 쓰여 열린다 (next.config.js).
 * 상단 바 · 푸터 · 플로팅 버튼 · 관성 스크롤은 src/lib/shell.ts 의 판정으로 빠진다.
 */
export default function PinballPage() {
  return <PinballClient />;
}
