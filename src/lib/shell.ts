/** 사내 핀볼 게임의 하위 도메인. next.config.js 의 rewrites 에도 같은 값이 있다 */
export const PINBALL_HOST = 'pinball.devteammate.co.kr';

/**
 * 마케팅 사이트의 상단 바 · 푸터 · 플로팅 버튼 · 관성 스크롤을 쓰지 않는 사내 도구 화면인지.
 *
 * 핀볼 하위 도메인의 첫 화면은 /pinball/ 로 다시 쓰여 열리는데, 브라우저의 usePathname 은
 * 주소창 그대로 '/' 를 돌려준다. 그래서 그 경우는 호스트로 가린다. 서버(빌드)에서는
 * /pinball/ 로 그려지므로 양쪽 모두 가린 상태라 하이드레이션 결과가 어긋나지 않는다.
 */
export function isToolScreen(pathname: string): boolean {
  if (pathname.startsWith('/taskmanager') || pathname.startsWith('/pinball')) return true;
  return pathname === '/' && typeof window !== 'undefined' && window.location.hostname === PINBALL_HOST;
}
