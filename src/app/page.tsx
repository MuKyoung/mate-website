import BrandOpening from '@/components/BrandOpening';
import Story from '@/components/home/Story';
import Areas from '@/components/home/Areas';
import Works from '@/components/home/Works';
import OwnGames from '@/components/home/OwnGames';
import Practices from '@/components/home/Practices';
import Recognition from '@/components/home/Recognition';
import Closing from '@/components/home/Closing';

/**
 * 홈.
 *
 * 면은 세 가지를 쓴다.
 *   파란 면 - 말하는 곳 (오프닝, 자체 게임, 문의)
 *   종이 면 - 읽는 곳 (소개, 하는 일, 일하는 방식, 평가)
 *   검은 면 - 보는 곳 (작업 창, 만든 것)
 *
 * 섹션은 경계에서 딱 끊지 않고 서로 걸친다. 작업 창이 소개 위로, 첫 그림이
 * '하는 일' 위로, 자체 게임 판이 '만든 것' 위로 넘어간다.
 */
export default function Home() {
  return (
    <>
      <BrandOpening />
      <Story />
      <Areas />
      <Works />
      <OwnGames />
      <Practices />
      <Recognition />
      <Closing />
    </>
  );
}
