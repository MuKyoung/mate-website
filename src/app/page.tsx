import CubeStage from '@/components/home/CubeStage';
import DomainTabs from '@/components/home/DomainTabs';
import NumbersStatement from '@/components/home/NumbersStatement';
import FeaturedWork from '@/components/home/FeaturedWork';
import WhyStairs from '@/components/home/WhyStairs';
import NowList from '@/components/home/NowList';

/**
 * 홈.
 *
 * 2026-10-22 세종호이스트크레인 Figma 랜딩을 칸 순서까지 따랐다가 "너무 똑같다"는 말을 듣고 섞었다.
 * 세종 요소는 다른 쓰임으로만 남긴다 - 기술인증 탭 → 하는 일, 회사소개 큰 문장 → 숫자,
 * 뉴스 목록 → 고른 작업, 기술 계단 → 일하는 방식, 문의 현황 목록 → 지금 하는 일.
 * 사진 슬라이드 · 숫자 카드 · 공정 원 · 세로 판 · 로고 격자 · 왼쪽 점은 홈에서 뺐다
 * (공정 원은 /services, 증서 카드는 /team 으로 옮겼다).
 */
export default function Home() {
  return (
    <>
      <h1 className="sr-only">MATE는 웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱을 합니다</h1>
      <CubeStage />
      <DomainTabs />
      <NumbersStatement />
      <FeaturedWork />
      <WhyStairs />
      <NowList />
    </>
  );
}
