/** @type {import('next').NextConfig} */
// 정적 내보내기(output: 'export')는 쓰지 않는다 - 견적 문의 메일(src/app/api/contact)이 서버에서 돌아야 한다.
// 페이지는 모두 빌드 때 정적으로 만들어진다.

// 단일 랜딩페이지 제작(src/app/landing-page)은 하위 도메인에서 따로 연다. 호스트 값은 src/lib/shell.ts 의 LANDING_HOST 와 같다.
//   landingpage.devteammate.co.kr/        -> /landing-page/
//   landingpage.devteammate.co.kr/LP-001/ -> /landing-page/LP-001/
// 하위 도메인의 그 밖의 경로(상단 바 · 푸터의 본 사이트 메뉴 등)는 본 사이트로 보내고,
// 본 사이트의 /landing-page/ 로 들어오면 하위 도메인 주소로 보낸다. 미리보기 배포 · 로컬은 호스트가 달라 그대로 열린다
const LANDING_ORIGIN = 'https://landingpage.devteammate.co.kr'
const onLanding = [{ type: 'host', value: 'landingpage\\.devteammate\\.co\\.kr' }]
const onSite = [{ type: 'host', value: '(?:www\\.|landingpage\\.)?devteammate\\.co\\.kr' }]
// 하위 도메인에서 그대로 내보낼 것 - 상세(LP-000) · 빌드 파일 · Vercel 분석 · 그림 · 아이콘 · robots · 사이트맵 (첫 화면 / 은 .+ 에 걸리지 않는다)
const LANDING_KEEP = '_next/|_vercel/|landing-gallery/|images/|icon\\.png|apple-icon\\.png|favicon\\.ico|robots\\.txt|sitemap\\.xml|LP-\\d{3}/?$'

const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 사내 도구는 2026-11-16 에 /taskmanager 에서 /hub 로 이름을 바꿨다. 예전 주소(즐겨찾기 · 위젯 앱 · 비밀번호 재설정 메일)는
  // 물음표 뒤(?doc= · ?task=)를 그대로 실어 넘긴다. 다시 바꿀 수 있게 영구(308)가 아닌 307 로 둔다
  async redirects() {
    return [
      { source: '/taskmanager', destination: '/hub/', permanent: false },
      { source: '/taskmanager/:path*', destination: '/hub/:path*', permanent: false },
      { source: '/landing-page', has: onSite, destination: `${LANDING_ORIGIN}/`, permanent: false },
      { source: '/landing-page/:path+', has: onSite, destination: `${LANDING_ORIGIN}/:path+/`, permanent: false },
      { source: `/:path((?!${LANDING_KEEP}).+)`, has: onLanding, destination: 'https://devteammate.co.kr/:path', permanent: false },
    ]
  },
  // 사내 핀볼 게임(src/app/pinball)은 하위 도메인의 첫 화면으로 연다. 호스트 값은 src/lib/shell.ts 의 PINBALL_HOST 와 같다
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'pinball.devteammate.co.kr' }],
          destination: '/pinball/',
        },
        { source: '/', has: onLanding, destination: '/landing-page/' },
        { source: '/:id(LP-\\d{3})', has: onLanding, destination: '/landing-page/:id/' },
      ],
    }
  },
}

module.exports = nextConfig

