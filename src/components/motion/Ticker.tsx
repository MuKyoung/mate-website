/**
 * 한 줄로 흘러가는 띠 - 첫 화면 아래 흰 띠 (Figma 는 협력사 로고 띠). 마우스를 올리면 멈춘다.
 *
 * 목록을 두 번 이어 붙이고 절반만큼 밀어, 끝에서 처음으로 끊김 없이 돌아온다.
 * 움직임 줄이기 설정이면 전역 규칙이 애니메이션을 끈다.
 */
export default function Ticker({
  items,
  seconds = 70,
  className = '',
}: {
  items: string[];
  /** 한 바퀴 도는 시간 */
  seconds?: number;
  className?: string;
}) {
  return (
    <div className={`group relative flex items-center overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {items.map((t, i) => (
              <li key={`${copy}-${i}`}
                className="flex items-center gap-4 whitespace-nowrap pr-12 text-[14px] font-bold text-gray-500 sm:text-[15px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-point-200" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        ))}
      </div>
      {/* 양 끝을 흰색으로 녹여 띠가 화면 밖에서 오고 가는 것처럼 보이게 한다 */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
    </div>
  );
}
