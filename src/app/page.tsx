import CubeStage from '@/components/home/CubeStage';
import SectionDots from '@/components/home/SectionDots';
import HeroSlider from '@/components/home/HeroSlider';
import KeyResults from '@/components/home/KeyResults';
import ProcessOrbit from '@/components/home/ProcessOrbit';
import ReferencePanels from '@/components/home/ReferencePanels';
import AwardsShowcase from '@/components/home/AwardsShowcase';
import Partners from '@/components/home/Partners';
import OngoingList from '@/components/home/OngoingList';
import { awards } from '@/data/teamCapabilities';

/* 첫 화면 아래로 흐르는 띠 - 수상 · 전시 이력을 최근 것부터 */
const tickerItems = [...awards]
  .sort((a, b) => b.year - a.year)
  .map((a) => `${a.year} ${a.title} · ${a.rank}`);

const dots = [
  { id: 'top', label: '첫 화면' },
  { id: 'hero', label: '영역 소개' },
  { id: 'results', label: '숫자' },
  { id: 'process', label: '진행 단계' },
  { id: 'references', label: '작업' },
  { id: 'awards', label: '수상 · 전시' },
  { id: 'partners', label: '함께한 곳' },
  { id: 'news', label: '지금 하는 일' },
];

/**
 * 홈 - Figma 「(주)세종호이스트크레인 웹사이트 리뉴얼」 랜딩(2026-10-17판)의 칸 순서를 따른다.
 * intro → hero → Key Results → Process → References → Certifications → Partners → News → footer
 * intro 자리에는 MATE 의 큐브 첫 화면을 둔다 (2026-10-22 사용자 요청으로 되살림).
 * (Figma 의 현장 사진 칸은 MATE 에 깔 사진이 없어 뺐다.)
 */
export default function Home() {
  return (
    <>
      <SectionDots items={dots} />
      <h1 className="sr-only">MATE는 웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱을 합니다</h1>
      <CubeStage />
      <HeroSlider ticker={tickerItems} />
      <KeyResults />
      <ProcessOrbit />
      <ReferencePanels />
      <AwardsShowcase />
      <Partners />
      <OngoingList />
    </>
  );
}
