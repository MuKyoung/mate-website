import Ticker from '@/components/motion/Ticker';
import { awards } from '@/data/teamCapabilities';

/* 흐르는 띠 - 수상 · 전시 이력을 최근 것부터 */
const items = [...awards]
  .sort((a, b) => b.year - a.year)
  .map((a) => `${a.year} ${a.title} · ${a.rank}`);

/**
 * 첫 화면 큐브 바로 아래 흰 띠 - 수상 · 전시 이력이 흐른다.
 */
export default function AwardsBand() {
  return (
    <div data-header="light" className="relative h-16 border-b border-line bg-white lg:h-[76px]">
      <Ticker items={items} className="h-full" />
    </div>
  );
}
