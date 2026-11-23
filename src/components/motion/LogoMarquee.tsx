import Image from 'next/image';
import type { Partner } from '@/data/partners';

/* 넓이(가로 × 세로)를 맞춘 높이 배율 - 가로세로 비율 3 인 로고가 1, 긴 글자 로고는 낮게, 네모난 로고는 높게(1.3 까지) */
const scaleOf = (p: Partner) => Math.min(1.3, Math.sqrt(3 / (p.w / p.h)));

/**
 * 로고가 한 줄로 흘러가는 띠 - Ticker 와 같은 방식(두 벌을 이어 붙여 절반만큼 민다). 마우스를 올리면 멈춘다.
 *
 * 로고 높이는 부모가 정한 --logo 에 배율을 곱한다(예: `[--logo:26px] lg:[--logo:34px]`).
 * 한 벌이 화면보다 짧으면 끝에 빈자리가 보이므로 한 벌 안에서 목록을 repeat 번 되풀이한다.
 * card 면 흰 칸 안에 로고와 이름을 함께 둔다. fade 는 양 끝을 녹일 바탕색(`from-white` 처럼 클래스 그대로).
 * 화면 읽기 프로그램에는 이름 목록을 한 번만 읽힌다.
 */
export default function LogoMarquee({
  items,
  seconds = 60,
  repeat = 1,
  reverse = false,
  card = false,
  fade = 'from-white',
  className = '',
}: {
  items: Partner[];
  /** 한 바퀴 도는 시간 */
  seconds?: number;
  repeat?: number;
  reverse?: boolean;
  card?: boolean;
  fade?: string;
  className?: string;
}) {
  const set = Array.from({ length: repeat }, () => items).flat();
  return (
    <div className={`group relative flex items-center overflow-hidden ${className}`}>
      <ul className="sr-only">
        {items.map((p) => <li key={p.name}>{p.name}</li>)}
      </ul>
      <div aria-hidden className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? 'reverse' : undefined }}>
        {[0, 1].map((copy) => (
          <ul key={copy} className={`flex shrink-0 items-center ${card ? 'gap-3 pr-3' : 'gap-14 pr-14 lg:gap-20 lg:pr-20'}`}>
            {set.map((p, i) => {
              const logo = (
                <Image src={p.logo} alt="" width={p.w} height={p.h} draggable={false}
                  className="max-w-none select-none"
                  style={{ height: `calc(var(--logo) * ${scaleOf(p).toFixed(3)})`, width: 'auto' }} />
              );
              return card ? (
                <li key={`${copy}-${i}`}
                  className="flex h-28 w-48 shrink-0 flex-col items-center justify-center gap-3 border border-line bg-white px-3">
                  <span className="flex h-[calc(var(--logo)*1.3)] items-center">{logo}</span>
                  <span className="whitespace-nowrap text-[12px] font-bold text-gray-500">{p.name}</span>
                </li>
              ) : (
                <li key={`${copy}-${i}`} className="flex shrink-0 items-center">{logo}</li>
              );
            })}
          </ul>
        ))}
      </div>
      {/* 양 끝을 바탕색으로 녹여 띠가 화면 밖에서 오고 가는 것처럼 보이게 한다 */}
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent sm:w-24 ${fade}`} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent sm:w-24 ${fade}`} />
    </div>
  );
}
