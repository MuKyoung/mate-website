/**
 * 한 줄로 흘러가는 등폭 띠. 마우스를 올리면 멈춘다.
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
    <div className={`group relative overflow-hidden border-y border-white/10 ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {items.map((t, i) => (
              <li key={`${copy}-${i}`}
                className="flex items-center gap-5 whitespace-nowrap py-4 pr-10 font-mono text-[12px] uppercase tracking-[0.02em] text-white/60">
                <span className="h-[5px] w-[5px] shrink-0 bg-[var(--blue-glow)]" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        ))}
      </div>
      {/* 양 끝을 검정으로 녹여 띠가 화면 밖에서 오고 가는 것처럼 보이게 한다 */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent sm:w-32" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent sm:w-32" />
    </div>
  );
}
