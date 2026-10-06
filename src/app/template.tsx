/**
 * 라우트 전환 연출.
 *
 * framer-motion 으로 처리하면 하이드레이션이 끝날 때까지 본문이 opacity 0 으로 덮여
 * 느린 회선에서 빈 화면이 먼저 보인다. CSS 애니메이션은 JS 없이도 돌기 때문에
 * 본문이 즉시 그려지고, 전역 prefers-reduced-motion 규칙에도 그대로 걸린다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
