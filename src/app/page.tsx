import CubeStage from '@/components/home/CubeStage';
import AwardsBand from '@/components/home/AwardsBand';
import DomainTabs from '@/components/home/DomainTabs';
import KeyNumbers from '@/components/home/KeyNumbers';
import FeaturedWork from '@/components/home/FeaturedWork';
import WhyStairs from '@/components/home/WhyStairs';
import NowList from '@/components/home/NowList';

/**
 * 홈.
 *
 * 모양(글꼴 · 제목 · 버튼 · 카드 · 칩)은 세종호이스트크레인 Figma 를 따르고, 칸의 짜임은 그 사이트와 다르게 둔다
 * (2026-10-22 "스타일은 세종처럼, 섹션 레이아웃은 바꿔서").
 * 큐브 첫 화면 → 수상 띠 → 하는 일 탭 → 숫자(큰 칸 하나 + 작은 칸 둘, 함께한 곳) → 고른 작업
 * → 일하는 방식 계단 → 지금 하는 일. 공정 원은 /services, 증서 카드는 /team 에 있다.
 */
export default function Home() {
  return (
    <>
      <h1 className="sr-only">MATE는 웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱을 합니다</h1>
      <CubeStage />
      <AwardsBand />
      <DomainTabs />
      <KeyNumbers />
      <FeaturedWork />
      <WhyStairs />
      <NowList />
    </>
  );
}
