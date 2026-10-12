import FullPage, { type ScreenInfo } from '@/components/home/FullPage';
import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import Business from '@/components/home/Business';
import Publishing from '@/components/home/Publishing';
import Works from '@/components/home/Works';
import Process from '@/components/home/Process';
import Recognition from '@/components/home/Recognition';
import Contact from '@/components/home/Contact';

/**
 * 홈 - 풀페이지.
 *
 * 화면 한 장이 창 하나를 채우고, 스크롤하면 한 장씩 넘어간다.
 * 사진은 한 장에 한 번만 쓴다. 저희가 만든 것은 '최근 작업' 에만 걸고,
 * 나머지 화면의 분위기는 스톡 사진으로 잡는다 (src/data/stock.ts).
 *
 * 아래 목록의 id 는 각 화면 컴포넌트의 Screen id 와 같아야 한다.
 */
const screens: ScreenInfo[] = [
  { id: 'top', label: '처음' },
  { id: 'about', label: '소개' },
  { id: 'business', label: '하는 일' },
  { id: 'publishing', label: '자체 게임' },
  { id: 'work', label: '최근 작업' },
  { id: 'process', label: '일하는 방식' },
  { id: 'recognition', label: '평가' },
  { id: 'contact', label: '문의' },
];

/** 첫 페인트 전에 풀페이지 표시를 단다. 그래야 상단 바가 처음부터 사진 위의 색으로 그려진다. */
const beforePaint =
  "var r=document.documentElement;r.setAttribute('data-fullpage','');r.setAttribute('data-flush','');r.setAttribute('data-head','photo');r.setAttribute('data-mid','photo');r.setAttribute('data-foot','photo')";

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: beforePaint }} />
      <Hero />
      <About />
      <Business />
      <Publishing />
      <Works />
      <Process />
      <Recognition />
      <Contact />
      <FullPage screens={screens} />
    </>
  );
}
