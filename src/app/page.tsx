import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import Services from '@/components/home/Services';
import Works from '@/components/home/Works';
import Practices from '@/components/home/Practices';
import Recognition from '@/components/home/Recognition';
import Contact from '@/components/home/Contact';

/**
 * 홈.
 *
 * 섹션마다 같은 틀을 쓴다. 보는 곳(제목과 요약)과 다루는 곳(카드와 목록)을 나누고,
 * 좁은 화면에서는 위아래로, 넓은 화면에서는 좌우 두 단으로 놓는다.
 * 가장 중요한 동작(문의)은 첫 화면과 페이지의 맨 아래에 있다.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Works />
      <Practices />
      <Recognition />
      <Contact />
    </>
  );
}
