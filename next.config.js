/** @type {import('next').NextConfig} */
// 정적 내보내기(output: 'export')는 쓰지 않는다 - 견적 문의 메일(src/app/api/contact)이 서버에서 돌아야 한다.
// 페이지는 모두 빌드 때 정적으로 만들어진다.
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
      ],
    }
  },
}

module.exports = nextConfig

