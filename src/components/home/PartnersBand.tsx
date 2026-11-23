import LogoMarquee from '@/components/motion/LogoMarquee';
import { partners } from '@/data/partners';

/**
 * 첫 화면 큐브 바로 아래 흰 띠 - 함께하는 곳의 로고가 흐른다 (Figma 의 협력사 로고 띠).
 */
export default function PartnersBand() {
  return (
    <div data-header="light" className="relative h-16 border-b border-line bg-white lg:h-[76px]">
      <LogoMarquee items={partners} seconds={70} repeat={2}
        className="h-full [--logo:24px] lg:[--logo:32px]" />
    </div>
  );
}
