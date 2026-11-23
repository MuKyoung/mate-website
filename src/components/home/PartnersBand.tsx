import LogoMarquee from '@/components/motion/LogoMarquee';
import { partners } from '@/data/partners';

/**
 * 어두운 첫 화면 바로 아래 흰 띠 - 함께하는 곳의 로고가 흐른다 (Figma 의 협력사 로고 띠).
 * 홈(큐브 아래)과 landingpage 하위 도메인의 랜딩페이지 디자인 · 디자인 템플릿(머리 아래)에 같이 쓴다.
 */
export default function PartnersBand() {
  return (
    <div data-header="light" className="relative h-16 border-b border-line bg-white lg:h-[76px]">
      <LogoMarquee items={partners} seconds={70} repeat={2}
        className="h-full [--logo:24px] lg:[--logo:32px]" />
    </div>
  );
}
