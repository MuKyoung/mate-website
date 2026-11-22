/** 사내 핀볼 게임의 하위 도메인. next.config.js 의 rewrites 에도 같은 값이 있다 */
export const PINBALL_HOST = 'pinball.devteammate.co.kr';

/** 본 사이트 주소 */
export const MAIN_ORIGIN = 'https://devteammate.co.kr';

/** 단일 랜딩페이지 제작(src/app/landing-page)의 하위 도메인. next.config.js 의 redirects · rewrites 에도 같은 값이 있다 */
export const LANDING_HOST = 'landingpage.devteammate.co.kr';
export const LANDING_ORIGIN = `https://${LANDING_HOST}`;

/**
 * 랜딩페이지 제작 화면인지. 하위 도메인에서는 /landing-page/ 가 / 로, /landing-page/LP-001/ 이 /LP-001/ 로
 * 다시 쓰여 열려 브라우저의 usePathname 이 그 주소를 돌려준다. 그래서 호스트로도 본다.
 * 서버(빌드)에서는 /landing-page/ 로 그려지므로 양쪽 결과가 같아 하이드레이션이 어긋나지 않는다.
 */
export function isLandingScreen(pathname: string): boolean {
  if (pathname.startsWith('/landing-page')) return true;
  return typeof window !== 'undefined' && window.location.hostname === LANDING_HOST;
}

/**
 * 랜딩페이지 제작 화면의 상단 바 · 푸터 링크는 본 사이트 주소로 보낸다.
 * 절대 주소에는 Next 가 끝 빗금을 붙이지 않으므로(trailingSlash) 여기서 붙여 한 번 더 넘어가지 않게 한다
 */
export function siteHref(pathname: string, href: string): string {
  if (!isLandingScreen(pathname) || !href.startsWith('/')) return href;
  const [, path, rest] = href.match(/^([^?#]*)(.*)$/) ?? ['', href, ''];
  return `${MAIN_ORIGIN}${path.endsWith('/') ? path : `${path}/`}${rest}`;
}

/**
 * 마케팅 사이트의 상단 바 · 푸터 · 플로팅 버튼 · 관성 스크롤을 쓰지 않는 사내 도구 화면인지.
 *
 * 핀볼 하위 도메인의 첫 화면은 /pinball/ 로 다시 쓰여 열리는데, 브라우저의 usePathname 은
 * 주소창 그대로 '/' 를 돌려준다. 그래서 그 경우는 호스트로 가린다. 서버(빌드)에서는
 * /pinball/ 로 그려지므로 양쪽 모두 가린 상태라 하이드레이션 결과가 어긋나지 않는다.
 */
export function isToolScreen(pathname: string): boolean {
  if (pathname.startsWith('/hub') || pathname.startsWith('/taskmanager') || pathname.startsWith('/pinball')) return true;
  return pathname === '/' && typeof window !== 'undefined' && window.location.hostname === PINBALL_HOST;
}
