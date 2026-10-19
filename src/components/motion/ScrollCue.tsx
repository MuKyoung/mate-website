import { FiArrowDown } from 'react-icons/fi';

/**
 * 아래로 스크롤을 유도하는 표시.
 *
 * 등폭 'SCROLL' 라벨, 빛이 위에서 아래로 흘러내리는 가는 선, 화살표 칸.
 * 누르면 target 으로 내려간다. 해시 링크라 데스크톱은 SmoothScroll(Lenis)이 부드럽게 옮기고,
 * 터치 기기는 html 의 scroll-behavior: smooth 가 옮긴다.
 */
export default function ScrollCue({ target, className = '' }: { target: string; className?: string }) {
  return (
    <a href={`#${target}`} aria-label="아래로 내려가기"
      className={`group flex flex-col items-center gap-2.5 ${className}`}>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors group-hover:text-white">
        Scroll
      </span>
      <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-white/15 [@media(min-width:1024px)_and_(max-height:860px)]:h-6">
        <span className="scroll-cue-light absolute inset-x-0 top-0 block h-1/2" />
      </span>
      <span aria-hidden
        className="flex h-8 w-8 items-center justify-center border border-white/25 text-white/75 transition-colors duration-300
                   group-hover:border-primary-200 group-hover:bg-primary-200 group-hover:text-white">
        <FiArrowDown size={14} className="scroll-cue-arrow" />
      </span>
    </a>
  );
}
